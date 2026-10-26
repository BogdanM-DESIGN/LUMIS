> **Skill-uri pentru Claude:** [ghid de instalare și utilizare](docs/skills/README.md) · [pachet pentru Claude.ai](livrare/LUMIS-skills-Claude.zip?raw=true). Instrucțiunile proiectului sunt în [CLAUDE.md](CLAUDE.md). Pentru video în Claude Code: `python tools/install_video_skills.py`.

# LUMIS

Lămpi decorative printate 3D: site de prezentare cu configurator și fișierele pentru lampa reală, din aceeași sursă.

**Stadiu: prelansare.** Nu există prețuri, firmă, plată sau fotografii ale produselor fabricate. Toate imaginile sunt randări digitale, iar site-ul spune asta. Nicio piesă nu a fost încă printată.

## Ce e aici

| Cale | Ce conține |
|---|---|
| [`LUMIS/`](LUMIS/) | **sursa principală**: site-ul, generatorul de piese, fișierele de print, testele și documentația. Începe cu [`LUMIS/README.md`](LUMIS/README.md). |
| [`LUMIS/lampa/`](LUMIS/lampa/) | lampa reală: `spec.json` (dimensiunile), generatorul, fișierele 3MF gata de print și [ghidul de print și asamblare](LUMIS/lampa/GHID-PRINT.md) |
| [`LUMIS/VERIFICARE.md`](LUMIS/VERIFICARE.md) | ce a fost verificat și ce nu |
| [`LUMIS/docs/`](LUMIS/docs/) | lista de fotografii reale de făcut, ciornele juridice (de verificat de un avocat) și randările soclurilor |
| `LUMIS-deschide.html` | tot site-ul într-un singur fișier, pentru prezentare: se deschide cu dublu-clic într-un browser |
| [`PREDARE-CHATGPT.md`](PREDARE-CHATGPT.md) | context și reguli pentru analiza făcută de ChatGPT |
| [`PROMPT-PENTRU-CLAUDE.md`](PROMPT-PENTRU-CLAUDE.md) | brieful de rafinare a site-ului |
| `imagini-noi-master/`, `original/` | imaginile master și pachetul inițial, păstrate pentru referință |

## Istoric și propuneri

- **Auditul și propunerea ChatGPT/Codex din 26 octombrie 2026** (ramura [`codex/lumis-audit-design-2026-10-26`](https://github.com/BogdanM-DESIGN/LUMIS/tree/codex/lumis-audit-design-2026-10-26/propuneri/chatgpt-2026-10-26)): corecțiile tehnice, designul cu Manrope, textele, imaginile noi și testele de regresie sunt integrate în `LUMIS/`, după verificare. Ce s-a preluat și ce s-a ajustat e descris în PR.
- `actualizari/claude-2026-10-26/` și `livrare/`: copia pachetului trimis pentru analiza ChatGPT, păstrată pentru istoric. Sursa curentă e `LUMIS/`.
- `original/` și `imagini-noi-master/`: pachetul inițial și imaginile lui master.

## Rulare și teste

```
cd LUMIS
python3 -m http.server 8080          # site-ul, la http://localhost:8080
node --test tests/*.test.mjs         # 19 teste: coș, linkuri, potrivirea formelor site / piese
node tests/browser-smoke.cjs         # 11 verificări în Chromium (necesită Playwright)
python tests/audit-regressions.py URL # 6 regresii în browser (Playwright pentru Python)
python lampa/generate.py             # regenerează piesele (necesită trimesh, manifold3d, shapely)
python lampa/overhang.py             # pante de print și pereți
python lampa/fit.py                  # lampa asamblată în calculator, cu LED, cablu și șuruburi
```

## Cum lucrăm

- **Claude:** programare, design, piesele lămpii.
- **ChatGPT:** cerințe, analiză și verificarea rezultatelor.
- **Proprietarul:** decizii, print de test și aprobarea finală.

Fiecare etapă vine ca **pull request draft**, pe care proprietarul îl verifică înainte de unirea în `main`. Observațiile se scriu ca comentarii la PR sau ca issue.
