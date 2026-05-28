/* ═══════════════════════════════════════════
   Supabase Client & Data Layer
   Falls back to localStorage-only mode when
   Supabase credentials are not configured.
   ═══════════════════════════════════════════ */

// ── Supabase Config ──
// Replace with your actual project values to enable cloud sync.
const SUPABASE_URL = 'https://fmzrlkcgnmlxutocggw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtenJrbGxjZ25tbHh1dG9jZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTczOTMsImV4cCI6MjA5NTU3MzM5M30.NwVRiQZpyx6x7x9_UsbScrxl8C4kJuKp7ax5Gksm3eI';

// ── Detect if Supabase is configured ──
const SUPABASE_ENABLED =
  SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
  SUPABASE_URL.startsWith('https://');

// NOTE: Variable is named _supabaseClient (not 'supabase') to avoid a naming
// conflict with the CDN global window.supabase = { createClient, ... }.
// Declaring `let supabase` after the CDN sets `window.supabase` throws
// "Cannot redeclare block-scoped variable" in browsers, which silently
// prevents ALL function definitions below from being registered.
let _supabaseClient = null;

if (SUPABASE_ENABLED) {
  try {
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[Supabase] Failed to initialize client:', e);
  }
}

// ═══ Auth Helpers ═══

async function supaSignUp(email, password) {
  if (!_supabaseClient) throw new Error('Supabase not configured.');
  const { data, error } = await _supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function supaSignIn(email, password) {
  if (!_supabaseClient) throw new Error('Supabase not configured.');
  const { data, error } = await _supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function supaSignOut() {
  if (!_supabaseClient) return;
  const { error } = await _supabaseClient.auth.signOut();
  if (error) throw error;
}

async function supaResetPassword(email) {
  if (!_supabaseClient) throw new Error('Supabase not configured.');
  const { data, error } = await _supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname,
  });
  if (error) throw error;
  return data;
}

function supaGetUser() {
  if (!_supabaseClient) return Promise.resolve({ data: { user: null } });
  return _supabaseClient.auth.getUser();
}

function supaOnAuthStateChange(callback) {
  if (!_supabaseClient) {
    // No Supabase — immediately signal "no session" so app loads in local mode
    setTimeout(() => callback('SIGNED_OUT', null), 0);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return _supabaseClient.auth.onAuthStateChange(callback);
}

// ═══ Courses CRUD ═══

async function fetchCoursesFromDb() {
  if (!_supabaseClient) return [];
  const { data: { user } } = await supaGetUser();
  if (!user) return [];

  const { data, error } = await _supabaseClient
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: true });

  if (error) throw error;
  return (data || []).map(dbCourseToApp);
}

function dbCourseToApp(row) {
  return {
    id: row.id,
    name: row.name,
    days: row.days || [],
    startTime: row.start_time,
    endTime: row.end_time,
    room: row.room || '',
    buildingCode: row.building_code || '',
    type: row.type || 'Other',
    isOnline: row.is_online || false,
    zoomLink: row.zoom_link || '',
    zoomMeetingId: row.zoom_meeting_id || '',
    lat: row.lat,
    lng: row.lng,
    cancelledDates: row.cancelled_dates || [],
    color: row.color || '#6366f1',
  };
}

function appCourseToDb(course, userId) {
  return {
    id: course.id,
    user_id: userId,
    name: course.name,
    days: course.days,
    start_time: course.startTime,
    end_time: course.endTime,
    room: course.room || '',
    building_code: course.buildingCode || '',
    type: course.type || 'Other',
    is_online: course.isOnline || false,
    zoom_link: course.zoomLink || '',
    zoom_meeting_id: course.zoomMeetingId || '',
    lat: course.lat || null,
    lng: course.lng || null,
    cancelled_dates: course.cancelledDates || [],
    color: course.color || '#6366f1',
  };
}

async function saveCourseToDb(course) {
  if (!_supabaseClient) return course;
  const { data: { user } } = await supaGetUser();
  if (!user) throw new Error('Not authenticated');

  const row = appCourseToDb(course, user.id);
  const { data, error } = await _supabaseClient
    .from('courses')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return dbCourseToApp(data);
}

async function deleteCourseFromDb(courseId) {
  if (!_supabaseClient) return;
  const { error } = await _supabaseClient
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw error;
}

async function deleteAllCoursesFromDb() {
  if (!_supabaseClient) return;
  const { data: { user } } = await supaGetUser();
  if (!user) return;

  const { error } = await _supabaseClient
    .from('courses')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

async function seedDefaultCourses() {
  if (!_supabaseClient) return;
  const { data: { user } } = await supaGetUser();
  if (!user) return;

  const rows = DEFAULT_COURSES.map(c => {
    const row = appCourseToDb({ ...c, id: crypto.randomUUID() }, user.id);
    delete row.id; // Let DB generate UUIDs
    return row;
  });

  const { error } = await _supabaseClient
    .from('courses')
    .insert(rows);

  if (error) throw error;
}

// ═══ Exams CRUD ═══

async function fetchExamsFromDb() {
  if (!_supabaseClient) return [];
  const { data: { user } } = await supaGetUser();
  if (!user) return [];

  const { data, error } = await _supabaseClient
    .from('exams')
    .select('*')
    .eq('user_id', user.id)
    .order('exam_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(dbExamToApp);
}

function dbExamToApp(row) {
  return {
    id: row.id,
    subjectName: row.subject_name,
    examDate: row.exam_date,
    startTime: row.start_time,
    endTime: row.end_time,
    venue: row.venue || '',
    mode: row.mode || 'In-Person',
    notes: row.notes || '',
    color: row.color || '#f59e0b',
  };
}

function appExamToDb(exam, userId) {
  return {
    id: exam.id,
    user_id: userId,
    subject_name: exam.subjectName,
    exam_date: exam.examDate,
    start_time: exam.startTime,
    end_time: exam.endTime,
    venue: exam.venue || '',
    mode: exam.mode || 'In-Person',
    notes: exam.notes || '',
    color: exam.color || '#f59e0b',
  };
}

async function saveExamToDb(exam) {
  if (!_supabaseClient) return exam;
  const { data: { user } } = await supaGetUser();
  if (!user) throw new Error('Not authenticated');

  const row = appExamToDb(exam, user.id);
  if (!row.id) delete row.id;

  const { data, error } = await _supabaseClient
    .from('exams')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return dbExamToApp(data);
}

async function deleteExamFromDb(examId) {
  if (!_supabaseClient) return;
  const { error } = await _supabaseClient
    .from('exams')
    .delete()
    .eq('id', examId);

  if (error) throw error;
}

async function deleteAllExamsFromDb() {
  if (!_supabaseClient) return;
  const { data: { user } } = await supaGetUser();
  if (!user) return;

  const { error } = await _supabaseClient
    .from('exams')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}
