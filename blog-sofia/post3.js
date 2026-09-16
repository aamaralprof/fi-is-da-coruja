(function(){
  'use strict';
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=ms=>reduced?Math.min(ms,120):ms;
  const save=(key,value='true')=>{try{localStorage.setItem('sofia-'+key,value)}catch{}};
  const playVoice=n=>{const a=$(`[data-atena="${n}"]`);if(!a)return;$$('audio[data-atena]').forEach(x=>{if(x!==a){x.pause();x.currentTime=0}});a.currentTime=0;a.play().catch(()=>{});};
  const reveal=el=>{el.hidden=false;requestAnimationFrame(()=>el.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));};

  const phone=$('[data-phone]'), flashlight=$('[data-flashlight]');
  flashlight?.addEventListener('click',async()=>{if(phone.classList.contains('is-dead'))return;flashlight.disabled=true;$('[data-phone-status]').textContent='A lanterna não respondeu.';await wait(duration(650));phone.classList.add('is-glitching');$('[data-battery]').textContent='1%';await wait(duration(520));phone.classList.remove('is-glitching');phone.classList.add('is-dead');$('[data-phone-status]').textContent='A tela apagou.';await wait(duration(700));startCeremony();});

  async function startCeremony(){const scene=$('[data-ceremony]');reveal(scene);await wait(duration(800));for(const el of $$('.representative',scene)){el.classList.add('is-flashing');await wait(duration(760));el.classList.remove('is-flashing');await wait(duration(220));}$('.ceremony-darkness',scene).style.opacity='.62';$('[data-ceremony-caption]').innerHTML='<p><strong>Sofia.</strong></p><p>Você veio procurar respostas. Comece olhando.</p>';playVoice(1);await wait(duration(3500));scene.classList.add('is-transitioning');reveal($('[data-trial-one]'));playVoice(2);}

  const objectData={
    card:{title:'Cartão de acesso',copy:'Um objeto claramente fora de época, parcialmente escondido entre os livros.',sofia:'— Isso definitivamente não pertence à estante.'},
    hourglass:{title:'Ampulheta inversa',copy:'Durante dois segundos, parece uma ampulheta comum.',sofia:'— Ah. Retiro o que disse.'},
    page:{title:'Fragmento de Tales',copy:'Um pedaço da página que apareceu no caderno durante a aula de Ciências.',sofia:'— Eu conheço isso.'}
  };
  const found=new Set();let currentObject=null;
  $$('[data-object]').forEach(btn=>btn.addEventListener('click',async()=>{currentObject=btn.dataset.object;const d=objectData[currentObject],dialog=$('[data-inspect-dialog]'),art=$('[data-inspect-art]');art.dataset.object=currentObject;art.setAttribute('aria-label',d.title);$('[data-inspect-title]').textContent=d.title;$('[data-inspect-copy]').textContent=d.copy;$('[data-inspect-sofia]').textContent=currentObject==='hourglass'?'':d.sofia;$('[data-mark-intruder]').disabled=found.has(currentObject);$('[data-mark-intruder]').textContent=found.has(currentObject)?'Intruso marcado':'Marcar como intruso';dialog.showModal();if(currentObject==='hourglass'){await wait(duration(2000));art.classList.add('is-reversing');$('[data-inspect-copy]').textContent='A areia sobe da parte inferior para a superior.';$('[data-inspect-sofia]').textContent=d.sofia;}}));
  $$('[data-distractor]').forEach(btn=>btn.addEventListener('click',()=>{btn.querySelector('span').textContent='nada incomum';setTimeout(()=>btn.querySelector('span').textContent='examinar',1200)}));
  $('[data-close-inspect]')?.addEventListener('click',()=>{$('[data-inspect-dialog]').close();$('[data-inspect-art]').classList.remove('is-reversing')});
  $('[data-mark-intruder]')?.addEventListener('click',async()=>{if(!currentObject||found.has(currentObject))return;found.add(currentObject);$(`[data-object="${currentObject}"]`).classList.add('is-found');$('[data-trial-one-status]').textContent=`${found.size} de 3 intrusos marcados.`;$('[data-inspect-dialog]').close();if(found.size===3){save('teste1_concluido');await wait(duration(650));await dismantleStudy();}});
  async function dismantleStudy(){const stage=$('[data-study-stage]');stage.classList.add('is-dismantling');stage.animate([{filter:'none',opacity:1},{filter:'blur(3px) grayscale(1)',opacity:.28},{filter:'blur(12px)',opacity:0}],{duration:duration(2200),fill:'forwards'});playVoice(3);await wait(duration(2300));reveal($('[data-trial-two]'));}

  const flipped=new Set();
  $$('[data-token]').forEach(btn=>btn.addEventListener('click',()=>{btn.setAttribute('aria-pressed','true');flipped.add(btn.dataset.token);if(flipped.size===3)$('[data-letter-choice]').hidden=false;}));
  $$('[data-letter]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.letter!=='S'){btn.animate([{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'none'}],{duration:250});return;}const letters=$$('[data-cipher-word] span');letters[3].textContent='S';$('[data-cipher-word]').classList.add('is-solved');$('[data-letter-choice]').hidden=true;$('[data-cipher-reaction]').hidden=false;$('[data-cipher-continue]').hidden=false;save('teste2_concluido');}));
  $('[data-cipher-continue]')?.addEventListener('pointerenter',breakCipher,{once:true});
  $('[data-cipher-continue]')?.addEventListener('focus',breakCipher,{once:true});
  $('[data-cipher-continue]')?.addEventListener('click',breakCipher,{once:true});
  async function breakCipher(){const section=$('[data-trial-two]'),button=$('[data-cipher-continue]');button.hidden=true;section.classList.add('is-breaking');playVoice(4);await wait(duration(1500));reveal($('[data-doubt]'));buildDoubt();}
  function buildDoubt(){const word='DUVIDE',host=$('[data-doubt-glyphs]');host.replaceChildren(...[...word].map((letter,i)=>{const b=document.createElement('button');b.type='button';b.className='doubt-glyph';b.dataset.letter=letter;b.textContent=['◇','◌','⧖','┆','⬡','◐'][i];b.setAttribute('aria-label',`Estabilizar glifo ${i+1}`);b.addEventListener('click',()=>{if(b.classList.contains('is-stable'))return;b.textContent=letter;b.classList.add('is-stable');b.setAttribute('aria-label',`Letra ${letter} estabilizada`);const stable=$$('.doubt-glyph.is-stable').length;$('[data-doubt-progress]').textContent=stable===6?'DUVIDE':`${stable} de 6 glifos estabilizados.`;if(stable===6)finishDoubt();});return b;}));}
  async function finishDoubt(){await wait(duration(650));$('[data-doubt-paper]').style.opacity='0';document.body.classList.add('post3-silence');await wait(duration(1000));playVoice(5);await wait(duration(2200));reveal($('[data-trial-three]'));}

  const observations={box:'O símbolo da tampa tem uma pequena assimetria. Parece deliberada.',key:'A chave parece corresponder à fechadura. Isso não prova que deva ser usada.',envelope:'Para quem decidir antes de obedecer. Dentro: “Uma ordem não se torna verdadeira porque foi pronunciada por uma voz que você respeita.”'};
  $$('[data-judgment-object]').forEach(btn=>btn.addEventListener('click',()=>{$('[data-judgment-observation]').innerHTML=`<p>${observations[btn.dataset.judgmentObject]}</p>`;}));
  let decision='';
  $$('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>{decision=btn.dataset.decision;$('[data-decision-dialog]').showModal();}));
  $('[data-decision-form]')?.addEventListener('submit',async e=>{e.preventDefault();const reason=new FormData(e.currentTarget).get('reason');if(!reason){$('[data-decision-error]').textContent='Escolha a razão que mais se aproxima da sua decisão.';return;}save('decisao_teste3',decision);save('justificativa_teste3',reason);$('[data-decision-dialog]').close();save('teste3_concluido');reveal($('[data-box-reveal]'));await wait(duration(3600));reveal($('[data-return-ceremony]'));});
  $('[data-destiny-look]')?.addEventListener('click',async()=>{const c=$('[data-return-ceremony]');c.classList.add('is-destiny-glitch');await wait(duration(380));c.classList.remove('is-destiny-glitch');$('[data-destiny-reaction]').hidden=false;await wait(duration(1800));reveal($('[data-epilogue]'));});
  let attempts=0;
  $('[data-test-four]')?.addEventListener('click',()=>{attempts++;const ep=$('[data-epilogue]');$('[data-access-status]').textContent='ACESSO NEGADO';if(attempts>1){ep.classList.add('is-failing');setTimeout(()=>{ep.classList.remove('is-failing');$('[data-irregularity-form]').hidden=false;$('[data-irregularity-form] input').focus();},900);}});
  $('[data-irregularity-form]')?.addEventListener('submit',async e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');input.value='';await wait(duration(500));input.value='NENHUMA.';await wait(duration(800));save('post3_concluido');reveal($('[data-last-signal]'));await wait(duration(1300));$('[data-last-signal]').style.opacity='0';$('[data-final-nav]').hidden=false;$('[data-final-nav]').scrollIntoView({behavior:reduced?'auto':'smooth'});});
})();
