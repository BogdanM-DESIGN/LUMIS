# LUMIS — site, imagini și predare pentru Claude

## Propunere nouă de design și audit independent

- **[Raport pentru Claude](propuneri/chatgpt-2026-10-26/RAPORT-PENTRU-CLAUDE.md)** — defecte reproduse, corecții, măsurători STL și cote candidate.
- **[Site și audit, arhivă de descărcat](livrare/LUMIS-propunere-ChatGPT-site-si-audit.zip?raw=true)**
- **[Cele 10 imagini noi PNG, arhivă de descărcat](livrare/LUMIS-propunere-ChatGPT-imagini-master.zip?raw=true)**
- **[Capturi comparative înainte/după](propuneri/chatgpt-2026-10-26/capturi/)**
- **[Sursele complete ale propunerii](propuneri/chatgpt-2026-10-26/sursa-propusa/)**

Propunerea este pentru review-ul și integrarea lui Claude. Include Manrope pentru interfață, texte revizuite și imagini mai detaliate, păstrând logoul LUMIS și cele patru lămpi. Corecțiile tehnice sunt disponibile și ca patch separat; sursa propusă păstrează completările recente de pe `claude/lumis-v2`. Piesele STL originale și versiunea publicată de Claude nu au fost înlocuite automat.

## Actualizarea Claude din 26 octombrie 2026

**Cel mai nou pachet primit** este păstrat separat, fără modificarea conținutului furnizat de Claude:

- **[Descarcă pachetul nou integral — aproximativ 28 MB](livrare/LUMIS-pentru-ChatGPT-2026-10-26.zip?raw=true)**
- **[Sursele noi ale site-ului și generatorului de piese](actualizari/claude-2026-10-26/sursa/)**
- **[Cele 11 piese STL](actualizari/claude-2026-10-26/modele-stl/)**
- **[Exportul HTML autonom nou](actualizari/claude-2026-10-26/LUMIS-deschide.html?raw=true)**
- **[Promptul de analiză trimis de Claude](actualizari/claude-2026-10-26/PROMPT-ChatGPT.md)**
- **[Capturile noi](actualizari/claude-2026-10-26/capturi/)** și **[randările pieselor](actualizari/claude-2026-10-26/randari/)**

Acest pachet include remedierea pe telefon descrisă de Claude pentru controalele Aprinsă/Stinsă. Analiza independentă a acestei versiuni este în curs; încărcarea nu constituie validarea fabricației, siguranței sau a afirmațiilor din rapoartele primite. Nu folosi exportul HTML anterior pentru a verifica această remediere.

Secțiunile de mai jos documentează **predarea anterioară**, păstrată pentru istoric. Claude rămâne programatorul și designerul principal; ChatGPT face analiza independentă și propune corecții pentru verificarea lui Claude.

Acesta este pachetul complet al versiunii realizate: cod, imagini noi, configurator 3D, documentație, capturi și promptul pentru analiză.

## Descarcă pentru Claude

Descarcă **ambele arhive** și atașează-le în aceeași conversație Claude:

1. **[Cod, site și documentație — aproximativ 25 MB](livrare/LUMIS-Claude-1-code-et-documentation.zip?raw=true)**
2. **[Imagini noi PNG master — aproximativ 18 MB](livrare/LUMIS-Claude-2-imagini-master.zip?raw=true)**

Dacă GitHub afișează pagina fișierului, apasă **Download raw file** / pictograma de descărcare. Cele două arhive sunt separate pentru a evita un singur atașament de aproximativ 43 MB.

Apoi copiază textul din **[PROMPT-PENTRU-CLAUDE.md](PROMPT-PENTRU-CLAUDE.md)** în conversația Claude.

Alternativ, **Code → Download ZIP** descarcă întregul repository, inclusiv sursele și arhivele de livrare.

## Vezi site-ul pe calculator

Descarcă și extrage prima arhivă, apoi deschide **LUMIS-deschide.html** într-un browser actualizat. Acesta este un export autonom cu cod, imagini și fonturi încorporate. Unele previzualizatoare de atașamente nu execută JavaScript: deschide fișierul descărcat în browser.

Pentru dezvoltare și publicare, folosește sursele modulare din **[LUMIS/](LUMIS/)** și instrucțiunile din **[README-ul proiectului](LUMIS/README.md)**. Pagina HTML din interfața GitHub este o vizualizare de cod; nu este o versiune publicată a site-ului.

## Ce include

- Prezentarea LUMIS peste cele patru lămpi, cu imagine separată pentru telefon.
- Camera cu tranziție zi → seară → aprinderea lămpii.
- Configurator 3D rotativ, trei socluri, patru culori și două inele.
- Simularea locală a fotografiei pentru litofanie, galerie și coș persistent.
- Derulare fluidă și tur automat opțional, cu oprire la interacțiune.
- Imagini WebP responsive, fonturi locale și documentație de publicare.
- **11 PNG-uri master noi:** zece folosite în site și o panoramă alternativă.
- Arhiva originală nemodificată, capturi și rapoarte de testare.

Imaginile sunt randări generate digital, nu fotografii ale unor produse fabricate. Modelele web sunt aproximări parametrice, nu fișiere CAD de fabricație.

## Verificări și stadiu

Vezi **[VERIFICARE.md](LUMIS/VERIFICARE.md)** și **[rapoartele](LUMIS-verificare/)** pentru verificările efectuate: opt teste unitare și fluxuri browser pentru configurator, coș, fotografie, tur, cameră, dimensiuni mobile și fallback fără WebGL.

Comenzile și plățile nu sunt active. Prețurile, datele firmei, condițiile comerciale și textele juridice trebuie completate înainte de vânzare. Încărcarea acestui repository nu publică automat un site prin GitHub Pages.
