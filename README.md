# TCAP — TCET Capture Website

Official TCAP media team site with a scroll-driven 3D portfolio, gallery links, and an admin dashboard.

---

## What you need first

| Requirement | Notes |
|-------------|--------|
| **Node.js 18 or 20 (LTS)** | Check with `node -v`. Download from [nodejs.org](https://nodejs.org) if missing. |
| **npm** | Comes with Node. Check with `npm -v`. |
| **Git** | To clone the repo. |
| **Chrome or Edge (recommended)** | Best for the 3D portfolio (WebGL). |

> **Windows tip:** Avoid running the project from a deeply synced OneDrive folder if installs fail or files go missing. Cloning to something like `C:\Projects\TCAP-Website` is more reliable.

---

## Quick start (view the site only)

Use this if you only want to open the homepage and gallery — **no admin login needed**.

```bash
# 1. Clone the repo
git clone https://github.com/EntroproxTheOne/TCAP-Website.git
cd TCAP-Website

# 2. Install dependencies (root + frontend + backend)
npm run install-all

# 3. Start the frontend
cd frontend
npm start
```

The site opens at **http://localhost:3000**

| Page | URL |
|------|-----|
| 3D Portfolio (home) | http://localhost:3000/ |
| Gallery / albums | http://localhost:3000/gallery |
| Admin dashboard | http://localhost:3000/admin |

---

## Full setup (frontend + backend + admin)

Admin features (events, teams, faculty) need **Firebase** and a running **backend API**.

### 1. Install everything

```bash
npm run install-all
```

### 2. Create environment files

Run the setup helper from the project root:

```bash
node setup-env.js
```

It creates:

- `frontend/.env` — Firebase web config + API URL  
- `backend/.env` — Firebase Admin credentials + server port  

**Where to get Firebase values**

- **Frontend:** Firebase Console → Project Settings → Your apps → Web app  
- **Backend:** Firebase Console → Project Settings → Service accounts → Generate new private key  

> Never commit `.env` files or share them publicly.

**Manual option** — create the files yourself:

`frontend/.env`

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5000
```

`backend/.env`

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
PORT=5000
```

For `FIREBASE_PRIVATE_KEY`, keep the quotes and use `\n` for line breaks (the setup script does this for you).

### 3. Run both servers

From the project root:

```bash
npm run dev
```

- Frontend → http://localhost:3000  
- Backend API → http://localhost:5000  
- Health check → http://localhost:5000/api/health  

---

## Production build

```bash
cd frontend
npm run build
```

Output goes to `frontend/build/`. Serve that folder with any static host (Netlify, Vercel, Firebase Hosting, etc.).

The backend must be deployed separately if you use the admin panel.

---

## Deploy to Vercel (recommended for the live site)

The **frontend** (3D portfolio + gallery) is set up for Vercel. The Express **backend** is not — host that separately (Railway, Render, etc.) if you need admin.

### Option A — Connect GitHub (easiest, auto-deploys on push)

1. Push this repo to GitHub (already at `EntroproxTheOne/TCAP-Website`).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. **Import** the `TCAP-Website` repository.
4. Configure the project:

   | Setting | Value |
   |---------|--------|
   | **Root Directory** | `frontend` ← important |
   | **Framework Preset** | Create React App (auto-detected) |
   | **Build Command** | `CI=false GENERATE_SOURCEMAP=false npm run build` |
   | **Output Directory** | `build` |
   | **Install Command** | `npm install` |

5. Add **Environment Variables** (Settings → Environment Variables). Copy names from `frontend/.env.example`:

   | Variable | Required for |
   |----------|----------------|
   | `REACT_APP_FIREBASE_API_KEY` | Login / admin |
   | `REACT_APP_FIREBASE_AUTH_DOMAIN` | Login / admin |
   | `REACT_APP_FIREBASE_PROJECT_ID` | Login / admin |
   | `REACT_APP_FIREBASE_STORAGE_BUCKET` | Login / admin |
   | `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Login / admin |
   | `REACT_APP_FIREBASE_APP_ID` | Login / admin |
   | `REACT_APP_API_URL` | Admin API (your backend URL) |

   > Portfolio + gallery work **without** these vars (Firebase defaults are baked in). Set them for production admin/login.

6. Click **Deploy**. Vercel builds and gives you a URL like `https://tcap-website.vercel.app`.

Every push to `main` redeploys automatically.

### Option B — Deploy from your computer (CLI)

```bash
# One-time: install Vercel CLI and log in
npm i -g vercel
vercel login

# From project root
npm run deploy:vercel
```

Or from the frontend folder:

```bash
cd frontend
npx vercel --prod
```

Follow the prompts. Set **Root Directory** to `frontend` if asked.

### What's already configured

- `frontend/vercel.json` — filesystem-first routing for assets, SPA fallback, and Vercel-safe CRA build env  
- `frontend/.env.example` — list of env vars for Vercel dashboard  
- `.vercelignore` — skips backend/local assets from uploads  
- `npm run deploy:vercel` — quick production deploy script  

### Vercel troubleshooting

| Problem | Fix |
|---------|-----|
| **404 on `/gallery` or refresh** | Root Directory must be `frontend` (so `vercel.json` is picked up). |
| **`Treating warnings as errors because process.env.CI = true`** | Use `CI=false GENERATE_SOURCEMAP=false npm run build` as the Vercel Build Command. |
| **Invalid `source` pattern in `vercel.json`** | Pull the latest code. The config avoids custom regex header rules. |
| **`Could not load /assets/...glb: JSON.parse unexpected character`** | The `.glb` was being served as `index.html`. Pull latest code so Vercel uses filesystem-first routing before React fallback. |
| **Build fails on Vercel** | Check build logs. Run `cd frontend && npm run build` locally first. |
| **3D models missing** | GLB files must be in `frontend/public/assets/` and committed to Git. |
| **Admin broken on live site** | Deploy backend elsewhere; set `REACT_APP_API_URL` in Vercel to that URL. |
| **Build too large** | `office+worker+3d+model.glb` is ~59 MB. Vercel allows it, but first deploy may be slow. |

---

## Common errors & fixes

### `npm: command not found` or `node: command not found`

Node.js is not installed or not on your PATH. Install Node 18/20 LTS and restart the terminal.

---

### `npm run install-all` fails / `ENOENT` / permission errors

1. Delete `node_modules` in the root, `frontend`, and `backend`.  
2. Run the terminal **as a normal user** (not always needed, but avoid odd permission setups).  
3. Run again from the project root:

```bash
npm run install-all
```

If one folder fails, install it directly:

```bash
cd frontend && npm install
cd ../backend && npm install
```

---

### `Something is already running on port 3000`

Another app is using port 3000. Either stop that app, or start on a different port:

**Windows (PowerShell)**

```powershell
$env:PORT=3001; npm start
```

**Mac / Linux**

```bash
PORT=3001 npm start
```

(Run that inside the `frontend` folder.)

---

### `EADDRINUSE` on port 5000 (backend)

Change the port in `backend/.env`:

```env
PORT=5001
```

And update `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5001
```

Restart both servers.

---

### Blank white screen / 3D scene not loading

1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac).  
2. Use Chrome or Edge — Safari/Firefox can be slower with heavy 3D.  
3. Check the browser console (`F12` → Console) for errors.  
4. Confirm GLB files exist in `frontend/public/assets/`:
   - `photographer+3d+model.glb`
   - `photographer+silhouette+3d+model.glb`
   - `office+worker+3d+model.glb`
   - `low_poly_male_base.glb`  
5. Wait for the loading bar to finish — large 3D models take time on first load.

---

### `Error initializing Firebase Admin` (backend)

The backend `.env` is missing or wrong.

1. Run `node setup-env.js` again, or fix `backend/.env` manually.  
2. Make sure `FIREBASE_PRIVATE_KEY` is wrapped in quotes and uses `\n` between lines.  
3. Restart the backend: `cd backend && npm run dev`

The **frontend portfolio and gallery still work** without a working backend; only admin/API features break.

---

### Admin login does not work

1. Backend must be running (`npm run dev` or `cd backend && npm run dev`).  
2. `frontend/.env` must have correct Firebase web keys.  
3. The user must exist in **Firebase Authentication**.  
4. Admin role must be set in **Firestore** (`users` collection) — ask whoever manages Firebase.

---

### `Module not found` after pulling new code

```bash
npm run install-all
```

Then restart the dev server.

---

### Site is slow or laggy on mobile / older laptop

The 3D portfolio is heavy. Use a modern browser, close other tabs, and prefer Wi‑Fi over slow mobile data for the first load.

---

## Project structure

```
TCAP-Website/
├── frontend/          React app (3D portfolio, gallery, admin UI)
│   ├── vercel.json    Vercel deploy config
│   ├── public/assets/ 3D models, logos, team placeholders
│   └── src/
├── backend/           Express API (Firebase Admin)
├── setup-env.js       Helper to create .env files
└── package.json       Root scripts (install-all, dev)
```

---

## Main commands (cheat sheet)

| Command | What it does |
|---------|----------------|
| `npm run install-all` | Install root + frontend + backend dependencies |
| `npm run dev` | Run frontend + backend together |
| `npm run client` | Frontend only (port 3000) |
| `npm run server` | Backend only (port 5000) |
| `cd frontend && npm run build` | Production build |
| `npm run deploy:vercel` | Deploy frontend to Vercel (CLI) |

---

## Need help?

When reporting an error, include:

1. Your OS (Windows / Mac / Linux)  
2. Output of `node -v` and `npm -v`  
3. The **exact command** you ran  
4. The **full error message** from the terminal or browser console (`F12`)

That makes it much faster to fix.

---

**TCAP — The Official Media Coverage Team of TCET**
