/* Runs the repository's Python engine inside the visitor's browser. */
importScripts("https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js");

let pyodide = null;
let runs = 0;
let trained = null;

function status(message) {
  self.postMessage({ type: "status", message });
}

const ready = (async () => {
  status("Loading the decision engine into this browser.");
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.0/full/" });
  const base = self.location.pathname.replace(/engine-worker\.js$/, "");
  const response = await fetch(base + "browser-engine.json?pack=8");
  if (!response.ok) throw new Error("The engine source did not load.");
  const pack = await response.json();
  pyodide.FS.mkdirTree("/shims");
  pyodide.FS.writeFile("/shims/pydantic.py", pack.shim);
  Object.entries(pack.files).forEach(([path, source]) => {
    const full = `/pkg/${path}`;
    pyodide.FS.mkdirTree(full.slice(0, full.lastIndexOf("/")));
    pyodide.FS.writeFile(full, source);
  });
  pyodide.runPython(`
import sys
sys.path.insert(0, "/shims")
sys.path.insert(0, "/pkg")
from baton.accounting.economics import assumption_estimate
from baton.adapters.registry import ADAPTERS
from baton.catalog.atlas import catalog_atlas
from baton.catalog.dictionary import build_catalog, catalog_counts
from baton.simulation.engine import ScenarioRun, compare_policies, public_view
from baton.simulation.stories import STORIES, list_stories, story_config
import json

_live = {}

def publish(view):
    cleaned = dict(view)
    for key in ("_evaluator", "evaluator", "observations", "logs", "ledger_errors"):
        cleaned.pop(key, None)
    return cleaned

def op_stories():
    return json.dumps({"stories": list_stories(), "synthetic": True})

def op_begin(payload):
    data = json.loads(payload)
    spec = STORIES[data["story_id"]]
    cfg = story_config(data["story_id"], data.get("variant", "standard"), data.get("settings") or {})
    run = ScenarioRun(cfg, spec["primary_policy"], data["mode"], data.get("approvals") or [])
    _live.clear()
    _live.update(run=run, spec=spec, cfg=cfg, story_id=data["story_id"], variant=data.get("variant", "standard"), settings=dict(data.get("settings") or {}), mode=data["mode"], approvals=list(data.get("approvals") or []))
    return "ok"

def op_tick():
    frame = _live["run"].advance()
    if frame["done"]:
        result = _live["run"].result()
        view = public_view(result, presentation=False)
        view["story"] = {"id": _live["story_id"], "variant": _live["variant"], "settings": _live["settings"], "title": _live["spec"]["title"], "summary": _live["spec"]["summary"], "owner_playbook": _live["spec"].get("owner_playbook"), "failure_level": _live["spec"].get("failure_level"), "coverage": _live["spec"].get("coverage")}
        from baton.simulation.rehearsal import run_conditions
        view["rehearsal"] = run_conditions(_live["cfg"], _live["settings"])
        view["approvals"] = _live["approvals"]
        view["operator_view"] = True
        _live["view"] = publish(view)
    return json.dumps(frame)

def op_finish():
    view = dict(_live["view"])
    if _live["mode"] == "automated":
        view["comparison"] = compare_policies(_live["cfg"], _live["spec"]["comparison"])
    return json.dumps(publish(view))

def op_economics(payload):
    data = json.loads(payload)
    return json.dumps(assumption_estimate(data.get("config") or {}, data["useful_delta_steps"], data["step_seconds"], data["accelerators_in_job"]))

def op_catalog():
    fields = build_catalog()
    return json.dumps({"counts": catalog_counts(fields), "atlas": catalog_atlas(fields), "synthetic": True})

def op_adapters():
    return json.dumps({"adapters": ADAPTERS})

def op_train(payload):
    from pathlib import Path
    from baton.intelligence.train import train
    report = train(range(12), Path("/tmp/baton-model"))
    return json.dumps({
        "operational_default": report["default_operational_policy"],
        "trained_report": report,
        "oracle": {"available_to_operators": False, "label": "evaluator_only"},
        "synthetic": True,
        "executed_in_browser": True,
    })
`);
  status("The decision engine is ready in this browser.");
  self.postMessage({ type: "ready" });
})();

ready.catch((error) => {
  self.postMessage({ type: "fatal", message: String(error && error.message ? error.message : error) });
});

self.onmessage = async (event) => {
  const { id, op, payload } = event.data;
  try {
    await ready;
    if (op === "monitoring") {
      self.postMessage({
        type: "result",
        id,
        value: {
          synthetic: true,
          collectors: [{ id: "browser-engine", lag_steps: 0, dropped_count: 0, degraded: false, queue_depth: 0 }],
          hardware_adapters_connected: false,
          runs_executed: runs,
          note: "The decision engine is running in this browser. There is no separate service to open.",
        },
      });
      return;
    }
    if (op === "train" && trained) {
      self.postMessage({ type: "result", id, value: trained });
      return;
    }
    if (op === "train") {
      status("Running held-out model training in this browser.");
      await pyodide.loadPackage(["numpy", "scikit-learn"]);
    }
    pyodide.globals.set("payload_json", JSON.stringify(payload || {}));
    if (op === "run") {
      status("The hall is advancing one step at a time.");
      pyodide.runPython("op_begin(payload_json)");
      let view = null;
      for (;;) {
        const frame = JSON.parse(String(pyodide.runPython("op_tick()")));
        self.postMessage({ type: "frame", id, value: frame });
        if (frame.done) {
          status(payload && payload.mode === "automated" ? "Comparing the paired policies on the same faults." : "The run has reached a decision.");
          view = JSON.parse(String(pyodide.runPython("op_finish()")));
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 70));
      }
      runs += 1;
      status("The run is on the desk.");
      self.postMessage({ type: "result", id, value: view });
      return;
    }
    if (op === "economics") {
      const value = JSON.parse(String(pyodide.runPython("op_economics(payload_json)")));
      self.postMessage({ type: "result", id, value });
      return;
    }
    const names = { stories: "op_stories()", catalog: "op_catalog()", adapters: "op_adapters()", train: "op_train(payload_json)" };
    const raw = pyodide.runPython(names[op]);
    const value = JSON.parse(raw);
    if (op === "train") trained = value;
    self.postMessage({ type: "result", id, value });
  } catch (error) {
    self.postMessage({ type: "error", id, message: String(error && error.message ? error.message : error) });
  }
};

