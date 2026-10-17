require('./lib/load-env');
const { jsonResponse, onlyDigits } = require('./lib/asaas');
const { getSupabaseAdmin } = require('./lib/supabase');
const {
  BARBERS,
  AVULSO_SERVICES,
  parseExtraIds,
  resolveExtras,
  buildAvulsoPlanName,
  barberNameFor,
  generateSlots,
  getWorkingHours,
  isValidDate,
  loadSettings,
  isLunchSlot,
  findBlock,
} = require('./lib/agenda');

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
    barberName: barberNameFor(row.barber_id, row.barber_name),
    date: row.appointment_date,
    time: row.appointment_time,
    status: row.status,
    attended: Boolean(row.attended),
    attendedAt: row.attended_at || null,
    createdAt: row.created_at,
  };
}

async function handleList(event) {
  const params = event.queryStringParameters || {};
  if (params.action === 'check') {
    return handleCheck(event);
  }
  const barberId = params.barberId || '';
  const status = params.status || 'confirmed';
  const from = params.from || '';
  const to = params.to || '';
  const cpf = onlyDigits(params.cpf || '');

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

  if (cpf) {
    query = query.eq('cpf', cpf);
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

function randomPlaceholderCpf() {
  // Cliente avulso sem CPF informado: gera um identificador único (prefixo 000).
  const digits = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
  return `000${digits}`;
}

function sanitizeAppointmentTarget(source) {
  const barberId = String(source.barberId || '').trim();
  const date = String(source.date || '').trim();
  const time = String(source.time || '').trim();

  if (!BARBERS.some((barber) => barber.id === barberId)) {
    return { error: 'Escolha um barbeiro.' };
  }
  if (!isValidDate(date)) {
    return { error: 'Data inválida.' };
  }
  if (!getWorkingHours(date)) {
    return { error: 'A barbearia não abre neste dia.' };
  }
  if (!generateSlots(date).includes(time)) {
    return { error: 'Horário inválido para este dia.' };
  }

  return { target: { barberId, date, time } };
}

// Quem já ocupa o horário (bloqueia de verdade) e regras que só avisam (dia
// bloqueado / almoço, que o admin pode forçar).
async function findConflicts(supabase, { barberId, date, time, excludeId, cpf }, settings) {
  let occupiedQuery = supabase
    .from('appointments')
    .select('*')
    .eq('barber_id', barberId)
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .eq('status', 'confirmed');
  if (excludeId) occupiedQuery = occupiedQuery.neq('id', excludeId);

  const { data: occupiedRows, error: occupiedError } = await occupiedQuery.limit(1);
  if (occupiedError) throw new Error(occupiedError.message);
  const occupied = occupiedRows && occupiedRows[0] ? occupiedRows[0] : null;

  let sameClient = null;
  if (cpf) {
    let sameQuery = supabase
      .from('appointments')
      .select('*')
      .eq('cpf', cpf)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .eq('status', 'confirmed');
    if (excludeId) sameQuery = sameQuery.neq('id', excludeId);

    const { data: sameRows, error: sameError } = await sameQuery.limit(1);
    if (sameError) throw new Error(sameError.message);
    const found = sameRows && sameRows[0] ? sameRows[0] : null;
    if (found && (!occupied || found.id !== occupied.id)) sameClient = found;
  }

  const block = findBlock(date, settings.blocks);
  const lunch = isLunchSlot(time, settings.lunch);

  return {
    occupied: occupied ? formatAppointment(occupied) : null,
    sameClient: sameClient ? formatAppointment(sameClient) : null,
    block: block ? { reason: block.reason || '' } : null,
    lunch: lunch ? { start: settings.lunch.start, end: settings.lunch.end } : null,
  };
}

function conflictResponse(conflicts, force) {
  if (conflicts.occupied) {
    const item = conflicts.occupied;
    return jsonResponse(409, {
      error: `${item.barberName} já tem ${item.customerName} às ${item.time} neste dia.`,
      conflict: { type: 'occupied', appointment: item },
    });
  }

  if (conflicts.sameClient) {
    const item = conflicts.sameClient;
    return jsonResponse(409, {
      error: `Este cliente já tem horário às ${item.time} neste dia com ${item.barberName}.`,
      conflict: { type: 'sameClient', appointment: item },
    });
  }

  if (!force && conflicts.block) {
    return jsonResponse(409, {
      error: conflicts.block.reason
        ? `Dia bloqueado na agenda (${conflicts.block.reason}).`
        : 'Dia bloqueado na agenda.',
      conflict: { type: 'blocked', canForce: true },
    });
  }

  if (!force && conflicts.lunch) {
    return jsonResponse(409, {
      error: `Horário dentro do almoço (${conflicts.lunch.start}–${conflicts.lunch.end}).`,
      conflict: { type: 'lunch', canForce: true },
    });
  }

  return null;
}

async function handleCheck(event) {
  const params = event.queryStringParameters || {};
  const parsed = sanitizeAppointmentTarget(params);
  if (parsed.error) {
    return jsonResponse(400, { error: parsed.error });
  }

  const supabase = getSupabaseAdmin();
  const settings = await loadSettings(event);
  const conflicts = await findConflicts(
    supabase,
    {
      ...parsed.target,
      excludeId: String(params.excludeId || '').trim(),
      cpf: onlyDigits(params.cpf || ''),
    },
    settings
  );

  return jsonResponse(200, { conflicts });
}

async function handleCreate(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const parsed = sanitizeAppointmentTarget(body);
  if (parsed.error) {
    return jsonResponse(400, { error: parsed.error });
  }
  const { barberId, date, time } = parsed.target;

  const mode = String(body.mode || '').trim();
  const name = String(body.name || '').trim();
  let cpf = onlyDigits(body.cpf);
  let planName = '';

  if (name.length < 2) {
    return jsonResponse(400, { error: 'Informe o nome do cliente.' });
  }

  if (mode === 'subscriber') {
    if (cpf.length !== 11) {
      return jsonResponse(400, { error: 'CPF do assinante inválido.' });
    }
    planName = String(body.planName || '').trim() || 'Assinatura 2k';
  } else if (mode === 'avulso') {
    const service = AVULSO_SERVICES[String(body.serviceId || '').trim()];
    if (!service) {
      return jsonResponse(400, { error: 'Escolha o serviço avulso.' });
    }

    let extras;
    try {
      extras = resolveExtras(parseExtraIds(body));
    } catch (error) {
      return jsonResponse(400, { error: error.message });
    }

    if (cpf && cpf.length !== 11) {
      return jsonResponse(400, { error: 'CPF inválido.' });
    }
    if (!cpf) cpf = randomPlaceholderCpf();
    planName = buildAvulsoPlanName(service, extras);
  } else {
    return jsonResponse(400, { error: 'Escolha se o cliente é assinante ou avulso.' });
  }

  const supabase = getSupabaseAdmin();
  const settings = await loadSettings(event);
  const conflicts = await findConflicts(supabase, { barberId, date, time, cpf }, settings);
  const blocked = conflictResponse(conflicts, body.force === true);
  if (blocked) return blocked;

  const barber = BARBERS.find((item) => item.id === barberId);
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
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonResponse(409, { error: 'Este horário acabou de ser ocupado. Escolha outro.' });
    }
    if (error.code === '42P01') {
      return jsonResponse(500, { error: 'Tabela appointments não existe. Execute supabase/schema.sql.' });
    }
    throw new Error(error.message);
  }

  return jsonResponse(200, { appointment: formatAppointment(data) });
}

async function handleReschedule(event, body, id) {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: findError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!existing) {
    return jsonResponse(404, { error: 'Agendamento não encontrado.' });
  }
  if (existing.status !== 'confirmed') {
    return jsonResponse(400, { error: 'Só é possível remarcar agendamentos confirmados.' });
  }

  const parsed = sanitizeAppointmentTarget({
    barberId: body.barberId || existing.barber_id,
    date: body.date || existing.appointment_date,
    time: body.time || existing.appointment_time,
  });
  if (parsed.error) {
    return jsonResponse(400, { error: parsed.error });
  }
  const { barberId, date, time } = parsed.target;

  if (
    barberId === existing.barber_id
    && date === existing.appointment_date
    && time === existing.appointment_time
  ) {
    return jsonResponse(400, { error: 'Escolha um dia, horário ou barbeiro diferente do atual.' });
  }

  const settings = await loadSettings(event);
  const conflicts = await findConflicts(
    supabase,
    { barberId, date, time, excludeId: id, cpf: existing.cpf },
    settings
  );
  const blocked = conflictResponse(conflicts, body.force === true);
  if (blocked) return blocked;

  const barber = BARBERS.find((item) => item.id === barberId);
  const changes = {
    barber_id: barberId,
    barber_name: barber.name,
    appointment_date: date,
    appointment_time: time,
  };
  if (existing.attended) {
    changes.attended = false;
    changes.attended_at = null;
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(changes)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonResponse(409, { error: 'Este horário acabou de ser ocupado. Escolha outro.' });
    }
    throw new Error(error.message);
  }

  return jsonResponse(200, { appointment: formatAppointment(data) });
}

async function handleUpdate(event) {
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Dados inválidos.' });
  }

  const id = String(body.id || '').trim();
  const hasStatus = body.status !== undefined;
  const hasAttended = body.attended !== undefined;

  if (!id) {
    return jsonResponse(400, { error: 'ID do agendamento obrigatório.' });
  }

  if (body.date !== undefined || body.time !== undefined || body.barberId !== undefined) {
    return handleReschedule(event, body, id);
  }

  const changes = {};

  if (hasStatus) {
    const status = String(body.status || '').trim();
    if (!['confirmed', 'cancelled'].includes(status)) {
      return jsonResponse(400, { error: 'Status inválido.' });
    }
    changes.status = status;
  }

  if (hasAttended) {
    const attended = body.attended === true;
    changes.attended = attended;
    changes.attended_at = attended ? new Date().toISOString() : null;
  }

  if (Object.keys(changes).length === 0) {
    return jsonResponse(400, { error: 'Nada para atualizar.' });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('appointments')
    .update(changes)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    if (error.code === '42703') {
      return jsonResponse(500, { error: 'Colunas de presença não existem. Execute a migração em supabase/schema.sql.' });
    }
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

    if (event.httpMethod === 'POST') {
      return await handleCreate(event);
    }

    if (event.httpMethod === 'PATCH') {
      return await handleUpdate(event);
    }

    return jsonResponse(405, { error: 'Método não permitido.' });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar solicitação.' });
  }
};
