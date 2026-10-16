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
.hefesto-owl__wing{position:absolute;z-index:2;left:12%;bottom:-5%;width:76%;height:auto;opacity:0;pointer-events:none;user-select:none;-webkit-user-drag:none}.hefesto-owl__wing--left{clip-path:polygon(0 0,41% 0,41% 63%,28% 82%,10% 80%,0 64%);transform-origin:36% 12%}.hefesto-owl__wing--right{clip-path:polygon(59% 0,100% 0,100% 64%,90% 80%,72% 82%,59% 63%);transform-origin:64% 12%}
.hefesto-owl[data-winged=true]:is([data-motion=excitement],[data-motion=doubt],[data-motion=anger],[data-motion=happy],[data-motion=sneeze]) .hefesto-owl__body{clip-path:polygon(31% 0,69% 0,69% 53%,88% 100%,12% 100%,31% 53%)}
.hefesto-owl[data-winged=true]:is([data-motion=excitement],[data-motion=doubt],[data-motion=anger],[data-motion=happy],[data-motion=sneeze]) .hefesto-owl__wing{opacity:1}
.hefesto-owl__head-wrap{position:absolute;z-index:2;left:3%;top:-6%;width:94%;aspect-ratio:1;transform-origin:50% 72%;animation:hefesto-head-curiosity 7.8s ease-in-out infinite}
.hefesto-owl__head{inset:0;width:100%}
.hefesto-owl__head--back{opacity:0}
.hefesto-owl__anger-plate{position:absolute;z-index:4;inset:0;width:100%;height:auto;clip-path:polygon(24% 0,76% 0,70% 43%,30% 43%);opacity:0;transform-origin:50% 35%;user-select:none;-webkit-user-drag:none}
.hefesto-owl__steam{position:absolute;z-index:7;inset:0;pointer-events:none}.hefesto-owl__steam i{position:absolute;top:8%;width:10%;height:28%;border-radius:50%;background:radial-gradient(ellipse at 50% 85%,rgba(255,210,200,.9),rgba(180,185,195,.55) 40%,transparent 72%);filter:blur(4px);opacity:0}.hefesto-owl__steam i:nth-child(1){left:25%;transform:rotate(-16deg)}.hefesto-owl__steam i:nth-child(2){left:46%}.hefesto-owl__steam i:nth-child(3){left:67%;transform:rotate(16deg)}
.hefesto-owl__tear{position:absolute;z-index:7;left:67%;top:51.5%;width:3.2%;height:9%;border-radius:58% 42% 62% 38%/68% 54% 46% 32%;background:linear-gradient(180deg,#eefcff,#70cfff 55%,#2b83d8);box-shadow:0 0 7px #8de4ff,0 2px 3px #183a7866;opacity:0;transform:rotate(8deg);pointer-events:none}
.hefesto-owl__rays{position:absolute;z-index:8;inset:-8%;pointer-events:none;opacity:0}.hefesto-owl__rays i{position:absolute;left:49%;top:49%;width:2%;height:24%;border-radius:999px;background:linear-gradient(180deg,#fff7c5,#f3c85f 52%,var(--owl-light));box-shadow:0 0 5px #fff4a888,0 0 10px var(--owl-light);transform-origin:50% 8%}.hefesto-owl__rays i:nth-child(1){transform:rotate(0deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(2){transform:rotate(60deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(3){transform:rotate(120deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(4){transform:rotate(180deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(5){transform:rotate(240deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(6){transform:rotate(300deg) translateY(-72%)}.hefesto-owl__rays i:nth-child(n+7){display:none}
.hefesto-owl__sparks{position:absolute;z-index:10;left:50%;top:55%;width:1px;height:1px;pointer-events:none}.hefesto-owl__sparks i{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--owl-light);box-shadow:0 0 5px #fff,0 0 10px var(--owl-light);opacity:0}.hefesto-owl__sparks i:nth-child(2n){width:3px;height:3px}.hefesto-owl__sparks i:nth-child(3n){border-radius:1px;transform:rotate(45deg)}
.hefesto-owl__energy{position:absolute;z-index:7;inset:0;pointer-events:none;opacity:0;overflow:visible;mix-blend-mode:screen;filter:brightness(1.35) saturate(1.65) drop-shadow(0 0 7px var(--owl-light));-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 35%,#000 65%,transparent 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 35%,#000 65%,transparent 100%);-webkit-mask-size:100% 34%;mask-size:100% 34%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:0 135%;mask-position:0 135%}
.hefesto-owl__energy-body,.hefesto-owl__energy-head{position:absolute;display:block;height:auto;object-fit:contain;user-select:none;-webkit-user-drag:none}.hefesto-owl__energy-body{left:12%;bottom:-5%;width:76%}.hefesto-owl__energy-head{left:3%;top:-6%;width:94%}
.hefesto-owl__gaze{position:absolute;z-index:2;top:45%;width:16%;aspect-ratio:1;overflow:hidden;border-radius:50%;opacity:0;pointer-events:none}
.hefesto-owl__gaze--left{left:26%}.hefesto-owl__gaze--right{left:58%}
.hefesto-owl__gaze-image{position:absolute;top:-281.25%;width:625%;max-width:none;height:auto;transform:translate(var(--gaze-x,0),var(--gaze-y,0));user-select:none;-webkit-user-drag:none}
.hefesto-owl__gaze--left .hefesto-owl__gaze-image{left:-162.5%}.hefesto-owl__gaze--right .hefesto-owl__gaze-image{left:-362.5%}
.hefesto-owl__eyes{z-index:8;left:4%;top:13%;width:92%;opacity:0;animation:hefesto-blink 8.4s steps(1,end) infinite}
.hefesto-owl__beak{display:none;position:absolute;z-index:9;height:auto;pointer-events:none;user-select:none;-webkit-user-drag:none;filter:drop-shadow(0 2px 2px rgba(35,10,5,.48));transform-origin:50% 12%}
.hefesto-owl__mouth{position:absolute;z-index:4;left:46%;top:55%;width:8%;height:8%;opacity:0;clip-path:polygon(50% 0,100% 40%,74% 100%,26% 100%,0 40%);background:radial-gradient(ellipse at 50% 22%,#6f2518,#160709 72%);filter:drop-shadow(0 1px 1px #160609);pointer-events:none}
.hefesto-owl__beak-native{position:absolute;z-index:5;inset:0;width:100%;height:auto;opacity:0;clip-path:polygon(45% 54%,55% 54%,53% 68%,47% 68%);transform-origin:50% 54%;pointer-events:none;user-select:none;-webkit-user-drag:none}
.hefesto-owl__head--open{z-index:6;opacity:0}
.hefesto-owl[data-open-head=true][data-beak=half] .hefesto-owl__head--front,.hefesto-owl[data-open-head=true][data-beak=open] .hefesto-owl__head--front{opacity:0}
.hefesto-owl[data-open-head=true][data-beak=half] .hefesto-owl__head--open{opacity:1;transform:scaleY(.96);transform-origin:50% 44%}
.hefesto-owl[data-open-head=true][data-beak=open] .hefesto-owl__head--open{opacity:1}
.hefesto-owl[data-articulated-beak=true]:not([data-open-head=true])[data-beak=half] .hefesto-owl__beak--half{display:block;left:39%;top:52%;width:22%;clip-path:inset(31% 0 0 0);transform:scaleY(.9)}.hefesto-owl[data-articulated-beak=true]:not([data-open-head=true])[data-beak=open] .hefesto-owl__beak--open{display:block;left:37%;top:51%;width:26%;clip-path:inset(31% 0 0 0)}
/* Ajustes ópticos por personagem: as pranchas têm caixas e proporções próprias. */
.hefesto-owl[data-variant=violeta] .hefesto-owl__head-wrap{top:0}
.hefesto-owl[data-variant=violeta] .hefesto-owl__eyes{left:5%;top:25%;width:90%}
.hefesto-owl[data-variant=violeta] .hefesto-owl__eyes--left{clip-path:polygon(17% 34%,29% 25%,43% 31%,50% 57%,45% 87%,28% 92%,18% 75%)}.hefesto-owl[data-variant=violeta] .hefesto-owl__eyes--right{clip-path:polygon(50% 57%,57% 31%,71% 25%,83% 34%,82% 75%,72% 92%,55% 87%);top:25%}
.hefesto-owl[data-variant=violeta] .hefesto-owl__eye-fill{z-index:7;top:43%;width:29%;height:19%;border-radius:50%;background:radial-gradient(ellipse at 50% 35%,#d99a68 0 28%,#a95c37 68%,#562719 100%);clip-path:ellipse(48% 48% at 50% 50%)}.hefesto-owl[data-variant=violeta] .hefesto-owl__eye-fill--left{left:18%;transform:rotate(7deg)}.hefesto-owl[data-variant=violeta] .hefesto-owl__eye-fill--right{left:53%;transform:rotate(-7deg)}
.hefesto-owl[data-debug-eyes=true] .hefesto-owl__head-wrap{animation:none;transform:rotate(-9deg)}.hefesto-owl[data-debug-eyes=true] .hefesto-owl__eyes{animation:none;opacity:1}
.hefesto-owl[data-variant=ambar] .hefesto-owl__eyes{left:5%;top:21%;width:90%}
.hefesto-owl[data-variant=oculos] .hefesto-owl__eyes{left:6%;top:21%;width:88%}
.hefesto-owl[data-motion=spin] .hefesto-owl__head-wrap{animation:hefesto-head-spin .52s ease-in-out 1}
.hefesto-owl[data-motion=spin] .hefesto-owl__head--front{animation:hefesto-front-swap .52s steps(1,end) 1}
.hefesto-owl[data-motion=spin] .hefesto-owl__head--back{animation:hefesto-back-swap .52s steps(1,end) 1}
.hefesto-owl[data-motion=blink] .hefesto-owl__eyes{animation:hefesto-blink-now .34s steps(1,end) 1}
.hefesto-owl[data-motion=tilt] .hefesto-owl__head-wrap{animation:hefesto-head-tilt .9s ease-in-out 1}
.hefesto-owl[data-motion=doubt] .hefesto-owl__head-wrap{animation:hefesto-head-doubt 2.45s ease-in-out 1}
.hefesto-owl[data-motion=doubt] .hefesto-owl__eyes{animation:hefesto-doubt-blink 2.45s steps(1,end) 1}
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
.hefesto-owl[data-motion=excitement]{animation:hefesto-excitement-hop 2.9s cubic-bezier(.22,.72,.28,1) 1}.hefesto-owl[data-motion=excitement]::after{animation:hefesto-excitement-core 2.9s ease-out 1}
.hefesto-owl[data-motion=excitement] .hefesto-owl__eyes{animation:hefesto-happy-eyes 2.9s steps(1,end) 1}
.hefesto-owl[data-motion=excitement] .hefesto-owl__energy{animation:hefesto-energy-sweep 2.9s ease-in-out 1}
.hefesto-owl[data-motion=excitement] .hefesto-owl__wing--left{animation:hefesto-wing-excited-left .48s ease-in-out 4}.hefesto-owl[data-motion=excitement] .hefesto-owl__wing--right{animation:hefesto-wing-excited-right .48s ease-in-out 4}
.hefesto-owl[data-motion=doubt] .hefesto-owl__wing--left{animation:hefesto-wing-question 2.45s ease-in-out 1}
.hefesto-owl[data-motion=anger] .hefesto-owl__wing--left{animation:hefesto-wing-annoyed-left .22s ease-in-out 5}.hefesto-owl[data-motion=anger] .hefesto-owl__wing--right{animation:hefesto-wing-annoyed-right .22s ease-in-out 5}
.hefesto-owl[data-motion=happy] .hefesto-owl__wing--left{animation:hefesto-wing-pet-left 2.25s ease-in-out 1}.hefesto-owl[data-motion=happy] .hefesto-owl__wing--right{animation:hefesto-wing-pet-right 2.25s ease-in-out 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__wing--left{animation:hefesto-wing-sad-left 3.15s ease-in-out 1}.hefesto-owl[data-motion=sad] .hefesto-owl__wing--right{animation:hefesto-wing-sad-right 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sneeze]{animation:hefesto-sneeze-body 1.65s ease-out 1}.hefesto-owl[data-motion=sneeze] .hefesto-owl__wing--left{animation:hefesto-sneeze-left 1.65s ease-out 1}.hefesto-owl[data-motion=sneeze] .hefesto-owl__wing--right{animation:hefesto-sneeze-right 1.65s ease-out 1}
.hefesto-owl[data-motion=sneeze] .hefesto-owl__eyes{animation:hefesto-sneeze-eyes 1.65s steps(1,end) 1}
.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i{animation:hefesto-sneeze-spark 1.65s ease-out 1}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(2){--spark-x:-30px;--spark-y:-18px}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(3){--spark-x:34px;--spark-y:-14px}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(4){--spark-x:-38px;--spark-y:7px}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(5){--spark-x:40px;--spark-y:10px}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(6){--spark-x:-20px;--spark-y:24px}.hefesto-owl[data-motion=sneeze] .hefesto-owl__sparks i:nth-child(7){--spark-x:23px;--spark-y:26px}
.hefesto-owl[data-motion=sad] .hefesto-owl__body{animation:hefesto-sad-body 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__head-wrap{animation:hefesto-sad-head 3.15s ease-in-out 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__eyes{animation:hefesto-sad-eyes 3.15s steps(1,end) 1}
.hefesto-owl[data-motion=sad] .hefesto-owl__tear{animation:hefesto-sad-tear 3.15s ease-in 1}
.hefesto-owl[data-motion=sad]::after{animation:hefesto-sad-light 3.15s ease-in-out 1}
@keyframes hefesto-blink{0%,46%,50%,100%{opacity:0}47%,49%{opacity:1}}
@keyframes hefesto-blink-now{0%,100%{opacity:0}25%,75%{opacity:1}}
@keyframes hefesto-head-curiosity{0%,72%,100%{transform:rotate(0)}80%,91%{transform:rotate(var(--head-tilt))}}
@keyframes hefesto-head-tilt{0%,100%{transform:rotate(0)}45%,72%{transform:rotate(-9deg)}}
@keyframes hefesto-head-doubt{0%,7%,100%{transform:rotate(0)}18%,86%{transform:rotate(-9deg)}94%{transform:rotate(0)}}
@keyframes hefesto-doubt-blink{0%,27%,34%,57%,64%,78%,84%,100%{opacity:0}28%,33%,58%,63%,79%,83%{opacity:1}}
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
@keyframes hefesto-energy-sweep{0%{opacity:0;-webkit-mask-position:0 135%;mask-position:0 135%}10%{opacity:.18}34%{opacity:.78;-webkit-mask-position:0 52%;mask-position:0 52%}58%{opacity:.42;-webkit-mask-position:0 -28%;mask-position:0 -28%}59%{opacity:0;-webkit-mask-position:0 135%;mask-position:0 135%}68%{opacity:.15}86%{opacity:.62;-webkit-mask-position:0 42%;mask-position:0 42%}100%{opacity:0;-webkit-mask-position:0 -28%;mask-position:0 -28%}}
@keyframes hefesto-excitement-hop{0%,14%,48%,62%,100%{transform:translateY(0) scale(1)}18%{transform:translateY(1.2%) scale(1.012,.988)}30%{transform:translateY(-4.2%) scale(.994,1.006)}38%{transform:translateY(-2.2%) scale(.998,1.002)}45%{transform:translateY(0) scale(1.01,.99)}67%{transform:translateY(.8%) scale(1.008,.992)}77%{transform:translateY(-2.8%) scale(.996,1.004)}84%{transform:translateY(-1.4%)}91%{transform:translateY(0) scale(1.006,.994)}}
@keyframes hefesto-excitement-core{0%,12%,100%{opacity:.2;transform:scale(1)}34%{opacity:.72;transform:scale(1.02);filter:blur(.7px) saturate(1.7)}58%{opacity:.3;transform:scale(1)}86%{opacity:.62;transform:scale(1.012);filter:blur(.9px) saturate(1.55)}}
@keyframes hefesto-wing-excited-left{0%,100%{transform:rotate(0)}50%{transform:rotate(-16deg)}}@keyframes hefesto-wing-excited-right{0%,100%{transform:rotate(0)}50%{transform:rotate(16deg)}}
@keyframes hefesto-wing-question{0%,12%,100%{transform:rotate(0)}24%,82%{transform:rotate(-9deg)}}
@keyframes hefesto-wing-annoyed-left{0%,100%{transform:rotate(0)}50%{transform:rotate(-13deg)}}@keyframes hefesto-wing-annoyed-right{0%,100%{transform:rotate(0)}50%{transform:rotate(13deg)}}
@keyframes hefesto-wing-pet-left{0%,100%{transform:rotate(0)}28%,76%{transform:rotate(-7deg)}}@keyframes hefesto-wing-pet-right{0%,100%{transform:rotate(0)}28%,76%{transform:rotate(7deg)}}
@keyframes hefesto-wing-sad-left{0%,100%{transform:rotate(0)}28%,82%{transform:rotate(7deg)}}@keyframes hefesto-wing-sad-right{0%,100%{transform:rotate(0)}28%,82%{transform:rotate(-7deg)}}
@keyframes hefesto-sneeze-body{0%,34%,100%{transform:translate(0) rotate(0)}48%{transform:translateY(2%) scale(.98)}57%{transform:translate(-2%,-3%) rotate(-2deg) scale(1.035)}65%{transform:translate(1%,0) rotate(1deg)}75%{transform:translate(0) rotate(0)}}
@keyframes hefesto-sneeze-left{0%,42%,100%{transform:rotate(0)}48%{transform:rotate(8deg)}58%{transform:rotate(-24deg)}72%{transform:rotate(-4deg)}86%{transform:rotate(0)}}@keyframes hefesto-sneeze-right{0%,42%,100%{transform:rotate(0)}48%{transform:rotate(-8deg)}58%{transform:rotate(24deg)}72%{transform:rotate(4deg)}86%{transform:rotate(0)}}
@keyframes hefesto-sneeze-eyes{0%,35%,88%,100%{opacity:0}36%,87%{opacity:1}}
@keyframes hefesto-sneeze-spark{0%,50%,100%{opacity:0;translate:0 0;scale:.4}56%{opacity:1;scale:1.35}72%{opacity:.8;translate:var(--spark-x,28px) var(--spark-y,-24px);scale:1}88%{opacity:0;translate:var(--spark-x,28px) var(--spark-y,-24px);scale:.45}}
@keyframes hefesto-sad-body{0%,100%{transform:translateY(0) scale(1);filter:brightness(1) saturate(1)}24%{transform:translateY(2%) scale(.99,1.01)}45%,78%{transform:translateY(6%) scale(.965,1.025);filter:brightness(.72) saturate(.58)}90%{transform:translateY(2%) scale(.99);filter:brightness(.9) saturate(.85)}}
@keyframes hefesto-sad-head{0%,100%{transform:rotate(0) translateY(0);filter:brightness(1) saturate(1)}24%{transform:rotate(3deg) translateY(2%)}46%,78%{transform:rotate(9deg) translate(2%,7%);filter:brightness(.76) saturate(.62)}90%{transform:rotate(2deg) translateY(2%);filter:brightness(.92) saturate(.86)}}
@keyframes hefesto-sad-eyes{0%,31%,86%,100%{opacity:0}32%,85%{opacity:1}}
@keyframes hefesto-sad-tear{0%,34%,100%{opacity:0;translate:0 -8%;scale:.65}42%{opacity:.95}72%{opacity:.85;translate:8% 92%;scale:1}88%{opacity:0;translate:12% 175%;scale:.75}}
@keyframes hefesto-sad-light{0%,100%{opacity:.24;filter:blur(1.5px) saturate(1.2)}42%,78%{opacity:.08;filter:blur(2.5px) saturate(.55)}}
@keyframes hefesto-head-spin{0%,100%{transform:scaleX(1) rotate(0)}24%,76%{transform:scaleX(.08) rotate(0)}50%{transform:scaleX(1) rotate(0)}}
@keyframes hefesto-front-swap{0%,23%,77%,100%{opacity:1}24%,76%{opacity:0}}
@keyframes hefesto-back-swap{0%,23%,77%,100%{opacity:0}24%,76%{opacity:1}}
@media(prefers-reduced-motion:reduce){.hefesto-owl,.hefesto-owl__head-wrap,.hefesto-owl__eyes,.hefesto-owl::after,.hefesto-owl::before,.hefesto-owl[data-motion] .hefesto-owl__head-wrap,.hefesto-owl[data-motion] .hefesto-owl__head,.hefesto-owl[data-motion] .hefesto-owl__body,.hefesto-owl[data-motion] .hefesto-owl__pose,.hefesto-owl[data-motion] .hefesto-owl__gaze-image,.hefesto-owl[data-motion] .hefesto-owl__anger-plate,.hefesto-owl[data-motion] .hefesto-owl__steam i,.hefesto-owl[data-motion] .hefesto-owl__tear,.hefesto-owl[data-motion] .hefesto-owl__rays,.hefesto-owl[data-motion] .hefesto-owl__energy{animation:none!important}.hefesto-owl__eyes,.hefesto-owl__pose,.hefesto-owl__gaze,.hefesto-owl__anger-plate,.hefesto-owl__steam i,.hefesto-owl__tear,.hefesto-owl__rays,.hefesto-owl__energy{opacity:0}.hefesto-owl::after{opacity:.24}}
@media(prefers-reduced-motion:reduce){.hefesto-owl__wing{animation:none!important}}
`;
document.head.append(style);

function create({color='violeta',special=false,articulatedBeak=false,winged=false}={}){
 const variant=special?'oculos':color;
 const root=document.createElement('span');root.className='hefesto-owl';root.dataset.variant=variant;root.setAttribute('aria-hidden','true');
 const body=document.createElement('img');body.className='hefesto-owl__body';body.src=`${ROOT}/${variant}/corpo-sem-cabeca.png`;body.alt='';body.draggable=false;
 const wings=[];if(winged){root.dataset.winged='true';for(const side of ['left','right']){const wing=document.createElement('img');wing.className=`hefesto-owl__wing hefesto-owl__wing--${side}`;wing.src=body.src;wing.alt='';wing.draggable=false;wings.push(wing)}}
 const head=document.createElement('span');head.className='hefesto-owl__head-wrap';
 const front=document.createElement('img');front.className='hefesto-owl__head hefesto-owl__head--front';front.src=`${ROOT}/${variant}/cabeca-frontal.png`;front.alt='';front.draggable=false;
 const back=document.createElement('img');back.className='hefesto-owl__head hefesto-owl__head--back';back.src=`${ROOT}/${variant}/cabeca-traseira.png`;back.alt='';back.draggable=false;
 const openHead=document.createElement('img');openHead.className='hefesto-owl__head hefesto-owl__head--open';openHead.alt='';openHead.draggable=false;openHead.src=`${ROOT}/${variant}/cabeca-aberta-v2.png`;root.dataset.openHead='true';
 const angerPlate=document.createElement('img');angerPlate.className='hefesto-owl__anger-plate';angerPlate.src=front.src;angerPlate.alt='';angerPlate.draggable=false;
 const gazeLeft=document.createElement('span');gazeLeft.className='hefesto-owl__gaze hefesto-owl__gaze--left';
 const gazeRight=document.createElement('span');gazeRight.className='hefesto-owl__gaze hefesto-owl__gaze--right';
 for(const gaze of [gazeLeft,gazeRight]){const gazeImage=document.createElement('img');gazeImage.className='hefesto-owl__gaze-image';gazeImage.src=front.src;gazeImage.alt='';gazeImage.draggable=false;gaze.append(gazeImage)}
 const eyes=document.createElement('img');eyes.className='hefesto-owl__eyes';eyes.src=`${ROOT}/${variant}/olhos-fechados.png`;eyes.alt='';eyes.draggable=false;const eyeLayers=[];if(variant==='violeta'){const leftFill=document.createElement('i');leftFill.className='hefesto-owl__eyes hefesto-owl__eye-fill hefesto-owl__eye-fill--left';const rightFill=document.createElement('i');rightFill.className='hefesto-owl__eyes hefesto-owl__eye-fill hefesto-owl__eye-fill--right';eyes.classList.add('hefesto-owl__eyes--left');const rightEyes=eyes.cloneNode();rightEyes.className='hefesto-owl__eyes hefesto-owl__eyes--right';eyeLayers.push(leftFill,rightFill,eyes,rightEyes)}else eyeLayers.push(eyes)
 const beaks=['closed','half','open'].map((state,index)=>{const image=document.createElement('img');image.className=`hefesto-owl__beak hefesto-owl__beak--${state}`;image.src=`assets/sala/corujas-bicos/bico_${['fechado','entreaberto','aberto'][index]}.png`;image.alt='';image.draggable=false;return image});
 const mouth=document.createElement('span');mouth.className='hefesto-owl__mouth';
 const nativeBeak=document.createElement('img');nativeBeak.className='hefesto-owl__beak-native';nativeBeak.src=front.src;nativeBeak.alt='';nativeBeak.draggable=false;
 const profile=document.createElement('img');profile.className='hefesto-owl__pose hefesto-owl__pose--profile';profile.src=`${ROOT}/${variant}/${variant}-perfil.png`;profile.alt='';profile.draggable=false;
 const rear=document.createElement('img');rear.className='hefesto-owl__pose hefesto-owl__pose--back';rear.src=`${ROOT}/${variant}/${variant}-costas.png`;rear.alt='';rear.draggable=false;
 const sleep=document.createElement('img');sleep.className='hefesto-owl__pose hefesto-owl__pose--sleep';sleep.src=`${ROOT}/${variant}/${variant}-dormindo.png`;sleep.alt='';sleep.draggable=false;
 const steam=document.createElement('span');steam.className='hefesto-owl__steam';steam.append(document.createElement('i'),document.createElement('i'),document.createElement('i'));
 const tear=document.createElement('span');tear.className='hefesto-owl__tear';
 const rays=document.createElement('span');rays.className='hefesto-owl__rays';for(let i=0;i<8;i++)rays.append(document.createElement('i'));
 const sparks=document.createElement('span');sparks.className='hefesto-owl__sparks';for(let i=0;i<7;i++)sparks.append(document.createElement('i'));
 const energy=document.createElement('span');energy.className='hefesto-owl__energy';const energyBody=document.createElement('img');energyBody.className='hefesto-owl__energy-body';energyBody.src=body.src;energyBody.alt='';energyBody.draggable=false;const energyHead=document.createElement('img');energyHead.className='hefesto-owl__energy-head';energyHead.src=front.src;energyHead.alt='';energyHead.draggable=false;energy.append(energyBody,energyHead);
 if(articulatedBeak)root.dataset.articulatedBeak='true';head.append(front,back,openHead,gazeLeft,gazeRight,...eyeLayers,angerPlate,mouth,nativeBeak,...beaks);root.append(body,...wings,head,profile,rear,sleep,steam,tear,rays,energy,sparks);return root;
}
const motionTimers=new WeakMap();
const speechTimers=new WeakMap();
const behaviorControllers=new WeakMap();
function motion(root,type){
 if(!root)return;
 const previous=motionTimers.get(root);if(previous)clearTimeout(previous);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){delete root.dataset.motion;return;}
 if(type==='spin'&&root.dataset.motion==='spin')return;
 delete root.dataset.motion;void root.offsetWidth;root.dataset.motion=type;
 const duration=type==='sleep'?3680:type==='sad'?3220:type==='inspect'?3220:type==='excitement'?2980:type==='anger'?2720:type==='doubt'?2520:type==='happy'?2320:type==='back'?1820:type==='profile'?1620:type==='gaze'?1760:type==='sneeze'?1720:type==='spin'?580:type==='tilt'?950:type==='puff'?980:type==='light'?1200:400;
 const timer=setTimeout(()=>{if(root.dataset.motion===type)delete root.dataset.motion;motionTimers.delete(root);},duration);motionTimers.set(root,timer);
}
function pose(root,value='front'){
 if(!root)return;const previous=motionTimers.get(root);if(previous)clearTimeout(previous);motionTimers.delete(root);delete root.dataset.motion;
 if(value==='back')root.dataset.pose='back';else delete root.dataset.pose;
}
function look(root,x=0,y=0){if(!root||matchMedia('(prefers-reduced-motion: reduce)').matches)return;root.style.setProperty('--gaze-x',`${Math.max(-1,Math.min(1,x))*4}px`);root.style.setProperty('--gaze-y',`${Math.max(-1,Math.min(1,y))*3}px`);root.dataset.tracking='true';}
function stopLooking(root){if(!root)return;root.style.setProperty('--gaze-x','0px');root.style.setProperty('--gaze-y','0px');delete root.dataset.tracking;}
function speak(root,{duration=1200,strong=false,sparse=false}={}){
 if(!root||root.dataset.articulatedBeak!=='true')return;
 const previous=speechTimers.get(root);if(previous)previous.forEach(clearTimeout);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){root.dataset.beak='half';const timer=setTimeout(()=>delete root.dataset.beak,Math.min(duration,650));speechTimers.set(root,[timer]);return;}
 const timers=[];let elapsed=sparse?240:50,index=0;const sequence=sparse?['half',null,null]:strong?['half','open',null,'half',null,'open',null]:['half',null,'half',null];
 while(elapsed<duration-120){const at=elapsed,state=sequence[index++%sequence.length];timers.push(setTimeout(()=>{if(state)root.dataset.beak=state;else delete root.dataset.beak;},at));elapsed+=(sparse?360:125)+Math.floor(Math.random()*(sparse?180:140));}
 timers.push(setTimeout(()=>{delete root.dataset.beak;speechTimers.delete(root);},duration));speechTimers.set(root,timers);
}
function sneezeBeak(root){
 if(!root||root.dataset.articulatedBeak!=='true')return;
 const previous=speechTimers.get(root);if(previous)previous.forEach(clearTimeout);
 const timers=[setTimeout(()=>{root.dataset.beak='open'},720),setTimeout(()=>{delete root.dataset.beak;speechTimers.delete(root)},1180)];speechTimers.set(root,timers);
}
function doubtBeak(root){
 if(!root||root.dataset.articulatedBeak!=='true')return;
 const previous=speechTimers.get(root);if(previous)previous.forEach(clearTimeout);
 const timers=[setTimeout(()=>{root.dataset.beak='half'},120),setTimeout(()=>{delete root.dataset.beak},610),setTimeout(()=>{root.dataset.beak='half'},880),setTimeout(()=>{delete root.dataset.beak;speechTimers.delete(root)},1320)];speechTimers.set(root,timers);
}
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
window.CorujaVisual={create,motion,pose,look,stopLooking,speak,sneezeBeak,doubtBeak,bind};
})();
