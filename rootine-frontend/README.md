# Rootine Frontend

The `rootine-frontend` project is the user-facing application for Rootine’s current MVP: a routine management system with full CRUD support and AI-assisted routine creation and updates from natural language prompts.

This frontend should make it easy for users to:

- sign up and log in
- create routines manually
- view and manage saved routines
- add, edit, delete, and reorder routine tasks
- generate routine drafts from prompts
- update existing routines with AI assistance
- review AI output before saving changes

The goal is a simple, trustworthy routine management experience where AI speeds up creation and editing, but the user always stays in control.

---

## Product Purpose

The frontend is being built around a narrower and more practical MVP.

Rootine is not currently trying to be a fully context-aware life orchestration platform. For now, it is focused on being:

> A routine management app with full CRUD functionality and prompt-based AI routine creation and updates.

That means the frontend should optimize for:

- clarity
- control
- fast editing
- structured routine management
- clean AI-assisted workflows

---

## Core Frontend Responsibilities

For the current MVP, the frontend should support:

- authentication flows
- routine list and detail views
- routine creation and editing
- task creation and editing within a routine
- task ordering and reordering
- AI prompt submission for routine generation
- AI prompt submission for routine updates
- AI draft review before persistence
- deletion flows for routines and tasks

The frontend should feel like a strong CRUD application first, with AI integrated as an accelerator rather than as the entire product.

---

## MVP User Experience

A user should be able to complete the following flows easily.

### 1. Manual routine creation
- create a new routine
- enter a title and description
- choose a detail level if supported
- add tasks or steps manually
- reorder tasks
- save the routine

### 2. Routine management
- view all routines
- open an existing routine
- edit routine metadata
- add, edit, delete, and reorder tasks
- activate or highlight a current routine if supported
- delete routines they no longer want

### 3. AI routine creation
- enter a natural language prompt
- receive a structured routine draft
- review the generated title, description, and tasks
- edit the result before saving
- save the approved routine using the normal CRUD workflow

### 4. AI routine update
- open an existing routine
- describe desired changes in plain language
- receive a proposed updated structure
- review and edit the changes
- save the final approved version

---

## In Scope for the Frontend

The frontend should currently focus on:

- user authentication
- routine CRUD
- task CRUD
- task reordering
- AI-generated routine drafts
- AI-assisted updates to existing routines
- review-before-save flows
- user-owned data management

### Examples of routines the UI should support
- morning routine
- evening routine
- gym routine
- work startup routine
- study routine
- weekend reset routine

---

## Out of Scope for Now

To keep the MVP focused, the frontend should not currently optimize for:

- calendar-based scheduling
- daily plan generation
- live replanning
- commute-aware adjustments
- holiday-aware flows
- advanced behavioral analytics
- autonomous AI changes without review
- broad life-management orchestration

These can remain future possibilities, but they are not the current product promise.

---

## UX Principles

### 1. User control first
AI should never remove the user’s ability to inspect, edit, and approve what gets saved.

### 2. Structured over vague
The UI should present routines as structured, editable data rather than as blobs of generated text.

### 3. CRUD reliability matters
Creating, reading, updating, deleting, and organizing routines should feel solid and predictable.

### 4. AI should reduce friction
Prompt-based generation should make routine creation faster, not more confusing.

### 5. Editing should feel natural
Users should be able to move from AI-generated content into normal manual editing without friction.

---

## Suggested MVP Pages

The exact implementation can evolve, but a practical MVP frontend would likely include:

- Landing page
- Login page
- Registration page
- Routine list or dashboard page
- Routine detail page
- Create routine page
- Edit routine page
- AI routine generation flow
- AI-assisted routine update flow

If some of these are combined into fewer screens, that is fine. What matters most is that the CRUD and AI flows are clear.

---

## Important UI Concepts

### Routine
A top-level structured object the user owns and manages.

Typical routine information may include:
- title
- description
- detail level
- active state
- ordered tasks

### Task / Step
An individual part of a routine.

Typical task information may include:
- title
- description
- type
- duration
- priority
- completion state
- position in the routine

### AI Draft
A temporary structured result generated from a prompt.

Important principle:
- AI drafts should be reviewable and editable before they are saved as persistent routine data.

---

## Frontend Architecture Direction

The frontend should be organized around a few practical UI responsibilities.

### Authentication layer
Handles login, registration, and current-user state.

### Routine management layer
Handles:
- viewing routines
- creating routines
- editing routines
- deleting routines

### Task editing layer
Handles:
- creating tasks
- updating tasks
- deleting tasks
- reordering tasks

### AI workflow layer
Handles:
- prompt input
- draft generation
- displaying proposed routine updates
- review and approval before save

### API integration layer
Handles communication with the backend in a consistent and centralized way.

This structure keeps the app aligned with the current MVP rather than overfitting to future features too early.

---

## Current Stack

This frontend currently uses:

- React + Vite
- `react-router-dom` for routing
- `axios` for HTTP, with `@tanstack/react-query` for caching, loading states and optimistic updates
- Tailwind CSS v4, with light/dark design tokens defined in `src/shared/styles/index.css`
- `@dnd-kit` for drag-and-drop (and keyboard) task reordering
- `lucide-react` icons, `sonner` toasts, Inter font
- ESLint

### Structure

- `src/app/` — app entry, routes, auth provider, protected routes, app shell (sidebar / mobile tab bar)
- `src/pages/` — `Landing`, `Auth` (login/register), `Today` (active routine timeline), `Routines` (list + create, including the AI draft flow), `Routine` (detail: task CRUD and reordering), `Profile`
- `src/services/api/` — one module per API resource; `httpClient.js` attaches the JWT and logs out on 401
- `src/services/queries.js` — React Query hooks used by the pages
- `src/shared/ui/` — reusable components (Button, Field, Card, Dialog, task bits)
- `src/shared/lib/` — small helpers (time formatting, class names, task types)

### Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login`, `/register` | Auth (registering signs you in) |
| `/today` | Active routine: progress, "up next" and a timeline with a live "now" marker |
| `/routines` | All routines; create one blank or from an AI draft you review before saving |
| `/routines/:id` | Edit details, activate, add/edit/delete/complete and drag-reorder tasks, "New day" reset |
| `/profile` | Name, account info, logout, delete account |

---

## API Integration Expectations

The frontend is expected to integrate with the backend service in `rootine-api`.

Core backend interaction areas include:

- authentication
- routine CRUD
- task CRUD
- task reordering
- AI prompt submission
- AI-generated routine draft retrieval
- AI-assisted update flows

The frontend should be built so AI-generated data can feed into the same editing and save flows used for manually created routines.

That keeps the product consistent and easier to maintain.

---

## Local Development

### Prerequisites

You should have:
- Node.js
- npm

### Install dependencies
Run:

`npm install`

### Start the development server
Run:

`npm run dev`

### Build for production
Run:

`npm run build`

### Preview the production build
Run:

`npm run preview`

### Lint the project
Run:

`npm run lint`

---

## Environment Configuration

If the frontend uses environment-based API configuration, store local values outside committed source files.

A common example is:

- `VITE_API_BASE_URL=http://localhost:<api-port>`

API configuration should be centralized so request behavior is easy to maintain as the application grows.

---

## Near-Term Frontend Priorities

The most important frontend work right now should be:

1. make routine list/detail flows clean
2. make routine CRUD dependable
3. make task CRUD and task ordering smooth
4. make AI prompt flows easy to understand
5. ensure AI output is editable before save
6. keep the UI simple and focused

If tradeoffs are needed, favor a polished CRUD experience over extra conceptual features.

---

## Long-Term Direction

This frontend is intentionally being built around a simpler product first.

If Rootine expands later, the frontend can grow into a richer planning interface that supports:

- more types of user context
- dynamic scheduling
- daily plan generation
- routine adaptation around events
- broader planning and orchestration workflows

For now, though, the right target is smaller:

> Build an excellent routine management interface with AI-assisted creation and updates.

---

## Relationship to the Monorepo

This project is the frontend application inside the Rootine monorepo.

Related documentation:
- `../README.md` — top-level repository overview
- `../rootine-api/README.md` — backend service overview

Use the root README for the overall product direction and the API README for backend-specific details.

---

## Development Philosophy

A good rule for this phase of the frontend is:

> Make routine CRUD feel solid, make AI assistance easy to review, and keep the user in control.

That is the right constraint for the current stage of Rootine.