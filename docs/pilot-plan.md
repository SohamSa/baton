# Future read-only pilot

A later pilot, not part of this build, would connect a read-only telemetry adapter in a shadow tenancy.

1. Keep hardware control adapters disconnected.
2. Ingest observations with event time, ingestion time, and availability time.
3. Run the same feature code and the rule policy in shadow mode. Record decisions. Do not execute them.
4. Compare shadow decisions with what operators actually did, using labels that were not available at decision time only in the evaluator.
5. Publish detection and false-alarm rates with the site's own denominators.
6. Only after that review, and only with a separate authorization, consider a control adapter. Checkpoint and restart calls still require a person for high-impact actions.

Public demonstration, if it is ever deployed, must use per-session synthetic state or a read-only synthetic dataset. It must not share an administrator credential.
