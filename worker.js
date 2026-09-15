/* Sistema do Destino — o servidor do blog da Sofia
 *
 * Faz duas coisas. Para qualquer endereço que comece com /api/, responde ele
 * mesmo. Para todo o resto, entrega os arquivos de blog-sofia/ sem se meter.
 *
 *   POST /api/entrar    { codigo, pin }        -> abre o passaporte
 *   GET  /api/percurso                         -> devolve o percurso guardado
 *   POST /api/percurso  { chaves: { k: v } }   -> grava o que o aluno descobriu
 *   GET  /api/sala                             -> a Sala de quem esta entrando
 *   POST /api/sala      { estado, revisao }    -> salva a Sala
 *
 * E duas rotas so para quem tem papel de professor no banco. Elas leem, nunca
 * escrevem: a primeira versao da Area do Professor e somente leitura.
 *
 *   GET  /api/professor/eu                     -> confirma o papel de professor
 *   GET  /api/professor/salas                  -> lista os alunos e um resumo
 *   GET  /api/professor/sala?codigo=CORUJA-XX  -> a Sala e o percurso de um aluno
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
    .prepare('SELECT codigo, pin_hash, pin_sal, falhas, bloqueado_ate, papel FROM passaportes WHERE codigo = ?')
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

  /* O papel vai junto so para a interface saber se mostra o link da Area do
     Professor. Quem autoriza de verdade e o servidor, a cada pedido. */
  return responder({
    codigo: codigo,
    papel: linha.papel || 'aluno',
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
  if (Object.keys(chaves).some(c => String(chaves[c]).length > 2000)) return responder({ erro: 'registro grande demais' }, 413);
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

const objeto = v => v !== null && typeof v === 'object' && !Array.isArray(v);

/* A Sala de antes da reforma guardava parede, mesa, mural e decoracao no topo
 * do estado. A Sala de hoje guarda appearance e roomItems, e nao escreve mais
 * nenhum daqueles quatro.
 *
 * Enquanto esta validacao os EXIGIU, toda Sala criada do zero era recusada com
 * 400: defaults() nao os produz. Salas salvas antes da reforma continuavam
 * passando porque normalize() preserva as chaves antigas — o que escondeu o
 * problema, ja que quem testava tinha uma Sala velha. Agora sao aceitos se
 * vierem e nunca exigidos.
 */
function legadoValido(state) {
  const opcional = (valor, permitidos) => valor === undefined || permitidos.includes(valor);
  return opcional(state.parede, ['lilas', 'areia', 'verde'])
      && opcional(state.mesa, ['clara', 'escura'])
      && opcional(state.mural, ['cortica', 'tecido'])
      && opcional(state.decoracao, ['planta', 'livros', 'nenhum']);
}

/* Tapete, luzes e pacote de decoracao.
 *
 * Aqui se conferem tipo e tamanho, nao os valores em si. Quem decide quais
 * pacotes existem e sala.js; se esta lista tentasse acompanhar, o proximo
 * pacote novo voltaria a recusar a Sala de todo mundo — que foi exatamente o
 * que aconteceu com os quatro campos acima.
 */
function aparenciaValida(appearance) {
  if (appearance === undefined) return true;
  if (!objeto(appearance)) return false;
  const curta = v => v === undefined || (typeof v === 'string' && v.length <= 40);
  return curta(appearance.pack) && curta(appearance.lights)
      && (appearance.rug === undefined || typeof appearance.rug === 'boolean');
}

/* Os objetos espalhados pela sala: onde estao, se estao postos, em que estado.
   O limite de 60 e folgado de proposito — o catalogo tem oito. */
function objetosValidos(roomItems) {
  if (roomItems === undefined) return true;
  if (!objeto(roomItems)) return false;
  const ids = Object.keys(roomItems);
  if (ids.length > 60) return false;
  return ids.every(function (id) {
    if (!/^[a-z0-9_-]{1,80}$/.test(id)) return false;
    const o = roomItems[id];
    return objeto(o)
      && Number.isFinite(o.x) && o.x >= 0 && o.x <= 100
      && Number.isFinite(o.y) && o.y >= 0 && o.y <= 100
      && (o.state === undefined || (typeof o.state === 'string' && o.state.length <= 40))
      && (o.placed === undefined || typeof o.placed === 'boolean')
      && (o.lastWatered === undefined || Number.isFinite(o.lastWatered));
  });
}

async function sala(pedido, env) {
  const dono = await quemEsta(pedido, env);
  if (!dono) return responder({ erro: 'passaporte fechado' }, 401);
  if (pedido.method === 'GET') {
    const row = await env.DB.prepare('SELECT estado, revisao FROM salas WHERE codigo = ?').bind(dono.codigo).first();
    return responder(row ? { estado: JSON.parse(row.estado), revisao: row.revisao } : { estado: null, revisao: 0 });
  }
  const body = await corpoJson(pedido);
  const state = body && body.estado;
  const validPanels = ['heliopolis', 'tales', 'universo'];
  if (!body || !Number.isInteger(body.revisao) || body.revisao < 0 || !objeto(state) ||
      !objeto(state.paineis) ||
      !legadoValido(state) || !aparenciaValida(state.appearance) || !objetosValidos(state.roomItems) ||
      JSON.stringify(state).length > 64000) return responder({ erro: 'Sala inválida ou grande demais.' }, 400);
  for (const [key,panel] of Object.entries(state.paineis)) {
    if (!validPanels.includes(key) || !panel || !Array.isArray(panel.itens) || panel.itens.length > 30 ||
        !Array.isArray(panel.ligacoes) || panel.ligacoes.length > 60 ||
        typeof panel.conclusao !== 'string' || panel.conclusao.length > 500 ||
        typeof panel.nota !== 'string' || panel.nota.length > 280 ||
        !panel.itens.every(i => i && typeof i.id === 'string' && /^[a-z0-9-]{1,80}$/.test(i.id) &&
          Number.isFinite(i.x) && i.x>=0 && i.x<=100 && Number.isFinite(i.y) && i.y>=0 && i.y<=100) ||
        new Set(panel.itens.map(i=>i.id)).size !== panel.itens.length ||
        !panel.ligacoes.every(l => Array.isArray(l) && l.length===2 && l[0]!==l[1] && l.every(id=>panel.itens.some(i=>i.id===id))))
      return responder({ erro: 'Confira os itens e as notas do painel.' }, 400);
  }
  const encoded=JSON.stringify(state);
  const now=new Date().toISOString();
  let result;
  if(body.revisao===0) result=await env.DB.prepare('INSERT OR IGNORE INTO salas (codigo, estado, revisao, atualizado_em) VALUES (?, ?, 1, ?)').bind(dono.codigo,encoded,now).run();
  else result=await env.DB.prepare('UPDATE salas SET estado = ?, revisao = revisao + 1, atualizado_em = ? WHERE codigo = ? AND revisao = ?').bind(encoded,now,dono.codigo,body.revisao).run();
  if(!result.meta?.changes) return responder({ erro: 'A Sala mudou em outro aparelho. Reabra a Sala para carregar a versão salva.' },409);
  return responder({ revisao: body.revisao+1 });
}

/* A Area do Professor.
 *
 * O papel e lido do banco a cada pedido, nao do passe de sessao. Um passe
 * dura doze horas; se o papel viajasse dentro dele, tirar a permissao de
 * alguem so faria efeito meia tarde depois. Custa uma consulta e resolve.
 */
async function exigirProfessor(pedido, env) {
  const dono = await quemEsta(pedido, env);
  if (!dono) return { negado: responder({ erro: 'passaporte fechado' }, 401) };

  const linha = await env.DB
    .prepare('SELECT codigo, papel FROM passaportes WHERE codigo = ?')
    .bind(dono.codigo).first();

  if (!linha || linha.papel !== 'professor') {
    return { negado: responder({ erro: 'area restrita a professores' }, 403) };
  }
  return { codigo: linha.codigo };
}

/* Quantos objetos e pistas o aluno deixou postos. Serve so para o cartao da
   lista: assim a professora nao precisa abrir cada Sala para saber se ha algo
   dentro. Sala guardada torta nao derruba a lista inteira. */
function contarItens(estadoBruto) {
  if (!estadoBruto) return 0;
  try {
    const estado = JSON.parse(estadoBruto);
    const objetos = Object.values(estado.roomItems || {})
      .filter(function (i) { return i && i.placed !== false; }).length;
    const pistas = Object.values(estado.paineis || {})
      .reduce(function (total, p) { return total + ((p && p.itens) || []).length; }, 0);
    return objetos + pistas;
  } catch (e) { return 0; }
}

/* GET /api/professor/eu
   Confirma o papel antes de a interface mostrar a Area do Professor. A Sala
   Geral tambem passa por aqui: o catalogo de pistas e publico, mas mostra-lo
   todo desbloqueado entregaria a narrativa a um aluno curioso na barra de
   endereco. */
async function souProfessor(pedido, env) {
  const guarda = await exigirProfessor(pedido, env);
  if (guarda.negado) return guarda.negado;
  return responder({ codigo: guarda.codigo, papel: 'professor' });
}

/* GET /api/professor/salas */
async function listarSalas(pedido, env) {
  const guarda = await exigirProfessor(pedido, env);
  if (guarda.negado) return guarda.negado;

  const consulta = await env.DB.prepare(
    'SELECT p.codigo, p.turma, p.ultimo_acesso, s.estado, s.revisao, s.atualizado_em ' +
    'FROM passaportes p LEFT JOIN salas s ON s.codigo = p.codigo ' +
    "WHERE p.papel = 'aluno' ORDER BY p.turma, p.codigo"
  ).all();

  /* O estado inteiro fica no servidor. A lista leva so o resumo: com trinta
     alunos, mandar trinta Salas de ate 64 KB seria quase dois megabytes para
     desenhar uma tela de cartoes. A Sala vai pelo outro endpoint, uma por vez. */
  const alunos = (consulta.results || []).map(function (r) {
    return {
      codigo: r.codigo,
      turma: r.turma || '',
      ultimo_acesso: r.ultimo_acesso || null,
      atualizado_em: r.atualizado_em || null,
      tem_sala: !!r.estado,
      itens: contarItens(r.estado)
    };
  });

  return responder({ alunos: alunos });
}

/* GET /api/professor/sala?codigo=CORUJA-7K4M */
async function salaDoAluno(pedido, env) {
  const guarda = await exigirProfessor(pedido, env);
  if (guarda.negado) return guarda.negado;

  const codigo = String(new URL(pedido.url).searchParams.get('codigo') || '').trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,24}$/.test(codigo)) return responder({ erro: 'codigo invalido' }, 400);

  const aluno = await env.DB
    .prepare('SELECT codigo, turma, papel, ultimo_acesso FROM passaportes WHERE codigo = ?')
    .bind(codigo).first();

  /* Um professor nao abre a Sala de outro professor por esta porta. */
  if (!aluno || aluno.papel !== 'aluno') return responder({ erro: 'aluno nao encontrado' }, 404);

  const sala = await env.DB
    .prepare('SELECT estado, revisao, atualizado_em FROM salas WHERE codigo = ?')
    .bind(codigo).first();

  /* O percurso vem junto de proposito. A Sala decide o que mostrar a partir
     dos desbloqueios do dono: sem eles, a planta, o notebook e as pistas do
     mural sumiriam, e a professora veria a Sala do aluno filtrada pelo
     progresso dela propria. */
  const progresso = await env.DB
    .prepare('SELECT chave, valor FROM percurso WHERE codigo = ?')
    .bind(codigo).all();

  const chaves = {};
  (progresso.results || []).forEach(function (r) { chaves[r.chave] = r.valor; });

  return responder({
    codigo: aluno.codigo,
    turma: aluno.turma || '',
    ultimo_acesso: aluno.ultimo_acesso || null,
    estado: sala ? JSON.parse(sala.estado) : null,
    revisao: sala ? sala.revisao : 0,
    atualizado_em: sala ? sala.atualizado_em : null,
    chaves: chaves
  });
}

async function atenderApi(pedido, env) {
  if (!env.DB || !env.SEGREDO_SESSAO) {
    return responder({ erro: 'Sistema do Destino ainda não configurado' }, 503);
  }

  const rota = new URL(pedido.url).pathname.replace(/\/+$/, '');
  const metodo = pedido.method.toUpperCase();

  /* Qualquer erro daqui para baixo vira JSON.
   *
   * Sem isto, uma consulta que o banco recusa sobe sem tratamento e a
   * Cloudflare responde a pagina de erro dela, em HTML. O navegador entao
   * tenta ler aquilo como JSON e o aluno ve "Unexpected token '<'", que nao
   * diz nada a ninguem — enquanto a causa de verdade, "no such table: salas",
   * se perde no caminho. Aconteceu em 15/09/2026 e custou meia hora. */
  try {
    return await rotear(rota, metodo, pedido, env);
  } catch (e) {
    console.error('api', rota, e && e.stack || e);
    return responder({ erro: 'O servidor tropecou: ' + ((e && e.message) || 'erro desconhecido') }, 500);
  }
}

async function rotear(rota, metodo, pedido, env) {

  if (rota === '/api/sala' && (metodo === 'GET' || metodo === 'POST')) return sala(pedido, env);

  if (rota === '/api/professor/eu' && metodo === 'GET') return souProfessor(pedido, env);
  if (rota === '/api/professor/salas' && metodo === 'GET') return listarSalas(pedido, env);
  if (rota === '/api/professor/sala' && metodo === 'GET') return salaDoAluno(pedido, env);

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
