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


`test_owner_journey.py` checks that all engine stories appear exactly once in the owner cast, chapter/tool links target existing routes, the climax contains explained alternatives, and the README matches the shared narrative source. The September owner-journey review ran the full suite: 43 passed. Earlier session counts above are historical.


The follow-up review ran 52 tests. `test_distinct_rehearsals.py` checks alive-but-slow progress, checkpoint/spare gates, rack-local heating and an unaffected comparison rack, failed and passed qualification, relapse, absent spare, manual approval, hidden-truth independence, and ledger conservation. `test_owner_journey.py` also verifies generated Python metadata and public narrative parity.

Both frontend builds passed. Browser checks executed all three comparisons using the public Python WebAssembly engine, visited every supporting owner room, confirmed shared planning assumptions and single PUE application, blank financial defaults, a negative one-year illustration, persistence, mobile layout, and no page errors. The original cinematic journey checks also passed. These checks validate software behavior, not the physical realism of the invented parameters.
