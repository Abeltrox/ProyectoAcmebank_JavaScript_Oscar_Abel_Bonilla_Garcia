/**
 * views.js - Generadores HTML de vistas del dashboard
 * Banco Acme
 */
import { formatCurrency, formatDate, formatDateShort, formatDateTime, formatAccountNumber, buildTxRow, buildReceiptHTML } from './utils.js';

// ─── VISTA: INICIO (resumen de cuenta) ────────────────────────────────────────
export function renderHome(user, transactions) {
  const lastTx = transactions.slice(0, 3);
  return `
    <div class="fade-in">
      <!-- Tarjeta de cuenta -->
      <div class="account-summary-card">
        <div class="card-chip"></div>
        <div class="card-account-label">Número de cuenta</div>
        <div class="card-account-number">${formatAccountNumber(user.numeroCuenta)}</div>
        <div class="card-balance-label">Saldo disponible</div>
        <div class="card-balance"><span>$</span>${formatCurrency(user.saldo).replace('$','').replace('COP','').trim()}</div>
        <div class="card-footer-row">
          <div>
            <div class="card-holder">${user.nombres} ${user.apellidos}</div>
            <div class="card-since">Miembro desde ${formatDate(user.fechaCreacion)}</div>
          </div>
          <div style="font-size:2rem; opacity:0.7">🏦</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon blue">💳</div>
          <div class="stat-info">
            <div class="stat-value">${formatAccountNumber(user.numeroCuenta).slice(0,9)}…</div>
            <div class="stat-label">N° Cuenta</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📈</div>
          <div class="stat-info">
            <div class="stat-value">${transactions.length}</div>
            <div class="stat-label">Transacciones totales</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon gold">📅</div>
          <div class="stat-info">
            <div class="stat-value">${formatDateShort(user.fechaCreacion)}</div>
            <div class="stat-label">Fecha apertura</div>
          </div>
        </div>
      </div>

      <!-- Últimas transacciones -->
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Últimas transacciones</div>
            <div class="panel-subtitle">Tus 3 movimientos más recientes</div>
          </div>
        </div>
        ${lastTx.length === 0
          ? `<div class="empty-state"><div class="icon">📭</div><p>Aún no tienes transacciones. ¡Realiza tu primera consignación!</p></div>`
          : `<table class="tx-table">
              <thead><tr>
                <th>Fecha</th><th>Referencia</th><th>Tipo</th><th>Concepto</th><th>Valor</th><th>Saldo</th>
              </tr></thead>
              <tbody>${lastTx.map(buildTxRow).join('')}</tbody>
             </table>`
        }
      </div>
    </div>`;
}

// ─── VISTA: RESUMEN DE TRANSACCIONES ─────────────────────────────────────────
export function renderTransactions(transactions) {
  const last10 = transactions.slice(0, 10);
  return `
    <div class="fade-in">
      <div class="panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">Resumen de transacciones</div>
            <div class="panel-subtitle">Últimas 10 operaciones realizadas</div>
          </div>
          <button class="btn btn-outline btn-sm no-print" onclick="window.print()">🖨️ Imprimir</button>
        </div>
        ${last10.length === 0
          ? `<div class="empty-state"><div class="icon">📭</div><p>No tienes transacciones aún.</p></div>`
          : `<div style="overflow-x:auto">
              <table class="tx-table">
                <thead><tr>
                  <th>Fecha</th><th>Referencia</th><th>Tipo</th><th>Concepto</th><th>Valor</th><th>Saldo posterior</th>
                </tr></thead>
                <tbody>${last10.map(buildTxRow).join('')}</tbody>
              </table>
             </div>`
        }
      </div>
    </div>`;
}

// ─── VISTA: CONSIGNACIÓN ──────────────────────────────────────────────────────
export function renderConsignacion(user) {
  return `
    <div class="fade-in">
      <div class="panel" style="max-width:560px">
        <div class="panel-header">
          <div>
            <div class="panel-title">Consignación electrónica</div>
            <div class="panel-subtitle">Ingresa dinero a tu cuenta</div>
          </div>
        </div>

        <div class="form-info-bar">
          <div class="info-item">
            <div class="info-label">Cuenta</div>
            <div class="info-value">${formatAccountNumber(user.numeroCuenta)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Titular</div>
            <div class="info-value">${user.nombres} ${user.apellidos}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Saldo actual</div>
            <div class="info-value" style="color:var(--success)">${formatCurrency(user.saldo)}</div>
          </div>
        </div>

        <div id="consig-alert"></div>
        <div id="consig-receipt" class="hidden"></div>

        <form id="consig-form" novalidate>
          <div class="form-group">
            <label for="consig-valor">Monto a consignar (COP) *</label>
            <input type="number" id="consig-valor" class="form-control" placeholder="Ej. 500000" min="1" required />
            <span class="field-error"></span>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button type="button" class="btn btn-outline" onclick="window._dashNav('home')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Consignar</button>
          </div>
        </form>
      </div>
    </div>`;
}

// ─── VISTA: RETIRO ────────────────────────────────────────────────────────────
export function renderRetiro(user) {
  return `
    <div class="fade-in">
      <div class="panel" style="max-width:560px">
        <div class="panel-header">
          <div>
            <div class="panel-title">Retiro de dinero</div>
            <div class="panel-subtitle">Retira fondos de tu cuenta</div>
          </div>
        </div>

        <div class="form-info-bar">
          <div class="info-item">
            <div class="info-label">Cuenta</div>
            <div class="info-value">${formatAccountNumber(user.numeroCuenta)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Titular</div>
            <div class="info-value">${user.nombres} ${user.apellidos}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Saldo disponible</div>
            <div class="info-value" style="color:var(--success)">${formatCurrency(user.saldo)}</div>
          </div>
        </div>

        <div id="retiro-alert"></div>
        <div id="retiro-receipt" class="hidden"></div>

        <form id="retiro-form" novalidate>
          <div class="form-group">
            <label for="retiro-valor">Monto a retirar (COP) *</label>
            <input type="number" id="retiro-valor" class="form-control" placeholder="Ej. 200000" min="1" required />
            <span class="field-error"></span>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button type="button" class="btn btn-outline" onclick="window._dashNav('home')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Retirar</button>
          </div>
        </form>
      </div>
    </div>`;
}

// ─── VISTA: PAGO DE SERVICIOS ─────────────────────────────────────────────────
export function renderServicios(user) {
  return `
    <div class="fade-in">
      <div class="panel" style="max-width:560px">
        <div class="panel-header">
          <div>
            <div class="panel-title">Pago de servicios públicos</div>
            <div class="panel-subtitle">Paga tus facturas de servicios</div>
          </div>
        </div>

        <div class="form-info-bar">
          <div class="info-item">
            <div class="info-label">Cuenta</div>
            <div class="info-value">${formatAccountNumber(user.numeroCuenta)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Titular</div>
            <div class="info-value">${user.nombres} ${user.apellidos}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Saldo disponible</div>
            <div class="info-value" style="color:var(--success)">${formatCurrency(user.saldo)}</div>
          </div>
        </div>

        <div id="serv-alert"></div>
        <div id="serv-receipt" class="hidden"></div>

        <form id="serv-form" novalidate>
          <div class="form-group">
            <label for="serv-tipo">Servicio a pagar *</label>
            <select id="serv-tipo" class="form-control" required>
              <option value="">Selecciona servicio...</option>
              <option value="Energía">⚡ Energía eléctrica</option>
              <option value="Agua">💧 Agua potable</option>
              <option value="Gas natural">🔥 Gas natural</option>
              <option value="Internet">🌐 Internet</option>
            </select>
            <span class="field-error"></span>
          </div>
          <div class="form-group">
            <label for="serv-referencia">Número de referencia de la factura *</label>
            <input type="text" id="serv-referencia" class="form-control" placeholder="Ej. 123456789" required />
            <span class="field-error"></span>
          </div>
          <div class="form-group">
            <label for="serv-valor">Valor a pagar (COP) *</label>
            <input type="number" id="serv-valor" class="form-control" placeholder="Ej. 85000" min="1" required />
            <span class="field-error"></span>
          </div>
          <div class="d-flex gap-2 mt-3">
            <button type="button" class="btn btn-outline" onclick="window._dashNav('home')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Pagar servicio</button>
          </div>
        </form>
      </div>
    </div>`;
}

// ─── VISTA: CERTIFICADO ───────────────────────────────────────────────────────
export function renderCertificado(user) {
  const today = formatDate(new Date().toISOString());
  return `
    <div class="fade-in">
      <div style="display:flex; justify-content:flex-end; margin-bottom:1rem;" class="no-print">
        <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Imprimir certificado</button>
      </div>
      <div class="certificate">
        <div class="cert-logo">🏦 BANCO ACME</div>
        <div class="cert-subtitle">Entidad Bancaria Certificada</div>
        <div class="cert-divider"></div>
        <div class="cert-title">CERTIFICADO BANCARIO</div>
        <div class="cert-body">
          <p>Banco Acme, certifica que el señor(a):</p>
          <br/>
          <p style="font-size:1.2rem; font-weight:700; color:var(--navy)">
            ${user.nombres} ${user.apellidos}
          </p>
          <p>identificado(a) con <strong>${user.tipoId} N° ${user.numeroId}</strong>,</p>
          <br/>
          <p>
            es titular de la cuenta de ahorros número
            <strong>${formatAccountNumber(user.numeroCuenta)}</strong>,
            la cual se encuentra <strong>activa y al día</strong> en esta institución
            desde el <strong>${formatDate(user.fechaCreacion)}</strong>.
          </p>
          <br/>
          <p>
            La cuenta presenta un saldo disponible de
            <strong>${formatCurrency(user.saldo)}</strong>.
          </p>
          <br/>
          <p style="font-size:0.85rem; color:var(--gray-500)">
            El presente certificado se expide el día <strong>${today}</strong>,
            a solicitud del interesado y para los fines que estime conveniente.
          </p>
        </div>
        <div class="cert-seal">🏦</div>
        <div class="cert-date">
          Banco Acme S.A. — Nit 800.123.456-7 — Vigilado por la Superintendencia Financiera de Colombia
        </div>
      </div>
    </div>`;
}
