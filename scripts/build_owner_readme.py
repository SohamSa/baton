"""Render the README from the same narrative used by the owner dashboard."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://sohamsa.github.io/baton/'

def render():
    story = json.loads((ROOT / 'content/owner-journey.json').read_text(encoding='utf-8'))
    lines = [f"# {story['title']}", '', f"> {story['subtitle']}", '',
        '**You are the owner. The datacenter is your world. Every problem is a character.**', '',
        'Read the story here, or step into its scenes in the [interactive dashboard](' + URL + '). No chip expertise is required.', '',
        '> This is a fictional learning story with synthetic data and simplified rehearsals. Costs and outcomes elsewhere in the dashboard are illustrations, not tested savings or production promises. Advanced scenes now have distinct synthetic mechanisms; specialist diagnostics, microscopic causes, and actual facility controls remain outside the model.', '',
        '## Choose your seat', '',
        '| Your situation | Enter the dashboard | What you take away |',
        '| --- | --- | --- |',
        f'| Planning a first datacenter | [The builder’s entrance]({URL}#/journey/arrival?path=build) | Questions for design reviews, procurement, and launch readiness |',
        f'| Operating existing datacenters | [The operator’s entrance]({URL}#/journey/arrival?path=operate) | Questions for incident reviews, restore drills, and maintenance |',
        f'| Learning the world | [The explorer’s entrance]({URL}#/journey/arrival?path=explore) | A connected understanding of the systems and their tradeoffs |', '',
        'Both owner paths follow the same movie. The dashboard changes the prompts you carry into your own meetings. You can read straight through, visit a supporting room, and return to the chapter you left.', '',
        '## The programme', '']
    for chapter in story['chapters']:
        lines += [f"- **{chapter['act']}:** [{chapter['title']}]({URL}#/journey/{chapter['id']})"]
    for chapter in story['chapters']:
        lines += ['', '---', '', f"## {chapter['act']} · {chapter['title']}", '']
        for paragraph in chapter['paragraphs']:
            lines += [paragraph, '']
        if chapter['id'] == 'rhythm':
            lines += ['| The part of the world | What it does | The owner’s question |', '| --- | --- | --- |',
                '| Accelerators | Perform calculations | Are they producing new useful work? |',
                '| Network | Connects cooperating workers | Which work waits on which partners? |',
                '| Power and cooling | Supply energy and remove heat | Which machines share a vulnerable dependency? |',
                '| Storage | Holds saved training state | Can we actually restore it? |',
                '| People and procedures | Investigate and authorize responses | What evidence and capability checks govern action? |', '',
                'The detailed rehearsal job is small. The larger cluster is an inventory with a counted quiescent population; it is not a fully instrumented fleet experiment. No real GPU is connected.', '']
        for character in [c for c in story['characters'] if c['chapter'] == chapter['id']]:
            lines += [f"### {character['name']}", '', character['scene'], '',
                f"**The clue:** {character['clue']}", '', f"**The revelation:** {character['lesson']}", '',
                f"**Ask your team:** {character['question']}", '',
                '**Open the evidence drawer:** ' + ', '.join('`'+f+'`' for f in character['fields']) + '.', '',
                f"*Rehearsal scope: {character['coverage']}*", '',
                f"[Enter this character’s scene]({URL}#/journey/{chapter['id']}) · [Open the rehearsal]({URL}#/desk?scenario={character['id']}&chapter={chapter['id']}) · [Visit the supporting room]({URL}#{character['route']}?chapter={chapter['id']})", '']
            lines += ['<details>', '<summary>Behind this scene: invented assumptions, tradeoffs, and limits</summary>', '',
                character['model']['relationship'], '', character['model']['rationale'], '',
                '| Authored input | Standard value | Purpose |', '| --- | --- | --- |']
            for assumption in character['assumptions']:
                lines += [f"| {assumption['label']} | {assumption['value']} {assumption['unit']} | {assumption['reason']} |"]
            lines += ['', '**Relationship and response gates:** ' + character['model']['chosen_values'], '',
                '**What is left out:** ' + character['model']['limits'], '',
                '**What changes the lesson:** ' + character['model']['sensitivity'], '']
            if character.get('challenge'):
                challenge = character['challenge']
                lines += ['**A second ending: ' + challenge['title'] + '.** ' + challenge['lesson'], '',
                    'Changed inputs: ' + ', '.join('`' + key + '=' + str(value) + '`' for key,value in challenge['parameters'].items()) + '.', '',
                    f"[Explore these challenge conditions]({URL}#/desk?scenario={character['id']}&variant=challenge&chapter={chapter['id']})", '']
            lines += ['</details>', '']
        if chapter['id'] == 'finale':
            lines += ['### You have the floor', '', 'Pause before reading the resolution. What would you ask the team to do?', '']
            for turn in story['finale']:
                lines += [f"**{turn['prompt']}**", '']
                for option in turn['options']:
                    lines += ['- '+option['label']]
                lines += ['']
            lines += [f'[Make your decisions in the interactive climax]({URL}#/journey/finale)', '', '<details>', '<summary>Reveal the resolution</summary>', '']
            for turn in story['finale']:
                lines += [next(o['feedback'] for o in turn['options'] if o['supported']), '']
            lines += ['The ending depends on evidence and preparation. If no checkpoint qualifies, or compatible recovery capacity is absent, the team must say recovery is blocked. No story can manufacture saved progress after the fact.', '',
                'This climax is a tabletop decision exercise. The existing engine rehearsals demonstrate its individual lessons; they do not execute this compound event as a single simulation.', '', '</details>', '']
        if chapter['id'] == 'dawn':
            lines += ['### Carry the ending into your next meeting', '',
                '| If you are building | If you are operating |', '| --- | --- |',
                '| Request a dependency map before signing off on design. | Review how dependency maps helped or failed in a recent incident. |',
                '| Ask suppliers which telemetry and lifecycle records are available. | Identify missing, stale, and unsupported observations. |',
                '| Require a demonstrated checkpoint restore before launch. | Run a restore drill that rejects an incomplete save. |',
                '| Validate recovery capability and spare compatibility. | Review repeat failures and return-to-service qualification. |', '',
                f'[Create and print your owner’s action pack]({URL}#/journey/dawn) with your questions and notes. Progress and notes stay in your browser; no account is needed for the public story.', '']
        lines += [f"> **The question you carry forward:** {chapter['question']}", '',
            f"[Step into this chapter]({URL}#/journey/{chapter['id']}) · [{chapter['routeLabel']}]({URL}#{chapter['route']}?chapter={chapter['id']})", '']
    lines += ['', '## The fictional world under every scene', '', story['worldAssumptions']['explanation'], '', '| Shared input | Authored value | Purpose |', '| --- | --- | --- |']
    for input in story['worldAssumptions']['inputs']:
        lines += [f"| {input['label']} | {input['value']} | {input['why']} |"]
    lines += ['', story['worldAssumptions']['boundary'], '']
    lines += ['', '## Bring your facility into the story', '', story['worksheet']['intro'], '',
        f"[Open the guided owner worksheet]({URL}#/worksheet)", '',
        'Start with unknowns. Choose planning or operating context, record the affected job size if known, name who will bring evidence, and write the demonstration you want to see. A reported demonstration still needs independent record review.', '',
        '| Review question | Evidence to request | Suggested team | Relevant characters |',
        '| --- | --- | --- | --- |']
    names = {c['id']:c['name'] for c in story['characters']}
    for topic in story['worksheet']['topics']:
        lines += [f"| {topic['question']} | {', '.join(topic['records'])} | {topic['owner']} | {', '.join(names[id] for id in topic['characters'])} |"]
    lines += ['', 'The worksheet starts blank, retains answers in your browser, and downloads a Markdown meeting review or JSON copy. You can print the full notes and return to each linked rehearsal. It does not score readiness, predict facility risk, resize the engine, or certify the reported evidence.', '']
    lines += ['---', '', '## Behind the story: how evidence becomes a decision', '',
        'A large dictionary is a map of possibilities. A particular decision needs a smaller evidence set. The character drawers show that narrowing:', '',
        '| Owner question | Evidence to examine | Decision it informs |', '| --- | --- | --- |',
        '| Is the warning unexplained by workload? | Temperature, observed power, workload, residual, freshness | Investigate or request a save |',
        '| Do the alarms share a dependency? | Power and cooling domain membership, correlated observations | Investigate the shared system |',
        '| Can we restore this save? | State, shard completeness, integrity, reachability, topology | Select or reject a checkpoint |',
        '| Can we change membership? | Runtime capability and dependent rank groups | Permit or reject reconfiguration |',
        '| Did the response help? | Useful progress, repeated work, interruption, checkpoint overhead | Compare strategies |', '',
        f'Open the [full data catalog]({URL}#/data). Catalog definitions are broader than generated observations and model inputs. Optional manufacturer records and proposed instrumentation are explicitly identified in the owner story; missing evidence remains missing.', '',
        '## For the technical team', '',
        'The Python engine in `src/baton` owns simulation and policies. The public React dashboard can execute it through Pyodide in a browser worker. Reading the story needs no engine startup; rehearsals load the engine on demand. Initial rehearsal loading requires network access for Pyodide and the engine bundle.', '',
        'The engine separates evaluator truth from operational evidence, rejects unsupported recovery, checks abstract checkpoint eligibility, and compares policies on shared synthetic fault schedules. The learned model did not beat its baseline on the checked artifact, so rules remain the operational default. No physical telemetry or control adapter is connected.', '',
        '### Run locally', '', '```bash', 'git clone https://github.com/SohamSa/baton.git', 'cd baton', 'python -m venv .venv', 'source .venv/bin/activate  # Windows: .venv\\Scripts\\activate', 'pip install -e ".[dev]"', 'python -m pytest', 'python scripts/stage_browser_engine.py', 'cd apps/web', 'npm ci', '```', '',
        'Start the browser demo with `VITE_PUBLIC_DEMO=true npm run dev` (PowerShell: `$env:VITE_PUBLIC_DEMO="true"; npm run dev`). For the authenticated API workflow, see [the quickstart](docs/quickstart.md).', '',
        '### Keep the story aligned', '',
        '`content/owner-journey.json` supplies both the dashboard chapters and this README. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit both generated outputs. The journey tests check character coverage, route targets, and narrative parity.', '',
        'Read [the runtime boundaries](docs/runtime.md), [limitations](docs/limitations.md), [model card](docs/model-card.md), and [validation notes](docs/validation.md) for technical detail.', '',
        '**The final scene belongs to you:** take one question from this story into a real conversation, and ask your team to bring the evidence.', '']
    return '\n'.join(lines)

if __name__ == '__main__':
    (ROOT / 'README.md').write_text(render(), encoding='utf-8')
    print('Rendered README from the shared owner story.')
