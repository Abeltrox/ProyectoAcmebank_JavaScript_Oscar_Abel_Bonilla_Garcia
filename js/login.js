/**
 * login.js - Lógica de inicio de sesión
 * Banco Acme
 */
import { findUserByCredentials, setSession, getSession } from './modules/storage.js';
import { validateForm, attachLiveValidation, showAlert, RULES } from './modules/validation.js';
import { simpleHash } from './modules/storage.js';

// Si ya hay sesión activa, redirigir al dashboard
if (getSession()) window.location.href = 'dashboard.html';

const form     = document.getElementById('login-form');
const tipoId   = document.getElementById('tipoId');
const numeroId = document.getElementById('numeroId');
const password = document.getElementById('password');
const alertBox = document.getElementById('login-alert');

// Validación en tiempo real
attachLiveValidation(tipoId,   [RULES.required]);
attachLiveValidation(numeroId, [RULES.required, RULES.numberId]);
attachLiveValidation(password, [RULES.required]);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const valid = validateForm([
    { input: tipoId,   rules: [RULES.required] },
    { input: numeroId, rules: [RULES.required, RULES.numberId] },
    { input: password, rules: [RULES.required] },
  ]);

  if (!valid) return;

  const user = findUserByCredentials(tipoId.value, numeroId.value);
  const hash = simpleHash(password.value);

  if (!user || user.passwordHash !== hash) {
    showAlert(alertBox, 'No se pudo validar tu identidad. Verifica tus datos e intenta de nuevo.', 'error');
    return;
  }

  setSession(user.id);
  window.location.href = 'dashboard.html';
});
