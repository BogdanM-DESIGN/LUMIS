# Skill-uri LUMIS pentru Claude

Instalare la nivel de proiect, pregătită pe 26 octombrie 2026. Claude rămâne programatorul și designerul principal. Aceste fișiere nu schimbă site-ul publicat sau geometria pieselor.

## Pornire în Claude Code

1. Actualizează checkout-ul de pe ramura `claude/lumis-v2` (sau `main`, pentru aceleași instrucțiuni).
2. Deschide proiectul de la rădăcina repository-ului și reîncarcă sesiunea Claude Code. Cele **22 de skill-uri partajate** sunt în `.claude/skills/`.
3. Pentru instrucțiunile oficiale Remotion, rulează `python tools/install_video_skills.py`. Acesta aduce direct de la sursa oficială cele **12 skill-uri video**, la commitul fixat. Nu execută cod din acel repository, nu instalează motorul video și nu conectează conturi. Repetarea păstrează modificările locale și refuză suprascrierea lor.
4. Rulează `python tools/verify_skills.py`. Verifică structura și integritatea instalării; nu măsoară performanța modelului.
5. Cere lui Claude să citească `CLAUDE.md`, să enumere skill-urile pe care le vede și să folosească doar cele relevante sarcinii.

În workspace-ul Codex în care a fost pregătită instalarea, pasul Remotion a fost deja executat. Într-un checkout nou trebuie repetat. Nu confundăm instalarea locală cu activarea într-un alt cont sau alt mediu.

## Ce este inclus în GitHub

| Direcție | Skill-uri |
|---|---|
| Design și testare | impeccable, frontend-design, canvas-design, webapp-testing |
| Context și cercetare | product-marketing, customer-research, competitor-profiling |
| Texte și conversie | copywriting, cro, seo-audit |
| Reclame și strategie | ad-creative, social, marketing-plan, ads |
| Imagini și video | image, video |
| Îmbunătățirea instrucțiunilor | skill-creator |
| Particularități LUMIS | lumis-brand, lumis-print-quality, lumis-quality-review, lumis-cost-analysis, lumis-token-efficiency |

Sunt 17 skill-uri upstream și 5 skill-uri originale pentru LUMIS. Toate folderele includ resursele aferente, nu doar fișierul SKILL.md. Licențele upstream și cele ale fonturilor au fost păstrate. `sources.lock.json` fixează sursele, reviziile și hash-urile fișierelor. Instrucțiunile upstream nu au fost rescrise.

Remotion este instalat separat, direct din repository-ul oficial, fără republicarea conținutului în acest repository. Instrucțiunile sale includ creare, markup, previzualizare, export, subtitrări, multimedia, documentație și actualizare. Nu este necesar să folosești toate funcțiile la fiecare clip.

## Claude.ai, în browser

Accesul Claude la GitHub nu activează automat skill-urile în setările Claude.ai. Folosește secțiunea Skills din cont, dacă este disponibilă. Arhiva `livrare/LUMIS-skills-Claude.zip` conține **22 ZIP-uri individuale**, fiecare cu un singur skill. Descarcă și dezarhivează pachetul exterior, apoi încarcă ZIP-urile individuale dorite în Claude. Nu încărca pachetul exterior ca un singur skill. Denumirile de meniu și limitele depind de cont.

Pachetele pentru browser au descrieri scurte pentru compatibilitate; descrierile upstream complete rămân în fișierele sursă din GitHub. Instalarea instrucțiunilor nu face disponibile scripturi/CLIs/MCP-uri externe; un skill precum Impeccable poate funcționa cu limitări într-un mediu fără terminal ori motorul său. Remotion nu este inclus în ZIP-ul redistribuit; folosește bootstrap-ul în Claude Code. Funcțiile oficiale de documente Claude, inclusiv XLSX unde sunt disponibile, se activează prin serviciul Claude.

## Limite concrete

- XLSX de la Anthropic nu a fost copiat: `skills/xlsx/LICENSE.txt` interzice copierea și redistribuirea. `lumis-cost-analysis` este o alternativă originală pentru costuri, tabele și grafice, nu o copie a acelui skill.
- Nu au fost instalate generatoare plătite, chei API, conexiuni Meta/Google, tracking, hooks automate sau abonamente. Skill-urile image/video pregătesc fluxul; generarea efectivă cere un instrument disponibil. Remotion cere separat Node/React și runtime-ul de randare; condițiile de utilizare ale motorului se verifică înainte de folosirea comercială.
- Impeccable include launcherul oficial cu versiune și checksum fixate; la prima folosire poate descărca motorul. Nu s-a executat motorul și nu s-au activat hooks la instalare.
- Skill-urile nu schimbă modelul AI și nu garantează creșteri de performanță. Pentru cele proprii există scenarii în `evals/evals.json`, pregătite dar încă nerulate cu Claude. Nu pretindem un benchmark efectuat.
- Reclamele sunt propuneri până la autorizarea publicării și bugetelor. Nicio campanie nu a fost pornită.
- Pentru print, validările CAD/slicer și măsurătorile pe prototip rămân distincte. Instalarea nu certifică siguranța sau printabilitatea.

## Exemple de cereri

- „Folosește lumis-brand și impeccable pentru a rafina configuratorul pe mobil, apoi verifică-l cu webapp-testing.”
- „Analizează concurenții din România pentru lămpi decorative și litofanii. Include sursa, data și necunoscutele.”
- „Pregătește trei concepte de reclamă și un clip vertical de 15 secunde folosind formele CAD reale. Spune ce instrument poți folosi efectiv.”
- „Folosește lumis-print-quality pentru a investiga punctele LED vizibile și propune o schimbare verificabilă a difuzorului.”
- „Construiește un calculator de costuri pe lampă; lasă costurile necunoscute necompletate.”

## Consum de tokeni

`lumis-token-efficiency` limitează citirile la sursa relevantă, evită încărcarea tuturor skill-urilor, păstrează ieșirile uneltelor scurte și reduce verificările repetate fără motiv. Nu dezactivează testele necesare, nu schimbă modelul și nu garantează o reducere procentuală. Economiile nu au fost măsurate în Claude.

Pentru Claude.ai există și ZIP-ul individual `livrare/LUMIS-token-efficiency-Claude.zip`, care poate fi încărcat direct în secțiunea Skills. Pentru Claude Code actualizează repository-ul și reîncarcă sesiunea.
