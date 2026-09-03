# Sistema do Passaporte

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
| `esquema.sql` | As duas tabelas do banco |
| `gerar_passaportes.py` | Cria os códigos e a folha para imprimir |
| `../blog-sofia/functions/api/[[rota]].js` | A API: entrada e sincronismo |
| `../blog-sofia/percurso.js` | O lado do navegador |
| `../blog-sofia/entrar.html` | A tela de acesso |

## Instalação, uma vez só

### 1. Conta na Cloudflare

Crie uma conta gratuita em <https://dash.cloudflare.com/sign-up>. O plano
gratuito cobre com folga uma escola inteira.

### 2. Criar o banco

No painel: **Storage & Databases → D1 → Create**. Dê o nome
`passaporte-fieis`. Abra o **Console** do banco recém-criado, cole o conteúdo
de `esquema.sql` e execute. Devem aparecer duas tabelas.

### 3. Publicar o blog

No painel: **Compute → Workers & Pages → Create → Pages → Connect to Git** e
escolha o repositório `fi-is-da-coruja`. Nas configurações de build:

- **Root directory:** `blog-sofia`
- **Framework preset:** nenhum
- **Build command:** deixe vazio
- **Build output directory:** `/`

A partir daí, todo envio ao GitHub republica o blog sozinho.

### 4. Ligar o banco à API

Nas configurações do projeto Pages, em **Settings → Bindings → Add → D1
database**:

- **Variable name:** `DB` — precisa ser exatamente isso
- **D1 database:** `passaporte-fieis`

### 5. O segredo das sessões

Ainda em **Settings**, agora em **Variables and Secrets → Add → Secret**:

- **Name:** `SEGREDO_SESSAO`
- **Value:** um texto longo e aleatório, com 40 caracteres ou mais

Para gerar um:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Guarde-o junto das suas senhas. Trocá-lo depois não quebra nada: apenas fecha
todos os passaportes abertos, e os alunos entram de novo.

Publique novamente o projeto para as duas configurações valerem.

## A cada turma

```bash
python sistema-passaporte/gerar_passaportes.py 32 --turma "7º B"
```

Aparecem dois arquivos em `sistema-passaporte/saida/`:

- **`lista-para-imprimir.html`** — abra no navegador e imprima. Escreva o nome
  de cada aluno ao lado do código **antes** de recortar, e guarde a folha.
- **`passaportes.sql`** — cole no Console do D1 e execute, do mesmo jeito que
  fez com o esquema.

Essa pasta está no `.gitignore` e nunca vai para o GitHub: a folha traz os PINs
legíveis e o SQL traz a lista de códigos válidos.

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

## O que ainda não existe

- Nenhum painel para você acompanhar as turmas. Hoje a consulta é pelo Console
  do D1, com SQL na mão.
- Se um aluno abrir o passaporte num computador compartilhado e não fechar, a
  sessão segue válida naquele navegador por doze horas. O botão **guardar o
  passaporte neste aparelho**, na tela de acesso, encerra na hora.
