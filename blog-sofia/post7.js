(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const keys = {
    started: 'sofia-post7-started', atomist: 'sofia-post7-recipe-atomist',
    pythagorean: 'sofia-post7-recipe-pythagorean', complete: 'sofia-post7-main-complete',
    badge: 'sofia-emblem-loja-de-hefesto', water: 'sofia-post7-water-secret',
    ligeia: 'sofia-mission-ligeia-photo', owl: 'sofia-student-owl-unlocked',
    incubation: 'sofia-student-owl-incubation-start', lumiar: 'sofia-post7-lumiar-awake'
  };
  const get = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const set = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const found = (key, value = 'complete') => get(key) === value;
  const toast = (message) => { const el = $('[data-p7-toast]'); if (!el) return; el.textContent = message; el.hidden = false; clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 3600); };

  const delivery = $('[data-delivery]');
  const reveal = $('[data-blender-reveal]');
  const lab = $('[data-lab]');
  const completion = $('[data-completion]');
  const owl = $('[data-owl]');
  const epilogue = $('[data-epilogue]');
  let selected = [];
  let mixing = false;
  const recipes = {
    atomista: ['movimento', 'particulas', 'vazio'],
    pitagorica: ['harmonia', 'numero', 'proporcao']
  };
  const labels = { particulas: 'Partículas', vazio: 'Vazio', movimento: 'Movimento', numero: 'Número', harmonia: 'Harmonia', proporcao: 'Proporção', agua: 'Água' };
  const unstable = [
    ['RECEITA INSTÁVEL', 'Há boas ideias aqui, mas elas parecem pertencer a explicações diferentes.'],
    ['MODELO INCONCLUSIVO', 'As peças se movem, mas ainda não concordam sobre o que sustenta este universo.'],
    ['MISTURA SEM EQUILÍBRIO', 'Talvez o cosmos precise de uma escolha um pouco mais coerente.']
  ];

  function openBox() {
    set(keys.started, 'true');
    delivery?.classList.add('is-open');
    $('[data-open-box]')?.setAttribute('disabled', '');
    $('#box-status').textContent = 'A caixa foi aberta. Dentro dela havia um Liquidificador Cósmico.';
    reveal.hidden = false;
    reveal.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }
  function startLab() { lab.hidden = false; lab.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }

  function renderSelection() {
    $$('[data-ingredient]').forEach((button) => button.setAttribute('aria-pressed', String(selected.includes(button.dataset.ingredient))));
    const slots = $$('.p7-slots li');
    slots.forEach((slot, index) => { slot.textContent = selected[index] ? labels[selected[index]] : 'vazio'; slot.classList.toggle('is-filled', Boolean(selected[index])); });
    $('[data-mix]').disabled = selected.length !== 3 || mixing;
    $('[data-clear]').disabled = selected.length === 0 || mixing;
    const machine = $('[data-machine]');
    machine.dataset.fillCount = String(selected.length);
    machine.classList.toggle('is-loading', selected.length > 0 && !mixing);
    if (!mixing) $('[data-machine-image]').src = selected.length ? 'assets/arco2/post7/liquidificador-com-ingredientes.jpg' : 'assets/liquidificador-cosmico-desligado.jpeg';
  }
  function selectIngredient(id) {
    if (mixing || id === 'agua') return;
    const adding = !selected.includes(id) && selected.length < 3;
    if (selected.includes(id)) selected = selected.filter((item) => item !== id);
    else if (selected.length < 3) selected.push(id);
    else toast('O recipiente comporta três ingredientes. Retire um para trocar.');
    renderSelection();
    if (adding) {
      const machine = $('[data-machine]');
      machine.classList.remove('ingredient-added');
      void machine.offsetWidth;
      machine.classList.add('ingredient-added');
      window.setTimeout(() => machine.classList.remove('ingredient-added'), 520);
    }
  }
  function setResult(kicker, title, copy) { const result = $('[data-result]'); result.innerHTML = `<span>${kicker}</span><h3>${title}</h3><p>${copy}</p>`; }
  function discoverRecipe(name) {
    const atomist = name === 'atomista';
    set(atomist ? keys.atomist : keys.pythagorean, 'complete');
    const card = $(`[data-recipe-card="${name}"]`);
    card.classList.add('is-found');
    card.innerHTML = atomist
      ? '<span>Receita estável</span><h3>PARTÍCULAS · VAZIO · MOVIMENTO</h3><p>Pequenas partes movem-se no vazio. Elas se agrupam, separam-se e formam tudo aquilo que existe.</p>'
      : '<span>Receita estável</span><h3>NÚMERO · HARMONIA · PROPORÇÃO</h3><p>Relações, medidas e proporções organizam o cosmos.</p>';
    setResult('RECEITA ESTÁVEL', atomist ? 'Um universo de partes em movimento' : 'Um universo organizado por relações', atomist ? 'Então as coisas mudam sem que os pedacinhos fundamentais precisem mudar?' : 'Tá. O universo aparentemente também pode ter uma obsessão por matemática.');
    checkCompletion();
  }
  function checkCompletion() {
    if (!found(keys.atomist) || !found(keys.pythagorean)) return;
    const first = !found(keys.complete);
    set(keys.complete, 'complete'); set(keys.badge, 'collected'); set('sofia-clue-cosmic-recipes', 'found');
    completion.hidden = false; owl.hidden = false; epilogue.hidden = false;
    $('[data-water]').hidden = found(keys.water, 'found');
    if (!get(keys.incubation)) set(keys.incubation, String(Date.now()));
    renderIncubation();
    if (first) {
      window.renderClueState?.();
      window.dispatchEvent(new CustomEvent('sofia:clue-found', { detail: { key: 'cosmic-recipes' } }));
      window.dispatchEvent(new CustomEvent('sofia:emblem-found', { detail: { key: keys.badge } }));
      toast('Arquivo de investigação e emblema registrados.');
    }
  }
  function renderIncubation() {
    const status = $('[data-incubation-status]');
    const startedAt = Number(get(keys.incubation));
    if (!status || !startedAt) return;
    const remaining = Math.max(0, startedAt + (3 * 24 * 60 * 60 * 1000) - Date.now());
    if (remaining === 0) {
      set(keys.owl, 'unlocked');
      status.textContent = 'A incubação terminou. A toca da sua corujinha está na estante da Sala de Investigação. Toque nela para entrar.';
      return;
    }
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    status.textContent = `O seu ovo já está na estante da Sala de Investigação, em incubação. ${days === 1 ? 'Falta aproximadamente 1 dia' : `Faltam aproximadamente ${days} dias`} para a toca aparecer.`;
  }
  /* as animações do despertar só tocam quando o retrato está na tela; antes disso ficam pausadas */
  function watchLumiar() {
    const reveal = $('[data-lumiar-reveal]');
    const portrait = $('.p7-lumiar-portrait');
    if (!reveal || !portrait || !('IntersectionObserver' in window)) { reveal?.classList.add('is-visible'); return; }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      reveal.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(portrait);
  }
  function awakenLumiar({ scroll = true } = {}) {
    set(keys.lumiar, 'awake');
    $('[data-egg]').hidden = true;
    $('[data-awaken-lumiar]').hidden = true;
    $('[data-lumiar-reveal]').hidden = false;
    watchLumiar();
    if (scroll) $('.p7-lumiar-portrait').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }
  function mix() {
    if (mixing || selected.length !== 3) return;
    mixing = true; renderSelection();
    $('[data-machine]').classList.add('is-mixing');
    $('[data-machine-image]').src = 'assets/liquidificador-cosmico-ativado.jpeg';
    setResult('PROCESSANDO', 'O mecanismo está comparando as relações...', 'Nenhum universo foi prejudicado durante este teste.');
    setTimeout(() => {
      const normalized = [...selected].sort().join('|');
      const recipe = Object.entries(recipes).find(([, parts]) => parts.join('|') === normalized)?.[0];
      if (recipe) discoverRecipe(recipe);
      else { const message = unstable[Math.floor(Math.random() * unstable.length)]; setResult(message[0], 'O universo talhou.', message[1]); }
      mixing = false; selected = []; $('[data-machine]').classList.remove('is-mixing'); renderSelection();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1850);
  }
  function discoverWater() {
    set(keys.water, 'found'); $('[data-water]').hidden = true;
    setResult('INGREDIENTE NÃO CATALOGADO', 'Água', 'Origem detectada. Procurando correspondência...');
    lab.classList.add('is-aquatic');
    setTimeout(() => {
      set(keys.ligeia, 'found'); $('[data-ligeia]').hidden = false; $('[data-ligeia-ending]').hidden = false;
      window.dispatchEvent(new CustomEvent('sofia:mission-found', { detail: { key: keys.ligeia } }));
      $('[data-ligeia]').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      toast('Fotografia adicionada ao Inventário da Missão.');
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 900);
  }
  function restore() {
    if (get(keys.started)) {
      delivery.classList.add('is-open'); $('[data-open-box]').disabled = true; reveal.hidden = false; lab.hidden = false;
      $('#box-status').textContent = 'A caixa foi aberta. Dentro dela havia um Liquidificador Cósmico.';
    }
    if (found(keys.atomist)) discoverRecipe('atomista');
    if (found(keys.pythagorean)) discoverRecipe('pitagorica');
    if (found(keys.complete)) checkCompletion();
    if (found(keys.lumiar, 'awake')) awakenLumiar({ scroll: false });
    renderIncubation();
    if (found(keys.water, 'found')) $('[data-water]').hidden = true;
    if (found(keys.ligeia, 'found')) { $('[data-ligeia]').hidden = false; $('[data-ligeia-ending]').hidden = false; lab?.classList.add('is-aquatic'); }
    renderSelection();
  }

  $('[data-open-box]')?.addEventListener('click', openBox);
  $('[data-start-lab]')?.addEventListener('click', startLab);
  $$('[data-ingredient]').forEach((button) => button.addEventListener('click', () => selectIngredient(button.dataset.ingredient)));
  $('[data-clear]')?.addEventListener('click', () => { selected = []; renderSelection(); setResult('PAINEL DE RECEITAS', 'Aguardando ingredientes', 'Selecione três fichas para iniciar o mecanismo.'); });
  $('[data-mix]')?.addEventListener('click', mix);
  $('[data-water]')?.addEventListener('click', discoverWater);
  $('[data-awaken-lumiar]')?.addEventListener('click', () => awakenLumiar());
  restore();
})();
