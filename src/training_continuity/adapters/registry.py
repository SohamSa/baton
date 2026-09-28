"""Simulation and unimplemented hardware adapters."""

from __future__ import annotations


ADAPTERS = [
    {
        "name": "TelemetrySource",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["read_observed_series", "replay_file"],
    },
    {
        "name": "TrainingController",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["pause", "restart_from_verified_checkpoint", "reject_unsupported_reconfigure"],
    },
    {
        "name": "CheckpointStore",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["write_manifest", "verify", "reject_incomplete"],
    },
    {
        "name": "Scheduler",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["stop_new_placement", "read_capability_profile"],
    },
    {
        "name": "DiagnosticRunner",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["synthetic_diagnostics"],
    },
    {
        "name": "MaintenanceRegistry",
        "implementation": "simulation",
        "connected": True,
        "capabilities": ["read_spares", "read_windows"],
    },
    {
        "name": "HardwareTelemetry",
        "implementation": "unimplemented",
        "connected": False,
        "reason": "No physical GPU, fabric, or facility adapter is connected. Model output cannot run a shell command or reset hardware.",
        "capabilities": [],
    },
    {
        "name": "HardwareController",
        "implementation": "unimplemented",
        "connected": False,
        "reason": "Control adapters stay disabled. This process cannot act on a real cluster.",
        "capabilities": [],
    },
]
