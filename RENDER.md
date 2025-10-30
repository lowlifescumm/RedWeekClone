## Deploying to Render

Use this app as a single Node web service. The server serves the API and the built React client.

### 1) Repo setup
- Push this repo to GitHub/GitLab.
- Render will build both the client and server with the existing scripts.

### 2) Create a Web Service
- Service type: Web Service
- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/`

### 3) Environment Variables
Required:
- `NODE_ENV=production`
- `SESSION_SECRET` (generate a strong random value)

Optional (add according to your storage/DB setup):
- `DATABASE_URL`
- `OBJECT_STORAGE_BUCKET`
- `OBJECT_STORAGE_KEY`
- `OBJECT_STORAGE_SECRET`

Notes:
- The server listens on `process.env.PORT` automatically.
- The client is built into `dist/public`, which the server serves in production.

### 4) Auto deploys
- Enable Auto Deploys on Render for the main branch.

### 5) Verifying
- After deploy, open the service URL. `/` should load the React app; `/api/*` routes serve the API.

