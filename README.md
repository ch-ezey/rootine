# Rootine (Monorepo)

Rootine is a full-stack “smart routine” application split into two projects:

- `rootine-api/` — Spring Boot (Java 17) backend API
- `rootine-frontend/` — React + Vite frontend

## Repository layout

- `rootine-api/`
  - Spring Boot 3.x app (Maven)
  - Includes: Spring Web, Security, Data JPA, Validation, WebSocket, MySQL driver, JWT libs, and `openai-java`
  - Contains `Dockerfile` and `docker-compose.yml` for local infrastructure
- `rootine-frontend/`
  - React app bootstrapped with Vite
  - Uses `react-router-dom` and `axios`
  - Dev scripts: `dev`, `build`, `lint`, `preview`

---

## Prerequisites

### Backend (`rootine-api`)
- Java 17
- Maven (or use `./mvnw`)
- A MySQL instance (local or via Docker)

### Frontend (`rootine-frontend`)
- Node.js (LTS recommended)
- npm (or your preferred Node package manager)

---

## Quick start (local dev)

### 1) Start the backend

From `rootine-api/`:

1. (Recommended) Start dependencies (MySQL) with Docker Compose:
   - If the project’s `docker-compose.yml` defines MySQL, bring it up:
     - `docker compose up -d`

2. Configure Spring datasource + auth secrets:
   - Use `application.properties` / `application.yml` and/or environment variables.
   - Typical values you’ll need:
     - DB host/port/name/user/password
     - JWT secret (if security is enabled)
     - OpenAI API key (only if you use AI-powered endpoints)

3. Run the API:
   - `./mvnw spring-boot:run`
   - Or build + run:
     - `./mvnw clean package`
     - `java -jar target/*.jar`

Notes:
- The API project is a standard Spring Boot app; port and context path depend on your Spring configuration.
- If CORS is not configured and your frontend can’t call the API, you’ll need to enable CORS in the backend (or proxy in Vite).

---

### 2) Start the frontend

From `rootine-frontend/`:

1. Install dependencies:
   - `npm install`

2. Run the dev server:
   - `npm run dev`

3. Configure the API base URL:
   - If the frontend is hardcoded to an API URL, update it accordingly.
   - If it uses Vite env vars, set something like:
     - `VITE_API_BASE_URL=http://localhost:<api-port>`
   - Then reference it in the code where `axios` is configured.

Build / preview:
- `npm run build`
- `npm run preview`

---

## Environment & configuration

### Backend secrets
Do not commit secrets. Prefer environment variables or a local-only config file.

Common configuration you may need:
- **Database**
  - `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/<db>`
  - `SPRING_DATASOURCE_USERNAME=<user>`
  - `SPRING_DATASOURCE_PASSWORD=<password>`
- **JWT**
  - `JWT_SECRET=<secret>`
- **OpenAI**
  - `OPENAI_API_KEY=<api-key>`

Exact keys depend on how the backend is wired (check `rootine-api/src/...` config classes and `application*.properties`).

### Frontend config
If you want configurable API URLs per environment, prefer Vite env vars:
- `.env.local` (not committed)
  - `VITE_API_BASE_URL=...`

---

## Development workflow

- Run backend and frontend in two terminals.
- Backend changes: Spring Boot devtools may hot reload depending on configuration.
- Frontend changes: Vite HMR reloads instantly.

---

## Tech stack

**Backend**
- Spring Boot 3.4.x
- Spring Security + JWT (`jjwt`)
- Spring Data JPA
- MySQL
- WebSocket support
- OpenAI Java client (`com.openai:openai-java`)

**Frontend**
- React (Vite)
- React Router
- Axios

---

## Troubleshooting

### Frontend can’t reach backend
- Verify API port is correct and the backend is running.
- Check CORS configuration in the backend.
- If you use cookies/auth headers, confirm `withCredentials` / CORS headers as needed.

### Database connection errors
- Confirm MySQL is running and accessible.
- Validate JDBC URL, credentials, and schema initialization strategy.

---

## License
If a top-level license is added, document it here. Otherwise, check each subproject for licensing information.