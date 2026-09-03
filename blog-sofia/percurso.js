/* Percurso — a ponte entre o navegador e o Passaporte.
   Carregado antes de script.js em todas as páginas.

   Sem passaporte aberto, o blog funciona exatamente como sempre funcionou:
   tudo fica guardado no próprio navegador e nada sai dali. Com o passaporte
   aberto, o mesmo progresso passa a acompanhar o aluno de um aparelho a outro.

   A regra é uma só: toda chave que começa com "sofia-" pertence ao percurso.
   Qualquer capítulo novo que guardar algo com esse prefixo entra no
   sincronismo sozinho, sem precisar mexer aqui. */

(function () {
  'use strict';

  var API = '/api';
  var PREFIXO = 'sofia-';
  var SESSAO = 'passaporte-sessao';
  var FILA = 'passaporte-fila';
  var ESPERA = 1200;

  function ler(chave) { try { return localStorage.getItem(chave); } catch (e) { return null; } }
  function gravar(chave, valor) { try { localStorage.setItem(chave, valor); } catch (e) {} }
  function apagar(chave) { try { localStorage.removeItem(chave); } catch (e) {} }
  function doPercurso(chave) { return typeof chave === 'string' && chave.indexOf(PREFIXO) === 0; }

  function sessao() {
    try {
      var bruto = ler(SESSAO);
      if (!bruto) return null;
      var s = JSON.parse(bruto);
      if (!s || !s.token) return null;
      if (s.expira && Date.parse(s.expira) < Date.now()) { apagar(SESSAO); return null; }
      return s;
    } catch (e) { return null; }
  }

  function fila() { try { return JSON.parse(ler(FILA) || '{}'); } catch (e) { return {}; } }
  function guardarFila(f) { gravar(FILA, JSON.stringify(f)); }

  /* Tudo que o navegador já sabe sobre este percurso. */
  function tudoLocal() {
    var pacote = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var chave = localStorage.key(i);
        if (doPercurso(chave)) pacote[chave] = localStorage.getItem(chave);
      }
    } catch (e) {}
    return pacote;
  }

  var gravandoDeFora = false;

  /* O que já foi descoberto nunca volta a ficar escondido: a fusão só soma.
     A exceção é o resultado do teste dos Caminhos, que pode ser refeito e
     por isso aceita o registro mais recente. */
  function fundir(remoto) {
    if (!remoto) return;
    gravandoDeFora = true;
    try {
      Object.keys(remoto).forEach(function (chave) {
        if (!doPercurso(chave)) return;
        var aqui = ler(chave);
        if (aqui === null || chave === 'sofia-reader-path') gravar(chave, remoto[chave]);
      });
    } finally { gravandoDeFora = false; }
  }

  function enviar() {
    var s = sessao();
    var pendente = fila();
    if (!s || !Object.keys(pendente).length || !navigator.onLine) return;
    fetch(API + '/percurso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.token },
      body: JSON.stringify({ chaves: pendente })
    }).then(function (r) {
      if (r.ok) guardarFila({});
      else if (r.status === 401) apagar(SESSAO);
    }).catch(function () { /* sem rede: a fila espera a próxima visita */ });
  }

  var relogio = null;
  function agendar() { clearTimeout(relogio); relogio = setTimeout(enviar, ESPERA); }

  /* O blog inteiro guarda progresso chamando localStorage.setItem. Em vez de
     alterar as dezenas de lugares que fazem isso, escutamos a própria porta.
     A troca precisa ser feita no protótipo: atribuir direto em localStorage
     não substituiria o método, gravaria um item chamado "setItem". */
  var Cofre = window.Storage && window.Storage.prototype;
  var setItemOriginal = Cofre && Cofre.setItem;
  if (setItemOriginal) {
    Cofre.setItem = function (chave, valor) {
      setItemOriginal.apply(this, arguments);
      if (this === window.localStorage && !gravandoDeFora && doPercurso(chave)) {
        var f = fila();
        f[chave] = String(valor);
        guardarFila(f);
        agendar();
      }
    };
  }

  function receber() {
    var s = sessao();
    if (!s) return Promise.resolve(false);
    return fetch(API + '/percurso', { headers: { Authorization: 'Bearer ' + s.token } })
      .then(function (r) {
        if (r.status === 401) { apagar(SESSAO); return false; }
        if (!r.ok) return false;
        return r.json();
      })
      .then(function (dados) {
        if (!dados || !dados.chaves) return false;
        fundir(dados.chaves);
        /* o que só existia aqui sobe na mesma visita */
        var local = tudoLocal();
        var faltando = {};
        Object.keys(local).forEach(function (c) { if (dados.chaves[c] !== local[c]) faltando[c] = local[c]; });
        if (Object.keys(faltando).length) { var f = fila(); Object.assign(f, faltando); guardarFila(f); agendar(); }
        return true;
      })
      .catch(function () { return false; });
  }

  window.Percurso = {
    aberto: function () { return !!sessao(); },
    codigo: function () { var s = sessao(); return s && s.codigo; },
    abrir: function (codigo, pin) {
      return fetch(API + '/entrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo, pin: pin })
      }).then(function (r) {
        return r.json().then(function (corpo) {
          if (!r.ok) throw Object.assign(new Error(corpo.erro || 'falha'), { status: r.status, corpo: corpo });
          gravar(SESSAO, JSON.stringify(corpo));
          /* o que o aluno já tinha neste aparelho entra junto */
          var f = fila(); Object.assign(f, tudoLocal()); guardarFila(f);
          return receber().then(function () { enviar(); return corpo; });
        });
      });
    },
    fechar: function () { apagar(SESSAO); apagar(FILA); },
    sincronizar: receber
  };

  if (sessao()) { receber(); window.addEventListener('online', enviar); }
})();
