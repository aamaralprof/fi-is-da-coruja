/* Render visual articulado das corujas dos alunos.
 * Sem estado próprio: cor, identidade e comportamento continuam nos sistemas existentes. */
(function(){
'use strict';
if(window.CorujaVisual)return;

const ROOT='assets/sala/corujas-alunos';
const style=document.createElement('style');
style.dataset.corujaVisual='';
style.textContent=`
.hefesto-owl{position:relative;display:block;width:100%;aspect-ratio:1;overflow:visible;isolation:isolate;pointer-events:none;--head-tilt:-4deg;--owl-light:#bd72ff}
.hefesto-owl::before{content:'';position:absolute;z-index:6;inset:-3%;border-radius:42%;pointer-events:none;background:radial-gradient(circle at 50% 40%,rgba(255,44,36,.62),rgba(188,0,0,.22) 44%,transparent 72%);mix-blend-mode:screen;opacity:0}
.hefesto-owl[data-variant=azul]{--owl-light:#27a9ff}.hefesto-owl[data-variant=turquesa]{--owl-light:#20e8df}.hefesto-owl[data-variant=verde]{--owl-light:#3beba0}.hefesto-owl[data-variant=ambar]{--owl-light:#ff9d22}.hefesto-owl[data-variant=rubi]{--owl-light:#ff315f}.hefesto-owl[data-variant=oculos]{--owl-light:#ffb12e}
.hefesto-owl::after{content:'';position:absolute;z-index:4;inset:0;pointer-events:none;background:radial-gradient(circle at 36% 34%,var(--owl-light) 0 1.5%,transparent 7%),radial-gradient(circle at 64% 34%,var(--owl-light) 0 1.5%,transparent 7%),radial-gradient(circle at 50% 64%,var(--owl-light) 0 1.2%,transparent 6%),radial-gradient(circle at 50% 14%,var(--owl-light) 0 1%,transparent 5%);mix-blend-mode:screen;filter:blur(1.5px) saturate(1.25);opacity:.28;animation:hefesto-light-idle 4.8s ease-in-out infinite}
.hefesto-owl__body,.hefesto-owl__head,.hefesto-owl__eyes{position:absolute;display:block;height:auto;object-fit:contain;user-select:none;-webkit-user-drag:none}
.hefesto-owl__pose{position:absolute;z-index:5;display:block;opacity:0;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none;transform-origin:50% 72%}
.hefesto-owl__pose--profile{left:10%;top:-13%;width:80%;height:126%}
.hefesto-owl__pose--back{left:3%;top:-4%;width:94%;height:108%}
.hefesto-owl__pose--sleep{left:4%;top:1%;width:92%;height:98%}
.hefesto-owl__body{z-index:1;left:12%;bottom:-5%;width:76%;transform-origin:50% 45%}
.hefesto-owl__head-wrap{position:absolute;z-index:2;left:3%;top:-6%;width:94%;aspect-ratio:1;transform-origin:50% 72%;animation:hefesto-head-curiosity 7.8s ease-in-out infinite}
.hefesto-owl__head{inset:0;width:100%}
.hefesto-owl__head--back{opacity:0}
.hefesto-owl__anger-plate{position:absolute;z-index:4;inset:0;width:100%;height:auto;clip-path:polygon(24% 0,76% 0,70% 43%,30% 43%);opacity:0;transform-origin:50% 35%;user-select:none;-webkit-user-drag:none}
.hefesto-owl__steam{position:absolute;z-index:7;inset:0;pointer-events:none}.hefesto-owl__steam i{position:absolute;top:8%;width:10%;height:28%;border-radius:50%;background:radial-gradient(ellipse at 50% 85%,rgba(255,210,200,.9),rgba(180,185,195,.55) 40%,transparent 72%);filter:blur(4px);opacity:0}.hefesto-owl__steam i:nth-child(1){left:25%;transform:rotate(-16deg)}.hefesto-owl__steam i:nth-child(2){left:46%}.hefesto-owl__steam i:nth-child(3){left:67%;transform:rotate(16deg)}
.hefesto-owl__tear{position:absolute;z-index:7;left:67%;top:51.5%;width:3.2%;height:9%;border-radius:58% 42% 62% 38%/68% 54% 46% 32%;background:linear-gradient(180deg,#eefcff,#70cfff 55%,#2b83d8);box-shadow:0 0 7px #8de4ff,0 2px 3px #183a7866;opacity:0;transform:rotate(8deg);pointer-events:none}
.hefesto-owl__gaze{position:absolute;z-index:2;top:45%;width:16%;aspect-ratio:1;overflow:hidden;border-radius:50%;opacity:0;pointer-events:none}
.hefesto-owl__gaze--left{left:26%}.hefesto-owl__gaze--right{left:58%}
.hefesto-owl__gaze-image{position:absolute;top:-281.25%;width:625%;max-width:none;height:auto;transform:translate(var(--gaze-x,0),var(--gaze-y,0));user-select:none;-webkit-user-drag:none}
.hefesto-owl__gaze--left .hefesto-owl__gaze-image{left:-162.5%}.hefesto-owl__gaze--right .hefesto-owl__gaze-image{left:-362.5%}
.hefesto-owl__eyes{z-index:3;left:4%;top:13%;width:92%;opacity:0;animation:hefesto-blink 8.4s steps(1,end) infinite}
/* Ajustes ópticos por personagem: as pranchas têm caixas e proporções próprias. */
.hefesto-owl[data-variant=violeta] .hefesto-owl__head-wrap{top:0}
.hefesto-owl[data-variant=violeta] .hefesto-owl__eyes{left:5%;top:25%;width:90%}
.hefesto-owl[data-variant=ambar] .hefesto-owl__eyes{left:5%;top:21%;width:90%}
.hefesto-owl[data-variant=oculos] .hefesto-owl__eyes{left:6%;top:21%;width:88%}
.hefesto-owl[data-motion=spin] .hefesto-owl__head-wrap{animation:hefesto-head-spin .52s ease-in-out 1}
.hefesto-owl[data-motion=spin] .hefesto-owl__head--front{animation:hefesto-front-swap .52s steps(1,end) 1}
.hefesto-owl[data-motion=spin] .hefesto-owl__head--back{animation:hefesto-back-swap .52s steps(1,end) 1}
.hefesto-owl[data-motion=blink] .hefesto-owl__eyes{animation:hefesto-blink-now .34s steps(1,end) 1}
.hefesto-owl[data-motion=tilt] .hefesto-owl__head-wrap{animation:hefesto-head-tilt .9s ease-in-out 1}
.hefesto-owl[data-motion=puff] .hefesto-owl__body{animation:hefesto-body-puff .92s cubic-bezier(.2,.75,.25,1) 1}
.hefesto-owl[data-motion=puff] .hefesto-owl__head-wrap{animation:hefesto-head-puff .92s cubic-bezier(.2,.75,.25,1) 1}
.hefesto-owl[data-motion=puff] .hefesto-owl__eyes{animation:hefesto-puff-blink .92s steps(1,end) 1}
.hefesto-owl[data-motion=light]::after{animation:hefesto-light-burst 1.15s ease-out 1}
.hefesto-owl[data-motion=profile] .hefesto-owl__body,.hefesto-owl[data-motion=profile] .hefesto-owl__head-wrap{animation:hefesto-pose-source 1.55s ease-in-out 1}
.hefesto-owl[data-motion=profile] .hefesto-owl__pose--profile{animation:hefesto-pose-target 1.55s ease-in-out 1}
.hefesto-owl[data-motion=back] .hefesto-owl__body,.hefesto-owl[data-motion=back] .hefesto-owl__head-wrap{animation:hefesto-pose-source 1.75s ease-in-out 1}
.hefesto-owl[data-motion=back] .hefesto-owl__pose--back{animation:hefesto-pose-target 1.75s ease-in-out 1}
.hefesto-owl[data-motion=inspect] .hefesto-owl__body,.hefesto-owl[data-motion=inspect] .hefesto-owl__head-wrap{animation:hefesto-inspect-source 3.15s ease-in-out 1}
.hefesto-owl[data-motion=inspect] .hefesto-owl__pose--profile{animation:hefesto-inspect-profile 3.15s ease-in-out 1}
.hefesto-owl[data-motion=inspect] .hefesto-owl__pose--back{animation:hefesto-inspect-back 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sleep] .hefesto-owl__body,.hefesto-owl[data-motion=sleep] .hefesto-owl__head-wrap{animation:hefesto-sleep-source 3.6s ease-in-out 1}
.hefesto-owl[data-motion=sleep] .hefesto-owl__pose--sleep{animation:hefesto-sleep-target 3.6s ease-in-out 1}
.hefesto-owl[data-motion=gaze] .hefesto-owl__gaze{opacity:1}
.hefesto-owl[data-motion=gaze] .hefesto-owl__gaze-image{animation:hefesto-gaze 1.7s cubic-bezier(.22,.7,.22,1) 1}
.hefesto-owl[data-tracking=true] .hefesto-owl__gaze{opacity:1}
.hefesto-owl[data-pose=back] .hefesto-owl__body,.hefesto-owl[data-pose=back] .hefesto-owl__head-wrap{opacity:0;animation:none}
.hefesto-owl[data-pose=back] .hefesto-owl__pose--back{opacity:1}
.hefesto-owl[data-motion=anger]::before{animation:hefesto-anger-red 2.65s ease-in-out 1}
.hefesto-owl[data-motion=anger] .hefesto-owl__body{animation:hefesto-anger-body 2.65s ease-in-out 1}
.hefesto-owl[data-motion=anger] .hefesto-owl__head-wrap{animation:hefesto-anger-head 2.65s ease-in-out 1}
.hefesto-owl[data-motion=anger] .hefesto-owl__anger-plate{animation:hefesto-anger-plate 2.65s ease-in-out 1}
.hefesto-owl[data-motion=anger] .hefesto-owl__steam i{animation:hefesto-steam 1.25s ease-out 1}.hefesto-owl[data-motion=anger] .hefesto-owl__steam i:nth-child(1){animation-delay:.72s}.hefesto-owl[data-motion=anger] .hefesto-owl__steam i:nth-child(2){animation-delay:.84s}.hefesto-owl[data-motion=anger] .hefesto-owl__steam i:nth-child(3){animation-delay:.96s}
.hefesto-owl[data-motion=happy]::before{background:radial-gradient(circle at 50% 52%,rgba(255,224,117,.72),rgba(255,166,66,.24) 46%,transparent 72%);animation:hefesto-happy-glow 2.25s ease-in-out 1}
.hefesto-owl[data-motion=happy] .hefesto-owl__body{animation:hefesto-happy-body 2.25s cubic-bezier(.2,.78,.25,1) 1}
.hefesto-owl[data-motion=happy] .hefesto-owl__head-wrap{animation:hefesto-happy-head 2.25s cubic-bezier(.2,.78,.25,1) 1}
.hefesto-owl[data-motion=happy] .hefesto-owl__eyes{animation:hefesto-happy-eyes 2.25s steps(1,end) 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__body{animation:hefesto-sad-body 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__head-wrap{animation:hefesto-sad-head 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__eyes{animation:hefesto-sad-eyes 3.15s steps(1,end) 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__tear{animation:hefesto-sad-tear 3.15s ease-in 1}
.hefesto-owl[data-motion=sad]::after{animation:hefesto-sad-light 3.15s ease-in-out 1}
@keyframes hefesto-blink{0%,46%,50%,100%{opacity:0}47%,49%{opacity:1}}
@keyframes hefesto-blink-now{0%,100%{opacity:0}25%,75%{opacity:1}}
@keyframes hefesto-head-curiosity{0%,72%,100%{transform:rotate(0)}80%,91%{transform:rotate(var(--head-tilt))}}
@keyframes hefesto-head-tilt{0%,100%{transform:rotate(0)}45%,72%{transform:rotate(-9deg)}}
@keyframes hefesto-body-puff{0%,100%{transform:translateY(0) scale(1)}22%{transform:translateY(1%) scale(.98,1.01)}42%{transform:translateY(-3%) scale(1.13,1.07)}58%{transform:translateY(-2%) rotate(1deg) scale(1.08,1.045)}72%{transform:translateY(-2.5%) rotate(-1deg) scale(1.115,1.06)}}
@keyframes hefesto-head-puff{0%,100%{transform:translateY(0) scale(1)}22%{transform:translateY(1%) scale(.99)}42%{transform:translateY(-4%) scale(1.055)}58%{transform:translateY(-3%) rotate(-1.2deg) scale(1.035)}72%{transform:translateY(-3.5%) rotate(1.2deg) scale(1.045)}}
@keyframes hefesto-puff-blink{0%,29%,64%,100%{opacity:0}30%,63%{opacity:1}}
@keyframes hefesto-light-idle{0%,100%{opacity:.2;filter:blur(1.8px) saturate(1.15)}50%{opacity:.38;filter:blur(1px) saturate(1.45)}}
@keyframes hefesto-light-burst{0%,100%{opacity:.24;transform:scale(1)}22%{opacity:.9;transform:scale(1.035);filter:blur(.6px) saturate(1.8)}48%{opacity:.42;transform:scale(1)}68%{opacity:.78;transform:scale(1.018);filter:blur(.8px) saturate(1.65)}}
@keyframes hefesto-pose-source{0%,10%,90%,100%{opacity:1;transform:scaleX(1)}18%,82%{opacity:0;transform:scaleX(.12)}}
@keyframes hefesto-pose-target{0%,14%,86%,100%{opacity:0;transform:scaleX(.12)}23%,76%{opacity:1;transform:scaleX(1)}}
@keyframes hefesto-inspect-source{0%,7%,93%,100%{opacity:1;transform:scaleX(1)}12%,88%{opacity:0;transform:scaleX(.12)}}
@keyframes hefesto-inspect-profile{0%,10%,35%,39%,63%,67%,90%,100%{opacity:0;transform:scaleX(.12)}15%,30%,72%,85%{opacity:1;transform:scaleX(1)}}
@keyframes hefesto-inspect-back{0%,34%,66%,100%{opacity:0;transform:scaleX(.12)}42%,59%{opacity:1;transform:scaleX(1)}}
@keyframes hefesto-sleep-source{0%,8%,94%,100%{opacity:1;transform:translateY(0) scale(1)}16%,88%{opacity:0;transform:translateY(5%) scale(.9)}}
@keyframes hefesto-sleep-target{0%,12%,92%,100%{opacity:0;transform:translateY(5%) scale(.88)}20%,34%,50%,66%,84%{opacity:1;transform:translateY(1%) scale(.98)}26%,42%,58%,74%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes hefesto-gaze{0%,10%,100%{transform:translate(0,0)}22%,38%{transform:translate(-4px,1px)}50%,66%{transform:translate(4px,1px)}78%,90%{transform:translate(0,-3px)}}
@keyframes hefesto-anger-red{0%,100%{opacity:0;transform:scale(.94)}28%{opacity:.22}52%,68%{opacity:.82;transform:scale(1.07)}84%{opacity:.32}}
@keyframes hefesto-anger-body{0%,100%{transform:translate(0) scale(1)}28%{transform:translateY(1%) scale(1.015,.985)}38%,46%,54%,62%,70%{transform:translateX(-1.2%) scale(1.025,.98)}42%,50%,58%,66%,74%{transform:translateX(1.2%) scale(1.025,.98)}}
@keyframes hefesto-anger-head{0%,22%,100%{transform:rotate(0) translateY(0)}34%{transform:rotate(-2deg) translateY(1%)}40%,48%,56%,64%,72%{transform:rotate(-2.4deg) translateX(-1.4%)}44%,52%,60%,68%,76%{transform:rotate(2.4deg) translateX(1.4%)}86%{transform:rotate(0) translateY(-1%)}}
@keyframes hefesto-anger-plate{0%,20%,100%{opacity:0;transform:translateY(0) rotate(0)}26%{opacity:1}38%{opacity:1;transform:translateY(-5%) rotate(-1.5deg)}48%{opacity:1;transform:translateY(-3%) rotate(1.5deg)}58%,72%{opacity:1;transform:translateY(-6%) rotate(-1deg)}82%{opacity:.7;transform:translateY(-2%) rotate(0)}}
@keyframes hefesto-steam{0%{opacity:0;translate:0 10%;scale:.55}18%{opacity:.85}70%{opacity:.48}100%{opacity:0;translate:0 -72%;scale:1.35}}
@keyframes hefesto-happy-glow{0%,100%{opacity:0;transform:scale(.92)}24%,74%{opacity:.72;transform:scale(1.04)}42%,58%{opacity:.9;transform:scale(1.08)}}
@keyframes hefesto-happy-body{0%,100%{transform:translateY(0) scale(1)}20%{transform:translateY(2%) scale(.98,1.01)}38%{transform:translateY(-5%) scale(1.035,.98)}52%{transform:translateY(0) scale(.99,1.015)}68%{transform:translateY(-3.5%) scale(1.025,.99)}82%{transform:translateY(0) scale(1)}}
@keyframes hefesto-happy-head{0%,100%{transform:rotate(0) translate(0)}18%{transform:rotate(-3deg) translate(-1%,2%)}34%,72%{transform:rotate(-8deg) translate(-2%,-1%)}48%{transform:rotate(-5deg) translate(-1%,1%)}84%{transform:rotate(-2deg) translate(0)}}
@keyframes hefesto-happy-eyes{0%,13%,88%,100%{opacity:0}14%,87%{opacity:1}}
@keyframes hefesto-sad-body{0%,100%{transform:translateY(0) scale(1);filter:brightness(1) saturate(1)}24%{transform:translateY(2%) scale(.99,1.01)}45%,78%{transform:translateY(6%) scale(.965,1.025);filter:brightness(.72) saturate(.58)}90%{transform:translateY(2%) scale(.99);filter:brightness(.9) saturate(.85)}}
@keyframes hefesto-sad-head{0%,100%{transform:rotate(0) translateY(0);filter:brightness(1) saturate(1)}24%{transform:rotate(3deg) translateY(2%)}46%,78%{transform:rotate(9deg) translate(2%,7%);filter:brightness(.76) saturate(.62)}90%{transform:rotate(2deg) translateY(2%);filter:brightness(.92) saturate(.86)}}
@keyframes hefesto-sad-eyes{0%,31%,86%,100%{opacity:0}32%,85%{opacity:1}}
@keyframes hefesto-sad-tear{0%,34%,100%{opacity:0;translate:0 -8%;scale:.65}42%{opacity:.95}72%{opacity:.85;translate:8% 92%;scale:1}88%{opacity:0;translate:12% 175%;scale:.75}}
@keyframes hefesto-sad-light{0%,100%{opacity:.24;filter:blur(1.5px) saturate(1.2)}42%,78%{opacity:.08;filter:blur(2.5px) saturate(.55)}}
@keyframes hefesto-head-spin{0%,100%{transform:scaleX(1) rotate(0)}24%,76%{transform:scaleX(.08) rotate(0)}50%{transform:scaleX(1) rotate(0)}}
@keyframes hefesto-front-swap{0%,23%,77%,100%{opacity:1}24%,76%{opacity:0}}
@keyframes hefesto-back-swap{0%,23%,77%,100%{opacity:0}24%,76%{opacity:1}}
@media(prefers-reduced-motion:reduce){.hefesto-owl__head-wrap,.hefesto-owl__eyes,.hefesto-owl::after,.hefesto-owl::before,.hefesto-owl[data-motion] .hefesto-owl__head-wrap,.hefesto-owl[data-motion] .hefesto-owl__head,.hefesto-owl[data-motion] .hefesto-owl__body,.hefesto-owl[data-motion] .hefesto-owl__pose,.hefesto-owl[data-motion] .hefesto-owl__gaze-image,.hefesto-owl[data-motion] .hefesto-owl__anger-plate,.hefesto-owl[data-motion] .hefesto-owl__steam i,.hefesto-owl[data-motion] .hefesto-owl__tear{animation:none!important}.hefesto-owl__eyes,.hefesto-owl__pose,.hefesto-owl__gaze,.hefesto-owl__anger-plate,.hefesto-owl__steam i,.hefesto-owl__tear{opacity:0}.hefesto-owl::after{opacity:.24}}
`;
document.head.append(style);

function create({color='violeta',special=false}={}){
 const variant=special?'oculos':color;
 const root=document.createElement('span');root.className='hefesto-owl';root.dataset.variant=variant;root.setAttribute('aria-hidden','true');
 const body=document.createElement('img');body.className='hefesto-owl__body';body.src=`${ROOT}/${variant}/corpo-sem-cabeca.png`;body.alt='';body.draggable=false;
 const head=document.createElement('span');head.className='hefesto-owl__head-wrap';
 const front=document.createElement('img');front.className='hefesto-owl__head hefesto-owl__head--front';front.src=`${ROOT}/${variant}/cabeca-frontal.png`;front.alt='';front.draggable=false;
 const back=document.createElement('img');back.className='hefesto-owl__head hefesto-owl__head--back';back.src=`${ROOT}/${variant}/cabeca-traseira.png`;back.alt='';back.draggable=false;
 const angerPlate=document.createElement('img');angerPlate.className='hefesto-owl__anger-plate';angerPlate.src=front.src;angerPlate.alt='';angerPlate.draggable=false;
 const gazeLeft=document.createElement('span');gazeLeft.className='hefesto-owl__gaze hefesto-owl__gaze--left';
 const gazeRight=document.createElement('span');gazeRight.className='hefesto-owl__gaze hefesto-owl__gaze--right';
 for(const gaze of [gazeLeft,gazeRight]){const gazeImage=document.createElement('img');gazeImage.className='hefesto-owl__gaze-image';gazeImage.src=front.src;gazeImage.alt='';gazeImage.draggable=false;gaze.append(gazeImage)}
 const eyes=document.createElement('img');eyes.className='hefesto-owl__eyes';eyes.src=`${ROOT}/${variant}/olhos-fechados.png`;eyes.alt='';eyes.draggable=false;
 const profile=document.createElement('img');profile.className='hefesto-owl__pose hefesto-owl__pose--profile';profile.src=`${ROOT}/${variant}/${variant}-perfil.png`;profile.alt='';profile.draggable=false;
 const rear=document.createElement('img');rear.className='hefesto-owl__pose hefesto-owl__pose--back';rear.src=`${ROOT}/${variant}/${variant}-costas.png`;rear.alt='';rear.draggable=false;
 const sleep=document.createElement('img');sleep.className='hefesto-owl__pose hefesto-owl__pose--sleep';sleep.src=`${ROOT}/${variant}/${variant}-dormindo.png`;sleep.alt='';sleep.draggable=false;
 const steam=document.createElement('span');steam.className='hefesto-owl__steam';steam.append(document.createElement('i'),document.createElement('i'),document.createElement('i'));
 const tear=document.createElement('span');tear.className='hefesto-owl__tear';
 head.append(front,back,gazeLeft,gazeRight,eyes,angerPlate);root.append(body,head,profile,rear,sleep,steam,tear);return root;
}
const motionTimers=new WeakMap();
const behaviorControllers=new WeakMap();
function motion(root,type){
 if(!root)return;
 const previous=motionTimers.get(root);if(previous)clearTimeout(previous);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){delete root.dataset.motion;return;}
 if(type==='spin'&&root.dataset.motion==='spin')return;
 delete root.dataset.motion;void root.offsetWidth;root.dataset.motion=type;
 const duration=type==='sleep'?3680:type==='sad'?3220:type==='inspect'?3220:type==='anger'?2720:type==='happy'?2320:type==='back'?1820:type==='profile'?1620:type==='gaze'?1760:type==='spin'?580:type==='tilt'?950:type==='puff'?980:type==='light'?1200:400;
 const timer=setTimeout(()=>{if(root.dataset.motion===type)delete root.dataset.motion;motionTimers.delete(root);},duration);motionTimers.set(root,timer);
}
function pose(root,value='front'){
 if(!root)return;const previous=motionTimers.get(root);if(previous)clearTimeout(previous);motionTimers.delete(root);delete root.dataset.motion;
 if(value==='back')root.dataset.pose='back';else delete root.dataset.pose;
}
function look(root,x=0,y=0){if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches)return;root.style.setProperty('--gaze-x',`${Math.max(-1,Math.min(1,x))*4}px`);root.style.setProperty('--gaze-y',`${Math.max(-1,Math.min(1,y))*3}px`);root.dataset.tracking='true';}
function stopLooking(root){if(!root)return;root.style.setProperty('--gaze-x','0px');root.style.setProperty('--gaze-y','0px');delete root.dataset.tracking;}
function bind(root,surface,{idleMs=120000,onState,trackSurface=surface}={}){
 if(!root||!surface)return null;behaviorControllers.get(root)?.destroy();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,storageKey='sofia-student-owl-last-interaction';let idleTimer=0,aliveTimer=0,lookTimer=0,clicks=[],back=false;
 const notify=state=>{if(typeof onState==='function')onState(state)};
 const remember=()=>{try{localStorage.setItem(storageKey,String(Date.now()));}catch{}};
 const scheduleIdle=()=>{clearTimeout(idleTimer);if(!idleMs)return;idleTimer=setTimeout(()=>{back=true;pose(root,'back');notify('back');},idleMs)};
 const scheduleAlive=()=>{clearTimeout(aliveTimer);if(reduced)return;aliveTimer=setTimeout(()=>{if(!back&&!root.dataset.motion&&root.isConnected&&surface.getClientRects().length){const options=['blink','blink','tilt','puff'];motion(root,options[Math.floor(Math.random()*options.length)]);notify('alive')}scheduleAlive();},9000+Math.random()*6500)};
 const pointermove=event=>{if(back||!root.getClientRects().length)return;const rect=root.getBoundingClientRect(),rangeX=Math.max(rect.width*1.4,innerWidth*.28),rangeY=Math.max(rect.height*1.4,innerHeight*.28),x=(event.clientX-(rect.left+rect.width/2))/rangeX,y=(event.clientY-(rect.top+rect.height/2))/rangeY;look(root,x,y);clearTimeout(lookTimer);lookTimer=setTimeout(()=>stopLooking(root),700);remember();scheduleIdle();};
 const pointerleave=()=>{clearTimeout(lookTimer);stopLooking(root)};
 trackSurface.addEventListener('pointermove',pointermove,{passive:true});surface.addEventListener('pointerleave',pointerleave,{passive:true});
 let last=0;try{last=Number(localStorage.getItem(storageKey)||0);}catch{}if(idleMs&&last&&Date.now()-last>=idleMs){back=true;pose(root,'back');notify('back')}else scheduleIdle();scheduleAlive();
 const controller={click(){const now=Date.now();remember();scheduleIdle();if(back){back=false;pose(root,'front');void root.offsetWidth;motion(root,'sad');clicks=[];notify('sad');return 'sad'}clicks=clicks.filter(time=>now-time<=2600);clicks.push(now);if(clicks.length>=5){clicks=[];motion(root,'anger');notify('anger');return 'anger'}return 'normal'},activity(){remember();scheduleIdle()},wake(kind){back=false;pose(root,'front');remember();scheduleIdle();if(kind)motion(root,kind);notify(kind||'front')},destroy(){clearTimeout(idleTimer);clearTimeout(aliveTimer);clearTimeout(lookTimer);trackSurface.removeEventListener('pointermove',pointermove);surface.removeEventListener('pointerleave',pointerleave);stopLooking(root);behaviorControllers.delete(root)}};
 behaviorControllers.set(root,controller);return controller;
}
window.CorujaVisual={create,motion,pose,look,stopLooking,bind};
})();
