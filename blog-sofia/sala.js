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
const previewToca=new URLSearchParams(location.search).get('preview')==='toca';
const chavesPreview=previewToca?{'sofia-room-unlocked':'unlocked','sofia-student-owl-incubation-start':String(Date.now()-4*86400000),'sofia-student-owl-unlocked':'unlocked','sofia-student-owl-identity':'registered','sofia-student-owl-name':'Faísca'}:null;
const ctx=await (previewToca?{modo:'bancada',codigo:'CORUJA-PREVIA',estado:null,revisao:0,chaves:chavesPreview,rotulo:'Prévia local da toca'}:(window.SalaContexto||null));
const visita=!!ctx, leitura=visita&&ctx.modo==='leitura', bancada=visita&&ctx.modo==='bancada';
/* De onde vêm os desbloqueios. Visitando, do contexto injetado; no uso normal,
   do localStorage de quem está com o passaporte aberto. */
const progresso=chave=>visita?(ctx.chaves&&ctx.chaves[chave])||null:localStorage.getItem(chave);
if(visita)D.ler=progresso;
if(leitura)document.body.classList.add('sala-leitura');
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const status=message=>{$('save-status').textContent=message;};
const INCUBACAO_CORUJA=3*24*60*60*1000;
const inicioCoruja=()=>Number(progresso('sofia-student-owl-incubation-start'))||0;
const corujaNasceu=()=>progresso('sofia-student-owl-unlocked')==='unlocked'||(inicioCoruja()>0&&Date.now()>=inicioCoruja()+INCUBACAO_CORUJA);
const nomeCoruja=()=>String(progresso('sofia-student-owl-name')||'').trim();
const corujaIdentificada=()=>progresso('sofia-student-owl-identity')==='registered'&&!!nomeCoruja();
function sincronizarCoruja(){
 if(!visita&&inicioCoruja()&&corujaNasceu()&&progresso('sofia-student-owl-unlocked')!=='unlocked')localStorage.setItem('sofia-student-owl-unlocked','unlocked');
}
function textoCoruja(){
 if(corujaIdentificada())return `${nomeCoruja()} está na toca. Abra a casinha para vê-la.`;
 if(corujaNasceu())return 'A incubação terminou. Toque no ovo para iniciar a ativação.';
 const restante=Math.max(0,inicioCoruja()+INCUBACAO_CORUJA-Date.now());
 const dias=Math.floor(restante/86400000),horas=Math.floor(restante%86400000/3600000),minutos=Math.max(1,Math.ceil(restante%3600000/60000));
 const partes=[];if(dias)partes.push(`${dias} ${dias===1?'dia':'dias'}`);if(horas)partes.push(`${horas} ${horas===1?'hora':'horas'}`);if(!dias&&partes.length<2)partes.push(`${minutos} min`);
 return `O ovo está em incubação. Faltam aproximadamente ${partes.slice(0,2).join(' e ')}.`;
}
sincronizarCoruja();
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
/* retirado:true tira o item da bandeja de opções sem apagar o catálogo:
   quem já tinha colocado continua vendo, só ninguém consegue adicionar um
   novo. Ver renderTray(). */
const roomItems=[
 /* ov: onde o MESMO objeto aparece, refletido e sem interação, na visão
    geral — outra foto, outra escala, exige transformar x/y/w/ratio de
    novo por view. Ver o bloco de eco em renderRoom(). */
 {id:'luminaria_sofia',name:'Luminária',view:'desk',image:'assets/sala/luminaria.png',sprite:'lamp',states:['off','on'],action:{off:'Acender',on:'Apagar'},x:76,y:48,w:11,ratio:.58,defaultPlaced:true,ov:{x:77.2,y:39.8,w:5.4,ratio:.34}},
 {id:'caneca_sofia',name:'Caneca lilás',view:'desk',image:'assets/sala/caneca.png',x:62,y:78,w:6,ratio:1,retirado:true},
 {id:'caderno_sofia',name:'Caderno da Sofia',view:'desk',image:'assets/sala/caderno-fechado-lilas.png',packStateImages:{sofia:{closed:'assets/sala/caderno-fechado-lilas.png',open:'assets/sala/caderno-aberto-lilas.png'},sofia2:{closed:'assets/sala/caderno-fechado-azul.png',open:'assets/sala/caderno-sofia-2-transparente.png'}},states:['closed','open'],action:{closed:'Abrir caderno',open:'Fechar caderno'},zoomable:true,x:38,y:65,w:18,ratio:1.45,ov:{x:58.4,y:40.5,w:8.9,ratio:.84}},
 {id:'porta_lapis_sofia',name:'Porta-lápis',view:'desk',image:'assets/sala/porta-lapis.png',x:68,y:74,w:8,ratio:.91,ov:{x:73.3,y:47.3,w:4,ratio:.53}},
 {id:'livro_filosofia',name:'Filosofia',view:'shelf',image:'assets/sala/livros.png',sprite:'book-filosofia',x:16,y:9,w:12,ratio:.5,ov:{x:6.1,y:4.2,w:3.9,ratio:.21}},
 {id:'livro_historia',name:'História',view:'shelf',image:'assets/sala/livros.png',sprite:'book-historia',x:34,y:29,w:12,ratio:.5,ov:{x:11.9,y:18.1,w:3.9,ratio:.21}},
 {id:'livro_literatura',name:'Literatura',view:'shelf',image:'assets/sala/livros.png',sprite:'book-literatura',x:21,y:50,w:12,ratio:.5,ov:{x:7.7,y:30.3,w:3.9,ratio:.21}},
 {id:'caixa_ideias',name:'Caixa Ideias',view:'shelf',image:'assets/sala/caixa-ideias.png',sprite:'box',states:['closed','open'],action:{closed:'Abrir caixa',open:'Fechar caixa'},x:30,y:72,w:22,ratio:1.12,ov:{x:10.6,y:57.9,w:7.1,ratio:.48}},
 /* Quadros: decoração pura, sem estado. Zoomable porque a arte tem
    detalhe pequeno (constelações, legendas) que vale examinar de perto —
    mesmo mecanismo de pinça/arraste do caderno. */
 {id:'quadro_atena',name:'Quadro: Atena e a coruja',view:'desk',image:'assets/sala/quadro-atena-coruja.png',zoomable:true,x:77,y:8,w:8,ratio:.54,ov:{x:77.7,y:10.5,w:4,ratio:.31}},
 {id:'quadro_hora',name:'Quadro: A Hora Que Não Existe',view:'desk',image:'assets/sala/quadro-hora-que-nao-existe.png',zoomable:true,x:18,y:8,w:7,ratio:.58,ov:{x:48.5,y:10.5,w:3.5,ratio:.34}},
 {id:'quadro_lua',name:'Quadro: fases da lua',view:'shelf',image:'assets/sala/quadro-fases-da-lua.png',zoomable:true,x:64,y:12,w:11,ratio:.56,ov:{x:21.6,y:12.3,w:3.6,ratio:.24}},
 {id:'quadro_constelacoes',name:'Quadro: constelações',view:'shelf',image:'assets/sala/quadro-constelacoes.png',zoomable:true,x:64,y:44,w:11,ratio:.55,ov:{x:21.6,y:36.6,w:3.6,ratio:.24}},
 {id:'quadro_gata',name:'Quadro: gata nos livros',view:'shelf',image:'assets/sala/quadro-gata-nos-livros.png',zoomable:true,x:63,y:74,w:12,ratio:.68,ov:{x:21.3,y:59.4,w:3.9,ratio:.29}},
 {id:'quadro_mare_nostrum',name:'Quadro: Mare Nostrum',view:'shelf',image:'assets/sala/quadro-mare-nostrum.png',zoomable:true,x:78,y:58,w:18,ratio:1.33,ov:{x:27.5,y:49,w:5.5,ratio:.57}},
 {id:'quadro_glicinias',name:'Quadro: janela de glicínias',view:'shelf',image:'assets/sala/quadro-janela-glicinias.png',zoomable:true,x:46,y:10,w:10,ratio:.574},
 {id:'quadro_flor_ideias',name:'Quadro: flor de ideias',view:'desk',image:'assets/sala/quadro-flor-ideias.png',zoomable:true,x:46,y:8,w:8,ratio:.543},
 /* Objetos avulsos, mesmo tratamento dos quadros: decoração pura,
    zoomable pela mesma razão (detalhe pequeno vale examinar de perto). */
 {id:'globo_coruja',name:'Globo da coruja',view:'desk',image:'assets/sala/globo-lua-coruja.png',zoomable:true,x:4,y:50,w:13,ratio:.667},
 {id:'vela_lua',name:'Vela da lua',view:'desk',image:'assets/sala/vela-lua-coruja.png',zoomable:true,x:84,y:60,w:7,ratio:.755},
 {id:'livros_lua',name:'Livro e caderno da coruja',view:'desk',image:'assets/sala/livros-lua-coruja.png',zoomable:true,x:3,y:70,w:16,ratio:1.527},
 {id:'chave_coruja',name:'Chave da coruja',view:'shelf',image:'assets/sala/chave-coruja.png',zoomable:true,x:42,y:55,w:9,ratio:1.548},
 /* Os tres objetos da charada dos caminhos: vivem so na visao geral, nunca
    entram na estante/mesa/mural de verdade. Ficam na bandeja como qualquer
    outro item da visao geral — o aluno escolhe, poe na cena e arrasta ate a
    area do caminho a que pertence; checkEnigma() confere pela posicao, nao
    por um sistema de encaixe novo. O post-it abre a charada ao ser tocado
    sem ser arrastado (mesmo mecanismo do notebook, so muda o alvo) — util
    para reler depois do aviso automatico da primeira entrada. */
 /* x/y de repouso escolhidos fora das tres zonas de hotspot (conferidas
    contra os retangulos de sala.css) — nenhum objeto pode nascer "ja
    resolvido" por coincidencia de posicao. Ver hotspotRect()/dentroDoCaminho(). */
 {id:'charada_livro',name:'Um livro solto',view:'overview',image:'assets/sala/livros.png',sprite:'book-filosofia',categoria:'book',x:26,y:65,w:12,ratio:.5},
 {id:'charada_caderno',name:'Um caderno solto',view:'overview',image:'assets/sala/caderno-fechado-lilas.png',categoria:'notebook',x:41,y:82,w:13,ratio:1.45},
 {id:'charada_postit',name:'Um bilhete',view:'overview',image:'assets/sala/bilhete-charada.png',categoria:'postit',abre:'charada',x:58,y:82,w:8,ratio:.946}
];
if(progresso('sofia-room-notebook-unlocked')==='unlocked')roomItems.push({id:'notebook_investigacao',name:'Notebook de Investigação',view:'desk',image:'assets/sala/notebook-laptop.webp',abre:'explorador',x:21.7,y:53.2,w:24.7,ratio:1.78,ov:{x:50.4,y:37.3,w:12.2,ratio:1.03}});
if(progresso('sofia-room-plant-unlocked')==='unlocked')roomItems.push({id:'planta_investigacao',name:'Pequena planta',view:'desk',image:'assets/sala/planta-broto.png',stateImages:{broto:'assets/sala/planta-broto.png',pequena:'assets/sala/planta-pequena.png',desenvolvida:'assets/sala/planta-desenvolvida.png',florida:'assets/sala/planta-florida.png',sede:'assets/sala/planta-com-sede.png'},states:['broto','pequena','desenvolvida','florida','sede'],action:{broto:'Regar',pequena:'Regar',desenvolvida:'Regar',florida:'Regar',sede:'Regar e recuperar'},x:52,y:52,w:11,ratio:.78,plant:true});
if(inicioCoruja())roomItems.push({id:'corujinha_aluno',name:'Coruja de Hefesto',view:'shelf',image:'assets/sala/coruja-hefesto-ovo-fechado.png',owl:true,x:44,y:34,w:10,ratio:1.09,defaultPlaced:true,ov:{x:12,y:27,w:4.7,ratio:1.09}});
const itemById=id=>roomItems.find(i=>i.id===id);
const nomeItem=d=>d.owl?(corujaIdentificada()?`Toca de ${nomeCoruja()}`:'Ovo da Coruja de Hefesto'):d.name;
const larguraItem=d=>d.owl&&corujaIdentificada()?13:d.w;
const blueAssets={caderno_sofia:'assets/sala/caderno-sofia-2-transparente.png',livro_filosofia:'assets/sala/livros-sofia-2-transparente.png',livro_historia:'assets/sala/livros-sofia-2-transparente.png',livro_literatura:'assets/sala/livros-sofia-2-transparente.png',caixa_ideias:'assets/sala/caixa-ideias-sofia-2-transparente.png'};
const assetFor=d=>d.owl?(corujaIdentificada()?'assets/sala/toca-coruja-fechada.png':'assets/sala/coruja-hefesto-ovo-fechado.png'):d.packStateImages?d.packStateImages[state?.appearance?.pack]?.[state?.roomItems?.[d.id]?.state]||d.image:d.stateImages?d.stateImages[state?.roomItems?.[d.id]?.state]||d.image:state?.appearance?.pack==='sofia2'&&blueAssets[d.id]?blueAssets[d.id]:d.image;
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
  /* O ovo antes vivia na mesa. A migração coloca também os exemplares já salvos
     na estante uma única vez; depois disso, preserva qualquer movimento do aluno. */
  if(d.owl&&!o.shelfPlacement){o.x=d.x;o.y=d.y;o.shelfPlacement=true;}
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
/* Cada passaporte recebe sempre a mesma coruja. A escolha nasce do proprio
   codigo, em vez de Math.random(): assim ela nao troca de cor ao mudar de
   aparelho e a professora enxerga a mesma variante na Sala do aluno. */
const CORES_CORUJA=[
 {id:'violeta',nome:'violeta',pose:'atenta'},
 {id:'azul',nome:'azul',pose:'curiosa'},
 {id:'turquesa',nome:'turquesa',pose:'acenando'},
 {id:'verde',nome:'verde',pose:'pensativa'},
 {id:'ambar',nome:'âmbar',pose:'orgulhosa'},
 {id:'rubi',nome:'rubi',pose:'acolhedora'}
];
const indiceCoruja=Array.from(owner||'sala-geral').reduce((total,letra)=>((total*31)+letra.codePointAt(0))>>>0,0)%CORES_CORUJA.length;
const corujaDeOculos=owner==='CORUJA-62XA';
const corCoruja=corujaDeOculos?CORES_CORUJA.find(c=>c.id==='azul'):CORES_CORUJA[indiceCoruja];
const vidaCoruja=window.CorujaHefesto.create({read:progresso,write:previewToca?(chave,valor)=>{chavesPreview[chave]=valor;}:visita?null:(chave,valor)=>localStorage.setItem(chave,valor),items:D.itens,available:item=>D.disponivel(item)});
const tocaCoruja=$('toca-coruja'),moradoraCoruja=tocaCoruja?.querySelector('.toca-coruja-moradora');
const cenaToca=tocaCoruja?.querySelector('.toca-coruja-cena');
const estacoesToca={nest:tocaCoruja?.querySelector('.toca-hotspot-ninho'),charger:tocaCoruja?.querySelector('.toca-hotspot-nucleo'),bench:tocaCoruja?.querySelector('.toca-hotspot-bancada')};
if(estacoesToca.nest){estacoesToca.nest.dataset.owlStation='nest';estacoesToca.nest.querySelector('small').textContent='arraste para dormir';}
if(estacoesToca.charger){estacoesToca.charger.dataset.owlStation='charger';estacoesToca.charger.firstChild.textContent='Carregador ';estacoesToca.charger.querySelector('small').textContent='3 minutos';}
if(estacoesToca.bench){estacoesToca.bench.dataset.owlStation='bench';estacoesToca.bench.dataset.owlAction='bench';estacoesToca.bench.querySelector('small').textContent='ajustar ou polir';}
const menuBancada=document.createElement('div');menuBancada.className='toca-bancada-menu';menuBancada.dataset.owlBenchMenu='';menuBancada.hidden=true;menuBancada.setAttribute('role','group');menuBancada.setAttribute('aria-label','Cuidados na bancada');menuBancada.innerHTML='<strong>O que vamos fazer?</strong><button type="button" data-owl-action="maintain">Ajustar engrenagens</button><button type="button" data-owl-action="polish">Polir placas</button><button type="button" data-owl-bench-close>Agora não</button>';
const progressoCuidado=document.createElement('div');progressoCuidado.className='toca-carga-progresso';progressoCuidado.dataset.owlCareProgress='';progressoCuidado.hidden=true;progressoCuidado.innerHTML='<span aria-hidden="true"></span><strong data-owl-care-label></strong>';
const ferramentaBancada=document.createElement('div');ferramentaBancada.className='toca-ferramenta';ferramentaBancada.hidden=true;ferramentaBancada.innerHTML='<p data-owl-tool-instruction></p><button class="toca-ferramenta-objeto" type="button" data-owl-tool aria-label="Ferramenta da bancada"></button><button class="toca-ferramenta-passo" type="button" data-owl-tool-step></button>';
cenaToca?.append(menuBancada,progressoCuidado,ferramentaBancada);menuBancada.querySelector('[data-owl-bench-close]')?.addEventListener('click',()=>{menuBancada.hidden=true;moradoraCoruja?.focus();});
if(tocaCoruja){
 tocaCoruja.dataset.owlColor=corCoruja.id;
 if(corujaDeOculos)tocaCoruja.dataset.owlSpecial='oculos';
}
/* Fora do bloco: os pontos da cena também animam a coruja. */
let visualCoruja=null,voltarAoNinho=()=>{},encaixarNaEstacao=()=>{};
function tocarSomCoruja(chave,efeito='chirp',opcoes={}){
 const sons=window.CorujaSom;if(!sons)return;
 if(typeof sons.playOwlSound!=='function'){sons.play?.(efeito,opcoes);return;}
 sons.playOwlSound(chave,opcoes).then(tocou=>{if(!tocou)sons.play?.(efeito,opcoes);});
}
if(moradoraCoruja){
 visualCoruja=window.CorujaVisual.create({color:corCoruja.id,special:corujaDeOculos});
 moradoraCoruja.replaceChildren(visualCoruja);
 const comportamentoCoruja=window.CorujaVisual.bind(visualCoruja,moradoraCoruja,{idleMs:120000,trackSurface:document,onState:estado=>{if(estado==='back')status(`${nomeCoruja()||'A coruja'} virou de costas depois de esperar por atenção.`);}});
 const descricao=`A Coruja de Hefesto${corujaDeOculos?', a variante exclusiva com óculos':''}, de luz ${corCoruja.nome}, em pose ${corCoruja.pose}, dentro da sua casinha.`;
 moradoraCoruja.setAttribute('aria-label',descricao+' Toque para cumprimentá-la ou mantenha pressionado para fazer carinho.');
 const reagir=()=>{
  moradoraCoruja.classList.remove('toca-coruja-moradora--reagindo');
  void moradoraCoruja.offsetWidth;
  moradoraCoruja.classList.add('toca-coruja-moradora--reagindo');
  window.CorujaVisual.motion(visualCoruja,corujaDeOculos?'blink':'tilt');
  tocarSomCoruja('olhe_aqui',corujaDeOculos?'blink':'chirp',{special:corujaDeOculos});
  if(!visita)vidaCoruja.act('greet');
  status(corujaDeOculos?'A coruja de óculos ajeitou a armação e piscou para você.':`A coruja ${corCoruja.nome} respondeu ao seu cumprimento.`);
 };
 const fazerCarinho=()=>{comportamentoCoruja?.activity();window.CorujaVisual.motion(visualCoruja,'happy');tocarSomCoruja('carinho','happy',{special:corujaDeOculos});if(!visita)vidaCoruja.act('greet');const recado=`${nomeCoruja()||'A coruja'} fechou os olhos e se inclinou para receber o carinho.`;status(recado);if($('owl-life-message'))$('owl-life-message').textContent=recado;avisarNaToca(recado);};
 tocaCoruja?.querySelector('[data-owl-care=pet]')?.addEventListener('click',()=>{if(moradoraCoruja.hidden){$('owl-life-message').textContent=`${nomeCoruja()||'A coruja'} não está na toca agora.`;return;}if(tocaCoruja.dataset.owlMode==='resting'){avisarNaToca(`${nomeCoruja()||'A coruja'} está dormindo. Toque em Acordar para fazer carinho.`);return;}fazerCarinho();});
 let temporizadorCarinho=0,carinhoAtivado=false;
 const cancelarCarinho=()=>{if(temporizadorCarinho){clearTimeout(temporizadorCarinho);temporizadorCarinho=0;}};
 /* Arrastar a coruja pela toca. A posição fica só neste aparelho. */
 const chavePosicaoToca='coruja-toca-posicao:'+owner;let arrasto=null,arrastou=false;
 const posicionarNaToca=(x,y)=>{const cx=Math.max(0,Math.min(100-parseFloat(getComputedStyle(moradoraCoruja).width)/moradoraCoruja.parentElement.clientWidth*100,x)),cy=Math.max(0,Math.min(80,y));moradoraCoruja.style.left=cx+'%';moradoraCoruja.style.top=cy+'%';return {x:cx,y:cy};};
 const posicoesEstacao={nest:{x:8,y:45},charger:{x:53,y:23},bench:{x:66,y:38}};
 encaixarNaEstacao=estacao=>{const pos=posicoesEstacao[estacao];if(!pos)return;posicionarNaToca(pos.x,pos.y);moradoraCoruja.dataset.owlStation=estacao;try{localStorage.removeItem(chavePosicaoToca);}catch{}};
 try{const salva=JSON.parse(localStorage.getItem(chavePosicaoToca)||'null');if(salva&&Number.isFinite(salva.x)&&Number.isFinite(salva.y)){moradoraCoruja.style.left=salva.x+'%';moradoraCoruja.style.top=salva.y+'%';}}catch{}
 voltarAoNinho=()=>{encaixarNaEstacao('nest');};
 moradoraCoruja.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;if(['charging','maintaining','polishing','resting'].includes(vidaCoruja.snapshot().mode)){avisarNaToca('Este cuidado precisa terminar antes de mover a coruja.');return;}delete moradoraCoruja.dataset.owlStation;const cena=moradoraCoruja.parentElement.getBoundingClientRect(),r=moradoraCoruja.getBoundingClientRect();arrasto={id:e.pointerId,x:e.clientX,y:e.clientY,left:(r.left-cena.left)/cena.width*100,top:(r.top-cena.top)/cena.height*100,w:cena.width,h:cena.height};arrastou=false;moradoraCoruja.setPointerCapture?.(e.pointerId);});
 moradoraCoruja.addEventListener('pointermove',e=>{if(!arrasto||e.pointerId!==arrasto.id)return;const dx=e.clientX-arrasto.x,dy=e.clientY-arrasto.y;if(!arrastou&&Math.hypot(dx,dy)<8)return;if(!arrastou){arrastou=true;cancelarCarinho();moradoraCoruja.classList.add('is-arrastando');}posicionarNaToca(arrasto.left+dx/arrasto.w*100,arrasto.top+dy/arrasto.h*100);for(const botao of Object.values(estacoesToca)){if(!botao)continue;const r=botao.getBoundingClientRect(),m=28;botao.classList.toggle('is-drop-target',e.clientX>=r.left-m&&e.clientX<=r.right+m&&e.clientY>=r.top-m&&e.clientY<=r.bottom+m);}});
 const soltar=e=>{if(!arrasto||e.pointerId!==arrasto.id)return;const fim=arrasto;arrasto=null;for(const botao of Object.values(estacoesToca))botao?.classList.remove('is-drop-target');if(arrastou){if(e.type==='pointerup')posicionarNaToca(fim.left+(e.clientX-fim.x)/fim.w*100,fim.top+(e.clientY-fim.y)/fim.h*100);moradoraCoruja.classList.remove('is-arrastando');const alvo=Object.entries(estacoesToca).find(([,botao])=>{if(!botao)return false;const r=botao.getBoundingClientRect(),m=28;return e.clientX>=r.left-m&&e.clientX<=r.right+m&&e.clientY>=r.top-m&&e.clientY<=r.bottom+m;});if(alvo){encaixarNaEstacao(alvo[0]);executarAcao(alvo[0]==='nest'?'rest':alvo[0]==='charger'?'charge':'bench');}else try{localStorage.setItem(chavePosicaoToca,JSON.stringify({x:parseFloat(moradoraCoruja.style.left),y:parseFloat(moradoraCoruja.style.top)}));}catch{}}};
 moradoraCoruja.addEventListener('pointerup',soltar);moradoraCoruja.addEventListener('pointercancel',soltar);
 moradoraCoruja.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;if(['charging','maintaining','polishing','resting'].includes(vidaCoruja.snapshot().mode))return;carinhoAtivado=false;cancelarCarinho();temporizadorCarinho=setTimeout(()=>{temporizadorCarinho=0;carinhoAtivado=true;fazerCarinho();},480);});
 moradoraCoruja.addEventListener('pointerup',cancelarCarinho);moradoraCoruja.addEventListener('pointercancel',cancelarCarinho);moradoraCoruja.addEventListener('pointerleave',cancelarCarinho);
 moradoraCoruja.addEventListener('click',e=>{if(['charging','maintaining','polishing','resting'].includes(vidaCoruja.snapshot().mode)){e.preventDefault();e.stopImmediatePropagation();}},true);
 moradoraCoruja.addEventListener('click',e=>{if(arrastou){arrastou=false;e.preventDefault();return;}if(carinhoAtivado){e.preventDefault();carinhoAtivado=false;return;}const resposta=comportamentoCoruja?.click();if(resposta==='anger'){tocarSomCoruja('irritacao','anger',{special:corujaDeOculos});status(`${nomeCoruja()||'A coruja'} se irritou com tantos cliques seguidos.`);return}if(resposta==='sad'){tocarSomCoruja('tristeza','sad',{special:corujaDeOculos});status(`${nomeCoruja()||'A coruja'} voltou a olhar para você, mas sentiu sua falta.`);return}reagir();});
 moradoraCoruja.addEventListener('animationend',e=>{if(e.animationName==='coruja-cumprimenta')moradoraCoruja.classList.remove('toca-coruja-moradora--reagindo');});
}
const atualizarTituloToca=()=>{if($('toca-coruja-titulo'))$('toca-coruja-titulo').textContent=nomeCoruja()?`A casinha de ${nomeCoruja()}`:`A casinha da coruja ${corCoruja.nome}`;};
atualizarTituloToca();
const botaoSomCoruja=$('owl-sound');
const renderSomCoruja=()=>{if(!botaoSomCoruja)return;const ligado=window.CorujaSom?.enabled()!==false;botaoSomCoruja.textContent=`Som da coruja: ${ligado?'ligado':'desligado'}`;botaoSomCoruja.setAttribute('aria-pressed',String(ligado));};
botaoSomCoruja?.addEventListener('click',()=>{const ligado=window.CorujaSom.toggle();renderSomCoruja();if(ligado)tocarSomCoruja('olhe_aqui','chirp',{force:true,special:corujaDeOculos});});
renderSomCoruja();
window.CorujaSom?.preload?.(['olhe_aqui','carinho','irritacao','tristeza','empolgacao','duvida','quero_contar']);
/* Recado curto sobre a cena, para quem está olhando a toca e não o painel. */
let avisoTocaTimer=0;
function avisarNaToca(texto){const cena=tocaCoruja?.querySelector('.toca-coruja-cena');if(!cena)return;let aviso=cena.querySelector('.toca-coruja-aviso');if(!aviso){aviso=document.createElement('p');aviso.className='toca-coruja-aviso';aviso.setAttribute('role','status');cena.append(aviso);}aviso.textContent=texto;aviso.hidden=false;clearTimeout(avisoTocaTimer);avisoTocaTimer=setTimeout(()=>{aviso.hidden=true;},4200);}
let temporizadorCuidado=0;
function renderVidaCoruja(mensagem){
 clearTimeout(temporizadorCuidado);
 const vida=vidaCoruja.snapshot();$('owl-charge').value=vida.charge;$('owl-rest').value=vida.rest;
 const grau=vida.curiosity>=75?'radiante':vida.curiosity>=45?'muito curiosa':vida.curiosity>=20?'curiosa':'observadora';$('owl-curiosity').textContent=`${grau} (${vida.curiosity})`;
 tocaCoruja.dataset.owlMode=vida.mode;tocaCoruja.dataset.owlBond=vida.bondStage;tocaCoruja.dataset.owlEnergy=vida.rest<=25?'low':vida.rest<=50?'medium':'good';
 if(moradoraCoruja)moradoraCoruja.hidden=vida.mode==='exploring';
 const cuidadoAtivo=['charging','maintaining','polishing'].includes(vida.mode),imovel=cuidadoAtivo||vida.mode==='resting';
 if(moradoraCoruja){moradoraCoruja.classList.toggle('is-cuidando',imovel);moradoraCoruja.setAttribute('aria-disabled',String(imovel));}
 if(vida.mode==='resting')encaixarNaEstacao('nest');else if(vida.mode==='charging')encaixarNaEstacao('charger');else if(['maintaining','polishing'].includes(vida.mode))encaixarNaEstacao('bench');
 progressoCuidado.hidden=!cuidadoAtivo;
 const naBancada=['maintaining','polishing'].includes(vida.mode);ferramentaBancada.hidden=!naBancada;
 if(cuidadoAtivo&&vida.care){let percentual;if(vida.mode==='charging'){const restante=Math.max(0,vida.care.endsAt-Date.now()),segundos=Math.ceil(restante/1000);percentual=Math.max(0,Math.min(100,(1-restante/180000)*100));progressoCuidado.querySelector('[data-owl-care-label]').textContent=`Carregando · ${Math.floor(segundos/60)}:${String(segundos%60).padStart(2,'0')}`;temporizadorCuidado=setTimeout(()=>renderVidaCoruja(),Math.min(1000,restante+30));}else{percentual=Number(vida.care.progress)||0;progressoCuidado.querySelector('[data-owl-care-label]').textContent=vida.mode==='maintaining'?`Engrenagens ajustadas · ${percentual}%`:`Placas polidas · ${percentual}%`;const ferramenta=ferramentaBancada.querySelector('[data-owl-tool]'),instrucao=ferramentaBancada.querySelector('[data-owl-tool-instruction]'),passo=ferramentaBancada.querySelector('[data-owl-tool-step]'),ajuste=vida.mode==='maintaining';ferramentaBancada.dataset.tool=ajuste?'wrench':'cloth';instrucao.textContent=ajuste?'Passe a chave pelos pontos mecânicos da coruja.':'Esfregue o paninho sobre as placas da coruja.';passo.textContent=ajuste?'Apertar uma engrenagem':'Dar uma passada';ferramenta.setAttribute('aria-label',ajuste?'Chave de aperto. Arraste sobre a coruja.':'Paninho de polimento. Arraste sobre a coruja.');if(ferramenta.dataset.kind!==(ajuste?'wrench':'cloth')){ferramenta.dataset.kind=ajuste?'wrench':'cloth';ferramenta.innerHTML=ajuste?'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M39 7a17 17 0 0 0-8 22L9 51a6 6 0 0 0 8 8l22-22a17 17 0 0 0 20-21L48 27l-10-2-2-10L47 4A17 17 0 0 0 39 7Z"/></svg>':'<span aria-hidden="true"></span>';}}progressoCuidado.style.setProperty('--owl-care-progress',percentual+'%');}
 const dormir=tocaCoruja.querySelector('[data-owl-sleep-toggle]');if(dormir){dormir.dataset.owlAction=vida.mode==='resting'?'wake':'rest';dormir.textContent=vida.mode==='resting'?'Acordar':'Dormir';}
 if(dormir)dormir.disabled=cuidadoAtivo||vida.mode==='exploring';
 const carinho=tocaCoruja.querySelector('[data-owl-care=pet]');if(carinho)carinho.disabled=imovel||vida.mode==='exploring';
 const explorar=$('owl-explore');if(explorar){explorar.disabled=vida.mode==='exploring'||imovel;explorar.textContent=vida.mode==='exploring'?'Exploração em andamento':'Enviar para explorar';}
 const cuidadoConcluido=vida.care?.status==='complete'?(vida.care.action==='charge'?`A recarga de ${nomeCoruja()} terminou. O núcleo está completo.`:vida.care.action==='adjust'?`As engrenagens de ${nomeCoruja()} ficaram perfeitamente ajustadas.`:`As placas de ${nomeCoruja()} estão limpas e brilhantes.`):'';
 const estadoPadrao=vida.mode==='resting'?`${nomeCoruja()} está descansando no ninho. O descanso continua mesmo com a Sala fechada.`:vida.mode==='charging'?`${nomeCoruja()} está conectada ao carregador e não pode ser movida até a recarga terminar.`:vida.mode==='maintaining'?`As engrenagens de ${nomeCoruja()} estão sendo ajustadas na bancada.`:vida.mode==='polishing'?`As placas de ${nomeCoruja()} estão sendo polidas na bancada.`:vida.mode==='exploring'?`${nomeCoruja()} não está aqui. Atividade externa detectada: procure ${vida.exploration?.hint||'em outra página do blog'}. Se você não procurar, ela voltará sozinha.`:cuidadoConcluido||vida.exploration?.status==='returned'?cuidadoConcluido||`${nomeCoruja()} voltou de uma exploração e deixou um novo achado na prateleira.`:vida.rest<=25?`${nomeCoruja()} está com pouca disposição e quase cochilando. O ninho parece uma boa ideia.`:`${nomeCoruja()} observa a toca e acompanha suas descobertas.`;
 $('owl-life-message').textContent=mensagem||estadoPadrao;
 if(mensagem)avisarNaToca(mensagem);
 const lista=$('owl-findings');lista.replaceChildren();
 if(!vida.findings.length)lista.append(el('p',`${nomeCoruja()} ainda não trouxe nenhum achado. Investigações despertam sua curiosidade.`));
 for(const achado of vida.findings){const artigo=el('article');artigo.append(el('strong',achado.name),el('p',achado.text),el('small',`Encontrado por ${nomeCoruja()}.`));lista.append(artigo);}
}
function executarAcao(acao){
 if(acao==='bench'){if(['charging','maintaining','polishing','resting','exploring'].includes(vidaCoruja.snapshot().mode)){renderVidaCoruja('A coruja precisa terminar o cuidado atual antes de usar a bancada.');return;}encaixarNaEstacao('bench');menuBancada.hidden=false;menuBancada.querySelector('[data-owl-action=maintain]')?.focus();return;}
 if(acao==='findings'){$('owl-findings').hidden=!$('owl-findings').hidden;renderVidaCoruja($('owl-findings').hidden?'A prateleira foi fechada.':'A prateleira mostra o que a curiosidade encontrou.');if(visualCoruja)window.CorujaVisual.motion(visualCoruja,'inspect');if(!$('owl-findings').hidden)$('owl-findings').scrollIntoView({behavior:'smooth',block:'nearest'});return;}
 if(visita&&!previewToca)return;
 const resultado=vidaCoruja.act(acao);if(resultado.ok){menuBancada.hidden=true;const som={rest:['carinho','rest'],wake:['olhe_aqui','chirp'],charge:['empolgacao','charge'],maintain:['duvida','maintain'],polish:['empolgacao','happy'],explore:['quero_contar','chirp']}[acao]||['olhe_aqui','chirp'];tocarSomCoruja(som[0],som[1],{special:corujaDeOculos});if(acao==='rest')voltarAoNinho();if(acao==='charge')encaixarNaEstacao('charger');if(acao==='maintain'||acao==='polish')encaixarNaEstacao('bench');if(visualCoruja&&acao==='charge')window.CorujaVisual.motion(visualCoruja,'light');if(visualCoruja&&acao==='maintain')window.CorujaVisual.motion(visualCoruja,'puff');if(visualCoruja&&acao==='polish')window.CorujaVisual.motion(visualCoruja,'happy');}const mensagens={rest:`${nomeCoruja()} se acomodou no ninho. A disposição volta aos poucos.`,wake:`${nomeCoruja()} abriu os olhos e se espreguiçou.`,charge:`${nomeCoruja()} foi conectada ao carregador. A recarga leva 3 minutos.`,maintain:`O ajuste das engrenagens de ${nomeCoruja()} começou.`,polish:`O polimento das placas de ${nomeCoruja()} começou.`,explore:`${nomeCoruja()} partiu para explorar. Pista: procure ${resultado.exploration?.hint||'em outra página do blog'}.`};
 renderVidaCoruja(resultado.ok?mensagens[acao]:resultado.message);
}
function usarFerramentaBancada(quanto=20){const antes=vidaCoruja.snapshot(),resultado=vidaCoruja.work(quanto);if(!resultado.ok){renderVidaCoruja(resultado.message);return;}if(visualCoruja)window.CorujaVisual.motion(visualCoruja,antes.mode==='maintaining'?'puff':'happy');window.CorujaSom?.play(antes.mode==='maintaining'?'maintain':'happy',{special:corujaDeOculos});const terminou=resultado.mode==='idle',recado=terminou?(antes.mode==='maintaining'?`As engrenagens de ${nomeCoruja()} ficaram firmes e alinhadas.`:`As placas de ${nomeCoruja()} ficaram limpas e brilhantes.`):'';renderVidaCoruja(recado||undefined);}
const objetoFerramenta=ferramentaBancada.querySelector('[data-owl-tool]');let arrastoFerramenta=null,ferramentaMoveu=false;
objetoFerramenta?.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;arrastoFerramenta={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,acumulado:0,ultimoUso:0};ferramentaMoveu=false;objetoFerramenta.setPointerCapture?.(e.pointerId);objetoFerramenta.classList.add('is-usando');});
objetoFerramenta?.addEventListener('pointermove',e=>{if(!arrastoFerramenta||e.pointerId!==arrastoFerramenta.id)return;const dx=e.clientX-arrastoFerramenta.x,dy=e.clientY-arrastoFerramenta.y;ferramentaMoveu=ferramentaMoveu||Math.hypot(dx,dy)>6;objetoFerramenta.style.transform=`translate(${dx}px,${dy}px) rotate(${Math.max(-18,Math.min(18,dx/5))}deg)`;const passo=Math.hypot(e.clientX-arrastoFerramenta.lastX,e.clientY-arrastoFerramenta.lastY);arrastoFerramenta.acumulado+=passo;arrastoFerramenta.lastX=e.clientX;arrastoFerramenta.lastY=e.clientY;const r=moradoraCoruja?.getBoundingClientRect(),sobre=r&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;if(sobre&&arrastoFerramenta.acumulado>=24&&Date.now()-arrastoFerramenta.ultimoUso>90){arrastoFerramenta.acumulado=0;arrastoFerramenta.ultimoUso=Date.now();usarFerramentaBancada(5);}});
const soltarFerramenta=e=>{if(!arrastoFerramenta||e.pointerId!==arrastoFerramenta.id)return;arrastoFerramenta=null;objetoFerramenta.classList.remove('is-usando');objetoFerramenta.style.transform='';};objetoFerramenta?.addEventListener('pointerup',soltarFerramenta);objetoFerramenta?.addEventListener('pointercancel',soltarFerramenta);
objetoFerramenta?.addEventListener('click',e=>{if(ferramentaMoveu){ferramentaMoveu=false;e.preventDefault();return;}usarFerramentaBancada(20);});
ferramentaBancada.querySelector('[data-owl-tool-step]')?.addEventListener('click',()=>usarFerramentaBancada(25));
tocaCoruja?.querySelectorAll('[data-owl-action]').forEach(botao=>botao.addEventListener('click',()=>executarAcao(botao.dataset.owlAction)));
tocaCoruja?.addEventListener('close',()=>{if(!visita&&corujaIdentificada())vidaCoruja.save();});
const nascimento=$('nascimento-coruja'),imagemNascimento=$('nascimento-coruja-imagem'),textoNascimento=$('nascimento-coruja-texto'),formNome=$('nomear-coruja'),campoNome=$('nome-coruja'),erroNome=$('erro-nome-coruja'),botaoAtivar=$('ativar-coruja');
const pausaNascimento=matchMedia('(prefers-reduced-motion: reduce)').matches?80:900;
function abrirNascimento(){
 nascimento.dataset.birthState='egg';imagemNascimento.src='assets/sala/coruja-hefesto-ovo-fechado.png';
 textoNascimento.innerHTML='<strong>PROTOCOLO DE ATIVAÇÃO</strong><span>Origem: Oficina de Hefesto</span>';
 botaoAtivar.hidden=false;botaoAtivar.disabled=false;formNome.hidden=true;erroNome.textContent='';campoNome.value='';nascimento.showModal();botaoAtivar.focus();
}
function interagirCoruja(id){
 if(corujaIdentificada())return abrirTela('toca-coruja');
 const recado=textoCoruja();
 if(leitura||!corujaNasceu()){status(recado);return recadoNoObjeto(id,recado);}
 abrirNascimento();
}
botaoAtivar?.addEventListener('click',async()=>{
 botaoAtivar.disabled=true;nascimento.dataset.birthState='activating';textoNascimento.innerHTML='<strong>ATIVAÇÃO EM CURSO</strong><span>O núcleo violeta respondeu.</span>';
 await new Promise(r=>setTimeout(r,pausaNascimento));
 nascimento.dataset.birthState='transforming';imagemNascimento.src='assets/sala/coruja-hefesto-ovo.png';textoNascimento.innerHTML='<strong>REORGANIZANDO PLACAS</strong><span>Uma nova forma está despertando.</span>';
 await new Promise(r=>setTimeout(r,pausaNascimento));
 nascimento.dataset.birthState='naming';imagemNascimento.src=corujaDeOculos?'assets/sala/coruja-hefesto-oculos.png':`assets/sala/coruja-hefesto-pose-${corCoruja.id}.png`;textoNascimento.innerHTML='<strong>IDENTIFICAÇÃO NECESSÁRIA</strong><span>A unidade aguarda um nome.</span>';botaoAtivar.hidden=true;formNome.hidden=false;campoNome.focus();
});
formNome?.addEventListener('submit',async e=>{
 e.preventDefault();const nome=campoNome.value.trim().replace(/\s+/g,' ');
 if(!nome||nome.length>24||!/^[\p{L}\p{M}0-9 .'-]+$/u.test(nome)){erroNome.textContent='Use de 1 a 24 caracteres: letras, números, espaços, ponto, hífen ou apóstrofo.';campoNome.focus();return;}
 const botao=formNome.querySelector('button');botao.disabled=true;botao.textContent='Vinculando ao Passaporte…';erroNome.textContent='';
 try{
  await Percurso.requisitar('percurso',{method:'POST',body:JSON.stringify({chaves:{'sofia-student-owl-name':nome,'sofia-student-owl-identity':'registered','sofia-student-owl-unlocked':'unlocked'}})});
  localStorage.setItem('sofia-student-owl-name',nome);localStorage.setItem('sofia-student-owl-identity','registered');localStorage.setItem('sofia-student-owl-unlocked','unlocked');vidaCoruja.save();
  nascimento.dataset.birthState='registered';textoNascimento.innerHTML=`<strong>IDENTIDADE REGISTRADA</strong><span></span>`;textoNascimento.querySelector('span').textContent=`${nome} agora está vinculada ao seu Passaporte.`;formNome.hidden=true;atualizarTituloToca();renderRoom();renderTray();status(`${nome} nasceu e sua toca apareceu na estante.`);await new Promise(r=>setTimeout(r,pausaNascimento));nascimento.close();
 }catch(erro){erroNome.textContent='Não foi possível salvar o nome agora. Confira a conexão e tente novamente.';botao.disabled=false;botao.textContent='Confirmar nome';}
});
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
/* Quem ja tinha Sala salva nao repete a charada: os tres caminhos ja eram
   livres antes dela existir. So uma Sala nova (sem remote.estado) comeca
   com o enigma ativo. Uma vez gravado, este campo manda sozinho — nunca mais
   se olha para remote.estado depois desta linha. */
if(!state.enigma){
 const jaTinhaSala=!!remote.estado;
 state.enigma=jaTinhaSala?{book:true,notebook:true,postit:true,completed:true}:{book:false,notebook:false,postit:false,completed:false};
 /* Objetos da charada nao fazem sentido na Sala de quem a herdou pronta —
    sem isso ficariam soltos na visao geral pra sempre, sem explicacao. */
 if(jaTinhaSala)for(const d of roomItems.filter(i=>i.categoria))state.roomItems[d.id].placed=false;
}
/* Em leitura, um painel já preenchido também conta: se o aluno organizou um
   caso, a professora precisa vê-lo mesmo que o desbloqueio tenha mudado. */
const cases=Object.entries(D.casos).filter(([k,c])=>progresso(c.chave)||(visita&&state.paineis[k]));
if(!cases.some(([k])=>k===current))current=progresso(D.casos.tales.chave)?'tales':'heliopolis';
for(const [k,c] of cases){const o=el('option',c.nome);o.value=k;$('case-select').append(o);}
$('room-gate').hidden=true;$('room-content').hidden=false;
if(previewToca)setTimeout(()=>abrirTela('toca-coruja'),0);
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
function change(){if(visita)return;checkEnigma();dirty=true;cache();if(!conflict)status('Guardando suas mudanças…');clearTimeout(timer);timer=setTimeout(save,800);}
async function save(){if(visita||!dirty||saving||conflict)return;if(Percurso.codigo()!==owner){status('O passaporte mudou. Reabra a Sala.');return;}saving=true;const snapshot=JSON.stringify(state);try{const r=await Percurso.requisitar('sala',{method:'POST',body:JSON.stringify({estado:JSON.parse(snapshot),revisao:revision})});revision=r.revisao;dirty=JSON.stringify(state)!==snapshot;if(dirty)cache();else localStorage.removeItem(draftKey);status(dirty?'Guardando a próxima mudança…':'Tudo salvo no seu passaporte.');$('retry-save').hidden=true;}catch(e){status(e.message);$('retry-save').hidden=e.status===409;conflict=e.status===409;if(conflict)$('reload-room').hidden=false;cache();}finally{saving=false;}if(dirty&&!conflict&&$('retry-save').hidden)timer=setTimeout(save,800);}
$('retry-save').onclick=save;$('reload-room').onclick=()=>{localStorage.setItem('sala-copia:'+owner+':'+Date.now(),JSON.stringify(state));localStorage.removeItem(draftKey);dirty=false;location.reload();};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});window.addEventListener('online',save);

/* O recado do enigma some sob "Guardando suas mudanças…", que change() escreve
   logo depois — mesmo problema documentado para a planta. Reaparece depois
   pelo mesmo remédio: escrever de novo, atrasado. */
function recadoDoEnigma(texto){status(texto);clearTimeout(recadoDoEnigma.t);recadoDoEnigma.t=setTimeout(()=>status(texto),1400);}
/* Onde cada caminho fica, em porcentagem do palco — lido do proprio hotspot,
   nao duplicado como numero magico aqui, para nunca desalinhar do CSS. */
function hotspotRect(view){const n=document.querySelector('.hotspot-'+view);if(!n)return null;const palco=$('room-stage').getBoundingClientRect(),r=n.getBoundingClientRect();return{x:(r.left-palco.left)/palco.width*100,y:(r.top-palco.top)/palco.height*100,w:r.width/palco.width*100,h:r.height/palco.height*100};}
function itemCentro(d,s){return{x:s.x+d.w/2,y:s.y+(d.w/d.ratio)/2};}
function dentroDoCaminho(d,s,view){const rect=hotspotRect(view);if(!rect)return false;const c=itemCentro(d,s);return c.x>=rect.x&&c.x<=rect.x+rect.w&&c.y>=rect.y&&c.y<=rect.y+rect.h;}
/* Cada acerto e permanente: uma vez true, nunca mais se reavalia sozinho —
   e assim que tirar o livro depois nao tranca o caminho de novo, sem
   precisar de nenhuma regra extra pra isso. */
function checkEnigma(){
 if(visita||state.enigma.completed)return;
 const e=state.enigma,alvo={book:'shelf',notebook:'desk',postit:'board'};let novos=0;
 for(const categoria of ['book','notebook','postit']){
  if(e[categoria])continue;
  const d=roomItems.find(i=>i.categoria===categoria),s=d&&state.roomItems[d.id];
  if(s?.placed&&dentroDoCaminho(d,s,alvo[categoria])){e[categoria]=true;novos++;const n=document.querySelector('.room-item[data-id="'+d.id+'"]');if(n){n.classList.remove('brilho-enigma');void n.offsetWidth;n.classList.add('brilho-enigma');}}
 }
 if(novos){
  const total=['book','notebook','postit'].filter(c=>e[c]).length;
  recadoDoEnigma({1:'A Sala respondeu.',2:'Outro caminho parece despertar.',3:'A Sala reconheceu a ordem.'}[total]||'');
 }
 if(e.book&&e.notebook&&e.postit){
  e.completed=true;
  for(const categoria of ['book','notebook','postit']){const d=roomItems.find(i=>i.categoria===categoria);if(d)state.roomItems[d.id].placed=false;}
  updateHotspots();playUnlockSequence();renderRoom();renderTray();
 }
}
/* Ha tres jeitos de pedir uma view — os tres precisam concordar sobre o
   que esta trancado, senao o botao de cima da pagina vira um atalho que
   pula a charada inteira. */
function caminhoTrancado(v){return !visita&&!state.enigma.completed&&(v==='shelf'||v==='desk'||v==='board');}
function irPara(v){if(caminhoTrancado(v)){status('Este caminho ainda não despertou.');return;}setView(v);}
function updateHotspots(){const dormant=!visita&&!state.enigma.completed;for(const v of['shelf','desk','board']){const n=document.querySelector('.hotspot-'+v);if(n){n.classList.toggle('hotspot--dormant',dormant);if(dormant)n.setAttribute('aria-label','Este caminho ainda não despertou.');else n.removeAttribute('aria-label');}
 const tab=document.querySelector('[data-view="'+v+'"]');if(tab){tab.classList.toggle('hotspot--dormant',dormant);tab.setAttribute('aria-disabled',String(dormant));if(dormant)tab.setAttribute('aria-label',tab.textContent+'. Este caminho ainda não despertou.');else tab.removeAttribute('aria-label');}}}
function playUnlockSequence(){['shelf','desk','board'].forEach((v,i)=>{const alvos=[document.querySelector('.hotspot-'+v),document.querySelector('[data-view="'+v+'"]')].filter(Boolean);setTimeout(()=>{alvos.forEach(n=>{n.classList.add('hotspot--acordando');setTimeout(()=>n.classList.remove('hotspot--acordando'),900);});},i*350);});recadoDoEnigma('A Sala reconheceu a ordem.');}

function setView(next){view=next;selectedRoom=null;const meta=viewData[view];$('room-stage').dataset.view=view;$('room-stage').dataset.pack=state.appearance.pack;$('room-stage').dataset.wall=state.appearance.wall;$('package-select').value=state.appearance.pack;$('wall-select').value=state.appearance.wall;$('scene').src=sceneFor(meta);$('scene').alt=meta.alt;$('view-description').textContent=meta.description;$('customization-title').textContent=meta.title;$('hotspots').hidden=view!=='overview';$('overview-decor').hidden=view!=='overview';$('board-layer').hidden=view!=='board';$('case-question-wrap').hidden=view!=='board';$('selection').hidden=true;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));renderRoom();renderTray();if(view==='board'){renderCase();requestAnimationFrame(drawLines);}}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>irPara(b.dataset.view));document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>irPara(b.dataset.go));
$('previous-view').onclick=()=>irPara(views[(views.indexOf(view)+views.length-1)%views.length]);$('next-view').onclick=()=>irPara(views[(views.indexOf(view)+1)%views.length]);
function roomPosition(n,s){n.style.left=s.x+'%';n.style.top=s.y+'%';}
function selectRoom(id){selectedRoom=id;document.querySelectorAll('.room-item').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.id===id)));const d=itemById(id),s=state.roomItems[id];$('selected-controls').hidden=!d;if(!d)return;$('selected-item-name').textContent=nomeItem(d);$('toggle-item-state').hidden=!d.states;$('zoom-room-item').hidden=!d.zoomable;if(d.states)$('toggle-item-state').textContent=d.action[s.state];}
function toggleState(id){if(leitura)return;const d=itemById(id),s=state.roomItems[id];if(!d?.states)return;let recado='';if(d.plant){const now=Date.now(),last=Number(s.lastWatered||0);
 if(now-last<ESPERA_DA_REGA&&s.state!=='sede'){
  const faltam=Math.ceil((ESPERA_DA_REGA-(now-last))/3600000);
  const espera='A planta ainda está bem regada. Volte em '+faltam+(faltam===1?' hora.':' horas.');
  status(espera);recadoNoObjeto(id,espera);return;}
 /* A rega sempre conta, mesmo quando nao muda nada: e ela que adia o
    abandono. Se a planta florida so ouvisse 'ja esta florida' sem o
    lastWatered mudar, quem regasse todo dia acharia a planta murcha. */
 s.lastWatered=now;
 if(s.state==='sede'){s.state=s.stage||'florida';delete s.stage;recado='A planta se recuperou.';}
 else if(s.state==='florida')recado='Ela já está florida. A rega mantém.';
 else{s.state=d.states[Math.min(3,Math.max(0,d.states.indexOf(s.state))+1)];
  recado=s.state==='florida'?'A planta floresceu.':'A planta recebeu água.';}}else s.state=d.states[(d.states.indexOf(s.state)+1)%d.states.length];renderRoom();selectRoom(id);change();if(recado){recadoDaPlanta(recado);recadoNoObjeto(id,recado);molhar(id);}}
/* O no do objeto e refeito a cada renderRoom, entao a agua so pode ser
   pedida depois dele — a classe posta antes morreria com o no antigo. */
function molhar(id){const n=document.querySelector('.room-item[data-id="'+id+'"]');if(!n)return;
 n.classList.remove('regando');void n.offsetWidth;n.classList.add('regando');
 setTimeout(()=>n.classList.remove('regando'),950);}
/* O recado da planta divide a linha com o estado do salvamento, e perdia:
   change() escreve 'Guardando...' no mesmo instante, antes de qualquer
   pintura, e o aluno nunca chegava a ler que a planta floresceu. Dizer
   depois do change() faz aparecer; repetir depois do salvamento faz ficar.
   O 'Tudo salvo' se perde nessa rega — e o recado vale mais. */
function recadoDaPlanta(texto){status(texto);clearTimeout(recadoDaPlanta.t);recadoDaPlanta.t=setTimeout(()=>status(texto),1400);}
/* O balao nasce e morre junto do objeto que falou. */
function recadoNoObjeto(id,texto){const n=document.querySelector('.room-item[data-id="'+id+'"]'),b=$('recado-objeto');
 if(!n||!b)return;const palco=$('room-stage').getBoundingClientRect(),r=n.getBoundingClientRect();
 const x=(r.left+r.width/2-palco.left)/palco.width*100, y=(r.top-palco.top)/palco.height*100;
 b.textContent=texto;
 /* Encostado no alto do palco nao ha espaco acima: o balao desce para dentro. */
 b.style.setProperty('--nota-x',Math.max(18,Math.min(82,x))+'%');
 b.style.setProperty('--nota-y',(y<16?y+(r.height/palco.height*100)+9:y-3)+'%');
 /* Forcar o calculo do layout, em vez de esperar um quadro: com a aba em
    segundo plano o requestAnimationFrame nao chega, e o balao ficava posto
    porem invisivel. */
 b.hidden=false;b.classList.remove('aparece');void b.offsetWidth;b.classList.add('aparece');
 clearTimeout(recadoNoObjeto.t);clearTimeout(recadoNoObjeto.t2);
 recadoNoObjeto.t=setTimeout(()=>{b.classList.remove('aparece');
  recadoNoObjeto.t2=setTimeout(()=>{b.hidden=true;},260);},2600);}
function renderRoom(){sincronizarCoruja();const host=$('placed-items'),rug=$('rug');host.replaceChildren();$('room-stage').dataset.pack=state.appearance.pack;$('room-stage').dataset.wall=state.appearance.wall;$('scene').src=sceneFor(viewData[view]);rug.style.setProperty('--rug-image',`url('${state.appearance.pack==='sofia2'?'assets/sala/tapete-sofia-2.png':'assets/sala/tapete-retangular.png'}')`);rug.style.setProperty('--rug-x',state.appearance.rugX+'%');rug.style.setProperty('--rug-y',state.appearance.rugY+'%');const palco=$('room-stage'),persiana=$('blind'),janela=viewData[view].blind;palco.dataset.blind=state.appearance.blind;palco.dataset.time=state.appearance.time;if(arteDaHora(viewData[view]))delete palco.dataset.veu;else palco.dataset.veu='sim';palco.dataset.roomLight=state.appearance.roomLight;persiana.style.setProperty('--blind-x',janela.x+'%');persiana.style.setProperty('--blind-y',janela.y+'%');persiana.style.setProperty('--blind-w',janela.w+'%');persiana.style.setProperty('--blind-h',janela.h+'%');rug.hidden=!state.appearance.rug;rug.tabIndex=leitura?-1:0;rug.setAttribute('aria-label','Tapete.'+(leitura?'':' Arraste ou use as setas para mover.'));$('lights').dataset.state=state.appearance.lights;for(const d of roomItems.filter(i=>i.view===view)){const s=state.roomItems[d.id];if(!s.placed)continue;const n=el('button');n.type='button';n.className='room-item';n.dataset.id=d.id;n.dataset.state=s.state;n.dataset.recolored=String(!!blueAssets[d.id]);if(d.sprite)n.dataset.sprite=d.sprite;if(d.owl)n.dataset.owl=corujaIdentificada()?'hatched':'egg';n.style.setProperty('--item-image',`url('${assetFor(d)}')`);n.style.setProperty('--item-w',larguraItem(d)+'%');n.style.setProperty('--item-ratio',d.owl&&corujaIdentificada()?1.5:d.ratio);/* Na leitura o rotulo nao promete acao: o objeto esta ali para ser visto. */
  n.setAttribute('aria-label',leitura?nomeItem(d)+'. '+(d.owl?textoCoruja():'Somente leitura.'):nomeItem(d)+(d.owl?'. '+textoCoruja():'')+(d.states?'. '+d.action[s.state]+'.':'')+(d.abre?'. Abrir a tela.':'')+' Arraste ou use as setas para mover.');n.setAttribute('aria-pressed',String(d.id===selectedRoom));roomPosition(n,s);host.append(n);if(leitura){n.tabIndex=d.owl&&corujaIdentificada()?0:-1;n.onclick=()=>d.owl?interagirCoruja(d.id):undefined;continue;}let drag=null,moved=false;n.onpointerdown=e=>{if(e.button!==0)return;selectRoom(d.id);drag={clientX:e.clientX,clientY:e.clientY,x:s.x,y:s.y,id:e.pointerId};moved=false;n.setPointerCapture(e.pointerId);};n.onpointermove=e=>{if(!drag)return;const px=e.clientX-drag.clientX,py=e.clientY-drag.clientY;if(!moved&&Math.hypot(px,py)<=ARRASTO_MINIMO)return;moved=true;const rect=$('room-stage').getBoundingClientRect(),dx=px/rect.width*100,dy=py/rect.height*100;s.x=Math.max(0,Math.min(100-larguraItem(d),drag.x+dx));s.y=Math.max(0,Math.min(88,drag.y+dy));roomPosition(n,s);};n.onpointerup=n.onpointercancel=e=>{if(!drag)return;n.releasePointerCapture?.(drag.id);drag=null;if(e.type==='pointercancel')return;if(moved)change();else if(d.owl)interagirCoruja(d.id);else if(d.states)toggleState(d.id);else if(d.abre)abrirTela(d.abre);};n.onkeydown=e=>{if(d.owl&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return interagirCoruja(d.id);}if(d.abre&&(e.key==='Enter'||e.key===' ')){e.preventDefault();return abrirTela(d.abre);}const step={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!step)return;e.preventDefault();selectRoom(d.id);s.x=Math.max(0,Math.min(100-larguraItem(d),s.x+step[0]));s.y=Math.max(0,Math.min(88,s.y+step[1]));roomPosition(n,s);change();};}
 /* Eco da visão geral: mesmos objetos, outra posição (d.ov), sem
    interação nenhuma — quem edita é a mesa/estante, a visão geral só
    mostra o que já foi colocado lá, pra não parecer sempre vazia. */
 if(view==='overview')for(const d of roomItems.filter(i=>i.ov)){const s=state.roomItems[d.id];if(!s.placed)continue;const n=el('div');n.className='room-item room-item--echo';n.dataset.id=d.id;n.dataset.state=s.state;n.dataset.recolored=String(!!blueAssets[d.id]);if(d.sprite)n.dataset.sprite=d.sprite;if(d.owl)n.dataset.owl=corujaIdentificada()?'hatched':'egg';n.style.setProperty('--item-image',`url('${assetFor(d)}')`);n.style.setProperty('--item-w',(d.owl&&corujaIdentificada()?5.5:d.ov.w)+'%');n.style.setProperty('--item-ratio',d.owl&&corujaIdentificada()?1.5:d.ov.ratio);n.style.left=d.ov.x+'%';n.style.top=d.ov.y+'%';n.setAttribute('aria-hidden','true');host.append(n);}}
function trayButton(text,thumb,pressed,onclick){const b=el('button',text);b.type='button';b.className='tray-item';b.style.setProperty('--thumb',/^(url|linear|radial|repeating)/.test(thumb)?thumb:`url('${thumb}')`);b.setAttribute('aria-pressed',String(pressed));b.onclick=onclick;return b;}
function renderTray(){const tray=$('item-tray');tray.replaceChildren();$('selected-controls').hidden=true;if(leitura)return;if(view==='overview'){/* O tapete saiu da bandeja (retirado, nao apagado): quem ja tinha um
    continua vendo e podendo arrastar; so ninguem adiciona um novo. */const lights=trayButton('Cordão de luzes','assets/sala/cordao-luzes.png',state.appearance.lights==='on',()=>{state.appearance.lights=state.appearance.lights==='on'?'off':'on';renderRoom();renderTray();change();});const trocar=(campo,ligado,desligado)=>{state.appearance[campo]=state.appearance[campo]===ligado?desligado:ligado;renderRoom();renderTray();change();};const persiana=trayButton(state.appearance.blind==='closed'?'Persiana fechada':'Persiana aberta',"repeating-linear-gradient(180deg,#7a6047 0 16%,#584431 16% 21%)",state.appearance.blind==='closed',()=>trocar('blind','closed','open'));const luz=trayButton('Luz da sala',"radial-gradient(circle at 50% 36%,#ffe9bd,#7a5f33)",state.appearance.roomLight==='on',()=>trocar('roomLight','on','off'));const horas=['day','night','rain'];
 const nomeDaHora={day:'Fim de tarde',night:'Noite',rain:'Noite de chuva'};
 /* Cada miniatura desenha a SUA hora; quem escolhe qual mostrar e o
    proximaHora logo abaixo, junto com o rotulo. */
 const minDaHora={day:"linear-gradient(180deg,#f0c98a,#8c5f8e)",night:"linear-gradient(180deg,#171340,#4a3f73)",rain:"repeating-linear-gradient(105deg,#1b2246 0 3px,#3b4a7d 3px 5px)"};
 /* O rotulo e a miniatura mostram PARA ONDE o botao leva, nao onde se esta:
    num botao que gira, dizer o estado atual faz o aluno clicar para voltar. */
 const proximaHora=horas[(horas.indexOf(state.appearance.time)+1)%3];
 const noite=trayButton(nomeDaHora[proximaHora],minDaHora[proximaHora],state.appearance.time!=='day',()=>{state.appearance.time=proximaHora;renderRoom();renderTray();change();});tray.append(lights,persiana,luz,noite);
 /* Os objetos da charada somem da bandeja quando ela ja foi resolvida —
    nao ha mais o que colocar. */
 if(!state.enigma.completed)for(const d of roomItems.filter(i=>i.view==='overview'&&i.categoria)){const s=state.roomItems[d.id];tray.append(trayButton(d.name,assetFor(d),s.placed,()=>{s.placed=!s.placed;selectedRoom=s.placed?d.id:null;renderRoom();renderTray();change();}));}
 return;}if(view==='board'){tray.append(el('p','As pistas disponíveis ficam no Arquivo.'));return;}for(const d of roomItems.filter(i=>i.view===view&&!i.retirado)){const s=state.roomItems[d.id];tray.append(trayButton(nomeItem(d),assetFor(d),s.placed,()=>{s.placed=!s.placed;selectedRoom=s.placed?d.id:null;renderRoom();renderTray();change();}));}if(selectedRoom)selectRoom(selectedRoom);}
document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{if(!selectedRoom)return;const d=itemById(selectedRoom),s=state.roomItems[selectedRoom],[dx,dy]=b.dataset.nudge.split(',').map(Number);s.x=Math.max(0,Math.min(100-larguraItem(d),s.x+dx));s.y=Math.max(0,Math.min(88,s.y+dy));renderRoom();selectRoom(d.id);change();});
$('toggle-item-state').onclick=()=>selectedRoom&&toggleState(selectedRoom);$('zoom-room-item').onclick=()=>{const d=itemById(selectedRoom);if(!d?.zoomable)return;$('room-item-zoom-title').textContent=d.name;$('room-item-zoom-image').src=assetFor(d);$('room-item-zoom-image').alt=d.name+' ampliado';zReset();$('room-item-zoom').showModal();};$('remove-room-item').onclick=()=>{if(!selectedRoom)return;state.roomItems[selectedRoom].placed=false;selectedRoom=null;renderRoom();renderTray();change();};

/* Ampliação com pinça e arraste. A imagem some do fluxo (transform-origin
   0 0) e o resto é matemática de manter, a cada quadro, o ponto sob os
   dedos no mesmo lugar da tela — sem isso o zoom "foge" da direção do
   gesto. offsetLeft/offsetTop/offsetWidth/offsetHeight não mudam com a
   transformação, então servem de base fixa para o recorte. */
const zoomImg=$('room-item-zoom-image'), zoomViewport=document.querySelector('.room-item-zoom-viewport'), zoomDialog=$('room-item-zoom');
let zScale=1,zOx=0,zOy=0;
const zMin=1,zMax=4;
const zPointers=new Map();
let zPinchDist=0,zPinchMid={x:0,y:0};
let zPanId=null,zPanLast={x:0,y:0};
let zLastTap=0,zLastTapPt=null;
function zLocalPoint(e){const r=zoomViewport.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function zDist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function zMid(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2};}
function zApply(snap){
 const bx=zoomImg.offsetLeft,by=zoomImg.offsetTop,bw=zoomImg.offsetWidth,bh=zoomImg.offsetHeight;
 const vw=zoomViewport.clientWidth,vh=zoomViewport.clientHeight;
 const rw=bw*zScale,rh=bh*zScale;
 const left=rw<=vw?(vw-rw)/2:Math.min(0,Math.max(vw-rw,bx+zOx));
 const top=rh<=vh?(vh-rh)/2:Math.min(0,Math.max(vh-rh,by+zOy));
 zOx=left-bx;zOy=top-by;
 zoomImg.classList.toggle('is-snapping',!!snap);
 zoomImg.style.transform=`translate(${zOx}px,${zOy}px) scale(${zScale})`;
 zoomImg.classList.toggle('is-zoomed',zScale>1.02);
}
function zReset(){zScale=1;zOx=0;zOy=0;zPointers.clear();zPanId=null;zLastTapPt=null;zoomImg.classList.remove('is-panning');zApply(false);}
zoomImg?.addEventListener('dragstart',e=>e.preventDefault());
zoomImg?.addEventListener('pointerdown',e=>{
 zoomImg.setPointerCapture(e.pointerId);
 zPointers.set(e.pointerId,zLocalPoint(e));
 if(zPointers.size===2){const[a,b]=[...zPointers.values()];zPinchDist=Math.max(zDist(a,b),1);zPinchMid=zMid(a,b);zPanId=null;zoomImg.classList.remove('is-panning');}
 else if(zPointers.size===1&&zScale>1.02){zPanId=e.pointerId;zPanLast=zLocalPoint(e);zoomImg.classList.add('is-panning');}
});
zoomImg?.addEventListener('pointermove',e=>{
 if(!zPointers.has(e.pointerId))return;
 zPointers.set(e.pointerId,zLocalPoint(e));
 if(zPointers.size===2){
  const[a,b]=[...zPointers.values()];
  const dist=Math.max(zDist(a,b),1),mid=zMid(a,b);
  const bx=zoomImg.offsetLeft,by=zoomImg.offsetTop;
  const localX=(zPinchMid.x-bx-zOx)/zScale,localY=(zPinchMid.y-by-zOy)/zScale;
  const newScale=Math.min(zMax,Math.max(zMin,zScale*(dist/zPinchDist)));
  zOx=zPinchMid.x-bx-localX*newScale+(mid.x-zPinchMid.x);
  zOy=zPinchMid.y-by-localY*newScale+(mid.y-zPinchMid.y);
  zScale=newScale;zApply(false);
  zPinchDist=dist;zPinchMid=mid;
 } else if(zPanId===e.pointerId){
  const pt=zLocalPoint(e);
  zOx+=pt.x-zPanLast.x;zOy+=pt.y-zPanLast.y;zPanLast=pt;
  zApply(false);
 }
});
function zEndPointer(e){
 zPointers.delete(e.pointerId);
 try{zoomImg.releasePointerCapture(e.pointerId);}catch{}
 if(zPanId===e.pointerId){zPanId=null;zoomImg.classList.remove('is-panning');}
 if(zPointers.size===1&&zScale>1.02){
  const[only]=[...zPointers.entries()];
  zPanId=only[0];zPanLast=only[1];zoomImg.classList.add('is-panning');
 }
 if(zPointers.size===0&&zPanId===null){
  const pt=zLocalPoint(e),now=Date.now();
  if(zLastTapPt&&now-zLastTap<320&&zDist(pt,zLastTapPt)<24){
   zLastTap=0;zLastTapPt=null;
   if(zScale>1.02){zScale=1;zOx=0;zOy=0;}
   else{const bx=zoomImg.offsetLeft,by=zoomImg.offsetTop,alvo=2.6;zOx=(pt.x-bx)*(1-alvo);zOy=(pt.y-by)*(1-alvo);zScale=alvo;}
   zApply(true);
   window.setTimeout(()=>zoomImg.classList.remove('is-snapping'),260);
  } else {zLastTap=now;zLastTapPt=pt;}
 }
}
zoomImg?.addEventListener('pointerup',zEndPointer);
zoomImg?.addEventListener('pointercancel',zEndPointer);
zoomImg?.addEventListener('wheel',e=>{
 e.preventDefault();
 const pt=zLocalPoint(e);
 const bx=zoomImg.offsetLeft,by=zoomImg.offsetTop;
 const localX=(pt.x-bx-zOx)/zScale,localY=(pt.y-by-zOy)/zScale;
 const newScale=Math.min(zMax,Math.max(zMin,zScale*Math.exp(-e.deltaY*0.0015)));
 zOx=pt.x-bx-localX*newScale;zOy=pt.y-by-localY*newScale;zScale=newScale;
 zApply(false);
},{passive:false});
zoomDialog?.addEventListener('close',zReset);
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
 if(id==='toca-coruja')renderVidaCoruja();
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
$('reset-view').onclick=()=>{if(view==='overview')state.appearance={...state.appearance,wall:'lilas',rug:false,rugX:13,rugY:67,lights:'on',blind:'open',time:'day',roomLight:'off'};for(const d of roomItems.filter(i=>i.view===view&&!(state.enigma.completed&&d.categoria)))state.roomItems[d.id]={x:d.x,y:d.y,state:d.states?.[0]||'default',placed:!!d.defaultPlaced};selectedRoom=null;renderRoom();renderTray();change();};

const rug=$('rug');let rugDrag=null;
rug.onpointerdown=e=>{if(leitura||e.button!==0)return;rugDrag={clientX:e.clientX,clientY:e.clientY,x:state.appearance.rugX,y:state.appearance.rugY,id:e.pointerId};rug.setPointerCapture(e.pointerId);};
rug.onpointermove=e=>{if(!rugDrag)return;const rect=$('room-stage').getBoundingClientRect(),dx=(e.clientX-rugDrag.clientX)/rect.width*100,dy=(e.clientY-rugDrag.clientY)/rect.height*100;state.appearance.rugX=Math.max(0,Math.min(26,rugDrag.x+dx));state.appearance.rugY=Math.max(48,Math.min(78,rugDrag.y+dy));rug.style.setProperty('--rug-x',state.appearance.rugX+'%');rug.style.setProperty('--rug-y',state.appearance.rugY+'%');};
rug.onpointerup=rug.onpointercancel=e=>{if(!rugDrag)return;rug.releasePointerCapture?.(rugDrag.id);rugDrag=null;change();};
rug.onkeydown=e=>{const step={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(leitura||!step)return;e.preventDefault();state.appearance.rugX=Math.max(0,Math.min(26,state.appearance.rugX+step[0]));state.appearance.rugY=Math.max(48,Math.min(78,state.appearance.rugY+step[1]));renderRoom();change();};

function available(){return D.itens.filter(i=>D.disponivel(i));}function clue(id){return D.itens.find(i=>i.id===id);}
function drawLines(){const svg=$('threads');svg.replaceChildren();for(const [a,b]of panel().ligacoes){const na=document.querySelector('[data-clue="'+a+'"]'),nb=document.querySelector('[data-clue="'+b+'"]');if(!na||!nb)continue;const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',na.offsetLeft+na.offsetWidth/2);l.setAttribute('y1',na.offsetTop+na.offsetHeight/2);l.setAttribute('x2',nb.offsetLeft+nb.offsetWidth/2);l.setAttribute('y2',nb.offsetTop+nb.offsetHeight/2);svg.append(l);}}
function cluePosition(n,i){n.style.left=(i.x/100*Math.max(0,$('board').clientWidth-n.offsetWidth))+'px';n.style.top=(i.y/100*Math.max(0,$('board').clientHeight-n.offsetHeight))+'px';}
function moveClue(i,x,y){i.x=Math.max(0,Math.min(100,x));i.y=Math.max(0,Math.min(100,y));const n=document.querySelector('[data-clue="'+i.id+'"]');if(n)cluePosition(n,i);drawLines();$('move-x').value=i.x;$('move-y').value=i.y;}
function chooseClue(id){if(leitura)return;selected=id;document.querySelectorAll('.board-card').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.clue===id)));$('selection').hidden=!id||view!=='board';if(!id)return;const i=panel().itens.find(i=>i.id===id);$('selected-title').textContent=clue(id).titulo;$('move-x').value=i.x;$('move-y').value=i.y;$('connect-target').replaceChildren();for(const other of panel().itens.filter(i=>i.id!==id&&clue(i.id)&&!panel().ligacoes.some(l=>l.includes(id)&&l.includes(i.id)))){const o=el('option',clue(other.id).titulo);o.value=other.id;$('connect-target').append(o);}$('connect').disabled=!$('connect-target').options.length;$('connections').replaceChildren();panel().ligacoes.filter(l=>l.includes(id)).forEach(l=>{const b=el('button','Desfazer ligação com '+(clue(l.find(k=>k!==id))?.titulo||'pista removida'));b.onclick=()=>{panel().ligacoes=panel().ligacoes.filter(x=>x!==l);drawLines();chooseClue(id);change();};$('connections').append(b);});}
function drawBoard(){$('board-items').replaceChildren();const list=panel().itens.filter(i=>clue(i.id)&&D.disponivel(clue(i.id)));$('board-empty').hidden=!!list.length;for(const i of list){const d=clue(i.id),n=el('button');n.type='button';n.className='board-card';n.dataset.clue=i.id;n.setAttribute('aria-pressed',String(i.id===selected));n.setAttribute('aria-label',d.titulo+'. Selecionar para examinar, mover ou conectar.');n.append(el('small',d.tipo));if(d.imagem){const im=el('img');im.src=d.imagem;im.alt='';im.draggable=false;n.append(im);}n.append(el('strong',d.titulo));$('board-items').append(n);cluePosition(n,i);n.onclick=()=>leitura?examine(i.id):chooseClue(i.id);if(leitura)continue;let drag=null;n.onpointerdown=e=>{if(e.button!==0)return;chooseClue(i.id);drag={x:e.clientX,y:e.clientY,px:i.x,py:i.y};n.setPointerCapture(e.pointerId);};n.onpointermove=e=>{if(!drag)return;moveClue(i,drag.px+(e.clientX-drag.x)/Math.max(1,$('board').clientWidth-n.offsetWidth)*100,drag.py+(e.clientY-drag.y)/Math.max(1,$('board').clientHeight-n.offsetHeight)*100);};n.onpointerup=n.onpointercancel=()=>{if(drag){const changed=i.x!==drag.px||i.y!==drag.py;drag=null;if(changed)change();}};n.onkeydown=e=>{const steps={ArrowLeft:[-3,0],ArrowRight:[3,0],ArrowUp:[0,-3],ArrowDown:[0,3]};if(steps[e.key]){e.preventDefault();chooseClue(i.id);moveClue(i,i.x+steps[e.key][0],i.y+steps[e.key][1]);change();}};}drawLines();chooseClue(selected&&list.some(i=>i.id===selected)?selected:null);}
function renderCase(){const c=D.casos[current];$('case-select').value=current;$('case-question').textContent=c.pergunta;$('case-label').textContent=current==='universo'?'Uma pergunta para levar com você':'Caso · '+c.nome;$('case-post').hidden=!c.post;if(c.post)$('case-post').href=c.post;$('note').value=panel().nota;$('conclusion').value=panel().conclusao;selected=null;drawBoard();renderArchive();}
$('case-select').onchange=()=>{current=$('case-select').value;if(!visita)history.replaceState(null,'','?caso='+current);renderCase();};
function examine(id){examined=id;const d=clue(id);$('examiner-title').textContent=d.titulo;$('examiner-origin').textContent=D.origem(d);if(d.registros){const feitos=d.registros.filter(r=>D.ler(r.chave));$('examiner-text').innerHTML=feitos.length?'<ul class="examiner-records">'+feitos.map(r=>'<li>'+r.texto+'</li>').join('')+'</ul>':'Nenhum registro liberado ainda.';}else{$('examiner-text').textContent=d.texto;}$('examiner-source').textContent=d.fonte||'';$('examiner-image').hidden=!d.imagem;if(d.imagem){$('examiner-image').src=d.imagem;$('examiner-image').alt=d.titulo;}$('place-item').disabled=panel().itens.some(i=>i.id===id);$('placed-status').textContent=$('place-item').disabled?'Esta pista já está no painel.':'';$('examiner').showModal();}
function renderArchive(){if(!state)return;const filter=$('filter').value,list=available().filter(i=>filter==='todos'||filter==='caso'&&(current==='universo'||i.caso===current)||i.tipo===filter);$('archive-items').replaceChildren();if(!list.length)$('archive-items').append(el('p','Nenhum item aqui ainda. Você pode ver todas as descobertas ou voltar à história.'));list.forEach(d=>{const b=el('button');b.className='archive-item';if(d.imagem){const im=el('img');im.src=d.imagem;im.alt='';im.loading='lazy';b.append(im);}b.append(el('small',D.origem(d)),el('strong',d.titulo),el('span','Examinar →'));b.onclick=()=>examine(d.id);$('archive-items').append(b);});}
$('filter').onchange=renderArchive;$('open-archive').onclick=()=>{$('archive').hidden=false;$('filter').focus();};$('close-archive').onclick=()=>{$('archive').hidden=true;$('open-archive').focus();};
$('place-item').onclick=()=>{if(panel().itens.some(i=>i.id===examined))return;if(panel().itens.length>=30){$('placed-status').textContent='Este painel já tem 30 itens.';return;}const n=panel().itens.length;panel().itens.push({id:examined,x:10+(n%3)*35,y:10+(Math.floor(n/3)%3)*32});selected=examined;drawBoard();change();$('place-item').disabled=true;$('placed-status').textContent='Pista colocada no mural. Ela continua no seu inventário.';};
$('examine-selected').onclick=()=>examine(selected);$('remove-selected').onclick=()=>{panel().itens=panel().itens.filter(i=>i.id!==selected);panel().ligacoes=panel().ligacoes.filter(l=>!l.includes(selected));selected=null;drawBoard();change();};
for(const axis of ['x','y'])$('move-'+axis).oninput=()=>{const i=panel().itens.find(i=>i.id===selected);if(i){moveClue(i,axis==='x'?+$('move-x').value:i.x,axis==='y'?+$('move-y').value:i.y);change();}};
$('connect').onclick=()=>{const other=$('connect-target').value;if(other&&panel().ligacoes.length<60&&!panel().ligacoes.some(l=>l.includes(selected)&&l.includes(other))){panel().ligacoes.push([selected,other]);drawLines();chooseClue(selected);change();}};
$('note').oninput=()=>{panel().nota=$('note').value;change();};$('conclusion').oninput=()=>{panel().conclusao=$('conclusion').value;change();};$('conclude').onclick=()=>{if(!$('conclusion').value.trim()){status('Escreva uma frase antes de guardar sua conclusão.');$('conclusion').focus();return;}change();save();};
new ResizeObserver(()=>{if(view==='board'){panel().itens.forEach(i=>{const n=document.querySelector('[data-clue="'+i.id+'"]');if(n)cluePosition(n,i);});drawLines();}}).observe($('room-stage'));
window.addEventListener('percurso-atualizado',()=>{if(visita)return;if(Percurso.codigo()!==owner){$('room-content').hidden=true;$('room-gate').hidden=false;$('room-gate').textContent='O passaporte mudou. Reabra esta página para continuar.';status('Sala fechada.');}else renderArchive();});
updateHotspots();setView('overview');if(dirty&&!conflict)save();
/* A charada se apresenta sozinha sempre que a Sala abre e o enigma ainda
   nao foi resolvido — nao precisa achar o bilhete para saber que ele
   existe, nem lembrar de onde o deixou numa sessao anterior. Uma vez
   resolvido, nunca mais aparece sozinha; continua podendo ser relida a
   qualquer momento tocando o post-it (abre:'charada'). Nunca aparece na
   Area do Professor. */
let corujaNascidaNaTela=corujaNasceu();
function atualizarCorujaNaTela(){
 sincronizarCoruja();
 const nasceu=corujaNasceu();
 if(nasceu!==corujaNascidaNaTela){
  corujaNascidaNaTela=nasceu;
  renderRoom();renderTray();
  status('A incubação terminou. A toca da Coruja de Hefesto apareceu na estante!');
  return;
 }
 if(!nasceu){
  const n=document.querySelector('[data-id="corujinha_aluno"]');
  if(n)n.setAttribute('aria-label',nomeItem(itemById('corujinha_aluno'))+'. '+textoCoruja()+' Arraste ou use as setas para mover.');
 }
}
if(inicioCoruja()){
 const restante=inicioCoruja()+INCUBACAO_CORUJA-Date.now();
 if(restante>0)setTimeout(atualizarCorujaNaTela,restante);
 setInterval(atualizarCorujaNaTela,60000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)atualizarCorujaNaTela();});
}
if(!visita&&!state.enigma.completed)abrirTela('charada');
})();
