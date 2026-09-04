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
 * Vale de dia e de noite: o defeito não é do entardecer, é de componente
 * que fixa cor sem saber sobre que fundo vai cair. E qualquer capítulo novo
 * entra sozinho.
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

  /* Conversões para mexer no claro-escuro sem perder a cor. */
  function paraHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }

  function paraRgb(hsl) {
    var h = hsl[0], s = hsl[1], l = hsl[2];
    function canal(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (s === 0) { var v = Math.round(l * 255); return [v, v, v]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [
      Math.round(canal(p, q, h + 1 / 3) * 255),
      Math.round(canal(p, q, h) * 255),
      Math.round(canal(p, q, h - 1 / 3) * 255)
    ];
  }

  /* Quanto de cor a tinta tem, de 0 (cinza) a 1 (pura). Usamos isto, e não
     a saturação do HSL, porque a saturação engana perto do branco: o creme
     do tema marca 0,30 de saturação e não tem cor nenhuma. */
  function croma(c) {
    return (Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2])) / 255;
  }

  var CROMA_NEUTRO = 0.12;

  /* A cor que o tema usa para o texto principal. Serve para separar o que
     deveria gritar do que deveria sussurrar. */
  function tintaDoTema() {
    var valor = getComputedStyle(document.body).getPropertyValue('--ink').trim();
    /* O valor vem como veio no CSS: "#eee9df" ou "rgb(...)". Procurar
       números direto no hexadecimal encontraria os dígitos que ele tem
       por acaso — "#eee9df" devolveria [9]. */
    if (valor.charAt(0) === '#') {
      var hex = valor.length === 4
        ? valor[1] + valor[1] + valor[2] + valor[2] + valor[3] + valor[3]
        : valor.slice(1, 7);
      if (hex.length !== 6) return null;
      return [
        parseInt(hex.substr(0, 2), 16),
        parseInt(hex.substr(2, 2), 16),
        parseInt(hex.substr(4, 2), 16)
      ];
    }
    var n = numeros(valor);
    return n && n.length >= 3 ? n.slice(0, 3) : null;
  }

  function pertoDe(a, b) {
    if (!a || !b) return false;
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 40;
  }

  /* Torna o texto legível preservando o que ele quer dizer.
     Três casos, e a diferença entre eles é a intenção, não a cor:

     - Texto principal, pintado com a tinta do tema: vai para a tinta cheia
       do lado oposto ao fundo. Um título precisa ter peso.
     - Texto com cor própria — o lilás dos rótulos, o dourado do Sistema:
       mantém matiz e a mesma quantidade de cor, mudando só a luz.
     - Texto deliberadamente discreto, como os espaços ainda vazios da
       coleção: escurece ou clareia só até dar para ler, e para por aí. Um
       sussurro continua sussurro. */
  function tintaLegivel(original, fundo, alvo) {
    /* Qual direção clareia mais: num fundo cinza-médio, um limiar fixo
       erra — o certo é perguntar qual das duas tintas contrasta mais. */
    var fundoClaro = contraste(TINTA_ESCURA, fundo) >= contraste(TINTA_CLARA, fundo);
    var cheia = fundoClaro ? TINTA_ESCURA : TINTA_CLARA;

    if (pertoDe(original, tintaDoTema())) return cheia;

    var hsl = paraHsl(original);
    var cor = croma(original);
    var neutro = cor < CROMA_NEUTRO;
    var passo = fundoClaro ? -0.02 : 0.02;

    for (var i = 1; i <= 50; i++) {
      var l = hsl[2] + passo * i;
      if (l < 0.04 || l > 0.96) break;
      /* mantém a mesma quantidade de cor na nova luminosidade, para não
         virar um roxo berrante ao escurecer */
      var s = neutro ? 0 : Math.min(1, cor / Math.max(0.08, 1 - Math.abs(2 * l - 1)));
      var tentativa = paraRgb([hsl[0], s, l]);
      if (contraste(tentativa, fundo) >= alvo) return tentativa;
    }
    return cheia;
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

      var nova = tintaLegivel(cor.slice(0, 3), fundo, minimo + FOLGA);
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
