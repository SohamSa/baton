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
      <p className="eyebrow">Operations desk · synthetic GPU hall</p>
      <h1>One training job can hold a hall of accelerators.</h1>
      <p className="lede">
        A synchronized pre-training job does not lose one chip. It loses the step. The checkpoint you can actually restore is the only progress you can defend, and a preventive action taken on a healthy burst can cost more useful work than the fault it was meant to catch.
        TrainingContinuity runs that decision in front of you, on a simulated hall of {cluster ? cluster.accelerator_count.toLocaleString() : "tens of thousands of"} accelerators.
      </p>

      <div className="problems">
        <article>
          <h2>The stall</h2>
          <p>When one placed accelerator stops, the job stops with it. The other hosts are still powered. They are not making the next training step.</p>
        </article>
        <article>
          <h2>The exposure</h2>
          <p>Progress that exists only in memory is not progress you can restart from. An incomplete or in-flight checkpoint cannot be used. Age of the last verified save is the exposure.</p>
        </article>
        <article>
          <h2>The false alarm</h2>
          <p>A static temperature limit can quarantine a healthy workload shift. The paired run on the same faults shows when that action preserves less work than doing nothing disruptive.</p>
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
              <option value="manual">You approve the high-impact action</option>
              <option value="automated">Compare two policies on the same faults</option>
            </select>
          </label>
          <button type="button" onClick={() => onPlay(selected, mode)} disabled={playing}>
            {playing ? "The hall is moving" : "Run this story live"}
          </button>
        </div>
        <p className="muted">{items.find((item) => item.id === selected)?.summary ?? "The opening story is a cooling fault that becomes visible before the accelerator stops. The run will wait for your approval."}</p>
      </div>

      <div className="hall-wrap">
        <div className="hall-head">
          <h2>Placed accelerators</h2>
          <p>
            {live ? `Step ${live.step + 1} of ${live.steps}. Job ${live.job_state}. ${live.abstain ? "The evidence is not enough to name a cause." : `Leading read: ${live.hypothesis.replaceAll("_", " ")}.`}` : "The engine is about to step the opening story. The floor updates as each step is computed."}
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
              ? `${cluster.quiescent_accelerator_count.toLocaleString()} other accelerators in the same hall — ${cluster.rack_count.toLocaleString()} racks, ${cluster.host_count.toLocaleString()} hosts, ${cluster.fabric_domain_count} fabric domains. Counted, not painted one by one. This page is not attached to them.`
              : "The rest of the hall is a counted population. This page is not attached to those accelerators."}
          </p>
        </div>
        <div className="spark" aria-label="Useful progress across the steps computed so far">
          {frames.slice(-48).map((frame, index) => (
            <i key={`${frame.step}-${index}`} style={{ height: `${Math.max(8, (frame.useful_new / maxUseful) * 100)}%` }} title={`Step ${frame.step + 1}: useful ${frame.useful_new.toFixed(2)}`} />
          ))}
        </div>
        <p className="muted">The bars are useful new progress of this virtual job. They are not a fleet measurement and they are not savings.</p>
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
          <p className="muted">Approving runs the same story forward from this precondition. Rejecting records that the action was not taken. Neither one touches a physical accelerator.</p>
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
        <h2>Same faults, two policies</h2>
        <p>Automated mode runs the paired policies on one fault schedule. The difference in useful progress is what the return panel prices. It does not price the whole industry, and it does not price a hall this simulation did not step device by device.</p>
        <button type="button" onClick={onCompare} disabled={playing || !run}>Compare policies on this story</button>
      </div>
    );
  }
  const max = Math.max(...branches.map((branch) => branch.useful_new), 1);
  const delta = run?.comparison?.delta_second_minus_first?.useful_new;
  return (
    <div className="panel">
      <h2>Same faults, two policies</h2>
      <p>These branches share the exogenous fault schedule. The numbers are synthetic results for this scenario.</p>
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
      <h2>What a difference in useful work is worth to you</h2>
      <p>
        The engine converts the useful-step difference with one visible formula: useful steps × step length in seconds ÷ 3600 × accelerators in this job.
        {accelerators !== undefined ? ` This job has ${accelerators.toLocaleString()} placed accelerators.` : ""}
        {" "}The other accelerators in the hall are not multiplied in. There is no default rate on this page. A blank form leaves return undefined. Zero investment leaves return undefined. The result, when one exists, is an assumption-based simulation estimate, not money already saved.
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
      {delta === undefined || delta === null ? <p className="muted">Run the paired comparison first. Manual approval alone does not produce the two-policy difference.</p> : null}
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
  if (verified) return "A verified save is on the record.";
  return "No verified save yet. That gap is the exposure.";
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
