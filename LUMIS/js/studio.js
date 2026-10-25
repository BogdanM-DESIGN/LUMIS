import * as THREE from './vendor/three.module.js';

// Parametric visual models, not manufacturing CAD or measured photometry.
export function createStudio(canvas) {
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33,1,.1,40);
  camera.position.set(3.4,2.5,5.6); camera.lookAt(0,1.2,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8a7560,2.5));
  const key = new THREE.DirectionalLight(0xfff4e4,4.4);
  key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.normalBias=.025;key.shadow.camera.left=-3;key.shadow.camera.right=3;key.shadow.camera.top=5;key.shadow.camera.bottom=-3;scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(4,3,-3);scene.add(fill);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x5b422a,opacity:.18}));
  ground.rotation.x=-Math.PI/2;ground.position.y=.012;ground.receiveShadow=true;scene.add(ground);
  // A small contact shadow anchors the object even on low-end shadow renderers.
  const contactCanvas = document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;
  const ctx=contactCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,8,64,64,64);
  gradient.addColorStop(0,'rgba(55,35,15,.25)');gradient.addColorStop(1,'rgba(55,35,15,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(contactCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.015;scene.add(contact);
  const lamp = new THREE.Group(); scene.add(lamp); lamp.rotation.y = -.35;
  let shade,base,ring,photoTexture,configuration,lit=true,queued=false,active=true;
  let shadeMaterial,baseMaterial,ringMaterial,trimMaterial;
  const glow = new THREE.PointLight(0xffb963,0,5,2);glow.position.set(0,1.1,0);scene.add(glow);

  function lathe(points,material) { const mesh = new THREE.Mesh(new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),128),material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh; }
  function buildBase(id) {
    const profiles={galet:[[0,0],[.48,0],[.58,.025],[.645,.09],[.66,.18],[.64,.29],[.59,.36],[.54,.38],[0,.38]],monolit:[[0,0],[.63,0],[.65,.03],[.65,.28],[.63,.35],[.59,.38],[0,.38]],con:[[0,0],[.69,0],[.71,.025],[.59,.35],[.56,.38],[0,.38]]};
    return lathe(profiles[id],baseMaterial);
  }
  function buildShade(id) {
    const around=288,levels=100,positions=[],uv=[],indices=[];
    for(let y=0;y<=levels;y++){
      const t=y/levels;
      for(let j=0;j<=around;j++){
        const angle=j/around*Math.PI*2;
        let radius=.52;
        if(id==='wave') radius=.53+.055*Math.sin(6*(angle-t*.65));
        if(id==='twist') { const wave=24*(angle-t*Math.PI);radius=.535+.037*(1-2*Math.abs(Math.atan2(Math.sin(wave),Math.cos(wave))/Math.PI)); }
        if(id==='ribbed') radius=.49+.055*Math.sin(t*Math.PI*1.35-.4)+.016*Math.cos(36*angle);
        positions.push(Math.cos(angle)*radius,.43+t*1.67,Math.sin(angle)*radius);
        uv.push(j/around,t);
        if(y<levels && j<around){const a=y*(around+1)+j,b=a+around+1;indices.push(a,b,a+1,b,b+1,a+1);}
      }
    }
    const geometry = new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry,shadeMaterial);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
  }
  function releaseObject(object){if(!object)return;lamp.remove(object);object.geometry.dispose();}
  function update(config) {
    configuration=config;
    releaseObject(base);releaseObject(shade);releaseObject(ring);
    for(const child of [...lamp.children]) {lamp.remove(child);child.geometry.dispose();}
    for(const material of [shadeMaterial,baseMaterial,ringMaterial,trimMaterial]) material?.dispose();
    baseMaterial=new THREE.MeshStandardMaterial({color:config.hex,roughness:.75,metalness:config.color==='champagne'?.12:.025});
    shadeMaterial=new THREE.MeshPhysicalMaterial({color:0xf3eee2,roughness:.55,metalness:0,side:THREE.DoubleSide,emissive:0xffcc89,emissiveIntensity:lit?.5:0,clearcoat:.06});
    ringMaterial=new THREE.MeshStandardMaterial({color:config.ring==='lumina'?0xf7f1dd:0xbda16e,metalness:config.ring==='lumina'?.05:.72,roughness:.3,emissive:0xffd9a2,emissiveIntensity:config.ring==='lumina'&&lit?1.3:0});
    trimMaterial=new THREE.MeshStandardMaterial({color:0xeee6d3,roughness:.65});
    base=buildBase(config.base);shade=buildShade(config.productId);ring=lathe([[.51,.385],[.57,.385],[.57,.425],[.51,.425]],ringMaterial);
    lamp.add(base,shade,ring);
    const rim=lathe([[.50,2.087],[.525,2.087],[.525,2.11],[.50,2.11]],config.productId==='litofanie'&&config.ring==='champagne'?ringMaterial:trimMaterial);lamp.add(rim);
    applyPhoto();setLit(lit);requestRender();
    canvas.dataset.model=config.productId;canvas.dataset.base=config.base;canvas.dataset.color=config.color;canvas.dataset.ring=config.ring;
  }
  function applyPhoto(){if(!shadeMaterial)return;const texture=configuration?.productId==='litofanie'?photoTexture:null;shadeMaterial.map=lit?texture:null;shadeMaterial.emissiveMap=texture;shadeMaterial.bumpMap=texture;shadeMaterial.bumpScale=.007;shadeMaterial.needsUpdate=true;}
  function setPhoto(source){photoTexture?.dispose();photoTexture=source?new THREE.CanvasTexture(source):null;if(photoTexture){photoTexture.colorSpace=THREE.SRGBColorSpace;photoTexture.wrapS=THREE.RepeatWrapping;}applyPhoto();requestRender();}
  function setLit(value){lit=value;if(shadeMaterial)shadeMaterial.emissiveIntensity=lit?.5:0;if(ringMaterial)ringMaterial.emissiveIntensity=lit&&configuration?.ring==='lumina'?1.3:0;glow.intensity=lit?1.6:0;applyPhoto();requestRender();canvas.dataset.lit=String(lit);}
  function render(){queued=false;if(!active)return;renderer.render(scene,camera);}
  function requestRender(){if(!queued&&active){queued=true;requestAnimationFrame(render);}}
  function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();requestRender();}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  let drag;
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,rotation:lamp.rotation.y,id:event.pointerId};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;if(Math.abs(event.clientX-drag.x)>Math.abs(event.clientY-drag.y)) {lamp.rotation.y=drag.rotation+(event.clientX-drag.x)*.012;requestRender();}});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{drag=null;});
  canvas.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();lamp.rotation.y+=event.key==='ArrowLeft'?-.16:.16;requestRender();}});
  return {update,setPhoto,setLit,resize,pause(){active=false;},resume(){active=true;resize();requestRender();},get configuration(){return configuration;}};
}
