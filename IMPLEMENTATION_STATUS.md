# Implementation status

Current verification: September 2026 Linux review. 105 Python tests passed; normal and public-demo production builds passed. This update adds explicit scenario assumptions, a persistent owner evidence worksheet, six distinct advanced synthetic mechanisms, and nine challenge variants. PostgreSQL, Docker, physical equipment, and empirical calibration remain untested. Earlier counts below are historical.

## Foundation

Independent Git repository for Baton. Toolchain is locked in `requirements.lock.txt`. SQLite schema is created from the SQLAlchemy models. Alembic revisions `0001` and `0002` demonstrate an additive `incidents.abstain_reason` column; they do not create every operational table. Health and Prometheus text endpoints exist. Organization mode is single-organization.

## Core world

Deterministic keyed random streams. Latent thermal state is separate from reported observations. Strict synchronization stalls a job when a required rank fails. Checkpoint lifecycle and restore eligibility are enforced. Resource-time fractions for each accelerator sum to one per step. Goodput uses newly committed useful progress over wall time.

## Decision path

Observable features, hypothesis ranking, incident grouping, manual approval, rejection, stale preconditions, and idempotent action effects are covered by tests. The React application calls the API. With `sync_worker=False` (the ASGI entry), story execution is queued on the transactional outbox and completed by a background thread. The test client uses the inline worker so existing request/response checks stay deterministic. A separate test holds the engine and checks that the HTTP response returns `queued` first.

## Rich data

Catalog counts from `catalog_counts()`: 405 unique concepts, 2 aliases, 80 window aggregations, 487 catalog rows. Roles include observed, derived, latent truth, training label, control input, and audit. Partitioned Parquet generation resumes from a manifest and can be read with DuckDB.

## Learned intelligence

`artifacts/model_report.json` records a scenario-hash split, train-only medians, and isotonic calibration when both classes exist in validation. Held-out average precision: model 0.335, residual baseline 0.415. `beats_baseline` is false. Operational default is `rule_based`. The oracle cannot be selected as a serving policy.

## Policy experiments

Paired policies share exogenous fault onsets. The healthy-workload story shows a static temperature quarantine that preserves less useful progress than reactive recovery. Currency accounting returns an undefined ROI when rates are absent, incomplete, zero, or incompatible.

## Product

Required views are present in `apps/web`. The overview is a live practice floor written for an owner who does not already know the vocabulary: the engine advances one step at a time, the chips in the job update on the page, and a serious action can be approved there. Each menu page carries a plain-language explanation. The Data catalog page (`/#/data`, menu label “Data catalog”) is filled by `catalog_atlas` in `src/baton/catalog/atlas.py` from the field list in `dictionary.py`: 58 tables, 431 columns, a short decision table, and buttons for 10, 20, 30, or all tables. Latent-truth and training-label columns stay off that short list. Automated mode compares two reactions on the same script. Return on investment is computed by `assumption_estimate` only after the caller supplies a complete accounting configuration. Blank fields and a zero investment leave it undefined. A computed figure is labeled an assumption-based simulation estimate. Presentation mode hides the score numbers. Hardware adapters render as unavailable. Eight rehearsals are defined in `simulation/stories.py` and executed by `run_scenario`, including one step at a time through `ScenarioRun`.

## Not verified here

- PostgreSQL and `docker compose` were not executed. `docker info` failed because the Docker Desktop engine pipe was not running.
- A clean clone on another machine was not performed.

## Verification recorded

- `python -m pytest`: 32 passed, one Starlette deprecation warning about `httpx` and `TestClient`.
- `npm run build` in `apps/web`: `tsc --noEmit` and Vite production build succeeded.
- Local browser, public-demo mode at `http://127.0.0.1:5173/baton/#/data`: the catalog showed 58 drawers and 431 columns, the decision table had 15 rows including `gpu_temp_c`, the 10 and 30 buttons changed the drawer count, and opening Buildings showed the `site_id` column. An earlier pass stepped the opening rehearsal, checked the other menu introductions, and confirmed an empty accounting form leaves return undefined.


## Owner journey update (September 2026)

The default dashboard entrance is now the owner's story. `/portfolio` retains the executive overview. `/journey/:chapter` provides a connected opening, five acts including a decision climax, and an epilogue across seven chapters. Builders, operators, and explorers share the narrative with different application prompts. All seventeen existing characters have evidence drawers, questions for the owner's team, and links to their rehearsals and supporting rooms. Those links carry chapter context back to the story. Advanced conceptual mechanisms are identified explicitly.

`content/owner-journey.json` supplies the dashboard and the README generated by `scripts/build_owner_readme.py`. The climax is a tabletop exercise with explained choices, not a compound engine simulation. The epilogue provides an action pack, printable questions, and browser-local notes. The story is readable before the engine loads; rehearsals load it on demand.

Verified in this Linux review workspace: 43 Python tests passed (one existing Starlette deprecation warning); frontend TypeScript checking and both normal and public-demo production builds passed. The existing large-bundle warning remains. The journey contract tests verify the complete character mapping, existing route targets, and README parity. No PostgreSQL, Docker, physical hardware, or real-fleet validation was added.

Browser verification passed: builder entrance, chapter navigation, character evidence expansion, rehearsal links with return context, both climax outcomes, notes surviving reload, print visibility, mobile layout without horizontal overflow, and no page errors. Verification used the local Vite public-demo preview. The browser inspection proxy required adjusted certificate handling for the existing Pyodide CDN.


## Distinct rehearsals and coherent owner rooms

- `silent_straggler`: observed per-rank latency slows new progress while the rank stays alive. `straggler_aware` requires a current usable save and a compatible spare for a coordinated rank replacement.
- `rack_thermal_shadow`: reduced local flow heats upper positions of one rack; another rack supplies the healthy comparison. `cooling_aware` preserves a usable save before a synthetic maintenance pause.
- `revolving_door`: premature restart of an unstable repaired rank causes relapse. `qualification_aware` waits for an isolated engine load test; a failed candidate stays quarantined and needs a compatible spare. Tests also cover a passing candidate and absent spare.

These are deliberate synthetic mechanisms, not calibrated hardware models. The fault parameters, thresholds, spatial geometry, and qualification errors are illustrative. Other advanced physical diagnoses remain conceptual.

The canonical character source now generates `src/baton/catalog/owner_metadata.py` as well as the README. Supporting rooms, scenario descriptions, and the executive Q&A use those same explanations. Unimplemented board repair, package certification, warranty submission, and lineage cordoning controls have been replaced with evidence questions and record inspection prompts. The short tour uses the same scope and assumptions.

One fictional physical plan is shared by the design, facility-map, power, and portfolio rooms. PUE is applied once. Financial inputs start blank and persist between rooms in the current browser; the Python economics engine computes the explicit one-year illustration. It values owner-assumed interruption and repeated work for the affected job, subtracts upfront and annual costs, and keeps negative results visible. No measured cash savings are asserted.

Current catalog: 58 logical tables; 397 unique concepts, 2 aliases, 80 window aggregations, 479 catalog rows. A catalog definition is not a promise that every field is physically measured or materialized.

## Owner evidence and advanced rehearsals

All 17 characters expose actual configuration values, rationale, simplifications, and sensitivities. The shared source generates the README and Python metadata. The worksheet starts blank, stores locally, and exports evidence requests and named follow-up owners; it does not score facility readiness. Package retries, lot-linked errors, persistent board faults, assembly strain, voltage validity, and power headroom have separate engine mechanisms. Challenge variants include unnecessary intervention, scarce spares, and stale evidence. Approval replay preserves the variant.

## Connected reading revision

The README and default dashboard now start with one stalled job and follow the same continuous investigation through seven passages. Terms are introduced in context. Suite navigation is hidden on reading routes, with optional tool access and one next passage. All scenario assumptions, fields, limits, and challenges remain in the generated `docs/story-reference.md` and closed dashboard evidence drawers. The final discussion remains a tabletop story rather than a new compound engine scenario.

## Owner-directed and compound rehearsals

Owner controls now use a shared Python whitelist and bounded validation. Effective inputs and configuration hashes persist through HTTP/outbox runs, browser execution, approval replay, and paired comparisons. Reusable URLs preserve overrides. Recovery Crossroads is the eighteenth engine-backed problem: delayed evidence, a warning, an interrupted save, two permanent failures, and compatible-capacity gates share one world. Observation delay, spare count, and save spacing independently alter the outcome. The compound policy reads observed snapshots and prevents permitted delivery lag from creating a false missing-heartbeat response.

## Guided foundations

The main entrance teaches basic concepts before introducing essential data and the complete in-page catalog. Definitions retain roles, units, missingness, purpose, and table relationships from the engine dictionary. Catalog learning uses a generated static definition export and does not start Pyodide. Existing story and supporting-tool routes remain available.

This foundations review passed 105 Python tests and both production builds. Browser checks confirmed the sequential learning flow and full catalog without engine startup.

- Unified owner workspace: the same Basics, Data, Story, Plan, Rehearse, Operations, and My review navigation appears on reading and practical pages. Specialist tools use one expandable menu. Chapter and build/operate context survive tool navigation and reload; story passages offer contextual practical steps.
