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


## Owner's story entrance

The dashboard begins with the same cinematic narrative as the README. A builder, operator, or explorer enters seven linked chapters, meets all seventeen problem characters, follows evidence drawers into supporting tools, and returns to the originating chapter. The climax asks the owner to reason about evidence freshness, checkpoint eligibility, and supported recovery. It is a tabletop learning exercise, not an additional engine scenario. The epilogue provides practical questions, locally saved notes, and a printable action pack. `/portfolio` retains the earlier executive overview.

Both experiences use `content/owner-journey.json`; `scripts/build_owner_readme.py` renders the README. Character coverage statements distinguish implemented simplified rehearsals from conceptual diagnostics.
