"""Run against a local HTTP server: python3 tests/browser_smoke.py.
Requires Playwright and Chromium (browser artifacts are saved outside the site).
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get('LUMIS_TEST_URL', 'http://127.0.0.1:8080')
OUT = ROOT.parent / 'LUMIS-verificare'
OUT.mkdir(exist_ok=True)

async def run():
 async with async_playwright() as p:
  browser = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'), args=['--no-sandbox','--enable-unsafe-swiftshader'])
  page = await browser.new_page(viewport={'width':1440,'height':1000})
  errors, failed, uploads = [], [], []
  page.on('pageerror', lambda e: errors.append(str(e)))
  page.on('response', lambda r: failed.append(f'{r.status} {r.url}') if r.status >= 400 else None)
  page.on('request', lambda r: uploads.append(r.url) if r.method not in ['GET','HEAD'] else None)
  await page.goto(BASE, wait_until='networkidle')
  assert await page.locator('.product-card').count() == 4
  assert not await page.locator('#checkout-button').is_enabled()
  # Explicitly visit lazy-loaded content before making a full page screenshot.
  for selector in ['.story-intro','#modele','.personal-story','.footer']:
   await page.locator(selector).scroll_into_view_if_needed()
   await page.wait_for_timeout(300)
  await page.locator('img').evaluate_all('(imgs)=>Promise.all(imgs.map(i=>i.decode().catch(()=>{})))')
  await page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await page.wait_for_timeout(1400)
  await page.screenshot(path=str(OUT/'desktop.png'), full_page=True)
  await page.locator('#tour-start').click()
  before = await page.evaluate('scrollY')
  await page.wait_for_timeout(600)
  assert await page.evaluate('scrollY') > before + 20
  await page.mouse.wheel(0,100)
  assert await page.locator('#tour-control').is_hidden()
  await page.wait_for_timeout(1100)
  # The room switch is time driven and uses separate on/off thresholds.
  async def room(progress):
   await page.evaluate('(p)=>{const el=document.querySelector("#room-story");window.scrollTo({top:el.offsetTop+(el.offsetHeight-innerHeight)*p,behavior:"instant"})}',progress)
   await page.wait_for_timeout(650)
  await room(.44)
  assert not await page.locator('#light-dot').evaluate('(el)=>el.classList.contains("on")')
  await room(.57)
  assert await page.locator('#light-dot').evaluate('(el)=>el.classList.contains("on")')
  assert 'Aprinsă' in await page.locator('#room-text').inner_text()
  await page.screenshot(path=str(OUT/'camera-seara.png'))
  await room(.52)
  assert await page.locator('#light-dot').evaluate('(el)=>el.classList.contains("on")')
  await room(.48)
  assert not await page.locator('#light-dot').evaluate('(el)=>el.classList.contains("on")')
  for model in ['litofanie','wave','twist','ribbed']:
   await page.locator(f'.product-open[data-product="{model}"]').click()
   await page.wait_for_function('(model)=>document.querySelector("#studio-canvas").dataset.model===model',arg=model)
   for base,color,ring in [('con','champagne','lumina'),('monolit','grafit','champagne'),('galet','negru','lumina')]:
    await page.locator(f'button[data-base="{base}"]').click()
    await page.locator(f'button[data-color="{color}"]').click()
    await page.locator(f'button[data-ring="{ring}"]').click()
    assert await page.locator('#studio-canvas').get_attribute('data-base') == base
    assert await page.locator('#studio-canvas').get_attribute('data-color') == color
    assert await page.locator('#studio-canvas').get_attribute('data-ring') == ring
   await page.locator('#light-toggle').click()
   assert await page.locator('#studio-canvas').get_attribute('data-lit') == 'false'
   await page.locator('#light-toggle').click()
   await page.locator('[data-view="photos"]').click()
   await page.locator('[data-photo="day"]').click()
   assert '-zi-' in await page.locator('#gallery-image').get_attribute('src')
   await page.locator('[data-view="studio"]').click()
   if model == 'litofanie':
    await page.locator('#photo-input').set_input_files(str(ROOT/'img/litho-mostra.jpg'))
    await page.wait_for_function('!document.querySelector("#simulation").hidden')
    assert await page.locator('#litho-canvas').evaluate('(c)=>c.getContext("2d").getImageData(200,100,1,1).data[3]') == 255
   if model == 'ribbed':
    await page.wait_for_timeout(300)
    await page.screenshot(path=str(OUT/'configurator-desktop.png'))
   await page.locator('#add-to-cart').click()
   assert not await page.locator('#product-dialog').is_visible()
  assert await page.locator('#cart-count').inner_text() == '4'
  await page.reload(wait_until='networkidle')
  assert await page.locator('#cart-count').inner_text() == '4'
  await page.locator('#open-cart').click()
  assert await page.locator('.cart-line').count() == 4
  assert 'Champagne' not in (await page.locator('.cart-line-options').first.inner_text()).split('/')[1]
  await page.locator('[data-cart-change="0"][data-delta="1"]').click()
  assert await page.locator('#cart-count').inner_text() == '5'
  await page.locator('[data-cart-remove="0"]').click()
  assert await page.locator('#cart-count').inner_text() == '3'
  async with page.expect_download() as info:
   await page.locator('#export-selection').click()
  download=await info.value
  path=await download.path()
  exported=json.loads(Path(path).read_text())
  assert len(exported['items']) == 3
  assert exported['items'][0]['soclu'] == 'Galet'
  assert 'photo' not in json.dumps(exported).lower()
  await page.keyboard.press('Escape')
  assert not await page.locator('#cart-dialog').is_visible()
  assert not uploads, uploads
  # Small viewport layouts, modal focus, and touch-friendly configuration.
  for width in [360,390,768]:
   mobile=await browser.new_page(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
   await mobile.goto(BASE,wait_until='networkidle')
   assert await mobile.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
   await mobile.locator('.product-open[data-product="wave"]').click()
   await mobile.locator('button[data-color="champagne"]').click()
   await mobile.wait_for_timeout(400)
   assert await mobile.evaluate('document.querySelector("#product-dialog").scrollWidth <= innerWidth'), width
   if width==390: await mobile.screenshot(path=str(OUT/'configurator-mobil.png'),full_page=True)
   await mobile.locator('[data-close="product-dialog"]').click()
   await mobile.evaluate('window.scrollTo({top:0,behavior:"instant"})')
   await mobile.wait_for_timeout(1200)
   if width==390: await mobile.screenshot(path=str(OUT/'mobil.png'))
   await mobile.close()
  reduced=await browser.new_page(reduced_motion='reduce')
  await reduced.goto(BASE,wait_until='networkidle')
  assert await reduced.locator('#tour-start').is_hidden()
  assert await reduced.locator('.hero-mark').evaluate('(el)=>getComputedStyle(el).animationName') == 'none'
  await reduced.goto(BASE+'/informatii.html',wait_until='networkidle')
  assert await reduced.locator('#confidentialitate').count() == 1
  await reduced.close()
  # WebGL unavailable: photographs and all configuration controls still work.
  fallback=await browser.new_page()
  await fallback.add_init_script('const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args)}')
  await fallback.goto(BASE,wait_until='networkidle')
  await fallback.locator('.product-open[data-product="wave"]').click()
  await fallback.wait_for_timeout(600)
  assert await fallback.locator('#photo-gallery').is_visible()
  await fallback.locator('button[data-color="grafit"]').click()
  await fallback.locator('#add-to-cart').click()
  assert await fallback.locator('#cart-count').inner_text() == '1'
  await fallback.close()
  assert not errors, errors
  assert not failed, failed
  report={'result':'PASS','desktop':'1440×1000','mobileWidths':[360,390,768],'models':4,'optionConfigurationsExercised':12,'checks':['catalog','3D model updates','gallery','photo canvas without upload','cart persistence, quantity, remove, export','room transition, switch, hysteresis','automatic tour and interruption','responsive overflow','reduced motion','WebGL fallback','no JS errors or HTTP errors']}
  (OUT/'results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
  print(json.dumps(report,ensure_ascii=False))
  await browser.close()

asyncio.run(run())
