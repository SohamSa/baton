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
  const response = await fetch(base + "browser-engine.json");
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
from training_continuity.adapters.registry import ADAPTERS
from training_continuity.catalog.dictionary import build_catalog, catalog_counts
from training_continuity.simulation.stories import list_stories, run_story
import json

def publish(view):
    cleaned = dict(view)
    for key in ("_evaluator", "evaluator", "observations", "logs", "ledger_errors"):
        cleaned.pop(key, None)
    return cleaned

def op_stories():
    return json.dumps({"stories": list_stories(), "synthetic": True})

def op_run(payload):
    data = json.loads(payload)
    view = run_story(data["story_id"], mode=data["mode"], approvals=data.get("approvals") or [])
    return json.dumps(publish(view))

def op_catalog():
    return json.dumps({"counts": catalog_counts(build_catalog()), "synthetic": True})

def op_adapters():
    return json.dumps({"adapters": ADAPTERS})

def op_train(payload):
    from pathlib import Path
    from training_continuity.intelligence.train import train
    report = train(range(12), Path("/tmp/training-continuity-model"))
    return json.dumps({
        "operational_default": report["default_operational_policy"],
        "trained_report": report,
        "oracle": {"available_to_operators": False, "label": "evaluator_only"},
        "synthetic": True,
        "executed_in_browser": True,
    })
`);
  status("The decision engine is ready in this browser.");
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
    if (op === "run") status("Running this story in the decision engine.");
    pyodide.globals.set("payload_json", JSON.stringify(payload || {}));
    const names = { stories: "op_stories()", run: "op_run(payload_json)", catalog: "op_catalog()", adapters: "op_adapters()", train: "op_train(payload_json)" };
    const raw = pyodide.runPython(names[op]);
    const value = JSON.parse(raw);
    if (op === "run") runs += 1;
    if (op === "train") trained = value;
    self.postMessage({ type: "result", id, value });
  } catch (error) {
    self.postMessage({ type: "error", id, message: String(error && error.message ? error.message : error) });
  }
};
