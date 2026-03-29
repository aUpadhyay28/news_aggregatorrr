$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$envExample = Join-Path $backend ".env.example"
$envFile = Join-Path $backend ".env"

Write-Host ""
Write-Host "== The Curator: unified startup ==" -ForegroundColor Cyan

if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
    Copy-Item -LiteralPath $envExample -Destination $envFile
    Write-Host "Created backend\.env from backend\.env.example" -ForegroundColor Yellow
    Write-Host "Add OPENAI_API_KEY later if you want better chat/digests." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking backend dependencies..." -ForegroundColor Cyan
Set-Location $backend
python -c "import fastapi, feedparser, sqlalchemy, uvicorn" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    python -m pip install -e .
}

Write-Host ""
Write-Host "Checking frontend dependencies..." -ForegroundColor Cyan
Set-Location $frontend
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build

Write-Host ""
Write-Host "Preparing backend database..." -ForegroundColor Cyan
Set-Location $backend
python -c "from app.database.models import Base; from app.database.connection import engine; Base.metadata.create_all(bind=engine)"

Write-Host ""
Write-Host "Trying a quick news refresh so the feed is not empty..." -ForegroundColor Cyan
try {
    python -c "from app.services.pipeline_service import refresh_news_pipeline; import json; print(json.dumps(refresh_news_pipeline(hours=24, mode='quick'), indent=2))"
} catch {
    Write-Host "Quick refresh did not complete. The app will still start, and the feed can refresh from the UI/API." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting app at http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "If the feed is still empty, open Feed and press Refresh." -ForegroundColor Green

Set-Location $backend
python server.py
