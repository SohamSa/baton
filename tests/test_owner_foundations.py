"""Foundations must preserve the real catalog and avoid a second field dictionary."""
import importlib.util
import json
from pathlib import Path
from baton.catalog.dictionary import build_catalog

ROOT = Path(__file__).resolve().parents[1]


def test_reading_catalog_is_generated_from_the_complete_engine_dictionary():
    spec = importlib.util.spec_from_file_location('reading_catalog', ROOT/'scripts/build_learning_catalog.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    assert module.render() == (ROOT/'apps/web/public/learning-catalog.json').read_text()
    data = json.loads(module.render())
    definitions = build_catalog()
    assert data['fields'] == [f.to_dict() for f in definitions]
    assert sum(t['column_count'] for t in data['atlas']['tables']) == len(definitions)


def test_essential_readings_exist_and_foundations_are_shared_with_readme():
    source = json.loads((ROOT/'content/owner-foundations.json').read_text())
    names = {f.name for f in build_catalog()}
    for group in source['essentials']:
        assert set(group['fields']) <= names
    readme = (ROOT/'README.md').read_text()
    for item in source['basics']:
        assert item['explanation'] in readme
    for paragraph in source['dataPrinciples']:
        assert paragraph in readme
