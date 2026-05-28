/* ═══════════════════════════════════════════
   Auth UI — Login / Sign Up / Reset Password
   ═══════════════════════════════════════════ */

let authMode = 'login'; // 'login' | 'signup' | 'reset'

// ── Init Auth ──
function initAuth() {
  // If Supabase is not configured, skip auth entirely
  if (typeof SUPABASE_ENABLED !== 'undefined' && !SUPABASE_ENABLED) {
    showApp({ email: 'local@fau.de', id: 'local' });
    return;
  }

  renderAuthForm();
  setupAuthListeners();

  // Check current session
  supaOnAuthStateChange((event, session) => {
    if (session && session.user) {
      showApp(session.user);
    } else {
      showAuth();
    }
  });
}

// ── Show / Hide ──
function showAuth() {
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('app-container').classList.add('hidden');
}

function showApp(user) {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  updateUserBadge(user);
  initApp(); // Start the main app
}

function updateUserBadge(user) {
  const badge = document.getElementById('user-badge');
  if (!badge || !user) return;
  const email = user.email || 'User';
  const initial = email.charAt(0).toUpperCase();
  badge.innerHTML = `
    <div class="user-avatar">${initial}</div>
    <span class="user-email">${email}</span>
    <button class="btn-outline btn-logout" onclick="handleLogout()" title="Sign out">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>
  `;
}

// ── Render Auth Form ──
function renderAuthForm() {
  const container = document.getElementById('auth-form-container');
  if (!container) return;

  const isLogin = authMode === 'login';
  const isSignup = authMode === 'signup';
  const isReset = authMode === 'reset';

  let html = `
    <div class="auth-card">
      <div class="auth-logo">
        <svg viewBox="0 0 48 48" width="48" height="48">
          <defs>
            <linearGradient id="auth-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="100%" stop-color="#a855f7"/>
            </linearGradient>
          </defs>
          <rect rx="12" width="48" height="48" fill="url(#auth-grad)"/>
          <text x="24" y="32" text-anchor="middle" fill="#fff" font-size="24" font-weight="700">F</text>
        </svg>
      </div>
      <h2 class="auth-title">${isReset ? 'Reset Password' : 'FAU Schedule'}</h2>
      <p class="auth-subtitle">${isReset ? 'Enter your email to receive a reset link' : isSignup ? 'Create your account to get started' : 'Sign in to your schedule'}</p>
  `;

  if (!isReset) {
    html += `
      <div class="auth-tabs">
        <button class="auth-tab ${isLogin ? 'active' : ''}" onclick="switchAuthMode('login')">Sign In</button>
        <button class="auth-tab ${isSignup ? 'active' : ''}" onclick="switchAuthMode('signup')">Sign Up</button>
      </div>
    `;
  }

  html += `
      <div class="auth-form">
        <div class="auth-field">
          <label for="auth-email">Email</label>
          <input type="email" id="auth-email" placeholder="you@fau.de" autocomplete="email">
        </div>
  `;

  if (!isReset) {
    html += `
        <div class="auth-field">
          <label for="auth-password">Password</label>
          <div class="auth-password-wrap">
            <input type="password" id="auth-password" placeholder="${isSignup ? 'Min 6 characters' : 'Your password'}" autocomplete="${isSignup ? 'new-password' : 'current-password'}">
            <button type="button" class="auth-eye" onclick="togglePasswordVisibility()" title="Toggle visibility">
              <svg id="eye-open" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg id="eye-closed" class="hidden" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>
    `;
  }

  if (isSignup) {
    html += `
        <div class="auth-field">
          <label for="auth-password-confirm">Confirm Password</label>
          <input type="password" id="auth-password-confirm" placeholder="Re-enter password" autocomplete="new-password">
        </div>
    `;
  }

  html += `
        <div id="auth-error" class="auth-error hidden"></div>
        <div id="auth-success" class="auth-success hidden"></div>

        <button id="auth-submit-btn" class="btn-accent auth-submit" onclick="handleAuthSubmit()">
          <span id="auth-submit-text">${isReset ? 'Send Reset Link' : isSignup ? 'Create Account' : 'Sign In'}</span>
          <div id="auth-spinner" class="auth-spinner hidden"></div>
        </button>
  `;

  if (isLogin) {
    html += `
        <button class="auth-forgot" onclick="switchAuthMode('reset')">Forgot your password?</button>
    `;
  }

  if (isReset) {
    html += `
        <button class="auth-forgot" onclick="switchAuthMode('login')">← Back to Sign In</button>
    `;
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function switchAuthMode(mode) {
  authMode = mode;
  renderAuthForm();
}

function togglePasswordVisibility() {
  const input = document.getElementById('auth-password');
  const eyeOpen = document.getElementById('eye-open');
  const eyeClosed = document.getElementById('eye-closed');
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    eyeOpen.classList.add('hidden');
    eyeClosed.classList.remove('hidden');
  } else {
    input.type = 'password';
    eyeOpen.classList.remove('hidden');
    eyeClosed.classList.add('hidden');
  }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  const success = document.getElementById('auth-success');
  if (success) success.classList.add('hidden');
}

function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  const error = document.getElementById('auth-error');
  if (error) error.classList.add('hidden');
}

function clearAuthMessages() {
  const error = document.getElementById('auth-error');
  const success = document.getElementById('auth-success');
  if (error) error.classList.add('hidden');
  if (success) success.classList.add('hidden');
}

function setAuthLoading(loading) {
  const btn = document.getElementById('auth-submit-btn');
  const text = document.getElementById('auth-submit-text');
  const spinner = document.getElementById('auth-spinner');
  if (!btn) return;
  btn.disabled = loading;
  if (text) text.style.opacity = loading ? '0' : '1';
  if (spinner) spinner.classList.toggle('hidden', !loading);
}

// ── Setup Listeners ──
function setupAuthListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('auth-page').classList.contains('hidden')) {
      handleAuthSubmit();
    }
  });
}

// ── Handle Submit ──
async function handleAuthSubmit() {
  clearAuthMessages();
  const email = document.getElementById('auth-email')?.value.trim();
  const password = document.getElementById('auth-password')?.value;
  const passwordConfirm = document.getElementById('auth-password-confirm')?.value;

  // Validate email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthError('Please enter a valid email address.');
    return;
  }

  if (authMode === 'reset') {
    setAuthLoading(true);
    try {
      await supaResetPassword(email);
      showAuthSuccess('Password reset link sent! Check your email inbox.');
    } catch (err) {
      showAuthError(err.message || 'Failed to send reset link.');
    } finally {
      setAuthLoading(false);
    }
    return;
  }

  // Validate password
  if (!password || password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  if (authMode === 'signup' && password !== passwordConfirm) {
    showAuthError('Passwords do not match.');
    return;
  }

  setAuthLoading(true);

  try {
    if (authMode === 'signup') {
      const data = await supaSignUp(email, password);
      // Check if email confirmation is required
      if (data.user && !data.session) {
        showAuthSuccess('Account created! Please check your email to confirm your account.');
        setAuthLoading(false);
        return;
      }
      // If auto-confirmed, seed default courses
      if (data.session) {
        try {
          await seedDefaultCourses();
        } catch (seedErr) {
          console.warn('Could not seed default courses:', seedErr);
        }
      }
    } else {
      await supaSignIn(email, password);
    }
  } catch (err) {
    let msg = err.message || 'Authentication failed.';
    // Friendlier error messages
    if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password. Please try again.';
    if (msg.includes('User already registered')) msg = 'This email is already registered. Try signing in instead.';
    if (msg.includes('Email not confirmed')) msg = 'Please confirm your email before signing in. Check your inbox.';
    showAuthError(msg);
  } finally {
    setAuthLoading(false);
  }
}

// ── Logout ──
async function handleLogout() {
  try {
    await supaSignOut();
    if (typeof courses !== 'undefined') courses = [];
    if (typeof exams !== 'undefined') exams = [];
    // In local mode, just reinitialize rather than showing auth
    if (typeof SUPABASE_ENABLED !== 'undefined' && !SUPABASE_ENABLED) {
      initApp();
    } else {
      showAuth();
    }
  } catch (err) {
    toast('Failed to sign out', 'error');
  }
}
