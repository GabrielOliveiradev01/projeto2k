const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
});

function closeMenu() {
  nav?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
  if (nav?.classList.contains('open')) {
    closeMenu();
  } else {
    nav?.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
  }
});

document.querySelectorAll('.nav-links a, .nav-cta').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

const stepStart = document.getElementById('step-start');
const stepCpf = document.getElementById('step-cpf');
const stepAvulso = document.getElementById('step-avulso');
const stepSchedule = document.getElementById('step-schedule');
const stepSuccess = document.getElementById('step-success');
const cpfForm = document.getElementById('cpf-form');
const avulsoForm = document.getElementById('avulso-form');
const scheduleForm = document.getElementById('schedule-form');
const cpfInput = document.getElementById('booking-cpf');
const avulsoCpfInput = document.getElementById('avulso-cpf');
const avulsoPhoneInput = document.getElementById('avulso-phone');
const cpfSubmit = document.getElementById('cpf-submit');
const avulsoSubmit = document.getElementById('avulso-submit');
const avulsoTotal = document.getElementById('avulso-total');
const scheduleSubmit = document.getElementById('schedule-submit');
const bookingError = document.getElementById('booking-error');
const avulsoError = document.getElementById('avulso-error');
const bookingWelcome = document.getElementById('booking-welcome');
const dateGrid = document.getElementById('date-grid');
const dateHint = document.getElementById('date-hint');
const timeFieldset = document.getElementById('time-fieldset');
const timeGrid = document.getElementById('time-grid');
const slotsHint = document.getElementById('slots-hint');
const bookingBack = document.getElementById('booking-back');
const successMessage = document.getElementById('success-message');
const successDetails = document.getElementById('success-details');

const MAX_DAYS_AHEAD = 30;
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const AVULSO_SERVICES = {
  corte: { name: 'Corte', price: 50, label: 'R$ 50,00' },
  barba: { name: 'Barba', price: 55, label: 'R$ 55,00' },
  'corte-barba': { name: 'Corte + Barba', price: 85, label: 'R$ 85,00' },
};

const EXTRA_SERVICES = {
  sobrancelha: { name: 'Sobrancelha', price: 10 },
  hidratacao: { name: 'Hidratação', price: 25 },
  'limpeza-pele': { name: 'Limpeza de pele', price: 40 },
  'dep-cera-nariz': { name: 'Dep. cera nariz', price: 15 },
  'dep-cera-ouvido': { name: 'Dep. cera ouvido', price: 15 },
  'combo-cera': { name: 'Combo cera', price: 20 },
};

let bookingMode = '';
let verifiedCpf = '';
let customerName = '';
let planLabel = '';
let serviceId = '';
let selectedExtraIds = [];
let customerPhone = '';
let selectedDate = '';
let selectedTime = '';

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatPrice(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function getSelectedExtraIds() {
  if (!avulsoForm) return [];
  return [...avulsoForm.querySelectorAll('input[name="extra"]:checked')].map((input) => input.value);
}

function updateAvulsoTotal() {
  if (!avulsoTotal) return;

  const service = AVULSO_SERVICES[avulsoForm?.querySelector('input[name="service"]:checked')?.value];
  if (!service) {
    avulsoTotal.hidden = true;
    avulsoTotal.textContent = '';
    return;
  }

  const extras = getSelectedExtraIds();
  const extrasTotal = extras.reduce((sum, id) => sum + (EXTRA_SERVICES[id]?.price || 0), 0);
  const total = service.price + extrasTotal;

  if (extras.length) {
    const extrasLabel = extras.map((id) => EXTRA_SERVICES[id]?.name).filter(Boolean).join(', ');
    avulsoTotal.textContent = `Extras: ${extrasLabel} — Total: ${formatPrice(total)}`;
    avulsoTotal.hidden = false;
    return;
  }

  avulsoTotal.textContent = `Total: ${formatPrice(total)}`;
  avulsoTotal.hidden = false;
}

function showError(message, target = 'booking') {
  const el = target === 'avulso' ? avulsoError : bookingError;
  if (!el) return;
  el.textContent = message;
  el.hidden = !message;
}

function setLoading(button, loading, defaultText) {
  if (!button) return;
  button.disabled = loading;
  button.textContent = loading ? 'Aguarde...' : defaultText;
}

function showStep(step) {
  stepStart.hidden = step !== 'start';
  stepCpf.hidden = step !== 'cpf';
  stepAvulso.hidden = step !== 'avulso';
  stepSchedule.hidden = step !== 'schedule';
  stepSuccess.hidden = step !== 'success';
}

function getSelectedBarber() {
  return scheduleForm.querySelector('input[name="barber"]:checked')?.value || '';
}

function formatDateBr(dateStr) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getAvailableDates() {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < MAX_DAYS_AHEAD; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      value: toInputDate(date),
      weekday: WEEKDAYS[date.getDay()],
      day: date.getDate(),
      month: MONTHS[date.getMonth()],
    });
  }

  return dates;
}

function updateWelcome() {
  if (bookingMode === 'subscription') {
    bookingWelcome.innerHTML = `
      <p class="booking-welcome-name">Olá, <strong>${customerName}</strong></p>
      <p class="booking-welcome-plan">Plano ativo: <span>${planLabel}</span></p>
    `;
    return;
  }

  const service = AVULSO_SERVICES[serviceId];
  const extras = selectedExtraIds.map((id) => EXTRA_SERVICES[id]).filter(Boolean);
  const extrasTotal = extras.reduce((sum, item) => sum + item.price, 0);
  const total = service.price + extrasTotal;
  const extrasHtml = extras.length
    ? `<p class="booking-welcome-plan">Extras: <span>${extras.map((item) => item.name).join(', ')}</span></p>`
    : '';

  bookingWelcome.innerHTML = `
    <p class="booking-welcome-name">Olá, <strong>${customerName}</strong></p>
    <p class="booking-welcome-plan">Serviço avulso: <span>${service.name} — ${service.label}</span></p>
    ${extrasHtml}
    <p class="booking-welcome-plan">Total: <span>${formatPrice(total)}</span></p>
    <p class="booking-welcome-note">Pagamento no dia do atendimento na barbearia.</p>
  `;
}

function clearTimeSelection() {
  selectedTime = '';
  timeGrid.innerHTML = '';
  timeFieldset.hidden = true;
  scheduleSubmit.disabled = true;
}

function clearDateSelection() {
  selectedDate = '';
  dateGrid.querySelectorAll('input[name="date"]').forEach((input) => {
    input.checked = false;
  });
  clearTimeSelection();
}

function renderDateCards() {
  const barberId = getSelectedBarber();
  dateGrid.innerHTML = '';

  if (!barberId) {
    dateHint.textContent = 'Selecione um barbeiro para ver as datas disponíveis.';
    return;
  }

  dateHint.textContent = 'Toque na data desejada.';

  getAvailableDates().forEach((item) => {
    const label = document.createElement('label');
    label.className = 'date-card';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'date';
    input.value = item.value;
    input.required = true;

    const inner = document.createElement('span');
    inner.className = 'date-card-inner';
    inner.innerHTML = `
      <span class="date-weekday">${item.weekday}</span>
      <span class="date-day">${item.day}</span>
      <span class="date-month">${item.month}</span>
    `;

    label.appendChild(input);
    label.appendChild(inner);
    dateGrid.appendChild(label);
  });
}

function renderTimeCards(slots) {
  timeGrid.innerHTML = '';
  selectedTime = '';

  if (!slots.length) {
    timeFieldset.hidden = false;
    slotsHint.textContent = 'Nenhum horário livre nesta data. Escolha outro dia.';
    scheduleSubmit.disabled = true;
    return;
  }

  slotsHint.textContent = `${slots.length} horário(s) disponível(is). Toque para selecionar.`;
  timeFieldset.hidden = false;

  slots.forEach((slot) => {
    const label = document.createElement('label');
    label.className = 'time-card';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'time';
    input.value = slot;
    input.required = true;

    const inner = document.createElement('span');
    inner.className = 'time-card-inner';
    inner.textContent = slot;

    label.appendChild(input);
    label.appendChild(inner);
    timeGrid.appendChild(label);
  });

  scheduleSubmit.disabled = true;
}

async function loadSlots() {
  const barberId = getSelectedBarber();
  const date = selectedDate;

  clearTimeSelection();

  if (!barberId || !date) return;

  timeFieldset.hidden = false;
  slotsHint.textContent = 'Carregando horários...';
  timeGrid.innerHTML = '<p class="slots-loading">Carregando...</p>';

  try {
    const response = await fetch(
      `/.netlify/functions/appointments?barberId=${encodeURIComponent(barberId)}&date=${encodeURIComponent(date)}`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível carregar os horários.');
    }

    renderTimeCards(data.slots);
  } catch (error) {
    timeGrid.innerHTML = '';
    slotsHint.textContent = 'Erro ao carregar horários.';
    showError(error.message);
  }
}

function resetScheduleForm() {
  selectedDate = '';
  selectedTime = '';
  scheduleForm.reset();
  dateGrid.innerHTML = '';
  timeGrid.innerHTML = '';
  timeFieldset.hidden = true;
  scheduleSubmit.disabled = true;
  dateHint.textContent = 'Selecione um barbeiro para ver as datas disponíveis.';
}

function resetAll() {
  bookingMode = '';
  verifiedCpf = '';
  customerName = '';
  planLabel = '';
  serviceId = '';
  selectedExtraIds = [];
  customerPhone = '';
  resetScheduleForm();
  cpfForm?.reset();
  avulsoForm?.reset();
  updateAvulsoTotal();
  showError('', 'booking');
  showError('', 'avulso');
}

document.getElementById('mode-subscription')?.addEventListener('click', () => {
  bookingMode = 'subscription';
  showError('', 'booking');
  showStep('cpf');
});

document.getElementById('mode-avulso')?.addEventListener('click', () => {
  bookingMode = 'avulso';
  showError('', 'avulso');
  showStep('avulso');
});

document.getElementById('go-avulso-from-cpf')?.addEventListener('click', () => {
  bookingMode = 'avulso';
  const cpf = onlyDigits(cpfInput.value);
  showError('', 'booking');
  showStep('avulso');
  if (cpf.length === 11 && avulsoCpfInput) {
    avulsoCpfInput.value = formatCpf(cpf);
  }
});

document.getElementById('back-from-cpf')?.addEventListener('click', () => {
  showError('', 'booking');
  showStep('start');
});

document.getElementById('back-from-avulso')?.addEventListener('click', () => {
  showError('', 'avulso');
  showStep('start');
});

cpfForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');

  const cpf = onlyDigits(cpfInput.value);
  if (cpf.length !== 11) {
    showError('Informe um CPF válido com 11 dígitos.');
    return;
  }

  setLoading(cpfSubmit, true, 'Verificar e continuar');

  try {
    const response = await fetch('/.netlify/functions/check-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao verificar assinatura.');
    }

    if (!data.active) {
      showError(data.message || 'Assinatura não encontrada. Você pode agendar como avulso.');
      return;
    }

    bookingMode = 'subscription';
    verifiedCpf = cpf;
    customerName = data.customerName;
    planLabel = data.planName;

    updateWelcome();
    showStep('schedule');
    renderDateCards();
  } catch (error) {
    showError(error.message || 'Erro ao verificar assinatura.');
  } finally {
    setLoading(cpfSubmit, false, 'Verificar e continuar');
  }
});

avulsoForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  showError('', 'avulso');

  const name = document.getElementById('avulso-name')?.value.trim();
  const cpf = onlyDigits(avulsoCpfInput?.value);
  const phone = onlyDigits(avulsoPhoneInput?.value);
  const service = avulsoForm.querySelector('input[name="service"]:checked')?.value;

  if (!name || name.length < 3) {
    showError('Informe seu nome completo.', 'avulso');
    return;
  }

  if (cpf.length !== 11) {
    showError('Informe um CPF válido com 11 dígitos.', 'avulso');
    return;
  }

  if (phone.length < 10) {
    showError('Informe um telefone válido.', 'avulso');
    return;
  }

  if (!service) {
    showError('Escolha um serviço avulso.', 'avulso');
    return;
  }

  bookingMode = 'avulso';
  verifiedCpf = cpf;
  customerName = name;
  customerPhone = phone;
  serviceId = service;
  selectedExtraIds = getSelectedExtraIds();

  updateWelcome();
  resetScheduleForm();
  showStep('schedule');
  renderDateCards();
});

scheduleForm?.addEventListener('change', (event) => {
  if (event.target.name === 'barber') {
    showError('');
    clearDateSelection();
    renderDateCards();
    return;
  }

  if (event.target.name === 'date') {
    showError('');
    selectedDate = event.target.value;
    loadSlots();
    return;
  }

  if (event.target.name === 'time') {
    showError('');
    selectedTime = event.target.value;
    scheduleSubmit.disabled = !selectedTime;
  }
});

scheduleForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');

  const barberId = getSelectedBarber();
  const date = selectedDate;
  const time = selectedTime;

  if (!verifiedCpf || !barberId || !date || !time) {
    showError('Selecione barbeiro, data e horário.');
    return;
  }

  setLoading(scheduleSubmit, true, 'Confirmar agendamento');

  const payload = {
    cpf: verifiedCpf,
    barberId,
    date,
    time,
    bookingType: bookingMode,
  };

  if (bookingMode === 'avulso') {
    payload.name = customerName;
    payload.phone = customerPhone;
    payload.serviceId = serviceId;
    payload.extras = selectedExtraIds;
  }

  try {
    const response = await fetch('/.netlify/functions/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível confirmar o agendamento.');
    }

    successMessage.textContent = `Seu horário com ${data.appointment.barberName} foi reservado com sucesso.`;

    if (data.appointment.bookingType === 'avulso') {
      const extrasHtml = data.appointment.extras?.length
        ? `<p><strong>Extras:</strong> ${data.appointment.extras.map((item) => item.name).join(', ')}</p>`
        : '';

      successDetails.innerHTML = `
        <p><strong>Data:</strong> ${formatDateBr(data.appointment.date)}</p>
        <p><strong>Horário:</strong> ${data.appointment.time}</p>
        <p><strong>Barbeiro:</strong> ${data.appointment.barberName}</p>
        <p><strong>Serviço:</strong> ${data.appointment.serviceName}</p>
        ${extrasHtml}
        <p><strong>Valor:</strong> ${formatPrice(data.appointment.price)}</p>
        <p><strong>Pagamento:</strong> No dia do atendimento na barbearia</p>
      `;
    } else {
      successDetails.innerHTML = `
        <p><strong>Data:</strong> ${formatDateBr(data.appointment.date)}</p>
        <p><strong>Horário:</strong> ${data.appointment.time}</p>
        <p><strong>Barbeiro:</strong> ${data.appointment.barberName}</p>
        <p><strong>Plano:</strong> ${data.appointment.planName}</p>
      `;
    }

    showStep('success');
  } catch (error) {
    showError(error.message || 'Erro ao confirmar agendamento.');
    if (error.message?.includes('reservado')) {
      loadSlots();
    }
  } finally {
    setLoading(scheduleSubmit, false, 'Confirmar agendamento');
  }
});

bookingBack?.addEventListener('click', () => {
  resetScheduleForm();
  showError('');
  showStep(bookingMode === 'avulso' ? 'avulso' : 'cpf');
});

cpfInput?.addEventListener('input', () => {
  cpfInput.value = formatCpf(cpfInput.value);
});

avulsoCpfInput?.addEventListener('input', () => {
  avulsoCpfInput.value = formatCpf(avulsoCpfInput.value);
});

avulsoPhoneInput?.addEventListener('input', () => {
  avulsoPhoneInput.value = formatPhone(avulsoPhoneInput.value);
});

avulsoForm?.addEventListener('change', (event) => {
  if (event.target.name === 'service' || event.target.name === 'extra') {
    updateAvulsoTotal();
  }
});

const urlMode = new URLSearchParams(window.location.search).get('mode');
if (urlMode === 'avulso') {
  bookingMode = 'avulso';
  showStep('avulso');
} else {
  showStep('start');
}
