# Operator runbook

Roles are stored on the user row and carried in a signed token: viewer, investigator, approver, administrator.

| Action | Roles |
| --- | --- |
| Read health, adapters, metrics | Unauthenticated |
| Read stories, runs, catalog, models, monitoring, audit | Any signed-in role |
| Start a story | Investigator, approver, administrator |
| Approve or reject | Approver, administrator |
| Read latent truth | Administrator |

Bootstrap:

```powershell
$env:PYTHONPATH = "src"
.\.venv\Scripts\python.exe -m baton.cli bootstrap
```

Passwords are written to `.local\dev-credentials.txt`. Rotate them by deleting the users or using a fresh database file. Do not copy that file into the repository.

High-impact actions include pause, quarantine, spare allocation, restart, reconfiguration, return-to-service, checkpoint request, and placement stop. Rejecting an action records a cancelled transition. An expired or stale precondition hash fails closed.

Audit rows are append-only in application behavior. They live in a normal database table. That is not tamper-proof storage.

If a story stays `queued`, the API process was started without the outbox thread. Use `baton.asgi:app`, which sets `sync_worker=False` and starts the worker.
