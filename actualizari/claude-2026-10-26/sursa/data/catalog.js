// Product catalogue: the single place for names, options, prices and images.
// Prices are not set yet. Leave `price: null` until the owner decides; the UI shows "Preț la lansare".

export const CURRENCY = 'lei';
export const MAX_QTY = 10;

export const BASES = [
  { id: 'galet', name: 'Galet', note: 'Bombat și moale.' },
  { id: 'monolit', name: 'Monolit', note: 'Cilindru cu umăr rotunjit.' },
  { id: 'con', name: 'Con', note: 'Mai lat la bază, foarte stabil.' }
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
  ['Dimensiuni', 'Soclu Ø128 mm (Galet, Monolit) sau Ø133 mm (Con), înălțime totală 20,8 cm.'],
  ['Lumină', 'LED alb cald 5 V / 3 W, cu difuzor peste LED. Alimentare USB.'],
  ['Abajur', 'Interschimbabil, se prinde în soclu cu o răsucire.']
];

// Atelier: how a lamp is made. Only facts from lampa/spec.json and lampa/GHID-PRINT.md.
// photo stays null until there is a real photograph of the workshop (see FOTOGRAFII.md); then
// photo: { src, srcset, width, height, alt } and the page shows it above the text.
export const ATELIER = [
  { n: '01', title: 'Printată strat cu strat', text: 'Abajurul se printează din PLA alb, în straturi de 0,16 mm. La litofanie, peretele are între 0,8 și 3 mm, iar grosimea lui desenează fotografia.', photo: null },
  { n: '02', title: 'Un soclu care stă bine', text: 'Soclul are greutate de oțel în bază și pare să plutească pe o linie de umbră. Cablul pleacă discret, prin spate.', photo: null },
  { n: '03', title: 'Abajur cu o răsucire', text: 'Abajurul se prinde în soclu cu o răsucire scurtă și se scoate la fel de ușor, pentru curățat.', photo: null }
];

const img = (night640, night1160, day640, day1160) => ({
  thumb: night640,
  night: { src: night1160, srcset: `${night640} 640w, ${night1160} 1160w` },
  day: { src: day1160, srcset: `${day640} 640w, ${day1160} 1160w` }
});

export const PRODUCTS = [
  {
    id: 'litofanie', name: 'Litofanie', shade: 'litho', price: null, personal: true,
    short: 'Fotografia ta, vizibilă doar când lampa e aprinsă.',
    long: 'Stinsă, abajurul pare un relief alb. Aprinsă, apare fotografia ta, cu umbre și detalii fine. Îți trimitem previzualizarea pe e-mail și printăm doar după ce o aprobi.',
    photoAlt: 'Lampă Litofanie pe soclu Galet alb cu inel champagne',
    defaults: { base: 'galet', color: 'alb', ring: 'champagne' }, images: img('img/litofanie-seara-640.webp', 'img/litofanie-seara-1160.webp', 'img/litofanie-zi-640.webp', 'img/litofanie-zi-1160.webp')
  },
  {
    id: 'wave', name: 'Wave', shade: 'wave', price: null,
    short: 'Șase valuri fluide, rotite discret de jos până sus.',
    long: 'Șase valuri largi care se rotesc ușor pe înălțimea abajurului. Ziua prind lumina din cameră, seara o împart în benzi moi.',
    photoAlt: 'Lampă Wave pe soclu Galet alb cu inel champagne',
    defaults: { base: 'galet', color: 'alb', ring: 'champagne' }, images: img('img/wave-seara-640.webp', 'img/wave-seara-1160.webp', 'img/wave-zi-640.webp', 'img/wave-zi-1160.webp')
  },
  {
    id: 'twist', name: 'Twist', shade: 'twist', price: null,
    short: 'Nervuri ascuțite într-o spirală de 180°.',
    long: 'Nervuri cu muchie fină, răsucite pe jumătate de tură de la bază până sus. Cea mai grafică formă din colecție.',
    photoAlt: 'Lampă Twist pe soclu Monolit negru cu inel champagne',
    defaults: { base: 'monolit', color: 'negru', ring: 'champagne' }, images: img('img/twist-seara-640.webp', 'img/twist-seara-1160.webp', 'img/twist-zi-640.webp', 'img/twist-zi-1160.webp')
  },
  {
    id: 'ribbed', name: 'Ribbed', shade: 'ribbed', price: null,
    short: 'Siluetă de vază cu 36 de nervuri fine.',
    long: 'Un profil de vază, îngust la bază și plin sus, cu 36 de nervuri fine care dau abajurului textură și când e stins.',
    photoAlt: 'Lampă Ribbed pe soclu Monolit negru cu linie de lumină',
    defaults: { base: 'monolit', color: 'negru', ring: 'lumina' }, images: img('img/ribbed-seara-640.webp', 'img/ribbed-seara-1160.webp', 'img/ribbed-zi-640.webp', 'img/ribbed-zi-1160.webp')
  }
];

export const byId = (list, id) => list.find((x) => x.id === id);
