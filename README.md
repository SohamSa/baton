# TrainingContinuity

Open the project: https://sohamsa.github.io/training-continuity/

That single page is the product. It loads the decision engine in the browser and runs each story, approval, comparison, catalog query, and held-out model check when you open it. There is no install step, no terminal, and no second address to check.

TrainingContinuity studies hardware-related disruption during distributed pre-training on a simulated GPU cluster of 32,768 accelerators. Individual traces cover the ranks placed in the incident. The other accelerators remain the quiescent population of that same cluster. This process is not attached to those accelerators, and a local display GPU is not enrolled in the cluster.

The honest claim is narrow: this is a reproducible synthetic environment for studying how observable hardware evidence, checkpoint protection, and capability-aware recovery can preserve useful pre-training progress. It does not measure a real fleet, predict every failure, or report savings.

The deployment modeled here is a single organization. Physical GPU, fabric, and facility adapters are declared and disconnected.

## What you can run

On the page, open Stories. Each story runs in the decision engine when you choose it. Manual mode waits for an approval on that same page. Automated mode compares policies on that same run. The other sections show the cluster, checkpoints, audit, catalog, held-out model, and monitoring for the engine running in the browser.

The eight stories cover a gradual warning, an abrupt failure, a shared power domain, a healthy workload shift, an incomplete checkpoint, an unsupported local recovery, stale monitoring, and a preventive policy that does worse.

## Layout

- `src/training_continuity`: domain, simulation, features, policies, accounting, API, persistence.
- `apps/web`: React interface. It renders and requests actions. It does not run a second simulator.
- `docs`: product, architecture, data, models, policies, and limits.
- `artifacts/model_report.json`: held-out comparison against the residual baseline.

Further reading starts at `docs/product.md` and `IMPLEMENTATION_STATUS.md`.
