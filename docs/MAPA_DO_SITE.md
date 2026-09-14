# MAPA TÉCNICO — FIÉIS DA CORUJA

## 1. Visão geral da arquitetura

Aplicação web sem etapa de build: frontend estático em HTML, CSS e JavaScript, servido por um Cloudflare Worker. O mesmo Worker expõe a API e usa um banco Cloudflare D1. Não há framework de frontend, servidor separado nem gerenciador de pacotes no código publicado.

- Entrada narrativa: `blog-sofia/index.html`.
- Backend e roteamento: `worker.js`.
- Publicação: `wrangler.jsonc`, com `blog-sofia/` como diretório de assets.
- Banco: D1 `passaporte-fieis`, binding `DB`.
- Autenticação: código de passaporte + PIN; sessão Bearer assinada por `SEGREDO_SESSAO`, válida por 12 horas.

## 2. Estrutura de diretórios

- `blog-sofia/`: site publicado, páginas narrativas, estilos, scripts e assets.
- `blog-sofia/index.html`: arquivo/listagem dos capítulos e acesso às coleções.
- `blog-sofia/styles.css`: design e componentes compartilhados do blog e do primeiro arco.
- `blog-sofia/script.js`: interações compartilhadas, inventários, pistas, escolhas e experiências dos posts.
- `blog-sofia/percurso.js`: sessão, isolamento local por passaporte, fila offline e sincronização de progresso.
- `blog-sofia/arco2.css` e `blog-sofia/arco2.js`: componentes e desbloqueios dos posts do segundo arco.
- `blog-sofia/investigacao-dados.js`: catálogo central de casos e itens usados pela Sala.
- `blog-sofia/sala-investigacao.html`, `blog-sofia/sala.css` e `blog-sofia/sala.js`: interface, visual e lógica da Sala de Investigação.
- `blog-sofia/assets/`: imagens e áudios publicados.
- `sistema-passaporte/`: schema/migração, gerador local de passaportes, conferência e testes do Worker.
- `worker.js`: API de autenticação, percurso e Sala; entrega os assets nas demais rotas.
- `wrangler.jsonc`: configuração do Worker, assets e D1.

`blog-sofia-site/` existe, mas está vazio e não participa da configuração de deploy.

## 3. Blog da Sofia

Os posts ficam diretamente em `blog-sofia/post-*.html`. Há 12 arquivos: dez anotações do primeiro arco e duas do segundo. Cada post é uma página HTML completa, ligada manualmente ao anterior/próximo e listada manualmente em `blog-sofia/index.html`; não existe CMS nem modelo gerador. O primeiro post do arco 2, **Sala 17**, concentra sua progressão em `arco2.js`: janela Quadra/Heliópolis, registro da carta, Caminho do Sol, Cifra Solar opcional, recompensas e conversa no aplicativo E Aí?.

Estrutura recorrente: navegação, cabeçalho com metadados, corpo narrativo, blocos interativos, paginação e rodapé. `blog-sofia/styles.css`, `blog-sofia/script.js`, `blog-sofia/percurso.js` e `blog-sofia/contraste.js` são compartilhados. Os posts do arco 2 também carregam `blog-sofia/arco2.css` e `blog-sofia/arco2.js`.

Interações encontradas incluem escolhas de leitor, hotspots, revelações de pistas, áudio, animação pixelada, mudança de perspectiva/uniforme, espelho, teste dos Caminhos, minijogo de símbolos, limpeza de gotas e coleta de emblemas. As escolhas simples alteram a interface, mas não são persistidas. Descobertas com chaves `sofia-*` são persistidas.

Modais/painéis: Caderno de Pistas, Inventário da Missão, Coleção de Emblemas, sinopse e “Não é uma coleção” usam painéis/backdrops controlados por `blog-sofia/script.js`. A Sala usa o elemento nativo `<dialog>` para examinar itens.

## 4. Sistemas existentes

### Passaporte

- Finalidade: autenticar anonimamente o aluno e vincular progresso entre aparelhos.
- Arquivos: `blog-sofia/entrar.html`, `blog-sofia/percurso.js`, `worker.js`, `sistema-passaporte/esquema.sql`, `sistema-passaporte/gerar_passaportes.py` e `sistema-passaporte/testar_worker.mjs`.
- Componentes: formulário de entrada/saída e API `Percurso` no navegador.
- Persistência: sessão em `localStorage` (`passaporte-sessao`); dados duráveis nas tabelas `passaportes` e `percurso`.
- Integrações: intercepta acessos a chaves `sofia-*`, separa-os por código e sincroniza-os com `/api/percurso`. `Percurso.requisitar()` autentica a Sala.

### Inventário da Missão

- Finalidade: reunir objetos descobertos em páginas especiais.
- Arquivos/componentes: dados e painel criados por `blog-sofia/script.js`; descobertas marcadas pelo atributo `data-mission-discovery` em `blog-sofia/sistema-do-destino.html`, `blog-sofia/poseidon-lines.html` e `blog-sofia/passaporte.html`.
- Dados: `sofia-mission-system`, `sofia-mission-poseidon`, `sofia-mission-passport` e `sofia-mission-postal-arche`.
- Persistência/Passaporte: valores `found` em chaves `sofia-*`; `percurso.js` os armazena por aluno e sincroniza com `percurso` quando o passaporte está aberto.
- Como adicionar: incluir o item no catálogo `missionItems` de `script.js` e marcar uma página com `data-mission-discovery="<chave>"`.

### Caderno de Pistas

- Finalidade: exibir pistas encontradas ao longo dos posts.
- Arquivos/componentes: markup `.journal-launcher`/`.clue-journal` nos posts; controle compartilhado em `script.js`; catálogo ampliado em `investigacao-dados.js` para uso da Sala.
- Dados: chaves `sofia-clue-*`, normalmente com valor `found`.
- Persistência/Passaporte: mesmo fluxo `localStorage` isolado + tabela `percurso`.
- Como adicionar: a implementação do primeiro arco exige entrada no HTML do caderno e chamada/gravação da chave pelo script; itens destinados à Sala também precisam constar em `Investigacao.itens`.

### Coleção de Emblemas

- Finalidade: guardar emblemas coletados e apresentá-los num painel compartilhado.
- Arquivos/componentes: `script.js`, estilos em `styles.css`, botões de coleta nos posts e imagens `*-inventario.png` em `blog-sofia/assets/`.
- Dados implementados no painel: `sofia-emblem-fieis-da-coruja`, `sofia-emblem-ordem-do-eclipse` e `sofia-emblem-escritorio-do-destino`, com valor `collected`.
- Persistência/Passaporte: chaves `sofia-*` sincronizadas por `percurso.js`; a Sala também lê esses desbloqueios por `investigacao-dados.js`.
- Como adicionar: registrar catálogo/renderização compartilhada, fornecer asset e gravar `sofia-emblem-<id> = collected` na interação de desbloqueio.

### A Hora que Não Existe

- Finalidade: experiência colecionável ligada ao livro ficcional, iniciada em `blog-sofia/post-a-hora-que-nao-existe.html` e continuada em `blog-sofia/post-qual-e-o-seu-caminho.html`.
- Arquivos/componentes: `blog-sofia/script.js`, `blog-sofia/styles.css`, `blog-sofia/index.html` e assets `hora-ausente-*`.
- Dados: `sofia-not-a-collection = unlocked`, `sofia-collection-bookmark = collected`, `sofia-collection-path-cards = collected`; o teste também grava `sofia-reader-path`.
- Persistência/Passaporte: chaves `sofia-*` via `percurso.js` e tabela `percurso`.
- Estado: PARCIALMENTE IMPLEMENTADO. O painel inicial mostra capacidade `0/11`, mas o catálogo de `script.js` define apenas três itens.

### Sala de Investigação

- Finalidade: explorar um ambiente pessoal por quatro perspectivas (visão geral, estante, mesa e mural), posicionar objetos decorativos, alternar estados de objetos e organizar descobertas por caso no mural.
- Arquivos/componentes: `blog-sofia/sala-investigacao.html`, `blog-sofia/sala.css`, `blog-sofia/sala.js` e `blog-sofia/investigacao-dados.js`; endpoint `/api/sala` em `worker.js`; tabela `salas`.
- Dados: estado JSON retrocompatível com `appearance` (tapete e cordão de luzes), `roomItems` (posição normalizada, estado e exibição) e painéis por caso (`itens`, `ligacoes`, `nota`, `conclusao`). A configuração central de `sala.js` define zona/perspectiva, asset, tamanho, posição inicial e estados dos objetos.
- Persistência: D1 em `salas.estado`, com revisão otimista; rascunho local `sala-rascunho:<codigo>` e cópias locais de conflito.
- Relação com Passaporte: exige sessão aberta e `sofia-room-unlocked`; usa `Percurso.requisitar('sala')`.
- Como adicionar: pistas continuam registradas em `investigacao-dados.js`; decorações entram no catálogo `roomItems` de `sala.js`, apontando para um asset em `blog-sofia/assets/sala/` e uma perspectiva válida.

### Avatar e personalização

Avatar do aluno: **NÃO IMPLEMENTADO**.

Existe personalização da Sala (parede, mesa, mural e decoração), persistida dentro de `salas.estado`. O Notebook de Investigação passa a integrar os objetos da mesa após `sofia-room-notebook-unlocked`. Ela não é um sistema de avatar.

### Outros sistemas encontrados

- Contraste/acessibilidade: `contraste.js` injeta controles visuais e mantém preferências no navegador; não usa o passaporte.
- Sistema do Destino e Poseidon Lines: páginas narrativas/easter eggs que desbloqueiam itens do Inventário; não são backends independentes.
- Teste dos Caminhos: questionário interativo em `post-qual-e-o-seu-caminho.html`, controlado por `script.js`; resultado salvo em `sofia-reader-path` e cards coletáveis.
- Conquistas genéricas, pontos, níveis ou ranking: **NÃO IMPLEMENTADO**. O progresso existente é baseado em descobertas/desbloqueios nominais.

## 5. Componentes reutilizáveis

Preferir antes de criar alternativas:

- `Percurso` (`percurso.js`) para sessão, progresso `sofia-*`, sincronização e API autenticada.
- Navegação, cabeçalho de post, `post-layout`, `post-body`, `margin-notes`, `reader-choice` e `post-pagination` de `styles.css`.
- Caderno de Pistas, Inventário da Missão e Coleção de Emblemas controlados por `script.js`.
- Catálogo `window.Investigacao` de `investigacao-dados.js` para itens/casos consumidos pela Sala.
- Padrões de desbloqueio de `arco2.js` e atributos `data-*` existentes.
- Painel/backdrop acessível, estados `aria-expanded`/`aria-pressed`, regiões `aria-live` e `<dialog>` da Sala.
- Tokens, tipografia, breakpoints e regras de movimento reduzido de `styles.css`, `arco2.css` e `sala.css`.

## 6. Banco de dados

| Tabela | Finalidade e campos principais | Relações e sistemas |
| --- | --- | --- |
| `passaportes` | Identidade anônima e segurança: `codigo` (PK), `pin_hash`, `pin_sal`, `criado_em`, `ultimo_acesso`, `falhas`, `bloqueado_ate`. | Raiz da autenticação; pai de `percurso` e `salas`, ambos com exclusão em cascata. |
| `percurso` | Pares de progresso: `codigo`, `chave`, `valor`, `registrado_em`; PK composta (`codigo`, `chave`). Índice `percurso_por_codigo`. | FK para `passaportes.codigo`; usado por todos os desbloqueios `sofia-*`, inventários, pistas, emblemas, coleção e teste. |
| `salas` | Estado da Sala: `codigo` (PK), `estado` JSON como texto, `revisao`, `atualizado_em`. | FK para `passaportes.codigo`; uma Sala por passaporte; controle de concorrência por revisão. |

`salas` aparece tanto no final de `sistema-passaporte/esquema.sql` quanto em `sistema-passaporte/migracao-sala.sql`; ambos usam `CREATE TABLE IF NOT EXISTS`.

## 7. Fluxo do aluno

`blog-sofia/entrar.html` (código + PIN) → sessão do Passaporte → `blog-sofia/index.html` → posts → interações gravam chaves `sofia-*` → `blog-sofia/percurso.js` guarda localmente e sincroniza com `/api/percurso` → Caderno/Inventário/Emblemas/“Não é uma coleção” exibem os desbloqueios → o emblema do Escritóio libera a Sala → a Sala consome os mesmos desbloqueios e salva sua organização em `/api/sala`.

Sem passaporte aberto, descobertas `sofia-*` ficam no percurso local `visitante`; o código explicitamente não as copia automaticamente para um aluno que entrar depois. A Sala sempre exige passaporte.

## 8. Persistência e progresso

`percurso.js` intercepta somente chaves de `localStorage` iniciadas por `sofia-`, adiciona o namespace `percurso:<codigo>:` (ou `visitante`) e mantém uma fila local. Com sessão válida, envia a fila para `POST /api/percurso` e recebe o estado remoto por `GET /api/percurso`; eventos online/storage atualizam a interface. A remoção direta dessas descobertas é bloqueada.

O Worker aceita no máximo 300 chaves, exige prefixo `sofia-`, limita nome a 120 caracteres e valor a 2.000. A Sala tem persistência separada: JSON de até 64 KB em `salas`, com revisão para detectar edições concorrentes e rascunho local por código.

## 9. Mobile, animações e performance

- Layouts responsivos usam `clamp`, grids flexíveis e breakpoints recorrentes em 800/700/650/590/520 px.
- Alvos interativos geralmente têm pelo menos 44–48 px, foco visível, `aria-live` e controles por teclado; o mural também aceita setas.
- `prefers-reduced-motion: reduce` desativa ou simplifica animações nos três CSS principais.
- Animações são CSS e JS local: glitches, revelações, emblemas, espelho, uniforme, gotas e transições. Não há biblioteca externa de animação.
- Assets da Sala no arquivo usam `loading="lazy"`; imagens narrativas continuam sendo assets estáticos. Não há pipeline de build/otimização automática.
- A Sala tem CSS responsivo sobreposto; em telas estreitas o mural e os cartões são reduzidos. Testar alterações nesse componente tanto por toque quanto por teclado.

## 10. Estado atual do projeto

### Implementado

- Site/blog estático com 12 posts, navegação e interações narrativas.
- Cloudflare Worker, assets, D1, login anônimo, proteção contra tentativas e sessão assinada.
- Persistência por passaporte e fila offline para chaves `sofia-*`.
- Inventário da Missão, Caderno de Pistas, Coleção de Emblemas e teste dos Caminhos.
- Sala de Investigação com mural, casos, ligações, notas, conclusões, personalização e salvamento remoto.

### Parcialmente implementado

- “A Hora que Não Existe”/“Não é uma coleção”: três itens implementados para onze posições apresentadas.
- Convite dos Fiéis: desbloqueio e item existem, mas `investigacao-dados.js` declara que o texto ainda será definido.
- Passaporte visual: a página existe, mas informa que ainda não há carimbos disponíveis.

### Planejado/documentado, mas ainda sem implementação

- Avatar do aluno.
- Sistema genérico de conquistas, pontos, níveis ou ranking.
- Painel administrativo de turmas (registrado como ausente em `sistema-passaporte/LEIA-ME.md`).

## 11. Pontos de atenção

- Não criar autenticação, progresso, inventário ou armazenamento paralelos; integrar pelas chaves `sofia-*`, `Percurso` e catálogos existentes.
- Posts e listagem são manuais. Novo post exige atualizar `index.html`, paginação e scripts/estilos carregados.
- `script.js` e `styles.css` concentram muitos sistemas; alterações globais podem afetar todos os posts.
- O progresso de visitante não migra para um passaporte aberto posteriormente.
- `percurso.js` substitui métodos de `Storage.prototype` para as chaves `sofia-*`; não contornar esse mecanismo.
- A Sala depende simultaneamente do desbloqueio em `percurso`, do catálogo em `investigacao-dados.js`, da tabela `salas` e do endpoint correspondente.
- O schema da Sala está duplicado de modo idempotente no schema geral e na migração avulsa; escolher o procedimento adequado ao banco de destino sem executar ambos desnecessariamente.
- `sistema-passaporte/LEIA-ME.md` ainda diz que `esquema.sql` contém duas tabelas, mas o arquivo atual contém três.
- O repositório estava com alterações locais funcionais não commitadas durante esta auditoria; preservá-las e revisar o diff antes de qualquer operação destrutiva.
