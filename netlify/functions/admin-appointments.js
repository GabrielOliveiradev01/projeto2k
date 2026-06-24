require('./lib/load-env');
const { jsonResponse } = require('./lib/asaas');
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

function formatAppointment(row) {
  return {
    id: row.id,
    cpf: row.cpf,
    customerName: row.customer_name,
    planName: row.plan_name,
    barberId: row.barber_id,
    barberName: row.barber_name,
    date: row.appointment_date,
    time: row.appointment_time,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function handleList(event) {
  const params = event.queryStringParameters || {};
  const barberId = params.barberId || '';
  const status = params.status || 'confirmed';
  const from = params.from || '';
  const to = params.to || '';

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (barberId) {
    query = query.eq('barber_id', barberId);
  }

  if (from) {
    query = query.gte('appointment_date', from);
  }

  if (to) {
    query = query.lte('appointment_date', to);
  }

  const { data, error } = await query;

  if (error) {
    if (error.code === '42P01') {
      return jsonResponse(500, { error: 'Tabela appointments não existe. Execute supabase/schema.sql.' });
    }
    throw new Error(error.message);
  }

  return jsonResponse(200, {
    appointments: (data || []).map(formatAppointment),
  });
}

async function handleUpdate(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim();

  if (!id) {
    return jsonResponse(400, { error: 'ID do agendamento obrigatório.' });
  }

  if (!['confirmed', 'cancelled'].includes(status)) {
    return jsonResponse(400, { error: 'Status inválido.' });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return jsonResponse(404, { error: 'Agendamento não encontrado.' });
  }

  return jsonResponse(200, { appointment: formatAppointment(data) });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (!isAuthorized(event)) {
    return unauthorized();
  }

  try {
    if (event.httpMethod === 'GET') {
      return await handleList(event);
    }

    if (event.httpMethod === 'PATCH') {
      return await handleUpdate(event);
    }

    return jsonResponse(405, { error: 'Método não permitido.' });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar solicitação.' });
  }
};
