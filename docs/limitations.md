# Limits

Works locally:

- A simulated GPU cluster of 32,768 accelerators, with detailed traces for the placed ranks and a counted quiescent population for the rest.
- Eight engine-backed stories, checkpoint rejection, approvals, audit, rule policies, a trained model that lost to the baseline, Parquet resume, and the React build.

The cluster is the research population. This process does not open a device handle to those accelerators. A display GPU on the workstation, if one is present, is outside the cluster.

Simulated:

- Accelerators, fabric, power, cooling, storage, and training progress. Interventions change the virtual world only.

Unimplemented:

- Live DCGM, NVML, or Kubernetes collection.
- Physical reset, drain, or job control.
- A full Alembic migration that creates every ORM table on PostgreSQL. `create_all` is what the application uses today.
- Kafka.
- A required language model. Narratives are deterministic templates.

Needs real data before any operational claim:

- Calibration against fleet labels.
- Overhead on production collectors.
- Whether a runtime actually supports the reconfigurable or redundant profile you select.

Do not describe a virtual fleet run as a test of a real-scale deployment.
