/* ═══════════════════════════════════════════
   FAU Schedule App — Core Logic
   ═══════════════════════════════════════════ */

// ── State ──
let courses = [];
let activeDay = '';
let editingId = null;
let formCancelledDates = [];

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadCourses();
  setupClock();
  setupTheme();
  setupKeyboard();
  detectDay();
  renderDayTabs();
  renderSchedule();
});

// ═══ Data Layer ═══

function loadCourses() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { courses = JSON.parse(saved); } catch { courses = structuredClone(DEFAULT_COURSES); saveCourses(); }
  } else {
    courses = structuredClone(DEFAULT_COURSES);
    saveCourses();
  }
}

function saveCourses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getCoursesForDay(day) {
  return courses
    .filter(c => c.days.includes(day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// ═══ Clock & Date ═══

function setupClock() {
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateNextClass, 30000);
}

function updateClock() {
  const now = new Date();
  document.getElementById('header-clock').textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('header-date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function updateNextClass() {
  const badge = document.getElementById('next-class-badge');
  const now = new Date();
  const dayName = DAYS[now.getDay() - 1];
  if (!dayName) { badge.classList.add('hidden'); return; }

  const todayStr = getTodayString();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dayCourses = getCoursesForDay(dayName).filter(c => !c.cancelledDates.includes(todayStr));

  let next = null;
  for (const c of dayCourses) {
    const [h, m] = c.startTime.split(':').map(Number);
    const start = h * 60 + m;
    if (start > nowMin) { next = c; break; }
  }

  if (next) {
    const [h, m] = next.startTime.split(':').map(Number);
    const diff = (h * 60 + m) - nowMin;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    badge.textContent = `⏱ Next: ${next.name.slice(0, 25)}${next.name.length > 25 ? '…' : ''} in ${hrs ? hrs + 'h ' : ''}${mins}m`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ═══ Theme ═══

function setupTheme() {
  const saved = localStorage.getItem('fau_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  syncThemeIcons();
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fau_theme', next);
    syncThemeIcons();
  });
}

function syncThemeIcons() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.getElementById('theme-icon-sun').classList.toggle('hidden', !isDark);
  document.getElementById('theme-icon-moon').classList.toggle('hidden', isDark);
}

// ═══ Keyboard ═══

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDetail();
      closeForm();
      closeConfirm();
    }
    // Arrow keys for day navigation on schedule page
    if (document.getElementById('schedule-page').classList.contains('active')) {
      const idx = DAYS.indexOf(activeDay);
      if (e.key === 'ArrowLeft' && idx > 0) { selectDay(DAYS[idx - 1]); }
      if (e.key === 'ArrowRight' && idx < DAYS.length - 1) { selectDay(DAYS[idx + 1]); }
    }
  });
}

// ═══ Day Detection & Tabs ═══

function detectDay() {
  const dow = new Date().getDay(); // 0=Sun
  if (dow >= 1 && dow <= 5) {
    activeDay = DAYS[dow - 1];
  } else {
    activeDay = 'Monday';
    document.getElementById('weekend-msg').classList.remove('hidden');
    setTimeout(runConfetti, 300);
  }
  updateNextClass();
}

function renderDayTabs() {
  const container = document.getElementById('day-tabs');
  container.innerHTML = DAYS.map(d => {
    const count = getCoursesForDay(d).length;
    const isToday = DAYS[new Date().getDay() - 1] === d;
    return `<div class="day-tab${d === activeDay ? ' active' : ''}" onclick="selectDay('${d}')" role="tab" aria-selected="${d === activeDay}">
      ${d.slice(0, 3)}${isToday ? ' •' : ''}<span class="tab-count">${count}</span>
    </div>`;
  }).join('');
}

function selectDay(day) {
  activeDay = day;
  renderDayTabs();
  renderSchedule();
}

// ═══ Schedule Rendering ═══

function renderSchedule() {
  const container = document.getElementById('schedule-cards');
  const dayCourses = getCoursesForDay(activeDay);
  const todayStr = getTodayString();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = DAYS[now.getDay() - 1] === activeDay;

  if (dayCourses.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📚</div><h3>No classes on ${activeDay}</h3><p>Enjoy your free time!</p></div>`;
    return;
  }

  let html = '';
  let nowInserted = false;

  dayCourses.forEach((c, i) => {
    const [sh, sm] = c.startTime.split(':').map(Number);
    const [eh, em] = c.endTime.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const isCancelled = c.cancelledDates && c.cancelledDates.includes(todayStr);
    const isLive = isToday && nowMin >= startMin && nowMin < endMin && !isCancelled;

    // Insert NOW indicator
    if (isToday && !nowInserted && nowMin < startMin) {
      html += `<div class="now-indicator"><span class="now-label">Now ${formatTime(now)}</span></div>`;
      nowInserted = true;
    }

    const accentColor = c.color || TYPE_COLORS[c.type] || TYPE_COLORS['Other'];

    html += `<div class="course-card${isCancelled ? ' cancelled' : ''}${c.isOnline ? ' online' : ''}"
      style="--card-accent:${accentColor}; animation-delay:${i * 60}ms"
      onclick="openDetail('${c.id}')">
      <div class="card-name">${esc(c.name)}</div>
      <div class="card-time">${c.startTime} – ${c.endTime}</div>
      ${c.room ? `<div class="card-room">📍 ${esc(c.room)}</div>` : ''}
      <div class="card-badges">
        <span class="badge badge-type" style="background:${accentColor}">${esc(c.type)}</span>
        ${isCancelled ? '<span class="badge badge-cancelled">❌ Cancelled Today</span>' : ''}
        ${isLive ? '<span class="badge badge-live">● Live Now</span>' : ''}
      </div>
    </div>`;

    // Insert NOW after current live class
    if (isToday && !nowInserted && isLive) {
      nowInserted = true; // don't insert since we're IN class
    }
  });

  // If now is after all classes
  if (isToday && !nowInserted) {
    const lastEnd = dayCourses[dayCourses.length - 1].endTime.split(':').map(Number);
    if (nowMin >= lastEnd[0] * 60 + lastEnd[1]) {
      html += `<div class="now-indicator"><span class="now-label">Classes done for today ✅</span></div>`;
    }
  }

  container.innerHTML = html;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ═══ Detail Modal ═══

function openDetail(id) {
  const c = courses.find(x => x.id === id);
  if (!c) return;
  const todayStr = getTodayString();
  const accentColor = c.color || TYPE_COLORS[c.type] || TYPE_COLORS['Other'];
  const typeTrans = TYPE_TRANSLATIONS[c.type] || c.type;

  let html = `
    <div class="detail-header">
      <h2>${esc(c.name)}</h2>
      <div class="detail-type" style="color:${accentColor}">${esc(c.type)} — ${typeTrans}</div>
    </div>
    <div class="detail-section">
      <div class="detail-label">Time</div>
      <div class="detail-value">${c.days.join(', ')} · ${c.startTime} – ${c.endTime}</div>
    </div>`;

  if (c.room) {
    html += `<div class="detail-section">
      <div class="detail-label">Location</div>
      <div class="detail-value">${esc(c.room)}${c.buildingCode ? ` <span style="color:var(--text3)">(${esc(c.buildingCode)})</span>` : ''}</div>
    </div>`;
  }

  if (c.isOnline && c.zoomLink) {
    html += `<div class="detail-section">
      <div class="detail-label">Online Meeting</div>
      <div class="detail-value">
        <a href="${esc(c.zoomLink)}" target="_blank" rel="noopener" class="zoom-btn">🔗 Join Zoom</a>
        ${c.zoomMeetingId ? `<div style="margin-top:8px;font-size:.82rem;color:var(--text2)">Meeting ID: <strong>${esc(c.zoomMeetingId)}</strong></div>` : ''}
      </div>
    </div>`;
  }

  if (c.cancelledDates && c.cancelledDates.length > 0) {
    html += `<div class="detail-section">
      <div class="detail-label">Cancelled Dates</div>
      <div class="detail-chips">
        ${c.cancelledDates.map(d => `<span class="detail-chip${d < todayStr ? ' past' : ''}">${d}</span>`).join('')}
      </div>
    </div>`;
  }

  html += `<div class="detail-actions">`;
  if (c.lat && c.lng) {
    html += `<a href="https://www.google.com/maps?q=${c.lat},${c.lng}" target="_blank" rel="noopener" class="map-btn">📍 Open in Maps</a>`;
  }
  html += `</div>`;

  document.getElementById('detail-content').innerHTML = html;
  document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetail() { document.getElementById('detail-modal').classList.add('hidden'); }
function closeDetailIfBackdrop(e) { if (e.target === e.currentTarget) closeDetail(); }

// ═══ Page Toggle ═══

function togglePage() {
  const schedPage = document.getElementById('schedule-page');
  const mgrPage = document.getElementById('manager-page');
  const btn = document.getElementById('nav-toggle-text');
  const title = document.getElementById('page-title');

  if (schedPage.classList.contains('active')) {
    schedPage.classList.remove('active');
    mgrPage.classList.add('active');
    btn.textContent = '📅 View Schedule';
    title.textContent = 'Course Manager';
    renderManager();
  } else {
    mgrPage.classList.remove('active');
    schedPage.classList.add('active');
    btn.textContent = '⚙️ Manage Courses';
    title.textContent = 'My Schedule';
    renderSchedule();
    renderDayTabs();
  }
}

// ═══ Manager ═══

function renderManager(filter = '') {
  const container = document.getElementById('manager-list');
  const search = filter || document.getElementById('course-search')?.value?.toLowerCase() || '';
  let html = '';

  DAYS.forEach(day => {
    let dayCourses = getCoursesForDay(day);
    if (search) dayCourses = dayCourses.filter(c => c.name.toLowerCase().includes(search));
    if (dayCourses.length === 0) return;

    html += `<div class="day-group"><div class="day-group-title">${day} (${dayCourses.length})</div>`;
    dayCourses.forEach(c => {
      const color = c.color || TYPE_COLORS[c.type] || TYPE_COLORS['Other'];
      html += `<div class="manager-row">
        <div class="manager-row-color" style="background:${color}"></div>
        <div class="manager-row-info">
          <div class="manager-row-name">${esc(c.name)}</div>
          <div class="manager-row-meta">${c.startTime}–${c.endTime} · ${esc(c.type)}${c.room ? ' · ' + esc(c.room) : ''}</div>
        </div>
        <div class="manager-row-actions">
          <button class="manager-btn" onclick="openForm('${c.id}')" title="Edit">✏️</button>
          <button class="manager-btn delete" onclick="deleteCourse('${c.id}')" title="Delete">🗑️</button>
        </div>
      </div>`;
    });
    html += `</div>`;
  });

  if (!html) {
    html = `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>No courses found</h3><p>Try a different search or add a new course.</p></div>`;
  }
  container.innerHTML = html;
}

function filterCourses() { renderManager(); }

function deleteCourse(id) {
  courses = courses.filter(c => c.id !== id);
  saveCourses();
  renderManager();
  renderDayTabs();
  toast('Course deleted', 'success');
}

// ═══ Course Form ═══

function openForm(editId) {
  editingId = editId || null;
  formCancelledDates = [];
  const c = editId ? courses.find(x => x.id === editId) : null;

  document.getElementById('form-title').textContent = c ? 'Edit Course' : 'Add New Course';

  if (c) formCancelledDates = [...(c.cancelledDates || [])];
  const accentColor = c?.color || TYPE_COLORS[c?.type] || '#6366f1';

  const form = document.getElementById('course-form');
  form.innerHTML = `
    <div class="form-group">
      <label>Course Name *</label>
      <input type="text" id="f-name" value="${c ? esc(c.name) : ''}" placeholder="e.g. Neural Network Theory">
      <div class="form-error" id="err-name">Course name is required</div>
    </div>
    ${!editId ? `<div class="form-group">
      <label>Days *</label>
      <div class="form-checks">
        ${DAYS.map(d => `<label class="form-check"><input type="checkbox" value="${d}" ${c && c.days.includes(d) ? 'checked' : ''}> ${d.slice(0, 3)}</label>`).join('')}
      </div>
      <div class="form-error" id="err-days">Select at least one day</div>
    </div>` : ''}
    <div class="form-row">
      <div class="form-group">
        <label>Start Time *</label>
        <input type="time" id="f-start" value="${c ? c.startTime : ''}">
        <div class="form-error" id="err-start">Start time is required</div>
      </div>
      <div class="form-group">
        <label>End Time *</label>
        <input type="time" id="f-end" value="${c ? c.endTime : ''}">
        <div class="form-error" id="err-end">End time must be after start</div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Room / Location</label>
        <input type="text" id="f-room" value="${c ? esc(c.room) : ''}" placeholder="e.g. H10 Hörsaal 10">
      </div>
      <div class="form-group">
        <label>Building Code</label>
        <input type="text" id="f-building" value="${c ? esc(c.buildingCode) : ''}" placeholder="e.g. 11901.00.240">
      </div>
    </div>
    <div class="form-group">
      <label>Course Type</label>
      <select id="f-type">
        ${['Vorlesung', 'Übung', 'Vorlesung mit Übung', 'Other'].map(t =>
          `<option value="${t}" ${c && c.type === t ? 'selected' : ''}>${t}</option>`
        ).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Online Course</label>
      <div class="form-toggle ${c && c.isOnline ? 'on' : ''}" id="f-online-toggle" onclick="toggleOnline()">
        <div class="toggle-track"></div>
        <span>${c && c.isOnline ? 'Yes' : 'No'}</span>
      </div>
    </div>
    <div id="zoom-fields" class="${c && c.isOnline ? '' : 'hidden'}">
      <div class="form-row">
        <div class="form-group">
          <label>Zoom Link</label>
          <input type="text" id="f-zoom" value="${c ? esc(c.zoomLink) : ''}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>Zoom Meeting ID</label>
          <input type="text" id="f-zoomid" value="${c ? esc(c.zoomMeetingId) : ''}" placeholder="123 4567 8901">
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Latitude</label>
        <input type="number" step="any" id="f-lat" value="${c && c.lat ? c.lat : ''}" placeholder="49.574">
      </div>
      <div class="form-group">
        <label>Longitude</label>
        <input type="number" step="any" id="f-lng" value="${c && c.lng ? c.lng : ''}" placeholder="11.029">
      </div>
    </div>
    <div class="form-group">
      <label>Card Color</label>
      <input type="color" id="f-color" value="${accentColor}">
    </div>
    <div class="form-group">
      <label>Cancelled Dates</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="date" id="f-cancel-date">
        <button class="btn-outline" type="button" onclick="addCancelDate()">+ Add</button>
      </div>
      <div class="date-chips" id="cancel-chips">${renderCancelChips()}</div>
    </div>
    <div class="form-submit-row">
      <button class="btn-accent" onclick="saveForm()">💾 ${c ? 'Save Changes' : 'Create Course'}</button>
      <button class="btn-outline" onclick="closeForm()">Cancel</button>
    </div>
  `;

  document.getElementById('form-modal').classList.remove('hidden');
}

function toggleOnline() {
  const toggle = document.getElementById('f-online-toggle');
  toggle.classList.toggle('on');
  toggle.querySelector('span').textContent = toggle.classList.contains('on') ? 'Yes' : 'No';
  document.getElementById('zoom-fields').classList.toggle('hidden', !toggle.classList.contains('on'));
}

function addCancelDate() {
  const input = document.getElementById('f-cancel-date');
  const val = input.value;
  if (val && !formCancelledDates.includes(val)) {
    formCancelledDates.push(val);
    formCancelledDates.sort();
    document.getElementById('cancel-chips').innerHTML = renderCancelChips();
    input.value = '';
  }
}

function removeCancelDate(d) {
  formCancelledDates = formCancelledDates.filter(x => x !== d);
  document.getElementById('cancel-chips').innerHTML = renderCancelChips();
}

function renderCancelChips() {
  return formCancelledDates.map(d =>
    `<span class="date-chip">${d} <button class="date-chip-remove" onclick="removeCancelDate('${d}')">✕</button></span>`
  ).join('');
}

function saveForm() {
  // Clear errors
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));

  const name = document.getElementById('f-name').value.trim();
  const startTime = document.getElementById('f-start').value;
  const endTime = document.getElementById('f-end').value;
  const room = document.getElementById('f-room').value.trim();
  const buildingCode = document.getElementById('f-building').value.trim();
  const type = document.getElementById('f-type').value;
  const isOnline = document.getElementById('f-online-toggle').classList.contains('on');
  const zoomLink = document.getElementById('f-zoom')?.value.trim() || '';
  const zoomMeetingId = document.getElementById('f-zoomid')?.value.trim() || '';
  const lat = parseFloat(document.getElementById('f-lat').value) || null;
  const lng = parseFloat(document.getElementById('f-lng').value) || null;
  const color = document.getElementById('f-color').value;

  let valid = true;
  if (!name) { document.getElementById('err-name').classList.add('show'); valid = false; }
  if (!startTime) { document.getElementById('err-start').classList.add('show'); valid = false; }
  if (!endTime || endTime <= startTime) { document.getElementById('err-end').classList.add('show'); valid = false; }

  let days = [];
  if (editingId) {
    days = courses.find(c => c.id === editingId)?.days || ['Monday'];
  } else {
    days = [...document.querySelectorAll('#course-form input[type="checkbox"]:checked')].map(cb => cb.value);
    if (days.length === 0) { document.getElementById('err-days')?.classList.add('show'); valid = false; }
  }

  if (!valid) return;

  if (editingId) {
    const idx = courses.findIndex(c => c.id === editingId);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], name, startTime, endTime, room, buildingCode, type, isOnline, zoomLink, zoomMeetingId, lat, lng, color, cancelledDates: [...formCancelledDates] };
    }
    toast('Course updated', 'success');
  } else {
    days.forEach(day => {
      courses.push({
        id: crypto.randomUUID(),
        name, days: [day], startTime, endTime, room, buildingCode, type,
        isOnline, zoomLink, zoomMeetingId, lat, lng, color,
        cancelledDates: [...formCancelledDates]
      });
    });
    toast(`${days.length > 1 ? days.length + ' courses' : 'Course'} created`, 'success');
  }

  saveCourses();
  renderManager();
  renderDayTabs();
  closeForm();
}

function closeForm() {
  document.getElementById('form-modal').classList.add('hidden');
  editingId = null;
  formCancelledDates = [];
}
function closeFormIfBackdrop(e) { if (e.target === e.currentTarget) closeForm(); }

// ═══ Reset / Confirm ═══

function confirmReset() { document.getElementById('confirm-modal').classList.remove('hidden'); }
function closeConfirm() { document.getElementById('confirm-modal').classList.add('hidden'); }

function resetCourses() {
  courses = structuredClone(DEFAULT_COURSES);
  saveCourses();
  renderManager();
  renderDayTabs();
  closeConfirm();
  toast('Schedule reset to default', 'info');
}

// ═══ Import / Export ═══

function exportCourses() {
  const blob = new Blob([JSON.stringify(courses, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fau_schedule_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Schedule exported', 'success');
}

function importCourses(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      courses = data;
      saveCourses();
      renderManager();
      renderDayTabs();
      toast(`Imported ${data.length} courses`, 'success');
    } catch {
      toast('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ═══ Toast Notifications ═══

function toast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `${icons[type] || ''} ${esc(message)}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ═══ Confetti (Weekend) ═══

function runConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const parent = canvas.parentElement;
  canvas.width = parent.offsetWidth;
  canvas.height = parent.offsetHeight;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 6 + 3,
    speedY: Math.random() * 2 + 1,
    speedX: (Math.random() - 0.5) * 2,
    color: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    frame++;
    if (frame < 180) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}
