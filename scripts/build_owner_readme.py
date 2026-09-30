"""Publish the shared reading narrative and its separate evidence companion."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://sohamsa.github.io/baton/'


def source():
    return json.loads((ROOT / 'content/owner-journey.json').read_text(encoding='utf-8'))


def render():
    story = source()
    foundations = json.loads((ROOT / 'content/owner-foundations.json').read_text(encoding='utf-8'))
    workspace = json.loads((ROOT / 'content/owner-readme-workspace.json').read_text(encoding='utf-8'))
    lines = [f"# {story['title']}", '', f"[Open Baton: the complete owner workspace]({URL})", '']
    for paragraph in workspace['opening']:
        lines += [paragraph, '']
    lines += ['*The facilities, evidence, and simulations are fictional. Baton supports learning and evidence reviews; real designs and operating decisions need site-specific engineering.*', '',
        'In the dashboard, the same navigation stays with you: **Basics → Data → Story → Plan → Rehearse → Operations → My review**. This is a suggested journey, not a locked sequence. Experienced readers can go straight to a tool. More tools holds the specialist investigations, and returning to Story keeps your chapter and build-or-operate context.', '',
        '## Basics: get to know the room', '', workspace['basicsLead'], '', foundations['basicsIntro'], '']
    for item in foundations['basics']:
        lines += ['**' + item['term'] + '.** ' + item['explanation'], '']
    lines += ['## Data: turn the records into questions', '', workspace['dataLead'], '', foundations['dataIntro'], '']
    for paragraph in foundations['dataPrinciples']:
        lines += [paragraph, '']
    lines += ['Mira starts with the evidence that connects directly to the work:', '', '| Question to ask | Fields to read together | Why they belong together |', '| --- | --- | --- |']
    for group in foundations['essentials']:
        lines += [f"| {group['label']} | {', '.join('`' + f + '`' for f in group['fields'])} | {group['why']} |"]
    lines += ['', workspace['dataEnd'], '', '## Story: follow the work', '', workspace['storyLead'], '']
    for chapter in story['chapters']:
        lines += [f"### {chapter['title']}", '']
        for paragraph in chapter['paragraphs']:
            lines += [paragraph, '']
    for section in workspace['sections']:
        lines += [f"## {section['label']}: {section['title']}", '']
        for paragraph in section['paragraphs']:
            lines += [paragraph, '']
    lines += ['### Where the supporting tools fit', '',
        'These tools live inside the same dashboard. Open More tools when you need a closer look; the owner navigation remains available.', '',
        '| Follow this question | Tools inside Baton |', '| --- | --- |',
        '| How do the example, current rehearsal, and financial assumptions relate? | Executive overview and facility map |',
        '| Is the issue in a worker, its board, its package, or a shared rack? | Processor health, baseboard power, multi-chip assembly, rack plumbing and power |',
        '| What history might the affected machines share? | Manufacturing batches, factory quality and bins, digital chip passport |',
        '| Does the proposed explanation have enough support? | AI early warning, AI helper models, monitoring |',
        '| What failed, what can restore, and what action was reviewed? | Dependencies, devices, incidents, checkpoints, operator decisions, audit, experiments |',
        '| What should the owner ask about power and recurring problems? | Utility grid and PPA scorecard, problem questions |', '',
        workspace['closing'], '', f"[Continue in the complete Baton dashboard]({URL})", '',
        '<details>', '<summary>For readers who want the model evidence or want to run the project</summary>', '',
        'The [evidence companion](docs/story-reference.md) contains every problem’s observations, invented inputs, response gates, limitations, and challenge conditions. The full searchable field catalog is available inside the dashboard’s Data page.', '',
        '## Run and contribute', '',
        'The Python engine owns simulation and decisions. The public dashboard runs it in a browser worker; rehearsal startup requires network access for Pyodide. No physical telemetry or equipment control is connected. The checked learned model did not beat its baseline, so rules remain the operational default.', '',
        '```bash', 'git clone https://github.com/SohamSa/baton.git', 'cd baton', 'python -m venv .venv', 'source .venv/bin/activate  # Windows: .venv\\Scripts\\activate', 'pip install -e ".[dev]"', 'python -m pytest', 'python scripts/stage_browser_engine.py', 'cd apps/web', 'npm ci', '```', '',
        'Start the browser demo with `VITE_PUBLIC_DEMO=true npm run dev` (PowerShell: `$env:VITE_PUBLIC_DEMO="true"; npm run dev`). For the authenticated API, see the [quickstart](docs/quickstart.md).', '',
        '`content/owner-journey.json` supplies the dashboard, README, and evidence companion. After editing it, run `python scripts/build_owner_metadata.py` and `python scripts/build_owner_readme.py`, then commit the generated files. Foundation text comes from `content/owner-foundations.json` and the README’s practical narrative from `content/owner-readme-workspace.json`; regenerate the standalone catalog with `python scripts/build_learning_catalog.py` after dictionary changes.', '',
        'Technical detail: [runtime](docs/runtime.md) · [limitations](docs/limitations.md) · [model card](docs/model-card.md) · [validation](docs/validation.md).', '']
    lines += ['</details>', '']
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
