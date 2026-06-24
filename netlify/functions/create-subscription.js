const ASAAS_BASE_URL = 'https://api-sandbox.asaas.com/v3';

const PLAN_VALUES = {
  'cuts-limited': 89.9,
  'barb-limited': 119.9,
  'duos-limited': 179.9,
  'cuts-infinite': 99.9,
  'barb-infinite': 129.9,
  'duos-infinite': 199.9,
};

const PLAN_NAMES = {
  'cuts-limited': 'Cuts Limited',
  'barb-limited': 'Barb Limited',
  'duos-limited': 'Duos Limited',
  'cuts-infinite': 'Cuts Infinite',
  'barb-infinite': 'Barb Infinite',
  'duos-infinite': 'Duos Infinite',
};

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getAsaasError(data) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.description).join(' ');
  }
  return 'Não foi possível concluir a assinatura.';
}

async function asaasRequest(path, options, apiKey) {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey,
      'User-Agent': '2k-Barbearia/1.0.0',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function findCustomerByCpf(cpf, apiKey) {
  const { response, data } = await asaasRequest(
    `/customers?cpfCnpj=${cpf}&limit=1`,
    { method: 'GET' },
    apiKey
  );

  if (!response.ok) {
    throw new Error(getAsaasError(data));
  }

  return data.data?.[0] || null;
}

async function createCustomer(payload, apiKey) {
  const { response, data } = await asaasRequest(
    '/customers',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    apiKey
  );

  if (!response.ok) {
    throw new Error(getAsaasError(data));
  }

  return data;
}

async function createSubscription(payload, apiKey) {
  const { response, data } = await asaasRequest(
    '/subscriptions',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    apiKey
  );

  if (!response.ok) {
    throw new Error(getAsaasError(data));
  }

  return data;
}

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

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const cpf = onlyDigits(body.cpf);
  const phone = onlyDigits(body.phone);
  const planId = String(body.planId || '').trim();
  const cardHolderName = String(body.cardHolderName || '').trim();
  const cardNumber = onlyDigits(body.cardNumber);
  const expiryMonth = String(body.expiryMonth || '').padStart(2, '0');
  const expiryYear = String(body.expiryYear || '');
  const cvv = onlyDigits(body.cvv);

  if (!name || !email || cpf.length !== 11 || phone.length < 10) {
    return jsonResponse(400, { error: 'Preencha nome, CPF, e-mail e telefone válidos.' });
  }

  if (!PLAN_VALUES[planId]) {
    return jsonResponse(400, { error: 'Plano inválido.' });
  }

  if (!cardHolderName || cardNumber.length < 13 || !expiryMonth || !expiryYear || cvv.length < 3) {
    return jsonResponse(400, { error: 'Dados do cartão incompletos.' });
  }

  try {
    let customer = await findCustomerByCpf(cpf, apiKey);

    if (!customer) {
      customer = await createCustomer(
        {
          name,
          cpfCnpj: cpf,
          email,
          mobilePhone: phone,
          externalReference: cpf,
        },
        apiKey
      );
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await createSubscription(
      {
        customer: customer.id,
        billingType: 'CREDIT_CARD',
        cycle: 'MONTHLY',
        creditCard: {
          holderName: cardHolderName,
          number: cardNumber,
          expiryMonth,
          expiryYear,
          ccv: cvv,
        },
        creditCardHolderInfo: {
          name,
          email,
          cpfCnpj: cpf,
          postalCode: '00000000',
          addressNumber: '000',
          phone,
        },
        value: PLAN_VALUES[planId],
        nextDueDate: formatDate(today),
        description: `Assinatura 2k - Barbearia - ${PLAN_NAMES[planId]}`,
        endDate: formatDate(endDate),
        maxPayments: 12,
        externalReference: cpf,
      },
      apiKey
    );

    return jsonResponse(200, {
      success: true,
      customerId: customer.id,
      subscriptionId: subscription.id,
      plan: PLAN_NAMES[planId],
    });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar assinatura.' });
  }
};
