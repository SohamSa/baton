import { Link, useLocation } from "react-router-dom";
import { RehearsalControls, RehearsalSettings, RunView } from "./api";

export function RehearsalLab({ id, variant, controls, settings, onChange, disabled, run, linkError }: {
  id: string; variant: string; controls?: RehearsalControls; settings: RehearsalSettings;
  onChange: (settings: RehearsalSettings) => void; disabled: boolean; run: RunView | null; linkError: string;
}) {
  const location = useLocation();
  const baseline = controls?.presets[variant] ?? {};
  const query = new URLSearchParams(location.search);
  query.set("scenario", id); query.set("variant", variant); query.set("settings", JSON.stringify(settings));
  const shareLink = `/desk?${query.toString()}`;
  return <section className="panel rehearsal-lab" aria-label="Owner rehearsal conditions">
    <p className="eyebrow">Direct the rehearsal</p>
    <h2>What changes if the conditions change?</h2>
    <p>Adjust one condition, run the comparison, and follow the consequences. These controls describe an invented job, not your facility. Both policies use the same selected conditions and fault schedule.</p>
    {linkError ? <p role="alert">{linkError}</p> : null}
    {controls ? <>
      <div className="rehearsal-controls">{controls.controls.map((c) => {
        const value = settings[c.key] ?? baseline[c.key];
        return <label key={c.key} htmlFor={`condition-${c.key}`}><strong>{c.label}</strong><output htmlFor={`condition-${c.key}`}>{value} {c.unit}</output>
          <input id={`condition-${c.key}`} type="range" min={c.min} max={c.max} step={c.step} value={value} disabled={disabled} aria-describedby={`condition-help-${c.key}`} onChange={(e) => onChange({ ...settings, [c.key]: Number(e.target.value) })} />
          <span id={`condition-help-${c.key}`}>{c.why}</span>
        </label>;
      })}</div>
      <div className="owner-actions"><button type="button" disabled={disabled} onClick={() => onChange({})}>Reset to selected preset</button><Link to={shareLink}>Open a reusable link to these conditions</Link></div>
      <p className="muted">These are the next run’s inputs. Changing them does not alter a completed run or a pending approval. Use the launch button below to execute them.</p>
    </> : <p role="status">Loading the supported conditions from the Python engine.</p>}
    {run?.rehearsal ? <details><summary>Inspect the conditions actually used by the last run</summary><p>{run.story?.title} · {run.story?.variant} · configuration {run.rehearsal.config_hash}</p><dl>{Object.entries(run.rehearsal.effective).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{value}</dd></div>)}</dl><p>Approvals replay these original inputs. The comparison uses this same configuration.</p></details> : null}
  </section>;
}

export function InteractionReview({ run }: { run: RunView | null }) {
  if (run?.story?.id !== "recovery_crossroads") return null;
  const actions = run.actions ?? [];
  const restart = actions.find((a) => a.action_type === "restart");
  return <section className="panel interaction-review" aria-label="Combined recovery consequences">
    <h2>Where the recovery prerequisites meet</h2>
    <p>One engine world contains a thermal warning, delayed reports, two permanent worker failures, and a save that may be interrupted. Save timing can change that collision. These are the actual checkpoints and actions from this run.</p>
    <p role="status">{run.pending_action ? "A coordinated recovery is waiting for approval; its conditions remain fixed." : restart?.state === "succeeded" ? "A coordinated restart used an eligible save and passed the capacity checks." : restart?.state === "failed" ? `The attempted restart was blocked: ${restart.reason?.replaceAll("_", " ")}.` : "No coordinated restart was executed. Follow the recorded evidence decisions below."}</p>
    <div className="owner-table-scroll"><table><caption>Saves in this combined run</caption><thead><tr><th>Saved position</th><th>State</th><th>Pieces present</th></tr></thead><tbody>{run.checkpoints?.map((cp) => <tr key={cp.checkpoint_id}><td>{cp.progress}</td><td>{cp.state.replaceAll("_", " ")}</td><td>{cp.shards_present} / {cp.shards_expected}</td></tr>)}</tbody></table></div>
    <h3>Recorded responses</h3><ul>{actions.map((a, i) => <li key={a.action_id ?? i}>Tick {a.step}: {a.action_type.replaceAll("_", " ")} · {a.state}. {a.reason}</li>)}</ul>
    <p>Try changing only the observation delay, then only the spare count, then the spacing between saves. Fresh evidence cannot supply missing machines; extra machines cannot complete a failed save.</p>
  </section>;
}
