import { Link } from "react-router-dom";
import story from "../../../content/owner-journey.json";

export function ScenarioNotes({ id, variant = "standard", onVariant, disabled = false }: {
  id: string; variant?: string; onVariant?: (variant: string) => void; disabled?: boolean;
}) {
  const character = story.characters.find((c) => c.id === id);
  if (!character) return null;
  return <section className="panel scenario-notes" aria-label={`Assumptions for ${character.name}`}>
    <p className="eyebrow">How this example works</p>
    <h2>{character.name}: why this rehearsal behaves this way</h2>
    <p>{character.model.relationship}</p>
    <details><summary>Read the invented inputs and their purpose</summary>
      <p>{character.model.rationale}</p><p>{story.worldAssumptions.explanation}</p><details><summary>{story.worldAssumptions.title}</summary><dl>{story.worldAssumptions.inputs.map((input)=><div key={input.label}><dt>{input.label}: {input.value}</dt><dd>{input.why}</dd></div>)}</dl><p>{story.worldAssumptions.boundary}</p></details>
      <div className="owner-table-scroll"><table><thead><tr><th>Authored assumption</th><th>Standard value</th><th>Why it is here</th></tr></thead><tbody>
        {character.assumptions.map((a) => <tr key={a.key}><td>{a.label}</td><td>{a.value} {a.unit}</td><td>{a.reason}</td></tr>)}
      </tbody></table></div>
      <h3>The relationship and response gates</h3><p>{character.model.chosen_values}</p>
      <h3>What the model leaves out</h3><p>{character.model.limits}</p>
      <h3>What could change the lesson</h3><p>{character.model.sensitivity}</p>
      <p>These are author-selected inputs, not measured operating limits or predictions about your facility. The engine preserves the cost of saves, recovery, and unnecessary interventions.</p>
    </details>
    {character.challenge ? <div className="scenario-challenge">
      <h3>A different outcome: {character.challenge.title}</h3><p>{character.challenge.lesson}</p>
      {onVariant ? <label>Rehearsal conditions<select aria-label="Rehearsal conditions" value={variant} disabled={disabled} onChange={(e) => onVariant(e.target.value)}><option value="standard">Standard conditions</option><option value="challenge">Challenge: {character.challenge.title}</option></select></label> : <Link to={`/desk?scenario=${id}&variant=challenge&chapter=${character.chapter}`}>Explore the challenge case</Link>}
      <details><summary>What changes in the challenge?</summary><ul>{Object.entries(character.challenge.parameters).map(([key, value]) => <li key={key}>{key.replaceAll("_", " ")}: {value}</li>)}</ul><p>The changed inputs are explicit. Compare both policies under these conditions; the challenging result is not an annual forecast.</p></details>
    </div> : null}
    <Link to={`/worksheet?chapter=${character.chapter}`}>Connect this lesson to questions about my facility</Link>
  </section>;
}
