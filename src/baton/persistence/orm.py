"""Operational metadata tables. High-rate telemetry stays in Parquet."""

from __future__ import annotations

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Site(Base):
    __tablename__ = "sites"
    site_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(200))
    timezone: Mapped[str] = mapped_column(String(64))
    climate_regime: Mapped[str] = mapped_column(String(64))


class Zone(Base):
    __tablename__ = "zones"
    zone_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    site_id: Mapped[str] = mapped_column(ForeignKey("sites.site_id"))
    shared_boundary: Mapped[str] = mapped_column(String(64))


class Rack(Base):
    __tablename__ = "racks"
    rack_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    zone_id: Mapped[str] = mapped_column(ForeignKey("zones.zone_id"))
    power_feed_id: Mapped[str] = mapped_column(String(64))


class Host(Base):
    __tablename__ = "hosts"
    host_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    rack_id: Mapped[str] = mapped_column(ForeignKey("racks.rack_id"))
    lifecycle_state: Mapped[str] = mapped_column(String(32), default="in_service")


class HardwareProfile(Base):
    __tablename__ = "hardware_profiles"
    profile_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    family: Mapped[str] = mapped_column(String(64))
    supports_fan: Mapped[bool] = mapped_column(Boolean)
    supports_ecc: Mapped[bool] = mapped_column(Boolean)
    tdp_w: Mapped[float] = mapped_column(Float)


class Accelerator(Base):
    __tablename__ = "accelerators"
    accelerator_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    host_id: Mapped[str] = mapped_column(ForeignKey("hosts.host_id"))
    profile_id: Mapped[str] = mapped_column(ForeignKey("hardware_profiles.profile_id"))
    service_age_days: Mapped[float] = mapped_column(Float, default=0)


class PowerDomain(Base):
    __tablename__ = "power_domains"
    power_domain_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    site_id: Mapped[str] = mapped_column(ForeignKey("sites.site_id"))
    redundancy: Mapped[str] = mapped_column(String(32), default="single")


class StorageResource(Base):
    __tablename__ = "storage_resources"
    storage_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    bandwidth_mbps: Mapped[float] = mapped_column(Float)
    reachable: Mapped[bool] = mapped_column(Boolean, default=True)


class TrainingJob(Base):
    __tablename__ = "training_jobs"
    job_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    capability: Mapped[str] = mapped_column(String(32))
    state: Mapped[str] = mapped_column(String(32))
    tp_size: Mapped[int] = mapped_column(Integer)


class JobAttempt(Base):
    __tablename__ = "job_attempts"
    attempt_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("training_jobs.job_id"))
    terminal_reason: Mapped[str] = mapped_column(String(64), default="")


class RankAssignment(Base):
    __tablename__ = "rank_assignments"
    assignment_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    job_id: Mapped[str] = mapped_column(ForeignKey("training_jobs.job_id"))
    rank: Mapped[int] = mapped_column(Integer)
    accelerator_id: Mapped[str] = mapped_column(String(64))
    valid_from_step: Mapped[int] = mapped_column(Integer)
    valid_to_step: Mapped[int | None] = mapped_column(Integer, nullable=True)


class CheckpointRow(Base):
    __tablename__ = "checkpoints"
    checkpoint_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    job_id: Mapped[str] = mapped_column(String(64))
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    progress: Mapped[float] = mapped_column(Float)
    state: Mapped[str] = mapped_column(String(32))
    shards_present: Mapped[int] = mapped_column(Integer)
    shards_expected: Mapped[int] = mapped_column(Integer)


class IncidentRow(Base):
    __tablename__ = "incidents"
    incident_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    scope: Mapped[str] = mapped_column(String(96))
    opened_step: Mapped[int] = mapped_column(Integer)
    state: Mapped[str] = mapped_column(String(32))
    abstain_reason: Mapped[str] = mapped_column(String(200), default="")


class EvidenceRow(Base):
    __tablename__ = "evidence"
    evidence_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.incident_id"))
    availability_step: Mapped[int] = mapped_column(Integer)
    quality: Mapped[str] = mapped_column(String(32), default="fresh")


class HypothesisRow(Base):
    __tablename__ = "hypotheses"
    hypothesis_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    mechanism: Mapped[str] = mapped_column(String(64))
    abstain: Mapped[bool] = mapped_column(Boolean, default=False)


class ActionRow(Base):
    __tablename__ = "actions"
    action_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    action_type: Mapped[str] = mapped_column(String(64))
    state: Mapped[str] = mapped_column(String(32))
    scope: Mapped[str] = mapped_column(String(96))
    actor: Mapped[str] = mapped_column(String(64), default="")
    actor_kind: Mapped[str] = mapped_column(String(32), default="")
    effect_applied: Mapped[bool] = mapped_column(Boolean, default=False)
    reason: Mapped[str] = mapped_column(Text, default="")


class ApprovalRow(Base):
    __tablename__ = "approvals"
    approval_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    action_id: Mapped[str] = mapped_column(String(160))
    actor: Mapped[str] = mapped_column(String(64))
    decision: Mapped[str] = mapped_column(String(16))
    precondition_hash: Mapped[str] = mapped_column(String(128))


class UserRow(Base):
    __tablename__ = "users"
    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    role: Mapped[str] = mapped_column(String(32))


class AuditEvent(Base):
    __tablename__ = "audit_events"
    event_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    actor: Mapped[str] = mapped_column(String(64))
    action: Mapped[str] = mapped_column(String(64))
    detail: Mapped[str] = mapped_column(Text, default="")
    correlation_id: Mapped[str] = mapped_column(String(64), default="")


class OutboxRow(Base):
    __tablename__ = "outbox"
    event_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    event_type: Mapped[str] = mapped_column(String(64))
    idempotency_key: Mapped[str] = mapped_column(String(160), unique=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    payload: Mapped[str] = mapped_column(Text)


class ExperimentRow(Base):
    __tablename__ = "experiments"
    experiment_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    config_hash: Mapped[str] = mapped_column(String(64))
    counterfactual: Mapped[bool] = mapped_column(Boolean, default=True)
    summary: Mapped[str] = mapped_column(Text, default="")


class ModelArtifactRow(Base):
    __tablename__ = "model_artifacts"
    artifact_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    checksum: Mapped[str] = mapped_column(String(128), default="")
    beats_baseline: Mapped[bool] = mapped_column(Boolean, default=False)
    report: Mapped[str] = mapped_column(Text, default="")


class ResourceLedgerRow(Base):
    __tablename__ = "resource_ledger"
    entry_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    resource_id: Mapped[str] = mapped_column(String(64))
    state: Mapped[str] = mapped_column(String(32))
    seconds: Mapped[float] = mapped_column(Float)


class LatentTruthEvent(Base):
    __tablename__ = "latent_truth_events"
    event_id: Mapped[str] = mapped_column(String(96), primary_key=True)
    run_id: Mapped[str] = mapped_column(String(64), index=True)
    mechanism: Mapped[str] = mapped_column(String(64))
    onset_step: Mapped[int] = mapped_column(Integer)
    target_id: Mapped[str] = mapped_column(String(64))


class SpareRow(Base):
    __tablename__ = "spares"
    spare_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    profile_id: Mapped[str] = mapped_column(ForeignKey("hardware_profiles.profile_id"))
    state: Mapped[str] = mapped_column(String(32), default="idle")


class RunRow(Base):
    __tablename__ = "runs"
    run_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    story_id: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(32))
    operator_json: Mapped[str] = mapped_column(Text)
    evaluator_json: Mapped[str] = mapped_column(Text, default="")
    cursor: Mapped[int] = mapped_column(Integer, default=0)
