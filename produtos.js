// api/produtos.js
const { getPool } = require('./_db');
const { verificarToken } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const pool = getPool();

  // Listar produtos - público, o site da loja usa isso pra montar o catálogo
  if (req.method === 'GET') {
    try {
      const resultado = await pool.query('SELECT * FROM produtos ORDER BY id');
      const linhas = resultado.rows.map(p => ({ ...p, preco: Number(p.preco) }));
      res.status(200).json(linhas);
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
    return;
  }

  // Criar produto - só logado
  if (req.method === 'POST') {
    const sessao = verificarToken(req);
    if (!sessao) {
      res.status(401).json({ erro: 'Não autenticado' });
      return;
    }

    const { nome, marca, preco, descricao, tamanhos, imagens } = req.body || {};
    if (!nome || !marca || !Array.isArray(tamanhos) || !Array.isArray(imagens) || imagens.length === 0) {
      res.status(400).json({ erro: 'Dados incompletos (nome, marca, tamanhos e imagens são obrigatórios)' });
      return;
    }

    try {
      const resultado = await pool.query(
        `INSERT INTO produtos (nome, marca, preco, descricao, tamanhos, imagens)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nome, marca, preco || 0, descricao || '', tamanhos, imagens]
      );
      res.status(201).json({ ...resultado.rows[0], preco: Number(resultado.rows[0].preco) });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao criar produto' });
    }
    return;
  }

  res.status(405).json({ erro: 'Método não permitido' });
};
