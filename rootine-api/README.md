# Rootine API

The `rootine-api` project is the backend service for Rootine’s current MVP: a routine management system with full CRUD support and AI-assisted routine generation from natural language prompts.

This backend is focused on doing a smaller set of things well:

- authenticate users
- persist user-owned routines
- persist ordered tasks within routines
- support full CRUD for routines and tasks
- provide AI-backed prompt flows for routine creation and updates

The larger context-aware planning vision still exists, but this service is currently being shaped around a simpler and more achievable first product.

---

## MVP Purpose

The purpose of this API is to support the following user promise:

> Users can create, manage, and update structured routines manually or by describing what they want in plain language.

That means this backend should prioritize:

- reliability of CRUD operations
- clean user ownership boundaries
- predictable routine/task data structures
- AI output that can be converted into editable structured data
- backend behavior that is easy to reason about and debug

---

## Current Product Scope

For this phase of Rootine, the backend is built around **routine management first**.

### In scope

- user registration and login
- routine CRUD
- task CRUD within routines
- ordered tasks inside a routine
- routine activation state
- AI prompt-based routine generation
- AI prompt-based routine updates

### Out of scope for now

- calendar-aware scheduling
- event-driven replanning
- commute-aware logic
- dynamic daily orchestration
- autonomous planning without user review
- advanced preference learning
- broader context ingestion beyond the current routine/task model

---

## Current Technology Stack

This backend currently uses:

- Java 17
- Spring Boot 3.4.x
- Spring Web
- Spring Security
- Spring Data JPA
- Spring Validation
- Spring WebSocket
- MySQL
- JWT via `jjwt`
- OpenAI Java client via `com.openai:openai-java`
- Maven

This stack is appropriate for building a structured API with authentication, persistence, and AI-assisted workflow support.

---

## Current Domain Model

Based on the current backend structure, the API is centered around three primary persisted entities:

- `User`
- `Routine`
- `Task`

### `User`

Represents the account owner.

Current model fields include:

- `user_id`
- `uuid`
- `name`
- `email`
- `password`
- `created_at`
- `last_login`

### `Routine`

Represents a user-owned routine.

Current model fields include:

- `routine_id`
- `user`
- `name`
- `description`
- `detailLevel`
- `isActive`
- `createdAt`
- `tasks`

A routine belongs to a user and owns a collection of tasks.

### `Task`

Represents a step inside a routine.

Current model fields include:

- `task_id`
- `routine`
- `title`
- `description`
- `taskType`
- `startTime`
- `duration`
- `priority`
- `isCompleted`
- `position`
- `createdAt`

Tasks are ordered within a routine using the `position` field.

---

## Database Schema

The current schema in `schema.sql` is centered around:

- `user`
- `routine`
- `task`

### `user`
Stores account and identity information.

### `routine`
Stores routine metadata and links each routine to a user.

Important fields include:

- `user_id`
- `name`
- `description`
- `detail_level`
- `is_active`

### `task`
Stores routine steps and ordering information.

Important fields include:

- `routine_id`
- `title`
- `description`
- `type`
- `start_time`
- `duration`
- `priority`
- `is_completed`
- `position`

This schema is a good fit for a structured routine CRUD MVP.

---

## Current API Structure

Based on the current controller structure, the backend already supports a strong portion of the required MVP.

### Authentication endpoints

Under `/auth`, the API currently supports:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`

These endpoints cover the basic authentication flow needed for a user-owned application.

### Routine endpoints

Under `/routine`, the API currently supports:

- `GET /routine/routines`
- `GET /routine/{id}`
- `GET /routine/user/{userId}`
- `POST /routine`
- `POST /routine/{id}/activate`
- `PUT /routine/{id}`
- `DELETE /routine/{id}`

These endpoints support core routine CRUD plus routine activation.

### Task endpoints

Under `/task`, the API currently supports:

- `GET /task/{id}`
- `GET /task/routine/{routineId}`
- `POST /task`
- `PUT /task/routine/{routineId}/reorder`
- `PUT /task/{id}`
- `DELETE /task/{id}`

These endpoints support task CRUD and task ordering inside a routine.

### AI endpoint

Under `/openai`, the API currently includes:

- `POST /openai/response`

This endpoint appears to support prompt-driven AI generation and can serve as the basis for routine generation/update workflows.

### User endpoints

Under `/user`, the API currently includes endpoints for reading user information.

This is useful for internal support and user lookup, though the MVP should remain primarily centered around authenticated user-owned routine management.

---

## MVP Backend Responsibilities

For the current version of Rootine, this API should do the following well:

### 1. Authentication and ownership
Ensure users can securely create accounts, log in, and interact only with their own data where applicable.

### 2. Routine CRUD
Allow users to create, read, update, delete, and activate routines.

### 3. Task CRUD
Allow users to add, edit, remove, and reorder tasks within routines.

### 4. Structured persistence
Store routines and tasks in a way that remains editable and reliable after AI generation.

### 5. AI-assisted routine workflows
Accept prompts and return structured output that can become a routine draft or an update proposal.

---

## AI Workflow Direction

The AI feature should remain constrained and practical.

### Prompt-based routine creation

Example user prompt:

- "Create a weekday morning routine before work with stretching, breakfast, shower, and 10 minutes of planning."

Expected backend responsibility:

- accept the prompt
- generate a structured response
- return routine-like data the frontend can review
- let the user decide whether to save it

### Prompt-based routine update

Example user prompt:

- "Make this routine shorter and replace stretching with journaling."

Expected backend responsibility:

- accept the current routine context plus the prompt
- generate a proposed structured update
- return editable data to the frontend
- avoid silently overwriting the saved routine without review

### Important principle

AI should help create or revise routines, but users should stay in control of what is persisted.

---

## Recommended API Direction

The current API surface is already close to what this MVP needs. Near-term improvements should focus on making the AI contract more routine-specific.

### Stable CRUD surface

#### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

#### Routines
- `GET /routine/routines`
- `GET /routine/{id}`
- `GET /routine/user/{userId}`
- `POST /routine`
- `PUT /routine/{id}`
- `DELETE /routine/{id}`
- `POST /routine/{id}/activate`

#### Tasks
- `GET /task/{id}`
- `GET /task/routine/{routineId}`
- `POST /task`
- `PUT /task/{id}`
- `DELETE /task/{id}`
- `PUT /task/routine/{routineId}/reorder`

### AI evolution

The current generic AI endpoint can later be refined into more explicit routine-focused endpoints such as:

- `POST /ai/routines/generate`
- `POST /ai/routines/{id}/update-from-prompt`

Whether those endpoint names change or not, the key idea is that AI output should map cleanly into the existing `Routine` and `Task` model.

---

## Suggested Backend Flow

A practical backend workflow for this MVP looks like this:

### Manual creation flow
1. User creates a routine.
2. User adds tasks to the routine.
3. User updates task ordering.
4. User edits or deletes the routine over time.

### AI creation flow
1. User submits a natural language prompt.
2. API generates a structured routine draft.
3. Frontend shows draft to the user.
4. User edits if needed.
5. Frontend saves through normal routine/task persistence.

### AI update flow
1. User opens an existing routine.
2. User submits a prompt describing changes.
3. API returns a proposed updated structure.
4. User reviews and edits the result.
5. Frontend persists the final approved version.

This keeps AI as an accelerator rather than an opaque source of truth.

---

## Key Files

Important files in this backend project include:

- `pom.xml` — Maven build configuration and dependencies
- `schema.sql` — current MySQL schema
- `Dockerfile` — container image definition
- `docker-compose.yml` — local infrastructure support
- `src/main/java/.../controller` — API controllers
- `src/main/java/.../model` — JPA entities
- `src/main/java/.../service` — business logic layer

---

## Local Development

### Prerequisites

You should have:

- Java 17
- Maven, or use the included Maven wrapper
- MySQL
- Docker, if you want to use the provided container setup

### Environment configuration

Secrets and environment-specific settings are read from environment variables. For local work, copy `.env.example` to `.env` (gitignored) and fill it in; Spring Boot and `docker compose` both read it automatically.

| Variable | Purpose |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `dev` (default: schema auto-update, SQL logging) or `prod` (schema validation only, quiet logs) |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | Base64 signing key, at least 32 bytes (`openssl rand -base64 48`) |
| `JWT_EXPIRATION_MS` | Token lifetime, default 24h |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins, default `http://localhost:5173` |
| `OPENAI_API_KEY` | OpenAI key for AI routine generation |

The app refuses to start without `DB_PASSWORD` and `JWT_SECRET`. In production, set these as platform environment variables rather than shipping a `.env` file.

If AI-backed functionality is enabled, an API key is required and should never be hardcoded in committed files.

### Start local dependencies

If your `docker-compose.yml` is configured for local development:

- `docker compose up -d`

### Run the API

Using the Maven wrapper:

- `./mvnw spring-boot:run`

Or build then run:

- `./mvnw clean package`
- `java -jar target/*.jar`

On Windows, you may prefer:

- `mvnw.cmd spring-boot:run`

---

## Near-Term Development Priorities

The most important backend work right now should be:

1. make routine CRUD reliable
2. make task CRUD and reordering reliable
3. ensure user ownership and auth boundaries are correct
4. shape AI output into structured routine/task payloads
5. keep validation and persistence predictable
6. avoid overcomplicating the MVP with broader planning logic

If tradeoffs are needed, prioritize dependable CRUD and editable AI-assisted workflows over ambitious scheduling behavior.

---

## Long-Term Direction

This backend is intentionally focused on a smaller MVP, but it can still serve as a foundation for a broader future product.

If Rootine expands later, this service could evolve to support:

- more types of user context
- richer preferences and settings
- event-aware routine adaptation
- daily planning and replanning
- broader life orchestration workflows

That future should be built on top of a solid routine CRUD foundation, not instead of it.

---

## Development Philosophy

A useful rule for this phase of the backend is:

> Build reliable CRUD first, use AI to speed up routine creation and editing, and keep the user in control.

That is the right constraint for the current stage of Rootine.

---

## Related Documentation

- `../README.md` — top-level repository overview
- `../rootine-frontend/README.md` — frontend application overview

Use the root README for overall product direction and the frontend README for the UI-facing side of the MVP.