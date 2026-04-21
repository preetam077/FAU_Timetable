// ─── Default Course Data (never mutated) ───
const STORAGE_KEY = 'fau_schedule_v1';

const TYPE_COLORS = {
  'Vorlesung': '#4f46e5',
  'Übung': '#059669',
  'Vorlesung mit Übung': '#7c3aed',
  'Other': '#475569'
};

const TYPE_TRANSLATIONS = {
  'Vorlesung': 'Lecture',
  'Übung': 'Exercise / Tutorial',
  'Vorlesung mit Übung': 'Lecture + Exercise',
  'Other': 'Other'
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DEFAULT_COURSES = [
  // ── Monday ──
  { id: crypto.randomUUID(), name: "Mathematical Foundations of Control and Machine Learning", days: ["Monday"], startTime: "08:00", endTime: "10:00", room: "H10 Hörsaal 10", buildingCode: "11901.00.240", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.574364, lng: 11.029381, cancelledDates: ["2026-05-25"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "47544 Applied Data Science in Medicine & Psychology", days: ["Monday"], startTime: "14:15", endTime: "15:45", room: "", buildingCode: "", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: null, lng: null, cancelledDates: ["2026-05-25"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "47544 Applied Data Science in Medicine & Psychology", days: ["Monday"], startTime: "16:15", endTime: "17:45", room: "", buildingCode: "", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: null, lng: null, cancelledDates: ["2026-05-25"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "Interfacing the Neuromuscular System", days: ["Monday"], startTime: "16:15", endTime: "17:00", room: "", buildingCode: "", type: "Vorlesung", isOnline: true, zoomLink: "https://fau.zoom-x.de/j/65566267991", zoomMeetingId: "655 6626 7991", lat: null, lng: null, cancelledDates: ["2026-05-25"], color: "#4f46e5" },

  // ── Tuesday ──
  { id: crypto.randomUUID(), name: "Theory of Neural Dynamics & Reservoir Computing", days: ["Tuesday"], startTime: "12:00", endTime: "14:00", room: 'EL4.14 "Tietze-Schenk-Saal"', buildingCode: "11501.04.222", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573170, lng: 11.028511, cancelledDates: ["2026-05-26"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "Human Computer Interaction", days: ["Tuesday"], startTime: "14:15", endTime: "15:45", room: "H20", buildingCode: "11906.01.040", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573391, lng: 11.028164, cancelledDates: ["2026-05-26"], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Deutsch A1.2: Allgemeinkurs", days: ["Tuesday"], startTime: "18:15", endTime: "19:45", room: "KH 1.013 Hörsaal Kollegienhaus", buildingCode: "00501.01.013", type: "Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.597187, lng: 11.007167, cancelledDates: ["2026-05-26"], color: "#059669" },

  // ── Wednesday ──
  { id: crypto.randomUUID(), name: "Neural Network Theory", days: ["Wednesday"], startTime: "10:00", endTime: "12:00", room: "H9 Werner-von-Siemens-Hörsaal", buildingCode: "11901.00.227", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.574364, lng: 11.029381, cancelledDates: [], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Decision Theory", days: ["Wednesday"], startTime: "10:00", endTime: "12:00", room: "H12 Emmy-Noether-Hörsaal", buildingCode: "12801.01.220", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573711, lng: 11.030428, cancelledDates: [], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Foundations of Linked Data", days: ["Wednesday"], startTime: "13:15", endTime: "14:45", room: "LG H6 BISSANTZ-Hörsaal", buildingCode: "21102.01.421", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.458645, lng: 11.085722, cancelledDates: [], color: "#7c3aed" },

  // ── Thursday ──
  { id: crypto.randomUUID(), name: "Neural Network Theory", days: ["Thursday"], startTime: "08:30", endTime: "10:00", room: "Übung 5 / 01.254-128", buildingCode: "12801.01.254", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573711, lng: 11.030428, cancelledDates: ["2026-05-14", "2026-06-04"], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Interfacing the Neuromuscular System", days: ["Thursday"], startTime: "10:15", endTime: "11:45", room: "Seminarraum 1", buildingCode: "56901.00.014", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.588531, lng: 11.007485, cancelledDates: ["2026-05-14", "2026-06-04"], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Nailing your Thesis", days: ["Thursday"], startTime: "08:15", endTime: "10:45", room: "K1-119 Brose-Saal", buildingCode: "11901.00.236", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.574364, lng: 11.029381, cancelledDates: ["2026-05-14", "2026-06-04"], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Theory of Neural Dynamics & Reservoir Computing", days: ["Thursday"], startTime: "12:00", endTime: "14:00", room: 'EL4.14 "Tietze-Schenk-Saal"', buildingCode: "11501.04.222", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573170, lng: 11.028511, cancelledDates: ["2026-05-14", "2026-06-04"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "Deutsch A1.2: Allgemeinkurs", days: ["Thursday"], startTime: "18:15", endTime: "19:45", room: "KH 1.013 Hörsaal Kollegienhaus", buildingCode: "00501.01.013", type: "Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.597187, lng: 11.007167, cancelledDates: ["2026-05-14", "2026-06-04"], color: "#059669" },

  // ── Friday ──
  { id: crypto.randomUUID(), name: "Neural Network Theory", days: ["Friday"], startTime: "10:00", endTime: "12:00", room: "H12 Emmy-Noether-Hörsaal", buildingCode: "12801.01.220", type: "Vorlesung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573711, lng: 11.030428, cancelledDates: ["2026-05-01", "2026-06-05"], color: "#4f46e5" },
  { id: crypto.randomUUID(), name: "Theory of Neural Dynamics & Reservoir Computing", days: ["Friday"], startTime: "10:00", endTime: "11:00", room: "00.151-113 Übungsraum", buildingCode: "11302.00.151", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.573891, lng: 11.027331, cancelledDates: ["2026-05-01", "2026-06-05"], color: "#7c3aed" },
  { id: crypto.randomUUID(), name: "Foundations of Linked Data", days: ["Friday"], startTime: "13:15", endTime: "14:45", room: "LG 5.154 Seminarraum", buildingCode: "21101.05.154", type: "Vorlesung mit Übung", isOnline: false, zoomLink: "", zoomMeetingId: "", lat: 49.458256, lng: 11.085561, cancelledDates: ["2026-05-01", "2026-06-05"], color: "#7c3aed" }
];
