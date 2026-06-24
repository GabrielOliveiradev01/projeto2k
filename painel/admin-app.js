import { LitElement, html } from 'https://esm.sh/lit@3.2.1';

const STORAGE_KEY = '2k-admin-token';
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatCpf(cpf) {
  const digits = String(cpf || '').replace(/\D/g, '');
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
      const response = await fetch('/.netlify/functions/admin-login', {
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
      this.error = error.message;
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
    filterBarber: { type: String },
    filterStatus: { type: String },
    filterFrom: { type: String },
    filterTo: { type: String },
    actionId: { type: String },
    viewMode: { type: String },
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
    this.filterBarber = '';
    this.filterStatus = 'confirmed';
    this.filterFrom = bounds.from;
    this.filterTo = bounds.to;
    this.actionId = '';
    this.viewMode = 'calendar';
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

  async _api(path, options = {}) {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      this._logout();
      throw new Error('Sessão expirada. Entre novamente.');
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
      this.error = error.message;
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
      this.error = error.message;
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
            <button class="btn btn-sm btn-outline" @click=${() => this.loadAppointments()} ?disabled=${this.loading}>
              Atualizar
            </button>
            <button class="btn btn-sm btn-outline" @click=${this._logout}>Sair</button>
          </div>
        </div>
      </header>

      <main class="panel-main container">
        <div class="panel-intro">
          <span class="panel-tag">Agendamentos</span>
          <h1>Painel administrativo</h1>
          <p>Visualize e gerencie os horários reservados pelos assinantes.</p>
        </div>

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

        ${this.error ? html`<div class="panel-alert">${this.error}</div>` : ''}

        ${this.loading && this.viewMode === 'calendar'
          ? html`<p class="panel-empty">Carregando calendário...</p>`
          : this.viewMode === 'calendar'
            ? this._renderCalendar(byDate)
            : this._renderTable()}
      </main>
    `;
  }
}

customElements.define('admin-login', AdminLogin);
customElements.define('admin-app', AdminApp);
