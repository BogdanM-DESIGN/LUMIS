import {createCart,getSubtotal} from './cart.js';
import {setupMotion,animateToCart,reducedMotion} from './motion.js';

const $ = selector => document.querySelector(selector);
const catalog = globalThis.LUMIS_CATALOG ?? await fetch('data/products.json').then(response => {if(!response.ok)throw Error('catalog');return response.json();}).catch(error=>{
  $('#products-grid').innerHTML='<p>Colecția nu s-a putut încărca. Reîncarcă pagina sau pornește site-ul prin serverul local descris în README.</p>';
  throw error;
});
const asset = path => globalThis.LUMIS_ASSETS?.[path] ?? path;
const assetHTML = html => html.replace(/img\/[a-z0-9-]+\.(?:webp|jpg)/g, asset);
const formatMoney = value => new Intl.NumberFormat('ro-RO',{style:'currency',currency:catalog.currency,maximumFractionDigits:0}).format(value);
const priceLabel = product => product.price == null ? 'Preț în curând' : formatMoney(product.price);
// Text from uploaded files is only assigned with textContent. No customer text enters innerHTML.
const named = (list,id) => list.find(option => option.id === id)?.name || '';
let storage;
try {storage=localStorage;}catch {storage={getItem:()=>null,setItem:()=>{}};}
const cart = createCart(catalog,storage);
const tour = setupMotion();
let current,configuration,quantity=1,studio,studioPromise,isLit=true,customPhoto=false,photoVersion=0;
let noticeTimer;
const baseIcons = {
  galet:'<path d="M4 11Q4 6 10 6H30Q36 6 36 11V16Q36 22 30 22H10Q4 22 4 16Z"/>',
  monolit:'<path d="M5 9Q5 6 9 6H31Q35 6 35 9V22H5Z"/><path d="M5 10H35"/>',
  con:'<path d="M9 6H31L37 22H3Z"/>'
};

$('#products-grid').innerHTML=assetHTML(catalog.products.map(product=>`<article class="product-card"><div class="product-media"><button class="product-open" data-product="${product.id}" aria-label="Descoperă și configurează ${product.name}"><img class="product-night" src="img/${product.image}-640.webp" srcset="img/${product.image}-640.webp 640w, img/${product.image}-1280.webp 1280w" sizes="(max-width: 390px) 90vw, (max-width: 1100px) 44vw, 22vw" width="1161" height="1355" loading="lazy" decoding="async" alt="Lampă ${product.name} aprinsă, în ambient"><img class="product-day" src="img/${product.image}-zi-640.webp" srcset="img/${product.image}-zi-640.webp 640w, img/${product.image}-zi-1280.webp 1280w" sizes="(max-width: 390px) 90vw, (max-width: 1100px) 44vw, 22vw" width="1161" height="1355" loading="lazy" decoding="async" alt="Lampă ${product.name} stinsă, ziua"></button>${product.personalized?'<span class="product-badge glass">Fotografia ta</span>':''}<span class="product-number">${product.number}</span><button class="product-plus glass" data-product="${product.id}" aria-label="Personalizează ${product.name}">+</button></div><div class="product-meta"><h3><button class="product-title" data-product="${product.id}">${product.name}</button></h3><span class="product-price">${priceLabel(product)}</span></div><p class="product-short">${product.short}</p><button class="product-configure" data-product="${product.id}">Configurează <span aria-hidden="true">↗</span></button></article>`).join(''));

function notify(text){clearTimeout(noticeTimer);$('.notice span').textContent=text;$('.notice').classList.add('show');noticeTimer=setTimeout(()=>$('.notice').classList.remove('show'),2800);}
function syncBodyLock(){document.body.classList.toggle('modal-open',Boolean(document.querySelector('dialog[open]')));}
function showDialog(dialog){tour.stop();dialog.showModal();syncBodyLock();}
for(const dialog of document.querySelectorAll('dialog')){
  dialog.addEventListener('close',syncBodyLock);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
}
document.addEventListener('click',event=>{
  const productButton=event.target.closest('[data-product]');
  if(productButton)openProduct(productButton.dataset.product);
  const close=event.target.closest('[data-close]');if(close)document.getElementById(close.dataset.close).close();
});

function renderOptions(){
  $('#base-options').innerHTML='<span class="segment-drop" aria-hidden="true"></span>'+catalog.bases.map(base=>`<button type="button" data-base="${base.id}" aria-pressed="${base.id===configuration.base}" title="${base.description}"><svg viewBox="0 0 40 27" aria-hidden="true">${baseIcons[base.id]}</svg>${base.name}</button>`).join('');
  $('#color-options').innerHTML=catalog.colors.map(color=>`<button type="button" class="color-choice" data-color="${color.id}" aria-label="${color.name}" title="${color.name}" aria-pressed="${color.id===configuration.color}"><span style="background:${color.hex}"></span></button>`).join('');
  $('#ring-options').innerHTML='<span class="segment-drop" aria-hidden="true"></span>'+catalog.rings.map(ring=>`<button type="button" data-ring="${ring.id}" aria-pressed="${ring.id===configuration.ring}">${ring.name}</button>`).join('');
  updateConfiguration();
}
function positionDrop(segment){
  const active=segment.querySelector('[aria-pressed="true"]'),drop=segment.querySelector('.segment-drop');
  if(!active||!drop)return;
  const oldWidth=drop.getBoundingClientRect().width;
  drop.style.width=`${active.offsetWidth}px`;drop.style.transform=`translateX(${active.offsetLeft-4}px)`;
  if(!reducedMotion.matches&&oldWidth>0)drop.animate([{scale:'1 1'},{scale:'1.08 .94',offset:.45},{scale:'1 1'}],{duration:550,easing:'cubic-bezier(.2,.8,.3,1)'});
}
function updateConfiguration(){
  $('#base-value').textContent=named(catalog.bases,configuration.base);
  $('#color-value').textContent=named(catalog.colors,configuration.color);
  $('#studio-model').textContent=`${current.name} / ${named(catalog.bases,configuration.base)}`.toUpperCase();
  configuration.hex=catalog.colors.find(color=>color.id===configuration.color).hex;
  studio?.update(configuration);
  document.querySelectorAll('.segment').forEach(positionDrop);
}
for(const type of ['base','color','ring']){
  $(`#${type}-options`).addEventListener('click',event=>{
    const button=event.target.closest(`[data-${type}]`);if(!button)return;
    configuration[type]=button.dataset[type];
    button.parentElement.querySelectorAll('button').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
    updateConfiguration();
  });
}
addEventListener('resize',()=>document.querySelectorAll('.segment').forEach(positionDrop),{passive:true});

async function initStudio(){
  if(!studioPromise)studioPromise=import('./studio.js').then(module=>{
    studio=module.createStudio($('#studio-canvas'));$('#studio-loading').hidden=true;return studio;
  }).catch(error=>{
    console.warn('Studio 3D indisponibil:',error.message);
    $('#studio-loading').textContent='Previzualizarea 3D nu este disponibilă în acest browser.';
    $('#studio-canvas').hidden=true;
    notify('Poți continua configurarea și vedea imaginile de ambient.');
    return null;
  });
  return studioPromise;
}
async function openProduct(id){
  current=catalog.products.find(product=>product.id===id);if(!current)return;
  const productId=current.id;
  configuration={productId,base:current.defaultBase,color:current.defaultColor,ring:current.defaultRing};
  quantity=1;isLit=true;$('#quantity-value').textContent='1';
  $('#product-name').textContent=current.name;$('#product-tag').textContent=current.tag;$('#product-price').textContent=priceLabel(current);$('#product-description').textContent=current.description;$('#photo-upload').hidden=!current.personalized;
  removePhoto();renderOptions();
  showDialog($('#product-dialog'));setView('studio');setPhotoView('night');
  requestAnimationFrame(()=>document.querySelectorAll('.segment').forEach(positionDrop));
  $('#light-toggle').setAttribute('aria-pressed','true');$('#light-toggle span').textContent='Lumină aprinsă';
  const loaded=await initStudio();
  if(!$('#product-dialog').open||current.id!==productId)return;
  if(loaded){loaded.resume();loaded.update(configuration);loaded.setLit(true);if(productId==='litofanie')setSample();}
  else setView('photos');
}
$('#product-dialog').addEventListener('close',()=>{studio?.pause();removePhoto();});
function setView(view){
  $('#studio').hidden=view!=='studio';$('#photo-gallery').hidden=view!=='photos';
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
  if(view==='studio')studio?.resume();else studio?.pause();
}
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
function setPhotoView(view){
  $('#gallery-image').src=asset(view==='detail'?'img/detaliu-1280.webp':`img/${current.image}${view==='day'?'-zi':''}-1280.webp`);
  $('#gallery-image').alt=view==='detail'?'Detaliu al nervurilor Ribbed și al soclului Con':`Lampă ${current.name} ${view==='day'?'stinsă, ziua':'aprinsă, seara'}`;
  document.querySelectorAll('[data-photo]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.photo===view)));
}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>setPhotoView(button.dataset.photo)));
$('#light-toggle').addEventListener('click',()=>{isLit=!isLit;studio?.setLit(isLit);$('#light-toggle').setAttribute('aria-pressed',String(isLit));$('#light-toggle span').textContent=isLit?'Lumină aprinsă':'Lumină stinsă';});
$('#quantity-minus').addEventListener('click',()=>{$('#quantity-value').textContent=quantity=Math.max(1,quantity-1);});
$('#quantity-plus').addEventListener('click',()=>{$('#quantity-value').textContent=quantity=Math.min(99,quantity+1);});

function warmImage(source,width=480,height=360){
  const result=document.createElement('canvas');result.width=width;result.height=height;
  const context=result.getContext('2d',{willReadFrequently:true});
  const ratio=Math.max(width/source.width,height/source.height);
  context.drawImage(source,(width-source.width*ratio)/2,(height-source.height*ratio)/2,source.width*ratio,source.height*ratio);
  const pixels=context.getImageData(0,0,width,height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4,lum=(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722)/255;
    const edge=.66+.34*Math.sqrt(Math.max(0,1-((x/width-.5)*2)**2));
    const frame=y<height*.035||y>height*.965?.58:1;
    const t=Math.pow(lum,.85)*edge*frame;
    pixels.data[i]=55+194*t;pixels.data[i+1]=34+188*t;pixels.data[i+2]=21+155*t;pixels.data[i+3]=255;
  }
  context.putImageData(pixels,0,0);return result;
}
let samplePromise;
async function setSample(){
  if(!samplePromise)samplePromise=new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(warmImage(image,512,512));image.onerror=()=>resolve(null);image.src=asset('img/litho-mostra.jpg');});
  const sample=await samplePromise;if(current?.personalized&&!customPhoto&&$('#product-dialog').open)studio?.setPhoto(sample);
}
function removePhoto(){
  photoVersion++;customPhoto=false;$('#photo-input').value='';$('#upload-label').replaceChildren(document.createTextNode('Alege o fotografie'));
  const small=document.createElement('small');small.textContent='JPG, PNG sau WebP · maximum 12 MB';$('#upload-label').append(small);
  $('#simulation').hidden=true;const c=$('#litho-canvas');c.getContext('2d').clearRect(0,0,c.width,c.height);studio?.setPhoto(null);
}
$('#remove-photo').addEventListener('click',()=>{removePhoto();setSample();});
$('#photo-input').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  const version=++photoVersion;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024){notify('Alege JPG, PNG sau WebP, de maximum 12 MB.');event.target.value='';return;}
  try {
    const image=await createImageBitmap(file);
    if(version!==photoVersion){image.close();return;}
    if(image.width*image.height>40_000_000){image.close();throw Error('Rezoluția este prea mare. Alege o imagine sub 40 megapixeli.');}
    const preview=warmImage(image);const texture=warmImage(image,768,768);image.close();
    $('#litho-canvas').getContext('2d').drawImage(preview,0,0);$('#simulation').hidden=false;customPhoto=true;
    $('#upload-label').textContent='Fotografie pregătită pentru simulare';studio?.setPhoto(texture);notify('Fotografia a fost aplicată în Studio 3D.');
  }catch(error){notify(error.message.includes('megapixeli')?error.message:'Imaginea nu a putut fi citită. Încearcă alt fișier.');event.target.value='';}
});

$('#config-form').addEventListener('submit',event=>{
  event.preventDefault();cart.add({...configuration,quantity});
  const name=current.name;const hadPhoto=customPhoto;
  $('#product-dialog').close();
  animateToCart(document.querySelector(`[data-product="${current.id}"]`),$('#open-cart'));
  notify(`${name} · configurație adăugată în coș`);
  if(hadPhoto)setTimeout(()=>notify('Coșul păstrează opțiunile, fără fotografia personală.'),3000);
});

function renderCart(){
  $('#cart-count').textContent=cart.count;$('#cart-total-count').textContent=cart.count;
  $('#open-cart').setAttribute('aria-label',`Deschide coșul, ${cart.count} produse`);
  if(!cart.items.length){
    $('#cart-items').innerHTML='<div class="cart-empty"><p>Încă puțină liniște.</p><p>Alege o lampă și fă-i loc în selecția ta.</p><button class="underlined" id="continue-shopping">Descoperă modelele <span aria-hidden="true">↗</span></button></div>';
    $('#continue-shopping').addEventListener('click',()=>{$('#cart-dialog').close();$('#modele').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});});
  }else $('#cart-items').innerHTML=assetHTML(cart.items.map((item,index)=>{
    const product=catalog.products.find(p=>p.id===item.productId);
    return `<article class="cart-line"><img src="img/${product.image}-640.webp" width="80" height="100" alt="${product.name}"><div><h3>${product.name}</h3><p class="cart-line-options">${named(catalog.bases,item.base)} / ${named(catalog.colors,item.color)}<br>${named(catalog.rings,item.ring)}${product.personalized?'<br>Fotografia se transmite la comandă.':''}</p><div class="cart-line-bottom"><div class="quantity"><button data-cart-change="${index}" data-delta="-1" aria-label="Scade cantitatea pentru ${product.name}" ${item.quantity===1?'disabled':''}>−</button><output aria-label="Cantitate">${item.quantity}</output><button data-cart-change="${index}" data-delta="1" aria-label="Crește cantitatea pentru ${product.name}" ${item.quantity===99?'disabled':''}>+</button></div><button class="cart-remove" data-cart-remove="${index}">Elimină</button></div></div></article>`;
  }).join(''));
  const subtotal=getSubtotal(cart.items,catalog);
  $('#cart-subtotal').textContent=subtotal==null?'Disponibil la lansare':formatMoney(subtotal);
  $('#export-selection').disabled=cart.items.length===0;
}
cart.subscribe(renderCart);renderCart();
$('#open-cart').addEventListener('click',()=>{renderCart();showDialog($('#cart-dialog'));});
$('#cart-items').addEventListener('click',event=>{
  const change=event.target.closest('[data-cart-change]'),remove=event.target.closest('[data-cart-remove]');
  if(change){
    const index=change.dataset.cartChange,delta=change.dataset.delta;
    cart.change(Number(index),Number(delta));
    $(`[data-cart-change="${index}"][data-delta="${delta}"]`)?.focus();
  }
  if(remove){cart.remove(Number(remove.dataset.cartRemove));$('#cart-items button')?.focus();}
});
$('#export-selection').addEventListener('click',()=>{
  const selection={brand:'LUMIS',date:new Date().toISOString(),status:'Selecție salvată — nu este o comandă',items:cart.items.map(item=>({model:named(catalog.products,item.productId),soclu:named(catalog.bases,item.base),culoare:named(catalog.colors,item.color),inel:named(catalog.rings,item.ring),cantitate:item.quantity})),note:'Fotografiile personale nu sunt incluse. Prețurile, livrarea și plata trebuie confirmate la deschiderea comenzilor.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(selection,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='lumis-selectia-mea.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
