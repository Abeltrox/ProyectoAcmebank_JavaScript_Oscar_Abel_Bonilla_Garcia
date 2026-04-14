/**
 * storage.js - Módulo de persistencia de datos (localStorage)
 * Banco Acme - Estructuras JSON definidas aquí
 */

const DB_KEYS = {
  USERS:        'acmebank_users',
  SESSION:      'acmebank_session',
  TRANSACTIONS: 'acmebank_transactions',
};

// ─── Estructura de usuario ───────────────────────────────────────────────────
// {
//   id: string,
//   tipoId: string,
//   numeroId: string,
//   nombres: string,
//   apellidos: string,
//   genero: string,
//   telefono: string,
//   email: string,
//   direccion: string,
//   ciudad: string,
//   passwordHash: string,
//   numeroCuenta: string,
//   saldo: number,
//   fechaCreacion: string (ISO)
// }

// ─── Estructura de transacción ────────────────────────────────────────────────
// {
//   id: string,
//   userId: string,
//   fecha: string (ISO),
//   referencia: string,
//   tipo: 'Consignación' | 'Retiro' | 'Pago de servicio',
//   concepto: string,
//   valor: number,         // siempre positivo
//   saldoPost: number
// }

// ─── Sesión activa ────────────────────────────────────────────────────────────
// { userId: string, loginAt: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || null; }
  catch { return null; }
}
function _write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────
export function getUsers() { return _read(DB_KEYS.USERS) || []; }
export function saveUsers(users) { _write(DB_KEYS.USERS, users); }

export function findUserByCredentials(tipoId, numeroId) {
  return getUsers().find(u => u.tipoId === tipoId && u.numeroId === numeroId) || null;
}

export function findUserByEmail(tipoId, numeroId, email) {
  return getUsers().find(u =>
    u.tipoId === tipoId && u.numeroId === numeroId &&
    u.email.toLowerCase() === email.toLowerCase()
  ) || null;
}

export function getUserById(id) {
  return getUsers().find(u => u.id === id) || null;
}

export function createUser(data) {
  const users = getUsers();
  const duplicate = users.find(u => u.tipoId === data.tipoId && u.numeroId === data.numeroId);
  if (duplicate) throw new Error('Ya existe un usuario con ese tipo y número de identificación.');

  const user = {
    id: crypto.randomUUID(),
    ...data,
    numeroCuenta: generateAccountNumber(),
    saldo: 0,
    fechaCreacion: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(id, changes) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  users[idx] = { ...users[idx], ...changes };
  saveUsers(users);
  return users[idx];
}

// ─── Sesión ───────────────────────────────────────────────────────────────────
export function setSession(userId) {
  _write(DB_KEYS.SESSION, { userId, loginAt: new Date().toISOString() });
}
export function getSession() { return _read(DB_KEYS.SESSION); }
export function clearSession() { localStorage.removeItem(DB_KEYS.SESSION); }

export function requireAuth() {
  const session = getSession();
  if (!session) { window.location.href = 'index.html'; return null; }
  const user = getUserById(session.userId);
  if (!user) { clearSession(); window.location.href = 'index.html'; return null; }
  return user;
}

// ─── Transacciones ────────────────────────────────────────────────────────────
export function getTransactions() { return _read(DB_KEYS.TRANSACTIONS) || []; }
export function saveTransactions(txs) { _write(DB_KEYS.TRANSACTIONS, txs); }

export function getUserTransactions(userId) {
  return getTransactions()
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

export function getLastNTransactions(userId, n = 10) {
  return getUserTransactions(userId).slice(0, n);
}

export function addTransaction({ userId, tipo, concepto, valor }) {
  const user = getUserById(userId);
  if (!user) throw new Error('Usuario no encontrado.');

  const esCredito = tipo === 'Consignación';
  const nuevoSaldo = esCredito ? user.saldo + valor : user.saldo - valor;

  if (!esCredito && nuevoSaldo < 0) throw new Error('Saldo insuficiente para realizar esta operación.');

  const tx = {
    id:         crypto.randomUUID(),
    userId,
    fecha:      new Date().toISOString(),
    referencia: generateRef(),
    tipo,
    concepto,
    valor,
    saldoPost:  nuevoSaldo,
  };

  const txs = getTransactions();
  txs.push(tx);
  saveTransactions(txs);

  // Actualizar saldo del usuario
  updateUser(userId, { saldo: nuevoSaldo });

  return tx;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
export function generateAccountNumber() {
  const prefix = '4050';
  const random = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
  return `${prefix}${random}`;
}

export function generateRef() {
  return 'REF' + Date.now().toString().slice(-7) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

export function simpleHash(str) {
  // Hash básico para demo (NO usar en producción)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}
