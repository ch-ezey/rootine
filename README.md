# 🧠 Smart Routine App (Rootine)

Smart Routine App (“Rootine”) is a SaaS-style platform that helps you **generate, manage, and optimize daily routines**. The goal is to go beyond a basic to-do list and become a **context-aware routine system** that can build structure from your input, handle task prerequisites, and adapt when real life (events, conflicts, time constraints) happens.

This repo is a monorepo with:
- `rootine-api/` — Spring Boot backend API (Java 17)
- `rootine-frontend/` — React + Vite frontend

---

## 📌 What you’re building (vision)

Rootine aims to become:

> A context-aware productivity engine that intelligently constructs and adapts daily structure around real life.

Unlike traditional task managers, this system:
- thinks in **structured routines**
- understands **dependencies**
- adapts to **events**
- supports multiple lifestyle modes (e.g., Work, Fitness, General Daily)

Future roadmap includes:
- AI-powered optimization & scheduling
- image-based task capture
- predictive scheduling
- SaaS subscription tiers
- cross-device sync
- team/shared routines

---

## 🧠 Core concepts & capabilities

### Multiple routines per user
You can support multiple active “modes”:
- Work routine
- Fitness routine
- General daily routine
…and more.

### Automatic routine generation (prompt → plan)
The product direction is to accept user context and generate a structured routine. Routines support adjustable “detail level”, ranging from:
- high-level blocks (e.g., “Morning Routine”)
- medium detail
- fully granular breakdown

### Task system with dependencies
Tasks can:
- belong to routines
- be standalone (one-time / event)
- depend on other tasks (“Shower” after “Workout”)
- be ordered and scheduled logically

### Event accommodation
When you add an event:
- active routines can shift
- conflicts can be resolved
- timing can be adjusted intelligently

### Notifications (planned / in-progress)
- persistent notifications
- reminders and alerts
- device token support for push notifications

---

## 🏗 Current architecture (repo reality)

### Backend: `rootine-api/`
**Stack**
- Java 17, Spring Boot (3.4.x)
- Spring Web, Spring Security, Spring Data JPA, Validation
- WebSocket support
- MySQL connector
- JWT (`jjwt`)
- OpenAI Java client (`com.openai:openai-java`)

**Notes**
- The backend project includes `Dockerfile` and `docker-compose.yml` to support local infrastructure (e.g., MySQL).

### Frontend: `rootine-frontend/`
**Stack**
- React (Vite)
- `react-router-dom`
- `axios`

**Scripts**
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run preview`

---

## 🗃 Database schema (current state)

The database is relational and oriented around clean relationships, foreign keys, and indexing.

Core tables (conceptually):
- `user`
- `routine`
- `task`
- `event`
- `note`
- `dependency`
- `setting`
- `template`
- `device_token`

Task types (current / planned):
- `routine` (part of a recurring routine)
- `one-time`
- `event`
- `habit` (may later merge into “recurring” + behavior tracking)

Key relationships:
- A user has many routines
- A routine has many tasks
- A task can:
  - belong to a routine or be standalone
  - have dependencies (via `dependency`)
  - have notes
- Events can override or interact with routines
- Settings are scoped per routine (detail level is routine-specific)
- Templates enable reusable routine generation
- Device tokens support push notifications

---

## 🎨 Frontend (MVP pages / direction)

Planned/defined pages:
- Landing Page
- Authentication (Login/Register)
- Dashboard
- Routine Overview
- Routine Detail/Edit
- Prompt-Based Routine Generation
- Calendar View
- Task Management
- Settings

MVP focus:
- prompt-based generation
- routine editing
- event addition
- active routine visualization

---

## 🧪 Seeding & data

The database is intended to be seeded with realistic data, including:
- users
- multiple routine types
- tasks with recurrence rules
- notes
- dependencies
- events
- templates
- routine-specific settings

---

## 🚀 Quick start (local development)

### Prerequisites
**Backend**
- Java 17
- Maven (or use the Maven wrapper: `./mvnw`)
- MySQL (local or via Docker)

**Frontend**
- Node.js (LTS recommended)
- npm

---

## ▶️ Run the backend (`rootine-api/`)

1) Start dependencies (if defined in `docker-compose.yml`):
- `docker compose up -d`

2) Configure application settings (DB + auth secrets)
- Prefer environment variables or local-only config.
- Typical values you’ll need:
  - Spring datasource URL/user/password
  - JWT secret (if security is enabled)
  - OpenAI API key (only if you use AI-powered endpoints)

Common environment variables (examples):
- `SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/<db>`
- `SPRING_DATASOURCE_USERNAME=<user>`
- `SPRING_DATASOURCE_PASSWORD=<password>`
- `JWT_SECRET=<secret>`
- `OPENAI_API_KEY=<api-key>`

3) Start the API:
- `./mvnw spring-boot:run`

Or build + run:
- `./mvnw clean package`
- `java -jar target/*.jar`

---

## ▶️ Run the frontend (`rootine-frontend/`)

1) Install dependencies:
- `npm install`

2) Start dev server:
- `npm run dev`

3) Configure API base URL
- If you want environment-based configuration, use Vite env vars, e.g. create `.env.local` (do not commit):
  - `VITE_API_BASE_URL=http://localhost:<api-port>`

Then reference `VITE_API_BASE_URL` wherever you configure `axios`.

---

## 🧩 Planned / in-progress (high level)

- REST API completion + auth flows
- routine generation engine refinement
- notification system integration
- containerization + CI/CD (planned)
- scalable infrastructure (Kubernetes planned)
- habit tracking evolution (streaks, analytics)
- templates: predefined, user-generated, and potential marketplace direction

---

## 🧯 Troubleshooting

### Frontend can’t reach backend
- Confirm the backend is running and you’re targeting the correct port.
- Check CORS configuration in the backend.
- If auth uses cookies/credentials, ensure your CORS + client settings support it.

### Database connection issues
- Confirm MySQL is running (and reachable from the API container/process).
- Validate JDBC URL, credentials, and schema/init strategy.

---

## 📂 Project status

Current stage:
- backend schema design + routine logic refinement + seed data creation

Next steps:
- finalize routine generation engine
- implement REST APIs
- build MVP frontend
- integrate notifications
- begin containerization

---

## 📄 License
If you add a top-level license, document it here. Otherwise, check each subproject for licensing information.