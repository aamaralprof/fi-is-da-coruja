(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const save=(key,value='completed')=>localStorage.setItem(`sofia-${key}`,value);
  const toastEl=$('[data-p5-toast]'); let toastTimer;
  function toast(message){clearTimeout(toastTimer);toastEl.textContent=message;toastEl.hidden=false;toastTimer=setTimeout(()=>toastEl.hidden=true,2800)}
  save('post5-opened');

  const roomMessages={
    bed:'QUASE — ausente.',
    books:'Mapas do invisível. O tempo entre nós. Astronomia observacional.',
    notebook:'Eaí aberto. Última atividade: agora.'
  };
  $$('[data-room-hotspot]').forEach(button=>button.addEventListener('click',()=>{
    $('[data-room-status]').textContent=roomMessages[button.dataset.roomHotspot];
    toast(roomMessages[button.dataset.roomHotspot]);
  }));

  const telescope=$('[data-telescope]'), scope=$('[data-scope]'), readout=$('[data-scope-readout]');
  const starCopy={
    orion:['Órion.','Fácil.'],
    sirius:['Sírius.','Mais fácil ainda.'],
    pleiades:['Plêiades.','Téo ajustou o foco.','Havia noites em que ele conseguia ficar muito tempo assim: procurando coisas que sabia que estavam lá.','Talvez fosse justamente essa a graça.']
  };
  function writeScope(title,lines){readout.innerHTML=`<h2>${title}</h2>${lines.map(line=>`<p>${line}</p>`).join('')}`}
  function drawStars(){
    const canvas=$('[data-starfield]'), rect=scope.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.floor(rect.width*dpr));canvas.height=Math.max(1,Math.floor(rect.height*dpr));
    const ctx=canvas.getContext('2d'), w=canvas.width,h=canvas.height,gradient=ctx.createRadialGradient(w*.52,h*.45,0,w*.5,h*.5,w*.7);
    gradient.addColorStop(0,'#13183b');gradient.addColorStop(.55,'#080d25');gradient.addColorStop(1,'#01030a');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    let seed=1717;const random=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
    for(let i=0;i<230;i++){const x=random()*w,y=random()*h,r=(random()**3*1.8+.25)*dpr;ctx.beginPath();ctx.fillStyle=`rgba(${190+random()*65},${205+random()*50},255,${.35+random()*.65})`;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
  }
  $('[data-open-telescope]').addEventListener('click',()=>{save('post5-telescope-opened');telescope.showModal();requestAnimationFrame(drawStars)});
  $('[data-close-telescope]').addEventListener('click',()=>telescope.close());
  telescope.addEventListener('click',e=>{if(e.target===telescope)telescope.close()});
  $$('[data-star]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.star!=='anomaly'){const [title,...lines]=starCopy[button.dataset.star];writeScope(title,lines);button.setAttribute('aria-pressed','true');return}
    if(button.classList.contains('is-gone'))return;
    save('post5-anomaly-found');
    sessionStorage.setItem('post5-anomaly-seen','yes');
    writeScope('Téo parou.',['Ajustou o foco.','Voltou alguns graus.','Nada.','Tentou outra vez.','Por um instante, havia alguma coisa entre as estrelas.','Não uma estrela. Não exatamente.','— Você não estava aí ontem.','','Téo afastou o rosto da ocular. Voltou ao notebook. Não contou a ninguém.']);
    button.classList.add('is-gone');toast('O ponto desapareceu.');
  }));
  if(sessionStorage.getItem('post5-anomaly-seen'))$('[data-star="anomaly"]').classList.add('is-gone');
  addEventListener('resize',()=>{if(telescope.open)drawStars()});

  const revealImage=$('.return-section .story-image');
  if('IntersectionObserver'in window){new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){save('post5-quase-revealed');entry.target.dataset.seen='true'}}),{threshold:.35}).observe(revealImage)}

  const game={running:false,paused:false,inverse:false,score:0,lives:3,x:8,y:79,vx:76,vy:20,keys:new Set(),last:0,raf:0,waypoint:0,trailClock:0,inverseLeft:0,boostLeft:0,catGrace:0};
  const gameEl=$('[data-game]'), world=$('[data-game-world]'), quase=$('[data-quase]'), virgula=$('[data-virgula]');
  const modeEl=$('[data-game-mode]'), scoreEl=$('[data-score]'), livesEl=$('[data-lives]'), alertEl=$('[data-game-alert]');
  const objectiveEl=$('[data-game-objective]'), timerEl=$('[data-danger-timer] span'), trailEl=$('[data-trail]');
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const roads=[
    {x1:3,x2:91,y1:74,y2:87},{x1:18,x2:89,y1:58,y2:68},{x1:10,x2:79,y1:44,y2:53},{x1:22,x2:92,y1:31,y2:40},{x1:52,x2:92,y1:16,y2:25},
    {x1:4,x2:13,y1:65,y2:88},{x1:21,x2:30,y1:34,y2:82},{x1:36,x2:45,y1:45,y2:82},{x1:54,x2:63,y1:18,y2:82},{x1:69,x2:78,y1:18,y2:69},{x1:84,x2:93,y1:17,y2:68}
  ];
  const route=[[76,20],[73,35],[58,35],[58,62],[40,62],[40,48],[25,48],[25,78],[8,79],[25,78],[40,78],[58,78],[58,62],[73,62],[73,35],[88,35],[88,20]];
  function onRoad(x,y){return roads.some(r=>x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2)}
  function renderActors(){quase.style.left=`${game.x}%`;quase.style.top=`${game.y}%`;virgula.style.left=`${game.vx}%`;virgula.style.top=`${game.vy}%`;world.classList.toggle('is-danger',game.inverse)}
  let flashTimer=0;
  function flash(message,duration=900){
    clearTimeout(flashTimer);alertEl.textContent=message;alertEl.classList.add('is-visible');
    flashTimer=setTimeout(()=>{alertEl.classList.remove('is-visible');alertEl.textContent=''},duration)
  }
  function intersects(a,b){const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return ar.left<br.right&&ar.right>br.left&&ar.top<br.bottom&&ar.bottom>br.top}
  function addFootprint(){
    const foot=document.createElement('i');foot.className='trail-foot';foot.style.left=`${game.vx+1}%`;foot.style.top=`${game.vy+2}%`;foot.style.transform=`rotate(${(game.waypoint%4)*45-25}deg)`;trailEl.append(foot);setTimeout(()=>foot.remove(),5200)
  }
  function setObjective(text){objectiveEl.textContent=text}
  function collect(){
    $$('.collectible:not(.is-collected)',world).forEach(item=>{
      if(!intersects(quase,item))return;item.classList.add('is-collected');
      if(item.classList.contains('treat')){game.score++;scoreEl.textContent=game.score;toast(`Petisco encontrado · ${game.score}/4`);setObjective(game.score<4?'Continue seguindo as pegadas. Vírgula ainda está longe.':'Agora alcance Vírgula antes que ele faça outra curva.');if(game.score===4)flash('ALCANCE VÍRGULA.',1000)}
      if(item.classList.contains('yarn'))activateInverse();
      if(item.classList.contains('hourglass')){game.boostLeft=6;world.classList.add('trail-revealed');toast('Ampulheta: pegadas reveladas e Quase mais rápido por alguns segundos.')}
    });
  }
  function activateInverse(){
    if(game.inverse)return;game.inverse=true;game.inverseLeft=6;game.catGrace=.8;modeEl.textContent='VÍRGULA persegue';setObjective('Fuja de Vírgula até o tempo acabar.');flash('CORRA.',1100)
  }
  function endInverse(){game.inverse=false;game.inverseLeft=0;modeEl.textContent='QUASE persegue';timerEl.style.width='0%';setObjective(game.score<4?'Siga as pegadas e recolha os petiscos.':'Alcance Vírgula.');flash('DE NOVO.',700)}
  function loseLife(){
    if(game.catGrace>0)return;game.lives--;livesEl.textContent=game.lives;game.catGrace=1.4;game.x=8;game.y=79;flash(game.lives?'QUASE ESCAPOU.':'MAIS UMA TENTATIVA.',900);
    if(game.lives<=0){game.lives=3;livesEl.textContent=game.lives;endInverse();toast('Quase voltou ao ponto de partida. Vírgula espera na próxima esquina.')}
  }
  function movePlayer(dx,dy,distance){
    const len=Math.hypot(dx,dy)||1,nx=clamp(game.x+dx/len*distance,2,91),ny=clamp(game.y+dy/len*distance,17,88);
    if(onRoad(nx,ny)){game.x=nx;game.y=ny;return}
    if(onRoad(nx,game.y))game.x=nx;else if(onRoad(game.x,ny))game.y=ny;else world.classList.add('hit-wall');
    setTimeout(()=>world.classList.remove('hit-wall'),120)
  }
  function moveCat(dt){
    if(game.inverse){const dx=game.x-game.vx,dy=game.y-game.vy,len=Math.hypot(dx,dy)||1,speed=10*dt;const nx=game.vx+dx/len*speed,ny=game.vy+dy/len*speed;if(onRoad(nx,ny)){game.vx=nx;game.vy=ny}else if(onRoad(nx,game.vy))game.vx=nx;else if(onRoad(game.vx,ny))game.vy=ny;return}
    const target=route[game.waypoint],dx=target[0]-game.vx,dy=target[1]-game.vy,len=Math.hypot(dx,dy)||1,speed=(game.score===4?5.2:6.6)*dt;
    if(len<1.2){game.waypoint=(game.waypoint+1)%route.length;return}game.vx+=dx/len*speed;game.vy+=dy/len*speed
  }
  function actorsAreClose(){
    const worldRect=world.getBoundingClientRect(),qr=quase.getBoundingClientRect(),vr=virgula.getBoundingClientRect();
    const qx=(qr.left+qr.width/2-worldRect.left)/worldRect.width*100,qy=(qr.top+qr.height/2-worldRect.top)/worldRect.height*100;
    const vx=(vr.left+vr.width/2-worldRect.left)/worldRect.width*100,vy=(vr.top+vr.height/2-worldRect.top)/worldRect.height*100;
    return Math.hypot(qx-vx,(qy-vy)*1.5)<=7.5
  }
  function resolveMeeting(){
    if(game.catGrace>0||(!intersects(quase,virgula)&&!actorsAreClose()))return;
    if(game.inverse){loseLife();return}
    if(game.score>=4){finishGame();return}
    game.waypoint=(game.waypoint+3)%route.length;const escape=route[game.waypoint];game.vx=escape[0];game.vy=escape[1];game.catGrace=1.1;renderActors();flash('QUASE.',450);toast('Vírgula escapou. Os petiscos ajudam Quase a manter o rastro.')
  }
  function loop(time){
    if(!game.running)return;const dt=Math.min((time-game.last)/1000||0,.04);game.last=time;
    if(!game.paused){
      game.catGrace=Math.max(0,game.catGrace-dt);game.boostLeft=Math.max(0,game.boostLeft-dt);if(!game.boostLeft)world.classList.remove('trail-revealed');
      let dx=0,dy=0;if(game.keys.has('left'))dx--;if(game.keys.has('right'))dx++;if(game.keys.has('up'))dy--;if(game.keys.has('down'))dy++;if(dx||dy)movePlayer(dx,dy,(game.boostLeft?31:23)*dt);
      moveCat(dt);game.trailClock-=dt;if(game.trailClock<=0){addFootprint();game.trailClock=.38}
      if(game.inverse){game.inverseLeft-=dt;timerEl.style.width=`${Math.max(0,game.inverseLeft/6*100)}%`;if(game.inverseLeft<=0)endInverse()}
      renderActors();collect();resolveMeeting()
    }game.raf=requestAnimationFrame(loop)
  }
  function resetGame(){
    Object.assign(game,{score:0,lives:3,x:8,y:79,vx:76,vy:20,waypoint:0,inverse:false,inverseLeft:0,boostLeft:0,catGrace:1});scoreEl.textContent='0';livesEl.textContent='3';modeEl.textContent='QUASE persegue';timerEl.style.width='0%';trailEl.replaceChildren();$$('.collectible',world).forEach(item=>item.classList.remove('is-collected'));setObjective('Siga as pegadas de Vírgula e recolha os petiscos.')
  }
  function startGame(){
    $('[data-game-intro]').hidden=true;gameEl.hidden=false;resetGame();save('post5-minigame-started');game.running=true;game.paused=false;game.last=performance.now();renderActors();world.focus();flash('SIGA O RASTRO.',1000);game.raf=requestAnimationFrame(loop)
  }
  function finishGame(){
    if(!game.running)return;game.running=false;cancelAnimationFrame(game.raf);clearTimeout(flashTimer);alertEl.classList.remove('is-visible');alertEl.textContent='';gameEl.hidden=true;$('[data-game-finish]').hidden=false;save('post5-minigame-completed');
    localStorage.setItem('sofia-mission-registro-sisifo','found');
    dispatchEvent(new CustomEvent('sofia:mission-found',{detail:{key:'sofia-mission-registro-sisifo'}}));
    toast('Recompensa adicionada ao Inventário da Missão.')
  }
  $('[data-start-game]').addEventListener('click',startGame);
  $('[data-pause-game]').addEventListener('click',e=>{game.paused=!game.paused;e.currentTarget.setAttribute('aria-pressed',String(game.paused));e.currentTarget.textContent=game.paused?'Continuar':'Pausar';setObjective(game.paused?'Perseguição pausada.':game.inverse?'Fuja de Vírgula até o tempo acabar.':'Siga as pegadas de Vírgula.')});
  $('[data-return-story]').addEventListener('click',()=>{$('[data-ending]').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  const directions={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
  addEventListener('keydown',e=>{if(!game.running||!directions[e.key])return;e.preventDefault();game.keys.add(directions[e.key])});
  addEventListener('keyup',e=>{if(directions[e.key])game.keys.delete(directions[e.key])});
  $$('[data-dir]').forEach(button=>{
    const start=e=>{e.preventDefault();game.keys.add(button.dataset.dir)},end=()=>game.keys.delete(button.dataset.dir);
    button.addEventListener('pointerdown',start);button.addEventListener('pointerup',end);button.addEventListener('pointercancel',end);button.addEventListener('pointerleave',end);
    button.addEventListener('click',()=>{const dir=button.dataset.dir;movePlayer(dir==='left'?-1:dir==='right'?1:0,dir==='up'?-1:dir==='down'?1:0,3);renderActors();collect()})
  });
  let swipeStart=null;
  world.addEventListener('pointerdown',e=>swipeStart={x:e.clientX,y:e.clientY});
  world.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.hypot(dx,dy)<18)return;const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');game.keys.add(dir);setTimeout(()=>game.keys.delete(dir),420)});

  const ending=$('[data-ending]');
  if('IntersectionObserver'in window){new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)save('post5-completed')}),{threshold:.7}).observe(ending)}
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.running){game.paused=true;const b=$('[data-pause-game]');b.setAttribute('aria-pressed','true');b.textContent='Continuar'}});
})();
