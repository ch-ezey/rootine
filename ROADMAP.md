# Rootine roadmap

Tasks live in [GitHub Issues](https://github.com/ch-ezey/rootine/issues), grouped by milestone. Ideas, specs and design notes stay in the Notion board ("Rootine - Development Board").

Rule of thumb: if it ends in a commit, it's an issue; if it's thinking or planning, it's a Notion page.

## Phase 0 – Hardening (current, branch `hardening`)

Make what exists safe and testable before adding features.

- [x] Move from MySQL to PostgreSQL, with Flyway migrations
- [x] Scope every routine, task and user endpoint to the signed-in user, with request/response DTOs
- [x] End-to-end API tests against a real PostgreSQL
- [ ] Authentication & user accounts (JWT): finish review and testing
- [ ] Protected routes in the frontend: finish review and testing
- [ ] CI pipeline on GitHub Actions (build and run tests on every push)

## Phase 1 – Core MVP

- [ ] Routine CRUD in the frontend
- [ ] Task CRUD in the frontend
- [ ] AI routine generation (OpenAI)
- [ ] User context (preferences and constraints that feed routine generation)
- [ ] Routine templates

## Phase 2 – Scheduling

- [ ] Event management (calendar-based)
- [ ] Smart adjustments when new events are added
- [ ] Notifications (persistent reminders)

## Phase 3 – Deployment

- [ ] Kubernetes deployment

## Later (ideas, tracked in Notion)

Mobile app, drag-and-drop routine builder, calendar sync, sharing routines, voice assistants, premium tier.

## Workflow

1. Pick an issue from the current milestone and move it to *In progress* on the project board.
2. Branch from `main` (one branch per issue or per phase).
3. Commit small, logical changes. Put `Fixes #<n>` in the PR description so the issue closes on merge.
4. Open a PR into `main`, review it, merge.
