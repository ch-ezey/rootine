package com.example.rootine_api.controller;

import com.example.rootine_api.model.User;
import com.example.rootine_api.service.JwtService;
import com.example.rootine_api.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @Test
    void login_shouldReturnJwtToken() throws Exception {
        String email = "test@example.com";
        String password = "password";
        String fakeToken = "jwt-token";

        // Mock Authentication
        Authentication authentication = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(Mockito.any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);

        // Mock JWT token generation
        Mockito.when(jwtService.generateToken(authentication))
                .thenReturn(fakeToken);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(fakeToken));

    }

    @Test
    void login_shouldReturnUnauthorized_whenBadCredentials() throws Exception {
        String email = "bad@example.com";
        String password = "wrongpassword";

        // Mock AuthenticationManager to throw AuthenticationException
        Mockito.when(authenticationManager.authenticate(Mockito.any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new AuthenticationException("Bad credentials") {});

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password."));
    }


    @Test
    void register_shouldReturnToken_whenSuccessful() throws Exception {
        String email = "new@example.com";
        String password = "password";
        String fakeToken = "jwt-token";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(password);

        Mockito.when(userService.registerUser(Mockito.any(User.class))).thenReturn(user);
        Mockito.when(jwtService.generateToken(user)).thenReturn(fakeToken);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(fakeToken));
    }

    @Test
    void register_shouldReturnUserAlreadyExists_whenUserExists() throws Exception {
        String email = "new@example.com";
        String password = "password";

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(password);

        Mockito.when(userService.registerUser(Mockito.any(User.class)))
                .thenThrow(new RuntimeException("User Already Exists"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Registration failed: User Already Exists"));
    }

//    @Test
//    void register_shouldReturnBadRequest_whenMissingFields() throws Exception {
//        // Missing password
//        mockMvc.perform(post("/auth/register")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("{\"email\":\"user@example.com\"}"))
//                .andExpect(status().isBadRequest());
//
//        // Missing email
//        mockMvc.perform(post("/auth/register")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content("{\"password\":\"password123\"}"))
//                .andExpect(status().isBadRequest());
//    }
//
}