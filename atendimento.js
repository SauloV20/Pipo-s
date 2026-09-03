// api/atendimento.js
// Função serverless (Vercel). A chave da IA fica só aqui no servidor,
// nunca é exposta no navegador do cliente.

const produtos = require('../produtos.json');
const WHATSAPP_NUM = '5524992938796'; // troque pelo número real de atendimento

function montarResumoCatalogo() {
  // Resume o catálogo em texto compacto para não gastar tokens à toa
  return produtos
    .map(p => {
      const preco = p.preco > 0 ? `R$ ${p.preco.toFixed(2)}` : 'sob consulta';
      const marca = p.marca || 'marca não informada';
      return `- ${p.nome} (${marca}) | preço: ${preco} | tamanhos: ${p.tamanhos.join(', ')}`;
    })
    .join('\n');
}

const SYSTEM_PROMPT = `Você é a atendente virtual da Pipo's Tênis, uma loja de tênis e calçados.
Seu trabalho é ajudar o cliente a:
1. Tirar dúvidas frequentes (formas de pagamento, prazo/forma de entrega, trocas).
2. Encontrar produtos do catálogo abaixo que combinem com o que o cliente procura (marca, tamanho, estilo, faixa de preço).
3. Quando o cliente já souber o que quer, direcionar para fechar o pedido pelo WhatsApp: https://wa.me/${WHATSAPP_NUM}

Regras:
- Seja simpática, direta e use português do Brasil, tom casual de loja de bairro.
- Nunca invente produto, preço ou tamanho que não estejam na lista abaixo.
- Se não souber uma informação (ex: prazo exato de entrega, política de troca específica), diga que vai confirmar com a equipe pelo WhatsApp.
- Sempre que o cliente demonstrar intenção de comprar, convide para finalizar pelo WhatsApp.
- Respostas curtas (2-4 frases), como uma conversa de chat, não um texto corrido.

Catálogo atual:
${montarResumoCatalogo()}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Método não permitido' });
    return;
  }

  try {
    const { mensagens } = req.body; // [{role: 'user'|'assistant', content: '...'}, ...]

    if (!Array.isArray(mensagens) || mensagens.length === 0) {
      res.status(400).json({ erro: 'Envie "mensagens" (histórico da conversa).' });
      return;
    }

    const resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: mensagens
      })
    });

    if (!resposta.ok) {
      const erroTexto = await resposta.text();
      console.error('Erro da API Anthropic:', erroTexto);
      res.status(502).json({ erro: 'Falha ao falar com a IA.' });
      return;
    }

    const dados = await resposta.json();
    const texto = dados.content
      .filter(bloco => bloco.type === 'text')
      .map(bloco => bloco.text)
      .join('\n');

    res.status(200).json({ resposta: texto });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno no atendimento.' });
  }
};
