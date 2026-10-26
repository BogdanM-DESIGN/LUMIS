# LUMIS

Site de prezentare și configurator pentru lămpile LUMIS (Litofanie, Wave, Twist, Ribbed). Site static, fără server, fără analytics și fără servicii externe.

## Structură

```
index.html            pagina
css/fonts.css         Bodoni Moda (marca și titlurile) + Manrope (textul), servite local (OFL 1.1)
css/site.css          tot stilul, cu variabile la început
data/catalog.js       singurul loc pentru produse, socluri, culori, inele, prețuri, imagini și textele din Atelier
js/main.js            pagina: camera zi/seară, colecție, foaia de produs, coș, derularea cu rotița
js/cart.js            logica coșului (funcții pure + localStorage defensiv)
js/links.js           linkurile directe către o lampă (#lampa/ribbed/con/champagne/lumina)
js/studio.js          previzualizarea 3D (Three.js), încărcată doar la deschiderea unei lămpi
js/litho.js           fotografia clientului -> hartă de litofanie, doar în browser
vendor/               three.module.min.js r160 (licență MIT)
img/                  WebP în mai multe lățimi
tests/                teste
tools/                exportul autonom
docs/FOTOGRAFII.md    ce fotografii reale trebuie făcute ca să înlocuiască randările
docs/legal/           ciorne de termeni, confidențialitate, livrare și retur: de verificat de un avocat
VERIFICARE.md         ce a fost verificat și ce nu
lampa/                lampa reală: spec.json, generatorul de piese, litofania, fișierele 3MF, ghidul de print
data/lamp-spec.js     dimensiunile lămpii pentru site, generate din lampa/spec.json
netlify.toml          antete și cache pentru publicare
```

## Rulare locală

Modulele JavaScript nu pornesc din `file://`, deci e nevoie de un server local:

```
cd LUMIS
python3 -m http.server 8080
# deschide http://localhost:8080
```

## Teste

```
node --test tests/*.test.mjs        # coșul + potrivirea formelor site / piese printate, fără dependențe
node tests/browser-smoke.cjs        # verificări în Chromium; necesită Playwright (npm i -D playwright)
python tests/audit-regressions.py http://127.0.0.1:8080   # regresii: fotografie întârziată, linkuri, limite foto
python tests/lamp-audit.py          # orientarea EXIF a litofaniei, controlul negativ pentru punți
```

Testele Python cer Playwright pentru Python și Pillow; `CHROMIUM_PATH` poate indica un Chromium local. `lampa/overhang.py` iese cu codul 2 dacă o punte e mai lungă de 12 mm: piesa trebuie privită în slicer, nu e neapărat greșită.

```
```

## Ce se completează înainte de lansare

- Prețuri: `price` în `data/catalog.js` (acum `null`, pagina afișează „Preț la lansare”).
- Datele firmei, livrarea, termenii, confidențialitatea, returul: există doar ca ciorne în `docs/legal/`, nevalidate juridic și nelegate încă din pagină. Nu publica site-ul pentru vânzare până nu sunt verificate și completate.
- Plata: butonul „Finalizează comanda” e dezactivat intenționat. Când alegi procesatorul (de ex. Stripe, Shopify sau WooCommerce), integrarea se face separat. Până atunci, clientul poate copia selecția și v-o poate trimite.

## Publicare (Netlify)

1. Trage folderul `LUMIS/` în https://app.netlify.com/drop sau conectează repository-ul, cu directorul de publicare `LUMIS`.
2. `netlify.toml` setează antetele de securitate și cache-ul. Politica CSP permite doar resursele proprii (`'self'`), plus `blob:` și `data:` pentru fotografia procesată local.
3. Merge la fel pe orice găzduire statică (Vercel, Cloudflare Pages, GitHub Pages). Pe celelalte, antetele trebuie copiate în configurația lor.

## Export autonom

`python3 tools/build_standalone.py` creează `../LUMIS-deschide.html`: un singur fișier, cu imaginile, fonturile și codul incluse, care se deschide direct prin dublu-clic. E doar pentru prezentare. Sursa rămâne acest folder.

## Linkuri directe

Fiecare lampă are un link: `…/#lampa/wave` deschide foaia cu configurația standard, iar `…/#lampa/ribbed/con/champagne/lumina` deschide exact configurația aleasă. Butonul „Copiază linkul” din foaie copiază linkul configurației curente. Linkul conține doar codurile din catalog, niciodată fotografia.

## Note despre imagini și modelul 3D

- Toate imaginile sunt randări digitale, nu fotografii ale produselor fabricate. Pagina spune asta în subsol și în textele alternative.
- Camera zi/seară (3 cadre, `camera-*`) este randată cu aceeași cameră și aceleași obiecte, deci singura diferență e lumina. Nu înlocui un cadru separat de celelalte.
- Configuratorul 3D și piesele de printat vin din aceeași sursă: `lampa/spec.json`. `lampa/generate.py` scrie fișierele 3MF și `data/lamp-spec.js`; `tests/geometry.test.mjs` verifică faptul că site-ul și piesele au aceleași raze. Lumina din configurator e o ilustrare, nu o simulare fotometrică.
- Ghidul de print, componentele și asamblarea: `lampa/GHID-PRINT.md`.
