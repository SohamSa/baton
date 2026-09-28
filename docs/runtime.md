# Training runtime

This is not model pre-training. No tensors are stored. A job has ranks, a data-parallel and tensor-parallel layout, and a capability profile.

| Profile | Failure behavior |
| --- | --- |
| `strict_sync` | A failed required rank stalls the job. The runtime will not drop that rank and continue the step. |
| `independent` | Separate jobs. Each job is internally strict. A fault does not stall an unrelated job unless they share a resource. |
| `reconfigurable` | With tensor parallel size 1, a fully failed data-parallel replica may be removed on a checkpoint restart. A partial tensor-parallel group cannot continue. |
| `redundant` | A compatible spare can be used on restart when one was configured. This is not live migration. |

Useful progress credits surviving data-parallel groups over the original group count. Work below the high-water mark after a restore is recomputation, not new progress.

Collective wait and compute can share a step. The ledger assigns fractions that sum to 1 for each accelerator so the same second is not counted twice. Idle spares are accounted.
