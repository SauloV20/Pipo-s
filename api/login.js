// api/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ erro: 'Método não permitido' });
    return;
  }

  const { usuario, senha } = req.body || {};
  if (!usuario || !senha) {
    res.status(400).json({ erro: 'Informe usuário e senha' });
    return;
  }

  try {
    const pool = getPool();
    const resultado = await pool.query('SELECT * FROM admins WHERE usuario = $1', [usuario]);
    const admin = resultado.rows[0];

    if (!admin || !(await bcrypt.compare(senha, admin.senha_hash))) {
      res.status(401).json({ erro: 'Usuário ou senha inválidos' });
      return;
    }

    const token = jwt.sign(
      { usuario: admin.usuario, id: admin.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao autenticar' });
  }
};
