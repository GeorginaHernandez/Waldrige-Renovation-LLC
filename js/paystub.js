/**
 * paystub.js - Generador de Comprobantes de Nómina Individual (Pay Stubs)
 * Waldrige Renovation LLC
 */

import { t, i18n } from './i18n.js';

/**
 * Abre un modal y prepara el comprobante individual para pantalla e impresión / PDF
 */
export function openIndividualPayStubModal(summary, weekLabel) {
  let modal = document.getElementById('paystub-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'paystub-modal';
    modal.className = 'modal-overlay paystub-modal-overlay';
    document.body.appendChild(modal);
  }

  const emp = summary.employee;
  const payment = summary.payment || {
    status: 'pending',
    amountPaid: 0,
    balanceDue: summary.totalEarnings
  };

  const isEn = i18n.getLanguage() === 'en';
  
  let statusBadgeClass = 'badge-pending';
  let statusText = t('statusPending');
  if (payment.status === 'paid') {
    statusBadgeClass = 'badge-success';
    statusText = t('statusPaid');
  } else if (payment.status === 'partial') {
    statusBadgeClass = 'badge-warning';
    statusText = t('statusPartial');
  }

  modal.innerHTML = `
    <div class="modal-dialog paystub-modal-dialog">
      <div class="modal-header no-print">
        <div>
          <h3>${t('payStubTitle')}</h3>
          <span class="text-muted text-sm">${escapeHtml(emp.name)} &bull; ${escapeHtml(weekLabel)}</span>
        </div>
        <button class="btn-close-modal" id="btn-close-paystub">&times;</button>
      </div>

      <!-- Contenedor del Comprobante Imprimible Oficial -->
      <div class="paystub-sheet-container" id="printable-paystub-content">
        <div class="paystub-paper">
          <!-- Encabezado de la Empresa -->
          <div class="paystub-header">
            <div class="paystub-brand">
              <div class="paystub-logo-icon" style="background-color: ${emp.color || '#3B82F6'};">
                WR
              </div>
              <div class="paystub-company-details">
                <h2 class="paystub-company-name">WALDRIGE RENOVATION LLC</h2>
                <p class="paystub-doc-type">${t('payStubTitle')}</p>
                <p class="paystub-period">${escapeHtml(weekLabel)}</p>
              </div>
            </div>
            <div class="paystub-meta-box">
              <div class="paystub-status-pill ${statusBadgeClass}">
                ${statusText}
              </div>
              <p class="paystub-meta-line"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
              <p class="paystub-meta-line"><strong>Horario:</strong> Lun - Vie (8am - 7pm)</p>
            </div>
          </div>

          <hr class="paystub-divider">

          <!-- Información del Empleado -->
          <div class="paystub-emp-grid">
            <div class="emp-info-block">
              <span class="info-label">${t('colEmployee')}:</span>
              <span class="info-value-name">
                <span class="color-dot" style="background-color: ${emp.color};"></span>
                <strong>${escapeHtml(emp.name)}</strong>
              </span>
            </div>
            <div class="emp-info-block">
              <span class="info-label">Puesto / Cargo:</span>
              <span class="info-value">${escapeHtml(emp.role || 'Operario de Obra')}</span>
            </div>
            <div class="emp-info-block">
              <span class="info-label">${t('colRate')}:</span>
              <span class="info-value"><strong>$${emp.hourlyRate.toFixed(2)} / hora</strong></span>
            </div>
            <div class="emp-info-block">
              <span class="info-label">Período:</span>
              <span class="info-value">Semana Lunes a Viernes</span>
            </div>
          </div>

          <!-- Tabla de Desglose de Horas Diario (Lunes a Viernes) -->
          <table class="paystub-table">
            <thead>
              <tr>
                <th>${t('dayCol')}</th>
                <th>${t('dateCol')}</th>
                <th>Horario & Almuerzo</th>
                <th class="text-right">${t('hoursCol')}</th>
                <th class="text-right">${t('earningsCol')} ($)</th>
              </tr>
            </thead>
            <tbody>
              ${summary.weekDays.map(d => {
                const entry = d.entry;
                const hours = d.hours;
                const hasHours = hours > 0;
                return `
                  <tr class="${hasHours ? 'row-with-hours' : 'row-empty'}">
                    <td><strong>${d.dayName}</strong></td>
                    <td>${d.dateFormatted}</td>
                    <td class="text-muted text-sm">
                      ${hasHours && (entry?.startTime || entry?.endTime)
                        ? `${entry.startTime || '08:00'} - ${entry.endTime || '17:00'} ${entry.lunchMinutes ? `(-${entry.lunchMinutes}m)` : ''}`
                        : (hasHours ? 'Horas directas' : '-')}
                      ${entry?.address ? `<div class="paystub-day-location"><strong>📍 ${t('workAddressShort')}:</strong> ${escapeHtml(entry.address)}</div>` : ''}
                      ${(entry?.workDone || entry?.notes) ? `<div class="paystub-day-note"><strong>🛠️ ${t('workDoneShort')}:</strong> ${escapeHtml(entry.workDone || entry.notes)}</div>` : ''}
                    </td>
                    <td class="text-right"><strong>${hours.toFixed(2)}h</strong></td>
                    <td class="text-right ${hasHours ? 'text-success' : ''}">$${d.earnings.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr class="paystub-total-row">
                <td colspan="3"><strong>${t('weeklyTotals')}</strong></td>
                <td class="text-right"><strong>${summary.totalHours.toFixed(2)} hrs</strong></td>
                <td class="text-right"><strong>$${summary.totalEarnings.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <!-- Cuadro de Balance y Saldo Pendiente de Pago -->
          <div class="paystub-payment-summary">
            <div class="payment-box">
              <span class="box-label">Total Nómina Ganada:</span>
              <span class="box-val text-dark">$${summary.totalEarnings.toFixed(2)}</span>
            </div>
            <div class="payment-box">
              <span class="box-label">${t('paidAmount')}:</span>
              <span class="box-val text-success">$${(parseFloat(payment.amountPaid) || 0).toFixed(2)}</span>
            </div>
            <div class="payment-box highlight-balance">
              <span class="box-label">${t('balanceRemaining')}:</span>
              <span class="box-val ${payment.balanceDue > 0 ? 'text-danger' : 'text-success'}">
                $${(parseFloat(payment.balanceDue) || 0).toFixed(2)}
              </span>
              ${payment.balanceDue > 0 ? `<small class="balance-sub">${t('balanceDueText')}</small>` : '<small class="balance-sub">Al día</small>'}
            </div>
          </div>

          ${payment.notes ? `
            <div class="paystub-notes-alert">
              <strong>Nota de pago:</strong> "${escapeHtml(payment.notes)}"
            </div>
          ` : ''}

          <!-- Firmas Oficiales -->
          <div class="paystub-signatures">
            <div class="sig-block">
              <div class="sig-line"></div>
              <span>${t('authorizedSignature')}</span>
              <small>Waldrige Renovation LLC</small>
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <span>Firma de Conformidad del Empleado</span>
              <small>${escapeHtml(emp.name)}</small>
            </div>
          </div>

          <div class="paystub-footer-note">
            <p>Comprobante generado por el Sistema de Control de Horas & Nóminas de Waldrige Renovation LLC. Válido como constancia de horas laboradas y liquidación semanal.</p>
          </div>
        </div>
      </div>

      <div class="modal-actions no-print">
        <button type="button" class="btn btn-outline" id="btn-close-paystub-modal">${t('cancelBtn')}</button>
        <button type="button" class="btn btn-primary" id="btn-print-paystub-now">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir / Guardar en PDF
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const closeModal = () => { modal.style.display = 'none'; };
  document.getElementById('btn-close-paystub')?.addEventListener('click', closeModal);
  document.getElementById('btn-close-paystub-modal')?.addEventListener('click', closeModal);
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  document.getElementById('btn-print-paystub-now')?.addEventListener('click', () => {
    window.print();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
