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

The owner evidence update ran 77 tests. `test_advanced_rehearsals.py` covers six separate advanced mechanisms, nine challenge variants, observed-only policies, approval gates, unchanged faulty boards after chip swaps, invalid-progress/checkpoint rejection, sufficient replacement preflight, ledger conservation, and canonical parameter parity. API and browser-shim tests verify challenge handling and backend/browser parity.

Browser verification passed worksheet blank defaults, local persistence, Markdown/JSON exports, print notes, reset, rehearsal links, assumption disclosure, all 18 standard/challenge comparisons, visible negative outcomes, cinematic finale, mobile layout, and absence of page errors. The review network blocked the Pyodide CDN in Chromium; the exact Pyodide 0.29.0 package was served from a local cache for this check, without changing the committed runtime.

The connected-reading revision passed all 77 Python tests and both production builds. Browser checks followed all seven shared passages and confirmed immediate reading, hidden suite navigation, closed references, no eager engine requests, focus and scroll on continuation, notes/decision persistence, worksheet access, supporting-tool return context, owner-context selection, theme controls, mobile layout, and one actual challenge comparison with no page errors. Cached Pyodide 0.29.0 was used for the rehearsal because of review-network CDN restrictions. These checks do not measure whether readers find the story engaging.

The owner-directed rehearsal update passed 103 Python tests and both production builds. `test_owner_lab.py` covers bounded settings, immutable preset definitions, paired configuration identity, an interrupted save with older verified restore, blocked recovery without partial spare consumption, stale-evidence abstention, changing checkpoint collision timing, approval replay, observed-only decisions, and delivery-lag false-alarm prevention. API tests cover validation, outbox preservation, approval conditions, and operator truth separation. Browser-shim tests compare real Pydantic and browser-shim outputs for custom compound configurations.

Browser checks passed all four controls, scarce-capacity blocking, older-save recovery after an interrupted write, stale-evidence blocking, changed save collision timing, reusable-link reload, preset reset, approval using original inputs after next-run edits, invalid-link handling, and mobile layout without page errors. The exact cached Pyodide 0.29.0 package was used because the review network blocks that CDN in Chromium.

The guided-foundations update adds parity checks for the complete static catalog and essential field references, plus shared README foundation text. Browser checks passed basics -> essential data/full catalog -> story, search/role filters/empty states, source completeness, zero simulation-runtime requests, closed tool menus, retained chapter context, mobile layout, and no page errors.

Unified workspace verification: 105 Python tests and both frontend builds passed. Browser checks cover shared navigation, full catalog, contextual practical steps, chapter/path preservation across planning, review, rehearsal and reload, mobile layout, specialist menu reset, and page errors.
