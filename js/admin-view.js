/**
 * admin-view.js - Vista Administrativa / Supervisor para Waldrige Renovation LLC
 * Control total de nóminas (Lunes a Viernes), recibos de gastos con fotos y PDF,
 * tarjetas y membresías de tiendas, comprobantes individuales y bilingüe (ES/EN).
 */

import { store, calculateHoursWorked, formatDateISO } from './store.js';
import { calendar } from './calendar.js';
import { t, i18n } from './i18n.js';
import { openIndividualPayStubModal } from './paystub.js';
import { showReceiptLightbox, printReceiptsReport, getCategoryLabel } from './receipts-manager.js';

export class AdminView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'payroll'; // 'payroll' | 'receipts' | 'cards' | 'employees' | 'settings'
    this.selectedReceiptFilter = 'all';
  }

  render() {
    if (!this.container) return;

    const weekDays = calendar.getWeekDays();
    const allSummaries = store.getAllEmployeesWeeklySummary(weekDays);
    const weekLabel = calendar.getWeekLabel();
    const receipts = store.getReceipts();

    // Métricas globales
    let companyTotalHours = 0;
    let companyTotalPayroll = 0;
    let companyTotalPaid = 0;
    let companyTotalBalanceDue = 0;

    allSummaries.forEach(s => {
      companyTotalHours += s.totalHours;
      companyTotalPayroll += s.totalEarnings;
      const payment = s.payment || {};
      const paid = parseFloat(payment.amountPaid) || 0;
      const due = payment.balanceDue !== undefined ? payment.balanceDue : Math.max(0, s.totalEarnings - paid);
      companyTotalPaid += paid;
      companyTotalBalanceDue += due;
    });

    companyTotalHours = Math.round(companyTotalHours * 100) / 100;
    companyTotalPayroll = Math.round(companyTotalPayroll * 100) / 100;
    companyTotalPaid = Math.round(companyTotalPaid * 100) / 100;
    companyTotalBalanceDue = Math.round(companyTotalBalanceDue * 100) / 100;

    // Total de gastos
    let companyTotalExpenses = 0;
    receipts.forEach(r => { companyTotalExpenses += (parseFloat(r.amount) || 0); });

    this.container.innerHTML = `
      <!-- Encabezado Administrativo -->
      <section class="admin-top-panel">
        <div class="admin-welcome">
          <div class="badge-admin-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Waldrige Renovation LLC &bull; ${t('taglineAdmin')}
          </div>
          <h1 class="admin-main-title">${t('taglineAdmin')}</h1>
          <p class="admin-subtitle">Gestión consolidada de horas (Lun-Vie), nóminas semanales, saldo pendiente y gastos.</p>
        </div>

        <div class="admin-global-kpis">
          <div class="kpi-card">
            <span class="kpi-title">${t('totalWeeklyPayroll')}</span>
            <span class="kpi-number text-success">$${companyTotalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="kpi-foot">${companyTotalHours} hrs trabajadas</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">${t('balanceRemaining')} (Por Pagar)</span>
            <span class="kpi-number ${companyTotalBalanceDue > 0 ? 'text-danger' : 'text-success'}">
              $${companyTotalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span class="kpi-foot">Pagado: $${companyTotalPaid.toFixed(2)}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">${t('totalExpenses')}</span>
            <span class="kpi-number text-accent">$${companyTotalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="kpi-foot">${receipts.length} recibos registrados</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-title">${t('workTeam')}</span>
            <span class="kpi-number">${allSummaries.length}</span>
            <span class="kpi-foot">${t('activeEmployees')}</span>
          </div>
        </div>
      </section>

      <!-- Barra de Pestañas Principales -->
      <section class="admin-toolbar-section">
        <div class="admin-tabs">
          <button class="admin-tab-btn ${this.activeTab === 'payroll' ? 'active' : ''}" id="tab-payroll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            ${t('tabPayroll')}
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'receipts' ? 'active' : ''}" id="tab-receipts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            ${t('tabReceipts')} (${receipts.length})
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'cards' ? 'active' : ''}" id="tab-cards">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            ${t('tabCards')}
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'employees' ? 'active' : ''}" id="tab-employees">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
            ${t('tabEmployees')}
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'settings' ? 'active' : ''}" id="tab-settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            ${t('tabSettings')}
          </button>
        </div>

        <div class="admin-actions-right">
          ${this.activeTab === 'payroll' ? `
            <button class="btn btn-outline" id="btn-print-payroll" title="Imprimir Nómina Semanal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              ${t('printPayrollPdf')}
            </button>
            <button class="btn btn-outline" id="btn-export-csv">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              ${t('exportCsv')}
            </button>
            <button class="btn btn-primary" id="btn-open-new-employee">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              ${t('newEmployeeBtn')}
            </button>
          ` : ''}

          ${this.activeTab === 'receipts' ? `
            <button class="btn btn-outline" id="btn-print-receipts-report">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              ${t('printReceiptsPdf')}
            </button>
          ` : ''}

          ${this.activeTab === 'cards' ? `
            <button class="btn btn-primary" id="btn-add-card-top">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              ${t('addCardBtn')}
            </button>
          ` : ''}

          ${this.activeTab === 'employees' ? `
            <button class="btn btn-primary" id="btn-add-employee-top">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              ${t('newEmployeeBtn')}
            </button>
          ` : ''}
        </div>
      </section>

      <!-- Contenido de la pestaña activa -->
      <div id="admin-tab-content">
        ${this.activeTab === 'payroll' ? this.renderPayrollTab(allSummaries, weekDays, weekLabel) : ''}
        ${this.activeTab === 'receipts' ? this.renderReceiptsTab(receipts) : ''}
        ${this.activeTab === 'cards' ? this.renderCardsTab() : ''}
        ${this.activeTab === 'employees' ? this.renderEmployeesTab() : ''}
        ${this.activeTab === 'settings' ? this.renderSettingsTab() : ''}
      </div>

      <!-- Modales Administrativos -->
      ${this.renderModals()}
    `;

    this.bindEvents(allSummaries, weekDays, receipts);
  }

  // ==========================================
  // Pestaña 1: Nómina Semanal (Lunes a Viernes)
  // ==========================================
  renderPayrollTab(allSummaries, weekDays, weekLabel) {
    return `
      <div class="week-navigation-bar" style="margin-bottom: 1.5rem;">
        <div class="week-nav-controls">
          <button class="btn btn-outline btn-sm" id="btn-admin-prev-week" title="${t('prevWeek')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            ${t('prevWeek')}
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-admin-current-week">${t('currentWeek')}</button>
          <button class="btn btn-outline btn-sm" id="btn-admin-next-week" title="${t('nextWeek')}">
            ${t('nextWeek')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div class="week-title-display">
          <span class="week-text font-bold">${escapeHtml(weekLabel)}</span>
        </div>

        <div class="week-date-picker">
          <input type="date" id="admin-date-select" class="input-date input-sm">
        </div>
      </div>

      <!-- Tabla Consolidada Lunes a Viernes -->
      <div class="table-responsive-container">
        <table class="payroll-table" id="payroll-table-main">
          <thead>
            <tr>
              <th class="col-employee">${t('colEmployee')}</th>
              <th class="col-rate">${t('colRate')}</th>
              ${weekDays.map(d => `
                <th class="col-day ${d.isToday ? 'th-today' : ''}">
                  <span class="th-day-name">${d.shortName}</span>
                  <span class="th-day-date">${d.dateFormatted}</span>
                </th>
              `).join('')}
              <th class="col-total-hours">${t('colTotalHours')}</th>
              <th class="col-total-pay">${t('colTotalPay')}</th>
              <th class="col-payment-status">${t('colPaymentStatus')}</th>
              <th class="col-balance-due">${t('colBalanceDue')}</th>
              <th class="col-actions">${t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            ${allSummaries.length === 0 ? `
              <tr>
                <td colspan="12" class="text-center py-5 text-muted">${t('noEmployeesFound')}</td>
              </tr>
            ` : allSummaries.map(s => {
              const emp = s.employee;
              const payment = s.payment || {};
              const amountPaid = parseFloat(payment.amountPaid) || 0;
              const balanceDue = payment.balanceDue !== undefined ? payment.balanceDue : Math.max(0, s.totalEarnings - amountPaid);

              let statusBadgeClass = 'badge-pending';
              let statusText = t('statusPending');
              if (payment.status === 'paid') {
                statusBadgeClass = 'badge-success';
                statusText = t('statusPaid');
              } else if (payment.status === 'partial') {
                statusBadgeClass = 'badge-warning';
                statusText = `${t('statusPartial')} ($${amountPaid.toFixed(2)})`;
              }

              return `
                <tr class="payroll-row" data-emp-id="${emp.id}">
                  <td class="cell-employee">
                    <div class="emp-table-badge">
                      <span class="emp-avatar-sm" style="background-color: ${emp.color};">
                        ${this.getInitials(emp.name)}
                      </span>
                      <div class="emp-table-names">
                        <strong class="emp-name-text">${escapeHtml(emp.name)}</strong>
                        <span class="emp-role-small">${escapeHtml(emp.role || 'Operario')}</span>
                      </div>
                    </div>
                  </td>

                  <td class="cell-rate">
                    $${emp.hourlyRate.toFixed(2)}/hr
                  </td>

                  ${s.weekDays.map(d => {
                    const hasHours = d.hours > 0;
                    return `
                      <td class="cell-day ${hasHours ? 'has-hours' : 'empty-day'}" 
                          data-emp-id="${emp.id}" 
                          data-date="${d.dateISO}"
                          title="${d.entry ? `${d.entry.address ? `📍 ${escapeHtml(d.entry.address)} | ` : ''}${escapeHtml(d.entry.workDone || d.entry.notes || '')}` : 'Clic para editar horas'}">
                        <button class="btn-cell-hour" style="border-left: 3px solid ${hasHours ? emp.color : 'transparent'};">
                          ${hasHours ? `${d.hours.toFixed(1)}h` : '-'}
                        </button>
                      </td>
                    `;
                  }).join('')}

                  <td class="cell-total-hours">
                    <strong>${s.totalHours.toFixed(2)} hrs</strong>
                  </td>

                  <td class="cell-total-pay">
                    <strong class="text-success">$${s.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </td>

                  <td class="cell-status">
                    <button class="badge-status-btn ${statusBadgeClass} btn-open-payment-modal" data-emp-id="${emp.id}" title="Clic para actualizar pago o saldo">
                      ${statusText}
                    </button>
                  </td>

                  <td class="cell-balance">
                    <strong class="${balanceDue > 0 ? 'text-danger font-bold' : 'text-success'}">
                      $${balanceDue.toFixed(2)}
                    </strong>
                  </td>

                  <td class="cell-actions">
                    <button class="btn-icon btn-print-single-stub" data-emp-id="${emp.id}" title="${t('printPayStub')}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <button class="btn-icon btn-edit-emp-quick" data-id="${emp.id}" title="Editar tarifa o perfil">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="payroll-footer-row">
              <td colspan="2"><strong>${t('weeklyTotals')}</strong></td>
              ${weekDays.map(d => {
                let dayTotal = 0;
                allSummaries.forEach(s => {
                  const dayObj = s.weekDays.find(w => w.dateISO === d.dateISO);
                  if (dayObj) dayTotal += dayObj.hours;
                });
                return `<td><strong>${dayTotal > 0 ? dayTotal.toFixed(1) + 'h' : '-'}</strong></td>`;
              }).join('')}
              <td><strong class="text-accent">${allSummaries.reduce((sum, s) => sum + s.totalHours, 0).toFixed(2)} hrs</strong></td>
              <td><strong class="text-success">$${allSummaries.reduce((sum, s) => sum + s.totalEarnings, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td></td>
              <td><strong class="text-danger">$${allSummaries.reduce((sum, s) => sum + (s.payment ? s.payment.balanceDue : s.totalEarnings), 0).toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  // ==========================================
  // Pestaña 2: Gastos & Recibos Fotográficos
  // ==========================================
  renderReceiptsTab(receipts) {
    let filtered = receipts;
    if (this.selectedReceiptFilter !== 'all') {
      filtered = receipts.filter(r => r.employeeId === this.selectedReceiptFilter);
    }

    const employees = store.getEmployees(true);

    return `
      <div class="receipts-admin-view">
        <div class="section-subhead">
          <div>
            <h3>${t('receiptsTitle')}</h3>
            <p class="text-muted">${t('receiptsSubtitle')}</p>
          </div>
          <div class="filter-controls">
            <label for="filter-receipt-employee" class="text-sm">Filtrar por empleado:</label>
            <select id="filter-receipt-employee" class="input-select input-sm">
              <option value="all">Todos los empleados</option>
              ${employees.map(e => `
                <option value="${e.id}" ${this.selectedReceiptFilter === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>
              `).join('')}
            </select>
          </div>
        </div>

        ${filtered.length === 0 ? `
          <div class="empty-state-box text-center py-5">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <h4 class="mt-3 text-muted">${t('noReceiptsYet')}</h4>
            <p class="text-muted text-sm">Los comprobantes fotográficos subidos por los operarios se mostrarán aquí listos para contabilidad.</p>
          </div>
        ` : `
          <div class="table-responsive-container">
            <table class="payroll-table">
              <thead>
                <tr>
                  <th style="width: 70px;">Recibo</th>
                  <th>${t('storeName')}</th>
                  <th>${t('colEmployee')}</th>
                  <th>${t('expenseDate')}</th>
                  <th>${t('category')}</th>
                  <th>${t('paymentMethod')}</th>
                  <th>${t('expenseAmount')}</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(r => `
                  <tr>
                    <td class="text-center">
                      ${r.imageBase64 ? `
                        <div class="receipt-admin-thumbnail" data-id="${r.id}" title="Clic para ampliar recibo">
                          <img src="${r.imageBase64}" alt="${escapeHtml(r.storeName)}">
                        </div>
                      ` : '<span class="text-muted text-xs">Sin foto</span>'}
                    </td>
                    <td><strong>${escapeHtml(r.storeName)}</strong></td>
                    <td>${escapeHtml(r.employeeName)}</td>
                    <td>${r.date}</td>
                    <td>${getCategoryLabel(r.category)}</td>
                    <td><span class="badge-card-tag">${escapeHtml(r.paymentCardName || 'Efectivo')}</span></td>
                    <td class="font-bold text-success">$${parseFloat(r.amount).toFixed(2)}</td>
                    <td>
                      <span class="badge ${r.status === 'approved' ? 'badge-success' : (r.status === 'reimbursed' ? 'badge-info' : 'badge-warning')}">
                        ${r.status === 'approved' ? 'Aprobado' : (r.status === 'reimbursed' ? 'Reembolsado' : 'Pendiente')}
                      </span>
                    </td>
                    <td>
                      <button class="btn-icon btn-view-receipt-large" data-id="${r.id}" title="${t('viewReceiptPhoto')}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                      </button>
                      <button class="btn-icon btn-delete-receipt text-danger" data-id="${r.id}" title="${t('deleteReceipt')}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  // ==========================================
  // Pestaña 3: Tarjetas de Banco & Membresías
  // ==========================================
  renderCardsTab() {
    const cards = store.getCards();

    return `
      <div class="cards-management-view">
        <div class="section-subhead">
          <div>
            <h3>${t('cardsTitle')}</h3>
            <p class="text-muted">${t('cardsSubtitle')}</p>
          </div>
          <button class="btn btn-primary" id="btn-add-card-tab">
            ${t('addCardBtn')}
          </button>
        </div>

        <div class="cards-grid-admin">
          ${cards.map(c => `
            <div class="company-card-box ${c.type}">
              <div class="card-chip-header">
                <span class="card-type-label">
                  ${c.type === 'store_membership' ? 'Membresía de Tienda' : (c.type === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito')}
                </span>
                <span class="card-last4-chip">${escapeHtml(c.last4 || 'N/A')}</span>
              </div>
              <h4 class="card-brand-name">${escapeHtml(c.name)}</h4>
              <p class="card-holder-name">${escapeHtml(c.holder || 'Waldrige Renovation LLC')}</p>
              ${c.notes ? `<div class="card-instructions"><strong>Instrucciones:</strong> ${escapeHtml(c.notes)}</div>` : ''}
              
              <div class="card-actions-row">
                <button class="btn btn-outline btn-sm btn-edit-card" data-id="${c.id}">Editar</button>
                <button class="btn btn-danger-outline btn-sm btn-delete-card" data-id="${c.id}">Eliminar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // Pestaña 4: Gestión de Empleados
  // ==========================================
  renderEmployeesTab() {
    const employees = store.getEmployees(true);

    return `
      <div class="employees-management-view">
        <div class="section-subhead">
          <div>
            <h3>Listado Completo de Empleados (${employees.length})</h3>
            <p class="text-muted">Gestiona tarifas por hora, colores corporativos y claves de acceso.</p>
          </div>
          <button class="btn btn-primary" id="btn-add-employee-tab">
            ${t('newEmployeeBtn')}
          </button>
        </div>

        <div class="employees-card-grid">
          ${employees.map(emp => `
            <div class="employee-card-admin" style="border-top: 4px solid ${emp.color};">
              <div class="emp-card-header">
                <div class="emp-avatar-md" style="background-color: ${emp.color};">
                  ${this.getInitials(emp.name)}
                </div>
                <div>
                  <h4 class="emp-card-name">${escapeHtml(emp.name)}</h4>
                  <span class="emp-card-role">${escapeHtml(emp.role || 'Operario')}</span>
                </div>
              </div>

              <div class="emp-card-details">
                <div class="detail-row">
                  <span class="detail-label">Tarifa por Hora:</span>
                  <strong class="detail-val">$${emp.hourlyRate.toFixed(2)}/hr</strong>
                </div>
                <div class="detail-row">
                  <span class="detail-label">PIN de Acceso:</span>
                  <code class="detail-pin">${emp.pin || '1234'}</code>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Color:</span>
                  <span class="color-badge-sample">
                    <span class="color-dot" style="background-color: ${emp.color};"></span>
                    ${emp.color}
                  </span>
                </div>
              </div>

              <div class="emp-card-actions">
                <button class="btn btn-outline btn-sm btn-edit-employee" data-id="${emp.id}">Editar Perfil</button>
                <button class="btn btn-danger-outline btn-sm btn-delete-employee" data-id="${emp.id}">Eliminar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // Pestaña 5: Configuración & Respaldo
  // ==========================================
  renderSettingsTab() {
    const settings = store.settings;
    const currentLang = i18n.getLanguage();

    return `
      <div class="settings-management-view">
        <div class="settings-grid">
          <!-- Selector de Idioma -->
          <div class="settings-card">
            <h3>${t('language')} / Language</h3>
            <p class="text-muted">Cambia el idioma de toda la plataforma a Español o Inglés.</p>
            
            <div class="language-picker-group mt-3">
              <button type="button" class="btn ${currentLang === 'es' ? 'btn-primary' : 'btn-outline'} btn-lang-switch" data-lang="es">
                🇪🇸 Español (Predeterminado)
              </button>
              <button type="button" class="btn ${currentLang === 'en' ? 'btn-primary' : 'btn-outline'} btn-lang-switch" data-lang="en">
                🇺🇸 English (US)
              </button>
            </div>
          </div>

          <!-- Clave Maestra -->
          <div class="settings-card">
            <h3>Clave Maestra de Administrador</h3>
            <p class="text-muted">Acceso total al panel de administración y supervisión general.</p>
            
            <div class="settings-security-notice mt-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>${t('masterKeySecurityNotice')}</span>
            </div>

            <form id="admin-pin-form" class="mt-3">
              <div class="form-group">
                <label for="admin-pin-curr">${t('currentMasterKeyLabel')}</label>
                <input type="password" id="admin-pin-curr" class="input-text" placeholder="${t('enterCurrentMasterKeyPlaceholder')}" required autocomplete="off">
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label for="admin-pin-new">${t('newMasterKeyLabel')}</label>
                  <input type="password" id="admin-pin-new" class="input-text" placeholder="${t('enterNewMasterKeyPlaceholder')}" required autocomplete="new-password">
                </div>
                <div class="form-group">
                  <label for="admin-pin-confirm">${t('confirmMasterKeyLabel')}</label>
                  <input type="password" id="admin-pin-confirm" class="input-text" placeholder="${t('confirmNewMasterKeyPlaceholder')}" required autocomplete="new-password">
                </div>
              </div>

              <div id="admin-pin-alert" style="display: none; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); font-size: 0.85rem;"></div>

              <button type="submit" class="btn btn-primary mt-2">Actualizar Clave Maestra</button>
            </form>
          </div>

          <!-- Horario Oficial -->
          <div class="settings-card">
            <h3>Horario y Reglas Oficiales</h3>
            <p class="text-muted">Formato oficial para Waldrige Renovation LLC.</p>

            <div class="settings-info-list mt-3">
              <div class="info-item"><strong>Días Laborables:</strong> Lunes a Viernes (Fijo)</div>
              <div class="info-item"><strong>Horario Permitido:</strong> 8:00 AM a 7:00 PM (11 hrs máx/día)</div>
              <div class="info-item"><strong>Empresa:</strong> Waldrige Renovation LLC</div>
            </div>
          </div>

          <!-- Copia de Seguridad JSON -->
          <div class="settings-card full-width">
            <h3>Copia de Seguridad y Respaldo</h3>
            <p class="text-muted">Descarga un archivo seguro con todos los empleados, horas, recibos y pagos para resguardar la información.</p>
            
            <div class="backup-actions mt-3">
              <button class="btn btn-primary" id="btn-download-backup">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Descargar Respaldo Completo (.json)
              </button>

              <label class="btn btn-outline btn-upload-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Restaurar Respaldo (.json)
                <input type="file" id="file-restore-backup" accept=".json" style="display: none;">
              </label>

              <button class="btn btn-danger-outline" id="btn-reset-demo">
                Restablecer a Datos Iniciales
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // Renderizado de Modales
  // ==========================================
  renderModals() {
    return `
      <!-- Modal para Agregar / Editar Empleado -->
      <div class="modal-overlay" id="employee-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="employee-modal-title">${t('newEmployeeBtn')}</h3>
            <button class="btn-close-modal" id="btn-close-emp-modal">&times;</button>
          </div>
          <form id="employee-form" class="modal-form">
            <input type="hidden" id="emp-edit-id" value="">

            <div class="form-group">
              <label for="new-emp-name">${t('enterFullName')} *</label>
              <input type="text" id="new-emp-name" placeholder="Ej. Roberto Sánchez" class="input-text" required>
            </div>

            <div class="form-group">
              <label for="new-emp-role">${t('yourRoleSpecialty')}</label>
              <input type="text" id="new-emp-role" placeholder="Ej. Yeso, Carpintería, Pintura..." class="input-text">
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="new-emp-rate">${t('colRate')} ($/hr) *</label>
                <div class="currency-input-wrapper">
                  <span class="currency-symbol">$</span>
                  <input type="number" id="new-emp-rate" min="1" step="0.5" placeholder="25.00" class="input-number" required>
                </div>
              </div>
              <div class="form-group">
                <label for="new-emp-pin">PIN Personal *</label>
                <input type="text" id="new-emp-pin" maxlength="6" placeholder="1234" class="input-text" required>
              </div>
            </div>

            <div class="form-group">
              <label>${t('chooseColor')}</label>
              <div class="color-picker-container">
                <div class="color-palette-presets" id="palette-presets">
                  <button type="button" class="preset-color-btn active" style="background-color: #2563EB;" data-color="#2563EB"></button>
                  <button type="button" class="preset-color-btn" style="background-color: #059669;" data-color="#059669"></button>
                  <button type="button" class="preset-color-btn" style="background-color: #D97706;" data-color="#D97706"></button>
                  <button type="button" class="preset-color-btn" style="background-color: #7C3AED;" data-color="#7C3AED"></button>
                  <button type="button" class="preset-color-btn" style="background-color: #DC2626;" data-color="#DC2626"></button>
                  <button type="button" class="preset-color-btn" style="background-color: #0891B2;" data-color="#0891B2"></button>
                </div>
                <div class="custom-color-input">
                  <input type="color" id="new-emp-color" value="#2563EB" class="input-color">
                  <span id="hex-color-display" class="hex-text">#2563EB</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-emp-modal">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary" id="btn-save-emp">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Registrar o Actualizar Pago Semanal & Saldo (Admin) -->
      <div class="modal-overlay" id="admin-payment-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${t('updatePaymentStatus')}</h3>
            <button class="btn-close-modal" id="btn-close-admin-pay-modal">&times;</button>
          </div>
          <form id="admin-payment-form" class="modal-form">
            <input type="hidden" id="pay-emp-id" value="">
            <div id="pay-emp-summary-banner" class="modal-calculation-preview"></div>

            <div class="form-group">
              <label for="admin-amount-paid-input">${t('paidAmount')} ($) *</label>
              <div class="currency-input-wrapper">
                <span class="currency-symbol">$</span>
                <input type="number" id="admin-amount-paid-input" step="0.01" min="0" class="input-number" required>
              </div>
              <div class="quick-presets mt-2">
                <button type="button" class="btn-preset" id="btn-admin-pay-all">Marcar Pagado Completo</button>
                <button type="button" class="btn-preset" id="btn-admin-pay-zero">Pendiente ($0)</button>
              </div>
            </div>

            <div class="form-group">
              <label>${t('balanceRemaining')}:</label>
              <div class="balance-display-box">
                <span id="admin-live-balance-due" class="font-bold" style="font-size: 1.3rem;">$0.00</span>
              </div>
            </div>

            <div class="form-group">
              <label for="admin-payment-notes-input">Notas o Detalles del Pago:</label>
              <input type="text" id="admin-payment-notes-input" placeholder="Ej. Pago en cheque #402, Zelle, efectivo..." class="input-text">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-admin-pay">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Agregar / Editar Tarjeta o Membresía -->
      <div class="modal-overlay" id="card-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="card-modal-title">${t('addCardBtn')}</h3>
            <button class="btn-close-modal" id="btn-close-card-modal">&times;</button>
          </div>
          <form id="card-form" class="modal-form">
            <input type="hidden" id="card-edit-id" value="">

            <div class="form-group">
              <label for="card-name-input">${t('cardName')} *</label>
              <input type="text" id="card-name-input" placeholder="Ej. The Home Depot Pro Xtra, Lowe's MVP..." class="input-text" required>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="card-type-select">${t('cardType')}</label>
                <select id="card-type-select" class="input-select">
                  <option value="store_membership">${t('cardTypeStore')}</option>
                  <option value="credit">${t('cardTypeCredit')}</option>
                  <option value="debit">${t('cardTypeDebit')}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="card-last4-input">${t('cardLast4')}</label>
                <input type="text" id="card-last4-input" placeholder="Ej. 4821 o PRO-99" class="input-text">
              </div>
            </div>

            <div class="form-group">
              <label for="card-holder-input">${t('cardHolder')}</label>
              <input type="text" id="card-holder-input" value="Waldrige Renovation LLC" class="input-text">
            </div>

            <div class="form-group">
              <label for="card-notes-input">${t('cardNotes')}</label>
              <input type="text" id="card-notes-input" placeholder="Ej. Indicar teléfono 555-123-4567 en caja..." class="input-text">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-card-modal">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para que el Admin Edite Horas en Celda -->
      <div class="modal-overlay" id="admin-entry-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>Modificar Registro de Horas</h3>
            <button class="btn-close-modal" id="btn-close-admin-entry">&times;</button>
          </div>
          <form id="admin-entry-form" class="modal-form">
            <input type="hidden" id="admin-entry-empid" value="">
            <input type="hidden" id="admin-entry-date" value="">

            <div class="admin-emp-info-pill" id="admin-entry-emp-info"></div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="admin-entry-start">${t('startTimeLabel')}</label>
                <input type="time" id="admin-entry-start" min="08:00" max="19:00" class="input-time">
              </div>
              <div class="form-group">
                <label for="admin-entry-end">${t('endTimeLabel')}</label>
                <input type="time" id="admin-entry-end" min="08:00" max="19:00" class="input-time">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="admin-entry-lunch">${t('lunchTimeLabel')}</label>
                <select id="admin-entry-lunch" class="input-select">
                  <option value="0">${t('noLunch')}</option>
                  <option value="30">${t('lunch30')}</option>
                  <option value="60">${t('lunch60')}</option>
                  <option value="90">${t('lunch90')}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="admin-entry-direct-hours">O Horas Directas</label>
                <input type="number" id="admin-entry-direct-hours" min="0" max="11" step="0.25" placeholder="8.0" class="input-number">
              </div>
            </div>

            <div class="form-group">
              <label for="admin-entry-address">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${t('workAddressLabel')}
              </label>
              <input type="text" id="admin-entry-address" class="input-text" placeholder="${t('workAddressPlaceholder')}">
            </div>

            <div class="form-group">
              <label for="admin-entry-work-done">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                ${t('workDoneLabel')}
              </label>
              <textarea id="admin-entry-work-done" rows="2" class="input-textarea" placeholder="${t('workDonePlaceholder')}"></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-danger-outline" id="btn-admin-delete-entry">${t('deleteDayEntryBtn')}</button>
              <button type="button" class="btn btn-outline" id="btn-cancel-admin-entry">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ==========================================
  // Enlace de Eventos y Lógica
  // ==========================================
  bindEvents(allSummaries, weekDays, receipts) {
    // 1. Pestañas
    const switchTab = (tab) => {
      this.activeTab = tab;
      this.render();
    };
    document.getElementById('tab-payroll')?.addEventListener('click', () => switchTab('payroll'));
    document.getElementById('tab-receipts')?.addEventListener('click', () => switchTab('receipts'));
    document.getElementById('tab-cards')?.addEventListener('click', () => switchTab('cards'));
    document.getElementById('tab-employees')?.addEventListener('click', () => switchTab('employees'));
    document.getElementById('tab-settings')?.addEventListener('click', () => switchTab('settings'));

    // 2. Navegación de semana
    document.getElementById('btn-admin-prev-week')?.addEventListener('click', () => {
      calendar.prevWeek();
      this.render();
    });
    document.getElementById('btn-admin-next-week')?.addEventListener('click', () => {
      calendar.nextWeek();
      this.render();
    });
    document.getElementById('btn-admin-current-week')?.addEventListener('click', () => {
      calendar.goToToday();
      this.render();
    });
    document.getElementById('admin-date-select')?.addEventListener('change', (e) => {
      if (e.target.value) {
        calendar.goToDate(e.target.value);
        this.render();
      }
    });

    // 3. Imprimir nómina general / Exportar CSV
    document.getElementById('btn-print-payroll')?.addEventListener('click', () => window.print());
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      this.exportPayrollCSV(allSummaries, weekDays);
    });

    // 4. Imprimir Reporte de Gastos / PDF
    document.getElementById('btn-print-receipts-report')?.addEventListener('click', () => {
      printReceiptsReport(receipts, `Reporte Consolidado de Gastos - ${calendar.getWeekLabel()}`);
    });

    // 5. Filtro de recibos por empleado
    document.getElementById('filter-receipt-employee')?.addEventListener('change', (e) => {
      this.selectedReceiptFilter = e.target.value;
      this.render();
    });

    // 6. Miniaturas de recibos y botón de ver recibo en grande
    this.container.querySelectorAll('.receipt-admin-thumbnail, .btn-view-receipt-large').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const r = store.getReceiptById(id);
        if (r) showReceiptLightbox(r);
      });
    });

    // Borrar recibo
    this.container.querySelectorAll('.btn-delete-receipt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Estás seguro de eliminar este recibo de gasto?')) {
          store.deleteReceipt(id);
          this.render();
        }
      });
    });

    // 7. Imprimir comprobante individual (Pay Stub) desde la tabla de nómina
    this.container.querySelectorAll('.btn-print-single-stub').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = e.currentTarget.getAttribute('data-emp-id');
        const summary = allSummaries.find(s => s.employee.id === empId);
        if (summary) {
          openIndividualPayStubModal(summary, calendar.getWeekLabel());
        }
      });
    });

    // 8. Modal de actualización de Pago Semanal y Saldo
    const payModal = document.getElementById('admin-payment-modal');
    const btnClosePay = document.getElementById('btn-close-admin-pay-modal');
    const btnCancelPay = document.getElementById('btn-cancel-admin-pay');
    const payEmpIdInput = document.getElementById('pay-emp-id');
    const payAmountInput = document.getElementById('admin-amount-paid-input');
    const payLiveBalance = document.getElementById('admin-live-balance-due');
    const paySummaryBanner = document.getElementById('pay-emp-summary-banner');
    const payNotesInput = document.getElementById('admin-payment-notes-input');

    let currentSelectedSummary = null;

    const openAdminPayModal = (empId) => {
      const summary = allSummaries.find(s => s.employee.id === empId);
      if (!summary || !payModal) return;
      currentSelectedSummary = summary;

      payEmpIdInput.value = empId;
      const payment = summary.payment || {};
      const paid = parseFloat(payment.amountPaid) || 0;
      payAmountInput.value = paid > 0 ? paid : '';
      payNotesInput.value = payment.notes || '';

      paySummaryBanner.innerHTML = `
        <div class="calc-row">
          <span>Empleado:</span>
          <strong>${escapeHtml(summary.employee.name)}</strong>
        </div>
        <div class="calc-row">
          <span>Total Nómina Ganada:</span>
          <strong class="text-success">$${summary.totalEarnings.toFixed(2)} (${summary.totalHours.toFixed(2)} hrs)</strong>
        </div>
      `;

      updateAdminLiveBalance();
      payModal.style.display = 'flex';
    };

    const closeAdminPayModal = () => { if (payModal) payModal.style.display = 'none'; };
    btnClosePay?.addEventListener('click', closeAdminPayModal);
    btnCancelPay?.addEventListener('click', closeAdminPayModal);

    const updateAdminLiveBalance = () => {
      if (!currentSelectedSummary) return;
      const paid = parseFloat(payAmountInput.value) || 0;
      const balance = Math.max(0, currentSelectedSummary.totalEarnings - paid);
      if (payLiveBalance) {
        payLiveBalance.textContent = `$${balance.toFixed(2)}`;
        payLiveBalance.className = balance > 0 ? 'text-danger font-bold' : 'text-success font-bold';
      }
    };

    payAmountInput?.addEventListener('input', updateAdminLiveBalance);

    document.getElementById('btn-admin-pay-all')?.addEventListener('click', () => {
      if (currentSelectedSummary && payAmountInput) {
        payAmountInput.value = currentSelectedSummary.totalEarnings.toFixed(2);
        updateAdminLiveBalance();
      }
    });

    document.getElementById('btn-admin-pay-zero')?.addEventListener('click', () => {
      if (payAmountInput) {
        payAmountInput.value = '0';
        updateAdminLiveBalance();
      }
    });

    document.getElementById('admin-payment-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentSelectedSummary) return;
      const empId = payEmpIdInput.value;
      const amountPaid = parseFloat(payAmountInput.value) || 0;
      const notes = payNotesInput.value;

      store.saveWeeklyPayment(empId, currentSelectedSummary.mondayISO, {
        totalEarnings: currentSelectedSummary.totalEarnings,
        amountPaid: amountPaid,
        notes: notes,
        recordedBy: 'ADMIN'
      });

      closeAdminPayModal();
      this.render();
    });

    this.container.querySelectorAll('.btn-open-payment-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = e.currentTarget.getAttribute('data-emp-id');
        openAdminPayModal(empId);
      });
    });

    // 9. Clic en celda para registrar/editar horas de cualquier día
    this.container.querySelectorAll('.cell-day').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const empId = e.currentTarget.getAttribute('data-emp-id');
        const dateISO = e.currentTarget.getAttribute('data-date');
        this.openAdminEntryModal(empId, dateISO);
      });
    });

    // Modal de edición de horas admin
    const adminEntryModal = document.getElementById('admin-entry-modal');
    const closeAdminEntry = () => { if (adminEntryModal) adminEntryModal.style.display = 'none'; };
    document.getElementById('btn-close-admin-entry')?.addEventListener('click', closeAdminEntry);
    document.getElementById('btn-cancel-admin-entry')?.addEventListener('click', closeAdminEntry);

    document.getElementById('admin-entry-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = document.getElementById('admin-entry-empid').value;
      const dateISO = document.getElementById('admin-entry-date').value;
      const start = document.getElementById('admin-entry-start').value;
      const end = document.getElementById('admin-entry-end').value;
      const lunch = document.getElementById('admin-entry-lunch').value;
      const directHrs = document.getElementById('admin-entry-direct-hours').value;
      const address = document.getElementById('admin-entry-address')?.value || '';
      const workDone = document.getElementById('admin-entry-work-done')?.value || '';

      let entryData = {
        employeeId: empId,
        date: dateISO,
        address: address,
        workDone: workDone,
        notes: workDone
      };
      if (directHrs !== '') {
        entryData.quickHours = directHrs;
        entryData.startTime = start || '08:00';
        entryData.lunchMinutes = 0;
      } else {
        entryData.startTime = start || '08:00';
        entryData.endTime = end || '17:00';
        entryData.lunchMinutes = lunch || 0;
      }

      store.saveOrUpdateTimeEntry(entryData);
      closeAdminEntry();
      this.render();
    });

    document.getElementById('btn-admin-delete-entry')?.addEventListener('click', () => {
      const empId = document.getElementById('admin-entry-empid').value;
      const dateISO = document.getElementById('admin-entry-date').value;
      if (confirm('¿Eliminar las horas registradas para esta fecha?')) {
        store.deleteTimeEntry(empId, dateISO);
        closeAdminEntry();
        this.render();
      }
    });

    // 10. Gestión de Tarjetas y Membresías
    const cardModal = document.getElementById('card-modal');
    const closeCardModal = () => { if (cardModal) cardModal.style.display = 'none'; };
    document.getElementById('btn-close-card-modal')?.addEventListener('click', closeCardModal);
    document.getElementById('btn-cancel-card-modal')?.addEventListener('click', closeCardModal);

    const openCardModal = (cardToEdit = null) => {
      const title = document.getElementById('card-modal-title');
      const editId = document.getElementById('card-edit-id');
      const nameInp = document.getElementById('card-name-input');
      const typeInp = document.getElementById('card-type-select');
      const last4Inp = document.getElementById('card-last4-input');
      const holderInp = document.getElementById('card-holder-input');
      const notesInp = document.getElementById('card-notes-input');

      if (cardToEdit) {
        title.textContent = 'Editar Tarjeta o Membresía';
        editId.value = cardToEdit.id;
        nameInp.value = cardToEdit.name;
        typeInp.value = cardToEdit.type || 'store_membership';
        last4Inp.value = cardToEdit.last4 || '';
        holderInp.value = cardToEdit.holder || 'Waldrige Renovation LLC';
        notesInp.value = cardToEdit.notes || '';
      } else {
        title.textContent = t('addCardBtn');
        editId.value = '';
        nameInp.value = '';
        typeInp.value = 'store_membership';
        last4Inp.value = '';
        holderInp.value = 'Waldrige Renovation LLC';
        notesInp.value = '';
      }
      cardModal.style.display = 'flex';
    };

    document.getElementById('btn-add-card-top')?.addEventListener('click', () => openCardModal(null));
    document.getElementById('btn-add-card-tab')?.addEventListener('click', () => openCardModal(null));

    this.container.querySelectorAll('.btn-edit-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const card = store.getCardById(id);
        if (card) openCardModal(card);
      });
    });

    this.container.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Eliminar esta tarjeta/membresía?')) {
          store.deleteCard(id);
          this.render();
        }
      });
    });

    document.getElementById('card-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('card-edit-id').value;
      const cardData = {
        name: document.getElementById('card-name-input').value,
        type: document.getElementById('card-type-select').value,
        last4: document.getElementById('card-last4-input').value,
        holder: document.getElementById('card-holder-input').value,
        notes: document.getElementById('card-notes-input').value
      };

      if (editId) {
        store.updateCard(editId, cardData);
      } else {
        store.addCard(cardData);
      }
      closeCardModal();
      this.render();
    });

    // 11. Modal Empleados
    const empModal = document.getElementById('employee-modal');
    const closeEmpModal = () => { if (empModal) empModal.style.display = 'none'; };
    document.getElementById('btn-close-emp-modal')?.addEventListener('click', closeEmpModal);
    document.getElementById('btn-cancel-emp-modal')?.addEventListener('click', closeEmpModal);

    const openEmpModal = (empToEdit = null) => {
      const title = document.getElementById('employee-modal-title');
      const editId = document.getElementById('emp-edit-id');
      const nameInp = document.getElementById('new-emp-name');
      const roleInp = document.getElementById('new-emp-role');
      const rateInp = document.getElementById('new-emp-rate');
      const pinInp = document.getElementById('new-emp-pin');
      const colorInp = document.getElementById('new-emp-color');
      const hexDisp = document.getElementById('hex-color-display');

      if (empToEdit) {
        title.textContent = 'Editar Empleado';
        editId.value = empToEdit.id;
        nameInp.value = empToEdit.name;
        roleInp.value = empToEdit.role || '';
        rateInp.value = empToEdit.hourlyRate;
        pinInp.value = empToEdit.pin || '1234';
        colorInp.value = empToEdit.color || '#2563EB';
        hexDisp.textContent = empToEdit.color || '#2563EB';
      } else {
        title.textContent = t('newEmployeeBtn');
        editId.value = '';
        nameInp.value = '';
        roleInp.value = '';
        rateInp.value = '25.00';
        pinInp.value = String(Math.floor(1000 + Math.random() * 9000));
        colorInp.value = '#2563EB';
        hexDisp.textContent = '#2563EB';
      }
      empModal.style.display = 'flex';
    };

    document.getElementById('btn-open-new-employee')?.addEventListener('click', () => openEmpModal(null));
    document.getElementById('btn-add-employee-top')?.addEventListener('click', () => openEmpModal(null));
    document.getElementById('btn-add-employee-tab')?.addEventListener('click', () => openEmpModal(null));

    this.container.querySelectorAll('.btn-edit-employee, .btn-edit-emp-quick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = e.currentTarget.getAttribute('data-id');
        const emp = store.getEmployeeById(empId);
        if (emp) openEmpModal(emp);
      });
    });

    this.container.querySelectorAll('.btn-delete-employee').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const empId = e.currentTarget.getAttribute('data-id');
        const emp = store.getEmployeeById(empId);
        if (emp && confirm(`¿Eliminar al empleado "${emp.name}"?`)) {
          store.deleteEmployee(empId);
          this.render();
        }
      });
    });

    // Guardar empleado
    document.getElementById('employee-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('emp-edit-id').value;
      const data = {
        name: document.getElementById('new-emp-name').value,
        role: document.getElementById('new-emp-role').value,
        hourlyRate: parseFloat(document.getElementById('new-emp-rate').value),
        pin: document.getElementById('new-emp-pin').value,
        color: document.getElementById('new-emp-color').value
      };

      if (editId) {
        store.updateEmployee(editId, data);
      } else {
        store.addEmployee(data);
      }
      closeEmpModal();
      this.render();
    });

    // Selector de color predeterminado
    const colorInp = document.getElementById('new-emp-color');
    const hexDisp = document.getElementById('hex-color-display');
    this.container.querySelectorAll('.preset-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        if (colorInp && hexDisp) {
          colorInp.value = color;
          hexDisp.textContent = color;
          this.container.querySelectorAll('.preset-color-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
        }
      });
    });

    // 12. Cambio de idioma desde Configuración
    this.container.querySelectorAll('.btn-lang-switch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        i18n.setLanguage(lang);
        this.render();
      });
    });

    // Clave maestra segura
    document.getElementById('admin-pin-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currInput = document.getElementById('admin-pin-curr');
      const newInput = document.getElementById('admin-pin-new');
      const confirmInput = document.getElementById('admin-pin-confirm');
      const alertBox = document.getElementById('admin-pin-alert');

      const currVal = currInput?.value.trim() || '';
      const newVal = newInput?.value.trim() || '';
      const confirmVal = confirmInput?.value.trim() || '';

      const showAlert = (msg, isSuccess = false) => {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.style.display = 'block';
        if (isSuccess) {
          alertBox.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
          alertBox.style.color = '#10B981';
          alertBox.style.border = '1px solid #10B981';
        } else {
          alertBox.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.color = '#EF4444';
          alertBox.style.border = '1px solid #EF4444';
        }
      };

      const realPin = store.settings.adminPin || 'waldrige2026';
      if (currVal !== realPin) {
        showAlert(t('masterKeyIncorrect'), false);
        return;
      }

      if (!newVal || newVal.length < 4) {
        showAlert('La nueva clave debe tener al menos 4 caracteres.', false);
        return;
      }

      if (newVal !== confirmVal) {
        showAlert(t('masterKeyMismatch'), false);
        return;
      }

      store.updateSettings({ adminPin: newVal });
      showAlert(t('masterKeyUpdated'), true);
      if (currInput) currInput.value = '';
      if (newInput) newInput.value = '';
      if (confirmInput) confirmInput.value = '';
    });

    // Respaldo JSON
    document.getElementById('btn-download-backup')?.addEventListener('click', () => {
      const json = store.exportAllDataAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Waldrige_Renovation_Backup_${formatDateISO(new Date())}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('file-restore-backup')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const success = store.importDataFromJSON(ev.target.result);
          if (success) {
            alert(t('savedSuccess'));
            this.render();
          } else {
            alert('Error al restaurar archivo .json.');
          }
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
      if (confirm('¿Restablecer el sistema a los datos iniciales limpios?')) {
        store.resetToDefaultDemo();
        this.render();
      }
    });
  }

  openAdminEntryModal(empId, dateISO) {
    const modal = document.getElementById('admin-entry-modal');
    const empInfo = document.getElementById('admin-entry-emp-info');
    const empIdHidden = document.getElementById('admin-entry-empid');
    const dateHidden = document.getElementById('admin-entry-date');
    const startInp = document.getElementById('admin-entry-start');
    const endInp = document.getElementById('admin-entry-end');
    const lunchInp = document.getElementById('admin-entry-lunch');
    const directInp = document.getElementById('admin-entry-direct-hours');
    const addressInp = document.getElementById('admin-entry-address');
    const workDoneInp = document.getElementById('admin-entry-work-done');

    const emp = store.getEmployeeById(empId);
    if (!emp || !modal) return;

    empIdHidden.value = empId;
    dateHidden.value = dateISO;

    const existing = store.getTimeEntry(empId, dateISO);
    empInfo.innerHTML = `
      <span class="color-dot" style="background-color: ${emp.color};"></span>
      <strong>${escapeHtml(emp.name)}</strong> ($${emp.hourlyRate.toFixed(2)}/hr) &bull; Fecha: <strong>${dateISO}</strong>
    `;

    if (existing && existing.totalHours > 0) {
      startInp.value = existing.startTime || '08:00';
      endInp.value = existing.endTime || '17:00';
      lunchInp.value = existing.lunchMinutes !== undefined ? existing.lunchMinutes : 60;
      directInp.value = existing.totalHours;
      if (addressInp) addressInp.value = existing.address || '';
      if (workDoneInp) workDoneInp.value = existing.workDone || existing.notes || '';
    } else {
      startInp.value = '08:00';
      endInp.value = '17:00';
      lunchInp.value = '60';
      directInp.value = '';
      if (addressInp) addressInp.value = '';
      if (workDoneInp) workDoneInp.value = '';
    }

    modal.style.display = 'flex';
  }

  exportPayrollCSV(allSummaries, weekDays) {
    const headers = [
      'Empleado',
      'Puesto',
      'Tarifa ($/hr)',
      ...weekDays.map(d => `${d.dayName} (${d.dateISO})`),
      'Total Horas',
      'Total Ganado ($)',
      'Monto Pagado ($)',
      'Saldo Pendiente ($)',
      'Estado de Pago'
    ];

    const rows = [headers];

    allSummaries.forEach(s => {
      const emp = s.employee;
      const payment = s.payment || {};
      const paid = parseFloat(payment.amountPaid) || 0;
      const due = payment.balanceDue !== undefined ? payment.balanceDue : Math.max(0, s.totalEarnings - paid);

      const row = [
        `"${emp.name.replace(/"/g, '""')}"`,
        `"${(emp.role || '').replace(/"/g, '""')}"`,
        emp.hourlyRate.toFixed(2),
        ...s.weekDays.map(d => d.hours.toFixed(2)),
        s.totalHours.toFixed(2),
        s.totalEarnings.toFixed(2),
        paid.toFixed(2),
        due.toFixed(2),
        `"${payment.status || 'pending'}"`
      ];
      rows.push(row);
    });

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Nomina_Waldrige_Renovation_${calendar.formatDateISO(calendar.currentMonday)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getInitials(name) {
    if (!name) return 'W';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
