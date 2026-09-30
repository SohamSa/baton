# Baton: The machines were busy. The work had stopped.

[Open Baton: the complete owner workspace](https://sohamsa.github.io/baton/)

You do not need to know how a chip is built to ask the question that starts this story: if the machines are busy, why has the work stopped?

Perhaps your first datacenter is still an idea. Perhaps you already own buildings full of equipment and depend on other people to explain what happens inside them. Baton puts you beside an owner who starts with the same uncertainty. You meet the systems one by one, discover how they can let each other down, and learn what a supported response needs.

Then the investigation becomes something you can use. You shape a fictional facility plan, rehearse competing responses, examine recovery evidence, and leave with a review for your own team. Everything lives in one dashboard, with your place in the story preserved as you move between its tools.

*The facilities, evidence, and simulations are fictional. Baton supports learning and evidence reviews; real designs and operating decisions need site-specific engineering.*

In the dashboard, the same navigation stays with you: **Basics → Data → Story → Plan → Rehearse → Operations → My review**. This is a suggested journey, not a locked sequence. Experienced readers can go straight to a tool. More tools holds the specialist investigations, and returning to Story keeps your chapter and build-or-operate context.

## Basics: get to know the room

Before Mira asks you to interpret an alarm, she draws the room. There are workers inside machines, machines inside racks, and work that crosses their boundaries. These are the few ideas you need to follow her investigation.

Before the investigation begins, get to know the equipment, the work, and the systems they share. You do not need chip expertise to start.

**Chip or accelerator.** A processor does calculations. In these rehearsals, an accelerator is one worker assigned to a training job. Its activity does not by itself prove that useful work is advancing.

**Server, rack, and facility.** A server houses accelerators. A rack groups servers. A datacenter facility contains racks and supporting infrastructure. These are different scopes: a problem in one worker does not automatically stop the whole building.

**Training job and rank.** Training adjusts a model using examples. A job assigns cooperating workers to that task. A rank is a worker’s assigned position. In a synchronized job, fast workers can wait for a missing or slow partner before the next step.

**Network.** Connections carry the results workers exchange. Delays and retries can slow the team even when its chips remain present. A heartbeat is a regular message reporting that a worker is still responding.

**Power and cooling.** Power supplies energy; cooling removes heat. Machines can share a power feed or cooling path. A dependency map shows those relationships, so a shared problem is not mistaken for many unrelated chip failures.

**Storage and checkpoint.** A checkpoint is saved training state. A job may return to it after an interruption and repeat later work. The save must be complete, verified, reachable, and compatible. A recent file or a save still being written is not enough.

**Recovery, compatible spares, and qualification.** Recovery depends on the software’s supported procedures and available compatible machines. Qualification tests whether a repaired candidate meets defined return-to-service conditions. A successful idle reboot is not proof of fitness for the workload.

**Useful progress and tradeoffs.** Goodput means new useful progress per elapsed time. Repeated calculations do not count as new work. Saves, restarts, slower pacing, and unnecessary interventions all consume time; a response must be assessed against those costs.

## Data: turn the records into questions

Next she opens the records. The screen contains more columns than you could reasonably remember. You do not need to memorize them. You need to know which question a record can answer, how it connects to other records, and when it cannot support a decision.

A catalog tells you what a field means and where it belongs. It is not a live feed and does not mean every listed measurement exists in every rehearsal.

A table groups related records. A row is one record; a column is one factor. Shared identifiers connect records: a chip reading needs its chip identity and time; a saved state needs its job identity.

An observation is a reported reading. A derived field summarizes or compares readings. A control input describes an authored choice. Audit records document what happened. Latent truth and training labels are evaluator material, not evidence the operator may use.

Unknown is not zero. A null reading can mean missing or unsupported information. Zero is a measured value only when an observation actually supports it.

When something happened and when the report arrived are different times. Old evidence can be accurate about the past and still be unsuitable for a present decision.

The dictionary is broader than generated observations or model inputs. The operational decision uses a smaller supported evidence set. A definition alone does not establish that a sensor is connected or that a diagnosis is proven.

Mira starts with the evidence that connects directly to the work:

| Question to ask | Fields to read together | Why they belong together |
| --- | --- | --- |
| Temperature, power, and workload | `gpu_temp_c`, `power_draw_w`, `sm_util_ratio` | Read these together. Heat during hard work and heat unexplained by the work are different questions. |
| Identity and time | `entity_id`, `event_step`, `availability_step` | Put a reading beside the right worker and moment, and check whether its delivery was delayed. |
| Pace and errors | `step_latency_ms`, `nvlink_replay_total`, `ecc_sbe_total` | A worker can remain present while falling behind. Error and retry reports are clues, not proof of a microscopic cause. |
| Saved work | `checkpoint_id`, `shards_present`, `shards_expected` | Check whether all pieces of a save exist. Restore eligibility also depends on verification, reachability, and compatibility. |
| Shared dependencies | `power_domain_id`, `cooling_domain_id`, `job_id` | Find machines sharing a supply, a cooling path, or cooperating work before deciding how far a problem reaches. |
| Progress and decisions | `useful_new`, `recomputation`, `precondition_hash` | Distinguish new work from repetition and preserve the conditions under which an action was reviewed. |

In the dashboard, Data introduces these questions before the full catalog. You can expand the catalog right there, search by field, table, or topic, and filter by evidence role. Definitions explain meaning, units, missing values, source relationships, consumers, and the impact of missing evidence. A wide dictionary becomes useful when you can choose the smaller set that answers the question in front of you.

## Story: follow the work

Now the records have a purpose. You walk into the facility with Mira. The problem is no longer a vocabulary exercise: someone must decide what to do while useful work is slipping away. Each passage in the dashboard offers a relevant tool, a rehearsal when available, and a way to record the evidence you still need. You can follow those steps or keep reading.

### The number that stopped moving

“Everything is running,” the report says. You look through the glass. Fans turn, lights blink, and the room hums with expensive activity. Then you notice the number showing completed work. It has not moved.

You own this place, but you cannot see inside its chips. The machines arrived with specifications, warranties, and promises. None of those tells you why this particular job has stopped tonight. You ask the engineer beside you a question that needs no technical vocabulary: “If they are all busy, what are we getting done?”

Her name is Mira. She points past the machines to the job they share. “Let’s follow the work,” she says. “A light tells us a machine is on. It doesn’t tell us the team is moving forward.”

Until now, you have thought of the datacenter as a collection of equipment. Tonight you will discover its relationships: who waits for whom, what they share, what can survive an interruption, and which apparent fixes create another problem. The investigation starts with that unmoving number.

### The worker everyone waits for

Mira opens a drawing of the job. Each accelerator is a worker doing calculations. Training is the repeated work of adjusting a model using examples. This job divides that work among several machines, which exchange results before moving on together. The network carries those exchanges. Fast workers can reach a meeting point and wait for the slowest member.

One worker still sends its heartbeat, the regular message that says it is present. Its calculations simply take longer than its peers. Nothing has disappeared. Yet the whole assigned team is losing pace. This is the Tired Runner: a machine that looks alive while making its partners wait.

“Then replace it,” you say. Mira asks where the job would resume. Its latest work exists across cooperating machines. Storage periodically collects their state into a checkpoint, a saved position from which the job can restart. Replacing a worker may require stopping, restoring that state, and repeating everything done since the save.

Now the tradeoff becomes visible. Save constantly and writing interrupts progress. Save rarely and an interruption can erase a longer stretch of work. Even a successful replacement takes time. The relevant measure is goodput: new useful work completed over elapsed time. Busy time and repeated work cannot substitute for it.

The drawing also changes your sense of scale. An accelerator sits in a server; servers sit in racks; racks sit in a facility. A job has its own cooperating membership. A failed worker can stall that job without stopping every other job in the building. Before accepting a claim about “the whole cluster,” you ask which work actually depends on the failed member.

You have found one reason the number can stop. Then an alarm sounds. One machine is getting hot, and someone is already proposing another replacement.

### The alarm and the expensive mistake

The temperature curve rises sharply. A technician wants to remove the machine before it fails. Mira brings up the workload beside the temperature. The job has become busier; the machine is drawing more power and producing more heat. The cooling system must carry that heat away. A hot machine can be working hard, struggling, or both. The curve alone cannot tell you which.

This one is the Hard-Working Chef. Its heat rises with its workload. Stopping it merely because it crossed an arbitrary threshold can turn healthy work into an interruption. The Overzealous Referee is the decision that follows: a protective action with a cost nobody counted. Independent equipment safety protections still matter; the mistake is treating an isolated dashboard reading as a diagnosis.

Another machine tells a different story. Its temperature is higher than the workload and reported power would ordinarily explain in this simplified model. That unexplained difference is called a residual. The Feverish Athlete keeps working, but the comparison gives the team a reason to investigate and consider saving progress before trouble deepens. It does not tell them an exact time of failure.

You ask to see both possible responses. In a rehearsal, an early save can preserve work when warning evidence is useful. In another, unnecessary intervention sacrifices progress. “How many alarms did we catch?” is no longer enough. You also want to know how much useful work a response protected, interrupted, or forced the team to repeat.

Before the investigation is finished, a different worker goes silent. No helpful curve preceded it. The Sudden Ghost leaves you with the preparation already in place: a usable save, compatible replacement capacity, and a recovery procedure. An early-warning system cannot manufacture a warning the observations never contained.

Then several neighboring machines report trouble together. If each is an individual suspect, you will need several replacements. Mira asks whether you are looking at several failures or one shared cause.

### The replacement that changed nothing

The affected machines share an electrical supply. On the dependency map, their paths meet at the same power domain. The Kitchen Circuit Breaker makes its entrance through that common connection. Correlated symptoms are a reason to investigate the shared supply before treating every chip as an independent failure.

You follow the same reasoning down to a server. A chip has been replaced, yet the trouble returns. The board underneath it still supplies unstable power in the rehearsal. The Framed Innocent was never the whole problem. Buying another chip changes the accused component while leaving the modeled cause in place.

The team proposes a restart from the newest checkpoint. Its timestamp looks reassuring. Mira opens its status instead. Some pieces, or shards, are still being written. The Contract with Missing Pages cannot restore a coherent job just because a file exists. A usable save must be complete, verified, reachable, and compatible with the recovery being attempted.

An older verified save may be the supported option, with more work to repeat. If no save qualifies, the team must report that limit. A newer timestamp cannot recover state that was never successfully saved. You begin to understand why restore drills matter before an emergency, while there is still time to discover missing pieces.

Someone suggests dropping the failed worker and letting the others continue. But a rank is an assigned position in this cooperating job, and the current arrangement still needs that position. The Missing Choir Singer has left a required part. Changing membership depends on what the software runtime actually supports; spare machines elsewhere do not grant it that capability.

A facility report seems to settle the electrical question. Then you check its recording time. It describes an earlier state and arrived late. The Yesterday Weatherman sounds precise while answering the wrong moment. Missing or old evidence needs fresh corroboration, not a more confident interpretation. Reliable independent signs of liveness can still guide the response while diagnosis remains uncertain.

The repaired worker passes a quiet idle check, returns to the job, and fails again under load. The Revolving Door Patient teaches the last painful distinction: booting successfully is not the same as qualifying for this workload. In the rehearsal, a candidate that fails its defined stress test stays quarantined. If no compatible spare remains, recovery is blocked.

The replacement invoice was easy to understand. The work around it was not: finding the cause, choosing a usable save, matching the software capability, and qualifying the replacement. You ask Mira how many of those relationships were considered when the equipment was first installed.

### What the machines brought with them

Mira brings installation records, batch identifiers, and a map of the racks. The chip is still a black box. You cannot see its microscopic construction, but you can ask about the world around it and the history it shares with other machines.

In one rack, upper positions run hotter while another rack remains comparatively unaffected. The Thermal Shadow becomes visible only when temperature is placed on a map beside reported cooling flow. Replacing a list of hot chips would miss a shared cooling restriction. The question becomes which machines share the affected path and what restoring that path requires.

The evening workload is also growing. When too much modeled demand reaches one power domain, it trips. The Midnight Power Cliff is a capacity problem rather than a lone hot chip. Pacing the workload can preserve continuity, but it also slows useful work. When sufficient headroom already exists, the same pacing can cost progress unnecessarily. Electrical protection, supply capacity, and the billing contract are related concerns with different evidence requirements.

Another worker stays present but retries exchanges and falls behind. The Cracked Solder Bead names a suspected weak connection, not something the dashboard has seen through a microscope. The rehearsal models retries and delay. A real retry signal could have several causes; it does not establish a particular physical defect. The owner can ask for corroboration without pretending to diagnose the package.

Two machines with a shared lot identifier report errors. The Edge-of-the-Oven Cookie asks whether their common manufacturing history matters. A lot identifier groups records; it does not declare a whole batch guilty. The model can make several members faulty, or only one. Replacing an entire cohort on weak evidence can remove healthy workers and spend more progress than it protects.

An assembly record suggests a different shared history. In the Over-Torqued Wrench rehearsal, an invented mounting condition produces strain as the machine warms. The lesson is why installation records and mechanical investigation can matter. A torque entry alone cannot prove a physical defect, and a teaching relationship is not a real installation limit.

The final clue is unsettling because the room still looks calm. In the Whispering Voltage Cliff rehearsal, computation becomes invalid before temperature would explain a problem. Validation catches a mismatch, and the model refuses to count invalid work as useful progress or save it as a valid checkpoint. A file can be intact while the calculations inside it are wrong. Slowing the worker helps in some invented conditions; in others it cannot restore validity.

You close the records with a different question from the one you brought in. Not “Which chip should I buy?” but “Which explanation fits the evidence, what would distinguish it from the alternatives, and what work would each response put at risk?” That evening, the alarms begin arriving together.

### Which work can we bring back?

The workload is rising. A fresh temperature alarm draws everyone toward one machine. The facility report beside it is old. A worker stops responding. The newest checkpoint is still being written. Someone suggests removing the missing rank and carrying on.

Earlier, each message might have supplied an answer by itself: heat means replace, new means usable, many remaining workers means continue. Now you hear the unanswered questions inside each proposal.

You ask for current corroborating evidence and independent liveness checks. The alarm deserves attention, but the delayed report cannot establish tonight’s cause. You keep the distinction between a stopped worker and an uncertain diagnosis.

You ask which checkpoint the recovery can actually restore. The team checks completeness, verification, reachability, and compatibility. If an older save is the newest one that qualifies, the repeated work becomes part of the plan. If none qualifies, that absence becomes part of the report.

Finally, you ask what membership changes the runtime supports and whether compatible, qualified capacity is available. For the job in this account, the team has an older verified save and a compatible replacement that passed its defined checks. The runtime requires a coordinated restart. You accept the work that must be repeated and ask the team to confirm when new useful progress resumes. If those prerequisites had been absent, the plan would have had to name the blocker instead.

After the restart and the repeated work, the number begins moving beyond its old position. Mira points to it again. The relief is earned: the team can explain what was restored, what was lost, and why this recovery was supported. The room has not become simple. You have become harder to mislead. You can connect a warning to its evidence, an action to its prerequisites, and an apparent recovery to the work it really preserves.

### The next building starts here

At dawn, the machines look much as they did when you arrived. Fans turn. Lights blink. But you no longer mistake their activity for the outcome. You know to follow useful work through the people, software, equipment, and shared systems that make it possible.

If your first datacenter is still a drawing, tonight’s questions belong in that drawing. Ask how jobs depend on power, cooling, network, and storage; which observations suppliers can actually provide; how saved state will be restored; and what compatible recovery capacity must be available. Ask the specialists to demonstrate the procedures before launch, while changing the design is still an option.

If you already operate facilities, bring a recent interruption into the review. Was the evidence current? Did the first diagnosis survive investigation? Could the selected save restore the job? Did the replacement pass a meaningful qualification? Did useful progress resume, or did the dashboard merely turn green?

Baton gives you a place to explore those questions using fictional facilities, invented evidence, and simplified simulations. It cannot certify a real design or replace site-specific engineering. What it can give you is a connected way to reason, recognize missing evidence, and participate in decisions you once had to accept on faith.

Your next step does not need to be a purchase. Choose one unanswered question about your facility. Name who can bring the evidence and what they should demonstrate. The worksheet turns that question into a review you can save, print, and carry into the room.

The next time someone says “Everything is running,” you know where to look. You follow the work.

## Plan: Put the next building on the table

The investigation is over, but Mira keeps the dependency drawing. You place your proposed building beside it. This time, the questions arrive before the equipment does: what work will share a power supply, where will heat go, and how will a stopped job return?

In Plan, you can change the fictional inventory, assumed accelerator power, additional IT power, and facility PUE. PUE compares total facility power with IT power; it accounts for supporting loads rather than making them disappear. The planner calculates an illustrative IT load and applies PUE once to show facility load. You can also choose a cooling approach to discuss. That choice is a label for the review, not proof of a safe design.

The same planning assumptions appear in the executive overview, facility map, and power tool. You do not have to reconcile several competing versions of your example. The facility map offers fictional campuses focused on different dependencies: shared power, compatible spares, cooling, and checkpoint storage. Separate campuses are not one globally synchronized job, and their inventory is not multiplied into a rehearsal result.

The power tool takes the conversation further. Can the supply tolerate the workload? What energy would operation consume? How does the contract measure billed demand? Capacity, energy, and billing need different evidence. A planning total cannot answer an electrical-transient question, and a power-domain rehearsal does not produce a utility bill.

You leave this step with assumptions to challenge and records to request: dependency maps, supplier limits, restore procedures, compatible spare arrangements, and qualification requirements. Changing the facility example does not resize the simulated job. Those are different scopes, and the dashboard keeps that distinction visible.

## Rehearse: Try the response before the emergency

Back at the practice floor, you can ask the question an emergency rarely allows: what would have happened if we had responded differently?

Rehearse lets you choose one of the problems you met in the story. Compare two responses under the same synthetic conditions, or use the interactive mode to review a proposed action yourself. The observations, decisions, saved work, repeated work, and new useful progress come from the Python engine. A successful-looking screen is not the result; the work that actually survives is.

Standard conditions explain the intended lesson. Challenge conditions test its limits. A save can protect progress when a warning is useful; unnecessary intervention can interrupt healthy work. Pacing can prevent a modeled power-domain failure; with sufficient headroom, it can simply slow the job. A repaired candidate can pass an idle check and still fail qualification under load.

You can change compatible spare capacity, checkpoint spacing, observation delay, and supported warning strength. Rerun the comparison and inspect the inputs actually used. A reusable link preserves the selected conditions, and reset brings back the preset. These controls change declared teaching conditions; they do not calibrate the example to your hardware.

Recovery Crossroads brings several problems into one engine world: delayed evidence, failed workers, a save interrupted while being written, and replacement capacity that may or may not be sufficient. An older eligible save and enough compatible capacity can support a coordinated restart. Remove a prerequisite and the response may be blocked. The concluding story discussion and this executable scenario serve different purposes: one develops your reasoning; the other lets you examine consequences under specified conditions.

## Operations: Ask whether the work is really back

A replacement has arrived. It boots. Someone is ready to declare the incident closed. You remember the Revolving Door Patient and ask what happened under the workload it must actually carry.

Operations opens the return-to-service investigation and its qualification rehearsal. Inspect the matching scenario’s observed evidence and the questions your team should answer. A candidate that fails the modeled checks stays out of the job; a browser timer does not award it a pass. This is a place to practise operating decisions, not a connection to physical equipment or a technician-dispatch service.

When the explanation is uncertain, the supporting tools help you follow the chain rather than accept a headline. Dependencies show shared systems. Device and incident views locate affected workers and grouped symptoms. Checkpoints expose saved-state status; recovery exposes the proposed response and its prerequisites; audit records expose decisions. Experiments compare the recorded consequences of different responses.

Other investigations follow the black box outward: processor pace, board power, rack cooling, manufacturing families, packages, installation history, and computation validity. Their records help you ask what would distinguish one explanation from another. A retry does not reveal a microscopic crack, and a shared batch identifier does not convict every chip in that batch.

The evidence and uncertainty tool also makes the intelligence boundary visible. Support rankings are not calibrated failure probabilities; missing evidence can justify abstaining. The checked learned model did not beat the simpler baseline, so rules remain the operational default. The model and monitoring views expose the project’s evaluation and monitoring information rather than turning synthetic evidence into a real-fleet prediction.

Your closing question is the one that began the night: has new useful work resumed? You want a supported restore, qualified capacity, and evidence of progress beyond the point already reached. A green indicator alone cannot supply them.

## My review: Leave with a question your team can answer

The most useful thing you take away is not a fictional answer about your building. It is a sharper request for evidence.

My review starts with a blank facility worksheet. Name the review, choose whether you are building or operating, and record the affected job size if you know it. Your facility details stay separate from the planning example and do not silently recalibrate the rehearsals.

For each topic, the worksheet explains the question, suggests records and a responsible team, and gives you space for evidence status, an owner, record references, unresolved questions, and the next demonstration to request. You can move from a review question back into its related rehearsal. The list of unresolved topics counts your answers; it is not a readiness score or independent validation.

Reading progress, story decisions, and notes stay in this browser. Worksheet answers can be downloaded as a readable review or as worksheet data, or printed for a meeting. Shared planning and financial assumptions are also browser-local; export the worksheet when you need a copy to keep or share.

If you want to discuss financial implications, the executive overview and supporting tools offer an assumption-based illustration. Currency, job size, value per accelerator-hour, incident frequency, downtime, repeated work, investment, and recurring costs must come from you. Blank inputs stay unknown. The illustration uses the affected job and your stated assumptions; it is not measured savings, a predicted return, or a promise about your whole fleet.

You can now enter a design review or operating meeting with a concrete request: show us which systems share this failure, which save we can restore, what the runtime supports, who qualifies the replacement, and how we will confirm useful progress. You still need site-specific expertise. You can participate in that conversation with a connected understanding of what the evidence must establish.

### Where the supporting tools fit

These tools live inside the same dashboard. Open More tools when you need a closer look; the owner navigation remains available.

| Follow this question | Tools inside Baton |
| --- | --- |
| How do the example, current rehearsal, and financial assumptions relate? | Executive overview and facility map |
| Is the issue in a worker, its board, its package, or a shared rack? | Processor health, baseboard power, multi-chip assembly, rack plumbing and power |
| What history might the affected machines share? | Manufacturing batches, factory quality and bins, digital chip passport |
| Does the proposed explanation have enough support? | AI early warning, AI helper models, monitoring |
| What failed, what can restore, and what action was reviewed? | Dependencies, devices, incidents, checkpoints, operator decisions, audit, experiments |
| What should the owner ask about power and recurring problems? | Utility grid and PPA scorecard, problem questions |

The next time someone says “Everything is running,” you have somewhere to start and a way to follow through. Begin with the basics, read the evidence, follow the story, test a response, and carry an unanswered question into your review. Baton keeps those steps together.

[Continue in the complete Baton dashboard](https://sohamsa.github.io/baton/)

<details>
<summary>For readers who want the model evidence or want to run the project</summary>

The [evidence companion](docs/story-reference.md) contains every problem’s observations, invented inputs, response gates, limitations, and challenge conditions. The full searchable field catalog is available inside the dashboard’s Data page.

## Run and contribute

The Python engine owns simulation and decisions. The public dashboard runs it in a browser worker; rehearsal startup requires network access for Pyodide. No physical telemetry or equipment control is connected. The checked learned model did not beat its baseline, so rules remain the operational default.

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

Start the browser demo with `VITE_PUBLIC_DEMO=true npm run dev` (PowerShell: `$env:VITE_PUBLIC_DEMO="true"; npm run dev`). For the authenticated API, see the [quickstart](docs/quickstart.md).

`content/owner-journey.json` supplies the dashboard, README, and evidence companion. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit the generated files. Foundation text comes from `content/owner-foundations.json` and the README’s practical narrative from `content/owner-readme-workspace.json`; regenerate the standalone catalog with `python scripts/build_learning_catalog.py` after dictionary changes.

Technical detail: [runtime](docs/runtime.md) · [limitations](docs/limitations.md) · [model card](docs/model-card.md) · [validation](docs/validation.md).

</details>
