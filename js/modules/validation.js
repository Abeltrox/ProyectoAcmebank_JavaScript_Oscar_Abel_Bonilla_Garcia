/**
 * validation.js - Módulo de validaciones de formularios
 * Banco Acme
 */

// ─── Reglas ───────────────────────────────────────────────────────────────────
export const RULES = {
  required: (v) => (v && v.trim() !== '') || 'Este campo es obligatorio.',
  minLen: (n) => (v) => (v && v.length >= n) || `Mínimo ${n} caracteres.`,
  maxLen: (n) => (v) => (v && v.length <= n) || `Máximo ${n} caracteres.`,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Ingresa un correo válido.',
  phone: (v) => /^[0-9]{7,10}$/.test(v) || 'Teléfono debe tener entre 7 y 10 dígitos.',
  numberId: (v) => /^[0-9]{5,15}$/.test(v) || 'Número de identificación no válido.',
  password: (v) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v) ||
    'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
  positive: (v) => (parseFloat(v) > 0) || 'El valor debe ser mayor a 0.',
  numeric: (v) => (!isNaN(v) && v !== '') || 'Ingresa un número válido.',
};

/**
 * Valida un campo individual y actualiza la UI.
 * @param {HTMLElement} input
 * @param {Function[]} rules
 * @returns {boolean}
 */
export function validateField(input, rules) {
  const value = input.value;
  const errorEl = input.parentElement.querySelector('.field-error');

  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      input.classList.add('error');
      input.classList.remove('success');
      if (errorEl) { errorEl.textContent = result; errorEl.classList.add('show'); }
      return false;
    }
  }

  input.classList.remove('error');
  input.classList.add('success');
  if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('show'); }
  return true;
}

/**
 * Valida un formulario completo.
 * @param {Array<{input: HTMLElement, rules: Function[]}>} fields
 * @returns {boolean}
 */
export function validateForm(fields) {
  let valid = true;
  for (const { input, rules } of fields) {
    if (!validateField(input, rules)) valid = false;
  }
  return valid;
}

/**
 * Activa validación en tiempo real sobre un campo.
 */
export function attachLiveValidation(input, rules) {
  input.addEventListener('blur', () => validateField(input, rules));
  input.addEventListener('input', () => {
    // Solo limpiar error en tiempo real, no marcar success hasta blur
    if (input.classList.contains('error')) validateField(input, rules);
  });
}

/**
 * Muestra un alert en el contenedor dado.
 */
export function showAlert(container, message, type = 'error') {
  const icons = { error: '⚠️', success: '✅', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `alert alert-${type} fade-in`;
  el.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  // Reemplazar alert anterior si existe
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();
  container.prepend(el);
  // Auto-dismiss en 5s
  setTimeout(() => el.remove(), 6000);
  return el;
}

export function clearAlert(container) {
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();
}
