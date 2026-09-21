/**
 * employee-view.js - Vista del Empleado para Waldrige Renovation LLC
 * Soporte para Lunes a Viernes, Comprobante individual (Pay Stub),
 * Control de Estado de Pago y Saldo Pendiente, y Subida de Recibos con Fotos.
 */

import { store, calculateHoursWorked, formatDateISO } from './store.js';
import { calendar } from './calendar.js';
import { auth } from './auth.js';
import { t, i18n } from './i18n.js';
import { openIndividualPayStubModal } from './paystub.js';
import { compressReceiptImage, showReceiptLightbox, getCategoryLabel } from './receipts-manager.js';

export class EmployeeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentEmployeeId = null;
    this.uploadedPhotoBase64 = null;
  }

  render(employeeId) {
    this.currentEmployeeId = employeeId;
    if (!this.container) return;

    const employee = store.getEmployeeById(employeeId);
    if (!employee) {
      this.container.innerHTML = `
        <div class="empty-state py-5 text-center">
          <p class="text-muted">No se encontró el perfil del empleado.</p>
          <button class="btn btn-primary" id="btn-back-login">${t('logIn')}</button>
        </div>
      `;
      document.getElementById('btn-back-login')?.addEventListener('click', () => auth.logout());
      return;
    }

    const weekDays = calendar.getWeekDays();
    const summary = store.getWeeklySummaryForEmployee(employeeId, weekDays);
    const weekLabel = calendar.getWeekLabel();
    const payment = summary.payment;
    const cards = store.getCards();
    const receipts = store.getReceipts({ employeeId: employee.id });

    // Estado del pago semanal
    let statusClass = 'badge-pending';
    let statusLabel = t('statusPending');
    if (payment.status === 'paid') {
      statusClass = 'badge-success';
      statusLabel = t('statusPaid');
    } else if (payment.status === 'partial') {
      statusClass = 'badge-warning';
      statusLabel = t('statusPartial');
    }

    this.container.innerHTML = `
      <!-- Encabezado del Empleado con su color distintivo -->
      <section class="employee-header-card" style="border-top: 5px solid ${employee.color};">
        <div class="emp-profile-info">
          <div class="emp-avatar-large" style="background-color: ${employee.color};">
            ${this.getInitials(employee.name)}
          </div>
          <div class="emp-meta">
            <div class="emp-badge-role">
              <span class="color-dot" style="background-color: ${employee.color};"></span>
              ${escapeHtml(employee.role || 'Operario')}
            </div>
            <h1 class="emp-title-name">${escapeHtml(employee.name)}</h1>
            <p class="emp-rate-tag">${t('colRate')}: <strong>$${employee.hourlyRate.toFixed(2)}/hr</strong></p>
            
            <div class="emp-actions-group">
              <button type="button" class="btn btn-outline btn-sm" id="btn-open-pin-customizer" title="Cambiar o personalizar tu clave de acceso">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ${t('customizeMyPin')}
              </button>
              <button type="button" class="btn btn-primary-soft btn-sm" id="btn-open-paystub">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                ${t('printPayStub')}
              </button>
            </div>
          </div>
        </div>

        <div class="emp-quick-stats">
          <div class="stat-box">
            <span class="stat-label">${t('myWeeklyHours')}</span>
            <span class="stat-value text-accent" id="emp-summary-total-hours">${summary.totalHours.toFixed(2)} hrs</span>
          </div>
          <div class="stat-box earnings-stat">
            <span class="stat-label">${t('myWeeklyEarnings')}</span>
            <span class="stat-value text-success" id="emp-summary-total-earnings">$${summary.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      <!-- Tarjeta de Estado de Pago Semanal y Saldo Restante -->
      <section class="payment-status-card">
        <div class="payment-card-left">
          <div class="status-indicator-pill ${statusClass}">
            <span class="status-dot"></span>
            <strong>${statusLabel}</strong>
          </div>
          <div class="payment-desc">
            <h4>${t('myPaymentStatusTitle')}</h4>
            <p class="text-muted text-sm">${escapeHtml(weekLabel)}</p>
          </div>
        </div>

        <div class="payment-card-metrics">
          <div class="pay-metric">
            <span class="pay-label">Total Ganado:</span>
            <strong class="pay-amount">$${summary.totalEarnings.toFixed(2)}</strong>
          </div>
          <div class="pay-metric">
            <span class="pay-label">${t('paidAmount')}:</span>
            <strong class="pay-amount text-success">$${(parseFloat(payment.amountPaid) || 0).toFixed(2)}</strong>
          </div>
          <div class="pay-metric highlight-due">
            <span class="pay-label">${t('balanceRemaining')}:</span>
            <strong class="pay-amount ${payment.balanceDue > 0 ? 'text-danger' : 'text-success'}">
              $${(parseFloat(payment.balanceDue) || 0).toFixed(2)}
            </strong>
          </div>
        </div>

        <div class="payment-card-action">
          <button type="button" class="btn btn-outline btn-sm" id="btn-open-payment-report">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            ${t('reportPaymentReceived')}
          </button>
        </div>
      </section>

      <!-- Barra de Navegación de Calendario Semanal (Lunes a Viernes) -->
      <section class="week-navigation-bar">
        <div class="week-nav-controls">
          <button class="btn btn-outline" id="btn-prev-week" title="Semana Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
            ${t('prevWeek')}
          </button>
          <button class="btn btn-secondary" id="btn-current-week" title="Semana Actual">${t('today')}</button>
          <button class="btn btn-outline" id="btn-next-week" title="Semana Siguiente">
            ${t('nextWeek')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

        <div class="week-title-display">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span class="week-text">${escapeHtml(weekLabel)}</span>
        </div>

        <div class="week-date-picker">
          <label for="emp-date-select" class="visually-hidden">Ir a fecha</label>
          <input type="date" id="emp-date-select" class="input-date" title="Seleccionar fecha para ir a su semana">
        </div>
      </section>

      <!-- Instrucción Oficial: Lunes a Viernes de 8am a 7pm -->
      <div class="schedule-notice-banner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${t('officialScheduleNotice')}</span>
      </div>

      <!-- Cuadrícula Semanal Oficial: Lunes a Viernes (5 días) -->
      <section class="week-days-grid" id="week-days-container">
        ${this.renderDaysCards(summary.weekDays, employee)}
      </section>

      <!-- Sección de Recibos y Gastos de Compras Realizadas -->
      <section class="employee-receipts-section">
        <div class="section-head-with-action">
          <div>
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              ${t('receiptsTitle')}
            </h3>
            <p class="text-muted text-sm">${t('receiptsSubtitle')}</p>
          </div>
          <button class="btn btn-primary" id="btn-open-upload-receipt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            ${t('uploadReceiptBtn')}
          </button>
        </div>

        <div class="receipts-grid-employee">
          ${receipts.length === 0 ? `
            <div class="empty-state-box text-center py-4">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              <p class="text-muted mt-2">${t('noReceiptsYet')}</p>
              <button class="btn btn-outline btn-sm mt-1" id="btn-upload-first-receipt">${t('uploadReceiptBtn')}</button>
            </div>
          ` : receipts.map(r => `
            <div class="receipt-card-item">
              <div class="receipt-thumb-wrapper" data-id="${r.id}">
                ${r.imageBase64 ? `
                  <img src="${r.imageBase64}" alt="${escapeHtml(r.storeName)}" class="receipt-thumb-img">
                  <div class="thumb-hover-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    <span>${t('viewReceiptPhoto')}</span>
                  </div>
                ` : `
                  <div class="receipt-no-img">Sin Foto</div>
                `}
              </div>
              <div class="receipt-info-body">
                <div class="receipt-top-row">
                  <strong class="receipt-store">${escapeHtml(r.storeName)}</strong>
                  <strong class="receipt-amount text-success">$${parseFloat(r.amount).toFixed(2)}</strong>
                </div>
                <div class="receipt-sub-row">
                  <span class="text-muted text-sm">${r.date}</span>
                  <span class="badge-card-tag">${escapeHtml(r.paymentCardName || 'Efectivo')}</span>
                </div>
                ${r.notes ? `<p class="receipt-notes-snippet">"${escapeHtml(r.notes)}"</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Modal para Registrar / Editar Horas -->
      <div class="modal-overlay" id="entry-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="modal-day-title">${t('registerHoursModalTitle')}</h3>
            <button class="btn-close-modal" id="btn-close-modal" aria-label="Cerrar">&times;</button>
          </div>
          <form id="entry-form" class="modal-form">
            <input type="hidden" id="entry-date-iso" value="">
            
            <div class="modal-date-badge" id="modal-date-display">Lunes 15 de Septiembre</div>

            <div class="form-tabs">
              <button type="button" class="tab-btn active" id="tab-mode-clock">${t('byScheduleTab')}</button>
              <button type="button" class="tab-btn" id="tab-mode-quick">${t('byDirectHoursTab')}</button>
            </div>

            <!-- Modo Reloj (Entrada / Salida / Almuerzo) -->
            <div id="section-mode-clock" class="form-mode-section">
              <div class="time-range-group">
                <div class="form-group">
                  <label for="entry-start-time">${t('startTimeLabel')}</label>
                  <input type="time" id="entry-start-time" min="08:00" max="19:00" class="input-time" value="08:00" required>
                </div>
                <div class="form-group">
                  <label for="entry-end-time">${t('endTimeLabel')}</label>
                  <input type="time" id="entry-end-time" min="08:00" max="19:00" class="input-time" value="17:00" required>
                </div>
              </div>

              <div class="form-group">
                <label for="entry-lunch-minutes">${t('lunchTimeLabel')}</label>
                <select id="entry-lunch-minutes" class="input-select">
                  <option value="0">${t('noLunch')}</option>
                  <option value="30">${t('lunch30')}</option>
                  <option value="60" selected>${t('lunch60')}</option>
                  <option value="90">${t('lunch90')}</option>
                </select>
              </div>
            </div>

            <!-- Modo Horas Directas -->
            <div id="section-mode-quick" class="form-mode-section" style="display: none;">
              <div class="form-group">
                <label for="entry-quick-hours">${t('directHoursToday')}</label>
                <div class="quick-hours-input-wrapper">
                  <input type="number" id="entry-quick-hours" min="0" max="11" step="0.5" placeholder="8.0" class="input-number">
                  <span class="unit-label">hrs</span>
                </div>
                <div class="quick-presets">
                  <button type="button" class="btn-preset" data-hours="8">8 hrs</button>
                  <button type="button" class="btn-preset" data-hours="8.5">8.5 hrs</button>
                  <button type="button" class="btn-preset" data-hours="9">9 hrs</button>
                  <button type="button" class="btn-preset" data-hours="10">10 hrs</button>
                </div>
              </div>
            </div>

            <!-- Dirección del Lugar donde trabajó -->
            <div class="form-group">
              <label for="entry-address">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${t('workAddressLabel')}
              </label>
              <input type="text" id="entry-address" class="input-text" placeholder="${t('workAddressPlaceholder')}">
            </div>

            <!-- Trabajo Realizado -->
            <div class="form-group">
              <label for="entry-work-done">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 4px;"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                ${t('workDoneLabel')}
              </label>
              <textarea id="entry-work-done" rows="2" placeholder="${t('workDonePlaceholder')}" class="input-textarea"></textarea>
            </div>

            <!-- Previsualización del cálculo -->
            <div class="modal-calculation-preview" id="modal-calc-preview">
              <div class="calc-row">
                <span>Horas:</span>
                <strong id="preview-calculated-hours">8.00 hrs</strong>
              </div>
              <div class="calc-row highlight">
                <span>Ganancia diaria:</span>
                <strong id="preview-calculated-earnings" class="text-success">$200.00</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-danger-outline" id="btn-delete-entry" style="display: none;">${t('deleteDayEntryBtn')}</button>
              <button type="button" class="btn btn-outline" id="btn-cancel-modal">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary" id="btn-save-entry">${t('saveHoursBtn')}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Subir Recibo / Gasto de Compra con Foto -->
      <div class="modal-overlay" id="upload-receipt-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${t('uploadReceiptBtn')}</h3>
            <button class="btn-close-modal" id="btn-close-receipt-modal">&times;</button>
          </div>
          <form id="form-upload-receipt" class="modal-form">
            <div class="form-row-2">
              <div class="form-group">
                <label for="receipt-store-input">${t('storeName')} *</label>
                <input type="text" id="receipt-store-input" list="common-stores-list" placeholder="Ej. The Home Depot, Lowe's..." class="input-text" required>
                <datalist id="common-stores-list">
                  <option value="The Home Depot">
                  <option value="Lowe's Home Improvement">
                  <option value="Sherwin-Williams">
                  <option value="Harbor Freight Tools">
                  <option value="84 Lumber">
                  <option value="Ace Hardware">
                  <option value="Gasolinera / Combustible">
                </datalist>
              </div>

              <div class="form-group">
                <label for="receipt-date-input">${t('expenseDate')} *</label>
                <input type="date" id="receipt-date-input" class="input-date" value="${formatDateISO(new Date())}" required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="receipt-amount-input">${t('expenseAmount')} *</label>
                <div class="currency-input-wrapper">
                  <span class="currency-symbol">$</span>
                  <input type="number" id="receipt-amount-input" step="0.01" min="0.10" placeholder="0.00" class="input-number" required>
                </div>
              </div>

              <div class="form-group">
                <label for="receipt-category-select">${t('category')}</label>
                <select id="receipt-category-select" class="input-select">
                  <option value="catMaterials">${t('catMaterials')}</option>
                  <option value="catTools">${t('catTools')}</option>
                  <option value="catFuel">${t('catFuel')}</option>
                  <option value="catFood">${t('catFood')}</option>
                  <option value="catOther">${t('catOther')}</option>
                </select>
              </div>
            </div>

            <!-- Selector de Tarjeta o Membresía de la Empresa -->
            <div class="form-group">
              <label for="receipt-card-select">${t('paymentMethod')}</label>
              <select id="receipt-card-select" class="input-select">
                <option value="cash">${t('paidWithCash')}</option>
                ${cards.map(c => `
                  <option value="${c.id}">${escapeHtml(c.name)} ${c.last4 ? `(${c.last4})` : ''}</option>
                `).join('')}
              </select>
              <small class="form-tip">Selecciona si usaste una tarjeta/membresía del negocio o tu propio dinero.</small>
            </div>

            <!-- Subida de Foto del Recibo -->
            <div class="form-group">
              <label>${t('receiptPhoto')} *</label>
              <div class="receipt-dropzone" id="receipt-photo-dropzone">
                <input type="file" id="receipt-photo-file" accept="image/*" capture="environment" style="display: none;">
                <div class="dropzone-content" id="dropzone-empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  <p><strong>${t('takeOrUploadPhoto')}</strong></p>
                  <span class="text-sm text-muted">Toca aquí para abrir la cámara o galería</span>
                </div>
                <div class="dropzone-preview" id="dropzone-preview-state" style="display: none;">
                  <img id="photo-preview-element" src="" alt="Vista previa del recibo">
                  <button type="button" class="btn btn-sm btn-danger-outline mt-2" id="btn-remove-photo">Cambiar Foto</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="receipt-notes-input">Notas Adicionales (Opcional)</label>
              <input type="text" id="receipt-notes-input" placeholder="Ej. Comprado para el proyecto de cocina..." class="input-text">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-receipt">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary" id="btn-save-receipt">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para que el empleado reporte el estado de pago recibido -->
      <div class="modal-overlay" id="employee-payment-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${t('reportPaymentReceived')}</h3>
            <button class="btn-close-modal" id="btn-close-payment-modal">&times;</button>
          </div>
          <form id="form-employee-payment" class="modal-form">
            <p class="text-muted text-sm">Indica si tu jefe te pagó el total de esta semana o si hubo un pago parcial para dejar registrado el saldo restante pendiente.</p>
            
            <div class="modal-calculation-preview">
              <div class="calc-row">
                <span>Nómina Ganada en la Semana:</span>
                <strong>$${summary.totalEarnings.toFixed(2)}</strong>
              </div>
            </div>

            <div class="form-group">
              <label for="emp-payment-paid-input">¿Cuánto recibiste de pago? ($) *</label>
              <div class="currency-input-wrapper">
                <span class="currency-symbol">$</span>
                <input type="number" id="emp-payment-paid-input" step="0.01" min="0" max="${summary.totalEarnings}" value="${payment.amountPaid || ''}" placeholder="Ej. ${summary.totalEarnings.toFixed(2)}" class="input-number" required>
              </div>
              <div class="quick-presets mt-2">
                <button type="button" class="btn-preset" id="btn-set-paid-full">Pagado Completo ($${summary.totalEarnings.toFixed(2)})</button>
                <button type="button" class="btn-preset" id="btn-set-paid-zero">No me han pagado ($0.00)</button>
              </div>
            </div>

            <!-- Cálculo automático del saldo pendiente -->
            <div class="form-group">
              <label>Saldo Restante que el Jefe Debe Pagar:</label>
              <div class="balance-display-box">
                <span id="emp-live-balance-due" class="text-danger font-bold" style="font-size: 1.3rem;">
                  $${payment.balanceDue.toFixed(2)}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="emp-payment-notes">Comentarios / Notas (Opcional):</label>
              <input type="text" id="emp-payment-notes" value="${escapeHtml(payment.notes || '')}" placeholder="Ej. Me dio $300 en efectivo, faltan $200 para el martes" class="input-text">
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-pay-report">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary">Guardar Registro de Pago</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Personalizar mi Clave Secreta -->
      <div class="modal-overlay" id="pin-custom-modal" style="display: none;">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${t('customizeMyPin')}</h3>
            <button class="btn-close-modal" id="btn-close-pin-modal">&times;</button>
          </div>
          <form id="form-customize-pin" class="modal-form">
            <p class="text-muted text-sm">Cambia tu clave personal para que solo tú tengas acceso a tus horas y recibos.</p>
            
            <div class="form-group">
              <label for="input-curr-pin">Clave o PIN Actual:</label>
              <input type="password" id="input-curr-pin" class="input-text" placeholder="Ingresa tu clave actual" required>
            </div>

            <div class="form-group">
              <label for="input-new-pin">Nueva Clave Personal (mínimo 3 caracteres): *</label>
              <input type="password" id="input-new-pin" class="input-text" maxlength="12" placeholder="Nueva clave" required>
            </div>

            <div class="form-group">
              <label for="input-confirm-pin">Confirmar Nueva Clave: *</label>
              <input type="password" id="input-confirm-pin" class="input-text" maxlength="12" placeholder="Repite la nueva clave" required>
            </div>

            <div id="pin-custom-alert" class="alert-error" style="display: none;"></div>

            <div class="modal-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel-pin-modal">${t('cancelBtn')}</button>
              <button type="submit" class="btn btn-primary">${t('saveBtn')}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.bindEvents(employee, summary);
  }

  renderDaysCards(weekDays, employee) {
    return weekDays.map(day => {
      const entry = day.entry;
      const hasHours = entry && entry.totalHours > 0;
      const hours = hasHours ? entry.totalHours : 0;
      const earnings = Math.round(hours * employee.hourlyRate * 100) / 100;

      return `
        <div class="day-card ${day.isToday ? 'is-today' : ''} ${hasHours ? 'has-entry' : 'is-empty'}" data-date="${day.dateISO}">
          <div class="day-card-header">
            <div>
              <span class="day-name">${day.dayName}</span>
              <span class="day-date">${day.dateFormatted}</span>
            </div>
            ${day.isToday ? `<span class="badge-today">${t('today').toUpperCase()}</span>` : ''}
          </div>

          <div class="day-card-body">
            <div class="day-hours-display">
              <span class="hours-num ${hasHours ? 'text-accent' : 'text-muted'}">${hasHours ? hours.toFixed(2) : '0.00'}</span>
              <span class="hours-label">horas</span>
            </div>

            <div class="day-earnings-display">
              <span class="earn-label">Monto:</span>
              <span class="earn-value ${hasHours ? 'text-success' : 'text-muted'}">$${earnings.toFixed(2)}</span>
            </div>

            ${hasHours && (entry.startTime || entry.endTime) ? `
              <div class="day-time-range">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>${entry.startTime || '08:00'} - ${entry.endTime || '17:00'} ${entry.lunchMinutes ? `(-${entry.lunchMinutes}m)` : ''}</span>
              </div>
            ` : ''}

            ${hasHours && entry.address ? `
              <div class="day-location-snippet" title="${escapeHtml(entry.address)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>${escapeHtml(entry.address)}</span>
              </div>
            ` : ''}

            ${hasHours && (entry.workDone || entry.notes) ? `
              <div class="day-work-snippet" title="${escapeHtml(entry.workDone || entry.notes)}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                <span>${escapeHtml(entry.workDone || entry.notes)}</span>
              </div>
            ` : ''}
          </div>

          <div class="day-card-footer">
            <button class="btn ${hasHours ? 'btn-outline' : 'btn-primary-soft'} btn-sm btn-edit-day" data-date="${day.dateISO}">
              ${hasHours ? t('modifyDay') : t('registerDay')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  bindEvents(employee, summary) {
    // 1. Navegación de semanas
    document.getElementById('btn-prev-week')?.addEventListener('click', () => {
      calendar.prevWeek();
      this.render(this.currentEmployeeId);
    });
    document.getElementById('btn-next-week')?.addEventListener('click', () => {
      calendar.nextWeek();
      this.render(this.currentEmployeeId);
    });
    document.getElementById('btn-current-week')?.addEventListener('click', () => {
      calendar.goToToday();
      this.render(this.currentEmployeeId);
    });
    document.getElementById('emp-date-select')?.addEventListener('change', (e) => {
      if (e.target.value) {
        calendar.goToDate(e.target.value);
        this.render(this.currentEmployeeId);
      }
    });

    // 2. Abrir comprobante de nómina individual (Pay Stub)
    document.getElementById('btn-open-paystub')?.addEventListener('click', () => {
      openIndividualPayStubModal(summary, calendar.getWeekLabel());
    });

    // 3. Botones de editar / registrar día
    this.container.querySelectorAll('.btn-edit-day').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dateISO = e.currentTarget.getAttribute('data-date');
        this.openEntryModal(dateISO, employee);
      });
    });

    // 4. Modal de horas
    const modal = document.getElementById('entry-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCancelModal = document.getElementById('btn-cancel-modal');
    const closeModal = () => { modal.style.display = 'none'; };
    btnCloseModal?.addEventListener('click', closeModal);
    btnCancelModal?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Alternar modo Reloj vs Rápido
    const tabClock = document.getElementById('tab-mode-clock');
    const tabQuick = document.getElementById('tab-mode-quick');
    const secClock = document.getElementById('section-mode-clock');
    const secQuick = document.getElementById('section-mode-quick');
    let currentMode = 'clock';

    tabClock?.addEventListener('click', () => {
      currentMode = 'clock';
      tabClock.classList.add('active');
      tabQuick.classList.remove('active');
      secClock.style.display = 'block';
      secQuick.style.display = 'none';
      this.updateModalCalculationPreview(employee.hourlyRate, currentMode);
    });

    tabQuick?.addEventListener('click', () => {
      currentMode = 'quick';
      tabQuick.classList.add('active');
      tabClock.classList.remove('active');
      secClock.style.display = 'none';
      secQuick.style.display = 'block';
      this.updateModalCalculationPreview(employee.hourlyRate, currentMode);
    });

    // Presets rápidos
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hrs = e.target.getAttribute('data-hours');
        const input = document.getElementById('entry-quick-hours');
        if (input && hrs) {
          input.value = hrs;
          this.updateModalCalculationPreview(employee.hourlyRate, 'quick');
        }
      });
    });

    // Recálculo en tiempo real
    const startInput = document.getElementById('entry-start-time');
    const endInput = document.getElementById('entry-end-time');
    const lunchInput = document.getElementById('entry-lunch-minutes');
    const quickInput = document.getElementById('entry-quick-hours');

    [startInput, endInput, lunchInput].forEach(elem => {
      elem?.addEventListener('input', () => this.updateModalCalculationPreview(employee.hourlyRate, 'clock'));
      elem?.addEventListener('change', () => this.updateModalCalculationPreview(employee.hourlyRate, 'clock'));
    });
    quickInput?.addEventListener('input', () => this.updateModalCalculationPreview(employee.hourlyRate, 'quick'));

    // Guardar horas
    document.getElementById('entry-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const dateISO = document.getElementById('entry-date-iso').value;
      const address = document.getElementById('entry-address')?.value || '';
      const workDone = document.getElementById('entry-work-done')?.value || '';

      let entryData = {
        employeeId: employee.id,
        date: dateISO,
        address: address,
        workDone: workDone,
        notes: workDone
      };

      if (currentMode === 'clock') {
        entryData.startTime = startInput.value;
        entryData.endTime = endInput.value;
        entryData.lunchMinutes = lunchInput.value;
      } else {
        entryData.quickHours = quickInput.value;
        entryData.startTime = '08:00';
        entryData.lunchMinutes = 0;
      }

      store.saveOrUpdateTimeEntry(entryData);
      closeModal();
      this.render(this.currentEmployeeId);
    });

    // Borrar registro de día
    document.getElementById('btn-delete-entry')?.addEventListener('click', () => {
      const dateISO = document.getElementById('entry-date-iso').value;
      if (confirm(t('confirmDelete'))) {
        store.deleteTimeEntry(employee.id, dateISO);
        closeModal();
        this.render(this.currentEmployeeId);
      }
    });

    // 5. Modal de Estado de Pago Semanal
    const payModal = document.getElementById('employee-payment-modal');
    const btnOpenPay = document.getElementById('btn-open-payment-report');
    const btnClosePay = document.getElementById('btn-close-payment-modal');
    const btnCancelPay = document.getElementById('btn-cancel-pay-report');
    const payPaidInput = document.getElementById('emp-payment-paid-input');
    const liveBalanceDue = document.getElementById('emp-live-balance-due');

    const closePayModal = () => { payModal.style.display = 'none'; };
    btnOpenPay?.addEventListener('click', () => {
      payModal.style.display = 'flex';
      updateLiveBalance();
    });
    btnClosePay?.addEventListener('click', closePayModal);
    btnCancelPay?.addEventListener('click', closePayModal);
    payModal?.addEventListener('click', (e) => { if (e.target === payModal) closePayModal(); });

    const updateLiveBalance = () => {
      const paid = parseFloat(payPaidInput?.value) || 0;
      const remaining = Math.max(0, summary.totalEarnings - paid);
      if (liveBalanceDue) {
        liveBalanceDue.textContent = `$${remaining.toFixed(2)}`;
        liveBalanceDue.className = remaining > 0 ? 'text-danger font-bold' : 'text-success font-bold';
      }
    };

    payPaidInput?.addEventListener('input', updateLiveBalance);

    document.getElementById('btn-set-paid-full')?.addEventListener('click', () => {
      if (payPaidInput) payPaidInput.value = summary.totalEarnings.toFixed(2);
      updateLiveBalance();
    });

    document.getElementById('btn-set-paid-zero')?.addEventListener('click', () => {
      if (payPaidInput) payPaidInput.value = '0';
      updateLiveBalance();
    });

    document.getElementById('form-employee-payment')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amountPaid = parseFloat(payPaidInput.value) || 0;
      const notes = document.getElementById('emp-payment-notes')?.value || '';

      store.saveWeeklyPayment(employee.id, summary.mondayISO, {
        totalEarnings: summary.totalEarnings,
        amountPaid: amountPaid,
        notes: notes,
        recordedBy: 'EMPLOYEE'
      });

      alert(t('savedSuccess'));
      closePayModal();
      this.render(this.currentEmployeeId);
    });

    // 6. Subir Recibo de Compra
    const receiptModal = document.getElementById('upload-receipt-modal');
    const btnOpenReceipt = document.getElementById('btn-open-upload-receipt');
    const btnUploadFirst = document.getElementById('btn-upload-first-receipt');
    const btnCloseReceipt = document.getElementById('btn-close-receipt-modal');
    const btnCancelReceipt = document.getElementById('btn-cancel-receipt');
    const dropzone = document.getElementById('receipt-photo-dropzone');
    const photoFileInput = document.getElementById('receipt-photo-file');
    const dropEmptyState = document.getElementById('dropzone-empty-state');
    const dropPreviewState = document.getElementById('dropzone-preview-state');
    const previewImg = document.getElementById('photo-preview-element');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');

    this.uploadedPhotoBase64 = null;

    const openReceiptModal = () => {
      this.uploadedPhotoBase64 = null;
      if (dropEmptyState) dropEmptyState.style.display = 'block';
      if (dropPreviewState) dropPreviewState.style.display = 'none';
      if (photoFileInput) photoFileInput.value = '';
      receiptModal.style.display = 'flex';
    };

    const closeReceiptModal = () => {
      receiptModal.style.display = 'none';
    };

    btnOpenReceipt?.addEventListener('click', openReceiptModal);
    btnUploadFirst?.addEventListener('click', openReceiptModal);
    btnCloseReceipt?.addEventListener('click', closeReceiptModal);
    btnCancelReceipt?.addEventListener('click', closeReceiptModal);
    receiptModal?.addEventListener('click', (e) => { if (e.target === receiptModal) closeReceiptModal(); });

    dropzone?.addEventListener('click', (e) => {
      if (e.target !== btnRemovePhoto) photoFileInput.click();
    });

    photoFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const compressed = await compressReceiptImage(file, 1024, 0.75);
          this.uploadedPhotoBase64 = compressed;
          if (previewImg) previewImg.src = compressed;
          if (dropEmptyState) dropEmptyState.style.display = 'none';
          if (dropPreviewState) dropPreviewState.style.display = 'block';
        } catch (err) {
          alert('Error procesando la imagen. Intenta con otra foto.');
          console.error(err);
        }
      }
    });

    btnRemovePhoto?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.uploadedPhotoBase64 = null;
      if (photoFileInput) photoFileInput.value = '';
      if (dropEmptyState) dropEmptyState.style.display = 'block';
      if (dropPreviewState) dropPreviewState.style.display = 'none';
    });

    document.getElementById('form-upload-receipt')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const storeName = document.getElementById('receipt-store-input').value;
      const date = document.getElementById('receipt-date-input').value;
      const amount = parseFloat(document.getElementById('receipt-amount-input').value);
      const category = document.getElementById('receipt-category-select').value;
      const cardSelect = document.getElementById('receipt-card-select');
      const cardId = cardSelect.value;
      const cardName = cardSelect.options[cardSelect.selectedIndex]?.text || '';
      const notes = document.getElementById('receipt-notes-input').value;

      if (!storeName || isNaN(amount) || amount <= 0) {
        alert(t('errorRequired'));
        return;
      }

      if (!this.uploadedPhotoBase64) {
        if (!confirm('No has seleccionado una foto para el recibo. ¿Deseas guardarlo sin imagen?')) {
          return;
        }
      }

      store.addReceipt({
        employeeId: employee.id,
        employeeName: employee.name,
        date: date,
        storeName: storeName,
        amount: amount,
        category: category,
        paymentCardId: cardId,
        paymentCardName: cardName,
        notes: notes,
        imageBase64: this.uploadedPhotoBase64 || '',
        status: 'pending'
      });

      alert(t('savedSuccess'));
      closeReceiptModal();
      this.render(this.currentEmployeeId);
    });

    // 7. Clic en miniaturas de recibos para abrir lightbox
    this.container.querySelectorAll('.receipt-thumb-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const receipt = store.getReceiptById(id);
        if (receipt) showReceiptLightbox(receipt);
      });
    });

    // 8. Personalizar Clave Secreta
    const pinModal = document.getElementById('pin-custom-modal');
    const btnOpenPinModal = document.getElementById('btn-open-pin-customizer');
    const btnClosePinModal = document.getElementById('btn-close-pin-modal');
    const btnCancelPinModal = document.getElementById('btn-cancel-pin-modal');
    const formPin = document.getElementById('form-customize-pin');
    const alertPin = document.getElementById('pin-custom-alert');

    const closePinModal = () => {
      if (pinModal) pinModal.style.display = 'none';
      if (alertPin) alertPin.style.display = 'none';
      if (formPin) formPin.reset();
    };

    btnOpenPinModal?.addEventListener('click', () => { pinModal.style.display = 'flex'; });
    btnClosePinModal?.addEventListener('click', closePinModal);
    btnCancelPinModal?.addEventListener('click', closePinModal);
    pinModal?.addEventListener('click', (e) => { if (e.target === pinModal) closePinModal(); });

    formPin?.addEventListener('submit', (e) => {
      e.preventDefault();
      const currPin = document.getElementById('input-curr-pin')?.value;
      const newPin = document.getElementById('input-new-pin')?.value;
      const confirmPin = document.getElementById('input-confirm-pin')?.value;

      if (newPin !== confirmPin) {
        if (alertPin) {
          alertPin.textContent = 'Las nuevas claves no coinciden.';
          alertPin.style.display = 'block';
        }
        return;
      }

      const res = auth.updateEmployeePin(employee.id, currPin, newPin);
      if (!res.success) {
        if (alertPin) {
          alertPin.textContent = res.message;
          alertPin.style.display = 'block';
        }
      } else {
        alert(t('savedSuccess'));
        closePinModal();
      }
    });
  }

  openEntryModal(dateISO, employee) {
    const modal = document.getElementById('entry-modal');
    const dateDisplay = document.getElementById('modal-date-display');
    const hiddenDate = document.getElementById('entry-date-iso');
    const startInput = document.getElementById('entry-start-time');
    const endInput = document.getElementById('entry-end-time');
    const lunchInput = document.getElementById('entry-lunch-minutes');
    const quickInput = document.getElementById('entry-quick-hours');
    const addressInput = document.getElementById('entry-address');
    const workDoneInput = document.getElementById('entry-work-done');
    const btnDelete = document.getElementById('btn-delete-entry');

    if (!modal) return;

    hiddenDate.value = dateISO;
    const existing = store.getTimeEntry(employee.id, dateISO);

    const weekDays = calendar.getWeekDays();
    const dayMatch = weekDays.find(d => d.dateISO === dateISO);
    dateDisplay.textContent = dayMatch ? dayMatch.fullDateFormatted : dateISO;

    if (existing && existing.totalHours > 0) {
      startInput.value = existing.startTime || '08:00';
      endInput.value = existing.endTime || '17:00';
      lunchInput.value = existing.lunchMinutes !== undefined ? existing.lunchMinutes : 60;
      quickInput.value = existing.totalHours;
      if (addressInput) addressInput.value = existing.address || '';
      if (workDoneInput) workDoneInput.value = existing.workDone || existing.notes || '';
      btnDelete.style.display = 'inline-block';
    } else {
      startInput.value = '08:00';
      endInput.value = '17:00';
      lunchInput.value = '60';
      quickInput.value = '8';
      if (addressInput) addressInput.value = '';
      if (workDoneInput) workDoneInput.value = '';
      btnDelete.style.display = 'none';
    }

    this.updateModalCalculationPreview(employee.hourlyRate, 'clock');
    modal.style.display = 'flex';
  }

  updateModalCalculationPreview(hourlyRate, mode) {
    const previewHours = document.getElementById('preview-calculated-hours');
    const previewEarnings = document.getElementById('preview-calculated-earnings');

    let hours = 0;
    if (mode === 'clock') {
      const start = document.getElementById('entry-start-time')?.value;
      const end = document.getElementById('entry-end-time')?.value;
      const lunch = document.getElementById('entry-lunch-minutes')?.value;
      hours = calculateHoursWorked(start, end, lunch);
    } else {
      const quickVal = parseFloat(document.getElementById('entry-quick-hours')?.value);
      hours = isNaN(quickVal) ? 0 : Math.max(0, quickVal);
    }

    const earnings = Math.round(hours * hourlyRate * 100) / 100;
    if (previewHours) previewHours.textContent = `${hours.toFixed(2)} hrs`;
    if (previewEarnings) previewEarnings.textContent = `$${earnings.toFixed(2)}`;
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
