# Validation

Tests live in `tests/` and are meant to fail when an invariant breaks.

| Test module | What it can disprove |
| --- | --- |
| `test_core.py` | Determinism, cooling direction without requiring every sample to rise, null versus zero, counter reset, story outcomes, shared-power grouping, checkpoint fallback, unsupported reconfigure, stale abstention, job isolation, leakage, approval edges, worker restart, ledger conservation, undefined ROI, hypothesis changes |
| `test_api.py` | Role boundaries, evaluator separation, presentation stripping, approval audit, disconnected hardware adapter, queued response before a blocked engine finishes |
| `test_schema.py` | Foreign-key rejection and the Alembic additive column |
| `test_train.py` | Scenario-level split and serve-time use of train medians |
| `test_generation.py` | Parquet resume and a DuckDB count |

The frontend production build typechecks `apps/web`. A browser walkthrough of the eight stories was not executed in the agent session that produced this file.
