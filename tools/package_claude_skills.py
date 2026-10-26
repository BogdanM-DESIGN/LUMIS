#!/usr/bin/env python3
"""Package redistributed skills individually for optional Claude.ai upload."""
import io
import json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parents[1]
DESCRIPTIONS={
'impeccable':'Audit and refine website design, typography, layout, motion, accessibility and responsive behaviour. Some features require the included launcher and a supported code environment.',
'frontend-design':'Design distinctive, intentional production web interfaces with coherent typography, layout and visual direction.',
'canvas-design':'Create original static visual designs, posters and graphic compositions as PNG and PDF files.',
'webapp-testing':'Test local web applications with Python Playwright, browser screenshots and logs; verify interactions and debug UI behaviour.',
'skill-creator':'Create, improve and evaluate reusable agent skills, including realistic test scenarios and triggering descriptions.',
'product-marketing':'Create and maintain shared product, audience, positioning and brand-voice context before marketing work.',
'customer-research':'Research and synthesise real customer interviews, reviews, surveys and public sources; distinguish observed evidence from hypotheses.',
'competitor-profiling':'Research competitors from their website URLs and produce sourced, structured profiles of products, positioning and publicly available information.',
'copywriting':'Write and improve marketing page copy, headlines and product descriptions using product context and customer evidence.',
'cro':'Review marketing pages and forms for clarity, usability and conversion problems; propose measurable improvements.',
'ad-creative':'Develop and iterate advertising concepts, headlines, copy and video creative for paid advertising placements.',
'social':'Plan and create social media posts, carousels, short-form video scripts and content calendars.',
'seo-audit':'Audit website technical and on-page SEO, indexing, metadata and search visibility using available evidence.',
'marketing-plan':'Develop a staged marketing plan with priorities, budget assumptions, channel choices and measurable next steps.',
'ads':'Plan and analyse paid advertising campaigns, audiences, budgets and optimisation. Actual account access and campaign actions require separate authorisation.',
'image':'Plan, create, edit and optimise marketing imagery using available image tools; tool access is separate from this skill.',
'video':'Plan and produce videos with available generation tools or programmatic frameworks, including scripts, assets, timing and exports.',
'lumis-brand':'Preserve LUMIS visual identity, Romanian copy, approved typography and CAD fidelity in website design, imagery, ads and video.',
'lumis-print-quality':'Review LUMIS CAD, STL/3MF, tolerances, wall thickness, slicing, LED diffusion and prototype tests; distinguish computed from physically verified results.',
'lumis-quality-review':'Review LUMIS mobile layout, configurator, photo privacy, motion and truthful commercial claims using relevant regression tests.',
'lumis-cost-analysis':'Build LUMIS manufacturing cost models, budgets, spreadsheets and charts from sourced inputs, leaving unknowns explicit.'}

def main():
    output=ROOT/'livrare/LUMIS-skills-Claude.zip'; output.parent.mkdir(exist_ok=True)
    lock=json.loads((ROOT/'docs/skills/sources.lock.json').read_text())
    names=[x['name'] for x in lock['skills']]+[x for x in DESCRIPTIONS if x.startswith('lumis-')]
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as outer:
        outer.writestr('CITESTE-INTAI.txt','Dezarhiveaza acest pachet. Incarca ZIP-urile individuale in sectiunea Skills din Claude.ai, daca este disponibila. Nu incarca pachetul exterior ca un singur skill.\nVezi ghidul README.md pentru limite si instalarea Remotion in Claude Code.\n')
        outer.write(ROOT/'docs/skills/README.md','README.md')
        for name in names:
            folder=ROOT/'.claude/skills'/name
            raw=(folder/'SKILL.md').read_text();_,header,body=raw.split('---',2)
            packed='---\nname: '+name+'\ndescription: '+json.dumps(DESCRIPTIONS[name])+'\n---'+body
            stream=io.BytesIO()
            with zipfile.ZipFile(stream,'w',zipfile.ZIP_DEFLATED) as inner:
                for p in sorted(folder.rglob('*')):
                    if p.is_file():
                        arc=name+'/'+str(p.relative_to(folder))
                        if p.name=='SKILL.md' and p.parent==folder:inner.writestr(arc,packed)
                        else:inner.write(p,arc)
                inner.writestr(name+'/UPSTREAM-SKILL.md',raw)
                inner.writestr(name+'/PACKAGING-NOTE.md','2026-10-26: For the Claude.ai upload package only, frontmatter was reduced to name and a shorter description. Instructions and resources are preserved. Original metadata: UPSTREAM-SKILL.md. Repository source is unchanged. This does not install external runtimes or tools.\n')
            with zipfile.ZipFile(io.BytesIO(stream.getvalue())) as check:
                assert check.testzip() is None
            outer.writestr(name+'.zip',stream.getvalue())
    with zipfile.ZipFile(output) as check:
        assert check.testzip() is None
    print(f'Created {output.name}: {len(names)} individual skills, {output.stat().st_size} bytes.')

if __name__=='__main__':main()
