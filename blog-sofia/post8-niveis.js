/* Níveis das ilhas de plataforma do Post 8. Coordenadas lógicas em px:
   plataformas {x, y (topo), w, h}; pontos seguros {x (centro), y (topo da plataforma)}. */
(function (root) {
  const p = (id, x, y, w, extra = {}) => ({id, x, y, w, h: extra.h || 22, ...extra});

  const parmenides = {
    width: 480,
    height: 1240,
    start: {x: 120, y: 1200},
    solids: [
      p('base', 0, 1200, 480, {h: 40, kind: 'base'}),
      p('m1', 150, 1135, 84),
      p('m2', 272, 1070, 84),
      p('m3', 392, 1005, 88),
      p('m4', 262, 940, 80),
      p('m5', 140, 875, 80),
      p('m6', 0, 810, 120),
      p('m7', 128, 745, 80),
      p('m8', 250, 680, 80),
      p('m9', 345, 615, 135),
      p('m10', 240, 550, 70),
      p('m11', 128, 485, 80),
      p('m12', 0, 420, 104),
      p('m13', 130, 355, 80),
      p('m14', 250, 290, 84),
      p('m15', 350, 225, 130),
      p('topo', 120, 160, 200, {h: 30, kind: 'summit'}),
      /* falsos atalhos: parecem continuar a subida, mas terminam */
      p('f1', 20, 1135, 70, {kind: 'false'}),
      p('f2', 10, 1070, 62, {kind: 'false'}),
      p('f3', 400, 870, 80, {kind: 'false'}),
      p('f4', 0, 680, 80, {kind: 'false'}),
      p('f5', 0, 295, 80, {kind: 'false'}),
      /* rochas altas demais: desenham a ilusão de caminho */
      p('r1', 20, 930, 60, {kind: 'decor'}),
      p('r2', 410, 740, 70, {kind: 'decor'})
    ],
    checkpoints: [
      {x: 42, y: 810},
      {x: 44, y: 420},
      {x: 440, y: 225}
    ],
    zones: [
      {id: 'beco-1', x: 0, y: 1030, w: 90, h: 40, message: 'Sofia — Daqui não sobe mais. Melhor voltar.'},
      {id: 'beco-2', x: 400, y: 830, w: 80, h: 40, message: 'Sofia — Parecia um atalho. Não era.'},
      {id: 'beco-3', x: 0, y: 640, w: 80, h: 40, message: 'Sofia — Esse termina aqui também.'},
      {id: 'beco-4', x: 0, y: 255, w: 80, h: 40, message: 'Sofia — Tão perto. E mesmo assim, não.'}
    ],
    goal: {x: 120, y: 120, w: 200, h: 40},
    temple: {x: 160, w: 110}
  };

  /* rochas decorativas não colidem; ficam fora da física */
  parmenides.decor = parmenides.solids.filter((s) => s.kind === 'decor');
  parmenides.solids = parmenides.solids.filter((s) => s.kind !== 'decor');

  /* Ilha III: dois estados. phase 'a' = água alta, cascata fechando a passagem;
     phase 'b' = água baixa (pedras à mostra) e fogo aceso. Sem phase = permanente. */
  const heraclito = {
    width: 1440,
    height: 400,
    viewWidth: 480,
    start: {x: 60, y: 300},
    solids: [
      p('g1', 0, 300, 200, {h: 100, kind: 'ground'}),
      p('pedra1', 220, 300, 50, {kind: 'stone', phase: 'b'}),
      p('pedra2', 282, 300, 48, {kind: 'stone', phase: 'b'}),
      p('g2', 330, 300, 200, {h: 100, kind: 'ground'}),
      p('portal', 446, 148, 64, {kind: 'lintel'}),
      p('fogo', 470, 170, 16, {h: 130, kind: 'fire', phase: 'b'}),
      p('a1', 552, 262, 56, {kind: 'alt', phase: 'a'}),
      p('b1', 632, 226, 56, {kind: 'alt', phase: 'b'}),
      p('ruina', 714, 196, 90, {kind: 'ruin'}),
      p('b2', 830, 214, 56, {kind: 'alt', phase: 'b'}),
      p('a2', 912, 190, 56, {kind: 'alt', phase: 'a'}),
      p('b3', 994, 214, 56, {kind: 'alt', phase: 'b'}),
      p('g3', 1076, 280, 160, {h: 120, kind: 'ground'}),
      p('nascente', 1160, 128, 58, {kind: 'lintel'}),
      p('cascata', 1180, 150, 18, {h: 130, kind: 'falls', phase: 'a'}),
      p('g4', 1260, 280, 180, {h: 120, kind: 'ground'})
    ],
    checkpoints: [
      {x: 360, y: 300},
      {x: 744, y: 196},
      {x: 1118, y: 280}
    ],
    zones: [],
    decor: [],
    goal: {x: 1300, y: 240, w: 140, h: 40},
    temple: {x: 1340, w: 80}
  };

  /* Ilha IV: penhascos separados por vãos largos demais para um salto. Cada corrente encosta
     no paredão do penhasco seguinte: empurrando contra a pedra, Sofia sobe junto dela.
     currents = correntes ascendentes {x, y (topo), w, h, lift, maxUp}. A primeira só sopra
     quando Sofia chega à beira (a rajada do roteiro). */
  const wind = (id, x, y, w, extra = {}) => ({id, x, y, w, h: 480 - y, lift: 2600, maxUp: 230, ...extra});
  const anaximenes = {
    width: 1440,
    height: 480,
    viewWidth: 480,
    fallLimit: 1000,
    start: {x: 70, y: 300},
    solids: [
      p('c1', 0, 300, 260, {h: 180, kind: 'cliff'}),
      p('c2', 420, 260, 140, {h: 220, kind: 'cliff'}),
      p('c3', 760, 200, 100, {h: 280, kind: 'cliff'}),
      p('c4', 950, 70, 110, {h: 410, kind: 'cliff'}),
      p('c5', 1250, 220, 190, {h: 260, kind: 'cliff'})
    ],
    currents: [
      wind('w1', 330, 170, 90, {active: false}),
      wind('w2', 670, 110, 90),
      wind('w3', 870, 55, 80),
      wind('w4', 1150, 150, 100)
    ],
    checkpoints: [
      {x: 470, y: 260},
      {x: 800, y: 200},
      {x: 990, y: 70}
    ],
    zones: [
      {id: 'borda', x: 196, y: 250, w: 64, h: 50, message: 'Sofia — Não dá para atravessar.'}
    ],
    decor: [],
    goal: {x: 1270, y: 180, w: 170, h: 40},
    temple: {x: 1350, w: 76}
  };

  const levels = {parmenides, heraclito, anaximenes};
  if (typeof module === 'object' && module.exports) module.exports = levels;
  else root.P8Levels = levels;
})(typeof window !== 'undefined' ? window : globalThis);
