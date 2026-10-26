"""Regression checks for the independent audit; Python Playwright + Chromium.
Serve this source tree first. Run: python tests/audit-regressions.py http://127.0.0.1:8092
Synthetic fixtures only. An unpatched source is expected to fail.
"""
import asyncio
import io
import json
import os
import sys
from PIL import Image
from playwright.async_api import async_playwright

URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8092'
buf=io.BytesIO();Image.new('RGB',(60,40),(220,40,80)).save(buf,format='PNG');PNG=buf.getvalue()

async def ready(page):
 await page.wait_for_function('document.querySelector("#studioLoading").hidden')
 await page.screenshot()  # request an actual compositor frame instead of relying on headless RAF scheduling

async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--enable-unsafe-swiftshader'])
  class Checks(list):
   def append(self, value):
    super().append(value);print('PASS:',value,flush=True)
  checks=Checks()
  page=await browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.add_init_script("URL.createObjectURL=()=>location.origin+'/delayed-photo.png'")
  release=asyncio.Event();started=asyncio.Event();delivered=asyncio.Event()
  async def delayed(route):
   started.set();await release.wait();await route.fulfill(body=PNG,content_type='image/png');delivered.set()
  await page.route('**/delayed-photo.png',delayed)
  await page.goto(URL,wait_until='networkidle')
  await page.locator('[data-open="litofanie"]').first.click();await ready(page)
  await page.locator('#photoInput').set_input_files({'name':'synthetic.png','mimeType':'image/png','buffer':PNG});await started.wait()
  await page.locator('#productDlg [data-close]').click();await page.wait_for_function('!document.querySelector("#productDlg").open')
  await page.wait_for_timeout(50);release.set();await delivered.wait();await page.wait_for_timeout(300)
  assert await page.locator('#photoLabel').text_content()=='Încarcă o fotografie'
  assert await page.locator('#photoClear').is_hidden()
  await page.locator('[data-open="litofanie"]').first.click();await ready(page)
  assert await page.locator('#photoLabel').text_content()=='Încarcă o fotografie'
  checks.append('late photo decode cannot restore a closed product photo');await page.close()

  page=await browser.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto(URL+'/#lampa/wave',wait_until='networkidle');await ready(page)
  await page.evaluate('location.hash="#lampa/ribbed/con/grafit/lumina"')
  await page.wait_for_function('document.querySelector("#pName").textContent==="Ribbed"');await ready(page)
  await page.wait_for_timeout(150)
  assert await page.evaluate('location.hash')=='#lampa/ribbed/con/grafit/lumina'
  assert await page.evaluate('!document.querySelector("#studio").getContext("webgl2").isContextLost()')
  checks.append('changing a direct link in an open sheet keeps the new context and link')
  await page.evaluate("document.querySelector('#productDlg').close();document.querySelector('[data-open=twist]').click()")
  await ready(page);await page.wait_for_timeout(100)
  assert await page.evaluate('location.hash')=='#lampa/twist'
  assert await page.evaluate('!document.querySelector("#studio").getContext("webgl2").isContextLost()')
  checks.append('a stale close event cannot dispose a synchronously reopened sheet');await page.close()

  page=await browser.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  await page.add_init_script("window.studioContexts=[];const get=HTMLCanvasElement.prototype.getContext,seen=new WeakSet();HTMLCanvasElement.prototype.getContext=function(type,...args){if(this.id==='studio'&&/^webgl/.test(type)&&!seen.has(this)){seen.add(this);window.studioContexts.push(this.isConnected)}return get.call(this,type,...args)}")
  release=asyncio.Event();started=asyncio.Event()
  async def delayed_module(route):
   started.set();await release.wait();await route.continue_()
  await page.route('**/js/studio.js',delayed_module)
  await page.goto(URL,wait_until='networkidle');await page.locator('[data-open="wave"]').first.click();await started.wait()
  await page.locator('#productDlg [data-close]').click();await page.wait_for_function('!document.querySelector("#productDlg").open');await page.wait_for_timeout(50)
  await page.locator('[data-open="ribbed"]').first.click();release.set();await ready(page)
  assert await page.evaluate('window.studioContexts')==[True]
  checks.append('delayed module import does not allocate a renderer on a detached canvas')
  rejected=await page.evaluate("async()=>{const {readPhoto}=await import('./js/litho.js');const out=[];for(const file of [new File(['x'],'bad.svg',{type:'image/svg+xml'}),new File([new Uint8Array(12*1024*1024+1)],'big.png',{type:'image/png'})]){try{await readPhoto(file);out.push('accepted')}catch(e){out.push(e.message)}}return out}")
  assert rejected==['type','size'];checks.append('photo type and byte limits reject invalid input before decoding');await page.close()

  for width,height in [(390,844),(360,640),(768,1024)]:
   page=await browser.new_page(viewport={'width':width,'height':height});await page.goto(URL,wait_until='networkidle');await page.locator('[data-open="wave"]').first.click();await ready(page)
   boxes=await page.evaluate("()=>{const b=document.querySelector('.viewer-bar').getBoundingClientRect(),n=document.querySelector('#viewerNote'),r=n.getBoundingClientRect();return {noteVisible:getComputedStyle(n).display!=='none',overlap:b.left<r.right&&b.right>r.left&&b.top<r.bottom&&b.bottom>r.top,overflow:document.documentElement.scrollWidth>innerWidth}}")
   assert not boxes['overflow'];assert not (boxes['noteVisible'] and boxes['overlap']),boxes
   await page.close()
  checks.append('viewer controls do not cover the note at 360, 390 and 768 px')
  assert not errors,errors
  print(json.dumps({'passed':len(checks),'checks':checks,'pageErrors':errors},ensure_ascii=False,indent=2))
  await browser.close()

asyncio.run(asyncio.wait_for(run(),timeout=120))
