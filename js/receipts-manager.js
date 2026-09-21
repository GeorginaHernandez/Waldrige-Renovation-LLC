/**
 * receipts-manager.js - Gestor de Recibos y Comprobantes Fotográficos
 * Waldrige Renovation LLC
 */

import { store } from './store.js';
import { t } from './i18n.js';

/**
 * Comprime y optimiza una imagen a Base64 utilizando un Canvas HTML5
 * para que no sature el almacenamiento local y mantenga perfecta legibilidad.
 */
export async function compressReceiptImage(file, maxDimension = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo no es una imagen válida'));
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Fondo blanco por si hay transparencias (PNG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Traduce el identificador de categoría a su texto en el idioma activo
 */
export function getCategoryLabel(categoryKey) {
  const map = {
    catMaterials: t('catMaterials'),
    catTools: t('catTools'),
    catFuel: t('catFuel'),
    catFood: t('catFood'),
    catOther: t('catOther')
  };
  return map[categoryKey] || t('catMaterials');
}

/**
 * Abre un modal visor a tamaño completo con zoom para la foto del recibo
 */
export function showReceiptLightbox(receipt) {
  let modal = document.getElementById('receipt-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'receipt-lightbox-modal';
    modal.className = 'modal-overlay receipt-lightbox-overlay';
    document.body.appendChild(modal);
  }

  const categoryName = getCategoryLabel(receipt.category);

  modal.innerHTML = `
    <div class="modal-dialog receipt-lightbox-dialog">
      <div class="modal-header">
        <div>
          <h3>${escapeHtml(receipt.storeName)} - $${parseFloat(receipt.amount).toFixed(2)}</h3>
          <span class="text-muted text-sm">${escapeHtml(receipt.employeeName)} &bull; ${receipt.date} &bull; ${categoryName}</span>
        </div>
        <button class="btn-close-modal" id="btn-close-lightbox">&times;</button>
      </div>
      <div class="lightbox-body text-center">
        ${receipt.imageBase64 ? `
          <img src="${receipt.imageBase64}" alt="Recibo ${escapeHtml(receipt.storeName)}" class="receipt-full-img">
        ` : `
          <div class="empty-state py-5">
            <p class="text-muted">No se adjuntó imagen fotográfica para este recibo.</p>
          </div>
        `}
      </div>
      <div class="lightbox-footer">
        <div class="lightbox-meta">
          <p><strong>Método / Tarjeta:</strong> ${escapeHtml(receipt.paymentCardName || 'Efectivo / Propio')}</p>
          ${receipt.notes ? `<p><strong>Notas:</strong> "${escapeHtml(receipt.notes)}"</p>` : ''}
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="btn-print-single-receipt">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Recibo
          </button>
          <button class="btn btn-primary" id="btn-done-lightbox">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const closeLb = () => { modal.style.display = 'none'; };
  document.getElementById('btn-close-lightbox')?.addEventListener('click', closeLb);
  document.getElementById('btn-done-lightbox')?.addEventListener('click', closeLb);
  modal.onclick = (e) => {
    if (e.target === modal) closeLb();
  };

  document.getElementById('btn-print-single-receipt')?.addEventListener('click', () => {
    printSingleReceiptDoc(receipt);
  });
}

/**
 * Genera una ventana o vista para imprimir un reporte consolidado de gastos con fotos
 */
export function printReceiptsReport(receiptsList, title = 'Reporte de Gastos & Comprobantes') {
  let printContainer = document.getElementById('printable-receipts-report');
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'printable-receipts-report';
    printContainer.className = 'print-only-container';
    document.body.appendChild(printContainer);
  }

  let totalAmount = 0;
  receiptsList.forEach(r => { totalAmount += (parseFloat(r.amount) || 0); });

  printContainer.innerHTML = `
    <div class="print-sheet">
      <div class="print-header">
        <div class="print-brand">
          <div class="print-logo">WR</div>
          <div>
            <h1>WALDRIGE RENOVATION LLC</h1>
            <h2>${escapeHtml(title)}</h2>
          </div>
        </div>
        <div class="print-meta-box">
          <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total de Recibos:</strong> ${receiptsList.length}</p>
          <p class="text-success" style="font-size: 1.1rem; font-weight: bold;">
            <strong>Monto Total:</strong> $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <!-- Tabla Resumen de Gastos -->
      <table class="print-table" style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 8px; text-align: left;">Fecha</th>
            <th style="padding: 8px; text-align: left;">Empleado</th>
            <th style="padding: 8px; text-align: left;">Comercio / Tienda</th>
            <th style="padding: 8px; text-align: left;">Categoría</th>
            <th style="padding: 8px; text-align: left;">Tarjeta / Método</th>
            <th style="padding: 8px; text-align: right;">Monto ($)</th>
          </tr>
        </thead>
        <tbody>
          ${receiptsList.map(r => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px;">${r.date}</td>
              <td style="padding: 8px; font-weight: 500;">${escapeHtml(r.employeeName)}</td>
              <td style="padding: 8px; font-weight: bold;">${escapeHtml(r.storeName)}</td>
              <td style="padding: 8px;">${getCategoryLabel(r.category)}</td>
              <td style="padding: 8px; font-size: 0.85rem;">${escapeHtml(r.paymentCardName || 'Efectivo')}</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">$${parseFloat(r.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #334155;">
            <td colspan="5" style="padding: 10px; text-align: right;">TOTAL GASTOS:</td>
            <td style="padding: 10px; text-align: right; font-size: 1.1rem; color: #047857;">
              $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Galería de Comprobantes Fotográficos para Contabilidad -->
      <div class="print-receipts-gallery">
        <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 6px; margin-bottom: 15px;">
          Comprobantes Fotográficos Adjuntos
        </h3>
        <div class="print-photos-grid">
          ${receiptsList.filter(r => r.imageBase64).map(r => `
            <div class="print-photo-card" style="page-break-inside: avoid; border: 1px solid #ccc; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
              <div style="font-size: 0.9rem; margin-bottom: 8px;">
                <strong>${escapeHtml(r.storeName)}</strong> - $${parseFloat(r.amount).toFixed(2)} 
                <span style="color: #666;">(${r.date} - ${escapeHtml(r.employeeName)})</span>
              </div>
              <img src="${r.imageBase64}" style="max-width: 100%; max-height: 420px; object-fit: contain; display: block; margin: 0 auto; border: 1px solid #e2e8f0;">
              ${r.notes ? `<p style="font-size: 0.8rem; color: #555; margin-top: 6px; font-style: italic;">Nota: "${escapeHtml(r.notes)}"</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  window.print();
}

function printSingleReceiptDoc(receipt) {
  printReceiptsReport([receipt], `Comprobante de Gasto: ${receipt.storeName}`);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
