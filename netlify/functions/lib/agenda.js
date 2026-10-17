const { connectLambda, getStore } = require('@netlify/blobs');

const BARBERS = [
  { id: 'gemeo-1', name: 'Kevyn' },
  { id: 'gemeo-2', name: 'Kawan' },
];

const WORK_START = 9;
const WORK_END = 18;
const SLOT_MINUTES = 40;
const MAX_BLOCK_DAYS = 366;

const AVULSO_SERVICES = {
  corte: { name: 'Corte', label: 'Corte — R$ 50,00', price: 50 },
  barba: { name: 'Barba', label: 'Barba — R$ 40,00', price: 40 },
  'corte-barba': { name: 'Corte + Barba', label: 'Corte + Barba — R$ 70,00', price: 70 },
};

const EXTRA_SERVICES = {
  sobrancelha: { name: 'Sobrancelha', price: 10 },
  hidratacao: { name: 'Hidratação', price: 25 },
  'limpeza-pele': { name: 'Limpeza de pele', price: 40 },
  'dep-cera-nariz': { name: 'Dep. cera nariz', price: 15 },
  'dep-cera-ouvido': { name: 'Dep. cera ouvido', price: 15 },
  'combo-cera': { name: 'Combo cera', price: 20 },
};

const SETTINGS_STORE = 'agenda';
const SETTINGS_KEY = 'settings';

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

// Nome atual do barbeiro; agendamentos antigos guardam "Gêmeo 1/2" no banco.
function barberNameFor(barberId, fallback = '') {
  const barber = BARBERS.find((item) => item.id === barberId);
  return barber ? barber.name : fallback;
}

function generateSlots() {
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

function isValidTime(timeStr) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

function toMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function defaultSettings() {
  return {
    lunch: { enabled: false, start: '12:00', end: '13:00' },
    blocks: [],
  };
}

function normalizeSettings(raw) {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') return base;

  const lunch = raw.lunch || {};
  if (isValidTime(String(lunch.start || '')) && isValidTime(String(lunch.end || ''))) {
    base.lunch = {
      enabled: lunch.enabled === true,
      start: lunch.start,
      end: lunch.end,
    };
  }

  if (Array.isArray(raw.blocks)) {
    base.blocks = raw.blocks
      .filter((item) => item && isValidDate(item.from) && isValidDate(item.to) && item.from <= item.to)
      .map((item) => ({
        id: String(item.id),
        from: item.from,
        to: item.to,
        reason: String(item.reason || ''),
      }))
      .sort((a, b) => a.from.localeCompare(b.from));
  }

  return base;
}

function getSettingsStore(event) {
  if (event && event.blobs) connectLambda(event);
  return getStore(SETTINGS_STORE);
}

// strict=false: se o armazenamento falhar, o agendamento do cliente continua
// funcionando com os padrões (sem almoço nem bloqueios).
async function loadSettings(event, { strict = false } = {}) {
  try {
    const store = getSettingsStore(event);
    const data = await store.get(SETTINGS_KEY, { type: 'json' });
    return normalizeSettings(data);
  } catch (error) {
    if (strict) throw error;
    return defaultSettings();
  }
}

async function saveSettings(event, settings) {
  const store = getSettingsStore(event);
  await store.setJSON(SETTINGS_KEY, normalizeSettings(settings));
}

// O horário [time, time + SLOT_MINUTES) invade o intervalo de almoço?
function isLunchSlot(time, lunch) {
  if (!lunch || !lunch.enabled) return false;
  const start = toMinutes(time);
  const end = start + SLOT_MINUTES;
  return start < toMinutes(lunch.end) && end > toMinutes(lunch.start);
}

function findBlock(date, blocks) {
  return (blocks || []).find((item) => item.from <= date && date <= item.to) || null;
}

function daysBetween(from, to) {
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  return Math.round((end - start) / 86400000) + 1;
}

module.exports = {
  BARBERS,
  SLOT_MINUTES,
  MAX_BLOCK_DAYS,
  AVULSO_SERVICES,
  EXTRA_SERVICES,
  parseExtraIds,
  resolveExtras,
  buildAvulsoPlanName,
  barberNameFor,
  generateSlots,
  isValidDate,
  isValidTime,
  toMinutes,
  defaultSettings,
  normalizeSettings,
  loadSettings,
  saveSettings,
  isLunchSlot,
  findBlock,
  daysBetween,
};
