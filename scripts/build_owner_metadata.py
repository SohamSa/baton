"""Make the browser's narrative coverage available to the Python engine bundle."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def render():
    characters=json.loads((ROOT/'content/owner-journey.json').read_text(encoding='utf-8'))['characters']
    return '"""Generated owner explanations; edit content/owner-journey.json instead."""\n\nOWNER_CHARACTERS = ' + repr({c['id']:c for c in characters}) + '\n'

if __name__=='__main__':
    (ROOT/'src/baton/catalog/owner_metadata.py').write_text(render(),encoding='utf-8')
