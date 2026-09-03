# Agente de IA de atendimento — Pipo's

## O que tem aqui
- `produtos.json` — catálogo extraído do seu `scripts.js`, usado como conhecimento do agente.
- `api/atendimento.js` — função de backend que fala com a IA (chave fica só aqui, protegida).
- `chat-widget.js` — o balão de chat que aparece no site.

## Passo a passo para publicar (usando Vercel, gratuito)

1. Crie uma conta em https://vercel.com (pode entrar com GitHub).
2. Crie um repositório no GitHub com os arquivos do seu site (index.html, style.css, scripts.js, etc.) e adicione esta pasta `api/` e o `produtos.json` na raiz do projeto.
3. Adicione no final do `index.html`, antes do `</body>`:
   ```html
   <script src="chat-widget.js"></script>
   ```
4. Importe o repositório na Vercel ("Add New Project" → selecione o repositório).
5. Em **Settings → Environment Variables**, crie:
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: sua chave da API da Anthropic (gerada em https://console.anthropic.com)
6. Clique em **Deploy**. Pronto — a Vercel detecta automaticamente a pasta `api/` e cria o endpoint `/api/atendimento` sozinha.

## Atualizando o catálogo
Sempre que adicionar produtos novos pelo painel admin, rode novamente a extração (ou me peça para gerar de novo) para atualizar o `produtos.json` que o agente usa como referência — assim ele nunca inventa produto ou preço que não existe.

## Custo
Você paga só pelo uso da API da Anthropic (por mensagem trocada), não tem mensalidade fixa. Para uma loja pequena, o custo tende a ser bem baixo.
