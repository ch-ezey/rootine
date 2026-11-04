package com.example.rootine_api;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * End-to-end API tests against a real PostgreSQL (embedded binaries, no Docker),
 * with the schema created by the Flyway migrations.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {

    private static final EmbeddedPostgres POSTGRES = startPostgres();

    private static EmbeddedPostgres startPostgres() {
        try {
            EmbeddedPostgres pg = EmbeddedPostgres.builder().start();
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                try {
                    pg.close();
                } catch (IOException ignored) {
                }
            }));
            return pg;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
        registry.add("app.jwt.secret", () -> "dGVzdC1zZWNyZXQtdGhhdC1pcy1kZWZpbml0ZWx5LWxvbmctZW5vdWdoLWZvci1oczI1Ng==");
        registry.add("openai.api.key", () -> "test-key");
    }

    @Autowired
    private MockMvc mockMvc;

    private String alice;
    private String bob;

    @BeforeEach
    void registerUsers() throws Exception {
        alice = register("Alice");
        bob = register("Bob");
    }

    // ─── Auth ─────────────────────────────────────────────────────────────────────

    @Test
    void register_thenLogin_returnsTokenAndUserWithoutPassword() throws Exception {
        String email = uniqueEmail();
        send(post("/auth/register"), null,
                "{\"name\":\"Carol\",\"email\":\"" + email + "\",\"password\":\"password123\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.name").value("Carol"))
                .andExpect(jsonPath("$.user", not(hasKey("password"))));

        send(post("/auth/login"), null,
                "{\"email\":\"" + email + "\",\"password\":\"password123\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value(email));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        send(post("/auth/login"), null, "{\"email\":\"nobody@example.com\",\"password\":\"wrong-password\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void register_withDuplicateEmail_returns409() throws Exception {
        String body = "{\"name\":\"Dup\",\"email\":\"" + uniqueEmail() + "\",\"password\":\"password123\"}";
        send(post("/auth/register"), null, body).andExpect(status().isOk());
        send(post("/auth/register"), null, body).andExpect(status().isConflict());
    }

    @Test
    void register_withInvalidInput_returns400() throws Exception {
        send(post("/auth/register"), null, "{\"name\":\"\",\"email\":\"not-an-email\",\"password\":\"short\"}")
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpoints_withoutOrWithBadToken_return401() throws Exception {
        mockMvc.perform(get("/routine")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/routine").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_returnsCurrentUserWithoutPassword() throws Exception {
        send(get("/auth/me"), alice, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$", not(hasKey("password"))));

        send(put("/user/me"), alice, "{\"name\":\"Alice B\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice B"));
    }

    // ─── Ownership ────────────────────────────────────────────────────────────────

    @Test
    void otherUsersRoutinesAndTasks_areInvisible() throws Exception {
        int routineId = createRoutine(alice, "Morning", "[{\"title\":\"Stretch\"}]");
        int taskId = JsonPath.read(
                send(get("/routine/" + routineId), alice, null).andReturn().getResponse().getContentAsString(),
                "$.tasks[0].taskId");

        send(get("/routine"), bob, null).andExpect(jsonPath("$", hasSize(0)));
        send(get("/routine/" + routineId), bob, null).andExpect(status().isNotFound());
        send(put("/routine/" + routineId), bob, "{\"name\":\"Hijacked\"}").andExpect(status().isNotFound());
        send(post("/routine/" + routineId + "/activate"), bob, null).andExpect(status().isNotFound());
        send(delete("/routine/" + routineId), bob, null).andExpect(status().isNotFound());

        send(get("/task/routine/" + routineId), bob, null).andExpect(status().isNotFound());
        send(post("/task?routineId=" + routineId), bob, "{\"title\":\"Injected\"}").andExpect(status().isNotFound());
        send(get("/task/" + taskId), bob, null).andExpect(status().isNotFound());
        send(put("/task/" + taskId), bob, "{\"isCompleted\":true}").andExpect(status().isNotFound());
        send(delete("/task/" + taskId), bob, null).andExpect(status().isNotFound());

        // Alice's data is untouched
        send(get("/routine/" + routineId), alice, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Morning"))
                .andExpect(jsonPath("$.tasks", hasSize(1)))
                .andExpect(jsonPath("$.tasks[0].isCompleted").value(false));
    }

    // ─── Routines & tasks ─────────────────────────────────────────────────────────

    @Test
    void routineList_omitsTasks_andDetailReturnsThemInOrder() throws Exception {
        int routineId = createRoutine(alice, "Evening",
                "[{\"title\":\"Dishes\"},{\"title\":\"Read\"},{\"title\":\"Sleep\"}]");

        send(get("/routine"), alice, null)
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0]", not(hasKey("tasks"))));

        String detail = send(get("/routine/" + routineId), alice, null).andReturn().getResponse().getContentAsString();
        int dishes = JsonPath.read(detail, "$.tasks[0].taskId");
        int read = JsonPath.read(detail, "$.tasks[1].taskId");
        int sleep = JsonPath.read(detail, "$.tasks[2].taskId");

        send(put("/task/routine/" + routineId + "/reorder"), alice,
                "{\"orderedTaskIds\":[" + sleep + "," + dishes + "," + read + "]}")
                .andExpect(status().isNoContent());

        send(get("/routine/" + routineId), alice, null)
                .andExpect(jsonPath("$.tasks[*].title", contains("Sleep", "Dishes", "Read")));
        send(get("/task/routine/" + routineId), alice, null)
                .andExpect(jsonPath("$[*].title", contains("Sleep", "Dishes", "Read")));
    }

    @Test
    void newTask_goesAfterTheLastPosition_evenAfterDeletes() throws Exception {
        int routineId = createRoutine(alice, "Gym", "[{\"title\":\"A\"},{\"title\":\"B\"}]");
        int first = JsonPath.read(
                send(get("/routine/" + routineId), alice, null).andReturn().getResponse().getContentAsString(),
                "$.tasks[0].taskId");
        send(delete("/task/" + first), alice, null).andExpect(status().isNoContent());

        send(post("/task?routineId=" + routineId), alice, "{\"title\":\"C\",\"duration\":10}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value(2))
                .andExpect(jsonPath("$.routineId").value(routineId));

        send(get("/routine/" + routineId), alice, null)
                .andExpect(jsonPath("$.tasks[*].title", contains("B", "C")));
    }

    @Test
    void activate_leavesExactlyOneActiveRoutine() throws Exception {
        int first = createRoutine(alice, "First", null);
        int second = createRoutine(alice, "Second", null);

        send(post("/routine/" + first + "/activate"), alice, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
        send(post("/routine/" + second + "/activate"), alice, null).andExpect(status().isOk());
        // Re-activating the active routine is a no-op
        send(post("/routine/" + second + "/activate"), alice, null).andExpect(status().isOk());

        send(get("/routine"), alice, null)
                .andExpect(jsonPath("$[?(@.isActive == true)].routineId", contains(second)));
    }

    @Test
    void reset_unticksEveryTask_andIsOwnerOnly() throws Exception {
        int routineId = createRoutine(alice, "Daily", "[{\"title\":\"A\"},{\"title\":\"B\"}]");
        String detail = send(get("/routine/" + routineId), alice, null).andReturn().getResponse().getContentAsString();
        for (int i = 0; i < 2; i++) {
            int taskId = JsonPath.read(detail, "$.tasks[" + i + "].taskId");
            send(put("/task/" + taskId), alice, "{\"isCompleted\":true}").andExpect(status().isOk());
        }

        send(post("/routine/" + routineId + "/reset"), bob, null).andExpect(status().isNotFound());
        send(post("/routine/" + routineId + "/reset"), alice, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasks[*].isCompleted", contains(false, false)));
    }

    @Test
    void taskUpdate_clearFlags_removeTimeAndDuration() throws Exception {
        int routineId = createRoutine(alice, "Timed", "[{\"title\":\"Run\",\"startTime\":\"07:00\",\"duration\":30}]");
        int taskId = JsonPath.read(
                send(get("/routine/" + routineId), alice, null).andReturn().getResponse().getContentAsString(),
                "$.tasks[0].taskId");

        // Omitted fields stay as they are
        send(put("/task/" + taskId), alice, "{\"title\":\"Long run\"}")
                .andExpect(jsonPath("$.startTime").value("07:00:00"))
                .andExpect(jsonPath("$.duration").value(30));

        send(put("/task/" + taskId), alice, "{\"clearStartTime\":true,\"clearDuration\":true}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Long run"))
                .andExpect(jsonPath("$.startTime").doesNotExist())
                .andExpect(jsonPath("$.duration").doesNotExist());
    }

    @Test
    void invalidTaskInput_returns400() throws Exception {
        int routineId = createRoutine(alice, "Study", null);
        send(post("/task?routineId=" + routineId), alice, "{\"title\":\"\",\"duration\":-5}")
                .andExpect(status().isBadRequest());
        send(post("/task?routineId=" + routineId), alice, "{\"title\":\"X\",\"priority\":\"urgent\"}")
                .andExpect(status().isBadRequest());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────────

    private String register(String name) throws Exception {
        String response = send(post("/auth/register"), null,
                "{\"name\":\"" + name + "\",\"email\":\"" + uniqueEmail() + "\",\"password\":\"password123\"}")
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }

    private int createRoutine(String token, String name, String tasksJson) throws Exception {
        String body = "{\"name\":\"" + name + "\"" + (tasksJson == null ? "" : ",\"tasks\":" + tasksJson) + "}";
        String response = send(post("/routine"), token, body)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.routineId");
    }

    private ResultActions send(MockHttpServletRequestBuilder request, String token, String json) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        if (json != null) request.contentType(MediaType.APPLICATION_JSON).content(json);
        return mockMvc.perform(request);
    }

    private static String uniqueEmail() {
        return UUID.randomUUID() + "@example.com";
    }
}
