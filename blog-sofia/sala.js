/* Sala persistente: perspectivas, decoração por zonas e mural de pistas. */
(async function(){
'use strict';
const $=id=>document.getElementById(id), D=window.Investigacao;
/* A Área do Professor injeta window.SalaContexto antes deste arquivo e a Sala
   passa a desenhar outro estado que não o de quem está com o passaporte. É a
   mesma Sala do aluno — mesma marcação, mesmo CSS, mesma lógica. O contexto
   pode ser uma promessa: quem o monta precisa buscar a Sala antes de responder.

   São dois modos, e a diferença entre eles é o que se pode tocar:

     leitura  a Sala de um aluno. Não se mexe em nada: é o trabalho dele.
     bancada  a Sala Geral. Mexe-se à vontade, porque não é de ninguém.

   O que os dois têm em comum é não gravar. Visitar nunca escreve — nem no
   servidor, nem no rascunho local. A bancada volta ao padrão ao recarregar. */
const ctx=await (window.SalaContexto||null);
const visita=!!ctx, leitura=visita&&ctx.modo==='leitura', bancada=visita&&ctx.modo==='bancada';
/* De onde vêm os desbloqueios. Visitando, do contexto injetado; no uso normal,
   do localStorage de quem está com o passaporte aberto. */
const progresso=chave=>visita?(ctx.chaves&&ctx.chaves[chave])||null:localStorage.getItem(chave);
if(visita)D.ler=progresso;
if(leitura)document.body.classList.add('sala-leitura');
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const status=message=>{$('save-status').textContent=message;};
const views=['overview','shelf','desk','board'];
const viewData={
 overview:{title:'Atmosfera da sala',description:'Escolha uma área para se aproximar ou mude a atmosfera.',scene:'assets/sala/sala-geral.png',alt:'Visão geral da Sala de Investigação'},
 shelf:{title:'Objetos da estante',description:'Arraste livros e a caixa Ideias entre as prateleiras.',scene:'assets/sala/sala-estante.png',alt:'Estante e janela da Sala de Investigação',bounds:{xMin:4,xMax:45,yMin:7,yMax:80}},
 desk:{title:'Objetos da mesa',description:'Arraste os objetos pela mesa. Toque nos objetos interativos para usá-los.',scene:'assets/sala/sala-mesa.png',alt:'Mesa e mural da Sala de Investigação',bounds:{xMin:19,xMax:88,yMin:34,yMax:58}},
 board:{title:'Mural de pistas',description:'Organize pistas, aproxime ideias e trace conexões.',scene:'assets/sala/sala-mesa.png',alt:'Mural da Sala de Investigação'}
};
const roomItems=[
 {id:'luminaria_sofia',name:'Luminária',view:'desk',image:'assets/sala/luminaria.png',sprite:'lamp',states:['off','on'],action:{off:'Acender',on:'Apagar'},x:69,y:38,w:12,ratio:.58},
 {id:'caneca_sofia',name:'Caneca lilás',view:'desk',image:'assets/sala/caneca.png',x:58,y:50,w:5,ratio:1},
 {id:'caderno_sofia',name:'Caderno da Sofia',view:'desk',image:'assets/sala/caderno.png',x:42,y:48,w:16,ratio:1.45},
 {id:'porta_lapis_sofia',name:'Porta-lápis',view:'desk',image:'assets/sala/porta-lapis.png',x:79,y:44,w:7,ratio:.91},
 {id:'livro_filosofia',name:'Filosofia',view:'shelf',image:'assets/sala/livros.png',sprite:'book-filosofia',x:12,y:11,w:6,ratio:.5},
 {id:'livro_historia',name:'História',view:'shelf',image:'assets/sala/livros.png',sprite:'book-historia',x:23,y:31,w:6,ratio:.5},
 {id:'livro_literatura',name:'Literatura',view:'shelf',image:'assets/sala/livros.png',sprite:'book-literatura',x:34,y:50,w:6,ratio:.5},
 {id:'caixa_ideias',name:'Caixa Ideias',view:'shelf',image:'assets/sala/caixa-ideias.png',sprite:'box',states:['closed','open'],action:{closed:'Abrir caixa',open:'Fechar caixa'},x:18,y:65,w:13,ratio:.66}
];
if(progresso('sofia-room-notebook-unlocked')==='unlocked')roomItems.push({id:'notebook_investigacao',name:'Notebook de Investigação',view:'desk',image:'assets/resultado-caminho-do-espelho.png',x:28,y:38,w:18,ratio:1.4});
if(progresso('sofia-room-plant-unlocked')==='unlocked')roomItems.push({id:'planta_investigacao',name:'Pequena planta',view:'desk',image:'assets/sala/planta-broto.png',stateImages:{broto:'assets/sala/planta-broto.png',pequena:'assets/sala/planta-pequena.png',desenvolvida:'assets/sala/planta-desenvolvida.png',florida:'assets/sala/planta-florida.png',sede:'assets/sala/planta-com-sede.png'},states:['broto','pequena','desenvolvida','florida','sede'],action:{broto:'Regar',pequena:'Regar',desenvolvida:'Regar',florida:'Regar',sede:'Regar e recuperar'},x:50,y:34,w:11,ratio:.78,plant:true});
const itemById=id=>roomItems.find(i=>i.id===id);
const blueAssets={caderno_sofia:'assets/sala/caderno-sofia-2.png',livro_filosofia:'assets/sala/livros-sofia-2.png',livro_historia:'assets/sala/livros-sofia-2.png',livro_literatura:'assets/sala/livros-sofia-2.png',caixa_ideias:'assets/sala/caixa-ideias-sofia-2.png'};
const assetFor=d=>d.stateImages?d.stateImages[state?.roomItems?.[d.id]?.state]||d.image:state?.appearance?.pack==='sofia2'&&blueAssets[d.id]?blueAssets[d.id]:d.image;
const defaults=()=>({appearance:{pack:'sofia',rug:true,lights:'on'},roomItems:{},paineis:{}});
const normalize=s=>{
 s=s||{};s.appearance=s.appearance||{rug:true,lights:'on'};s.appearance.pack=s.appearance.pack||'sofia';s.roomItems=s.roomItems||{};s.paineis=s.paineis||{};
 for(const d of roomItems)if(!s.roomItems[d.id])s.roomItems[d.id]={x:d.x,y:d.y,state:d.states?.[0]||'default',placed:true};
 return s;
};
if(!visita){
 await Percurso.pronto;
 if(!Percurso.aberto()){
  $('room-gate').replaceChildren(el('p','Abra seu passaporte para entrar na sua Sala.'));const a=el('a','Abrir passaporte →');a.href='entrar.html';$('room-gate').append(a);status('Passaporte fechado.');return;
 }
}
const owner=visita?ctx.codigo:Percurso.codigo(),draftKey='sala-rascunho:'+owner;
/* Quem visita não precisa ter desbloqueado a própria Sala para ver a de outro. */
if(!visita&&!progresso('sofia-room-unlocked')){
 $('room-gate').replaceChildren(el('p','Sua Sala aparece quando você encontra as primeiras pistas de Heliópolis.'));const a=el('a','Ir para Heliópolis →');a.href=D.casos.heliopolis.post;$('room-gate').append(a);status('Uma descoberta está esperando.');return;
}
let state,revision=0,dirty=false,saving=false,conflict=false,timer,view='overview',selectedRoom=null,selected=null,examined=null;
let current=new URLSearchParams(location.search).get('caso');
const emptyPanel=()=>({itens:[],ligacoes:[],nota:'',conclusao:''});
const panel=()=>state.paineis[current]||(state.paineis[current]=emptyPanel());
let remote;
if(visita)remote={estado:ctx.estado,revisao:ctx.revisao||0};
else try{remote=await Percurso.requisitar('sala');}catch(e){$('room-gate').textContent='Não foi possível abrir sua Sala. '+e.message;const b=el('button','Tentar novamente');b.onclick=()=>location.reload();$('room-gate').append(b);status('A Sala ainda não foi carregada.');return;}
state=normalize(remote.estado||defaults());revision=remote.revisao;
if(!visita)try{const draft=JSON.parse(localStorage.getItem(draftKey));if(draft){state=normalize(draft.estado);dirty=true;if(draft.revisao!==revision){conflict=true;status('Há um rascunho neste aparelho e outra versão salva. Seu rascunho foi preservado.');$('reload-room').hidden=false;}else status('Rascunho recuperado. Tentando salvar…');}}catch{}
/* Em leitura, um painel já preenchido também conta: se o aluno organizou um
   caso, a professora precisa vê-lo mesmo que o desbloqueio tenha mudado. */
const cases=Object.entries(D.casos).filter(([k,c])=>progresso(c.chave)||(visita&&state.paineis[k]));
if(!cases.some(([k])=>k===current))current=progresso(D.casos.tales.chave)?'tales':'heliopolis';
for(const [k,c] of cases){const o=el('option',c.nome);o.value=k;$('case-select').append(o);}
$('room-gate').hidden=true;$('room-content').hidden=false;
if(leitura){
 /* Tudo o que altera o estado do aluno sai da tela. O Arquivo continua, porque
    só mostra; e as duas escritas ficam legíveis, porque são o que ela veio ler. */
 for(const id of ['customization','selection','retry-save','reload-room','place-item','conclude'])$(id).hidden=true;
 $('note').readOnly=true;$('conclusion').readOnly=true;
}
/* Na bancada a personalização fica inteira. Some só o que promete guardar:
   ninguém deve apertar "Guardar minha conclusão" e achar que guardou. */
if(bancada)for(const id of ['retry-save','reload-room','conclude'])$(id).hidden=true;
if(visita)status(ctx.rotulo||'Somente leitura.');
else if(!remote.estado&&!dirty)status('Sua Sala está pronta para ser personalizada.');else if(!dirty)status('Tudo salvo no seu passaporte.');
function cache(){if(visita)return;try{localStorage.setItem(draftKey,JSON.stringify({estado:state,revisao:revision}));}catch{status('Não foi possível guardar o rascunho neste aparelho.');}}
function change(){if(visita)return;dirty=true;cache();if(!conflict)status('Guardando suas mudanças…');clearTimeout(timer);timer=setTimeout(save,800);}
async function save(){if(visita||!dirty||saving||conflict)return;if(Percurso.codigo()!==owner){status('O passaporte mudou. Reabra a Sala.');return;}saving=true;const snapshot=JSON.stringify(state);try{const r=await Percurso.requisitar('sala',{method:'POST',body:JSON.stringify({estado:JSON.parse(snapshot),revisao:revision})});revision=r.revisao;dirty=JSON.stringify(state)!==snapshot;if(dirty)cache();else localStorage.removeItem(draftKey);status(dirty?'Guardando a próxima mudança…':'Tudo salvo no seu passaporte.');$('retry-save').hidden=true;}catch(e){status(e.message);$('retry-save').hidden=e.status===409;conflict=e.status===409;if(conflict)$('reload-room').hidden=false;cache();}finally{saving=false;}if(dirty&&!conflict&&$('retry-save').hidden)timer=setTimeout(save,800);}
$('retry-save').onclick=save;$('reload-room').onclick=()=>{localStorage.setItem('sala-copia:'+owner+':'+Date.now(),JSON.stringify(state));localStorage.removeItem(draftKey);dirty=false;location.reload();};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});window.addEventListener('online',save);

function setView(next){view=next;selectedRoom=null;const meta=viewData[view];$('room-stage').dataset.view=view;$('room-stage').dataset.pack=state.appearance.pack;$('package-select').value=state.appearance.pack;$('scene').src=meta.scene;$('scene').alt=meta.alt;$('view-description').textContent=meta.description;$('customization-title').textContent=meta.title;$('hotspots').hidden=view!=='overview';$('overview-decor').hidden=view!=='overview';$('board-layer').hidden=view!=='board';$('case-question-wrap').hidden=view!=='board';$('selection').hidden=true;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));renderRoom();renderTray();if(view==='board'){renderCase();requestAnimationFrame(drawLines);}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
$('previous-view').onclick=()=>setView(views[(views.indexOf(view)+views.length-1)%views.length]);$('next-view').onclick=()=>setView(views[(views.indexOf(view)+1)%views.length]);
function roomPosition(n,s){n.style.left=s.x+'%';n.style.top=s.y+'%';}
function selectRoom(id){selectedRoom=id;document.querySelectorAll('.room-item').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.id===id)));const d=itemById(id),s=state.roomItems[id];$('selected-controls').hidden=!d;if(!d)return;$('selected-item-name').textContent=d.name;$('toggle-item-state').hidden=!d.states;if(d.states)$('toggle-item-state').textContent=d.action[s.state];}
function toggleState(id){if(leitura)return;const d=itemById(id),s=state.roomItems[id];if(!d?.states)return;if(d.plant){const now=Date.now(),last=Number(s.lastWatered||0);if(now-last<21600000&&s.state!=='sede'){status('A planta ainda está bem regada. Volte mais tarde.');return;}s.lastWatered=now;s.state=s.state==='sede'?'florida':d.states[Math.min(3,Math.max(0,d.states.indexOf(s.state))+1)];status(s.state==='florida'?'A planta floresceu.':'A planta recebeu água.');}else s.state=d.states[(d.states.indexOf(s.state)+1)%d.states.length];renderRoom();selectRoom(id);change();}
function renderRoom(){const host=$('placed-items');host.replaceChildren();$('room-stage').dataset.pack=state.appearance.pack;$('rug').src=state.appearance.pack==='sofia2'?'assets/sala/tapete-sofia-2.png':'assets/sala/tapete-retangular.png';$('rug').hidden=!state.appearance.rug;$('lights').dataset.state=state.appearance.lights;for(const d of roomItems.filter(i=>i.view===view)){const s=state.roomItems[d.id];if(!s.placed)continue;const n=el('button');n.type='button';n.className='room-item';n.dataset.id=d.id;n.dataset.state=s.state;n.dataset.recolored=String(!!blueAssets[d.id]);if(d.sprite)n.dataset.sprite=d.sprite;n.style.setProperty('--item-image',`url('${assetFor(d)}')`);n.style.setProperty('--item-w',d.w+'%');n.style.setProperty('--item-ratio',d.ratio);n.setAttribute('aria-label',d.name+(d.states?'. '+d.action[s.state]+'.':'')+(leitura?'':' Arraste ou use as setas para mover.'));n.setAttribute('aria-pressed',String(d.id===selectedRoom));roomPosition(n,s);host.append(n);if(leitura){n.tabIndex=-1;continue;}let drag=null,moved=false;n.onpointerdown=e=>{if(e.button!==0)return;selectRoom(d.id);drag={clientX:e.clientX,clientY:e.clientY,x:s.x,y:s.y,id:e.pointerId};moved=false;n.setPointerCapture(e.pointerId);};n.onpointermove=e=>{if(!drag)return;const rect=$('room-stage').getBoundingClientRect(),dx=(e.clientX-drag.clientX)/rect.width*100,dy=(e.clientY-drag.clientY)/rect.height*100;if(Math.abs(dx)+Math.abs(dy)>1)moved=true;s.x=Math.max(0,Math.min(100-d.w,drag.x+dx));s.y=Math.max(0,Math.min(88,drag.y+dy));roomPosition(n,s);};n.onpointerup=n.onpointercancel=e=>{if(!drag)return;n.releasePointerCapture?.(drag.id);drag=null;if(moved)change();else if(d.states)toggleState(d.id);};n.onkeydown=e=>{const step={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!step)return;e.preventDefault();selectRoom(d.id);s.x=Math.max(0,Math.min(100-d.w,s.x+step[0]));s.y=Math.max(0,Math.min(88,s.y+step[1]));roomPosition(n,s);change();};}}
function trayButton(text,thumb,pressed,onclick){const b=el('button',text);b.type='button';b.className='tray-item';b.style.setProperty('--thumb',`url('${thumb}')`);b.setAttribute('aria-pressed',String(pressed));b.onclick=onclick;return b;}
function renderTray(){const tray=$('item-tray');tray.replaceChildren();$('selected-controls').hidden=true;if(leitura)return;if(view==='overview'){const rugAsset=state.appearance.pack==='sofia2'?'assets/sala/tapete-sofia-2.png':'assets/sala/tapete-retangular.png';const rug=trayButton(state.appearance.pack==='sofia2'?'Tapete azul':'Tapete lilás',rugAsset,state.appearance.rug,()=>{state.appearance.rug=!state.appearance.rug;renderRoom();renderTray();change();});const lights=trayButton('Cordão de luzes','assets/sala/cordao-luzes.png',state.appearance.lights==='on',()=>{state.appearance.lights=state.appearance.lights==='on'?'off':'on';renderRoom();renderTray();change();});tray.append(rug,lights);return;}if(view==='board'){tray.append(el('p','As pistas disponíveis ficam no Arquivo.'));return;}for(const d of roomItems.filter(i=>i.view===view)){const s=state.roomItems[d.id];tray.append(trayButton(d.name,assetFor(d),s.placed,()=>{s.placed=!s.placed;selectedRoom=s.placed?d.id:null;renderRoom();renderTray();change();}));}if(selectedRoom)selectRoom(selectedRoom);}
document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{if(!selectedRoom)return;const d=itemById(selectedRoom),s=state.roomItems[selectedRoom],[dx,dy]=b.dataset.nudge.split(',').map(Number);s.x=Math.max(0,Math.min(100-d.w,s.x+dx));s.y=Math.max(0,Math.min(88,s.y+dy));renderRoom();selectRoom(d.id);change();});
$('toggle-item-state').onclick=()=>selectedRoom&&toggleState(selectedRoom);$('remove-room-item').onclick=()=>{if(!selectedRoom)return;state.roomItems[selectedRoom].placed=false;selectedRoom=null;renderRoom();renderTray();change();};
$('package-select').onchange=()=>{state.appearance.pack=$('package-select').value;renderRoom();renderTray();change();};
$('reset-view').onclick=()=>{if(view==='overview')state.appearance={...state.appearance,rug:true,lights:'on'};else for(const d of roomItems.filter(i=>i.view===view))state.roomItems[d.id]={x:d.x,y:d.y,state:d.states?.[0]||'default',placed:true};selectedRoom=null;renderRoom();renderTray();change();};

function available(){return D.itens.filter(i=>D.disponivel(i));}function clue(id){return D.itens.find(i=>i.id===id);}
function drawLines(){const svg=$('threads');svg.replaceChildren();for(const [a,b]of panel().ligacoes){const na=document.querySelector('[data-clue="'+a+'"]'),nb=document.querySelector('[data-clue="'+b+'"]');if(!na||!nb)continue;const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',na.offsetLeft+na.offsetWidth/2);l.setAttribute('y1',na.offsetTop+na.offsetHeight/2);l.setAttribute('x2',nb.offsetLeft+nb.offsetWidth/2);l.setAttribute('y2',nb.offsetTop+nb.offsetHeight/2);svg.append(l);}}
function cluePosition(n,i){n.style.left=(i.x/100*Math.max(0,$('board').clientWidth-n.offsetWidth))+'px';n.style.top=(i.y/100*Math.max(0,$('board').clientHeight-n.offsetHeight))+'px';}
function moveClue(i,x,y){i.x=Math.max(0,Math.min(100,x));i.y=Math.max(0,Math.min(100,y));const n=document.querySelector('[data-clue="'+i.id+'"]');if(n)cluePosition(n,i);drawLines();$('move-x').value=i.x;$('move-y').value=i.y;}
function chooseClue(id){if(leitura)return;selected=id;document.querySelectorAll('.board-card').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.clue===id)));$('selection').hidden=!id||view!=='board';if(!id)return;const i=panel().itens.find(i=>i.id===id);$('selected-title').textContent=clue(id).titulo;$('move-x').value=i.x;$('move-y').value=i.y;$('connect-target').replaceChildren();for(const other of panel().itens.filter(i=>i.id!==id&&clue(i.id))){const o=el('option',clue(other.id).titulo);o.value=other.id;$('connect-target').append(o);}$('connect').disabled=!$('connect-target').options.length;$('connections').replaceChildren();panel().ligacoes.filter(l=>l.includes(id)).forEach(l=>{const b=el('button','Desfazer ligação com '+clue(l.find(k=>k!==id))?.titulo);b.onclick=()=>{panel().ligacoes=panel().ligacoes.filter(x=>x!==l);drawLines();chooseClue(id);change();};$('connections').append(b);});}
function drawBoard(){$('board-items').replaceChildren();const list=panel().itens.filter(i=>clue(i.id)&&D.disponivel(clue(i.id)));$('board-empty').hidden=!!list.length;for(const i of list){const d=clue(i.id),n=el('button');n.type='button';n.className='board-card';n.dataset.clue=i.id;n.setAttribute('aria-pressed',String(i.id===selected));n.setAttribute('aria-label',d.titulo+'. Selecionar para examinar, mover ou conectar.');n.append(el('small',d.tipo));if(d.imagem){const im=el('img');im.src=d.imagem;im.alt='';im.draggable=false;n.append(im);}n.append(el('strong',d.titulo));$('board-items').append(n);cluePosition(n,i);n.onclick=()=>leitura?examine(i.id):chooseClue(i.id);if(leitura)continue;let drag=null;n.onpointerdown=e=>{if(e.button!==0)return;chooseClue(i.id);drag={x:e.clientX,y:e.clientY,px:i.x,py:i.y};n.setPointerCapture(e.pointerId);};n.onpointermove=e=>{if(!drag)return;moveClue(i,drag.px+(e.clientX-drag.x)/Math.max(1,$('board').clientWidth-n.offsetWidth)*100,drag.py+(e.clientY-drag.y)/Math.max(1,$('board').clientHeight-n.offsetHeight)*100);};n.onpointerup=n.onpointercancel=()=>{if(drag){const changed=i.x!==drag.px||i.y!==drag.py;drag=null;if(changed)change();}};n.onkeydown=e=>{const steps={ArrowLeft:[-3,0],ArrowRight:[3,0],ArrowUp:[0,-3],ArrowDown:[0,3]};if(steps[e.key]){e.preventDefault();chooseClue(i.id);moveClue(i,i.x+steps[e.key][0],i.y+steps[e.key][1]);change();}};}drawLines();chooseClue(selected&&list.some(i=>i.id===selected)?selected:null);}
function renderCase(){const c=D.casos[current];$('case-select').value=current;$('case-question').textContent=c.pergunta;$('case-label').textContent=current==='universo'?'Uma pergunta para levar com você':'Caso · '+c.nome;$('case-post').hidden=!c.post;if(c.post)$('case-post').href=c.post;$('note').value=panel().nota;$('conclusion').value=panel().conclusao;selected=null;drawBoard();renderArchive();}
$('case-select').onchange=()=>{current=$('case-select').value;if(!visita)history.replaceState(null,'','?caso='+current);renderCase();};
function examine(id){examined=id;const d=clue(id);$('examiner-title').textContent=d.titulo;$('examiner-origin').textContent=D.origem(d);$('examiner-text').textContent=d.texto;$('examiner-source').textContent=d.fonte||'';$('examiner-image').hidden=!d.imagem;if(d.imagem){$('examiner-image').src=d.imagem;$('examiner-image').alt=d.titulo;}$('place-item').disabled=panel().itens.some(i=>i.id===id);$('placed-status').textContent=$('place-item').disabled?'Esta pista já está no painel.':'';$('examiner').showModal();}
function renderArchive(){if(!state)return;const filter=$('filter').value,list=available().filter(i=>filter==='todos'||filter==='caso'&&(current==='universo'||i.caso===current)||i.tipo===filter);$('archive-items').replaceChildren();if(!list.length)$('archive-items').append(el('p','Nenhum item aqui ainda. Você pode ver todas as descobertas ou voltar à história.'));list.forEach(d=>{const b=el('button');b.className='archive-item';if(d.imagem){const im=el('img');im.src=d.imagem;im.alt='';im.loading='lazy';b.append(im);}b.append(el('small',D.origem(d)),el('strong',d.titulo),el('span','Examinar →'));b.onclick=()=>examine(d.id);$('archive-items').append(b);});}
$('filter').onchange=renderArchive;$('open-archive').onclick=()=>{$('archive').hidden=false;$('filter').focus();};$('close-archive').onclick=()=>{$('archive').hidden=true;$('open-archive').focus();};
$('place-item').onclick=()=>{if(panel().itens.some(i=>i.id===examined))return;if(panel().itens.length>=30){$('placed-status').textContent='Este painel já tem 30 itens.';return;}const n=panel().itens.length;panel().itens.push({id:examined,x:10+(n%3)*35,y:10+(Math.floor(n/3)%3)*32});selected=examined;drawBoard();change();$('place-item').disabled=true;$('placed-status').textContent='Pista colocada no mural. Ela continua no seu inventário.';};
$('examine-selected').onclick=()=>examine(selected);$('remove-selected').onclick=()=>{panel().itens=panel().itens.filter(i=>i.id!==selected);panel().ligacoes=panel().ligacoes.filter(l=>!l.includes(selected));selected=null;drawBoard();change();};
for(const axis of ['x','y'])$('move-'+axis).oninput=()=>{const i=panel().itens.find(i=>i.id===selected);if(i){moveClue(i,axis==='x'?+$('move-x').value:i.x,axis==='y'?+$('move-y').value:i.y);change();}};
$('connect').onclick=()=>{const other=$('connect-target').value;if(other&&panel().ligacoes.length<60&&!panel().ligacoes.some(l=>l.includes(selected)&&l.includes(other))){panel().ligacoes.push([selected,other]);drawLines();chooseClue(selected);change();}};
$('note').oninput=()=>{panel().nota=$('note').value;change();};$('conclusion').oninput=()=>{panel().conclusao=$('conclusion').value;change();};$('conclude').onclick=()=>{if(!$('conclusion').value.trim()){status('Escreva uma frase antes de guardar sua conclusão.');$('conclusion').focus();return;}change();save();};
new ResizeObserver(()=>{if(view==='board'){panel().itens.forEach(i=>{const n=document.querySelector('[data-clue="'+i.id+'"]');if(n)cluePosition(n,i);});drawLines();}}).observe($('room-stage'));
window.addEventListener('percurso-atualizado',()=>{if(visita)return;if(Percurso.codigo()!==owner){$('room-content').hidden=true;$('room-gate').hidden=false;$('room-gate').textContent='O passaporte mudou. Reabra esta página para continuar.';status('Sala fechada.');}else renderArchive();});
setView('overview');if(dirty&&!conflict)save();
})();
