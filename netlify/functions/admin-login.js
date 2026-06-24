require('./lib/load-env');
const { jsonResponse } = require('./lib/asaas');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const password = String(body.password || '');
  const secret = process.env.ADMIN_PASSWORD || '';

  if (!secret) {
    return jsonResponse(500, { error: 'ADMIN_PASSWORD não configurada no servidor.' });
  }

  if (password !== secret) {
    return jsonResponse(401, { error: 'Senha incorreta.' });
  }

  return jsonResponse(200, { ok: true });
};
