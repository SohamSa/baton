# Feature groups

`features/compute.py` and `features/assess.py` build the values policies can see.

| Group | Examples | Rule |
| --- | --- | --- |
| Thermal | Reported temperature, residual against nominal resistance, EWMA | Expected temperature uses observed power, not the hidden resistance |
| Cooling | Fan or pump only when the hardware profile allows it; shared-domain residual counts | `northspan-n8` fan speed stays null |
| Power | Draw, limit ratio, shared-domain limit drops | A limit change on one feed is not copied onto the other |
| Compute | Utilization, phase | Peer groups require the same family and the same phase |
| Memory | ECC fields only under declared support | Unsupported is null |
| Links | Retransmits and collective wait | Rates use the delta of counters |
| Host | Heartbeat gap | A missing heartbeat is not by itself a silicon failure |
| Training | Progress, rank skew, attempt | Credit uses surviving data-parallel groups |
| Checkpoint | Age of the newest verified save, shard completeness | In-flight saves do not reset the age |
| Maintenance | Profile family, spare compatibility | Rack membership alone does not define a peer |
| Data quality | Freshness, support count, collector lag | Stale series abstain |

Rolling windows require at least three observations. A counter that decreases is treated as a reset, and the rate uses the new value. Cumulative counters are not fed to models as raw totals.

The served model uses five of these fields. The rest remain available for rules, ablations, and the catalog.
