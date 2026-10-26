# LUMIS: lista de fotografii reale

Site-ul folosește acum doar randări și spune asta în subsol. Când lămpile există fizic, fotografiile de mai jos le pot înlocui pe rând. Fiecare fotografie se folosește doar dacă arată produsul real, fără retușuri care schimbă forma, culoarea sau lumina.

## Reguli comune

- Aparat sau telefon pe trepied, ISO cât mai mic, balans de alb fix **3000 K** (cât LED-ul), ca toate cadrele să aibă aceeași culoare.
- Format RAW sau cea mai mare calitate JPEG. Export: WebP, latura lungă 1920 px (cameră) sau 1160 px (produs).
- Fără oameni, fără obiecte cu marcă, fără documente sau fotografii personale vizibile în cadru.
- Pentru litofanie: o fotografie **a ta** sau una pentru care ai drepturi, niciodată poza unui client fără acordul lui scris.
- Șterge datele GPS (EXIF) înainte de publicare.

## 1. Camera zi / seară (înlocuiește `camera-*`), 3 cadre

Aceeași poziție a aparatului, același obiectiv și aceeași compoziție pentru toate trei. **Nu atinge trepiedul între ele.**

| Cadru | Lumina | Fișier |
|---|---|---|
| Ziua, lampa stinsă | lumină naturală din lateral, după-amiaza | `camera-zi` |
| Seara, stinsă | lumina zilei aproape dispărută, o veioză caldă departe, în afara cadrului | `camera-seara-stinsa` |
| Seara, aprinsă | ca mai sus, plus lampa aprinsă | `camera-seara-aprinsa` |

Compoziție: lampa Litofanie pe o comodă sau noptieră din lemn, în treimea din dreapta, la înălțimea ochilor de om așezat, 16:9.

## 2. Fiecare lampă (înlocuiește `<model>-seara` și `<model>-zi`), 2 cadre × 4 lămpi

- Fundal: același perete și aceeași suprafață pentru toate patru, ca grila să fie uniformă.
- Format 6:7 (1161 × 1355), lampa centrată, cu soclul în treimea de jos.
- Configurația din `data/catalog.js` → `defaults` (de exemplu Twist: Monolit, Negru mat, inel Champagne).
- Cadrul de seară: doar lampa aprinsă, expunere pe abajur, nu pe cameră.

## 3. Atelier (umple `ATELIER[].photo` din `data/catalog.js`), 3 cadre 4:5

1. Abajurul pe imprimantă, la jumătatea printului, cu straturile vizibile.
2. Soclul întors, cu greutatea și capacul de jos, înainte de închidere.
3. Mâna care pune abajurul pe soclu (fără inele, ceas sau tatuaje recognoscibile).

## 4. Detalii (opțional, pentru foaia de produs)

- Linia de umbră de sub soclu, de aproape, din lateral.
- Inelul Champagne și inelul „Linie de lumină”, aprinse.
- Litofania stinsă, ziua, cu relieful în lumină razantă.

## După fotografiere

Pune fișierele în `img/` cu aceleași nume și lățimi (640 / 1160 sau 960 / 1920). Apoi schimbă textele alternative și nota din subsol: „Imaginile sunt randări digitale” rămâne adevărată doar cât timp mai există randări pe pagină.
