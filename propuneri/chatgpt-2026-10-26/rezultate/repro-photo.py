import asyncio,json,io
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright
buf=io.BytesIO();Image.new('RGB',(50,50),(230,40,80)).save(buf,format='PNG');png=buf.getvalue()
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--enable-unsafe-swiftshader'])
  page=await b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.add_init_script("URL.createObjectURL = () => location.origin + '/delayed-photo.png'")
  release=asyncio.Event();started=asyncio.Event()
  async def route(r):
   started.set();await release.wait();await r.fulfill(body=png,content_type='image/png')
  await page.route('**/delayed-photo.png',route)
  await page.goto('http://127.0.0.1:8090',wait_until='networkidle')
  await page.locator('[data-open="litofanie"]').first.click();await page.wait_for_function('document.querySelector("#studioLoading").hidden')
  await page.locator('#photoInput').set_input_files({'name':'fixture.png','mimeType':'image/png','buffer':png});await started.wait()
  await page.locator('#productDlg [data-close]').click();await page.wait_for_function('!document.querySelector("#productDlg").open');await page.wait_for_timeout(100)
  release.set();await page.wait_for_function('document.querySelector("#photoLabel").textContent.includes("Fotografia ta")')
  after=await page.evaluate('({open:document.querySelector("#productDlg").open,photoLabel:document.querySelector("#photoLabel").textContent,clearVisible:!document.querySelector("#photoClear").hidden})')
  await page.locator('[data-open="litofanie"]').first.click();await page.wait_for_function('document.querySelector("#studioLoading").hidden');await page.wait_for_timeout(250)
  result={'afterClosedDecode':after,'reopenedLabel':await page.locator('#photoLabel').text_content(),'errors':errors}
  Path('/workspace/LUMIS-audit-resultate/photo-race.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
  await b.close()
asyncio.run(main())
