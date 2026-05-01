// ═══════════════════════════════════════
//  MindMate AI — main.js
//  App initialization, navigation, auth, shared state
// ═══════════════════════════════════════

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = 'https://mindmate-ai-bqwg.onrender.com/api';

// ─── Shared App State ───
window.appState = {
  userId: null,
  userName: 'Friend',
  token: null,
};

// ─── Auth Helper: attach token to fetch requests ───
window.authFetch = function (url, options = {}) {
  const token = window.appState.token;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('mindmate_auth');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      window.appState.userId = data.userId;
      window.appState.userName = data.name;
      window.appState.token = data.token;
      launchApp(data.name);
      return;
    } catch {}
  }
  // Show auth overlay
  document.getElementById('authOverlay').style.display = 'flex';
});

// ─── Auth UI helpers ───
window.showLogin = function () {
  document.getElementById('loginCard').classList.remove('hidden');
  document.getElementById('signupCard').classList.add('hidden');
  document.getElementById('authError').classList.add('hidden');
};

window.showSignup = function () {
  document.getElementById('signupCard').classList.remove('hidden');
  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('signupError').classList.add('hidden');
};

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ─── Signup ───
window.doSignup = async function () {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    return showAuthError('signupError', 'Please fill in all fields.');
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showAuthError('signupError', data.error || 'Signup failed.');
    saveAuthAndLaunch(data);
  } catch {
    showAuthError('signupError', 'Could not connect to server.');
  }
};

// ─── Login ───
window.doLogin = async function () {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    return showAuthError('authError', 'Please enter email and password.');
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return showAuthError('authError', data.error || 'Login failed.');
    saveAuthAndLaunch(data);
  } catch {
    showAuthError('authError', 'Could not connect to server.');
  }
};

function saveAuthAndLaunch(data) {
  window.appState.userId = data.user.id;
  window.appState.userName = data.user.name;
  window.appState.token = data.token;

  localStorage.setItem('mindmate_auth', JSON.stringify({
    userId: data.user.id,
    name: data.user.name,
    token: data.token,
  }));

  document.getElementById('authOverlay').style.display = 'none';
  launchApp(data.user.name);
}

// ─── Logout ───
window.doLogout = function () {
  localStorage.removeItem('mindmate_auth');
  window.appState.userId = null;
  window.appState.userName = 'Friend';
  window.appState.token = null;

  document.getElementById('app').classList.add('hidden');
  document.getElementById('authOverlay').style.display = 'flex';
  showLogin();
};

function launchApp(name) {
  document.getElementById('app').classList.remove('hidden');

  // Set user name everywhere
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('greeting').textContent = `${getTimeGreeting()}, ${name} 👋`;
  document.getElementById('todayDate').textContent = formatDate(new Date());

  // Set journal date
  const jd = document.getElementById('journalDate');
  if (jd) jd.value = formatDateLong(new Date());

  loadDailyQuote();
  loadDashboardStats();
}

// ─── Navigation ───
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

window.navigateTo = function (pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById(`page-${pageId}`);
  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (page) page.classList.add('active');
  if (navItem) navItem.classList.add('active');

  // Page-specific load hooks
  if (pageId === 'mood') window.loadMoodData?.();
  if (pageId === 'journal') window.loadJournalList?.();
  if (pageId === 'dashboard') loadDashboardStats();
};

// ─── Daily Quote ───
async function loadDailyQuote() {
  try {
    const res = await fetch(`${API_BASE}/quote`);
    const data = await res.json();
    document.getElementById('dailyQuote').textContent = data.text;
    document.getElementById('quoteAuthor').textContent = `— ${data.author}`;
  } catch {
    document.getElementById('dailyQuote').textContent = 'You are allowed to be both a masterpiece and a work in progress simultaneously.';
    document.getElementById('quoteAuthor').textContent = '— Sophia Bush';
  }
}

// ─── Dashboard Stats ───
async function loadDashboardStats() {
  try {
    const res = await window.authFetch(`${API_BASE}/mood`);
    const data = await res.json();
    if (data.moods) {
      document.getElementById('moodCount').textContent = data.total || 0;
      document.getElementById('todayMood').textContent = capitalize(data.dominantMood || '—');
    }
  } catch {}

  try {
    const res = await window.authFetch(`${API_BASE}/journal`);
    const journals = await res.json();
    document.getElementById('journalCount').textContent = journals.length || 0;
  } catch {}
}

// ─── Quick Mood from Dashboard ───
window.quickMoodLog = async function (mood) {
  try {
    await window.authFetch(`${API_BASE}/mood`, {
      method: 'POST',
      body: JSON.stringify({ mood, intensity: 5 }),
    });
    showToast(`${moodEmoji(mood)} ${capitalize(mood)} mood saved!`);
    document.getElementById('todayMood').textContent = capitalize(mood);

    // Highlight selected button briefly
    document.querySelectorAll('.mood-quick-btn').forEach(btn => {
      if (btn.dataset.mood === mood) {
        btn.style.background = 'var(--purple-light)';
        btn.style.borderColor = 'var(--purple)';
        setTimeout(() => {
          btn.style.background = '';
          btn.style.borderColor = '';
        }, 1500);
      }
    });
  } catch {
    showToast('Could not save mood. Check your connection.');
  }
};

// ─── Toast ───
window.showToast = function (msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add('hidden'), duration);
};

// ─── Helpers ───
function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDateLong(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

window.capitalize = function (s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

window.moodEmoji = function (mood) {
  const map = { happy: '😄', sad: '😔', anxious: '😰', angry: '😠', stressed: '😤', calm: '😌', neutral: '😶' };
  return map[mood] || '😶';
};

window.formatRelativeDate = function (dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${diff} days ago`;
};

