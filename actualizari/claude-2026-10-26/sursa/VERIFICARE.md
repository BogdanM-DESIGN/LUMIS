# Ce a fost verificat și ce nu

Data: 26 octombrie 2026.

## Verificat automat, la fiecare rulare

- `node --test tests/*.test.mjs` (19 teste): coșul (îmbinare, limite, date corupte, export fără date personale); potrivirea razelor între site și piesele printate (aceleași eșantioane din `lampa/generate.py`); linkurile directe (dus-întors, coduri necunoscute, linkuri stricate).
- `node tests/browser-smoke.cjs` (10 verificări, Chromium headless, cu politica CSP din `netlify.toml`): imaginile din colecție se văd; aprinderea din secțiunea zi/seară are histerezis; previzualizarea 3D pornește la fiecare deschidere; coșul se păstrează după reîncărcare și ignoră datele corupte; linkurile directe deschid configurația corectă și se șterg la închidere; nicio eroare în pagină și nicio cerere eșuată.
- `python lampa/overhang.py`: nicio piesă nu are pante peste 45° care să ceară suporturi, în orientarea din fișiere.
- Tot `lampa/overhang.py`: nimic din interiorul soclului nu iese prin peretele exterior. Verificarea a fost adăugată după ce randarea a arătat o adâncitură: bosajele pentru șuruburi ieșeau cu până la 2 mm prin perete, la baza corpului, pe toate cele trei socluri. Problema e reparată, iar acum e 0,00 mm.
- `lampa/generate.py`: fiecare piesă e un solid închis (watertight).
- Exportul autonom `LUMIS-deschide.html`, deschis din `file://` în Chromium: pagina, fonturile, colecția, Atelierul și modelul 3D se încarcă, fără erori.

- `python lampa/fit.py`: lampa asamblată în calculator, pentru fiecare soclu, cu componentele cumpărate modelate după dimensiunile tipice (bandă LED de 2,6 mm grosime, cablu Ø3,8 mm, șuruburi M3 × 8 cu cap Ø5,6 mm): nicio coliziune, iar șuruburile prind 6,4 mm în bosaje. Testul a fost verificat și invers: o bandă de 5 mm sau un șurub de 12 mm sunt semnalate ca probleme.

## Verificat o dată, manual, în acest proiect

- Capturi la lățimi simulate de 390, 768, 1280 și 1440 px. **Simulate, nu pe telefoane sau tablete reale.**
- Știfturile baionetei cad în canale; inelul de sprijin are 5,4 mm.

## Nu a fost verificat

- **Nicio piesă nu a fost printată.** Toleranța baionetei, a buzei de centrare și a găurilor pentru șuruburi trebuie confirmate cu un print de test (`lampa/GHID-PRINT.md`, pasul 1).
- Cum arată și cât de uniform luminează lampa reală; contrastul real al litofaniei.
- Încălzirea LED-ului după funcționare îndelungată.
- Componentele reale: am modelat dimensiuni tipice, nu o bandă, un cablu sau șuruburi anume. Măsoară-le pe cele cumpărate (grosimea benzii cu LED-uri, diametrul cablului, diametrul capului de șurub).
- Safari pe iPhone/Mac, Firefox, cititoare de ecran reale (VoiceOver, TalkBack, NVDA). Structura ARIA a fost scrisă pentru ele, dar nu a fost ascultată.
- Performanța pe telefoane slabe.
- Textele juridice din `docs/legal/`: sunt ciorne, **nu au fost verificate de un avocat**.
- Randările sunt ilustrații. Culoarea filamentelor reale poate diferi.
