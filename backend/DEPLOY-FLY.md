# Deploy backend to Fly.io (free tier)

## 1. Install Fly CLI

**macOS (Homebrew):**
```bash
brew install flyctl
```

**Or install script:**
```bash
curl -L https://fly.io/install.sh | sh
```

## 2. Log in

```bash
fly auth login
```
(Browser will open to sign in or sign up.)

## 3. Deploy from the backend folder

```bash
cd /path/to/Rippledevop/backend
fly launch
```

When prompted:
- **App name:** keep `ripple-devops-api` or choose another (e.g. `yourname-ripple-api`)
- **Region:** pick one close to you (e.g. `iad` for US East)
- **Add PostgreSQL?** No
- **Add Redis?** No
- **Deploy now?** Yes (or run `fly deploy` after setting secrets)

## 4. Set secrets (env vars)

```bash
fly secrets set GEMINI_API_KEY=your_gemini_key_here
```

Optional (for private repos and retries):
```bash
fly secrets set GITHUB_TOKEN=your_github_token
fly secrets set RETRY_LIMIT=5
```

## 5. Open your app

```bash
fly open
```

Or get the URL in the dashboard: **https://[your-app-name].fly.dev**

Use this URL as `VITE_API_URL` in your frontend (Netlify/Vercel/etc.).

## Redeploy after code changes

```bash
cd Rippledevop/backend
fly deploy
```

## Useful commands

- `fly status` — app status
- `fly logs` — live logs
- `fly secrets list` — list secrets (values are hidden)
- `fly open` — open app in browser
