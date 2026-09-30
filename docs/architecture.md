# Architecture

One process owns inference, policy, provenance, and accounting. The browser calls versioned HTTP routes and renders the result.

```
apps/web  ->  FastAPI  ->  simulation engine, features, policies, ledger
                      ->  SQLite or PostgreSQL (runs, actions, audit, outbox)
                      ->  Parquet partitions for offline observations
```

`baton.asgi:app` starts a daemon thread that drains `outbox` rows. The request that starts a story inserts a queued run and returns HTTP 202. Tests that need an immediate body use `sync_worker=True`.

There is no Kafka broker. Do not describe one.

Adapters in `adapters/registry.py` implement telemetry, training control, checkpoints, scheduling, diagnostics, and maintenance against the simulator. `HardwareTelemetry` and `HardwareController` are unimplemented and `connected: false`.

Prometheus text at `/metrics` exports two low-cardinality gauges: `tc_up` and `tc_hardware_adapters_connected`. Per-device series stay in the run payload and Parquet files.
