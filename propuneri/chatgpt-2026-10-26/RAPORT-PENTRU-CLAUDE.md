# LUMIS — audit independent și propunere de rafinare

Analiză la 26 octombrie 2026. Referințele de mai jos sunt la **sursa originală din pachetul Claude**, păstrată în `actualizari/claude-2026-10-26/sursa/`. `sursa-propusa/` conține corecțiile și designul propus, separat. Claude rămâne programatorul și designerul principal; acesta este material pentru verificarea și integrarea lui.

## Rezumat în cinci rânduri

1. Fotografia poate reapărea după închiderea configuratorului dacă decodarea se termină târziu: defect reprodus, cu remediere și test.
2. Schimbarea linkului către alt model cu dialogul deschis poate pierde contextul 3D și șterge noul link: defect reprodus, cu remediere și test.
3. Soclurile au o buză de numai ~0,20 mm lângă inel; Galet are și o margine exterioară de ~0,35 mm. Sunt prea fine pentru a presupune printarea lor fidelă cu duză de 0,4 mm.
4. Toate cele 11 STL-uri sunt închise și verificarea de coliziuni trece, dar aceasta nu validează printarea, filetul, lumina sau temperatura; verificatorul de surplomb omite punțile din verdict.
5. Propunerea vizuală păstrează identitatea LUMIS, folosește Manrope pentru lizibilitate, rescrie textele și adaugă zece imagini editoriale noi; imaginile rămân generate digital.

## Probleme prioritizate

| Gravitate | Unde în original | Constatare verificabilă | Corecție / livrabil |
|---|---|---|---|
| Important | `sursa/js/main.js:225`, `:248`, `:302` | Upload lent → închidere → decodare: handlerul repopulează fotografia după `clearPhoto()`, iar la redeschidere aceasta poate fi reutilizată. Promisiunea „se șterge la închidere” nu este respectată în această cursă. Fotografia rămâne locală, nu am observat upload către server. | Token separat pentru sesiunea produsului și cererea foto; ignorarea rezultatului expirat. `patch-uri/corectii-tehnice.patch`, test `audit-regressions.py`. |
| Important | `sursa/js/main.js:258`, `:280`, `:302` | Cu Wave deschis, schimbarea hash-ului la Ribbed închide/redeschide același dialog. Evenimentul `close` întârziat șterge noul hash și distruge noul studio. Am obținut `open=true`, `name=Ribbed`, `hash=''`, `isContextLost()=true`. | Reconfigurare fără `close()` când dialogul este deja deschis, invalidarea inițializărilor vechi și verificare înainte de alocarea rendererului. |
| Important pentru print | `sursa/lampa/geom.py:208`, `:222`, `sursa/lampa/spec.json` → `ring` | La z=35,7 mm: margine interioară 54,45−54,25 = **0,20 mm**, pe toate soclurile. Galet: margine exterioară 58,60−58,25 = **0,35 mm**. Confirmat și pe secțiunile STL-urilor atașate, nu doar din parametri. Un mesh închis nu demonstrează că slicerul păstrează aceste buze. | Candidat pentru probă: `ring.r_in=55.2`, `ring.r_out=57.3`, celelalte cote neschimbate. Rezultă nominal **0,80 mm** interior și **0,85 mm** exterior la Galet în secțiunea verificată. Vezi fișierul candidat și patch-ul separat. Nu sunt cote validate prin print. |
| Important — validator | `sursa/lampa/overhang.py:65` | Se afișează aria punților, dar aceasta nu intră în codul de ieșire. Un disc Ø90 mm pe un stâlp Ø10 mm are ~6283 mm² de față inferioară fără susținere locală; regula actuală îl acceptă deoarece aria fețelor oblice este zero. | Verdict separat „de revizuit” pentru fețe inferioare orizontale; cod de ieșire 2. Nu declară automat că trebuie suporturi, ci cere examinarea ancorării și punților în slicer. |
| Important — potrivirea fotografiei | `sursa/lampa/litofanie.py:83` | Așezarea automată se alege înainte de corectarea EXIF. Un JPEG stocat 160×80 cu orientare 6 este afișat 80×160 în browser: generatorul alege `wrap`, browserul `twice`. | `ImageOps.exif_transpose()` înainte de `suggest()`. Test cu JPEG sintetic EXIF. |
| Important pe dispozitive slabe | `sursa/js/litho.js:93` | Orice `image/*` este acceptat, fără limită de fișier sau rezoluție. O imagine foarte mare poate consuma multă memorie înaintea simulării. Nu am provocat intenționat epuizarea memoriei unui dispozitiv. | Limită de intrare 12 MiB, 40 MP și JPEG/PNG/WebP; tipul și dimensiunea fișierului se resping înaintea decodării, rezoluția înaintea procesării pe canvas. Limita de rezoluție nu elimină orice cost al decodorului. |
| Important la actualizări | `sursa/netlify.toml:15` | Imagini și fonturi cu nume fixe au cache `immutable` de un an. O republicare cu aceleași nume nu invalidează copia deja proaspătă din browser. | Propunerea folosește `max-age=0, must-revalidate`. Alternativa pentru producție: nume cu hash și cache lung pentru acele nume. |
| Blocant pentru declararea siguranței / vânzare | `sursa/lampa/GHID-PRINT.md:69`, `:39`, `sursa/lampa/fit.py:54` | „La 3 W ar trebui să rămână rece” nu este demonstrat. Ancorarea cablului este opțională, iar testul geometric nu validează tragerea, filetul, încălzirea sau izolarea. DIN 7981 și ISO 7045 nu sunt repere interschimbabile. | Textul de fabricație propus elimină presupunerea termică, cere măsurători și un reper concret de șurub. Prototip, componente măsurate, verificare mecanică și evaluarea cerințelor aplicabile înainte de vânzare. Software-ul nu poate înlocui aceste probe. |
| Important înainte de publicarea termenilor | `sursa/docs/legal/livrare-retur.md:11`, `termeni.md:41`, `CITESTE-INTAI.md:7` | Rambursarea este raportată greșit numai la primirea returului; SOL este indicată ca platformă activă; lista de repere include legislație veche. Textele sunt deja ciorne, deci nu constat un checkout activ neconform. | Ciornă corectată privind notificarea retragerii și dreptul de amânare, eliminarea SOL, actualizarea reperelor. Validarea formei consolidate și a aplicabilității rămâne la jurist. |

## Corecțiile de cod

`patch-uri/corectii-tehnice.patch` se aplică de la rădăcina unui pachet cu folderul `sursa/`:

```sh
git apply --check patch-uri/corectii-tehnice.patch
git apply patch-uri/corectii-tehnice.patch
```

Pentru branch-ul GitHub `claude/lumis-v2` la commit `c073f6b`, folosește în schimb `patch-uri/corectii-tehnice-lumis-v2.patch`, de la rădăcina repository-ului (`LUMIS/`, nu `sursa/`). Verifică mai întâi `git apply --check`; dacă între timp Claude a schimbat aceleași fișiere, integrează manual diferențele, fără a suprascrie munca lui.

Patch-ul tehnic nu modifică forma pieselor sau fotografiile. Fișierele complete corectate sunt și în `sursa-propusa/`, care include suplimentar propunerea de design. Folosește patch-ul tehnic dacă vrei să integrezi corecțiile fără schimbările vizuale. Nu aplica același patch peste sursa deja corectată.

Mecanismul principal al protecției pentru fotografie este:

```js
const request = ++photoRequest;
const session = productSession;
const image = await readPhoto(file);
if (request !== photoRequest || session !== productSession || !dlg.open) return;
photoImg = image;
```

Închiderea, schimbarea modelului și eliminarea fotografiei invalidează operațiile vechi. Inițializarea 3D este protejată similar. Un callback întârziat de încărcare a texturii mostrei eliberează textura dacă studioul a fost distrus între timp.

## Cotele candidate pentru inel

În `cad-candidati/spec-candidat-inel.json` sunt păstrate toate cotele originale, cu numai:

```json
"ring": {
  "r_in": 55.2,
  "r_out": 57.3,
  "height": 3.1,
  "seat_depth": 0.6,
  "reveal": 0.45
}
```

Calculul marginii interioare: `55.2 - 0.15 - (54 + 0.25) = 0.80 mm`.
Calculul marginii exterioare la Galet în secțiunea z=35,7: `58.6 - (57.3 + 0.45) = 0.85 mm`.

Am rerulat verificarea de coliziuni cu aceste două valori, în memorie, pentru toate cele trei socluri: nu a raportat coliziuni. **Nu am printat candidatul și nu am înlocuit STL-urile originale.** Inelul devine mai îngust și se mărește spațiul radial față de abajur; aspectul, lipirea și traseele slicerului trebuie verificate înaintea adoptării. După adoptare, trebuie regenerate piesele, `data/lamp-spec.js` și fixture-urile; nu edita separat geometria din site.

## Lumină, temperatură și asamblare

- Cu stâlp Ø36, bandă de 2,6 mm și difuzor Ø46 cu perete de 1 mm, spațiul radial de la LED la interiorul difuzorului este numai `22 - (18 + 2.6) = 1.4 mm`. La 60 LED/m, pasul nominal dintre LED-uri este ~16,7 mm. Există un risc plauzibil de puncte vizibile; nu pot confirma distribuția luminii dintr-un STL sau dintr-o randare artistică.
- Pentru o probă optică, compară difuzorul actual cu unul mai larg, de exemplu Ø60 mm, care ar oferi 8,4 mm spațiu radial la aceleași ipoteze. Aceasta este o **variantă experimentală**, nu o modificare inclusă sau verificată la coliziuni în acest pachet. Ar necesita regenerarea locașului și reverificarea tăvii de greutate, cablului, masei și temperaturii. Compară și o bandă COB de 5 V cu putere și dimensiuni reale cunoscute; nu presupune că orice bandă COB este compatibilă.
- Confirmă prin probă puterea reală și temperatura până la stabilizare. PLA, adezivul și banda au limite proprii; faptul că alimentarea este USB de 5 V nu validează întregul produs.
- Definește o ancorare a cablului care preia tragerea, înainte de ambalare și transport. Un canal fără coliziuni nu este un test de retenție.
- Alege un singur șurub comercial, măsoară capul și lungimea, testează pilotul Ø2,6 pe un cupon cu filamentul și orientarea reale. Testul actual modelează capul și vârful, nu smulgerea, cuplul sau filetul.
- Greutățile, difuzorul și cablul trebuie fixate pentru transport. Compară explicit livrarea asamblată cu livrarea cu abajurul separat; sursele inițiale le descriau diferit. Nu impune clientului un montaj incompatibil cu promisiunea comercială.

## Propunerea de design și text

- Manrope variabil, servit local, pentru interfață și corp de text. Bodoni Moda rămâne pentru LUMIS și titluri editoriale. Licența Manrope este inclusă.
- Corp de text 14 px, descrieri mai lizibile, contrast secundar mai bun, mai puține etichete în majuscule, nume de produse mai ușor de scanat.
- Mesajul „Amintirile tale, în lumină” și prezentarea celor patru lămpi sunt păstrate.
- Textele explică personalizarea și stadiul de prelansare, elimină superlativele și unele promisiuni încă neverificate. Dimensiunea nominală Galet este afișată aproximativ, în acord cu diametrul STL măsurat (~128,79 mm).
- Zece imagini noi: două compoziții de deschidere și perechi zi/seară pentru patru modele. Lumină mai neutră, umbre și texturi mai detaliate; versiunile WebP păstrează încărcarea responsive.
- Cele trei cadre ale camerei nu au fost regenerate separat: alinierea lor este păstrată.
- Nu aș adăuga încă mai multe secțiuni decorative. Atelierul va câștiga mai mult din fotografii reale de producție decât din încă o galerie ilustrativă. Nicio fotografie de atelier nu a fost inventată.

**Limita imaginilor noi:** sunt reprezentări generate, cu posibile abateri față de CAD, inclusiv la profilul soclului. Nu certifică aspectul piesei fabricate, culoarea filamentului sau lumina reală. Înainte de vânzare, fotografiază prototipurile și înlocuiește reprezentările care nu coincid cu ele. Perechile de produs regenerate nu garantează identitate la nivel de pixel; compară-le vizual înainte de aprobare.

## Ce am verificat efectiv

- **19/19 teste Node originale trecute**, fără teste omise.
- Cele **10 verificări browser din arhivă** au trecut în Chromium cu CSP-ul din Netlify, folosind executabilul local și flag-uri compatibile cu mediul. Cu flag-ul original `--use-angle=swiftshader`, două verificări au eșuat intermitent și evenimentele legate de cadre au întârziat; nu le prezint ca defecte ale histerezisului sau ale închiderii normale. Runnerul propus permite `CHROMIUM_PATH` și elimină acea forțare a driverului. Am păstrat și completările ulterioare de pe `claude/lumis-v2` (commit `c073f6b`): inerția rotiței, etichetele corecte „Randări” și testul suplimentar pentru scroll. **Toate cele 11 verificări ale runnerului final au trecut cu CSP.**
- **6 grupuri de regresii browser noi trecute** pe corecții: fotografie întârziată, schimbare de link în dialog deschis, import 3D întârziat, eveniment `close` vechi după redeschidere imediată, limitarea tipului/mărimii fotografiei, lipsa suprapunerii la 360/390/768 px.
- **2 teste Python noi trecute**: orientarea EXIF înaintea așezării automate și controlul negativ pentru o față orizontală care nu poate fi declarată automat fără suporturi.
- **11/11 STL-uri deschise și inspectate numeric**: watertight, winding consistent, o singură componentă fiecare. Abajururile au 182 mm; coordonatele lor asamblate sunt z=26…208 mm. Aceasta nu este o orientare greșită: pachetul precizează coordonate de asamblare.
- `fit.py` original: trece pentru Galet, Monolit și Con, la componentele tipice modelate. Candidatul de inel: aceeași verificare trece pentru toate cele trei.
- `overhang.py` original: cod 0, dar cu arii de punți afișate și neincluse în verdict; control negativ separat confirmă limita. Varianta corectată semnalează revizuirea punților, nu pretinde certificarea printării.
- Capturi comparative înainte/după la **1440×900 și 390×844**, fără erori de pagină/HTTP sau depășire orizontală în fluxul capturat.
- Remedierea mobilă primită este confirmată în viewporturile testate: nota este ascunsă pe telefon și controalele nu se suprapun cu un text vizibil. Ascunderea notei nu validează automat toate dimensiunile, zoom-urile sau cititoarele de ecran.

## Ce nu am verificat

Nu am printat, nu am rulat Bambu Studio, nu am măsurat temperatura, uniformitatea luminii, rezistența la transport sau retenția șuruburilor/cablului. Nu am folosit telefoane fizice, Safari/Firefox sau cititoare de ecran reale și nu am măsurat un prag garantat de FPS. Nu am făcut audit juridic sau certificarea produsului. Exportul autonom este verificat ca document cu resurse încorporate; navigarea `file://` este blocată de politica browserului cloud, deci nu pretind un test de dublu-clic local în acel browser.

## Înainte de lansare

1. Închide defectele tehnice și verifică independent patch-urile.
2. Revizuiește cu slicerul marginile, punțile și baioneta, apoi printează cupoane și un prototip complet.
3. Definește BOM-ul și validează temperatura, lumina, cablul, fixările și ambalarea pe hardware real.
4. Înlocuiește imaginile neconforme cu fotografii reale și stabilește prețurile, livrarea și datele comerciantului.
5. Validează termenii, returul, confidențialitatea fotografiilor și obligațiile aplicabile produsului cu specialiștii potriviți. Păstrează checkout-ul dezactivat până la integrarea reală.
