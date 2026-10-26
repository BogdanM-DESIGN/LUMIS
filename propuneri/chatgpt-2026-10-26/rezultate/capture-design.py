import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/workspace/LUMIS-audit-design-2026-10-26/capturi');OUT.mkdir(exist_ok=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
  errors=[];http_errors=[]
  for label,url in [('inainte','http://127.0.0.1:8090'),('dupa','http://127.0.0.1:8092')]:
   for device,w,h in [('desktop',1440,900),('telefon',390,844)]:
    page=await b.new_page(viewport={'width':w,'height':h});page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:http_errors.append(r.url) if r.status>=400 else None)
    await page.goto(url,wait_until='networkidle');await page.evaluate('document.fonts.ready');await page.wait_for_timeout(1300)
    await page.screenshot(path=str(OUT/f'{label}-{device}-deschidere.png'))
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    for section in ['colectie','personalizare']:
     await page.evaluate('(id)=>{const e=document.getElementById(id);scrollTo(0,e.offsetTop-100)}',section)
     await page.wait_for_timeout(500);await page.locator('#'+section+' img').evaluate_all('(images)=>Promise.all(images.map(i=>i.decode().catch(()=>{})))')
     await page.screenshot(path=str(OUT/f'{label}-{device}-{section}.png'))
    if label=='dupa':
     await page.locator('[data-open="litofanie"]').first.click();await page.wait_for_function('document.querySelector("#studioLoading").hidden');await page.wait_for_timeout(500)
     await page.screenshot(path=str(OUT/f'{label}-{device}-configurator.png'))
    await page.close()
  Path('/workspace/LUMIS-audit-resultate/design-capture.json').write_text(json.dumps({'pageErrors':errors,'httpErrors':http_errors,'screenshots':len(list(OUT.glob('*.png')))},indent=2))
  assert not errors,errors;assert not http_errors,http_errors
  print('Before/after screenshots captured; no page/HTTP errors; no horizontal overflow.')
  await b.close()
asyncio.run(main())
