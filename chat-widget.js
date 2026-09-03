// chat-widget.js
// Widget de atendimento com IA para o site da Pipo's.
// Usa o CSS que já existe em style.css (#chat-toggle, #chat-box, .msg, etc.)
// Requer o backend em /api/atendimento (veja api/atendimento.js).

(function () {
  const ENDPOINT = '/api/atendimento';

  document.body.insertAdjacentHTML('beforeend', `
    <button id="chat-toggle" aria-label="Abrir chat de atendimento">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </button>
    <div id="chat-box">
      <div id="chat-header">
        <div id="chat-avatar">P</div>
        <div>
          <div id="chat-title">Atendimento Pipo's</div>
          <div id="chat-status"><span class="status-dot"></span>Online</div>
        </div>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-input-area">
        <input id="chat-input" type="text" placeholder="Digite sua mensagem..." autocomplete="off">
        <button id="chat-send" aria-label="Enviar mensagem">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `);

  const toggle = document.getElementById('chat-toggle');
  const box = document.getElementById('chat-box');
  const messagesEl = document.getElementById('chat-messages');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  let historico = [];
  let jaAbriu = false;

  function adicionarMensagem(texto, tipo) {
    const div = document.createElement('div');
    div.className = `msg ${tipo}`;
    div.textContent = texto;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function mostrarDigitando() {
    const div = document.createElement('div');
    div.className = 'msg bot digitando';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  toggle.addEventListener('click', () => {
    box.classList.toggle('aberto');
    if (!jaAbriu) {
      jaAbriu = true;
      adicionarMensagem('Oi! 👋 Sou a atendente virtual da Pipo\'s. Posso te ajudar a achar um tênis, tirar dúvida sobre entrega/pagamento ou fechar seu pedido. Como posso ajudar?', 'bot');
    }
  });

  async function enviarMensagem() {
    const texto = input.value.trim();
    if (!texto) return;

    adicionarMensagem(texto, 'user');
    historico.push({ role: 'user', content: texto });
    input.value = '';

    const digitando = mostrarDigitando();

    try {
      const resposta = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: historico })
      });

      const dados = await resposta.json();
      digitando.remove();

      if (!resposta.ok) {
        adicionarMensagem('Ops, tive um problema para responder agora. Fala com a gente direto pelo WhatsApp!', 'bot');
        return;
      }

      adicionarMensagem(dados.resposta, 'bot');
      historico.push({ role: 'assistant', content: dados.resposta });
    } catch (erro) {
      digitando.remove();
      adicionarMensagem('Não consegui me conectar agora. Tenta de novo em instantes ou chama no WhatsApp.', 'bot');
    }
  }

  sendBtn.addEventListener('click', enviarMensagem);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensagem();
  });
})();
