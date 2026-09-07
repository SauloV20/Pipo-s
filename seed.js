// api/seed.js
// Rode isso UMA VEZ visitando /api/seed?chave=SUA_SEED_SECRET no navegador.
// Cria as tabelas (se não existirem), o usuário admin e importa produtos.json
// (o catálogo que você já tinha) — só insere se as tabelas estiverem vazias,
// então é seguro visitar de novo por engano.
const bcrypt = require('bcryptjs');
const { getPool } = require('./_db');
const produtosIniciais = require('../produtos.json');

module.exports = async function handler(req, res) {
  if (req.query.chave !== process.env.SEED_SECRET) {
    res.status(403).json({ erro: 'Chave inválida' });
    return;
  }

  const pool = getPool();
  const log = [];

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        usuario TEXT UNIQUE NOT NULL,
        senha_hash TEXT NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        marca TEXT NOT NULL,
        preco NUMERIC(10,2) NOT NULL DEFAULT 0,
        descricao TEXT,
        tamanhos INTEGER[] NOT NULL DEFAULT '{}',
        imagens TEXT[] NOT NULL DEFAULT '{}'
      );
    `);
    log.push('Tabelas conferidas/criadas.');

    const admins = await pool.query('SELECT COUNT(*) FROM admins');
    if (Number(admins.rows[0].count) === 0) {
      const usuario = process.env.ADMIN_USER || 'admin';
      const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'trocar123', 10);
      await pool.query('INSERT INTO admins (usuario, senha_hash) VALUES ($1, $2)', [usuario, hash]);
      log.push(`Usuário admin "${usuario}" criado.`);
    } else {
      log.push('Já existe admin cadastrado, não mexi nisso.');
    }

    const produtos = await pool.query('SELECT COUNT(*) FROM produtos');
    if (Number(produtos.rows[0].count) === 0) {
      for (const p of produtosIniciais) {
        await pool.query(
          `INSERT INTO produtos (nome, marca, preco, descricao, tamanhos, imagens)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [p.nome, p.marca || '', p.preco || 0, p.descricao || '', p.tamanhos || [], p.imagens || []]
        );
      }
      log.push(`${produtosIniciais.length} produtos importados do produtos.json.`);
    } else {
      log.push('Já existem produtos cadastrados, não importei de novo.');
    }

    res.status(200).json({ ok: true, log });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao rodar o seed', detalhe: String(erro) });
  }
};
