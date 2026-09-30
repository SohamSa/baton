"""The reading journey's navigation and promises must stay connected to the project."""
import importlib.util
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def test_owner_cast_covers_engine_stories_and_existing_routes():
    from baton.simulation.stories import STORIES
    story = json.loads((ROOT / 'content/owner-journey.json').read_text())
    assert {c['id'] for c in story['characters']} == set(STORIES)
    assert len({c['id'] for c in story['characters']}) == len(story['characters'])
    chapters = {c['id'] for c in story['chapters']}
    routes = set(re.findall(r'path="([^"]+)"', (ROOT / 'apps/web/src/App.tsx').read_text()))
    for character in story['characters']:
        assert character['chapter'] in chapters
        assert character['route'] in routes
        assert character['coverage'] and character['question'] and character['fields']
    assert all(chapter['route'] in routes for chapter in story['chapters'])
    assert [c['id'] for c in story['chapters']][-2:] == ['finale', 'dawn']


def test_readme_is_the_same_story_and_finale_has_explained_choices():
    spec = importlib.util.spec_from_file_location('owner_readme', ROOT / 'scripts/build_owner_readme.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert module.render() == (ROOT / 'README.md').read_text(encoding='utf-8')
    assert module.render_reference() == (ROOT / 'docs/story-reference.md').read_text(encoding='utf-8')
    story = json.loads((ROOT / 'content/owner-journey.json').read_text())
    for turn in story['finale']:
        assert len(turn['options']) >= 2
        assert sum(option['supported'] for option in turn['options']) == 1
        assert all(option['feedback'] for option in turn['options'])


def test_public_story_explanations_and_generated_metadata_stay_in_sync():
    from baton.simulation.stories import list_stories
    from baton.catalog.owner_metadata import OWNER_CHARACTERS
    source = json.loads((ROOT / 'content/owner-journey.json').read_text())
    assert OWNER_CHARACTERS == {c['id']: c for c in source['characters']}
    for item in list_stories():
        c = OWNER_CHARACTERS[item['id']]
        assert item['coverage'] == c['coverage']
        assert item['owner_playbook']['solution'] == c['lesson']
        assert item['owner_playbook']['problem'] == c['scene']
