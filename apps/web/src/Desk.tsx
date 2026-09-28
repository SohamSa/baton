import { FormEvent, useEffect, useState } from "react";
import { EconomicsEstimate, LiveFrame, RunView, estimateEconomics, stories } from "./api";

type StoryItem = { id: string; title: string; summary: string };

const REASONS: Record<string, string> = {
  currency_disabled_until_complete_accounting_configuration: "Currency stays off until the accounting configuration is complete.",
  incomplete_accounting_configuration: "Some accounting fields are still empty, so return on investment stays undefined.",
  roi_undefined_when_investment_cost_is_zero: "Return on investment is undefined when the investment is zero. It is not treated as infinite.",
  incompatible_benefit_and_cost_basis: "The benefit basis does not match this estimate.",
  missing_useful_delta_gpu_hours: "The useful-work delta is not available yet.",
  computed_from_user_supplied_assumptions: "Computed from the rates you entered and the useful-work difference of this simulation.",
};

export function Desk({
  token,
  run,
  frames,
  playing,
  presentation,
  onPlay,
  onDecide,
}: {
  token: string;
  run: RunView | null;
  frames: LiveFrame[];
  playing: boolean;
  presentation: boolean;
  onPlay: (id: string, mode: "manual" | "automated") => void;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  const [items, setItems] = useState<StoryItem[]>([]);
  const [mode, setMode] = useState<"manual" | "automated">("manual");
  const [selected, setSelected] = useState("gradual_warning");
  const live = frames[frames.length - 1];
  const cluster = live?.cluster ?? run?.cluster;
  const placed = (live?.accelerators ?? []).filter((item) => !item.spare);
  const maxUseful = Math.max(...frames.map((frame) => frame.useful_new), 1);

  useEffect(() => {
    stories(token).then((payload) => setItems(payload.stories)).catch(() => setItems([]));
  }, [token]);

  return (
    <section className="desk">
      <p className="eyebrow">A rehearsal for a data-center owner</p>
      <h1>When one machine stops, the whole job waits.</h1>
      <p className="lede">
        Think of a relay race where the baton cannot move until every runner finishes the same leg. The runners here are accelerator chips, the special processors that do the heavy math inside a data center. If one runner stops, the race stops, even while the rest of the building is still powered and cooled.
        This page rehearses that moment in a simulated hall of {cluster ? cluster.accelerator_count.toLocaleString() : "tens of thousands of"} chips. It is a practice floor. It is not connected to a building you own.
      </p>

      <div className="problems">
        <article>
          <h2>The stall</h2>
          <p>One chip in the job stops, and the job stops with it. The other machines are still on. They are not producing the next piece of work. You are paying for a building that is waiting.</p>
        </article>
        <article>
          <h2>The unsaved work</h2>
          <p>Work that lives only in the machine’s memory is like a document you never saved. A half-finished save cannot be reopened. The only progress you can defend is the last complete save, and the gap since that save is what you stand to lose.</p>
        </article>
        <article>
          <h2>The false alarm</h2>
          <p>A busy spell makes chips warmer, the way a kitchen heats up during the dinner rush. A rule that shuts a machine down just because it is warm can throw away more work than the breakdown it was meant to prevent.</p>
        </article>
      </div>

      <div className="panel controls">
        <div className="row">
          <label>
            Story
            <select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={playing || items.length === 0}>
              {items.length === 0 ? <option value="gradual_warning">Loading stories from the engine…</option> : null}
              {items.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </label>
          <label>
            How the decision is taken
            <select value={mode} onChange={(event) => setMode(event.target.value as "manual" | "automated")}>
              <option value="manual">You approve the serious action</option>
              <option value="automated">Compare two ways on the same breakdown</option>
            </select>
          </label>
          <button type="button" onClick={() => onPlay(selected, mode)} disabled={playing}>
            {playing ? "The hall is moving" : "Run this story live"}
          </button>
        </div>
        <p className="muted">{items.find((item) => item.id === selected)?.summary ?? "The opening rehearsal is a chip that runs hotter and hotter before it stops, like an engine gauge climbing. The run will pause and ask you whether to save the work."}</p>
      </div>

      <div className="hall-wrap">
        <div className="hall-head">
          <h2>Chips in this job</h2>
          <p>
            {live ? `Step ${live.step + 1} of ${live.steps}. The job is ${live.job_state}. ${live.abstain ? "The readings are not enough to name a cause." : `Best reading: ${live.hypothesis.replaceAll("_", " ")}.`}` : "The opening rehearsal is about to start. The chips update as each step is computed."}
          </p>
        </div>
        <div className="floor" role="img" aria-label="Placed accelerators in the simulated job">
          {placed.length === 0 ? <p className="muted">Waiting for the first step.</p> : placed.map((gpu) => (
            <div key={gpu.id} className={`cell ${tone(gpu)}`} title={cellTitle(gpu, presentation)}>
              <span>{gpu.id.split("-").slice(-1)[0]}</span>
              <strong>{presentation || gpu.temp === null ? "·" : `${gpu.temp.toFixed(0)}°`}</strong>
            </div>
          ))}
        </div>
        <div className="quiescent">
          <span />
          <p>
            {cluster
              ? `${cluster.quiescent_accelerator_count.toLocaleString()} other chips in the same hall — ${cluster.rack_count.toLocaleString()} racks, ${cluster.host_count.toLocaleString()} machines, ${cluster.fabric_domain_count} network neighborhoods. Counted, the way a warehouse counts boxes on the back shelves. They are not drawn one by one, and this page is not plugged into them.`
              : "The rest of the hall is counted, the way a warehouse counts boxes on the back shelves. This page is not plugged into those machines."}
          </p>
        </div>
        <div className="spark" aria-label="Useful progress across the steps computed so far">
          {frames.slice(-48).map((frame, index) => (
            <i key={`${frame.step}-${index}`} style={{ height: `${Math.max(8, (frame.useful_new / maxUseful) * 100)}%` }} title={`Step ${frame.step + 1}: useful ${frame.useful_new.toFixed(2)}`} />
          ))}
        </div>
        <p className="muted">The bars are finished work in this practice job. They are a rehearsal score, not a reading from a building you operate, and they are not money saved.</p>
      </div>

      <div className="grid">
        <article className="card">
          <h2>What the job is doing</h2>
          <p>{live?.job_state ?? Object.values(run?.jobs ?? {})[0]?.state ?? "Waiting to start"}</p>
          {!presentation && live ? <p className="muted">Useful new progress {live.useful_new.toFixed(2)} steps. Recomputation {live.recomputation.toFixed(2)}.</p> : null}
        </article>
        <article className="card">
          <h2>Last verified save</h2>
          <p>{checkpointLine(live, run)}</p>
        </article>
        <article className="card">
          <h2>Decision</h2>
          <p>{run?.pending_action ? "A person has to answer before the action is applied." : run?.status ?? (playing ? "Stepping" : "Not started")}</p>
          {run?.narrative ? <p className="muted">{run.narrative}</p> : null}
        </article>
      </div>

      {run?.pending_action && !playing ? (
        <div className="panel decision">
          <h2>This action is waiting for you</h2>
          <p>{run.pending_action.action_type?.replaceAll("_", " ")} · {run.pending_action.scope}</p>
          <p>{run.pending_action.reason}</p>
          <div className="row">
            <button type="button" onClick={() => onDecide("approve")} disabled={playing}>Approve and continue the run</button>
            <button type="button" onClick={() => onDecide("reject")} disabled={playing}>Reject and continue the run</button>
          </div>
          <p className="muted">Approve, and the rehearsal continues from this moment. Reject, and the move is recorded as not taken. Neither button plugs into a machine in a real building.</p>
        </div>
      ) : null}

      <Comparison run={run} presentation={presentation} onCompare={() => onPlay(run?.story?.id ?? selected, "automated")} playing={playing} />
      <ReturnPanel token={token} run={run} live={live} presentation={presentation} />

      <ol className="tape">
        {frames.slice(-6).map((frame, index) => (
          <li key={`${frame.step}-${index}`}>
            Step {frame.step + 1}: {frame.job_state}, {frame.abstain ? "abstaining" : frame.hypothesis.replaceAll("_", " ")}
            {frame.pending ? ", waiting for a person" : ""}
            {frame.incident_scopes.length ? `, incident scope ${frame.incident_scopes.join(", ")}` : ""}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Comparison({ run, presentation, onCompare, playing }: { run: RunView | null; presentation: boolean; onCompare: () => void; playing: boolean }) {
  const branches = run?.comparison?.branches ?? [];
  if (branches.length === 0) {
    return (
      <div className="panel">
        <h2>Two ways, one breakdown</h2>
        <p>Choose “Compare two ways” to play the same situation twice, like giving two managers the same incident. The difference in finished work is what the return panel can price. The price uses the chips in this job. It does not put a price on every chip in the hall, and it does not put a price on the industry.</p>
        <button type="button" onClick={onCompare} disabled={playing || !run}>Compare two ways on this rehearsal</button>
      </div>
    );
  }
  const max = Math.max(...branches.map((branch) => branch.useful_new), 1);
  const delta = run?.comparison?.delta_second_minus_first?.useful_new;
  return (
    <div className="panel">
      <h2>Two ways, one breakdown</h2>
      <p>These two reactions faced the same scripted problem. The numbers are the score of this rehearsal.</p>
      <div className="compare">
        {branches.map((branch) => (
          <div key={branch.policy}>
            <span>{branch.policy.replaceAll("_", " ")}</span>
            <div className="bar" style={{ width: `${(branch.useful_new / max) * 100}%` }} />
            {presentation ? null : <em>{branch.useful_new.toFixed(2)} useful steps</em>}
          </div>
        ))}
      </div>
      {!presentation && delta !== undefined && delta !== null ? (
        <p>Useful-progress difference, second policy minus first: {delta.toFixed(2)} steps. A negative difference means the second policy preserved less work.</p>
      ) : null}
    </div>
  );
}

function ReturnPanel({ token, run, live, presentation }: { token: string; run: RunView | null; live: LiveFrame | undefined; presentation: boolean }) {
  const [rate, setRate] = useState("");
  const [currency, setCurrency] = useState("");
  const [basis, setBasis] = useState("");
  const [scope, setScope] = useState("");
  const [horizon, setHorizon] = useState("");
  const [investment, setInvestment] = useState("");
  const [extra, setExtra] = useState("");
  const [estimate, setEstimate] = useState<EconomicsEstimate | null>(null);
  const [error, setError] = useState("");
  const delta = run?.comparison?.delta_second_minus_first?.useful_new;
  const stepSeconds = run?.step_seconds ?? live?.step_seconds;
  const accelerators = run?.cluster?.detailed_accelerator_count ?? live?.cluster?.detailed_accelerator_count;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (delta === undefined || delta === null || stepSeconds === undefined || accelerators === undefined) return;
    const data = new FormData(event.currentTarget);
    const entered = {
      gpu_hour_rate: String(data.get("gpu_hour_rate") ?? ""),
      currency: String(data.get("currency") ?? ""),
      cost_basis: String(data.get("cost_basis") ?? ""),
      scope: String(data.get("scope") ?? ""),
      horizon: String(data.get("horizon") ?? ""),
      investment_cost: String(data.get("investment_cost") ?? ""),
    };
    const operating = String(data.get("incremental_cost") ?? "");
    setError("");
    const config: Record<string, string | number> = { ...entered };
    if (operating !== "") config.incremental_cost = operating;
    try {
      setEstimate(await estimateEconomics(token, {
        config,
        useful_delta_steps: delta,
        step_seconds: stepSeconds,
        accelerators_in_job: accelerators,
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The estimate did not run.");
    }
  }

  return (
    <form className="panel roi" onSubmit={submit}>
      <h2>What the saved work would be worth, using your own numbers</h2>
      <p>
        Think of two ways of handling the same breakdown. One way finishes more of the job. The page turns that difference into hours of chip time with one formula: useful steps × length of a step in seconds ÷ 3600 × chips in this job.
        {accelerators !== undefined ? ` This job uses ${accelerators.toLocaleString()} chips.` : ""}
        {" "}The other chips in the hall are left out of the multiplication. You type the hourly rate, the currency, what that rate includes, what the estimate covers, the time horizon, and what you would invest. An empty form leaves the return blank. An investment of zero leaves the return blank, because dividing by zero is not a real return. When a number appears, it is an assumption-based simulation estimate: a what-if on this rehearsal, using the prices you typed. It is not cash already in an account.
      </p>
      <div className="roi-grid">
        <label>Accelerator-hour rate<input name="gpu_hour_rate" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} autoComplete="off" /></label>
        <label>Currency<input name="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} autoComplete="off" /></label>
        <label>What the rate includes<input name="cost_basis" value={basis} onChange={(event) => setBasis(event.target.value)} autoComplete="off" /></label>
        <label>What this estimate covers<input name="scope" value={scope} onChange={(event) => setScope(event.target.value)} autoComplete="off" /></label>
        <label>Horizon<input name="horizon" value={horizon} onChange={(event) => setHorizon(event.target.value)} autoComplete="off" /></label>
        <label>Investment<input name="investment_cost" inputMode="decimal" value={investment} onChange={(event) => setInvestment(event.target.value)} autoComplete="off" /></label>
        <label>Operating cost beyond the investment, if you have one<input name="incremental_cost" inputMode="decimal" value={extra} onChange={(event) => setExtra(event.target.value)} autoComplete="off" /></label>
      </div>
      <button type="submit" disabled={delta === undefined || delta === null}>Estimate from this comparison</button>
      {delta === undefined || delta === null ? <p className="muted">Play “Compare two ways” first. Approving a single action does not produce the side-by-side difference.</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {estimate ? <EstimateView estimate={estimate} presentation={presentation} /> : null}
    </form>
  );
}

function EstimateView({ estimate, presentation }: { estimate: EconomicsEstimate; presentation: boolean }) {
  const reason = REASONS[estimate.reason] ?? estimate.reason.replaceAll("_", " ");
  return (
    <div className="estimate" role="status">
      <p>{estimate.label ?? "No currency figure"}</p>
      <p>{reason}</p>
      {estimate.useful_delta_gpu_hours !== undefined ? (
        <p>Useful-work difference expressed as accelerator-hours: {estimate.useful_delta_gpu_hours.toFixed(4)}. Formula: {estimate.conversion}.</p>
      ) : null}
      {estimate.missing?.length ? <p>Still empty: {estimate.missing.join(", ").replaceAll("_", " ")}.</p> : null}
      {!presentation && estimate.roi !== null && estimate.benefit !== undefined && estimate.net_benefit !== null ? (
        <p>Benefit {estimate.benefit.toFixed(2)}. Net {estimate.net_benefit.toFixed(2)}. Return on investment {(estimate.roi * 100).toFixed(1)} percent of the investment you entered.</p>
      ) : null}
      {presentation && estimate.roi !== null ? <p>A return figure was computed from your inputs. Switch off presentation mode to read the figure.</p> : null}
    </div>
  );
}

function checkpointLine(live: LiveFrame | undefined, run: RunView | null) {
  const verified = run?.checkpoints?.some((item) => item.state === "verified_usable");
  if (live?.checkpoint) {
    const item = live.checkpoint;
    return `${item.state.replaceAll("_", " ")} at progress ${item.progress}. Shards ${item.shards_present}/${item.shards_expected}.`;
  }
  if (verified) return "A complete save is on the record.";
  return "No complete save yet. Anything since the last complete save is what you would have to do again.";
}

function tone(gpu: { functional: boolean; quarantined: boolean; temp: number | null }) {
  if (!gpu.functional) return "down";
  if (gpu.quarantined) return "held";
  if (gpu.temp !== null && gpu.temp >= 75) return "hot";
  if (gpu.temp !== null && gpu.temp >= 62) return "warm";
  return "cool";
}

function cellTitle(gpu: { id: string; temp: number | null; functional: boolean; quarantined: boolean }, presentation: boolean) {
  const state = !gpu.functional ? "not functional" : gpu.quarantined ? "quarantined" : "in the job";
  if (presentation || gpu.temp === null) return `${gpu.id}, ${state}`;
  return `${gpu.id}, ${gpu.temp.toFixed(1)} C, ${state}`;
}
