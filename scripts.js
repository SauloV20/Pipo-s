// Troque pela URL do seu projeto publicado na Vercel (mesma do admin e do chat)
const API_BASE = 'https://pipo-s.vercel.app';

let catalogo = [];

async function carregarCatalogo() {
  try {
    const resposta = await fetch(`${API_BASE}/api/produtos`);
    catalogo = await resposta.json();
    exibirProdutos(catalogo);
  } catch (erro) {
    document.getElementById('catalogo').innerHTML =
      '<p style="text-align:center; margin:2rem;">Não consegui carregar o catálogo agora. Tente novamente em instantes.</p>';
  }
}

let imagemAtual = 0;
let imagensModal = [];

function formatarPreco(preco) {
  const valor = Number(preco);
  if (!valor || valor <= 0) return "Consulte o preço";
  return `R$ ${valor.toFixed(2)}`;
}

function atualizarImagemModal() {
  const img = document.getElementById("modal-img");
  img.src = imagensModal[imagemAtual];

  document.querySelectorAll(".dot").forEach((dot, i) => {
    dot.classList.toggle("ativo", i === imagemAtual);
  });
}

function proximaImagem() {
  imagemAtual = (imagemAtual + 1) % imagensModal.length;
  atualizarImagemModal();
}

function imagemAnterior() {
  imagemAtual = (imagemAtual - 1 + imagensModal.length) % imagensModal.length;
  atualizarImagemModal();
}

function fecharModal() {
  document.getElementById("modal").classList.remove("ativo");
  document.body.style.overflow = "";
}

function abrirModal(produto) {
  const modal = document.getElementById("modal");
  imagensModal = produto.imagens;
  imagemAtual = 0;

  atualizarImagemModal();

  const setas = document.querySelectorAll(".seta-btn");
  setas.forEach(s => s.style.display = imagensModal.length > 1 ? "flex" : "none");

  document.getElementById("modal-img").alt = produto.nome;
  document.getElementById("modal-nome").textContent = produto.nome;
  document.getElementById("modal-marca").textContent = `Marca: ${produto.marca}`;
  document.getElementById("modal-descricao").textContent = produto.descricao;
  document.getElementById("modal-preco").textContent = formatarPreco(produto.preco);

  // Seleção de tamanhos
  const tamanhoContainer = document.getElementById("modal-tamanhos");
  tamanhoContainer.innerHTML = "";
  produto.tamanhos.forEach(tam => {
    const btn = document.createElement("button");
    btn.textContent = tam;
    btn.classList.add("tamanho-btn");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tamanho-btn").forEach(b => b.classList.remove("selecionado"));
      btn.classList.add("selecionado");
    });
    tamanhoContainer.appendChild(btn);
  });

  // Seleção de gênero
  const paraQuemContainer = document.getElementById("modal-para-quem");
  paraQuemContainer.innerHTML = "";
  ["Masculino", "Feminino", "Infantil"].forEach(opcao => {
    const btn = document.createElement("button");
    btn.textContent = opcao;
    btn.classList.add("tamanho-btn");
    btn.addEventListener("click", () => {
      document.querySelectorAll("#modal-para-quem .tamanho-btn").forEach(b => b.classList.remove("selecionado"));
      btn.classList.add("selecionado");
    });
    paraQuemContainer.appendChild(btn);
  });

  // Botão adicionar ao carrinho
  let btnAdicionar = document.getElementById("btn-adicionar-carrinho");
  if (!btnAdicionar) {
    btnAdicionar = document.createElement("button");
    btnAdicionar.id = "btn-adicionar-carrinho";
    btnAdicionar.textContent = "Adicionar ao carrinho";
    document.getElementById("modal-tamanhos").after(btnAdicionar);
  } else {
    btnAdicionar.textContent = "Adicionar ao carrinho";
  }

  // Remove listeners antigos clonando o botão
  btnAdicionar.replaceWith(btnAdicionar.cloneNode(true));
  btnAdicionar = document.getElementById("btn-adicionar-carrinho");

  btnAdicionar.addEventListener("click", () => {
    const tamanhoSelecionado = document.querySelector(".tamanho-btn.selecionado");
    if (!tamanhoSelecionado) {
      btnAdicionar.textContent = "Selecione um tamanho!";
      setTimeout(() => btnAdicionar.textContent = "Adicionar ao carrinho", 2000);
      return;
    }

    const paraQuemSelecionado = document.querySelector("#modal-para-quem .tamanho-btn.selecionado");

    carrinho.push({
      nome: produto.nome,
      marca: produto.marca,
      preco: produto.preco,
      tamanho: tamanhoSelecionado.textContent,
      paraQuem: paraQuemSelecionado ? paraQuemSelecionado.textContent : "Não informado",
      imagem: produto.imagens[0]
    });

    atualizarCarrinhoUI();

    btnAdicionar.textContent = "Adicionado!";
    setTimeout(() => {
      btnAdicionar.textContent = "Adicionar ao carrinho";
      fecharModal();
      abrirCarrinho();
    }, 800);
  });

  modal.classList.add("ativo");
  document.body.style.overflow = "hidden";
}

function exibirProdutos(produtos) {
  const container = document.getElementById("catalogo");
  container.innerHTML = "";

  if (produtos.length === 0) {
    container.innerHTML = `<p style="text-align:center; font-size:1.2rem; margin: 2rem;">Nenhum produto encontrado.</p>`;
    return;
  }

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${produto.imagens[0]}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>${formatarPreco(produto.preco)}</p>
      <button class="ver-mais-btn">Ver detalhes</button>
    `;
    card.querySelector(".ver-mais-btn").addEventListener("click", () => abrirModal(produto));
    container.appendChild(card);
  });
}

function aplicarFiltros() {
  const marca = document.getElementById("marcaFilter").value;
  const tamanho = document.getElementById("tamanhoFilter").value;
  const genero = document.getElementById("generoFilter").value;

  const filtrados = catalogo.filter(p => {
    return (!marca || p.marca === marca) &&
           (!tamanho || p.tamanhos.includes(Number(tamanho))) &&
           (!genero || p.genero === genero);
  });

  exibirProdutos(filtrados);
}

function limparFiltros() {
  document.getElementById("marcaFilter").value = "";
  document.getElementById("tamanhoFilter").value = "";
  document.getElementById("generoFilter").value = "";
  document.querySelectorAll(".genero-tab").forEach(t => t.classList.remove("ativo"));
  document.querySelector(".genero-tab[data-genero='']").classList.add("ativo");
  exibirProdutos(catalogo);
}

// Carrinho
const WHATSAPP_NUM = "5524992938796";
let carrinho = [];

function abrirCarrinho() {
  document.getElementById("carrinho-painel").classList.add("aberto");
  document.getElementById("carrinho-overlay").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinho-painel").classList.remove("aberto");
  document.getElementById("carrinho-overlay").classList.remove("ativo");
}

function atualizarCarrinhoUI() {
  const container = document.getElementById("carrinho-itens");
  const vazio     = document.getElementById("carrinho-vazio");
  const total     = document.getElementById("carrinho-total");
  const count     = document.getElementById("carrinho-count");
  const finalizar = document.getElementById("carrinho-finalizar");

  count.textContent = carrinho.length;
  count.style.backgroundColor = carrinho.length > 0 ? "#e74c3c" : "var(--accent-color)";

  if (carrinho.length === 0) {
    vazio.style.display = "block";
    finalizar.disabled = true;
    total.textContent = "R$ 0,00";
    container.querySelectorAll(".carrinho-item").forEach(el => el.remove());
    return;
  }

  vazio.style.display = "none";
  finalizar.disabled = false;
  container.querySelectorAll(".carrinho-item").forEach(el => el.remove());

  let totalValor = 0;

  carrinho.forEach((item, index) => {
    if (item.preco > 0) totalValor += item.preco;

    const div = document.createElement("div");
    div.classList.add("carrinho-item");
    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}">
      <div class="carrinho-item-info">
        <div class="carrinho-item-nome">${item.nome}</div>
        <div class="carrinho-item-detalhe">Tamanho: ${item.tamanho} • ${item.marca} • ${item.paraQuem}</div>
      </div>
      <button class="carrinho-item-remover" data-index="${index}" title="Remover">✕</button>
    `;
    container.appendChild(div);
  });

  total.textContent = totalValor > 0 ? `R$ ${totalValor.toFixed(2)}` : "A consultar";

  container.querySelectorAll(".carrinho-item-remover").forEach(btn => {
    btn.addEventListener("click", () => {
      carrinho.splice(Number(btn.dataset.index), 1);
      atualizarCarrinhoUI();
    });
  });
}

function finalizarPedido() {
  if (carrinho.length === 0) return;

  let mensagem = "Olá! Gostaria de fazer um pedido na Pipo's\n\n";
  mensagem += "*Itens do carrinho:*\n";

  carrinho.forEach((item, i) => {
    mensagem += `\n${i + 1}. *${item.nome}*\n`;
    mensagem += `   Tamanho: ${item.tamanho}\n`;
    mensagem += `   Marca: ${item.marca}\n`;
    mensagem += `   Preço: ${item.preco > 0 ? "R$ " + item.preco.toFixed(2) : "A consultar"}\n`;
    mensagem += `   Para: ${item.paraQuem}\n`;
  });

  const total = carrinho.reduce((acc, item) => item.preco > 0 ? acc + item.preco : acc, 0);
  if (total > 0) {
    mensagem += `\n*Total: R$ ${total.toFixed(2)}*\n`;
  }

  mensagem += "\nAguardo confirmação!";

  const url = `https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  carregarCatalogo();

  document.getElementById("aplicarFiltros").addEventListener("click", aplicarFiltros);
  document.getElementById("limparFiltros").addEventListener("click", limparFiltros);
  document.getElementById("fecharModal").addEventListener("click", fecharModal);
  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modal")) fecharModal();
  });
  document.getElementById("btnProxima").addEventListener("click", proximaImagem);
  document.getElementById("btnAnterior").addEventListener("click", imagemAnterior);

  // Tabs de gênero
  document.querySelectorAll(".genero-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".genero-tab").forEach(t => t.classList.remove("ativo"));
      tab.classList.add("ativo");
      document.getElementById("generoFilter").value = tab.dataset.genero;
      aplicarFiltros();
    });
  });

  // Carrinho
  document.getElementById("carrinho-toggle").addEventListener("click", abrirCarrinho);
  document.getElementById("carrinho-fechar").addEventListener("click", fecharCarrinho);
  document.getElementById("carrinho-overlay").addEventListener("click", fecharCarrinho);
  document.getElementById("carrinho-finalizar").addEventListener("click", finalizarPedido);
  atualizarCarrinhoUI();
});

