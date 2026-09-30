"""Resource-time and job-progress ledgers.

Primary outcomes are productive compute, lost progress, interruption duration,
and monitoring overhead. Currency is not computed here.
"""

from __future__ import annotations

from dataclasses import dataclass, field


EXCLUSIVE_STATES = (
    "compute",
    "collective_wait",
    "stalled",
    "checkpoint",
    "restart",
    "recovery",
    "unavailable",
    "idle",
)


@dataclass
class Ledger:
    step_seconds: float
    resource_seconds: dict[str, dict[str, float]] = field(default_factory=dict)
    monitoring_cpu_seconds: float = 0.0
    monitoring_bytes: float = 0.0
    job_interruption_seconds: float = 0.0
    checkpoint_overhead_seconds: float = 0.0
    useful_new: float = 0.0
    recomputation: float = 0.0
    quiescent_accelerator_seconds: float = 0.0
    dropped_observations: int = 0
    steps_accounted: int = 0

    def add_resource(self, resource_id: str, fractions: dict[str, float]) -> None:
        total = sum(fractions.values())
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"exclusive fractions for {resource_id} sum to {total}, expected 1")
        unknown = set(fractions) - set(EXCLUSIVE_STATES)
        if unknown:
            raise ValueError(f"unknown resource states {unknown}")
        bucket = self.resource_seconds.setdefault(resource_id, {name: 0.0 for name in EXCLUSIVE_STATES})
        for name, fraction in fractions.items():
            if fraction < -1e-12:
                raise ValueError("negative allocation")
            bucket[name] += fraction * self.step_seconds

    def note_step(self, *, jobs_interrupted: int, checkpoint_fraction_sum: float) -> None:
        """Job interruption is counted once per interrupted job, not once per GPU."""
        self.job_interruption_seconds += jobs_interrupted * self.step_seconds
        self.checkpoint_overhead_seconds += checkpoint_fraction_sum * self.step_seconds
        self.steps_accounted += 1

    def add_monitoring(self, cpu_seconds: float, nbytes: float) -> None:
        self.monitoring_cpu_seconds += cpu_seconds
        self.monitoring_bytes += nbytes

    def conservation_errors(self, elapsed_steps: int) -> list[str]:
        expected = elapsed_steps * self.step_seconds
        errors = []
        for resource_id, bucket in self.resource_seconds.items():
            total = sum(bucket.values())
            if abs(total - expected) > 1e-4:
                errors.append(f"{resource_id} accounted {total} of {expected}")
        return errors

    def goodput(self, wall_seconds: float) -> float | None:
        """Useful new progress per wall-clock second. Utilization is not goodput."""
        if wall_seconds <= 0:
            return None
        return self.useful_new / wall_seconds

    def as_dict(self) -> dict:
        return {
            "useful_new": self.useful_new,
            "recomputation": self.recomputation,
            "job_interruption_seconds": self.job_interruption_seconds,
            "checkpoint_overhead_seconds": self.checkpoint_overhead_seconds,
            "monitoring_cpu_seconds": self.monitoring_cpu_seconds,
            "monitoring_bytes": self.monitoring_bytes,
            "dropped_observations": self.dropped_observations,
            "quiescent_accelerator_seconds": self.quiescent_accelerator_seconds,
            "goodput_per_wall_second": self.goodput(self.steps_accounted * self.step_seconds),
            "denominator": "wall_clock_seconds",
            "note": "Recomputation is excluded from useful_new. Checkpoint overhead is inside the wall-clock denominator and is not added again.",
        }
