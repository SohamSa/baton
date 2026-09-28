# TrainingContinuity

Open the practice floor: https://sohamsa.github.io/training-continuity/

That link is the product. It opens in the browser. There is nothing to install and no second address. The first screen starts a rehearsal on its own. If you still see an older, quieter page, reload once.

This file is the briefing for that page. It is written for an owner who runs data centers today, or expects to build them, and who does not need a background in chips to follow the argument.

## The picture, before the vocabulary

Picture a relay race inside a large building.

Each runner is a **chip**: a specialized processor that does the heavy math. Ordinary office computers have a chip too. The chips in this project are the kind packed into racks in a data center, many of them on one machine, many machines in one row, many rows in one hall.

The race is a **training job**. A company is teaching a large model, the way a student studies before an exam. “Pre-training” is that long study session, done before the model is asked to do a particular job. The study happens in small steps. Every chip in the job has to finish the same step before the group is allowed to take the next one.

That is the whole problem in one sentence. **If one runner stops, the baton does not move, even while the rest of the building is still powered, cooled, and staffed.** You can own thousands of chips and still be paying for a hall that is waiting on one of them.

TrainingContinuity is a rehearsal of that moment. The hall in the rehearsal has 32,768 chips: 256 racks, 4,096 machines, 8 chips on each machine. The job itself uses a handful of those chips, and those are the ones with a personal chart. The others are counted, the way a warehouse counts boxes on the back shelves. They are part of the same hall. They are not filmed one by one, and this page is not plugged into a building you own.

## Words you will meet

You can skip back here while you click through the site.

| Word on the page | In ordinary language |
| --- | --- |
| Chip, accelerator | A specialized processor. In this rehearsal, one runner in the race. |
| Hall, cluster | The whole building’s worth of those chips. Here, 32,768 of them, simulated. |
| Job, pre-training | The long study session. The group of chips that must finish each step together. |
| Step | One beat of that study. The group waits until every chip in the job has finished the beat. |
| Stall | The race has stopped because one runner stopped. The building can still be “on.” |
| Checkpoint, save | A snapshot of the work so far, like saving a document. Only a complete save can be reopened. |
| Exposure, unsaved work | How much study happened after the last complete save. That is what you lose if you have to start over. |
| False alarm | Treating a healthy busy spell as a breakdown, and shutting a good chip down. |
| Incident | One problem, even if several chips complain. Several dark rooms on one tripped breaker are one electrical problem. |
| Quarantine | Taking a chip out of the job, the way you would bench a player. |
| Rehearsal, story | A scripted situation you can watch and replay. The cause is written into the script. The public page does not show you that answer key. |
| Policy, way of reacting | A rule for what to do: wait, save early, restart the group, or pull a warm chip out. |
| Useful work, finished work | Study that would not have to be repeated. The bars on the overview are this score. |
| Return | A what-if in money, using hourly rates **you** type. It is not cash already saved. |

## Why an owner should care

The bill for a hall is mostly time. A chip that is powered and waiting is still a chip you paid to install, cool, and staff.

Three leaks sit under that bill.

1. **The stall.** One chip in the job stops. The job stops with it. The other machines in the job are still on, and they are not producing the next step.
2. **The unsaved work.** Anything that exists only in the chip’s memory is a document you never saved. A save that is still being written, or a save missing pieces, cannot be reopened. The restart goes back to the last complete save, and everything after that is done again.
3. **The false alarm.** A busy stretch makes chips warmer, the way a kitchen heats up during the dinner rush. A rule that says “if it is warm, shut it down” can throw away more finished work than the breakdown it was meant to prevent.

The benefit of seeing this clearly, before you buy a tool or write a runbook, is that you can tell those three leaks apart. A faster restart helps the sudden stop. An earlier save helps the slow heat problem. Leaving a healthy busy chip alone helps the false alarm. Using the wrong remedy on the wrong leak is how a careful operator loses the race anyway.

TrainingContinuity lets you watch each leak, approve or reject the serious move, and compare two reactions on the same script. It does that on a practice floor. It does not operate your buildings, and it does not promise a dollar figure for a fleet it has not measured.

## The eight situations

Each one is a card under **Rehearsals**, and each one can be played from the overview. “You approve the serious action” pauses when a person should say yes or no. “Compare two ways” plays two reactions against the same script and shows which one kept more finished work.

### 1. The heat creeps up before a machine stops

**The situation.** One chip runs hotter than its normal pattern, the way an engine-temperature gauge climbs before a car stalls. The readings get worse for a while. Then the chip stops.

**What the rehearsal does.** It notices the climb, asks you to take an extra save, and later restarts from that save.

**Why it matters.** The work you saved close to the failure is work you do not have to repeat. Waiting for the ordinary save schedule leaves a wider gap.

### 2. A machine stops with no warning

**The situation.** The chip stops the way a light bulb pops. There is no heat warning first. No amount of staring at yesterday’s temperature would have called it.

**What the rehearsal does.** It restarts in the shorter way the job is actually allowed to restart. It does not pretend it predicted the pop.

**Why it matters.** When there is no warning, the money is in a clean, permitted restart, not in a forecast you cannot support.

### 3. One power feed, one problem

**The situation.** Several chips on the same power feed sag together, like every light on one circuit dimming at once.

**What the rehearsal does.** It files one incident for that feed. Chips on the other feed stay out of the incident.

**Why it matters.** A hall that opens fifty tickets for one breaker wastes the night shift and can pull healthy machines into the wrong repair.

### 4. A busy spell is not a breakdown

**The situation.** The job leans harder on the chips. They get warmer, and they stay inside the range they are built for. This is the dinner rush, not a fire.

**What the rehearsal does.** It leaves the chips in service.

**Why it matters.** Pulling a healthy chip out of a job that must move together stops the race on purpose.

### 5. A half-finished save is refused

**The situation.** A save is missing pieces, like a document with the last pages torn out. Then a chip stops.

**What the rehearsal does.** It refuses the torn save and restarts from the older complete one.

**Why it matters.** Restoring a broken snapshot can lose the job more thoroughly than going back to a smaller, honest save.

### 6. You cannot drop one singer from this choir

**The situation.** This job is written so the chips must sing the same line together. Someone might hope to drop the failed chip and keep going with the others.

**What the rehearsal does.** It refuses that shortcut. The allowed move is to restart the group together.

**Why it matters.** A restart the software cannot actually do is a plan that fails at 2 a.m. The page will only offer a move the job can carry out.

### 7. Late sensors mean we do not guess

**The situation.** The readings arrive late, like making a medical decision from a thermometer taken last week. A heat problem is in the script, and the fresh part of it is hidden by the delay.

**What the rehearsal does.** It says the evidence is not enough. It does not invent a cause to look decisive.

**Why it matters.** A confident wrong label sends a technician to the wrong machine and can trigger the false alarm above.

### 8. Shutting down a healthy rush can cost more

**The situation.** Same busy spell as story 4. This time the rule is a fixed temperature limit: cross the line, and the chip is benched.

**What the rehearsal does.** It benches the healthy chip. Beside it, a reaction that waits for a real fault keeps working. The comparison shows the loss.

**Why it matters.** A preventive rule can have a cost. On this script, the cost is finished work. That is the number the return panel is allowed to price, once you supply your own rates.

## What you are looking at on each page

The left-hand menu matches this list.

**Overview.** The practice floor. Three cards name the stall, the unsaved work, and the false alarm. The chips in the job change as each step is computed. A strip under them counts the rest of the hall. If a serious move is waiting, Approve and Reject are on this page. The bars are finished work in the rehearsal.

**Rehearsals.** The eight situations above, in the same words. Play one and you return to the overview while it runs.

**Who moves together.** The choir list for the current job: which seat is which chip, and how the job is allowed to restart. The rest of the hall is counted and left off this list.

**Chip charts.** A personal temperature chart for a chip in the job. Fan speed appears only when the rehearsal has that reading. A missing reading stays blank.

**What went wrong.** The incident as one pile, plus the best reading of the cause from the readings. If the readings are thin or late, the page says it is not guessing. Other possible causes are listed under that.

**Saves.** Every snapshot the job wrote. “Verified usable” means the pieces all arrived and the save can be reopened. The piece count is “pieces present / pieces expected.”

**Your decision.** The same approve-or-reject question as the overview, with the reason written out. Automatic decisions are labeled automatic. They are not recorded as a person’s signature.

**Paper trail.** The story that was played, and each approval or rejection.

**Two reactions.** The side-by-side score after you choose “Compare two ways.” Finished work, work that had to be repeated, and how long the job was stopped. A negative difference means the second way kept less of the job.

**Dictionary.** The catalog of measurements the rehearsal knows how to name. A total over a time window is the same reading added up, the way “sales this week” is not a second cash register. Measurements the rehearsal does not have stay blank. They are not stored as zero.

**Learned helper.** A statistical helper was trained on rehearsals and scored on rehearsals it had not seen, the way a new hire is tested on cases they did not study. On that test it did not beat the simple heat-pattern rule, so the simple rule stays in charge. That result is kept on purpose. The answer key that knows the scripted cause is not an operator control.

**Sensor health.** Whether the readings feeding the decision are late, dropped, or waiting in a queue. The plugs that would attach this rehearsal to real chips, networks, or building systems are listed and left unplugged. The page does not reset a machine.

Presentation mode, the button in the left menu, hides the score numbers and keeps the story. Technical mode shows the numbers. Both modes are still the rehearsal.

## What return you can read from it

There is no dollar rate built into the project, and there is no headline that says a company saved a percentage.

Here is the return you *can* inspect.

On the overview, play any rehearsal with **Compare two ways**. The page scores how much finished work each reaction kept. The difference between them is the thing that might be worth money: less repeated study, or more of it.

You then fill in the form yourself:

- what one hour of one chip costs you
- which currency that number is in
- what the rate includes (power, staff, space, or only the chip)
- what the estimate is allowed to cover
- the time horizon you have in mind
- what you would invest to act on the lesson
- an extra operating cost, if you have one beyond that investment

The rehearsal converts the finished-work difference with one formula, shown on the form:

`finished steps × length of a step in seconds ÷ 3600 × chips in this job`

An hour of chip time is that product. The other chips in the hall, the ones that were only counted, are not multiplied in. Empty fields leave the return blank. An investment of zero leaves the return blank, because a return cannot be “infinite” just because you typed no investment. When a percentage appears, the page labels it an **assumption-based simulation estimate**. It is a what-if on this script, at the prices you typed. It is not money that arrived in an account, and it is not a forecast for a hall this project has not measured.

That is still useful to an owner. It forces the benefit to be a difference you can see — finished work kept or lost — and it forces the price to be yours. Two reactions that finish the same amount of work are worth nothing extra, at any rate you type. A reaction that throws work away produces a worse return. A blank form cannot be waved around as a savings claim.

## What this changes for you, and what it leaves alone

After the briefing and a pass through the menu, you should be able to say:

- A training job is a group that shares each step. One stopped chip holds the group.
- The work you can defend is the last complete save.
- A warm chip can be healthy. Shutting it down can cost more than waiting.
- Several complaints on one power feed are one incident.
- A torn save is refused.
- A job that must restart together will not pretend it can drop one chip.
- Late readings produce “I don’t know,” not a guessed cause.
- A learned helper that loses to a simple rule does not get to overrule that rule.
- A money figure appears only after you supply the prices, and only for the chips in the job, and only as a labeled what-if.

What you should not take away: a measured return from a real fleet, a prediction of every failure, or a control panel for a building. The rehearsal is one organization, on a simulated hall. The codes it uses for symptoms are fictional labels beginning with `TC-SYM-`. A display chip in the computer you are using is not enrolled in the hall.

If you are about to build a hall, the rehearsal is a way to see the operating question before the concrete is poured: where the race stops, which save you would trust, and which automatic rule would make a busy night worse. If you already operate halls, it is a way to walk a night-shift decision without touching production.

## For someone who wants the files

- `src/training_continuity` is the only decision engine. The pages ask it to act. They do not keep a second copy of the rehearsal.
- `apps/web` is the practice floor.
- `docs` holds the longer product, architecture, data, model, and limit notes.
- `artifacts/model_report.json` is the scored comparison of the learned helper against the simple rule.

Further reading starts at `docs/product.md` and `IMPLEMENTATION_STATUS.md`.
