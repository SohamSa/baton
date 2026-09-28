"""Discrete-event synthetic world.

The operational path reads observations only. Latent fields stay in the evaluator
section and are never copied into observations.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field

from pydantic import BaseModel, ConfigDict, Field

from training_continuity.accounting.ledger import EXCLUSIVE_STATES, Ledger
from training_continuity.checkpoints import select_restore_checkpoint
from training_continuity.domain.enums import CheckpointState
from training_continuity.domain.machines import transition_checkpoint
from training_continuity.features.compute import ewma, mean_skip_null, thermal_residual
from training_continuity.intelligence.hypotheses import EvidenceSummary, rank_hypotheses
from training_continuity.policies.library import POLICIES, OraclePolicy
from training_continuity.rngutil import normal, uniform, weighted_choice
from training_continuity.simulation.capabilities import reconfigure_possible

PROFILES = {
    "northspan-n8": {
        "family": "northspan-n",
        "memory_mib": 81920,
        "tdp_w": 350.0,
        "idle_w": 70.0,
        "nominal_r": 0.12,
        "capacity": 100.0,
        "supports_fan": False,
        "supports_ecc": True,
        "supports_nvlink": True,
        "supports_memory_temp": True,
        "supports_occupancy": True,
        "shutdown_temp_c": 95.0,
    },
    "northspan-n4": {
        "family": "northspan-n4",
        "memory_mib": 40960,
        "tdp_w": 300.0,
        "idle_w": 60.0,
        "nominal_r": 0.13,
        "capacity": 90.0,
        "supports_fan": False,
        "supports_ecc": True,
        "supports_nvlink": True,
        "supports_memory_temp": True,
        "supports_occupancy": False,
        "shutdown_temp_c": 92.0,
    },
    "northspan-lab": {
        "family": "northspan-lab",
        "memory_mib": 24576,
        "tdp_w": 180.0,
        "idle_w": 30.0,
        "nominal_r": 0.2,
        "capacity": 70.0,
        "supports_fan": True,
        "supports_ecc": False,
        "supports_nvlink": False,
        "supports_memory_temp": False,
        "supports_occupancy": False,
        "shutdown_temp_c": 88.0,
    },
}

DEFAULT_CAUSE_WEIGHTS = {
    "physical_hardware": 0.35,
    "driver_firmware": 0.10,
    "application": 0.10,
    "collective_communication": 0.15,
    "storage": 0.10,
    "planned_maintenance": 0.05,
    "unknown": 0.15,
}

MECHANISM_OF_CAUSE = {
    "physical_hardware": "cooling_degradation",
    "driver_firmware": "driver_firmware",
    "application": "application_error",
    "collective_communication": "collective_timeout",
    "storage": "storage_fault",
    "planned_maintenance": "planned_maintenance",
    "unknown": "unknown",
}

CLUSTER_ACCELERATORS = 32768
CLUSTER_GPUS_PER_HOST = 8
CLUSTER_HOSTS_PER_RACK = 16

OBS_KEYS = {
    "observation_id",
    "entity_id",
    "entity_kind",
    "event_step",
    "availability_step",
    "schema_version",
    "gpu_temp_c",
    "memory_temp_c",
    "power_draw_w",
    "power_limit_w",
    "sm_util_ratio",
    "ecc_sbe_total",
    "ecc_dbe_total",
    "fan_speed_ratio",
    "nvlink_replay_total",
    "occupancy_ratio",
    "supply_temp_c",
    "feed_voltage_v",
    "clock_skew_s",
    "family",
    "phase",
    "power_domain_id",
    "cooling_domain_id",
    "profile_id",
}


class FaultConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    fault_id: str
    target_type: str
    target_id: str
    cause: str
    mechanism: str
    onset: int
    ramp: int = 1
    severity: float = 1
    abrupt: bool = False
    hard_fail: int | None = None
    fail_mode: str = "none"


class ScenarioConfig(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario_id: str
    seed: int = 1
    steps: int = 40
    step_seconds: float = 5
    n_racks: int = 1
    hosts_per_rack: int = 1
    gpus_per_host: int = 4
    n_jobs: int = 1
    capability: str = "strict_sync"
    tp_size: int = 2
    checkpoint_interval: int = 20
    checkpoint_write_steps: int = 1
    warmup_steps: int = 2
    scripted_faults: list[FaultConfig] = Field(default_factory=list)
    random_faults: bool = False
    fault_rate_per_gpu: float = 0.2
    cause_weights: dict[str, float] | None = None
    workload: list[dict] = Field(default_factory=list)
    collector_lag_steps: int = 0
    storage_fail_progress: list[int] = Field(default_factory=list)
    corrupt_progress: list[int] = Field(default_factory=list)
    heterogeneous: bool = False
    spare_count: int = 0
    cluster_gpu_count: int = CLUSTER_ACCELERATORS
    firmware_event_at: int | None = None
    maintenance_window: list[int] | None = None
    blackout: list[int] | None = None
    clock_skew_s: float = 0
    story_id: str | None = None


def config_hash(cfg: ScenarioConfig) -> str:
    raw = json.dumps(cfg.model_dump(mode="json"), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


@dataclass
class GPU:
    gpu_id: str
    host_id: str
    power_domain_id: str
    cooling_domain_id: str
    profile_id: str
    profile: dict
    spare: bool = False
    temp_c: float = 40
    functional: bool = True
    quarantined: bool = False
    r_multiplier: float = 1
    ecc_sbe: int = 0
    ecc_dbe: int = 0
    nvlink_replay: int = 0
    fail_mode: str | None = None
    util: float = 0.55
    phase: str = "steady"
    vulnerability: float = 0.1
    occupied: bool = False


@dataclass
class Job:
    job_id: str
    capability: str
    tp_size: int
    rank_gpu: list[str]
    progress: float = 0
    high_water: float = 0
    useful_new: float = 0
    recomputation: float = 0
    next_checkpoint_at: float = 20
    placement_version: int = 1
    attempt: int = 1
    checkpoint_left: int = 0
    recovery_left: int = 0
    dropped: set[int] = field(default_factory=set)
    state: str = "running"
    active_checkpoint: str | None = None
    topology_signature: str = ""

    def __post_init__(self) -> None:
        self.topology_signature = signature(self.rank_gpu, self.dropped)


def signature(rank_gpu: list[str], dropped: set[int]) -> str:
    body = ",".join(gpu for i, gpu in enumerate(rank_gpu) if i not in dropped)
    return hashlib.sha256(body.encode()).hexdigest()[:12]


@dataclass
class World:
    gpus: dict[str, GPU]
    jobs: dict[str, Job]
    power_scale: dict[str, float]
    supply_offset: dict[str, float]
    checkpoints: list[dict]
    observations: list[dict]
    logs: list[dict]
    actions: list[dict]
    incidents: list[dict]
    truth: list[dict]
    faults: list[dict]
    admin: list[dict]
    cluster: dict


def build_world(cfg: ScenarioConfig) -> World:
    gpus: dict[str, GPU] = {}
    for rack in range(cfg.n_racks):
        for host in range(cfg.hosts_per_rack):
            host_id = f"host-r{rack}-h{host}"
            for device in range(cfg.gpus_per_host):
                gpu_id = f"gpu-r{rack}-h{host}-d{device}"
                if cfg.heterogeneous:
                    profile_id = ("northspan-n8", "northspan-n4", "northspan-lab")[device % 3]
                else:
                    profile_id = "northspan-n8"
                profile = PROFILES[profile_id]
                vulnerability = uniform(cfg.seed, "population", gpu_id, "vulnerability")
                gpu = GPU(
                    gpu_id=gpu_id,
                    host_id=host_id,
                    power_domain_id=f"power-r{rack}-h{host}",
                    cooling_domain_id=f"cooling-r{rack}-h{host}",
                    profile_id=profile_id,
                    profile=profile,
                    vulnerability=vulnerability,
                )
                gpu.temp_c = _equilibrium(profile, 0.55, 25.0, 1.0)
                gpus[gpu_id] = gpu
    trainable = [gpu for gpu in gpus.values() if not gpu.spare]
    if len(trainable) % cfg.n_jobs != 0:
        raise ValueError("GPU count must divide across jobs")
    per_job = len(trainable) // cfg.n_jobs
    if per_job % cfg.tp_size != 0:
        raise ValueError("ranks per job must be divisible by tp_size")
    jobs = {}
    for index in range(cfg.n_jobs):
        assigned = [gpu.gpu_id for gpu in trainable[index * per_job : (index + 1) * per_job]]
        job = Job(
            job_id=f"job-{index}",
            capability=cfg.capability,
            tp_size=cfg.tp_size,
            rank_gpu=assigned,
            next_checkpoint_at=float(cfg.checkpoint_interval),
        )
        jobs[job.job_id] = job
    for spare_index in range(cfg.spare_count):
        profile = PROFILES["northspan-n8"]
        gpu_id = f"gpu-spare-{spare_index}"
        gpus[gpu_id] = GPU(
            gpu_id=gpu_id,
            host_id="host-spare",
            power_domain_id="power-spare",
            cooling_domain_id="cooling-spare",
            profile_id="northspan-n8",
            profile=profile,
            spare=True,
        )
    placed = [gpu.gpu_id for gpu in gpus.values() if not gpu.spare]
    return World(
        gpus=gpus,
        jobs=jobs,
        power_scale={},
        supply_offset={},
        checkpoints=[],
        observations=[],
        logs=[],
        actions=[],
        incidents=[],
        truth=[],
        faults=[],
        admin=[],
        cluster=cluster_layout(cfg, placed),
    )


def cluster_layout(cfg: ScenarioConfig, placed_ids: list[str]) -> dict:
    """Inventory for one GPU cluster. Individual physics stays on the placed ranks."""
    placed = len(placed_ids)
    if cfg.cluster_gpu_count < placed:
        raise ValueError("cluster_gpu_count is smaller than the detailed placement")
    if cfg.cluster_gpu_count % CLUSTER_GPUS_PER_HOST != 0:
        raise ValueError("cluster_gpu_count must fill 8-accelerator hosts")
    hosts = cfg.cluster_gpu_count // CLUSTER_GPUS_PER_HOST
    if hosts % CLUSTER_HOSTS_PER_RACK != 0:
        raise ValueError("cluster hosts must fill 16-host racks")
    racks = hosts // CLUSTER_HOSTS_PER_RACK
    quiescent = cfg.cluster_gpu_count - placed
    return {
        "synthetic": True,
        "subject": "gpu_cluster",
        "accelerator_count": cfg.cluster_gpu_count,
        "detailed_accelerator_count": placed,
        "quiescent_accelerator_count": quiescent,
        "gpus_per_host": CLUSTER_GPUS_PER_HOST,
        "hosts_per_rack": CLUSTER_HOSTS_PER_RACK,
        "host_count": hosts,
        "rack_count": racks,
        "fabric_domain_count": max(1, racks // 8),
        "profile_id": "northspan-n8",
        "attached": False,
        "placed_ids": placed_ids,
        "note": (
            "The synchronized job sits in this GPU cluster. Individual thermal, power, and error traces "
            "are kept for the placed ranks. The other accelerators stay in the quiescent population of the same cluster. "
            "This process is not attached to those accelerators."
        ),
    }


def _equilibrium(profile: dict, util: float, coolant: float, r_multiplier: float) -> float:
    power = profile["idle_w"] + util * (profile["tdp_w"] - profile["idle_w"])
    return coolant + power * profile["nominal_r"] * r_multiplier


def schedule_faults(cfg: ScenarioConfig, world: World) -> list[dict]:
    faults = [item.model_dump() for item in cfg.scripted_faults]
    if not cfg.random_faults:
        return faults
    weights = cfg.cause_weights or DEFAULT_CAUSE_WEIGHTS
    for gpu in world.gpus.values():
        if gpu.spare:
            continue
        chance = cfg.fault_rate_per_gpu * (0.5 + gpu.vulnerability)
        if uniform(cfg.seed, "faults", gpu.gpu_id, "occur") > chance:
            continue
        cause = weighted_choice(cfg.seed, "faults", weights, gpu.gpu_id, "cause")
        onset = 5 + int(uniform(cfg.seed, "faults", gpu.gpu_id, "onset") * max(cfg.steps - 10, 1))
        abrupt = cause in {"application", "unknown"} or uniform(cfg.seed, "faults", gpu.gpu_id, "abrupt") < 0.35
        faults.append(
            {
                "fault_id": f"fault-{gpu.gpu_id}-{onset}",
                "target_type": "accelerator",
                "target_id": gpu.gpu_id,
                "cause": cause,
                "mechanism": MECHANISM_OF_CAUSE[cause],
                "onset": onset,
                "ramp": 1 if abrupt else 8,
                "severity": 0.4 + uniform(cfg.seed, "faults", gpu.gpu_id, "severity"),
                "abrupt": abrupt,
                "hard_fail": onset if abrupt else onset + 24,
                "fail_mode": "recoverable_process" if cause == "application" else "fatal_hardware",
            }
        )
    return faults


def _coolant(world: World, gpu: GPU) -> float:
    return 25.0 + world.supply_offset.get(gpu.cooling_domain_id, 0.0)


def _apply_faults(world: World, faults: list[dict], step: int) -> None:
    for fault in faults:
        if step < fault["onset"]:
            continue
        if fault["target_type"] == "power_domain" and fault["mechanism"] == "power_interruption":
            world.power_scale[fault["target_id"]] = max(0.2, 1 - fault["severity"])
            continue
        if fault["target_type"] == "cooling_domain":
            world.supply_offset[fault["target_id"]] = 8 * fault["severity"]
            continue
        if fault["target_type"] != "accelerator":
            continue
        gpu = world.gpus.get(fault["target_id"])
        if gpu is None:
            continue
        if fault["mechanism"] == "cooling_degradation":
            ramp = max(fault["ramp"], 1)
            progress = min(1.0, (step - fault["onset"] + 1) / ramp)
            gpu.r_multiplier = 1 + fault["severity"] * progress
        if fault["mechanism"] == "memory_errors":
            if fault["abrupt"] and step == fault["onset"]:
                gpu.ecc_dbe += 8
            elif not fault["abrupt"]:
                gpu.ecc_sbe += 2
        hard = fault.get("hard_fail")
        if (
            hard is not None
            and step >= hard
            and not fault.get("consumed")
            and gpu.fail_mode is None
            and fault["fail_mode"] != "none"
        ):
            gpu.functional = False
            gpu.fail_mode = fault["fail_mode"]
            fault["consumed"] = True


def _physics(world: World, cfg: ScenarioConfig, step: int) -> None:
    for job in world.jobs.values():
        for rank, gpu_id in enumerate(job.rank_gpu):
            gpu = world.gpus[gpu_id]
            if rank in job.dropped or not gpu.functional:
                gpu.util = 0.05
                gpu.phase = "down"
                continue
            base, phase = 0.55, "steady"
            for segment in cfg.workload:
                end = segment.get("end", 10**9)
                if segment["start"] <= step < end:
                    base = float(segment["util"])
                    phase = segment.get("phase", "steady")
            noise = 0.01 * normal(cfg.seed, "workload", job.job_id, step)
            gpu.util = min(0.99, max(0.05, base + noise))
            gpu.phase = phase
    for gpu in world.gpus.values():
        if gpu.spare and not gpu.occupied:
            gpu.util = 0.02
        scale = world.power_scale.get(gpu.power_domain_id, 1.0)
        power = (gpu.profile["idle_w"] + gpu.util * (gpu.profile["tdp_w"] - gpu.profile["idle_w"])) * scale
        coolant = _coolant(world, gpu)
        resistance = gpu.profile["nominal_r"] * gpu.r_multiplier
        flow = (gpu.temp_c - coolant) / resistance
        gpu.temp_c += cfg.step_seconds * (power - flow) / gpu.profile["capacity"]


def _power(gpu: GPU, world: World) -> tuple[float, float]:
    scale = world.power_scale.get(gpu.power_domain_id, 1.0)
    draw = (gpu.profile["idle_w"] + gpu.util * (gpu.profile["tdp_w"] - gpu.profile["idle_w"])) * scale
    limit = gpu.profile["tdp_w"] * scale
    return draw, limit


def _emit(world: World, cfg: ScenarioConfig, step: int) -> None:
    blackout = cfg.blackout is not None and cfg.blackout[0] <= step < cfg.blackout[1]
    for domain, offset in list(world.supply_offset.items()) or []:
        pass
    domains = {gpu.cooling_domain_id for gpu in world.gpus.values()}
    for domain in domains:
        reported_supply = None if blackout else _coolant_domain(world, domain) + 0.05 * normal(cfg.seed, "observation", domain, step, "supply")
        # Supply sensor lags the latent loop by two steps.
        if step < 2:
            reported_supply = 25.0
        world.observations.append(
            {
                "observation_id": f"obs-{domain}-{step}",
                "entity_id": domain,
                "entity_kind": "cooling_domain",
                "event_step": step,
                "availability_step": step + cfg.collector_lag_steps,
                "schema_version": 1,
                "supply_temp_c": reported_supply,
                "clock_skew_s": cfg.clock_skew_s,
            }
        )
    for gpu in world.gpus.values():
        fatal_dark = (not gpu.functional) and gpu.fail_mode == "fatal_hardware"
        hidden = blackout or fatal_dark
        draw, limit = _power(gpu, world)
        profile = gpu.profile
        temp = None if hidden else gpu.temp_c + 0.15 * normal(cfg.seed, "observation", gpu.gpu_id, step, "temp")
        row = {
            "observation_id": f"obs-{gpu.gpu_id}-{step}",
            "entity_id": gpu.gpu_id,
            "entity_kind": "accelerator",
            "event_step": step,
            "availability_step": step + cfg.collector_lag_steps,
            "schema_version": 1,
            "gpu_temp_c": temp,
            "memory_temp_c": None if (hidden or not profile["supports_memory_temp"]) else (temp + 4 if temp is not None else None),
            "power_draw_w": None if hidden else draw + normal(cfg.seed, "observation", gpu.gpu_id, step, "power"),
            "power_limit_w": None if hidden else limit,
            "sm_util_ratio": None if hidden else gpu.util,
            "ecc_sbe_total": None if (hidden or not profile["supports_ecc"]) else gpu.ecc_sbe,
            "ecc_dbe_total": None if (hidden or not profile["supports_ecc"]) else gpu.ecc_dbe,
            "fan_speed_ratio": None if (hidden or not profile["supports_fan"]) else min(1.0, gpu.util * 0.8),
            "nvlink_replay_total": None if (hidden or not profile["supports_nvlink"]) else gpu.nvlink_replay,
            "occupancy_ratio": None if (hidden or not profile["supports_occupancy"]) else gpu.util * 0.7,
            "clock_skew_s": cfg.clock_skew_s,
            "family": profile["family"],
            "phase": gpu.phase,
            "power_domain_id": gpu.power_domain_id,
            "cooling_domain_id": gpu.cooling_domain_id,
            "profile_id": gpu.profile_id,
        }
        unexpected = set(row) - OBS_KEYS
        if unexpected:
            raise RuntimeError(f"observation leaked keys {unexpected}")
        world.observations.append(row)
        if gpu.functional and not gpu.spare:
            world.logs.append(
                {
                    "log_id": f"log-{gpu.gpu_id}-{step}",
                    "emitter": gpu.gpu_id,
                    "event_step": step,
                    "availability_step": step,
                    "severity": "info",
                    "template": "rank heartbeat",
                    "symptom_code": "",
                }
            )


def _coolant_domain(world: World, domain: str) -> float:
    return 25.0 + world.supply_offset.get(domain, 0.0)


def _available(world: World, step: int, entity_id: str | None = None) -> list[dict]:
    rows = [
        row
        for row in world.observations
        if row["availability_step"] <= step and (entity_id is None or row["entity_id"] == entity_id)
    ]
    return rows


def _series(rows: list[dict], name: str) -> list:
    return [row.get(name) for row in rows]


def _snapshot(world: World, cfg: ScenarioConfig, step: int, job: Job, timeout: int) -> dict:
    gpu_rows = {}
    residuals = []
    summaries = []
    heartbeat_missing = []
    for rank, gpu_id in enumerate(job.rank_gpu):
        if rank in job.dropped:
            continue
        gpu = world.gpus[gpu_id]
        rows = [row for row in _available(world, step, gpu_id) if row.get("entity_kind") == "accelerator"]
        facility = [row for row in _available(world, step, gpu.cooling_domain_id)]
        coolant_series = [row.get("supply_temp_c") for row in facility if row.get("supply_temp_c") is not None]
        coolant = coolant_series[-1] if coolant_series else None
        temps = _series(rows, "gpu_temp_c")
        powers = _series(rows, "power_draw_w")
        utils = _series(rows, "sm_util_ratio")
        limits = _series(rows, "power_limit_w")
        residual_series = [
            thermal_residual(temp, power, coolant, gpu.profile["nominal_r"])
            for temp, power in zip(temps, powers)
        ]
        residual = ewma(residual_series)
        if residual is not None:
            residuals.append((residual, gpu_id))
        logs = [log for log in world.logs if log["emitter"] == gpu_id and log["availability_step"] <= step]
        last_beat = max((log["event_step"] for log in logs), default=None)
        age = 999 if last_beat is None else step - last_beat
        missing = age >= timeout and not gpu.spare
        if missing:
            heartbeat_missing.append(rank)
        peers = []
        for other in world.gpus.values():
            if other.gpu_id == gpu.gpu_id or other.profile["family"] != gpu.profile["family"] or other.phase != gpu.phase:
                continue
            other_rows = [row for row in _available(world, step, other.gpu_id) if row.get("entity_kind") == "accelerator"]
            other_residual = ewma(
                [
                    thermal_residual(row.get("gpu_temp_c"), row.get("power_draw_w"), coolant, other.profile["nominal_r"])
                    for row in other_rows
                ]
            )
            if other_residual is not None:
                peers.append(other_residual)
        domain_high = 0
        low_limits = 0
        for other in world.gpus.values():
            if other.power_domain_id != gpu.power_domain_id:
                continue
            other_rows = [row for row in _available(world, step, other.gpu_id) if row.get("entity_kind") == "accelerator"]
            if other_rows and other_rows[-1].get("power_limit_w") is not None:
                if other_rows[-1]["power_limit_w"] < 0.8 * other.profile["tdp_w"]:
                    low_limits += 1
            if other.cooling_domain_id == gpu.cooling_domain_id and other.gpu_id != gpu.gpu_id:
                ores = ewma(
                    [
                        thermal_residual(row.get("gpu_temp_c"), row.get("power_draw_w"), coolant, other.profile["nominal_r"])
                        for row in [r for r in _available(world, step, other.gpu_id) if r.get("entity_kind") == "accelerator"]
                    ]
                )
                if ores is not None and ores > 6:
                    domain_high += 1
        present_utils = [value for value in utils if value is not None]
        util_jump = len(present_utils) >= 4 and present_utils[-1] - present_utils[0] > 0.3
        paired_temp = [value for value in temps if value is not None]
        paired_power = [value for value in powers if value is not None]
        tracks = False
        if len(paired_temp) >= 4 and len(paired_power) >= 4 and residual is not None and abs(residual) < 4 and util_jump:
            tracks = True
        freshness = 999 if not rows else step - rows[-1]["event_step"]
        quality = freshness <= 5 and len(rows) >= 3 and abs(cfg.clock_skew_s) < 2 and not (cfg.blackout and cfg.blackout[0] <= step < cfg.blackout[1])
        firmware = any(event["kind"] == "firmware" and 0 <= step - event["step"] <= 15 for event in world.admin)
        maintenance = False
        if cfg.maintenance_window:
            maintenance = cfg.maintenance_window[0] <= step <= cfg.maintenance_window[1]
        summary = EvidenceSummary(
            residual_ewma=residual,
            ecc_rate=0,
            power_drop_correlated=low_limits >= 2,
            link_error_rate=0,
            util_jump=util_jump,
            temp_tracks_power=tracks,
            freshness_steps=freshness,
            support_count=len(rows),
            domain_peer_high_residual=domain_high,
            telemetry_gap=freshness > 5,
            progress_continuing=gpu.functional,
            checkpoint_incomplete=False,
            firmware_changed=firmware,
            maintenance_window=maintenance,
            heartbeat_missing=missing,
            data_quality_ok=quality,
        )
        ranked = rank_hypotheses(summary)
        summaries.append(ranked)
        gpu_rows[gpu_id] = {
            "gpu_temp_c": temps[-1] if temps else None,
            "power_draw_w": powers[-1] if powers else None,
            "power_limit_w": limits[-1] if limits else None,
            "sm_util_ratio": utils[-1] if utils else None,
            "residual_ewma": residual,
            "fan_speed_ratio": rows[-1].get("fan_speed_ratio") if rows else None,
            "family": gpu.profile["family"],
            "phase": gpu.phase,
            "freshness_steps": freshness,
            "hypotheses": ranked,
            "peer_count": len(peers),
            "power_domain_id": gpu.power_domain_id,
            "cooling_domain_id": gpu.cooling_domain_id,
        }
    verified = [
        cp
        for cp in world.checkpoints
        if cp["state"] == CheckpointState.verified_usable.value and cp["verified_at"] <= step and cp["job_id"] == job.job_id
    ]
    allow_reshard = job.capability == "reconfigurable"
    chosen, _rejected = select_restore_checkpoint(
        verified,
        topology_signature=job.topology_signature,
        allow_reshard=allow_reshard,
        storage_reachable=True,
        decision_step=step,
    )
    age = None if not verified else int(job.progress - max(cp["progress"] for cp in verified))
    if summaries:
        def _rank_key(item: dict) -> float:
            if item.get("abstain"):
                return -1.0
            return max((alt["support"] for alt in item["alternatives"]), default=0.0)

        leading = max(summaries, key=_rank_key)
    else:
        leading = rank_hypotheses(EvidenceSummary(data_quality_ok=False, freshness_steps=999, support_count=0))
    quality_ok = all(row["freshness_steps"] <= 5 for row in gpu_rows.values()) and bool(gpu_rows) and abs(cfg.clock_skew_s) < 2
    if cfg.collector_lag_steps > 5:
        quality_ok = False
    functional = {gpu.gpu_id: gpu.functional for gpu in world.gpus.values()}
    quarantined = {gpu.gpu_id: gpu.quarantined for gpu in world.gpus.values()}
    from training_continuity.simulation.capabilities import bad_ranks

    bad = bad_ranks(job.rank_gpu, job.dropped, functional, quarantined)
    supported, support_reason = reconfigure_possible(job.capability, len(job.rank_gpu), job.tp_size, job.dropped, bad or [0])
    # Asking whether a membership change could be supported if a rank were failed.
    # The snapshot reports the capability constraint, not a hidden fault.
    reconfigure_ok = job.capability == "reconfigurable" and job.tp_size == 1
    hottest = max(residuals, key=lambda item: item[0])[1] if residuals else job.rank_gpu[0]
    return {
        "t": step,
        "job_id": job.job_id,
        "capability": job.capability,
        "progress": job.progress,
        "high_water": job.high_water,
        "checkpoint_age": age,
        "eligible_checkpoint_id": None if chosen is None else chosen["checkpoint_id"],
        "quality_ok": quality_ok and leading.get("abstain") is not True or quality_ok,
        "freshness_steps": max((row["freshness_steps"] for row in gpu_rows.values()), default=999),
        "heartbeat_missing_ranks": heartbeat_missing,
        "gpus": gpu_rows,
        "hypotheses": leading,
        "max_residual_ewma": max((item[0] for item in residuals), default=None),
        "hottest_gpu": hottest,
        "topology_signature": job.topology_signature,
        "placement_version": job.placement_version,
        "storage_reachable": True,
        "spare_available": any(gpu.spare and not gpu.occupied for gpu in world.gpus.values()),
        "tp_size": job.tp_size,
        "reconfigure_supported": reconfigure_ok,
        "reconfigure_reason": support_reason,
        "state": job.state,
    }


def _group_incidents(world: World, snap: dict, step: int) -> None:
    if snap["max_residual_ewma"] is not None and snap["max_residual_ewma"] > 6 and snap["quality_ok"]:
        gpu_id = snap["hottest_gpu"]
        scope = world.gpus[gpu_id].cooling_domain_id
        _open_incident(world, scope, step, [f"obs-{gpu_id}-{step}"])
    for row in snap["gpus"].values():
        if row.get("power_limit_w") is not None and row["power_limit_w"] < 0.8 * PROFILES.get(row.get("profile_id", "northspan-n8"), PROFILES["northspan-n8"])["tdp_w"]:
            _open_incident(world, row["power_domain_id"], step, [row["power_domain_id"]])
            break
    if snap["heartbeat_missing_ranks"]:
        _open_incident(world, snap["job_id"], step, [snap["job_id"]])


def _open_incident(world: World, scope: str, step: int, evidence: list[str]) -> None:
    for incident in world.incidents:
        if incident["scope"] == scope and incident["state"] == "open":
            for evidence_id in evidence:
                if evidence_id not in incident["evidence_ids"]:
                    incident["evidence_ids"].append(evidence_id)
            return
    world.incidents.append(
        {
            "incident_id": f"inc-{scope}-{step}",
            "scope": scope,
            "opened_step": step,
            "state": "open",
            "evidence_ids": list(evidence),
            "abstain_reason": "",
        }
    )


def _start_checkpoint(world: World, cfg: ScenarioConfig, job: Job, step: int, reason: str) -> dict:
    checkpoint_id = f"cp-{job.job_id}-{int(job.progress)}-{len(world.checkpoints)}"
    state = CheckpointState.requested
    state = transition_checkpoint(state, CheckpointState.queued)
    state = transition_checkpoint(state, CheckpointState.writing)
    checkpoint = {
        "checkpoint_id": checkpoint_id,
        "job_id": job.job_id,
        "progress": job.progress,
        "state": state.value,
        "topology_signature": job.topology_signature,
        "shards_expected": len(job.rank_gpu) - len(job.dropped),
        "shards_present": 0,
        "checksum_ok": True,
        "reachable": True,
        "verified_at": None,
        "logical_consistent": True,
        "reason": reason,
        "started_step": step,
    }
    world.checkpoints.append(checkpoint)
    job.active_checkpoint = checkpoint_id
    job.checkpoint_left = cfg.checkpoint_write_steps
    return checkpoint


def _finalize_checkpoint(world: World, cfg: ScenarioConfig, job: Job, step: int) -> None:
    checkpoint = next(cp for cp in world.checkpoints if cp["checkpoint_id"] == job.active_checkpoint)
    failed_member = any(
        not world.gpus[gpu_id].functional
        for rank, gpu_id in enumerate(job.rank_gpu)
        if rank not in job.dropped
    )
    progress_key = int(checkpoint["progress"])
    state = CheckpointState(checkpoint["state"])
    if failed_member or progress_key in cfg.storage_fail_progress:
        state = transition_checkpoint(state, CheckpointState.failed)
        checkpoint["shards_present"] = max(0, checkpoint["shards_expected"] // 2)
        checkpoint["reachable"] = progress_key not in cfg.storage_fail_progress
        checkpoint["state"] = state.value
        job.active_checkpoint = None
        return
    state = transition_checkpoint(state, CheckpointState.manifest_complete)
    state = transition_checkpoint(state, CheckpointState.verification_pending)
    checkpoint["shards_present"] = checkpoint["shards_expected"]
    if progress_key in cfg.corrupt_progress:
        state = transition_checkpoint(state, CheckpointState.corrupted)
        checkpoint["checksum_ok"] = False
    else:
        state = transition_checkpoint(state, CheckpointState.verified_usable)
        checkpoint["verified_at"] = step
        checkpoint["checksum_ok"] = True
        checkpoint["reachable"] = True
    checkpoint["state"] = state.value
    job.active_checkpoint = None


def _job_blocked(job: Job, world: World) -> bool:
    for rank, gpu_id in enumerate(job.rank_gpu):
        if rank in job.dropped:
            continue
        gpu = world.gpus[gpu_id]
        if not gpu.functional or gpu.quarantined:
            return True
    return False


def _credit(job: Job) -> float:
    groups = len(job.rank_gpu) // job.tp_size
    dropped_groups = 0
    size = job.tp_size
    for index in range(groups):
        ranks = range(index * size, (index + 1) * size)
        if all(rank in job.dropped for rank in ranks):
            dropped_groups += 1
    surviving = groups - dropped_groups
    return surviving / groups if groups else 0


def _advance_job(world: World, cfg: ScenarioConfig, job: Job, step: int) -> str:
    if job.checkpoint_left > 0:
        job.checkpoint_left -= 1
        job.state = "checkpoint"
        if job.checkpoint_left == 0 and job.active_checkpoint:
            _finalize_checkpoint(world, cfg, job, step)
        return "checkpoint"
    if job.recovery_left > 0:
        job.recovery_left -= 1
        job.state = "recovery"
        return "recovery"
    if _job_blocked(job, world):
        job.state = "stalled"
        return "stalled"
    credit = _credit(job)
    job.progress += credit
    if job.progress > job.high_water + 1e-9:
        job.useful_new += job.progress - job.high_water
        job.high_water = job.progress
    else:
        job.recomputation += credit
    job.state = "running"
    if job.progress + 1e-9 >= job.next_checkpoint_at and job.active_checkpoint is None:
        _start_checkpoint(world, cfg, job, step, "periodic_schedule")
        job.next_checkpoint_at = job.progress + cfg.checkpoint_interval
    return "running"


def _fractions(mode: str) -> dict[str, float]:
    data = {name: 0.0 for name in EXCLUSIVE_STATES}
    data[mode] = 1.0
    return data


def _account(world: World, cfg: ScenarioConfig, ledger: Ledger) -> None:
    assignment: dict[str, tuple[Job, int]] = {}
    interrupted = 0
    for job in world.jobs.values():
        if job.state in {"stalled", "recovery", "checkpoint"}:
            interrupted += 1
        for rank, gpu_id in enumerate(job.rank_gpu):
            assignment[gpu_id] = (job, rank)
    checkpoint_sum = 0.0
    for gpu_id, gpu in world.gpus.items():
        if gpu_id in assignment:
            job, rank = assignment[gpu_id]
            if (not gpu.functional) or gpu.quarantined or rank in job.dropped:
                mode = "unavailable"
            elif job.state == "checkpoint":
                mode = "checkpoint"
            elif job.state == "recovery":
                mode = "recovery"
            elif job.state == "stalled":
                mode = "stalled"
            else:
                mode = "compute"
        else:
            mode = "unavailable" if not gpu.functional else "idle"
        if mode == "compute":
            fractions = {name: 0.0 for name in EXCLUSIVE_STATES}
            fractions["compute"] = 0.8
            fractions["collective_wait"] = 0.2
        else:
            fractions = _fractions(mode)
        ledger.add_resource(gpu_id, fractions)
        if mode == "checkpoint":
            checkpoint_sum += 1
    ledger.note_step(jobs_interrupted=interrupted, checkpoint_fraction_sum=checkpoint_sum)
    quiescent_hosts = world.cluster["quiescent_accelerator_count"] // CLUSTER_GPUS_PER_HOST
    ledger.quiescent_accelerator_seconds += world.cluster["quiescent_accelerator_count"] * cfg.step_seconds
    ledger.add_monitoring(
        0.01 * cfg.step_seconds * (len(world.gpus) + quiescent_hosts),
        240 * len(world.gpus) + 64 * quiescent_hosts,
    )


def _execute(world: World, cfg: ScenarioConfig, job: Job, decision: dict, step: int, mode: str, approvals: list[dict]) -> str | None:
    action_name = decision["action"]
    if action_name in {"none", "investigate"}:
        if action_name == "investigate":
            episode = f"investigate|{job.job_id}|{decision['rationale']}"
            if any(item["episode"] == episode for item in world.actions):
                return None
            row = _action_row(decision, step, job, "succeeded", "automated_policy" if mode == "automated" else "investigator", mode)
            row["episode"] = episode
            world.actions.append(row)
        return None
    episode = f"{action_name}|{decision['scope']}|{job.attempt}|{int(job.progress)}"
    if action_name == "restart":
        episode = f"restart|{job.job_id}|{job.attempt}"
    if any(item["episode"] == episode for item in world.actions):
        return None
    pre_hash = f"{job.placement_version}|{decision.get('eligible', '')}|{int(job.progress)}"
    row = _action_row(decision, step, job, "proposed", "", mode)
    row["episode"] = episode
    row["precondition_hash"] = pre_hash
    if action_name == "reconfigure":
        functional = {gpu.gpu_id: gpu.functional for gpu in world.gpus.values()}
        quarantined = {gpu.gpu_id: gpu.quarantined for gpu in world.gpus.values()}
        from training_continuity.simulation.capabilities import bad_ranks

        bad = bad_ranks(job.rank_gpu, job.dropped, functional, quarantined)
        ok, reason = reconfigure_possible(job.capability, len(job.rank_gpu), job.tp_size, job.dropped, bad)
        if not ok:
            row["state"] = "failed"
            row["reason"] = reason
            row["actor"] = "capability_gate"
            row["actor_kind"] = "system"
            world.actions.append(row)
            return None
    if decision["high_impact"] and mode == "manual":
        approval = next((item for item in approvals if item.get("action_id") == row["action_id"]), None)
        if approval is None:
            row["state"] = "awaiting_approval"
            row["actor"] = ""
            world.actions.append(row)
            return "awaiting_approval"
        if approval.get("expires_step") is not None and approval["expires_step"] < step:
            row["state"] = "expired"
            world.actions.append(row)
            return None
        if approval.get("decision") == "reject":
            row["state"] = "cancelled"
            row["actor"] = approval.get("actor", "approver")
            row["actor_kind"] = "human"
            world.actions.append(row)
            return None
        if approval.get("precondition_hash") != pre_hash:
            row["state"] = "failed"
            row["reason"] = "stale_preconditions"
            row["actor"] = approval.get("actor", "approver")
            row["actor_kind"] = "human"
            world.actions.append(row)
            return None
        row["actor"] = approval.get("actor", "approver")
        row["actor_kind"] = "human"
    else:
        row["actor"] = decision.get("policy", "policy")
        row["actor_kind"] = "automated_policy" if mode == "automated" else "investigator"
    outcome, reason = _apply_effect(world, cfg, job, decision, step)
    row["state"] = "succeeded" if outcome else "failed"
    row["reason"] = reason
    row["effect_applied"] = outcome
    world.actions.append(row)
    return None


def _action_row(decision, step, job, state, actor, mode) -> dict:
    action_id = f"{decision['action']}|{decision['scope']}|{step}|{job.placement_version}"
    return {
        "action_id": action_id,
        "action_type": decision["action"],
        "state": state,
        "scope": decision["scope"],
        "step": step,
        "high_impact": decision["high_impact"],
        "rationale": decision["rationale"],
        "actor": actor,
        "actor_kind": "human" if mode == "manual" and decision["high_impact"] else "automated_policy",
        "effect_applied": False,
        "episode": "",
        "reason": decision["rationale"],
        "policy": decision.get("policy", ""),
        "hypotheses": decision.get("hypotheses"),
    }


def _apply_effect(world, cfg, job, decision, step) -> tuple[bool, str]:
    action = decision["action"]
    if action == "request_checkpoint":
        if job.active_checkpoint is not None or job.checkpoint_left > 0:
            return False, "checkpoint_already_in_flight"
        _start_checkpoint(world, cfg, job, step, "policy_request")
        return True, "checkpoint_started"
    if action == "quarantine":
        gpu = world.gpus[decision["scope"]]
        gpu.quarantined = True
        return True, "quarantined"
    if action == "restart":
        return _restart(world, cfg, job, step, use_spare=job.capability == "redundant")
    if action == "reconfigure":
        functional = {gpu.gpu_id: gpu.functional for gpu in world.gpus.values()}
        quarantined = {gpu.gpu_id: gpu.quarantined for gpu in world.gpus.values()}
        from training_continuity.simulation.capabilities import bad_ranks

        bad = bad_ranks(job.rank_gpu, job.dropped, functional, quarantined)
        groups = [list(range(i, i + job.tp_size)) for i in range(0, len(job.rank_gpu), job.tp_size)]
        for group in groups:
            if any(rank in bad for rank in group):
                job.dropped.update(group)
        job.topology_signature = signature(job.rank_gpu, job.dropped)
        job.placement_version += 1
        ok, reason = _restart(world, cfg, job, step, use_spare=False)
        return ok, "resharded_and_" + reason
    return False, "unsupported_action"


def _restart(world, cfg, job, step, use_spare: bool) -> tuple[bool, str]:
    allow = job.capability == "reconfigurable"
    chosen, rejected = select_restore_checkpoint(
        [cp for cp in world.checkpoints if cp["job_id"] == job.job_id],
        topology_signature=job.topology_signature,
        allow_reshard=allow,
        storage_reachable=True,
        decision_step=step,
    )
    if chosen is None:
        return False, "no_eligible_checkpoint"
    for rank, gpu_id in enumerate(job.rank_gpu):
        if rank in job.dropped:
            continue
        gpu = world.gpus[gpu_id]
        if gpu.functional:
            continue
        if gpu.fail_mode == "recoverable_process":
            gpu.functional = True
            gpu.fail_mode = None
        elif use_spare:
            spare = next((item for item in world.gpus.values() if item.spare and not item.occupied and item.profile_id == gpu.profile_id), None)
            if spare is None:
                return False, "no_compatible_spare"
            spare.occupied = True
            job.rank_gpu[rank] = spare.gpu_id
            job.placement_version += 1
            job.topology_signature = signature(job.rank_gpu, job.dropped)
        else:
            return False, "failed_accelerator_has_no_spare"
    job.progress = chosen["progress"]
    job.attempt += 1
    job.recovery_left = cfg.warmup_steps
    job.state = "recovery"
    return True, f"restored_{chosen['checkpoint_id']}"


def run_scenario(cfg: ScenarioConfig, policy_name: str = "reactive", mode: str = "automated", approvals: list[dict] | None = None, oracle: bool = False) -> dict:
    if oracle:
        policy = OraclePolicy()
    else:
        policy = POLICIES[policy_name]
    world = build_world(cfg)
    faults = schedule_faults(cfg, world)
    world.faults = faults
    if cfg.firmware_event_at is not None:
        world.admin.append({"kind": "firmware", "step": cfg.firmware_event_at, "target": "job-0"})
    ledger = Ledger(cfg.step_seconds)
    approvals = approvals or []
    status = "completed"
    pending = None
    for step in range(cfg.steps):
        _apply_faults(world, faults, step)
        _physics(world, cfg, step)
        _emit(world, cfg, step)
        for job in world.jobs.values():
            _advance_job(world, cfg, job, step)
        primary = world.jobs["job-0"]
        if oracle:
            snap = _snapshot(world, cfg, step, primary, policy.heartbeat_timeout)
            decision = policy.choose_with_truth(snap, {"faults": faults})
        else:
            snap = _snapshot(world, cfg, step, primary, policy.heartbeat_timeout)
            decision = policy.choose(snap)
        decision["policy"] = policy.name
        decision["eligible"] = snap["eligible_checkpoint_id"] or ""
        _group_incidents(world, snap, step)
        outcome = _execute(world, cfg, primary, decision, step, mode, approvals)
        _account(world, cfg, ledger)
        world.truth.append(
            {
                "step": step,
                "temps": {gpu.gpu_id: gpu.temp_c for gpu in world.gpus.values()},
                "r_multiplier": {gpu.gpu_id: gpu.r_multiplier for gpu in world.gpus.values()},
                "functional": {gpu.gpu_id: gpu.functional for gpu in world.gpus.values()},
            }
        )
        if outcome == "awaiting_approval":
            status = "awaiting_approval"
            pending = world.actions[-1]
            break
    for incident in world.incidents:
        incident["abstain_reason"] = snap["hypotheses"].get("abstain_reason", "") if snap["hypotheses"].get("abstain") else ""
    metrics = _metrics(world, ledger)
    return {
        "synthetic": True,
        "scenario_id": cfg.scenario_id,
        "story_id": cfg.story_id,
        "policy": policy.name,
        "mode": mode,
        "status": status,
        "pending_action": pending,
        "actions": world.actions,
        "checkpoints": world.checkpoints,
        "incidents": world.incidents,
        "hypotheses": snap["hypotheses"],
        "snapshot": {key: value for key, value in snap.items() if key != "gpus"} | {"gpu_ids": list(snap["gpus"])},
        "gpus": snap["gpus"],
        "jobs": {
            job.job_id: {
                "state": job.state,
                "progress": job.progress,
                "high_water": job.high_water,
                "useful_new": job.useful_new,
                "recomputation": job.recomputation,
                "capability": job.capability,
                "rank_gpu": list(job.rank_gpu),
                "dropped": sorted(job.dropped),
            }
            for job in world.jobs.values()
        },
        "metrics": metrics,
        "cluster": {key: value for key, value in world.cluster.items() if key != "placed_ids"},
        "timeline": _timeline(world),
        "provenance": {
            "synthetic": True,
            "seed": cfg.seed,
            "config_hash": config_hash(cfg),
            "assumption": "virtual clock and keyed streams; not a measurement of a real fleet",
        },
        "evaluator": {
            "truth_namespace": True,
            "faults": faults,
            "trace": world.truth,
            "label": "evaluator-only latent truth",
        },
        "ledger_errors": ledger.conservation_errors(ledger.steps_accounted),
        "observations": world.observations,
        "logs": world.logs,
    }


def _metrics(world: World, ledger: Ledger) -> dict:
    useful = sum(job.useful_new for job in world.jobs.values())
    recompute = sum(job.recomputation for job in world.jobs.values())
    ledger.useful_new = useful
    ledger.recomputation = recompute
    data = ledger.as_dict()
    data["synthetic"] = True
    return data


def _timeline(world: World) -> list[dict]:
    points = []
    for row in world.observations:
        if row.get("entity_kind") != "accelerator":
            continue
        points.append(
            {
                "entity_id": row["entity_id"],
                "step": row["event_step"],
                "availability_step": row["availability_step"],
                "gpu_temp_c": row.get("gpu_temp_c"),
                "power_draw_w": row.get("power_draw_w"),
                "sm_util_ratio": row.get("sm_util_ratio"),
                "fan_speed_ratio": row.get("fan_speed_ratio"),
            }
        )
    return points


def public_view(result: dict, presentation: bool = False) -> dict:
    hidden = {
        "evaluator",
        "observations",
        "logs",
        "ledger_errors",
    }
    view = {key: value for key, value in result.items() if key not in hidden}
    view["synthetic"] = True
    if presentation:
        view.pop("metrics", None)
        view.pop("timeline", None)
        for job in view.get("jobs", {}).values():
            job.pop("progress", None)
            job.pop("useful_new", None)
            job.pop("recomputation", None)
            job.pop("high_water", None)
        if view.get("hypotheses"):
            for alt in view["hypotheses"].get("alternatives", []):
                alt.pop("support", None)
        view["presentation"] = True
    else:
        view["presentation"] = False
    view["narrative"] = narrative(result, presentation)
    return view


def narrative(result: dict, presentation: bool) -> str:
    hypotheses = result.get("hypotheses") or {}
    mechanism = hypotheses.get("leading_mechanism", "unknown")
    checkpoints = [cp for cp in result.get("checkpoints", []) if cp["state"] == "verified_usable"]
    newest = max(checkpoints, key=lambda cp: cp["progress"])["checkpoint_id"] if checkpoints else None
    pending = result.get("pending_action")
    if presentation:
        if pending:
            return "A high-impact action is waiting for a person. It applies to the affected ranks inside the GPU cluster, not to the quiescent population."
        if mechanism == "unknown":
            return "The evidence from the affected accelerators was not good enough for a cause. The rest of the cluster was not treated as failed."
        if mechanism == "workload_shift":
            return "The pattern matches a workload change. No disruptive action was taken."
        if newest:
            return f"A verified checkpoint ({newest}) is part of the decision record. Recovery can use only a save that reached verified-usable."
        return "The decision used observed evidence and the job's declared recovery capability."
    useful = result["metrics"]["useful_new"]
    cluster = result.get("cluster") or {}
    count = cluster.get("accelerator_count")
    scope = f"GPU cluster of {count} accelerators. " if count else ""
    return (
        f"{scope}Synthetic result for {result['policy']}: leading hypothesis {mechanism}. "
        f"Useful new progress {useful:.2f} steps. "
        + (f"Newest verified checkpoint {newest}." if newest else "No verified checkpoint.")
    )


def compare_policies(cfg: ScenarioConfig, names: list[str]) -> dict:
    branches = []
    onsets = None
    for name in names:
        result = run_scenario(cfg, name, mode="automated")
        fault_onsets = [(item["fault_id"], item["onset"], item["target_id"]) for item in result["evaluator"]["faults"]]
        if onsets is None:
            onsets = fault_onsets
        elif onsets != fault_onsets:
            raise RuntimeError("exogenous fault schedules diverged")
        branches.append(
            {
                "policy": name,
                "useful_new": result["metrics"]["useful_new"],
                "recomputation": result["metrics"]["recomputation"],
                "interruption_seconds": result["metrics"]["job_interruption_seconds"],
                "checkpoint_overhead_seconds": result["metrics"]["checkpoint_overhead_seconds"],
                "monitoring_cpu_seconds": result["metrics"]["monitoring_cpu_seconds"],
                "actions": [
                    {"action_type": action["action_type"], "state": action["state"], "step": action["step"], "reason": action["reason"]}
                    for action in result["actions"]
                ],
                "hypotheses": result["hypotheses"]["leading_mechanism"],
            }
        )
    deltas = None
    if len(branches) == 2:
        deltas = {
            "useful_new": branches[1]["useful_new"] - branches[0]["useful_new"],
            "does_not_add_recompute_again": True,
        }
    return {
        "synthetic": True,
        "counterfactual": True,
        "exogenous_faults_aligned": True,
        "config_hash": config_hash(cfg),
        "branches": branches,
        "delta_second_minus_first": deltas,
        "label": "paired synthetic worlds; not a real-fleet result",
    }
