# Rootine

Rootine is an AI-assisted routine management platform focused on helping users create, organize, and maintain structured routines with full CRUD support and prompt-based AI assistance.

The near-term product is intentionally simple:

> A routine management system with full CRUD functionality, plus AI-powered routine creation and updates from natural language prompts.

This keeps the MVP practical and buildable while laying the foundation for a larger long-term vision: a more context-aware system that can eventually adapt routines around broader life context.

---

## Product Direction

Rootine is currently being built as a **routine CRUD application first**.

That means the product should do a few things very well:

- let users create routines manually
- let users view and manage their routines easily
- let users update routines and their steps
- let users delete routines cleanly
- let users use AI to generate routines from prompts
- let users use AI to update existing routines from prompts
- keep users in full control over the final saved structure

Rather than trying to solve full life orchestration immediately, Rootine is focused on becoming a strong foundation for structured routine management.

---

## MVP Goal

The goal of the MVP is to prove that Rootine can help users create and maintain routines faster and more effectively than a manual-only workflow.

### Core user promise

> Describe the routine you want, let AI turn it into a structured draft, then fully manage it with normal CRUD controls.

### What success looks like

A user should be able to:

- sign up and log in
- create a routine manually
- view their saved routines
- edit routine details
- delete routines
- add, edit, delete, and reorder routine tasks
- generate a routine from a prompt
- update an existing routine from a prompt
- review AI output before saving

---

## In Scope for the MVP

### Core functionality

- authentication
- user-owned routines
- full CRUD for routines
- full CRUD for routine tasks
- task ordering / reordering within a routine
- AI-generated routines from prompts
- AI-assisted updates to existing routines
- editable AI output before persistence

### Supported routine structure

The MVP centers around structured routines made up of ordered tasks or steps.

Examples:

- morning routine
- evening routine
- gym routine
- work startup routine
- study routine
- weekend reset routine

### AI use cases

The MVP should support a constrained and practical AI workflow.

#### Prompt-based routine creation
Example prompt:

- "Create a weekday morning routine before work with stretching, breakfast, shower, and planning time."

Expected outcome:

- a structured routine draft
- a title
- optional description
- ordered tasks
- optional durations, priorities, or detail level where appropriate

#### Prompt-based routine updates
Example prompt:

- "Make this shorter, remove stretching, and add a 10-minute journaling step before breakfast."

Expected outcome:

- a proposed structured update to an existing routine
- user review before final save

---

## Out of Scope for the MVP

To avoid overbuilding, the following are not the current product focus:

- calendar-aware scheduling
- full daily planning
- event-based replanning
- commute-aware adjustment
- holiday or work-schedule intelligence
- autonomous routine adaptation without user review
- advanced behavioral prediction
- broad life-orchestration features

These remain possible future directions, but they are not required for this version of Rootine.

---

## Why This Scope

This version of Rootine is meant to be the right first step.

It is:

- easier to build well
- easier to test
- easier to explain
- easier to demo
- still genuinely useful
- a strong foundation for future planning features

Instead of trying to solve every scheduling problem immediately, Rootine starts by solving structured routine creation and management well.

---

## Product Principles

These principles should guide implementation decisions.

### 1. Full manual control matters
AI should help users create and update routines, but users should always be able to inspect, edit, and save the final result themselves.

### 2. Structured data over one-off text
AI output should become editable structured routine data, not remain only as freeform text.

### 3. CRUD reliability comes first
Before adding complex intelligence, the system should be dependable at creating, reading, updating, deleting, and organizing routines and tasks.

### 4. AI should accelerate, not obscure
The AI feature should reduce friction in creating and editing routines, not make the product harder to trust.

### 5. Build a foundation for future context-awareness
Even though the MVP is simpler, the system should be shaped so richer planning and context features can be added later.

---

## Monorepo Structure

This repository contains:

- `rootine-api/` — backend API
- `rootine-frontend/` — frontend application

### `rootine-api/`
The backend is responsible for:

- authentication
- persistence
- routine and task CRUD
- user ownership rules
- AI-backed routine generation/update endpoints
- validation and business logic

### `rootine-frontend/`
The frontend is responsible for:

- authentication flows
- routine list and detail views
- routine creation and editing UX
- task management and reordering
- AI prompt input flows
- AI draft review and user approval flows

---

## Current Backend-Aligned Domain Model

Based on the current backend structure, the MVP revolves around three main persisted entities:

- `User`
- `Routine`
- `Task`

### `User`
Represents the account owner.

Current backend model includes fields such as:

- `user_id`
- `uuid`
- `name`
- `email`
- `password`
- timestamps like `created_at` and `last_login`

### `Routine`
Represents a user-owned routine.

Current backend model includes fields such as:

- `routine_id`
- `user_id`
- `name`
- `description`
- `detail_level`
- `is_active`
- `created_at`

A routine owns an ordered collection of tasks.

### `Task`
Represents an individual step inside a routine.

Current backend model includes fields such as:

- `task_id`
- `routine_id`
- `title`
- `description`
- `type`
- `start_time`
- `duration`
- `priority`
- `is_completed`
- `position`
- `created_at`

This is enough to support a useful first version of structured routines with ordered steps.

---

## Current Backend Capabilities

The existing backend structure already aligns well with this narrower MVP direction.

### Authentication
The API includes authentication endpoints for:

- user registration
- login
- current user lookup

### Routine management
The API includes endpoints for:

- listing routines
- getting a routine by id
- getting routines by user
- creating a routine
- updating a routine
- deleting a routine
- activating a routine

### Task management
The API includes endpoints for:

- getting a task by id
- getting tasks for a routine
- creating a task
- updating a task
- deleting a task
- reordering tasks within a routine

### AI integration
The API currently includes an AI-related endpoint for generating a response from a prompt.

This can evolve into clearer MVP-oriented AI endpoints for:

- generating a routine draft from a prompt
- updating an existing routine from a prompt

---

## Recommended MVP API Direction

A clean near-term API surface would center around:

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Routines
- `GET /routine/routines`
- `GET /routine/{id}`
- `GET /routine/user/{userId}`
- `POST /routine`
- `PUT /routine/{id}`
- `DELETE /routine/{id}`

### Tasks
- `GET /task/{id}`
- `GET /task/routine/{routineId}`
- `POST /task`
- `PUT /task/{id}`
- `DELETE /task/{id}`
- `PUT /task/routine/{routineId}/reorder`

### AI
Current AI support can be refined toward endpoints like:

- `POST /openai/response` for generic prompt experimentation
- future dedicated routine generation/update endpoints when the prompt contract is finalized

---

## MVP User Flows

### Manual routine creation
1. User creates a new routine.
2. User adds tasks manually.
3. User reorders tasks as needed.
4. User saves and revisits the routine later.

### AI routine creation
1. User enters a prompt describing the desired routine.
2. The system generates a structured routine draft.
3. The user reviews the draft.
4. The user edits any fields or tasks they want.
5. The user saves the routine.

### AI routine update
1. User opens an existing routine.
2. User enters a prompt describing desired changes.
3. The system proposes structured edits.
4. The user reviews and adjusts those edits.
5. The updated routine is saved.

### Ongoing CRUD management
1. User browses their routines.
2. User edits routine metadata and tasks over time.
3. User deletes routines they no longer need.
4. User keeps control over the evolving structure.

---

## Suggested Frontend MVP Pages

The frontend should prioritize a small set of useful screens:

- Landing page
- Login / Register
- Dashboard or routine list
- Routine detail page
- Create / edit routine page
- AI prompt-based routine generation flow
- AI-assisted update flow

The most important thing is not page count. It is making routine creation and editing smooth and obvious.

---

## Development Priorities

The immediate focus should be:

1. make routine and task CRUD reliable
2. ensure user ownership and auth flows are clean
3. support ordered task management
4. make AI-generated output convertible into editable structured data
5. keep the save/edit/delete workflow predictable

If tradeoffs are needed, prioritize dependable CRUD behavior over ambitious intelligence.

---

## Long-Term Vision

The larger vision for Rootine still matters, but it should be framed as a future direction rather than the current product promise.

Over time, this routine management foundation could evolve into a richer system that understands:

- calendars
- to-dos
- meetings
- work schedules
- commute windows
- holidays
- user preferences
- dynamic changes to the day

That future version could become a context-aware planning system.

But the product being built now is simpler and more disciplined:

> First, build a great routine management system with AI-assisted creation and updates.

---

## Development Philosophy

A useful rule for this phase of the project is:

> Build reliable CRUD first, use AI to speed up routine creation and editing, and keep the user in control.

That principle keeps the MVP grounded while preserving the possibility of a more advanced Rootine later.

---

## Getting Started

Project-specific setup and implementation details live in:

- `rootine-api/README.md`
- `rootine-frontend/README.md`

Use those for local development instructions and project-specific documentation.

---

## Status

Rootine is currently focused on a simpler MVP:

- routine management
- full CRUD for routines and tasks
- AI prompt-based routine creation
- AI prompt-based routine updates

That is the product to build well first.

Everything beyond that should build on this foundation.