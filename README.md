# Baton: The Night the Datacenter Held Its Breath

> An owner’s story of ambition, interruption, evidence, and recovery.

**You are the owner. The datacenter is your world. Every problem is a character.**

Read the story here, or step into its scenes in the [interactive dashboard](https://sohamsa.github.io/baton/). No chip expertise is required.

> This is a fictional learning story with synthetic data and simplified rehearsals. Costs and outcomes elsewhere in the dashboard are illustrations, not tested savings or production promises. Some advanced characters introduce proposed diagnostics rather than implemented capabilities.

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

### The Sudden Ghost

A worker vanishes without a farewell. There is no useful warning to discover; the test is whether the team prepared a recovery.

**The clue:** A missing heartbeat and a verified save matter more than a forecast.

**The revelation:** Some failures offer no observable warning. Prepare compatible recovery resources.

**Ask your team:** Have we demonstrated a restart from a usable save with compatible capacity?

**Open the evidence drawer:** `heartbeat`, `checkpoint state`, `runtime capability`, `spare compatibility`.

*Rehearsal scope: Engine rehearsal: abrupt failure and spare-assisted restart.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=abrupt_failure&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/recovery?chapter=alarm)

### The Hard-Working Chef

The kitchen grows hot during a busy service. Pulling the chef out would stop a healthy dinner.

**The clue:** Temperature rises with workload and power, rather than an unexplained residual.

**The revelation:** Interpret heat in context while retaining independent safety protections.

**Ask your team:** How do we distinguish healthy load from abnormal behavior?

**Open the evidence drawer:** `sm_util_ratio`, `power_draw_w`, `gpu_temp_c`, `residual_ewma`.

*Rehearsal scope: Engine rehearsal: a healthy workload shift.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=healthy_workload_shift&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/devices?chapter=alarm)

### The Overzealous Referee

A referee sees exertion and stops the game. A protective action becomes the interruption.

**The clue:** Compare completed useful work after intervention with a reasonable alternative.

**The revelation:** Evaluate the cost of false interventions, not just missed alarms.

**Ask your team:** Do our reviews measure disruption caused by our own protective actions?

**Open the evidence drawer:** `useful_new`, `recomputation`, `actions`, `interruption duration`.

*Rehearsal scope: Engine rehearsal: threshold quarantine can reduce useful progress.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/alarm) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=harmful_preventive&chapter=alarm) · [Visit the supporting room](https://sohamsa.github.io/baton/#/experiments?chapter=alarm)

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

### The Contract with Missing Pages

The courier returns a contract, but some pages never arrived. It cannot safely become the record everyone relies on.

**The clue:** Inspect shard completeness, verification state, reachability, and compatibility.

**The revelation:** A requested or partially written checkpoint is not a usable restore point.

**Ask your team:** When did we last demonstrate a restore, including rejection of a bad save?

**Open the evidence drawer:** `shards_present`, `shards_expected`, `checksum_ok`, `verified_at`.

*Rehearsal scope: Engine rehearsal: abstract completeness gates and checkpoint fallback; no real tensor files.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=incomplete_checkpoint&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/checkpoints?chapter=suspects)

### The Missing Choir Singer

One singer leaves, but the arrangement still requires their part. Continuing needs a supported new arrangement.

**The clue:** The runtime capability and dependent rank groups constrain recovery.

**The revelation:** A desired smaller restart is not automatically a supported restart.

**Ask your team:** What membership changes does our training framework actually support?

**Open the evidence drawer:** `runtime capability`, `rank assignments`, `tp_size`, `topology_signature`.

*Rehearsal scope: Engine rehearsal: unsupported reconfiguration is rejected.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=unsupported_local_recovery&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/dependencies?chapter=suspects)

### The Yesterday Weatherman

The forecast sounds confident until someone checks when it was recorded. Yesterday’s evidence cannot settle tonight’s diagnosis.

**The clue:** Compare event time with availability time and identify missing independent confirmation.

**The revelation:** Abstain from uncertain diagnosis while pursuing fresh evidence and reliable liveness.

**Ask your team:** How do we identify stale readings and separate sensor loss from machine failure?

**Open the evidence drawer:** `event_step`, `availability_step`, `freshness_steps`, `heartbeat`.

*Rehearsal scope: Engine rehearsal: delayed observations and abstention.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=stale_telemetry&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/monitoring?chapter=suspects)

### The Tired Runner

Everyone remains on the track, but one runner quietly loses pace. The finish line moves further away.

**The clue:** Per-rank execution latency and collective waiting would reveal the slowdown.

**The revelation:** Performance degradation deserves investigation even without a crash.

**Ask your team:** Can we identify the slowest dependent ranks without confusing workload variation with damage?

**Open the evidence drawer:** `step latency (proposed)`, `collective wait`, `workload phase`.

*Rehearsal scope: Conceptual story; existing rehearsal uses thermal degradation, not a latency-driven straggler model.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=silent_straggler&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/silicon?chapter=suspects)

### The Revolving Door Patient

A patient passes an idle check, returns to the race, and falters under load. Recovery is not the same as qualification.

**The clue:** Seek load-test outcomes and repeat-failure history.

**The revelation:** Define evidence-based return-to-service criteria.

**Ask your team:** What tests and approvals are required before repaired equipment rejoins production?

**Open the evidence drawer:** `repair history (proposed)`, `qualification results (proposed)`, `actions`.

*Rehearsal scope: Conceptual qualification lesson; the current frontend canary is a demonstration timer.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/suspects) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=revolving_door&chapter=suspects) · [Visit the supporting room](https://sohamsa.github.io/baton/#/dispatch?chapter=suspects)

> **The question you carry forward:** What shared dependency or missing evidence could change our response?

[Step into this chapter](https://sohamsa.github.io/baton/#/journey/suspects) · [Inspect the saved progress](https://sohamsa.github.io/baton/#/checkpoints?chapter=suspects)


---

## Act IV · The past enters the room

A technician asks whether the trouble began today. Perhaps the power system, circuit board, cooling installation, or an earlier assembly step left a clue. The investigation expands beyond the chip’s temperature.

The Midnight Power Cliff, Cracked Solder Bead, Edge-of-the-Oven Cookie, Framed Innocent, Thermal Shadow, Over-Torqued Wrench, and Whispering Voltage Cliff introduce the wider world around the accelerator.

These are conceptual investigations. Their existing rehearsals simplify the underlying mechanisms; they do not prove packaging diagnosis, voltage prediction, batch cordoning, or facility control. Some evidence would require manufacturer records or specialist instrumentation. Learn what to request, and recognize what remains unknowable without it.

### The Midnight Power Cliff

The whole kitchen starts its ovens together. The owner discovers that workload changes also reach the electrical system.

**The clue:** Power over time, shared supply limits, and the actual contract determine the investigation.

**The revelation:** Electrical transients and billing demand windows are different questions.

**Ask your team:** Have electrical specialists reviewed ramps, capacity, and our actual demand terms?

**Open the evidence drawer:** `power_draw_w`, `power_domain_id`, `facility demand (proposed)`.

*Rehearsal scope: Simplified shared-power rehearsal; no electrical transient or tariff-window model.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=power_cliff&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/grid?chapter=origins)

### The Cracked Solder Bead

A tiny connection becomes the suspected weak link. The visible error does not identify the microscopic cause on its own.

**The clue:** Memory and link symptoms need corroborating specialist diagnostics.

**The revelation:** Keep component-level causes as hypotheses until evidence distinguishes them.

**Ask your team:** What diagnostic evidence would distinguish memory, packaging, board, and software faults?

**Open the evidence drawer:** `ecc_sbe_total`, `ecc_dbe_total`, `nvlink_replay_total`.

*Rehearsal scope: Conceptual packaging story; existing rehearsal uses thermal degradation.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=fractured_microbump&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/mcm?chapter=origins)

### The Edge-of-the-Oven Cookie

One batch member fails. The owner asks whether the rest share a risk, rather than declaring every sibling guilty.

**The clue:** Trusted manufacturing identifiers and cohort comparisons would be needed.

**The revelation:** Shared history suggests an investigation, not proof of a defective batch.

**Ask your team:** Can suppliers provide traceable lot records, and how would we test a cohort hypothesis?

**Open the evidence drawer:** `wafer lot (optional supplier record)`, `cohort outcomes (proposed)`.

*Rehearsal scope: Conceptual lineage story; no implemented batch diagnosis or cohort cordoning.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=wafer_lot_contagion&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/lineage?chapter=origins)

### The Framed Innocent

The chip receives the blame while its supporting board supplies unstable power. An expensive replacement might leave the cause untouched.

**The clue:** Compare symptoms with board and shared-domain evidence.

**The revelation:** Investigate the surrounding system before replacing the accused component.

**Ask your team:** What board-level evidence do we require before approving accelerator replacement?

**Open the evidence drawer:** `power_domain_id`, `power_limit_w`, `board rail telemetry (optional)`.

*Rehearsal scope: Conceptual board diagnosis; existing rehearsal uses thermal degradation.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=innocent_chip_dying_board&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/boards?chapter=origins)

### The Thermal Shadow

One part of the building receives less cooling. The owner needs a map, not just a list of hot machines.

**The clue:** Rack position, temperature patterns, and coolant measurements would establish the spatial story.

**The revelation:** Shared cooling geometry can matter more than an individual chip reading.

**Ask your team:** Do our cooling maps and measurements reveal which machines share a vulnerable loop?

**Open the evidence drawer:** `cooling_domain_id`, `gpu_temp_c`, `rack elevation (proposed)`, `flow or pressure (optional)`.

*Rehearsal scope: Conceptual spatial lesson; no modeled rack gradient or valve-flush action.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=rack_thermal_shadow&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/racks?chapter=origins)

### The Over-Torqued Wrench

An assembly mistake leaves a clue in an earlier chapter of the machine’s life. The owner asks for records before drawing conclusions.

**The clue:** Installation history and specialist mechanical evidence would be needed.

**The revelation:** Lifecycle records can support investigation but do not prove a physical defect.

**Ask your team:** Which installation and assembly records are available, and who can interpret them?

**Open the evidence drawer:** `assembly records (optional)`, `torque history (optional)`, `qualification results (proposed)`.

*Rehearsal scope: Conceptual assembly story; no torque diagnosis or warranty automation.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=cold_plate_torque_fracture&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/passport?chapter=origins)

### The Whispering Voltage Cliff

The room looks calm, but correct-looking operation may conceal incorrect computation. A normal thermometer cannot answer every question.

**The clue:** Computation validation and electrical evidence would matter, not temperature alone.

**The revelation:** Protecting file integrity does not prove that the computations inside a file were correct.

**Ask your team:** What checks could reveal silent computation errors before they enter our trusted saves?

**Open the evidence drawer:** `computation validation (proposed)`, `voltage margin (specialist)`, `checkpoint integrity`.

*Rehearsal scope: Conceptual correctness story; no voltage-margin predictor, weight-corruption model, or pacing control.*

[Enter this character’s scene](https://sohamsa.github.io/baton/#/journey/origins) · [Open the rehearsal](https://sohamsa.github.io/baton/#/desk?scenario=silent_subthreshold_cliff&chapter=origins) · [Visit the supporting room](https://sohamsa.github.io/baton/#/anomalies?chapter=origins)

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

`content/owner-journey.json` supplies both the dashboard chapters and this README. After editing it, run `python scripts/build_owner_readme.py` and commit the regenerated README. The journey tests check character coverage, route targets, and narrative parity.

Read [the runtime boundaries](docs/runtime.md), [limitations](docs/limitations.md), [model card](docs/model-card.md), and [validation notes](docs/validation.md) for technical detail.

**The final scene belongs to you:** take one question from this story into a real conversation, and ask your team to bring the evidence.
