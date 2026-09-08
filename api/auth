// api/_auth.js
// Verifica o token JWT enviado no cabeçalho Authorization: Bearer <token>
const jwt = require('jsonwebtoken');

function verificarToken(req) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { verificarToken };
