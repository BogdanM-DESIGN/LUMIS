#!/usr/bin/env python3
"""Check installation structure and pinned upstream integrity using Python stdlib."""
import hashlib
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'.claude/skills'

def digest(folder):
    return {str(p.relative_to(folder)):hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(folder.rglob('*')) if p.is_file()}

def main():
    lock=json.loads((ROOT/'docs/skills/sources.lock.json').read_text())
    names=[]
    for folder in sorted(BASE.iterdir()):
        if not folder.is_dir():continue
        skill=folder/'SKILL.md'
        if not skill.is_file():raise SystemExit(f'Missing SKILL.md: {folder.name}')
        text=skill.read_text()
        assert text.startswith('---\n'), f'Missing frontmatter: {folder.name}'
        metadata=text.split('---',2)[1]
        match=re.search(r'^name:\s*([a-z0-9-]+)\s*$',metadata,re.M)
        assert match and match[1]==folder.name, f'Skill name mismatch: {folder.name}'
        assert re.search(r'^description:\s*\S',metadata,re.M), f'No description: {folder.name}'
        names.append(folder.name)
        # Avoid accidentally publishing environment secrets or customer-upload data.
        assert not any(p.name in {'.env','.git','node_modules'} for p in folder.rglob('*')),folder.name
    assert len(names)==len(set(names))
    for entry in lock['skills']:
        actual=digest(BASE/entry['name'])
        assert actual==entry['files'], f'Upstream integrity mismatch: {entry["name"]}'
    for name in ['lumis-brand','lumis-print-quality','lumis-quality-review','lumis-cost-analysis']:
        assert name in names,f'Missing project skill: {name}'
        data=json.loads((BASE/name/'evals/evals.json').read_text())
        assert data['skill_name']==name and len(data['evals'])>=2
    receipt=ROOT/'.claude/remotion-install.local.json'
    video_status='not installed locally; run python tools/install_video_skills.py'
    if receipt.exists():
        data=json.loads(receipt.read_text())
        assert data['source']==lock['local_only']['remotion']
        for name,expected in data['skills'].items():
            assert digest(BASE/name)==expected, f'Remotion local change: {name}'
        video_status=f'{len(data["skills"])} locally installed, integrity verified'
    assert not (BASE/'xlsx').exists(),'Proprietary XLSX skill should not be redistributed'
    print(json.dumps({'project_skills':len(names),'vendored_upstream':len(lock['skills']),
      'custom_lumis':4,'upstream_integrity':'PASS','remotion':video_status,
      'model_evaluations':'NOT RUN; prepared scenarios are not Claude performance evidence',
      'image_video_generation':'requires an available tool/runtime; not activated by instructions'},indent=2))

if __name__=='__main__':main()
