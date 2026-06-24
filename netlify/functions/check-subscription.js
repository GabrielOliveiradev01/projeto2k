const { jsonResponse, onlyDigits, getSubscriptionByCpf } = require('./lib/asaas');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'Chave do Asaas não configurada.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const cpf = onlyDigits(body.cpf);
  if (cpf.length !== 11) {
    return jsonResponse(400, { error: 'Informe um CPF válido.' });
  }

  try {
    const result = await getSubscriptionByCpf(cpf, apiKey);

    if (!result.active) {
      const messages = {
        no_customer: 'CPF não encontrado. Assine um plano para agendar online.',
        no_subscription: 'Nenhuma assinatura ativa encontrada para este CPF.',
      };

      return jsonResponse(200, {
        active: false,
        reason: result.reason,
        message: messages[result.reason] || 'Assinatura inativa.',
        customerName: result.customerName || null,
      });
    }

    return jsonResponse(200, {
      active: true,
      customerName: result.customerName,
      planName: result.planName,
      planType: result.planType,
    });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao verificar assinatura.' });
  }
};
