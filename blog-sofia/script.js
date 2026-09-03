if (document.body.classList.contains('post-page') && !document.querySelector('.journal-launcher')) {
  document.body.insertAdjacentHTML('beforeend', `
    <button class="journal-launcher" type="button" aria-expanded="false" aria-controls="clue-journal"><span class="journal-symbol" aria-hidden="true">?</span><span>caderno de pistas</span><span class="clue-count" aria-label="0 pistas encontradas">0</span></button>
    <button class="journal-backdrop" type="button" aria-label="Fechar o caderno de pistas" hidden></button>
    <aside class="clue-journal" id="clue-journal" aria-labelledby="journal-title" hidden>
      <div class="journal-header"><div><p class="eyebrow">arquivo particular</p><h2 id="journal-title">caderno de pistas</h2></div><button class="journal-close" type="button" aria-label="Fechar o caderno">×</button></div>
      <p class="journal-intro">Coisas que provavelmente são coincidência. Provavelmente.</p>
      <ol class="journal-list">
        <li class="journal-clue" data-clue-entry="owl-mark"><span class="journal-clue-number">01</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">a marca no chão</strong></div></li>
        <li class="journal-clue" data-clue-entry="unknown-writing"><span class="journal-clue-number">02</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">a frase no caderno</strong></div></li>
        <li class="journal-clue" data-clue-entry="corridor-teacher"><span class="journal-clue-number">03</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">a professora no corredor</strong></div></li>
        <li class="journal-clue" data-clue-entry="broken-message"><span class="journal-clue-number">04</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">a mensagem sem origem</strong></div></li>
        <li class="journal-clue" data-clue-entry="mirna-knows"><span class="journal-clue-number">05</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">Mirna sabia da linha</strong></div></li>
        <li class="journal-clue" data-clue-entry="after-signal"><span class="journal-clue-number">06</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">depois do último sinal</strong><p class="clue-unlocked">O horário só apareceu quando já era tarde para ser um horário.</p></div></li>
        <li class="journal-clue" data-clue-entry="impossible-bookmark"><span class="journal-clue-number">07</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">o marcador impossível</strong><p class="clue-unlocked">Ele estava dentro de um livro que Sofia ainda não tinha aberto.</p></div></li>
        <li class="journal-clue" data-clue-entry="linked-uniforms"><span class="journal-clue-number">08</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">dois uniformes, uma costura</strong><p class="clue-unlocked">O uniforme de Sofia e o do menino mudam como versões da mesma coisa.</p></div></li>
        <li class="journal-clue" data-clue-entry="test-recognized-sofia"><span class="journal-clue-number">09</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">o teste reconheceu Sofia</strong><p class="clue-unlocked">Por um instante, o resultado deixou de ser um Caminho.</p></div></li>
      </ol>
    </aside>`);
}

// Depois das 16h, a outra escola começa a atravessar a aparência do blog.
const sofiaLocalHour = new Date().getHours();
document.body.classList.toggle('after-four', sofiaLocalHour >= 16);
document.documentElement.style.colorScheme = sofiaLocalHour >= 16 ? 'dark' : 'light';

const missionRecords = [
  { key: 'sofia-mission-system', title: 'Consulta interrompida', note: 'Origem: Sistema do Destino', image: 'assets/escritorio-do-destino-inventario.png' },
  { key: 'sofia-mission-poseidon', title: 'Reserva sem destino', note: 'Operadora: Poseidon Lines', image: 'assets/poseidon-lines-inventario.png' },
  { key: 'sofia-mission-passport', title: 'Passaporte de percurso', note: 'Titular reconhecida: Sofia', image: 'assets/passaporte-frente.png' }
];

function missionFound(key) { try { return localStorage.getItem(key) === 'found'; } catch { return false; } }
function saveMission(key) { try { localStorage.setItem(key, 'found'); } catch {} }
const currentMission = document.body.dataset.missionDiscovery;
if (currentMission) saveMission(currentMission);

function mountMissionInventory() {
  const found = missionRecords.filter((item) => missionFound(item.key));
  if (!found.length || document.querySelector('.mission-launcher')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <button class="mission-launcher" type="button" aria-expanded="false" aria-controls="mission-inventory"><span aria-hidden="true">◇</span><span>inventário de missão</span><b>${found.length}/3</b></button>
    <button class="mission-backdrop" type="button" aria-label="Fechar inventário de missão" hidden></button>
    <aside class="mission-inventory" id="mission-inventory" aria-labelledby="mission-title" hidden>
      <div class="mission-head"><div><p>ACESSO PARCIAL · ${found.length}/3</p><h2 id="mission-title">Inventário de missão</h2></div><button type="button" data-close-mission aria-label="Fechar inventário">×</button></div>
      <p>Objetos e registros que o Sistema associou a este percurso.</p>
      <div class="mission-grid">${missionRecords.map((item, index) => missionFound(item.key)
        ? `<article class="mission-item is-found"><span>0${index + 1}</span><img src="${item.image}" alt=""><div><h3>${item.title}</h3><p>${item.note}</p></div></article>`
        : `<article class="mission-item is-locked"><span>0${index + 1}</span><div class="mission-lock" aria-hidden="true">?</div><div><h3>registro indisponível</h3><p>Continue observando.</p></div></article>`).join('')}</div>
    </aside>`);
  const launcher = document.querySelector('.mission-launcher');
  const panel = document.querySelector('.mission-inventory');
  const backdrop = document.querySelector('.mission-backdrop');
  const closer = document.querySelector('[data-close-mission]');
  let previousFocus;
  const close = () => { panel.hidden = true; backdrop.hidden = true; launcher.setAttribute('aria-expanded', 'false'); document.body.classList.remove('mission-open'); previousFocus?.focus?.(); };
  launcher.addEventListener('click', () => { previousFocus = document.activeElement; panel.hidden = false; backdrop.hidden = false; launcher.setAttribute('aria-expanded', 'true'); document.body.classList.add('mission-open'); closer.focus(); });
  closer.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !panel.hidden) close(); });
}
mountMissionInventory();

const journalList = document.querySelector('.journal-list');
const laterClues = [
  ['07','impossible-bookmark','o marcador impossível','Ele estava dentro de um livro que Sofia ainda não tinha aberto.'],
  ['08','linked-uniforms','dois uniformes, uma costura','O uniforme de Sofia e o do menino mudam como versões da mesma coisa.'],
  ['09','test-recognized-sofia','o teste reconheceu Sofia','Por um instante, o resultado deixou de ser um Caminho.']
];
laterClues.forEach(([number,key,title,description]) => {
  if (journalList && !journalList.querySelector(`[data-clue-entry="${key}"]`)) {
    journalList.insertAdjacentHTML('beforeend', `<li class="journal-clue" data-clue-entry="${key}"><span class="journal-clue-number">${number}</span><div><strong class="clue-locked">pista ainda escondida</strong><strong class="clue-unlocked">${title}</strong><p class="clue-unlocked">${description}</p></div></li>`);
  }
});

const clueButton = document.querySelector('.clue-button');
const clueMessage = document.querySelector('#clue-message');

if (clueButton && clueMessage) {
  clueButton.addEventListener('click', () => {
    const isOpen = clueButton.getAttribute('aria-expanded') === 'true';
    clueButton.setAttribute('aria-expanded', String(!isOpen));
    clueMessage.hidden = isOpen;
  });
}

const choiceButtons = document.querySelectorAll('[data-choice]');
const choiceResult = document.querySelector('.choice-result');

const answers = {
  ignore: 'Sofia aprova. Sofia também olharia para trás cinco vezes.',
  photo: 'Uma pessoa sensata. Agora só falta a foto não desaparecer.',
  friends: 'Boa escolha. Eles vão ajudar e fazer piadas. Provavelmente nessa ordem.',
  keep: 'Justo. Mas talvez seja melhor não perder o caderno de vista.',
  follow: 'Corajoso. Ou uma ideia péssima. Sofia ainda está decidindo.',
  call: 'Boa. Três pessoas confusas ainda são melhores do que uma.',
  replay: 'Sofia também ouviu de novo. Foi assim que a frase ficou ainda menos tranquilizadora.',
  bus: 'Boa tentativa. O outro ônibus já dobrou a esquina, mas Sofia anotou a linha: nenhuma.',
  activity: 'Era exatamente o que Mirna esperava. O que não torna a escolha mais tranquilizadora.',
  mirna: 'Sofia concorda. De preferência sem ser chamada à diretoria outra vez.',
  enter: 'Sofia entrou. Curiosidade: excelente para histórias, péssima para seguir conselhos sensatos.',
  leave: 'Uma decisão responsável. Sofia promete considerar essa possibilidade na próxima parede impossível.'
};

choiceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    choiceButtons.forEach((item) => item.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    if (choiceResult) choiceResult.textContent = answers[button.dataset.choice];
  });
});

const clueHotspots = document.querySelectorAll('[data-discover-clue]');
const journalLauncher = document.querySelector('.journal-launcher');
const clueJournal = document.querySelector('#clue-journal');
const journalBackdrop = document.querySelector('.journal-backdrop');
const journalClose = document.querySelector('.journal-close');
const clueEntries = document.querySelectorAll('[data-clue-entry]');
const clueCount = document.querySelector('.clue-count');
let lastFocusedElement = null;

function clueWasFound(clueName) {
  try {
    return localStorage.getItem(`sofia-clue-${clueName}`) === 'found';
  } catch {
    return false;
  }
}

function saveClue(clueName) {
  try {
    localStorage.setItem(`sofia-clue-${clueName}`, 'found');
  } catch {
    // A descoberta continua funcionando mesmo quando o armazenamento está bloqueado.
  }
}

function renderClueState() {
  clueHotspots.forEach((hotspot) => {
    const found = clueWasFound(hotspot.dataset.discoverClue) || hotspot.getAttribute('aria-pressed') === 'true';
    hotspot.setAttribute('aria-pressed', String(found));
  });
  let foundCount = 0;
  clueEntries.forEach((entry) => {
    const found = clueWasFound(entry.dataset.clueEntry);
    entry.classList.toggle('is-found', found);
    if (found) foundCount += 1;
  });
  if (clueCount) {
    clueCount.textContent = String(foundCount);
    clueCount.setAttribute('aria-label', `${foundCount} ${foundCount === 1 ? 'pista encontrada' : 'pistas encontradas'}`);
  }
}

function openJournal() {
  if (!clueJournal || !journalBackdrop || !journalLauncher) return;
  lastFocusedElement = document.activeElement;
  clueJournal.hidden = false;
  journalBackdrop.hidden = false;
  journalLauncher.setAttribute('aria-expanded', 'true');
  document.body.classList.add('journal-open');
  journalClose?.focus();
}

function closeJournal() {
  if (!clueJournal || !journalBackdrop || !journalLauncher) return;
  clueJournal.hidden = true;
  journalBackdrop.hidden = true;
  journalLauncher.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('journal-open');
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

clueHotspots.forEach((hotspot) => {
  hotspot.addEventListener('click', () => {
    hotspot.setAttribute('aria-pressed', 'true');
    saveClue(hotspot.dataset.discoverClue);
    renderClueState();
    const discoveryMessage = hotspot.parentElement?.querySelector('.discovery-message');
    if (discoveryMessage) {
      discoveryMessage.hidden = false;
      window.setTimeout(() => { discoveryMessage.hidden = true; }, 3600);
    }
  });
});

journalLauncher?.addEventListener('click', openJournal);
journalClose?.addEventListener('click', closeJournal);
journalBackdrop?.addEventListener('click', closeJournal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && clueJournal && !clueJournal.hidden) closeJournal();
});

renderClueState();

const visionToggle = document.querySelector('[data-vision-toggle]');
const visionStage = document.querySelector('[data-vision-stage]');
const visionStatus = document.querySelector('.vision-status');
const virgulaCameo = document.querySelector('.virgula-cameo');
let teacherWasSeen = false;
let virgulaAlreadyAppeared = false;

visionToggle?.addEventListener('click', () => {
  const glassesAreOn = visionToggle.getAttribute('aria-pressed') !== 'true';
  visionToggle.setAttribute('aria-pressed', String(glassesAreOn));
  visionStage?.classList.toggle('is-revealed', glassesAreOn);
  visionToggle.textContent = glassesAreOn ? 'tirar os óculos' : 'colocar os óculos';
  if (visionStatus) {
    visionStatus.textContent = glassesAreOn
      ? 'Com os óculos, há uma professora no corredor.'
      : 'Sem os óculos, só um corredor vazio. Mas as chaves ainda fazem barulho.';
  }
  if (glassesAreOn) {
    teacherWasSeen = true;
    saveClue('corridor-teacher');
    renderClueState();
  } else if (teacherWasSeen && !virgulaAlreadyAppeared && virgulaCameo) {
    virgulaAlreadyAppeared = true;
    window.setTimeout(() => {
      virgulaCameo.classList.add('is-dashing');
      window.setTimeout(() => virgulaCameo.classList.remove('is-dashing'), 2800);
    }, 450);
  }
});

const audioToggle = document.querySelector('[data-audio-toggle]');
const audioStage = document.querySelector('[data-audio-stage]');
const audioStatus = document.querySelector('.audio-status');
const transcript = document.querySelector('.broken-transcript');
const mysteryAudioFile = document.querySelector('[data-mystery-audio]');
if (mysteryAudioFile) {
  mysteryAudioFile.src = 'assets/mensagem-sem-origem.wav?v=7';
  mysteryAudioFile.load();
}
let audioTimer;
let mysteryAudioContext;
let mysteryNoise;

function stopMysteryAudio() {
  if (mysteryAudioFile) {
    mysteryAudioFile.pause();
    mysteryAudioFile.currentTime = 0;
  }
  window.speechSynthesis?.cancel();
  try { mysteryNoise?.stop(); } catch { /* A fonte pode já ter terminado. */ }
  mysteryNoise = null;
}

function playMysteryAudio() {
  if (mysteryAudioFile) {
    mysteryAudioFile.currentTime = 0;
    mysteryAudioFile.volume = 0.9;
    mysteryAudioFile.play().catch(() => {
      if (audioStatus) audioStatus.textContent = 'O navegador bloqueou o som. Clique novamente em ouvir gravação.';
    });
    return;
  }
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (AudioContextClass) {
    mysteryAudioContext ||= new AudioContextClass();
    mysteryAudioContext.resume();
    const sampleRate = mysteryAudioContext.sampleRate;
    const buffer = mysteryAudioContext.createBuffer(1, sampleRate * 7, sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * 0.18;
    mysteryNoise = mysteryAudioContext.createBufferSource();
    mysteryNoise.buffer = buffer;
    const filter = mysteryAudioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 950;
    const gain = mysteryAudioContext.createGain();
    const now = mysteryAudioContext.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.35);
    gain.gain.setValueAtTime(0.075, now + 6.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 7);
    mysteryNoise.connect(filter).connect(gain).connect(mysteryAudioContext.destination);
    mysteryNoise.start();
    mysteryNoise.stop(now + 7);
  }

  if ('speechSynthesis' in window) {
    const voice = window.speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith('pt'));
    [{ text: 'quando a linha', delay: 750 }, { text: 'não desça', delay: 2900 }, { text: 'Sofia', delay: 5100 }].forEach(({ text, delay }) => {
      window.setTimeout(() => {
        if (audioToggle?.getAttribute('aria-pressed') !== 'true') return;
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.lang = 'pt-BR';
        utterance.rate = 0.62;
        utterance.pitch = 0.72;
        utterance.volume = 0.55;
        window.speechSynthesis.speak(utterance);
      }, delay);
    });
  }
}

audioToggle?.addEventListener('click', () => {
  const isPlaying = audioToggle.getAttribute('aria-pressed') !== 'true';
  window.clearTimeout(audioTimer);
  stopMysteryAudio();
  audioToggle.setAttribute('aria-pressed', String(isPlaying));
  audioStage?.classList.toggle('is-playing', isPlaying);
  audioToggle.textContent = isPlaying ? 'parar gravação' : 'ouvir outra vez';
  if (audioStatus) audioStatus.textContent = isPlaying ? 'Reproduzindo: ruído, uma voz distante e três palavras incompletas.' : 'A gravação parou antes do fim.';
  if (transcript) transcript.hidden = !isPlaying;
  if (isPlaying) {
    playMysteryAudio();
    audioTimer = window.setTimeout(() => {
      audioToggle.setAttribute('aria-pressed', 'false');
      audioStage?.classList.remove('is-playing');
      audioToggle.textContent = 'ouvir outra vez';
      if (audioStatus) audioStatus.textContent = 'Fim do arquivo. Duração: 00:07. Origem: desconhecida.';
      saveClue('broken-message');
      renderClueState();
    }, 7000);
  }
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function createImageEcho() {
  const candidates = [...document.querySelectorAll('.post-hero img:first-of-type, .profile-polaroid img, .card-image img')]
    .filter((image) => image.getBoundingClientRect().width > 180);
  if (!candidates.length) return;
  const source = candidates[Math.floor(Math.random() * candidates.length)];
  const host = source.parentElement;
  if (!host) return;
  host.classList.add('haunted-image-host');
  const echo = document.createElement('span');
  echo.className = 'haunted-echo';
  echo.setAttribute('aria-hidden', 'true');
  const duplicate = source.cloneNode();
  duplicate.removeAttribute('alt');
  duplicate.setAttribute('aria-hidden', 'true');
  echo.append(duplicate);
  host.append(echo);
  window.requestAnimationFrame(() => echo.classList.add('is-visible'));
  window.setTimeout(() => echo.remove(), 1250);
}

function triggerSupernaturalMoment() {
  document.body.classList.add('supernatural-interference');
  createImageEcho();
  window.setTimeout(() => document.body.classList.remove('supernatural-interference'), 900);
}

function scheduleSupernaturalMoment(firstAppearance = false) {
  if (reducedMotion.matches || document.hidden) return;
  const minimum = firstAppearance ? 8000 : 28000;
  const variation = firstAppearance ? 6000 : 22000;
  window.setTimeout(() => {
    if (!document.hidden && !document.body.classList.contains('journal-open')) {
      triggerSupernaturalMoment();
    }
    scheduleSupernaturalMoment();
  }, minimum + Math.random() * variation);
}

scheduleSupernaturalMoment(true);

const leaflet = document.querySelector('[data-leaflet]');
const leafletMessage = document.querySelector('[data-leaflet-message]');
const leafletStatus = document.querySelector('.leaflet-status');
let leafletRevealed = false;

leaflet?.addEventListener('click', () => {
  if (leafletRevealed) return;
  leafletRevealed = true;
  leaflet.classList.add('is-turned');
  leaflet.setAttribute('aria-pressed', 'true');
  if (leafletStatus) leafletStatus.textContent = 'O verso estava vazio. Por um instante.';
  window.setTimeout(() => {
    leaflet.classList.add('is-revealed');
    if (leafletMessage) leafletMessage.textContent = 'DEPOIS DO ÚLTIMO SINAL';
    if (leafletStatus) leafletStatus.textContent = 'As letras apareceram depois que o papel esquentou.';
    saveClue('after-signal');
    renderClueState();
  }, reducedMotion.matches ? 20 : 650);
});

const lightsOutZone = document.querySelector('[data-lights-out]');
if (lightsOutZone) {
  let lightsFrame = 0;
  let afterSignalSaved = false;
  const updateLights = () => {
    lightsFrame = 0;
    const threshold = lightsOutZone.offsetTop - window.innerHeight * .58;
    const lightsAreOut = window.scrollY >= threshold;
    document.body.classList.toggle('is-lights-out', lightsAreOut);
    if (lightsAreOut && !afterSignalSaved) {
      afterSignalSaved = true;
      saveClue('after-signal');
      renderClueState();
    }
  };
  const requestLightsUpdate = () => {
    if (!lightsFrame) lightsFrame = window.requestAnimationFrame(updateLights);
  };
  window.addEventListener('scroll', requestLightsUpdate, { passive: true });
  window.addEventListener('resize', requestLightsUpdate);
  updateLights();
}

const emblemStorageKey = 'sofia-emblem-fieis-da-coruja';
const emblemCollectButton = document.querySelector('[data-collect-emblem="fieis-da-coruja"]');
const emblemConfirmation = document.querySelector('[data-collection-confirmation]');
const emblemAction = document.querySelector('[data-emblem-action]');
let emblemInventoryLastFocus = null;

function emblemWasCollected() {
  try { return localStorage.getItem(emblemStorageKey) === 'collected'; }
  catch { return emblemCollectButton?.classList.contains('is-collected') || false; }
}

function saveEmblem() {
  try { localStorage.setItem(emblemStorageKey, 'collected'); }
  catch { /* A coleta permanece válida durante a visita atual. */ }
}

function ensureEmblemInventory() {
  let eclipseIsCollected = false;
  try { eclipseIsCollected = localStorage.getItem('sofia-emblem-ordem-do-eclipse') === 'collected'; } catch {}
  const fieisIsCollected = emblemWasCollected();
  const emblemTotal = Number(fieisIsCollected) + Number(eclipseIsCollected);
  if (!emblemTotal || document.querySelector('.emblem-inventory-launcher')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <button class="emblem-inventory-launcher" type="button" aria-expanded="false" aria-controls="emblem-inventory">
      <img src="assets/fieis-da-coruja-inventario.png" alt=""><span>coleção de emblemas</span>
    </button>
    <button class="emblem-inventory-backdrop journal-backdrop" type="button" aria-label="Fechar a coleção de emblemas" hidden></button>
    <aside class="emblem-inventory" id="emblem-inventory" aria-labelledby="emblem-inventory-title" hidden>
      <div class="emblem-inventory-header"><div><p class="eyebrow">${emblemTotal} ${emblemTotal === 1 ? 'símbolo encontrado' : 'símbolos encontrados'}</p><h2 id="emblem-inventory-title">coleção de emblemas</h2></div><button class="emblem-inventory-close" type="button" aria-label="Fechar a coleção">×</button></div>
      ${fieisIsCollected ? '<div class="emblem-inventory-card"><img src="assets/fieis-da-coruja-inventario.png" alt="Emblema dos Fiéis da Coruja"><h3>Fiéis da Coruja</h3><p>Origem ainda não identificada.</p></div>' : ''}
      ${eclipseIsCollected ? '<div class="emblem-inventory-card" data-eclipse-inventory-card><img src="assets/ordem-do-eclipse-inventario.png" alt="Emblema da Ordem do Eclipse"><h3>Ordem do Eclipse</h3><p>Encontrado numa perspectiva que Sofia não viu.</p></div>' : ''}
    </aside>`);

  const launcher = document.querySelector('.emblem-inventory-launcher');
  const inventory = document.querySelector('.emblem-inventory');
  const backdrop = document.querySelector('.emblem-inventory-backdrop');
  const closeButton = document.querySelector('.emblem-inventory-close');
  const openInventory = () => {
    emblemInventoryLastFocus = document.activeElement;
    inventory.hidden = false; backdrop.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.body.classList.add('emblem-inventory-open');
    closeButton.focus();
  };
  const closeInventory = () => {
    inventory.hidden = true; backdrop.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('emblem-inventory-open');
    emblemInventoryLastFocus?.focus?.();
  };
  launcher.addEventListener('click', openInventory);
  closeButton.addEventListener('click', closeInventory);
  backdrop.addEventListener('click', closeInventory);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !inventory.hidden) closeInventory();
  });
}

function renderEmblemCollection() {
  const collected = emblemWasCollected();
  emblemCollectButton?.classList.toggle('is-collected', collected);
  if (emblemCollectButton) emblemCollectButton.disabled = collected;
  if (emblemAction) emblemAction.textContent = collected ? 'símbolo coletado' : 'tocar o símbolo';
  if (emblemConfirmation) emblemConfirmation.hidden = !collected;
  ensureEmblemInventory();
}

emblemCollectButton?.addEventListener('click', () => {
  emblemCollectButton.classList.add('is-collected');
  saveEmblem();
  renderEmblemCollection();
  window.setTimeout(() => document.querySelector('.emblem-inventory-launcher')?.focus(), 850);
});

renderEmblemCollection();

const bookmarkButton = document.querySelector('[data-unlock-bookmark]');
const bookmarkItem = document.querySelector('[data-bookmark-item]');
const bookmarkStatus = document.querySelector('[data-bookmark-status]');
const collectionTwo = document.querySelector('[data-collection-two]');
bookmarkButton?.addEventListener('click', () => {
  bookmarkButton.disabled = true;
  bookmarkButton.setAttribute('aria-expanded', 'true');
  bookmarkButton.textContent = 'item 02 encontrado';
  if (bookmarkItem) bookmarkItem.hidden = false;
  if (collectionTwo) collectionTwo.hidden = false;
  if (bookmarkStatus) bookmarkStatus.textContent = 'O marcador foi acrescentado à seção “Não é uma coleção”.';
  try { localStorage.setItem('sofia-collection-bookmark', 'collected'); } catch {}
  saveClue('impossible-bookmark');
  renderClueState();
  window.setTimeout(() => bookmarkItem?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' }), 180);
});

const mirrorToggle = document.querySelector('[data-mirror-toggle]');
const mirrorEnding = document.querySelector('[data-mirror-ending]');
const mirrorStatus = document.querySelector('[data-mirror-status]');
mirrorToggle?.addEventListener('click', () => {
  const changed = mirrorToggle.getAttribute('aria-pressed') !== 'true';
  mirrorToggle.setAttribute('aria-pressed', String(changed));
  mirrorEnding?.classList.toggle('is-changed', changed);
  mirrorToggle.textContent = changed ? 'embaçar outra vez' : 'limpar o vidro';
  if (mirrorStatus) mirrorStatus.textContent = changed
    ? 'A névoa cedeu. Sofia está de moletom; o reflexo veste o uniforme verde e dourado dos Fiéis da Coruja.'
    : 'A névoa voltou a cobrir o reflexo.';
});

const terrorTrigger = document.querySelector('[data-terror-trigger]');
const bookTerror = document.querySelector('[data-book-terror]');
const terrorBreak = document.querySelector('[data-terror-break]');
const terrorStatus = document.querySelector('[data-terror-status]');
terrorTrigger?.addEventListener('click', () => {
  terrorTrigger.hidden = true;
  terrorBreak.hidden = false;
  terrorTrigger.setAttribute('aria-expanded', 'true');
  bookTerror?.classList.add('is-struck');
  if (terrorStatus) terrorStatus.textContent = 'Um grito vindo da rua interrompeu a leitura.';
  window.setTimeout(() => bookTerror?.classList.remove('is-struck'), reducedMotion.matches ? 0 : 620);
});

const synopsisDialog = document.querySelector('[data-synopsis-dialog]');
const synopsisBackdrop = document.querySelector('[data-synopsis-backdrop]');
let synopsisLastFocus = null;
function closeSynopsis() {
  if (!synopsisDialog) return;
  synopsisDialog.hidden = true; synopsisBackdrop.hidden = true;
  document.body.classList.remove('synopsis-open'); synopsisLastFocus?.focus?.();
}
document.querySelector('[data-open-synopsis]')?.addEventListener('click', (event) => {
  synopsisLastFocus = event.currentTarget; synopsisDialog.hidden = false; synopsisBackdrop.hidden = false;
  document.body.classList.add('synopsis-open'); synopsisDialog.querySelector('[data-close-synopsis]')?.focus();
  try { localStorage.setItem('sofia-not-a-collection', 'unlocked'); } catch {}
});
document.querySelector('[data-close-synopsis]')?.addEventListener('click', closeSynopsis);
synopsisBackdrop?.addEventListener('click', closeSynopsis);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && synopsisDialog && !synopsisDialog.hidden) closeSynopsis(); });

document.querySelector('[data-reveal-leaflet]')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const revealed = button.classList.toggle('is-revealed');
  button.setAttribute('aria-expanded', String(revealed));
  button.querySelector('[data-leaflet-reveal-text]').innerHTML = revealed
    ? '<span>data <b>HOJE</b></span><span>horário <b>DEPOIS DO ÚLTIMO SINAL</b></span><span>local <b>SALA 17</b></span>'
    : '<span>data <b>________________</b></span><span>horário <b>________________</b></span><span>local <b>________________</b></span>';
  const status = document.querySelector('[data-leaflet-reveal-status]');
  if (status) status.textContent = revealed ? 'As instruções apareceram no papel.' : '';
  if (revealed) { try { localStorage.setItem('sofia-leaflet-revealed', 'true'); } catch {} }
});

if (document.body.classList.contains('post-page--chapter-five')) {
  const nextLink = document.querySelector('.post-pagination a:last-child');
  if (nextLink) {
    nextLink.href = 'post-a-hora-que-nao-existe.html';
    nextLink.innerHTML = '<span>próxima</span>uma encomenda sem hora';
  }
  const leafletParagraph = [...document.querySelectorAll('.post-body p')].find((paragraph) => paragraph.textContent.includes('Mirna pegou um folheto'));
  if (leafletParagraph && !document.querySelector('.mirna-leaflet-figure')) {
    const figure = document.createElement('figure');
    figure.className = 'post-hero mirna-leaflet-figure';
    figure.innerHTML = '<img src="assets/mesa-de-mirna-protecao-final.png" alt="A mão de Mirna repousa sobre um folheto lilás em sua mesa, ao lado de uma pequena coruja de bronze"><figcaption>Ela manteve a mão sobre o papel por tempo suficiente para parecer uma escolha.</figcaption>';
    leafletParagraph.after(figure);
  }
}

const perspectiveBreach = document.querySelector('[data-perspective-breach]');
const perspectiveTrigger = document.querySelector('[data-perspective-trigger]');
const perspectiveReturn = document.querySelector('[data-perspective-return]');
const breachSofia = document.querySelector('[data-breach-sofia]');
const breachBoy = document.querySelector('[data-breach-boy]');
const breachReturn = document.querySelector('[data-breach-return]');
const breachStatus = document.querySelector('[data-breach-status]');
function flickerWorld(after) {
  if (!perspectiveBreach) return;
  perspectiveBreach.classList.remove('is-flickering');
  void perspectiveBreach.offsetWidth;
  perspectiveBreach.classList.add('is-flickering');
  window.setTimeout(after, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 360);
  window.setTimeout(() => perspectiveBreach.classList.remove('is-flickering'), 760);
}
perspectiveTrigger?.addEventListener('click', () => flickerWorld(() => {
  breachSofia.hidden = true; breachBoy.hidden = false;
  perspectiveBreach.classList.add('is-crossed');
  perspectiveTrigger.setAttribute('aria-expanded', 'true');
  breachStatus.textContent = 'A perspectiva mudou.';
  perspectiveReturn.focus();
}));
perspectiveReturn?.addEventListener('click', () => flickerWorld(() => {
  breachBoy.hidden = true; breachReturn.hidden = false;
  breachStatus.textContent = 'A perspectiva voltou para Sofia.';
  breachReturn.setAttribute('tabindex', '-1'); breachReturn.focus();
}));

const uniformClueButtons = [...document.querySelectorAll('[data-uniform-clue]')];
const uniformClueStatus = document.querySelector('[data-uniform-clue-status]');
const worldSwitch = document.querySelector('[data-world-switch]');
const uniformWorld = document.querySelector('[data-uniform-world]');
const eclipseWorld = document.querySelector('[data-eclipse-world]');
const sofiaWorld = document.querySelector('[data-sofia-world]');
const sofiaReturn = document.querySelector('[data-sofia-return]');
const seenUniformClues = new Set();
uniformClueButtons.forEach((button) => button.addEventListener('click', () => {
  seenUniformClues.add(button.dataset.uniformClue);
  button.classList.add('is-seen'); button.setAttribute('aria-pressed', 'true');
  if (uniformClueStatus) uniformClueStatus.textContent = `${seenUniformClues.size} de 3 detalhes examinados.`;
  if (seenUniformClues.size === uniformClueButtons.length && worldSwitch) {
    worldSwitch.disabled = false;
    if (uniformClueStatus) uniformClueStatus.textContent = 'As listras verdes escureceram por um instante.';
  }
}));
worldSwitch?.addEventListener('click', () => {
  worldSwitch.setAttribute('aria-expanded', 'true');
  uniformWorld?.classList.add('is-crossing');
  saveClue('linked-uniforms');
  renderClueState();
  window.setTimeout(() => {
    uniformWorld?.classList.add('is-eclipse');
    if (sofiaWorld) sofiaWorld.hidden = true;
    if (eclipseWorld) eclipseWorld.hidden = false;
    document.querySelector('[data-world-brand]').textContent = 'arquivo sem autorização';
    document.querySelector('[data-world-label]').textContent = 'interferência 09';
    document.querySelector('[data-world-footer]').textContent = 'registro observado do outro lado';
    eclipseWorld?.setAttribute('tabindex', '-1'); eclipseWorld?.focus();
  }, reducedMotion.matches ? 0 : 700);
});
document.querySelector('[data-world-return]')?.addEventListener('click', () => {
  eclipseWorld.hidden = true; uniformWorld?.classList.remove('is-eclipse','is-crossing');
  if (sofiaReturn) { sofiaReturn.hidden = false; sofiaReturn.setAttribute('tabindex','-1'); sofiaReturn.focus(); }
  document.querySelector('[data-world-brand]').textContent = 'arquivo da sofia';
  document.querySelector('[data-world-label]').textContent = 'anotação 09';
  document.querySelector('[data-world-footer]').textContent = 'anotado por Sofia, quando ela lembra';
});
const eclipseCollect = document.querySelector('[data-collect-eclipse]');
const eclipseConfirmation = document.querySelector('[data-eclipse-confirmation]');
const eclipseAction = document.querySelector('[data-eclipse-action]');
function renderEclipseCollection() {
  let collected = false;
  try { collected = localStorage.getItem('sofia-emblem-ordem-do-eclipse') === 'collected'; } catch { collected = eclipseCollect?.classList.contains('is-collected') || false; }
  if (eclipseCollect) { eclipseCollect.disabled = collected; eclipseCollect.classList.toggle('is-collected', collected); }
  if (eclipseAction) eclipseAction.textContent = collected ? 'eclipse coletado' : 'tocar o eclipse';
  if (eclipseConfirmation) eclipseConfirmation.hidden = !collected;
  if (collected) ensureEmblemInventory();
  const inventory = document.querySelector('.emblem-inventory');
  if (collected && inventory && !inventory.querySelector('[data-eclipse-inventory-card]')) {
    inventory.insertAdjacentHTML('beforeend','<div class="emblem-inventory-card" data-eclipse-inventory-card><img src="assets/ordem-do-eclipse-inventario.png" alt="Emblema da Ordem do Eclipse"><h3>Ordem do Eclipse</h3><p>Encontrado numa perspectiva que Sofia não viu.</p></div>');
    const count = inventory.querySelector('.emblem-inventory-header .eyebrow'); const total = inventory.querySelectorAll('.emblem-inventory-card').length; if (count) count.textContent = `${total} ${total === 1 ? 'símbolo encontrado' : 'símbolos encontrados'}`;
  }
}
eclipseCollect?.addEventListener('click', () => {
  eclipseCollect.disabled = true; eclipseCollect.classList.add('is-collected');
  try { localStorage.setItem('sofia-emblem-ordem-do-eclipse','collected'); } catch {}
  renderEclipseCollection();
});
renderEclipseCollection();

const pathForm = document.querySelector('[data-path-form]');
const pathResult = document.querySelector('[data-path-result]');
const pathResultTitle = document.querySelector('[data-path-result-title]');
const pathResultDescription = document.querySelector('[data-path-result-description]');
const pathError = document.querySelector('[data-path-error]');
const pathInterference = document.querySelector('[data-path-interference]');
const pathProfiles = {
  lanterna: ['CAMINHO DA LANTERNA','Você ilumina, orienta e procura não deixar ninguém para trás.'],
  espelho: ['CAMINHO DO ESPELHO','Você observa o que não combina e procura aquilo que permanece escondido.'],
  sino: ['CAMINHO DO SINO','Você escuta antes de agir e percebe sinais que outras pessoas deixam passar.'],
  ponte: ['CAMINHO DA PONTE','Você atravessa, explora e descobre o caminho enquanto avança.']
};
if (pathForm) {
  const pathSteps = [...pathForm.querySelectorAll('fieldset')];
  const pathSubmit = pathForm.querySelector('.path-submit');
  const pathProgress = document.createElement('p');
  const pathActions = document.createElement('div');
  const pathBack = document.createElement('button');
  const pathNext = document.createElement('button');
  let currentPathStep = 0;

  pathProgress.className = 'path-test-progress';
  pathProgress.setAttribute('aria-live', 'polite');
  pathBack.type = pathNext.type = 'button';
  pathBack.className = 'path-step-button path-step-button--back';
  pathNext.className = 'path-step-button path-step-button--next';
  pathBack.textContent = 'voltar';
  pathNext.textContent = 'próxima situação';
  pathActions.className = 'path-step-actions';
  pathActions.append(pathBack, pathNext, pathSubmit);
  pathForm.prepend(pathProgress);
  pathForm.append(pathActions);

  const renderPathStep = () => {
    pathSteps.forEach((step, index) => { step.hidden = index !== currentPathStep; });
    pathProgress.textContent = `situação ${currentPathStep + 1} de ${pathSteps.length}`;
    pathBack.hidden = currentPathStep === 0;
    pathNext.hidden = currentPathStep === pathSteps.length - 1;
    pathSubmit.hidden = currentPathStep !== pathSteps.length - 1;
    if (pathError) pathError.textContent = '';
  };
  pathBack.addEventListener('click', () => {
    currentPathStep = Math.max(0, currentPathStep - 1);
    renderPathStep();
    pathSteps[currentPathStep].querySelector('legend')?.focus?.();
  });
  pathNext.addEventListener('click', () => {
    if (!pathSteps[currentPathStep].querySelector('input:checked')) {
      if (pathError) pathError.textContent = 'Escolha uma resposta para continuar.';
      pathSteps[currentPathStep].querySelector('input')?.focus();
      return;
    }
    currentPathStep = Math.min(pathSteps.length - 1, currentPathStep + 1);
    renderPathStep();
    pathSteps[currentPathStep].querySelector('input')?.focus();
  });
  renderPathStep();
}
pathForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(pathForm);
  const answers = [...formData.values()];
  if (answers.length < 6) {
    if (pathError) pathError.textContent = 'Responda às seis situações antes de calcular o Caminho.';
    pathForm.querySelector('fieldset:not(:has(input:checked)) input')?.focus();
    return;
  }
  if (pathError) pathError.textContent = '';
  const scores = { lanterna:0, espelho:0, sino:0, ponte:0 };
  answers.forEach((answer) => { scores[answer] += 1; });
  const highest = Math.max(...Object.values(scores));
  const leaders = Object.keys(scores).filter((path) => scores[path] === highest);
  if (leaders.length === 1) {
    [pathResultTitle.textContent,pathResultDescription.textContent] = pathProfiles[leaders[0]];
  } else {
    pathResultTitle.textContent = leaders.map((path) => pathProfiles[path][0].replace('CAMINHO D','D')).join(' + ');
    pathResultDescription.textContent = 'Alguns caminhos não competem. Eles se reconhecem.';
  }
  pathResult.hidden = false; pathInterference.hidden = true;
  try { localStorage.setItem('sofia-reader-path', JSON.stringify({ leaders, scores })); } catch {}
  pathResult.focus();
  window.setTimeout(() => {
    pathResult.classList.add('is-interfering'); pathInterference.hidden = false;
    pathInterference.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block:'center' });
  }, reducedMotion.matches ? 0 : 1800);
});
const sofiaResultButton = document.querySelector('[data-sofia-result-interference]');
sofiaResultButton?.addEventListener('click', () => {
  const notebook = document.querySelector('[data-sofia-notebook]');
  const kicker = document.querySelector('[data-sofia-result-kicker]');
  const title = document.querySelector('[data-sofia-result-title]');
  const copy = document.querySelector('[data-sofia-result-copy]');
  const mark = document.querySelector('[data-sofia-result-mark]');
  const emblem = document.querySelector('[data-sofia-result-emblem]');
  const resultPhoto = document.querySelector('[data-sofia-notebook-photo]');
  const status = document.querySelector('[data-sofia-result-status]');
  sofiaResultButton.disabled = true;
  notebook?.classList.add('is-glitching');
  window.setTimeout(() => {
    notebook?.classList.remove('is-glitching'); notebook?.classList.add('is-fieis-result');
    if (kicker) kicker.textContent = 'RESULTADO NÃO PREVISTO';
    if (title) title.textContent = 'FIÉIS DA CORUJA';
    if (copy) copy.textContent = 'Os caminhos não se anulam. Eles se reconhecem.';
    if (mark) mark.hidden = true;
    if (emblem) emblem.hidden = false;
    resultPhoto?.classList.add('is-hidden');
    if (status) status.textContent = 'A tela mudou. Sofia fechou a aba antes de perceber.';
    sofiaResultButton.textContent = 'resultado alterado';
    saveClue('test-recognized-sofia'); renderClueState();
  }, reducedMotion.matches ? 0 : 620);
});

const revealPathRewards = document.querySelector('[data-reveal-path-rewards]');
revealPathRewards?.addEventListener('click', () => {
  const fieisReveal = document.querySelector('[data-fieis-test-emblem]');
  if (fieisReveal) fieisReveal.hidden = false;
  saveClue('test-recognized-sofia'); renderClueState();
  fieisReveal?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block:'center' });
});

const cardsCollect = document.querySelector('[data-collect-path-cards]');
const cardsStatus = document.querySelector('[data-path-cards-status]');
function renderPathCards() {
  let collected = false;
  try { collected = localStorage.getItem('sofia-collection-path-cards') === 'collected'; } catch {}
  if (cardsCollect) { cardsCollect.disabled = collected; cardsCollect.textContent = collected ? 'item 03 encontrado' : 'abrir a caixa de cards'; }
  if (cardsStatus) cardsStatus.textContent = collected ? 'Os cards foram acrescentados à “Não coleção”.' : '';
}
cardsCollect?.addEventListener('click', () => {
  try { localStorage.setItem('sofia-collection-path-cards','collected'); } catch {}
  renderPathCards();
});
renderPathCards();

const fieisTestCollect = document.querySelector('[data-recognize-fieis-test]');
const fieisTestAction = document.querySelector('[data-fieis-test-action]');
const fieisTestConfirmation = document.querySelector('[data-fieis-test-confirmation]');
function renderFieisTestCollection() {
  const recognized = fieisTestCollect?.classList.contains('is-collected') || false;
  if (fieisTestCollect) fieisTestCollect.disabled = recognized;
  if (fieisTestAction) fieisTestAction.textContent = recognized ? 'símbolo reconhecido' : 'aproximar o emblema da tela';
  if (fieisTestConfirmation) fieisTestConfirmation.hidden = !recognized;
}
fieisTestCollect?.addEventListener('click', () => {
  const collectible = document.querySelector('[data-path-collectible]');
  fieisTestCollect.classList.add('is-collected');
  renderFieisTestCollection();
  if (collectible) collectible.hidden = false;
  window.setTimeout(() => {
    collectible?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block:'center' });
  }, reducedMotion.matches ? 0 : 350);
});
renderFieisTestCollection();

const notCollectionItems = [
  { key:'sofia-not-a-collection', value:'unlocked', number:'01', title:'A Hora que Não Existe', image:'assets/hora-ausente-livro.png' },
  { key:'sofia-collection-bookmark', value:'collected', number:'02', title:'Marcador metálico', image:'assets/hora-ausente-marcador.png' },
  { key:'sofia-collection-path-cards', value:'collected', number:'03', title:'Cards dos Caminhos', image:'assets/hora-ausente-cards.png' }
];
const notCollectionGrid = document.querySelector('[data-not-collection-grid]');
const notCollectionLauncher = document.querySelector('[data-open-not-collection]');
const notCollectionPanel = document.querySelector('.not-collection-panel');
const notCollectionBackdrop = document.querySelector('.not-collection-backdrop');
const notCollectionClose = document.querySelector('[data-close-not-collection]');
let notCollectionLastFocus = null;
function hasCollectionItem(item) { try { return localStorage.getItem(item.key) === item.value; } catch { return false; } }
function renderNotCollection() {
  if (!notCollectionGrid) return;
  const found = notCollectionItems.filter(hasCollectionItem).length;
  document.querySelectorAll('[data-not-collection-count]').forEach((node) => { node.textContent = `${found}/11`; });
  const panelCount = document.querySelector('[data-not-collection-panel-count]');
  if (panelCount) panelCount.textContent = `${found} de 11 itens`;
  const known = notCollectionItems.map((item) => hasCollectionItem(item)
    ? `<article class="not-collection-slot is-found"><span>${item.number}</span><img src="${item.image}" alt=""><strong>${item.title}</strong></article>`
    : `<article class="not-collection-slot"><span>${item.number}</span><div aria-hidden="true">?</div><strong>ainda não chegou</strong></article>`);
  for (let number = 4; number <= 11; number += 1) known.push(`<article class="not-collection-slot"><span>${String(number).padStart(2,'0')}</span><div aria-hidden="true">?</div><strong>ainda não chegou</strong></article>`);
  notCollectionGrid.innerHTML = known.join('');
}
function closeNotCollection() { if (!notCollectionPanel) return; notCollectionPanel.hidden = true; notCollectionBackdrop.hidden = true; notCollectionLauncher?.setAttribute('aria-expanded','false'); document.body.classList.remove('not-collection-open'); notCollectionLastFocus?.focus?.(); }
notCollectionLauncher?.addEventListener('click', () => { notCollectionLastFocus = document.activeElement; renderNotCollection(); notCollectionPanel.hidden = false; notCollectionBackdrop.hidden = false; notCollectionLauncher.setAttribute('aria-expanded','true'); document.body.classList.add('not-collection-open'); notCollectionClose?.focus(); });
notCollectionClose?.addEventListener('click', closeNotCollection);
notCollectionBackdrop?.addEventListener('click', closeNotCollection);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && notCollectionPanel && !notCollectionPanel.hidden) closeNotCollection(); });
renderNotCollection();

const gameCanvas = document.querySelector('[data-pixel-game]');
if (gameCanvas) {
  const context = gameCanvas.getContext('2d');
  const attemptsLabel = document.querySelector('[data-game-attempts]');
  const energyLabel = document.querySelector('[data-feather-energy]');
  const gameMessage = document.querySelector('[data-game-message]');
  const gameKeys = { left: false, right: false, up: false, down: false };
  const player = { x: 56, y: 272, width: 34, height: 58, vx: 0, vy: 0, energy: 100 };
  const background = new Image();
  const backgroundBuffer = document.createElement('canvas');
  backgroundBuffer.width = 640; backgroundBuffer.height = 360;
  const backgroundContext = backgroundBuffer.getContext('2d', { alpha: false });
  background.onload = () => backgroundContext.drawImage(background, 0, 0, 640, 360);
  background.src = 'assets/linha-de-cume-cenario-otimizado.png';
  const sofiaSprite = new Image(); sofiaSprite.src = 'assets/sofia-pena-pixel-v2.png?v=1';
  const lights = [{ x: 170, y: 268, found: false }, { x: 290, y: 208, found: false }, { x: 410, y: 147, found: false }, { x: 515, y: 103, found: false }];
  const gusts = [{ x: 220, y: 70, width: 46, height: 245, force: .035 }, { x: 445, y: 35, width: 42, height: 220, force: -.03 }];
  let attempts = 1;
  let finished = false;
  let lastTime = performance.now();
  let lastFrame = 0;
  let gameVisible = true;

  function resetPlayer(countAttempt = true) {
    if (countAttempt) attempts += 1;
    player.x = 56; player.y = 272; player.vx = 0; player.vy = 0; player.energy = 100;
    lights.forEach((light) => { light.found = false; });
    if (attemptsLabel) attemptsLabel.textContent = String(attempts).padStart(2, '0');
    if (attempts >= 6) finishGame('Você ainda está na linha certa.');
  }

  function finishGame(message) {
    if (finished) return;
    finished = true;
    if (gameMessage) {
      gameMessage.hidden = false;
      gameMessage.querySelector('strong').textContent = message;
    }
    saveClue('mirna-knows');
    renderClueState();
  }

  function update(delta) {
    if (finished) return;
    const acceleration = .22;
    player.vx += ((gameKeys.right ? 1 : 0) - (gameKeys.left ? 1 : 0)) * acceleration * delta;
    player.vy += ((gameKeys.down ? 1 : 0) - (gameKeys.up ? 1 : 0)) * acceleration * delta;
    player.vx *= .965; player.vy *= .965;
    const speed = Math.hypot(player.vx, player.vy);
    if (speed > 3.25) { player.vx = player.vx / speed * 3.25; player.vy = player.vy / speed * 3.25; }
    gusts.forEach((gust) => {
      if (player.x + player.width > gust.x && player.x < gust.x + gust.width && player.y + player.height > gust.y && player.y < gust.y + gust.height) player.vy += gust.force * delta;
    });
    player.x += player.vx * delta;
    player.y += player.vy * delta;
    player.energy -= .045 * delta;
    lights.forEach((light) => {
      if (!light.found && Math.hypot(player.x + 17 - light.x, player.y + 29 - light.y) < 38) { light.found = true; player.energy = Math.min(100, player.energy + 24); }
    });
    if (energyLabel) energyLabel.textContent = String(Math.max(0, Math.round(player.energy)));
    if (player.x < -45 || player.x > 655 || player.y < -65 || player.y > 375 || player.energy <= 0) resetPlayer();
    if (player.x > 550 && player.y < 92) finishGame('Você chegou cedo demais. Mas ainda está na linha certa.');
  }

  function draw() {
    if (background.complete && background.naturalWidth) context.drawImage(backgroundBuffer, 0, 0); else { context.fillStyle = '#251c3f'; context.fillRect(0, 0, 640, 360); }
    context.fillStyle = 'rgba(255,247,174,.13)';
    gusts.forEach((gust) => { context.fillRect(gust.x, gust.y, gust.width, gust.height); });
    lights.forEach((light, index) => {
      if (light.found) return;
      const pulse = 5 + Math.sin(performance.now() / 230 + index) * 2;
      context.fillStyle = 'rgba(255,242,157,.25)'; context.beginPath(); context.arc(light.x, light.y, 14 + pulse, 0, Math.PI * 2); context.fill();
      context.fillStyle = '#fff2a8'; context.beginPath(); context.ellipse(light.x, light.y, 9, 3.5, -.45, 0, Math.PI * 2); context.fill();
    });
    if (sofiaSprite.complete) context.drawImage(sofiaSprite, Math.round(player.x), Math.round(player.y), player.width, player.height);
    else { context.fillStyle = '#c6a7f3'; context.fillRect(player.x, player.y, player.width, player.height); }
  }

  function loop(time) {
    requestAnimationFrame(loop);
    if (!gameVisible || document.hidden || time - lastFrame < 33) return;
    const delta = Math.min(2, (time - lastTime) / 16.67);
    lastTime = time; lastFrame = time;
    update(delta); draw();
  }

  const gameObserver = new IntersectionObserver(([entry]) => {
    gameVisible = entry.isIntersecting;
    if (gameVisible) lastTime = performance.now();
  }, { threshold: .05 });
  gameObserver.observe(gameCanvas);

  const keyMap = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' };
  window.addEventListener('keydown', (event) => {
    if (keyMap[event.key]) { gameKeys[keyMap[event.key]] = true; event.preventDefault(); }
  });
  window.addEventListener('keyup', (event) => { if (keyMap[event.key]) gameKeys[keyMap[event.key]] = false; });
  document.querySelectorAll('[data-game-control]').forEach((button) => {
    const control = button.dataset.gameControl;
    const press = (event) => { event.preventDefault(); button.classList.add('is-pressed'); gameKeys[control] = true; };
    const release = () => { button.classList.remove('is-pressed'); gameKeys[control] = false; };
    button.addEventListener('pointerdown', press); button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('pointerleave', release);
  });
  document.querySelector('[data-skip-game]')?.addEventListener('click', () => finishGame('Você ainda está na linha certa.'));
  requestAnimationFrame(loop);
}
