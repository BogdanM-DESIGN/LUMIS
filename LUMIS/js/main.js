import { PRODUCTS, BASES, COLORS, RINGS, SPECS, ATELIER, MAX_QTY, CURRENCY, byId } from '../data/catalog.js';
import * as Cart from './cart.js';
import { linkHash, parseLink } from './links.js';
import { lithoMap, readPhoto, PLACEMENTS, suggestPlacement } from './litho.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduce = () => reduceMQ.matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const priceText = (p) => (typeof p === 'number' ? `${p.toLocaleString('ro-RO')} ${CURRENCY}` : 'Preț la lansare');

let storage = null;
try { storage = window.localStorage; storage.getItem('x'); } catch { storage = null; }

/* ---------- water drop that slides to the active option ---------- */
function attachDrop(seg, getActive) {
  const drop = document.createElement('span');
  drop.className = 'drop';
  drop.setAttribute('aria-hidden', 'true');
  seg.prepend(drop);
  let last = null;
  const place = (animate) => {
    const t = getActive();
    if (!t || !t.offsetWidth) return;
    const box = { x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight };
    const css = (b) => ({ transform: `translate(${b.x}px, ${b.y}px)`, width: `${b.w}px`, height: `${b.h}px` });
    if (animate && last && !reduce() && (last.x !== box.x || last.y !== box.y)) {
      const left = Math.min(last.x, box.x), right = Math.max(last.x + last.w, box.x + box.w);
      const mid = last.y === box.y
        ? { transform: `translate(${left}px, ${box.y + box.h * 0.1}px)`, width: `${(right - left) * 0.9}px`, height: `${box.h * 0.8}px`, offset: 0.45 }
        : { ...css({ x: (last.x + box.x) / 2, y: (last.y + box.y) / 2, w: box.w * 0.8, h: box.h * 0.8 }), offset: 0.45 };
      drop.animate([css(last), mid, css(box)], { duration: 540, easing: 'cubic-bezier(.3, 1.3, .5, 1)' });
    }
    Object.assign(drop.style, css(box));
    last = box;
  };
  new ResizeObserver(() => place(false)).observe(seg);
  return place;
}

/* ---------- smooth anchor jumps (native wheel and trackpad scrolling stay untouched) ---------- */
function goTo(id) {
  const t = document.getElementById(id);
  const y = id === 'top' || !t ? 0 : t.getBoundingClientRect().top + window.scrollY - 24;
  window.scrollTo({ top: y, behavior: reduce() ? 'auto' : 'smooth' });
}
$$('[data-go]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); stopTour(); goTo(a.dataset.go); }));

/* ---------- the room: daylight fades with the scroll, then the lamp switches on ---------- */
const story = $('#poveste');
const ON_AT = 0.55, OFF_BELOW = 0.5; // hysteresis so the lamp never flickers at the threshold
let storyQueued = false;
function paintStory() {
  storyQueued = false;
  const r = story.getBoundingClientRect();
  if (r.bottom < -50 || r.top > innerHeight + 50) return;
  const p = Math.min(1, Math.max(0, -r.top / Math.max(1, story.offsetHeight - innerHeight)));
  const t = Math.min(1, Math.max(0, (p - 0.05) / 0.4));
  story.style.setProperty('--dusk', (t * t * (3 - 2 * t)).toFixed(3));
  const on = story.classList.contains('on');
  if (!on && p >= ON_AT) story.classList.add('on');
  else if (on && p < OFF_BELOW) story.classList.remove('on');
}
const queueStory = () => { if (!storyQueued) { storyQueued = true; requestAnimationFrame(paintStory); } };
addEventListener('scroll', queueStory, { passive: true });
addEventListener('resize', queueStory);
paintStory();

/* ---------- optional automatic tour: starts only on request, stops on any interaction ---------- */
const tourBtn = $('#tour');
let tourRaf = 0, tourLast = 0, tourY = 0;
function tourStep(t) {
  const dt = Math.min(64, t - (tourLast || t));
  tourLast = t;
  const max = document.documentElement.scrollHeight - innerHeight;
  const speed = innerHeight / 3.2; // px per second: a screen every ~3 seconds
  tourY = Math.min(max, tourY + (speed * dt) / 1000);
  window.scrollTo(0, tourY);
  if (tourY >= max - 1) { stopTour(); return; }
  tourRaf = requestAnimationFrame(tourStep);
}
function startTour() {
  if (reduce()) { goTo('colectie'); return; }
  tourY = window.scrollY; tourLast = 0;
  tourBtn.setAttribute('aria-pressed', 'true');
  tourRaf = requestAnimationFrame(tourStep);
}
function stopTour() {
  if (!tourRaf) return;
  cancelAnimationFrame(tourRaf); tourRaf = 0;
  tourBtn.setAttribute('aria-pressed', 'false');
}
tourBtn.addEventListener('click', () => (tourRaf ? stopTour() : startTour()));
['wheel', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, () => stopTour(), { passive: true }));
addEventListener('pointerdown', (e) => { if (!tourBtn.contains(e.target)) stopTour(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopTour(); });

/* ---------- mouse wheel: a short inertial finish ---------- */
// Only for notched mouse wheels. Trackpads already have native momentum (small pixel deltas), and touch,
// keyboard, zoom, horizontal scrolling and open dialogs stay native. Any other scroll cancels it.
let wheelTarget = 0, wheelPos = 0, wheelRaf = 0, wheelLast = 0;
function wheelCancel() { cancelAnimationFrame(wheelRaf); wheelRaf = 0; }
function wheelStep(now) {
  const dt = Math.min(40, now - wheelLast || 16.7);
  wheelLast = now;
  if (Math.abs(window.scrollY - wheelPos) > 2) { wheelCancel(); return; } // something else scrolled
  const d = wheelTarget - wheelPos;
  if (Math.abs(d) < 0.6) { window.scrollTo(0, wheelTarget); wheelRaf = 0; return; }
  wheelPos += d * (1 - Math.exp(-dt / 85));
  window.scrollTo(0, wheelPos);
  wheelRaf = requestAnimationFrame(wheelStep);
}
addEventListener('wheel', (e) => {
  if (reduce() || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || document.querySelector('dialog[open]')) return;
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  if (e.deltaMode === 0 && Math.abs(e.deltaY) < 45) return; // trackpad
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  e.preventDefault();
  if (!wheelRaf) { wheelTarget = wheelPos = window.scrollY; }
  const px = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  wheelTarget = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, wheelTarget + px));
  if (!wheelRaf) { wheelLast = performance.now(); wheelRaf = requestAnimationFrame(wheelStep); }
}, { passive: false });
['pointerdown', 'touchstart', 'keydown'].forEach((ev) => addEventListener(ev, wheelCancel, { passive: true }));

/* ---------- atelier: text now, real photos when they exist ---------- */
$('#atelierList').innerHTML = ATELIER.map((a) => `<li>
  ${a.photo ? `<img src="${a.photo.src}" srcset="${a.photo.srcset}" sizes="(max-width: 640px) 92vw, 30vw" width="${a.photo.width}" height="${a.photo.height}" loading="lazy" decoding="async" alt="${esc(a.photo.alt)}">` : ''}
  <span class="n">${a.n}</span><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></li>`).join('');

/* ---------- collection, rendered from the catalogue ---------- */
const grid = $('#grid');
grid.innerHTML = PRODUCTS.map((p) => `
  <li class="item" data-id="${p.id}">
    <div class="media-wrap">
    <button class="item-open" type="button" data-open="${p.id}" aria-label="Deschide ${esc(p.name)}: alege soclul, culoarea și inelul">
      <span class="item-media">
        <img class="n" src="${p.images.night.src}" srcset="${p.images.night.srcset}" sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 22vw" width="1161" height="1355" loading="lazy" decoding="async" alt="Randare: ${esc(p.photoAlt)}, aprinsă, seara">
        <img class="d" src="${p.images.day.src}" srcset="${p.images.day.srcset}" sizes="(max-width: 640px) 90vw, (max-width: 1000px) 45vw, 22vw" width="1161" height="1355" loading="lazy" decoding="async" alt="">
      </span>
    </button>
    <span class="item-tools">
      <button class="round glass flip" type="button" aria-pressed="false" aria-label="Arată ${esc(p.name)} stinsă, ziua"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg></button>
      <button class="round glass quick" type="button" aria-label="Adaugă ${esc(p.name)} în coș, configurația standard"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
    </span>
    </div>
    <div class="item-row"><span>${esc(p.name)}</span><span>${priceText(p.price)}</span></div>
    <p class="item-desc">${esc(p.short)}</p>
  </li>`).join('');
$$('.item', grid).forEach((li) => {
  const p = byId(PRODUCTS, li.dataset.id), flip = $('.flip', li);
  flip.addEventListener('click', () => {
    const on = li.classList.toggle('flip');
    flip.setAttribute('aria-pressed', String(on));
    flip.setAttribute('aria-label', on ? `Arată ${p.name} aprinsă, seara` : `Arată ${p.name} stinsă, ziua`);
  });
  $('.quick', li).addEventListener('click', (e) => addToCart({ product: p.id, ...p.defaults }, 1, e.currentTarget));
});

/* ---------- lithophane compare slider ---------- */
const compare = $('#compare'), range = $('#compareRange');
range.addEventListener('input', () => compare.style.setProperty('--pos', `${range.value}%`));

/* ---------- dialogs: remember who opened them, give focus back on close ---------- */
const openers = new WeakMap();
function openDialog(dlg, opener) {
  stopTour(); wheelCancel();
  openers.set(dlg, opener || document.activeElement);
  dlg.showModal();
}
$$('dialog').forEach((dlg) => {
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('close', () => { if (dlg.open) return; const o = openers.get(dlg); if (o && o.isConnected) o.focus(); });
});
$('[data-info]').addEventListener('click', (e) => openDialog($('#infoDlg'), e.currentTarget));

/* ---------- product sheet + configurator ---------- */
const dlg = $('#productDlg'), form = $('#config'), viewer = $('.viewer', dlg);
const sel = { product: null, base: null, color: null, ring: null, qty: 1, lit: true };
let studio = null, studioMod = null, photoCanvas = null, photoImg = null, placement = 'wrap';
let productSession = 0, photoRequest = 0;

const radios = (name, list, swatch) => list.map((o) => `
  <label><input type="radio" name="${name}" value="${o.id}" id="${name}-${o.id}"${swatch ? ` aria-label="${esc(o.name)}"` : ''}>
  <span${swatch ? ` data-hex="${o.hex}"` : ''}>${swatch ? '' : esc(o.name)}</span></label>`).join('');
$('#optBase').innerHTML = radios('base', BASES);
$('#optRing').innerHTML = radios('ring', RINGS);
$('#optColor').innerHTML = radios('color', COLORS, true);
$('#optPlace').innerHTML = radios('place', PLACEMENTS);
$$('[data-hex]').forEach((s) => { s.style.background = s.dataset.hex; }); // set through CSSOM so a strict CSP needs no inline styles
$('#specs').innerHTML = SPECS.map(([t, d]) => `<details><summary>${t}</summary><p>${d}</p></details>`).join('');
const placeBase = attachDrop($('#optBase'), () => $('input:checked', $('#optBase'))?.parentElement);
const placePlace = attachDrop($('#optPlace'), () => $('input:checked', $('#optPlace'))?.parentElement);
const placeRing = attachDrop($('#optRing'), () => $('input:checked', $('#optRing'))?.parentElement);
const litSeg = $('#litSeg');
const placeLit = attachDrop(litSeg, () => $('[aria-pressed="true"]', litSeg));
const tabs = $('.view-tabs', dlg);
const placeTab = attachDrop(tabs, () => $('[aria-selected="true"]', tabs));

function syncConfig(animate = true) {
  const p = byId(PRODUCTS, sel.product);
  $(`#base-${sel.base}`).checked = true;
  $(`#ring-${sel.ring}`).checked = true;
  $(`#color-${sel.color}`).checked = true;
  $('#vBase').textContent = byId(BASES, sel.base).name;
  $('#vColor').textContent = byId(COLORS, sel.color).name;
  $('#vRing').textContent = byId(RINGS, sel.ring).name;
  $('#qtyVal').textContent = sel.qty;
  $('#qtyMinus').disabled = sel.qty <= 1;
  $('#qtyPlus').disabled = sel.qty >= MAX_QTY;
  $('#photoField').hidden = !p.personal;
  $('#personalNote').hidden = !p.personal;
  placeBase(animate); placeRing(animate);
  studio?.set({ shade: p.shade, base: sel.base, color: byId(COLORS, sel.color).hex, ring: sel.ring });
  if (dlg.open) setHash(linkHash(sel));
}

function setLit(on, animate = true) {
  sel.lit = on;
  $$('[data-lit]', litSeg).forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.lit === 'on') === on)));
  viewer.classList.toggle('dark', on);
  placeLit(animate);
  studio?.setLit(on);
}
$$('[data-lit]', litSeg).forEach((b) => b.addEventListener('click', () => setLit(b.dataset.lit === 'on')));

function showTab(photo) {
  $('#tab3d').setAttribute('aria-selected', String(!photo));
  $('#tabPhoto').setAttribute('aria-selected', String(photo));
  $('#pane3d').hidden = photo;
  $('#panePhoto').hidden = !photo;
  viewer.classList.toggle('dark', !photo && sel.lit);
  placeTab(true);
}
$('#tab3d').addEventListener('click', () => showTab(false));
$('#tabPhoto').addEventListener('click', () => showTab(true));
tabs.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const photo = $('#tab3d').getAttribute('aria-selected') === 'true';
  showTab(photo); (photo ? $('#tabPhoto') : $('#tab3d')).focus();
});

form.addEventListener('change', (e) => {
  const { name, value } = e.target;
  if (name === 'base' || name === 'color' || name === 'ring') { sel[name] = value; syncConfig(); }
  if (name === 'place' && photoImg) { placement = value; applyPhoto(); }
});
$('#qtyMinus').addEventListener('click', () => { sel.qty = Math.max(1, sel.qty - 1); syncConfig(); });
$('#qtyPlus').addEventListener('click', () => { sel.qty = Math.min(MAX_QTY, sel.qty + 1); syncConfig(); });
$('#resetView').addEventListener('click', () => studio?.resetView());

$('#photoInput').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = ''; // the file is not kept by the form either
  if (!file) return;
  const request = ++photoRequest, session = productSession;
  try {
    const image = await readPhoto(file);
    if (request !== photoRequest || session !== productSession || !dlg.open) return;
    photoImg = image;
    placement = suggestPlacement(photoImg);
    applyPhoto();
    $('#photoLabel').textContent = 'Fotografia ta e pe lampă';
    $('#photoClear').hidden = false;
    $('#placeField').hidden = false;
    if (sel.lit === false) $('#viewerNote').textContent = 'Stinsă, fotografia se vede doar ca relief. Aprinde lampa ca s-o vezi.';
  } catch {
    if (request !== photoRequest || session !== productSession || !dlg.open) return;
    $('#photoLabel').textContent = 'Alege JPG, PNG sau WebP de maximum 12 MB și 40 megapixeli.';
  }
});
function applyPhoto() {
  photoCanvas = lithoMap(photoImg, placement);
  studio?.setPhoto(photoCanvas);
  $(`#place-${placement}`).checked = true;
  $('#vPlace').textContent = PLACEMENTS.find((x) => x.id === placement).name;
  requestAnimationFrame(() => placePlace(true));
}
function clearPhoto() {
  photoRequest++;
  photoCanvas = null; photoImg = null;
  $('#placeField').hidden = true;
}
$('#photoClear').addEventListener('click', () => {
  clearPhoto(); studio?.setPhoto(null);
  $('#photoLabel').textContent = 'Încarcă o fotografie';
  $('#photoClear').hidden = true;
});

async function ensureStudio(session) {
  // a canvas whose context was released cannot host a new one, so every opening gets a fresh canvas
  const old = $('#studio'), canvas = old.cloneNode(false);
  old.replaceWith(canvas);
  const fallback = $('#studioFallback'), loading = $('#studioLoading');
  try {
    studioMod = studioMod || await import('./studio.js');
    if (session !== productSession || !dlg.open || !canvas.isConnected) return;
    if (!studioMod.webglAvailable()) throw new Error('no-webgl');
    studio = studioMod.createStudio(canvas, { reduceMotion: reduce() });
    canvas.hidden = false; fallback.hidden = true; loading.hidden = true;
    $('#litSeg').hidden = false; $('#resetView').hidden = false;
    $('#viewerNote').textContent = 'Formele pieselor printate. Trage de lampă sau folosește săgețile ca s-o rotești.';
  } catch (err) {
    if (session !== productSession || !dlg.open) return;
    console.warn('Previzualizarea 3D nu a pornit:', err?.message || err);
    studio = null; canvas.hidden = true; loading.hidden = true;
    const p = byId(PRODUCTS, sel.product);
    fallback.src = p.images.night.src; fallback.alt = `Randare: ${p.photoAlt}`; fallback.hidden = false;
    $('#litSeg').hidden = true; $('#resetView').hidden = true;
    $('#viewerNote').textContent = 'Previzualizarea 3D nu e disponibilă pe acest dispozitiv. Imaginea arată configurația standard.';
  }
}

async function openProduct(id, opener, config = null) {
  const session = ++productSession;
  disposeStudio();
  clearPhoto();
  $('#photoLabel').textContent = 'Încarcă o fotografie';
  $('#photoClear').hidden = true;
  const p = byId(PRODUCTS, id);
  Object.assign(sel, { product: id, ...p.defaults, ...(config || {}), qty: 1 });
  $('#pName').textContent = p.name;
  $('#pPrice').textContent = priceText(p.price);
  $('#pLong').textContent = p.long;
  $('#photoNight').src = p.images.night.src; $('#photoNight').alt = `Randare de ambient: ${p.photoAlt}, seara`;
  $('#photoDay').src = p.images.day.src; $('#photoDay').alt = `Randare de ambient: ${p.photoAlt}, ziua`;
  $('#studioLoading').hidden = false;
  if (!dlg.open) openDialog(dlg, opener);
  else if (opener) openers.set(dlg, opener);
  setHash(linkHash(sel));
  showTab(false);
  await ensureStudio(session);
  if (session !== productSession || !dlg.open) return;
  if (photoCanvas && p.personal) studio?.setPhoto(photoCanvas);
  setLit(true, false);
  syncConfig(false);
  placeLit(false); placeTab(false);
  $('#pName').focus?.();
}
function disposeStudio() { studio?.dispose(); studio = null; }
dlg.addEventListener('close', () => {
  if (dlg.open) return; // ignore an older close event delivered after the sheet reopened
  productSession++;
  setHash('');
  disposeStudio();
  clearPhoto(); // the photo lives only while the sheet is open
  $('#photoLabel').textContent = 'Încarcă o fotografie';
  $('#photoClear').hidden = true;
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]');
  if (b) { e.preventDefault(); openProduct(b.dataset.open, b); }
});
$('#pName').tabIndex = -1;

/* ---------- direct links: #lampa/<model>[/<soclu>/<culoare>/<inel>] ---------- */
// replaceState, not pushState: opening a lamp should not add a step to the back button.
function setHash(h) {
  if ((location.hash || '') === h) return;
  try { history.replaceState(null, '', h || location.pathname + location.search); } catch { /* sandboxed frames */ }
}
function openFromHash() {
  const c = parseLink(location.hash);
  if (c) openProduct(c.product, $(`.item-open[data-open="${c.product}"]`), c);
}
addEventListener('hashchange', openFromHash);
$('#copyLink').addEventListener('click', async () => {
  const url = location.href.split('#')[0] + linkHash(sel);
  try { await navigator.clipboard.writeText(url); island('Linkul a fost copiat'); }
  catch { island(url); }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  addToCart({ product: sel.product, base: sel.base, color: sel.color, ring: sel.ring }, sel.qty, $('#addBtn'));
});

/* ---------- cart ---------- */
let lines = Cart.restore(storage);
const cartBtn = $('#cartBtn'), cartDlg = $('#cartDlg');

function describe(l) {
  return `${byId(BASES, l.base).name} · ${byId(COLORS, l.color).name} · inel ${byId(RINGS, l.ring).name.toLowerCase()}`;
}
function renderCart(focusKey) {
  const n = Cart.count(lines);
  $('#cartCount').textContent = n;
  cartBtn.setAttribute('aria-label', `Coș, ${n} ${n === 1 ? 'produs' : 'produse'}`);
  $('#cartEmpty').hidden = lines.length > 0;
  $('#cartFoot').hidden = lines.length === 0;
  $('#lines').innerHTML = lines.map((l) => {
    const p = byId(PRODUCTS, l.product), k = Cart.lineKey(l);
    return `<li class="line" data-key="${esc(k)}">
      <img src="${p.images.thumb}" alt="" width="76" height="88" loading="lazy">
      <div>
        <h3>${esc(p.name)}</h3>
        <p class="opts-txt">${esc(describe(l))}</p>
        <div class="line-row">
          <div class="qty" role="group" aria-label="Cantitate ${esc(p.name)}">
            <button type="button" data-q="-1" aria-label="Scade cantitatea" ${l.qty <= 1 ? 'disabled' : ''}>−</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-q="1" aria-label="Crește cantitatea" ${l.qty >= MAX_QTY ? 'disabled' : ''}>+</button>
          </div>
          <button class="link" type="button" data-rm>Elimină</button>
        </div>
      </div></li>`;
  }).join('');
  const s = Cart.subtotal(lines);
  $('#subtotal').textContent = s.unpriced ? (s.known ? `${s.known} ${CURRENCY} + prețuri la lansare` : 'Prețuri la lansare') : `${s.known.toLocaleString('ro-RO')} ${CURRENCY}`;
  $('#selOut').hidden = true;
  if (focusKey !== undefined) {
    const row = $$('.line').find((li) => li.dataset.key === focusKey);
    (row ? $('[data-rm]', row) : $$('.line [data-rm]')[0] || $('[data-close]', cartDlg)).focus();
  }
  if (!Cart.persist(storage, lines) && storage) console.warn('Coșul nu a putut fi salvat pe acest dispozitiv.');
}
$('#lines').addEventListener('click', (e) => {
  const li = e.target.closest('.line');
  if (!li) return;
  const k = li.dataset.key, i = $$('.line').indexOf(li);
  const q = e.target.closest('[data-q]');
  if (q) {
    const cur = lines.find((l) => Cart.lineKey(l) === k);
    lines = Cart.setQty(lines, k, cur.qty + Number(q.dataset.q));
    renderCart();
    const row = $$('.line').find((x) => x.dataset.key === k);
    const btn = $(`[data-q="${q.dataset.q}"]`, row);
    (btn.disabled ? $(`[data-q="${-q.dataset.q}"]`, row) : btn).focus();
    return;
  }
  if (e.target.closest('[data-rm]')) {
    lines = Cart.removeLine(lines, k);
    const next = lines[Math.min(i, lines.length - 1)];
    renderCart(next ? Cart.lineKey(next) : null);
  }
});
$('#clearCart').addEventListener('click', () => { lines = []; renderCart(null); });
$('#copySel').addEventListener('click', async () => {
  const text = Cart.exportSelection(lines);
  const out = $('#selOut');
  out.value = text; out.hidden = false;
  try { await navigator.clipboard.writeText(text); island('Selecția a fost copiată'); }
  catch { out.focus(); out.select(); island('Selectează textul și copiază-l'); }
});
cartBtn.addEventListener('click', () => { renderCart(); openDialog(cartDlg, cartBtn); });
addEventListener('storage', (e) => { if (e.key === Cart.STORAGE_KEY) { lines = Cart.restore(storage); renderCart(); } });

let islandTimer;
function island(msg) {
  const el = $('#island');
  $('#islandMsg').textContent = msg;
  el.classList.add('show');
  clearTimeout(islandTimer);
  islandTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function addToCart(item, qty, from) {
  const before = Cart.count(lines);
  lines = Cart.addLine(lines, item, qty);
  const added = Cart.count(lines) - before;
  const done = () => {
    renderCart();
    cartBtn.classList.remove('jelly'); void cartBtn.offsetWidth; cartBtn.classList.add('jelly');
    const name = byId(PRODUCTS, item.product).name;
    island(added ? `${name} · adăugată în coș` : `${name} · ai atins cantitatea maximă (${MAX_QTY})`);
  };
  if (dlg.open) { // the sheet sits above the page, so confirm on the button itself
    done();
    const btn = $('#addBtn');
    btn.textContent = added ? 'Adăugată în coș' : `Maximum ${MAX_QTY} bucăți`;
    clearTimeout(btn._t); btn._t = setTimeout(() => { btn.textContent = 'Adaugă în coș'; }, 1800);
    return;
  }
  if (reduce() || !from) { done(); return; }
  const a = from.getBoundingClientRect(), b = $('#cartCount').getBoundingClientRect();
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, dx = b.left + b.width / 2 - x0, dy = b.top + b.height / 2 - y0;
  const fly = document.createElement('span');
  fly.className = 'fly';
  Object.assign(fly.style, { left: `${x0}px`, top: `${y0}px` });
  document.body.append(fly);
  fly.animate([
    { transform: 'translate(0, 0) scale(.4)', opacity: 0 },
    { transform: 'translate(0, -10px) scale(1.15, .85)', opacity: 1, offset: 0.12 },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(.9, 1.1)`, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(.5)`, opacity: 0.9 }
  ], { duration: 800, easing: 'cubic-bezier(.5, 0, .3, 1)' }).onfinish = () => { fly.remove(); done(); };
}

renderCart();
openFromHash();
