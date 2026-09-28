# Data model

## Storage

| Data | Store | Why |
| --- | --- | --- |
| Sites, jobs, checkpoints, incidents, users, actions, audit, outbox, runs | PostgreSQL in Compose, SQLite for local tests | Transactional state and approvals |
| High-frequency observations | Partitioned Parquet | Avoid putting every sample in the operational tables |
| Latent fault records | `latent_truth_events` and the evaluator JSON column | Separate from operator JSON |

The SQLAlchemy models in `persistence/orm.py` are the operational schema used by `create_all`. Alembic currently migrates a smaller example (`sites`, `incidents`, `users`) and adds `abstain_reason`. Treat that as a schema-evolution test, not as the full production migration set.

## Time

Each observation has an event step and an availability step. Features and hypotheses keep rows whose availability step is at or before the decision step. A later repair or label cannot enter an earlier decision.

Topology is stored as rank-assignment intervals in the simulator world, not by overwriting a single current device.

## Catalog

`catalog/dictionary.py` is the machine-readable dictionary. `GET /api/v1/catalog` returns it. Counts from the current builder:

- 349 unique concepts
- 2 aliases (`gpu_util_ratio`, `board_power_w`)
- 80 window aggregations
- 431 catalog rows

Unique concepts by role: observed 140, audit 113, control input 50, derived 34, latent truth 6, training label 6.

Window aggregations are repeated statistics over the same signals. They are not extra sensors. Many catalog fields are logical dataset columns rather than PostgreSQL columns.

## Entities

Relational tables cover sites, zones, racks, hosts, hardware profiles, accelerators, power domains, storage, jobs, attempts, rank assignments, checkpoints, incidents, evidence, hypotheses, actions, approvals, users, audit events, outbox, experiments, model artifacts, resource ledger, latent truth, spares, and runs. Cooling domains, fabric links, and telemetry series are represented in the simulator world and the catalog. They are not all expanded into separate PostgreSQL tables in this version.

Primary keys are strings. Foreign keys on SQLite are enabled with `PRAGMA foreign_keys=ON`. Units and null behavior are on each `FieldSpec`: unsupported fan speed on `northspan-n8` is null, and a null is not a zero.
