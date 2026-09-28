$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
New-Item -ItemType Directory -Force -Path .local | Out-Null
if (-not (Test-Path .venv\Scripts\python.exe)) {
  $python = if (Test-Path C:\Python314\python.exe) { "C:\Python314\python.exe" } else { "python" }
  & $python -m venv .venv
}
& .\.venv\Scripts\python.exe -m pip install -r requirements.lock.txt
$env:PYTHONPATH = "src"
& .\.venv\Scripts\python.exe -m training_continuity.cli bootstrap
Write-Host "API: .\.venv\Scripts\python.exe -m uvicorn training_continuity.asgi:app --host 127.0.0.1 --port 8000"
Write-Host "Web: cd apps\web; npm install; npm run dev"
