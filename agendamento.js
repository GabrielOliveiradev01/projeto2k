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

const stepCpf = document.getElementById('step-cpf');
const stepSchedule = document.getElementById('step-schedule');
const stepSuccess = document.getElementById('step-success');
const cpfForm = document.getElementById('cpf-form');
const scheduleForm = document.getElementById('schedule-form');
const cpfInput = document.getElementById('booking-cpf');
const cpfSubmit = document.getElementById('cpf-submit');
const scheduleSubmit = document.getElementById('schedule-submit');
const bookingError = document.getElementById('booking-error');
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

let verifiedCpf = '';
let selectedDate = '';
let selectedTime = '';

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function showError(message) {
  if (!bookingError) return;
  bookingError.textContent = message;
  bookingError.hidden = !message;
}

function setLoading(button, loading, defaultText) {
  if (!button) return;
  button.disabled = loading;
  button.textContent = loading ? 'Aguarde...' : defaultText;
}

function showStep(step) {
  stepCpf.hidden = step !== 'cpf';
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
      showError(data.message || 'Assinatura não encontrada.');
      return;
    }

    verifiedCpf = cpf;

    bookingWelcome.innerHTML = `
      <p class="booking-welcome-name">Olá, <strong>${data.customerName}</strong></p>
      <p class="booking-welcome-plan">Plano ativo: <span>${data.planName}</span></p>
    `;

    showStep('schedule');
    renderDateCards();
  } catch (error) {
    showError(error.message || 'Erro ao verificar assinatura.');
  } finally {
    setLoading(cpfSubmit, false, 'Verificar e continuar');
  }
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

  try {
    const response = await fetch('/.netlify/functions/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: verifiedCpf,
        barberId,
        date,
        time,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível confirmar o agendamento.');
    }

    successMessage.textContent = `Seu horário com ${data.appointment.barberName} foi reservado com sucesso.`;
    successDetails.innerHTML = `
      <p><strong>Data:</strong> ${formatDateBr(data.appointment.date)}</p>
      <p><strong>Horário:</strong> ${data.appointment.time}</p>
      <p><strong>Barbeiro:</strong> ${data.appointment.barberName}</p>
      <p><strong>Plano:</strong> ${data.appointment.planName}</p>
    `;

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
  verifiedCpf = '';
  selectedDate = '';
  selectedTime = '';
  scheduleForm.reset();
  dateGrid.innerHTML = '';
  timeGrid.innerHTML = '';
  timeFieldset.hidden = true;
  scheduleSubmit.disabled = true;
  dateHint.textContent = 'Selecione um barbeiro para ver as datas disponíveis.';
  showError('');
  showStep('cpf');
});

cpfInput?.addEventListener('input', () => {
  cpfInput.value = formatCpf(cpfInput.value);
});

showStep('cpf');
