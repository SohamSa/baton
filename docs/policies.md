# Policies and accounting

## Policies

| Name | Behavior |
| --- | --- |
| reactive | Periodic checkpoints and restart after a heartbeat timeout |
| static_threshold | Quarantine when reported temperature reaches 60 C |
| anomaly | Respond to a robust residual |
| risk_aware | Extra checkpoint when the residual and checkpoint age justify it |
| capability_aware | Shorter timeout; reconfigure only when the runtime allows it |
| combined | Quality gate, abstain on a workload shift, checkpoint on cooling, no thermal quarantine |
| force_reconfigure | Asks for a membership change even when the runtime rejects it |

Automated runs store `actor_kind=automated_policy`. Manual high-impact actions wait for an approver. Preconditions are hashed and rechecked. A second in-flight action on the same scope conflicts. A worker that sees `effect_applied` does not repeat the effect.

`compare_policies` reruns the world with the same fault schedule. Recomputation avoided is not added on top of the useful-progress delta.

The static-threshold policy on the healthy workload story is a negative result: it quarantines a busy accelerator and finishes with less useful progress than reactive recovery.

## Accounting

Goodput is newly committed useful progress divided by elapsed wall seconds. Utilization during recomputation is not useful progress. Job interruption is counted once per job, not once per accelerator.

## Optional economics

`evaluate_economics` returns ROI only when the caller supplies rates, currency, cost basis, scope, horizon, a non-zero investment, a matching benefit basis, and a useful-progress delta. Otherwise ROI is null. The label is `assumption-based simulation estimate`. Negative net benefit is allowed. No default dollar rate is shipped.
