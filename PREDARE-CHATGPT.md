# Predare pentru ChatGPT: analiză critică LUMIS

Ești un evaluator independent. Te rog să faci o **analiză critică** a proiectului de mai jos și, unde poți, să propui **îmbunătățiri concrete, cu cod sau cu valori exacte**. Nu vreau laude generale, ci probleme reale, ordonate după gravitate, fiecare cu **fișierul și linia** sau **piesa și cota** la care se referă.

Lucrezi pe repository-ul GitHub **BogdanM-DESIGN/LUMIS**. Sursa e în `LUMIS/`. Pentru fiecare schimbare există un pull request; scrie observațiile ca **comentarii la PR** (cu fișier și linie) sau ca **issue**, ca să le poată prelua Claude.

| Cale | Ce e |
|---|---|
| `LUMIS/` | codul site-ului și generatorul pieselor (`LUMIS/lampa/`) |
| `LUMIS-deschide.html` | tot site-ul într-un singur fișier |
| `LUMIS/lampa/print/` | piesele printabile (3MF, milimetri) |
| `LUMIS/docs/randari/` | randări ale soclurilor |

## 1. Proiectul

**LUMIS** e un mic brand de lămpi decorative printate 3D, asamblate manual în România. Faza actuală e **prelansarea**: nu există încă prețuri, firmă, plată sau fotografii ale produselor reale. Toate imaginile sunt **randări** și site-ul spune asta.

- **4 abajururi:** Litofanie (personalizată după fotografia clientului), Wave, Twist, Ribbed.
- **3 socluri:** Galet (bombat), Monolit (cilindru cu muchii rotunjite), Con (mai lat jos).
- **Culori de soclu:** Alb mat #E2DFD8, Negru mat #222120, Grafit #48484A, Champagne #CDB68C.
- **Inel:** Champagne sau „Linie de lumină” (PLA translucid).
- **Lumină:** bandă LED 5 V USB, ~3 W, înfășurată pe un stâlp, sub un difuzor.
- **Imprimantă:** Bambu Lab, duză 0,4 mm, PLA.

## 2. Ce s-a făcut pe site

- **Structură:** site static, fără server, fără analytics și fără servicii externe. Folosește module ES, Three.js r160 inclus local, fonturi locale (Bodoni Moda + Instrument Sans) și imagini WebP cu `srcset`. Politica CSP strictă e în `netlify.toml`.
- **Deschiderea:** logoul mare LUMIS peste imaginea cu cele patru lămpi.
- **Camera zi/seară:** la derulare, aceeași cameră trece de la zi la seară, apoi lampa se aprinde, cu histerezis, ca să nu clipească.
- **Colecția:** generată din `data/catalog.js`.
- **Configuratorul:** previzualizare 3D (soclu, culoare, inel, aprinsă/stinsă, rotire cu mouse, touch sau săgeți). Formele din 3D vin din aceeași sursă ca piesele printate (`lampa/spec.json`), iar un test verifică faptul că razele coincid.
- **Litofania:** fotografia clientului se prelucrează **doar în browser**, nu se trimite nicăieri și nu se salvează. Poate fi așezată de jur împrejur, față și spate sau doar pe față.
- **Coșul:** e salvat în localStorage, fără date personale. Butonul de comandă e **dezactivat intenționat**. Clientul poate copia selecția și o poate trimite.
- **Linkuri directe:** fiecare configurație are link propriu, de exemplu `#lampa/ribbed/con/champagne/lumina`.
- **Secțiunea Atelier:** doar text, cu sloturi pregătite pentru fotografii reale.
- **Accesibilitate:** dialoguri `<dialog>`, focus gestionat, suport pentru reduced-motion.
- **Teste:** 19 teste unitare (`node --test tests/*.test.mjs`) și 10 verificări în browser (`node tests/browser-smoke.cjs`, necesită Playwright).

## 3. Ce s-a făcut la lampă

- **Generator:** un singur fișier de dimensiuni (`lampa/spec.json`). `lampa/generate.py` (trimesh + manifold3d + shapely) scrie piesele 3MF, iar `data/lamp-spec.js` duce aceleași dimensiuni pe site.
- **Abajur:** perete de 0,9 mm, cu guler de 10 mm și baionetă (3 fante în J, răsucire de 20°). Înălțime totală 182 mm.
- **Soclul, varianta 2:**
  - se printează drept, fără suporturi;
  - stă pe o plintă retrasă cu 2,6 mm, deci apare o „linie de umbră”, iar cablul iese prin ea, la spate;
  - teșitură de 45° sus și un șanț de 0,45 mm în jurul inelului;
  - în interior, un tavan conic de 45°, o flanșă de 8 mm și 3 bosaje pentru șuruburi M3 × 8 cu cap bombat.
- **Capacul de jos (plinta):**
  - stâlp LED Ø36 mm, înalt de 112 mm;
  - tavă inelară pentru alice de oțel (Galet ~150 g, Monolit și Con ~250 g);
  - **canal deschis** pentru cablu, ca mufa USB să nu treacă prin nicio gaură;
  - locașuri pentru picioare de pâslă.
- **Difuzor:** Ø46 mm, cu decupaj la bază deasupra cablului.
- **Inel:** se lipește în locașul de pe soclu.
- **Litofania:** `lampa/litofanie.py` transformă o fotografie în abajur printabil, cu peretele între 0,8 mm și 3 mm, folosind aceeași prelucrare ca previzualizarea de pe site.
- **Verificări automate:**
  - `lampa/overhang.py`: pantele mai mari de 45° și orice ieșire a pieselor din profilul exterior;
  - `lampa/fit.py`: asamblează lampa în calculator, cu banda LED, cablul și șuruburile modelate la dimensiuni tipice, și caută coliziuni.
- **Ce s-a descoperit și reparat recent:**
  - bosajele șuruburilor ieșeau cu 2 mm prin peretele soclului;
  - cablul trebuia trecut printr-o gaură de 5 mm, în care mufa USB nu intră;
  - difuzorul strivea cablul;
  - locașul pentru capul șurubului nu avea joc.

**Nimic nu a fost printat încă.** Detaliile sunt în `LUMIS/VERIFICARE.md` și `LUMIS/lampa/GHID-PRINT.md`.

## 4. Ce vreau de la tine

### A. Site
1. **Bugurile reale:** în cod (`LUMIS/js/*.js`, `LUMIS/css/site.css`, `LUMIS/index.html`), cu fișier și linie.
2. **Accesibilitatea:** focus, cititoare de ecran, contrast, tastatură, touch.
3. **Performanța pe telefoane slabe:** dimensiunea imaginilor și randarea 3D.
4. **Designul:** vreau un stil aerisit, de tip Zara sau magazin de design, cu lampa în centrul atenției, nu o pagină încărcată. Ce ai scoate sau ai simplifica? Folosește capturile din PR sau din `LUMIS-deschide.html`.
5. **Textele (în română):** sunt clare și credibile? Promit ceva ce nu se poate garanta?

### B. Lampa
1. **Printabilitatea pe Bambu Lab cu duză 0,4 mm:** pereți prea subțiri, punți, toleranțe. Verifică pe fișierele 3MF din `LUMIS/lampa/print/`.
2. **Asamblarea și funcționarea:** se potrivesc piesele între ele? Cum rămâne cu banda LED, cablul, șuruburile și greutatea? Ce s-ar putea strica la transport?
3. **Lumina:** se va vedea banda LED ca puncte prin abajurul de 0,9 mm? Ar ajuta un difuzor diferit sau o altă poziție a benzii?
4. **Încălzirea și siguranța:** PLA, 3 W, alimentare USB.
5. **Designul soclului:** îl poți face mai frumos fără să-l faci mai greu de printat? Uită-te în `LUMIS/docs/randari/`.

### C. Ce lipsește înainte de o lansare reală
Din punct de vedere tehnic, comercial și legal în România. Sunt ciorne în `LUMIS/docs/legal/`, marcate „de verificat de un avocat”.

## 5. Reguli

- **Nu inventa** prețuri, recenzii, stocuri, termene sau promisiuni comerciale.
- **Nu propune un checkout** care ar pretinde că a trimis o comandă sau a încasat bani.
- **Nu propune salvarea fotografiilor clienților** în localStorage, în export sau trimiterea lor către terți.
- **Nu propune** analytics, servicii plătite sau chei API.
- **Nu prezenta randările** drept fotografii ale produselor reale.
- **Păstrează** numele și logoul LUMIS, deschiderea cu logoul mare peste cele patru lămpi și exportul selecției. Turul automat a fost scos la cererea proprietarului; nu îl readuce.
- **Spune clar ce ai verificat efectiv** (de exemplu, ai rulat codul sau ai deschis piesele) și ce doar presupui. Nu declara că ai testat pe telefoane reale dacă nu ai făcut-o.

## 6. Forma răspunsului

1. **Rezumat în 5 rânduri:** care sunt cele mai grave 3 probleme.
2. **Tabel de probleme:** gravitate (blocant / important / minor), unde (fișier:linie sau piesă), ce e greșit, cum se repară.
3. **Pentru fiecare problemă blocantă sau importantă, reparația concretă:**
   - cod, ca diff sau ca fișier complet, sau
   - valori noi pentru `lampa/spec.json`.
   Nu trimite doar imagini sau descrieri.
4. **Ce ai verificat efectiv și ce nu.**
