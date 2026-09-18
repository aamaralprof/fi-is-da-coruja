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
/* A janela nao esta no mesmo lugar em todas as perspectivas, e a persiana
   precisa cair exatamente sobre ela. Estas medidas sao do palco, nao do
   arquivo: na Mesa o palco corta o alto da arte, entao a janela ocupa mais
   tela do que ocupa imagem. */
const viewData={
 overview:{title:'Atmosfera da sala',description:'Escolha uma área para se aproximar ou mude a atmosfera.',scenes:{lilas:'assets/sala/sala-geral.png',azul:'assets/sala/sala-geral-azul.png'},noite:{lilas:'assets/sala/sala-geral-noite.png'},chuva:{lilas:'assets/sala/sala-geral-chuva.png'},blind:{x:27.8,y:0,w:18.1,h:42.3},alt:'Visão geral da Sala de Investigação'},
 shelf:{title:'Objetos da estante',description:'Escolha na bandeja e organize livros e a caixa Ideias nas prateleiras.',scenes:{lilas:'assets/sala/sala-estante-lilas.png',azul:'assets/sala/sala-estante-azul.png'},noite:{lilas:'assets/sala/sala-estante-noite.png'},chuva:{lilas:'assets/sala/sala-estante-chuva.png'},blind:{x:78.1,y:0,w:21.9,h:48.6},alt:'Estante aproximada da Sala de Investigação'},
 desk:{title:'Objetos da mesa',description:'Escolha na bandeja e organize os objetos sobre a mesa.',scenes:{lilas:'assets/sala/sala-mesa-aproximada.png',azul:'assets/sala/sala-mesa-azul.png'},noite:{lilas:'assets/sala/sala-mesa-noite.png'},chuva:{lilas:'assets/sala/sala-mesa-chuva.png'},blind:{x:0,y:0,w:17.5,h:66.8},alt:'Mesa aproximada da Sala de Investigação'},
 board:{title:'Mural de pistas',description:'Organize pistas, aproxime ideias e trace conexões.',scenes:{lilas:'assets/sala/sala-mesa-aproximada.png',azul:'assets/sala/sala-mesa-azul.png'},noite:{lilas:'assets/sala/sala-mesa-noite.png'},chuva:{lilas:'assets/sala/sala-mesa-chuva.png'},blind:{x:0,y:0,w:17.5,h:45.9},alt:'Mural da Sala de Investigação'}
};
const roomItems=[
 {id:'luminaria_sofia',name:'Luminária',view:'desk',image:'assets/sala/luminaria.png',sprite:'lamp',states:['off','on'],action:{off:'Acender',on:'Apagar'},x:76,y:48,w:11,ratio:.58,defaultPlaced:true},
 {id:'caneca_sofia',name:'Caneca lilás',view:'desk',image:'assets/sala/caneca.png',x:62,y:78,w:6,ratio:1},
 {id:'caderno_sofia',name:'Caderno da Sofia',view:'desk',image:'assets/sala/caderno-fechado-lilas.png',packStateImages:{sofia:{closed:'assets/sala/caderno-fechado-lilas.png',open:'assets/sala/caderno-aberto-lilas.png'},sofia2:{closed:'assets/sala/caderno-fechado-azul.png',open:'assets/sala/caderno-sofia-2-transparente.png'}},states:['closed','open'],action:{closed:'Abrir caderno',open:'Fechar caderno'},zoomable:true,x:38,y:65,w:18,ratio:1.45},
 {id:'porta_lapis_sofia',name:'Porta-lápis',view:'desk',image:'assets/sala/porta-lapis.png',x:68,y:74,w:8,ratio:.91},
 {id:'livro_filosofia',name:'Filosofia',view:'shelf',image:'assets/sala/livros.png',sprite:'book-filosofia',x:16,y:9,w:12,ratio:.5},
 {id:'livro_historia',name:'História',view:'shelf',image:'assets/sala/livros.png',sprite:'book-historia',x:34,y:29,w:12,ratio:.5},
 {id:'livro_literatura',name:'Literatura',view:'shelf',image:'assets/sala/livros.png',sprite:'book-literatura',x:21,y:50,w:12,ratio:.5},
 {id:'caixa_ideias',name:'Caixa Ideias',view:'shelf',image:'assets/sala/caixa-ideias.png',sprite:'box',states:['closed','open'],action:{closed:'Abrir caixa',open:'Fechar caixa'},x:30,y:72,w:22,ratio:1.12}
];
if(progresso('sofia-room-notebook-unlocked')==='unlocked')roomItems.push({id:'notebook_investigacao',name:'Notebook de Investigação',view:'desk',image:'assets/sala/notebook-investigacao.png',abre:'explorador',x:23,y:57,w:22,ratio:1.78});
if(progresso('sofia-room-plant-unlocked')==='unlocked')roomItems.push({id:'planta_investigacao',name:'Pequena planta',view:'desk',image:'assets/sala/planta-broto.png',stateImages:{broto:'assets/sala/planta-broto.png',pequena:'assets/sala/planta-pequena.png',desenvolvida:'assets/sala/planta-desenvolvida.png',florida:'assets/sala/planta-florida.png',sede:'assets/sala/planta-com-sede.png'},states:['broto','pequena','desenvolvida','florida','sede'],action:{broto:'Regar',pequena:'Regar',desenvolvida:'Regar',florida:'Regar',sede:'Regar e recuperar'},x:52,y:52,w:11,ratio:.78,plant:true});
const itemById=id=>roomItems.find(i=>i.id===id);
const blueAssets={caderno_sofia:'assets/sala/caderno-sofia-2-transparente.png',livro_filosofia:'assets/sala/livros-sofia-2-transparente.png',livro_historia:'assets/sala/livros-sofia-2-transparente.png',livro_literatura:'assets/sala/livros-sofia-2-transparente.png',caixa_ideias:'assets/sala/caixa-ideias-sofia-2-transparente.png'};
const assetFor=d=>d.packStateImages?d.packStateImages[state?.appearance?.pack]?.[state?.roomItems?.[d.id]?.state]||d.image:d.stateImages?d.stateImages[state?.roomItems?.[d.id]?.state]||d.image:state?.appearance?.pack==='sofia2'&&blueAssets[d.id]?blueAssets[d.id]:d.image;
/* A hora tem tres estados, e nem todo cenario tem arte para os tres: por ora
   so a Visao geral em lilas anoitece de verdade. Onde a arte existe, ela
   manda; onde nao existe, fica a cena do fim de tarde e o veu escurece por
   cima. Cada cenario novo que chegar troca um veu por uma pintura, sem
   precisar mexer aqui. */
const arteDaHora=meta=>{const h=state?.appearance?.time||'day';if(h==='day')return null;return meta[h==='rain'?'chuva':'noite']?.[state?.appearance?.wall||'lilas']||null;};
const sceneFor=meta=>arteDaHora(meta)||meta.scenes?.[state?.appearance?.wall||'lilas']||meta.scene;
/* A planta bebe de seis em seis horas e murcha depois de tres dias sem
   ninguem. Os dois numeros moram aqui, com nome, porque sao regra do jogo
   e nao detalhe de implementacao. */
const ESPERA_DA_REGA=6*3600000, ABANDONO=3*24*3600000;
/* Quanto a mao pode escorregar sem que o toque deixe de ser um toque.
   Em pixels, de proposito: media em por cento do palco, a folga encolhia
   junto com a tela — num celular dava tres pixels, e quase todo toque
   virava arrasto. Era por isso que regar a planta e acender o notebook
   falhavam sem motivo aparente. Dez pixels e a folga que os proprios
   sistemas dao a um toque. */
const ARRASTO_MINIMO=10;
const defaults=()=>({appearance:{pack:'sofia',wall:'lilas',rug:false,rugX:13,rugY:67,lights:'on',blind:'open',time:'day',roomLight:'off'},roomItems:{},paineis:{}});
const normalize=s=>{
 s=s||{};s.appearance=s.appearance||{rug:false,lights:'on'};s.appearance.pack=s.appearance.pack||'sofia';s.appearance.wall=s.appearance.wall||'lilas';s.appearance.rugX=Number.isFinite(s.appearance.rugX)?s.appearance.rugX:13;s.appearance.rugY=Number.isFinite(s.appearance.rugY)?s.appearance.rugY:67;s.appearance.blind=s.appearance.blind==='closed'?'closed':'open';s.appearance.time=['night','rain'].includes(s.appearance.time)?s.appearance.time:'day';s.appearance.roomLight=s.appearance.roomLight==='on'?'on':'off';s.roomItems=s.roomItems||{};s.paineis=s.paineis||{};
 for(const d of roomItems){if(!s.roomItems[d.id])s.roomItems[d.id]={x:d.x,y:d.y,state:d.states?.[0]||'default',placed:!!d.defaultPlaced};else if(d.states&&!d.states.includes(s.roomItems[d.id].state))s.roomItems[d.id].state=d.states[0];
  /* Quem murcha a planta e o tempo, e o tempo passa com a Sala fechada:
     por isso a conta e feita ao ler o estado, nao ao clicar. Guarda-se o
     estagio em que ela estava — um broto abandonado volta a ser broto, nao
     vira flor por ter passado sede. */
  const o=s.roomItems[d.id];
  if(d.plant&&o.lastWatered&&o.state!=='sede'&&Date.now()-o.lastWatered>=ABANDONO){o.stage=o.state;o.state='sede';}
 }
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

function setView(next){view=next;selectedRoom=null;const meta=viewData[view];$('room-stage').dataset.view=view;$('room-stage').dataset.pack=state.appearance.pack;$('room-stage').dataset.wall=state.appearance.wall;$('package-select').value=state.appearance.pack;$('wall-select').value=state.appearance.wall;$('scene').src=sceneFor(meta);$('scene').alt=meta.alt;$('view-description').textContent=meta.description;$('customization-title').textContent=meta.title;$('hotspots').hidden=view!=='overview';$('overview-decor').hidden=view!=='overview';$('board-layer').hidden=view!=='board';$('case-question-wrap').hidden=view!=='board';$('selection').hidden=true;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));renderRoom();renderTray();if(view==='board'){renderCase();requestAnimationFrame(drawLines);}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setView(b.dataset.go));
$('previous-view').onclick=()=>setView(views[(views.indexOf(view)+views.length-1)%views.length]);$('next-view').onclick=()=>setView(views[(views.indexOf(view)+1)%views.length]);
function roomPosition(n,s){n.style.left=s.x+'%';n.style.top=s.y+'%';}
function selectRoom(id){selectedRoom=id;document.querySelectorAll('.room-item').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.id===id)));const d=itemById(id),s=state.roomItems[id];$('selected-controls').hidden=!d;if(!d)return;$('selected-item-name').textContent=d.name;$('toggle-item-state').hidden=!d.states;$('zoom-room-item').hidden=!d.zoomable;if(d.states)$('toggle-item-state').textContent=d.action[s.state];}
function toggleState(id){if(leitura)return;const d=itemById(id),s=state.roomItems[id];if(!d?.states)return;let recado='';if(d.plant){const now=Date.now(),last=Number(s.lastWatered||0);
 if(now-last<ESPERA_DA_REGA&&s.state!=='sede'){
  const faltam=Math.ceil((ESPERA_DA_REGA-(now-last))/3600000);
  status('A planta ainda está bem regada. Volte em '+faltam+(faltam===1?' hora.':' horas.'));return;}
 /* A rega sempre conta, mesmo quando nao muda nada: e ela que adia o
    abandono. Se a planta florida so ouvisse 'ja esta florida' sem o
    lastWatered mudar, quem regasse todo dia acharia a planta murcha. */
 s.lastWatered=now;
 if(s.state==='sede'){s.state=s.stage||'florida';delete s.stage;recado='A planta se recuperou.';}
 else if(s.state==='florida')recado='Ela já está florida. A rega mantém.';
 else{s.state=d.states[Math.min(3,Math.max(0,d.states.indexOf(s.state))+1)];
  recado=s.state==='florida'?'A planta floresceu.':'A planta recebeu água.';}}else s.state=d.states[(d.states.indexOf(s.state)+1)%d.states.length];renderRoom();selectRoom(id);change();if(recado)recadoDaPlanta(recado);}
/* O recado da planta divide a linha com o estado do salvamento, e perdia:
   change() escreve 'Guardando...' no mesmo instante, antes de qualquer
   pintura, e o aluno nunca chegava a ler que a planta floresceu. Dizer
   depois do change() faz aparecer; repetir depois do salvamento faz ficar.
   O 'Tudo salvo' se perde nessa rega — e o recado vale mais. */
function recadoDaPlanta(texto){status(texto);clearTimeout(recadoDaPlanta.t);recadoDaPlanta.t=setTimeout(()=>status(texto),1400);}
function renderRoom(){const host=$('placed-items'),rug=$('rug');host.replaceChildren();$('room-stage').dataset.pack=state.appearance.pack;$('room-stage').dataset.wall=state.appearance.wall;$('scene').src=sceneFor(viewData[view]);rug.style.setProperty('--rug-image',`url('${state.appearance.pack==='sofia2'?'assets/sala/tapete-sofia-2.png':'assets/sala/tapete-retangular.png'}')`);rug.style.setProperty('--rug-x',state.appearance.rugX+'%');rug.style.setProperty('--rug-y',state.appearance.rugY+'%');const palco=$('room-stage'),persiana=$('blind'),janela=viewData[view].blind;palco.dataset.blind=state.appearance.blind;palco.dataset.time=state.appearance.time;if(arteDaHora(viewData[view]))delete palco.dataset.veu;else palco.dataset.veu='sim';palco.dataset.roomLight=state.appearance.roomLight;persiana.style.setProperty('--blind-x',janela.x+'%');persiana.style.setProperty('--blind-y',janela.y+'%');persiana.style.setProperty('--blind-w',janela.w+'%');persiana.style.setProperty('--blind-h',janela.h+'%');rug.hidden=!state.appearance.rug;rug.tabIndex=leitura?-1:0;rug.setAttribute('aria-label','Tapete.'+(leitura?'':' Arraste ou use as setas para mover.'));$('lights').dataset.state=state.appearance.lights;for(const d of roomItems.filter(i=>i.view===view)){const s=state.roomItems[d.id];if(!s.placed)continue;const n=el('button');n.type='button';n.className='room-item';n.dataset.id=d.id;n.dataset.state=s.state;n.dataset.recolored=String(!!blueAssets[d.id]);if(d.sprite)n.dataset.sprite=d.sprite;n.style.setProperty('--item-image',`url('${assetFor(d)}')`);n.style.setProperty('--item-w',d.w+'%');n.style.setProperty('--item-ratio',d.ratio);n.setAttribute('aria-label',d.name+(d.states?'. '+d.action[s.state]+'.':'')+(d.abre?'. Abrir a tela.':'')+(leitura?'':' Arraste ou use as setas para mover.'));n.setAttribute('aria-pressed',String(d.id===selectedRoom));roomPosition(n,s);host.append(n);if(leitura){n.tabIndex=-1;continue;}let drag=null,moved=false;n.onpointerdown=e=>{if(e.button!==0)return;selectRoom(d.id);drag={clientX:e.clientX,clientY:e.clientY,x:s.x,y:s.y,id:e.pointerId};moved=false;n.setPointerCapture(e.pointerId);};n.onpointermove=e=>{if(!drag)return;const px=e.clientX-drag.clientX,py=e.clientY-drag.clientY;if(!moved&&Math.hypot(px,py)<=ARRASTO_MINIMO)return;moved=true;const rect=$('room-stage').getBoundingClientRect(),dx=px/rect.width*100,dy=py/rect.height*100;s.x=Math.max(0,Math.min(100-d.w,drag.x+dx));s.y=Math.max(0,Math.min(88,drag.y+dy));roomPosition(n,s);};n.onpointerup=n.onpointercancel=e=>{if(!drag)return;n.releasePointerCapture?.(drag.id);drag=null;if(moved)change();else if(d.states)toggleState(d.id);else if(d.abre)abrirTela(d.abre);};n.onkeydown=e=>{if(d.abre&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return abrirTela(d.abre);}const step={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!step)return;e.preventDefault();selectRoom(d.id);s.x=Math.max(0,Math.min(100-d.w,s.x+step[0]));s.y=Math.max(0,Math.min(88,s.y+step[1]));roomPosition(n,s);change();};}}
function trayButton(text,thumb,pressed,onclick){const b=el('button',text);b.type='button';b.className='tray-item';b.style.setProperty('--thumb',/^(url|linear|radial|repeating)/.test(thumb)?thumb:`url('${thumb}')`);b.setAttribute('aria-pressed',String(pressed));b.onclick=onclick;return b;}
function renderTray(){const tray=$('item-tray');tray.replaceChildren();$('selected-controls').hidden=true;if(leitura)return;if(view==='overview'){const rugAsset=state.appearance.pack==='sofia2'?'assets/sala/tapete-sofia-2.png':'assets/sala/tapete-retangular.png';const rug=trayButton(state.appearance.pack==='sofia2'?'Tapete azul':'Tapete lilás',rugAsset,state.appearance.rug,()=>{state.appearance.rug=!state.appearance.rug;renderRoom();renderTray();change();});const lights=trayButton('Cordão de luzes','assets/sala/cordao-luzes.png',state.appearance.lights==='on',()=>{state.appearance.lights=state.appearance.lights==='on'?'off':'on';renderRoom();renderTray();change();});const trocar=(campo,ligado,desligado)=>{state.appearance[campo]=state.appearance[campo]===ligado?desligado:ligado;renderRoom();renderTray();change();};const persiana=trayButton(state.appearance.blind==='closed'?'Persiana fechada':'Persiana aberta',"repeating-linear-gradient(180deg,#7a6047 0 16%,#584431 16% 21%)",state.appearance.blind==='closed',()=>trocar('blind','closed','open'));const luz=trayButton('Luz da sala',"radial-gradient(circle at 50% 36%,#ffe9bd,#7a5f33)",state.appearance.roomLight==='on',()=>trocar('roomLight','on','off'));const horas=['day','night','rain'];
 const nomeDaHora={day:'Fim de tarde',night:'Noite',rain:'Noite de chuva'};
 /* Cada miniatura desenha a SUA hora; quem escolhe qual mostrar e o
    proximaHora logo abaixo, junto com o rotulo. */
 const minDaHora={day:"linear-gradient(180deg,#f0c98a,#8c5f8e)",night:"linear-gradient(180deg,#171340,#4a3f73)",rain:"repeating-linear-gradient(105deg,#1b2246 0 3px,#3b4a7d 3px 5px)"};
 /* O rotulo e a miniatura mostram PARA ONDE o botao leva, nao onde se esta:
    num botao que gira, dizer o estado atual faz o aluno clicar para voltar. */
 const proximaHora=horas[(horas.indexOf(state.appearance.time)+1)%3];
 const noite=trayButton(nomeDaHora[proximaHora],minDaHora[proximaHora],state.appearance.time!=='day',()=>{state.appearance.time=proximaHora;renderRoom();renderTray();change();});tray.append(rug,lights,persiana,luz,noite);return;}if(view==='board'){tray.append(el('p','As pistas disponíveis ficam no Arquivo.'));return;}for(const d of roomItems.filter(i=>i.view===view)){const s=state.roomItems[d.id];tray.append(trayButton(d.name,assetFor(d),s.placed,()=>{s.placed=!s.placed;selectedRoom=s.placed?d.id:null;renderRoom();renderTray();change();}));}if(selectedRoom)selectRoom(selectedRoom);}
document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{if(!selectedRoom)return;const d=itemById(selectedRoom),s=state.roomItems[selectedRoom],[dx,dy]=b.dataset.nudge.split(',').map(Number);s.x=Math.max(0,Math.min(100-d.w,s.x+dx));s.y=Math.max(0,Math.min(88,s.y+dy));renderRoom();selectRoom(d.id);change();});
$('toggle-item-state').onclick=()=>selectedRoom&&toggleState(selectedRoom);$('zoom-room-item').onclick=()=>{const d=itemById(selectedRoom);if(!d?.zoomable)return;$('room-item-zoom-title').textContent=d.name;$('room-item-zoom-image').src=assetFor(d);$('room-item-zoom-image').alt=d.name+' ampliado';$('room-item-zoom').showModal();};$('remove-room-item').onclick=()=>{if(!selectedRoom)return;state.roomItems[selectedRoom].placed=false;selectedRoom=null;renderRoom();renderTray();change();};
/* O interruptor da parede e um atalho, nao um segundo sistema: mexe no
   mesmo campo que a bandeja e volta pelo mesmo renderTray. */
/* Uma tela so por enquanto. Se aparecerem outras, o data-abre do objeto ja
   diz qual: nao precisa de um segundo caminho para cada uma. */
/* A tela so e baixada quando alguem acende o notebook. Esconder a imagem
   num dialogo fechado nao adia nada — o navegador busca do mesmo jeito, e
   loading=lazy nao vale para quem nao tem lugar na pagina. Segurar o
   endereco fora do src e o que realmente adia. */
function abrirTela(id){const d=$(id);if(!d)return;
 d.querySelectorAll('img[data-src]').forEach(i=>{i.src=i.dataset.src;delete i.dataset.src;});
 if(!d.open)d.showModal();}

/* O gatinho nao e do aluno. Chega e vai embora sozinho enquanto a Sala
   esta aberta, e nada disso e guardado — se fosse, deixaria de ser sorte.
   Na Sala de um aluno vista pela professora ele nao aparece: aquela tela
   mostra o que foi salvo, e o gatinho nunca foi. */
const gato=$('cat-bed');let relogioDoGato;
if(!leitura){const daquiAPouco=()=>14000+Math.random()*26000;
 const passo=()=>{gato.classList.toggle('esta-aqui');relogioDoGato=setTimeout(passo,daquiAPouco());};
 relogioDoGato=setTimeout(passo,daquiAPouco());}

$('light-switch').onclick=()=>{if(leitura)return;state.appearance.roomLight=state.appearance.roomLight==='on'?'off':'on';renderRoom();renderTray();change();};
$('package-select').onchange=()=>{state.appearance.pack=$('package-select').value;renderRoom();renderTray();change();};
$('wall-select').onchange=()=>{state.appearance.wall=$('wall-select').value;renderRoom();change();};
$('reset-view').onclick=()=>{if(view==='overview')state.appearance={...state.appearance,wall:'lilas',rug:false,rugX:13,rugY:67,lights:'on',blind:'open',time:'day',roomLight:'off'};else for(const d of roomItems.filter(i=>i.view===view))state.roomItems[d.id]={x:d.x,y:d.y,state:d.states?.[0]||'default',placed:!!d.defaultPlaced};selectedRoom=null;renderRoom();renderTray();change();};

const rug=$('rug');let rugDrag=null;
rug.onpointerdown=e=>{if(leitura||e.button!==0)return;rugDrag={clientX:e.clientX,clientY:e.clientY,x:state.appearance.rugX,y:state.appearance.rugY,id:e.pointerId};rug.setPointerCapture(e.pointerId);};
rug.onpointermove=e=>{if(!rugDrag)return;const rect=$('room-stage').getBoundingClientRect(),dx=(e.clientX-rugDrag.clientX)/rect.width*100,dy=(e.clientY-rugDrag.clientY)/rect.height*100;state.appearance.rugX=Math.max(0,Math.min(26,rugDrag.x+dx));state.appearance.rugY=Math.max(48,Math.min(78,rugDrag.y+dy));rug.style.setProperty('--rug-x',state.appearance.rugX+'%');rug.style.setProperty('--rug-y',state.appearance.rugY+'%');};
rug.onpointerup=rug.onpointercancel=e=>{if(!rugDrag)return;rug.releasePointerCapture?.(rugDrag.id);rugDrag=null;change();};
rug.onkeydown=e=>{const step={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(leitura||!step)return;e.preventDefault();state.appearance.rugX=Math.max(0,Math.min(26,state.appearance.rugX+step[0]));state.appearance.rugY=Math.max(48,Math.min(78,state.appearance.rugY+step[1]));renderRoom();change();};

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
