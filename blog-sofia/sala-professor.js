/* A Sala vista pela professora.
 *
 * Este arquivo não desenha nada. Ele só monta window.SalaContexto e sai da
 * frente — quem desenha continua sendo sala.js, com a mesma marcação e o
 * mesmo CSS que o aluno vê. É o que impede a Área do Professor de virar uma
 * segunda Sala, com bugs próprios e assets repetidos.
 *
 * Entra em ação por dois endereços, e fica calado em qualquer outro:
 *
 *   sala-investigacao.html?aluno=CORUJA-7K4M   a Sala daquele aluno, intocável
 *   sala-investigacao.html?geral=1             a sala-base, para experimentar
 */
(function () {
  'use strict';

  const busca = new URLSearchParams(location.search);
  const aluno = (busca.get('aluno') || '').trim().toUpperCase();
  const geral = busca.get('geral') === '1';
  if (!aluno && !geral) return;   // aluno entrando na própria Sala: nada a fazer

  const $ = id => document.getElementById(id);

  /* Enquanto a professora espera, a portaria não pode dizer "carregando seu
     passaporte": não é o passaporte dela que está sendo aberto. */
  const gate = $('room-gate');
  if (gate) gate.replaceChildren(Object.assign(document.createElement('p'), {
    textContent: geral ? 'Abrindo a Sala Geral…' : 'Abrindo a Sala de ' + aluno + '…'
  }));

  /* Volta para a lista, não para o blog. */
  const voltar = document.querySelector('.room-header a');
  if (voltar) { voltar.href = 'professor.html'; voltar.textContent = '← Observatório'; }

  /* A página inteira é escrita na segunda pessoa, para o aluno: "este espaço é
     seu", "minha nota", "o que consegui descobrir". Quem está lendo agora é
     outra pessoa, e o texto precisa dizer isso — senão a professora parece
     estar na própria Sala. Só as palavras mudam; a Sala é a mesma. */
  function falarComAProfessora(titulo, subtitulo) {
    document.title = titulo;
    const trocar = (seletor, texto) => {
      const n = document.querySelector(seletor);
      if (n) n.textContent = texto;
    };
    trocar('.room-header span', geral ? 'SALA GERAL · BANCADA DE TESTES' : 'VISTA DA PROFESSORA · SOMENTE LEITURA');
    trocar('.room-heading h1', titulo);
    trocar('.room-heading > div > p:last-of-type', subtitulo);
    trocar('.room-writing details summary', 'A nota que o aluno deixou');
    trocar('.room-writing label[for="note"]', 'Nota do aluno');
    trocar('.room-writing section h2', 'O que o aluno concluiu');
    trocar('.room-writing label[for="conclusion"]', 'Escrito por quem mora nesta Sala.');
    const vazio = document.getElementById('board-empty');
    if (vazio) vazio.textContent = 'Nenhuma pista foi colocada neste painel.';
  }

  function parar(mensagem, texto, destino) {
    if (gate) {
      const p = document.createElement('p');
      p.textContent = mensagem;
      gate.replaceChildren(p);
      if (destino) {
        const a = document.createElement('a');
        a.textContent = texto;
        a.href = destino;
        gate.append(a);
      }
    }
    if ($('save-status')) $('save-status').textContent = 'Sala não carregada.';
    /* A promessa não se resolve de propósito: a página já explicou o que
       houve, e sala.js não tem estado nenhum para desenhar. */
    return new Promise(function () {});
  }

  function quando(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  /* Os nomes vivem neste navegador e em nenhum outro lugar. O banco continua
     sem saber quem é CORUJA-7K4M; quem sabe é a professora, porque importou a
     lista que o gerador de passaportes deixou no computador dela. */
  function nomeDe(codigo) {
    try {
      const mapa = JSON.parse(localStorage.getItem('professor-nomes') || '{}');
      return (mapa[codigo] && mapa[codigo].nome) || '';
    } catch (e) { return ''; }
  }

  /* A Sala Geral é a sala-base do projeto, não um desenho novo: estado nulo,
     que sala.js completa com os padrões dela. Aqui tudo aparece desbloqueado,
     para a professora conferir os recursos existentes.

     E aqui se pode mexer. Travar esta tela não protegia ninguém — não há aluno
     do outro lado — e era justamente onde ela precisaria acender a luminária e
     regar a planta para saber o que os objetos fazem antes de mandar a turma
     usar. Nada é gravado: sala.js não escreve quando há contexto injetado, e
     recarregar devolve tudo ao padrão. */
  async function contextoGeral() {
    if (!window.Percurso || !Percurso.aberto()) {
      return parar('Abra seu passaporte de professora para ver a Sala Geral.',
                   'Abrir passaporte →', 'entrar.html');
    }
    try {
      await Percurso.requisitar('professor/eu');
    } catch (e) {
      if (e.status === 403) {
        return parar('O Observatório da Coruja não se abre para este passaporte.',
                     'Voltar ao blog →', 'index.html');
      }
      return parar('Não consegui abrir a Sala Geral. ' + e.message, 'Tentar de novo →', location.href);
    }

    falarComAProfessora('Sala Geral',
      'A sala-base, com tudo à mostra. Mexa à vontade: nada aqui é salvo, e recarregar devolve ao padrão.');
    /* Aqui não mora ninguém: não há nota nem conclusão para ler. */
    const escritos = document.querySelector('.room-writing');
    if (escritos) escritos.hidden = true;

    const D = window.Investigacao;
    const chaves = {
      'sofia-room-unlocked': 'unlocked',
      'sofia-room-notebook-unlocked': 'unlocked',
      'sofia-room-plant-unlocked': 'unlocked'
    };
    Object.values(D.casos).forEach(function (c) { chaves[c.chave] = 'unlocked'; });
    D.itens.forEach(function (i) {
      chaves[i.chave] = i.tipo === 'emblema' ? 'collected' : 'found';
      // Sub-registros de um item (ex.: as pesquisas do post 4) também
      // precisam aparecer desbloqueados aqui, senão "tudo à mostra" mostra
      // a pista como disponível mas o conteúdo dela continua vazio.
      if (i.registros) i.registros.forEach(function (r) { chaves[r.chave] = 'completed'; });
    });
    return {
      modo: 'bancada',
      codigo: 'sala-geral',
      estado: null,
      revisao: 0,
      chaves: chaves,
      rotulo: 'Sala Geral · bancada de testes. Nada aqui é salvo.'
    };
  }

  async function contextoDoAluno() {
    if (!/^[A-Z0-9-]{4,24}$/.test(aluno)) {
      return parar('Esse código de passaporte não parece válido.', 'Voltar à lista →', 'professor.html');
    }
    if (!window.Percurso || !Percurso.aberto()) {
      return parar('Abra seu passaporte de professora para ver a Sala de um aluno.',
                   'Abrir passaporte →', 'entrar.html');
    }

    let dados;
    try {
      dados = await Percurso.requisitar('professor/sala?codigo=' + encodeURIComponent(aluno));
    } catch (e) {
      if (e.status === 403) {
        return parar('O Observatório da Coruja não se abre para este passaporte.',
                     'Voltar ao blog →', 'index.html');
      }
      if (e.status === 404) {
        return parar('Não encontrei nenhum aluno com o código ' + aluno + '.',
                     'Voltar à lista →', 'professor.html');
      }
      return parar('Não consegui abrir esta Sala. ' + e.message, 'Tentar de novo →', location.href);
    }

    const nome = nomeDe(dados.codigo);
    falarComAProfessora(
      'Sala de ' + (nome || dados.codigo),
      dados.estado
        ? 'Esta é a Sala como o aluno a deixou. Você pode olhar tudo; nada daqui muda.'
        : 'Este aluno ainda não personalizou a Sala. O que aparece é a sala-base.');

    const partes = [nome || dados.codigo];
    if (dados.turma) partes.push(dados.turma);
    if (nome) partes.push(dados.codigo);
    partes.push(dados.atualizado_em
      ? 'Sala alterada em ' + quando(dados.atualizado_em)
      : 'ainda não personalizou a Sala');

    return {
      modo: 'leitura',
      codigo: dados.codigo,
      estado: dados.estado,
      revisao: dados.revisao,
      chaves: dados.chaves || {},
      rotulo: partes.join(' · ') + ' · somente leitura'
    };
  }

  window.SalaContexto = geral ? contextoGeral() : contextoDoAluno();
})();
