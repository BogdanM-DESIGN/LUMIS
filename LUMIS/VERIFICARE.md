# Verificare livrare LUMIS

Validat în Chromium headless, cu WebGL software disponibil în mediul de dezvoltare.

- **8 teste unitare: trecute**, zero eșecuri și zero omise. Acoperă validarea coșului, restaurarea stocării, coruperea/blocarea localStorage, separarea configurațiilor, cantitățile, prețurile necunoscute și eliminarea datelor fotografiei.
- **Flux browser: trecut** la 1440 × 1000 și verificări responsive la 360, 390 și 768 px, fără depășire orizontală.
- Verificate toate cele patru modele și **12 combinații de opțiuni** în browser, inclusiv schimbarea geometriei soclului, culorii și inelului în modelul 3D. Catalogul oferă 24 de combinații/model; nu au fost capturate separat toate cele 96.
- Verificate galeria, aprinderea/stingerea 3D, încărcarea unei imagini sintetice în canvas, absența cererilor de upload și absența datelor fotografiei din selecția persistentă.
- Verificate coșul după reîncărcare, creșterea cantității, eliminarea și descărcarea JSON.
- Verificate turul automat și oprirea la intervenția utilizatorului, tranziția camerei și histerezisul aprinderii.
- Verificate preferința de reducere a mișcării și fallback-ul fără WebGL.
- **Zero erori JavaScript și zero răspunsuri HTTP de eroare** în fluxul final testat.
- Copia HTML autonomă este verificată separat prin încărcarea documentului complet cu toate resursele încorporate, fără cereri HTTP externe. Politica browserului cloud blochează navigarea `file://`, deci dublu-clicul local ca mecanism de lansare nu poate fi confirmat în acel browser; codul încorporat este verificat funcțional.

Nu reprezintă: audit juridic, testare pe Safari/Firefox sau pe dispozitive fizice, certificat de accesibilitate, măsurătoare garantată de 60 fps, verificarea produsului fizic ori verificarea comenzilor/plăților. Checkout-ul este intenționat neactivat, deoarece lipsesc prețurile finale și integrarea de comerț.

Capturile și rapoartele automate se află în folderul `LUMIS-verificare` din livrare. Imaginile de prezentare rămân randări generate digital. Pagina nu a fost publicată într-un cont de hosting.
