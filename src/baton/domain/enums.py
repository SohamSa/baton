"""Closed vocabularies for causes, symptoms, and workflow states."""

from __future__ import annotations

from enum import Enum


class CauseFamily(str, Enum):
    physical_hardware = "physical_hardware"
    driver_firmware = "driver_firmware"
    application = "application"
    collective_communication = "collective_communication"
    storage = "storage"
    planned_maintenance = "planned_maintenance"
    unknown = "unknown"


class Mechanism(str, Enum):
    package_link = "package_link"
    wafer_cohort = "wafer_cohort"
    board_vrm = "board_vrm"
    assembly_strain = "assembly_strain"
    voltage_margin = "voltage_margin"
    power_capacity = "power_capacity"
    cooling_degradation = "cooling_degradation"
    straggler = "straggler"
    cooling_restriction = "cooling_restriction"
    repair_instability = "repair_instability"
    memory_errors = "memory_errors"
    power_interruption = "power_interruption"
    link_degradation = "link_degradation"
    driver_firmware = "driver_firmware"
    application_error = "application_error"
    collective_timeout = "collective_timeout"
    storage_fault = "storage_fault"
    planned_maintenance = "planned_maintenance"
    workload_shift = "workload_shift"
    collector_gap = "collector_gap"
    unknown = "unknown"


CAUSE_OF_MECHANISM = {
    **{m: CauseFamily.physical_hardware for m in (Mechanism.package_link, Mechanism.wafer_cohort, Mechanism.board_vrm, Mechanism.assembly_strain, Mechanism.voltage_margin, Mechanism.power_capacity)},
    Mechanism.cooling_degradation: CauseFamily.physical_hardware,
    Mechanism.straggler: CauseFamily.physical_hardware,
    Mechanism.cooling_restriction: CauseFamily.physical_hardware,
    Mechanism.repair_instability: CauseFamily.physical_hardware,
    Mechanism.memory_errors: CauseFamily.physical_hardware,
    Mechanism.power_interruption: CauseFamily.physical_hardware,
    Mechanism.link_degradation: CauseFamily.physical_hardware,
    Mechanism.driver_firmware: CauseFamily.driver_firmware,
    Mechanism.application_error: CauseFamily.application,
    Mechanism.collective_timeout: CauseFamily.collective_communication,
    Mechanism.storage_fault: CauseFamily.storage,
    Mechanism.planned_maintenance: CauseFamily.planned_maintenance,
    Mechanism.workload_shift: CauseFamily.unknown,
    Mechanism.collector_gap: CauseFamily.unknown,
    Mechanism.unknown: CauseFamily.unknown,
}


class ResourceState(str, Enum):
    compute = "compute"
    collective_wait = "collective_wait"
    stalled = "stalled"
    checkpoint = "checkpoint"
    restart = "restart"
    recovery = "recovery"
    unavailable = "unavailable"
    idle = "idle"
    monitoring = "monitoring"


class CheckpointState(str, Enum):
    requested = "requested"
    queued = "queued"
    writing = "writing"
    manifest_complete = "manifest_complete"
    verification_pending = "verification_pending"
    verified_usable = "verified_usable"
    failed = "failed"
    corrupted = "corrupted"
    unavailable = "unavailable"
    incompatible = "incompatible"


class ActionState(str, Enum):
    proposed = "proposed"
    awaiting_approval = "awaiting_approval"
    approved = "approved"
    queued = "queued"
    executing = "executing"
    verifying = "verifying"
    succeeded = "succeeded"
    failed = "failed"
    cancelled = "cancelled"
    expired = "expired"
    compensated = "compensated"


class ActionType(str, Enum):
    replace_cohort = "replace_cohort"
    service_board = "service_board"
    swap_chip = "swap_chip"
    pace_rank = "pace_rank"
    pace_domain = "pace_domain"
    none = "none"
    request_checkpoint = "request_checkpoint"
    investigate = "investigate"
    change_cadence = "change_cadence"
    stop_placement = "stop_placement"
    pause_job = "pause_job"
    quarantine = "quarantine"
    diagnose = "diagnose"
    allocate_spare = "allocate_spare"
    restart = "restart"
    reconfigure = "reconfigure"
    return_capacity = "return_capacity"
    replace_rank = "replace_rank"
    restore_cooling = "restore_cooling"
    qualified_restart = "qualified_restart"


HIGH_IMPACT = {
    ActionType.replace_cohort, ActionType.service_board, ActionType.swap_chip,
    ActionType.pace_rank, ActionType.pace_domain,
    ActionType.replace_rank,
    ActionType.restore_cooling,
    ActionType.qualified_restart,
    ActionType.diagnose,
    ActionType.pause_job,
    ActionType.quarantine,
    ActionType.allocate_spare,
    ActionType.restart,
    ActionType.reconfigure,
    ActionType.return_capacity,
    ActionType.request_checkpoint,
    ActionType.stop_placement,
}


class Role(str, Enum):
    viewer = "viewer"
    investigator = "investigator"
    approver = "approver"
    administrator = "administrator"


class Capability(str, Enum):
    strict_sync = "strict_sync"
    independent = "independent"
    reconfigurable = "reconfigurable"
    redundant = "redundant"

