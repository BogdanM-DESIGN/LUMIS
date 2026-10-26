// Browser regression checks for bugs found during review. Needs Playwright with Chromium.
// Run: node tests/browser-smoke.cjs   (serves the site itself on a local port)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
// the same policy netlify.toml sends, so a blocked resource fails the test
const CSP = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8').match(/Content-Security-Policy = "([^"]+)"/)[1];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Content-Security-Policy': CSP });
  fs.createReadStream(file).pipe(res);
});

const checks = [];
const check = (name, ok, detail = '') => { checks.push({ name, ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`); };

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (/Content Security Policy|Refused to/.test(m.text())) errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: 'networkidle' });

  // collection images must take up space (an inline wrapper once collapsed them to 0 px)
  await page.evaluate(() => document.getElementById('colectie').scrollIntoView());
  await page.waitForTimeout(500);
  const heights = await page.$$eval('.item-media', (els) => els.map((e) => e.getBoundingClientRect().height));
  check('collection images are visible', heights.length === 4 && heights.every((h) => h > 100), heights.map(Math.round).join(','));

  // the room: switch on at 0.55, stay on at 0.52, switch off below 0.5
  const at = async (p) => {
    await page.evaluate((p) => { const s = document.getElementById('poveste'); scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * p); }, p);
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return page.evaluate(() => document.getElementById('poveste').classList.contains('on'));
  };
  const seq = [await at(0.3), await at(0.6), await at(0.52), await at(0.45)];
  check('lamp switch keeps its hysteresis', JSON.stringify(seq) === '[false,true,true,false]', JSON.stringify(seq));

  // the 3D preview must start again after the sheet is closed (a released canvas cannot be reused)
  let started = 0;
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => document.querySelector('[data-open="wave"]').click());
    await page.waitForFunction(() => document.getElementById('studioLoading').hidden, null, { timeout: 15000 });
    if (await page.evaluate(() => !document.getElementById('litSeg').hidden)) started++;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
  check('3D preview restarts on every opening', started === 3, `${started}/3`);

  // cart: identical lines merge, survive a reload, corrupt storage is ignored
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => { document.querySelectorAll('.quick')[2].click(); });
  await page.waitForTimeout(1100);
  await page.evaluate(() => { document.querySelectorAll('.quick')[2].click(); });
  await page.waitForTimeout(1100);
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('lumis.cart.v1')));
  check('identical lines merge', stored.length === 1 && stored[0].qty === 2, JSON.stringify(stored));
  await page.reload({ waitUntil: 'networkidle' });
  check('cart restores after reload', (await page.textContent('#cartCount')) === '2');
  await page.evaluate(() => localStorage.setItem('lumis.cart.v1', '{broken'));
  await page.reload({ waitUntil: 'networkidle' });
  check('corrupt storage starts an empty cart', (await page.textContent('#cartCount')) === '0');

  // mouse wheel: eases to exactly the requested distance; small trackpad deltas stay native (instant)
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => scrollTo(0, 400));
  await page.mouse.move(600, 400);
  await page.mouse.wheel(0, 300);
  const mid = await page.evaluate(() => scrollY);
  await page.waitForTimeout(900);
  const end = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 20);
  await page.waitForTimeout(50);
  const pad = await page.evaluate(() => scrollY);
  check('mouse wheel eases to the exact distance, trackpad stays native', mid < 700 && Math.abs(end - 700) < 1 && Math.abs(pad - 720) < 1, `${mid} -> ${end}, +20 -> ${pad}`);

  // typography: buttons, labels and menu use Manrope at small sizes; titles use Bodoni
  const fonts = await page.evaluate(() => ['.btn', '.fine', '.cart', '.title'].map((s) => {
    const cs = getComputedStyle(document.querySelector(s)); return [s, cs.fontFamily.split(',')[0].replace(/"/g, ''), parseFloat(cs.fontSize)];
  }));
  const fontsOk = fonts.slice(0, 3).every(([, f, px]) => f === 'Manrope' && px <= 14) && fonts[3][1] === 'Bodoni Moda';
  check('typography: Manrope for controls, Bodoni for titles', fontsOk, fonts.map((f) => f.join(' ')).join(' | '));

  // no top bar and no tour; "Vezi colecția" brings the collection title to the top; the cart stays in its corner
  await page.goto(url, { waitUntil: 'networkidle' });
  const bare = await page.evaluate(() => !document.getElementById('tour') && !document.querySelector('header, nav'));
  await page.evaluate(() => document.querySelector('.hero [data-go="colectie"]').click());
  await page.waitForTimeout(1600);
  const land = await page.evaluate(() => {
    const t = document.getElementById('h-col').getBoundingClientRect(), c = document.getElementById('cartBtn').getBoundingClientRect();
    return { top: Math.round(t.top), cartRight: Math.round(innerWidth - c.right), cartTop: Math.round(c.top), fixed: getComputedStyle(document.getElementById('cartBtn')).position };
  });
  check('no bar or tour; links land at the top; cart stays in the corner', bare && land.top > 0 && land.top < 260 && land.fixed === 'fixed' && land.cartRight < 40 && land.cartTop < 40, JSON.stringify(land));

  // the customer's photo is gone after the sheet closes and does not come back on reopening
  await page.evaluate(() => document.querySelector('[data-open="litofanie"]').click());
  await page.waitForFunction(() => document.getElementById('studioLoading').hidden, null, { timeout: 15000 });
  const sample = require('fs').readFileSync(require('path').join(__dirname, '..', 'img', 'litofanie-mostra.webp'));
  await page.setInputFiles('#photoInput', { name: 'test.png', mimeType: 'image/webp', buffer: sample });
  await page.waitForFunction(() => !document.getElementById('photoClear').hidden, null, { timeout: 5000 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-open="litofanie"]').click());
  await page.waitForFunction(() => document.getElementById('studioLoading').hidden, null, { timeout: 15000 });
  const after = await page.evaluate(() => ({ clear: document.getElementById('photoClear').hidden, place: document.getElementById('placeField').hidden,
    label: document.getElementById('photoLabel').textContent, stored: JSON.stringify(localStorage).includes('test.png') }));
  await page.keyboard.press('Escape');
  check('the photo is cleared when the sheet closes', after.clear && after.place && after.label === 'Încarcă o fotografie' && !after.stored, JSON.stringify(after));

  // direct links: a link opens the configured lamp, choices update it, closing removes it
  await page.goto(url + '#lampa/twist/con/grafit/lumina', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.getElementById('productDlg').open && document.getElementById('studioLoading').hidden, null, { timeout: 15000 });
  const opened = await page.evaluate(() => [document.getElementById('pName').textContent, document.getElementById('vBase').textContent, document.getElementById('vColor').textContent].join('/'));
  check('a direct link opens the configured lamp', opened === 'Twist/Con/Grafit', opened);
  await page.evaluate(() => document.getElementById('base-galet').click());
  const h1 = await page.evaluate(() => location.hash);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.waitForFunction(() => location.hash === '');
  const h2 = await page.evaluate(() => location.hash);
  check('the link follows the configuration and clears on close', h1 === '#lampa/twist/galet/grafit/lumina' && h2 === '', `${h1} -> "${h2}"`);
  await page.goto(url + '#lampa/nu-exista', { waitUntil: 'networkidle' });
  check('an unknown link leaves the sheet closed', !(await page.evaluate(() => document.getElementById('productDlg').open)));

  check('no page errors or failed requests', errors.length === 0, errors.join(' | '));
  await browser.close();
  server.close();
  process.exit(checks.every((c) => c.ok) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
