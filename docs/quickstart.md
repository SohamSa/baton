# Quickstart

## Native

1. Create a virtual environment with Python 3.11 or newer and install `requirements.lock.txt`.
2. Set `PYTHONPATH` to `src`.
3. Run `python -m training_continuity.cli bootstrap`.
4. Start `python -m uvicorn training_continuity.asgi:app --host 127.0.0.1 --port 8000`.
5. In `apps/web`, run `npm install` and `npm run dev`. Open `http://127.0.0.1:5173`.
6. Sign in with the investigator line from `.local\dev-credentials.txt`.
7. Run the gradual-warning story. Sign in as the approver to approve the pending action.

`scripts\dev.ps1` performs steps 1–3 when `C:\Python314\python.exe` or `python` is on the machine.

## Docker Compose

```powershell
docker compose up --build
```

The API image expects `README.md` and the lockfile in the build context. Compose starts Postgres 16 and the API. Create users with `DATABASE_URL=postgresql+psycopg://tc:tc@127.0.0.1:5432/training_continuity` and the bootstrap command. This Compose path was not executed in the last recorded verification.

## Troubleshooting

- `no such table: users`: the process is using a new SQLite file. Run bootstrap against the same `DATABASE_URL`.
- Frontend 401: the token secret changed. Sign in again.
- Story remains queued: confirm the ASGI app is the one listening, not a factory that never started the thread.
- Fan speed empty on `northspan-n8`: that profile does not report fans. The value is unsupported, not zero.
- Port 5432 already in use: stop the other Postgres or change the Compose port. Do not point this app at an unrelated database without checking the name `training_continuity`.
