# Baton: The machines were busy. The work had stopped.

[Read and explore in the dashboard](https://sohamsa.github.io/baton/) · [Evidence and model reference](docs/story-reference.md)

*A fictional learning story. Its evidence and simulations are synthetic; real facility decisions require site-specific engineering.*

## The number that stopped moving

“Everything is running,” the report says. You look through the glass. Fans turn, lights blink, and the room hums with expensive activity. Then you notice the number showing completed work. It has not moved.

You own this place, but you cannot see inside its chips. The machines arrived with specifications, warranties, and promises. None of those tells you why this particular job has stopped tonight. You ask the engineer beside you a question that needs no technical vocabulary: “If they are all busy, what are we getting done?”

Her name is Mira. She points past the machines to the job they share. “Let’s follow the work,” she says. “A light tells us a machine is on. It doesn’t tell us the team is moving forward.”

Until now, you have thought of the datacenter as a collection of equipment. Tonight you will discover its relationships: who waits for whom, what they share, what can survive an interruption, and which apparent fixes create another problem. The investigation starts with that unmoving number.

## The worker everyone waits for

Mira opens a drawing of the job. Each accelerator is a worker doing calculations. Training is the repeated work of adjusting a model using examples. This job divides that work among several machines, which exchange results before moving on together. The network carries those exchanges. Fast workers can reach a meeting point and wait for the slowest member.

One worker still sends its heartbeat, the regular message that says it is present. Its calculations simply take longer than its peers. Nothing has disappeared. Yet the whole assigned team is losing pace. This is the Tired Runner: a machine that looks alive while making its partners wait.

“Then replace it,” you say. Mira asks where the job would resume. Its latest work exists across cooperating machines. Storage periodically collects their state into a checkpoint, a saved position from which the job can restart. Replacing a worker may require stopping, restoring that state, and repeating everything done since the save.

Now the tradeoff becomes visible. Save constantly and writing interrupts progress. Save rarely and an interruption can erase a longer stretch of work. Even a successful replacement takes time. The relevant measure is goodput: new useful work completed over elapsed time. Busy time and repeated work cannot substitute for it.

The drawing also changes your sense of scale. An accelerator sits in a server; servers sit in racks; racks sit in a facility. A job has its own cooperating membership. A failed worker can stall that job without stopping every other job in the building. Before accepting a claim about “the whole cluster,” you ask which work actually depends on the failed member.

You have found one reason the number can stop. Then an alarm sounds. One machine is getting hot, and someone is already proposing another replacement.

## The alarm and the expensive mistake

The temperature curve rises sharply. A technician wants to remove the machine before it fails. Mira brings up the workload beside the temperature. The job has become busier; the machine is drawing more power and producing more heat. The cooling system must carry that heat away. A hot machine can be working hard, struggling, or both. The curve alone cannot tell you which.

This one is the Hard-Working Chef. Its heat rises with its workload. Stopping it merely because it crossed an arbitrary threshold can turn healthy work into an interruption. The Overzealous Referee is the decision that follows: a protective action with a cost nobody counted. Independent equipment safety protections still matter; the mistake is treating an isolated dashboard reading as a diagnosis.

Another machine tells a different story. Its temperature is higher than the workload and reported power would ordinarily explain in this simplified model. That unexplained difference is called a residual. The Feverish Athlete keeps working, but the comparison gives the team a reason to investigate and consider saving progress before trouble deepens. It does not tell them an exact time of failure.

You ask to see both possible responses. In a rehearsal, an early save can preserve work when warning evidence is useful. In another, unnecessary intervention sacrifices progress. “How many alarms did we catch?” is no longer enough. You also want to know how much useful work a response protected, interrupted, or forced the team to repeat.

Before the investigation is finished, a different worker goes silent. No helpful curve preceded it. The Sudden Ghost leaves you with the preparation already in place: a usable save, compatible replacement capacity, and a recovery procedure. An early-warning system cannot manufacture a warning the observations never contained.

Then several neighboring machines report trouble together. If each is an individual suspect, you will need several replacements. Mira asks whether you are looking at several failures or one shared cause.

## The replacement that changed nothing

The affected machines share an electrical supply. On the dependency map, their paths meet at the same power domain. The Kitchen Circuit Breaker makes its entrance through that common connection. Correlated symptoms are a reason to investigate the shared supply before treating every chip as an independent failure.

You follow the same reasoning down to a server. A chip has been replaced, yet the trouble returns. The board underneath it still supplies unstable power in the rehearsal. The Framed Innocent was never the whole problem. Buying another chip changes the accused component while leaving the modeled cause in place.

The team proposes a restart from the newest checkpoint. Its timestamp looks reassuring. Mira opens its status instead. Some pieces, or shards, are still being written. The Contract with Missing Pages cannot restore a coherent job just because a file exists. A usable save must be complete, verified, reachable, and compatible with the recovery being attempted.

An older verified save may be the supported option, with more work to repeat. If no save qualifies, the team must report that limit. A newer timestamp cannot recover state that was never successfully saved. You begin to understand why restore drills matter before an emergency, while there is still time to discover missing pieces.

Someone suggests dropping the failed worker and letting the others continue. But a rank is an assigned position in this cooperating job, and the current arrangement still needs that position. The Missing Choir Singer has left a required part. Changing membership depends on what the software runtime actually supports; spare machines elsewhere do not grant it that capability.

A facility report seems to settle the electrical question. Then you check its recording time. It describes an earlier state and arrived late. The Yesterday Weatherman sounds precise while answering the wrong moment. Missing or old evidence needs fresh corroboration, not a more confident interpretation. Reliable independent signs of liveness can still guide the response while diagnosis remains uncertain.

The repaired worker passes a quiet idle check, returns to the job, and fails again under load. The Revolving Door Patient teaches the last painful distinction: booting successfully is not the same as qualifying for this workload. In the rehearsal, a candidate that fails its defined stress test stays quarantined. If no compatible spare remains, recovery is blocked.

The replacement invoice was easy to understand. The work around it was not: finding the cause, choosing a usable save, matching the software capability, and qualifying the replacement. You ask Mira how many of those relationships were considered when the equipment was first installed.

## What the machines brought with them

Mira brings installation records, batch identifiers, and a map of the racks. The chip is still a black box. You cannot see its microscopic construction, but you can ask about the world around it and the history it shares with other machines.

In one rack, upper positions run hotter while another rack remains comparatively unaffected. The Thermal Shadow becomes visible only when temperature is placed on a map beside reported cooling flow. Replacing a list of hot chips would miss a shared cooling restriction. The question becomes which machines share the affected path and what restoring that path requires.

The evening workload is also growing. When too much modeled demand reaches one power domain, it trips. The Midnight Power Cliff is a capacity problem rather than a lone hot chip. Pacing the workload can preserve continuity, but it also slows useful work. When sufficient headroom already exists, the same pacing can cost progress unnecessarily. Electrical protection, supply capacity, and the billing contract are related concerns with different evidence requirements.

Another worker stays present but retries exchanges and falls behind. The Cracked Solder Bead names a suspected weak connection, not something the dashboard has seen through a microscope. The rehearsal models retries and delay. A real retry signal could have several causes; it does not establish a particular physical defect. The owner can ask for corroboration without pretending to diagnose the package.

Two machines with a shared lot identifier report errors. The Edge-of-the-Oven Cookie asks whether their common manufacturing history matters. A lot identifier groups records; it does not declare a whole batch guilty. The model can make several members faulty, or only one. Replacing an entire cohort on weak evidence can remove healthy workers and spend more progress than it protects.

An assembly record suggests a different shared history. In the Over-Torqued Wrench rehearsal, an invented mounting condition produces strain as the machine warms. The lesson is why installation records and mechanical investigation can matter. A torque entry alone cannot prove a physical defect, and a teaching relationship is not a real installation limit.

The final clue is unsettling because the room still looks calm. In the Whispering Voltage Cliff rehearsal, computation becomes invalid before temperature would explain a problem. Validation catches a mismatch, and the model refuses to count invalid work as useful progress or save it as a valid checkpoint. A file can be intact while the calculations inside it are wrong. Slowing the worker helps in some invented conditions; in others it cannot restore validity.

You close the records with a different question from the one you brought in. Not “Which chip should I buy?” but “Which explanation fits the evidence, what would distinguish it from the alternatives, and what work would each response put at risk?” That evening, the alarms begin arriving together.

## Which work can we bring back?

The workload is rising. A fresh temperature alarm draws everyone toward one machine. The facility report beside it is old. A worker stops responding. The newest checkpoint is still being written. Someone suggests removing the missing rank and carrying on.

Earlier, each message might have supplied an answer by itself: heat means replace, new means usable, many remaining workers means continue. Now you hear the unanswered questions inside each proposal.

You ask for current corroborating evidence and independent liveness checks. The alarm deserves attention, but the delayed report cannot establish tonight’s cause. You keep the distinction between a stopped worker and an uncertain diagnosis.

You ask which checkpoint the recovery can actually restore. The team checks completeness, verification, reachability, and compatibility. If an older save is the newest one that qualifies, the repeated work becomes part of the plan. If none qualifies, that absence becomes part of the report.

Finally, you ask what membership changes the runtime supports and whether compatible, qualified capacity is available. For the job in this account, the team has an older verified save and a compatible replacement that passed its defined checks. The runtime requires a coordinated restart. You accept the work that must be repeated and ask the team to confirm when new useful progress resumes. If those prerequisites had been absent, the plan would have had to name the blocker instead.

After the restart and the repeated work, the number begins moving beyond its old position. Mira points to it again. The relief is earned: the team can explain what was restored, what was lost, and why this recovery was supported. The room has not become simple. You have become harder to mislead. You can connect a warning to its evidence, an action to its prerequisites, and an apparent recovery to the work it really preserves.

[Try the recovery discussion](https://sohamsa.github.io/baton/#/journey/finale) · [Run the combined scenario](https://sohamsa.github.io/baton/#/desk?scenario=recovery_crossroads&chapter=finale)

## The next building starts here

At dawn, the machines look much as they did when you arrived. Fans turn. Lights blink. But you no longer mistake their activity for the outcome. You know to follow useful work through the people, software, equipment, and shared systems that make it possible.

If your first datacenter is still a drawing, tonight’s questions belong in that drawing. Ask how jobs depend on power, cooling, network, and storage; which observations suppliers can actually provide; how saved state will be restored; and what compatible recovery capacity must be available. Ask the specialists to demonstrate the procedures before launch, while changing the design is still an option.

If you already operate facilities, bring a recent interruption into the review. Was the evidence current? Did the first diagnosis survive investigation? Could the selected save restore the job? Did the replacement pass a meaningful qualification? Did useful progress resume, or did the dashboard merely turn green?

Baton gives you a place to explore those questions using fictional facilities, invented evidence, and simplified simulations. It cannot certify a real design or replace site-specific engineering. What it can give you is a connected way to reason, recognize missing evidence, and participate in decisions you once had to accept on faith.

Your next step does not need to be a purchase. Choose one unanswered question about your facility. Name who can bring the evidence and what they should demonstrate. The worksheet turns that question into a review you can save, print, and carry into the room.

The next time someone says “Everything is running,” you know where to look. You follow the work.

[Build your facility review worksheet](https://sohamsa.github.io/baton/#/worksheet) · [Revisit the investigation](https://sohamsa.github.io/baton/)

---

## Explore what happened

The dashboard follows the same investigation. You can read without starting the simulation engine, then open a rehearsal to compare responses. Standard and challenge conditions show why an intervention can help, waste work, or fail when a prerequisite is missing. Owner controls let you change spare capacity, save spacing, observation delay, and supported warning strength, then rerun both policies under the same conditions. A reusable link preserves your choices.

[The evidence companion](docs/story-reference.md) keeps every problem’s observations, invented inputs, response gates, limitations, and challenge conditions together. The [data catalog](https://sohamsa.github.io/baton/#/data) explains the wider field dictionary. The [owner worksheet](https://sohamsa.github.io/baton/#/worksheet) starts blank and saves your questions locally, with download and print options.

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

`content/owner-journey.json` supplies the dashboard, README, and evidence companion. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit the generated files.

Technical detail: [runtime](docs/runtime.md) · [limitations](docs/limitations.md) · [model card](docs/model-card.md) · [validation](docs/validation.md).
