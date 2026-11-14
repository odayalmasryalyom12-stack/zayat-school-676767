// Demo only: everything is stored in this browser's localStorage, so it is NOT secure.

// VIP accounts: add or edit lines here. They always get the user-management page.
// "email" is what they type in the first box (a username here).
const VIP_ACCOUNTS = [
  { name: 'أستاذة جيهان موسى', email: '115007', password: '160508' },
  { name: 'أستاذة همت صادق', email: '115008', password: '160509' },
  { name: 'أستاذ صلاح اللبان', email: '115009', password: '160510' },
  { name: 'أستاذة ايمان العاودلي', email: '115010', password: '160511' },
  { name: 'المبرمجون: عدي جمال دنيور ومروان محمد منصور', email: '2016', password: '0925' },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = e => e.trim().toLowerCase();
const getUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const setUsers = u => localStorage.setItem('users', JSON.stringify(u));

(function seedVips() {
  const vipIds = VIP_ACCOUNTS.map(v => norm(v.email));
  const users = getUsers().filter(u => u.role !== 'teacher' || vipIds.includes(u.email));
  for (const v of VIP_ACCOUNTS) {
    const email = norm(v.email);
    const u = users.find(x => x.email === email);
    if (u) Object.assign(u, { name: v.name, password: v.password, role: 'teacher' });
    else users.push({ id: uid(), name: v.name, email, password: v.password, role: 'teacher', suspended: false, provider: 'email' });
  }
  setUsers(users);
})();

const GUEST = { id: 'guest', name: 'ضيف', role: 'guest' };
const startSession = u => localStorage.setItem('session', u.id);
const guestSignIn = () => startSession(GUEST);
const logout = () => localStorage.removeItem('session');
const currentUser = () => localStorage.getItem('session') === GUEST.id
  ? GUEST
  : getUsers().find(u => u.id === localStorage.getItem('session')) || null;

// Each returns an error message, or null on success (and starts the session).
function signUp(name, email, password) {
  email = norm(email);
  if (!email.includes('@')) return 'اكتب بريداً صحيحاً، مثل name@example.com';
  const users = getUsers();
  if (users.some(u => u.email === email)) return 'هذا البريد مسجّل بالفعل';
  const u = { id: uid(), name: name.trim() || email.split('@')[0], email, password, role: 'user', suspended: false, provider: 'email' };
  setUsers([...users, u]);
  startSession(u);
  return null;
}

function signIn(email, password) {
  const u = getUsers().find(x => x.email === norm(email) && x.password === password);
  if (!u) return 'البريد أو كلمة المرور غير صحيحة';
  if (u.suspended) return 'هذا الحساب موقوف';
  startSession(u);
  return null;
}

// Simulated Google/Facebook: real OAuth needs a server and app keys.
function socialSignIn(provider, email) {
  email = norm(email);
  const users = getUsers();
  let u = users.find(x => x.email === email);
  if (u && u.role !== 'user') return 'حسابات المعلمين تدخل بكلمة المرور';
  if (u && u.provider !== provider) return 'هذا البريد مسجّل بطريقة أخرى';
  if (u && u.suspended) return 'هذا الحساب موقوف';
  if (!u) {
    u = { id: uid(), name: email.split('@')[0], email, password: '', role: 'user', suspended: false, provider };
    setUsers([...users, u]);
  }
  startSession(u);
  return null;
}

function setSuspended(id, flag) {
  const users = getUsers();
  const u = users.find(x => x.id === id);
  if (u && u.role === 'user') { u.suspended = flag; setUsers(users); }
}

function deleteUser(id) {
  setUsers(getUsers().filter(u => u.id !== id || u.role !== 'user'));
}
