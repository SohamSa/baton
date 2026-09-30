"""Plain-language map of every catalog table.

The field list stays in dictionary.py. This module only explains how those
tables would be joined, and which columns are allowed to change a decision.
"""

from __future__ import annotations

from baton.catalog.dictionary import FieldSpec, build_catalog

# title, what the table is, where a real hall would get it, the tag that joins it
TABLES: dict[str, tuple[str, str, str, str]] = {
    "sites": ("Buildings", "One data-center building.", "The site list in an inventory system.", "site_id"),
    "zones": ("Rooms inside a building", "A room or hall that shares power or cooling.", "A floor or hall record.", "zone_id"),
    "racks": ("Racks", "One cabinet in a row.", "A rack record tied to a power feed and a cooling loop.", "rack_id"),
    "hosts": ("Machines", "One server that holds several chips.", "A server record.", "host_id"),
    "hardware_profiles": ("Chip types", "What kind of chip this is, and which readings it is able to report.", "A hardware spec sheet.", "profile_id"),
    "accelerators": ("Chips", "One accelerator, the runner in the race.", "An asset tag on a processor.", "accelerator_id"),
    "accelerator_attachments": ("Which machine a chip is in", "A chip can move between machines over time. This says where it was, and when.", "A change ticket for a card swap.", "accelerator_id plus the time"),
    "ports": ("Plugs", "A network plug on a chip, a machine, or a switch.", "A port inventory.", "port_id"),
    "links": ("Cables", "A connection from one plug to another.", "A cable or logical-link record.", "link_id"),
    "switches": ("Network switches", "A box that joins many cables.", "A switch asset.", "switch_id"),
    "fabric_domains": ("Network neighborhoods", "A group of cables that fail together.", "A network failure domain.", "fabric_domain_id"),
    "power_domains": ("Power feeds", "Chips that share one electrical supply.", "A breaker or PDU group.", "power_domain_id"),
    "power_memberships": ("Who is on that power feed", "The list of chips on a feed, and the hours that list was true.", "A circuit schedule.", "power_domain_id plus accelerator_id"),
    "cooling_domains": ("Cooling loops", "Chips that share one cooling loop or one cold aisle.", "A cooling-plant zone.", "cooling_domain_id"),
    "cooling_memberships": ("Who is on that cooling loop", "The chips on a loop, and when.", "A cooling assignment.", "cooling_domain_id plus accelerator_id"),
    "storage_resources": ("Where saves are written", "The disk or shared store that holds a snapshot of the job.", "A storage volume.", "storage_id"),
    "software_revisions": ("Software versions", "A driver, firmware, or library version.", "A version record.", "revision_id"),
    "software_deployments": ("What version is installed where", "Which machine had which version, and when.", "A deployment history.", "target_id plus the time"),
    "training_jobs": ("The race itself", "The training job: the group of chips that must finish each step together, and how they are allowed to restart.", "A job scheduler record.", "job_id"),
    "job_attempts": ("Each start of the race", "One try, from a start until a stop or a restart.", "A job attempt in the scheduler.", "attempt_id"),
    "rank_assignments": ("Which chip sits in which seat", "Seat 0, seat 1, and so on, and which physical chip filled that seat.", "A placement record.", "job_id plus rank"),
    "parallelism_groups": ("Who must sing together", "A subgroup that cannot drop a member without stopping.", "The job's parallel groups.", "group_id"),
    "placement_snapshots": ("A photo of the seating", "The seating chart at the moment a decision was made, so a later approval cannot use a stale chart.", "A versioned placement.", "snapshot_id"),
    "checkpoints": ("Saves", "A snapshot of the job. Only a complete one can be reopened.", "Checkpoint metadata.", "checkpoint_id"),
    "checkpoint_shards": ("Pieces of a save", "A save is written in pieces. Missing pieces make it unusable.", "Shard receipts.", "checkpoint_id"),
    "checkpoint_operations": ("Saving and restoring", "The act of writing or reading a save, and whether it finished.", "A storage operation log.", "operation id"),
    "symptoms": ("Complaints", "A named complaint from a chip or a job, using a fictional symptom code.", "An alert symptom.", "symptom code"),
    "failures": ("Stops", "A recorded stop. This is not the hidden script of the rehearsal.", "A failure ticket opened from symptoms.", "failure id"),
    "latent_truth_events": ("The answer key", "The scripted cause. Operators do not get this table.", "There is no honest operator feed for this. It is the exam answer.", "kept off the public pages"),
    "incidents": ("One pile per problem", "Several complaints that share a cause, such as one power feed.", "An incident ticket.", "incident_id"),
    "evidence": ("Readings attached to a pile", "The measurements someone looked at for that incident, and how fresh they were.", "Evidence linked to a ticket.", "incident_id"),
    "alerts": ("The alarms", "A single alarm before it is grouped into an incident.", "A monitoring alert.", "alert id"),
    "hypotheses": ("The best reading of the cause", "The cause the readings support, or a refusal to guess.", "A diagnosis on a ticket.", "hypothesis_id"),
    "policies": ("Ways of reacting", "The named rules: wait, save early, restart, or bench a warm chip.", "A runbook name.", "policy name"),
    "decisions": ("The choice", "What the rule recommended at a step.", "A recommended action.", "decision id"),
    "approvals": ("A person's yes or no", "Who approved or rejected a serious move, and the seating chart they were looking at.", "An approval record.", "approval_id"),
    "actions": ("Moves that were taken", "A save, a restart, or a refusal, and whether it was applied.", "A change record.", "action_id"),
    "maintenance_events": ("Planned work", "A person took a machine out on purpose.", "A maintenance window.", "event id"),
    "spares": ("Spare chips", "A chip on the shelf, not in the race.", "A spare-parts bin.", "spare_id"),
    "experiments": ("Side-by-side rehearsals", "Two ways of reacting, given the same script.", "An experiment record.", "experiment_id"),
    "experiment_branches": ("One way of reacting", "The score of one reaction inside that comparison.", "One arm of an experiment.", "branch id"),
    "model_artifacts": ("The learned helper's report card", "Whether the helper beat the simple rule. In this project it did not, so the simple rule stays in charge.", "A model registry entry.", "artifact_id"),
    "resource_ledger": ("Where the time went", "Seconds a chip spent working, waiting, saving, or stopped. The fractions for one chip in one step add up to the whole step.", "A costed time ledger.", "resource_id plus the step"),
    "progress_ledger": ("Finished work versus repeated work", "How much of the job was new, and how much had to be done again.", "A progress account.", "job_id"),
    "users": ("People", "An account and a role. The public page uses a visitor role and does not share an administrator password.", "An identity directory.", "user_id"),
    "audit_events": ("The paper trail", "Who did what.", "An audit log.", "event_id"),
    "outbox": ("Work waiting to be finished", "A job the page accepted and has not finished yet.", "A task queue.", "event_id"),
    "dataset_manifests": ("What has already been generated", "A bookmark so a long synthetic dataset can resume.", "A dataset manifest.", "manifest_id"),
    "collector_status": ("Are the sensors keeping up", "Late readings, dropped readings, and a full queue.", "A collector health metric.", "collector_id"),
    "runtime_logs": ("Notes from the job", "A structured note from a seat in the job, including an optional fictional symptom code.", "A job log.", "log_id"),
    "labels": ("The score sheet", "After the fact, did a chip stop inside a future window. This is for grading the helper, not for making the decision.", "A labeled training set.", "not used at decision time"),
    "gpu_telemetry": ("Chip readings", "Temperature, power, clocks, errors, and the link counters from a chip in the job. The other chips in the hall are counted, not given this personal chart.", "A GPU telemetry stream, one row per chip per moment.", "accelerator_id plus the step"),
    "host_telemetry": ("Machine readings", "The server around the chips: processor load, memory, disk, network, and whether the job is still answering.", "A host metrics agent.", "host_id plus the step"),
    "fabric_telemetry": ("Cable readings", "Bytes, errors, delay, and whether a link is up.", "A network telemetry stream.", "link_id plus the step"),
    "facility_telemetry": ("Building readings", "Inlet temperature, cooling-loop flow, and the power feed.", "Building management sensors.", "the feed or loop id plus the step"),
    "training_progress": ("How the race is moving", "How long a step took, who lagged, and how much credit the job earned.", "The training framework's step log.", "job_id plus the step"),
    "collector_health": ("The health of the sensors themselves", "How late, lossy, or skewed the collection is.", "Collector self-metrics.", "collector_id plus the step"),
    "features": ("Calculated readings", "Summaries computed from the readings above, such as 'how hot is this compared with the power it is using.' Window totals live here too. A window total is the same reading added up. It is not a new sensor.", "A feature store built at decision time from readings already in hand.", "accelerator_id or job_id plus the decision step"),
}


def _key(entity: str, name: str) -> str:
    return f"{entity}.{name}"


def _impact(field: FieldSpec, final_keys: set[str]) -> str:
    if _key(field.entity, field.name) in final_keys:
        return "This column is in the final decision table. Including it can change whether the page saves, restarts, benches a chip, or refuses to guess."
    if field.alias_of:
        return "This is a second name for a reading that already exists. Including it does not add a sensor and does not change the decision on its own."
    if field.window:
        return "This is the same reading totaled over a short or a longer window. Including it does not create a new measurement. A blank stays blank when there are too few samples."
    if field.leakage == "forbidden" or field.role == "latent_truth":
        return "This is the answer key. Including it on the operator pages would let the decision cheat. It stays off the public site."
    if field.role == "training_label" or field.leakage == "label":
        return "This is the score used after the rehearsal. Including it at decision time would be looking into the future, so the live rules do not read it."
    if field.unit == "id" or field.name.endswith("_id"):
        return "This is the tag that ties the row to another table. Including it is what makes the mapping possible. Without it, a temperature cannot be matched to a chip, a job, or a building."
    if field.role == "control_input":
        return "This is a setting, not a live sensor. Including it tells the rehearsal what the building and the job are allowed to do. Leaving it out forces a guess about the restart."
    if field.role == "observed":
        return "This is a live reading. Including it lets the page see this fact. If the machine does not report it, the cell stays blank. A blank is not stored as zero, and too many blanks can make the page refuse to guess."
    if field.role == "derived":
        return "This is a calculation from readings already collected. Including it gives the rules a summary. It changes a decision only when it is also named in the final table."
    return "This is a record for the paper trail. Including it shows who did what. It does not by itself restart a job."


def decision_columns() -> list[dict]:
    """The short list. Everything else can be joined. These are the columns that can change a reaction."""
    return [
        {
            "name": "gpu_temp_c",
            "source": "gpu_telemetry",
            "purpose": "The chip's thermometer.",
            "impact": "A rule that looks only at temperature can bench a healthy busy chip. The better rules compare the temperature with the power.",
        },
        {
            "name": "power_draw_w",
            "source": "gpu_telemetry",
            "purpose": "How much electrical power the chip is using.",
            "impact": "If temperature and power rise together, the page treats it as a busy spell and leaves the chip in the job.",
        },
        {
            "name": "power_limit_w",
            "source": "gpu_telemetry",
            "purpose": "The cap on that power.",
            "impact": "Several chips on one feed dropping under the cap together become one incident. Chips on another feed stay out of it.",
        },
        {
            "name": "sm_util_ratio",
            "source": "gpu_telemetry",
            "purpose": "How busy the chip's math engines are. The learned helper calls this util.",
            "impact": "Including it tells a busy chip from an idle one. The helper was scored with it and did not beat the simple rule, so the live rules stay in charge.",
        },
        {
            "name": "residual_ewma",
            "source": "features",
            "purpose": "How much hotter the chip is than expected for the power it is using, smoothed over recent steps.",
            "impact": "A high value, with a fresh reading and an aging save, asks for an extra save before the chip stops.",
        },
        {
            "name": "freshness_steps",
            "source": "features",
            "purpose": "How many steps have passed since the newest reading actually arrived.",
            "impact": "If this is too large, the page says the sensors are late and refuses to name a cause.",
        },
        {
            "name": "support_count",
            "source": "features",
            "purpose": "How many readings are in hand at decision time.",
            "impact": "Too few readings and the page refuses to guess, the way a doctor refuses a diagnosis from one old thermometer.",
        },
        {
            "name": "data_quality_ok",
            "source": "features",
            "purpose": "A yes or no that combines freshness and how many readings exist.",
            "impact": "When this is no, a preventive shutdown is blocked.",
        },
        {
            "name": "workload_temp_tracks_power",
            "source": "features",
            "purpose": "Whether the heat followed the power, which is what a healthy busy spell looks like.",
            "impact": "When this is yes, the page does not take an extra save just because the chip is warm.",
        },
        {
            "name": "checkpoint_age_steps",
            "source": "features",
            "purpose": "How many steps have passed since the last complete save.",
            "impact": "An old save plus a real heat warning asks for a new save. A brand-new complete save does not.",
        },
        {
            "name": "state",
            "source": "checkpoints",
            "purpose": "Whether a save is complete, still being written, or refused.",
            "impact": "Including it stops the page from reopening a half-finished save. Only a verified usable save can restart the job.",
        },
        {
            "name": "shards_present",
            "source": "checkpoints",
            "purpose": "How many pieces of the save arrived.",
            "impact": "Compared with shards_expected, a short count means the save is torn and is refused.",
        },
        {
            "name": "heartbeat_age_s",
            "source": "host_telemetry",
            "purpose": "How long since a seat in the job last answered.",
            "impact": "A missing heartbeat can restart the job from the last complete save. It does not invent a heat warning.",
        },
        {
            "name": "capability",
            "source": "training_jobs",
            "purpose": "Whether this job may drop one chip or must restart as a choir.",
            "impact": "If the job is strict, a request to drop one singer is refused and the group restarts together.",
        },
        {
            "name": "power_limit_ratio",
            "source": "calculated from gpu_telemetry",
            "purpose": "Power cap divided by the chip's normal full power. Used only on the learned helper's score sheet.",
            "impact": "Including it in the helper did not beat the simple heat rule, so it does not replace the live rules.",
        },
    ]


def catalog_atlas(fields: list[FieldSpec] | None = None) -> dict:
    fields = fields or build_catalog()
    final = decision_columns()
    final_keys = {_key(item["source"], item["name"]) for item in final}
    grouped: dict[str, list[FieldSpec]] = {}
    for field in fields:
        grouped.setdefault(field.entity, []).append(field)
    unknown = [entity for entity in grouped if entity not in TABLES]
    if unknown:
        raise KeyError("catalog table is missing a plain-language entry: " + ", ".join(sorted(unknown)))
    tables = []
    for entity, (title, plain, real_world, joins_on) in TABLES.items():
        columns = grouped.get(entity, [])
        tables.append(
            {
                "id": entity,
                "title": title,
                "plain": plain,
                "real_world": real_world,
                "joins_on": joins_on,
                "column_count": len(columns),
                "columns": [
                    {
                        "name": field.name,
                        "brief": field.meaning,
                        "in_final": _key(field.entity, field.name) in final_keys,
                        "impact": _impact(field, final_keys),
                    }
                    for field in columns
                ],
            }
        )
    return {
        "synthetic": True,
        "table_count": len(tables),
        "column_count": sum(table["column_count"] for table in tables),
        "mapping": (
            "Picture a filing cabinet. Each table is a drawer. A row is one fact, and a shared tag such as the chip's name or the job's name is how a fact in one drawer is laid next to a fact in another. "
            "In a real hall the drawers would be filled by different systems: an inventory database for buildings and chips, a telemetry stream for temperature and power, a job scheduler for the race, and a storage system for saves. "
            "This rehearsal fills those same drawers with synthetic rows. The join is the same idea: chip name plus the step, or job name plus the step. Readings that belong to chips outside the job are not given a personal chart. Those chips are counted in the hall total."
        ),
        "tables": tables,
        "decision_columns": final,
        "decision_plain": (
            "Hundreds of columns can be joined. Only this short list is allowed to change a reaction: save, restart, leave the chip alone, bench it, or refuse to guess. "
            "Including one of these can change that choice. Including a column that is not on this list adds context or a paper trail, and the live rules do not restart a job because of it. "
            "The learned helper was scored on five of these numbers and did not beat the simple rule, so the simple rule stays in charge."
        ),
    }
