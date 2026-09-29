"""Machine-readable field catalog.

Unique concepts, aliases, and window aggregations are different counts.
Unsupported measurements are null, never coerced to zero.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class FieldSpec:
    field_id: str
    entity: str
    name: str
    meaning: str
    dtype: str
    unit: str
    role: str
    leakage: str
    storage: str
    generating_mechanism: str
    consumer: str
    missingness: str
    cadence: str
    null_semantics: str
    constraints: str
    assumption_class: str
    alias_of: str | None = None
    window: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


def _field(**kwargs) -> FieldSpec:
    defaults = dict(
        missingness="none",
        cadence="static",
        null_semantics="null means unknown or unsupported, never a measured zero",
        constraints="see meaning",
        assumption_class="deliberate_simplification",
    )
    defaults.update(kwargs)
    return FieldSpec(**defaults)


# (name, unit, cumulative, meaning, dcgm_analog or "")
GPU_SIGNALS = [
    ("gpu_temp_c", "C", False, "Reported accelerator temperature.", "DCGM_FI_DEV_GPU_TEMP analog"),
    ("memory_temp_c", "C", False, "Reported memory temperature where the profile supports it.", "DCGM_FI_DEV_MEMORY_TEMP analog"),
    ("power_draw_w", "W", False, "Reported board power.", "DCGM_FI_DEV_POWER_USAGE analog"),
    ("power_limit_w", "W", False, "Reported power limit.", "engineering approximation of a power cap"),
    ("sm_clock_mhz", "MHz", False, "Reported SM clock.", "DCGM_FI_DEV_SM_CLOCK analog"),
    ("mem_clock_mhz", "MHz", False, "Reported memory clock.", "DCGM_FI_DEV_MEM_CLOCK analog"),
    ("sm_util_ratio", "ratio", False, "Reported SM activity ratio.", "DCGM_FI_PROF_SM_ACTIVE analog"),
    ("mem_util_ratio", "ratio", False, "Reported memory-copy activity ratio.", "DCGM_FI_DEV_MEM_COPY_UTIL analog"),
    ("fb_used_mib", "MiB", False, "Reported framebuffer used.", "DCGM_FI_DEV_FB_USED analog"),
    ("ecc_sbe_total", "count", True, "Cumulative corrected memory-error counter where ECC is supported.", "DCGM_FI_DEV_ECC_SBE_VOL_TOTAL analog"),
    ("ecc_dbe_total", "count", True, "Cumulative uncorrected memory-error counter where ECC is supported.", "DCGM_FI_DEV_ECC_DBE_VOL_TOTAL analog"),
    ("remapped_rows", "count", True, "Cumulative row-remap counter where supported.", "DCGM_FI_DEV_CORRECTABLE_REMAPPED_ROWS analog"),
    ("pcie_replay_total", "count", True, "Cumulative PCIe replay counter.", "DCGM_FI_DEV_PCIE_REPLAY_COUNTER analog"),
    ("nvlink_replay_total", "count", True, "Cumulative NVLink replay counter where the link exists.", "DCGM_FI_DEV_NVLINK_REPLAY_ERROR_COUNT_TOTAL analog"),
    ("energy_j", "J", True, "Cumulative reported energy.", "DCGM_FI_DEV_TOTAL_ENERGY_CONSUMPTION analog"),
    ("fan_speed_ratio", "ratio", False, "Fan speed only for profiles that declare a fan.", "not a DCGM default field; optional cooling proxy"),
    ("throttle_thermal", "flag", False, "Thermal throttle indicator.", "clock-event hw_thermal analog"),
    ("throttle_power", "flag", False, "Power throttle indicator.", "clock-event hw_power_brake analog"),
    ("occupancy_ratio", "ratio", False, "SM occupancy only where the profile declares support.", "DCGM_FI_PROF_SM_OCCUPANCY analog"),
    ("tensor_active_ratio", "ratio", False, "Tensor-pipe activity only where declared.", "DCGM_FI_PROF_PIPE_TENSOR_ACTIVE analog"),
    ("retired_pages", "count", True, "Retired-page counter where supported.", "DCGM_FI_DEV_RETIRED_SBE analog"),
    ("slowdown_temp_c", "C", False, "Profile slowdown temperature, a control envelope not a live measurement.", "hardware profile"),
    ("die_temp_c", "C", False, "Reported individual compute die temperature.", "per-die thermal diode telemetry analog"),
    ("hbm_stack_temp_c", "C", False, "Reported HBM3e high-bandwidth memory stack temperature.", "HBM base die thermal sensor analog"),
    ("die_leakage_current_ma", "mA", False, "Estimated silicon leakage current under active voltage.", "silicon process variation analog"),
    ("die_straggler_drag_ms", "ms", False, "Measured collective gang synchronization delay attributed to this die.", "all-reduce barrier latency delta analog"),
    ("mcm_d2d_link_margin_mv", "mV", False, "Die-to-die (D2D) interposer high-speed link eye margin voltage.", "UCIe / NV-HBI PHY eye-margin telemetry"),
    ("mcm_microbump_defect_count", "count", True, "Cumulative count of detected degraded or open microbumps on the interposer.", "IEEE 1838 / JTAG boundary scan counter"),
    ("mcm_remapped_lanes", "count", True, "Cumulative number of D2D bus lanes remapped to redundant spare microbumps via BISR.", "Built-In Self-Repair lane remap register"),
    ("mcm_test_sequence_phase", "id", False, "Current active phase of the automated MCM diagnostic ladder (Phase 1 to Phase 5).", "in-situ test sequencer state register"),
    ("wafer_lot_id", "id", False, "Foundry manufacturing wafer lot identifier.", "feed-forward foundry lot genealogy analog"),
    ("wafer_ring_radius_mm", "mm", False, "Physical radial distance of the die from wafer center (0-150mm).", "wafer map spatial coordinates"),
    ("factory_vmin_mv", "mV", False, "Minimum operating voltage certified at factory wafer sort.", "automated test equipment parametric sort analog"),
    ("factory_leakage_ma", "mA", False, "Static IDDQ leakage current measured at wafer probe.", "foundry wafer acceptance testing analog"),
    ("cohort_risk_flag", "flag", False, "Flag indicating this die belongs to a flagged or quarantined wafer lot.", "fleet silicon lineage risk register"),
]

HOST_SIGNALS = [
    ("cpu_util_ratio", "ratio", False, "Host CPU utilization."),
    ("mem_used_mib", "MiB", False, "Host memory used."),
    ("mem_available_mib", "MiB", False, "Host memory available."),
    ("disk_read_bps", "B/s", False, "Host storage read throughput."),
    ("disk_write_bps", "B/s", False, "Host storage write throughput."),
    ("net_rx_bps", "B/s", False, "Host network receive throughput."),
    ("net_tx_bps", "B/s", False, "Host network transmit throughput."),
    ("load1", "load", False, "One-minute load average analog."),
    ("heartbeat_age_s", "s", False, "Age of the latest process heartbeat."),
    ("host_reset_count", "count", True, "Host reset counter."),
    ("disk_queue_depth", "count", False, "Storage queue depth."),
    ("page_faults", "count", True, "Host page-fault counter."),
    ("thermal_zone_c", "C", False, "Host inlet or board thermal zone."),
    ("process_restart_count", "count", True, "Training-process restart counter."),
    ("canary_test_score", "score", False, "Automated qualification stress test score (0-100) before fleet re-entry."),
    ("canary_test_passed", "flag", False, "Whether the node passed the canary qualification gate."),
    ("silicon_yield_bin", "id", False, "Silicon yield categorization bin (Bin 1 Gold, Bin 2 Standard, Bin 3 Marginal)."),
    ("rma_eligible_flag", "flag", False, "Whether telemetry justifies a vendor hardware warranty claim."),
    ("board_vrm_phase_count", "count", False, "Number of active operational VRM multi-phase power stages."),
    ("board_vrm_ripple_mv", "mV", False, "Measured core voltage ripple on the baseboard power distribution network."),
    ("board_retimer_eye_margin_mv", "mV", False, "Measured eye-diagram voltage margin on high-speed baseboard PCIe/NVLink retimers."),
    ("board_pcb_strain_microstrain", "strain", False, "Mechanical flexure strain on baseboard PCB from cold plate torque."),
    ("fault_domain_verdict", "id", False, "Diagnostic classification verdict isolating fault to silicon, board VRM, retimer, or socket."),
    ("odm_torque_cnm", "cN·m", False, "Cold-plate screw mounting torque recorded at ODM assembly factory."),
    ("odm_pcb_strain_ue", "strain", False, "Mechanical PCB flexure strain under cold-plate clamp pressure."),
    ("odm_assembly_line_id", "id", False, "ODM automated surface-mount assembly line identifier."),
    ("slt_thermal_margin_c", "C", False, "Thermal margin delta certified during factory System-Level Testing."),
    ("lifecycle_stage", "category", False, "Current lifecycle stage of the chip (foundry, osat, slt, odm, rack_l11, datacenter_l12)."),
    ("warranty_liability_tier", "category", False, "Supplier tier responsible for hardware defect warranty credit."),
    ("ai_anomaly_score", "score", False, "Inferred anomaly probability score (0-1) from silicon-context autoencoder."),
    ("dynamic_vmin_mv", "mV", False, "Dynamic minimum operating voltage threshold at current temperature and clock."),
    ("voltage_margin_mv", "mV", False, "Headroom between live core voltage and temperature-adjusted Vmin cliff."),
    ("thermal_residual_c", "C", False, "Observed junction temperature minus physics-informed silicon digital twin estimate."),
    ("sdc_hazard_flag", "flag", False, "Flag indicating sub-threshold timing violation risk for Silent Data Corruption."),
    ("anomaly_classification", "category", False, "Diagnostic classification verdict (nominal_workload_surge, parametric_drift, cooling_degradation, subthreshold_cliff)."),
]

FABRIC_SIGNALS = [
    ("link_tx_bytes", "B", True, "Link transmit bytes."),
    ("link_rx_bytes", "B", True, "Link receive bytes."),
    ("link_tx_errors", "count", True, "Link transmit errors."),
    ("link_rx_drops", "count", True, "Link receive drops."),
    ("link_retrans", "count", True, "Link retransmissions."),
    ("link_latency_us", "us", False, "Reported one-way latency analog."),
    ("link_congestion_ratio", "ratio", False, "Congestion proxy."),
    ("link_state_up", "flag", False, "Link up indicator."),
    ("link_reset_count", "count", True, "Link reset counter."),
    ("throughput_gbps", "Gb/s", False, "Throughput analog."),
]

FACILITY_SIGNALS = [
    ("inlet_temp_c", "C", False, "Reported cold-aisle or loop inlet temperature."),
    ("supply_temp_c", "C", False, "Cooling-loop supply temperature."),
    ("return_temp_c", "C", False, "Cooling-loop return temperature."),
    ("flow_lpm", "L/min", False, "Cooling-loop flow."),
    ("feed_voltage_v", "V", False, "Power-feed voltage."),
    ("feed_current_a", "A", False, "Power-feed current."),
    ("humidity_ratio", "ratio", False, "Relative humidity analog."),
    ("shared_alarm", "flag", False, "Shared facility alarm bit."),
    ("facility_power_mw", "MW", False, "Total facility electrical power draw across IT and cooling."),
    ("substation_cap_mw", "MW", False, "Contractual utility grid substation power delivery cap."),
    ("facility_pue", "ratio", False, "Power usage effectiveness ratio (total facility power / IT power)."),
    ("idle_stall_power_mw", "MW", False, "Unproductive electrical power drawn by the cluster while stalled."),
    ("power_ramp_rate_mw_s", "MW/s", False, "Transient rate of change of electrical power demand (di/dt proxy)."),
    ("rack_shelf_index", "index", False, "Server shelf elevation slot inside rack 0-15."),
    ("rack_manifold_flow_lpm", "L/min", False, "Rack liquid coolant manifold flow rate."),
    ("rack_manifold_pressure_psi", "psi", False, "Coolant loop differential pressure across rack manifold."),
    ("rack_busbar_voltage_v", "V", False, "Live DC voltage measured at rack vertical busbar tap."),
    ("rack_thermal_gradient_c", "C", False, "Spatial temperature delta between top and bottom shelves in the rack."),
]

PROGRESS_SIGNALS = [
    ("progress_units", "step", False, "Committed attempt progress after the step."),
    ("iteration_duration_s", "s", False, "Iteration duration including collective wait."),
    ("collective_wait_s", "s", False, "Time blocked in collective communication."),
    ("straggler_gap_s", "s", False, "Gap between fastest and slowest rank in the step."),
    ("credit", "fraction", False, "Progress credit after capability-aware membership changes."),
    ("workload_phase", "category", False, "Declared workload phase identifier."),
]

COLLECTOR_SIGNALS = [
    ("sample_interval_s", "s", False, "Configured sampling interval."),
    ("gap_count", "count", True, "Detected sampling gaps."),
    ("lag_s", "s", False, "Collector lag."),
    ("loss_ratio", "ratio", False, "Drop ratio under backpressure."),
    ("clock_skew_s", "s", False, "Estimated collector clock skew."),
    ("schema_version", "version", False, "Observation schema version."),
    ("collector_restart_count", "count", True, "Collector restart counter."),
    ("queue_depth", "count", False, "Bounded queue depth."),
    ("dropped_count", "count", True, "Observations dropped because the queue was full."),
]

RELATIONAL: list[tuple] = []


def _rel(entity: str, rows: list[tuple]) -> None:
    for name, dtype, unit, meaning, role, leakage, storage, mechanism, consumer in rows:
        RELATIONAL.append(
            _field(
                field_id=f"{entity}.{name}",
                entity=entity,
                name=name,
                meaning=meaning,
                dtype=dtype,
                unit=unit,
                role=role,
                leakage=leakage,
                storage=storage,
                generating_mechanism=mechanism,
                consumer=consumer,
                cadence="on change" if "interval" in meaning else "per revision",
            )
        )


_rel("sites", [
    ("site_id", "text", "id", "Stable fictional site identifier.", "audit", "none", "postgres", "assigned", "inventory and UI"),
    ("display_name", "text", "text", "Fictional site label.", "audit", "none", "postgres", "assigned", "UI"),
    ("timezone", "text", "tz", "Site timezone for maintenance windows.", "control_input", "none", "postgres", "assigned", "scheduling"),
    ("climate_regime", "text", "category", "Coarse environmental regime used by the facility model.", "control_input", "none", "postgres", "assigned", "facility simulation"),
    ("organization_mode", "text", "category", "Always single_organization in this build.", "audit", "none", "postgres", "constant", "security docs"),
])
_rel("zones", [
    ("zone_id", "text", "id", "Failure-domain zone within a site.", "audit", "none", "postgres", "assigned", "dependency explorer"),
    ("site_id", "text", "id", "Parent site.", "audit", "none", "postgres", "assigned", "joins"),
    ("shared_boundary", "text", "category", "What infrastructure is shared inside the zone.", "control_input", "none", "postgres", "assigned", "incident grouping"),
])
_rel("racks", [
    ("rack_id", "text", "id", "Rack identifier.", "audit", "none", "postgres", "assigned", "placement"),
    ("zone_id", "text", "id", "Parent zone.", "audit", "none", "postgres", "assigned", "joins"),
    ("power_feed_id", "text", "id", "Primary power feed.", "control_input", "none", "postgres", "assigned", "power RCA"),
    ("cooling_loop_id", "text", "id", "Primary cooling loop.", "control_input", "none", "postgres", "assigned", "cooling RCA"),
    ("placement_slots", "int", "count", "Accelerator slots.", "control_input", "none", "postgres", "assigned", "capacity"),
])
_rel("hosts", [
    ("host_id", "text", "id", "Host identifier.", "audit", "none", "postgres", "assigned", "placement"),
    ("rack_id", "text", "id", "Parent rack.", "audit", "none", "postgres", "assigned", "joins"),
    ("lifecycle_state", "text", "category", "in_service, maintenance, or retired.", "observed", "decision_time_safe", "postgres", "workflow", "scheduling"),
    ("maintenance_state", "text", "category", "Current maintenance flag.", "observed", "decision_time_safe", "postgres", "admin record", "hypotheses"),
    ("cpu_cores", "int", "count", "Declared CPU cores.", "control_input", "none", "postgres", "inventory", "accounting"),
    ("memory_mib", "int", "MiB", "Declared host memory.", "control_input", "none", "postgres", "inventory", "accounting"),
])
_rel("hardware_profiles", [
    ("profile_id", "text", "id", "Fictional accelerator profile.", "control_input", "none", "postgres", "declared", "features and physics"),
    ("family", "text", "category", "Peer-comparison family. Rack membership is not a substitute.", "control_input", "none", "postgres", "declared", "peer features"),
    ("memory_mib", "int", "MiB", "Declared accelerator memory.", "control_input", "none", "postgres", "declared", "placement"),
    ("tdp_w", "float", "W", "Declared thermal design power.", "control_input", "none", "postgres", "declared", "expected power"),
    ("idle_w", "float", "W", "Declared idle power.", "control_input", "none", "postgres", "declared", "expected power"),
    ("nominal_r_k_per_w", "float", "K/W", "Nominal thermal resistance used only as the expected-behavior envelope.", "control_input", "none", "postgres", "engineering approximation", "residual features"),
    ("thermal_capacity_j_per_k", "float", "J/K", "Accelerated thermal mass for the virtual clock.", "control_input", "none", "postgres", "deliberate simplification", "latent physics only"),
    ("supports_fan", "bool", "flag", "Whether fan speed may be observed.", "control_input", "none", "postgres", "declared", "null semantics"),
    ("supports_ecc", "bool", "flag", "Whether ECC counters exist.", "control_input", "none", "postgres", "declared", "null semantics"),
    ("supports_nvlink", "bool", "flag", "Whether an NVLink-class interconnect exists.", "control_input", "none", "postgres", "declared", "null semantics"),
    ("supports_memory_temp", "bool", "flag", "Whether memory temperature is reported.", "control_input", "none", "postgres", "declared", "null semantics"),
    ("supports_occupancy", "bool", "flag", "Whether occupancy is reported.", "control_input", "none", "postgres", "declared", "null semantics"),
    ("shutdown_temp_c", "float", "C", "Envelope shutdown temperature.", "control_input", "none", "postgres", "declared", "safety narrative"),
])
_rel("accelerators", [
    ("accelerator_id", "text", "id", "Stable fictional accelerator identity. It does not encode a label.", "audit", "none", "postgres", "assigned", "joins"),
    ("profile_id", "text", "id", "Hardware profile.", "control_input", "none", "postgres", "assigned", "features"),
    ("service_age_days", "float", "day", "Age since fictional commissioning.", "observed", "decision_time_safe", "postgres", "inventory", "cohort features"),
    ("vulnerability", "float", "ratio", "Latent heterogeneous vulnerability. Evaluator only.", "latent_truth", "forbidden", "truth_namespace", "population stream", "evaluator"),
])
_rel("accelerator_attachments", [
    ("attachment_id", "text", "id", "Temporal host attachment.", "audit", "none", "postgres", "assigned", "history"),
    ("accelerator_id", "text", "id", "Accelerator.", "audit", "none", "postgres", "assigned", "joins"),
    ("host_id", "text", "id", "Host during the interval.", "audit", "none", "postgres", "assigned", "placement"),
    ("valid_from_step", "int", "step", "Inclusive validity start.", "audit", "decision_time_safe", "postgres", "temporal record", "point-in-time joins"),
    ("valid_to_step", "int", "step", "Exclusive validity end. Null means still open.", "audit", "decision_time_safe", "postgres", "temporal record", "point-in-time joins"),
])
_rel("ports", [
    ("port_id", "text", "id", "Port identity.", "audit", "none", "postgres", "assigned", "topology"),
    ("endpoint_type", "text", "category", "accelerator, host, or switch.", "control_input", "none", "postgres", "assigned", "topology"),
    ("endpoint_id", "text", "id", "Attached endpoint.", "audit", "none", "postgres", "assigned", "topology"),
    ("direction", "text", "category", "bidirectional in this build.", "control_input", "none", "postgres", "assigned", "topology"),
])
_rel("links", [
    ("link_id", "text", "id", "Directed logical link.", "audit", "none", "postgres", "assigned", "fabric features"),
    ("src_port_id", "text", "id", "Source port.", "audit", "none", "postgres", "assigned", "topology"),
    ("dst_port_id", "text", "id", "Destination port.", "audit", "none", "postgres", "assigned", "topology"),
    ("capacity_gbps", "float", "Gb/s", "Assumed capacity, not a measured guarantee.", "control_input", "none", "postgres", "engineering approximation", "contention"),
    ("fabric_domain_id", "text", "id", "Failure domain.", "control_input", "none", "postgres", "assigned", "RCA"),
])
_rel("switches", [
    ("switch_id", "text", "id", "Switch identity.", "audit", "none", "postgres", "assigned", "topology"),
    ("fabric_domain_id", "text", "id", "Fabric domain.", "audit", "none", "postgres", "assigned", "grouping"),
    ("failure_domain", "text", "id", "Shared fate domain for the switch.", "control_input", "none", "postgres", "assigned", "common-cause RCA"),
])
_rel("fabric_domains", [
    ("fabric_domain_id", "text", "id", "Routing and failure domain.", "audit", "none", "postgres", "assigned", "grouping"),
    ("site_id", "text", "id", "Site.", "audit", "none", "postgres", "assigned", "joins"),
])
_rel("power_domains", [
    ("power_domain_id", "text", "id", "Shared power domain.", "audit", "none", "postgres", "assigned", "common-cause RCA"),
    ("redundancy", "text", "category", "single or dual. Dual is not free capacity.", "control_input", "none", "postgres", "declared", "recovery eligibility"),
    ("feed_id", "text", "id", "Upstream feed.", "control_input", "none", "postgres", "assigned", "facility model"),
])
_rel("power_memberships", [
    ("membership_id", "text", "id", "Temporal membership.", "audit", "none", "postgres", "assigned", "joins"),
    ("power_domain_id", "text", "id", "Domain.", "audit", "none", "postgres", "assigned", "RCA"),
    ("accelerator_id", "text", "id", "Member.", "audit", "none", "postgres", "assigned", "RCA"),
    ("valid_from_step", "int", "step", "Inclusive start.", "audit", "decision_time_safe", "postgres", "temporal", "joins"),
    ("valid_to_step", "int", "step", "Exclusive end.", "audit", "decision_time_safe", "postgres", "temporal", "joins"),
])
_rel("cooling_domains", [
    ("cooling_domain_id", "text", "id", "Shared cooling loop or air zone.", "audit", "none", "postgres", "assigned", "RCA"),
    ("loop_lag_steps", "int", "step", "Assumed sensor and plant lag.", "control_input", "none", "postgres", "engineering approximation", "physics"),
    ("capacity_kw", "float", "kW", "Assumed heat-removal capacity.", "control_input", "none", "postgres", "engineering approximation", "physics"),
])
_rel("cooling_memberships", [
    ("membership_id", "text", "id", "Temporal membership.", "audit", "none", "postgres", "assigned", "joins"),
    ("cooling_domain_id", "text", "id", "Domain.", "audit", "none", "postgres", "assigned", "RCA"),
    ("accelerator_id", "text", "id", "Member.", "audit", "none", "postgres", "assigned", "RCA"),
    ("valid_from_step", "int", "step", "Inclusive start.", "audit", "decision_time_safe", "postgres", "temporal", "joins"),
    ("valid_to_step", "int", "step", "Exclusive end.", "audit", "decision_time_safe", "postgres", "temporal", "joins"),
])
_rel("storage_resources", [
    ("storage_id", "text", "id", "Checkpoint destination.", "audit", "none", "postgres", "assigned", "checkpoint eligibility"),
    ("bandwidth_mbps", "float", "MB/s", "Assumed write bandwidth.", "control_input", "none", "postgres", "engineering approximation", "checkpoint duration"),
    ("failure_domain", "text", "id", "Shared fate with compute or independent.", "control_input", "none", "postgres", "declared", "checkpoint failure"),
    ("reachable", "bool", "flag", "Whether the destination is reachable at decision time.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
    ("durability_class", "text", "category", "local or shared. Local is not a second failure domain.", "control_input", "none", "postgres", "declared", "eligibility"),
])
_rel("software_revisions", [
    ("revision_id", "text", "id", "Driver, firmware, runtime, or collective-library revision.", "audit", "none", "postgres", "assigned", "cohorts"),
    ("component", "text", "category", "driver, firmware, runtime, or collective.", "control_input", "none", "postgres", "assigned", "hypotheses"),
    ("version", "text", "version", "Fictional version string.", "observed", "decision_time_safe", "postgres", "admin record", "hypotheses"),
])
_rel("software_deployments", [
    ("deployment_id", "text", "id", "Temporal deployment.", "audit", "none", "postgres", "assigned", "history"),
    ("revision_id", "text", "id", "Revision.", "audit", "none", "postgres", "assigned", "joins"),
    ("target_id", "text", "id", "Host or accelerator.", "audit", "none", "postgres", "assigned", "joins"),
    ("valid_from_step", "int", "step", "Inclusive start.", "observed", "decision_time_safe", "postgres", "admin record", "hypotheses"),
    ("valid_to_step", "int", "step", "Exclusive end.", "observed", "decision_time_safe", "postgres", "admin record", "hypotheses"),
])
_rel("training_jobs", [
    ("job_id", "text", "id", "Job identity.", "audit", "none", "postgres", "assigned", "runtime"),
    ("workload_profile", "text", "category", "Synthetic workload profile. Not a real model.", "control_input", "none", "postgres", "config", "workload"),
    ("priority", "int", "rank", "Scheduling priority.", "control_input", "none", "postgres", "config", "planner"),
    ("state", "text", "category", "running, stalled, recovering, paused, or completed.", "observed", "decision_time_safe", "postgres", "runtime", "overview"),
    ("capability", "text", "category", "strict_sync, independent, reconfigurable, or redundant.", "control_input", "none", "postgres", "config", "recovery"),
    ("tp_size", "int", "count", "Tensor-parallel width. Ranks in a group are not independently droppable.", "control_input", "none", "postgres", "config", "recovery"),
    ("dp_size", "int", "count", "Data-parallel width.", "control_input", "none", "postgres", "config", "recovery"),
    ("topology_signature", "text", "hash", "Placement signature required for checkpoint compatibility.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
])
_rel("job_attempts", [
    ("attempt_id", "text", "id", "Restart attempt.", "audit", "none", "postgres", "runtime", "audit"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "runtime", "joins"),
    ("start_step", "int", "step", "Attempt start.", "observed", "decision_time_safe", "postgres", "runtime", "accounting"),
    ("end_step", "int", "step", "Attempt end.", "observed", "decision_time_safe", "postgres", "runtime", "accounting"),
    ("resume_checkpoint_id", "text", "id", "Checkpoint used to resume, if any.", "observed", "decision_time_safe", "postgres", "runtime", "audit"),
    ("terminal_reason", "text", "category", "Why the attempt ended.", "observed", "decision_time_safe", "postgres", "runtime", "audit"),
    ("progress_start", "float", "step", "Progress at resume.", "observed", "decision_time_safe", "postgres", "runtime", "accounting"),
    ("progress_end", "float", "step", "Progress at attempt end.", "observed", "decision_time_safe", "postgres", "runtime", "accounting"),
])
_rel("rank_assignments", [
    ("assignment_id", "text", "id", "Temporal rank placement.", "audit", "none", "postgres", "runtime", "history"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "runtime", "joins"),
    ("rank", "int", "index", "Logical rank. Distinct from the physical accelerator.", "audit", "none", "postgres", "runtime", "runtime"),
    ("accelerator_id", "text", "id", "Physical accelerator during the interval.", "observed", "decision_time_safe", "postgres", "runtime", "dependency explorer"),
    ("valid_from_step", "int", "step", "Inclusive start.", "observed", "decision_time_safe", "postgres", "temporal", "joins"),
    ("valid_to_step", "int", "step", "Exclusive end.", "observed", "decision_time_safe", "postgres", "temporal", "joins"),
])
_rel("parallelism_groups", [
    ("group_id", "text", "id", "Synchronization group.", "audit", "none", "postgres", "runtime", "recovery"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "runtime", "joins"),
    ("kind", "text", "category", "data, tensor, or pipeline.", "control_input", "none", "postgres", "config", "recovery"),
    ("required", "bool", "flag", "Whether a missing member stalls the group.", "control_input", "none", "postgres", "capability", "recovery"),
])
_rel("placement_snapshots", [
    ("snapshot_id", "text", "id", "Versioned placement at a decision.", "audit", "none", "postgres", "runtime", "approvals"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "runtime", "joins"),
    ("version", "int", "count", "Monotonic placement version.", "observed", "decision_time_safe", "postgres", "runtime", "stale preconditions"),
    ("topology_signature", "text", "hash", "Signature captured with the snapshot.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
    ("decision_step", "int", "step", "When the snapshot was taken.", "audit", "decision_time_safe", "postgres", "runtime", "temporal joins"),
])
_rel("checkpoints", [
    ("checkpoint_id", "text", "id", "Checkpoint identity.", "audit", "none", "postgres", "runtime", "recovery"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "runtime", "joins"),
    ("attempt_id", "text", "id", "Attempt.", "audit", "none", "postgres", "runtime", "joins"),
    ("progress", "float", "step", "Progress represented by a complete verified save.", "observed", "decision_time_safe", "postgres", "runtime", "recovery"),
    ("state", "text", "category", "Lifecycle state. In-flight states are not usable.", "observed", "decision_time_safe", "postgres", "state machine", "eligibility"),
    ("topology_signature", "text", "hash", "Topology the manifest was written for.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
    ("shards_expected", "int", "count", "Expected shard count.", "observed", "decision_time_safe", "postgres", "manifest", "eligibility"),
    ("shards_present", "int", "count", "Present shard count.", "observed", "decision_time_safe", "postgres", "manifest", "eligibility"),
    ("checksum_ok", "bool", "flag", "Integrity check result.", "observed", "decision_time_safe", "postgres", "verification", "eligibility"),
    ("reachable", "bool", "flag", "Destination reachable.", "observed", "decision_time_safe", "postgres", "storage", "eligibility"),
    ("verified_at", "int", "step", "Step when verification completed. Later decisions cannot see it early.", "observed", "decision_time_safe", "postgres", "runtime", "temporal eligibility"),
    ("logical_consistent", "bool", "flag", "Abstract model, optimizer, scheduler, RNG, and data-position manifest agreed.", "observed", "decision_time_safe", "postgres", "manifest", "eligibility"),
])
_rel("checkpoint_shards", [
    ("shard_id", "text", "id", "Shard identity.", "audit", "none", "postgres", "runtime", "eligibility"),
    ("checkpoint_id", "text", "id", "Parent checkpoint.", "audit", "none", "postgres", "runtime", "joins"),
    ("rank", "int", "index", "Owning rank.", "observed", "decision_time_safe", "postgres", "manifest", "eligibility"),
    ("location", "text", "path", "Fictional location. No model tensors are stored.", "observed", "decision_time_safe", "postgres", "manifest", "audit"),
    ("checksum", "text", "hash", "Shard checksum.", "observed", "decision_time_safe", "postgres", "manifest", "integrity"),
    ("complete", "bool", "flag", "Whether the shard finished.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
])
_rel("checkpoint_operations", [
    ("operation_id", "text", "id", "Write or verify operation.", "audit", "none", "postgres", "runtime", "overhead"),
    ("checkpoint_id", "text", "id", "Checkpoint.", "audit", "none", "postgres", "runtime", "joins"),
    ("requested_step", "int", "step", "Request step.", "observed", "decision_time_safe", "postgres", "runtime", "timeline"),
    ("started_step", "int", "step", "Start step.", "observed", "decision_time_safe", "postgres", "runtime", "overhead"),
    ("finished_step", "int", "step", "Finish step.", "observed", "decision_time_safe", "postgres", "runtime", "overhead"),
    ("bytes_written", "int", "B", "Abstract bytes, not real tensors.", "observed", "decision_time_safe", "postgres", "model", "overhead"),
    ("queue_delay_steps", "int", "step", "Queue delay.", "observed", "decision_time_safe", "postgres", "contention", "overhead"),
    ("outcome", "text", "category", "verified, failed, corrupted, or unavailable.", "observed", "decision_time_safe", "postgres", "runtime", "eligibility"),
])
_rel("symptoms", [
    ("symptom_id", "text", "id", "Observed symptom, not a verified cause.", "observed", "decision_time_safe", "postgres", "detectors", "incidents"),
    ("symptom_code", "text", "code", "Fictional TC-SYM code. Not a vendor Xid.", "observed", "decision_time_safe", "postgres", "detector", "evidence"),
    ("entity_id", "text", "id", "Where it was observed.", "observed", "decision_time_safe", "postgres", "detector", "joins"),
    ("event_step", "int", "step", "Event time.", "observed", "decision_time_safe", "postgres", "detector", "timeline"),
    ("availability_step", "int", "step", "When a decision may use it.", "observed", "decision_time_safe", "postgres", "collector", "leakage tests"),
])
_rel("failures", [
    ("failure_id", "text", "id", "Adjudicated failure record. May remain unknown.", "observed", "decision_time_safe", "postgres", "workflow", "audit"),
    ("adjudicated_cause", "text", "category", "Operator or policy adjudication, which can be unknown.", "observed", "decision_time_safe", "postgres", "workflow", "audit"),
    ("confirmed", "bool", "flag", "Whether adjudication claims confirmation. Synthetic confirmation is not real-world truth.", "audit", "none", "postgres", "workflow", "UI labels"),
])
_rel("latent_truth_events", [
    ("event_id", "text", "id", "Private simulator truth.", "latent_truth", "forbidden", "truth_namespace", "fault schedule", "evaluator only"),
    ("mechanism", "text", "category", "Latent mechanism.", "latent_truth", "forbidden", "truth_namespace", "fault schedule", "evaluator only"),
    ("onset_step", "int", "step", "Latent onset. Hidden from inference.", "latent_truth", "forbidden", "truth_namespace", "fault schedule", "evaluator only"),
    ("severity", "float", "ratio", "Latent severity.", "latent_truth", "forbidden", "truth_namespace", "fault schedule", "evaluator only"),
    ("target_id", "text", "id", "Latent target.", "latent_truth", "forbidden", "truth_namespace", "fault schedule", "evaluator only"),
])
_rel("incidents", [
    ("incident_id", "text", "id", "Grouped incident.", "audit", "none", "postgres", "grouping", "workspace"),
    ("scope", "text", "id", "Shared domain or entity scope.", "observed", "decision_time_safe", "postgres", "grouping", "UI"),
    ("opened_step", "int", "step", "Open time.", "observed", "decision_time_safe", "postgres", "grouping", "retrieval"),
    ("state", "text", "category", "open or resolved.", "observed", "decision_time_safe", "postgres", "workflow", "UI"),
    ("abstain_reason", "text", "text", "Why the system refused a cause.", "observed", "decision_time_safe", "postgres", "policy", "UI"),
])
_rel("evidence", [
    ("evidence_id", "text", "id", "Immutable evidence pointer.", "audit", "none", "postgres", "pipeline", "hypotheses"),
    ("observation_ref", "text", "id", "Observation or log identity.", "observed", "decision_time_safe", "postgres", "pipeline", "hypotheses"),
    ("availability_step", "int", "step", "When it became usable.", "observed", "decision_time_safe", "postgres", "collector", "temporal joins"),
    ("quality", "text", "category", "fresh, stale, missing, or conflicted.", "derived", "decision_time_safe", "postgres", "quality gate", "abstention"),
    ("source", "text", "category", "telemetry, runtime_log, checkpoint, or admin.", "observed", "decision_time_safe", "postgres", "collector", "hypotheses"),
])
_rel("alerts", [
    ("alert_id", "text", "id", "Detector alert.", "audit", "none", "postgres", "detector", "incidents"),
    ("detector_version", "text", "version", "Detector version.", "audit", "none", "postgres", "code", "audit"),
    ("evidence_ids", "text", "list", "Supporting evidence identifiers.", "observed", "decision_time_safe", "postgres", "detector", "workspace"),
    ("dedupe_key", "text", "key", "Grouping key.", "derived", "decision_time_safe", "postgres", "grouping", "incidents"),
    ("acknowledged", "bool", "flag", "Operator acknowledgement.", "audit", "none", "postgres", "UI", "audit"),
])
_rel("hypotheses", [
    ("hypothesis_id", "text", "id", "Ranked alternative.", "derived", "decision_time_safe", "postgres", "RCA", "workspace"),
    ("mechanism", "text", "category", "Candidate mechanism, including unknown.", "derived", "decision_time_safe", "postgres", "RCA", "workspace"),
    ("cause_family", "text", "category", "Required cause family.", "derived", "decision_time_safe", "postgres", "RCA", "workspace"),
    ("support", "float", "score", "Relative support. Not a calibrated probability.", "derived", "decision_time_safe", "postgres", "RCA", "technical view"),
    ("contradictions", "text", "text", "Evidence that weakens the alternative.", "derived", "decision_time_safe", "postgres", "RCA", "workspace"),
    ("missing_evidence", "text", "text", "What was not available.", "derived", "decision_time_safe", "postgres", "RCA", "workspace"),
    ("abstain", "bool", "flag", "Whether the system refused to pick a cause.", "derived", "decision_time_safe", "postgres", "quality gate", "workspace"),
])
_rel("policies", [
    ("policy_id", "text", "id", "Versioned policy.", "control_input", "none", "postgres", "config", "experiments"),
    ("version", "text", "version", "Policy version.", "audit", "none", "postgres", "config", "audit"),
    ("kind", "text", "category", "reactive, threshold, anomaly, risk, capability, or combined.", "control_input", "none", "postgres", "config", "experiments"),
])
_rel("decisions", [
    ("decision_id", "text", "id", "Decision record.", "audit", "none", "postgres", "policy", "audit"),
    ("policy_version", "text", "version", "Policy that produced it.", "audit", "none", "postgres", "policy", "audit"),
    ("decision_step", "int", "step", "Decision time.", "audit", "decision_time_safe", "postgres", "runtime", "leakage tests"),
    ("inputs_hash", "text", "hash", "Hash of the observed snapshot.", "audit", "none", "postgres", "policy", "replay"),
    ("eligible_actions", "text", "list", "Actions the capability profile allowed.", "derived", "decision_time_safe", "postgres", "capability", "planner"),
    ("rationale", "text", "text", "Deterministic rationale.", "derived", "decision_time_safe", "postgres", "policy", "UI"),
    ("abstain", "bool", "flag", "Decision abstained.", "derived", "decision_time_safe", "postgres", "policy", "UI"),
])
_rel("approvals", [
    ("approval_id", "text", "id", "Human or automated authorization record.", "audit", "none", "postgres", "workflow", "audit"),
    ("actor", "text", "id", "Username or automated policy identity.", "audit", "none", "postgres", "auth", "audit"),
    ("actor_kind", "text", "category", "human or automated_policy.", "audit", "none", "postgres", "workflow", "audit"),
    ("decision", "text", "category", "approve or reject.", "audit", "none", "postgres", "workflow", "state machine"),
    ("expires_step", "int", "step", "Expiry.", "audit", "none", "postgres", "workflow", "stale checks"),
    ("precondition_hash", "text", "hash", "Placement and checkpoint preconditions.", "audit", "none", "postgres", "workflow", "stale checks"),
])
_rel("actions", [
    ("action_id", "text", "id", "Idempotency key.", "audit", "none", "postgres", "workflow", "executor"),
    ("action_type", "text", "category", "Closed action vocabulary.", "audit", "none", "postgres", "policy", "executor"),
    ("state", "text", "category", "Action state machine.", "audit", "none", "postgres", "workflow", "audit"),
    ("scope", "text", "id", "Target scope.", "audit", "none", "postgres", "policy", "conflicts"),
    ("high_impact", "bool", "flag", "Whether a human decision is required in manual mode.", "control_input", "none", "postgres", "policy", "approvals"),
    ("effect_applied", "bool", "flag", "Whether the side effect was recorded. Restarts must not repeat it.", "audit", "none", "postgres", "executor", "idempotency"),
])
_rel("maintenance_events", [
    ("event_id", "text", "id", "Planned maintenance record.", "observed", "decision_time_safe", "postgres", "admin", "hypotheses"),
    ("target_id", "text", "id", "Target.", "observed", "decision_time_safe", "postgres", "admin", "joins"),
    ("start_step", "int", "step", "Window start.", "observed", "decision_time_safe", "postgres", "admin", "hypotheses"),
    ("end_step", "int", "step", "Window end.", "observed", "decision_time_safe", "postgres", "admin", "hypotheses"),
])
_rel("spares", [
    ("spare_id", "text", "id", "Spare accelerator.", "control_input", "none", "postgres", "inventory", "recovery"),
    ("profile_id", "text", "id", "Compatibility profile.", "control_input", "none", "postgres", "inventory", "eligibility"),
    ("available_from_step", "int", "step", "When it can be allocated.", "observed", "decision_time_safe", "postgres", "inventory", "eligibility"),
    ("state", "text", "category", "reserved, idle, occupied, failed, or incompatible.", "observed", "decision_time_safe", "postgres", "workflow", "accounting"),
])
_rel("experiments", [
    ("experiment_id", "text", "id", "Paired experiment.", "audit", "none", "postgres", "runner", "reports"),
    ("config_hash", "text", "hash", "Canonical config hash.", "audit", "none", "postgres", "runner", "reports"),
    ("seed", "int", "count", "Master seed. Not a model feature.", "control_input", "forbidden", "postgres", "config", "reproducibility"),
    ("counterfactual", "bool", "flag", "Whether the world branched on actions.", "audit", "none", "postgres", "runner", "claim limits"),
])
_rel("experiment_branches", [
    ("branch_id", "text", "id", "One policy branch.", "audit", "none", "postgres", "runner", "comparison"),
    ("experiment_id", "text", "id", "Parent.", "audit", "none", "postgres", "runner", "joins"),
    ("policy_id", "text", "id", "Policy.", "audit", "none", "postgres", "runner", "comparison"),
    ("useful_new", "float", "step", "Useful progress on this branch.", "derived", "label", "postgres", "ledger", "comparison"),
    ("recomputation", "float", "step", "Repeated work.", "derived", "label", "postgres", "ledger", "comparison"),
])
_rel("model_artifacts", [
    ("artifact_id", "text", "id", "Registry row.", "audit", "none", "postgres", "training", "serving"),
    ("checksum", "text", "hash", "Artifact checksum.", "audit", "none", "postgres", "training", "parity"),
    ("feature_contract", "text", "list", "Feature names in order.", "audit", "none", "postgres", "training", "parity"),
    ("split_manifest", "text", "text", "Scenario-level split description.", "audit", "none", "postgres", "training", "evaluation"),
    ("calibration", "text", "text", "Calibration method.", "audit", "none", "postgres", "training", "model card"),
    ("beats_baseline", "bool", "flag", "Whether held-out utility beat the simpler policy.", "derived", "label", "postgres", "evaluation", "default selection"),
])
_rel("resource_ledger", [
    ("entry_id", "text", "id", "Resource-time entry.", "audit", "none", "postgres", "ledger", "accounting"),
    ("resource_id", "text", "id", "Resource.", "audit", "none", "postgres", "ledger", "conservation"),
    ("state", "text", "category", "Mutually exclusive primary state.", "derived", "none", "postgres", "ledger", "conservation"),
    ("seconds", "float", "s", "Duration in that state.", "derived", "none", "postgres", "ledger", "conservation"),
    ("step", "int", "step", "Step.", "audit", "none", "postgres", "ledger", "timeline"),
])
_rel("progress_ledger", [
    ("entry_id", "text", "id", "Job progress entry.", "audit", "none", "postgres", "ledger", "goodput"),
    ("job_id", "text", "id", "Job.", "audit", "none", "postgres", "ledger", "goodput"),
    ("useful_new", "float", "step", "New useful progress. Recomputation is excluded.", "derived", "label", "postgres", "ledger", "goodput"),
    ("recomputation", "float", "step", "Repeated progress.", "derived", "label", "postgres", "ledger", "reports"),
    ("interruption_s", "float", "s", "Job-level interruption. Not summed across GPUs.", "derived", "none", "postgres", "ledger", "reports"),
])
_rel("users", [
    ("user_id", "text", "id", "Local user.", "audit", "none", "postgres", "bootstrap", "auth"),
    ("username", "text", "text", "Username.", "audit", "none", "postgres", "bootstrap", "auth"),
    ("password_hash", "text", "secret", "PBKDF2 hash. Never logged or returned.", "audit", "none", "postgres", "security", "auth"),
    ("role", "text", "category", "viewer, investigator, approver, or administrator.", "audit", "none", "postgres", "bootstrap", "authorization"),
])
_rel("audit_events", [
    ("event_id", "text", "id", "Append-only application audit row. Not tamper-proof storage.", "audit", "none", "postgres", "api", "audit view"),
    ("actor", "text", "id", "Actor.", "audit", "none", "postgres", "auth", "audit view"),
    ("action", "text", "category", "What changed.", "audit", "none", "postgres", "api", "audit view"),
    ("at_step", "int", "step", "Virtual or wall reference.", "audit", "none", "postgres", "api", "audit view"),
    ("correlation_id", "text", "id", "Request correlation id.", "audit", "none", "postgres", "middleware", "tracing"),
])
_rel("outbox", [
    ("event_id", "text", "id", "Durable workflow event.", "audit", "none", "postgres", "api", "worker"),
    ("event_type", "text", "category", "run_story or run_experiment.", "audit", "none", "postgres", "api", "worker"),
    ("idempotency_key", "text", "key", "Duplicate delivery key.", "audit", "none", "postgres", "api", "worker"),
    ("status", "text", "category", "pending, processing, or done.", "audit", "none", "postgres", "worker", "recovery"),
    ("payload", "json", "json", "Event payload.", "control_input", "none", "postgres", "api", "worker"),
])
_rel("dataset_manifests", [
    ("manifest_id", "text", "id", "Generation manifest.", "audit", "none", "postgres", "generator", "resumability"),
    ("config_hash", "text", "hash", "Generator config.", "audit", "none", "postgres", "generator", "reproducibility"),
    ("partitions", "json", "json", "Completed partitions.", "audit", "none", "postgres", "generator", "resumability"),
    ("quality_report", "json", "json", "Null rates and counter-reset counts.", "derived", "none", "postgres", "generator", "data explorer"),
])
_rel("collector_status", [
    ("collector_id", "text", "id", "Collector identity.", "observed", "decision_time_safe", "postgres", "collector", "monitoring view"),
    ("queue_depth", "int", "count", "Current depth.", "observed", "decision_time_safe", "postgres", "collector", "monitoring view"),
    ("dropped_count", "int", "count", "Drops under backpressure. Never hidden.", "observed", "decision_time_safe", "postgres", "collector", "monitoring view"),
    ("lag_steps", "int", "step", "Publish lag.", "observed", "decision_time_safe", "postgres", "collector", "quality"),
    ("degraded", "bool", "flag", "True when drops or lag exceed the gate.", "derived", "decision_time_safe", "postgres", "collector", "abstention"),
])
_rel("runtime_logs", [
    ("log_id", "text", "id", "Structured runtime log.", "observed", "decision_time_safe", "parquet", "runtime", "heartbeat"),
    ("emitter", "text", "id", "Rank or controller.", "observed", "decision_time_safe", "parquet", "runtime", "heartbeat"),
    ("severity", "text", "category", "info, warning, or error.", "observed", "decision_time_safe", "parquet", "runtime", "incidents"),
    ("template", "text", "text", "Message template. Untrusted if imported.", "observed", "decision_time_safe", "parquet", "runtime", "UI sanitize"),
    ("event_step", "int", "step", "Event time.", "observed", "decision_time_safe", "parquet", "runtime", "temporal joins"),
    ("availability_step", "int", "step", "Availability time.", "observed", "decision_time_safe", "parquet", "runtime", "temporal joins"),
    ("symptom_code", "text", "code", "Optional fictional TC-SYM code.", "observed", "decision_time_safe", "parquet", "runtime", "evidence"),
])
_rel("labels", [
    ("scenario_id", "text", "id", "Experimental unit for splits.", "training_label", "label", "parquet", "generator", "splits"),
    ("entity_id", "text", "id", "Entity the label describes.", "training_label", "label", "parquet", "generator", "training"),
    ("decision_step", "int", "step", "Prediction time.", "training_label", "label", "parquet", "generator", "training"),
    ("fail_within_horizon", "int", "flag", "Latent event inside the horizon. Not a threshold of one input.", "training_label", "label", "parquet", "fault schedule", "training"),
    ("censored", "bool", "flag", "Horizon extends past the run or an intervention removed the device.", "training_label", "label", "parquet", "generator", "survival-style evaluation"),
    ("censor_reason", "text", "category", "end_of_run or intervention.", "training_label", "label", "parquet", "generator", "evaluation"),
    ("horizon_steps", "int", "step", "Defined horizon.", "control_input", "none", "parquet", "config", "evaluation"),
])


def _signal_fields(entity: str, signals: list[tuple], storage: str = "parquet") -> list[FieldSpec]:
    fields = []
    for item in signals:
        if len(item) == 5:
            name, unit, cumulative, meaning, analog = item
        else:
            name, unit, cumulative, meaning = item
            analog = "simulator observation model"
        fields.append(
            _field(
                field_id=f"{entity}.{name}",
                entity=entity,
                name=name,
                meaning=meaning,
                dtype="float" if unit not in {"category", "version", "code", "flag"} else "text",
                unit=unit,
                role="observed",
                leakage="decision_time_safe",
                storage=storage,
                generating_mechanism=analog,
                consumer="features, detectors, device view",
                missingness="unsupported profiles, blackouts, and lags yield null",
                cadence="per virtual step",
                assumption_class="documentation_informed" if "analog" in analog or "DCGM" in analog else "engineering_approximation",
                constraints="cumulative counters are nondecreasing except at reset" if cumulative else "null if the profile does not support the measurement",
            )
        )
    return fields


ALIASES = [
    _field(
        field_id="gpu_telemetry.gpu_util_ratio",
        entity="gpu_telemetry",
        name="gpu_util_ratio",
        meaning="Alias of sm_util_ratio. Not an independent measurement.",
        dtype="float",
        unit="ratio",
        role="observed",
        leakage="decision_time_safe",
        storage="alias",
        generating_mechanism="alias",
        consumer="documentation only",
        alias_of="gpu_telemetry.sm_util_ratio",
        assumption_class="deliberate_simplification",
    ),
    _field(
        field_id="gpu_telemetry.board_power_w",
        entity="gpu_telemetry",
        name="board_power_w",
        meaning="Alias of power_draw_w.",
        dtype="float",
        unit="W",
        role="observed",
        leakage="decision_time_safe",
        storage="alias",
        generating_mechanism="alias",
        consumer="documentation only",
        alias_of="gpu_telemetry.power_draw_w",
    ),
]


WINDOW_BASES = [
    "gpu_temp_c",
    "power_draw_w",
    "sm_util_ratio",
    "ecc_sbe_total",
    "ecc_dbe_total",
    "pcie_replay_total",
    "nvlink_replay_total",
    "link_retrans",
    "link_latency_us",
    "collective_wait_s",
    "heartbeat_age_s",
    "supply_temp_c",
]


def _windows() -> list[FieldSpec]:
    fields = []
    stats = ("mean", "max", "delta")
    for name in WINDOW_BASES:
        cumulative = name.endswith("_total") or name.endswith("_count")
        for window, support in (("w5", 5), ("w20", 20)):
            for stat in stats:
                fields.append(
                    _field(
                        field_id=f"features.{name}_{stat}_{window}",
                        entity="features",
                        name=f"{name}_{stat}_{window}",
                        meaning=f"{stat} of {name} over {support} available observations. Null below support 3.",
                        dtype="float",
                        unit="see base signal",
                        role="derived",
                        leakage="decision_time_safe",
                        storage="derived",
                        generating_mechanism="trailing window ending at the decision time",
                        consumer="optional model input; not all windows are used",
                        cadence="at decision time",
                        window=window,
                        assumption_class="deliberate_simplification",
                    )
                )
            if cumulative or name.endswith("_total"):
                fields.append(
                    _field(
                        field_id=f"features.{name}_rate_{window}",
                        entity="features",
                        name=f"{name}_rate_{window}",
                        meaning=f"Mean positive increment of {name} over {window}, with reset handling.",
                        dtype="float",
                        unit="count/step",
                        role="derived",
                        leakage="decision_time_safe",
                        storage="derived",
                        generating_mechanism="counter delta with reset when the counter decreases",
                        consumer="memory and link detectors",
                        cadence="at decision time",
                        window=window,
                    )
                )
    return fields


DERIVED_NON_WINDOW = [
    ("residual_temp_c", "C", "Observed temperature minus nominal envelope from observed power and coolant."),
    ("residual_ewma", "C", "EWMA of the thermal residual. This is not a failure probability."),
    ("peer_residual_median", "C", "Median residual among same-family, same-phase peers. Null with fewer than two peers."),
    ("peer_residual_z", "z", "Robust z versus the peer cohort. Rack membership alone does not define the cohort."),
    ("power_domain_low_limit_count", "count", "How many members of the power domain currently show a depressed power limit."),
    ("cooling_domain_high_residual_count", "count", "How many cooling-domain peers have a high residual."),
    ("freshness_steps", "step", "Decision step minus the newest available event step."),
    ("support_count", "count", "Observations available at the decision time."),
    ("checkpoint_age_steps", "step", "Steps since the newest verified checkpoint."),
    ("data_quality_ok", "flag", "False when freshness, support, or collector drops fail the gate."),
    ("workload_temp_tracks_power", "flag", "Whether temperature and power moved together with a small residual."),
    ("counter_reset_flag", "flag", "A cumulative counter decreased and was treated as a reset."),
]


def build_catalog() -> list[FieldSpec]:
    fields: list[FieldSpec] = []
    fields.extend(RELATIONAL)
    fields.extend(_signal_fields("gpu_telemetry", GPU_SIGNALS))
    fields.extend(_signal_fields("host_telemetry", HOST_SIGNALS))
    fields.extend(_signal_fields("fabric_telemetry", FABRIC_SIGNALS))
    fields.extend(_signal_fields("facility_telemetry", FACILITY_SIGNALS))
    fields.extend(_signal_fields("training_progress", PROGRESS_SIGNALS))
    fields.extend(_signal_fields("collector_health", COLLECTOR_SIGNALS))
    fields.extend(ALIASES)
    for name, unit, meaning in DERIVED_NON_WINDOW:
        fields.append(
            _field(
                field_id=f"features.{name}",
                entity="features",
                name=name,
                meaning=meaning,
                dtype="float",
                unit=unit,
                role="derived",
                leakage="decision_time_safe",
                storage="derived",
                generating_mechanism="point-in-time feature from observations available at the decision",
                consumer="baselines, trained model, UI",
                cadence="at decision time",
                assumption_class="engineering_approximation",
            )
        )
    fields.extend(_windows())
    return fields


def catalog_counts(fields: list[FieldSpec] | None = None) -> dict:
    fields = fields or build_catalog()
    unique = [f for f in fields if f.alias_of is None and f.window is None]
    aliases = [f for f in fields if f.alias_of]
    windows = [f for f in fields if f.window]
    by_role: dict[str, int] = {}
    for field in unique:
        by_role[field.role] = by_role.get(field.role, 0) + 1
    return {
        "unique_concepts": len(unique),
        "aliases": len(aliases),
        "window_aggregations": len(windows),
        "total_catalog_rows": len(fields),
        "unique_by_role": by_role,
    }
