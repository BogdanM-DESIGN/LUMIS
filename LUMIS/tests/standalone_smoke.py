"""Checks the exported document with no server or external asset requests.

Cloud Chromium blocks file navigation, so load the complete HTML as a document.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'LUMIS-verificare'

async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--enable-unsafe-swiftshader'])
  page=await browser.new_page(viewport={'width':1440,'height':1000})
  errors,external=[],[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:external.append(r.url) if r.url.startswith('http') else None)
  await page.set_content((ROOT.parent/'LUMIS-deschide.html').read_text(),wait_until='load')
  await page.wait_for_timeout(1300)
  assert await page.locator('.product-card').count()==4, errors
  await page.locator('.product-open[data-product="wave"]').click()
  await page.wait_for_function('document.querySelector("#studio-canvas").dataset.model==="wave"')
  await page.locator('button[data-color="champagne"]').click()
  assert await page.locator('#studio-canvas').get_attribute('data-color')=='champagne'
  assert await page.locator('#base-options .segment-drop').evaluate('(e)=>e.getBoundingClientRect().width>20')
  await page.locator('#add-to-cart').click()
  assert await page.locator('#cart-count').inner_text()=='1'
  await page.locator('[data-info="confidentialitate"]').click()
  assert await page.locator('#information-dialog').is_visible()
  await page.keyboard.press('Escape')
  assert not await page.locator('#information-dialog').is_visible()
  await page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
  await page.wait_for_timeout(1200)
  OUT.mkdir(exist_ok=True)
  await page.screenshot(path=str(OUT/'autonom-desktop.png'))
  await page.set_viewport_size({'width':390,'height':844})
  await page.wait_for_timeout(700)
  assert await page.locator('.hero-picture img').evaluate('(i)=>i.naturalWidth>0')
  assert await page.locator('.hero-picture img').evaluate('(i)=>i.currentSrc.startsWith("data:image/webp")')
  assert await page.locator('.hero-picture img').evaluate('(i)=>i.naturalHeight>i.naturalWidth')
  await page.screenshot(path=str(OUT/'autonom-mobil.png'))
  assert not errors,errors
  assert not external,external
  report={'result':'PASS','externalRequests':0,'method':'Complete HTML loaded as a document; file:// navigation blocked by cloud browser policy','checks':['embedded assets','3D options','selection indicator','cart','information dialog','responsive portrait image']}
  (OUT/'standalone-results.json').write_text(json.dumps(report,indent=2))
  print(json.dumps(report))
  await browser.close()

asyncio.run(run())
