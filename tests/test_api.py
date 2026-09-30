"""API authentication, approval, and evaluator separation."""

from __future__ import annotations

import time
import uuid

from fastapi.testclient import TestClient

from training_continuity.api.app import create_app
from training_continuity.persistence.orm import UserRow
from training_continuity.security import hash_password


def _app():
    app = create_app(database_url="sqlite+pysqlite:///:memory:", auth_secret="test-secret")
    db = app.state.session_factory()
    for username, role in (("viewer", "viewer"), ("investigator", "investigator"), ("approver", "approver"), ("admin", "administrator")):
        db.add(UserRow(user_id=str(uuid.uuid4()), username=username, password_hash=hash_password(f"{username}-pass"), role=role))
    db.commit()
    db.close()
    return app


def _login(client: TestClient, username: str) -> dict:
    response = client.post("/api/v1/auth/login", json={"username": username, "password": f"{username}-pass"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}


def test_health_and_role_boundaries():
    client = TestClient(_app())
    health = client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["hardware_adapters_connected"] is False
    metrics = client.get("/metrics")
    assert "tc_hardware_adapters_connected 0" in metrics.text
    viewer = _login(client, "viewer")
    denied = client.post("/api/v1/stories/healthy_workload_shift/runs", json={"mode": "automated"}, headers=viewer)
    assert denied.status_code == 403
    investigator = _login(client, "investigator")
    started = client.post("/api/v1/stories/healthy_workload_shift/runs", json={"mode": "automated"}, headers=investigator)
    assert started.status_code == 202
    run_id = started.json()["run_id"]
    body = client.get(f"/api/v1/runs/{run_id}", headers=investigator).json()
    assert body["synthetic"] is True
    assert "evaluator" not in body
    assert body["hypotheses"]["leading_mechanism"] == "workload_shift"
    hidden = client.get(f"/api/v1/runs/{run_id}/truth", headers=investigator)
    assert hidden.status_code == 403
    admin = _login(client, "admin")
    truth = client.get(f"/api/v1/runs/{run_id}/truth", headers=admin)
    assert truth.status_code == 200
    assert truth.json()["truth_namespace"] is True
    presented = client.get(f"/api/v1/runs/{run_id}?presentation=true", headers=viewer)
    assert "metrics" not in presented.json()


def test_manual_approval_flow_and_audit():
    client = TestClient(_app())
    investigator = _login(client, "investigator")
    approver = _login(client, "approver")
    started = client.post("/api/v1/stories/gradual_warning/runs", json={"mode": "manual"}, headers=investigator)
    assert started.status_code == 202
    run_id = started.json()["run_id"]
    pending = client.get(f"/api/v1/runs/{run_id}", headers=investigator).json()
    assert pending["status"] == "awaiting_approval"
    action = pending["pending_action"]
    forbidden = client.post(
        f"/api/v1/runs/{run_id}/approvals",
        json={"decision": "approve", "precondition_hash": action["precondition_hash"]},
        headers=investigator,
    )
    assert forbidden.status_code == 403
    approved = client.post(
        f"/api/v1/runs/{run_id}/approvals",
        json={"decision": "approve", "precondition_hash": action["precondition_hash"]},
        headers=approver,
    )
    assert approved.status_code == 200
    assert any(item["actor_kind"] == "human" and item["state"] == "succeeded" for item in approved.json()["actions"])
    audit = client.get(f"/api/v1/runs/{run_id}/audit", headers=viewer_headers(client))
    assert any(event["action"] == "approval_approve" for event in audit.json()["events"])
    catalog = client.get("/api/v1/catalog", headers=investigator)
    assert catalog.json()["counts"]["unique_concepts"] >= 180
    adapters = client.get("/api/v1/adapters").json()["adapters"]
    hardware = next(item for item in adapters if item["name"] == "HardwareController")
    assert hardware["connected"] is False


def viewer_headers(client: TestClient) -> dict:
    return _login(client, "viewer")


def test_background_story_returns_before_the_engine_finishes(tmp_path, monkeypatch):
    import threading

    from training_continuity.api import app as api

    gate = threading.Event()
    original = api.run_story

    def blocked(*args, **kwargs):
        assert gate.wait(8)
        return original(*args, **kwargs)

    monkeypatch.setattr(api, "run_story", blocked)
    url = "sqlite+pysqlite:///" + (tmp_path / "tc.db").as_posix()
    application = create_app(database_url=url, auth_secret="test-secret", sync_worker=False)
    db = application.state.session_factory()
    db.add(UserRow(user_id=str(uuid.uuid4()), username="investigator", password_hash=hash_password("investigator-pass"), role="investigator"))
    db.commit()
    db.close()
    client = TestClient(application)
    headers = _login(client, "investigator")
    started = client.post("/api/v1/stories/healthy_workload_shift/runs", json={"mode": "automated"}, headers=headers)
    assert started.status_code == 202
    assert started.json()["status"] == "queued"
    queued = client.get(f"/api/v1/runs/{started.json()['run_id']}", headers=headers)
    assert queued.json()["status"] == "queued"
    gate.set()
    body = queued.json()
    for _ in range(60):
        time.sleep(0.05)
        body = client.get(f"/api/v1/runs/{started.json()['run_id']}", headers=headers).json()
        if body["status"] != "queued":
            break
    assert body["status"] == "completed"
    assert "_evaluator" not in body
