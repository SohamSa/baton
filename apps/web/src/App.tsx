import { FormEvent, useEffect, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
  Adapter,
  ModelReport,
  Monitoring,
  RunView,
  adapters,
  approve,
  audit,
  catalog,
  getRun,
  login,
  models,
  monitoring,
  startStory,
  stories,
  truth,
} from "./api";

type Session = { token: string; role: string; username: string };

const LINKS = [
  ["/", "Overview"],
  ["/stories", "Stories"],
  ["/dependencies", "Dependencies"],
  ["/devices", "Devices"],
  ["/incidents", "Incidents"],
  ["/checkpoints", "Checkpoints"],
  ["/recovery", "Recovery"],
  ["/audit", "Audit"],
  ["/experiments", "Experiments"],
  ["/data", "Data"],
  ["/models", "Models"],
  ["/monitoring", "Monitoring"],
] as const;

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [presentation, setPresentation] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [run, setRun] = useState<RunView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (!session) {
    return <Login onSuccess={setSession} />;
  }

  return (
    <div className="shell">
      <a className="skip" href="#content">Skip to content</a>
      <nav aria-label="Primary">
        <strong>TrainingContinuity</strong>
        <p className="muted">{session.username} · {session.role}</p>
        {LINKS.map(([path, label]) => (
          <NavLink key={path} to={path} end={path === "/"}>
            {label}
          </NavLink>
        ))}
        <button type="button" onClick={() => setPresentation((value) => !value)}>
          {presentation ? "Technical mode" : "Presentation mode"}
        </button>
        <button type="button" onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}>
          {theme === "dark" ? "Light theme" : "Dark theme"}
        </button>
        <button type="button" onClick={() => { setSession(null); setRun(null); }}>Sign out</button>
      </nav>
      <main id="content">
        <p className="banner">Synthetic demonstration. No real fleet was measured, and no hardware adapter is connected.</p>
        {error ? <p role="alert">{error}</p> : null}
        {loading ? <p role="status">Loading…</p> : null}
        <Routes>
          <Route path="/" element={<Overview run={run} presentation={presentation} />} />
          <Route path="/stories" element={<Stories session={session} setRun={setRun} setError={setError} setLoading={setLoading} />} />
          <Route path="/dependencies" element={<Dependencies run={run} />} />
          <Route path="/devices" element={<Devices run={run} presentation={presentation} />} />
          <Route path="/incidents" element={<Incidents run={run} />} />
          <Route path="/checkpoints" element={<Checkpoints run={run} />} />
          <Route path="/recovery" element={<Recovery session={session} run={run} setRun={setRun} setError={setError} />} />
          <Route path="/audit" element={<AuditView session={session} run={run} />} />
          <Route path="/experiments" element={<Experiments run={run} presentation={presentation} />} />
          <Route path="/data" element={<DataView session={session} />} />
          <Route path="/models" element={<Models session={session} presentation={presentation} />} />
          <Route path="/monitoring" element={<MonitoringView session={session} />} />
        </Routes>
      </main>
    </div>
  );
}

function Login({ onSuccess }: { onSuccess: (session: Session) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      onSuccess(await login(username, password));
    } catch {
      setError("Sign-in failed. Use an account created by the local bootstrap, not a role picked from a list.");
    }
  }
  return (
    <main>
      <h1>TrainingContinuity</h1>
      <p className="banner">Synthetic research workspace for checkpoint protection and capability-aware recovery.</p>
      <form className="panel" onSubmit={submit}>
        <label>Username<br /><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label>
        <label>Password<br /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="panel">{text}</p>;
}

function Overview({ run, presentation }: { run: RunView | null; presentation: boolean }) {
  if (!run) return <Empty text="No run yet. Open Stories and execute one through the engine." />;
  return (
    <section>
      <h1>{run.story?.title ?? "Training overview"}</h1>
      <p>{run.narrative}</p>
      <div className="grid">
        <article className="card"><h2>Job state</h2><p>{Object.values(run.jobs ?? {}).map((job) => job.state).join(", ") || "Unknown"}</p></article>
        <article className="card"><h2>Hypothesis</h2><p>{run.hypotheses?.abstain ? "Abstaining" : run.hypotheses?.leading_mechanism}</p></article>
        <article className="card"><h2>Checkpoint</h2><p>{run.checkpoints?.some((item) => item.state === "verified_usable") ? "A verified save is on record" : "No verified save"}</p></article>
        <article className="card"><h2>Decision</h2><p>{run.pending_action ? "Waiting for a person" : run.status}</p></article>
      </div>
      {!presentation && run.metrics ? (
        <div className="panel">
          <h2>Synthetic measurements</h2>
          <p>Useful new progress {run.metrics.useful_new.toFixed(2)} steps. Recomputation {run.metrics.recomputation.toFixed(2)}. Interruption {run.metrics.job_interruption_seconds.toFixed(1)} seconds.</p>
          <p className="muted">These figures are computed for this virtual run. They are not fleet results or savings.</p>
        </div>
      ) : null}
    </section>
  );
}

function Stories({ session, setRun, setError, setLoading }: { session: Session; setRun: (run: RunView) => void; setError: (value: string) => void; setLoading: (value: boolean) => void }) {
  const [items, setItems] = useState<{ id: string; title: string; summary: string }[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const navigate = useNavigate();
  useEffect(() => {
    stories(session.token).then((payload) => setItems(payload.stories)).catch((reason: Error) => setError(reason.message));
  }, [session.token, setError]);
  async function run(id: string) {
    setLoading(true);
    setError("");
    try {
      const started = await startStory(session.token, id, mode);
      let view = await getRun(session.token, started.run_id, false);
      for (let attempt = 0; view.status === "queued" && attempt < 40; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        view = await getRun(session.token, started.run_id, false);
      }
      setRun({ ...view, run_id: started.run_id });
      navigate("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Run failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section>
      <h1>Guided stories</h1>
      <label>Mode <select value={mode} onChange={(event) => setMode(event.target.value as "manual" | "automated")}><option value="manual">Manual approval</option><option value="automated">Automated simulation policy</option></select></label>
      <div className="grid">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <button type="button" onClick={() => run(item.id)}>Run through the engine</button>
          </article>
        ))}
      </div>
      {items.length === 0 ? <Empty text="No stories were returned." /> : null}
    </section>
  );
}

function Dependencies({ run }: { run: RunView | null }) {
  if (!run?.jobs) return <Empty text="Run a story to see the job's closure. Unaffected capacity stays out of this view." />;
  return (
    <section>
      <h1>Dependency explorer</h1>
      {Object.entries(run.jobs).map(([jobId, job]) => (
        <article className="panel" key={jobId}>
          <h2>{jobId}</h2>
          <p>Capability {job.capability}. State {job.state}.</p>
          <ul>{job.rank_gpu.map((gpu, rank) => <li key={gpu}>Rank {rank} → {gpu}{job.dropped?.includes(rank) ? " (removed from the active membership)" : ""}</li>)}</ul>
          <p>Open incident scopes: {(run.incidents ?? []).map((item) => item.scope).join(", ") || "none"}</p>
        </article>
      ))}
    </section>
  );
}

function Devices({ run, presentation }: { run: RunView | null; presentation: boolean }) {
  const [selected, setSelected] = useState("");
  if (!run?.gpus) return <Empty text="No device series yet." />;
  const ids = Object.keys(run.gpus);
  const current = selected || ids[0];
  const gpu = run.gpus[current];
  const series = (run.timeline ?? []).filter((point) => point.entity_id === current).slice(-12);
  const max = Math.max(...series.map((point) => point.gpu_temp_c ?? 0), 1);
  return (
    <section>
      <h1>Device investigation</h1>
      <label>Accelerator <select value={current} onChange={(event) => setSelected(event.target.value)}>{ids.map((id) => <option key={id}>{id}</option>)}</select></label>
      <div className="panel">
        <p>Family {gpu.family}. Phase {gpu.phase}. Fan speed {gpu.fan_speed_ratio === null ? "unsupported" : "reported"}.</p>
        <p>Hypothesis context is observed. Hidden simulator state is not shown here.</p>
        {!presentation ? <p>Latest reported temperature {gpu.gpu_temp_c?.toFixed(1) ?? "unavailable"} C. Residual {gpu.residual_ewma?.toFixed(2) ?? "unavailable"}.</p> : <p>Temperature is being watched against the nominal envelope.</p>}
        {!presentation ? (
          <div className="bars" aria-label="Recent reported temperature">
            {series.map((point) => <div key={point.step} className="bar" style={{ width: `${((point.gpu_temp_c ?? 0) / max) * 100}%` }} title={`step ${point.step}`} />)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Incidents({ run }: { run: RunView | null }) {
  if (!run) return <Empty text="No incident is open." />;
  return (
    <section>
      <h1>Incident workspace</h1>
      <p>{run.hypotheses?.abstain ? `Abstaining: ${run.hypotheses.abstain_reason || "evidence is not sufficient"}` : `Leading hypothesis: ${run.hypotheses?.leading_mechanism}`}</p>
      <ul>{(run.hypotheses?.alternatives ?? []).map((item) => <li key={item.mechanism}>{item.mechanism} · {item.cause_family}</li>)}</ul>
      {(run.incidents ?? []).length === 0 ? <Empty text="No grouped incident was opened." /> : (
        <table><thead><tr><th>Scope</th><th>Opened</th><th>State</th></tr></thead><tbody>
          {run.incidents?.map((item) => <tr key={item.incident_id}><td>{item.scope}</td><td>{item.opened_step}</td><td>{item.state}</td></tr>)}
        </tbody></table>
      )}
    </section>
  );
}

function Checkpoints({ run }: { run: RunView | null }) {
  if (!run?.checkpoints?.length) return <Empty text="No checkpoint has been recorded." />;
  return (
    <section>
      <h1>Checkpoint explorer</h1>
      <table><thead><tr><th>Id</th><th>Progress</th><th>State</th><th>Shards</th></tr></thead><tbody>
        {run.checkpoints.map((item) => <tr key={item.checkpoint_id}><td>{item.checkpoint_id}</td><td>{item.progress}</td><td>{item.state}</td><td>{item.shards_present}/{item.shards_expected}</td></tr>)}
      </tbody></table>
      <p className="muted">An in-flight or incomplete save cannot be used for recovery.</p>
    </section>
  );
}

function Recovery({ session, run, setRun, setError }: { session: Session; run: RunView | null; setRun: (run: RunView) => void; setError: (value: string) => void }) {
  if (!run) return <Empty text="There is no recovery decision yet." />;
  const current = run;
  const pending = current.pending_action;
  async function decide(decision: "approve" | "reject") {
    if (!pending || !current.run_id) return;
    try {
      const next = await approve(session.token, current.run_id, decision, pending.precondition_hash ?? "");
      setRun({ ...next, run_id: current.run_id });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The decision was rejected");
    }
  }
  return (
    <section>
      <h1>Recovery planner</h1>
      <p>{run.narrative}</p>
      {pending ? (
        <div className="panel">
          <p>{pending.action_type} on {pending.scope}</p>
          <p>{pending.reason}</p>
          <div className="row">
            <button type="button" onClick={() => decide("approve")} disabled={session.role === "viewer" || session.role === "investigator"}>Approve</button>
            <button type="button" onClick={() => decide("reject")} disabled={session.role === "viewer" || session.role === "investigator"}>Reject</button>
          </div>
          {session.role === "viewer" || session.role === "investigator" ? <p className="muted">This role cannot approve a high-impact action.</p> : null}
        </div>
      ) : <p>No action is waiting. Automated policy decisions are labeled as automated, not as human approvals.</p>}
      <ul>{(run.actions ?? []).map((action) => <li key={`${action.action_type}-${action.step}`}>{action.action_type} · {action.state} · {action.reason}</li>)}</ul>
    </section>
  );
}

function AuditView({ session, run }: { session: Session; run: RunView | null }) {
  const [events, setEvents] = useState<{ actor: string; action: string; detail: string }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!run?.run_id) return;
    audit(session.token, run.run_id).then((payload) => setEvents(payload.events)).catch((reason: Error) => setError(reason.message));
  }, [session.token, run?.run_id]);
  if (!run?.run_id) return <Empty text="Audit entries appear after a run." />;
  return (
    <section>
      <h1>Action audit</h1>
      {error ? <p role="alert">{error}</p> : null}
      {events.length === 0 ? <Empty text="No audit events yet." /> : (
        <table><thead><tr><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>
          {events.map((event) => <tr key={`${event.action}-${event.detail}`}><td>{event.actor}</td><td>{event.action}</td><td>{event.detail}</td></tr>)}
        </tbody></table>
      )}
    </section>
  );
}

function Experiments({ run, presentation }: { run: RunView | null; presentation: boolean }) {
  if (!run?.comparison) return <Empty text="Run an automated story to compare policies on the same exogenous faults." />;
  return (
    <section>
      <h1>Experiment comparison</h1>
      <p>Counterfactual paired worlds: {run.comparison.counterfactual ? "yes" : "no"}. Exogenous faults stay aligned.</p>
      {presentation ? <p>The decision story is available in the narrative. Benchmark numbers are hidden in presentation mode.</p> : (
        <table><thead><tr><th>Policy</th><th>Useful progress</th><th>Recomputation</th><th>Interruption seconds</th></tr></thead><tbody>
          {run.comparison.branches.map((branch) => <tr key={branch.policy}><td>{branch.policy}</td><td>{branch.useful_new.toFixed(2)}</td><td>{branch.recomputation.toFixed(2)}</td><td>{branch.interruption_seconds.toFixed(1)}</td></tr>)}
        </tbody></table>
      )}
      {!presentation && run.comparison.delta_second_minus_first ? <p>Difference in useful progress (second minus first): {run.comparison.delta_second_minus_first.useful_new.toFixed(2)}. A negative value means the second policy preserved less work.</p> : null}
    </section>
  );
}

function DataView({ session }: { session: Session }) {
  const [counts, setCounts] = useState<Record<string, number | Record<string, number>> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    catalog(session.token).then((payload) => setCounts(payload.counts)).catch((reason: Error) => setError(reason.message));
  }, [session.token]);
  return (
    <section>
      <h1>Data explorer</h1>
      {error ? <p role="alert">{error}</p> : null}
      {!counts ? <p role="status">Loading catalog…</p> : (
        <div className="panel">
          <p>Unique concepts {String(counts.unique_concepts)}. Aliases {String(counts.aliases)}. Window aggregations {String(counts.window_aggregations)}.</p>
          <p className="muted">Window aggregations are not additional independent measurements. Unsupported metrics stay null.</p>
        </div>
      )}
    </section>
  );
}

function Models({ session, presentation }: { session: Session; presentation: boolean }) {
  const [report, setReport] = useState<ModelReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    models(session.token).then(setReport).catch((reason: Error) => setError(reason.message));
  }, [session.token]);
  if (error) return <p role="alert">{error}</p>;
  if (!report) return <p role="status">Loading model registry…</p>;
  return (
    <section>
      <h1>Model and evaluation registry</h1>
      <p>Operational default: {report.operational_default.replaceAll("_", " ")}.</p>
      <p>The evaluator-only oracle is {report.oracle.available_to_operators ? "exposed" : "not an operator path"}.</p>
      {presentation || !report.trained_report ? <p>{report.trained_report?.note ?? "No trained report has been written yet."}</p> : (
        <div className="panel">
          <p>Held-out average precision, model {report.trained_report.model_average_precision.toFixed(3)}, residual baseline {report.trained_report.baseline_average_precision.toFixed(3)}.</p>
          <p>Beats baseline: {report.trained_report.beats_baseline ? "yes" : "no"}.</p>
          <p className="muted">{report.trained_report.note}</p>
        </div>
      )}
    </section>
  );
}

function MonitoringView({ session }: { session: Session }) {
  const [data, setData] = useState<Monitoring | null>(null);
  const [hardware, setHardware] = useState<Adapter[]>([]);
  const [truthNote, setTruthNote] = useState("");
  useEffect(() => {
    monitoring(session.token).then(setData).catch(() => setData(null));
    adapters().then((payload) => setHardware(payload.adapters)).catch(() => setHardware([]));
  }, [session.token]);
  return (
    <section>
      <h1>Monitoring health</h1>
      {!data ? <p role="status">Loading collector status…</p> : data.collectors.map((collector) => (
        <article className="panel" key={collector.id}>
          <p>{collector.id}. Lag {collector.lag_steps}. Queue {collector.queue_depth}. Dropped {collector.dropped_count}. {collector.degraded ? "Degraded" : "Not degraded"}.</p>
          <p className="muted">{data.note}</p>
        </article>
      ))}
      <h2>Adapters</h2>
      <ul>{hardware.map((item) => <li key={item.name}>{item.name}: {item.connected ? "connected" : "unavailable"}{item.reason ? `. ${item.reason}` : ""}</li>)}</ul>
      {session.role === "administrator" ? <TruthButton token={session.token} onResult={setTruthNote} /> : <p className="muted">Latent truth stays on the administrator evaluator path.</p>}
      {truthNote ? <p>{truthNote}</p> : null}
    </section>
  );
}

function TruthButton({ token, onResult }: { token: string; onResult: (value: string) => void }) {
  const [runId, setRunId] = useState("");
  return (
    <form className="panel" onSubmit={async (event) => {
      event.preventDefault();
      try {
        const payload = await truth(token, runId);
        onResult(`${payload.label}. Fault records: ${payload.evaluator.faults?.length ?? 0}.`);
      } catch {
        onResult("The evaluator view was refused or the run id was not found.");
      }
    }}>
      <label>Evaluator run id <input value={runId} onChange={(event) => setRunId(event.target.value)} /></label>
      <button type="submit">Open evaluator truth</button>
    </form>
  );
}
