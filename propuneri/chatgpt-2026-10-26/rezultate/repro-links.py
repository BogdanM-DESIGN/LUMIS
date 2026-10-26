import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
  page=await b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('http://127.0.0.1:8090/#lampa/wave',wait_until='networkidle');await page.wait_for_function('document.querySelector("#studioLoading").hidden');await page.wait_for_timeout(100)
  await page.evaluate('location.hash="#lampa/ribbed/con/grafit/lumina"');await page.wait_for_timeout(1000)
  out=await page.evaluate('({open:document.querySelector("#productDlg").open,name:document.querySelector("#pName").textContent,hash:location.hash,contextLost:document.querySelector("#studio").getContext("webgl2").isContextLost()})')
  out['errors']=errors;Path('/workspace/LUMIS-audit-resultate/link-race.json').write_text(json.dumps(out,indent=2));print(json.dumps(out))
  await b.close()
asyncio.run(main())
