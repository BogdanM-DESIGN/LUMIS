# Propunere ChatGPT pentru review-ul lui Claude

Acest folder completează pachetul Claude din 26 octombrie 2026. Nu schimbă instrucțiunile sau rolul lui Claude și nu înlocuiește automat versiunea publicată de el.

- **[Raportul complet](RAPORT-PENTRU-CLAUDE.md)**: probleme prioritizate, fișiere și linii, dovezi, cote candidate și limitele verificării.
- **[Site-ul autonom nou](LUMIS-deschide.html?raw=true)**: descarcă și deschide în browser. GitHub afișează HTML-ul ca sursă, nu ca site executabil.
- **[Sursele complete propuse](sursa-propusa/)**: design, texte, Manrope, imagini responsive și corecțiile tehnice testate.
- **[Capturi înainte/după](capturi/)**: desktop și telefon simulate.
- **[Cele 10 imagini noi PNG](imagini-noi-master/)**: două compoziții de prezentare și patru perechi zi/seară. Rămân imagini generate digital, nu fotografii de fabricație.
- **[Patch-uri separate](patch-uri/)**: corecții tehnice, design și un candidat de cote pentru inel. Pentru branch-ul Claude folosește patch-ul cu sufixul `lumis-v2`; celălalt este pentru pachetul cu folder `sursa/`.
- **[Cotele candidate ale inelului](cad-candidati/)**: verificate geometric la coliziuni, neprintate și neaplicate automat în `spec.json` activ.
- **[Rezultate și reproduceri](rezultate/)**: loguri, măsurători STL și cazurile sintetice folosite la audit.

## Rulare

```sh
cd sursa-propusa
python3 -m http.server 8080
```

Pentru dezvoltare folosește sursele modulare. Exportul autonom este pentru prezentare și poate fi regenerat din acestea cu `python3 tools/build_standalone.py ../LUMIS-deschide.html`.

## Integrare

În timpul analizei a apărut branch-ul `claude/lumis-v2`, commit `c073f6b`. Propunerea păstrează și completările lui: inerția rotiței, etichetele „Randări” și testul suplimentar de browser. Nu suprascrie acest branch cu o copie mai veche.

Verifică raportul și patch-urile înainte de integrare. Nu copia orbește întregul folder dacă Claude a continuat să modifice sursa. Nu există merge automat în `main` și nu a fost republicat artefactul Claude.

**Rezultate:** 19 teste Node, 11 verificări Chromium cu CSP, 6 grupuri noi de regresii browser și 2 teste Python trecute; cele 11 STL-uri originale au fost inspectate. Raportul separă verificările software de probele fizice încă necesare.

Nu au fost inventate prețuri sau activate plăți. Fotografiile clienților nu sunt salvate în coș. STL-urile originale și cele trei cadre aliniate ale camerei sunt păstrate.
