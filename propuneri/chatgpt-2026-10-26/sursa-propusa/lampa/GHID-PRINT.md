# LUMIS: ghid de fabricație

Toate piesele se generează din `spec.json` cu `python lampa/generate.py`. Site-ul citește aceiași parametri pentru forma exterioară. Rezultatul printat depinde de filament, slicer și calibrarea imprimantei; previzualizarea nu validează toleranțele sau funcționarea.

> **Important:** piesele au fost verificate în calculator (sunt solide închise, nu se intersectează și știfturile cad în canale), dar **nu au fost printate încă**. Toleranțele de îmbinare trebuie confirmate cu un print de test (pasul 1 de mai jos).

## Ce imprimantă

Bambu Lab A1, P1S, X1C sau orice imprimantă cu cel puțin 256 mm pe Z. Abajurul are 182 mm înălțime cu tot cu gulerul, deci **pe A1 mini (180 mm) nu încape**. Duză 0,4 mm.

## Piesele unei lămpi

| Fișier | Material | Orientare | Setări în Bambu Studio |
|---|---|---|---|
| `abajur-wave/twist/ribbed.3mf` | PLA alb (Bambu PLA Basic Jade White sau PLA Matte Ivory White) | cum e în fișier, gulerul pe placă | strat 0,16 mm, **2 pereți**, 0 straturi sus/jos, umplere 40% gyroid (doar gulerul are umplere), fără suporturi |
| abajur litofanie, generat per comandă | PLA alb, același rolă pentru toate | gulerul pe placă | strat 0,12 mm, **1 perete, umplere 100% rectilinie**, viteză perete exterior 60 mm/s, fără suporturi |
| `soclu-galet/monolit/con.3mf` | PLA Matte (Alb, Negru, Grafit) sau PLA Silk Champagne | **drept**, cu deschiderea mare pe placă (așa e în fișier); toate pantele au cel mult 45°, deci nu trebuie suporturi | strat 0,2 mm, 3 pereți, umplere 15%, fără suporturi; „Ironing” pe suprafața de sus, opțional |
| `capac-jos-<soclu>.3mf` | **se vede**: e plinta pe care „plutește” soclul. Aceeași culoare ca soclul, sau Negru mat pentru o linie de umbră mai adâncă | cum e în fișier, fața de jos pe placă | strat 0,2 mm, 3 pereți, umplere 20%, placă netedă (PEI texturat dacă vrei aceeași textură ca soclul) |
| `difuzor.3mf` | PLA alb | întors, capacul pe placă | strat 0,2 mm, 2 pereți |
| `inel.3mf` | PLA Silk Champagne (inel champagne) sau PLA alb translucid (linie de lumină) | culcat | strat 0,12 mm |

Masa de PLA din `print/dimensiuni.txt` e calculată pentru piesă plină. Cu setările de mai sus, consumul real e mai mic.

## Componente de cumpărat (pentru o lampă)

- Bandă LED 5 V USB, alb cald (2700–3000 K), **SMD2835, 60 LED/m, lățime 8 mm, 50 cm**, autoadezivă, cu întrerupător pe cablu. Grosimea cu tot cu LED-uri: **maximum 2,6 mm** (cele cu 2835 au de obicei ~1,6–2 mm; benzile 5050 sunt prea groase). Cablul: rotund, **maximum Ø4 mm**. La 60 LED/m, 50 cm consumă aproximativ 2,4–3 W, adică LED-ul de 5 V / 3 W declarat pe site. Verifică puterea exactă a benzii pe care o cumperi.
- Încărcător USB de 5 V, minimum 1 A.
- Alice de oțel pentru greutate, plus adeziv (epoxy sau silicon). Cât încape în tavă: **Galet ~150 g, Monolit și Con ~250 g**.
- 3 șuruburi pentru plastic, cu cap bombat, alese ca un singur reper comercial și confirmate pe un cupon de print. DIN 7981 (autofiletant, dimensiune ST) și ISO 7045 (filet metric M) nu sunt repere interschimbabile. Geometria actuală modelează un cap Ø5,6 × 2,2 mm, lungime sub cap 8 mm, pilot Ø2,6 mm. Nu a fost verificat filetul sau cuplul de strângere; măsoară reperul ales și adaptează pilotul la recomandările lui.
- 4 picioare de pâslă autoadezive, Ø10 mm.
- De proiectat și verificat: o ancorare mecanică a cablului care să preia tragerea fără solicitarea lipiturilor sau contactelor benzii. Canalul și colierul liber nu demonstrează o astfel de ancorare.

## Designul soclului (v2)

- **Plinta retrasă:** capacul de jos e cu 2,6 mm mai mic decât soclul, deci sub soclu apare o linie de umbră de 4 mm. Soclul pare să plutească, iar cablul iese prin această linie, fără decupaj vizibil în soclu.
- **Teșitură de 45° sus** și un **șanț fin în jurul inelului** (0,45 mm), ca inelul să se citească drept o piesă separată, nu ca o dungă lipită.
- **Interiorul**: tavan conic de 45° (se printează fără suporturi), o flanșă de 8 mm pe care stă soclul pe plintă și 3 bosaje pentru șuruburi, sprijinite pe flanșă.
- Dimensiunile sunt în `print/dimensiuni.txt`. Pe site, configuratorul 3D arată exact aceste forme, inclusiv plinta.

## Asamblare

Înainte de print, `python lampa/fit.py` verifică în calculator că piesele și componentele de mai sus încap fără să se lovească.

1. **Print de test (o dată):** printează `soclu-monolit` și un abajur cu umplere 10%, la viteză normală. Abajurul trebuie să intre în soclu și să se blocheze cu o răsucire de ~20°. Dacă e prea strâns sau prea larg, modifică `socket.clearance` în `spec.json` (implicit 0,25 mm) și regenerează.
2. Înfășoară banda LED pe stâlpul din capacul de jos, în spirală, cu LED-urile spre exterior. **Începe de la ~4 cm de la capac în sus**, cu capătul cu cablul jos: partea de jos a stâlpului e ascunsă în soclu și acolo lumina s-ar pierde. 50 cm înseamnă ~4,5 ture, cu ~1,5 cm între ture.
3. Coboară cablul pe lângă stâlp și **așază-l în canalul deschis** din capac, până la marginea din spate. Nu trebuie trecut prin nicio gaură, deci mufa USB și întrerupătorul rămân afară.
4. Toarnă alicele în tava inelară și fixează-le cu adeziv. Canalul cablului trece prin tavă între doi pereți, deci alicele nu ajung la cablu.
5. Pune difuzorul peste stâlp, în locașul lui, **cu decupajul de jos deasupra cablului**.
6. Lipește inelul în locașul de pe soclu.
7. Pune capacul în soclu: buza de centrare intră în deschidere, cu decupajele în dreptul celor 3 bosaje. Strânge cele 3 șuruburi cu mâna, fără să forțezi (plasticul se rupe ușor). Cablul iese prin linia de umbră dintre soclu și plintă, la spate.
8. Lipește picioarele de pâslă în cele 4 adâncituri.
9. Abajurul: îl cobori cu fantele peste cele 3 știfturi, apoi îl rotești ~20° până se oprește.

## Litofania, per comandă

```
python lampa/litofanie.py fotografia-clientului.jpg                 # așezarea aleasă ca pe site
python lampa/litofanie.py foto.jpg --asezare fata                    # fata | fata-spate | imprejur
```

Rezultatul e un fișier `.3mf` de aproximativ 25 MB. Peretele are între 0,8 mm (zonele luminoase) și 3,0 mm (zonele întunecate), plus o ramă mai groasă sus și jos. Prelucrarea pozei e aceeași ca în previzualizarea de pe site.

Fotografia clientului se șterge după print, conform politicii de confidențialitate, care trebuie încă scrisă.

## Ce nu e verificat

- Toleranța baionetei și cât de ușor se rotește: trebuie un print de test.
- Cât de uniform luminează banda LED prin difuzor și abajur.
- Încălzirea: puterea de 3 W nu garantează că PLA-ul sau banda LED rămân reci. Pe un prototip supravegheat, măsoară temperatura ambiantă, banda, suportul și punctele apropiate de PLA la pornire, după 15/30/60 minute și până la stabilizare, inclusiv în condițiile maxime de utilizare declarate. Compară măsurătorile cu limitele componentelor și filamentului alese. Un test de o oră sau un rezultat CAD nu certifică siguranța; nu lăsa primul prototip nesupravegheat.
- Contrastul litofaniei reale, cu filamentul ales. Se ajustează din `t_min` / `t_max` în `spec.json`.
