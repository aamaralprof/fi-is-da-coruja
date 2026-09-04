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
| `esquema.sql` | As duas tabelas do banco |
| `gerar_passaportes.py` | Cria os códigos e a folha para imprimir |
| `testar_worker.mjs` | Exercita a API inteira sem publicar nada |
| `../blog-sofia/percurso.js` | O lado do navegador |
| `../blog-sofia/entrar.html` | A tela de acesso |

## Instalação, uma vez só

### 1. Criar o banco

No painel da Cloudflare: **Storage & Databases → D1 → Create**. Nome:
`passaporte-fieis`.

Abra o **Console** do banco recém-criado, cole o conteúdo de `esquema.sql` e
execute. Devem aparecer duas tabelas.

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

## O que ainda não existe

- Nenhum painel para você acompanhar as turmas. Hoje a consulta é pelo Console
  do D1, com SQL na mão.
- Se um aluno abrir o passaporte num computador compartilhado e não fechar, a
  sessão segue válida naquele navegador por doze horas. O botão **guardar o
  passaporte neste aparelho**, na tela de acesso, encerra na hora.
