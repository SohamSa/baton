# References

Retrieved 2026-09-28 unless noted. These sources informed names and constraints. The simulator does not call the vendor libraries.

| Source | What was used | Status |
| --- | --- | --- |
| [DCGM health monitoring](https://docs.nvidia.com/datacenter/dcgm/latest/learn/modules/health-monitoring.html) | Passive watches and the idea that a healthy result means no enabled rule fired. A single failure code is not treated as proof of one physical fault. | Retrieved |
| [DCGM exporter metrics](https://docs.nvidia.com/datacenter/dcgm/latest/reference/dcgm-exporter-metrics.html) | Catalog analogs for clocks, temperature, power, utilization, frame buffer, NVLink, and ECC. High-cardinality labels such as GPU UUID are not exported on `/metrics`. | Retrieved |
| [Xid errors](https://docs.nvidia.com/deploy/xid-errors/working-with-xid-errors.html) | Kernel messages are identifiers plus context, with different next actions for software and hardware. This project does not emit numeric Xid values. Symptom codes are fictional `TC-SYM-*`. | Retrieved |
| [GPU node triage](https://docs.nvidia.com/deploy/gpu-debug-guidelines/gpu-node-triage.html) | Listed in the contract. The page was not retrieved in this session. | Unverified. No implementation claim is taken from it. |
| [NVIDIA Resiliency Extension](https://github.com/NVIDIA/nvidia-resiliency-ext) | Concepts only: in-job restart, async checkpoint contention, stragglers. Not a dependency. The README describes an experimental project with PyTorch, CUDA, and NVML requirements. This application does not call those libraries and does not attach to the simulated cluster. | Retrieved |
| [PyTorch distributed](https://docs.pytorch.org/docs/stable/distributed.html) | Synchronized process groups. The stable URL redirected to the 2.14 documentation set on retrieval. | Retrieved |
| [PyTorch distributed checkpoint](https://docs.pytorch.org/docs/stable/distributed.checkpoint.html) | Page last updated Jul 08, 2026. Multiple files per rank and load-time resharding informed the abstract manifest and the reconfigurable restart rule. The simulator does not call `torch.distributed.checkpoint`. | Retrieved |

Assumption classes:

- Documentation-informed: checkpoint must be complete before use; a failed rank does not silently leave a synchronized step; exporter metrics are gauges or counters with explicit support.
- Engineering approximation: lumped thermal mass, nominal 0.12 K/W, accelerated time steps.
- Deliberate simplification: no weight tensors, fictional device families, one shared organization, abstract shard checksums.
