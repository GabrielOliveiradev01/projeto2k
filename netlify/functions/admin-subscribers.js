require('./lib/load-env');
const { jsonResponse, listAdminSubscribers } = require('./lib/asaas');

function getAdminSecret() {
  return process.env.ADMIN_PASSWORD || '';
}

function isAuthorized(event) {
  const secret = getAdminSecret();
  if (!secret) return false;

  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token === secret;
}

function unauthorized() {
  return jsonResponse(401, { error: 'Não autorizado.' });
}

const STATUS_LABELS = {
  ACTIVE: 'Ativa',
  EXPIRED: 'Expirada',
  INACTIVE: 'Inativa',
  CANCELLED: 'Cancelada',
  NONE: 'Sem assinatura',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  if (!isAuthorized(event)) {
    return unauthorized();
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'Chave do Asaas não configurada.' });
  }

  try {
    const subscribers = await listAdminSubscribers(apiKey);
    const params = event.queryStringParameters || {};
    const statusFilter = params.status || 'all';

    const filtered = statusFilter === 'all'
      ? subscribers
      : subscribers.filter((item) => item.status === statusFilter);

    const stats = {
      total: subscribers.length,
      active: subscribers.filter((item) => item.status === 'ACTIVE').length,
      inactive: subscribers.filter((item) => ['INACTIVE', 'EXPIRED', 'CANCELLED'].includes(item.status)).length,
      none: subscribers.filter((item) => item.status === 'NONE').length,
    };

    return jsonResponse(200, {
      subscribers: filtered.map((item) => ({
        ...item,
        statusLabel: STATUS_LABELS[item.status] || item.status,
      })),
      stats,
    });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao listar assinantes.' });
  }
};
