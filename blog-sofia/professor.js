/* Área do Professor: a lista das Salas.
 *
 * Esta página não desenha Sala nenhuma. Ela mostra quem existe e leva para
 * sala-investigacao.html, que continua sendo a única Sala do projeto.
 *
 * Os nomes dos alunos não passam por aqui nem pelo servidor. Ficam neste
 * navegador, em 'professor-nomes', vindos do arquivo que o gerador de
 * passaportes deixou no computador da professora. O banco segue sabendo
 * apenas o código e a turma.
 */
(async function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const el = (tag, text) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; return n; };
  const status = m => { $('save-status').textContent = m; };
  const CHAVE_NOMES = 'professor-nomes';
  const SEM_TURMA = 'Sem turma';

  let alunos = [], nomes = lerNomes();

  function portaria(mensagem, texto, destino) {
    $('gate').replaceChildren(el('p', mensagem));
    if (destino) { const a = el('a', texto); a.href = destino; $('gate').append(a); }
    $('gate').hidden = false;
    $('conteudo').hidden = true;
  }

  function lerNomes() {
    try { return JSON.parse(localStorage.getItem(CHAVE_NOMES) || '{}') || {}; }
    catch (e) { return {}; }
  }

  /* Na lista, "há 3 dias" diz mais do que "11/09/2026, 16:42", e cabe na
     mesma linha da contagem. A data exata fica no title do cartão. */
  function haQuanto(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const dias = Math.floor((Date.now() - d) / 86400000);
    if (dias <= 0) return 'hoje';
    if (dias === 1) return 'ontem';
    if (dias < 30) return 'há ' + dias + ' dias';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  function dataExata(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  const nomeDe = codigo => (nomes[codigo] && nomes[codigo].nome) || '';
  /* A turma do banco manda; a do arquivo importado só cobre quem ainda não
     tiver turma gravada, para a lista não ficar toda em "Sem turma". */
  const turmaDe = a => a.turma || (nomes[a.codigo] && nomes[a.codigo].turma) || '';

  /* Aceita as três formas que o arquivo pode ter: a que o gerador escreve
     ({turma, alunos:{codigo:nome}}), um mapa direto de código para nome, e um
     mapa de código para {nome, turma}. Escrever à mão não deveria dar erro. */
  function normalizarImportado(dados) {
    const mapa = {};
    const guardar = (codigo, nome, turma) => {
      const c = String(codigo || '').trim().toUpperCase();
      if (!/^[A-Z0-9-]{4,24}$/.test(c) || !nome) return;
      mapa[c] = { nome: String(nome).trim().slice(0, 120), turma: String(turma || '').trim().slice(0, 60) };
    };
    if (dados && typeof dados === 'object' && dados.alunos && typeof dados.alunos === 'object') {
      Object.entries(dados.alunos).forEach(([c, v]) => {
        if (v && typeof v === 'object') guardar(c, v.nome, v.turma || dados.turma);
        else guardar(c, v, dados.turma);
      });
      return mapa;
    }
    if (dados && typeof dados === 'object') {
      Object.entries(dados).forEach(([c, v]) => {
        if (v && typeof v === 'object') guardar(c, v.nome, v.turma);
        else guardar(c, v, '');
      });
    }
    return mapa;
  }

  function estadoDosNomes() {
    const quantos = Object.keys(nomes).length;
    $('esquecer').hidden = !quantos;
    if (!quantos) {
      $('nomes-estado').textContent =
        'Sem os nomes importados, os alunos aparecem pelo código. Importe o nomes.json do gerador de passaportes: ele fica só neste navegador.';
      return;
    }
    const reconhecidos = alunos.filter(a => nomeDe(a.codigo)).length;
    $('nomes-estado').textContent =
      reconhecidos + ' de ' + alunos.length + ' passaportes com nome neste navegador. Nada disso foi enviado ao servidor.';
  }

  function cartao(a) {
    const nome = nomeDe(a.codigo);
    const link = el('a');
    link.className = 'prof-card';
    link.href = 'sala-investigacao.html?aluno=' + encodeURIComponent(a.codigo);
    link.dataset.vazia = a.itens ? '0' : '1';

    link.append(el('strong', nome || a.codigo));
    const codigo = el('span', nome ? a.codigo : ' ');
    codigo.className = 'prof-codigo';
    link.append(codigo);

    /* Contagem e recência na mesma linha: são a mesma pergunta — esta Sala
       tem alguma coisa dentro, e de quando? */
    let resumo;
    if (!a.tem_sala) resumo = 'Sala não aberta';
    else if (!a.itens) resumo = 'Sala vazia · ' + haQuanto(a.atualizado_em);
    else resumo = a.itens + (a.itens === 1 ? ' item · ' : ' itens · ') + haQuanto(a.atualizado_em);
    const estado = el('span', resumo);
    estado.className = 'prof-estado';
    link.append(estado);

    const exata = dataExata(a.atualizado_em) || dataExata(a.ultimo_acesso);
    link.title = (nome ? nome + ' · ' : '') + a.codigo +
      (exata ? ' · ' + (a.tem_sala ? 'Sala alterada em ' : 'último acesso em ') + exata : '');
    link.setAttribute('aria-label',
      'Abrir a Sala de ' + (nome || a.codigo) + (turmaDe(a) ? ', turma ' + turmaDe(a) : '') +
      '. ' + resumo + '. Somente leitura.');
    return link;
  }

  function desenhar() {
    const procura = $('procurar').value.trim().toLowerCase();
    const visiveis = alunos.filter(a => !procura ||
      a.codigo.toLowerCase().includes(procura) ||
      turmaDe(a).toLowerCase().includes(procura) ||
      nomeDe(a.codigo).toLowerCase().includes(procura));

    const destino = $('turmas');
    destino.replaceChildren();

    if (!visiveis.length) {
      const vazio = el('p', alunos.length
        ? 'Nenhum aluno encontrado para essa busca.'
        : 'Ainda não há passaportes de aluno no banco. Gere e carregue uma turma para que as Salas apareçam aqui.');
      vazio.className = 'prof-vazio';
      destino.append(vazio);
      return;
    }

    const porTurma = new Map();
    for (const a of visiveis) {
      const t = turmaDe(a) || SEM_TURMA;
      if (!porTurma.has(t)) porTurma.set(t, []);
      porTurma.get(t).push(a);
    }

    /* Turmas em ordem alfabética; quem ainda não tem turma fica por último. */
    const turmas = [...porTurma.keys()].sort((a, b) =>
      a === SEM_TURMA ? 1 : b === SEM_TURMA ? -1 : a.localeCompare(b, 'pt-BR'));

    for (const t of turmas) {
      const lista = porTurma.get(t).slice().sort((x, y) =>
        (nomeDe(x.codigo) || x.codigo).localeCompare(nomeDe(y.codigo) || y.codigo, 'pt-BR'));
      const secao = el('section');
      secao.className = 'prof-turma';
      const titulo = el('h2', t);
      titulo.append(el('small', lista.length === 1 ? '1 aluno' : lista.length + ' alunos'));
      secao.append(titulo);
      const cartoes = el('ul');
      cartoes.className = 'prof-cards';
      for (const a of lista) { const li = el('li'); li.append(cartao(a)); cartoes.append(li); }
      secao.append(cartoes);
      destino.append(secao);
    }
  }

  /* ---- entrada ---- */

  await Percurso.pronto;

  if (!Percurso.aberto()) {
    status('Passaporte fechado.');
    return portaria('O Observatório da Coruja pede um passaporte aberto.', 'Abrir passaporte →', 'entrar.html');
  }

  let dados;
  try {
    dados = await Percurso.requisitar('professor/salas');
  } catch (e) {
    status('O Observatório não abriu.');
    if (e.status === 403) {
      return portaria('O Observatório da Coruja não se abre para este passaporte.', 'Voltar ao blog →', 'index.html');
    }
    if (e.status === 401) {
      return portaria('Seu passaporte expirou. Entre de novo para continuar.', 'Abrir passaporte →', 'entrar.html');
    }
    return portaria('Não consegui carregar a lista. ' + e.message, 'Tentar de novo →', location.href);
  }

  alunos = dados.alunos || [];
  $('gate').hidden = true;
  $('conteudo').hidden = false;

  const comSala = alunos.filter(a => a.tem_sala).length;
  status(alunos.length
    ? alunos.length + (alunos.length === 1 ? ' passaporte de aluno' : ' passaportes de aluno') +
      ' · ' + comSala + ' com Sala aberta'
    : 'Nenhum passaporte de aluno no banco.');

  $('procurar').oninput = desenhar;

  $('importar').onchange = async function () {
    const arquivo = this.files && this.files[0];
    if (!arquivo) return;
    try {
      const importado = normalizarImportado(JSON.parse(await arquivo.text()));
      if (!Object.keys(importado).length) throw new Error('não encontrei nenhum código com nome nesse arquivo');
      nomes = Object.assign(lerNomes(), importado);
      localStorage.setItem(CHAVE_NOMES, JSON.stringify(nomes));
    } catch (e) {
      $('nomes-estado').textContent = 'Não consegui ler esse arquivo: ' + e.message + '.';
      this.value = '';
      return;
    }
    this.value = '';
    estadoDosNomes();
    desenhar();
  };

  $('esquecer').onclick = () => {
    localStorage.removeItem(CHAVE_NOMES);
    nomes = {};
    estadoDosNomes();
    desenhar();
  };

  estadoDosNomes();
  desenhar();
})();
