// api/produtos/[id].js
const { getPool } = require('../_db');
const { verificarToken } = require('../_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const sessao = verificarToken(req);
  if (!sessao) {
    res.status(401).json({ erro: 'Não autenticado' });
    return;
  }

  const { id } = req.query;
  const pool = getPool();

  if (req.method === 'PUT') {
    const { nome, marca, preco, descricao, tamanhos, imagens } = req.body || {};
    try {
      const resultado = await pool.query(
        `UPDATE produtos SET nome=$1, marca=$2, preco=$3, descricao=$4, tamanhos=$5, imagens=$6
         WHERE id=$7 RETURNING *`,
        [nome, marca, preco || 0, descricao || '', tamanhos, imagens, id]
      );
      if (resultado.rows.length === 0) {
        res.status(404).json({ erro: 'Produto não encontrado' });
        return;
      }
      res.status(200).json({ ...resultado.rows[0], preco: Number(resultado.rows[0].preco) });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM produtos WHERE id=$1', [id]);
      res.status(200).json({ ok: true });
    } catch (erro) {
      console.error(erro);
      res.status(500).json({ erro: 'Erro ao deletar produto' });
    }
    return;
  }

  res.status(405).json({ erro: 'Método não permitido' });
};
