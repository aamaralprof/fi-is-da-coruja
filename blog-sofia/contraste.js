/* Guarda de contraste — legibilidade depois das 16h.
 *
 * O tema escuro do blog troca as variáveis de cor, o que resolve o texto
 * comum. Mas dezenas de componentes fixam cor direto no CSS, sem passar
 * pelas variáveis: o folheto, a capa do livro, a página do passaporte, a
 * tela do notebook. Esses não sabem que existe modo escuro, e o texto
 * deles some — às vezes por ficar claro sobre papel claro, às vezes por
 * ficar escuro sobre fundo escuro.
 *
 * Pior: o mesmo componente aparece claro numa página e escuro em outra,
 * então não há lista de seletores que resolva. Só medindo dá para saber.
 *
 * Este guarda percorre os textos uma vez, calcula o fundo que de fato está
 * pintado atrás de cada um e, quando o contraste fica abaixo do mínimo
 * legível, aproxima a tinta o suficiente para ler — e só isso. Um texto
 * discreto continua discreto; ele não é jogado para o preto ou o branco.
 *
 * Nada acontece no tema claro. E qualquer capítulo novo entra sozinho.
 */

(function () {
  'use strict';

  var MIN_NORMAL = 4.5;   // WCAG AA para texto comum
  var MIN_GRANDE = 3.0;   // WCAG AA para texto grande
  var FOLGA = 0.6;        // margem para não ficar no limite exato
  var TINTA_ESCURA = [30, 26, 38];
  var TINTA_CLARA = [241, 236, 226];

  function numeros(cor) {
    var m = String(cor).match(/[\d.]+/g);
    return m ? m.map(Number) : null;
  }

  function luminancia(c) {
    function canal(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * canal(c[0]) + 0.7152 * canal(c[1]) + 0.0722 * canal(c[2]);
  }

  function contraste(a, b) {
    var l1 = luminancia(a), l2 = luminancia(b);
    var claro = Math.max(l1, l2), escuro = Math.min(l1, l2);
    return (claro + 0.05) / (escuro + 0.05);
  }

  /* Sobrepõe uma cor semitransparente sobre outra, como o navegador faria. */
  function sobrepor(frente, fundo, alfa) {
    return [0, 1, 2].map(function (i) {
      return Math.round(frente[i] * alfa + fundo[i] * (1 - alfa));
    });
  }

  /* O fundo que está de fato pintado atrás do elemento: sobe pelos
     ancestrais somando as camadas translúcidas até achar uma opaca. */
  function fundoPintado(el) {
    var camadas = [];
    var n = el;
    while (n && n.nodeType === 1) {
      var cor = numeros(getComputedStyle(n).backgroundColor);
      if (cor) {
        var alfa = cor.length > 3 ? cor[3] : 1;
        if (alfa >= 0.995) {
          var resultado = cor.slice(0, 3);
          for (var i = camadas.length - 1; i >= 0; i--) {
            resultado = sobrepor(camadas[i].cor, resultado, camadas[i].alfa);
          }
          return resultado;
        }
        if (alfa > 0.02) camadas.push({ cor: cor.slice(0, 3), alfa: alfa });
      }
      n = n.parentElement;
    }
    return null; // sem fundo opaco conhecido: melhor não adivinhar
  }

  /* Aproxima a tinta do necessário, e não além disso: parte da cor cheia e
     volta na direção do fundo enquanto o contraste continuar suficiente.
     Assim uma legenda discreta continua discreta. */
  function tintaSuficiente(fundo, alvo) {
    var escolhida = contraste(TINTA_ESCURA, fundo) >= contraste(TINTA_CLARA, fundo)
      ? TINTA_ESCURA : TINTA_CLARA;
    if (contraste(escolhida, fundo) < alvo) return escolhida; // nem cheia resolve
    var melhor = escolhida;
    for (var passo = 1; passo <= 20; passo++) {
      var tentativa = sobrepor(escolhida, fundo, 1 - passo * 0.04);
      if (contraste(tentativa, fundo) < alvo) break;
      melhor = tentativa;
    }
    return melhor;
  }

  function temTextoProprio(el) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var no = el.childNodes[i];
      if (no.nodeType === 3 && no.nodeValue.trim().length > 1) return true;
    }
    return false;
  }

  var AJUSTADO = 'data-contraste-ajustado';

  function revisar() {
    if (!document.body.classList.contains('after-four')) return 0;

    /* Desfaz os ajustes da passada anterior antes de medir. Sem isto a
       segunda passada leria a cor que nós mesmos escrevemos, concluiria que
       está tudo legível e devolveria a cor original — desfazendo a
       correção que acabara de fazer. */
    var marcados = document.body.querySelectorAll('[' + AJUSTADO + ']');
    for (var k = 0; k < marcados.length; k++) {
      marcados[k].style.color = '';
      marcados[k].removeAttribute(AJUSTADO);
    }

    var ajustes = 0;
    var todos = document.body.querySelectorAll('*');

    for (var i = 0; i < todos.length; i++) {
      var el = todos[i];
      if (!temTextoProprio(el)) continue;

      var estilo = getComputedStyle(el);
      if (estilo.visibility === 'hidden' || estilo.display === 'none') continue;
      if (parseFloat(estilo.opacity) < 0.2) continue;

      var cor = numeros(estilo.color);
      if (!cor) continue;
      var fundo = fundoPintado(el);
      if (!fundo) continue;

      var tamanho = parseFloat(estilo.fontSize);
      var peso = parseInt(estilo.fontWeight, 10) || 400;
      var grande = tamanho >= 24 || (tamanho >= 18.66 && peso >= 700);
      var minimo = grande ? MIN_GRANDE : MIN_NORMAL;

      if (contraste(cor.slice(0, 3), fundo) >= minimo) continue;

      var nova = tintaSuficiente(fundo, minimo + FOLGA);
      el.style.color = 'rgb(' + nova.join(',') + ')';
      el.setAttribute(AJUSTADO, '');
      ajustes++;
    }
    return ajustes;
  }

  var pendente = null;
  function agendar() {
    clearTimeout(pendente);
    pendente = setTimeout(revisar, 120);
  }

  function iniciar() {
    revisar();
    /* Vários capítulos revelam texto ao clicar — o folheto que vira, o
       caderno que abre, o teste que mostra o resultado. */
    document.addEventListener('click', agendar, true);
    document.addEventListener('transitionend', agendar, true);
    window.addEventListener('load', agendar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  window.Contraste = { revisar: revisar };
})();
