# Ripple DevOps

Production-ready Autonomous DevOps Agent: clones repos, runs tests in Docker, uses Gemini to fix failures, and pushes fixes with CI monitoring.

## Quick start (local)

```bash
# Backend
cd backend && cp .env.example .env  # set GEMINI_API_KEY, optional GITHUB_TOKEN
npm install && npm start           # http://localhost:5000

# Frontend (new terminal)
cd frontend && cp .env.example .env  # set VITE_API_URL=http://localhost:5000
npm install && npm run dev           # http://localhost:5173
```

## Project Structure

```
Rippledevop/
├── frontend/          # React (Vite) + Tailwind + Framer Motion
├── backend/           # Node.js + Express + multi-agent + Docker sandbox
├── docker/            # Dockerfiles for backend and repo execution
└── README.md
```

## Features

- **Multi-agent**: Analyzer (bug detection), Fixer (Gemini patches), Verifier (re-run tests)
- **Docker sandbox**: Isolated test execution per repo
- **Branch naming**: `TEAMNAME_LEADERNAME_AI_Fix` (uppercase, underscores)
- **Private repo support**: GitHub token via modal when backend returns `PRIVATE_REPO`
- **results.json**: Full run summary, score, fixes, timeline

## Environment Variables

### Backend (Render)

| Variable       | Description                    |
|----------------|--------------------------------|
| `PORT`         | Server port (default: 5000)    |
| `GEMINI_API_KEY` | Gemini API key              |
| `GITHUB_TOKEN` | Optional default GitHub token  |
| `RETRY_LIMIT`  | Max fix iterations (default: 5)|

### Frontend (Vercel)

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | Backend URL (e.g. `https://rift-2025.onrender.com`) |

## API

### POST /api/run-agent

**Request body:**
```json
{
  "repoUrl": "https://github.com/org/repo",
  "teamName": "Team Name",
  "leaderName": "Leader Name",
  "githubToken": ""
}
```

**Responses:**
- `200`: Run complete; body includes full results (or stream)
- `400`: Invalid input
- `401` / `404` → `PRIVATE_REPO`: Require GitHub token (frontend shows modal)

## Deployment

**→ Step-by-step guide:** See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for where to host and how to connect backend and frontend.

### Frontend (Vercel)

1. Push this repo to GitHub and connect it to [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. **Build command:** `npm run build` (default when root is `frontend`).
4. **Output directory:** `dist` (configured in `frontend/vercel.json`).
5. Add **Environment variable:** `VITE_API_URL` = your backend URL (e.g. `https://rift-2025.onrender.com`).
6. Deploy. The app will be available at `https://your-project.vercel.app`.

### Backend (Render)

1. Create a **Web Service** on [Render](https://render.com); connect this GitHub repo.
2. **Option A – Docker:**  
   - **Dockerfile path:** `docker/Dockerfile.backend`  
   - **Root Directory:** leave empty (build context = repo root).  
   - Ensure the Dockerfile is built from repo root so `COPY backend/` works.
3. **Option B – Node (no Docker):**  
   - **Root Directory:** `backend`  
   - **Build command:** `npm install`  
   - **Start command:** `node server.js` or `npm start`
4. **Environment variables:**  
   - `PORT` = `5000` (Render sets this automatically; keep for local)  
   - `GEMINI_API_KEY` = your Gemini API key  
   - `GITHUB_TOKEN` = optional default token  
   - `RETRY_LIMIT` = `5`
5. Expose **port 5000** (Render does this for web services).

## Security

- GitHub tokens are never stored, logged, or written to `results.json`.
- Tokens are used only for the single run (clone/push).

## License

MIT
