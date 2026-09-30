# Evidence companion

[Return to the investigation](../README.md) · [Open the dashboard](https://sohamsa.github.io/baton/)

Open this reference when you want to inspect a particular problem. These are author-selected teaching inputs, not measured device specifications or predictions for a real facility.

## Find a problem

**The alarm and the expensive mistake**

- [The Feverish Athlete](#gradual_warning)
- [The Sudden Ghost](#abrupt_failure)
- [The Hard-Working Chef](#healthy_workload_shift)
- [The Overzealous Referee](#harmful_preventive)

**The replacement that changed nothing**

- [The Kitchen Circuit Breaker](#shared_infrastructure)
- [The Contract with Missing Pages](#incomplete_checkpoint)
- [The Missing Choir Singer](#unsupported_local_recovery)
- [The Yesterday Weatherman](#stale_telemetry)
- [The Tired Runner](#silent_straggler)
- [The Revolving Door Patient](#revolving_door)

**What the machines brought with them**

- [The Midnight Power Cliff](#power_cliff)
- [The Cracked Solder Bead](#fractured_microbump)
- [The Edge-of-the-Oven Cookie](#wafer_lot_contagion)
- [The Framed Innocent](#innocent_chip_dying_board)
- [The Thermal Shadow](#rack_thermal_shadow)
- [The Over-Torqued Wrench](#cold_plate_torque_fracture)
- [The Whispering Voltage Cliff](#silent_subthreshold_cliff)

<a id="gradual_warning"></a>

## The Feverish Athlete

A runner keeps moving, but their temperature rises beyond what the work alone explains. The team must decide whether to save before the interruption.

**Observe:** Look at temperature alongside power, workload, freshness, and a baseline.

**What this explains:** Early evidence can justify a save; it does not guarantee an exact failure time.

**Ask your team:** Can you show how warning quality and checkpoint age influence an extra save?

**Evidence fields:** `gpu_temp_c`, `power_draw_w`, `residual_ewma`, `freshness_steps`

**Scope:** Engine rehearsal: thermal degradation and an extra checkpoint.

[Read the context](https://sohamsa.github.io/baton/#/journey/alarm) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=gradual_warning&chapter=alarm) · [Supporting tool](https://sohamsa.github.io/baton/#/anomalies?chapter=alarm)

Thermal resistance rises; temperature responds to heat generation and removal. A residual compares the reported temperature with a nominal envelope.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 80 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 40 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** The extra-save gate uses a residual above 6 °C and a save age of at least 12 useful steps. These separate a sustained teaching signal from observation noise.

**What is left out:** No fitted thermal envelope, forecast calibration, fluid dynamics, or guaranteed failure time.

**What changes the lesson:** Change warning strength, save age, and write duration: a save can arrive too late or cost more than it preserves.

<a id="abrupt_failure"></a>

## The Sudden Ghost

A worker vanishes without a farewell. There is no useful warning to discover; the test is whether the team prepared a recovery.

**Observe:** A missing heartbeat and a verified save matter more than a forecast.

**What this explains:** Some failures offer no observable warning. Prepare compatible recovery resources.

**Ask your team:** Have we demonstrated a restart from a usable save with compatible capacity?

**Evidence fields:** `heartbeat`, `checkpoint state`, `runtime capability`, `spare compatibility`

**Scope:** Engine rehearsal: abrupt failure and spare-assisted restart.

[Read the context](https://sohamsa.github.io/baton/#/journey/alarm) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=abrupt_failure&chapter=alarm) · [Supporting tool](https://sohamsa.github.io/baton/#/recovery?chapter=alarm)

A scripted required rank stops without a predictive warning. A compatible spare and a verified checkpoint permit coordinated recovery.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 70 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 20 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** One compatible spare demonstrates capacity that can actually be used; warmup consumes time.

**What is left out:** A scripted interruption is not a measured failure probability or hardware reset.

**What changes the lesson:** Remove the spare or usable save: recovery remains blocked.

<a id="healthy_workload_shift"></a>

## The Hard-Working Chef

The kitchen grows hot during a busy service. Pulling the chef out would stop a healthy dinner.

**Observe:** Temperature rises with workload and power, rather than an unexplained residual.

**What this explains:** Interpret heat in context while retaining independent safety protections.

**Ask your team:** How do we distinguish healthy load from abnormal behavior?

**Evidence fields:** `sm_util_ratio`, `power_draw_w`, `gpu_temp_c`, `residual_ewma`

**Scope:** Engine rehearsal: a healthy workload shift.

[Read the context](https://sohamsa.github.io/baton/#/journey/alarm) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=healthy_workload_shift&chapter=alarm) · [Supporting tool](https://sohamsa.github.io/baton/#/devices?chapter=alarm)

A higher workload raises power and temperature together inside the nominal envelope.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 40 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 50 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** The static quarantine limit of 60 °C deliberately demonstrates an overly simple alarm.

**What is left out:** This does not remove independent hardware safety limits or establish a safe operating temperature.

**What changes the lesson:** A higher workload can make the static rule interrupt healthy progress.

<a id="harmful_preventive"></a>

## The Overzealous Referee

A referee sees exertion and stops the game. A protective action becomes the interruption.

**Observe:** Compare completed useful work after intervention with a reasonable alternative.

**What this explains:** Evaluate the cost of false interventions, not just missed alarms.

**Ask your team:** Do our reviews measure disruption caused by our own protective actions?

**Evidence fields:** `useful_new`, `recomputation`, `actions`, `interruption duration`

**Scope:** Engine rehearsal: threshold quarantine can reduce useful progress.

[Read the context](https://sohamsa.github.io/baton/#/journey/alarm) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=harmful_preventive&chapter=alarm) · [Supporting tool](https://sohamsa.github.io/baton/#/experiments?chapter=alarm)

A threshold policy quarantines a healthy busy rank and stalls the dependent job.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 40 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 50 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** A 60 °C threshold is intentionally unsuitable for this fictional healthy burst.

**What is left out:** This negative result is specific to the scripted workload; it does not condemn all protective shutdowns.

**What changes the lesson:** Compare action overhead and new work, rather than treating intervention count as success.

<a id="shared_infrastructure"></a>

## The Kitchen Circuit Breaker

Several appliances dim together. Replacing each appliance would miss their shared electrical supply.

**Observe:** Match correlated symptoms to power-domain membership.

**What this explains:** Investigate common dependencies before blaming individual devices.

**Ask your team:** Can we map each affected machine to its shared power and cooling domains?

**Evidence fields:** `power_domain_id`, `power_limit_w`, `cooling_domain_id`

**Scope:** Engine rehearsal: shared power symptoms and grouped incidents.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=shared_infrastructure&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/boards?chapter=suspects)

A domain-level power reduction produces correlated reported limits across its members.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 30 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 20 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Reported limits below 80% of nominal help group a shared dependency.

**What is left out:** The reduction is an abstract supply symptom, not circuit protection or a utility model.

**What changes the lesson:** Change affected-domain membership: unrelated machines must not be grouped just because their temperatures match.

<a id="incomplete_checkpoint"></a>

## The Contract with Missing Pages

The courier returns a contract, but some pages never arrived. It cannot safely become the record everyone relies on.

**Observe:** Inspect shard completeness, verification state, reachability, and compatibility.

**What this explains:** A requested or partially written checkpoint is not a usable restore point.

**Ask your team:** When did we last demonstrate a restore, including rejection of a bad save?

**Evidence fields:** `shards_present`, `shards_expected`, `checksum_ok`, `verified_at`

**Scope:** Engine rehearsal: abstract completeness gates and checkpoint fallback; no real tensor files.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=incomplete_checkpoint&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/checkpoints?chapter=suspects)

A save must have complete shards, matching consistency metadata, and a usable verification state before restore.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 40 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 10 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** The newest save is deliberately incomplete or corrupted so recovery must inspect older eligible saves.

**What is left out:** No tensors, real checksums, storage bandwidth benchmark, or actual distributed file writes.

**What changes the lesson:** Remove the older usable save: fallback cannot manufacture one.

<a id="unsupported_local_recovery"></a>

## The Missing Choir Singer

One singer leaves, but the arrangement still requires their part. Continuing needs a supported new arrangement.

**Observe:** The runtime capability and dependent rank groups constrain recovery.

**What this explains:** A desired smaller restart is not automatically a supported restart.

**Ask your team:** What membership changes does our training framework actually support?

**Evidence fields:** `runtime capability`, `rank assignments`, `tp_size`, `topology_signature`

**Scope:** Engine rehearsal: unsupported reconfiguration is rejected.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=unsupported_local_recovery&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/dependencies?chapter=suspects)

A strict synchronous runtime rejects a membership change even when an operator requests it.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 20 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Capability and tensor-parallel group size gate the proposed reconfiguration.

**What is left out:** Capabilities are explicit simulated contracts, not framework support detected on real equipment.

**What changes the lesson:** A spare-assisted restart and an elastic membership change have different prerequisites.

<a id="stale_telemetry"></a>

## The Yesterday Weatherman

The forecast sounds confident until someone checks when it was recorded. Yesterday’s evidence cannot settle tonight’s diagnosis.

**Observe:** Compare event time with availability time and identify missing independent confirmation.

**What this explains:** Abstain from uncertain diagnosis while pursuing fresh evidence and reliable liveness.

**Ask your team:** How do we identify stale readings and separate sensor loss from machine failure?

**Evidence fields:** `event_step`, `availability_step`, `freshness_steps`, `heartbeat`

**Scope:** Engine rehearsal: delayed observations and abstention.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=stale_telemetry&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/monitoring?chapter=suspects)

A collector delays observations while decisions can use only evidence already available.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 24 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 20 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** A ten-tick lag exceeds the five-tick freshness gate.

**What is left out:** No real collector integration or calibrated sensor-outage distribution.

**What changes the lesson:** Reduce lag or add trustworthy independent evidence; abstention should change only when evidence improves.

<a id="silent_straggler"></a>

## The Tired Runner

Everyone remains on the track, but one runner quietly loses pace. The finish line moves further away.

**Observe:** Compare recent observed per-rank latency with its peers while heartbeats remain present.

**What this explains:** A slow but functioning rank reduces synchronized useful progress. A compatible replacement at a verified checkpoint boundary has recovery overhead.

**Ask your team:** Can we identify the slowest dependent ranks without confusing workload variation with damage?

**Evidence fields:** `step_latency_ms`, `step_latency_ratio`, `heartbeat`, `checkpoint state`, `spare compatibility`

**Scope:** Engine rehearsal: a live rank slows the dependent job; a coordinated checkpoint restart replaces it with a compatible spare.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=silent_straggler&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/silicon?chapter=suspects)

One alive rank reaches 1.8 times nominal latency. Synchronous credit is divided by the slowest active rank’s latency multiplier.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 60 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 12 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 1 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Nominal latency is 100 ms; a peer ratio above 1.2 motivates investigation and a saved-boundary replacement.

**What is left out:** Latency is an illustrative proxy, not a trace of kernels, network collectives, or die health.

**What changes the lesson:** A compatible spare and a current verified save are required; replacement costs warmup.

**Challenge: No compatible spare.** The slow rank is observed, but no replacement capacity exists.

Changed inputs: `spare_count=0`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=silent_straggler&variant=challenge&chapter=suspects)

<a id="revolving_door"></a>

## The Revolving Door Patient

A patient passes an idle check, returns to the race, and falters under load. Recovery is not the same as qualification.

**Observe:** An isolated load test emits a pass or fail with observed stress errors before the candidate can return.

**What this explains:** An idle reboot can hide instability. A failed candidate stays quarantined; supported recovery uses a compatible spare if available.

**Ask your team:** What tests and approvals are required before repaired equipment rejoins production?

**Evidence fields:** `qualification_state`, `stress_error_count`, `diagnostics`, `checkpoint state`, `spare compatibility`

**Scope:** Engine rehearsal: repaired equipment can fail isolated qualification; premature re-entry causes repeat failures, while the gated path uses a compatible spare.

[Read the context](https://sohamsa.github.io/baton/#/journey/suspects) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=revolving_door&chapter=suspects) · [Supporting tool](https://sohamsa.github.io/baton/#/dispatch?chapter=suspects)

An unstable repaired candidate relapses three ticks after premature return. An isolated engine test can report pass or fail before recovery.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 60 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 1 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** The synthetic test takes three ticks and emits three stress errors for an unstable candidate.

**What is left out:** The pass/fail rule is invented; it is not an equipment qualification standard, burn-in procedure, or certification.

**What changes the lesson:** A failing candidate stays excluded. With no compatible spare the job cannot recover through this path.

**Challenge: Failed qualification, no spare.** Qualification reports failure; the candidate remains excluded and recovery is blocked.

Changed inputs: `spare_count=0`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=revolving_door&variant=challenge&chapter=suspects)

<a id="power_cliff"></a>

## The Midnight Power Cliff

The whole kitchen starts its ovens together. The owner discovers that workload changes also reach the electrical system.

**Observe:** Power over time, shared supply limits, and the actual contract determine the investigation.

**What this explains:** Electrical transients and billing demand windows are different questions.

**Ask your team:** Have electrical specialists reviewed ramps, capacity, and our actual demand terms?

**Evidence fields:** `power_headroom_w`, `power_domain_id`, `clock_scale`, `useful_new`

**Scope:** Distinct synthetic engine mechanism: Shared domain demand is compared with a declared capacity. Two consecutive over-capacity ticks cause a synthetic trip. Pacing reduces domain workload and throughput. No waveform, protection coordination, UPS model, tariff window, or electricity bill.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=power_cliff&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/grid?chapter=origins)

Shared domain demand is compared with a declared capacity. Two consecutive over-capacity ticks cause a synthetic trip. Pacing reduces domain workload and throughput.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Capacity is 80% of member nominal power; a headroom below 80 W triggers a 30% workload reduction.

**What is left out:** No waveform, protection coordination, UPS model, tariff window, or electricity bill.

**What changes the lesson:** With 105% capacity the same conservative pacing is unnecessary and loses useful progress.

**Challenge: Capacity was sufficient.** A conservative pacing rule reduces progress although demand does not exceed the declared capacity.

Changed inputs: `fault_strength=1.05`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=power_cliff&variant=challenge&chapter=origins)

<a id="fractured_microbump"></a>

## The Cracked Solder Bead

A tiny connection becomes the suspected weak link. The visible error does not identify the microscopic cause on its own.

**Observe:** Memory and link symptoms need corroborating specialist diagnostics.

**What this explains:** Keep component-level causes as hypotheses until evidence distinguishes them.

**Ask your team:** What diagnostic evidence would distinguish memory, packaging, board, and software faults?

**Evidence fields:** `nvlink_replay_total`, `step_latency_ms`, `step_latency_ratio`, `checkpoint state`

**Scope:** Distinct synthetic engine mechanism: A package-link condition raises retry counts under load and increases rank latency. Replacement requires a usable current save and compatible spare. Observed retries do not prove a microscopic crack. No eye diagram, microbump geometry, memory BIST, or built-in self-repair.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=fractured_microbump&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/mcm?chapter=origins)

A package-link condition raises retry counts under load and increases rank latency. Replacement requires a usable current save and compatible spare.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 1 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Above 0.6 workload, strength 0.8 adds eight link retries per tick and a 2.6 latency multiplier.

**What is left out:** Observed retries do not prove a microscopic crack. No eye diagram, microbump geometry, memory BIST, or built-in self-repair.

**What changes the lesson:** Without a spare, the rank remains slow despite clear evidence.

**Challenge: Retries without replacement capacity.** Link symptoms persist, but the required spare is absent.

Changed inputs: `spare_count=0`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=fractured_microbump&variant=challenge&chapter=origins)

<a id="wafer_lot_contagion"></a>

## The Edge-of-the-Oven Cookie

One batch member fails. The owner asks whether the rest share a risk, rather than declaring every sibling guilty.

**Observe:** Trusted manufacturing identifiers and cohort comparisons would be needed.

**What this explains:** Shared history suggests an investigation, not proof of a defective batch.

**Ask your team:** Can suppliers provide traceable lot records, and how would we test a cohort hypothesis?

**Evidence fields:** `lot_id`, `ecc_sbe_total`, `checkpoint state`, `spare compatibility`

**Scope:** Distinct synthetic engine mechanism: Reported lot membership links two candidates. The scripted shared condition raises corrected errors and causes staggered failures. A cohort response can replace both at a save boundary. Association is not causation. A real lot does not imply that every member is defective; records may be unavailable.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=wafer_lot_contagion&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/lineage?chapter=origins)

Reported lot membership links two candidates. The scripted shared condition raises corrected errors and causes staggered failures. A cohort response can replace both at a save boundary.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 2 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Strength above 0.5 enables staggered failures; the teaching policy reacts to at least two reported corrected errors in a labeled lot.

**What is left out:** Association is not causation. A real lot does not imply that every member is defective; records may be unavailable.

**What changes the lesson:** A mild error in just one member can prompt overly broad replacement; long warmup makes that response worse.

**Challenge: Association leads to overreaction.** Only one lot member has a mild error; replacing the whole group with long warmup loses useful work.

Changed inputs: `fault_strength=0.2`, `affected_members=1`, `warmup_steps=16`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=wafer_lot_contagion&variant=challenge&chapter=origins)

<a id="innocent_chip_dying_board"></a>

## The Framed Innocent

The chip receives the blame while its supporting board supplies unstable power. An expensive replacement might leave the cause untouched.

**Observe:** Compare symptoms with board and shared-domain evidence.

**What this explains:** Investigate the surrounding system before replacing the accused component.

**Ask your team:** What board-level evidence do we require before approving accelerator replacement?

**Evidence fields:** `board_ripple_mv`, `host_id`, `heartbeat`, `actions`

**Scope:** Distinct synthetic engine mechanism: A host-level board condition generates shared ripple and repeated resets. Replacing chips on the same unrepaired board preserves the problem. Synthetic board service restores from a verified save. No voltage waveform, regulator design, definitive chip-health diagnosis, hot repair, or real board control.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=innocent_chip_dying_board&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/boards?chapter=origins)

Ripple means variation in an electrical supply. A host-level board condition generates shared ripple and repeated resets. Replacing chips on the same unrepaired board preserves the problem. Synthetic board service restores from a verified save.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 2 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** 40 × strength gives ripple in mV. Above 20 mV the teaching policy requests a board investigation; strong faults cause periodic resets.

**What is left out:** No voltage waveform, regulator design, definitive chip-health diagnosis, hot repair, or real board control.

**What changes the lesson:** Delayed observations block the evidence-guided service. The wrong-remedy branch shows why component substitution can fail.

**Challenge: The board evidence is stale.** Delayed observations prevent the evidence-guided service; neither stale evidence nor a replacement chip establishes recovery.

Changed inputs: `collector_lag_steps=10`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=innocent_chip_dying_board&variant=challenge&chapter=origins)

<a id="rack_thermal_shadow"></a>

## The Thermal Shadow

One part of the building receives less cooling. The owner needs a map, not just a list of hot machines.

**Observe:** Compare upper and lower rack positions, reported coolant-flow ratios, and the temperature gradient across related machines.

**What this explains:** A shared restriction heats upper positions while another rack remains unaffected. Saving and pausing for simulated cooling maintenance can prevent later stalls.

**Ask your team:** Do our cooling maps and measurements reveal which machines share a vulnerable loop?

**Evidence fields:** `rack_id`, `rack_elevation_u`, `cooling_flow_ratio`, `gpu_temp_c`, `rack_gradient_c`

**Scope:** Engine rehearsal: reduced upper-rack flow creates a spatial temperature gradient; a saved job pauses for simulated cooling maintenance.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=rack_thermal_shadow&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/racks?chapter=origins)

A flow restriction raises effective thermal resistance for upper positions of one rack. Another rack is the healthy comparison.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 60 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 16 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Flow is 0.35 of nominal. A reported flow below 0.6 and a within-rack temperature gradient above 8 °C motivate a saved intervention.

**What is left out:** Invented geometry and lumped heat dynamics; no hydraulic network, CFD, or equipment-control integration.

**What changes the lesson:** Stale flow data, no usable save, or intervention overhead can undermine the response.

**Challenge: Cooling evidence arrives too late.** Ten-tick collector lag prevents a fresh-evidence intervention.

Changed inputs: `collector_lag_steps=10`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=rack_thermal_shadow&variant=challenge&chapter=origins)

<a id="cold_plate_torque_fracture"></a>

## The Over-Torqued Wrench

An assembly mistake leaves a clue in an earlier chapter of the machine’s life. The owner asks for records before drawing conclusions.

**Observe:** Installation history and specialist mechanical evidence would be needed.

**What this explains:** Lifecycle records can support investigation but do not prove a physical defect.

**Ask your team:** Which installation and assembly records are available, and who can interpret them?

**Evidence fields:** `assembly_batch_id`, `mounting_torque_nm`, `pcb_strain_microstrain`, `gpu_temp_c`

**Scope:** Distinct synthetic engine mechanism: An installation condition increases strain with temperature rise. A labeled assembly group can be reviewed and replaced at a saved boundary. Not a finite-element model, torque specification, crack-growth law, or proof that all batch members are damaged.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=cold_plate_torque_fracture&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/passport?chapter=origins)

An installation condition increases strain with temperature rise. A labeled assembly group can be reviewed and replaced at a saved boundary.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 2 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Strain is relative stretching or bending; a microstrain is one part per million. In this invented model, strain = 100 + 300 × strength × max(temperature − 40, 0) ÷ 20, in microstrain. The illustrative review and failure levels are 250 and 380.

**What is left out:** Not a finite-element model, torque specification, crack-growth law, or proof that all batch members are damaged.

**What changes the lesson:** If only one member has moderate strain and none fails in the horizon, broad replacement with long warmup loses work.

**Challenge: A healthy batch mate is displaced.** One member has moderate strain; no member fails within the horizon. Broad replacement has a larger cost than benefit.

Changed inputs: `fault_strength=0.72`, `affected_members=1`, `warmup_steps=16`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=cold_plate_torque_fracture&variant=challenge&chapter=origins)

<a id="silent_subthreshold_cliff"></a>

## The Whispering Voltage Cliff

The room looks calm, but correct-looking operation may conceal incorrect computation. A normal thermometer cannot answer every question.

**Observe:** Computation validation and electrical evidence would matter, not temperature alone.

**What this explains:** Protecting file integrity does not prove that the computations inside a file were correct.

**Ask your team:** What checks could reveal silent computation errors before they enter our trusted saves?

**Evidence fields:** `voltage_margin_mv`, `validation_mismatch_total`, `clock_scale`, `useful_new`

**Scope:** Distinct synthetic engine mechanism: Timing margin depends on workload, a scripted droop, and synthetic clock scale. Negative margin emits validation mismatches; invalid work is blocked before useful progress or a new save is credited. No transistor timing model, weight corruption, silent-error forecast, or hardware voltage control. The synthetic checker catches invalid work; it does not claim all real corruption is observable.

[Read the context](https://sohamsa.github.io/baton/#/journey/origins) · [Compare responses](https://sohamsa.github.io/baton/#/desk?scenario=silent_subthreshold_cliff&chapter=origins) · [Supporting tool](https://sohamsa.github.io/baton/#/anomalies?chapter=origins)

Timing margin is the modeled breathing room for a calculation to finish correctly. It depends on workload, a scripted droop, and synthetic clock scale. Negative margin emits validation mismatches; invalid work is blocked before useful progress or a new save is credited.

The values were chosen to separate the teaching signal, response prerequisites, and intervention cost within a short reproducible scene. They are authored assumptions, not fitted measurements.

| Authored input | Standard value | Purpose |
| --- | --- | --- |
| Observation horizon | 64 ticks | A short complete scene makes comparisons readable; it does not represent annual reliability. |
| Tick duration | 5 seconds | Compresses simulated time so state transitions can be followed; not a forecast of repair time. |
| Detailed placement | 4 ranks | Only these ranks receive individual traces; the larger inventory is counted separately. |
| Scheduled save interval | 8 useful progress steps | Makes the tradeoff between save overhead and repeated work visible. |
| Save write time | 1 ticks | Every write consumes time, so saving more often is not free. |
| Recovery warmup | 2 ticks | Models recovery overhead without claiming actual hardware or framework timing. |
| Compatible spare pool | 0 accelerators | Explicit capacity constraint; a replacement requires actual eligible capacity in the engine. |

**Relationship and response gates:** Margin = 70 − 140 × strength × workload + 80 × (1 − clock scale), in mV. A 15 mV gate reduces clock scale to 0.8.

**What is left out:** No transistor timing model, weight corruption, silent-error forecast, or hardware voltage control. The synthetic checker catches invalid work; it does not claim all real corruption is observable.

**What changes the lesson:** With positive but small margin, pacing costs throughput without preventing any error in the scripted horizon.

**Challenge: Pacing without an observed error.** Margin stays positive; preventive pacing lowers useful progress in this finite example.

Changed inputs: `fault_strength=0.55`.

[Try the challenge](https://sohamsa.github.io/baton/#/desk?scenario=silent_subthreshold_cliff&variant=challenge&chapter=origins)

## Shared fictional world

Useful progress is a normalized work unit, not a measured training iteration. The 100 ms latency signal is a relative slowdown proxy; each simulation tick aggregates work over its separately declared duration. Neither clock represents production throughput.

| Shared input | Authored value | Purpose |
| --- | --- | --- |
| Main fictional profile | northspan-n8 | A consistent invented profile keeps paired comparisons interpretable; it is not a vendor product. |
| Idle / nominal full-load power | 70 / 350 W | Defines a simple linear power-versus-workload relationship, not a power trace. |
| Coolant baseline | 25 °C | A fixed boundary makes extra thermal resistance visible; real coolant loops vary. |
| Nominal thermal resistance | 0.12 °C/W | A lumped heat-removal relationship lets cooling changes influence temperature without a CFD model. |
| Thermal capacity | 100 J/°C | An invented response speed brings thermal changes into the short rehearsal horizon; it is not a measured package heat capacity. |
| Collector freshness gate | 5 ticks | Creates a clear stale-evidence example; site-specific sampling and decision deadlines would differ. |

These inputs were chosen for teachable relationships, reproducibility, and visible tradeoffs. They are not recommended equipment specifications, design limits, calibrated probabilities, or predictions.

## The recovery discussion

The ending connects earlier lessons as a tabletop decision exercise. It does not execute a compound event as one engine simulation. Individual rehearsals demonstrate the separate mechanisms.

**The temperature alarm is fresh, but the facility report is old. What do you tell the team?**

- **Treat the old report as proof of the cause.** The Yesterday Weatherman has misled the investigation. An alarm can warrant attention without establishing its cause.
- **Request fresh corroboration and check independent liveness.** You separate a symptom from its cause and pursue timely evidence. Keep independent hardware safety protections active.

**A rank has stopped responding. The newest checkpoint is still being written. Which restore point do you consider?**

- **Use the newest file because it has the latest timestamp.** The Missing-Pages Contract is not ready. Writing or incomplete checkpoints cannot be trusted as restore points.
- **Use the newest verified, complete, reachable, compatible save.** You use the checkpoint gates. If none qualifies, recovery is blocked; report that explicitly rather than inventing saved progress.

**The job requires its current membership. Someone proposes removing the failed rank and continuing.**

- **Drop the rank immediately; plenty of machines remain.** The Missing Choir Singer still has a required part. Unsupported membership changes can leave dependent work unable to advance.
- **Confirm capabilities and plan a coordinated supported restart.** You match the response to the runtime, restore point, and compatible replacement capacity. Specialists must validate the actual procedure.

## Your facility review

Record what your team reports, what is unknown, and which evidence you need. Your answers choose relevant learning scenes; they do not certify readiness, predict risk, or change the engine parameters.

| Question | Records to request | Suggested team |
| --- | --- | --- |
| Can your team identify the machines in each dependent job and its permitted recovery changes? | job membership map, runtime capability record | Training or platform lead |
| Has the team demonstrated restoration from a complete, verified, reachable save? | restore drill record, checkpoint manifest and verification | Training and storage leads |
| Are power, cooling, host-board, and network dependencies mapped? | power and cooling domain maps, host and network topology | Facilities and infrastructure leads |
| Do readings have event time, arrival time, missingness, and independent liveness evidence? | telemetry timestamps, collector outage drill, sensor support list | Observability lead |
| Is compatible spare capacity available to this job, and has it been used in a drill? | compatible capacity inventory, spare-assisted recovery drill | Cluster scheduling lead |
| Are repaired candidates isolated and checked before production re-entry? | qualification record, return-to-service approval | Operations and hardware leads |
| Which lot, board, assembly, and installation records are actually available? | supplier lot identifiers, assembly record, installation record, specialist diagnostics | Procurement and hardware leads |
| Can the team distinguish useful progress, repeated work, and invalid results—and measure intervention cost? | computation validation record, progress ledger, intervention review | Training and reliability leads |

[Open the blank worksheet](https://sohamsa.github.io/baton/#/worksheet). Its local notes and reported evidence are not a readiness score or certification.
