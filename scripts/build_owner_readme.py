"""Publish the shared reading narrative and its separate evidence companion."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://sohamsa.github.io/baton/'


def source():
    return json.loads((ROOT / 'content/owner-journey.json').read_text(encoding='utf-8'))


def render():
    story = source()
    lines = [f"# {story['title']}", '',
        f"[Read and explore in the dashboard]({URL}) · [Evidence and model reference](docs/story-reference.md)", '',
        '*A fictional learning story. Its evidence and simulations are synthetic; real facility decisions require site-specific engineering.*', '']
    for chapter in story['chapters']:
        lines += [f"## {chapter['title']}", '']
        for paragraph in chapter['paragraphs']:
            lines += [paragraph, '']
        if chapter['id'] == 'finale':
            lines += [f"[Try the recovery discussion]({URL}#/journey/finale) · [Run the combined scenario]({URL}#/desk?scenario=recovery_crossroads&chapter=finale)", '']
        if chapter['id'] == 'dawn':
            lines += [f"[Build your facility review worksheet]({URL}#/worksheet) · [Revisit the investigation]({URL})", '']
    lines += ['---', '', '## Explore what happened', '',
        'The dashboard follows the same investigation. You can read without starting the simulation engine, then open a rehearsal to compare responses. Standard and challenge conditions show why an intervention can help, waste work, or fail when a prerequisite is missing. Owner controls let you change spare capacity, save spacing, observation delay, and supported warning strength, then rerun both policies under the same conditions. A reusable link preserves your choices.', '',
        '[The evidence companion](docs/story-reference.md) keeps every problem’s observations, invented inputs, response gates, limitations, and challenge conditions together. The [data catalog](' + URL + '#/data) explains the wider field dictionary. The [owner worksheet](' + URL + '#/worksheet) starts blank and saves your questions locally, with download and print options.', '',
        '## Run and contribute', '',
        'The Python engine owns simulation and decisions. The public dashboard runs it in a browser worker; rehearsal startup requires network access for Pyodide. No physical telemetry or equipment control is connected. The checked learned model did not beat its baseline, so rules remain the operational default.', '',
        '```bash', 'git clone https://github.com/SohamSa/baton.git', 'cd baton', 'python -m venv .venv', 'source .venv/bin/activate  # Windows: .venv\\Scripts\\activate', 'pip install -e ".[dev]"', 'python -m pytest', 'python scripts/stage_browser_engine.py', 'cd apps/web', 'npm ci', '```', '',
        'Start the browser demo with `VITE_PUBLIC_DEMO=true npm run dev` (PowerShell: `$env:VITE_PUBLIC_DEMO="true"; npm run dev`). For the authenticated API, see the [quickstart](docs/quickstart.md).', '',
        '`content/owner-journey.json` supplies the dashboard, README, and evidence companion. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit the generated files.', '',
        'Technical detail: [runtime](docs/runtime.md) · [limitations](docs/limitations.md) · [model card](docs/model-card.md) · [validation](docs/validation.md).', '']
    return '\n'.join(lines)


def render_reference():
    story = source()
    lines = ['# Evidence companion', '', '[Return to the investigation](../README.md) · [Open the dashboard](' + URL + ')', '',
        'Open this reference when you want to inspect a particular problem. These are author-selected teaching inputs, not measured device specifications or predictions for a real facility.', '', '## Find a problem', '']
    for chapter in story['chapters']:
        characters = [c for c in story['characters'] if c['chapter'] == chapter['id']]
        if characters:
            lines += [f"**{chapter['title']}**", '']
            lines += [f"- [{c['name']}](#{c['id']})" for c in characters]
            lines += ['']
    for c in story['characters']:
        lines += [f"<a id=\"{c['id']}\"></a>", '', f"## {c['name']}", '', c['scene'], '',
            '**Observe:** ' + c['clue'], '', '**What this explains:** ' + c['lesson'], '',
            '**Ask your team:** ' + c['question'], '', '**Evidence fields:** ' + ', '.join('`' + f + '`' for f in c['fields']), '',
            '**Scope:** ' + c['coverage'], '',
            f"[Read the context]({URL}#/journey/{c['chapter']}) · [Compare responses]({URL}#/desk?scenario={c['id']}&chapter={c['chapter']}) · [Supporting tool]({URL}#{c['route']}?chapter={c['chapter']})", '',
            c['model']['relationship'], '', c['model']['rationale'], '', '| Authored input | Standard value | Purpose |', '| --- | --- | --- |']
        for a in c['assumptions']:
            lines += [f"| {a['label']} | {a['value']} {a['unit']} | {a['reason']} |"]
        lines += ['', '**Relationship and response gates:** ' + c['model']['chosen_values'], '',
            '**What is left out:** ' + c['model']['limits'], '', '**What changes the lesson:** ' + c['model']['sensitivity'], '']
        if c.get('challenge'):
            x=c['challenge']
            lines += ['**Challenge: ' + x['title'] + '.** ' + x['lesson'], '',
                'Changed inputs: ' + ', '.join('`' + k + '=' + str(v) + '`' for k,v in x['parameters'].items()) + '.', '',
                f"[Try the challenge]({URL}#/desk?scenario={c['id']}&variant=challenge&chapter={c['chapter']})", '']
    lines += ['## Shared fictional world', '', story['worldAssumptions']['explanation'], '', '| Shared input | Authored value | Purpose |', '| --- | --- | --- |']
    for a in story['worldAssumptions']['inputs']:
        lines += [f"| {a['label']} | {a['value']} | {a['why']} |"]
    lines += ['', story['worldAssumptions']['boundary'], '', '## The recovery discussion', '',
        'The recovery discussion remains a tabletop exercise. The related Recovery Crossroads scenario now executes multiple problems in one engine world. Its authored fault timing is separate from the fictional account, and adjustable conditions can change its outcome.', '']
    for q in story['finale']:
        lines += ['**' + q['prompt'] + '**', '']
        for o in q['options']:
            lines += ['- **' + o['label'] + '** ' + o['feedback']]
        lines += ['']
    lines += ['## Your facility review', '', story['worksheet']['intro'], '', '| Question | Records to request | Suggested team |', '| --- | --- | --- |']
    for t in story['worksheet']['topics']:
        lines += [f"| {t['question']} | {', '.join(t['records'])} | {t['owner']} |"]
    lines += ['', f'[Open the blank worksheet]({URL}#/worksheet). Its local notes and reported evidence are not a readiness score or certification.', '']
    return '\n'.join(lines)


if __name__ == '__main__':
    (ROOT / 'README.md').write_text(render(), encoding='utf-8')
    (ROOT / 'docs/story-reference.md').write_text(render_reference(), encoding='utf-8')
    print('Rendered the shared story and evidence companion.')
