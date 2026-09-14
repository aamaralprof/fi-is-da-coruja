# Sistema do Passaporte

**No ar em:** <https://blog-da-sofia.aamaral.workers.dev>

O que faz o progresso do aluno acompanhá-lo de um aparelho a outro: quem
descobriu o carimbo no computador da escola encontra o mesmo percurso ao abrir
o blog em casa.

## O princípio

O banco guarda **apenas** o código do passaporte, o PIN cifrado e o que foi
descoberto. Nenhum nome, e-mail, telefone, turma, escola ou idade.

A ligação entre `CORUJA-7K4M` e um aluno existe num lugar só: a folha impressa
pelo gerador, que fica com você. O sistema sabe que alguém leu o capítulo 4;
não sabe quem, e não tem como descobrir.

Guarde essa folha. Se ela se perder, os dados do banco deixam de se referir a
qualquer pessoa — o que é uma perda para você e uma proteção para eles.

## As peças

| Arquivo | Papel |
| --- | --- |
| `../wrangler.jsonc` | Configuração do Worker: quais arquivos publicar e qual banco usar |
| `../worker.js` | O servidor: responde ao `/api/` e entrega o blog |
| `esquema.sql` | As três tabelas do banco, para um banco novo |
| `migracao-professor.sql` | Acrescenta `papel` e `turma` a um banco que já existe |
| `gerar_passaportes.py` | Cria os códigos e a folha para imprimir |
| `testar_worker.mjs` | Exercita a API inteira sem publicar nada |
| `../blog-sofia/percurso.js` | O lado do navegador |
| `../blog-sofia/entrar.html` | A tela de acesso |

## Instalação, uma vez só

### 1. Criar o banco

No painel da Cloudflare: **Storage & Databases → D1 → Create**. Nome:
`passaporte-fieis`.

Abra o **Console** do banco recém-criado, cole o conteúdo de `esquema.sql` e
execute. Devem aparecer três tabelas: `passaportes`, `percurso` e `salas`.

**Se o seu banco já existe**, `esquema.sql` não altera nada — ele só cria o que
falta. Para ganhar a Área do Professor, cole também `migracao-professor.sql`,
uma vez só. Ela acrescenta duas colunas e não toca em passaporte, percurso nem
Sala nenhuma. Faça isso **antes** de publicar o site novo: o Worker novo lê a
coluna `papel` já na tela de acesso.

### 2. Ligar o banco à configuração

Na página do banco, copie o **Database ID** e cole em `wrangler.jsonc`, no
lugar de `COLE_AQUI_O_ID_DO_BANCO`. Ele não é segredo: sem acesso à conta, não
serve para nada.

Envie a alteração ao GitHub. Sem isso, o Worker sobe sem banco e a tela de
acesso responde *"Sistema do Destino ainda não configurado"*.

### 3. Criar o Worker

**Compute → Workers & Pages → Create application → Continue with GitHub**, e
escolha o repositório `fi-is-da-coruja`.

A Cloudflare lê o `wrangler.jsonc` sozinha e já sabe o que fazer: publicar a
pasta `blog-sofia`, rodar o `worker.js` e ligar o banco. Não preencha comando
de build — não há build, são arquivos prontos.

O endereço final será `blog-da-sofia.aamaral.workers.dev`. Para mudar o começo,
troque o campo `name` no `wrangler.jsonc`.

### 4. O segredo das sessões

Em **Settings → Variables and Secrets → Add → Secret**:

- **Name:** `SEGREDO_SESSAO`
- **Value:** um texto longo e aleatório, com 40 caracteres ou mais

Para gerar um:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Guarde-o junto das suas senhas. Ele não entra no repositório de propósito.
Trocá-lo depois não quebra nada: apenas fecha todos os passaportes abertos, e
os alunos entram de novo.

Publique novamente para o segredo valer.

## A cada turma

**Arraste a lista da turma para cima de `GERAR-PASSAPORTES.bat`.**

Ele lê Excel, PDF, Word, CSV ou texto — inclusive as listas exportadas dos
sistemas da escola, com cabeçalho, número de chamada e RA no meio. Antes de
gerar qualquer coisa, mostra os nomes que encontrou e espera você confirmar.

Se preferir digitar, escreva os nomes em `sistema-passaporte/turma.txt`, um por
linha, e dê dois cliques no atalho sem arrastar nada. Esse arquivo não vai para
o GitHub: são nomes de menores.

Se o filtro errar — deixar alguém de fora ou incluir uma linha que não é nome —
rode com `--sem-filtro` para aproveitar todas as linhas, ou ajuste a lista à mão.

Quem preferir o terminal:

```bash
python sistema-passaporte/gerar_passaportes.py --nomes turma.txt --turma "7º B"
```

Aparecem dois arquivos em `sistema-passaporte/saida/`:

- **`etiquetas.html`** — uma etiqueta por aluno, com o selo do Escritório do
  Destino, o nome, o código e o PIN. Abra no navegador, imprima e recorte.
  **Guarde uma via.**
- **`passaportes.sql`** — cole no Console do D1 e execute, do mesmo jeito que
  fez com o esquema.

O nome do aluno aparece **apenas na etiqueta**. Não entra no SQL, não vai para a
Cloudflare, não sai do seu computador. É essa separação que mantém o banco sem
dado pessoal nenhum.

A pasta `saida/` está no `.gitignore` e nunca vai para o GitHub: as etiquetas
trazem nomes e PINs legíveis, e o SQL traz a lista de códigos válidos.

## Conferir se as etiquetas batem com o banco

Dois cliques em `sistema-passaporte/CONFERIR-BANCO.bat`.

Quem preferir o terminal — **no seu computador**, não no Console do D1, que só
entende SQL:

```bash
python sistema-passaporte/gerar_passaportes.py --conferir-banco
```

Pega alguns passaportes da folha gerada e tenta entrar com eles no site no ar.
Se abrem, a leva que está no banco é a mesma que você imprimiu.

Isso importa porque **cada geração cria códigos novos**. Se você gerar de novo
depois de já ter carregado o SQL, os códigos deixam de bater e nenhum aluno
consegue entrar — sem nenhuma mensagem de erro que explique o motivo. Por isso
o gerador agora se recusa a substituir uma leva já existente, a menos que você
passe `--refazer`.

Quando trocar de leva de propósito, limpe a antiga antes de carregar a nova:

```sql
DELETE FROM passaportes;
```

Só faça isso enquanto nenhum aluno tiver começado a usar: apagar os
passaportes apaga junto o percurso ligado a eles.

## Depois de mexer no código

```bash
node sistema-passaporte/testar_worker.mjs
```

Monta um banco falso na memória e faz o worker responder a pedidos de verdade —
entrada, PIN errado, trava por tentativas, gravação e leitura do percurso,
passes adulterados. Leva menos de um segundo e não toca em nada publicado.

## Se um aluno perder o PIN

Não há como recuperá-lo: o banco guarda o PIN cifrado, não o PIN. Gere um
passaporte novo e entregue. O percurso antigo continua no banco, sob o código
antigo, mas fora de alcance.

## O que já está protegido

- O PIN nunca é gravado nem trafega em texto puro; é cifrado com PBKDF2-SHA256
  e cem mil iterações, com um sal diferente por passaporte.
- Cinco erros seguidos travam o código por quinze minutos. Sem isso, adivinhar
  quatro dígitos seria trivial.
- Código inexistente e PIN errado devolvem a mesma resposta, para que ninguém
  descubra quais códigos existem.
- A comparação das assinaturas é de tempo constante.
- Uma sessão dura doze horas e depois pede o PIN de novo.
- Só `blog-sofia/` é publicado. O `worker.js` e o `wrangler.jsonc` ficam fora
  da pasta de arquivos justamente para não virarem endereço público.

## A Área do Professor

Para ver as Salas da turma sem SQL na mão.

### Ligar, uma vez só

1. Cole `migracao-professor.sql` no Console do D1 (veja acima).
2. Gere um passaporte para você junto com a turma, ou use um que já tenha.
3. No Console do D1, promova esse código:

```sql
UPDATE passaportes SET papel = 'professor' WHERE codigo = 'CORUJA-XXXX';
```

Guarde esse código e esse PIN como você guarda uma senha: quem os tiver vê a
Sala de todos os alunos.

### Usar

Abra seu passaporte na tela de acesso e vá para `/professor` no endereço do
site. O link não aparece em lugar nenhum do blog, de propósito.

Lá você encontra a **Sala Geral** — a sala-base, com todos os objetos e pistas
à mostra, para conferir o que existe — e as **Salas dos Alunos**, agrupadas por
turma. Clicar num aluno abre a Sala dele exatamente como ele a deixou.

**Você não consegue alterar a Sala de ninguém.** Não é só que os botões somem:
o servidor não tem rota para o professor escrever. É proposital.

### Os nomes dos alunos

A lista continua mostrando `CORUJA-7K4M`, não "Ana". Para ver os nomes, clique
em **Nomes da turma** e escolha o arquivo `saida/nomes.json` que o gerador
deixou junto das etiquetas.

Esses nomes ficam **só naquele navegador**. Não sobem para a Cloudflare, não
vão para o banco, não são enviados a lugar nenhum. Se você abrir a Área do
Professor em outro computador, precisa importar de novo — e é assim que o banco
continua sem nome de aluno. **Esqueça os nomes** apaga a lista daquele aparelho.

### A turma dos passaportes que já existem

O que entra no banco agora é a **turma**, e só ela: "7º B" é rótulo de classe,
não diz quem é ninguém. Quem foi gerado antes dessa coluna existir aparece em
"Sem turma".

**Não gere uma leva nova para resolver isso.** Cada geração cria códigos
diferentes, e trocar a leva exigiria apagar a antiga — o que levaria junto o
percurso e as Salas de todo mundo, por causa da exclusão em cascata.

Rotule a leva que já está no banco:

```bash
python sistema-passaporte/gerar_passaportes.py --marcar-turma "7º B"
```

Ele lê os códigos da folha `saida/etiquetas.html` que você já imprimiu e
escreve dois arquivos novos, sem tocar em `passaportes.sql`:

- **`saida/turma.sql`** — um `UPDATE` por aluno, só na coluna `turma`. Nenhum
  `INSERT`, nenhum `DELETE`, nenhum PIN. Cole no Console do D1 e execute.
- **`saida/nomes.json`** — para importar na Área do Professor.

Nenhum código muda, nenhum PIN muda, e o progresso fica onde está. Os alunos
não percebem nada.

Se tiver mais de uma turma, rode uma vez por turma, guardando a folha de
etiquetas correspondente em `saida/` a cada vez.

Se não tiver certeza de que a folha em `saida/` é a mesma leva que está no
banco, confira antes:

```bash
python sistema-passaporte/gerar_passaportes.py --conferir-banco
```

## O que ainda não existe

- Progresso, emblemas, pistas e respostas dentro da Área do Professor. Por ora
  ela mostra a Sala. O resto continua sendo consulta pelo Console do D1.
- Se um aluno abrir o passaporte num computador compartilhado e não fechar, a
  sessão segue válida naquele navegador por doze horas. O botão **guardar o
  passaporte neste aparelho**, na tela de acesso, encerra na hora.
