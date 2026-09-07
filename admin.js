// admin.js — painel autenticado via API (Postgres no backend)
// Troque a URL abaixo pela URL do seu projeto publicado na Vercel.
const API_BASE = 'https://SEU-PROJETO.vercel.app';

let token = localStorage.getItem('pipos_admin_token');
let produtoAtualizar = null;
let produtos = [];
let eventosIniciados = false;

function mostrarPainel() {
  const modalAuth = document.getElementById('modalAuth');
  if (modalAuth) modalAuth.style.display = 'none';

  if (!eventosIniciados) {
    inicializarEventos();
    eventosIniciados = true;
  }
  carregarProdutos();
}

function mostrarLogin(mensagemErro) {
  const modalAuth = document.getElementById('modalAuth');
  if (modalAuth) modalAuth.style.display = 'flex';

  if (mensagemErro) {
    const el = document.getElementById('mensagemErro');
    el.textContent = mensagemErro;
    el.style.display = 'block';
  }
}

async function tentarLogin() {
  const usuario = document.getElementById('usuarioAdmin').value.trim();
  const senha = document.getElementById('senhaAdmin').value;

  try {
    const resposta = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarLogin(dados.erro || 'Usuário ou senha inválidos');
      return;
    }

    token = dados.token;
    localStorage.setItem('pipos_admin_token', token);
    mostrarPainel();
  } catch (erro) {
    mostrarLogin('Não consegui conectar ao servidor. Verifique sua conexão.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnEntrar').addEventListener('click', tentarLogin);
  document.getElementById('senhaAdmin').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tentarLogin();
  });
  document.getElementById('usuarioAdmin').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tentarLogin();
  });

  if (token) {
    mostrarPainel();
  }
});

function inicializarEventos() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => mudarAba(btn.dataset.tab));
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('pipos_admin_token');
    token = null;
    window.location.reload();
  });

  document.getElementById('btnNovoProduto').addEventListener('click', abrirFormulario);
  document.getElementById('btnCancelar').addEventListener('click', fecharFormulario);
  document.getElementById('produto-form').addEventListener('submit', salvarProduto);

  document.getElementById('btnExportar').addEventListener('click', exportarDados);
  document.getElementById('btnImportar').addEventListener('click', () => {
    document.getElementById('fileImport').click();
  });
  document.getElementById('fileImport').addEventListener('change', importarDados);
}

function mudarAba(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('ativo'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));

  document.getElementById(`tab-${tab}`).classList.add('ativo');
  document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('ativo');

  if (tab === 'relatorio') atualizarRelatorio();
}

async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_BASE}/api/produtos`);
    produtos = await resposta.json();
    exibirProdutos();
  } catch (erro) {
    adicionarLog('Erro ao carregar produtos do banco.', 'erro');
  }
}

function abrirFormulario() {
  produtoAtualizar = null;
  document.getElementById('formProduto').style.display = 'block';
  document.getElementById('produto-form').reset();
  document.getElementById('tituloFormulario').textContent = 'Novo Produto';
  document.getElementById('btnNovoProduto').style.display = 'none';
}

function fecharFormulario() {
  document.getElementById('formProduto').style.display = 'none';
  document.getElementById('btnNovoProduto').style.display = 'block';
  document.getElementById('produto-form').reset();
}

async function salvarProduto(e) {
  e.preventDefault();

  const tamanhosSelecionados = Array.from(
    document.querySelectorAll('.tamanho-chk:checked')
  ).map(cb => parseInt(cb.value));

  if (tamanhosSelecionados.length === 0) {
    alert('Selecione pelo menos um tamanho!');
    return;
  }

  const imagens = document.getElementById('imagens').value
    .split(',')
    .map(img => img.trim())
    .filter(img => img);

  if (imagens.length === 0) {
    alert('Adicione pelo menos uma imagem!');
    return;
  }

  const produto = {
    nome: document.getElementById('nome').value,
    marca: document.getElementById('marca').value,
    preco: parseFloat(document.getElementById('preco').value),
    descricao: document.getElementById('descricao').value,
    tamanhos: tamanhosSelecionados,
    imagens
  };

  try {
    let resposta;
    if (produtoAtualizar) {
      resposta = await fetch(`${API_BASE}/api/produtos/${produtoAtualizar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(produto)
      });
    } else {
      resposta = await fetch(`${API_BASE}/api/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(produto)
      });
    }

    if (!resposta.ok) {
      const erroDados = await resposta.json();
      adicionarLog(erroDados.erro || 'Erro ao salvar produto.', 'erro');
      return;
    }

    adicionarLog(produtoAtualizar ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!', 'sucesso');
    await carregarProdutos();
    fecharFormulario();
    mudarAba('produtos');
  } catch (erro) {
    adicionarLog('Erro de conexão ao salvar produto.', 'erro');
  }
}

function exibirProdutos() {
  const tabela = document.getElementById('tabela-corpo');

  if (produtos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2rem;">
          Nenhum produto cadastrado. Clique em "+ Novo Produto" para começar.
        </td>
      </tr>
    `;
    return;
  }

  tabela.innerHTML = produtos.map(produto => `
    <tr>
      <td><strong>${produto.nome}</strong></td>
      <td>${produto.marca}</td>
      <td>${Number(produto.preco) > 0 ? `R$ ${Number(produto.preco).toFixed(2)}` : 'Consulte'}</td>
      <td>${produto.tamanhos.join(', ')}</td>
      <td>${produto.imagens.length} imagem(ns)</td>
      <td>
        <button class="btn-editar" onclick="editarProduto(${produto.id})">Editar</button>
        <button class="btn-deletar" onclick="deletarProduto(${produto.id})">Deletar</button>
      </td>
    </tr>
  `).join('');
}

window.editarProduto = function (id) {
  const produto = produtos.find(p => p.id === id);
  if (!produto) return;

  produtoAtualizar = produto;

  document.getElementById('nome').value = produto.nome;
  document.getElementById('marca').value = produto.marca;
  document.getElementById('preco').value = produto.preco;
  document.getElementById('descricao').value = produto.descricao;
  document.getElementById('imagens').value = produto.imagens.join(', ');

  document.querySelectorAll('.tamanho-chk').forEach(cb => {
    cb.checked = produto.tamanhos.includes(parseInt(cb.value));
  });

  document.getElementById('tituloFormulario').textContent = 'Editar Produto';
  document.getElementById('formProduto').style.display = 'block';
  document.getElementById('btnNovoProduto').style.display = 'none';
};

window.deletarProduto = async function (id) {
  if (!confirm('Tem certeza que deseja deletar este produto?')) return;

  try {
    const resposta = await fetch(`${API_BASE}/api/produtos/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!resposta.ok) {
      adicionarLog('Erro ao deletar produto.', 'erro');
      return;
    }

    adicionarLog('Produto deletado com sucesso!', 'sucesso');
    await carregarProdutos();
  } catch (erro) {
    adicionarLog('Erro de conexão ao deletar produto.', 'erro');
  }
};

function atualizarRelatorio() {
  const totalProdutos = produtos.length;
  const produtosSemPreco = produtos.filter(p => Number(p.preco) === 0).length;
  const produtosComPreco = totalProdutos - produtosSemPreco;
  const valorTotal = produtos.reduce((acc, p) => acc + (Number(p.preco) > 0 ? Number(p.preco) : 0), 0);

  document.getElementById('totalProdutos').textContent = totalProdutos;
  document.getElementById('produtosSemPreco').textContent = produtosSemPreco;
  document.getElementById('produtosComPreco').textContent = produtosComPreco;
  document.getElementById('valorTotal').textContent = `R$ ${valorTotal.toFixed(2)}`;

  const porMarca = {};
  produtos.forEach(p => {
    porMarca[p.marca] = (porMarca[p.marca] || 0) + 1;
  });

  const container = document.getElementById('produtosPorMarca');
  container.innerHTML = Object.entries(porMarca)
    .map(([marca, quantidade]) => `
      <div class="marca-item">
        <strong>${marca}</strong>
        <span>${quantidade} produto(s)</span>
      </div>
    `).join('');
}

function exportarDados() {
  const dados = {
    versao: '2.0',
    data: new Date().toISOString(),
    produtos
  };

  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_pipos_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  adicionarLog(`Backup exportado com ${produtos.length} produtos!`, 'sucesso');
}

async function importarDados(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const dados = JSON.parse(event.target.result);

      if (!Array.isArray(dados.produtos)) {
        throw new Error('Formato de arquivo inválido!');
      }

      let importados = 0;
      for (const p of dados.produtos) {
        const resposta = await fetch(`${API_BASE}/api/produtos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(p)
        });
        if (resposta.ok) importados++;
      }

      await carregarProdutos();
      atualizarRelatorio();
      adicionarLog(`Backup importado: ${importados} de ${dados.produtos.length} produtos.`, 'sucesso');
    } catch (erro) {
      adicionarLog(`Erro ao importar: ${erro.message}`, 'erro');
    }
  };
  reader.readAsText(file);
}

function adicionarLog(mensagem, tipo = 'info') {
  const logContainer = document.getElementById('logBackup');
  const entry = document.createElement('div');
  entry.className = `log-entry ${tipo}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${mensagem}`;
  logContainer.insertBefore(entry, logContainer.firstChild);

  while (logContainer.children.length > 10) {
    logContainer.removeChild(logContainer.lastChild);
  }
}
