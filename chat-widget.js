// chat-widget.js
// Widget de atendimento com IA para o site da Pipo's.
// Requer o backend em /api/atendimento (veja api/atendimento.js).

(function () {
  const ENDPOINT = '/api/atendimento';

  const estilos = `
    #pipos-chat-bolha {
      position: fixed; bottom: 24px; right: 24px; z-index: 3000;
      width: 60px; height: 60px; border-radius: 50%;
      background-color: #3a2d1d; color: #f3e0c7;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      border: none; font-family: 'Montserrat', sans-serif;
      transition: transform 0.2s;
    }
    #pipos-chat-bolha:hover { transform: scale(1.06); }
    #pipos-chat-janela {
      position: fixed; bottom: 96px; right: 24px; z-index: 3000;
      width: 340px; max-width: 90vw; height: 460px; max-height: 70vh;
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      display: none; flex-direction: column;
      font-family: 'Montserrat', sans-serif;
    }
    #pipos-chat-janela.aberto { display: flex; }
    #pipos-chat-cabecalho {
      background: #3a2d1d; color: #f3e0c7; padding: 14px 16px;
      display: flex; justify-content: space-between; align-items: center;
      font-weight: bold;
    }
    #pipos-chat-fechar { background: none; border: none; color: #f3e0c7; font-size: 1.3rem; cursor: pointer; }
    #pipos-chat-mensagens {
      flex: 1; overflow-y: auto; padding: 12px; background: #fdf6ee;
      display: flex; flex-direction: column; gap: 8px;
    }
    .pipos-msg { max-width: 80%; padding: 8px 12px; border-radius: 12px; font-size: 0.9rem; line-height: 1.35; }
    .pipos-msg.bot { align-self: flex-start; background: #f3e0c7; color: #3a2d1d; border-bottom-left-radius: 2px; }
    .pipos-msg.user { align-self: flex-end; background: #8b6b4f; color: #fff; border-bottom-right-radius: 2px; }
    .pipos-msg.carregando { align-self: flex-start; background: #f3e0c7; color: #3a2d1d; font-style: italic; opacity: 0.7; }
    #pipos-chat-form { display: flex; border-top: 1px solid #e0cbb5; }
    #pipos-chat-input {
      flex: 1; border: none; padding: 12px; font-family: inherit; font-size: 0.9rem; outline: none;
    }
    #pipos-chat-enviar {
      border: none; background: #3a2d1d; color: #f3e0c7; padding: 0 18px; cursor: pointer; font-weight: bold;
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = estilos;
  document.head.appendChild(styleTag);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="pipos-chat-bolha" aria-label="Falar com atendimento">💬</button>
    <div id="pipos-chat-janela">
      <div id="pipos-chat-cabecalho">
        <span>Atendimento Pipo's</span>
        <button id="pipos-chat-fechar" aria-label="Fechar">&times;</button>
      </div>
      <div id="pipos-chat-mensagens"></div>
      <form id="pipos-chat-form">
        <input id="pipos-chat-input" type="text" placeholder="Digite sua mensagem..." autocomplete="off">
        <button id="pipos-chat-enviar" type="submit">Enviar</button>
      </form>
    </div>
  `);

  const bolha = document.getElementById('pipos-chat-bolha');
  const janela = document.getElementById('pipos-chat-janela');
  const fechar = document.getElementById('pipos-chat-fechar');
  const mensagensEl = document.getElementById('pipos-chat-mensagens');
  const form = document.getElementById('pipos-chat-form');
  const input = document.getElementById('pipos-chat-input');

  let historico = [];
  let jaAbriu = false;

  function adicionarMensagem(texto, tipo) {
    const div = document.createElement('div');
    div.className = `pipos-msg ${tipo}`;
    div.textContent = texto;
    mensagensEl.appendChild(div);
    mensagensEl.scrollTop = mensagensEl.scrollHeight;
    return div;
  }

  bolha.addEventListener('click', () => {
    janela.classList.toggle('aberto');
    if (!jaAbriu) {
      jaAbriu = true;
      adicionarMensagem('Oi! 👋 Sou a atendente virtual da Pipo\'s. Posso te ajudar a encontrar um tênis, tirar dúvida sobre entrega/pagamento ou fechar seu pedido. Como posso ajudar?', 'bot');
    }
  });

  fechar.addEventListener('click', () => janela.classList.remove('aberto'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto) return;

    adicionarMensagem(texto, 'user');
    historico.push({ role: 'user', content: texto });
    input.value = '';

    const carregando = adicionarMensagem('digitando...', 'carregando');

    try {
      const resposta = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: historico })
      });

      const dados = await resposta.json();
      carregando.remove();

      if (!resposta.ok) {
        adicionarMensagem('Ops, tive um problema para responder agora. Fala com a gente direto pelo WhatsApp!', 'bot');
        return;
      }

      adicionarMensagem(dados.resposta, 'bot');
      historico.push({ role: 'assistant', content: dados.resposta });
    } catch (erro) {
      carregando.remove();
      adicionarMensagem('Não consegui me conectar agora. Tenta de novo em instantes ou chama no WhatsApp.', 'bot');
    }
  });
})();
