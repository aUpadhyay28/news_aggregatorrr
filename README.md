# AI Curator Platform

This repository is now organized as a single product with a clear split between backend, frontend, and legacy experiments.

## Folder Structure

```text
eeeettttt/
  backend/   Python API, scraping pipeline, database, digest generation
  docs/      setup and run instructions
  frontend/  React/Vite user interface
  legacy/    older prototype files kept for reference only
  scripts/   small PowerShell helpers for common run commands
```

## What Runs Where

- `backend/`
  - FastAPI app
  - scraping + digest pipeline
  - SQLite database by default
- `frontend/`
  - Vite development server
  - production build served by the backend after `npm run build`
- `legacy/`
  - old standalone prototype, not part of the active app

## Recommended Ways To Run

### Fastest Single Command

From the repo root:

```powershell
.\run-app.ps1
```

What it does:

- creates `backend/.env` from `backend/.env.example` if missing
- installs backend dependencies if needed
- installs frontend dependencies if needed
- builds the frontend
- initializes the backend database
- tries a quick news refresh before startup
- starts the backend on `http://127.0.0.1:8000`
- lets the API auto-fetch news on the first empty feed load

### Option 1: One app through the backend

Use this when you want the backend API and the built frontend served together from `http://127.0.0.1:8000`.

1. Install backend dependencies.
2. Build the frontend.
3. Start the backend server.

Detailed steps are in [docs/RUNNING.md](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/docs/RUNNING.md).

Helper scripts:

- [run-app.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/run-app.ps1)
- [scripts/start-backend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/start-backend.ps1)
- [scripts/start-frontend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/start-frontend.ps1)
- [scripts/build-frontend.ps1](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/scripts/build-frontend.ps1)

### Option 2: Frontend dev mode + backend API

Use this when you want hot reload while editing the React app.

1. Start the backend server.
2. Start the frontend Vite server.
3. Open the Vite URL, usually `http://127.0.0.1:5173`.

Detailed steps are in [docs/RUNNING.md](c:/Users/Dhwanit%20Shah/OneDrive/Desktop/eeeettttt/docs/RUNNING.md).
