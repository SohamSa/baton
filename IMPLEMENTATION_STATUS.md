# Implementation status

Status reflects the local workspace after the Python suite and the frontend production build. PostgreSQL was not part of that run.

## Foundation

Independent Git repository at `C:\Users\Admin\Downloads\training-continuity`. Toolchain is locked in `requirements.lock.txt`. SQLite schema is created from the SQLAlchemy models. Alembic revisions `0001` and `0002` demonstrate an additive `incidents.abstain_reason` column; they do not create every operational table. Health and Prometheus text endpoints exist. Organization mode is single-organization.

## Core world

Deterministic keyed random streams. Latent thermal state is separate from reported observations. Strict synchronization stalls a job when a required rank fails. Checkpoint lifecycle and restore eligibility are enforced. Resource-time fractions for each accelerator sum to one per step. Goodput uses newly committed useful progress over wall time.

## Decision path

Observable features, hypothesis ranking, incident grouping, manual approval, rejection, stale preconditions, and idempotent action effects are covered by tests. The React application calls the API. With `sync_worker=False` (the ASGI entry), story execution is queued on the transactional outbox and completed by a background thread. The test client uses the inline worker so existing request/response checks stay deterministic. A separate test holds the engine and checks that the HTTP response returns `queued` first.

## Rich data

Catalog counts from `catalog_counts()`: 349 unique concepts, 2 aliases, 80 window aggregations, 431 catalog rows. Roles include observed, derived, latent truth, training label, control input, and audit. Partitioned Parquet generation resumes from a manifest and can be read with DuckDB.

## Learned intelligence

`artifacts/model_report.json` records a scenario-hash split, train-only medians, and isotonic calibration when both classes exist in validation. Held-out average precision: model 0.335, residual baseline 0.415. `beats_baseline` is false. Operational default is `rule_based`. The oracle cannot be selected as a serving policy.

## Policy experiments

Paired policies share exogenous fault onsets. The healthy-workload story shows a static temperature quarantine that preserves less useful progress than reactive recovery. Currency accounting returns an undefined ROI when rates are absent, incomplete, zero, or incompatible.

## Product

Required views are present in `apps/web`. The overview is a live operations desk: the engine advances one step at a time, the placed accelerators update on the page, and a high-impact action can be approved there. Automated mode compares policies on the same faults. Return on investment is computed by `assumption_estimate` only after the caller supplies a complete accounting configuration. Blank fields and a zero investment leave it undefined. A computed figure is labeled an assumption-based simulation estimate. Presentation mode hides benchmark numbers. Hardware adapters render as unavailable. Eight stories are defined in `simulation/stories.py` and executed by `run_scenario`, including one step at a time through `ScenarioRun`.

## Not verified here

- PostgreSQL and `docker compose` were not executed. `docker info` failed because the Docker Desktop engine pipe was not running.
- A clean clone on another machine was not performed.

## Verification recorded

- `python -m pytest`: 31 passed, one Starlette deprecation warning about `httpx` and `TestClient`.
- `npm run build` in `apps/web`: `tsc --noEmit` and Vite production build succeeded.
- Local browser, public-demo mode at `http://127.0.0.1:5173/training-continuity/`: the opening story stepped to a checkpoint approval, approving it produced a verified save and a later decision, the healthy-workload story finished at step 40 with hypothesis workload shift, an empty accounting form left return undefined, and a completed form returned an assumption-based simulation estimate.
