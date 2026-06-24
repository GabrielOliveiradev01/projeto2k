const ASAAS_BASE_URL = 'https://api-sandbox.asaas.com/v3';

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

function getAsaasError(data) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.description).join(' ');
  }
  return 'Erro na comunicação com o Asaas.';
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

function parsePlanFromDescription(description) {
  const text = String(description || '');
  for (const [planId, planName] of Object.entries(PLAN_NAMES)) {
    if (text.includes(planName)) {
      return { planId, planName, type: planId.includes('infinite') ? 'infinite' : 'limited' };
    }
  }
  return { planId: null, planName: 'Assinatura 2k', type: 'unknown' };
}

async function findActiveSubscription(customerId, apiKey) {
  const { response, data } = await asaasRequest(
    `/subscriptions?customer=${customerId}&status=ACTIVE&limit=10`,
    { method: 'GET' },
    apiKey
  );

  if (!response.ok) {
    throw new Error(getAsaasError(data));
  }

  const subscriptions = data.data || [];
  return subscriptions[0] || null;
}

async function getSubscriptionByCpf(cpf, apiKey) {
  const customer = await findCustomerByCpf(cpf, apiKey);
  if (!customer) {
    return { active: false, reason: 'no_customer' };
  }

  const subscription = await findActiveSubscription(customer.id, apiKey);
  if (!subscription) {
    return {
      active: false,
      reason: 'no_subscription',
      customerName: customer.name,
    };
  }

  const plan = parsePlanFromDescription(subscription.description);

  return {
    active: true,
    customerName: customer.name,
    customerEmail: customer.email,
    subscriptionId: subscription.id,
    planId: plan.planId,
    planName: plan.planName,
    planType: plan.type,
  };
}

module.exports = {
  PLAN_NAMES,
  jsonResponse,
  onlyDigits,
  getAsaasError,
  asaasRequest,
  findCustomerByCpf,
  getSubscriptionByCpf,
};
