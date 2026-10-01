/* Motor de plataforma do Post 8 (Maré dos Sussurros).
   Base única de movimentação para Parmênides, Heráclito e Anaxímenes:
   física em passo fixo, colisão AABB por eixo, pontos seguros e câmera.
   Fases seguintes estendem pelo nível (solid.active, zonas) e por onStep. */
(function (root) {
  const PHYS = {
    step: 1 / 120,
    run: 140,
    accelGround: 1600,
    accelAir: 1100,
    gravity: 1500,
    jump: 560,
    jumpCut: 220,
    maxFall: 600,
    coyote: 0.1,
    buffer: 0.12,
    fallLimit: 200
  };

  const overlaps = (a, s) => a.x < s.x + s.w && a.x + a.w > s.x && a.y < s.y + s.h && a.y + a.h > s.y;
  const isActive = (s) => s.active !== false;

  function createBody(x, y) {
    return {x, y, w: 16, h: 28, vx: 0, vy: 0, grounded: false, ground: null, coyote: 0, buffer: 0, facing: 1, jumpHeld: false};
  }

  /* Um passo de física. input = {dir: -1|0|1, jumpPressed: bool, jumpHeld: bool}. */
  function stepBody(body, input, dt, level) {
    const solids = level.solids;
    const target = input.dir * PHYS.run;
    const accel = (body.grounded ? PHYS.accelGround : PHYS.accelAir) * dt;
    if (body.vx < target) body.vx = Math.min(target, body.vx + accel);
    else if (body.vx > target) body.vx = Math.max(target, body.vx - accel);
    if (input.dir) body.facing = input.dir;

    body.buffer = input.jumpPressed ? PHYS.buffer : Math.max(0, body.buffer - dt);
    body.coyote = body.grounded ? PHYS.coyote : Math.max(0, body.coyote - dt);
    body.justJumped = false;
    if (body.buffer > 0 && body.coyote > 0) {
      body.justJumped = true;
      body.vy = -PHYS.jump;
      body.buffer = 0;
      body.coyote = 0;
      body.grounded = false;
    }
    if (!input.jumpHeld && !body.inCurrent && body.vy < -PHYS.jumpCut) body.vy = -PHYS.jumpCut;
    body.vy = Math.min(PHYS.maxFall, body.vy + PHYS.gravity * dt);
    /* correntes de ar (Anaxímenes): dentro da zona, impulso vertical; fora dela, gravidade normal */
    body.inCurrent = null;
    for (const c of level.currents || []) {
      if (!isActive(c) || !overlaps(body, c)) continue;
      /* freia a queda com mais força, para Sofia não afundar ao entrar na corrente */
      body.vy = Math.max(-c.maxUp, body.vy - c.lift * (body.vy > 0 ? 2 : 1) * dt);
      body.inCurrent = c;
      break;
    }

    body.x += body.vx * dt;
    for (const s of solids) {
      if (!isActive(s) || !overlaps(body, s)) continue;
      if (body.vx > 0) body.x = s.x - body.w;
      else if (body.vx < 0) body.x = s.x + s.w;
      body.vx = 0;
    }
    if (body.x < 0) { body.x = 0; body.vx = 0; }
    if (body.x + body.w > level.width) { body.x = level.width - body.w; body.vx = 0; }

    body.y += body.vy * dt;
    let landed = null;
    for (const s of solids) {
      if (!isActive(s) || !overlaps(body, s)) continue;
      if (body.vy > 0) { body.y = s.y - body.h; landed = s; }
      else if (body.vy < 0) body.y = s.y + s.h;
      body.vy = 0;
    }
    body.grounded = !!landed;
    body.ground = landed;
    return body;
  }

  function create(options) {
    const {viewport, world, sprite, level} = options;
    const state = {
      body: createBody(level.start.x - 8, level.start.y - 28),
      checkpoint: 0,
      keys: new Set(),
      jumpQueued: false,
      running: false,
      visible: true,
      finished: false,
      raf: 0,
      last: 0,
      acc: 0,
      scale: 1,
      viewW: level.width,
      viewH: 360,
      camX: 0,
      camY: Math.max(0, level.height - 360),
      zonesInside: new Set()
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cpPoint = (i) => (i === 0 ? level.start : level.checkpoints[i - 1]);

    function measure() {
      const width = viewport.clientWidth || level.width;
      const height = viewport.clientHeight || 360;
      /* fases horizontais (viewWidth < width) não podem mostrar área abaixo do cenário */
      state.scale = Math.max(width / (level.viewWidth || level.width), Math.min(1, width / 320), height / level.height);
      state.viewW = width / state.scale;
      state.viewH = height / state.scale;
      world.style.transformOrigin = '0 0';
      camera(true);
    }

    function camera(snap) {
      const b = state.body;
      const tx = Math.min(Math.max(0, b.x + b.w / 2 - state.viewW / 2), Math.max(0, level.width - state.viewW));
      const ty = Math.min(Math.max(0, b.y - state.viewH * 0.55), Math.max(0, level.height - state.viewH));
      const k = snap || reduced.matches ? 1 : 0.14;
      state.camX += (tx - state.camX) * k;
      state.camY += (ty - state.camY) * k;
      world.style.transform = `scale(${state.scale}) translate3d(${-Math.round(state.camX)}px,${-Math.round(state.camY)}px,0)`;
    }

    function draw() {
      const b = state.body;
      sprite.style.transform = `translate3d(${Math.round(b.x)}px,${Math.round(b.y)}px,0)`;
      sprite.classList.toggle('is-left', b.facing < 0);
      sprite.classList.toggle('is-walking', b.grounded && Math.abs(b.vx) > 20);
      sprite.classList.toggle('is-airborne', !b.grounded);
      sprite.classList.toggle('is-floating', !!b.inCurrent);
    }

    function placeAt(i) {
      const p = cpPoint(i);
      Object.assign(state.body, createBody(p.x - 8, p.y - 28));
      state.zonesInside.clear();
      camera(true);
      draw();
    }

    function respawn() {
      placeAt(state.checkpoint);
      options.onRespawn?.(state.checkpoint);
    }

    function checkTriggers() {
      const b = state.body;
      level.checkpoints.forEach((cp, index) => {
        const i = index + 1;
        if (i <= state.checkpoint) return;
        /* vale pisar em qualquer ponto da plataforma da bandeira, não só ao lado dela */
        const onFlagPlatform = b.ground && cp.x >= b.ground.x && cp.x <= b.ground.x + b.ground.w;
        if (b.grounded && Math.abs(b.y + b.h - cp.y) < 4 && (onFlagPlatform || Math.abs(b.x + b.w / 2 - cp.x) < 40)) {
          state.checkpoint = i;
          options.onCheckpoint?.(i);
        }
      });
      (level.zones || []).forEach((zone) => {
        const inside = overlaps(b, zone);
        if (inside && !state.zonesInside.has(zone)) { state.zonesInside.add(zone); options.onZone?.(zone); }
        else if (!inside) state.zonesInside.delete(zone);
      });
      if (!state.finished && b.grounded && overlaps(b, level.goal)) {
        state.finished = true;
        pause();
        options.onGoal?.();
        return;
      }
      if (b.y > cpPoint(state.checkpoint).y + (level.fallLimit || PHYS.fallLimit) || b.y > level.height) respawn();
    }

    function input() {
      const k = state.keys;
      const dir = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0);
      const pressed = state.jumpQueued;
      state.jumpQueued = false;
      return {dir, jumpPressed: pressed, jumpHeld: k.has('jump')};
    }

    function loop(now) {
      if (!state.running || !state.visible) { state.raf = 0; return; }
      state.acc += Math.min(0.1, (now - state.last) / 1000);
      state.last = now;
      while (state.acc >= PHYS.step && state.running) {
        const frameInput = input();
        stepBody(state.body, frameInput, PHYS.step, level);
        if (state.body.justJumped) options.onJump?.();
        options.onStep?.(state.body, PHYS.step, state);
        checkTriggers();
        state.acc -= PHYS.step;
      }
      camera(false);
      draw();
      if (state.running) state.raf = requestAnimationFrame(loop);
    }

    function kick() {
      if (state.raf || !state.running || !state.visible) return;
      state.last = performance.now();
      state.acc = 0;
      state.raf = requestAnimationFrame(loop);
    }

    function start() { if (state.finished) return; state.running = true; kick(); }
    function pause() {
      state.running = false;
      state.keys.clear();
      if (state.raf) cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    const keyMap = {ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump'};
    function press(action) {
      if (action === 'jump' && !state.keys.has('jump')) state.jumpQueued = true;
      state.keys.add(action);
    }
    function release(action) { state.keys.delete(action); }

    function onKeyDown(event) {
      const action = keyMap[event.code];
      if (!action || !state.running || !state.visible) return;
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (tag === 'BUTTON' && event.code === 'Space')) return;
      event.preventDefault();
      if (!event.repeat) press(action);
    }
    function onKeyUp(event) { const action = keyMap[event.code]; if (action) release(action); }
    function clearKeys() { state.keys.clear(); }
    function onVisibility() { state.visible = !document.hidden && state.inView !== false; if (state.visible) kick(); else clearKeys(); }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', onVisibility);

    const buttons = [];
    (options.controls || []).forEach((button) => {
      const action = button.dataset.control;
      const down = (event) => {
        event.preventDefault();
        try { button.setPointerCapture(event.pointerId); } catch {}
        button.classList.add('is-pressed');
        press(action);
      };
      const up = () => { button.classList.remove('is-pressed'); release(action); };
      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('lostpointercapture', up);
      button.addEventListener('contextmenu', (event) => event.preventDefault());
      buttons.push([button, down, up]);
    });

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      state.inView = entry.isIntersecting;
      onVisibility();
    }, {threshold: 0.15}) : null;
    observer?.observe(viewport);
    const resizer = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    resizer?.observe(viewport);
    measure();
    draw();

    return {
      state,
      start,
      pause,
      placeAt,
      respawn,
      setCheckpoint(i) { state.checkpoint = Math.max(0, Math.min(level.checkpoints.length, i)); placeAt(state.checkpoint); },
      restart() { state.finished = false; state.checkpoint = 0; placeAt(0); },
      finishAtGoal() {
        state.finished = true;
        pause();
        Object.assign(state.body, createBody(level.goal.x + level.goal.w / 2 - 8, level.goal.y + level.goal.h - 28));
        camera(true);
        draw();
      },
      destroy() {
        pause();
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', clearKeys);
        document.removeEventListener('visibilitychange', onVisibility);
        buttons.forEach(([button, down, up]) => {
          button.removeEventListener('pointerdown', down);
          button.removeEventListener('pointerup', up);
          button.removeEventListener('pointercancel', up);
          button.removeEventListener('lostpointercapture', up);
        });
        observer?.disconnect();
        resizer?.disconnect();
      }
    };
  }

  const api = {PHYS, overlaps, createBody, stepBody, create};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.P8Platformer = api;
})(typeof window !== 'undefined' ? window : globalThis);
