/**
 * dashboard.js - Controlador principal del Dashboard
 * Banco Acme
 */
import { requireAuth, clearSession, addTransaction, getUserById, getLastNTransactions, getUserTransactions } from './modules/storage.js';
import { validateForm, attachLiveValidation, showAlert, RULES } from './modules/validation.js';
import { getInitials, buildReceiptHTML, formatCurrency } from './modules/utils.js';
import {
  renderHome, renderTransactions, renderConsignacion,
  renderRetiro, renderServicios, renderCertificado
} from './modules/views.js';

// ─── Autenticación ────────────────────────────────────────────────────────────
let currentUser = requireAuth();
if (!currentUser) throw new Error('No auth');

// ─── Elementos ────────────────────────────────────────────────────────────────
const mainContent    = document.getElementById('main-content');
const navItems       = document.querySelectorAll('.nav-item[data-view]');
const logoutBtn      = document.getElementById('logout-btn');
const userGreeting   = document.getElementById('user-greeting');
const userAvatar     = document.getElementById('user-avatar');
const hamburger      = document.getElementById('hamburger');
const sidebar        = document.getElementById('sidebar');
const overlay        = document.getElementById('sidebar-overlay');

// ─── Inicializar header ───────────────────────────────────────────────────────
userGreeting.textContent = currentUser.nombres;
userAvatar.textContent   = getInitials(currentUser.nombres, currentUser.apellidos);

// ─── Navegación ───────────────────────────────────────────────────────────────
function navigate(view) {
  // Refrescar usuario (saldo puede haber cambiado)
  currentUser = getUserById(currentUser.id);

  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === view));

  const transactions = getUserTransactions(currentUser.id);
  const last10       = getLastNTransactions(currentUser.id, 10);

  switch (view) {
    case 'home':         mainContent.innerHTML = renderHome(currentUser, transactions); break;
    case 'transactions': mainContent.innerHTML = renderTransactions(last10);            break;
    case 'consignacion': mainContent.innerHTML = renderConsignacion(currentUser);
                         attachConsignacionHandlers(); break;
    case 'retiro':       mainContent.innerHTML = renderRetiro(currentUser);
                         attachRetiroHandlers();       break;
    case 'servicios':    mainContent.innerHTML = renderServicios(currentUser);
                         attachServiciosHandlers();    break;
    case 'certificado':  mainContent.innerHTML = renderCertificado(currentUser);        break;
    default:             mainContent.innerHTML = renderHome(currentUser, transactions);
  }

  // Cerrar sidebar en mobile
  sidebar.classList.remove('open');
  overlay.classList.remove('show');

  // Scroll al top
  mainContent.scrollTo(0, 0);
}

// Exponer para botones inline en HTML generado
window._dashNav = navigate;

navItems.forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.view));
});

// ─── Logout ───────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  clearSession();
  window.location.href = 'index.html';
});

// ─── Mobile sidebar ───────────────────────────────────────────────────────────
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});
overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});

// ─── Helpers de recibo ────────────────────────────────────────────────────────
function showReceipt(receiptEl, tx, user, formEl) {
  formEl.classList.add('hidden');
  receiptEl.classList.remove('hidden');
  receiptEl.innerHTML = `
    ${buildReceiptHTML(tx, user)}
    <div class="d-flex gap-2 mt-3 justify-end no-print">
      <button class="btn btn-outline btn-sm" onclick="window.print()">🖨️ Imprimir</button>
      <button class="btn btn-primary btn-sm" onclick="window._dashNav('home')">Ir a inicio</button>
    </div>`;
}

// ─── Handlers: Consignación ───────────────────────────────────────────────────
function attachConsignacionHandlers() {
  const form      = document.getElementById('consig-form');
  const valorInput = document.getElementById('consig-valor');
  const alertBox  = document.getElementById('consig-alert');
  const receiptEl = document.getElementById('consig-receipt');

  attachLiveValidation(valorInput, [RULES.required, RULES.positive]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm([{ input: valorInput, rules: [RULES.required, RULES.positive] }])) return;

    try {
      const tx = addTransaction({
        userId:   currentUser.id,
        tipo:     'Consignación',
        concepto: 'Consignación por canal electrónico',
        valor:    parseFloat(valorInput.value),
      });
      currentUser = getUserById(currentUser.id);
      showReceipt(receiptEl, tx, currentUser, form);
    } catch (err) {
      showAlert(alertBox, err.message, 'error');
    }
  });
}

// ─── Handlers: Retiro ────────────────────────────────────────────────────────
function attachRetiroHandlers() {
  const form       = document.getElementById('retiro-form');
  const valorInput = document.getElementById('retiro-valor');
  const alertBox   = document.getElementById('retiro-alert');
  const receiptEl  = document.getElementById('retiro-receipt');

  attachLiveValidation(valorInput, [RULES.required, RULES.positive]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm([{ input: valorInput, rules: [RULES.required, RULES.positive] }])) return;

    try {
      const tx = addTransaction({
        userId:   currentUser.id,
        tipo:     'Retiro',
        concepto: 'Retiro de dinero',
        valor:    parseFloat(valorInput.value),
      });
      currentUser = getUserById(currentUser.id);
      showReceipt(receiptEl, tx, currentUser, form);
    } catch (err) {
      showAlert(alertBox, err.message, 'error');
    }
  });
}

// ─── Handlers: Servicios ─────────────────────────────────────────────────────
function attachServiciosHandlers() {
  const form      = document.getElementById('serv-form');
  const tipoServ  = document.getElementById('serv-tipo');
  const refInput  = document.getElementById('serv-referencia');
  const valInput  = document.getElementById('serv-valor');
  const alertBox  = document.getElementById('serv-alert');
  const receiptEl = document.getElementById('serv-receipt');

  attachLiveValidation(tipoServ, [RULES.required]);
  attachLiveValidation(refInput, [RULES.required, RULES.minLen(3)]);
  attachLiveValidation(valInput, [RULES.required, RULES.positive]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = validateForm([
      { input: tipoServ, rules: [RULES.required] },
      { input: refInput, rules: [RULES.required, RULES.minLen(3)] },
      { input: valInput, rules: [RULES.required, RULES.positive] },
    ]);
    if (!valid) return;

    try {
      const tx = addTransaction({
        userId:   currentUser.id,
        tipo:     'Retiro',
        concepto: `Pago de servicio público ${tipoServ.value}`,
        valor:    parseFloat(valInput.value),
      });
      currentUser = getUserById(currentUser.id);
      showReceipt(receiptEl, tx, currentUser, form);
    } catch (err) {
      showAlert(alertBox, err.message, 'error');
    }
  });
}

// ─── Iniciar en home ──────────────────────────────────────────────────────────
navigate('home');
