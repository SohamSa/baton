"""HTTP API. The backend owns inference, policy, and state."""

from __future__ import annotations

import json
import threading
import time
import uuid
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from baton import ORGANIZATION_MODE, PRODUCT_CLAIM, __version__
from baton.adapters.registry import ADAPTERS
from baton.catalog.atlas import catalog_atlas
from baton.catalog.dictionary import build_catalog, catalog_counts
from baton.persistence.db import enable_sqlite_fk, make_session_factory
from baton.persistence.orm import (
    ActionRow,
    AuditEvent,
    Base,
    CheckpointRow,
    IncidentRow,
    OutboxRow,
    RunRow,
    UserRow,
)
from baton.security import hash_password, issue_token, read_token, verify_password
from baton.accounting.economics import assumption_estimate
from baton.simulation.stories import list_stories, run_story

ROOT = Path(__file__).resolve().parents[3]


class LoginBody(BaseModel):
    username: str
    password: str


class StoryRunBody(BaseModel):
    mode: str = "automated"
    presentation: bool = False
    approvals: list[dict] = []


class EconomicsBody(BaseModel):
    config: dict
    useful_delta_steps: float
    step_seconds: float
    accelerators_in_job: int


class ApprovalBody(BaseModel):
    decision: str
    precondition_hash: str


def create_app(database_url: str = "sqlite+pysqlite:///:memory:", auth_secret: str = "test-secret", sync_worker: bool = True) -> FastAPI:
    engine, SessionLocal = make_session_factory(database_url)
    enable_sqlite_fk(engine)
    Base.metadata.create_all(engine)
    app = FastAPI(title="Baton", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.session_factory = SessionLocal
    app.state.auth_secret = auth_secret
    app.state.sync_worker = sync_worker
    if not sync_worker:
        thread = threading.Thread(target=_outbox_loop, args=(SessionLocal,), name="outbox", daemon=True)
        thread.start()

    def session() -> Session:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

    def actor(request: Request, db: Session = Depends(session)) -> UserRow:
        header = request.headers.get("authorization", "")
        if not header.startswith("Bearer "):
            raise HTTPException(401, "authentication required")
        payload = read_token(header.removeprefix("Bearer ").strip(), request.app.state.auth_secret)
        if not payload:
            raise HTTPException(401, "invalid token")
        user = db.scalar(select(UserRow).where(UserRow.username == payload["sub"]))
        if user is None:
            raise HTTPException(401, "unknown user")
        request.state.correlation_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
        return user

    def require(*roles: str):
        def checker(user: UserRow = Depends(actor)) -> UserRow:
            if user.role not in roles:
                raise HTTPException(403, "role is not permitted for this action")
            return user

        return checker

    @app.middleware("http")
    async def correlation(request: Request, call_next):
        request.state.correlation_id = request.headers.get("x-correlation-id", str(uuid.uuid4()))
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = request.state.correlation_id
        return response

    @app.get("/api/v1/health")
    def health():
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "synthetic": True,
            "organization_mode": ORGANIZATION_MODE,
            "version": __version__,
            "hardware_adapters_connected": False,
        }

    @app.get("/metrics")
    def metrics():
        body = "\n".join(
            [
                "# HELP tc_up Process is serving synthetic data only.",
                "# TYPE tc_up gauge",
                "tc_up 1",
                "# HELP tc_hardware_adapters_connected Physical adapters connected.",
                "# TYPE tc_hardware_adapters_connected gauge",
                "tc_hardware_adapters_connected 0",
            ]
        )
        return Response(content=body, media_type="text/plain")

    @app.post("/api/v1/auth/login")
    def login(body: LoginBody, db: Session = Depends(session)):
        user = db.scalar(select(UserRow).where(UserRow.username == body.username))
        if user is None or not verify_password(body.password, user.password_hash):
            raise HTTPException(401, "invalid credentials")
        return {"token": issue_token(user.username, user.role, app.state.auth_secret), "role": user.role, "username": user.username}

    @app.get("/api/v1/meta")
    def meta():
        return {
            "product": "Baton",
            "synthetic": True,
            "organization_mode": ORGANIZATION_MODE,
            "claim": PRODUCT_CLAIM,
            "cluster_accelerators": 32768,
            "cluster_attached": False,
            "currency_enabled_by_default": False,
        }

    @app.get("/api/v1/adapters")
    def adapters():
        return {"adapters": ADAPTERS}

    @app.get("/api/v1/stories")
    def stories(_: UserRow = Depends(actor)):
        return {"stories": list_stories(), "synthetic": True}

    @app.get("/api/v1/catalog")
    def catalog(_: UserRow = Depends(actor)):
        fields = build_catalog()
        return {
            "counts": catalog_counts(fields),
            "atlas": catalog_atlas(fields),
            "fields": [field.to_dict() for field in fields],
            "synthetic": True,
        }

    @app.get("/api/v1/models")
    def models(_: UserRow = Depends(actor)):
        report_path = ROOT / "artifacts" / "model_report.json"
        report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else None
        return {
            "operational_default": (report or {}).get("default_operational_policy", "rule_based"),
            "trained_report": report,
            "oracle": {"available_to_operators": False, "label": "evaluator_only"},
            "synthetic": True,
        }

    @app.post("/api/v1/economics")
    def economics(body: EconomicsBody, _: UserRow = Depends(actor)):
        return assumption_estimate(body.config, body.useful_delta_steps, body.step_seconds, body.accelerators_in_job)

    @app.get("/api/v1/monitoring")
    def monitoring(_: UserRow = Depends(actor)):
        return {
            "synthetic": True,
            "collectors": [{"id": "sim-collector", "lag_steps": 0, "dropped_count": 0, "degraded": False, "queue_depth": 0}],
            "hardware_adapters_connected": False,
            "note": "Drops and lag are explicit. A zero drop count is this process, not a real fleet.",
        }

    @app.post("/api/v1/stories/{story_id}/runs", status_code=202)
    def start_story(story_id: str, body: StoryRunBody, request: Request, user: UserRow = Depends(require("investigator", "approver", "administrator")), db: Session = Depends(session)):
        if body.mode not in {"manual", "automated"}:
            raise HTTPException(400, "mode must be manual or automated")
        if story_id not in {item["id"] for item in list_stories()}:
            raise HTTPException(404, "unknown story")
        run_id = str(uuid.uuid4())
        if not request.app.state.sync_worker:
            queued = {
                "synthetic": True,
                "status": "queued",
                "narrative": "The story is queued for the simulation engine.",
                "story": {"id": story_id, "title": story_id, "summary": ""},
            }
            db.add(RunRow(run_id=run_id, story_id=story_id, status="queued", operator_json=json.dumps(queued), evaluator_json="{}"))
            db.add(
                OutboxRow(
                    event_id=str(uuid.uuid4()),
                    event_type="run_story",
                    idempotency_key=run_id,
                    status="pending",
                    payload=json.dumps(
                        {
                            "run_id": run_id,
                            "story_id": story_id,
                            "mode": body.mode,
                            "approvals": body.approvals,
                            "presentation": body.presentation,
                            "actor": user.username,
                            "correlation_id": getattr(request.state, "correlation_id", ""),
                        }
                    ),
                )
            )
            db.commit()
            return {"run_id": run_id, "status": "queued", "synthetic": True}
        produced = run_story(story_id, mode=body.mode, approvals=body.approvals, presentation=body.presentation)
        evaluator = produced.pop("_evaluator", {})
        _persist_run(db, run_id, story_id, produced, evaluator, user, request)
        return {"run_id": run_id, "status": produced["status"], "synthetic": True}

    @app.get("/api/v1/runs/{run_id}")
    def get_run(run_id: str, presentation: bool = False, user: UserRow = Depends(actor), db: Session = Depends(session)):
        row = db.get(RunRow, run_id)
        if row is None:
            raise HTTPException(404, "run not found")
        payload = json.loads(row.operator_json)
        if presentation:
            payload.pop("metrics", None)
            payload.pop("comparison", None)
            payload["presentation"] = True
        payload["run_id"] = run_id
        return payload

    @app.get("/api/v1/runs/{run_id}/truth")
    def truth(run_id: str, user: UserRow = Depends(require("administrator")), db: Session = Depends(session)):
        row = db.get(RunRow, run_id)
        if row is None:
            raise HTTPException(404, "run not found")
        return {"truth_namespace": True, "label": "evaluator-only latent truth", "evaluator": json.loads(row.evaluator_json or "{}")}

    @app.post("/api/v1/runs/{run_id}/approvals")
    def approve(run_id: str, body: ApprovalBody, request: Request, user: UserRow = Depends(require("approver", "administrator")), db: Session = Depends(session)):
        row = db.get(RunRow, run_id)
        if row is None:
            raise HTTPException(404, "run not found")
        if body.decision not in {"approve", "reject"}:
            raise HTTPException(400, "decision must be approve or reject")
        current = json.loads(row.operator_json)
        pending = current.get("pending_action")
        if not pending:
            raise HTTPException(409, "no action is awaiting approval")
        approvals = list(current.get("approvals") or [])
        approvals.append(
            {
                "action_id": pending["action_id"],
                "decision": body.decision,
                "precondition_hash": body.precondition_hash,
                "actor": user.username,
            }
        )
        view = run_story(current["story"]["id"], mode="manual", approvals=approvals, presentation=False)
        evaluator = view.pop("_evaluator", {})
        _persist_run(db, run_id, current["story"]["id"], view, evaluator, user, request, replace=True)
        db.add(
            AuditEvent(
                event_id=str(uuid.uuid4()),
                actor=user.username,
                action=f"approval_{body.decision}",
                detail=pending["action_id"],
                correlation_id=getattr(request.state, "correlation_id", ""),
            )
        )
        db.commit()
        return view

    @app.get("/api/v1/runs/{run_id}/audit")
    def audit(run_id: str, limit: int = 50, offset: int = 0, _: UserRow = Depends(actor), db: Session = Depends(session)):
        limit = min(max(limit, 1), 100)
        rows = db.scalars(select(AuditEvent).offset(offset).limit(limit)).all()
        actions = db.scalars(select(ActionRow).where(ActionRow.run_id == run_id)).all()
        return {
            "events": [{"actor": row.actor, "action": row.action, "detail": row.detail} for row in rows],
            "actions": [{"action_id": row.action_id, "state": row.state, "actor": row.actor, "actor_kind": row.actor_kind, "reason": row.reason} for row in actions],
        }

    @app.get("/api/v1/runs/{run_id}/events")
    def events(run_id: str, cursor: int = 0, _: UserRow = Depends(actor), db: Session = Depends(session)):
        row = db.get(RunRow, run_id)
        if row is None:
            raise HTTPException(404, "run not found")

        def stream():
            payload = json.dumps({"status": row.status, "cursor": cursor + 1})
            yield f"id: {cursor + 1}\ndata: {payload}\n\n"

        return StreamingResponse(stream(), media_type="text/event-stream")

    return app


def _outbox_loop(session_factory) -> None:
    while True:
        _drain_outbox(session_factory)
        time.sleep(0.2)


def _drain_outbox(session_factory) -> None:
    db = session_factory()
    try:
        pending = list(db.scalars(select(OutboxRow).where(OutboxRow.status == "pending")))
    finally:
        db.close()
    for event in pending:
        _execute_outbox(session_factory, event.event_id)


def _execute_outbox(session_factory, event_id: str) -> None:
    db = session_factory()
    try:
        event = db.get(OutboxRow, event_id)
        if event is None or event.status != "pending":
            return
        event.status = "processing"
        db.commit()
        payload = json.loads(event.payload)
        produced = run_story(
            payload["story_id"],
            mode=payload["mode"],
            approvals=payload.get("approvals") or [],
            presentation=bool(payload.get("presentation")),
        )
        evaluator = produced.pop("_evaluator", {})
        actor = type("Actor", (), {"username": payload.get("actor", "worker")})()
        request = type("RequestState", (), {})()
        request.state = type("State", (), {"correlation_id": payload.get("correlation_id", "")})()
        _persist_run(db, payload["run_id"], payload["story_id"], produced, evaluator, actor, request, replace=True)
        event.status = "done"
        db.commit()
    except Exception as exc:
        db.rollback()
        event = db.get(OutboxRow, event_id)
        if event is not None:
            event.status = "failed"
            payload = json.loads(event.payload)
            row = db.get(RunRow, payload["run_id"])
            if row is not None:
                row.status = "failed"
                row.operator_json = json.dumps({"synthetic": True, "status": "failed", "narrative": "The simulation worker failed.", "error": type(exc).__name__})
            db.commit()
    finally:
        db.close()


def _persist_run(db: Session, run_id: str, story_id: str, view: dict, evaluator: dict, user, request: Request, replace: bool = False) -> None:
    operator = dict(view)
    operator.pop("evaluator", None)
    operator.pop("_evaluator", None)
    if replace:
        existing = db.get(RunRow, run_id)
        existing.operator_json = json.dumps(operator)
        existing.status = operator.get("status", "completed")
        existing.evaluator_json = json.dumps(evaluator)
    else:
        db.add(
            RunRow(
                run_id=run_id,
                story_id=story_id,
                status=operator.get("status", "completed"),
                operator_json=json.dumps(operator),
                evaluator_json=json.dumps(evaluator),
            )
        )
    for action in operator.get("actions", []):
        db.merge(
            ActionRow(
                action_id=f"{run_id}:{action['action_id']}",
                run_id=run_id,
                action_type=action["action_type"],
                state=action["state"],
                scope=action["scope"],
                actor=action.get("actor", ""),
                actor_kind=action.get("actor_kind", ""),
                effect_applied=bool(action.get("effect_applied")),
                reason=action.get("reason", ""),
            )
        )
    for incident in operator.get("incidents", []):
        db.merge(
            IncidentRow(
                incident_id=f"{run_id}:{incident['incident_id']}",
                run_id=run_id,
                scope=incident["scope"],
                opened_step=incident["opened_step"],
                state=incident["state"],
                abstain_reason=incident.get("abstain_reason", ""),
            )
        )
    for checkpoint in operator.get("checkpoints", []):
        db.merge(
            CheckpointRow(
                checkpoint_id=f"{run_id}:{checkpoint['checkpoint_id']}",
                job_id=checkpoint["job_id"],
                run_id=run_id,
                progress=checkpoint["progress"],
                state=checkpoint["state"],
                shards_present=checkpoint["shards_present"],
                shards_expected=checkpoint["shards_expected"],
            )
        )
    db.add(
        AuditEvent(
            event_id=str(uuid.uuid4()),
            actor=user.username,
            action="run_story",
            detail=story_id,
            correlation_id=getattr(request.state, "correlation_id", ""),
        )
    )
    db.commit()


def seed_user(database_url: str, username: str, password: str, role: str) -> None:
    engine, SessionLocal = make_session_factory(database_url)
    enable_sqlite_fk(engine)
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        if db.scalar(select(UserRow).where(UserRow.username == username)) is None:
            db.add(UserRow(user_id=str(uuid.uuid4()), username=username, password_hash=hash_password(password), role=role))
            db.commit()
    finally:
        db.close()
