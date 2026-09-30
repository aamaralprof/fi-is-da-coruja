(() => {
  'use strict';

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = [...document.querySelectorAll('[data-step]')];
  const messageList = document.querySelector('[data-arche-messages]');
  const typing = document.querySelector('[data-typing]');
  const skipChat = document.querySelector('[data-skip-chat]');
  const glitchButton = document.querySelector('[data-glitch]');
  const archeClue = document.querySelector('[data-arche-clue]');
  const storyContinue = document.querySelector('[data-story-continue]');
  let chatRun = 0;

  const speakers = {
    'Heráclito': { color: '#9b321d', avatar: 'assets/arco2/post6-prototype/heraclito-neutro.png' },
    'Parmênides': { color: '#15618f', avatar: 'assets/arco2/post6-prototype/parmenides-neutro-v2.png' },
    'Anaxímenes': { color: '#17623d', avatar: 'assets/arco2/post6-prototype/anaximenes-neutro.png' },
    'Anaximandro': { color: '#57258b', avatar: 'assets/arco2/post6-prototype/anaximandro-neutro.png' }
  };

  const conversation = [
    ['Heráclito', 'Vocês continuam procurando uma coisa que fique parada. Esse é o problema.'],
    ['Parmênides', 'O problema é você achar que tudo muda.'],
    ['Heráclito', 'Porque muda.'],
    ['Parmênides', 'Parece mudar.'],
    ['Anaxímenes', 'Enquanto vocês discutem, o ar continua sendo uma explicação perfeitamente razoável.'],
    ['Anaximandro', 'O ar também precisa vir de alguma coisa.'],
    ['Anaxímenes', 'Lá vem o ápeiron.'],
    ['Anaximandro', 'Porque o ápeiron resolve isso.'],
    ['Heráclito', 'Podemos mudar o nome do grupo para Elementos da Treta?'],
    ['Parmênides', 'Não.'],
    ['Heráclito', 'Por quê? Tem medo de mudança?'],
    ['system', 'Parmênides saiu do grupo.']
  ];

  const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

  const show = name => {
    steps.forEach(step => {
      const active = step.dataset.step === name;
      step.hidden = !active;
      step.classList.toggle('is-current', active);
    });
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const addMessage = ([speaker, text]) => {
    const item = document.createElement('li');
    if (speaker === 'system') {
      item.className = 'arche-message arche-message--system';
      item.textContent = text;
    } else {
      const profile = speakers[speaker];
      item.className = 'arche-message';
      item.style.setProperty('--speaker-color', profile.color);
      const avatar = document.createElement('img');
      avatar.src = profile.avatar;
      avatar.alt = '';
      const bubble = document.createElement('div');
      bubble.className = 'arche-bubble';
      const name = document.createElement('strong');
      name.textContent = speaker;
      const copy = document.createElement('p');
      copy.textContent = text;
      bubble.append(name, copy);
      item.append(avatar, bubble);
    }
    messageList.append(item);
    item.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  };

  const finishChat = run => {
    if (run !== chatRun) return;
    typing.hidden = true;
    skipChat.hidden = true;
    glitchButton.hidden = false;
    glitchButton.focus({ preventScroll: true });
  };

  const revealAll = () => {
    chatRun += 1;
    messageList.replaceChildren();
    conversation.forEach(addMessage);
    finishChat(chatRun);
  };

  const runChat = async () => {
    const run = ++chatRun;
    messageList.replaceChildren();
    skipChat.hidden = reducedMotion;
    glitchButton.hidden = true;
    if (reducedMotion) {
      conversation.forEach(addMessage);
      finishChat(run);
      return;
    }
    for (const message of conversation) {
      if (run !== chatRun) return;
      typing.hidden = false;
      await wait(message[0] === 'system' ? 650 : 360);
      if (run !== chatRun) return;
      typing.hidden = true;
      addMessage(message);
      await wait(message[0] === 'system' ? 900 : 430);
    }
    finishChat(run);
  };

  document.querySelectorAll('[data-next]').forEach(button => {
    button.addEventListener('click', () => show(button.dataset.next));
  });

  const collect = document.querySelector('[data-collect]');
  const status = document.querySelector('#collection-status');
  const collectionNext = document.querySelector('[data-step="collection"] [data-next]');
  collect.addEventListener('click', () => {
    localStorage.setItem('sofia-post6-sticker', 'collected');
    collect.disabled = true;
    collect.querySelector('span').textContent = 'cartela registrada';
    status.textContent = 'Item registrado em “Não é uma Coleção”.';
    collectionNext.hidden = false;
  });

  document.querySelector('[data-open-arche]').addEventListener('click', async () => {
    localStorage.setItem('sofia-arche-opened', 'true');
    show('boot');
    await wait(reducedMotion ? 100 : 1500);
    show('chat');
    runChat();
  });

  skipChat.addEventListener('click', revealAll);

  glitchButton.addEventListener('click', () => {
    chatRun += 1;
    show('glitch');
    setTimeout(() => document.querySelector('[data-step="glitch"] [data-next]')?.focus(), reducedMotion ? 0 : 900);
  });

  const revealBattleReward = () => {
    try {
      localStorage.setItem('sofia-clue-arche-principles', 'found');
    } catch {
      // A pista continua visível mesmo se o armazenamento estiver indisponível.
    }
    archeClue.hidden = false;
    storyContinue.hidden = false;
    archeClue.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.type !== 'sofia:arche-fight-completed') return;
    revealBattleReward();
  });

  try {
    if (localStorage.getItem('sofia-arche-fight-completed') === 'true') revealBattleReward();
  } catch {
    // Sem restauração de progresso quando o armazenamento está bloqueado.
  }
})();
