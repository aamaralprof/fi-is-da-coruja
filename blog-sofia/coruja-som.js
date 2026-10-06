/* Paisagem sonora procedural da Coruja de Hefesto.
 * Só cria o AudioContext depois de uma ação do usuário e não baixa arquivos. */
(function(){
'use strict';
if(window.CorujaSom)return;
const KEY='sofia-student-owl-sound';
const MASTER_VOLUME=2.4;
let context;
const enabled=()=>localStorage.getItem(KEY)!=='off';
const audio=()=>context||(context=new (window.AudioContext||window.webkitAudioContext)());
function tone(ctx,{at=0,freq=440,to=freq,duration=.1,type='sine',gain=.05}){
 const level=Math.min(.16,gain*MASTER_VOLUME),osc=ctx.createOscillator(),amp=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,ctx.currentTime+at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),ctx.currentTime+at+duration);amp.gain.setValueAtTime(.0001,ctx.currentTime+at);amp.gain.exponentialRampToValueAtTime(level,ctx.currentTime+at+.012);amp.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+at+duration);osc.connect(amp).connect(ctx.destination);osc.start(ctx.currentTime+at);osc.stop(ctx.currentTime+at+duration+.02);
}
function click(ctx,at=0,gain=.045){tone(ctx,{at,freq:170,to:70,duration:.055,type:'square',gain});}
function metal(ctx,{at=0,freq=760,gain=.028}={}){
 tone(ctx,{at,freq,to:freq*.72,duration:.095,type:'sine',gain});
 tone(ctx,{at:at+.008,freq:freq*1.68,to:freq*1.18,duration:.065,type:'triangle',gain:gain*.48});
}
function play(kind='chirp',options={}){
 if(!enabled()||!window.AudioContext&&!window.webkitAudioContext)return false;
 const ctx=audio();if(ctx.state==='suspended')ctx.resume();
 if(kind==='blink'){click(ctx,0,.035);click(ctx,.09,.025);}
 else if(kind==='tilt'){click(ctx,0,.03);tone(ctx,{at:.02,freq:145,to:82,duration:.26,type:'sawtooth',gain:.025});click(ctx,.24,.02);}
 else if(kind==='puff'){for(let i=0;i<5;i++)click(ctx,i*.052,.025+i*.004);tone(ctx,{at:.06,freq:105,to:58,duration:.42,type:'sawtooth',gain:.035});tone(ctx,{at:.42,freq:620,to:880,duration:.13,type:'sine',gain:.025});}
 else if(kind==='charge'){for(let i=0;i<6;i++)tone(ctx,{at:i*.055,freq:180+i*65,to:260+i*75,duration:.11,type:'square',gain:.022});tone(ctx,{at:.32,freq:500,to:1050,duration:.32,type:'sine',gain:.045});}
 else if(kind==='turn'){metal(ctx,{at:0,freq:680,gain:.025});metal(ctx,{at:.12,freq:860,gain:.022});metal(ctx,{at:.28,freq:620,gain:.027});metal(ctx,{at:.41,freq:980,gain:.02});}
 else if(kind==='inspect'){metal(ctx,{at:0,freq:650,gain:.024});metal(ctx,{at:.34,freq:880,gain:.02});metal(ctx,{at:.92,freq:710,gain:.024});metal(ctx,{at:1.32,freq:1040,gain:.019});metal(ctx,{at:1.78,freq:680,gain:.024});metal(ctx,{at:2.28,freq:900,gain:.021});metal(ctx,{at:2.72,freq:1180,gain:.018});}
 else if(kind==='gaze'){metal(ctx,{at:0,freq:940,gain:.014});metal(ctx,{at:.48,freq:820,gain:.013});metal(ctx,{at:.96,freq:1080,gain:.012});}
 else if(kind==='anger'){metal(ctx,{at:0,freq:430,gain:.035});metal(ctx,{at:.18,freq:390,gain:.038});metal(ctx,{at:.38,freq:350,gain:.042});tone(ctx,{at:.62,freq:180,to:260,duration:.42,type:'triangle',gain:.025});metal(ctx,{at:1.08,freq:720,gain:.03});metal(ctx,{at:1.24,freq:840,gain:.026});}
 else if(kind==='happy'){metal(ctx,{at:0,freq:860,gain:.016});tone(ctx,{at:.05,freq:560,to:840,duration:.16,type:'sine',gain:.035});tone(ctx,{at:.2,freq:760,to:1040,duration:.18,type:'sine',gain:.032});metal(ctx,{at:.58,freq:1040,gain:.014});tone(ctx,{at:.64,freq:680,to:920,duration:.2,type:'sine',gain:.03});}
 else if(kind==='sad'){tone(ctx,{at:0,freq:610,to:420,duration:.28,type:'sine',gain:.026});tone(ctx,{at:.32,freq:470,to:310,duration:.34,type:'sine',gain:.023});metal(ctx,{at:.78,freq:520,gain:.014});tone(ctx,{at:1.02,freq:330,to:240,duration:.42,type:'triangle',gain:.018});}
 else if(kind==='maintain'){click(ctx,0,.05);click(ctx,.13,.035);click(ctx,.25,.045);tone(ctx,{at:.3,freq:130,to:75,duration:.2,type:'sawtooth',gain:.02});}
 else if(kind==='rest'){tone(ctx,{freq:190,to:95,duration:.48,type:'sine',gain:.035});click(ctx,.42,.018);}
 else {tone(ctx,{freq:options.special?510:620,to:options.special?760:980,duration:.13,type:'sine',gain:.04});tone(ctx,{at:.12,freq:options.special?680:840,to:options.special?520:650,duration:.18,type:'sine',gain:.032});}
 return true;
}
function setEnabled(value){localStorage.setItem(KEY,value?'on':'off');return value;}
window.CorujaSom={play,enabled,toggle(){return setEnabled(!enabled())},setEnabled};
})();
