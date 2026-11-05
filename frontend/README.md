# OrbitDesk frontend

The OrbitDesk user interface is built with Nuxt 2, Vue 2, and Vuetify 2. It includes a responsive overview, task list and filters, task creation and detail pages, focus-time tracking, account screens, and password recovery.

## Development

From the repository root, start MongoDB and prepare the sample environment files:

```powershell
docker compose -f '.\backend\docker-compose.yml' up -d mongodb
Copy-Item '.\backend\.env.example' '.\backend\.env'
Copy-Item '.\frontend\.env.example' '.\frontend\.env'
```

Run the API from the repository root:

```powershell
Set-Location '.\backend'
npm install
npm run seed:demo
npm run dev
```

Nuxt serves the app at `http://localhost:5000`; the API listens on port `7070`. The **Explore with demo data** button signs into the sample account (`demo@orbitdesk.local` / `OrbitDeskDemo2026!`) created by `npm run seed:demo`. These credentials are for local development only. Task CRUD, status changes, time tracking, and password updates persist through the authenticated API.

Start Nuxt in another terminal from the repository root:

```powershell
Set-Location '.\frontend'
npm install
npm run dev
```

The sample API environment enables development-only password reset links in the response, so the reset flow can be exercised without Mailgun. See the repository [README](../README.md) for configuration, endpoint contract, production boundaries, and the credential-rotation note.

Material Design Icons are installed as an npm dependency and bundled locally; the app does not fetch icon fonts from a CDN.
