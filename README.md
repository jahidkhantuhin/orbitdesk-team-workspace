# OrbitDesk

**A thoughtful workspace for planning projects, tracking time, and doing your best work.**

OrbitDesk is a responsive task-management showcase by **Jahid Khan**. It pairs a Nuxt application with an Express and MongoDB API for authentication and user-owned task data. The local demo account is seeded into MongoDB and uses the same API as registered accounts.

## What you can do

- See a live overview of task counts, focus time, upcoming work, and priorities.
- Search and filter tasks, change their status, and sort by due date, priority, or creation date.
- Create tasks with a category, priority, due date, workspace, and effort estimate.
- Open task details, run a focus timer, track effort against the estimate, and delete tasks.
- Try the full demo journey with a seeded local account.
- Register, sign in, and reset a password through the API. Local development can return a reset link in the API response; production email delivery requires Mailgun.
- Use the responsive navigation and layouts on desktop, tablet, and mobile.

## Project structure

```text
frontend/  Nuxt 2 + Vue 2 + Vuetify 2 application
backend/   Express auth/task API + MongoDB models
```

Task records are stored in MongoDB and scoped to the authenticated user. The browser stores only the short-lived JWT and session details in `localStorage`; task changes are sent to the API and remain available across reloads and devices using the same account. The one-click demo signs into the seeded local account and exercises the same API-backed flows.

## Run the application

Use Node.js, npm, and Docker Desktop. Start MongoDB using the provided Compose file and copy the sample environment files:

```powershell
docker compose -f '.\backend\docker-compose.yml' up -d mongodb
Copy-Item '.\backend\.env.example' '.\backend\.env'
Copy-Item '.\frontend\.env.example' '.\frontend\.env'

cd '.\backend'
npm install
npm run seed:demo
npm run dev
```

In a second terminal, start the frontend:

```powershell
cd .\frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:5000`; the API listens on port `7070`. Choose **Explore with demo data** to sign in as the sample account shown in the `.env.example` files. Those credentials and the sample JWT secret are for local development only and must be replaced before deployment. `docker compose down` stops MongoDB; add `-v` only when intentionally deleting the local database volume.

## Configuration

Frontend values are read from `frontend/.env`:

| Variable                       | Purpose                      | Default                                       |
| ------------------------------ | ---------------------------- | --------------------------------------------- |
| `APP_NAME`                     | Product label and page title | `OrbitDesk`                                   |
| `APP_OWNER`                    | Profile/credit name          | `Jahid Khan`                                  |
| `API_BASE_URL`                 | Express API origin           | `http://localhost:7070`                       |
| `PORT`                         | Nuxt development server port | `5000`                                        |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | Seeded local demo login      | `demo@orbitdesk.local` / `OrbitDeskDemo2026!` |

Backend values are read from `backend/.env`; see that directory's `.env.example`. The API refuses to start without `MONGODB_URI` and a `JWT_SECRET` of at least 32 bytes. `DEV_RESET_LINKS=true` returns a reset URL only outside production so the recovery journey can be tested without an email provider. Real environment files are ignored by Git; keep production credentials out of version control.

## Authentication API

| Method   | Path               | Purpose                                                            |
| -------- | ------------------ | ------------------------------------------------------------------ |
| `PUT`    | `/signup`          | Create an account with name, email, and an 8-72 character password |
| `POST`   | `/login`           | Authenticate and return a one-hour JWT                             |
| `POST`   | `/reset`           | Send a time-limited password-reset link                            |
| `POST`   | `/update-password` | Set a new password with a valid reset token                        |
| `GET`    | `/tasks`           | List tasks owned by the authenticated user                         |
| `POST`   | `/tasks`           | Create a task                                                      |
| `PATCH`  | `/tasks/:id`       | Update task fields, status, or tracked time                        |
| `DELETE` | `/tasks/:id`       | Delete an owned task                                               |
| `GET`    | `/health`          | Check API and MongoDB readiness                                    |

Task endpoints require the JWT returned by `/login` in an `Authorization` header. Task creation accepts `title`, `description`, `category`, `priority`, `estimate`, `dueDate`, `location`, and `clientName`; status and tracked seconds are set to their defaults. Partial updates accept one or more task fields. The API validates all input and queries by both task ID and owner, returning `404` for another user's task as well as a missing task. Responses use JSON; task reads/writes return `{ "tasks": [...] }` or `{ "task": {...} }`, with `id` and ISO date fields. Errors use `{ "message", "data" }`; validation failures return `422`, duplicate registration returns `409`, invalid/missing auth returns `401`, and unconfigured production recovery email returns `503`.

## Production boundaries

This repository still uses the Nuxt 2 / Vue 2 / Vuetify 2 stack. Nuxt 2 and Vue 2 are end-of-life; a migration to a maintained framework is still needed before treating this as a production deployment. The API has no rate limiting, the JWT is stored in browser `localStorage`, and the local demo credentials/JWT secret are intentionally public examples. Use secure, HTTP-only cookies, replace local secrets, and add production operational safeguards before handling sensitive data.

## Important credential note

The original source contained a Mailgun credential. It has been removed from the current files and replaced with environment-based configuration. **If that credential was ever active, revoke and rotate it in Mailgun**: removing it from the latest source does not erase it from prior Git history.

## Checks

Run `npm run build` in `frontend` to validate the production frontend bundle. Material Design Icons are bundled from the local npm package rather than a CDN. For a local end-to-end smoke test, start MongoDB and the API as described above, then exercise demo login, task CRUD, and password reset from the frontend. The integration requires a reachable MongoDB instance; live Mailgun delivery remains optional and unverified without provider credentials.
