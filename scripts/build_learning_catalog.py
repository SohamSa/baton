"""Export catalog definitions for reading without a simulation runtime."""
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'src'))
from baton.catalog.dictionary import build_catalog, catalog_counts
from baton.catalog.atlas import catalog_atlas


def render():
    fields = build_catalog()
    return json.dumps({'synthetic': True, 'counts': catalog_counts(fields), 'atlas': catalog_atlas(fields), 'fields': [f.to_dict() for f in fields]}, ensure_ascii=False, indent=2) + '\n'


if __name__ == '__main__':
    (ROOT / 'apps/web/public/learning-catalog.json').write_text(render(), encoding='utf-8')
