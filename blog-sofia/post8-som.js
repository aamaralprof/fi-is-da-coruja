/* Sons do Post 8: bipes de 8 bits gerados na hora (Web Audio), sem arquivos de áudio.
 * Começam desligados; qualquer botão [data-som] liga e desliga todos.
 * A preferência é do aparelho, não do percurso: por isso a chave não começa com "sofia-". */
(function () {
  'use strict';
  const KEY = 'post8-som';
  let ctx = null;
  let on = false;
  try { on = localStorage.getItem(KEY) === 'ligado'; } catch {}

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, {type = 'square', to = 0, vol = 0.05} = {}) {
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const sons = {
    clique: () => tone(880, 0, 0.05, {vol: 0.03}),
    pulo: () => tone(320, 0, 0.12, {to: 640, vol: 0.035}),
    ponto: () => [660, 880, 1320].forEach((f, i) => tone(f, i * 0.07, 0.1, {vol: 0.04})),
    queda: () => tone(440, 0, 0.35, {to: 110, vol: 0.045}),
    acerto: () => [784, 1175].forEach((f, i) => tone(f, i * 0.08, 0.12, {vol: 0.04})),
    erro: () => tone(150, 0, 0.18, {type: 'sawtooth', vol: 0.035}),
    vitoria: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, i === 3 ? 0.4 : 0.12, {vol: 0.045})),
    troca: () => tone(520, 0, 0.12, {type: 'triangle', to: 260, vol: 0.06}),
    vento: () => tone(180, 0, 0.6, {type: 'triangle', to: 420, vol: 0.05}),
    mar: () => [392, 330, 294, 330, 392].forEach((f, i) => tone(f, i * 0.2, 0.22, {type: 'triangle', vol: 0.06}))
  };

  function play(name) {
    if (!on || !sons[name]) return;
    try { if (audio()) sons[name](); } catch {}
  }

  function render() {
    document.querySelectorAll('[data-som]').forEach((button) => {
      button.setAttribute('aria-pressed', String(on));
      const state = button.querySelector('i');
      if (state) state.textContent = on ? 'ligado' : 'desligado';
    });
  }

  function toggle() {
    on = !on;
    try { localStorage.setItem(KEY, on ? 'ligado' : 'desligado'); } catch {}
    render();
    if (on) play('clique');
  }

  document.addEventListener('click', (event) => { if (event.target.closest?.('[data-som]')) toggle(); });
  render();
  window.P8Som = {play, ligado: () => on};
})();
