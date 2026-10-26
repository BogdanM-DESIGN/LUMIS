// Product catalogue: the single place for names, options, prices and images.
// Prices are not set yet. Leave `price: null` until the owner decides; the UI shows "Preț la lansare".

export const CURRENCY = 'lei';
export const MAX_QTY = 10;

export const BASES = [
  { id: 'galet', name: 'Galet', note: 'Bombat, ca o piatră de râu. Cel mai moale contur.' },
  { id: 'monolit', name: 'Monolit', note: 'Cilindru drept, cu muchii rotunjite.' },
  { id: 'con', name: 'Con', note: 'Mai lat jos, cu flancuri drepte.' }
];

export const COLORS = [
  { id: 'alb', name: 'Alb mat', hex: '#E2DFD8' },
  { id: 'negru', name: 'Negru mat', hex: '#222120' },
  { id: 'grafit', name: 'Grafit', hex: '#48484A' },
  { id: 'champagne', name: 'Champagne', hex: '#CDB68C' }
];

export const RINGS = [
  { id: 'champagne', name: 'Champagne' },
  { id: 'lumina', name: 'Linie de lumină' }
];

export const SPECS = [
  ['Dimensiuni', 'Înălțime aprox. 20,8 cm. Soclu aprox. Ø129 mm (Galet), Ø128 mm (Monolit) sau Ø133 mm (Con).'],
  ['Lumină', 'Bandă LED alb cald de 5 V, aproximativ 3 W, ascunsă sub un difuzor. Se alimentează prin cablu USB, de la un încărcător de 5 V.'],
  ['Abajur', 'Se prinde în soclu cu o răsucire scurtă și se scoate la fel, pentru curățat sau pentru altă formă.'],
  ['Material', 'PLA printat 3D. De aproape se văd liniile fine ale straturilor; fac parte din textura lămpii.'],
  ['Utilizare', 'Lampă decorativă, pentru interior. Ține-o departe de surse de căldură și de apă: PLA-ul se înmoaie la temperaturi ridicate.']
];

// Atelier: how a lamp is made. Only facts from lampa/spec.json and lampa/GHID-PRINT.md.
// photo stays null until there is a real photograph of the workshop (see FOTOGRAFII.md); then
// photo: { src, srcset, width, height, alt } and the page shows it above the text.
export const ATELIER = [
  { title: 'Textura straturilor', text: 'Forma se construiește strat cu strat. Urmele fine de print fac parte din suprafața abajurului.', photo: null },
  { title: 'Detalii discrete', text: 'Plinta retrasă desenează o umbră sub soclu. Cablul iese discret, prin spate.', photo: null },
  { title: 'Forme de schimbat', text: 'Abajurul și soclul se separă printr-o răsucire scurtă. Îmbinarea este proiectată să permită schimbarea formei.', photo: null }
];

const img = (night640, night1160, day640, day1160) => ({
  thumb: night640,
  night: { src: night1160, srcset: `${night640} 640w, ${night1160} 1160w` },
  day: { src: day1160, srcset: `${day640} 640w, ${day1160} 1160w` }
});

export const PRODUCTS = [
  {
    id: 'litofanie', name: 'Litofanie', shade: 'litho', price: null, personal: true,
    short: 'Fotografia ta, ascunsă în relief, apare când aprinzi lampa.',
    long: 'Ziua pare o lampă albă, cu un relief fin pe care abia îl observi. Seara, când o aprinzi, relieful devine fotografia ta. Abajurul are pereți între 0,8 și 3 mm: lumina trece ușor prin zonele subțiri și greu prin cele groase, așa că apar luminile, umbrele și detaliile imaginii. O amintire care stă discret pe noptieră și se arată când vrei tu.',
    off: 'Un abajur alb, cu un relief fin în care fotografia abia se ghicește.',
    on: 'Fotografia apare în lumină caldă, cu umbrele și detaliile ei.',
    use: 'Pentru un loc drag, o casă, un chip sau o zi pe care vrei s-o păstrezi aproape.',
    photoAlt: 'Lampă Litofanie pe soclu Galet alb cu inel champagne',
    defaults: { base: 'galet', color: 'alb', ring: 'champagne' }, images: img('img/litofanie-seara-640.webp', 'img/litofanie-seara-1160.webp', 'img/litofanie-zi-640.webp', 'img/litofanie-zi-1160.webp')
  },
  {
    id: 'wave', name: 'Wave', shade: 'wave', price: null,
    short: 'Șase valuri largi, rotite ușor pe înălțime.',
    long: 'Cel mai moale contur din colecție. Cele șase valuri se rotesc cu 140° de jos până sus, așa că silueta se schimbă când treci pe lângă lampă.',
    off: 'Valurile prind lumina din cameră și desenează umbre largi.',
    on: 'Crestele și adânciturile apar în tonuri diferite de lumină.',
    use: 'Pe noptieră sau pe o comodă, unde vrei o formă liniștită.',
    photoAlt: 'Lampă Wave pe soclu Galet alb cu inel champagne',
    defaults: { base: 'galet', color: 'alb', ring: 'champagne' }, images: img('img/wave-seara-640.webp', 'img/wave-seara-1160.webp', 'img/wave-zi-640.webp', 'img/wave-zi-1160.webp')
  },
  {
    id: 'twist', name: 'Twist', shade: 'twist', price: null,
    short: '14 nervuri ascuțite, într-o spirală de 180°.',
    long: 'Cea mai grafică formă din colecție: 14 nervuri cu muchie fină, răsucite pe jumătate de tură de la soclu până sus.',
    off: 'Muchiile trasează diagonale fine de lumină și umbră.',
    on: 'Spirala rămâne vizibilă ca un șir de benzi luminoase.',
    use: 'Pe un birou sau pe un raft, lângă obiecte cu linii drepte.',
    photoAlt: 'Lampă Twist pe soclu Monolit negru cu linie de lumină',
    defaults: { base: 'monolit', color: 'negru', ring: 'lumina' }, images: img('img/twist-seara-640.webp', 'img/twist-seara-1160.webp', 'img/twist-zi-640.webp', 'img/twist-zi-1160.webp')
  },
  {
    id: 'ribbed', name: 'Ribbed', shade: 'ribbed', price: null,
    short: '36 de nervuri fine, pe o siluetă de vază.',
    long: 'Un profil de vază: se strânge puțin deasupra soclului și se lărgește spre partea de sus. Cele 36 de nervuri verticale dau textură și când lampa e stinsă.',
    off: 'Nervurile fac o textură regulată, ca o țesătură.',
    on: 'Lumina se așază în dungi verticale, mai calme decât la Twist.',
    use: 'Într-un living sau pe o consolă, unde vrei un obiect de privit.',
    photoAlt: 'Lampă Ribbed pe soclu Monolit negru cu linie de lumină',
    defaults: { base: 'monolit', color: 'negru', ring: 'lumina' }, images: img('img/ribbed-seara-640.webp', 'img/ribbed-seara-1160.webp', 'img/ribbed-zi-640.webp', 'img/ribbed-zi-1160.webp')
  }
];

export const byId = (list, id) => list.find((x) => x.id === id);
