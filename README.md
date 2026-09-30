# Baton: The Night the Datacenter Held Its Breath

> An owner’s story of ambition, interruption, evidence, and recovery.

**You are the owner. The datacenter is your world. Every problem is a character.**

Read the story here, or step into its scenes in the [interactive dashboard](https://sohamsa.github.io/baton/). No chip expertise is required.

> This is a fictional learning story with synthetic data and simplified rehearsals. Costs and outcomes elsewhere in the dashboard are illustrations, not tested savings or production promises. Advanced scenes now have distinct synthetic mechanisms; specialist diagnostics, microscopic causes, and actual facility controls remain outside the model.

## Choose your seat

| Your situation | Enter the dashboard | What you take away |
| --- | --- | --- |
| Planning a first datacenter | [The builder’s entrance](https://sohamsa.github.io/baton/#/journey/arrival?path=build) | Questions for design reviews, procurement, and launch readiness |
| Operating existing datacenters | [The operator’s entrance](https://sohamsa.github.io/baton/#/journey/arrival?path=operate) | Questions for incident reviews, restore drills, and maintenance |
| Learning the world | [The explorer’s entrance](https://sohamsa.github.io/baton/#/journey/arrival?path=explore) | A connected understanding of the systems and their tradeoffs |

Both owner paths follow the same movie. The dashboard changes the prompts you carry into your own meetings. You can read straight through, visit a supporting room, and return to the chapter you left.

## The programme

- **Opening scene:** [The lights come on](https://sohamsa.github.io/baton/#/journey/arrival)
- **Act I:** [Learn the rhythm before the silence](https://sohamsa.github.io/baton/#/journey/rhythm)
- **Act II:** [The first alarm](https://sohamsa.github.io/baton/#/journey/alarm)
- **Act III:** [The wrong suspect](https://sohamsa.github.io/baton/#/journey/suspects)
- **Act IV:** [The past enters the room](https://sohamsa.github.io/baton/#/journey/origins)
- **Climax:** [The night the clues collide](https://sohamsa.github.io/baton/#/journey/finale)
- **Epilogue:** [At dawn, you know what to ask](https://sohamsa.github.io/baton/#/journey/dawn)

---

## Opening scene · The lights come on

Before sunrise, you stand outside a building that once existed only in drawings. Inside are machines, cables, pumps, storage, and a team waiting to begin. You do not need to know how a chip is made to ask the question that matters: will this place turn resources into useful work?

You are the owner in this story. Perhaps this is your first facility. Perhaps you already manage a fleet. Either way, your role is to understand dependencies, ask for evidence, and make decisions with specialists. Baton is your rehearsal room.

The cast is fictional and the evidence is synthetic. The dilemmas are engineering questions worth exploring. Financial figures elsewhere in the dashboard are illustrative assumptions, not measured savings or promises.

> **The question you carry forward:** What must my team demonstrate before I trust the facility?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/arrival) · [Visit the planning room](https://sohamsa.github.io/baton/#/planner?chapter=arrival)


---

## Act I · Learn the rhythm before the silence

On the floor, accelerators perform calculations. The network lets cooperating machines exchange results. Power keeps them alive; cooling carries heat away. Storage holds the work that must survive an interruption. People connect all of these systems through procedures.

Follow one training job, a team of assigned workers. Some workers must wait for their partners before the job advances. A server houses machines; a rack groups servers; a facility holds many racks and can run many jobs. Trouble in one dependent job does not automatically stop the whole building.

A checkpoint is a saved position in the journey. Returning to it may mean repeating work. Saving too often also takes time. Your first lesson is to distinguish activity from progress: busy machines can be repeating yesterday’s calculations.

| The part of the world | What it does | The owner’s question |
| --- | --- | --- |
| Accelerators | Perform calculations | Are they producing new useful work? |
| Network | Connects cooperating workers | Which work waits on which partners? |
| Power and cooling | Supply energy and remove heat | Which machines share a vulnerable dependency? |
| Storage | Holds saved training state | Can we actually restore it? |
| People and procedures | Investigate and authorize responses | What evidence and capability checks govern action? |

The detailed rehearsal job is small. The larger cluster is an inventory with a counted quiescent population; it is not a fully instrumented fleet experiment. No real GPU is connected.

> **The question you carry forward:** Which machines must cooperate, and what progress can we actually restore?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/rhythm) · [Meet the training team](https://sohamsa.github.io/baton/#/dependencies?chapter=rhythm)


---

## Act II · The first alarm

A temperature climbs. Someone reaches for the stop button. Across the room, another machine disappears without a warning. Two incidents, two different decisions. The owner discovers that resilience needs both early recognition and preparation for surprises.

Enter the Feverish Athlete, the Sudden Ghost, the Hard-Working Chef, and the Overzealous Referee. Their appearances can look similar on an alarm screen. Their consequences are very different.

Watch the evidence before choosing the response. A save may protect progress. A restart may restore a stopped job. A mistaken quarantine can interrupt healthy work. Ask what supports the action and what it could cost.

### The Feverish Athlete

A runner keeps moving, but their temperature rises beyond what the work alone explains. The team must decide whether to save before the interruption.

**The clue:** Look at temperature alongside power, workload, freshness, and a baseline.

**The revelation:** Early evidence can justify a save; it does not guarantee an exact failure time.

**Ask your team:** Can you show how warning quality and checkpoint age influence an extra save?

**Open the evidence drawer:** `gpu_temp_c`, `power_draw_w`, `residual_ewma`, `freshness_steps`.

*Rehearsal scope: Engine rehearsal: thermal degradation and an extra checkpoint.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=gradual_warning&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/anomalies?chapter=alarm)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Sudden Ghost

A worker vanishes without a farewell. There is no useful warning to discover; the test is whether the team prepared a recovery.

**The clue:** A missing heartbeat and a verified save matter more than a forecast.

**The revelation:** Some failures offer no observable warning. Prepare compatible recovery resources.

**Ask your team:** Have we demonstrated a restart from a usable save with compatible capacity?

**Open the evidence drawer:** `heartbeat`, `checkpoint state`, `runtime capability`, `spare compatibility`.

*Rehearsal scope: Engine rehearsal: abrupt failure and spare-assisted restart.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=abrupt_failure&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/recovery?chapter=alarm)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Hard-Working Chef

The kitchen grows hot during a busy service. Pulling the chef out would stop a healthy dinner.

**The clue:** Temperature rises with workload and power, rather than an unexplained residual.

**The revelation:** Interpret heat in context while retaining independent safety protections.

**Ask your team:** How do we distinguish healthy load from abnormal behavior?

**Open the evidence drawer:** `sm_util_ratio`, `power_draw_w`, `gpu_temp_c`, `residual_ewma`.

*Rehearsal scope: Engine rehearsal: a healthy workload shift.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=healthy_workload_shift&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/devices?chapter=alarm)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Overzealous Referee

A referee sees exertion and stops the game. A protective action becomes the interruption.

**The clue:** Compare completed useful work after intervention with a reasonable alternative.

**The revelation:** Evaluate the cost of false interventions, not just missed alarms.

**Ask your team:** Do our reviews measure disruption caused by our own protective actions?

**Open the evidence drawer:** `useful_new`, `recomputation`, `actions`, `interruption duration`.

*Rehearsal scope: Engine rehearsal: threshold quarantine can reduce useful progress.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=harmful_preventive&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/experiments?chapter=alarm)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

> **The question you carry forward:** Is this a warning, a healthy surge, or a failure we must recover from?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/alarm) · [Inspect the sensor readings](https://sohamsa.github.io/baton/#/devices?chapter=alarm)


---

## Act III · The wrong suspect

The owner receives several alarms at once. Are several chips failing, or do they share one troubled dependency? Meanwhile, a sensor report arrives late and a checkpoint that looked complete is missing pieces.

The Kitchen Circuit Breaker, Missing-Pages Contract, Missing Choir Singer, Yesterday Weatherman, Tired Runner, and Revolving Door Patient complicate the investigation. The cheapest-looking response may be the most expensive mistake.

This act teaches restraint and preparedness together. Separate symptoms from causes. Check the age of evidence. Verify that a save is usable. Confirm what the runtime permits. Returning equipment needs a qualification process; a quick green light is not proof of health.

### The Kitchen Circuit Breaker

Several appliances dim together. Replacing each appliance would miss their shared electrical supply.

**The clue:** Match correlated symptoms to power-domain membership.

**The revelation:** Investigate common dependencies before blaming individual devices.

**Ask your team:** Can we map each affected machine to its shared power and cooling domains?

**Open the evidence drawer:** `power_domain_id`, `power_limit_w`, `cooling_domain_id`.

*Rehearsal scope: Engine rehearsal: shared power symptoms and grouped incidents.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=shared_infrastructure&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/boards?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Contract with Missing Pages

The courier returns a contract, but some pages never arrived. It cannot safely become the record everyone relies on.

**The clue:** Inspect shard completeness, verification state, reachability, and compatibility.

**The revelation:** A requested or partially written checkpoint is not a usable restore point.

**Ask your team:** When did we last demonstrate a restore, including rejection of a bad save?

**Open the evidence drawer:** `shards_present`, `shards_expected`, `checksum_ok`, `verified_at`.

*Rehearsal scope: Engine rehearsal: abstract completeness gates and checkpoint fallback; no real tensor files.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=incomplete_checkpoint&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/checkpoints?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Missing Choir Singer

One singer leaves, but the arrangement still requires their part. Continuing needs a supported new arrangement.

**The clue:** The runtime capability and dependent rank groups constrain recovery.

**The revelation:** A desired smaller restart is not automatically a supported restart.

**Ask your team:** What membership changes does our training framework actually support?

**Open the evidence drawer:** `runtime capability`, `rank assignments`, `tp_size`, `topology_signature`.

*Rehearsal scope: Engine rehearsal: unsupported reconfiguration is rejected.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=unsupported_local_recovery&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/dependencies?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Yesterday Weatherman

The forecast sounds confident until someone checks when it was recorded. Yesterday’s evidence cannot settle tonight’s diagnosis.

**The clue:** Compare event time with availability time and identify missing independent confirmation.

**The revelation:** Abstain from uncertain diagnosis while pursuing fresh evidence and reliable liveness.

**Ask your team:** How do we identify stale readings and separate sensor loss from machine failure?

**Open the evidence drawer:** `event_step`, `availability_step`, `freshness_steps`, `heartbeat`.

*Rehearsal scope: Engine rehearsal: delayed observations and abstention.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=stale_telemetry&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/monitoring?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

</details>

### The Tired Runner

Everyone remains on the track, but one runner quietly loses pace. The finish line moves further away.

**The clue:** Compare recent observed per-rank latency with its peers while heartbeats remain present.

**The revelation:** A slow but functioning rank reduces synchronized useful progress. A compatible replacement at a verified checkpoint boundary has recovery overhead.

**Ask your team:** Can we identify the slowest dependent ranks without confusing workload variation with damage?

**Open the evidence drawer:** `step_latency_ms`, `step_latency_ratio`, `heartbeat`, `checkpoint state`, `spare compatibility`.

*Rehearsal scope: Engine rehearsal: a live rank slows the dependent job; a coordinated checkpoint restart replaces it with a compatible spare.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=silent_straggler&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/silicon?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: No compatible spare.** The slow rank is observed, but no replacement capacity exists.

Changed inputs: `spare_count=0`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=silent_straggler&variant=challenge&chapter=suspects)

</details>

### The Revolving Door Patient

A patient passes an idle check, returns to the race, and falters under load. Recovery is not the same as qualification.

**The clue:** An isolated load test emits a pass or fail with observed stress errors before the candidate can return.

**The revelation:** An idle reboot can hide instability. A failed candidate stays quarantined; supported recovery uses a compatible spare if available.

**Ask your team:** What tests and approvals are required before repaired equipment rejoins production?

**Open the evidence drawer:** `qualification_state`, `stress_error_count`, `diagnostics`, `checkpoint state`, `spare compatibility`.

*Rehearsal scope: Engine rehearsal: repaired equipment can fail isolated qualification; premature re-entry causes repeat failures, while the gated path uses a compatible spare.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=revolving_door&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/dispatch?chapter=suspects)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Failed qualification, no spare.** Qualification reports failure; the candidate remains excluded and recovery is blocked.

Changed inputs: `spare_count=0`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=revolving_door&variant=challenge&chapter=suspects)

</details>

> **The question you carry forward:** What shared dependency or missing evidence could change our response?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/suspects) · [Inspect the saved progress](https://sohamsa.github.io/baton/#/checkpoints?chapter=suspects)


---

## Act IV · The past enters the room

A technician asks whether the trouble began today. Perhaps the power system, circuit board, cooling installation, or an earlier assembly step left a clue. The investigation expands beyond the chip’s temperature.

The Midnight Power Cliff, Cracked Solder Bead, Edge-of-the-Oven Cookie, Framed Innocent, Thermal Shadow, Over-Torqued Wrench, and Whispering Voltage Cliff introduce the wider world around the accelerator.

Each origin character now has a distinct synthetic mechanism: package-link retries, lot-associated errors, board instability, spatial cooling, installation strain, voltage margin, and power capacity. Their assumptions explain what changes and why. These are teaching constructions, not validated microscopic diagnoses, manufacturer specifications, batch-failure forecasts, or facility controls. Learn which records to request and explore the challenge cases where a plausible intervention costs work or recovery is blocked.

### The Midnight Power Cliff

The whole kitchen starts its ovens together. The owner discovers that workload changes also reach the electrical system.

**The clue:** Power over time, shared supply limits, and the actual contract determine the investigation.

**The revelation:** Electrical transients and billing demand windows are different questions.

**Ask your team:** Have electrical specialists reviewed ramps, capacity, and our actual demand terms?

**Open the evidence drawer:** `power_headroom_w`, `power_domain_id`, `clock_scale`, `useful_new`.

*Rehearsal scope: Distinct synthetic engine mechanism: Shared domain demand is compared with a declared capacity. Two consecutive over-capacity ticks cause a synthetic trip. Pacing reduces domain workload and throughput. No waveform, protection coordination, UPS model, tariff window, or electricity bill.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=power_cliff&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/grid?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Capacity was sufficient.** A conservative pacing rule reduces progress although demand does not exceed the declared capacity.

Changed inputs: `fault_strength=1.05`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=power_cliff&variant=challenge&chapter=origins)

</details>

### The Cracked Solder Bead

A tiny connection becomes the suspected weak link. The visible error does not identify the microscopic cause on its own.

**The clue:** Memory and link symptoms need corroborating specialist diagnostics.

**The revelation:** Keep component-level causes as hypotheses until evidence distinguishes them.

**Ask your team:** What diagnostic evidence would distinguish memory, packaging, board, and software faults?

**Open the evidence drawer:** `nvlink_replay_total`, `step_latency_ms`, `step_latency_ratio`, `checkpoint state`.

*Rehearsal scope: Distinct synthetic engine mechanism: A package-link condition raises retry counts under load and increases rank latency. Replacement requires a usable current save and compatible spare. Observed retries do not prove a microscopic crack. No eye diagram, microbump geometry, memory BIST, or built-in self-repair.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=fractured_microbump&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/mcm?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Retries without replacement capacity.** Link symptoms persist, but the required spare is absent.

Changed inputs: `spare_count=0`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=fractured_microbump&variant=challenge&chapter=origins)

</details>

### The Edge-of-the-Oven Cookie

One batch member fails. The owner asks whether the rest share a risk, rather than declaring every sibling guilty.

**The clue:** Trusted manufacturing identifiers and cohort comparisons would be needed.

**The revelation:** Shared history suggests an investigation, not proof of a defective batch.

**Ask your team:** Can suppliers provide traceable lot records, and how would we test a cohort hypothesis?

**Open the evidence drawer:** `lot_id`, `ecc_sbe_total`, `checkpoint state`, `spare compatibility`.

*Rehearsal scope: Distinct synthetic engine mechanism: Reported lot membership links two candidates. The scripted shared condition raises corrected errors and causes staggered failures. A cohort response can replace both at a save boundary. Association is not causation. A real lot does not imply that every member is defective; records may be unavailable.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=wafer_lot_contagion&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/lineage?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Association leads to overreaction.** Only one lot member has a mild error; replacing the whole group with long warmup loses useful work.

Changed inputs: `fault_strength=0.2`, `affected_members=1`, `warmup_steps=16`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=wafer_lot_contagion&variant=challenge&chapter=origins)

</details>

### The Framed Innocent

The chip receives the blame while its supporting board supplies unstable power. An expensive replacement might leave the cause untouched.

**The clue:** Compare symptoms with board and shared-domain evidence.

**The revelation:** Investigate the surrounding system before replacing the accused component.

**Ask your team:** What board-level evidence do we require before approving accelerator replacement?

**Open the evidence drawer:** `board_ripple_mv`, `host_id`, `heartbeat`, `actions`.

*Rehearsal scope: Distinct synthetic engine mechanism: A host-level board condition generates shared ripple and repeated resets. Replacing chips on the same unrepaired board preserves the problem. Synthetic board service restores from a verified save. No voltage waveform, regulator design, definitive chip-health diagnosis, hot repair, or real board control.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=innocent_chip_dying_board&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/boards?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: The board evidence is stale.** Delayed observations prevent the evidence-guided service; neither stale evidence nor a replacement chip establishes recovery.

Changed inputs: `collector_lag_steps=10`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=innocent_chip_dying_board&variant=challenge&chapter=origins)

</details>

### The Thermal Shadow

One part of the building receives less cooling. The owner needs a map, not just a list of hot machines.

**The clue:** Compare upper and lower rack positions, reported coolant-flow ratios, and the temperature gradient across related machines.

**The revelation:** A shared restriction heats upper positions while another rack remains unaffected. Saving and pausing for simulated cooling maintenance can prevent later stalls.

**Ask your team:** Do our cooling maps and measurements reveal which machines share a vulnerable loop?

**Open the evidence drawer:** `rack_id`, `rack_elevation_u`, `cooling_flow_ratio`, `gpu_temp_c`, `rack_gradient_c`.

*Rehearsal scope: Engine rehearsal: reduced upper-rack flow creates a spatial temperature gradient; a saved job pauses for simulated cooling maintenance.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=rack_thermal_shadow&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/racks?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Cooling evidence arrives too late.** Ten-tick collector lag prevents a fresh-evidence intervention.

Changed inputs: `collector_lag_steps=10`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=rack_thermal_shadow&variant=challenge&chapter=origins)

</details>

### The Over-Torqued Wrench

An assembly mistake leaves a clue in an earlier chapter of the machine’s life. The owner asks for records before drawing conclusions.

**The clue:** Installation history and specialist mechanical evidence would be needed.

**The revelation:** Lifecycle records can support investigation but do not prove a physical defect.

**Ask your team:** Which installation and assembly records are available, and who can interpret them?

**Open the evidence drawer:** `assembly_batch_id`, `mounting_torque_nm`, `pcb_strain_microstrain`, `gpu_temp_c`.

*Rehearsal scope: Distinct synthetic engine mechanism: An installation condition increases strain with temperature rise. A labeled assembly group can be reviewed and replaced at a saved boundary. Not a finite-element model, torque specification, crack-growth law, or proof that all batch members are damaged.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=cold_plate_torque_fracture&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/passport?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: A healthy batch mate is displaced.** One member has moderate strain; no member fails within the horizon. Broad replacement has a larger cost than benefit.

Changed inputs: `fault_strength=0.72`, `affected_members=1`, `warmup_steps=16`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=cold_plate_torque_fracture&variant=challenge&chapter=origins)

</details>

### The Whispering Voltage Cliff

The room looks calm, but correct-looking operation may conceal incorrect computation. A normal thermometer cannot answer every question.

**The clue:** Computation validation and electrical evidence would matter, not temperature alone.

**The revelation:** Protecting file integrity does not prove that the computations inside a file were correct.

**Ask your team:** What checks could reveal silent computation errors before they enter our trusted saves?

**Open the evidence drawer:** `voltage_margin_mv`, `validation_mismatch_total`, `clock_scale`, `useful_new`.

*Rehearsal scope: Distinct synthetic engine mechanism: Timing margin depends on workload, a scripted droop, and synthetic clock scale. Negative margin emits validation mismatches; invalid work is blocked before useful progress or a new save is credited. No transistor timing model, weight corruption, silent-error forecast, or hardware voltage control. The synthetic checker catches invalid work; it does not claim all real corruption is observable.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=silent_subthreshold_cliff&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/anomalies?chapter=origins)

<details>
<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>

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

**A second ending: Pacing without an observed error.** Margin stays positive; preventive pacing lowers useful progress in this finite example.

Changed inputs: `fault_strength=0.55`.

[Explore these challenge conditions](https://sohamsa.github.io/baton/#/desk?scenario=silent_subthreshold_cliff&variant=challenge&chapter=origins)

</details>

> **The question you carry forward:** What can we observe today, and what records or specialist evidence are missing?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/origins) · [Open the evidence archive](https://sohamsa.github.io/baton/#/passport?chapter=origins)


---

## Climax · The night the clues collide

The evening workload is rising. A warm machine attracts attention, but the most recent facility readings are delayed. A rank then stops responding. Someone proposes dropping it from the job. Someone else points to the newest checkpoint, still being written.

You have met these characters before. Now they share a scene. Choose what evidence to trust, which save to use, and which recovery to permit. This is an interactive tabletop exercise connecting earlier lessons, not a new compound engine simulation.

The resolution is earned through disciplined questions. Your job is to protect useful progress while refusing unsupported assumptions. No decision can recover a save that does not exist, or grant a runtime a capability it does not have.

### You have the floor

Pause before reading the resolution. What would you ask the team to do?

**The temperature alarm is fresh, but the facility report is old. What do you tell the team?**

- Treat the old report as proof of the cause.
- Request fresh corroboration and check independent liveness.

**A rank has stopped responding. The newest checkpoint is still being written. Which restore point do you consider?**

- Use the newest file because it has the latest timestamp.
- Use the newest verified, complete, reachable, compatible save.

**The job requires its current membership. Someone proposes removing the failed rank and continuing.**

- Drop the rank immediately; plenty of machines remain.
- Confirm capabilities and plan a coordinated supported restart.

[Make your decisions in the interactive climax](https://sohamsa.github.io/baton/#/journey/finale)

<details>
<summary>Reveal the resolution</summary>

You separate a symptom from its cause and pursue timely evidence. Keep independent hardware safety protections active.

You use the checkpoint gates. If none qualifies, recovery is blocked; report that explicitly rather than inventing saved progress.

You match the response to the runtime, restore point, and compatible replacement capacity. Specialists must validate the actual procedure.

The ending depends on evidence and preparation. If no checkpoint qualifies, or compatible recovery capacity is absent, the team must say recovery is blocked. No story can manufacture saved progress after the fact.

This climax is a tabletop decision exercise. The existing engine rehearsals demonstrate its individual lessons; they do not execute this compound event as a single simulation.

</details>

> **The question you carry forward:** Can we assemble a supported recovery from trustworthy evidence?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/finale) · [Open the rehearsal floor](https://sohamsa.github.io/baton/#/desk?chapter=finale)


---

## Epilogue · At dawn, you know what to ask

The facility is still a complex place. You now recognize the cast. A busy machine is not necessarily productive. A warning is not a diagnosis. A completed-looking save is not necessarily usable. A spare is useful only when the recovery can use it.

If you are building, take these questions into procurement, design reviews, and launch readiness. If you are operating, take them into incident reviews, restore drills, maintenance, and monitoring improvements.

The ending belongs to your next conversation. Leave with the evidence you need, the questions you will ask, and the practices your team should demonstrate. Return to any character when a new situation deserves a rehearsal.

### Carry the ending into your next meeting

| If you are building | If you are operating |
| --- | --- |
| Request a dependency map before signing off on design. | Review how dependency maps helped or failed in a recent incident. |
| Ask suppliers which telemetry and lifecycle records are available. | Identify missing, stale, and unsupported observations. |
| Require a demonstrated checkpoint restore before launch. | Run a restore drill that rejects an incomplete save. |
| Validate recovery capability and spare compatibility. | Review repeat failures and return-to-service qualification. |

[Create and print your owner’s action pack](https://sohamsa.github.io/baton/#/journey/dawn) with your questions and notes. Progress and notes stay in your browser; no account is needed for the public story.

> **The question you carry forward:** What will I ask my team to demonstrate next?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/dawn) · [Explore the full data catalog](https://sohamsa.github.io/baton/#/data?chapter=dawn)


## The fictional world under every scene

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


## Bring your facility into the story

Record what your team reports, what is unknown, and which evidence you need. Your answers choose relevant learning scenes; they do not certify readiness, predict risk, or change the engine parameters.

[Open the guided owner worksheet](https://sohamsa.github.io/baton/#/worksheet)

Start with unknowns. Choose planning or operating context, record the affected job size if known, name who will bring evidence, and write the demonstration you want to see. A reported demonstration still needs independent record review.

| Review question | Evidence to request | Suggested team | Relevant characters |
| --- | --- | --- | --- |
| Can your team identify the machines in each dependent job and its permitted recovery changes? | job membership map, runtime capability record | Training or platform lead | The Missing Choir Singer, The Tired Runner |
| Has the team demonstrated restoration from a complete, verified, reachable save? | restore drill record, checkpoint manifest and verification | Training and storage leads | The Contract with Missing Pages, The Sudden Ghost |
| Are power, cooling, host-board, and network dependencies mapped? | power and cooling domain maps, host and network topology | Facilities and infrastructure leads | The Kitchen Circuit Breaker, The Thermal Shadow, The Framed Innocent, The Midnight Power Cliff |
| Do readings have event time, arrival time, missingness, and independent liveness evidence? | telemetry timestamps, collector outage drill, sensor support list | Observability lead | The Yesterday Weatherman, The Hard-Working Chef, The Feverish Athlete |
| Is compatible spare capacity available to this job, and has it been used in a drill? | compatible capacity inventory, spare-assisted recovery drill | Cluster scheduling lead | The Sudden Ghost, The Tired Runner, The Revolving Door Patient, The Cracked Solder Bead |
| Are repaired candidates isolated and checked before production re-entry? | qualification record, return-to-service approval | Operations and hardware leads | The Revolving Door Patient |
| Which lot, board, assembly, and installation records are actually available? | supplier lot identifiers, assembly record, installation record, specialist diagnostics | Procurement and hardware leads | The Edge-of-the-Oven Cookie, The Over-Torqued Wrench, The Cracked Solder Bead, The Framed Innocent |
| Can the team distinguish useful progress, repeated work, and invalid results—and measure intervention cost? | computation validation record, progress ledger, intervention review | Training and reliability leads | The Whispering Voltage Cliff, The Overzealous Referee, The Midnight Power Cliff |

The worksheet starts blank, retains answers in your browser, and downloads a Markdown meeting review or JSON copy. You can print the full notes and return to each linked rehearsal. It does not score readiness, predict facility risk, resize the engine, or certify the reported evidence.

---

## Behind the story: how evidence becomes a decision

A large dictionary is a map of possibilities. A particular decision needs a smaller evidence set. The character drawers show that narrowing:

| Owner question | Evidence to examine | Decision it informs |
| --- | --- | --- |
| Is the warning unexplained by workload? | Temperature, observed power, workload, residual, freshness | Investigate or request a save |
| Do the alarms share a dependency? | Power and cooling domain membership, correlated observations | Investigate the shared system |
| Can we restore this save? | State, shard completeness, integrity, reachability, topology | Select or reject a checkpoint |
| Can we change membership? | Runtime capability and dependent rank groups | Permit or reject reconfiguration |
| Did the response help? | Useful progress, repeated work, interruption, checkpoint overhead | Compare strategies |

Open the [full data catalog](https://sohamsa.github.io/baton/#/data). Catalog definitions are broader than generated observations and model inputs. Optional manufacturer records and proposed instrumentation are explicitly identified in the owner story; missing evidence remains missing.

## For the technical team

The Python engine in `src/baton` owns simulation and policies. The public React dashboard can execute it through Pyodide in a browser worker. Reading the story needs no engine startup; rehearsals load the engine on demand. Initial rehearsal loading requires network access for Pyodide and the engine bundle.

The engine separates evaluator truth from operational evidence, rejects unsupported recovery, checks abstract checkpoint eligibility, and compares policies on shared synthetic fault schedules. The learned model did not beat its baseline on the checked artifact, so rules remain the operational default. No physical telemetry or control adapter is connected.

### Run locally

```bash
git clone https://github.com/SohamSa/baton.git
cd baton
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
python -m pytest
python scripts/stage_browser_engine.py
cd apps/web
npm ci
```

Start the browser demo with `VITE_PUBLIC_DEMO=true npm run dev` (PowerShell: `$env:VITE_PUBLIC_DEMO="true"; npm run dev`). For the authenticated API workflow, see [the quickstart](docs/quickstart.md).

### Keep the story aligned

`content/owner-journey.json` supplies both the dashboard chapters and this README. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit both generated outputs. The journey tests check character coverage, route targets, and narrative parity.

Read [the runtime boundaries](docs/runtime.md), [limitations](docs/limitations.md), [model card](docs/model-card.md), and [validation notes](docs/validation.md) for technical detail.

**The final scene belongs to you:** take one question from this story into a real conversation, and ask your team to bring the evidence.
