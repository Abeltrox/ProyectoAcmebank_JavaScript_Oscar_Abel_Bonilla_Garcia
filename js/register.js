/**
 * register.js - Lógica de registro de usuario
 * Banco Acme
 */
import { createUser, simpleHash } from './modules/storage.js';
import { validateForm, attachLiveValidation, showAlert, RULES } from './modules/validation.js';
import { formatDate, formatAccountNumber } from './modules/utils.js';

const form            = document.getElementById('register-form');
const registerSection = document.getElementById('register-section');
const successSection  = document.getElementById('success-section');
const alertBox        = document.getElementById('register-alert');

// Campos
const tipoId          = document.getElementById('tipoId');
const numeroId        = document.getElementById('numeroId');
const nombres         = document.getElementById('nombres');
const apellidos       = document.getElementById('apellidos');
const genero          = document.getElementById('genero');
const telefono        = document.getElementById('telefono');
const email           = document.getElementById('email');
const direccion       = document.getElementById('direccion');
const ciudad          = document.getElementById('ciudad');
const password        = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

// Validación en tiempo real
attachLiveValidation(tipoId,   [RULES.required]);
attachLiveValidation(numeroId, [RULES.required, RULES.numberId]);
attachLiveValidation(nombres,  [RULES.required, RULES.minLen(2)]);
attachLiveValidation(apellidos,[RULES.required, RULES.minLen(2)]);
attachLiveValidation(genero,   [RULES.required]);
attachLiveValidation(telefono, [RULES.required, RULES.phone]);
attachLiveValidation(email,    [RULES.required, RULES.email]);
attachLiveValidation(direccion,[RULES.required, RULES.minLen(5)]);
attachLiveValidation(ciudad,   [RULES.required, RULES.minLen(2)]);
attachLiveValidation(password, [RULES.required, RULES.password]);
attachLiveValidation(confirmPassword, [
  RULES.required,
  (v) => v === password.value || 'Las contraseñas no coinciden.',
]);

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const valid = validateForm([
    { input: tipoId,          rules: [RULES.required] },
    { input: numeroId,        rules: [RULES.required, RULES.numberId] },
    { input: nombres,         rules: [RULES.required, RULES.minLen(2)] },
    { input: apellidos,       rules: [RULES.required, RULES.minLen(2)] },
    { input: genero,          rules: [RULES.required] },
    { input: telefono,        rules: [RULES.required, RULES.phone] },
    { input: email,           rules: [RULES.required, RULES.email] },
    { input: direccion,       rules: [RULES.required, RULES.minLen(5)] },
    { input: ciudad,          rules: [RULES.required, RULES.minLen(2)] },
    { input: password,        rules: [RULES.required, RULES.password] },
    { input: confirmPassword, rules: [RULES.required, (v) => v === password.value || 'Las contraseñas no coinciden.'] },
  ]);

  if (!valid) return;

  try {
    const user = createUser({
      tipoId:       tipoId.value,
      numeroId:     numeroId.value.trim(),
      nombres:      nombres.value.trim(),
      apellidos:    apellidos.value.trim(),
      genero:       genero.value,
      telefono:     telefono.value.trim(),
      email:        email.value.trim().toLowerCase(),
      direccion:    direccion.value.trim(),
      ciudad:       ciudad.value.trim(),
      passwordHash: simpleHash(password.value),
    });

    // Mostrar resumen
    document.getElementById('sum-nombre').textContent  = `${user.nombres} ${user.apellidos}`;
    document.getElementById('sum-id').textContent      = `${user.tipoId} ${user.numeroId}`;
    document.getElementById('sum-cuenta').textContent  = formatAccountNumber(user.numeroCuenta);
    document.getElementById('sum-fecha').textContent   = formatDate(user.fechaCreacion);

    registerSection.classList.add('hidden');
    successSection.classList.remove('hidden');
    successSection.scrollIntoView({ behavior: 'smooth' });

    // Cuenta regresiva y redirección automática al login
    let segundos = 5;
    const countdownEl = document.getElementById('redirect-countdown');
    const countdownNum = document.getElementById('countdown-num');

    countdownEl.classList.remove('hidden');
    countdownNum.textContent = segundos;

    const intervalo = setInterval(() => {
      segundos--;
      countdownNum.textContent = segundos;
      if (segundos <= 0) {
        clearInterval(intervalo);
        window.location.href = 'index.html';
      }
    }, 1000);

    // Si el usuario hace clic en el botón manual, cancelar la cuenta y redirigir
    document.getElementById('btn-ir-login').addEventListener('click', () => {
      clearInterval(intervalo);
      window.location.href = 'index.html';
    });

  } catch (err) {
    showAlert(alertBox, err.message, 'error');
  }
});
