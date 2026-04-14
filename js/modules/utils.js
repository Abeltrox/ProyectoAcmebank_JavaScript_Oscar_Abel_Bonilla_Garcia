/**
 * utils.js - Utilidades de formato y helpers UI
 * Banco Acme
 */

/**
 * Formatea un número como moneda COP
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea una fecha ISO a formato legible
 */
export function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateShort(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

/**
 * Formatea número de cuenta con espacios
 */
export function formatAccountNumber(num) {
  return num.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Iniciales del nombre para el avatar
 */
export function getInitials(nombres, apellidos) {
  const n = (nombres || '').trim().split(' ')[0];
  const a = (apellidos || '').trim().split(' ')[0];
  return (n[0] || '') + (a[0] || '');
}

/**
 * Construye una fila de la tabla de transacciones
 */
export function buildTxRow(tx) {
  const isCredit = tx.tipo === 'Consignación';
  const badgeClass = isCredit ? 'consignacion' : tx.tipo === 'Retiro' ? 'retiro' : 'servicio';
  const amtClass   = isCredit ? 'positive' : 'negative';
  const prefix     = isCredit ? '+' : '-';

  return `
    <tr>
      <td>${formatDateShort(tx.fecha)}</td>
      <td><code style="font-size:0.8rem;color:var(--gray-500)">${tx.referencia}</code></td>
      <td><span class="tx-badge ${badgeClass}">${tx.tipo}</span></td>
      <td>${tx.concepto}</td>
      <td class="tx-amount ${amtClass}">${prefix}${formatCurrency(tx.valor)}</td>
      <td style="color:var(--gray-700)">${formatCurrency(tx.saldoPost)}</td>
    </tr>`;
}

/**
 * Genera HTML del recibo de transacción
 */
export function buildReceiptHTML(tx, user) {
  const isCredit = tx.tipo === 'Consignación';
  return `
    <div class="receipt">
      <div class="receipt-header">
        <div class="receipt-logo">🏦 BANCO ACME</div>
        <div class="receipt-title">Comprobante de transacción</div>
      </div>
      <div class="receipt-row"><span class="label">Fecha</span><span class="value">${formatDateTime(tx.fecha)}</span></div>
      <div class="receipt-row"><span class="label">N° Referencia</span><span class="value">${tx.referencia}</span></div>
      <div class="receipt-row"><span class="label">Tipo</span><span class="value">${tx.tipo}</span></div>
      <div class="receipt-row"><span class="label">Concepto</span><span class="value">${tx.concepto}</span></div>
      <div class="receipt-row"><span class="label">Cuenta</span><span class="value">${formatAccountNumber(user.numeroCuenta)}</span></div>
      <div class="receipt-row"><span class="label">Titular</span><span class="value">${user.nombres} ${user.apellidos}</span></div>
      <div class="receipt-total">
        <span>${isCredit ? 'Total consignado' : 'Total debitado'}</span>
        <span>${formatCurrency(tx.valor)}</span>
      </div>
      <div class="receipt-row mt-2"><span class="label">Saldo disponible</span><span class="value" style="color:var(--success)">${formatCurrency(tx.saldoPost)}</span></div>
    </div>`;
}
