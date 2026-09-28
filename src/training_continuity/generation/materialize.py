"""Partitioned Parquet generation with a resumable manifest."""

from __future__ import annotations

import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from training_continuity.generation.queue import BoundedQueue
from training_continuity.simulation.engine import ScenarioConfig, run_scenario


def materialize(out_dir: Path, seeds: list[int], queue_size: int = 5000) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {"partitions": [], "dropped": 0}
    done = set(manifest["partitions"])
    queue = BoundedQueue(queue_size)
    for seed in seeds:
        name = f"part-{seed:04d}.parquet"
        if name in done:
            continue
        result = run_scenario(
            ScenarioConfig(scenario_id=f"part-{seed}", seed=seed, steps=8, gpus_per_host=2, checkpoint_interval=20, random_faults=True, fault_rate_per_gpu=0.3),
            "reactive",
        )
        rows = []
        for row in result["observations"]:
            if row.get("entity_kind") != "accelerator":
                continue
            if not queue.put(row):
                continue
            rows.append({key: row.get(key) for key in ("observation_id", "entity_id", "event_step", "availability_step", "gpu_temp_c", "power_draw_w", "fan_speed_ratio")})
        table = pa.Table.from_pylist(rows)
        pq.write_table(table, out_dir / name)
        manifest["partitions"].append(name)
        manifest["dropped"] = queue.dropped
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        done.add(name)
    manifest["degraded"] = queue.dropped > 0
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest
