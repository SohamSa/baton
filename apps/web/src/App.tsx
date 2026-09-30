import { FormEvent, useEffect, useRef, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Adapter,
  CatalogAtlas,
  LiveFrame,
  ModelReport,
  Monitoring,
  RunView,
  StoryItem,
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
import { startEngine, subscribeEngine } from "./browserEngine";
import { AnomalyView } from "./AnomalyView";
import { BoardView } from "./BoardView";
import { Desk } from "./Desk";
import { ExecutivePortfolioView } from "./ExecutivePortfolioView";
import { FootprintView } from "./FootprintView";
import { LineageView } from "./LineageView";
import { MCMView } from "./MCMView";
import { PassportView } from "./PassportView";
import { RackView } from "./RackView";
import { SiliconView } from "./SiliconView";
import { YieldView } from "./YieldView";

type Session = { token: string; role: string; username: string };

const DEEP_DIVES = [
  {
    category: "Silicon & Batches",
    links: [
      ["/silicon", "Processor Health"],
      ["/lineage", "Manufacturing Batches"],
      ["/yield", "Factory Quality & Bins"],
      ["/mcm", "Multi-Chip Assembly"],
    ],
  },
  {
    category: "Hardware & Racks",
    links: [
      ["/boards", "Baseboard Power"],
      ["/racks", "Rack Plumbing & Power"],
      ["/footprint", "Electric Bill & Grid"],
    ],
  },
  {
    category: "Intelligence & Provenance",
    links: [
      ["/passport", "Digital Chip Passport"],
      ["/anomalies", "AI Early Warning"],
      ["/models", "AI Helper Models"],
    ],
  },
  {
    category: "Operations & Telemetry",
    links: [
      ["/dependencies", "Choir Ranks & Teamwork"],
      ["/devices", "Sensor Telemetry"],
      ["/incidents", "Downtime Incidents"],
      ["/checkpoints", "Saved Progress"],
      ["/recovery", "Operator Decisions"],
      ["/audit", "Compliance Audit Trail"],
      ["/experiments", "Strategy Comparison"],
      ["/data", "Telemetry Dictionary"],
      ["/monitoring", "Sensor Health"],
    ],
  },
] as const;

const PUBLIC_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true";

export function App() {
  const [session, setSession] = useState<Session | null>(
    PUBLIC_DEMO ? { token: "public", role: "approver", username: "public visitor" } : null,
  );
  const [theme, setTheme] = useState("dark");
  const [run, setRun] = useState<RunView | null>(null);
  const [frames, setFrames] = useState<LiveFrame[]>([]);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [engineMessage, setEngineMessage] = useState("");
  const opened = useRef(false);

  async function play(id: string, mode: "manual" | "automated") {
    setPlaying(true);
    setError("");
    setFrames([]);
    try {
      const started = await startStory(session?.token ?? "public", id, mode, (frame) => {
        setFrames((current) => [...current, frame]);
      });
      let view = await getRun(session?.token ?? "public", started.run_id, false);
      for (let attempt = 0; view.status === "queued" && attempt < 40; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        view = await getRun(session?.token ?? "public", started.run_id, false);
      }
      setRun({ ...view, run_id: started.run_id });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Run failed");
    } finally {
      setPlaying(false);
    }
  }

  async function decide(decision: "approve" | "reject") {
    if (!session || !run?.pending_action || !run.run_id) return;
    setPlaying(true);
    setError("");
    setFrames([]);
    try {
      const next = await approve(session.token, run.run_id, decision, run.pending_action.precondition_hash ?? "", (frame) => {
        setFrames((current) => [...current, frame]);
      });
      setRun({ ...next, run_id: run.run_id });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The decision was rejected");
    } finally {
      setPlaying(false);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!PUBLIC_DEMO) return;
    let cancel = false;
    const stop = subscribeEngine(setEngineMessage);
    startEngine()
      .then(() => {
        if (cancel || opened.current) return;
        opened.current = true;
        void play("gradual_warning", "manual");
      })
      .catch((reason: Error) => {
        if (!cancel) setError(reason.message);
      });
    return () => {
      cancel = true;
      stop();
    };
  }, []);

  if (!session) {
    return <Login onSuccess={setSession} />;
  }

  const [showTour, setShowTour] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDeepDive = DEEP_DIVES.some((group) => group.links.some(([path]) => location.pathname === path));

  return (
    <div className="shell">
      <a className="skip" href="#content">Skip to content</a>
      <nav aria-label="Primary">
        <strong>TrainingContinuity</strong>
        <p className="muted">{session.username} · {session.role}</p>
        <button type="button" className="tour-nav-btn" onClick={() => setShowTour(true)}>
          ✦ 2-Min Executive Tour
        </button>

        <div className="nav-section-title">Executive Suite</div>
        <NavLink to="/" end>🌟 Executive Portfolio</NavLink>
        <NavLink to="/desk">⚡ Live Practice Floor</NavLink>
        <NavLink to="/stories">💡 Executive Q&A (17)</NavLink>

        <details className="nav-deep-dives" open={isDeepDive}>
          <summary>System Diagnostics & Deep Dives (18) ▾</summary>
          <div className="nav-deep-dives-list">
            {DEEP_DIVES.map((group) => (
              <div key={group.category}>
                <div className="nav-section-title">{group.category}</div>
                {group.links.map(([path, label]) => (
                  <NavLink key={path} to={path}>
                    {label}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </details>

        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <button type="button" onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </button>
          {PUBLIC_DEMO ? null : <button type="button" onClick={() => { setSession(null); setRun(null); }}>Sign out</button>}
        </div>
      </nav>
      <main id="content">
        <div className="view-mode-bar">
          <NavLink to="/" end className={({ isActive }) => `view-mode-btn ${isActive ? "active" : ""}`}>
            🌟 Executive Portfolio & Q&A
          </NavLink>
          <NavLink to="/desk" className={({ isActive }) => `view-mode-btn ${isActive ? "active" : ""}`}>
            ⚡ Live Practice Floor (32k Cluster)
          </NavLink>
          <NavLink to="/stories" className={({ isActive }) => `view-mode-btn ${isActive ? "active" : ""}`}>
            💡 Incident Rehearsals (17)
          </NavLink>
        </div>

        {location.pathname !== "/" ? (
          <div className="tour-banner">
            <div>
              <strong>New to Datacenter Operations?</strong>
              <p>See how 1 failing chip stalls a $150M cluster, and how continuity engineering saves millions.</p>
            </div>
            <button type="button" className="tour-action-btn" onClick={() => setShowTour(true)}>
              ✦ Take the 2-Minute Executive Tour
            </button>
          </div>
        ) : null}

        {PUBLIC_DEMO && engineMessage ? <p role="status">{engineMessage}</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {playing ? <p role="status">The decision engine is stepping this story.</p> : null}

        <Routes>
          <Route
            path="/"
            element={
              <ExecutivePortfolioView
                run={run}
                frames={frames}
                playing={playing}
                onPlayRehearsal={(storyId) => {
                  void play(storyId, "manual");
                  navigate("/desk");
                }}
                onOpenPracticeFloor={() => navigate("/desk")}
                onOpenTour={() => setShowTour(true)}
              />
            }
          />
          <Route path="/desk" element={<Desk token={session.token} run={run} frames={frames} playing={playing} onPlay={play} onDecide={decide} />} />
          <Route path="/stories" element={<Stories session={session} play={play} setError={setError} />} />
          <Route path="/silicon" element={<SiliconView run={run} />} />
          <Route path="/lineage" element={<LineageView run={run} />} />
          <Route path="/yield" element={<YieldView run={run} />} />
          <Route path="/mcm" element={<MCMView run={run} />} />
          <Route path="/boards" element={<BoardView run={run} />} />
          <Route path="/racks" element={<RackView run={run} />} />
          <Route path="/passport" element={<PassportView run={run} />} />
          <Route path="/anomalies" element={<AnomalyView run={run} />} />
          <Route path="/footprint" element={<FootprintView run={run} />} />
          <Route path="/dependencies" element={<Dependencies run={run} />} />
          <Route path="/devices" element={<Devices run={run} />} />
          <Route path="/incidents" element={<Incidents run={run} />} />
          <Route path="/checkpoints" element={<Checkpoints run={run} />} />
          <Route path="/recovery" element={<Recovery session={session} run={run} onDecide={decide} />} />
          <Route path="/audit" element={<AuditView session={session} run={run} />} />
          <Route path="/experiments" element={<Experiments run={run} />} />
          <Route path="/data" element={<DataView session={session} />} />
          <Route path="/models" element={<Models session={session} />} />
          <Route path="/monitoring" element={<MonitoringView session={session} />} />
        </Routes>

        {showTour ? (
          <ExecutiveTourModal
            onClose={() => setShowTour(false)}
            onRunDemo={() => {
              setShowTour(false);
              void play("gradual_warning", "manual");
              navigate("/desk");
            }}
          />
        ) : null}
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
      <p className="banner">Research workspace for hardware disruption inside a large GPU pre-training cluster.</p>
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

function Stories({ session, play, setError }: { session: Session; play: (id: string, mode: "manual" | "automated") => Promise<void>; setError: (value: string) => void }) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const navigate = useNavigate();
  useEffect(() => {
    stories(session.token).then((payload) => setItems(payload.stories)).catch((reason: Error) => setError(reason.message));
  }, [session.token, setError]);
  async function run(id: string) {
    setError("");
    try {
      await play(id, mode);
      navigate("/desk");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Run failed");
    }
  }
  return (
    <section>
      <h1>The seventeen rehearsals</h1>
      <p>Each card is one realistic situation a datacenter business owner encounters:
        a slow heat buildup, a sudden stop, a shared power feed, a healthy busy spell, a corrupted save, a job that must restart as a choir, late sensor readings, a shutdown rule that does more harm than the breakdown, a tired runner chip dragging down the entire hall, the hospital discharge trap where a repaired machine crashes again immediately, the substation power grid shockwave where thousands of chips booting together trip facility breakers, the microscopic cracked solder wire where automated testing switches to a built-in backup spare wire in 45 seconds, the bad factory baking batch recall where silicon birth certificates trace sister chips and safely rotate them out during normal save breaks, the healthy car engine on a faulty circuit board where power diagnostics prevent mistakenly scrapping a good $30,000 processor, the pinched high-rise cooling pipe where rack elevation monitoring detects valve blockages before 32 chips overheat together, the over-tightened cooling clamp screws where digital passport history finds sister machines assembled on the same faulty factory bench, or the subtle electrical pressure drop where smart AI catches voltage sags before silent math calculation errors corrupt training.
        Pick one rehearsal and the overview plays it step by step. “You approve” pauses for your yes or no. “Compare two ways” runs two reactions on the same breakdown and shows which one kept more work.
      </p>
      <label>How to play it <select value={mode} onChange={(event) => setMode(event.target.value as "manual" | "automated")}><option value="manual">You approve the serious action</option><option value="automated">Compare two ways on the same breakdown</option></select></label>
      <div className="grid">
        {items.map((item) => (
          <article className="card story-rehearsal-card" key={item.id}>
            <div className="story-card-top">
              <h2>{item.title}</h2>
              {item.failure_level ? (
                <span className="story-failure-badge">
                  {item.failure_level.tier}
                </span>
              ) : null}
            </div>
            <p>{item.summary}</p>
            {item.failure_level ? (
              <div className="story-failure-details">
                <div className="story-detail-row">
                  <span className="detail-tag">Fault Component:</span>
                  <span>{item.failure_level.component}</span>
                </div>
                <div className="story-detail-row">
                  <span className="detail-tag">Blast Radius:</span>
                  <span>{item.failure_level.blast_radius}</span>
                </div>
                <div className="story-detail-row">
                  <span className="detail-tag">Redundancy Defense:</span>
                  <span>{item.failure_level.redundancy_strategy}</span>
                </div>
              </div>
            ) : null}
            <button type="button" onClick={() => run(item.id)}>Play this rehearsal</button>
          </article>
        ))}
      </div>
      {items.length === 0 ? <Empty text="The decision engine is preparing the story list." /> : null}
    </section>
  );
}

function Dependencies({ run }: { run: RunView | null }) {
  if (!run?.jobs) return <Empty text="Play a rehearsal on the overview first. This page then shows which chips are in the job together." />;
  return (
    <section>
      <h1>Who has to move together</h1>
      <p>A job like this is a choir. These are the singers in the current song. The rest of the hall is still there, counted, and left off this list because they are not in this song.</p>
      {Object.entries(run.jobs).map(([jobId, job]) => (
        <article className="panel" key={jobId}>
          <h2>{jobId}</h2>
          <p>How this job is allowed to restart: {job.capability.replaceAll("_", " ")}. Right now it is {job.state}.</p>
          <ul>{job.rank_gpu.map((gpu, rank) => <li key={gpu}>Seat {rank} is chip {gpu}{job.dropped?.includes(rank) ? " (taken out of the active group)" : ""}</li>)}</ul>
          <p>Open problem areas: {(run.incidents ?? []).map((item) => item.scope).join(", ") || "none"}</p>
        </article>
      ))}
    </section>
  );
}

function Devices({ run }: { run: RunView | null }) {
  const [selected, setSelected] = useState("");
  if (!run?.gpus) return <Empty text="Play a rehearsal first. This page then shows the chips that have their own temperature and power history." />;
  const ids = Object.keys(run.gpus);
  const current = selected || ids[0];
  const gpu = run.gpus[current];
  const series = (run.timeline ?? []).filter((point) => point.entity_id === current).slice(-12);
  const max = Math.max(...series.map((point) => point.gpu_temp_c ?? 0), 1);
  return (
    <section>
      <h1>The chips with their own chart</h1>
      <p>Only the chips in the job get a personal chart, the way a coach films the players on the field and counts the rest of the stadium. Pick one chip. The bars are its recent temperature in this rehearsal.</p>
      <label>Accelerator <select value={current} onChange={(event) => setSelected(event.target.value)}>{ids.map((id) => <option key={id}>{id}</option>)}</select></label>
      <div className="panel">
        <p>Chip family {gpu.family}. Stretch of work: {gpu.phase}. Fan speed {gpu.fan_speed_ratio === null ? "is not available in this rehearsal, so it stays blank" : "is being reported"}. The cause named on the other pages comes from readings like these. The scripted answer key stays off this page.</p>
        <p>Latest reported temperature {gpu.gpu_temp_c?.toFixed(1) ?? "unavailable"}°C. How far that sits from the chip’s normal pattern: {gpu.residual_ewma?.toFixed(2) ?? "unavailable"}.</p>
        <div className="bars" aria-label="Recent reported temperature">
          {series.map((point) => <div key={point.step} className="bar" style={{ width: `${((point.gpu_temp_c ?? 0) / max) * 100}%` }} title={`step ${point.step}`} />)}
        </div>
      </div>
    </section>
  );
}

function Incidents({ run }: { run: RunView | null }) {
  if (!run) return <Empty text="Play a rehearsal first. This page then shows the problem the page grouped together, and its best reading of the cause." />;
  return (
    <section>
      <h1>What went wrong, in one pile</h1>
      <p>Several alarms that share a cause belong in one pile, the way several dark rooms on one tripped breaker are one electrical problem. If the readings are too thin or too late, the page says it does not know, instead of inventing a cause.</p>
      <p>{run.hypotheses?.abstain ? `Not guessing: ${run.hypotheses.abstain_reason || "the readings are not enough"}` : `Best reading of the cause: ${(run.hypotheses?.leading_mechanism ?? "unknown").replaceAll("_", " ")}`}</p>
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
  if (!run?.checkpoints?.length) return <Empty text="Play a rehearsal first. Saves appear here once the job writes one." />;
  return (
    <section>
      <h1>The saves you could reopen</h1>
      <p>A save is a snapshot of the job, like saving a document. “Verified usable” means every piece arrived and the save can be reopened. A save still being written, or a save missing pieces, cannot be used to restart.</p>
      <table><thead><tr><th>Id</th><th>Progress</th><th>State</th><th>Shards</th></tr></thead><tbody>
        {run.checkpoints.map((item) => <tr key={item.checkpoint_id}><td>{item.checkpoint_id}</td><td>{item.progress}</td><td>{item.state}</td><td>{item.shards_present}/{item.shards_expected}</td></tr>)}
      </tbody></table>
      <p className="muted">Shards are the pieces of the save. If the pieces present are fewer than the pieces expected, the save is incomplete.</p>
    </section>
  );
}

function Recovery({ session, run, onDecide }: { session: Session; run: RunView | null; onDecide: (decision: "approve" | "reject") => void }) {
  if (!run) return <Empty text="Play a rehearsal first. If the story needs a person to approve a serious action, the question appears here and on the overview." />;
  const pending = run.pending_action;
  return (
    <section>
      <h1>The decision waiting for a person</h1>
      <p>Serious moves, such as saving early or restarting the job, wait for a yes or a no. Approving continues the rehearsal from that moment. Rejecting records that the move was not taken. Neither button touches a machine in a real building.</p>
      <p>{run.narrative}</p>
      {pending ? (
        <div className="panel">
          <p>{pending.action_type} on {pending.scope}</p>
          <p>{pending.reason}</p>
          <div className="row">
            <button type="button" onClick={() => onDecide("approve")} disabled={session.role === "viewer" || session.role === "investigator"}>Approve</button>
            <button type="button" onClick={() => onDecide("reject")} disabled={session.role === "viewer" || session.role === "investigator"}>Reject</button>
          </div>
          {session.role === "viewer" || session.role === "investigator" ? <p className="muted">This role cannot approve a high-impact action.</p> : null}
        </div>
      ) : <p>Nothing is waiting. When the rehearsal decides by itself, that decision is labeled automatic. It is not recorded as a person’s approval.</p>}
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
  if (!run?.run_id) return <Empty text="The log appears after you play a rehearsal." />;
  return (
    <section>
      <h1>Who decided what</h1>
      <p>This is the paper trail for the rehearsal: the story that was played, and each time a person approved or rejected a serious move.</p>
      {error ? <p role="alert">{error}</p> : null}
      {events.length === 0 ? <Empty text="No audit events yet." /> : (
        <table><thead><tr><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>
          {events.map((event) => <tr key={`${event.action}-${event.detail}`}><td>{event.actor}</td><td>{event.action}</td><td>{event.detail}</td></tr>)}
        </tbody></table>
      )}
    </section>
  );
}

function Experiments({ run }: { run: RunView | null }) {
  if (!run?.comparison) return <Empty text="On the overview, choose “Compare two ways” and play a rehearsal. This page then shows the two reactions side by side on the same breakdown." />;
  return (
    <section>
      <h1>Two ways of handling the same breakdown</h1>
      <p>Both columns face the same scripted problem, the way two managers are given the same incident report. The one that keeps more finished work is the better reaction for this rehearsal. The numbers are from the practice floor.</p>
      <table><thead><tr><th>Way of reacting</th><th>Finished work</th><th>Work repeated</th><th>Seconds the job was stopped</th></tr></thead><tbody>
        {run.comparison.branches.map((branch) => <tr key={branch.policy}><td>{branch.policy}</td><td>{branch.useful_new.toFixed(2)}</td><td>{branch.recomputation.toFixed(2)}</td><td>{branch.interruption_seconds.toFixed(1)}</td></tr>)}
      </tbody></table>
      {run.comparison.delta_second_minus_first ? <p>Finished-work difference, second way minus first: {run.comparison.delta_second_minus_first.useful_new.toFixed(2)}. A negative number means the second way kept less of the job.</p> : null}
    </section>
  );
}

function DataView({ session }: { session: Session }) {
  const [atlas, setAtlas] = useState<CatalogAtlas | null>(null);
  const [counts, setCounts] = useState<Record<string, number | Record<string, number>> | null>(null);
  const [shown, setShown] = useState<number | "all">("all");
  const [error, setError] = useState("");
  useEffect(() => {
    catalog(session.token)
      .then((payload) => {
        setCounts(payload.counts);
        setAtlas(payload.atlas);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [session.token]);
  const tables = atlas ? (shown === "all" ? atlas.tables : atlas.tables.slice(0, shown)) : [];
  return (
    <section>
      <h1>The data catalog</h1>
      <p>This is the filing cabinet. Each drawer is a table. A row is one fact. A shared tag, usually a chip name or a job name plus the step, is how a temperature is laid next to the job it belongs to.</p>
      {error ? <p role="alert">{error}</p> : null}
      {!atlas || !counts ? <p role="status">Loading the catalog…</p> : (
        <>
          <p>{atlas.mapping}</p>
          <p>Unique concepts {String(counts.unique_concepts)}. Second names for the same reading {String(counts.aliases)}. Window totals {String(counts.window_aggregations)}. Drawers {atlas.table_count}. Columns across every drawer {atlas.column_count}.</p>
          <h2>The only columns that change a reaction</h2>
          <p>{atlas.decision_plain}</p>
          <table>
            <thead>
              <tr><th>Column</th><th>Drawer</th><th>What it is</th><th>What changes if it is included</th></tr>
            </thead>
            <tbody>
              {atlas.decision_columns.map((column) => (
                <tr key={`${column.source}.${column.name}`}>
                  <td><code>{column.name}</code></td>
                  <td>{column.source}</td>
                  <td>{column.purpose}</td>
                  <td>{column.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Every drawer</h2>
          <p>Choose how many drawers to open. All of them are defined. The ones past the choice are still in the cabinet.</p>
          <div className="catalog-tools">
            {[10, 20, 30, "all"].map((choice) => (
              <button key={String(choice)} type="button" aria-pressed={shown === choice} onClick={() => setShown(choice as number | "all")}>
                {choice === "all" ? `All ${atlas.table_count}` : String(choice)}
              </button>
            ))}
          </div>
          {tables.map((table) => (
            <details key={table.id} className="panel drawer">
              <summary>{table.title} · {table.column_count} columns</summary>
              <p>{table.plain}</p>
              <p>In a real hall this drawer would be filled by: {table.real_world}</p>
              <p>Rows are tied to the rest of the cabinet by: {table.joins_on}.</p>
              <table>
                <thead>
                  <tr><th>Column</th><th>What it is</th><th>What changes if it is included</th></tr>
                </thead>
                <tbody>
                  {table.columns.map((column) => (
                    <tr key={`${table.id}.${column.name}`}>
                      <td><code>{column.name}</code>{column.in_final ? " · in the short list" : ""}</td>
                      <td>{column.brief}</td>
                      <td>{column.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          ))}
        </>
      )}
    </section>
  );
}

function Models({ session }: { session: Session }) {
  const [report, setReport] = useState<ModelReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    models(session.token).then(setReport).catch((reason: Error) => setError(reason.message));
  }, [session.token]);
  if (error) return <p role="alert">{error}</p>;
  return (
    <section>
      <h1>Did a learned helper beat the simple rule?</h1>
      <p>A learned helper was trained on rehearsals and then scored on rehearsals it had not seen, the way a new hire is tested on cases they did not study. If it does not beat the simple rule, the simple rule stays in charge. The answer key that knows the scripted cause is kept off this page.</p>
      {!report ? <p role="status">Scoring the helper in this browser. The first visit loads the math libraries, so this can take a minute.</p> : (
        <>
          <p>The rule in charge: {report.operational_default.replaceAll("_", " ")}.</p>
          <p>The answer key is {report.oracle.available_to_operators ? "visible here" : "kept off the operator pages"}.</p>
          {!report.trained_report ? <p>No trained report has been written yet.</p> : (
            <div className="panel">
              <p>On the cases it had not seen, the learned helper scored {report.trained_report.model_average_precision.toFixed(3)}. The simple heat-pattern rule scored {report.trained_report.baseline_average_precision.toFixed(3)}. Higher is a better ranking of the risky moments.</p>
              <p>Beats the simple rule: {report.trained_report.beats_baseline ? "yes" : "no"}.</p>
              <p className="muted">{report.trained_report.note}</p>
            </div>
          )}
        </>
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
      <h1>Are the sensors keeping up?</h1>
      <p>A decision is only as fresh as the readings behind it. This page says whether those readings are late, dropped, or waiting in a queue. The plugs for real chips, networks, and building systems are listed below and stay unplugged. This rehearsal does not reset a machine.</p>
      {!data ? <p role="status">Loading collector status…</p> : data.collectors.map((collector) => (
        <article className="panel" key={collector.id}>
          <p>{collector.id}. Lag {collector.lag_steps}. Queue {collector.queue_depth}. Dropped {collector.dropped_count}. {collector.degraded ? "Degraded" : "Not degraded"}.</p>
          <p className="muted">{data.note}</p>
        </article>
      ))}
      <h2>Plugs for real buildings</h2>
      <ul>{hardware.map((item) => <li key={item.name}>{item.name}: {item.connected ? "connected" : "unavailable"}{item.reason ? `. ${item.reason}` : ""}</li>)}</ul>
      {session.role === "administrator" ? <TruthButton token={session.token} onResult={setTruthNote} /> : <p className="muted">The scripted cause, the answer key of the rehearsal, stays with an administrator. It is not on this public page.</p>}
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

function ExecutiveTourModal({ onClose, onRunDemo }: { onClose: () => void; onRunDemo: () => void }) {
  const [step, setStep] = useState(0);

  const SLIDES = [
    {
      badge: "THE $150M RELAY RACE",
      title: "When 1 Chip Stops, 32,768 Accelerators Wait",
      body: "Imagine Google pre-training Gemini across 32,768 accelerators. Because modern AI training is synchronous, all chips advance in lockstep like runners in a relay race. If just one runner stops or overheats, the baton cannot move. The entire building freezes while power, cooling, and staff costs continue to burn.",
      metric: "At $3.50/GPU-hr, a 1-hour cluster stall burns $114,688 with zero progress.",
    },
    {
      badge: "THE THREE SILENT LEAKS",
      title: "Why Traditional Runbooks Lose Millions",
      body: "Datacenter owners bleed money through 3 distinct operational leaks: 1. The Stall (idle time spent diagnosing a crashed node). 2. Unsaved Work (recomputing hours of progress lost between checkpoints). 3. The False Alarm (killing healthy machines during normal high-utilization compute rushes).",
      metric: "Using the wrong remedy on the wrong leak is how careful operators lose the race anyway.",
    },
    {
      badge: "PROACTIVE CONTINUITY",
      title: "Catching the Wave Before the Crash",
      body: "Standard data centers wait for a chip to die, crashing the job. TrainingContinuity tracks the thermal slope (dT/dt) early. It detects the climb, triggers a lightweight micro-checkpoint right before failure, and performs a fast-path coordinated restart.",
      metric: "Preserves up to 90% of in-flight work and slashes downtime from 40 mins to 2 mins.",
    },
    {
      badge: "MEASURABLE BOTTOM-LINE ROI",
      title: "Cold Hard Dollars, Not Academic Jargon",
      body: "We don't manufacture fake savings claims. Use our 1-Click Industry Benchmark Profiles (Hyperscale Frontier, Enterprise, or AI Startup) to see the exact return on investment for your cluster based on useful progress preserved.",
      metric: "See live cost accrual, stall waste, and net preserved savings on the practice floor.",
    },
  ];

  const current = SLIDES[step];

  return (
    <div className="tour-modal-backdrop" role="dialog" aria-modal="true">
      <div className="tour-modal">
        <div className="tour-modal-header">
          <span className="tour-badge">{current.badge}</span>
          <button type="button" className="tour-close-btn" onClick={onClose} aria-label="Close tour">✕</button>
        </div>
        <h2>{current.title}</h2>
        <p className="tour-body">{current.body}</p>
        <div className="tour-metric-box">
          <strong>Key Datacenter Fact:</strong>
          <p>{current.metric}</p>
        </div>
        <div className="tour-modal-footer">
          <div className="tour-dots">
            {SLIDES.map((_, i) => (
              <span key={i} className={`tour-dot ${i === step ? "dot-active" : ""}`} onClick={() => setStep(i)} />
            ))}
          </div>
          <div className="tour-actions">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)}>Previous</button>
            ) : null}
            {step < SLIDES.length - 1 ? (
              <button type="button" className="tour-primary-btn" onClick={() => setStep((s) => s + 1)}>Next Step ➔</button>
            ) : (
              <button type="button" className="tour-primary-btn" onClick={onRunDemo}>Run Live Rehearsal Now 🚀</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
