# Running The Project

This guide assumes the repo root is:

`c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt`

## Current Structure

```text
backend/   Python API + scraping/digest pipeline
frontend/  React/Vite UI
legacy/    old prototype files only
```

## Prerequisites

Make sure these are installed:

1. Python 3.12+  
2. Node.js 18+  
3. npm  

You already have compatible versions in this environment:

1. Python `3.13.12`
2. Node `v22.14.0`

## First-Time Setup

## One Command Startup

From the repo root:

```powershell
.\run-app.ps1
```

This is the easiest path now.

It will:

1. create `backend/.env` from `backend/.env.example` if needed
2. install backend packages if missing
3. install frontend packages if missing
4. build the frontend
5. initialize the backend database
6. try a quick news refresh
7. start the app on `http://127.0.0.1:8000`

If the feed is empty, the backend now tries a `quick` refresh automatically on the first `/api/feed` request.

### 1. Open a terminal in the repo root

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt"
```

### 2. Install backend dependencies

```powershell
cd backend
python -m pip install -e .
```

What this does:

- installs FastAPI and the backend dependencies
- installs the scraping/digest pipeline packages
- makes the backend importable in editable mode

### 3. Build the frontend once

```powershell
cd "..\frontend"
npm install
npm run build
```

What this does:

- installs the React/Vite dependencies
- creates `frontend/dist`
- lets the backend serve the UI directly

## Shortcut Scripts

If you prefer, you can use these helper scripts from the repo root:

1. [scripts/start-backend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/start-backend.ps1)
2. [scripts/start-frontend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/start-frontend.ps1)
3. [scripts/build-frontend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/build-frontend.ps1)

## Run Option A: Single Product From Backend

This is the simplest way to run the combined app.

### 1. Start the backend server

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt\backend"
python server.py
```

### 2. Open the app

Open:

`http://127.0.0.1:8000`

### 3. What you should expect

- the backend serves the built frontend
- the health endpoint is available at `http://127.0.0.1:8000/api/health`
- the feed may be empty at first if the database has not been populated yet

### 4. Populate the feed

Use the Refresh button in the UI.

Or call the refresh API manually:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"hours":24,"mode":"quick"}' `
  http://127.0.0.1:8000/api/pipeline/refresh
```

Refresh modes:

1. `quick`  
   Runs the source scrapers only.
2. `enriched`  
   Runs scrapers plus transcript/markdown enrichment.
3. `full`  
   Runs scrapers, enrichment, and digest generation.

## Run Option B: Frontend Dev Mode + Backend API

Use this while editing the React app.

### Terminal 1: start backend

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt\backend"
python server.py
```

### Terminal 2: start frontend dev server

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt\frontend"
npm run dev
```

### Open the frontend

Open the URL shown by Vite, usually:

`http://127.0.0.1:5173`

Notes:

- Vite is already configured to proxy `/api` requests to `http://127.0.0.1:8000`
- hot reload works in this mode

## Database Notes

By default the backend uses SQLite:

`backend/ai_news_aggregator.db`

That means you do not need Postgres just to run the app locally.

If you want Postgres later, set these values in a `.env` file inside `backend/`:

```env
DB_BACKEND=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ai_news_aggregator
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Or provide:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Optional Environment Variables

The app runs without all of these, but some features get better when they are set.

Inside `backend/`, create a `.env` file if needed.

Useful values:

```env
OPENAI_API_KEY=
MY_EMAIL=
APP_PASSWORD=
DB_BACKEND=sqlite
DATABASE_URL=
AUTO_REFRESH_ON_EMPTY=true
```

Feature impact:

1. `OPENAI_API_KEY`
   Enables better chat and digest quality.
2. `MY_EMAIL` and `APP_PASSWORD`
   Needed only for email sending features.
3. database values
   Only needed if you want Postgres instead of SQLite.
4. `AUTO_REFRESH_ON_EMPTY`
   When `true`, the app will try to fetch news automatically if the feed is empty.

## Verification Commands

### Check backend health

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health
```

### Check feed endpoint

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/feed
```

### Rebuild frontend after UI changes

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt\frontend"
npm run build
```

## Common Issues

### The page loads but the feed is empty

That usually means the backend database is still empty.

Fix:

1. start the backend
2. open the Feed page once and wait for the first auto-refresh attempt
3. if you still see no content, trigger a refresh from the UI or API
4. reload the page

Manual refresh:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"hours":24,"mode":"quick"}' `
  http://127.0.0.1:8000/api/pipeline/refresh
```

If quick mode works, you can later try:

```powershell
Invoke-WebRequest `
  -UseBasicParsing `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"hours":24,"mode":"full"}' `
  http://127.0.0.1:8000/api/pipeline/refresh
```

Why this happens:

1. the UI only shows what exists in the local database
2. a fresh database starts empty
3. refresh pulls OpenAI, Anthropic, and YouTube items into that database

### `Frontend build not found`

Fix:

```powershell
cd "c:\Users\Dhwanit Shah\OneDrive\Desktop\eeeettttt\frontend"
npm run build
```

### The refresh request takes a long time

That is normal sometimes because it depends on external feeds, transcripts, and AI processing.

Try:

1. `quick` mode first
2. `enriched` after that
3. `full` only when you want digest generation too

### Chat works but sounds basic

Set `OPENAI_API_KEY` in `backend/.env` and restart the backend.

## Active Entry Points

- Backend server: [backend/server.py](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/backend/server.py)
- Backend API app: [backend/app/api.py](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/backend/app/api.py)
- Frontend app root: [frontend/App.jsx](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/frontend/App.jsx)
- Frontend entry: [frontend/main.jsx](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/frontend/main.jsx)
