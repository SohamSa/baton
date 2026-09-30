import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import story from "../../../content/owner-journey.json";
import { EconomicsEstimate, LiveFrame, RunView, estimateEconomics } from "./api";

const TokenContext = createContext("public");
export function OwnerToolsProvider({ token, children }: { token: string; children: ReactNode }) { return <TokenContext.Provider value={token}>{children}</TokenContext.Provider>; }
const ROOM_CAST: Record<string, string[]> = {
  "/portfolio": ["gradual_warning", "silent_straggler", "revolving_door"],
  "/fleet": ["shared_infrastructure", "rack_thermal_shadow"],
  "/planner": ["abrupt_failure", "rack_thermal_shadow", "incomplete_checkpoint"],
  "/build": ["abrupt_failure", "rack_thermal_shadow", "incomplete_checkpoint"],
  "/grid": ["power_cliff", "shared_infrastructure"], "/footprint": ["power_cliff", "shared_infrastructure"],
  "/dispatch": ["revolving_door"], "/silicon": ["silent_straggler"],
  "/racks": ["rack_thermal_shadow"], "/anomalies": ["gradual_warning", "silent_subthreshold_cliff"],
  "/lineage": ["wafer_lot_contagion"], "/yield": ["wafer_lot_contagion"],
  "/mcm": ["fractured_microbump"], "/boards": ["innocent_chip_dying_board"],
  "/passport": ["cold_plate_torque_fracture", "wafer_lot_contagion"],
  "/devices": ["healthy_workload_shift"], "/incidents": ["shared_infrastructure"],
  "/checkpoints": ["incomplete_checkpoint"], "/recovery": ["unsupported_local_recovery"],
  "/audit": ["harmful_preventive"], "/experiments": ["harmful_preventive"],
  "/monitoring": ["stale_telemetry"], "/models": ["gradual_warning"], "/data": ["stale_telemetry"],
};
export const ROOM_TITLES: Record<string, string> = {
  "/portfolio": "The owner’s review room", "/fleet": "The facility map", "/planner": "The design room", "/build": "The design room", "/grid": "The power room", "/footprint": "The power room", "/dispatch": "The return-to-service room", "/silicon": "The slow-runner investigation", "/racks": "The shared cooling investigation", "/anomalies": "The evidence and uncertainty room",
};
export function RoomGuide() {
  const location = useLocation();
  const cast = story.characters.filter((c) => (ROOM_CAST[location.pathname] ?? []).includes(c.id));
  if (!cast.length) return null;
  const query = new URLSearchParams(location.search); const path = query.get("path") ?? "explore";
  return <section className="owner-room-guide panel"><p className="eyebrow">A supporting room in the owner’s story</p><h2>{ROOM_TITLES[location.pathname] ?? "Follow the evidence"}</h2><p>Start with the question, inspect the evidence, and return to the investigation with what you found.</p>{cast.map((c) => <details key={c.id}><summary>{c.name}: {c.question}</summary><p>{c.lesson}</p><p><strong>Evidence:</strong> {c.fields.join(", ")}</p><p className="muted">{c.coverage}</p><div className="owner-actions"><Link to={`/journey/${c.chapter}?path=${path}`}>Return to the investigation</Link><Link to={`/desk?scenario=${c.id}&chapter=${c.chapter}&path=${path}`}>Select this rehearsal</Link></div></details>)}</section>;
}

const planKey = "baton-example-plan-v1";
export type ExamplePlan = { chips: number; watts: number; overhead: number; pue: number; cooling: string };
const defaultPlan: ExamplePlan = { chips: 32768, watts: 350, overhead: 0, pue: 1.2, cooling: "Direct liquid cooling" };
export function useExamplePlan() {
  const [plan, setPlan] = useState<ExamplePlan>(() => {
    try { const j = JSON.parse(localStorage.getItem(planKey) ?? "null"); return j && Number.isInteger(j.chips) && j.chips > 0 && Number.isFinite(j.watts) && j.watts > 0 && Number.isFinite(j.overhead) && j.overhead >= 0 && Number.isFinite(j.pue) && j.pue >= 1 && typeof j.cooling === "string" ? j : defaultPlan; } catch { return defaultPlan; }
  });
  useEffect(() => { try { localStorage.setItem(planKey, JSON.stringify(plan)); } catch { /* The example still works without persistence. */ } }, [plan]);
  return { plan, setPlan, itKw: plan.chips * (plan.watts + plan.overhead) / 1000, facilityKw: plan.chips * (plan.watts + plan.overhead) / 1000 * plan.pue };
}

type Assumptions = Record<string, string>;
const financialKey = "baton-owner-assumptions-v1";
const FIELDS = [
  ["currency", "Currency label"], ["rate", "Value per job accelerator-hour"], ["jobSize", "Accelerators in the affected job"], ["incidents", "Assumed incidents over one year"], ["baselineHours", "Baseline interruption hours per incident"], ["alternativeHours", "Alternative interruption hours per incident"], ["baselineLostHours", "Baseline repeated-work hours per incident"], ["alternativeLostHours", "Alternative repeated-work hours per incident"], ["investment", "Upfront investment"], ["annualCost", "Additional annual operating cost"],
] as const;
function blankAssumptions(): Assumptions { return Object.fromEntries(FIELDS.map(([key]) => [key, ""])); }
export function FinancialIllustration() {
  const token = useContext(TokenContext);
  const [inputs, setInputs] = useState<Assumptions>(() => { try { const j = JSON.parse(localStorage.getItem(financialKey) ?? "null"); return Object.fromEntries(FIELDS.map(([key]) => [key, typeof j?.[key] === "string" ? j[key] : ""])); } catch { return blankAssumptions(); } });
  const [result, setResult] = useState<EconomicsEstimate | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  useEffect(() => { try { localStorage.setItem(financialKey, JSON.stringify(inputs)); } catch { /* User can still calculate. */ } }, [inputs]);
  const valid = FIELDS.every(([key]) => inputs[key].trim() && (key === "currency" || Number.isFinite(Number(inputs[key])) && Number(inputs[key]) >= 0)) && Number(inputs.investment) > 0 && Number.isInteger(Number(inputs.jobSize)) && Number(inputs.jobSize) > 0;
  async function calculate() {
    if (!valid || busy) return;
    setBusy(true); setError("");
    try {
      const hours = Number(inputs.incidents) * (Number(inputs.baselineHours) + Number(inputs.baselineLostHours) - Number(inputs.alternativeHours) - Number(inputs.alternativeLostHours));
      setResult(await estimateEconomics(token, {config: {currency: inputs.currency.trim(), gpu_hour_rate: Number(inputs.rate), cost_basis: "owner-supplied accelerator-hour value", scope: "affected job only", horizon: "one year", investment_cost: Number(inputs.investment), incremental_cost: Number(inputs.investment) + Number(inputs.annualCost)}, useful_delta_steps: hours, step_seconds: 3600, accelerators_in_job: Number(inputs.jobSize)}));
    } catch (e) { setError(e instanceof Error ? e.message : "Calculation unavailable"); } finally { setBusy(false); }
  }
  return <section className="panel owner-financial"><h2>Your assumption-based financial illustration</h2><p>These inputs are shared across the supporting rooms in this browser. No rate, incident frequency, recovery time, or investment is supplied by default.</p><p>Use the size of the affected job, not the entire inventory. The illustration values interruption and repeated-work hours using your stated rate; it does not calculate an electricity bill or prove cash savings.</p><div className="owner-inputs">{FIELDS.map(([key, label]) => <label key={key}>{label}<input aria-label={label} type={key === "currency" ? "text" : "number"} min={key === "investment" || key === "jobSize" ? "0.01" : "0"} step={key === "jobSize" ? "1" : "any"} value={inputs[key]} onChange={(e) => { setInputs((j) => ({ ...j, [key]: e.target.value })); setResult(null); }} /></label>)}</div><div className="owner-actions"><button type="button" disabled={!valid || busy} onClick={() => void calculate()}>{busy ? "Calculating…" : "Calculate my illustration"}</button><button type="button" onClick={() => { setInputs(blankAssumptions()); setResult(null); setError(""); }}>Clear financial assumptions</button></div>{!valid ? <p className="muted">Financial return is undefined until all inputs are supplied and investment is positive. Enter an explicit zero where that is your assumption.</p> : null}{error ? <p role="alert">{error}</p> : null}{result ? <div role="status"><p><strong>{result.label}</strong></p><p>Net benefit after upfront investment and additional annual cost: {inputs.currency} {result.net_benefit?.toFixed(2) ?? "undefined"}. Return relative to upfront investment: {result.roi === null ? "undefined" : `${(result.roi * 100).toFixed(1)}%`}.</p><p>Formula: assumed incidents × difference in interruption and repeated-work hours × affected job size × stated hour value, minus upfront and annual costs. Negative outcomes remain visible.</p></div> : null}</section>;
}

export function RehearsalEvidence({ run, frames = [] }: { run: RunView | null; frames?: LiveFrame[] }) {
  const frame = frames.at(-1); const id = run?.story?.id;
  const target = story.characters.some((c) => c.id === id);
  if (!target && !frame) return <div className="panel"><p>Open a rehearsal to inspect its observed evidence. No live facility is connected.</p></div>;
  const rows = frame?.accelerators ?? Object.entries(run?.gpus ?? {}).map(([id, gpu]) => ({ id, ...gpu, temp: gpu.gpu_temp_c, functional: true, quarantined: false, spare: false }));
  const diagnostics = frame?.diagnostics ?? run?.diagnostics ?? [];
  return <section className="panel owner-evidence"><h2>Evidence from the current rehearsal</h2><p><strong>{run?.story?.title ?? "Rehearsal in progress"}</strong> · {run?.story?.variant === "challenge" ? "Challenge conditions" : "Standard teaching scene"}. The table describes this run, not a readiness assessment of your facility.</p><p>{run?.story?.coverage ?? "Synthetic observations for the detailed assigned job; other inventory is counted separately."}</p><div className="owner-table-scroll"><table><thead><tr><th>Machine</th><th>Observed latency (ms)</th><th>Temperature (°C)</th><th>Cooling flow ratio</th><th>Rack position (U)</th><th>Qualification</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.step_latency_ms?.toFixed(1) ?? "Unknown"}</td><td>{r.temp?.toFixed(1) ?? "Unknown"}</td><td>{r.cooling_flow_ratio?.toFixed(2) ?? "Unknown"}</td><td>{r.rack_elevation_u ?? "Unknown"}</td><td>{r.qualification_state ?? "Not tested"}</td></tr>)}</tbody></table></div>{diagnostics.length ? <ul>{diagnostics.map((d) => <li key={`${d.gpu_id}-${d.event_step}`}>Isolated load test for {d.gpu_id}: <strong>{d.state}</strong>; observed stress errors: {d.stress_error_count}. {d.state === "failed" ? "Candidate remains outside the job; a compatible spare is required." : "Qualification permits supported recovery."}</li>)}</ul> : <p className="muted">No completed qualification result in this rehearsal.</p>}<AdvancedEvidence run={run} frames={frames}/><p>Useful progress: {frame?.useful_new?.toFixed(2) ?? run?.metrics?.useful_new?.toFixed(2) ?? "Unknown"}. Observations and decisions may change as the rehearsal advances.</p></section>;
}


const ADVANCED_COLUMNS = [["nvlink_replay_total","Link retries"],["lot_id","Reported lot"],["board_ripple_mv","Board ripple (mV)"],["pcb_strain_microstrain","Strain (microstrain)"],["voltage_margin_mv","Margin (mV)"],["validation_mismatch_total","Validation mismatches"],["power_headroom_w","Headroom (W)"],["clock_scale","Clock/workload scale"]] as const;
function AdvancedEvidence({ run, frames }: { run: RunView | null; frames: LiveFrame[] }) {
  const rows = (frames.at(-1)?.accelerators ?? Object.entries(run?.gpus ?? {}).map(([id, row]) => ({ id, ...row }))) as unknown as {id:string; [key:string]:unknown}[];
  const columns = ADVANCED_COLUMNS.filter(([key]) => rows.some((row) => row[key] !== null && row[key] !== undefined && (key !== "clock_scale" || row[key] !== 1)));
  if (!columns.length) return null;
  return <div className="owner-table-scroll"><h3>Additional observed evidence</h3><p>Unavailable values remain unknown. Component-level causes remain hypotheses.</p><table><thead><tr><th>Machine</th>{columns.map(([key,label])=><th key={key}>{label}</th>)}</tr></thead><tbody>{rows.map((row)=><tr key={row.id}><td>{row.id}</td>{columns.map(([key])=><td key={key}>{typeof row[key]==="number"?(row[key] as number).toFixed(2):typeof row[key]==="string"?row[key] as string:"Unknown"}</td>)}</tr>)}</tbody></table></div>;
}
