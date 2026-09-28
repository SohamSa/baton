# TrainingContinuity

TrainingContinuity is a local, CPU-only research application for studying hardware-related disruption during distributed pre-training. It generates a synthetic cluster, separates hidden simulator state from the observations an operator can see, and compares recovery policies on paired virtual worlds.

The honest claim is narrow: this is a reproducible synthetic environment for studying how observable hardware evidence, checkpoint protection, and capability-aware recovery can preserve useful pre-training progress. It does not measure a real fleet, predict every failure, or report savings.

The deployment modeled here is a single organization. Physical GPU, fabric, and facility adapters are declared and disconnected.

## What you can run

- Eight guided stories, each executed by the simulation engine in manual or automated mode.
- Checkpoint eligibility checks that reject incomplete, corrupt, unreachable, or not-yet-verified saves.
- Strict synchronized jobs that stall when a required rank fails, and an explicit reconfigurable profile that may restart a smaller data-parallel membership from a verified checkpoint.
- Rule-based operational decisions. A trained logistic model is served for comparison and, on the checked synthetic holdout, does not beat the residual baseline, so it is not the default policy.
- Optional currency accounting that stays undefined until a complete user-supplied configuration is provided.

## Local setup (Windows)

Python 3.11 or newer is required. This workspace was verified with Python 3.14.4.

```powershell
cd C:\Users\Admin\Downloads\training-continuity
powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
$env:PYTHONPATH = "src"
.\.venv\Scripts\python.exe -m uvicorn training_continuity.asgi:app --host 127.0.0.1 --port 8000
```

In a second terminal:

```powershell
cd apps\web
npm install
npm run dev
```

`scripts\dev.ps1` writes fresh random passwords to `.local\dev-credentials.txt`. That file is gitignored. There is no published administrator password. Sign in with one of those accounts. A role chosen in the browser is not authentication.

Health check: `GET http://127.0.0.1:8000/api/v1/health`

Sample story: sign in as the investigator, open Stories, and run **Gradual warning, then a controlled recovery** in manual mode. An approver account must approve the high-impact action.

PostgreSQL is defined in `docker-compose.yml` (`postgres:16`). The verified local path uses SQLite. See `docs/quickstart.md`.

## Tests

```powershell
$env:PYTHONPATH = "src"
.\.venv\Scripts\python.exe -m pytest
cd apps\web
npm run build
```

## Layout

- `src/training_continuity`: domain, simulation, features, policies, accounting, API, persistence.
- `apps/web`: React interface. It renders and requests actions. It does not run a second simulator.
- `docs`: product, architecture, data, models, policies, and limits.
- `artifacts/model_report.json`: held-out comparison against the residual baseline.

Further reading starts at `docs/product.md` and `IMPLEMENTATION_STATUS.md`.
