# Product

A pre-training job on a large GPU cluster advances only when its ranks finish the same step. Baton places that problem in a simulated cluster of 32,768 accelerators: 256 racks, 4,096 hosts, and 8 accelerators on each host. The operator investigates the placed ranks. The other accelerators stay in the quiescent population and are not drawn as if each one had a full sensor history.

Baton lets a person walk through that decision with synthetic evidence:

- Which signals are fresh enough to trust?
- Which jobs and ranks depend on the affected component?
- Is there a verified checkpoint, and how much work sits after it?
- Does this runtime allow a smaller restart, or must the whole job restart together?
- After checkpoint overhead and a wrong intervention, did the policy keep more useful progress?

Presentation mode tells that story without benchmark numbers. Technical mode shows the synthetic measurements and the seed. Both modes keep the synthetic label visible.

The cooperative picture is a team that shares one step. One person stopping does not let the others finish that step unless the work was designed to continue without them. The application uses fictional sites and hardware families. It does not describe a real company's cluster.


## Owner's reading entrance

The README and dashboard follow one owner and engineer through a stalled job. The first page begins the investigation immediately; no role selection or engine startup is required. Seven linked passages introduce concepts as the investigation needs them. The main reading surface hides suite navigation and keeps one next passage prominent. Earlier parts, relevant owner context, and supporting tools remain available through optional disclosures.

The same `content/owner-journey.json` paragraphs appear in both experiences. `scripts/build_owner_readme.py` generates the README and `docs/story-reference.md`. The companion preserves all seventeen problems, observations, assumptions, limits, challenges, and worksheet evidence requests. Dashboard evidence drawers are closed until requested. The concluding recovery discussion remains a tabletop exercise, and the owner worksheet translates learning into site-specific evidence questions. `/portfolio` retains the executive overview.

## Owner-directed rehearsals

The practice floor reads supported controls and preset values from the Python engine. Owners change compatible capacity, save spacing, delivery delay, and supported warning strength, then launch either manual review or a paired comparison. A reusable URL preserves the chosen overrides. Completed runs display the actual effective inputs separately from the next-run controls. Pending approvals replay the original configuration.

The concluding story links to Recovery Crossroads, a related compound engine scenario. The prose and tabletop questions remain a learning account, while the simulation exposes actual save states and response outcomes under selected conditions.

## Foundations before navigation

The main link now starts with basic concepts, then `/learn/data` introduces essential evidence and contains the complete searchable catalog. A single continuation leads into `/journey/arrival`. Both learning pages use the quiet reading layout. Supporting tools are in a closed menu; the data catalog at `/data` also preserves chapter return context. Catalog definitions are exported from the Python dictionary by `scripts/build_learning_catalog.py`, so reading them requires no simulation runtime.

- Unified owner workspace: the same Basics, Data, Story, Plan, Rehearse, Operations, and My review navigation appears on reading and practical pages. Specialist tools use one expandable menu. Chapter and build/operate context survive tool navigation and reload; story passages offer contextual practical steps.
