
const catalogo = [
  {
    nome: "Tênis Nike Air Max",
    preco: 399.90,
    imagem: "https://via.placeholder.com/200",
    marca: "Nike",
    tamanho: 42,
    genero: "masculino"
  },
  {
    nome: "Tênis Adidas Ultraboost",
    preco: 499.90,
    imagem: "https://via.placeholder.com/200",
    marca: "Adidas",
    tamanho: 38,
    genero: "feminino"
  },
  {
    nome: "Tênis Infantil Puma",
    preco: 199.90,
    imagem: "https://via.placeholder.com/200",
    marca: "Puma",
    tamanho: 30,
    genero: "infantil"
  }
];

function exibirProdutos(produtos) {
  const container = document.getElementById("catalogo");
  container.innerHTML = "";
  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
    `;
    container.appendChild(card);
  });
}

function aplicarFiltros() {
  const marca = document.getElementById("marcaFilter").value;
  const tamanho = document.getElementById("tamanhoFilter").value;
  const genero = document.getElementById("generoFilter").value;

  const filtrados = catalogo.filter(p => {
    return (!marca || p.marca === marca) &&
           (!tamanho || p.tamanho == tamanho) &&
           (!genero || p.genero === genero);
  });

  exibirProdutos(filtrados);
}

document.addEventListener("DOMContentLoaded", () => {
  exibirProdutos(catalogo);
  document.getElementById("aplicarFiltros").addEventListener("click", aplicarFiltros);
});
