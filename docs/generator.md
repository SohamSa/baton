# Generator

Two layers:

- Latent world: thermal resistance multiplier, functional state, fault onset, shared power or cooling effects.
- Observed world: delayed, noisy reports. Missing support stays null.

The thermal step is a lumped engineering approximation, not a transistor, CFD, or vendor model. Equilibrium temperature is `25 + power_w * nominal_r * r_multiplier` with nominal `R = 0.12 K/W` and a thermal capacity of `100 J/K`. Expected temperature for residuals uses observed power and observed coolant with the nominal resistance, so the residual is not a direct copy of the hidden multiplier.

Independent streams, keyed by SHA-256, cover population, workload, faults, observation, facility, repairs, storage, and actions. A policy that draws an extra action random number does not advance the fault stream.

Cause families are physical hardware, driver or firmware, application, collective communication, storage, planned maintenance, and unknown. Symptoms are recorded separately from the adjudicated cause. Scripted stories mix gradual cooling, abrupt process failure, shared power, a healthy workload shift, an incomplete checkpoint, an unsupported membership change, and stale telemetry.

Labels are not a threshold on one model input. A hot, busy accelerator can be healthy. A shared power cut can look like several device faults until the domain is grouped.

Compact stories use tens of steps and a handful of accelerators. `generation/materialize.py` writes `part-{seed}.parquet` and skips partitions already listed in `manifest.json`. Queue overflow increments `dropped` and marks the manifest degraded. It does not pretend the sample was kept.
