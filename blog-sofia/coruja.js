/* Vida da Coruja de Hefesto: estado pequeno, persistido pelo Percurso. */
(function(){
'use strict';
const KEY='sofia-student-owl-life',MAX=100;
const clamp=n=>Math.max(0,Math.min(MAX,Math.round(n)));
const base=()=>({version:2,charge:70,rest:75,mode:'idle',updatedAt:Date.now(),bond:0,lastGreeting:0,lastMaintenance:0,findings:[],exploration:null});
const parse=(raw)=>{try{return {...base(),...JSON.parse(raw||'{}')};}catch{return base();}};
const weights={documento:2,pista:3,objeto:2,emblema:5,decoracao:5};
const finds=[{at:20,id:'mola-celeste',name:'Mola celeste',text:'Uma pequena mola que ainda guarda luz violeta.'},{at:45,id:'fragmento-bronze',name:'Fragmento de bronze',text:'Uma placa sem encaixe conhecido, polida com cuidado.'},{at:75,id:'moeda-sem-origem',name:'Moeda sem origem',text:'Não traz data nem lugar, apenas uma coruja gravada.'}];
const expeditionFinds=[{id:'parafuso-cintilante',name:'Parafuso cintilante',text:'Brilha por alguns segundos quando alguém encontra uma pista.'},{id:'pena-de-cobre',name:'Pena de cobre',text:'Uma pena mecânica muito leve, marcada por linhas quase invisíveis.'},{id:'mapa-rascunhado',name:'Mapa rascunhado',text:'Mostra caminhos do blog, mas uma das rotas não termina no papel.'}];
const routes=[{page:'post-choveu-no-meu-caderno.html',hint:'perto de uma chuva que tocou um caderno'},{page:'post-o-liquidificador-cosmico.html',hint:'onde ingredientes improváveis giram juntos'},{page:'post-algumas-respostas-so-existem-a-noite.html',hint:'num lugar em que certas respostas só aparecem à noite'}];
function create(options){
 const read=options.read,write=options.write,items=options.items||[];let state=parse(read(KEY));
 function curiosity(){return items.reduce((sum,item)=>sum+(options.available(item)?(weights[item.tipo]||2):0),0);}
 function update(){
  const now=Date.now(),hours=Math.max(0,(now-(Number(state.updatedAt)||now))/3600000);
  if(state.mode==='resting'){state.rest=clamp(state.rest+hours*9);state.charge=clamp(state.charge+hours*2);if(state.rest>=100)state.mode='idle';}
  if(state.mode==='exploring'&&state.exploration&&now>=Number(state.exploration.returnsAt)){state.mode='idle';if(!state.findings.includes(state.exploration.finding))state.findings.push(state.exploration.finding);state.exploration={...state.exploration,status:'returned'};}
  state.updatedAt=now;
  for(const f of finds)if(curiosity()>=f.at&&!state.findings.includes(f.id))state.findings.push(f.id);
  return state;
 }
 function save(){update();if(write)write(KEY,JSON.stringify(state));return snapshot();}
 function act(kind){update();const now=Date.now();
  if(state.mode==='exploring'&&kind!=='explore')return {ok:false,message:'A coruja ainda está fora da toca.',...snapshot()};
  if(kind==='rest'){state.mode='resting';state.bond+=2;}
  if(kind==='charge'){state.charge=clamp(state.charge+35);state.mode='idle';state.bond+=1;}
  if(kind==='maintain'){if(now-state.lastMaintenance<6*3600000)return {ok:false,message:'As engrenagens ainda estão perfeitamente ajustadas.'};state.lastMaintenance=now;state.bond+=2;state.charge=clamp(state.charge+5);}
  if(kind==='greet'&&now-state.lastGreeting>=20*3600000){state.lastGreeting=now;state.bond+=1;state.charge=clamp(state.charge-1);}
  if(kind==='explore'){
   if(state.mode==='exploring')return {ok:false,message:'A exploração já está em andamento.',...snapshot()};
   const index=Math.abs(Math.floor(now/86400000)+(Number(state.bond)||0))%routes.length,route=routes[index],finding=expeditionFinds[index%expeditionFinds.length];
   state.mode='exploring';state.charge=clamp(state.charge-5);state.bond+=1;state.exploration={status:'away',target:route.page,hint:route.hint,startedAt:now,returnsAt:now+4*3600000,finding:finding.id};
  }
  save();return {ok:true,...snapshot()};
 }
 function bondStage(){return state.bond>=18?'companheirismo':state.bond>=9?'confiança':state.bond>=3?'reconhecimento':'desconfiança';}
 function snapshot(){update();return {...state,curiosity:curiosity(),bondStage:bondStage(),findings:[...finds,...expeditionFinds].filter(f=>state.findings.includes(f.id))};}
 update();return {snapshot,save,act,key:KEY};
}
window.CorujaHefesto={create};
})();
