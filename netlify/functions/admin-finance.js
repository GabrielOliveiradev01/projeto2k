require('./lib/load-env');
const { jsonResponse, fetchAllPaginated, parsePlanFromDescription } = require('./lib/asaas');
const { getSupabaseAdmin } = require('./lib/supabase');

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

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDefaultPeriod() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: toIso(first), to: toIso(last) };
}

function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

const PAYMENT_STATUS_LABELS = {
  RECEIVED: 'Recebido',
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  OVERDUE: 'Atrasado',
  REFUNDED: 'Estornado',
};

function parseAvulsoPrice(planName) {
  const match = String(planName || '').match(/Total:\s*R\$\s*([\d.,]+)/i);
  if (!match) return 0;
  return Number(match[1].replace(/\./g, '').replace(',', '.')) || 0;
}

async function getAvulsoAppointments(from, to) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, customer_name, cpf, plan_name, barber_name, appointment_date, appointment_time, status')
    .ilike('plan_name', 'Avulso%')
    .gte('appointment_date', from)
    .lte('appointment_date', to)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      return [];
    }
    throw new Error(error.message);
  }

  return (data || []).map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    cpf: row.cpf,
    planName: row.plan_name,
    barberName: row.barber_name,
    date: row.appointment_date,
    time: row.appointment_time,
    status: row.status,
    price: parseAvulsoPrice(row.plan_name),
  }));
}

function formatPayment(payment, customerMap) {
  const customer = customerMap.get(payment.customer);
  return {
    id: payment.id,
    customerName: customer?.name || '—',
    description: payment.description || '—',
    value: payment.value,
    netValue: payment.netValue,
    status: payment.status,
    statusLabel: PAYMENT_STATUS_LABELS[payment.status] || payment.status,
    dueDate: payment.dueDate || null,
    paymentDate: payment.paymentDate || null,
    billingType: payment.billingType || null,
  };
}

function dedupePayments(payments) {
  const map = new Map();
  for (const payment of payments) {
    map.set(payment.id, payment);
  }
  return [...map.values()];
}

async function getFinanceData(apiKey, from, to) {
  const [
    customers,
    activeSubscriptions,
    receivedPayments,
    confirmedPayments,
    pendingPayments,
    overduePayments,
    avulsoAppointments,
  ] = await Promise.all([
    fetchAllPaginated('/customers', apiKey),
    fetchAllPaginated('/subscriptions?status=ACTIVE', apiKey),
    fetchAllPaginated(`/payments?paymentDate[ge]=${from}&paymentDate[le]=${to}&status=RECEIVED`, apiKey),
    fetchAllPaginated(`/payments?paymentDate[ge]=${from}&paymentDate[le]=${to}&status=CONFIRMED`, apiKey),
    fetchAllPaginated(`/payments?dueDate[ge]=${from}&dueDate[le]=${to}&status=PENDING`, apiKey),
    fetchAllPaginated('/payments?status=OVERDUE', apiKey),
    getAvulsoAppointments(from, to),
  ]);

  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const received = dedupePayments([...receivedPayments, ...confirmedPayments]);

  const subscriptionBreakdown = {};
  for (const subscription of activeSubscriptions) {
    const plan = parsePlanFromDescription(subscription.description);
    const key = plan.planName;
    if (!subscriptionBreakdown[key]) {
      subscriptionBreakdown[key] = {
        planName: key,
        count: 0,
        unitValue: subscription.value,
        monthlyTotal: 0,
      };
    }
    subscriptionBreakdown[key].count += 1;
    subscriptionBreakdown[key].monthlyTotal += Number(subscription.value || 0);
  }

  const confirmedAvulsos = avulsoAppointments.filter((item) => item.status === 'confirmed');
  const mrr = activeSubscriptions.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const receivedTotal = received.reduce((sum, item) => sum + Number(item.netValue ?? item.value ?? 0), 0);
  const pendingTotal = pendingPayments.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const overdueTotal = overduePayments.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const avulsoTotal = confirmedAvulsos.reduce((sum, item) => sum + item.price, 0);

  return {
    summary: {
      mrr,
      activeSubscriptions: activeSubscriptions.length,
      receivedTotal,
      receivedCount: received.length,
      pendingTotal,
      pendingCount: pendingPayments.length,
      overdueTotal,
      overdueCount: overduePayments.length,
      avulsoTotal,
      avulsoCount: confirmedAvulsos.length,
      periodTotal: receivedTotal + avulsoTotal,
    },
    subscriptionBreakdown: Object.values(subscriptionBreakdown)
      .sort((a, b) => b.monthlyTotal - a.monthlyTotal),
    receivedPayments: received
      .map((item) => formatPayment(item, customerMap))
      .sort((a, b) => (b.paymentDate || '').localeCompare(a.paymentDate || '')),
    pendingPayments: pendingPayments
      .map((item) => formatPayment(item, customerMap))
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')),
    overduePayments: overduePayments
      .map((item) => formatPayment(item, customerMap))
      .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')),
    avulsoAppointments,
    period: { from, to },
  };
}

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

  const defaults = getDefaultPeriod();
  const params = event.queryStringParameters || {};
  const from = isValidDate(params.from) ? params.from : defaults.from;
  const to = isValidDate(params.to) ? params.to : defaults.to;

  if (from > to) {
    return jsonResponse(400, { error: 'A data inicial deve ser anterior à data final.' });
  }

  try {
    const data = await getFinanceData(apiKey, from, to);
    return jsonResponse(200, data);
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao carregar dados financeiros.' });
  }
};
