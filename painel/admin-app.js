import { LitElement, html } from 'lit';

const STORAGE_KEY = '2k-admin-token';
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8888' : '';
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function networkErrorMessage() {
  if (window.location.protocol === 'file:') {
    return 'Abra o painel em http://localhost:8888/painel.html (rode npm run dev no projeto).';
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'Servidor local offline. Rode npm run dev na pasta do projeto.';
  }
  return 'Não foi possível conectar ao servidor. Verifique o deploy no Netlify e as variáveis de ambiente.';
}

function formatCpf(cpf) {
  const digits = String(cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf || '—';
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function subscriptionStatusClass(status) {
  if (status === 'ACTIVE') return 'subscription-active';
  if (status === 'NONE') return 'subscription-none';
  return 'subscription-inactive';
}

function paymentStatusClass(status) {
  if (status === 'RECEIVED' || status === 'CONFIRMED') return 'payment-received';
  if (status === 'PENDING') return 'payment-pending';
  if (status === 'OVERDUE') return 'payment-overdue';
  return 'payment-other';
}

function formatDateBr(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function toIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function todayIso() {
  return toIso(new Date());
}

function getMonthBounds(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  return { from: toIso(first), to: toIso(last) };
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const days = [];
  const today = todayIso();

  for (let i = startPad - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push({ iso: toIso(date), day: date.getDate(), inMonth: false, isToday: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    const iso = toIso(date);
    days.push({ iso, day, inMonth: true, isToday: iso === today });
  }

  let nextDay = 1;
  while (days.length % 7 !== 0 || days.length < 35) {
    const date = new Date(year, month + 1, nextDay++);
    days.push({ iso: toIso(date), day: date.getDate(), inMonth: false, isToday: false });
    if (days.length >= 42) break;
  }

  return days;
}

function groupByDate(appointments) {
  const map = {};
  for (const item of appointments) {
    if (!map[item.date]) map[item.date] = [];
    map[item.date].push(item);
  }
  for (const key of Object.keys(map)) {
    map[key].sort((a, b) => a.time.localeCompare(b.time));
  }
  return map;
}

class AdminLogin extends LitElement {
  static properties = {
    loading: { type: Boolean },
    error: { type: String },
  };

  constructor() {
    super();
    this.loading = false;
    this.error = '';
  }

  createRenderRoot() {
    return this;
  }

  async _onSubmit(event) {
    event.preventDefault();
    this.error = '';
    this.loading = true;

    const password = new FormData(event.target).get('password');

    try {
      const response = await fetch(apiUrl('/.netlify/functions/admin-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Senha incorreta.');
      }

      sessionStorage.setItem(STORAGE_KEY, password);
      this.dispatchEvent(new CustomEvent('login-success', { bubbles: true, composed: true }));
    } catch (error) {
      const message = error?.message || 'Erro ao entrar.';
      this.error = message === 'Load failed' || message === 'Failed to fetch'
        ? networkErrorMessage()
        : message;
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="panel-login">
        <div class="panel-login-card">
          <span class="panel-tag">Admin</span>
          <h1>Painel 2k</h1>
          <p>Entre para ver os agendamentos.</p>
          ${this.error ? html`<div class="panel-alert">${this.error}</div>` : ''}
          <form @submit=${this._onSubmit}>
            <label class="panel-label">
              Senha
              <input type="password" name="password" required autocomplete="current-password" placeholder="Senha do painel">
            </label>
            <button class="btn btn-primary btn-full" type="submit" ?disabled=${this.loading}>
              ${this.loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <a class="panel-back-link" href="./index.html">← Voltar ao site</a>
        </div>
      </div>
    `;
  }
}

class AdminApp extends LitElement {
  static properties = {
    token: { type: String },
    appointments: { type: Array },
    loading: { type: Boolean },
    error: { type: String },
    subscribersError: { type: String },
    filterBarber: { type: String },
    filterStatus: { type: String },
    filterFrom: { type: String },
    filterTo: { type: String },
    actionId: { type: String },
    viewMode: { type: String },
    section: { type: String },
    subscribers: { type: Array },
    subscriberStats: { type: Object },
    subscribersLoading: { type: Boolean },
    subscriberFilterStatus: { type: String },
    subscriberFilterName: { type: String },
    subscriberFilterCpf: { type: String },
    selectedSubscriber: { type: Object },
    subscriberHistory: { type: Array },
    subscriberHistoryLoading: { type: Boolean },
    subscriberHistoryError: { type: String },
    financeLoading: { type: Boolean },
    financeError: { type: String },
    financeSummary: { type: Object },
    financeSubscriptionBreakdown: { type: Array },
    financeReceivedPayments: { type: Array },
    financePendingPayments: { type: Array },
    financeOverduePayments: { type: Array },
    financeAvulsoAppointments: { type: Array },
    financeFilterFrom: { type: String },
    financeFilterTo: { type: String },
    financeViewMode: { type: String },
    calendarMonth: { type: Number },
    calendarYear: { type: Number },
    selectedDate: { type: String },
  };

  constructor() {
    super();
    const now = new Date();
    const bounds = getMonthBounds(now.getFullYear(), now.getMonth());

    this.token = sessionStorage.getItem(STORAGE_KEY) || '';
    this.appointments = [];
    this.loading = false;
    this.error = '';
    this.subscribersError = '';
    this.filterBarber = '';
    this.filterStatus = 'confirmed';
    this.filterFrom = bounds.from;
    this.filterTo = bounds.to;
    this.actionId = '';
    this.viewMode = 'calendar';
    this.section = 'appointments';
    this.subscribers = [];
    this.subscriberStats = { total: 0, active: 0, inactive: 0, none: 0 };
    this.subscribersLoading = false;
    this.subscriberFilterStatus = 'all';
    this.subscriberFilterName = '';
    this.subscriberFilterCpf = '';
    this.selectedSubscriber = null;
    this.subscriberHistory = [];
    this.subscriberHistoryLoading = false;
    this.subscriberHistoryError = '';
    this.financeLoading = false;
    this.financeError = '';
    this.financeSummary = null;
    this.financeSubscriptionBreakdown = [];
    this.financeReceivedPayments = [];
    this.financePendingPayments = [];
    this.financeOverduePayments = [];
    this.financeAvulsoAppointments = [];
    this.financeFilterFrom = bounds.from;
    this.financeFilterTo = bounds.to;
    this.financeViewMode = 'overview';
    this.calendarMonth = now.getMonth();
    this.calendarYear = now.getFullYear();
    this.selectedDate = todayIso();
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.token) {
      this.loadAppointments();
    }
  }

  _logout() {
    sessionStorage.removeItem(STORAGE_KEY);
    this.token = '';
    this.appointments = [];
  }

  _onLoginSuccess() {
    this.token = sessionStorage.getItem(STORAGE_KEY) || '';
    this.loadAppointments();
  }

  _parseError(error) {
    const message = error?.message || 'Erro desconhecido.';
    if (message === 'Load failed' || message === 'Failed to fetch') {
      return networkErrorMessage();
    }
    return message;
  }

  async _api(path, options = {}) {
    let response;
    try {
      response = await fetch(apiUrl(path), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      throw new Error(this._parseError(error));
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      this._logout();
      throw new Error('Sessão expirada. Entre novamente.');
    }

    if (response.status === 404) {
      throw new Error('Função não encontrada no servidor. Faça deploy da versão mais recente no Netlify.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição.');
    }

    return data;
  }

  _syncMonthFilters() {
    const bounds = getMonthBounds(this.calendarYear, this.calendarMonth);
    this.filterFrom = bounds.from;
    this.filterTo = bounds.to;
  }

  async loadSubscribers() {
    this.subscribersLoading = true;
    this.subscribersError = '';

    const params = new URLSearchParams();
    if (this.subscriberFilterStatus !== 'all') {
      params.set('status', this.subscriberFilterStatus);
    }

    try {
      const data = await this._api(`/.netlify/functions/admin-subscribers?${params}`);
      this.subscribers = data.subscribers || [];
      this.subscriberStats = data.stats || { total: 0, active: 0, inactive: 0, none: 0 };
    } catch (error) {
      this.subscribersError = this._parseError(error);
      this.subscribers = [];
    } finally {
      this.subscribersLoading = false;
    }
  }

  async loadFinance() {
    this.financeLoading = true;
    this.financeError = '';

    const params = new URLSearchParams();
    if (this.financeFilterFrom) params.set('from', this.financeFilterFrom);
    if (this.financeFilterTo) params.set('to', this.financeFilterTo);

    try {
      const data = await this._api(`/.netlify/functions/admin-finance?${params}`);
      this.financeSummary = data.summary || null;
      this.financeSubscriptionBreakdown = data.subscriptionBreakdown || [];
      this.financeReceivedPayments = data.receivedPayments || [];
      this.financePendingPayments = data.pendingPayments || [];
      this.financeOverduePayments = data.overduePayments || [];
      this.financeAvulsoAppointments = data.avulsoAppointments || [];
    } catch (error) {
      this.financeError = this._parseError(error);
      this.financeSummary = null;
      this.financeSubscriptionBreakdown = [];
      this.financeReceivedPayments = [];
      this.financePendingPayments = [];
      this.financeOverduePayments = [];
      this.financeAvulsoAppointments = [];
    } finally {
      this.financeLoading = false;
    }
  }

  _refreshCurrentSection() {
    if (this.section === 'subscribers') {
      this.loadSubscribers();
      return;
    }
    if (this.section === 'finance') {
      this.loadFinance();
      return;
    }
    this.loadAppointments();
  }

  _setSection(section) {
    this.section = section;
    if (section === 'subscribers') {
      this.subscribersError = '';
      this.loadSubscribers();
    } else if (section === 'finance') {
      this.financeError = '';
      this.loadFinance();
    } else {
      this.error = '';
      this._closeSubscriberHistory();
    }
  }

  _onFinanceFilterChange(event) {
    const { name, value } = event.target;
    this[name] = value;
    this.loadFinance();
  }

  _setFinanceView(mode) {
    this.financeViewMode = mode;
  }

  _onSubscriberFilterChange(event) {
    this.subscriberFilterStatus = event.target.value;
    this.loadSubscribers();
  }

  _onSubscriberSearchChange(event) {
    const { name, value } = event.target;
    this[name] = value;
  }

  _filteredSubscribers() {
    const nameQuery = this.subscriberFilterName.trim().toLowerCase();
    const cpfQuery = onlyDigits(this.subscriberFilterCpf);

    return this.subscribers.filter((item) => {
      if (nameQuery && !String(item.name || '').toLowerCase().includes(nameQuery)) {
        return false;
      }
      if (cpfQuery && !onlyDigits(item.cpf).includes(cpfQuery)) {
        return false;
      }
      return true;
    });
  }

  async _openSubscriberHistory(subscriber) {
    this.selectedSubscriber = subscriber;
    this.subscriberHistory = [];
    this.subscriberHistoryError = '';
    this.subscriberHistoryLoading = true;

    const params = new URLSearchParams({
      cpf: subscriber.cpf,
      status: 'all',
    });

    try {
      const data = await this._api(`/.netlify/functions/admin-appointments?${params}`);
      this.subscriberHistory = (data.appointments || []).sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.time.localeCompare(a.time);
      });
    } catch (error) {
      this.subscriberHistoryError = this._parseError(error);
      this.subscriberHistory = [];
    } finally {
      this.subscriberHistoryLoading = false;
    }
  }

  _closeSubscriberHistory() {
    this.selectedSubscriber = null;
    this.subscriberHistory = [];
    this.subscriberHistoryError = '';
    this.subscriberHistoryLoading = false;
  }

  async _cancelSubscriberAppointment(id) {
    if (!confirm('Cancelar este agendamento?')) return;

    this.actionId = id;
    this.subscriberHistoryError = '';

    try {
      await this._api('/.netlify/functions/admin-appointments', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      if (this.selectedSubscriber) {
        await this._openSubscriberHistory(this.selectedSubscriber);
      }
    } catch (error) {
      this.subscriberHistoryError = this._parseError(error);
    } finally {
      this.actionId = '';
    }
  }

  async loadAppointments() {
    this.loading = true;
    this.error = '';

    const params = new URLSearchParams();
    if (this.filterBarber) params.set('barberId', this.filterBarber);
    if (this.filterStatus) params.set('status', this.filterStatus);
    if (this.filterFrom) params.set('from', this.filterFrom);
    if (this.filterTo) params.set('to', this.filterTo);

    try {
      const data = await this._api(`/.netlify/functions/admin-appointments?${params}`);
      this.appointments = data.appointments || [];
    } catch (error) {
      this.error = this._parseError(error);
      this.appointments = [];
    } finally {
      this.loading = false;
    }
  }

  async _cancelAppointment(id) {
    if (!confirm('Cancelar este agendamento?')) return;

    this.actionId = id;
    this.error = '';

    try {
      await this._api('/.netlify/functions/admin-appointments', {
        method: 'PATCH',
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      await this.loadAppointments();
    } catch (error) {
      this.error = this._parseError(error);
    } finally {
      this.actionId = '';
    }
  }

  _onFilterChange(event) {
    const { name, value } = event.target;
    this[name] = value;
    this.loadAppointments();
  }

  _setView(mode) {
    this.viewMode = mode;
  }

  _prevMonth() {
    if (this.calendarMonth === 0) {
      this.calendarMonth = 11;
      this.calendarYear -= 1;
    } else {
      this.calendarMonth -= 1;
    }
    this._syncMonthFilters();
    this.loadAppointments();
  }

  _nextMonth() {
    if (this.calendarMonth === 11) {
      this.calendarMonth = 0;
      this.calendarYear += 1;
    } else {
      this.calendarMonth += 1;
    }
    this._syncMonthFilters();
    this.loadAppointments();
  }

  _goToday() {
    const now = new Date();
    this.calendarMonth = now.getMonth();
    this.calendarYear = now.getFullYear();
    this.selectedDate = todayIso();
    this._syncMonthFilters();
    this.loadAppointments();
  }

  _selectDate(iso, inMonth) {
    if (!inMonth) {
      const date = new Date(`${iso}T12:00:00`);
      this.calendarMonth = date.getMonth();
      this.calendarYear = date.getFullYear();
      this._syncMonthFilters();
      this.loadAppointments();
    }
    this.selectedDate = iso;
  }

  _stats() {
    const confirmed = this.appointments.filter((item) => item.status === 'confirmed').length;
    const gemeo1 = this.appointments.filter((item) => item.barberId === 'gemeo-1' && item.status === 'confirmed').length;
    const gemeo2 = this.appointments.filter((item) => item.barberId === 'gemeo-2' && item.status === 'confirmed').length;
    return { total: this.appointments.length, confirmed, gemeo1, gemeo2 };
  }

  _renderCalendar(byDate) {
    const days = buildCalendarDays(this.calendarYear, this.calendarMonth);
    const monthLabel = `${MONTHS[this.calendarMonth]} ${this.calendarYear}`;
    const selectedItems = byDate[this.selectedDate] || [];

    return html`
      <section class="panel-calendar">
        <div class="cal-toolbar">
          <div class="cal-nav">
            <button class="btn btn-sm btn-outline cal-nav-btn" @click=${this._prevMonth} aria-label="Mês anterior">‹</button>
            <h2 class="cal-month-title">${monthLabel}</h2>
            <button class="btn btn-sm btn-outline cal-nav-btn" @click=${this._nextMonth} aria-label="Próximo mês">›</button>
          </div>
          <button class="btn btn-sm btn-outline" @click=${this._goToday}>Hoje</button>
        </div>

        <div class="cal-legend">
          <span class="cal-legend-item"><span class="cal-dot gemeo-1"></span> Gêmeo 1</span>
          <span class="cal-legend-item"><span class="cal-dot gemeo-2"></span> Gêmeo 2</span>
        </div>

        <div class="cal-grid" role="grid" aria-label="Calendário de agendamentos">
          ${WEEKDAYS.map((day) => html`<div class="cal-weekday" role="columnheader">${day}</div>`)}

          ${days.map((cell) => {
            const events = byDate[cell.iso] || [];
            const visible = events.slice(0, 2);
            const hidden = events.length - visible.length;
            const isSelected = this.selectedDate === cell.iso;

            return html`
              <button
                type="button"
                class="cal-day ${cell.inMonth ? '' : 'is-outside'} ${cell.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${events.length ? 'has-events' : ''}"
                @click=${() => this._selectDate(cell.iso, cell.inMonth)}
                aria-label="${formatDateBr(cell.iso)} — ${events.length} agendamento(s)"
              >
                <span class="cal-day-number">${cell.day}</span>
                <div class="cal-day-events">
                  ${visible.map((item) => html`
                    <span class="cal-event ${item.barberId} ${item.status === 'cancelled' ? 'is-cancelled' : ''}">
                      <span class="cal-event-time">${item.time}</span>
                      <span class="cal-event-name">${item.customerName.split(' ')[0]}</span>
                    </span>
                  `)}
                  ${hidden > 0 ? html`<span class="cal-more">+${hidden} mais</span>` : ''}
                </div>
              </button>
            `;
          })}
        </div>

        <aside class="cal-day-detail">
          <div class="cal-day-detail-header">
            <h3>${formatDateBr(this.selectedDate)}</h3>
            <span class="cal-day-count">${selectedItems.length} agendamento(s)</span>
          </div>

          ${selectedItems.length === 0
            ? html`<p class="panel-empty cal-day-empty">Nenhum agendamento neste dia.</p>`
            : html`
              <ul class="cal-detail-list">
                ${selectedItems.map((item) => html`
                  <li class="cal-detail-card ${item.barberId} ${item.status === 'cancelled' ? 'is-cancelled' : ''}">
                    <div class="cal-detail-main">
                      <span class="cal-detail-time">${item.time}</span>
                      <div>
                        <strong>${item.customerName}</strong>
                        <p>${item.barberName} · ${item.planName}</p>
                        <p class="cal-detail-cpf">${formatCpf(item.cpf)}</p>
                      </div>
                    </div>
                    <div class="cal-detail-actions">
                      <span class="panel-badge ${item.status}">
                        ${item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                      </span>
                      ${item.status === 'confirmed'
                        ? html`
                          <button
                            class="btn btn-sm btn-outline panel-cancel-btn"
                            @click=${() => this._cancelAppointment(item.id)}
                            ?disabled=${this.actionId === item.id}
                          >
                            ${this.actionId === item.id ? '...' : 'Cancelar'}
                          </button>
                        `
                        : ''}
                    </div>
                  </li>
                `)}
              </ul>
            `}
        </aside>
      </section>
    `;
  }

  _renderSubscriberHistory() {
    const subscriber = this.selectedSubscriber;
    if (!subscriber) return '';

    return html`
      <div class="panel-overlay" @click=${this._closeSubscriberHistory}>
        <aside class="panel-drawer" @click=${(event) => event.stopPropagation()} aria-label="Histórico de agendamentos">
          <div class="panel-drawer-header">
            <div>
              <h2>${subscriber.name}</h2>
              <p class="panel-drawer-meta">
                CPF ${formatCpf(subscriber.cpf)}
                ${subscriber.email ? html` · ${subscriber.email}` : ''}
              </p>
              <p class="panel-drawer-meta">
                ${subscriber.planName}
                <span class="panel-badge ${subscriptionStatusClass(subscriber.status)}">${subscriber.statusLabel}</span>
              </p>
            </div>
            <button class="panel-drawer-close" type="button" @click=${this._closeSubscriberHistory} aria-label="Fechar">×</button>
          </div>

          <div class="panel-drawer-body">
            <h3>Histórico de agendamentos</h3>

            ${this.subscriberHistoryError
              ? html`<div class="panel-alert">${this.subscriberHistoryError}</div>`
              : ''}

            ${this.subscriberHistoryLoading
              ? html`<p class="panel-empty">Carregando histórico...</p>`
              : this.subscriberHistory.length === 0
                ? html`<p class="panel-empty">Nenhum agendamento encontrado para este cliente.</p>`
                : html`
                  <ul class="subscriber-history-list">
                    ${this.subscriberHistory.map((item) => html`
                      <li class="subscriber-history-item ${item.status === 'cancelled' ? 'is-cancelled' : ''}">
                        <div class="subscriber-history-main">
                          <span class="subscriber-history-date">${formatDateBr(item.date)}</span>
                          <span class="subscriber-history-time">${item.time}</span>
                          <div>
                            <strong>${item.barberName}</strong>
                            <p>${item.planName}</p>
                          </div>
                        </div>
                        <div class="subscriber-history-actions">
                          <span class="panel-badge ${item.status}">
                            ${item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                          </span>
                          ${item.status === 'confirmed'
                            ? html`
                              <button
                                class="btn btn-sm btn-outline panel-cancel-btn"
                                @click=${() => this._cancelSubscriberAppointment(item.id)}
                                ?disabled=${this.actionId === item.id}
                              >
                                ${this.actionId === item.id ? '...' : 'Cancelar'}
                              </button>
                            `
                            : ''}
                        </div>
                      </li>
                    `)}
                  </ul>
                `}
          </div>
        </aside>
      </div>
    `;
  }

  _renderFinance() {
    const summary = this.financeSummary || {
      mrr: 0,
      activeSubscriptions: 0,
      receivedTotal: 0,
      receivedCount: 0,
      pendingTotal: 0,
      pendingCount: 0,
      overdueTotal: 0,
      overdueCount: 0,
      avulsoTotal: 0,
      avulsoCount: 0,
      periodTotal: 0,
    };

    return html`
      <div class="panel-stats panel-stats-finance">
        <article class="panel-stat">
          <span class="panel-stat-value">${formatMoney(summary.mrr)}</span>
          <span class="panel-stat-label">MRR (assinaturas ativas)</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${formatMoney(summary.receivedTotal)}</span>
          <span class="panel-stat-label">Recebido no período (${summary.receivedCount})</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${formatMoney(summary.avulsoTotal)}</span>
          <span class="panel-stat-label">Avulsos no período (${summary.avulsoCount})</span>
        </article>
        <article class="panel-stat panel-stat-highlight">
          <span class="panel-stat-value">${formatMoney(summary.periodTotal)}</span>
          <span class="panel-stat-label">Total no período</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${formatMoney(summary.pendingTotal)}</span>
          <span class="panel-stat-label">Pendente (${summary.pendingCount})</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${formatMoney(summary.overdueTotal)}</span>
          <span class="panel-stat-label">Atrasado (${summary.overdueCount})</span>
        </article>
      </div>

      ${this.financeError ? html`<div class="panel-alert">${this.financeError}</div>` : ''}

      <section class="panel-filters panel-filters-finance">
        <label class="panel-label">
          De
          <input type="date" name="financeFilterFrom" .value=${this.financeFilterFrom} @change=${this._onFinanceFilterChange}>
        </label>
        <label class="panel-label">
          Até
          <input type="date" name="financeFilterTo" .value=${this.financeFilterTo} @change=${this._onFinanceFilterChange}>
        </label>
        <div class="panel-label panel-filter-hint">
          Assinaturas ativas
          <span>${summary.activeSubscriptions} plano(s) recorrente(s)</span>
        </div>
      </section>

      <div class="panel-view-tabs">
        <button
          class="panel-view-tab ${this.financeViewMode === 'overview' ? 'is-active' : ''}"
          @click=${() => this._setFinanceView('overview')}
        >
          Resumo
        </button>
        <button
          class="panel-view-tab ${this.financeViewMode === 'payments' ? 'is-active' : ''}"
          @click=${() => this._setFinanceView('payments')}
        >
          Recebimentos
        </button>
        <button
          class="panel-view-tab ${this.financeViewMode === 'avulsos' ? 'is-active' : ''}"
          @click=${() => this._setFinanceView('avulsos')}
        >
          Avulsos
        </button>
        <button
          class="panel-view-tab ${this.financeViewMode === 'pending' ? 'is-active' : ''}"
          @click=${() => this._setFinanceView('pending')}
        >
          Pendentes
        </button>
      </div>

      ${this.financeLoading
        ? html`<p class="panel-empty">Carregando dados financeiros...</p>`
        : this.financeViewMode === 'overview'
          ? this._renderFinanceOverview()
          : this.financeViewMode === 'payments'
            ? this._renderFinancePayments()
            : this.financeViewMode === 'avulsos'
              ? this._renderFinanceAvulsos()
              : this._renderFinancePending()}
    `;
  }

  _renderFinanceOverview() {
    if (!this.financeSubscriptionBreakdown.length) {
      return html`<p class="panel-empty">Nenhuma assinatura ativa no momento.</p>`;
    }

    return html`
      <section class="panel-table-wrap">
        <h3 class="panel-section-title">Receita recorrente por plano</h3>
        <table class="panel-table panel-finance-table">
          <thead>
            <tr>
              <th>Plano</th>
              <th>Assinantes</th>
              <th>Valor unitário</th>
              <th>Total mensal</th>
            </tr>
          </thead>
          <tbody>
            ${this.financeSubscriptionBreakdown.map((item) => html`
              <tr>
                <td data-label="Plano"><strong>${item.planName}</strong></td>
                <td data-label="Assinantes">${item.count}</td>
                <td data-label="Valor unitário">${formatMoney(item.unitValue)}</td>
                <td data-label="Total mensal">${formatMoney(item.monthlyTotal)}</td>
              </tr>
            `)}
          </tbody>
        </table>
      </section>
    `;
  }

  _renderFinancePayments() {
    if (!this.financeReceivedPayments.length) {
      return html`<p class="panel-empty">Nenhum recebimento no período selecionado.</p>`;
    }

    return html`
      <section class="panel-table-wrap">
        <table class="panel-table panel-finance-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.financeReceivedPayments.map((item) => html`
              <tr>
                <td data-label="Data">${item.paymentDate ? formatDateBr(item.paymentDate) : '—'}</td>
                <td data-label="Cliente">${item.customerName}</td>
                <td data-label="Descrição">${item.description}</td>
                <td data-label="Valor">${formatMoney(item.netValue ?? item.value)}</td>
                <td data-label="Status">
                  <span class="panel-badge ${paymentStatusClass(item.status)}">${item.statusLabel}</span>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </section>
    `;
  }

  _renderFinanceAvulsos() {
    if (!this.financeAvulsoAppointments.length) {
      return html`<p class="panel-empty">Nenhum agendamento avulso no período selecionado.</p>`;
    }

    return html`
      <section class="panel-table-wrap">
        <table class="panel-table panel-finance-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Cliente</th>
              <th>Barbeiro</th>
              <th>Serviço</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${this.financeAvulsoAppointments.map((item) => html`
              <tr class=${item.status === 'cancelled' ? 'is-cancelled' : ''}>
                <td data-label="Data">${formatDateBr(item.date)}</td>
                <td data-label="Horário">${item.time}</td>
                <td data-label="Cliente">${item.customerName}</td>
                <td data-label="Barbeiro">${item.barberName}</td>
                <td data-label="Serviço">${item.planName.replace(/^Avulso — /, '')}</td>
                <td data-label="Valor">${formatMoney(item.price)}</td>
                <td data-label="Status">
                  <span class="panel-badge ${item.status}">
                    ${item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                  </span>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </section>
    `;
  }

  _renderFinancePending() {
    const pending = [
      ...this.financeOverduePayments.map((item) => ({ ...item, kind: 'overdue' })),
      ...this.financePendingPayments.map((item) => ({ ...item, kind: 'pending' })),
    ];

    if (!pending.length) {
      return html`<p class="panel-empty">Nenhum pagamento pendente ou atrasado.</p>`;
    }

    return html`
      <section class="panel-table-wrap">
        <table class="panel-table panel-finance-table">
          <thead>
            <tr>
              <th>Vencimento</th>
              <th>Cliente</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${pending.map((item) => html`
              <tr>
                <td data-label="Vencimento">${item.dueDate ? formatDateBr(item.dueDate) : '—'}</td>
                <td data-label="Cliente">${item.customerName}</td>
                <td data-label="Descrição">${item.description}</td>
                <td data-label="Valor">${formatMoney(item.value)}</td>
                <td data-label="Status">
                  <span class="panel-badge ${paymentStatusClass(item.status)}">${item.statusLabel}</span>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </section>
    `;
  }

  _renderSubscribers() {
    const stats = this.subscriberStats;
    const filtered = this._filteredSubscribers();

    return html`
      <div class="panel-stats">
        <article class="panel-stat">
          <span class="panel-stat-value">${stats.total}</span>
          <span class="panel-stat-label">Total de clientes</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${stats.active}</span>
          <span class="panel-stat-label">Assinaturas ativas</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${stats.inactive}</span>
          <span class="panel-stat-label">Inativas / expiradas</span>
        </article>
        <article class="panel-stat">
          <span class="panel-stat-value">${stats.none}</span>
          <span class="panel-stat-label">Sem assinatura</span>
        </article>
      </div>

      ${this.subscribersError ? html`<div class="panel-alert">${this.subscribersError}</div>` : ''}

      <section class="panel-filters panel-filters-subscribers">
        <label class="panel-label">
          Buscar por nome
          <input
            type="search"
            name="subscriberFilterName"
            .value=${this.subscriberFilterName}
            @input=${this._onSubscriberSearchChange}
            placeholder="Nome do cliente"
            autocomplete="off"
          >
        </label>
        <label class="panel-label">
          Buscar por CPF
          <input
            type="search"
            name="subscriberFilterCpf"
            .value=${this.subscriberFilterCpf}
            @input=${this._onSubscriberSearchChange}
            placeholder="000.000.000-00"
            inputmode="numeric"
            autocomplete="off"
          >
        </label>
        <label class="panel-label">
          Status da assinatura
          <select .value=${this.subscriberFilterStatus} @change=${this._onSubscriberFilterChange}>
            <option value="all">Todos</option>
            <option value="ACTIVE">Ativas</option>
            <option value="INACTIVE">Inativas</option>
            <option value="EXPIRED">Expiradas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="NONE">Sem assinatura</option>
          </select>
        </label>
      </section>

      ${this.subscriberFilterName || this.subscriberFilterCpf
        ? html`<p class="panel-search-hint">${filtered.length} de ${this.subscribers.length} cliente(s)</p>`
        : ''}

      <section class="panel-table-wrap">
        ${this.subscribersLoading
          ? html`<p class="panel-empty">Carregando clientes...</p>`
          : filtered.length === 0
            ? html`<p class="panel-empty">Nenhum cliente encontrado.</p>`
            : html`
              <table class="panel-table panel-subscribers-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                    <th>Plano</th>
                    <th>Valor</th>
                    <th>Próx. cobrança</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map((item) => html`
                    <tr
                      class="subscriber-row ${this.selectedSubscriber?.cpf === item.cpf ? 'is-selected' : ''}"
                      @click=${() => this._openSubscriberHistory(item)}
                      tabindex="0"
                      @keydown=${(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          this._openSubscriberHistory(item);
                        }
                      }}
                    >
                      <td data-label="Cliente"><strong>${item.name}</strong></td>
                      <td data-label="CPF">${formatCpf(item.cpf)}</td>
                      <td data-label="E-mail">${item.email || '—'}</td>
                      <td data-label="Telefone">${item.phone || '—'}</td>
                      <td data-label="Plano">${item.planName}</td>
                      <td data-label="Valor">${formatMoney(item.value)}</td>
                      <td data-label="Próx. cobrança">${item.nextDueDate ? formatDateBr(item.nextDueDate) : '—'}</td>
                      <td data-label="Status">
                        <span class="panel-badge ${subscriptionStatusClass(item.status)}">${item.statusLabel}</span>
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            `}
      </section>

      ${this._renderSubscriberHistory()}
    `;
  }

  _renderTable() {
    return html`
      <section class="panel-table-wrap">
        ${this.loading
          ? html`<p class="panel-empty">Carregando agendamentos...</p>`
          : this.appointments.length === 0
            ? html`<p class="panel-empty">Nenhum agendamento encontrado neste período.</p>`
            : html`
              <table class="panel-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Cliente</th>
                    <th>CPF</th>
                    <th>Barbeiro</th>
                    <th>Plano</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${this.appointments.map((item) => html`
                    <tr class=${item.status === 'cancelled' ? 'is-cancelled' : ''}>
                      <td data-label="Data">${formatDateBr(item.date)}</td>
                      <td data-label="Horário">${item.time}</td>
                      <td data-label="Cliente">${item.customerName}</td>
                      <td data-label="CPF">${formatCpf(item.cpf)}</td>
                      <td data-label="Barbeiro">${item.barberName}</td>
                      <td data-label="Plano">${item.planName}</td>
                      <td data-label="Status">
                        <span class="panel-badge ${item.status}">${item.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}</span>
                      </td>
                      <td data-label="Ações">
                        ${item.status === 'confirmed'
                          ? html`
                            <button
                              class="btn btn-sm btn-outline panel-cancel-btn"
                              @click=${() => this._cancelAppointment(item.id)}
                              ?disabled=${this.actionId === item.id}
                            >
                              ${this.actionId === item.id ? '...' : 'Cancelar'}
                            </button>
                          `
                          : html`<span class="panel-muted">—</span>`}
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            `}
      </section>
    `;
  }

  render() {
    if (!this.token) {
      return html`<admin-login @login-success=${this._onLoginSuccess}></admin-login>`;
    }

    const stats = this._stats();
    const byDate = groupByDate(this.appointments);

    return html`
      <header class="panel-header">
        <div class="container panel-header-inner">
          <a href="./index.html" class="logo">
            <span class="logo-icon">✂</span>
            <span>2k</span>
          </a>
          <div class="panel-header-actions">
            <button class="btn btn-sm btn-outline" @click=${() => this._refreshCurrentSection()} ?disabled=${this.loading || this.subscribersLoading || this.financeLoading}>
              Atualizar
            </button>
            <button class="btn btn-sm btn-outline" @click=${this._logout}>Sair</button>
          </div>
        </div>
      </header>

      <main class="panel-main container">
        <div class="panel-intro">
          <span class="panel-tag">Admin</span>
          <h1>Painel administrativo</h1>
          <p>${this.section === 'subscribers'
            ? 'Busque clientes por nome ou CPF e clique em um assinante para ver o histórico de agendamentos.'
            : this.section === 'finance'
              ? 'Acompanhe receitas de assinaturas (Asaas), agendamentos avulsos e cobranças pendentes.'
              : 'Visualize e gerencie os horários reservados pelos assinantes.'}</p>
        </div>

        <div class="panel-section-tabs">
          <button
            class="panel-section-tab ${this.section === 'appointments' ? 'is-active' : ''}"
            @click=${() => this._setSection('appointments')}
          >
            Agendamentos
          </button>
          <button
            class="panel-section-tab ${this.section === 'subscribers' ? 'is-active' : ''}"
            @click=${() => this._setSection('subscribers')}
          >
            Assinantes
          </button>
          <button
            class="panel-section-tab ${this.section === 'finance' ? 'is-active' : ''}"
            @click=${() => this._setSection('finance')}
          >
            Financeiro
          </button>
        </div>

        ${this.section === 'appointments' && this.error
          ? html`<div class="panel-alert">${this.error}</div>`
          : ''}

        ${this.section === 'subscribers'
          ? this._renderSubscribers()
          : this.section === 'finance'
            ? this._renderFinance()
            : html`
            <div class="panel-stats">
              <article class="panel-stat">
                <span class="panel-stat-value">${stats.total}</span>
                <span class="panel-stat-label">Total no período</span>
              </article>
              <article class="panel-stat">
                <span class="panel-stat-value">${stats.confirmed}</span>
                <span class="panel-stat-label">Confirmados</span>
              </article>
              <article class="panel-stat">
                <span class="panel-stat-value">${stats.gemeo1}</span>
                <span class="panel-stat-label">Gêmeo 1</span>
              </article>
              <article class="panel-stat">
                <span class="panel-stat-value">${stats.gemeo2}</span>
                <span class="panel-stat-label">Gêmeo 2</span>
              </article>
            </div>

            <div class="panel-view-tabs">
              <button
                class="panel-view-tab ${this.viewMode === 'calendar' ? 'is-active' : ''}"
                @click=${() => this._setView('calendar')}
              >
                Calendário
              </button>
              <button
                class="panel-view-tab ${this.viewMode === 'list' ? 'is-active' : ''}"
                @click=${() => this._setView('list')}
              >
                Lista
              </button>
            </div>

            <section class="panel-filters">
              ${this.viewMode === 'list'
                ? html`
                  <label class="panel-label">
                    De
                    <input type="date" name="filterFrom" .value=${this.filterFrom} @change=${this._onFilterChange}>
                  </label>
                  <label class="panel-label">
                    Até
                    <input type="date" name="filterTo" .value=${this.filterTo} @change=${this._onFilterChange}>
                  </label>
                `
                : html`
                  <div class="panel-label panel-filter-hint">
                    Período
                    <span>${formatDateBr(this.filterFrom)} — ${formatDateBr(this.filterTo)}</span>
                  </div>
                `}
              <label class="panel-label">
                Barbeiro
                <select name="filterBarber" .value=${this.filterBarber} @change=${this._onFilterChange}>
                  <option value="">Todos</option>
                  <option value="gemeo-1">Gêmeo 1</option>
                  <option value="gemeo-2">Gêmeo 2</option>
                </select>
              </label>
              <label class="panel-label">
                Status
                <select name="filterStatus" .value=${this.filterStatus} @change=${this._onFilterChange}>
                  <option value="confirmed">Confirmados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="all">Todos</option>
                </select>
              </label>
            </section>

            ${this.loading && this.viewMode === 'calendar'
              ? html`<p class="panel-empty">Carregando calendário...</p>`
              : this.viewMode === 'calendar'
                ? this._renderCalendar(byDate)
                : this._renderTable()}
          `}
      </main>
    `;
  }
}

customElements.define('admin-login', AdminLogin);
customElements.define('admin-app', AdminApp);
