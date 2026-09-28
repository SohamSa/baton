# TrainingContinuity

Open the project: https://sohamsa.github.io/training-continuity/

That page is the product. The decision engine loads in the browser and steps each story as you watch. There is no install, no terminal, and no second address.

## The problem a hall actually has

A synchronized pre-training job does not lose one accelerator. It loses the step. The rest of the hall can be powered, cooled, and idle in the only sense that matters: it is not producing the next update.

Three exposures sit under that stall.

- **The stall.** One placed accelerator stops, and the job stops with it. Capacity you still own is not progress.
- **The checkpoint gap.** Progress that exists only in device memory is not progress you can restart from. An incomplete or in-flight save cannot be used. The age of the last verified checkpoint is the exposure.
- **The false alarm.** A preventive action on a healthy workload shift can destroy more useful work than the fault it was meant to catch. A temperature threshold does not know the difference between a burst and a cooling failure.

TrainingContinuity is a reproducible synthetic environment for studying those three decisions: what the observable evidence supports, which checkpoint is actually usable, and which recovery the job is capable of. The hall in the model has 32,768 accelerators. Individual traces cover the ranks placed in the job. The other accelerators stay in the counted population of that same cluster. This process is not attached to them, and a local display GPU is not enrolled.

## What the page does when you open it

The overview is an operations desk.

- The opening story starts on its own: a cooling fault that shows up in the thermal residual before the accelerator stops. The placed accelerators update on every step the engine computes.
- A high-impact action waits on that same page. Approve it or reject it, and the engine runs the story forward from that precondition.
- Automated mode compares two policies on the same fault schedule. The bars are useful progress for this virtual job, not a fleet result.
- The other sections — dependencies, devices, incidents, checkpoints, audit, catalog, held-out model, monitoring — read the same engine. Hidden simulator truth is not on the public page.

The eight stories are a gradual warning, an abrupt failure, a shared power domain, a healthy workload shift, an incomplete checkpoint, an unsupported local recovery, stale monitoring, and a preventive policy that does worse.

## Return, without an invented price

The return panel does not ship with a dollar rate, a company, or a savings headline.

You supply the accelerator-hour rate, the currency, what that rate includes, the scope, the horizon, and the investment. The engine converts the useful-step difference from the paired comparison with one formula:

`useful steps × step length in seconds ÷ 3600 × accelerators in the job`

That conversion uses the accelerators in the simulated job. It does not multiply the rest of the hall. If a field is blank, return stays undefined. If the investment is zero, return stays undefined rather than infinite. When a figure appears, it is labeled an assumption-based simulation estimate. It is not money already saved, and it is not a claim about a real fleet.

## What this is, and what it is not

The honest claim is narrow: a reproducible synthetic environment for studying observable hardware evidence, checkpoint protection, and capability-aware recovery. It does not measure a real data center, predict every failure, or report a realized return.

The deployment modeled here is a single organization. Physical GPU, fabric, and facility adapters are declared and disconnected. Symptom codes in the simulator are fictional `TC-SYM-*` identifiers.

If a trained model does not beat the simpler residual baseline on held-out decision utility, the rule policy stays the operational default. That result is recorded, not talked past.

## Layout

- `src/training_continuity`: the only decision engine. Domain, simulation, features, policies, accounting, API, persistence.
- `apps/web`: the interface. It renders and requests actions. It does not run a second simulator.
- `docs`: product, architecture, data, models, policies, and limits.
- `artifacts/model_report.json`: held-out comparison against the residual baseline.

Further reading starts at `docs/product.md` and `IMPLEMENTATION_STATUS.md`.
