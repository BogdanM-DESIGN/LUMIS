# LUMIS — site & configurator

Deschiderea cu LUMIS peste cele patru lămpi este păstrată. Pagina include o poveste zi → seară → aprindere, colecția, un scurt proces de personalizare și configuratorul în foaie modală.

## Cum îl vezi

**Cel mai simplu:** deschide `LUMIS-deschide.html` din livrare în Chrome, Edge, Firefox sau Safari actualizat. Este copia de prezentare autonomă: fonturile, imaginile, datele și codul 3D sunt încorporate. Nu necesită instalare sau conexiune. Fișierul trebuie descărcat și deschis în browser; unele vizualizatoare de atașamente nu execută JavaScript. Stocarea coșului pentru fișiere locale depinde de browser.

**Pentru dezvoltare și publicare:** din folderul `LUMIS`, rulează:

```sh
python3 -m http.server 8080
```

Deschide adresa locală afișată de server în browser. Pe Windows poate fi necesar `py -m http.server 8080`. Nu deschide `index.html` modular direct prin `file://`; modulele și datele JSON se încarcă prin HTTP.

Nu este necesar `npm install` pentru rularea site-ului. Three.js r180 este inclus local, împreună cu licența MIT. Este încărcat dinamic numai la prima deschidere a configuratorului.

## Ce funcționează

- Patru modele, fiecare cu trei socluri, patru culori și două inele: 24 de configurații pentru fiecare model.
- Studio 3D cu actualizare reală a geometriei și materialelor, rotație prin tragere sau săgeți și aprindere/stingere. Modelele sunt aproximări vizuale parametrice, nu CAD de fabricație și nu simulări fotometrice.
- Galerie zi/seară/detaliu. Imaginile de ambient nu se recolorează după opțiuni; Studio 3D arată configurația selectată.
- Litofanie: încărcare JPG/PNG/WebP, max. 12 MB și 40 MP, simulare caldă pe canvas și pe modelul 3D. Fotografia nu părăsește browserul, nu este salvată în localStorage și este eliminată la închiderea produsului. Coșul păstrează numai opțiunile.
- Coș persistent, cantități, eliminare și export JSON al selecției. Fără transmitere de comandă sau încasări.
- Tranziție de zi/seară legată de derulare, aprindere în 520 ms la progres ≥ 0,55 și stingere sub 0,50. Textul se schimbă la același prag. Cele trei cadre originale ale camerei au fost păstrate pentru aliniere.
- Derulare cu inerție scurtă pentru rotița mouse-ului. Trackpadul, touch-ul, tastatura și zoom-ul rămân native. Turul automat este opțional și se oprește la interacțiune, schimbarea filei sau deschiderea produsului. Nu există derulare automată la intrarea pe site.
- Preferința de reducere a mișcării elimină animațiile și turul. Dialogurile native gestionează focusul și Escape. Dacă WebGL lipsește, galeria și alegerea opțiunilor funcționează în continuare.
- Fonturi locale cu licență OFL, WebP responsive, imagini lazy-load, fără pixeli publicitari, analytics sau CDN la rulare.

## Structura

```text
index.html              Pagina principală și dialogurile
informatii.html         Informații de prelansare și bază pentru paginile legale
css/                    Stiluri responsive
js/app.js               Catalog, configurator, fotografie și UI
js/cart.js              Coș și validarea stocării
js/motion.js            Povestea luminii, derulare și tur
js/studio.js            Modele 3D parametrice
js/vendor/              Three.js și licența
data/products.json      Unica sursă pentru produse, prețuri și opțiuni
data/site.json          Datele firmei și câmpurile viitoarei integrări
img/                    Imagini de prezentare și variante WebP
fonts/                  Fonturi și licențe
scripts/                Generarea copiei HTML autonome
tests/                  Verificări unitare și browser
```

## Imagini

Panorama pentru desktop, compoziția pentru telefon și cele opt cadre de produs zi/seară sunt versiuni generate digital și rafinate după materialele primite. Lumina, texturile de tencuială, lemnul și suprafețele lămpilor au fost îmbunătățite. Nu sunt fotografii ale unor produse fabricate. Perechile de produs sunt reconstruite după același cadru; nu sunt garantate ca aliniere fotografică la nivel de pixel. Pentru secvența camerei au fost păstrate imaginile originale în trei stări, fără regenerare separată. Soclurile și cadrul de detaliu provin din pachetul original. Înlocuiește randările cu fotografii reale înainte de a prezenta aspectul ca fiind garantat.

## Prețuri și lansarea comenzilor

În `data/products.json`, înlocuiește `price: null` cu prețul numeric în lei, de exemplu după stabilirea prețului real. Interfața și subtotalul folosesc automat valoarea. Nu au fost inventate prețuri. Până atunci este afișat „Preț în curând”.

Completează datele reale din `data/site.json`. Pagina de contact afișează câmpurile completate. Restul câmpurilor commerce sunt un contract de configurare pentru etapa următoare, nu activează un procesator de plăți prin simpla schimbare a unui boolean. Butonul de finalizare rămâne dezactivat până la implementarea unui checkout real.

Textele juridice sunt o bază de prelansare, nu documente finalizate juridic. Înainte de vânzare: completează comerciantul, prețurile cu taxe, costurile/termenele de livrare, garanțiile, procedura de retur, fluxul de aprobare a litofaniei și politica de date/fotografii împreună cu furnizorii reali. Verifică formulările pentru personalizări cu un jurist. Linkul ANPC–SAL este inclus; nu este folosită vechea platformă SOL/ODR. Disponibilitatea și cerințele actuale ale autorității trebuie reconfirmate la lansarea comercială.

## Publicare

**Netlify:** încarcă folderul `LUMIS` ca site static, sau conectează sursele. `netlify.toml` publică rădăcina; nu este necesară o comandă de build. `_headers` conține antete de securitate și cache.

**Vercel:** importă folderul ca proiect „Other”, fără build, cu directorul de ieșire `.`. Transpune antetele `_headers` în configurația Vercel dacă alegi această platformă; formatul `_headers` este cel Netlify. Folosește HTTPS și domeniul real înainte de lansare. Publicarea în conturile tale nu a fost făcută automat.

Publică sursele modulare, nu copia HTML autonomă; varianta modulară încarcă selectiv imaginile și biblioteca 3D.

## Următoarea etapă: comerț

| Variantă | Avantaje | Costuri / limite |
|---|---|---|
| Shopify cu checkout găzduit | Administrare simplă, inventar și comenzi, checkout întreținut de platformă | Abonament; configuratorul și transmiterea fotografiilor necesită integrare custom și verificarea limitelor variantelor |
| WooCommerce + Stripe | Control asupra catalogului, fotografiilor și fluxului de aprobare | Găzduire WordPress, actualizări, backup, securitate și mentenanță |

Pentru un magazin mic administrat simplu, alegerea inițială ar fi Shopify cu checkout găzduit și configurațiile transmise ca proprietăți ale produsului. Pentru un flux amplu de aprobare și producție personalizată, WooCommerce poate oferi mai mult control. Alegerea finală depinde de administrare, costuri și facturare. În ambele cazuri, serverul trebuie să valideze configurația, prețul și stocul; subtotalul din browser nu este o sursă de încredere. Fotografiile au nevoie de upload separat securizat, acces limitat și perioadă de ștergere stabilită. Nu introduce chei secrete în JavaScript.

## Verificări și rebuild

```sh
node --test tests/cart.test.js
python3 tests/browser_smoke.py
python3 tests/standalone_smoke.py
```

Testele browser necesită Playwright și Chromium, plus serverul pornit. Poți seta `CHROMIUM_PATH` și `LUMIS_TEST_URL`. Aceste unelte sunt pentru dezvoltare, nu pentru vizitatorii magazinului.

Pentru regenerarea copiei HTML autonome după modificări:

```sh
npm ci
npm run build:preview
```

Aceasta scrie `LUMIS-deschide.html` lângă folderul proiectului. esbuild este folosit numai la export; site-ul nu are nevoie de el la rulare.

Vezi `VERIFICARE.md` pentru rezultatele livrării. Nu au fost verificate cumpărări, procesări de plată, producția fizică, performanța pe toate dispozitivele sau validitatea juridică finală.
