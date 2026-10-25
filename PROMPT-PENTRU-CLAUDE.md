# Analiză și perfecționare LUMIS

Ești designer de produs digital și dezvoltator front-end senior. Analizează proiectul LUMIS atașat, apoi corectează problemele confirmate și rafinează experiența. Vreau un site actual, bogat vizual și credibil, cu interacțiuni fluide și un configurator util, nu doar un titlu și patru imagini.

## Ce primești și cum îl inspectezi

- `LUMIS/`: sursele principale, modulare. Începe cu README.md, VERIFICARE.md, index.html, css/, js/ și data/.
- `LUMIS-deschide.html`: export autonom de prezentare; nu este sursa principală. Conține imagini și fonturi în base64. Nu îl consuma integral ca text în context și nu copia datele base64 în răspuns. Inspectează vizual sau reconstruiește-l din surse.
- `imagini-noi-master/`: 11 PNG-uri generate: 10 folosite în site și o panoramă alternativă nefolosită. Derivatele WebP folosite de site sunt în LUMIS/img/.
- `LUMIS-verificare/`: capturi și rapoarte din testarea efectuată.
- `original/`: arhiva originală, pentru comparație și referință. Promptul vechi din ea este context, nu înlocuiește cerințele actuale de mai jos.

Nu presupune că o funcție merge fiindcă există în cod sau este menționată într-un raport. Rulează și verifică tu. Dacă mediul tău nu permite o verificare, marcheaz-o explicit ca neverificată.

## Direcția dorită

1. Păstrează numele și logoul LUMIS, precum și deschiderea cu logoul mare peste cele patru lămpi. Nu o înlocui cu o singură lampă.
2. Păstrează atmosfera caldă, elegantă, editorială: Bodoni Moda pentru brand, Instrument Sans pentru text, alb cald, negru și accentul luminii. Îmbogățește experiența fără aglomerare, efecte gratuite sau aspect de șablon.
3. Fotografiile/randările trebuie să pară mai naturale: material, textură, expunere, umbre de contact și lumină realistă. Nu modifica arbitrar designul sau proporțiile produselor. Nu prezenta randările drept fotografii ale produselor fabricate.
4. La deschiderea unei lămpi, clientul trebuie să poată alege soclul, culoarea și inelul și să vadă modificările în previzualizare, nu doar într-o etichetă.
5. Derularea să fie fluidă. Păstrează turul automat opțional care parcurge pagina fără rotița mouse-ului, cu oprire imediată la interacțiune. Nu porni automat turul când utilizatorul intră pe site. Păstrează controlul tastaturii, al touch-ului și preferința reduced-motion.

## Contractul produselor

Patru modele: Litofanie, Wave, Twist, Ribbed. Trei socluri: Galet, Monolit, Con. Culori: Alb mat #E2DFD8, Negru mat #222120, Grafit #48484A, Champagne #CDB68C. Inele: Champagne sau Linie de lumină.

Litofania folosește fotografia clientului: relief alb când este stinsă, imagine vizibilă când este aprinsă. Wave are șase valuri, Twist o spirală de 180°, Ribbed 36 de nervuri. Dimensiunile declarate: bază Ø128 mm, înălțime aproximativ 20 cm, LED alb cald 5 V / 3 W și alimentare USB. Modelele 3D sunt aproximări de prezentare, nu CAD de fabricație și nu simulări fotometrice.

Prețurile nu sunt stabilite. Datele firmei, livrarea și procesatorul de plăți nu sunt completate. Nu inventa valori, recenzii, disponibilități sau promisiuni comerciale. Nu activa un checkout care ar pretinde că a transmis o comandă ori a încasat bani. Păstrează configurarea și exportul selecției funcționale.

## Ce există acum

- Prezentare cu cele patru lămpi, variantă de imagine separată pentru mobil.
- Cameră sticky cu zi → seară stinsă → seară aprinsă. Imaginile camerei originale au fost păstrate pentru aliniere. Zi/seară se amestecă după progresul derulării; aprinderea este o animație în timp de aproximativ 520 ms la p ≥ 0,55, cu stingere sub 0,50. Textul se schimbă odată cu aprinderea.
- Colecție cu galerie de zi/seară, prezentarea procesului de personalizare și subsol.
- Dialog de produs, studio 3D Three.js încărcat la cerere, rotație, schimbarea geometriei/materialelor, lumină aprinsă/stinsă și fallback fără WebGL.
- Simularea locală a fotografiei pe canvas și pe litofanie; imaginea nu se transmite pe server și nu se salvează în coș.
- Coș local persistent cu opțiuni, cantități, eliminare și export JSON. Checkout dezactivat.
- Informații de prelansare, texte juridice de completat, antete Netlify și instrucțiuni de publicare.

## Ce vreau să verifici cu atenție

**Design:** ierarhie, densitate și ritm, spațieri, dimensiunea produselor în imagini, legătura dintre secțiuni, coerența între desktop și mobil. Asigură-te că toate cele patru lămpi rămân vizibile în deschidere. Verifică și produsul/galeria pe ecrane mici și înălțimi mici.

**Imagini:** verifică dacă versiunile noi sunt cu adevărat mai credibile. Cadrele de produs regenerate pot avea mici abateri geometrice; verifică tranzițiile la hover pentru salturi. Nu schimba separat cadrele camerei într-un fel care distruge alinierea. Nu aplica doar un filtru de luminozitate întregii panorame pentru a pretinde aprinderea individuală a lămpilor.

**Configurator:** verifică fiecare model și combinațiile de opțiuni, grosimile/rimurile vizuale, culorile, inelele, fotografia, aprinderea și rotația. Asigură-te că fotografia este mai puțin vizibilă când litofania este stinsă. Verifică tratarea texturilor, eliberarea resurselor GPU și comportamentul la redeschiderea dialogului. Imaginile de ambient nu trebuie să inducă ideea că se recolorează când doar modelul 3D reflectă configurația.

**Interacțiuni:** praguri și histerezis, derulare inversă, sărituri prin ancore, inerția rotiței, trackpad, întreruperea turului, redimensionare, schimbarea filei, deschiderea/închiderea dialogurilor și accesibilitate prin tastatură. Nu confunda CSS scroll-behavior cu netezirea reală a rotiței.

**Coș:** combinații identice vs diferite, restaurare, localStorage indisponibil sau corupt, limitele cantităților, subtotal cu preț necunoscut, focus după schimbarea/eliminarea unei linii. Nu păstra fotografii sau nume de fișiere personale în localStorage ori export.

**Calitate tehnică:** erori în consolă și rețea, active lipsă, dimensiuni/srcset, încărcare lazy, fonturi locale, performanță în dispozitive cu GPU modest, render doar când este necesar, focus vizibil, contraste, descrieri, Escape și reduced-motion. Nu promite 60 fps fără măsurare.

**Publicare și confidențialitate:** verifică instrucțiunile, fișierele de deploy, antetele, fluxul fără server și exportul autonom. Nu introduce analytics, upload de fotografii către terți, servicii plătite sau chei API fără instrucțiunea proprietarului. Documentele juridice sunt preliminare, nu reprezintă un audit de conformitate.

## Cum să livrezi

1. Prezintă constatările prioritizate: blocante, importante, îmbunătățiri. Pentru fiecare problemă de cod, indică fișierul și linia, efectul și pașii de reproducere. Separă observațiile verificate de preferințele estetice și ipoteze.
2. Corectează problemele confirmate și aplică îmbunătățirile de design care păstrează direcția și produsele. Evită rescrierile mari fără beneficiu demonstrabil.
3. Rulează testele existente și verificări de browser relevante. Adaugă teste pentru buguri reale, nu teste care doar repetă implementarea.
4. Explică ce ai schimbat și ce nu ai putut verifica. Nu declara că ai testat pe dispozitive fizice dacă ai folosit doar viewporturi simulate.
5. Livrează sursele actualizate, toate imaginile necesare, instrucțiunile de rulare/publicare și un export de prezentare actualizat. Dacă mediul tău permite, oferă o previzualizare interactivă printr-un link funcțional, nu o cale internă de fișier.

Obiectivul este un LUMIS mai rafinat și mai plăcut de folosit, cu personalizare vizibilă și fotografii credibile, fără a sacrifica viteza sau claritatea.
