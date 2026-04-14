/**
 * recover.js - Lógica de recuperación de contraseña
 * Banco Acme
 */
import { findUserByEmail, updateUser, simpleHash } from './modules/storage.js';
import { validateForm, attachLiveValidation, showAlert, RULES } from './modules/validation.js';

const verifySection = document.getElementById('verify-section');
const resetSection  = document.getElementById('reset-section');
const doneSection   = document.getElementById('done-section');

// Campos paso 1
const tipoId   = document.getElementById('tipoId');
const numeroId = document.getElementById('numeroId');
const email    = document.getElementById('email');

// Campos paso 2
const newPassword        = document.getElementById('newPassword');
const confirmNewPassword = document.getElementById('confirmNewPassword');

let targetUserId = null;

// --- Paso 1 ---
attachLiveValidation(tipoId,   [RULES.required]);
attachLiveValidation(numeroId, [RULES.required, RULES.numberId]);
attachLiveValidation(email,    [RULES.required, RULES.email]);

document.getElementById('verify-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const valid = validateForm([
    { input: tipoId,   rules: [RULES.required] },
    { input: numeroId, rules: [RULES.required, RULES.numberId] },
    { input: email,    rules: [RULES.required, RULES.email] },
  ]);
  if (!valid) return;

  const user = findUserByEmail(tipoId.value, numeroId.value, email.value);
  if (!user) {
    showAlert(document.getElementById('verify-alert'),
      'No encontramos una cuenta con esos datos. Verifica la información ingresada.', 'error');
    return;
  }

  targetUserId = user.id;
  verifySection.classList.add('hidden');
  resetSection.classList.remove('hidden');
});

// --- Paso 2 ---
attachLiveValidation(newPassword, [RULES.required, RULES.password]);
attachLiveValidation(confirmNewPassword, [
  RULES.required,
  (v) => v === newPassword.value || 'Las contraseñas no coinciden.',
]);

document.getElementById('reset-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const valid = validateForm([
    { input: newPassword,        rules: [RULES.required, RULES.password] },
    { input: confirmNewPassword, rules: [RULES.required, (v) => v === newPassword.value || 'Las contraseñas no coinciden.'] },
  ]);
  if (!valid) return;

  try {
    updateUser(targetUserId, { passwordHash: simpleHash(newPassword.value) });
    resetSection.classList.add('hidden');
    doneSection.classList.remove('hidden');
  } catch (err) {
    showAlert(document.getElementById('reset-alert'), err.message, 'error');
  }
});
