(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const keys = {started:'sofia-post8-started',sail:'sofia-post8-repair-vela',rigging:'sofia-post8-repair-cordame',hull:'sofia-post8-repair-casco',rudder:'sofia-post8-repair-leme',complete:'sofia-post8-mare-reparada',talesStarted:'sofia-post8-tales-started',talesComplete:'sofia-post8-ilha-tales-concluida',parmenidesStarted:'sofia-post8-parmenides-started',parmenidesCheckpoint:'sofia-post8-parmenides-ponto-seguro',parmenidesComplete:'sofia-post8-ilha-parmenides-concluida',heraclitoStarted:'sofia-post8-heraclito-started',heraclitoCheckpoint:'sofia-post8-heraclito-ponto-seguro',heraclitoComplete:'sofia-post8-ilha-heraclito-concluida',anaximenesStarted:'sofia-post8-anaximenes-started',anaximenesCheckpoint:'sofia-post8-anaximenes-ponto-seguro',anaximenesComplete:'sofia-post8-ilha-anaximenes-concluida',recipesStarted:'sofia-post8-receitas-started',recipeAtomist:'sofia-post8-receita-atomista',recipePythagorean:'sofia-post8-receita-pitagorica',recipesComplete:'sofia-post8-receitas-concluida',finalStarted:'sofia-post8-ultima-travessia',athens:'sofia-post8-atenas-alcancada',post8Complete:'sofia-post8-completed'};
  const matches = {sail:'patch',rigging:'rope',hull:'planks',rudder:'rudder-piece'};
  const labels = {patch:'Remendo selecionado. Agora escolha o rasgo na vela.',rope:'Corda selecionada. Agora escolha o cordame solto.',planks:'Tábuas selecionadas. Agora escolha o dano no casco.','rudder-piece':'Peça do leme selecionada. Agora escolha o mecanismo danificado.'};
  const completionLabels = {sail:'Vela reparada',rigging:'Cordame reparado',hull:'Casco reparado',rudder:'Leme reparado'};
  const pendingLabels = {sail:'Vela pendente',rigging:'Cordame pendente',hull:'Casco pendente',rudder:'Leme pendente'};

  const startButton = $('[data-begin-crossing]');
  const scene = $('[data-pixel-scene]');
  const transition = $('[data-transition]');
  const repair = $('[data-repair]');
  const hint = $('[data-tool-hint]');
  const dialogue = $('[data-repair-dialogue]');
  const completion = $('[data-repair-complete]');
  const shellDialog = $('[data-shell-dialog]');
  const tales = $('[data-tales]');
  const waterStatus = $('[data-water-status]');
  const talesComplete = $('[data-tales-complete]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const som = (name) => window.P8Som?.play(name);
  let selectedTool = '';
  let replayingTales = false;
  if (!startButton || !scene || !transition || !repair) return;

  const get = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const set = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const repaired = (damage) => get(keys[damage]) === 'complete';
  const completedCount = () => Object.keys(matches).filter(repaired).length;

  function revealRepair({scroll = false} = {}) {
    scene.classList.add('is-pixelating');
    transition.hidden = false;
    repair.hidden = false;
    startButton.textContent = get(keys.complete) === 'complete' ? 'Embarcação reparada' : 'Continuar reparo';
    const routeItems = $$('.p8-route li');
    routeItems[0]?.classList.remove('is-current');
    routeItems[1]?.classList.add('is-current');
    const harborState = routeItems[0]?.querySelector('small');
    if (harborState) harborState.textContent = 'concluído';
    const routeState = routeItems[1]?.querySelector('small');
    if (routeState) routeState.textContent = get(keys.complete) === 'complete' ? 'concluído' : 'em andamento';
    if (scroll) transition.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center'});
  }

  function beginCrossing() {
    set(keys.started, 'true');
    startButton.disabled = true;
    scene.classList.add('is-pixelating');
    window.setTimeout(() => { revealRepair({scroll:true}); startButton.disabled = false; }, reducedMotion.matches ? 0 : 650);
  }

  function selectTool(tool) {
    const button = $(`[data-tool="${tool}"]`);
    if (!tool || button?.classList.contains('is-used')) return;
    selectedTool = tool;
    $$('[data-tool]').forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.tool === tool)));
    $$('[data-damage]').forEach((zone) => zone.classList.toggle('is-target', !zone.classList.contains('is-repaired')));
    hint.textContent = labels[tool];
    som('clique');
  }

  function clearSelection() {
    selectedTool = '';
    $$('[data-tool]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
    $$('[data-damage]').forEach((zone) => zone.classList.remove('is-target'));
  }

  function finishRepair(firstCompletion) {
    set(keys.complete, 'complete');
    $('[data-vessel-state]').textContent = 'Navegável';
    $('[data-transition-vessel]').textContent = 'Navegável';
    $('[data-transition-repairs]').textContent = '0';
    completion.hidden = false;
    const routeItems = $$('.p8-route li');
    routeItems[0]?.classList.remove('is-current');
    routeItems[1]?.classList.add('is-current');
    const routeState = routeItems[1]?.querySelector('small');
    if (routeState) routeState.textContent = 'concluído';
    if (firstCompletion) {
      window.dispatchEvent(new CustomEvent('sofia:post8-repair-complete'));
      completion.focus({preventScroll:true});
    }
  }

  function revealTales({scroll = false} = {}) {
    if (!tales || get(keys.complete) !== 'complete') return;
    tales.hidden = false;
    const routeItems = $$('.p8-route li');
    routeItems[1]?.classList.remove('is-current');
    routeItems[2]?.classList.add('is-current');
    const routeState = routeItems[2]?.querySelector('small');
    if (routeState) routeState.textContent = get(keys.talesComplete) === 'complete' ? 'ilha I concluída' : 'ilha I em andamento';
    if (scroll) tales.scrollIntoView({behavior:reducedMotion.matches ? 'auto' : 'smooth',block:'start'});
  }

  function gateState(number) { return $(`[data-gate="${number}"]`)?.getAttribute('aria-pressed') === 'true'; }

  function renderWater({allowCompletion = true} = {}) {
    if (!tales) return;
    const states = [gateState(1),gateState(2),gateState(3),gateState(4)];
    const wet = [states[0],states[0] && !states[1],states[0] && !states[1] && states[2],states[0] && !states[1] && states[2] && states[3]];
    wet.forEach((active,index) => $(`[data-channel="${index + 1}"]`)?.classList.toggle('is-wet',active));
    $('[data-channel="5"]')?.classList.toggle('is-wet',gateState(5));
    const solved = wet[3];
    if (solved && allowCompletion) {
      const first = get(keys.talesComplete) !== 'complete';
      set(keys.talesComplete,'complete');
      $('[data-field]')?.classList.add('is-irrigated');
      $('[data-field-state]').textContent = 'irrigada';
      waterStatus.textContent = 'CURSO RESTABELECIDO ✓';
      talesComplete.hidden = false;
      revealTales();
      if (first) { som('vitoria'); window.dispatchEvent(new CustomEvent('sofia:post8-tales-complete')); talesComplete.focus({preventScroll:true}); }
    } else if (!solved) {
      $('[data-field]')?.classList.remove('is-irrigated');
      $('[data-field-state]').textContent = 'seca';
      talesComplete.hidden = true;
      waterStatus.textContent = gateState(5) ? 'A água entrou no canal de desvio. Ele não leva à plantação.' : wet.some(Boolean) ? 'A água avançou, mas ainda não alcançou a plantação.' : 'Observe os canais e altere as comportas.';
    }
  }

  function resetWater() {
    replayingTales = true;
    const initial = {1:false,2:true,3:false,4:true,5:false};
    Object.entries(initial).forEach(([number,open]) => {
      const gate = $(`[data-gate="${number}"]`);
      gate?.setAttribute('aria-pressed',String(open));
      const state = gate?.querySelector('i'); if (state) state.textContent = open ? 'aberta' : 'fechada';
    });
    renderWater({allowCompletion:false});
    waterStatus.textContent = 'Comportas reiniciadas. Tente um novo caminho.';
  }

  function renderRepair({firstCompletion = false} = {}) {
    const count = completedCount();
    $('[data-repair-count]').textContent = String(count);
    $('[data-repair-progress]').setAttribute('aria-valuenow', String(count));
    $$('.p8-progress i').forEach((bar,index) => bar.classList.toggle('is-complete', index < count));
    Object.entries(matches).forEach(([damage,tool]) => {
      const done = repaired(damage);
      const damageButton = $(`[data-damage="${damage}"]`);
      damageButton?.classList.toggle('is-repaired', done);
      if (damageButton) damageButton.disabled = done;
      const toolButton = $(`[data-tool="${tool}"]`);
      toolButton?.classList.toggle('is-used', done);
      if (toolButton) toolButton.disabled = done;
      const log = $(`[data-log="${damage}"]`);
      if (log) { log.classList.toggle('is-complete', done); log.textContent = done ? completionLabels[damage] : pendingLabels[damage]; }
    });
    if (count >= 2 && count < 4) dialogue.innerHTML = '<p><b>Sofia</b> Essa confiança toda é baseada em alguma coisa?</p><p><b>Ligeia</b> Experiência.</p><p><b>Sofia</b> Isso não respondeu à pergunta.</p>';
    if (count === 4) finishRepair(firstCompletion);
  }

  function tryRepair(damage, tool = selectedTool) {
    const zone = $(`[data-damage="${damage}"]`);
    if (!zone || zone.classList.contains('is-repaired')) return;
    if (!tool) { hint.textContent = 'Escolha primeiro um item da caixa de ferramentas.'; return; }
    if (matches[damage] !== tool) {
      hint.textContent = 'Essa peça não encaixa aqui. Ela voltou para a caixa.';
      som('erro');
      zone.classList.remove('is-wrong'); void zone.offsetWidth; zone.classList.add('is-wrong');
      clearSelection(); window.setTimeout(() => zone.classList.remove('is-wrong'), 400); return;
    }
    const before = completedCount();
    set(keys[damage], 'complete');
    clearSelection();
    hint.textContent = `✓ ${completionLabels[damage].toUpperCase()}`;
    som(before === 3 ? 'vitoria' : 'acerto');
    renderRepair({firstCompletion:before === 3});
  }

  $$('[data-tool]').forEach((button) => {
    button.addEventListener('click', () => selectTool(button.dataset.tool));
    button.addEventListener('dragstart', (event) => {
      if (button.classList.contains('is-used')) { event.preventDefault(); return; }
      selectTool(button.dataset.tool); event.dataTransfer.setData('text/plain',button.dataset.tool); event.dataTransfer.effectAllowed = 'move';
    });
  });
  $$('[data-damage]').forEach((zone) => {
    zone.addEventListener('click', () => tryRepair(zone.dataset.damage));
    zone.addEventListener('dragover', (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; });
    zone.addEventListener('drop', (event) => { event.preventDefault(); tryRepair(zone.dataset.damage,event.dataTransfer.getData('text/plain')); });
  });
  $('[data-shell]')?.addEventListener('click', () => { if (typeof shellDialog?.showModal === 'function') shellDialog.showModal(); });
  $('[data-close-shell]')?.addEventListener('click', () => shellDialog?.close());

  $$('[data-gate]').forEach((gate) => gate.addEventListener('click', () => {
    replayingTales = true;
    const open = gate.getAttribute('aria-pressed') !== 'true';
    gate.setAttribute('aria-pressed',String(open));
    gate.querySelector('i').textContent = open ? 'aberta' : 'fechada';
    som('clique');
    renderWater();
  }));
  $('[data-reset-water]')?.addEventListener('click',resetWater);

  /* Ilhas de plataforma (II Parmênides, III Heráclito): mesma tela, mesmo motor (post8-plataforma.js). */
  /* Personagens em resolução 2x: mantêm a leitura pixel art, mas recuperam os traços
     canônicos das pranchas (óculos, mochila, gravata e mechas de Sofia). */
  const sofiaSprite = '<svg viewBox="0 0 16 28" aria-hidden="true" shape-rendering="crispEdges">'
    + '<path fill="#241713" d="M4 1h7v1h2v2h1v7h-2V5H4v7H2V4h2z"/><path fill="#4a2b20" d="M3 3h9v2H3zm-1 3h3v7H2zm9-1h3v9h-3z"/>'
    + '<path fill="#efbd96" d="M5 5h7v7H5z"/><path fill="#f6d0aa" d="M6 11h5v2H6z"/>'
    + '<path fill="#18222e" d="M5 7h3v3H5zm4 0h3v3H9z"/><path fill="#86a8b5" d="M6 8h1v1H6zm4 0h1v1h-1z"/><path fill="#18222e" d="M8 8h1v1H8z"/>'
    + '<path fill="#ad9ace" d="M1 13h4v10H1z"/><path fill="#766394" d="M0 15h2v7H0zm2 6h3v2H2z"/><path fill="#e7b45e" d="M2 20h2v1H2z"/>'
    + '<path fill="#285f43" d="M4 13h9v8H4z"/><path fill="#173f2d" d="M4 19h9v3H4z"/><path fill="#f2eadb" d="M7 13h3v3H7z"/><path fill="#963b42" d="M8 15h1v5H8z"/>'
    + '<path fill="#d6b07c" d="M5 13h1v7H5zm6 0h1v7h-1z"/><path fill="#efbd96" d="M13 15h2v5h-2z"/>'
    + '<path class="p8-leg-a" fill="#294a3a" d="M5 21h3v5H5z"/><path class="p8-leg-b" fill="#294a3a" d="M10 21h3v5h-3z"/>'
    + '<path fill="#2a1c19" d="M4 25h4v3H3v-2h1zm6 0h3v1h2v2h-5z"/></svg>';
  const ligeiaSprite = '<svg viewBox="0 0 18 30" aria-hidden="true" shape-rendering="crispEdges">'
    + '<path fill="#241915" d="M4 4h10v8H3V6h1z"/><path fill="#b3422f" d="M5 5h10v2h2v12h-3V9H5v11H2V7h3z"/><path fill="#d7613b" d="M3 10h3v11H2v-8h1zm10-2h3v13h-4z"/>'
    + '<path fill="#edb28a" d="M6 7h7v7H6z"/><path fill="#315368" d="M6 10h2v1H6zm5 0h2v1h-2z"/><path fill="#1a2733" d="M8 14h3v1H8z"/>'
    + '<path fill="#17283c" d="M3 3h13v3H3zM5 1h9v2H5z"/><path fill="#c5913e" d="M8 2h3v1H8zm1 1h1v2H9z"/>'
    + '<path fill="#18314c" d="M4 15h11v9H4z"/><path fill="#294d6e" d="M5 16h9v2H5z"/><path fill="#c18b3e" d="M6 17h1v5H6zm6 0h1v5h-1zM8 19h3v1H8z"/>'
    + '<path fill="#edb28a" d="M2 17h2v5H2zm13 0h2v5h-2z"/><path fill="#182b43" d="M5 24h4v5H5zm6 0h4v5h-4z"/><path fill="#171c25" d="M4 28h5v2H4zm7 0h5v2h-5z"/></svg>';
  const routeSmall = () => $$('.p8-route li')[2]?.querySelector('small');

  /* o botão fixo do caderno cobre o botão de pulo; some só enquanto controles de alguma ilha estão na tela */
  const controlsOnScreen = new Set();
  const controlsObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? controlsOnScreen.add(entry.target) : controlsOnScreen.delete(entry.target));
    document.body.classList.toggle('p8-climb-onscreen', controlsOnScreen.size > 0);
  }) : null;
  /* Ilha I: o botão "Reiniciar comportas" fica no mesmo canto do caderno */
  const waterBar = $('.p8-tales .p8-puzzle-bar');
  if (waterBar) controlsObserver?.observe(waterBar);

  /* sprite das pranchas apoiado no chão: x à esquerda, base em y, largura w (px lógicos) */
  const sprite = (file, x, y, w, extra = '') => `<img class="p8-sprite${extra}" src="assets/arco2/post8/pixel/${file}" style="left:${x}px;top:${y}px;width:${w}px" alt="" aria-hidden="true">`;

  function buildClimbWorld(level, world, scenery = '', templeImg = '') {
    const bits = [scenery];
    (level.decor || []).forEach((s) => bits.push(`<div class="p8-rock p8-rock--decor" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px"></div>`));
    level.solids.forEach((s, index) => bits.push(`<div class="p8-rock p8-rock--${s.kind || 'path'}${s.phase ? ` p8-phase-${s.phase}` : ''}" data-solid="${index}" style="left:${s.x}px;top:${s.y}px;width:${s.w}px;height:${s.h}px"><span></span></div>`));
    level.checkpoints.forEach((cp, index) => bits.push(`<div class="p8-flag" data-flag="${index + 1}" style="left:${cp.x - 7}px;top:${cp.y - 40}px"><i></i><span>${index + 1}</span></div>`));
    const g = level.goal;
    const t = level.temple || g;
    const templeW = Math.min(t.w + 20, 96);
    bits.push(templeImg ? sprite(templeImg, t.x + t.w / 2 - templeW / 2, g.y + g.h, templeW, ' p8-temple-img') : `<div class="p8-temple" style="left:${t.x - 10}px;top:${g.y + g.h - 58}px;width:${t.w + 20}px"><b></b><i></i><i></i><i></i><i></i></div>`);
    bits.push(`<div class="p8-companion" aria-hidden="true">${ligeiaSprite}<i></i></div>`);
    bits.push(`<div class="p8-sofia" data-climb-sofia>${sofiaSprite}<i class="p8-sprite-shadow"></i></div>`);
    world.style.width = `${level.width}px`;
    world.style.height = `${level.height}px`;
    world.innerHTML = bits.join('');
  }

  function createPlatformStage(cfg) {
    const section = cfg.section;
    if (!section || !cfg.level) return {reveal() {}};
    const q = (selector) => $(selector, section);
    const status = q('[data-climb-status]');
    const overlay = q('[data-climb-overlay]');
    const done = q('[data-stage-complete]');
    const startBtn = q('[data-climb-start]');
    const viewport = q('[data-climb-viewport]');
    const total = cfg.level.checkpoints.length;
    let engine = null;
    const say = (message) => { status.textContent = message; };

    const isDone = () => get(cfg.keys.complete) === 'complete';
    function markFlags(count) {
      $$('[data-flag]', section).forEach((flag) => flag.classList.toggle('is-active', Number(flag.dataset.flag) <= count));
      const out = q('[data-climb-count]'); if (out) out.textContent = String(count);
    }
    function setRoute() { const small = routeSmall(); if (small) small.textContent = isDone() ? cfg.route[1] : cfg.route[0]; }

    function finish(first) {
      set(cfg.keys.complete, 'complete');
      status.textContent = cfg.text.doneStatus;
      overlay.hidden = false;
      q('[data-climb-overlay-title]').textContent = cfg.text.doneOverlay;
      startBtn.textContent = cfg.text.replay;
      done.hidden = false;
      markFlags(total);
      setRoute();
      if (first) { window.dispatchEvent(new CustomEvent(cfg.event)); done.focus({preventScroll:true}); }
    }

    function setup() {
      if (engine || !window.P8Platformer) return;
      const world = q('[data-climb-world]');
      buildClimbWorld(cfg.level, world, cfg.scenery || '', cfg.templeImg || '');
      cfg.attach?.(world);
      engine = window.P8Platformer.create({
        viewport, world, level: cfg.level,
        sprite: q('[data-climb-sofia]'),
        controls: $$('[data-control]', section),
        onStep: cfg.onStep ? (body, dt) => cfg.onStep(body, dt, say) : null,
        onCheckpoint(i) {
          if (Number(get(cfg.keys.checkpoint) || 0) < i) set(cfg.keys.checkpoint, String(i));
          markFlags(i);
          som('ponto');
          status.textContent = cfg.text.checkpoint(i, total);
        },
        onRespawn() { som('queda'); status.textContent = cfg.text.respawn; },
        onJump() { som('pulo'); },
        onZone(zone) { if (cfg.onZone) cfg.onZone(zone, say); else say(zone.message); },
        onGoal() { som('vitoria'); finish(!isDone()); }
      });
      const controls = q('.p8-climb-controls');
      if (controls) controlsObserver?.observe(controls);
      if (isDone()) { engine.finishAtGoal(); finish(false); return; }
      const saved = Math.min(total, Number(get(cfg.keys.checkpoint) || 0));
      if (saved > 0) {
        engine.setCheckpoint(saved);
        markFlags(saved);
        startBtn.textContent = cfg.text.resume;
        status.textContent = `Retomando do ponto seguro ${saved}/${total}.`;
      }
    }

    /* progresso que chegou depois (passaporte): só aplica com a ilha parada, sem atrapalhar quem joga */
    function refresh() {
      if (!engine || engine.state.running) return;
      if (isDone() && !engine.state.finished) { engine.finishAtGoal(); finish(false); return; }
      const saved = Math.min(total, Number(get(cfg.keys.checkpoint) || 0));
      if (!engine.state.finished && saved > engine.state.checkpoint) {
        engine.setCheckpoint(saved);
        markFlags(saved);
        startBtn.textContent = cfg.text.resume;
        status.textContent = `Retomando do ponto seguro ${saved}/${total}.`;
      }
    }

    function play() {
      overlay.hidden = true;
      viewport.focus({preventScroll:true});
      engine.start();
    }

    startBtn?.addEventListener('click', () => {
      if (!engine) return;
      if (engine.state.finished) { engine.restart(); cfg.onRestart?.(); markFlags(0); status.textContent = cfg.text.restart; }
      play();
    });
    q('[data-climb-reset]')?.addEventListener('click', () => {
      if (!engine) return;
      engine.restart();
      cfg.onRestart?.();
      set(cfg.keys.checkpoint, '0');
      markFlags(0);
      status.textContent = cfg.text.restart;
      play();
    });

    return {
      reveal({scroll = false} = {}) {
        if (get(cfg.prerequisite) !== 'complete') return;
        section.hidden = false;
        if (engine) refresh(); else setup();
        setRoute();
        if (scroll) section.scrollIntoView({behavior:reducedMotion.matches ? 'auto' : 'smooth',block:'start'});
      }
    };
  }

  /* Ilha II — A Montanha Imóvel (Parmênides): o cenário não muda. */
  const parmenidesStage = createPlatformStage({
    section: $('[data-parmenides]'),
    level: window.P8Levels?.parmenides,
    prerequisite: keys.talesComplete,
    keys: {checkpoint: keys.parmenidesCheckpoint, complete: keys.parmenidesComplete},
    route: ['ilha II em andamento', 'ilha II concluída'],
    event: 'sofia:post8-parmenides-complete',
    scenery: '<div class="p8-mountain" aria-hidden="true"></div><div class="p8-parallax-haze" aria-hidden="true"></div><div class="p8-seabirds" aria-hidden="true"><i></i><i></i><i></i></div>'
      + sprite('parm-rochas.png', 0, 1200, 112) + sprite('parm-rochas.png', 368, 1200, 112) + sprite('parm-cipreste.png', 452, 1005, 16)
      + sprite('parm-arvore.png', 72, 810, 34) + sprite('parm-arbustos.png', 428, 615, 36) + sprite('parm-arvore.png', 66, 420, 32)
      + sprite('parm-cipreste.png', 462, 225, 14) + sprite('estandarte.png', 296, 160, 22),
    templeImg: 'parm-ruinas.png',
    text: {
      checkpoint: (i, total) => i === 1 ? `Ponto seguro ${i}/${total} registrado. A trilha continua igual.` : `Ponto seguro ${i}/${total} registrado.`,
      respawn: 'Sofia escorregou e voltou ao último ponto seguro.',
      restart: 'Subida reiniciada. De volta ao pé da montanha.',
      resume: 'Continuar subida',
      replay: 'Subir de novo',
      doneStatus: 'TOPO ALCANÇADO ✓',
      doneOverlay: 'Topo alcançado ✓'
    }
  });

  /* Ilha III — Aquilo que Muda (Heráclito): o mesmo motor, mais dois estados que se alternam. */
  function createHeraclitoCycle(level, section) {
    const DURATION = 3.2;
    const WARNING = 1;
    const overlaps = window.P8Platformer?.overlaps;
    const label = $('[data-heraclito-state]', section);
    const labels = {a: 'Estado A · água alta, fogo apagado', b: 'Estado B · água baixa, fogo aceso'};
    const visited = new Set();
    let world = null;
    let els = [];
    let phase = 'a';
    let clock = 0;
    let warned = false;
    let said = false;

    function paint() {
      if (!world) return;
      world.classList.toggle('heraclito-state-a', phase === 'a');
      world.classList.toggle('heraclito-state-b', phase === 'b');
      world.classList.toggle('is-warning', warned);
      if (label) label.textContent = warned ? `${labels[phase]} · a ilha vai mudar` : labels[phase];
    }

    /* Plataforma não some debaixo de Sofia, e passagem não se fecha em cima dela. */
    function sync(body) {
      level.solids.forEach((s, i) => {
        if (!s.phase) return;
        const want = s.phase === phase;
        const on = s.active !== false;
        const holding = !want && on && !!body && body.ground === s;
        if (holding !== !!s.holding) { s.holding = holding; els[i]?.classList.toggle('is-holding', holding); }
        if (want === on || holding) return;
        if (want && body && overlaps(body, s)) return;
        s.active = want;
        els[i]?.classList.toggle('is-off', !want);
      });
    }

    function reset() { phase = 'a'; clock = 0; warned = false; sync(null); paint(); }

    return {
      attach(w) { world = w; els = level.solids.map((_, i) => $(`[data-solid="${i}"]`, w)); reset(); },
      reset,
      step(body, dt, say) {
        clock += dt;
        if (!warned && clock >= DURATION - WARNING) { warned = true; paint(); }
        if (clock >= DURATION) { clock = 0; warned = false; phase = phase === 'a' ? 'b' : 'a'; paint(); som('troca'); }
        sync(body);
        if (body.ground?.phase) visited.add(body.ground);
        if (!said && body.grounded && body.vx < -30) {
          for (const s of visited) {
            if (s.active === false && s.x + s.w <= body.x + 4 && s.x + s.w >= body.x - 90) { said = true; say('Sofia — Mas eu acabei de passar por aqui!'); break; }
          }
        }
      }
    };
  }

  const heraclitoSection = $('[data-heraclito]');
  const heraclitoLevel = window.P8Levels?.heraclito;
  const heraclitoCycle = heraclitoLevel ? createHeraclitoCycle(heraclitoLevel, heraclitoSection) : null;
  const heraclitoStage = createPlatformStage({
    section: heraclitoLevel ? heraclitoSection : null,
    level: heraclitoLevel,
    prerequisite: keys.parmenidesComplete,
    keys: {checkpoint: keys.heraclitoCheckpoint, complete: keys.heraclitoComplete},
    route: ['ilha III em andamento', 'ilha III concluída'],
    event: 'sofia:post8-heraclito-complete',
    scenery: '<div class="p8-bg-cliff" style="left:880px;top:110px;width:190px;height:200px" aria-hidden="true"></div><div class="p8-dusk-glow" aria-hidden="true"></div><div class="p8-embers" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'
      + sprite('her-ruinas.png', 896, 112, 60, ' p8-sprite--far')
      + '<div class="p8-deco-falls" style="left:960px;top:118px;height:186px" aria-hidden="true"></div>'
      + '<div class="p8-deco-falls" style="left:720px;top:214px;height:90px" aria-hidden="true"></div>'
      + '<div class="p8-deco-falls p8-deco-falls--thin" style="left:1040px;top:130px;height:170px" aria-hidden="true"></div>'
      + '<div class="p8-water" aria-hidden="true"></div>'
      + sprite('her-arvore.png', 30, 300, 54) + sprite('her-arvore.png', 392, 300, 48) + sprite('her-arvore.png', 1262, 280, 50)
      + '<div class="p8-brazier" style="left:150px;top:288px" aria-hidden="true"><i></i></div><div class="p8-brazier" style="left:784px;top:184px" aria-hidden="true"><i></i></div>'
      + '<div class="p8-brazier" style="left:1150px;top:268px" aria-hidden="true"><i></i></div><div class="p8-brazier" style="left:1318px;top:268px" aria-hidden="true"><i></i></div>'
      + sprite('estandarte.png', 6, 300, 22) + sprite('estandarte.png', 1414, 280, 22)
      + '<div class="p8-leaves" aria-hidden="true"><i style="left:120px;top:60px"></i><i style="left:420px;top:30px"></i><i style="left:700px;top:90px"></i><i style="left:980px;top:40px"></i><i style="left:1250px;top:70px"></i></div>',
    templeImg: 'her-ruinas.png',
    attach: (world) => heraclitoCycle.attach(world),
    onStep: (body, dt, say) => heraclitoCycle.step(body, dt, say),
    onRestart: () => heraclitoCycle.reset(),
    text: {
      checkpoint: (i, total) => `Ponto seguro ${i}/${total} registrado.`,
      respawn: 'Sofia caiu na água e voltou ao último ponto seguro.',
      restart: 'Travessia reiniciada. A ilha continua mudando.',
      resume: 'Continuar travessia',
      replay: 'Atravessar de novo',
      doneStatus: 'OUTRO LADO ALCANÇADO ✓',
      doneOverlay: 'Outro lado alcançado ✓'
    }
  });


  /* Ilha IV — O Sopro que Sustenta (Anaxímenes): o mesmo motor, mais correntes de ar (level.currents). */
  function createWindIsland(level) {
    const first = level.currents[0];
    let world = null;
    let els = [];
    let clock = 0;
    let gustAt = -1;
    let saidFly = false;

    function paint() { els.forEach((el, i) => el.classList.toggle('is-off', level.currents[i].active === false)); }
    function wake() { first.active = true; paint(); }

    return {
      attach(w, awake) {
        world = w;
        const markup = level.currents.map((c, i) => `<div class="p8-current" data-current="${i}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px" aria-hidden="true"><i></i><i></i><i></i></div>`).join('');
        w.insertAdjacentHTML('afterbegin', markup);
        els = level.currents.map((_, i) => $(`[data-current="${i}"]`, w));
        if (awake) wake(); else this.reset();
      },
      reset() { first.active = false; clock = 0; gustAt = -1; saidFly = false; paint(); },
      onZone(zone, say) {
        if (zone.id !== 'borda' || first.active !== false || gustAt >= 0) return;
        say(zone.message);
        gustAt = clock + 1.1;
      },
      step(body, dt, say) {
        clock += dt;
        if (gustAt >= 0 && clock >= gustAt) {
          gustAt = -1;
          som('vento');
          wake();
          world.classList.add('is-gust');
          window.setTimeout(() => world.classList.remove('is-gust'), 1600);
          say('Uma rajada sobe do fundo do penhasco. Sofia — Ah.');
        }
        if (!saidFly && body.inCurrent) { saidFly = true; say('Sofia — Nem pense em dizer que eu tenho que voar.'); }
      }
    };
  }

  const anaximenesLevel = window.P8Levels?.anaximenes;
  const windIsland = anaximenesLevel ? createWindIsland(anaximenesLevel) : null;
  const anaximenesStage = createPlatformStage({
    section: anaximenesLevel ? $('[data-anaximenes]') : null,
    level: anaximenesLevel,
    prerequisite: keys.heraclitoComplete,
    keys: {checkpoint: keys.anaximenesCheckpoint, complete: keys.anaximenesComplete},
    route: ['ilha IV em andamento', 'ilha IV concluída'],
    event: 'sofia:post8-anaximenes-complete',
    scenery: '<div class="p8-far-isles" aria-hidden="true"><i style="left:150px;top:110px"></i><i class="is-small" style="left:560px;top:60px"></i><i style="left:1000px;top:120px"></i><i class="is-small" style="left:1300px;top:70px"></i></div>'
      + '<div class="p8-birds" aria-hidden="true" style="left:380px;top:40px"><i></i><i></i><i></i></div><div class="p8-birds" aria-hidden="true" style="left:1180px;top:30px"><i></i><i></i></div>'
      + sprite('nuvem.png', 50, 70, 80, ' p8-sprite--cloud') + sprite('nuvem.png', 520, 46, 64, ' p8-sprite--cloud') + sprite('nuvem.png', 880, 176, 72, ' p8-sprite--cloud') + sprite('nuvem.png', 1180, 60, 60, ' p8-sprite--cloud')
      + '<div class="p8-deco-falls p8-deco-falls--sky" style="left:424px;top:268px;height:212px" aria-hidden="true"></div><div class="p8-deco-falls p8-deco-falls--sky p8-deco-falls--thin" style="left:1044px;top:80px;height:400px" aria-hidden="true"></div><div class="p8-deco-falls p8-deco-falls--sky" style="left:1420px;top:228px;height:252px" aria-hidden="true"></div>'
      + sprite('ana-moinho.png', 104, 300, 56)
      + sprite('ana-arvore.png', 10, 300, 50) + sprite('ana-arvore.png', 806, 200, 44) + sprite('ana-arvore.png', 1012, 70, 40) + sprite('ana-arvore.png', 1258, 220, 46)
      + '<div class="p8-banner" style="left:226px;top:250px" aria-hidden="true"><i></i></div><div class="p8-banner" style="left:530px;top:210px" aria-hidden="true"><i></i></div>'
      + sprite('estandarte.png', 1424, 220, 20)
      + '<div class="p8-cloud-sea" aria-hidden="true"></div>',
    templeImg: 'ana-templo.png',
    attach: (world) => windIsland.attach(world, Number(get(keys.anaximenesCheckpoint) || 0) > 0 || get(keys.anaximenesComplete) === 'complete'),
    onZone: (zone, say) => windIsland.onZone(zone, say),
    onStep: (body, dt, say) => windIsland.step(body, dt, say),
    onRestart: () => windIsland.reset(),
    text: {
      checkpoint: (i, total) => `Ponto seguro ${i}/${total} registrado.`,
      respawn: 'Sofia caiu no vão e voltou ao último ponto seguro.',
      restart: 'Travessia reiniciada. O vento continua lá.',
      resume: 'Continuar travessia',
      replay: 'Atravessar de novo',
      doneStatus: 'OUTRO LADO ALCANÇADO ✓',
      doneOverlay: 'Outro lado alcançado ✓'
    }
  });
  /* Ilha V — Receitas do Universo: as duas receitas do post 7 e as archai das ilhas (Tales, Anaxímenes, Heráclito). */
  const recipesSection = $('[data-recipes]');
  const recipeBook = {
    atomista: {parts: ['movimento', 'particulas', 'vazio'], key: keys.recipeAtomist, title: 'Um universo de partes em movimento', name: 'PARTÍCULAS · VAZIO · MOVIMENTO', text: 'Pequenas partes movem-se no vazio. Elas se agrupam, separam-se e formam tudo aquilo que existe.', partial: 'Há pedaços se movendo aqui. Falta alguma coisa para que eles formem um mundo.'},
    pitagorica: {parts: ['harmonia', 'numero', 'proporcao'], key: keys.recipePythagorean, title: 'Um universo organizado por relações', name: 'NÚMERO · HARMONIA · PROPORÇÃO', text: 'Relações, medidas e proporções organizam o cosmos.', partial: 'Há medida e ordem aqui. Mas as relações ainda não fecham.'}
  };
  const ingredientLabels = {particulas: 'Partículas', vazio: 'Vazio', movimento: 'Movimento', numero: 'Número', harmonia: 'Harmonia', proporcao: 'Proporção', agua: 'Água', ar: 'Ar', fogo: 'Fogo'};
  const archai = ['agua', 'ar', 'fogo'];
  const failures = [
    ['RECEITA INSTÁVEL', 'Algo não funcionou.', 'Há boas ideias aqui, mas elas parecem pertencer a explicações diferentes.'],
    ['MODELO INCONCLUSIVO', 'Só fumaça.', 'As peças se movem, mas ainda não concordam sobre o que sustenta este universo.'],
    ['MISTURA SEM EQUILÍBRIO', 'Tente outra combinação.', 'Talvez o cosmos precise de uma escolha um pouco mais coerente.']
  ];
  let bowl = [];
  let cooking = false;
  let attempts = 0;
  let recipesRestored = false;
  const recipeFound = (name) => get(recipeBook[name].key) === 'complete';

  function kitchenResult(kicker, title, copy, hint = '') {
    const box = $('[data-kitchen-result]');
    if (box) box.innerHTML = `<span>${kicker}</span><h3>${title}</h3><p>${copy}</p>${hint ? `<p class="p8-kitchen-hint">${hint}</p>` : ''}`;
  }

  function renderBowl() {
    if (!recipesSection) return;
    $$('[data-recipe-ingredient]', recipesSection).forEach((button) => button.setAttribute('aria-pressed', String(bowl.includes(button.dataset.recipeIngredient))));
    $$('[data-bowl-slot]', recipesSection).forEach((slot, index) => {
      const id = bowl[index];
      slot.textContent = id ? ingredientLabels[id] : 'vazio';
      slot.disabled = !id || cooking;
      slot.setAttribute('aria-label', id ? `Devolver ${ingredientLabels[id]} à prateleira` : 'Espaço vazio');
      slot.classList.toggle('is-filled', Boolean(id));
    });
    $('[data-prepare]').disabled = bowl.length !== 3 || cooking;
    $('[data-clear-bowl]').disabled = bowl.length === 0 || cooking;
  }

  function addIngredient(id) {
    if (cooking || !ingredientLabels[id]) return;
    if (bowl.includes(id)) { bowl = bowl.filter((item) => item !== id); renderBowl(); return; }
    if (bowl.length >= 3) { kitchenResult('BANCADA', 'Recipiente cheio', 'O recipiente comporta três ingredientes. Retire um para trocar.'); return; }
    bowl.push(id);
    som('clique');
    renderBowl();
    const vessel = $('[data-bowl]');
    vessel.classList.remove('is-added'); void vessel.offsetWidth; vessel.classList.add('is-added');
  }

  function renderRecipeCards() {
    Object.entries(recipeBook).forEach(([name, recipe]) => {
      const card = $(`[data-p8-recipe-card="${name}"]`);
      if (!card || !recipeFound(name)) return;
      card.classList.add('is-found');
      card.innerHTML = `<span>Receita revelada ✓</span><h3>${recipe.name}</h3><p>${recipe.text}</p>`;
    });
  }

  function ovenEffect(kind) {
    const oven = $('[data-oven]');
    oven.classList.remove('is-smoke', 'is-poof', 'is-steam', 'is-glow');
    void oven.offsetWidth;
    if (kind) oven.classList.add(`is-${kind}`);
  }

  function finishRecipes(name, first) {
    recipesRestored = true;
    set(keys.recipesComplete, 'complete');
    const done = $('[data-recipes-complete]');
    done.hidden = false;
    $('[data-recipes-complete-title]').textContent = recipeBook[name].title;
    $('[data-recipes-extra]').hidden = Object.keys(recipeBook).every(recipeFound);
    const small = routeSmall(); if (small) small.textContent = 'ilha V concluída';
    if (first) { window.dispatchEvent(new CustomEvent('sofia:post8-recipes-complete')); done.focus({preventScroll:true}); }
  }

  /* correto: os três de uma receita; parcial: dois da mesma receita; incorreto: o resto */
  function judge(selection) {
    const sorted = [...selection].sort().join('|');
    const exact = Object.entries(recipeBook).find(([, recipe]) => recipe.parts.join('|') === sorted)?.[0];
    if (exact) return {kind: 'correct', recipe: exact};
    const best = Object.entries(recipeBook).map(([name, recipe]) => [name, selection.filter((id) => recipe.parts.includes(id)).length]).sort((a, b) => b[1] - a[1])[0];
    if (best[1] === 2) return {kind: 'partial', recipe: best[0]};
    return {kind: 'wrong', fire: selection.includes('fogo'), archai: selection.every((id) => archai.includes(id))};
  }

  function prepare() {
    if (cooking || bowl.length !== 3) return;
    cooking = true;
    renderBowl();
    ovenEffect(null);
    $('[data-oven]').classList.add('is-cooking');
    kitchenResult('NO FORNO', 'Preparando...', 'Nenhum universo foi prejudicado durante este teste.');
    const outcome = judge(bowl);
    window.setTimeout(() => {
      $('[data-oven]').classList.remove('is-cooking');
      attempts += 1;
      if (outcome.kind === 'correct') {
        const recipe = recipeBook[outcome.recipe];
        const first = get(keys.recipesComplete) !== 'complete';
        set(recipe.key, 'complete');
        ovenEffect('glow');
        som('vitoria');
        kitchenResult('RECEITA REVELADA ✓', recipe.title, recipe.text);
        renderRecipeCards();
        finishRecipes(outcome.recipe, first);
      } else {
        /* dicas aparecem abaixo do resultado, sem apagar o que a tentativa mostrou */
        let hint = '';
        if (get(keys.recipesComplete) !== 'complete') {
          if (attempts === 3) hint = 'Ligeia — Lembra da encomenda sem remetente? Aquele liquidificador aceitava só duas receitas. Elas continuam valendo.';
          else if (attempts >= 5 && attempts % 2 === 1) hint = 'Dica: uma receita fala de pequenas partes que se movem no vazio. A outra, de relações, medidas e proporções.';
        }
        if (outcome.kind === 'partial') {
          ovenEffect('steam');
          som('troca');
          kitchenResult('RESULTADO PARCIAL', 'Interessante... Ainda não é isso.', recipeBook[outcome.recipe].partial, hint);
        } else {
          ovenEffect(outcome.fire ? 'poof' : 'smoke');
          som('erro');
          const [kicker, title, copy] = outcome.archai
            ? ['RESULTADO INCORRETO', 'Três princípios. Nenhum acordo.', 'Água, ar, fogo... cada um já foi, sozinho, a resposta de alguém. Juntos, só fazem fumaça.']
            : failures[(attempts - 1) % failures.length];
          kitchenResult(kicker, outcome.fire && !outcome.archai ? 'Puf! Uma pequena explosão, sem estragos.' : title, copy, hint);
        }
      }
      bowl = [];
      cooking = false;
      renderBowl();
    }, reducedMotion.matches ? 150 : 1300);
  }

  function revealRecipes({scroll = false} = {}) {
    if (!recipesSection || get(keys.anaximenesComplete) !== 'complete') return;
    recipesSection.hidden = false;
    renderRecipeCards();
    renderBowl();
    const small = routeSmall();
    if (small) small.textContent = get(keys.recipesComplete) === 'complete' ? 'ilha V concluída' : 'ilha V em andamento';
    if (get(keys.recipesComplete) === 'complete' && !recipesRestored) {
      recipesRestored = true;
      const name = Object.keys(recipeBook).find(recipeFound) || 'atomista';
      $('[data-oven]').classList.add('is-glow');
      kitchenResult('RECEITA REVELADA ✓', recipeBook[name].title, 'A bancada continua aberta para experimentar.');
      finishRecipes(name, false);
    }
    if (scroll) recipesSection.scrollIntoView({behavior:reducedMotion.matches ? 'auto' : 'smooth',block:'start'});
  }

  if (recipesSection) {
    $$('[data-recipe-ingredient]', recipesSection).forEach((button) => {
      button.addEventListener('click', () => addIngredient(button.dataset.recipeIngredient));
      button.addEventListener('dragstart', (event) => { event.dataTransfer.setData('text/plain', button.dataset.recipeIngredient); event.dataTransfer.effectAllowed = 'copy'; });
    });
    const vessel = $('[data-bowl]');
    vessel.addEventListener('dragover', (event) => { event.preventDefault(); vessel.classList.add('is-over'); });
    vessel.addEventListener('dragleave', () => vessel.classList.remove('is-over'));
    vessel.addEventListener('drop', (event) => {
      event.preventDefault();
      vessel.classList.remove('is-over');
      const id = event.dataTransfer.getData('text/plain');
      if (!bowl.includes(id)) addIngredient(id);
    });
    $$('[data-bowl-slot]', recipesSection).forEach((slot) => slot.addEventListener('click', () => {
      const id = bowl[Number(slot.dataset.bowlSlot)];
      if (id) addIngredient(id);
    }));
    $('[data-clear-bowl]').addEventListener('click', () => { bowl = []; renderBowl(); kitchenResult('BANCADA', 'Recipiente vazio', 'Escolha três ingredientes da prateleira.'); });
    $('[data-prepare]').addEventListener('click', prepare);
  }
  /* Fase 8 — integração: transição de barco única entre as etapas, última travessia, Atenas e encerramento do Arco 2. */
  const sailing = $('[data-sailing]');
  let sailTimer = 0;
  let afterSail = null;

  function endSail() {
    if (!afterSail) return;
    window.clearTimeout(sailTimer);
    sailing.hidden = true;
    sailing.classList.remove('is-moving');
    const next = afterSail;
    afterSail = null;
    next();
  }

  /* SailingTransition: mar, Maré pequena atravessando a tela e o nome da próxima parada. Sem jogabilidade. */
  function sail(kicker, title, next) {
    if (!sailing) { next(); return; }
    $('[data-sailing-kicker]').textContent = kicker;
    $('[data-sailing-title]').textContent = title;
    sailing.hidden = false;
    sailing.classList.remove('is-moving'); void sailing.offsetWidth; sailing.classList.add('is-moving');
    afterSail = next;
    som('mar');
    sailTimer = window.setTimeout(endSail, reducedMotion.matches ? 1200 : 2800);
    $('[data-sailing-skip]').focus({preventScroll:true});
  }
  $('[data-sailing-skip]')?.addEventListener('click', endSail);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && afterSail) endSail(); });

  /* depois de cada transição o foco vai para o título da nova etapa */
  function focusHeading(selector) {
    const heading = $(selector);
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({preventScroll:true});
  }

  const finalSection = $('[data-final]');
  const athensSection = $('[data-athens]');
  const routeItems = () => $$('.p8-route li');

  function markRouteAthens(state) {
    const items = routeItems();
    items.forEach((item) => item.classList.remove('is-current'));
    items[3]?.classList.add('is-current');
    const harbor = items[0]?.querySelector('small'); if (harbor) harbor.textContent = 'concluído';
    const islands = items[2]?.querySelector('small'); if (islands) islands.textContent = 'cinco ilhas concluídas';
    const athens = items[3]?.querySelector('small'); if (athens) athens.textContent = state;
  }

  function revealFinal({scroll = false} = {}) {
    if (!finalSection || get(keys.recipesComplete) !== 'complete') return;
    finalSection.hidden = false;
    const athensImg = $('[data-athens-img]');
    if (athensImg) athensImg.loading = 'eager';
    markRouteAthens(get(keys.athens) === 'complete' ? 'alcançada' : 'à vista');
    if (scroll) finalSection.scrollIntoView({behavior:reducedMotion.matches ? 'auto' : 'smooth', block:'start'});
  }

  /* pixel art → anime: a mesma cena começa em blocos grossos e vai ganhando detalhe (canvas, sem vídeo) */
  function depixelate(done) {
    const canvas = $('[data-athens-canvas]');
    const img = $('[data-athens-img]');
    const art = $('[data-athens-art]');
    if (!canvas || !img || reducedMotion.matches) { done(); return; }
    const run = () => {
      const w = img.naturalWidth; const h = img.naturalHeight;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      const small = document.createElement('canvas');
      const sctx = small.getContext('2d');
      const steps = [40, 28, 18, 11, 7, 4, 2];
      let i = 0;
      art.classList.add('is-pixel');
      const draw = (block) => {
        small.width = Math.max(1, Math.round(w / block));
        small.height = Math.max(1, Math.round(h / block));
        sctx.drawImage(img, 0, 0, small.width, small.height);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, w, h);
      };
      const tick = () => {
        if (i < steps.length) { draw(steps[i]); i += 1; window.setTimeout(tick, i === 1 ? 900 : 260); return; }
        art.classList.remove('is-pixel');
        art.classList.add('is-clear');
        window.setTimeout(done, 400);
      };
      tick();
    };
    let started = false;
    const start = () => { if (started) return; started = true; if (img.naturalWidth) run(); else done(); };
    img.loading = 'eager';
    if (img.complete && img.naturalWidth) start();
    else {
      img.addEventListener('load', start, {once:true});
      img.addEventListener('error', start, {once:true});
      window.setTimeout(start, 3000);
    }
  }

  function showArcEnd(animated) {
    const end = $('[data-arc-end]');
    const dossier = $('[data-dossier]');
    if (!end || !dossier) return;
    end.hidden = false;
    end.classList.toggle('is-fading', animated);
    const first = get(keys.post8Complete) !== 'complete';
    set(keys.post8Complete, 'complete');
    const openDossier = () => { dossier.hidden = false; dossier.classList.toggle('is-fading', animated); };
    if (animated) window.setTimeout(openDossier, 2600); else openDossier();
    if (first) window.dispatchEvent(new CustomEvent('sofia:post8-complete'));
  }

  let athensAnimating = false;
  function revealAthens({animated = false} = {}) {
    if (!athensSection || get(keys.athens) !== 'complete' || athensAnimating) return;
    athensSection.hidden = false;
    markRouteAthens('alcançada');
    const lines = $('[data-athens-lines]');
    if (!animated || reducedMotion.matches) {
      $('[data-athens-art]')?.classList.add('is-clear');
      lines?.classList.add('is-shown');
      showArcEnd(false);
      return;
    }
    athensAnimating = true;
    athensSection.scrollIntoView({behavior:'smooth', block:'start'});
    focusHeading('#athens-title');
    depixelate(() => {
      lines.classList.add('is-playing');
      const count = $$('.p8-line', lines).length;
      window.setTimeout(() => { lines.classList.add('is-shown'); showArcEnd(true); athensAnimating = false; }, count * 1100 + 800);
    });
  }

  $('[data-arrive]')?.addEventListener('click', () => {
    const first = get(keys.athens) !== 'complete';
    set(keys.athens, 'complete');
    if (first) window.dispatchEvent(new CustomEvent('sofia:post8-athens-reached'));
    revealAthens({animated:true});
  });
  $('[data-start-tales]')?.addEventListener('click', () => sail('Travessia iniciada', 'Primeira parada: Ilha I — O Curso das Águas', () => { set(keys.talesStarted,'true'); revealTales({scroll:true}); focusHeading('#tales-title'); }));
  $('[data-start-parmenides]')?.addEventListener('click', () => sail('Próxima parada', 'Ilha II — A Montanha Imóvel', () => { set(keys.parmenidesStarted,'true'); parmenidesStage.reveal({scroll:true}); focusHeading('#parmenides-title'); }));
  $('[data-start-heraclito]')?.addEventListener('click', () => sail('Próxima parada', 'Ilha III — Aquilo que Muda', () => { set(keys.heraclitoStarted,'true'); heraclitoStage.reveal({scroll:true}); focusHeading('#heraclito-title'); }));
  $('[data-start-anaximenes]')?.addEventListener('click', () => sail('Próxima parada', 'Ilha IV — O Sopro que Sustenta', () => { set(keys.anaximenesStarted,'true'); anaximenesStage.reveal({scroll:true}); focusHeading('#anaximenes-title'); }));
  $('[data-start-recipes]')?.addEventListener('click', () => sail('Próxima parada', 'Ilha V — Receitas do Universo', () => { set(keys.recipesStarted,'true'); revealRecipes({scroll:true}); focusHeading('#recipes-title'); }));
  $('[data-start-final]')?.addEventListener('click', () => sail('Última travessia', 'Destino: Atenas', () => { set(keys.finalStarted,'true'); revealFinal({scroll:true}); focusHeading('#final-title'); }));
  startButton.addEventListener('click', () => get(keys.started) ? revealRepair({scroll:true}) : beginCrossing());

  /* Fase 9 — retomada. Tudo aqui pode rodar mais de uma vez: na carga da página, quando o percurso
     do passaporte chega do servidor (aparelho novo) e a cada atualização de progresso. Nada é
     desfeito, e uma ilha em andamento não é interrompida. */
  function restaurarProgresso() {
    if (get(keys.started) || completedCount() > 0) revealRepair();
    renderRepair();
    if (get(keys.talesStarted) || get(keys.talesComplete) === 'complete') revealTales();
    if (get(keys.talesComplete) === 'complete' && !replayingTales) {
      [1,2,3,4].forEach((number) => {
        const gate = $(`[data-gate="${number}"]`); const open = number !== 2;
        gate?.setAttribute('aria-pressed',String(open)); const state = gate?.querySelector('i'); if (state) state.textContent = open ? 'aberta' : 'fechada';
      });
    }
    renderWater();
    if (get(keys.parmenidesStarted) || get(keys.parmenidesComplete) === 'complete') parmenidesStage.reveal();
    if (get(keys.heraclitoStarted) || get(keys.heraclitoComplete) === 'complete') heraclitoStage.reveal();
    if (get(keys.anaximenesStarted) || get(keys.anaximenesComplete) === 'complete') anaximenesStage.reveal();
    if (get(keys.recipesStarted) || get(keys.recipesComplete) === 'complete') revealRecipes();
    if (get(keys.finalStarted) || get(keys.athens) === 'complete') revealFinal();
    if (get(keys.athens) === 'complete') revealAthens();
  }

  restaurarProgresso();

  /* o passaporte pode trazer progresso de outro aparelho depois que a página já abriu */
  const donoInicial = window.Percurso?.codigo?.() || 'visitante';
  window.Percurso?.pronto?.then(restaurarProgresso, () => {});
  window.addEventListener('percurso-atualizado', () => {
    /* outro passaporte nesta mesma página: recomeça do zero, com o progresso do novo dono */
    if ((window.Percurso?.codigo?.() || 'visitante') !== donoInicial) { window.location.reload(); return; }
    restaurarProgresso();
  });
})();
