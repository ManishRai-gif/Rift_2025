# Ripple DevOps – Step-by-step hosting & connecting

Host the **backend** on Render and the **frontend** on Vercel or **Netlify**, then connect them with one environment variable.

**Backend URL:** `https://rift-2025.onrender.com`

---

## Part 1: Host the backend (Render)

### Step 1 – Push code to GitHub

1. Create a new repo on [GitHub](https://github.com/new) (e.g. `Rippledevop`).
2. In your project folder, run:
   ```bash
   cd /Users/manishrai/Desktop/Ripple/Rippledevop
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Rippledevop.git
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

### Step 2 – Create a Web Service on Render

1. Go to [Render](https://render.com) and sign in (GitHub is fine).
2. Click **Dashboard** → **New** → **Web Service**.
3. Connect your GitHub account if needed, then select the **Rippledevop** repository.
4. Use these settings:

   | Setting | Value |
   |--------|--------|
   | **Name** | `ripple-devops-backend` (or any name) |
   | **Region** | Choose nearest to you |
   | **Root Directory** | `backend` |
   | **Runtime** | **Node** |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |

5. Click **Advanced** and add **Environment Variables**:

   | Key | Value |
   |-----|--------|
   | `PORT` | `5000` |
   | `GEMINI_API_KEY` | Your [Gemini API key](https://aistudio.google.com/apikey) |
   | `GITHUB_TOKEN` | (optional) Default GitHub token |
   | `RETRY_LIMIT` | `5` |

6. Click **Create Web Service**.
7. Wait for the first deploy to finish. Render will show a URL like:
   ```text
   https://rift-2025.onrender.com
   ```
   (Or your own service URL if you named it differently.)
8. Copy this URL — this is your **backend URL**. You will use it in the frontend.

**Optional – Deploy with Docker**

- Leave **Root Directory** empty.
- Set **Dockerfile Path** to `docker/Dockerfile.backend`.
- Set **Docker Context** to `.` (repo root).
- Build and start commands are not needed when using Docker.

---

## Part 2: Host the frontend (Vercel)

### Step 3 – Create a project on Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import the same **Rippledevop** repository.
4. Before deploying, set:

   | Setting | Value |
   |--------|--------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `frontend` → click **Edit** and set to `frontend` |
   | **Build Command** | `npm run build` (default) |
   | **Output Directory** | `dist` (default) |

### Step 4 – Connect frontend to backend

1. In the same Vercel project setup, open **Environment Variables**.
2. Add:

   | Name | Value |
   |-----|--------|
   | `VITE_API_URL` | Your Render backend URL, e.g. `https://rift-2025.onrender.com` |

   Do **not** add a trailing slash (use `https://...onrender.com`, not `https://...onrender.com/`).

3. Click **Deploy**.
4. When the build finishes, Vercel will show a URL like:
   ```text
   https://rippledevop.vercel.app
   ```

That URL is your **live app**. The frontend will call the backend automatically using `VITE_API_URL`.

---

## Part 2b: Host the frontend (Netlify)

Use this if you prefer Netlify or have exhausted Vercel.

### Step 1 – Add Netlify config (already in repo)

The repo has `frontend/netlify.toml` with build command and publish directory. No change needed if you deploy with **Base directory** = `frontend`.

### Step 2 – Create a site on Netlify

1. Go to [Netlify](https://www.netlify.com) and sign in (e.g. with GitHub).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and select the **Rippledevop** repository.
4. Configure the build:

   | Setting | Value |
   |--------|--------|
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `dist` |

   (If `frontend/netlify.toml` exists, Netlify may pre-fill these.)

5. **Environment variables** – click **Add environment variables** / **New variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://rift-2025.onrender.com`  
   (no trailing slash)

6. Click **Deploy site** (or **Deploy Rippledevop**).
7. When the build finishes, Netlify will show a URL like:
   ```text
   https://random-name-12345.netlify.app
   ```

That URL is your **live app**. The frontend will call the backend using `VITE_API_URL`.

---

## Part 3: How backend and frontend are connected

1. **Build time**
   - Vite replaces `import.meta.env.VITE_API_URL` with the value of `VITE_API_URL` you set on Vercel or Netlify.
   - So in production the frontend always uses your Render backend URL.

2. **Runtime**
   - User opens the frontend URL (e.g. Vercel or Netlify).
   - When they click **Run Agent**, the frontend sends `POST` to `VITE_API_URL + '/api/run-agent'`, i.e. your Render backend.

3. **CORS**
   - The backend uses `app.use(cors())`, so browsers allow requests from your Vercel domain to Render.

---

## Checklist

- [ ] Repo pushed to GitHub
- [ ] Render Web Service created (Root: `backend`, Node, env vars set)
- [ ] Backend URL copied (e.g. `https://rift-2025.onrender.com`)
- [ ] Frontend on **Vercel** or **Netlify** (Root/Base directory: `frontend`)
- [ ] `VITE_API_URL` set to the backend URL
- [ ] Frontend deployed; test **Run Agent** from the live URL

---

## Troubleshooting

### Render URL “just loading” or blank

1. **Use the frontend URL for the app**  
   The Render URL (`https://rift-2025.onrender.com`) is the **API only**. It does not serve the Ripple DevOps UI. Open your **Netlify or Vercel** frontend URL to use the app. The frontend will call the Render API when you click “Run Agent”.

2. **Cold start (free tier)**  
   On the free tier, Render spins down the service after ~15 min of no traffic. The **first** request after that can take **30–60 seconds** (sometimes up to 2 min). After that, the API responds quickly.  
   - Try opening `https://rift-2025.onrender.com` or `https://rift-2025.onrender.com/health` and wait 1–2 minutes once.  
   - If it then shows “Ripple DevOps API” or `{"status":"ok",...}`, the backend is fine. Use your **frontend** URL to run the agent.

3. **Check Render dashboard**  
   - **Service** → **Logs**: look for “Ripple DevOps backend listening on port …” and any crash/error.  
   - **Events**: confirm the last deploy succeeded.  
   - **Environment**: ensure `GEMINI_API_KEY` (and optional `GITHUB_TOKEN`) are set.

4. **Redeploy**  
   After fixing env or code: push to GitHub or use **Manual Deploy** on Render so the new version (e.g. root route) is live.

| Issue | What to do |
|-------|------------|
| "Network Error" or CORS | Ensure `VITE_API_URL` is exactly your Render URL (no trailing slash). Backend already has `cors()` enabled. |
| Backend 404 on Render | Confirm **Root Directory** is `backend` and **Start Command** is `node server.js`. |
| Frontend build fails (Vercel/Netlify) | Confirm **Root** / **Base directory** is `frontend` so `package.json` and `vite.config.js` are used. |
| Render free tier sleeps | First request after idle can take 30–60 s; wait once, then use the frontend URL. |
