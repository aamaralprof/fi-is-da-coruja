/* Presença global da Coruja de Hefesto.
 * Depende apenas do Percurso: não cria outro inventário nem outra persistência. */
(function(){
'use strict';
if(window.CorujaMascote)return;

const NAME_KEY='sofia-student-owl-name';
const LIFE_KEY='sofia-student-owl-life';
const QUIET_KEY='coruja-hefesto-silenciosa-ate';
const LAST_KEY='coruja-hefesto-ultima-aparicao';
const colors=['violeta','azul','turquesa','verde','ambar','rubi'];
const code=window.Percurso?.codigo?.()||'';
const POSITION_KEY='coruja-hefesto-posicao:'+(code||'visitante');
const special=code==='CORUJA-62XA';
const color=special?'azul':colors[Array.from(code).reduce((sum,char)=>((sum*31)+char.codePointAt(0))>>>0,0)%colors.length];
const name=(localStorage.getItem(NAME_KEY)||'').trim();
let life={};
try{life=JSON.parse(localStorage.getItem(LIFE_KEY)||'{}')||{};}catch{}
let exploration=life.mode==='exploring'&&life.exploration?.status==='away'?life.exploration:null;
const bond=Math.max(0,Number(life.bond)||0);
const bondStage=bond>=18?'companheirismo':bond>=9?'confiança':bond>=3?'reconhecimento':'desconfiança';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let root,figure,bubble,text,timer,hideTimer,idleTimer,owl,behavior,shown=false,readingShown=false;

const page=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'')+'.html';
const pageLines={
 'post-choveu-no-meu-caderno.html':'Há alguma coisa diferente no som desta chuva.',
 'post-o-liquidificador-cosmico.html':'Esses ingredientes não parecem ter sido escolhidos ao acaso.',
 'post-mare-dos-sussurros.html':'Ela observa as rotas como se escutasse alguma coisa entre elas.',
 'post-algumas-respostas-so-existem-a-noite.html':'Hoje ela chegou em silêncio e ficou perto.',
 'post-21-17.html':'As engrenagens dela acompanham cada escolha com atenção.',
 'index.html':'Ela veio conferir o que mudou desde a última visita.'
};
const defaultLine=page.startsWith('post-')?'Ela pousou perto do texto e parece estar procurando uma pista.':'Ela apareceu para acompanhar sua investigação.';
const stylesheet=`
.owl-companion{--owl-glow:#b77ada;position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:1200;display:grid;justify-items:end;gap:7px;max-width:min(330px,calc(100vw - 28px));font-family:Georgia,serif;color:#24172b;pointer-events:none}
.owl-companion[hidden]{display:none}.owl-companion__bubble{position:relative;width:min(300px,calc(100vw - 42px));padding:13px 42px 13px 15px;border:1px solid #886997;border-radius:14px 14px 4px 14px;background:#fffdf8;box-shadow:0 10px 32px #180d2070;pointer-events:auto}.owl-companion__bubble[hidden]{display:none}.owl-companion__bubble p{margin:0 0 9px;line-height:1.38;font-size:.94rem}.owl-companion__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.owl-companion .owl-companion__action,.owl-companion .owl-companion__bubble a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:7px 10px;border:1px solid #765486;border-radius:9px;background:#f3e8f7;color:#4c2b62;font:700 .88rem/1.15 Georgia,serif;text-decoration:none;cursor:pointer}.owl-companion .owl-companion__quiet{min-height:44px;padding:5px;border:0;background:transparent;color:#593276;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.owl-companion .owl-companion__close{position:absolute;right:4px;top:4px;width:38px;height:38px;border:0;border-radius:50%;background:transparent;color:#51365e;font:700 22px/1 Arial;cursor:pointer}.owl-companion .owl-companion__figure{width:96px;height:96px;padding:0;border:0;border-radius:0;background:transparent;appearance:none;-webkit-appearance:none;filter:drop-shadow(0 8px 8px #160b2166) drop-shadow(0 0 9px var(--owl-glow));cursor:grab;touch-action:none;pointer-events:auto;transform-origin:50% 90%;animation:owl-arrives .7s ease-out,owl-breathes 3.8s .7s ease-in-out infinite}.owl-companion__figure:active{cursor:grabbing}.owl-companion__figure>img{display:block;width:100%;height:100%;object-fit:contain}.owl-companion[data-color=azul] img:not([data-special]){filter:hue-rotate(38deg) saturate(1.2)}.owl-companion[data-color=turquesa] img{filter:hue-rotate(72deg) saturate(1.3)}.owl-companion[data-color=verde] img{filter:hue-rotate(112deg) saturate(1.2)}.owl-companion[data-color=ambar] img{filter:hue-rotate(-112deg) saturate(1.12) brightness(1.06)}.owl-companion[data-color=rubi] img{filter:hue-rotate(-68deg) saturate(1.3)}.owl-companion[data-state=exploring] .owl-companion__figure{animation:owl-arrives .7s ease-out,owl-explores 4.8s .7s ease-in-out infinite}.owl-companion[data-state=narrative-event] .owl-companion__figure{animation:owl-celebrates .8s ease-out,owl-breathes 3.8s .8s ease-in-out infinite}.owl-companion[data-state=sleeping] .owl-companion__figure{filter:brightness(.76) saturate(.72) drop-shadow(0 8px 8px #160b2166);animation:owl-sleeps 4.8s ease-in-out infinite}.owl-companion[data-bond=companheirismo] .owl-companion__figure{--owl-glow:#d498ff;width:106px;height:106px}.owl-companion button:focus-visible,.owl-companion a:focus-visible{outline:3px solid #673895;outline-offset:3px}@keyframes owl-arrives{from{opacity:0;transform:translate(45px,18px) scale(.72)}to{opacity:1;transform:none}}@keyframes owl-breathes{50%{transform:translateY(-4px) rotate(1.5deg)}}@keyframes owl-sleeps{50%{transform:translateY(3px) rotate(-2deg) scale(.97)}}@keyframes owl-explores{0%,100%{transform:translateX(0) rotate(0)}45%{transform:translateX(-12px) translateY(-5px) rotate(-4deg)}70%{transform:translateX(-5px) rotate(3deg)}}@keyframes owl-celebrates{35%{transform:translateY(-13px) rotate(-7deg) scale(1.08)}68%{transform:translateY(-4px) rotate(7deg)}}@media(max-width:520px){.owl-companion .owl-companion__figure{width:82px;height:82px}.owl-companion[data-bond=companheirismo] .owl-companion__figure{width:90px;height:90px}}@media(prefers-reduced-motion:reduce){.owl-companion .owl-companion__figure,.owl-companion[data-state] .owl-companion__figure{animation:owl-fade .18s linear}@keyframes owl-fade{from{opacity:0}to{opacity:1}}}`;

function build(){
 const style=document.createElement('style');style.dataset.owlCompanionStyle='';style.textContent=stylesheet+`.owl-companion__figure .hefesto-owl{width:112%;margin:-6%}.owl-companion__figure .hefesto-owl img{filter:none!important}`;document.head.append(style);
 root=document.createElement('aside');root.className='owl-companion';root.hidden=true;root.dataset.color=color;root.dataset.bond=bondStage;root.setAttribute('aria-label',`Visita de ${name}`);
 bubble=document.createElement('div');bubble.className='owl-companion__bubble';bubble.hidden=true;bubble.setAttribute('role','status');bubble.setAttribute('aria-live','polite');
 text=document.createElement('p');
 const actions=document.createElement('div');actions.className='owl-companion__actions';
 const link=document.createElement('a');link.href='sala-investigacao.html';link.textContent='Visitar a toca';
 const affection=document.createElement('button');affection.type='button';affection.className='owl-companion__action';affection.textContent='Carinho';
 affection.addEventListener('click',event=>{event.stopPropagation();behavior?.wake('happy');window.CorujaSom?.play('happy',{special});const now=Date.now();if(now-Number(life.lastGreeting||0)>=20*3600000){life.lastGreeting=now;life.bond=Math.max(0,Number(life.bond)||0)+1;}life.updatedAt=now;localStorage.setItem(LIFE_KEY,JSON.stringify(life));text.textContent=`${name} fechou os olhos e recebeu o carinho.`;root.dataset.state='narrative-event';bubble.hidden=false;});
 const sleep=document.createElement('button');sleep.type='button';sleep.className='owl-companion__action';sleep.textContent='Dormir';
 sleep.addEventListener('click',event=>{event.stopPropagation();life.mode='resting';life.updatedAt=Date.now();life.bond=Math.max(0,Number(life.bond)||0)+1;localStorage.setItem(LIFE_KEY,JSON.stringify(life));root.dataset.state='sleeping';behavior?.wake('sleep');window.CorujaSom?.play('rest',{special});text.textContent=`${name} se acomodou e adormeceu.`;bubble.hidden=false;});
 const quiet=document.createElement('button');quiet.type='button';quiet.className='owl-companion__quiet';quiet.textContent='Descansar por hoje';quiet.addEventListener('click',()=>window.CorujaMascote.quietToday());
 actions.replaceChildren(link,affection,sleep,quiet);
 const close=document.createElement('button');close.type='button';close.className='owl-companion__close';close.setAttribute('aria-label','Fechar a mensagem da coruja');close.textContent='×';close.addEventListener('click',event=>{event.stopPropagation();bubble.hidden=true;figure.focus();});
 bubble.append(text,actions,close);
 figure=document.createElement('button');figure.type='button';figure.className='owl-companion__figure';figure.setAttribute('aria-expanded','false');figure.setAttribute('aria-label',`${name}, a Coruja de Hefesto. Toque para abrir os comandos; arraste ou use as setas para mover.`);
 owl=window.CorujaVisual.create({color,special});figure.append(owl);behavior=window.CorujaVisual.bind(owl,figure,{idleMs:120000,trackSurface:document,onState:state=>{if(state==='back'&&shown){text.textContent=`${name} esperou por atenção e virou de costas.`;bubble.hidden=false}}});
 let drag=null,moved=false;
 const position=(left,top,save=true)=>{const rect=root.getBoundingClientRect(),x=Math.max(8,Math.min(innerWidth-rect.width-8,left)),y=Math.max(8,Math.min(innerHeight-rect.height-8,top));root.style.left=x+'px';root.style.top=y+'px';root.style.right='auto';root.style.bottom='auto';if(save)localStorage.setItem(POSITION_KEY,JSON.stringify({x,y}));};
 try{const saved=JSON.parse(localStorage.getItem(POSITION_KEY)||'null');if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))requestAnimationFrame(()=>position(saved.x,saved.y,false));}catch{}
 figure.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;const rect=root.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};moved=false;figure.setPointerCapture(event.pointerId);});
 figure.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<6)return;moved=true;position(drag.left+dx,drag.top+dy,false);});
 const endDrag=event=>{if(!drag||event.pointerId!==drag.id)return;figure.releasePointerCapture?.(drag.id);drag=null;if(moved){const rect=root.getBoundingClientRect();position(rect.left,rect.top,true);setTimeout(()=>{moved=false},0);}};
 figure.addEventListener('pointerup',endDrag);figure.addEventListener('pointercancel',endDrag);
 figure.addEventListener('keydown',event=>{const step={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[event.key];if(!step)return;event.preventDefault();const rect=root.getBoundingClientRect();position(rect.left+step[0],rect.top+step[1]);});
 addEventListener('resize',()=>{if(root&&!root.hidden){const rect=root.getBoundingClientRect();position(rect.left,rect.top,false);}});
 figure.addEventListener('click',()=>{if(moved)return;if(exploration&&exploration.target===page){behavior?.wake('tilt');window.CorujaSom?.play('chirp',{special});completeExploration(true);return;}const reaction=behavior?.click();if(reaction==='anger'){window.CorujaSom?.play('anger',{special});text.textContent=`${name} se irritou com tantos cliques seguidos.`;bubble.hidden=false;figure.setAttribute('aria-expanded','true');return}if(reaction==='sad'){window.CorujaSom?.play('sad',{special});text.textContent=`${name} voltou a olhar, mas sentiu sua falta.`;bubble.hidden=false;figure.setAttribute('aria-expanded','true');return}window.CorujaVisual.motion(owl,special?'blink':'tilt');window.CorujaSom?.play(special?'blink':'chirp',{special});bubble.hidden=!bubble.hidden;figure.setAttribute('aria-expanded',String(!bubble.hidden));if(!bubble.hidden)close.focus();});
 root.append(bubble,figure);document.body.append(root);
}
function hide(){if(!root)return;root.dataset.state='hidden';root.hidden=true;bubble.hidden=true;figure.setAttribute('aria-expanded','false');shown=false;clearTimeout(hideTimer);}
function show(state='visitor',message,force=false){
 if(!root||document.hidden||(!force&&Date.now()<Number(localStorage.getItem(QUIET_KEY)||0))||(exploration&&exploration.target!==page))return false;
 clearTimeout(timer);clearTimeout(hideTimer);shown=true;root.dataset.state=state;root.hidden=false;text.textContent=message||pageLines[page]||defaultLine;bubble.hidden=false;figure.setAttribute('aria-expanded','true');localStorage.setItem(LAST_KEY,String(Date.now()));
 if(!(exploration&&exploration.target===page))hideTimer=setTimeout(hide,state==='narrative-event'?14000:11000);return true;
}
function schedule(){
 if(exploration){if(exploration.target===page)timer=setTimeout(()=>show('narrative-event',`${name} está escondida aqui. Toque nela para encerrar a exploração.`,true),reduceMotion?1200:3000);return;}
 if(shown||Date.now()<Number(localStorage.getItem(QUIET_KEY)||0))return;
 const last=Number(localStorage.getItem(LAST_KEY)||0),minimum=(bondStage==='companheirismo'?18:bondStage==='confiança'?24:30)*60000;
 if(Date.now()-last<minimum)return;
 const delay=reduceMotion?38000:26000+Math.floor(Math.random()*18000);
 timer=setTimeout(()=>show(bond>=9?'exploring':'visitor'),delay);
}
function completeExploration(found){
 if(!exploration)return;
 if(!life.findings?.includes(exploration.finding))life.findings=[...(life.findings||[]),exploration.finding];
 life.mode='idle';life.bond=Math.max(0,Number(life.bond)||0)+(found?2:0);life.updatedAt=Date.now();life.exploration={...exploration,status:'returned'};localStorage.setItem(LIFE_KEY,JSON.stringify(life));exploration=null;
 if(root){clearTimeout(hideTimer);root.dataset.state='narrative-event';root.hidden=false;shown=true;text.textContent=found?`${name} reconheceu você e entregou o achado que carregava.`:`${name} voltou sozinha e deixou um achado na toca.`;bubble.hidden=false;figure.setAttribute('aria-expanded','true');hideTimer=setTimeout(hide,15000);}
}
function discovery(event){
 const isEmblem=event.type==='sofia:emblem-found';
 show('narrative-event',isEmblem?`${name} ergueu as asas. Ela reconheceu o emblema.`:`O núcleo de ${name} se iluminou ao reconhecer a nova pista.`);behavior?.wake('light');window.CorujaSom?.play('charge',{special});
}
function inventoryReaction(event){
 if(!event.target.closest('.mission-launcher,.emblem-inventory-launcher,.journal-launcher,[data-open-not-collection]'))return;
 if(Date.now()-Number(localStorage.getItem(LAST_KEY)||0)<5*60000)return;
 show('exploring',`${name} se aproximou para examinar os objetos com você.`);
}
function resetIdle(){
 clearTimeout(idleTimer);
 if(root?.dataset.state==='sleeping')hide();
 idleTimer=setTimeout(()=>{if(!shown)show('sleeping',`${name} se acomodou por perto e adormeceu.`);},90000);
}
window.CorujaMascote={show,hide,quietToday(){localStorage.setItem(QUIET_KEY,String(Date.now()+20*3600000));hide();}};
build();
if(exploration&&Date.now()>=Number(exploration.returnsAt))completeExploration(false);
schedule();
setTimeout(()=>{if(!readingShown&&!shown){readingShown=true;show('exploring',`${name} permaneceu por perto enquanto você lia.`);}},65000);
window.addEventListener('sofia:clue-found',discovery);
window.addEventListener('sofia:emblem-found',discovery);
document.addEventListener('click',inventoryReaction);
['pointerdown','keydown','scroll'].forEach(type=>window.addEventListener(type,resetIdle,{passive:true}));
resetIdle();
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
})();
