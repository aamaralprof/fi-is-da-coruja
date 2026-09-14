# MAPA TÉCNICO — FIÉIS DA CORUJA

## 1. Visão geral da arquitetura

Aplicação web sem etapa de build: frontend estático em HTML, CSS e JavaScript, servido por um Cloudflare Worker. O mesmo Worker expõe a API e usa um banco Cloudflare D1. Não há framework de frontend, servidor separado nem gerenciador de pacotes no código publicado.

- Entrada narrativa: `blog-sofia/index.html`.
- Backend e roteamento: `worker.js`.
- Publicação: `wrangler.jsonc`, com `blog-sofia/` como diretório de assets.
- Banco: D1 `passaporte-fieis`, binding `DB`.
- Autenticação: código de passaporte + PIN; sessão Bearer assinada por `SEGREDO_SESSAO`, válida por 12 horas.
- Autorização: coluna `passaportes.papel` (`aluno` ou `professor`), lida do banco a cada pedido administrativo.

## 2. Estrutura de diretórios

- `blog-sofia/`: site publicado, páginas narrativas, estilos, scripts e assets.
- `blog-sofia/index.html`: arquivo/listagem dos capítulos e acesso às coleções.
- `blog-sofia/styles.css`: design e componentes compartilhados do blog e do primeiro arco.
- `blog-sofia/script.js`: interações compartilhadas, inventários, pistas, escolhas e experiências dos posts.
- `blog-sofia/percurso.js`: sessão, isolamento local por passaporte, fila offline e sincronização de progresso.
- `blog-sofia/arco2.css` e `blog-sofia/arco2.js`: componentes e desbloqueios dos posts do segundo arco.
- `blog-sofia/investigacao-dados.js`: catálogo central de casos e itens usados pela Sala.
- `blog-sofia/sala-investigacao.html`, `blog-sofia/sala.css` e `blog-sofia/sala.js`: interface, visual e lógica da Sala de Investigação.
- `blog-sofia/sala-professor.js`: monta o contexto de leitura da Sala quando o endereço traz `?aluno=` ou `?geral=1`. Não desenha nada.
- `blog-sofia/professor.html`, `blog-sofia/professor.css` e `blog-sofia/professor.js`: a lista da Área do Professor.
- `blog-sofia/assets/`: imagens e áudios publicados.
- `sistema-passaporte/`: schema/migrações (`esquema.sql`, `migracao-sala.sql`, `migracao-professor.sql`), gerador local de passaportes, conferência e testes do Worker.
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
- Dados: estado JSON retrocompatível com `appearance` (pacote, tapete e cordão de luzes), `roomItems` (posição normalizada, estado, exibição e, na planta, `lastWatered`) e painéis por caso (`itens`, `ligacoes`, `nota`, `conclusao`). A configuração central de `sala.js` define zona/perspectiva, asset, tamanho, posição inicial e estados dos objetos. O Worker valida tipo e limite de `appearance` e `roomItems`, e aceita sem exigir os campos do formato antigo.
- Persistência: D1 em `salas.estado`, com revisão otimista; rascunho local `sala-rascunho:<codigo>` e cópias locais de conflito.
- Relação com Passaporte: exige sessão aberta e `sofia-room-unlocked`; usa `Percurso.requisitar('sala')`.
- Como adicionar: pistas continuam registradas em `investigacao-dados.js`; decorações entram no catálogo `roomItems` de `sala.js`, apontando para um asset em `blog-sofia/assets/sala/` e uma perspectiva válida.

### Área do Professor

- Finalidade: permitir que a professora veja a Sala de Investigação de cada aluno, sem poder alterá-la, e experimente a sala-base à vontade.
- Arquivos/componentes: `blog-sofia/professor.html`, `blog-sofia/professor.js`, `blog-sofia/professor.css`, `blog-sofia/sala-professor.js`; endpoints `/api/professor/eu`, `/api/professor/salas` e `/api/professor/sala` em `worker.js`; `sistema-passaporte/migracao-professor.sql`.
- Endereços: `professor.html` (a lista), `sala-investigacao.html?aluno=<codigo>` (a Sala de um aluno) e `sala-investigacao.html?geral=1` (a Sala Geral). O Worker serve os assets sem extensão, então `/professor` e `/sala-investigacao?aluno=…` também respondem.
- Reúso: **não existe segunda Sala.** `sala-professor.js` monta `window.SalaContexto` e o próprio `sala.js` desenha, com a mesma marcação e o mesmo CSS do aluno. Quem mexer na Sala mexe nas duas ao mesmo tempo.
- Três estados em `sala.js`, e a diferença entre os dois primeiros é o que se pode tocar:
  - `leitura` — a Sala de um aluno. Não liga os gestos de arrastar, esconde personalização/seleção/conclusão, deixa nota e conclusão como texto somente leitura e acrescenta a classe `sala-leitura`, que põe `pointer-events:none` nos objetos.
  - `bancada` — a Sala Geral. A personalização fica inteira: arrastar, acender, regar, guardar pela bandeja. Esconde só "Guardar minha conclusão", que prometeria guardar sem guardar.
  - `visita` — os dois. É o que fecha as três portas da persistência: `cache()`, `change()` e `save()` saem na primeira linha. Visitar nunca escreve, nem no servidor nem no rascunho local, e a bancada volta ao padrão ao recarregar.
- Por que a Sala Geral não é somente leitura: ela não é de ninguém — é a sala-base, não guardada em lugar nenhum — então travá-la não protegia aluno nenhum, e é a tela onde a professora precisa acender a luminária e regar a planta para saber o que os objetos fazem. Não há rota de escrita para o professor no Worker; a garantia não depende da interface.
- Dados do aluno: `/api/professor/sala` devolve o estado **e** o percurso daquele passaporte. Sem o percurso, a Sala apareceria filtrada pelos desbloqueios de quem está olhando — a planta, o notebook e as pistas do mural sumiriam.
- Desempenho: a lista traz só um resumo por aluno (turma, contagem de itens, datas). O estado completo vai por aluno, uma Sala por vez, quando a professora escolhe.
- Nomes dos alunos: ficam **apenas no navegador da professora**, em `localStorage['professor-nomes']`, importados de `sistema-passaporte/saida/nomes.json`. Nunca são enviados ao servidor. O banco guarda código e turma, nunca nome.
- Como promover alguém a professor: `UPDATE passaportes SET papel = 'professor' WHERE codigo = '…';`
- Como rotular a turma de passaportes que já existem, sem gerar códigos novos: `python sistema-passaporte/gerar_passaportes.py --marcar-turma "7º B"`, que lê `saida/etiquetas.html` e emite `saida/turma.sql` (só `UPDATE` na coluna `turma`) e `saida/nomes.json`. Regerar a leva não é alternativa: criaria códigos diferentes e trocar a leva apagaria percurso e Salas em cascata.

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
| `passaportes` | Identidade anônima e segurança: `codigo` (PK), `pin_hash`, `pin_sal`, `criado_em`, `ultimo_acesso`, `falhas`, `bloqueado_ate`, `papel` (`aluno`/`professor`, padrão `aluno`), `turma` (rótulo da classe, nunca um nome). Índice `passaportes_por_turma`. | Raiz da autenticação e da autorização; pai de `percurso` e `salas`, ambos com exclusão em cascata. |
| `percurso` | Pares de progresso: `codigo`, `chave`, `valor`, `registrado_em`; PK composta (`codigo`, `chave`). Índice `percurso_por_codigo`. | FK para `passaportes.codigo`; usado por todos os desbloqueios `sofia-*`, inventários, pistas, emblemas, coleção e teste. |
| `salas` | Estado da Sala: `codigo` (PK), `estado` JSON como texto, `revisao`, `atualizado_em`. | FK para `passaportes.codigo`; uma Sala por passaporte; controle de concorrência por revisão. |

`salas` aparece tanto no final de `sistema-passaporte/esquema.sql` quanto em `sistema-passaporte/migracao-sala.sql`; ambos usam `CREATE TABLE IF NOT EXISTS`.

`papel` e `turma` estão no `CREATE TABLE` de `esquema.sql`, para bancos novos, e em `sistema-passaporte/migracao-professor.sql`, para o banco que já existe. SQLite não aceita `ADD COLUMN IF NOT EXISTS`: aplicar a migração duas vezes acusa `duplicate column name`, o que só significa que já foi aplicada.

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
- O `aspect-ratio` do palco da Sala é o da arte de cada perspectiva (`1672/941` na visão geral, na mesa e no mural; `1295/1214` na estante), e não um número escolhido a gosto. Os objetos são posicionados em porcentagem do palco, mas o aluno mira na mobília desenhada: se a moldura tiver outra proporção, o `object-fit:cover` corta a arte e as duas grades descolam. A moldura da estante é limitada a `78vh` e se centraliza, porque respeitar a proporção quase quadrada dela numa tela larga daria um palco mais alto que a janela.

## 10. Estado atual do projeto

### Implementado

- Site/blog estático com 12 posts, navegação e interações narrativas.
- Cloudflare Worker, assets, D1, login anônimo, proteção contra tentativas e sessão assinada.
- Persistência por passaporte e fila offline para chaves `sofia-*`.
- Inventário da Missão, Caderno de Pistas, Coleção de Emblemas e teste dos Caminhos.
- Sala de Investigação com mural, casos, ligações, notas, conclusões, personalização e salvamento remoto.
- Área do Professor, primeira versão: rota protegida, Salas dos alunos por turma em modo somente leitura, busca, cartões com contagem e data, e Sala Geral como bancada de testes — tudo reaproveitando a Sala do aluno, sem segunda implementação.

### Parcialmente implementado

- “A Hora que Não Existe”/“Não é uma coleção”: três itens implementados para onze posições apresentadas.
- Convite dos Fiéis: desbloqueio e item existem, mas `investigacao-dados.js` declara que o texto ainda será definido.
- Passaporte visual: a página existe, mas informa que ainda não há carimbos disponíveis.

### Planejado/documentado, mas ainda sem implementação

- Avatar do aluno.
- Sistema genérico de conquistas, pontos, níveis ou ranking.
- Progresso por post/arco, emblemas, caderno de pistas e respostas de investigação **dentro** da Área do Professor. A primeira versão mostra só a Sala; `/api/professor/sala` já devolve o percurso completo do aluno, então acrescentar essas telas não exige mudar o banco nem os endpoints.

## 11. Pontos de atenção

- Não criar autenticação, progresso, inventário ou armazenamento paralelos; integrar pelas chaves `sofia-*`, `Percurso` e catálogos existentes.
- Posts e listagem são manuais. Novo post exige atualizar `index.html`, paginação e scripts/estilos carregados.
- `script.js` e `styles.css` concentram muitos sistemas; alterações globais podem afetar todos os posts.
- O progresso de visitante não migra para um passaporte aberto posteriormente.
- `percurso.js` substitui métodos de `Storage.prototype` para as chaves `sofia-*`; não contornar esse mecanismo.
- A Sala depende simultaneamente do desbloqueio em `percurso`, do catálogo em `investigacao-dados.js`, da tabela `salas` e do endpoint correspondente.
- O schema da Sala está duplicado de modo idempotente no schema geral e na migração avulsa; escolher o procedimento adequado ao banco de destino sem executar ambos desnecessariamente.
- O estado da Sala existe em **dois formatos**. O antigo, anterior à reforma das perspectivas, guarda `parede`, `mesa`, `mural` e `decoracao` no topo; o atual guarda `appearance` e `roomItems`. `normalize()` preserva as chaves antigas quando encontra, então uma Sala antiga carrega os dois. A validação do Worker aceita ambos e não exige nenhum dos quatro campos antigos — exigi-los recusava toda Sala criada do zero (corrigido em 14/09/2026). Ao mexer nessa validação, não voltar a enumerar valores que `sala.js` decide, como os pacotes de decoração: é o que quebra de novo no próximo pacote.
- A Área do Professor não pode ganhar rota de escrita sem decisão explícita: hoje a garantia de que a professora não altera o trabalho do aluno é o Worker não ter por onde.
- Ao mexer nos modos de `sala.js`, separar as duas perguntas: `leitura` decide o que se pode **tocar**, `visita` decide o que se pode **gravar**. Confundir as duas foi o que deixou a Sala Geral travada sem proteger ninguém.
- Trocar uma arte de perspectiva por outra de proporção diferente exige acertar o `aspect-ratio` correspondente em `sala.css`, senão a Sala inteira sai do lugar. O comentário no topo daquele arquivo lista as dimensões.
- O alternar de objeto da Sala não funciona com evento de ponteiro sintético: `setPointerCapture` rejeita um `pointerId` inventado e o `releasePointerCapture` do `pointerup` estoura antes de chegar ao `toggleState`. Com dedo ou mouse funciona; teste automatizado por esse caminho dá falso negativo.
- Rodar `node sistema-passaporte/testar_worker.mjs` depois de mexer no Worker; o banco falso de lá precisa conhecer cada consulta nova.
- O repositório estava com alterações locais funcionais não commitadas durante esta auditoria; preservá-las e revisar o diff antes de qualquer operação destrutiva.
