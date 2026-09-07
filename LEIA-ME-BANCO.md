# Painel Admin com login real + banco de dados Postgres

## O que mudou
- O admin agora tem **login de verdade** (usuário + senha), verificado no servidor, não mais uma senha escondida no JavaScript.
- Os produtos agora ficam guardados num banco **Postgres**, não mais no `localStorage` do navegador.
- O **site da loja também busca o catálogo desse mesmo banco** — agora, quando você edita um produto no admin, o cliente vê a mudança de verdade.
- O agente de IA de atendimento (que já configuramos antes) continua funcionando do mesmo jeito, na mesma pasta `api/`.

## Passo a passo

### 1. Criar o banco Postgres na Vercel
1. Entre em vercel.com e crie o projeto importando o repositório `SauloV20/Pipo-s` (o mesmo do site — se você já importou antes por causa do chat de IA, é o mesmo projeto, não precisa criar de novo).
2. Dentro do projeto na Vercel, vá em **Storage** → **Create Database** → escolha **Postgres** (Neon).
3. Depois de criado, a Vercel já conecta o banco automaticamente ao projeto e cria a variável de ambiente `POSTGRES_URL` sozinha.

### 2. Configurar as outras variáveis de ambiente
Em **Settings → Environment Variables** do projeto, adicione:

| Nome | Valor | Para que serve |
|---|---|---|
| `JWT_SECRET` | qualquer texto longo e aleatório, ex: `a8f3k2m9x7q1w5e6r4t8y2u3` | assina o login, mantenha em segredo |
| `ADMIN_USER` | o usuário que você quer usar pra entrar, ex: `saulo` | seu login |
| `ADMIN_PASS` | a senha que você quer usar, ex: `umaSenhaForte123` | sua senha (só é usada na hora do seed, depois fica só o hash no banco) |
| `SEED_SECRET` | outro texto aleatório, ex: `semear-pipos-2026` | protege o endpoint de importação inicial |
| `ANTHROPIC_API_KEY` | sua chave da Anthropic (se ainda não configurou por causa do chat de IA) | agente de atendimento |

### 3. Importar seus produtos e criar o usuário admin (rodar uma vez só)
Depois do deploy terminar, abra no navegador:
```
https://SEU-PROJETO.vercel.app/api/seed?chave=SUA_SEED_SECRET
```
(troque `SEU-PROJETO` pela URL real e `SUA_SEED_SECRET` pelo valor que você colocou em `SEED_SECRET`)

Isso cria as tabelas, seu usuário admin e importa os 33 produtos do `produtos.json`. É seguro visitar de novo por engano — ele só cria coisas se ainda estiverem vazias, não duplica.

### 4. Apontar o site e o admin pro endereço da Vercel
Nos arquivos `scripts.js` e `admin.js`, troque a linha:
```js
const API_BASE = 'https://SEU-PROJETO.vercel.app';
```
pela URL real do seu projeto na Vercel. Suba os dois arquivos atualizados pro repositório `Pipo-s` (mesmo processo de sempre: editar no GitHub, colar, Commit changes).

### 5. Testar
- Abra o site da loja — o catálogo deve carregar normalmente (agora vindo do banco).
- Abra o painel admin, entre com o usuário/senha que você definiu em `ADMIN_USER`/`ADMIN_PASS`.
- Edite ou crie um produto no admin, volte no site da loja e recarregue — a mudança deve aparecer lá.

## Arquivos novos nesta entrega
- `api/_db.js` — conexão com o Postgres
- `api/_auth.js` — verifica o login em cada rota protegida
- `api/login.js` — endpoint de login
- `api/produtos.js` — listar (público) e criar produto (protegido)
- `api/produtos/[id].js` — editar e deletar produto (protegido)
- `api/seed.js` — cria as tabelas, o usuário admin e importa o catálogo (rodar uma vez)
- `package.json` — dependências do backend (`pg`, `bcryptjs`, `jsonwebtoken`)
- `scripts.js` e `admin.js` — atualizados para buscar tudo da API em vez de dados fixos/localStorage

## O que ficou faltando (avisos)
- A senha inicial fica só no primeiro `seed`. Se quiser trocar depois, é preciso rodar uma query direta no banco (posso te ajudar quando precisar).
- O filtro de "Gênero" no site (Masculino/Feminino/Unisex/Infantil) nunca funcionou de verdade — nenhum produto tem esse campo preenchido no banco. Não mexi nisso agora porque não foi pedido, mas é um ajuste rápido se quiser.
