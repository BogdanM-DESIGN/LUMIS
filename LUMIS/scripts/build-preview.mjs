// Produces a standalone, double-clickable review copy. The deployable site stays modular.
import {build} from 'esbuild';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>readFile(path.join(root,file),'utf8');
const assets={};
const mime={'.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.svg':'image/svg+xml'};
for(const folder of ['img','fonts'])for(const name of await readdir(path.join(root,folder))){
 const ext=path.extname(name);
 if(!mime[ext]||ext==='.jpg'&&name!=='litho-mostra.jpg')continue;
 assets[`${folder}/${name}`]=`data:${mime[ext]};base64,${(await readFile(path.join(root,folder,name))).toString('base64')}`;
}
assets['favicon.svg']=`data:image/svg+xml;base64,${(await readFile(path.join(root,'favicon.svg'))).toString('base64')}`;
const bundled=await build({entryPoints:[path.join(root,'js/app.js')],bundle:true,write:false,minify:true,format:'esm',target:'es2022',legalComments:'inline'});
const catalog=JSON.parse(await read('data/products.json'));
let html=await read('index.html');
html=html.replace(/<link rel="preload"[^>]*>/g,'').replace('<link rel="stylesheet" href="css/style.css">','').replace('<script type="module" src="js/app.js"></script>','');
// Each image is embedded once in the JS asset table; DOM URLs are assigned before the first paint.
html=html.replace(/srcset="([^"]*)"/g,'data-embedded-srcset="$1"');
html=html.replace(/src="(img\/[^\"]*)"/g,'data-embedded-src="$1"');
html=html.replace('href="favicon.svg"',`href="${assets['favicon.svg']}"`);
let css=await read('css/style.css')+'\n'+await read('css/information.css');
css=css.replace(/\.\.\/(fonts\/[^')]+)/g,(_,name)=>assets[name]||name);
html=html.replace('</head>',`<style>${css}</style></head>`);
const info=await read('informatii.html');
const infoMain=info.match(/<main[\s\S]*?<\/main>/)[0].replace('<main class="information wrap">','<div class="information wrap">').replace('</main>','</div>');
const infoDialog=`<dialog class="product-dialog" id="information-dialog" aria-label="Informații LUMIS"><button class="close-button glass" style="position:sticky;top:16px;float:right;margin:16px;z-index:3" data-close="information-dialog" aria-label="Închide informațiile">×</button>${infoMain}</dialog>`;
html=html.replace(/href="informatii.html#([a-z]+)"/g,'href="#$1" data-info="$1"');
const boot=`globalThis.LUMIS_CATALOG=${JSON.stringify(catalog)};globalThis.LUMIS_ASSETS=${JSON.stringify(assets)};
document.querySelectorAll('[data-embedded-srcset]').forEach(el=>{el.srcset=el.dataset.embeddedSrcset.split(',').map(part=>{const [src,size]=part.trim().split(/\\s+/);return (LUMIS_ASSETS[src]||src)+' '+size;}).join(', ');});
document.querySelectorAll('[data-embedded-src]').forEach(el=>{el.src=LUMIS_ASSETS[el.dataset.embeddedSrc];});
document.addEventListener('click',e=>{const link=e.target.closest('[data-info]');if(link){e.preventDefault();const dialog=document.querySelector('#information-dialog');dialog.showModal();document.body.classList.add('modal-open');dialog.querySelector('#'+link.dataset.info)?.scrollIntoView({behavior:'instant'});}const back=e.target.closest('#information-dialog a[href^="index.html"]');if(back){e.preventDefault();document.querySelector('#information-dialog').close();document.querySelector('#modele').scrollIntoView();}});
`;
html=html.replace('</body>',()=>`${infoDialog}<script type="module">${(boot+bundled.outputFiles[0].text).replace(/<\/script/gi,'<\\/script')}</script></body>`);
const output=path.resolve(root,'../LUMIS-deschide.html');
await writeFile(output,html);
console.log(`Standalone review copy: ${output}`);
