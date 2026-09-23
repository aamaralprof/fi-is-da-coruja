(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const set=(k,v='completed')=>localStorage.setItem(k,v), get=k=>localStorage.getItem(k);
  const reveal=n=>{if(!n)return;n.hidden=false;};
  const toast=message=>{const n=$('[data-p4-toast]');n.textContent=message;n.hidden=false;clearTimeout(n._timer);n._timer=setTimeout(()=>n.hidden=true,3200)};
  const scroll=n=>n?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});

  const research={
    carta:{title:'A carta e o nome escrito nela',label:'Atenas',image:'assets/arco2/convite-fieis-original.jpeg',alt:'Convite original recebido por Sofia',html:'<p><strong>Atenas</strong> é o nome da cidade grega historicamente associada à deusa Atena. No convite, a referência aparece na frase “Atenas, sob os auspícios da deusa da sabedoria”. Isso ajuda a compreender o nome, mas não identifica a mulher com quem Sofia conversou.</p><p class="sofia-line">— Interessante. Isso explica o nome. Não explica a pessoa.</p>',record:'ATENAS → qual é a relação com a mulher?'},
    sisifo:{title:'Sísifo',label:'Sísifo',image:'assets/arco2/post4/rabiscos.png',alt:'Rabiscos de Sofia com uma representação de Sísifo destacada entre outras pistas',html:'<p>Sísifo é uma figura da mitologia grega associada à punição de empurrar uma enorme pedra montanha acima, apenas para vê-la retornar, obrigando-o a recomeçar.</p><p class="sofia-line">— Por que alguém escolheria o nome de um sujeito condenado a empurrar uma pedra para sempre?</p>',record:'SÍSIFO — por que esse nome?'},
    coruja:{title:'A coruja',label:'coruja e Atena',image:'assets/arco2/post4/rabiscos.png',alt:'Rabiscos de Sofia, incluindo uma coruja e referências mitológicas',html:'<p>Na tradição grega, a coruja é frequentemente associada a Atena e a ideias de sabedoria, atenção e observação. Uma associação simbólica não é uma identificação.</p><p class="sofia-line">— Ah. Essa eu devia ter pesquisado há umas três semanas.</p>',record:'CORUJA → ATENA?'},
    mulheres:{title:'Três mulheres e o destino',label:'três mulheres',image:'assets/arco2/post4/rabiscos.png',alt:'Rabiscos com três figuras femininas ligadas por um fio',html:'<p>Uma possibilidade mitológica são as <strong>Moiras</strong>, três figuras ligadas ao fio da vida e ao destino. A semelhança não prova que as mulheres vistas por Sofia sejam elas.</p><p class="sofia-line">— Três mulheres que decidem o destino das pessoas. Espero sinceramente que seja coincidência.</p>',record:'TRÊS MULHERES → MOIRAS?'},
    cores:{title:'Preto e roxo',label:'cores recorrentes',image:'assets/arco2/post4/rabiscos.png',alt:'Rabiscos de Sofia reunindo pistas, símbolos e referências à Ordem',html:'<p>Sofia lembra de duas aparições diferentes: um menino aparentemente usando uniforme preto e roxo e uma pessoa usando manto preto e roxo. As cores se repetem; a relação entre as pessoas permanece desconhecida.</p><p class="sofia-line">— Pesquisar “menino de uniforme preto e roxo” não foi exatamente meu momento mais brilhante.</p>',record:'MENINO + MANTO → MESMAS CORES?'},
    lugares:{title:'Heliópolis e Mileto',label:'dois lugares',image:'assets/arco2/post4/mapa-heliopolis-mileto.png',alt:'Mapa ilustrado com Heliópolis e Mileto',html:'<p>Heliópolis, no Egito, reuniu tradições de observação do céu, do tempo e da ordem do mundo. Mileto, na Ásia Menor, ficou ligada a investigações sobre a natureza e seus princípios. São tradições distintas, mas ambas formularam perguntas sobre o mundo.</p>',record:'POR QUE COMEÇARAM POR ESSES DOIS LUGARES?'}
  };
  const researchDialog=$('[data-research-dialog]'), researchContent=$('[data-research-content]');
  const completedResearch=()=>Object.keys(research).filter(k=>get('sofia-post4-research-'+k)==='completed');
  function renderResearch(){
    const done=completedResearch();
    $$('[data-research]').forEach(b=>{const ok=done.includes(b.dataset.research);b.classList.toggle('is-done',ok);b.setAttribute('aria-pressed',String(ok));});
    $('[data-research-progress]').textContent=`${done.length} de 6 pesquisas registradas.${done.length<4?' Conclua mais '+(4-done.length)+' para abrir o caderno.':''}`;
    if(done.length>=4){reveal($('[data-notebook-step]'));set('sofia-post4-research-essential');}
  }
  $$('[data-research]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.research, item=research[id];
    $('[data-search-label]').textContent=item.label;
    researchContent.dataset.topic=id;
    const focus=['sisifo','mulheres','coruja'].includes(id)?'<span class="research-focus" aria-hidden="true"></span>':'';
    researchContent.innerHTML=`<p class="eyebrow">resultado preparado</p><h2 id="research-title">${item.title}</h2><div class="research-visual-wrap"><img class="research-visual" src="${item.image}" alt="${item.alt}">${focus}</div>${item.html}<p class="research-record"><strong>Registro liberado</strong><br>${item.record}</p>`;
    set('sofia-post4-research-'+id); renderResearch(); researchDialog.showModal(); toast('Anotação liberada · '+item.label);
  }));
  $('[data-close-research]').addEventListener('click',()=>researchDialog.close());

  const puzzleDialog=$('[data-puzzle-dialog]'), puzzleGrid=$('[data-puzzle-grid]'), puzzleRevealButton=$('[data-reveal-order]');
  const puzzleSource=new Image();
  const puzzleSourceReady=new Promise(resolve=>{puzzleSource.addEventListener('load',resolve,{once:true});puzzleSource.addEventListener('error',resolve,{once:true})});
  puzzleSource.src='assets/arco2/post4/sisifo-mitologico.png';
  let puzzleOrder=[8,2,5,1,7,0,4,6,3], selectedPiece=null;
  function playOrderReveal(){
    if(!puzzleDialog.open)return;
    const status=$('[data-puzzle-status]');
    if(!puzzleOrder.every((v,i)=>v===i)){status.textContent='A montagem ainda não está correta. Continue trocando as peças.';return}
    puzzleGrid.classList.add('is-order-reveal');
    status.textContent='Registro revelado: Sísifo da Ordem.';
    puzzleRevealButton.disabled=true;
    puzzleRevealButton.textContent='Sísifo da Ordem revelado';
  }
  function drawPuzzle(){
    puzzleGrid.querySelectorAll('.puzzle-piece').forEach(piece=>piece.remove());
    let orderImage=puzzleGrid.querySelector('.puzzle-order-reveal');
    if(!orderImage){orderImage=document.createElement('img');orderImage.className='puzzle-order-reveal';orderImage.src='assets/arco2/post4/sofia-sisifo.png';orderImage.alt='';orderImage.decoding='async';orderImage.setAttribute('aria-hidden','true');puzzleGrid.append(orderImage)}
    puzzleOrder.forEach((source,index)=>{const b=document.createElement('button');b.type='button';b.className='puzzle-piece';b.dataset.index=index;b.dataset.source=source;b.draggable=true;b.setAttribute('aria-label',`Peça ${index+1}, posição atual ${source+1}`);b.style.backgroundPosition=`${(source%3)*50}% ${Math.floor(source/3)*50}%`;puzzleGrid.insertBefore(b,orderImage)});
    if(puzzleOrder.every((v,i)=>v===i)){ $$('[data-puzzle-grid] button').forEach(b=>b.classList.add('is-solved')); set('sofia-post4-puzzle-sisifo'); puzzleRevealButton.textContent='Revelar o registro da Ordem'; $('[data-puzzle-status]').textContent='Imagem reconstruída. Há outro registro escondido aqui.'; toast('Imagem de Sísifo reconstruída'); }
  }
  function swap(a,b){[puzzleOrder[a],puzzleOrder[b]]=[puzzleOrder[b],puzzleOrder[a]];selectedPiece=null;drawPuzzle()}
  async function openPuzzle(launchButton){const originalLabel=launchButton.textContent;launchButton.disabled=true;launchButton.textContent='Carregando peças…';await puzzleSourceReady;researchDialog.close();puzzleGrid.classList.remove('is-order-reveal');puzzleRevealButton.disabled=false;puzzleRevealButton.textContent='Conferir montagem';puzzleOrder=get('sofia-post4-puzzle-sisifo')?[0,1,2,3,4,5,6,7,8]:puzzleOrder;drawPuzzle();puzzleDialog.showModal();launchButton.disabled=false;launchButton.textContent=originalLabel}
  $$('[data-open-puzzle]').forEach(button=>button.addEventListener('click',()=>openPuzzle(button)));
  puzzleRevealButton.addEventListener('click',playOrderReveal);
  puzzleGrid.addEventListener('click',e=>{const b=e.target.closest('.puzzle-piece');if(!b||get('sofia-post4-puzzle-sisifo'))return;const i=+b.dataset.index;if(selectedPiece===null){selectedPiece=i;b.classList.add('is-selected');$('[data-puzzle-status]').textContent='Agora selecione a peça que deve trocar de lugar.'}else swap(selectedPiece,i)});
  puzzleGrid.addEventListener('dragstart',e=>{const b=e.target.closest('.puzzle-piece');if(b)e.dataTransfer.setData('text/plain',b.dataset.index)});
  puzzleGrid.addEventListener('dragover',e=>e.preventDefault());
  puzzleGrid.addEventListener('drop',e=>{e.preventDefault();const b=e.target.closest('.puzzle-piece'),from=+e.dataTransfer.getData('text/plain');if(b&&!Number.isNaN(from))swap(from,+b.dataset.index)});
  $('[data-close-puzzle]').addEventListener('click',()=>{puzzleGrid.classList.remove('is-order-reveal');puzzleDialog.close()});

  const memories=[['aparicoes','Acontecimentos estranhos · Arco I'],['heliopolis','Heliópolis'],['mileto','Mileto'],['convite','Convite'],['iniciacao','Iniciação']];
  let timeline=[],timelineHistory=[],selectedMemory=null;
  function drawTimeline(){
    const pool=$('[data-timeline-pool]'),slots=$('[data-timeline-slots]');pool.innerHTML='';slots.innerHTML='';
    memories.filter(([id])=>!timeline.includes(id)).forEach(([id,text])=>{const b=document.createElement('button');b.type='button';b.className='memory-card'+(selectedMemory===id?' is-selected':'');b.dataset.memory=id;b.textContent=text;pool.append(b)});
    for(let i=0;i<5;i++){const li=document.createElement('li');const b=document.createElement('button');b.type='button';b.className='timeline-slot';b.dataset.slot=i;b.dataset.label=(i+1)+'ª posição';const id=timeline[i];if(id)b.textContent=memories.find(m=>m[0]===id)[1];li.append(b);slots.append(li)}
    $('[data-timeline-undo]').disabled=!timelineHistory.length;$('[data-timeline-check]').disabled=timeline.length!==5;
  }
  $('[data-timeline-pool]').addEventListener('click',e=>{const b=e.target.closest('[data-memory]');if(!b)return;selectedMemory=b.dataset.memory;drawTimeline()});
  $('[data-timeline-slots]').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b)return;const position=+b.dataset.slot;timelineHistory.push([...timeline]);if(selectedMemory){timeline.splice(position,0,selectedMemory);timeline=timeline.slice(0,5);selectedMemory=null}else if(timeline[position]){selectedMemory=timeline[position];timeline.splice(position,1)}drawTimeline()});
  $('[data-timeline-undo]').addEventListener('click',()=>{timeline=timelineHistory.pop()||[];selectedMemory=null;drawTimeline()});
  $('[data-timeline-check]').addEventListener('click',()=>{const correct=memories.map(m=>m[0]).every((id,i)=>timeline[i]===id);if(!correct){$('[data-timeline-status]').textContent='Algumas lembranças ainda estão fora de ordem. Reorganize e tente de novo.';return}set('sofia-post4-timeline');$('[data-timeline-status]').textContent='Ótimo. Agora os acontecimentos absurdos estão em ordem cronológica.';reveal($('[data-chronology-question]'));toast('Linha do tempo organizada')});
  $$('[data-chronology]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.chronology!=='b'){$('[data-chronology-feedback]').textContent='A sequência não confirma isso. Observe o que aconteceu antes do convite.';return}set('sofia-post4-chronology');$('[data-chronology-feedback]').innerHTML='<strong>ISSO COMEÇOU ANTES DO CONVITE.</strong><br>A cronologia mostra quando os acontecimentos começaram, mas ainda não explica quem os organizou ou por quê.<br><em>Então por que me convidaram só depois?</em>';reveal($('[data-notes-step]'));scroll($('[data-notes-step]'))}));

  const notes=[['menino','Vi um menino usando preto e roxo.','fato'],['manto','Vi uma figura usando manto preto e roxo.','fato'],['ligacao','As duas pessoas podem ter alguma ligação.','hipotese'],['tres','Vi três mulheres juntas.','fato'],['moiras','As mulheres podem ser as Moiras.','hipotese'],['sisifo','Conheci alguém chamado Sísifo.','fato'],['codinome','Sísifo pode ser um codinome.','hipotese'],['motivo','Sei por que fui convidada para a Ordem.','duvida']];
  let noteIndex=0;
  function drawNote(){const done=get('sofia-post4-notes');if(done){$('[data-note-deck]').innerHTML='<div class="classification-card">Observações separadas de hipóteses.<br>As perguntas continuam abertas.</div>';$('[data-notes-feedback]').textContent=`${notes.length} de ${notes.length} classificados.`;reveal($('[data-map-step]'));return}const n=notes[noteIndex];$('[data-note-deck]').innerHTML=`<div class="classification-card">${n[1]}</div>`;$('[data-notes-feedback]').textContent=`${noteIndex} de ${notes.length} classificados.`}
  $$('[data-category]').forEach(b=>b.addEventListener('click',()=>{const n=notes[noteIndex];if(!n)return;if(b.dataset.category!==n[2]){$('[data-notes-feedback]').textContent=n[2]==='fato'?'Sofia presenciou isso: é uma observação.':n[2]==='hipotese'?'Há uma pista, mas não uma confirmação.':'Ainda não há elementos para afirmar isso.';return}noteIndex++;if(noteIndex===notes.length){set('sofia-post4-notes');toast('Post-its organizados');drawNote();scroll($('[data-map-step]'))}else drawNote()}));

  const seenPlaces=new Set();
  $$('[data-place]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.place;seenPlaces.add(id);b.classList.add('is-seen');reveal($(`[data-place-note="${id}"]`));if(seenPlaces.size===2){$('[data-connect]').disabled=false;$('[data-map-status]').textContent='Os dois lugares foram examinados. A rota pode ser conectada.'}}));
  $('[data-connect]').addEventListener('click',()=>{$('.map-stage').classList.add('is-connected');set('sofia-post4-map');$('[data-map-status]').textContent='Não são as mesmas perguntas. Mas também não parecem tão distantes. POR QUE COMEÇARAM POR ESSES DOIS LUGARES?';reveal($('[data-final-step]'));setTimeout(()=>scroll($('[data-final-step]')),300)});
  $('[data-collect-reward]').addEventListener('click',()=>{if(!get('sofia-clue-anotacoes-organizadas')){set('sofia-clue-anotacoes-organizadas','found');set('sofia-post4-completed');toast('Nova pista adicionada ao Caderno de Pistas')}reveal($('[data-reward]'));$('[data-collect-reward]').disabled=true;$('[data-collect-reward]').textContent='Página adicionada ao Caderno de Pistas'});

  function restore(){
    renderResearch(); drawTimeline(); drawNote();
    if(get('sofia-post4-timeline')){timeline=memories.map(m=>m[0]);drawTimeline();reveal($('[data-chronology-question]'))}
    if(get('sofia-post4-chronology'))reveal($('[data-notes-step]'));
    if(get('sofia-post4-notes'))reveal($('[data-map-step]'));
    if(get('sofia-post4-map')){$('.map-stage').classList.add('is-connected');reveal($('[data-final-step]'))}
    if(get('sofia-clue-anotacoes-organizadas')){reveal($('[data-reward]'));$('[data-collect-reward]').disabled=true;$('[data-collect-reward]').textContent='Página adicionada ao Caderno de Pistas'}
  }
  restore();
})();
