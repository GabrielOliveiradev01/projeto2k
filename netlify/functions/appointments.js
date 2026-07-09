const { jsonResponse, onlyDigits, getSubscriptionByCpf } = require('./lib/asaas');
const { getSupabaseAdmin } = require('./lib/supabase');

const BARBERS = [
  { id: 'gemeo-1', name: 'Gêmeo 1' },
  { id: 'gemeo-2', name: 'Gêmeo 2' },
];

const WORK_START = 9;
const WORK_END = 18;
const SLOT_MINUTES = 40;
const MAX_DAYS_AHEAD = 30;
const LIMITED_MONTHLY_VISITS = 4;

const AVULSO_SERVICES = {
  corte: { name: 'Corte', label: 'Corte — R$ 50,00', price: 50 },
  barba: { name: 'Barba', label: 'Barba — R$ 55,00', price: 55 },
  'corte-barba': { name: 'Corte + Barba', label: 'Corte + Barba — R$ 85,00', price: 85 },
};

const EXTRA_SERVICES = {
  sobrancelha: { name: 'Sobrancelha', price: 10 },
  hidratacao: { name: 'Hidratação', price: 25 },
  'limpeza-pele': { name: 'Limpeza de pele', price: 40 },
  'dep-cera-nariz': { name: 'Dep. cera nariz', price: 15 },
  'dep-cera-ouvido': { name: 'Dep. cera ouvido', price: 15 },
  'combo-cera': { name: 'Combo cera', price: 20 },
};

function parseExtraIds(body) {
  const raw = body.extras;
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.map((id) => String(id || '').trim()).filter(Boolean))];
}

function resolveExtras(extraIds) {
  return extraIds.map((id) => {
    const extra = EXTRA_SERVICES[id];
    if (!extra) {
      throw new Error(`Serviço extra inválido: ${id}`);
    }
    return { id, ...extra };
  });
}

function buildAvulsoPlanName(service, extras) {
  const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
  const total = service.price + extrasTotal;
  const extrasLabel = extras.length
    ? ` + ${extras.map((item) => item.name).join(', ')}`
    : '';
  const totalLabel = total.toFixed(2).replace('.', ',');
  return `Avulso — ${service.name}${extrasLabel} (Total: R$ ${totalLabel})`;
}

function generateSlotsForDate() {
  const slots = [];
  let totalMinutes = WORK_START * 60;
  const endMinutes = WORK_END * 60;

  while (totalMinutes + SLOT_MINUTES <= endMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    totalMinutes += SLOT_MINUTES;
  }

  return slots;
}

function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(`${dateStr}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

function isSlotInPast(dateStr, time) {
  const slotDate = new Date(`${dateStr}T${time}:00`);
  const minTime = new Date(Date.now() + 60 * 60 * 1000);
  return slotDate < minTime;
}

function getMonthRange(dateStr) {
  const [year, month] = dateStr.split('-');
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

async function getBookedTimes(barberId, date) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('barber_id', barberId)
    .eq('appointment_date', date)
    .eq('status', 'confirmed');

  if (error) {
    if (error.code === '42P01') {
      throw new Error('Tabela appointments não existe. Execute supabase/schema.sql no Supabase.');
    }
    throw new Error(error.message);
  }

  return new Set((data || []).map((row) => row.appointment_time));
}

async function countMonthlyVisits(cpf, dateStr) {
  const { start, end } = getMonthRange(dateStr);
  const supabase = getSupabaseAdmin();

  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('cpf', cpf)
    .eq('status', 'confirmed')
    .gte('appointment_date', start)
    .lte('appointment_date', end);

  if (error) throw new Error(error.message);
  return count || 0;
}

async function handleGetAvailability(event) {
  const params = event.queryStringParameters || {};
  const barberId = params.barberId;
  const date = params.date;

  if (!barberId || !BARBERS.some((barber) => barber.id === barberId)) {
    return jsonResponse(400, { error: 'Barbeiro inválido.' });
  }

  if (!date || !isValidDate(date)) {
    return jsonResponse(400, { error: 'Data inválida.' });
  }

  const bookedTimes = await getBookedTimes(barberId, date);
  const slots = generateSlotsForDate()
    .filter((time) => !bookedTimes.has(time))
    .filter((time) => !isSlotInPast(date, time));

  return jsonResponse(200, { date, barberId, slots });
}

async function handleCreateAvulsoAppointment(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const cpf = onlyDigits(body.cpf);
  const name = String(body.name || '').trim();
  const phone = onlyDigits(body.phone);
  const serviceId = String(body.serviceId || '').trim();
  const barberId = String(body.barberId || '').trim();
  const date = String(body.date || '').trim();
  const time = String(body.time || '').trim();
  const service = AVULSO_SERVICES[serviceId];
  let extras = [];

  try {
    extras = resolveExtras(parseExtraIds(body));
  } catch (error) {
    return jsonResponse(400, { error: error.message });
  }

  const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = service ? service.price + extrasTotal : 0;

  if (cpf.length !== 11) {
    return jsonResponse(400, { error: 'CPF inválido.' });
  }

  if (!name || name.length < 3) {
    return jsonResponse(400, { error: 'Informe seu nome completo.' });
  }

  if (phone.length < 10) {
    return jsonResponse(400, { error: 'Informe um telefone válido.' });
  }

  if (!service) {
    return jsonResponse(400, { error: 'Escolha um serviço avulso.' });
  }

  if (!BARBERS.some((barber) => barber.id === barberId)) {
    return jsonResponse(400, { error: 'Escolha um barbeiro.' });
  }

  if (!isValidDate(date)) {
    return jsonResponse(400, { error: 'Data inválida.' });
  }

  const validSlots = generateSlotsForDate();
  if (!validSlots.includes(time)) {
    return jsonResponse(400, { error: 'Horário inválido.' });
  }

  if (isSlotInPast(date, time)) {
    return jsonResponse(400, { error: 'Este horário já passou.' });
  }

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
  if (new Date(`${date}T12:00:00`) > maxDate) {
    return jsonResponse(400, { error: 'Agendamento permitido apenas nos próximos 30 dias.' });
  }

  const bookedTimes = await getBookedTimes(barberId, date);
  if (bookedTimes.has(time)) {
    return jsonResponse(409, { error: 'Este horário acabou de ser reservado. Escolha outro.' });
  }

  const barber = BARBERS.find((item) => item.id === barberId);
  const supabase = getSupabaseAdmin();
  const planName = buildAvulsoPlanName(service, extras);

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      cpf,
      customer_name: name,
      plan_name: planName,
      barber_id: barberId,
      barber_name: barber.name,
      appointment_date: date,
      appointment_time: time,
      status: 'confirmed',
    })
    .select('id, barber_name, appointment_date, appointment_time, plan_name')
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonResponse(409, { error: 'Este horário acabou de ser reservado. Escolha outro.' });
    }
    if (error.code === '42P01') {
      return jsonResponse(500, { error: 'Tabela appointments não existe. Execute supabase/schema.sql no Supabase.' });
    }
    throw new Error(error.message);
  }

  return jsonResponse(200, {
    success: true,
    appointment: {
      id: data.id,
      barberName: data.barber_name,
      date: data.appointment_date,
      time: data.appointment_time,
      planName: data.plan_name,
      serviceName: service.name,
      price: totalPrice,
      extras: extras.map((item) => ({ id: item.id, name: item.name, price: item.price })),
      bookingType: 'avulso',
    },
  });
}

async function handleCreateAppointment(event, apiKey) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const cpf = onlyDigits(body.cpf);
  const barberId = String(body.barberId || '').trim();
  const date = String(body.date || '').trim();
  const time = String(body.time || '').trim();

  if (cpf.length !== 11) {
    return jsonResponse(400, { error: 'CPF inválido.' });
  }

  if (!BARBERS.some((barber) => barber.id === barberId)) {
    return jsonResponse(400, { error: 'Escolha um barbeiro.' });
  }

  if (!isValidDate(date)) {
    return jsonResponse(400, { error: 'Data inválida.' });
  }

  const validSlots = generateSlotsForDate();
  if (!validSlots.includes(time)) {
    return jsonResponse(400, { error: 'Horário inválido.' });
  }

  if (isSlotInPast(date, time)) {
    return jsonResponse(400, { error: 'Este horário já passou.' });
  }

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
  if (new Date(`${date}T12:00:00`) > maxDate) {
    return jsonResponse(400, { error: 'Agendamento permitido apenas nos próximos 30 dias.' });
  }

  const subscription = await getSubscriptionByCpf(cpf, apiKey);
  if (!subscription.active) {
    return jsonResponse(403, { error: 'Assinatura ativa necessária para agendar.' });
  }

  if (subscription.planType === 'limited') {
    const visits = await countMonthlyVisits(cpf, date);
    if (visits >= LIMITED_MONTHLY_VISITS) {
      return jsonResponse(403, {
        error: `Limite de ${LIMITED_MONTHLY_VISITS} visitas/mês atingido no seu plano Limited.`,
      });
    }
  }

  const bookedTimes = await getBookedTimes(barberId, date);
  if (bookedTimes.has(time)) {
    return jsonResponse(409, { error: 'Este horário acabou de ser reservado. Escolha outro.' });
  }

  const barber = BARBERS.find((item) => item.id === barberId);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      cpf,
      customer_name: subscription.customerName,
      plan_name: subscription.planName,
      barber_id: barberId,
      barber_name: barber.name,
      appointment_date: date,
      appointment_time: time,
      status: 'confirmed',
    })
    .select('id, barber_name, appointment_date, appointment_time, plan_name')
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonResponse(409, { error: 'Este horário acabou de ser reservado. Escolha outro.' });
    }
    if (error.code === '42P01') {
      return jsonResponse(500, { error: 'Tabela appointments não existe. Execute supabase/schema.sql no Supabase.' });
    }
    throw new Error(error.message);
  }

  return jsonResponse(200, {
    success: true,
    appointment: {
      id: data.id,
      barberName: data.barber_name,
      date: data.appointment_date,
      time: data.appointment_time,
      planName: data.plan_name,
      bookingType: 'subscription',
    },
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  try {
    if (event.httpMethod === 'GET') {
      return await handleGetAvailability(event);
    }

    if (event.httpMethod === 'POST') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch {
        return jsonResponse(400, { error: 'Dados inválidos.' });
      }

      if (body.bookingType === 'avulso') {
        return await handleCreateAvulsoAppointment(event);
      }

      const apiKey = process.env.ASAAS_API_KEY;
      if (!apiKey) {
        return jsonResponse(500, { error: 'Chave do Asaas não configurada.' });
      }

      return await handleCreateAppointment(event, apiKey);
    }

    return jsonResponse(405, { error: 'Método não permitido.' });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar agendamento.' });
  }
};
