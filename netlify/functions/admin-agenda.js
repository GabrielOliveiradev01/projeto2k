require('./lib/load-env');
const { jsonResponse } = require('./lib/asaas');
const { getSupabaseAdmin } = require('./lib/supabase');
const {
  BARBERS,
  AVULSO_SERVICES,
  EXTRA_SERVICES,
  barberNameFor,
  generateSlots,
  MAX_BLOCK_DAYS,
  loadSettings,
  saveSettings,
  isValidDate,
  isValidTime,
  toMinutes,
  daysBetween,
} = require('./lib/agenda');

function isAuthorized(event) {
  const secret = process.env.ADMIN_PASSWORD || '';
  if (!secret) return false;

  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return token === secret;
}

function buildCatalog() {
  const toList = (map) => Object.entries(map).map(([id, item]) => ({ id, name: item.name, price: item.price }));
  return {
    barbers: BARBERS,
    slots: generateSlots(),
    services: toList(AVULSO_SERVICES),
    extras: toList(EXTRA_SERVICES),
  };
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || '{}');
  } catch {
    return null;
  }
}

async function handleSaveLunch(event, body) {
  const lunch = body.lunch || {};
  const enabled = lunch.enabled === true;
  const start = String(lunch.start || '');
  const end = String(lunch.end || '');

  if (!isValidTime(start) || !isValidTime(end)) {
    return jsonResponse(400, { error: 'Informe o início e o fim do almoço (HH:MM).' });
  }

  if (toMinutes(start) >= toMinutes(end)) {
    return jsonResponse(400, { error: 'O fim do almoço precisa ser depois do início.' });
  }

  const settings = await loadSettings(event, { strict: true });
  settings.lunch = { enabled, start, end };
  await saveSettings(event, settings);
  return jsonResponse(200, { settings });
}

async function handleAddBlock(event, body) {
  const from = String(body.from || '').trim();
  const to = String(body.to || body.from || '').trim();
  const reason = String(body.reason || '').trim().slice(0, 120);

  if (!isValidDate(from) || !isValidDate(to)) {
    return jsonResponse(400, { error: 'Informe datas válidas.' });
  }

  if (from > to) {
    return jsonResponse(400, { error: 'A data final precisa ser igual ou depois da inicial.' });
  }

  if (daysBetween(from, to) > MAX_BLOCK_DAYS) {
    return jsonResponse(400, { error: 'Período de bloqueio muito longo.' });
  }

  // Só bloqueia dias sem nenhum agendamento: quem já está marcado precisa ser
  // remarcado ou cancelado antes.
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('appointments')
    .select('id, customer_name, barber_id, barber_name, appointment_date, appointment_time')
    .eq('status', 'confirmed')
    .gte('appointment_date', from)
    .lte('appointment_date', to)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.length > 0) {
    return jsonResponse(409, {
      error: `Há ${data.length} agendamento(s) neste período. Remarque ou cancele antes de bloquear.`,
      appointments: data.map((row) => ({
        id: row.id,
        customerName: row.customer_name,
        barberName: barberNameFor(row.barber_id, row.barber_name),
        date: row.appointment_date,
        time: row.appointment_time,
      })),
    });
  }

  const settings = await loadSettings(event, { strict: true });
  const duplicate = settings.blocks.find((item) => item.from === from && item.to === to);
  if (duplicate) {
    return jsonResponse(200, { settings });
  }

  settings.blocks.push({
    id: `blk_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    from,
    to,
    reason,
  });
  await saveSettings(event, settings);
  const saved = await loadSettings(event, { strict: true });
  return jsonResponse(200, { settings: saved });
}

async function handleRemoveBlock(event, body) {
  const id = String(body.id || '').trim();
  const settings = await loadSettings(event, { strict: true });
  const next = settings.blocks.filter((item) => item.id !== id);

  if (next.length === settings.blocks.length) {
    return jsonResponse(404, { error: 'Bloqueio não encontrado.' });
  }

  settings.blocks = next;
  await saveSettings(event, settings);
  return jsonResponse(200, { settings });
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, { ok: true });
  }

  if (!isAuthorized(event)) {
    return jsonResponse(401, { error: 'Não autorizado.' });
  }

  try {
    if (event.httpMethod === 'GET') {
      return jsonResponse(200, {
        settings: await loadSettings(event, { strict: true }),
        catalog: buildCatalog(),
      });
    }

    const body = parseBody(event);
    if (!body) {
      return jsonResponse(400, { error: 'Dados inválidos.' });
    }

    if (event.httpMethod === 'PUT') return await handleSaveLunch(event, body);
    if (event.httpMethod === 'POST') return await handleAddBlock(event, body);
    if (event.httpMethod === 'DELETE') return await handleRemoveBlock(event, body);

    return jsonResponse(405, { error: 'Método não permitido.' });
  } catch (error) {
    return jsonResponse(400, { error: error.message || 'Erro ao processar solicitação.' });
  }
};
