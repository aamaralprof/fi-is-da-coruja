/* Sistema do Destino — o servidor do blog da Sofia
 *
 * Faz duas coisas. Para qualquer endereço que comece com /api/, responde ele
 * mesmo. Para todo o resto, entrega os arquivos de blog-sofia/ sem se meter.
 *
 *   POST /api/entrar    { codigo, pin }        -> abre o passaporte
 *   GET  /api/percurso                         -> devolve o percurso guardado
 *   POST /api/percurso  { chaves: { k: v } }   -> grava o que o aluno descobriu
 *
 * Depende de três coisas, declaradas em wrangler.jsonc e no painel:
 *   ASSETS          — os arquivos do blog
 *   DB              — o banco D1
 *   SEGREDO_SESSAO  — segredo que assina os passes de sessão; nunca vai ao
 *                     repositório, é cadastrado como secret na Cloudflare
 */

const ITERACOES = 100000;         // custo do PBKDF2
const HORAS_DE_SESSAO = 12;       // uma tarde de aula, com folga
const FALHAS_ATE_TRAVAR = 5;
const MINUTOS_TRAVADO = 15;
const MAXIMO_DE_CHAVES = 300;

const texto = new TextEncoder();

function paraBase64(bytes) {
  let s = '';
  const b = new Uint8Array(bytes);
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64(s) {
  const norm = s.replace(/-/g, '+').replace(/_/g, '/');
  const bruto = atob(norm + '==='.slice((norm.length + 3) % 4));
  const saida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i++) saida[i] = bruto.charCodeAt(i);
  return saida;
}

/* Comparação de tempo constante: sair mais cedo diante do primeiro byte
   diferente contaria, pelo relógio, quanto do segredo já foi acertado. */
function iguais(a, b) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenca === 0;
}

async function derivarPin(pin, salBase64) {
  const chave = await crypto.subtle.importKey('raw', texto.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: deBase64(salBase64), iterations: ITERACOES, hash: 'SHA-256' },
    chave, 256
  );
  return paraBase64(bits);
}

async function assinar(conteudo, segredo) {
  const chave = await crypto.subtle.importKey(
    'raw', texto.encode(segredo), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return paraBase64(await crypto.subtle.sign('HMAC', chave, texto.encode(conteudo)));
}

async function criarPasse(codigo, segredo) {
  const expira = Date.now() + HORAS_DE_SESSAO * 3600 * 1000;
  const corpo = paraBase64(texto.encode(JSON.stringify({ codigo, expira })));
  return corpo + '.' + (await assinar(corpo, segredo));
}

async function lerPasse(passe, segredo) {
  if (!passe || passe.indexOf('.') < 0) return null;
  const partes = passe.split('.');
  const corpo = partes[0];
  const firma = partes[1] || '';
  if (!iguais(firma, await assinar(corpo, segredo))) return null;
  try {
    const dados = JSON.parse(new TextDecoder().decode(deBase64(corpo)));
    if (!dados.codigo || !dados.expira || dados.expira < Date.now()) return null;
    return dados;
  } catch (e) { return null; }
}

function responder(dados, status) {
  return new Response(JSON.stringify(dados), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

async function corpoJson(pedido) {
  try { return await pedido.json(); } catch (e) { return null; }
}

async function quemEsta(pedido, env) {
  const cabecalho = pedido.headers.get('Authorization') || '';
  if (cabecalho.indexOf('Bearer ') !== 0) return null;
  return lerPasse(cabecalho.slice(7), env.SEGREDO_SESSAO);
}

/* POST /api/entrar */
async function entrar(pedido, env) {
  const corpo = await corpoJson(pedido);
  const codigo = String((corpo && corpo.codigo) || '').trim().toUpperCase();
  const pin = String((corpo && corpo.pin) || '').trim();

  if (!/^[A-Z0-9-]{4,24}$/.test(codigo) || !/^\d{4}$/.test(pin)) {
    return responder({ erro: 'dados incompletos' }, 400);
  }

  const linha = await env.DB
    .prepare('SELECT codigo, pin_hash, pin_sal, falhas, bloqueado_ate FROM passaportes WHERE codigo = ?')
    .bind(codigo).first();

  /* Passaporte inexistente responde igual a PIN errado: dizer qual dos dois
     falhou entregaria de graça a lista de códigos válidos. */
  if (!linha) return responder({ erro: 'código ou PIN não confere' }, 401);

  if (linha.bloqueado_ate && Date.parse(linha.bloqueado_ate) > Date.now()) {
    return responder({ erro: 'tentativas demais', liberado_em: linha.bloqueado_ate }, 429);
  }

  const tentativa = await derivarPin(pin, linha.pin_sal);
  if (!iguais(tentativa, linha.pin_hash)) {
    const falhas = (linha.falhas || 0) + 1;
    const trava = falhas >= FALHAS_ATE_TRAVAR
      ? new Date(Date.now() + MINUTOS_TRAVADO * 60000).toISOString()
      : null;
    await env.DB.prepare('UPDATE passaportes SET falhas = ?, bloqueado_ate = ? WHERE codigo = ?')
      .bind(trava ? 0 : falhas, trava, codigo).run();
    if (trava) return responder({ erro: 'tentativas demais', liberado_em: trava }, 429);
    return responder({ erro: 'código ou PIN não confere' }, 401);
  }

  await env.DB.prepare('UPDATE passaportes SET falhas = 0, bloqueado_ate = NULL, ultimo_acesso = ? WHERE codigo = ?')
    .bind(new Date().toISOString(), codigo).run();

  return responder({
    codigo: codigo,
    token: await criarPasse(codigo, env.SEGREDO_SESSAO),
    expira: new Date(Date.now() + HORAS_DE_SESSAO * 3600 * 1000).toISOString()
  });
}

/* GET /api/percurso */
async function lerPercurso(pedido, env) {
  const dono = await quemEsta(pedido, env);
  if (!dono) return responder({ erro: 'passaporte fechado' }, 401);

  const consulta = await env.DB
    .prepare('SELECT chave, valor FROM percurso WHERE codigo = ?')
    .bind(dono.codigo).all();

  const chaves = {};
  (consulta.results || []).forEach(function (r) { chaves[r.chave] = r.valor; });
  return responder({ codigo: dono.codigo, chaves: chaves });
}

/* POST /api/percurso */
async function gravarPercurso(pedido, env) {
  const dono = await quemEsta(pedido, env);
  if (!dono) return responder({ erro: 'passaporte fechado' }, 401);

  const corpo = await corpoJson(pedido);
  const chaves = (corpo && corpo.chaves) || {};
  const nomes = Object.keys(chaves).filter(function (c) {
    return c.indexOf('sofia-') === 0 && c.length <= 120 && String(chaves[c]).length <= 2000;
  });
  if (!nomes.length) return responder({ gravadas: 0 });
  if (nomes.length > MAXIMO_DE_CHAVES) return responder({ erro: 'pacote grande demais' }, 413);

  const agora = new Date().toISOString();
  const gravar = env.DB.prepare(
    'INSERT INTO percurso (codigo, chave, valor, registrado_em) VALUES (?, ?, ?, ?) ' +
    'ON CONFLICT(codigo, chave) DO UPDATE SET valor = excluded.valor, registrado_em = excluded.registrado_em'
  );
  await env.DB.batch(nomes.map(function (c) {
    return gravar.bind(dono.codigo, c, String(chaves[c]), agora);
  }));

  return responder({ gravadas: nomes.length });
}

async function atenderApi(pedido, env) {
  if (!env.DB || !env.SEGREDO_SESSAO) {
    return responder({ erro: 'Sistema do Destino ainda não configurado' }, 503);
  }

  const rota = new URL(pedido.url).pathname.replace(/\/+$/, '');
  const metodo = pedido.method.toUpperCase();

  if (rota === '/api/entrar' && metodo === 'POST') return entrar(pedido, env);
  if (rota === '/api/percurso' && metodo === 'GET') return lerPercurso(pedido, env);
  if (rota === '/api/percurso' && metodo === 'POST') return gravarPercurso(pedido, env);

  return responder({ erro: 'consulta não reconhecida' }, 404);
}

export default {
  async fetch(pedido, env) {
    const caminho = new URL(pedido.url).pathname;
    if (caminho === '/api' || caminho.indexOf('/api/') === 0) {
      return atenderApi(pedido, env);
    }
    /* Todo o resto é o blog: páginas, imagens, sons, o minijogo. */
    return env.ASSETS.fetch(pedido);
  }
};
