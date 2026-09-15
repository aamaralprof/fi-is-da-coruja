(function(){
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const has=(key,value)=>{try{return localStorage.getItem(key)===(value||'found');}catch{return false;}};
const unlock=(key,value='found')=>{localStorage.setItem(key,value);window.dispatchEvent(new Event('percurso-atualizado'));};
const show=(node,focus=false)=>{if(!node)return;node.hidden=false;if(focus)node.querySelector('button,a,input')?.focus();};
const scrollToNode=node=>node?.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
const toast=message=>{const n=$('[data-story-toast]');if(!n)return;n.textContent=message;n.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.hidden=true,3600);};

function initSala17(){
 if(!$('[data-sala17-post]'))return;
 const keys={window:'sofia-post01-heliopolis-seen',letter:'sofia-clue-heliopolis-letter',lantern:'sofia-collection-mei-lantern',solar:'sofia-game-solar-path-completed',notebook:'sofia-room-notebook-unlocked',cipher:'sofia-game-solar-cipher-completed',cipherState:'sofia-game-solar-cipher-state',postal:'sofia-mission-postal-arche',emblem:'sofia-emblem-first-reflection',chat:'sofia-chat-eai-seen'};
 const ghost=$('[data-page-ghost]'),lantern=$('[data-mei-lantern]');
 const revealGhost=()=>{if(revealGhost.done)return;revealGhost.done=true;$('[data-ghost-description]').textContent='Uma pequena figura fantasmagórica atravessa a página e deixa para trás a miniatura da lanterna de Mei.';setTimeout(()=>ghost.classList.add('is-crossing'),reduced.matches?0:250);setTimeout(()=>{lantern.hidden=false;lantern.classList.add('is-ready');},reduced.matches?500:2100);};
 new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))revealGhost();},{threshold:.65}).observe($('[data-ghost-excerpt]'));
 if(has(keys.lantern,'collected')){lantern.hidden=false;lantern.disabled=true;lantern.querySelector('span').textContent='miniatura guardada';}
 lantern.addEventListener('click',()=>{unlock(keys.lantern,'collected');lantern.disabled=true;lantern.querySelector('span').textContent='miniatura guardada';$('[data-lantern-status]').textContent='Item encontrado: Miniatura da lanterna de Mei.';toast('Item encontrado: Miniatura da lanterna de Mei');});

 const windowStage=$('[data-heliopolis-stage]');
 const openWindow=()=>{windowStage.classList.add('is-open');const b=$('[data-open-heliopolis]');b.disabled=true;b.textContent='Heliópolis revelada';$('[data-window-status]').textContent='A quadra foi substituída por Heliópolis.';show($('[data-after-window]'));show($('[data-letter-fragment]'));unlock(keys.window);};
 $('[data-open-heliopolis]').addEventListener('pointerenter',()=>{const i=new Image();i.src='assets/arco2/patio-de-heliopolis.png';},{once:true});
 $('[data-open-heliopolis]').addEventListener('click',()=>{openWindow();setTimeout(()=>scrollToNode($('[data-after-window]')),reduced.matches?0:1700);});
 if(has(keys.window))openWindow();

 const readLetter=()=>{show($('[data-letter-transcript]'));show($('[data-register-letter]'));$('[data-read-letter]').setAttribute('aria-expanded','true');};
 $('[data-read-letter]').addEventListener('click',readLetter);
 $('[data-register-letter]').addEventListener('click',()=>{unlock(keys.letter);unlock('sofia-clue-fragmento-carta');$('[data-register-letter]').disabled=true;$('[data-letter-status]').textContent='Nova pista registrada: Carta do Escritório do Destino — fragmento de Heliópolis.';toast('Nova pista registrada · fragmento de Heliópolis');show($('[data-after-letter]'));show($('[data-solar-game]'));scrollToNode($('[data-after-letter]'));});
 if(has(keys.letter)){readLetter();$('[data-register-letter]').disabled=true;$('[data-register-letter]').textContent='Pista registrada';show($('[data-after-letter]'));show($('[data-solar-game]'));}

 const visited=new Set(),sky=$('[data-solar-sky]');
 $('[data-start-solar]').addEventListener('click',e=>{e.currentTarget.hidden=true;show($('[data-solar-board]'),true);unlock('sofia-game-solar-path-started');});
 $$('[data-solar-moment]').forEach(b=>b.addEventListener('click',()=>{sky.dataset.moment=b.dataset.solarMoment;visited.add(b.dataset.solarMoment);$$('[data-solar-moment]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('[data-observation-status]').textContent=`${visited.size} de 3 momentos observados.`;if(visited.size===3){show($('[data-order-step]'));$('[data-order-progress]').textContent='Agora selecione amanhecer, Sol a pino e entardecer.';}}));
 let order=[],attempts=0;
 $$('[data-order-choice]').forEach(b=>b.addEventListener('click',()=>{order.push(b.dataset.orderChoice);b.disabled=true;$('[data-order-progress]').textContent=`${order.length} de 3 posições escolhidas.`;if(order.length===3){if(order.join() === 'dawn,noon,dusk'){show($('[data-interpret-step]'));$('[data-order-progress]').textContent='A ordem acompanha o movimento da luz.';$('[data-interpret-step] input').focus();}else{attempts++;$('[data-order-progress]').textContent=attempts>=2?'Ainda não. Dica: horizonte, céu alto, horizonte oposto.':'A ordem ainda não acompanha o movimento da luz. Observe novamente.';order=[];$$('[data-order-choice]').forEach(x=>x.disabled=false);}}}));
 $('[data-check-solar]').addEventListener('click',()=>{const answer=$('input[name=solar-answer]:checked');if(!answer){$('[data-solar-feedback]').textContent='Escolha uma resposta.';return;}if(answer.value!=='observe'){$('[data-solar-feedback]').textContent='Compare novamente a posição do Sol e o tamanho das sombras.';return;}unlock(keys.solar,'completed');$('[data-solar-feedback]').textContent='Observar, comparar e reconhecer padrões também é uma forma de construir conhecimento.';show($('[data-notebook-reward]'));scrollToNode($('[data-notebook-reward]'));});
 const afterNotebook=()=>{show($('[data-cipher-invite]'));show($('[data-post-return]'));show($('[data-first-reflection]'));};
 $('[data-send-notebook]').addEventListener('click',e=>{unlock(keys.notebook,'unlocked');unlock('sofia-room-unlocked');e.currentTarget.disabled=true;e.currentTarget.textContent='Notebook enviado';$('[data-notebook-status]').textContent='O notebook está disponível entre os objetos da mesa.';toast('Objeto funcional desbloqueado · Notebook de Investigação');afterNotebook();});
 if(has(keys.solar,'completed')){show($('[data-notebook-reward]'));if(has(keys.notebook,'unlocked')){$('[data-send-notebook]').disabled=true;$('[data-send-notebook]').textContent='Notebook enviado';afterNotebook();}}

 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ',code='DUFKH';const savedShift=Number(localStorage.getItem(keys.cipherState));let shift=Number.isFinite(savedShift)?savedShift:0,chosen=[];
 const resetCipherLetters=()=>{chosen=[];$$('[data-cipher-letter]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed','false');});$('[data-cipher-result]').textContent='_ _ _ _ _';$('[data-check-cipher]').disabled=true;};
 const renderAlphabet=(reset=true)=>{$('[data-shift-output]').value=shift;$('[data-shift-output]').textContent=shift;const moved=alphabet.split('').map((_,i)=>alphabet[(i+shift+26)%26]).join(' ');$('[data-alphabet]').textContent=`${alphabet.split('').join(' ')}\n${moved}`;if(reset)resetCipherLetters();unlock(keys.cipherState,String(shift));};
 $('[data-open-cipher]').addEventListener('click',()=>{show($('[data-cipher-game]'),true);unlock(keys.cipherState,String(shift));scrollToNode($('[data-cipher-game]'));});
 $('[data-skip-cipher]').addEventListener('click',()=>{unlock(keys.cipherState,'ignored');scrollToNode($('[data-post-return]'));});
 $('[data-shift-minus]').addEventListener('click',()=>{shift=Math.max(-25,shift-1);renderAlphabet();});$('[data-shift-plus]').addEventListener('click',()=>{shift=Math.min(25,shift+1);renderAlphabet();});renderAlphabet(false);
 $$('[data-cipher-letter]').forEach(button=>button.addEventListener('click',()=>{const expected=code[chosen.length];if(button.dataset.cipherLetter!==expected){$('[data-cipher-status]').textContent=`Procure primeiro a letra ${expected}.`;return;}const index=alphabet.indexOf(expected),decoded=alphabet[(index+shift+26)%26];chosen.push(decoded);button.disabled=true;button.setAttribute('aria-pressed','true');$('[data-cipher-result]').textContent=chosen.join(' ')+' '+Array(5-chosen.length).fill('_').join(' ');$('[data-cipher-status]').textContent=`${chosen.length} de 5 letras decodificadas.`;if(chosen.length===5)$('[data-check-cipher]').disabled=false;}));
 $('[data-check-cipher]').addEventListener('click',()=>{if(shift!==-3||chosen.join('')!=='ARCHE'){$('[data-cipher-status]').textContent='A combinação ainda não revela a palavra. Retorne três casas e clique em D, U, F, K e H.';return;}unlock(keys.cipher,'completed');$('[data-cipher-status]').textContent='D U F K H se transforma em A R C H E: ARCHÊ.';show($('[data-postal-reward]'));scrollToNode($('[data-postal-reward]'));});
 $('[data-collect-postal]').addEventListener('click',e=>{unlock(keys.postal);e.currentTarget.disabled=true;e.currentTarget.textContent='Postal guardado';$('[data-postal-status]').textContent='O postal foi enviado ao Inventário das Missões.';toast('Objeto de missão encontrado · Postal endereçado a Sofia');});
 if(has(keys.cipher,'completed'))show($('[data-postal-reward]'));if(has(keys.postal)){$('[data-collect-postal]').disabled=true;$('[data-collect-postal]').textContent='Postal guardado';}

 $('[data-emblem-find]').addEventListener('click',e=>{unlock(keys.emblem,'collected');unlock('sofia-emblem-escritorio-do-destino','collected');e.currentTarget.disabled=true;e.currentTarget.textContent='Emblema guardado';$('[data-emblem-status]').textContent='O Primeiro Reflexo entrou na coleção.';toast('Emblema conquistado · O Primeiro Reflexo');show($('[data-phone-chat]'));scrollToNode($('[data-phone-chat]'));});
 if(has(keys.emblem,'collected')){$('[data-emblem-find]').disabled=true;$('[data-emblem-find]').textContent='Emblema guardado';show($('[data-phone-chat]'));}

 const messages=[['Caio','Encontrou alguém na Sala 17?'],['Sofia','Só as botas.'],['Bia','Como assim, só as botas?'],['Sofia','O resto da pessoa aparentemente era opcional.'],['Caio','Sofia.'],['Sofia','E a quadra virou Heliópolis.'],['Bia','Você está bem?'],['Sofia','Pergunta em aberto.']];let chatTimer;
 const addMessage=([who,text])=>{const li=document.createElement('li');li.dataset.who=who;const name=document.createElement('small');name.textContent=who;li.append(name,document.createTextNode(text));$('[data-chat-messages]').append(li);li.scrollIntoView({block:'nearest'});};
 const finishChat=()=>{unlock(keys.chat,'seen');$('[data-chat-status]').textContent='Conversa concluída. O arco continua.';show($('[data-room-invitation]'));};
 const showAll=()=>{clearTimeout(chatTimer);$('[data-chat-messages]').replaceChildren();messages.forEach(addMessage);finishChat();};
 $('[data-open-chat]').addEventListener('click',()=>{$('[data-open-chat]').hidden=true;show($('[data-chat-screen]'));let i=0;const next=()=>{if(i>=messages.length){finishChat();return;}addMessage(messages[i++]);chatTimer=setTimeout(next,reduced.matches?0:650);};next();});$('[data-show-all]').addEventListener('click',showAll);
 if(has(keys.chat,'seen')){$('[data-open-chat]').hidden=true;show($('[data-chat-screen]'));showAll();}
}

function initRainPost(){
 const root=$('[data-rain-post]');if(!root)return;
 const completed=key=>has(key,'found')||has(key,'completed')||has(key,'unlocked');
 const reveal=(node,scroll=false)=>{show(node);if(scroll)scrollToNode(node);};

 // Gotas e reflexos da capa usam um canvas transparente somente sobre a área do vidro.
 const cover=$('[data-rain-cover]'),rain=$('[data-window-rain]');
 if(cover&&rain&&!reduced.matches){const ctx=rain.getContext('2d'),drops=Array.from({length:innerWidth<700?18:38},(_,i)=>({x:.23+Math.random()*.68,y:Math.random()*.68,v:.00012+Math.random()*.00018,l:3+Math.random()*10,still:i%7===0}));let frame,last=0;
  const resize=()=>{const r=cover.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);rain.width=r.width*d;rain.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);};resize();addEventListener('resize',resize,{passive:true});
  const draw=t=>{const r=cover.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.lineCap='round';for(let i=0;i<drops.length;i++){const d=drops[i];if(!d.still)d.y+=d.v*Math.min(40,t-last||16);if(d.y>.74){d.y=.02;d.x=.23+Math.random()*.68;}ctx.strokeStyle=`rgba(224,229,255,${d.still?.28:.48})`;ctx.lineWidth=d.still?1.2:1.6;ctx.beginPath();ctx.moveTo(d.x*r.width,d.y*r.height);ctx.lineTo((d.x-.002)*r.width,d.y*r.height+d.l);ctx.stroke();if(i%11===0&&Math.abs(drops[(i+1)%drops.length].x-d.x)<.015)d.l=Math.min(18,d.l+.02);}last=t;frame=requestAnimationFrame(draw);};frame=requestAnimationFrame(draw);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(frame);else{last=0;frame=requestAnimationFrame(draw);}});
 }

 const drops=$$('[data-impossible-drop]'),progress=$('[data-drop-progress]');let found=0;
 const finishDrops=(scroll=true)=>{$('[data-science-notebook]')?.classList.add('is-complete');progress.textContent='4 de 4 fragmentos revelados. Há outra página sob a de Sofia.';reveal($('[data-fragment-discovery]'),scroll);unlock('sofia-post2-drops-found','completed');};
 drops.forEach((drop,index)=>drop.addEventListener('click',()=>{if(drop.classList.contains('is-revealed'))return;drop.classList.add('is-revealed');drop.disabled=true;drop.setAttribute('aria-label',`Fragmento ${index+1} revelado`);found++;const notebook=$('[data-science-notebook]');notebook?.classList.remove('reveal-1','reveal-2','reveal-3');if(found<4)notebook?.classList.add(`reveal-${found}`);progress.textContent=`${found} de 4 fragmentos revelados.${found<4?' Procure a próxima gota.':''}`;if(found===drops.length)setTimeout(()=>finishDrops(),reduced.matches?0:650);}));
 // A descoberta pode ser refeita a cada visita; apenas as recompensas permanecem salvas.

 const soundButton=$('[data-rain-sound]');let audioContext,rainSource,rainGain;
 const stopRain=()=>{rainSource?.stop();rainSource=null;if(audioContext)audioContext.close();audioContext=null;soundButton?.setAttribute('aria-pressed','false');if($('[data-rain-sound-label]'))$('[data-rain-sound-label]').textContent='ouvir a chuva';};
 const startRain=()=>{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){toast('O som da chuva não está disponível neste navegador.');return;}audioContext=new Audio();const seconds=4,buffer=audioContext.createBuffer(2,audioContext.sampleRate*seconds,audioContext.sampleRate);for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(.35+Math.random()*.3);}rainSource=audioContext.createBufferSource();rainSource.buffer=buffer;rainSource.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=1300;rainGain=audioContext.createGain();rainGain.gain.value=.055;rainSource.connect(filter).connect(rainGain).connect(audioContext.destination);rainSource.start();soundButton.setAttribute('aria-pressed','true');$('[data-rain-sound-label]').textContent='silenciar a chuva';};
 soundButton?.addEventListener('click',()=>rainSource?stopRain():startRain());addEventListener('pagehide',stopRain,{once:true});

 const afterFragment=()=>reveal($('[data-after-fragment]'),true);
 $('[data-collect-fragment]')?.addEventListener('click',e=>{const button=e.currentTarget;if(!has('sofia-mission-fragmento-desconhecido','found'))unlock('sofia-mission-fragmento-desconhecido');button.classList.add('is-collected');button.disabled=true;setTimeout(()=>{button.hidden=true;reveal($('[data-fragment-feedback]'));afterFragment();toast('Item encontrado · Fragmento desconhecido');},reduced.matches?0:650);});
 if(has('sofia-mission-fragmento-desconhecido','found')){reveal($('[data-fragment-discovery]'));$('[data-collect-fragment]').hidden=true;reveal($('[data-fragment-feedback]'));reveal($('[data-after-fragment]'));}

 const common=choice=>{reveal($('[data-common-return]'),true);if(choice==='close')$$('[data-close-copy]').forEach(n=>show(n));unlock('sofia-post2-choice',choice);};
 $$('[data-research-choice]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.researchChoice==='close')common('close');else{reveal($('[data-tracks-game]'),true);unlock('sofia-post2-choice','search');}}));
 let selected=[],searches=0;const terms=$$('[data-term]'),run=$('[data-run-search]'),results=$('[data-search-results]');
 const syncTerms=()=>{terms.forEach(b=>b.setAttribute('aria-pressed',String(selected.includes(b.dataset.term))));$('[data-selected-terms]').textContent=selected.length?selected.join(' + '):'Nenhum termo selecionado.';run.disabled=!selected.length;};
 terms.forEach(b=>b.addEventListener('click',()=>{const term=b.dataset.term;if(selected.includes(term))selected=selected.filter(t=>t!==term);else if(selected.length<3)selected.push(term);else{$('[data-selected-terms]').textContent='Escolha no máximo três termos.';return;}syncTerms();}));
 const finishResearch=()=>{unlock('sofia-clue-mileto-post2');unlock('sofia-room-plant-unlocked','unlocked');unlock('sofia-post2-research','completed');reveal($('[data-research-unlocks]'),true);common('search');toast('Conexão encontrada · Mileto');};
 run?.addEventListener('click',()=>{searches++;const set=new Set(selected),specific=(set.has('pirâmide')&&set.has('sombra'))||(set.has('Egito')&&set.has('Nilo'))||(set.has('água')&&set.has('Nilo'));
  let text='Os resultados são amplos demais. Há muitos caminhos possíveis.';if(set.has('pirâmide')&&set.has('sombra'))text='Métodos antigos utilizavam sombras e proporções para realizar medições.';else if(set.has('Egito')&&set.has('Nilo'))text='O Nilo ocupava papel central na vida e na observação da natureza no Egito antigo.';else if(set.has('água')&&set.has('Nilo'))text='A água, os ciclos do Nilo e a observação da natureza aparecem ligados a antigas investigações.';else if(set.has('medida'))text='Medições antigas aproximavam observação, sombra e proporção.';
  $('[data-explorer-empty]')?.remove();const article=document.createElement('article');article.className='search-result';article.innerHTML=`<strong>${selected.join(' + ')}</strong><p>${text}</p>`;results.prepend(article);selected=[];syncTerms();if(specific&&searches>=2)$('[data-finish-search]').hidden=false;else if(searches>=3)$('[data-finish-search]').hidden=false;});
 $('[data-finish-search]')?.addEventListener('click',finishResearch);if(completed('sofia-post2-research')){reveal($('[data-research-unlocks]'));reveal($('[data-common-return]'));}

 const envelope=$('[data-envelope]'),peek=$('[data-letter-peek]'),modal=$('[data-invitation-modal]');let envelopeStep=0;
 envelope?.addEventListener('click',()=>{if(envelopeStep===0){envelopeStep=1;envelope.classList.add('is-focused');$('[data-envelope-prompt]').textContent='Toque no lacre';envelope.setAttribute('aria-label','Romper o lacre do envelope');return;}envelope.classList.add('is-breaking');setTimeout(()=>{envelope.hidden=true;reveal(peek,true);},reduced.matches?0:550);});
 peek?.addEventListener('click',()=>modal?.showModal());modal?.addEventListener('close',()=>{unlock('sofia-mission-convite-fieis');unlock('sofia-document-convite-fieis');reveal($('[data-sofia-reaction]'),true);toast('Documento guardado · Convite dos Fiéis da Coruja');});
 if(has('sofia-mission-convite-fieis','found')){envelope.hidden=true;reveal(peek);reveal($('[data-sofia-reaction]'));}
}
initSala17();initRainPost();
})();
