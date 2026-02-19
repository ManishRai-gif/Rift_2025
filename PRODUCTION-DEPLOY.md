# Production deployment – Ripple DevOps

One backend (Fly.io) + one frontend (Netlify or Vercel). **Never commit API keys**; set them only in the host’s dashboard or CLI.

---

## Part 1: Backend on Fly.io

### 1. Install Fly CLI and log in

```bash
brew install flyctl
fly auth login
```

### 2. Deploy the backend

```bash
cd Rippledevop/backend
fly launch
```

- **App name:** e.g. `ripple-devops-api` (must be unique on Fly).
- **Region:** pick one (e.g. `iad`).
- **PostgreSQL / Redis:** No.
- **Deploy now?** Yes.

### 3. Set production secrets (required)

Set your **Gemini API key** (and optional GitHub token) as Fly secrets. Run these locally; the values are not stored in the repo.

```bash
cd Rippledevop/backend
fly secrets set GEMINI_API_KEY='YOUR_GEMINI_API_KEY'
```

Optional:

```bash
fly secrets set GITHUB_TOKEN='your_github_pat'
fly secrets set RETRY_LIMIT=5
```

### 4. Get your backend URL

```bash
fly open
```

Or in the Fly dashboard: **https://[your-app-name].fly.dev**  
Example: `https://ripple-devops-api.fly.dev`

Copy this URL; you’ll use it as the frontend’s API base.

---

## Part 2: Frontend on Netlify or Vercel

### Netlify

1. **Add new site** → **Import from Git** → connect repo.
2. **Build settings:**
   - **Base directory:** `Rippledevop/frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. **Site settings** → **Environment variables** → **Add**:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://[your-fly-app-name].fly.dev` (your backend URL from Part 1, no trailing slash)
4. **Deploy** (or **Trigger deploy** after saving env).

### Vercel

1. **Add New** → **Project** → import repo.
2. **Configure:**
   - **Root Directory:** `Rippledevop/frontend`
   - **Build:** `npm run build`, **Output:** `dist`
3. **Environment Variables:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://[your-fly-app-name].fly.dev`
4. **Deploy**.

---

## Checklist

- [ ] Backend deployed on Fly.io
- [ ] `GEMINI_API_KEY` set with `fly secrets set` (never in code)
- [ ] Backend URL works: open `https://[app].fly.dev/health` → `{"status":"ok"}`
- [ ] Frontend deployed on Netlify or Vercel
- [ ] `VITE_API_URL` set to backend URL (no trailing slash)
- [ ] Frontend redeployed after adding `VITE_API_URL`

---

## Security

- **Do not** put `GEMINI_API_KEY` or `GITHUB_TOKEN` in any file in the repo.
- Use **Fly secrets** for backend keys and **Netlify/Vercel env vars** for `VITE_API_URL` only.
- `.env` is in `.gitignore`; keep real keys in `.env` only for local dev and never commit them.
