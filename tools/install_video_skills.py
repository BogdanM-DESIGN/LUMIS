#!/usr/bin/env python3
"""Install the pinned official Remotion skills locally, without republishing them.
No npm packages, hooks, generators, paid APIs or external account connections run.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]

def digest(folder):
    return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(folder.rglob('*')) if p.is_file()}

def install(source):
    lock = json.loads((ROOT/'docs/skills/sources.lock.json').read_text())['local_only']['remotion']
    actual = subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
    if actual != lock['commit']:
        raise SystemExit('Source revision differs from the pinned Remotion revision.')
    source_skills = source/'skills'
    names = sorted(p.name for p in source_skills.iterdir() if (p/'SKILL.md').is_file())
    # Preflight every destination before copying any folder; preserve local changes.
    expected = {name:digest(source_skills/name) for name in names}
    for name in names:
        target = ROOT/'.claude/skills'/name
        if target.exists() and digest(target) != expected[name]:
            raise SystemExit(f'Local changes found in {target}. Nothing overwritten.')
    for name in names:
        target = ROOT/'.claude/skills'/name
        if not target.exists():
            shutil.copytree(source_skills/name,target)
    receipt = {'source':lock,'skills':expected,'runtime':'not installed; Remotion project/runtime is separate'}
    (ROOT/'.claude/remotion-install.local.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print(f'Installed/verified {len(names)} official Remotion skills at {actual[:12]}.')
    print('Reload Claude Code in this checkout. No video runtime or paid API was activated.')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,help='Existing checkout at exactly the pinned commit')
    args = parser.parse_args()
    if args.source:
        install(args.source.resolve())
        return
    lock = json.loads((ROOT/'docs/skills/sources.lock.json').read_text())['local_only']['remotion']
    with tempfile.TemporaryDirectory(prefix='lumis-remotion-') as temp:
        source=Path(temp)/'source'
        subprocess.run(['git','init','-q',str(source)],check=True)
        subprocess.run(['git','-C',str(source),'remote','add','origin',lock['url']+'.git'],check=True)
        subprocess.run(['git','-C',str(source),'fetch','--depth','1','origin',lock['commit']],check=True)
        subprocess.run(['git','-C',str(source),'checkout','--detach','-q','FETCH_HEAD'],check=True)
        install(source)

if __name__ == '__main__':
    main()
