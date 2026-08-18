// Senha padrão - MUDE ISSO EM PRODUÇÃO!
const SENHA_ADMIN = '1234';
let isAuthenticated = localStorage.getItem('pipos_admin_auth') === 'true';
let produtoAtualizar = null;

// AUTENTICAÇÃO
if (!isAuthenticated) {
  document.body.innerHTML = '<div id="modalAuth" class="modal-auth" style="display: flex;"><div class="auth-box"><h2>Acesso Administrativo</h2><p>Digite a senha para acessar o painel administrativo</p><input type="password" id="senhaAdmin" placeholder="Senha"><button id="btnEntrar" class="btn-primario">Entrar</button><p id="mensagemErro" style="color: #e74c3c; display: none;"></p></div></div>';
  
  document.getElementById('btnEntrar').addEventListener('click', () => {
    const senha = document.getElementById('senhaAdmin').value;
    const mensagem = document.getElementById('mensagemErro');
    
    if (senha === SENHA_ADMIN) {
      localStorage.setItem('pipos_admin_auth', 'true');
      window.location.reload();
    } else {
      mensagem.textContent = 'Senha incorreta!';
      mensagem.style.display = 'block';
    }
  });
  
  document.getElementById('senhaAdmin').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnEntrar').click();
    }
  });
} else {
  // CARREGAR DADOS SALVOS
  let produtos = JSON.parse(localStorage.getItem('pipos_produtos')) || [];

  // EVENT LISTENERS
  document.addEventListener('DOMContentLoaded', () => {
    inicializarEventos();
    exibirProdutos();
  });

  function inicializarEventos() {
    // Navegação de abas
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        mudarAba(tab);
      });
    });

    // Logout
    document.getElementById('btnLogout').addEventListener('click', () => {
      localStorage.removeItem('pipos_admin_auth');
      window.location.reload();
    });

    // Formulário de produto
    document.getElementById('btnNovoProduto').addEventListener('click', abrirFormulario);
    document.getElementById('btnCancelar').addEventListener('click', fecharFormulario);
    document.getElementById('produto-form').addEventListener('submit', salvarProduto);

    // Backup
    document.getElementById('btnExportar').addEventListener('click', exportarDados);
    document.getElementById('btnImportar').addEventListener('click', () => {
      document.getElementById('fileImport').click();
    });
    document.getElementById('fileImport').addEventListener('change', importarDados);

    atualizarRelatorio();
  }

  function mudarAba(tab) {
    // Remover class ativo de todas as abas
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('ativo'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));

    // Adicionar class ativo na aba selecionada
    document.getElementById(`tab-${tab}`).classList.add('ativo');
    document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('ativo');

    // Atualizar relatório ao mudar para essa aba
    if (tab === 'relatorio') {
      atualizarRelatorio();
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

  function salvarProduto(e) {
    e.preventDefault();

    const tamanhosSelecionados = Array.from(
      document.querySelectorAll('.tamanho-chk:checked')
    ).map(cb => parseInt(cb.value));

    if (tamanhosSelecionados.length === 0) {
      alert('Selecione pelo menos um tamanho!');
      return;
    }

    const produto = {
      id: produtoAtualizar?.id || Date.now(),
      nome: document.getElementById('nome').value,
      marca: document.getElementById('marca').value,
      preco: parseFloat(document.getElementById('preco').value),
      descricao: document.getElementById('descricao').value,
      tamanhos: tamanhosSelecionados,
      imagens: document.getElementById('imagens').value
        .split(','
        .map(img => img.trim())
        .filter(img => img)
    };

    if (produto.imagens.length === 0) {
      alert('Adicione pelo menos uma imagem!');
      return;
    }

    if (produtoAtualizar) {
      // Atualizar produto existente
      const index = produtos.findIndex(p => p.id === produtoAtualizar.id);
      produtos[index] = produto;
      adicionarLog('Produto atualizado com sucesso!', 'sucesso');
    } else {
      // Adicionar novo produto
      produtos.push(produto);
      adicionarLog('Produto adicionado com sucesso!', 'sucesso');
    }

    localStorage.setItem('pipos_produtos', JSON.stringify(produtos));
    exibirProdutos();
    fecharFormulario();
    mudarAba('produtos');
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
        <td>${produto.preco > 0 ? `R$ ${produto.preco.toFixed(2)}` : 'Consulte'}</td>
        <td>${produto.tamanhos.join(', ')}</td>
        <td>${produto.imagens.length} imagem(ns)</td>
        <td>
          <button class="btn-editar" onclick="editarProduto(${produto.id})">Editar</button>
          <button class="btn-deletar" onclick="deletarProduto(${produto.id})">Deletar</button>
        </td>
      </tr>
    `).join('');
  }

  window.editarProduto = function(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    produtoAtualizar = produto;

    document.getElementById('nome').value = produto.nome;
    document.getElementById('marca').value = produto.marca;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('imagens').value = produto.imagens.join(', ');

    // Marcar tamanhos selecionados
    document.querySelectorAll('.tamanho-chk').forEach(cb => {
      cb.checked = produto.tamanhos.includes(parseInt(cb.value));
    });

    document.getElementById('tituloFormulario').textContent = 'Editar Produto';
    document.getElementById('formProduto').style.display = 'block';
    document.getElementById('btnNovoProduto').style.display = 'none';
  };

  window.deletarProduto = function(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      produtos = produtos.filter(p => p.id !== id);
      localStorage.setItem('pipos_produtos', JSON.stringify(produtos));
      exibirProdutos();
      adicionarLog('Produto deletado com sucesso!', 'sucesso');
    }
  };

  function atualizarRelatorio() {
    const totalProdutos = produtos.length;
    const produtosSemPreco = produtos.filter(p => p.preco === 0).length;
    const produtosComPreco = totalProdutos - produtosSemPreco;
    const valorTotal = produtos.reduce((acc, p) => acc + (p.preco > 0 ? p.preco : 0), 0);

    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('produtosSemPreco').textContent = produtosSemPreco;
    document.getElementById('produtosComPreco').textContent = produtosComPreco;
    document.getElementById('valorTotal').textContent = `R$ ${valorTotal.toFixed(2)}`;

    // Produtos por marca
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
      versao: '1.0',
      data: new Date().toISOString(),
      produtos: produtos
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

  function importarDados(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dados = JSON.parse(event.target.result);
        
        if (!Array.isArray(dados.produtos)) {
          throw new Error('Formato de arquivo inválido!');
        }

        produtos = dados.produtos;
        localStorage.setItem('pipos_produtos', JSON.stringify(produtos));
        exibirProdutos();
        atualizarRelatorio();
        adicionarLog(`Backup importado com ${produtos.length} produtos!`, 'sucesso');
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

    // Manter apenas os últimos 10 logs
    while (logContainer.children.length > 10) {
      logContainer.removeChild(logContainer.lastChild);
    }
  }
}
