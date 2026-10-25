export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = x => Math.min(1, Math.max(0, x));

export function setupMotion() {
  setupSmoothWheel();
  const story = document.querySelector('#room-story');
  const evening = document.querySelector('.room-evening');
  const light = document.querySelector('.room-on');
  const phase = document.querySelector('#room-phase');
  const caption = document.querySelector('#room-text');
  const timeline = document.querySelector('#room-progress');
  const dot = document.querySelector('#light-dot');
  const progress = document.querySelector('#reading-progress');
  let frame = 0, lit = false, currentPhase = '', lightAnimation;
  const imagesReady = Promise.all([...story.querySelectorAll('img')].map(img => img.decode().catch(() => {})));
  let ready = false;
  imagesReady.then(() => { ready = true; schedule(); });
  function update() {
    frame = 0;
    const rect = story.getBoundingClientRect();
    const p = clamp(-rect.top / Math.max(1, story.offsetHeight - innerHeight));
    evening.style.opacity = reducedMotion.matches ? (p >= .45 ? 1 : 0) : clamp(p / .45);
    timeline.style.transform = `scaleX(${p})`;
    // The switch is time-based; the day-to-evening dissolve alone follows scroll.
    let shouldLight = lit;
    if (ready && p >= .55) shouldLight = true;
    if (p < .50) shouldLight = false;
    if (shouldLight !== lit) {
      lit = shouldLight;
      lightAnimation?.cancel();
      if (reducedMotion.matches) light.style.opacity = lit ? '1' : '0';
      else {
        lightAnimation = light.animate(lit ? [{opacity:0,offset:0},{opacity:.85,offset:120/520},{opacity:1,offset:1}] : [{opacity:1},{opacity:0}], {duration:lit ? 520 : 160,easing:'ease-out',fill:'forwards'});
      }
      dot.classList.toggle('on', lit);
    }
    const nextPhase = lit ? 'on' : p > .35 ? 'evening' : 'day';
    if (nextPhase !== currentPhase) {
      currentPhase = nextPhase;
      phase.textContent = nextPhase === 'day' ? 'Ziua' : 'Seara';
      caption.innerHTML = nextPhase === 'on' ? 'Aprinsă, luminează<br>camera.' : nextPhase === 'evening' ? 'Liniștea dinaintea<br>luminii.' : 'Un obiect de design,<br>chiar și stinsă.';
    }
    progress.style.transform = `scaleX(${clamp(scrollY / Math.max(1, document.documentElement.scrollHeight-innerHeight))})`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reducedMotion.addEventListener('change', () => { lightAnimation?.cancel(); light.style.opacity = lit ? '1':'0'; schedule(); });
  schedule();

  if (!reducedMotion.matches) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:.08});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  return setupTour();
}

// A short inertial finish for mouse wheels; touch, keyboard and browser zoom stay native.
function setupSmoothWheel(){
  let target=scrollY,position=scrollY,frame=0,last=0;
  function cancel(){cancelAnimationFrame(frame);frame=0;target=scrollY;}
  function step(now){
    const dt=Math.min(40,now-last||16.7);last=now;
    if(Math.abs(scrollY-position)>2){cancel();return;}
    const delta=target-position;
    if(Math.abs(delta)<.6){window.scrollTo({top:target,behavior:'instant'});frame=0;return;}
    position+=delta*(1-Math.exp(-dt/85));
    window.scrollTo({top:position,behavior:'instant'});
    frame=requestAnimationFrame(step);
  }
  addEventListener('wheel',event=>{
    if(reducedMotion.matches||event.ctrlKey||event.metaKey||event.shiftKey||event.defaultPrevented||Math.abs(event.deltaX)>Math.abs(event.deltaY)||document.querySelector('dialog[open]'))return;
    const node=event.target.closest('textarea,input,select,[contenteditable],dialog');if(node)return;
    // High precision trackpads already provide native momentum. Do not add a second inertia.
    if(event.deltaMode===0&&Math.abs(event.deltaY)<45)return;
    event.preventDefault();
    if(!frame){target=scrollY;position=scrollY;}
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,target+delta));
    if(!frame){last=performance.now();frame=requestAnimationFrame(step);}
  },{passive:false});
  for(const name of ['pointerdown','touchstart','keydown'])addEventListener(name,cancel,{passive:true});
  document.querySelectorAll('dialog').forEach(dialog=>new MutationObserver(()=>{if(dialog.open)cancel();}).observe(dialog,{attributes:true,attributeFilter:['open']}));
  reducedMotion.addEventListener('change',cancel);
}

function setupTour() {
  const start = document.querySelector('#tour-start');
  const control = document.querySelector('#tour-control');
  let active = false, frame, previous = 0;
  function stop() { active = false; cancelAnimationFrame(frame); control.hidden = true; document.body.classList.remove('touring'); start.setAttribute('aria-pressed','false'); }
  function step(now) {
    if (!active) return;
    const elapsed = Math.min(50, now - previous); previous = now;
    const end = document.documentElement.scrollHeight - innerHeight;
    const top = document.querySelector('#room-story').getBoundingClientRect().top;
    const speed = top <= 0 && top > -innerHeight * 1.4 ? 52 : 105;
    window.scrollTo({top:Math.min(end, scrollY + elapsed * speed / 1000),behavior:'instant'});
    if (scrollY >= end - 2) return stop();
    frame = requestAnimationFrame(step);
  }
  start.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    if (active) return stop();
    active = true; control.hidden = false; document.body.classList.add('touring'); start.setAttribute('aria-pressed','true'); previous = performance.now(); frame = requestAnimationFrame(step);
  });
  document.querySelector('#tour-stop').addEventListener('click', stop);
  for (const event of ['wheel','touchstart','pointerdown']) addEventListener(event, e => {
    if (active && !e.target.closest('#tour-start')) stop();
  }, {passive:true});
  addEventListener('keydown', e => { if (active && ['Escape',' ','ArrowDown','ArrowUp','PageDown','PageUp','Home','End','Tab'].includes(e.key)) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', stop);
  return {stop};
}

export function animateToCart(button, cartButton) {
  if (reducedMotion.matches) return;
  const from = button.getBoundingClientRect(), to = cartButton.getBoundingClientRect();
  const dot = document.createElement('i'); dot.className = 'fly'; document.body.append(dot);
  const x = from.left+from.width/2, y = from.top+from.height/2, dx = to.left+to.width/2-x, dy = to.top+to.height/2-y;
  dot.style.left = `${x}px`; dot.style.top = `${y}px`;
  const animation = dot.animate([{transform:'translate(-10px,-10px) scale(1)',opacity:1},{transform:`translate(${dx*.45-10}px,${Math.min(-80,dy*.7)-10}px) scale(1.1)`,offset:.5},{transform:`translate(${dx-10}px,${dy-10}px) scale(.25)`,opacity:0}], {duration:780,easing:'cubic-bezier(.3,.1,.4,1)'});
  animation.finished.then(() => {
    dot.remove(); cartButton.animate([{transform:'scale(1)'},{transform:'scale(1.12,.9)'},{transform:'scale(.96,1.05)'},{transform:'scale(1)'}],{duration:500,easing:'ease-out'});
  }).catch(() => dot.remove());
}
