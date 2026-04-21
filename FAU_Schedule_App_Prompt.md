# FAU Schedule App — Build Prompt

> **Instructions for the agent:** Read this entire file, then build the described application exactly as specified. Do not truncate or use placeholder comments — write the complete, fully working implementation.

---

## TASK

Build a polished, interactive weekly schedule viewer + course editor for a university student at FAU Erlangen-Nürnberg. Deliver a **single self-contained `.html` file** using only vanilla HTML, CSS, and JavaScript — no external libraries, no CDN dependencies. All data must persist using `localStorage` so edits survive page refreshes.

The app has two main "pages" toggled within the single HTML file:

1. **Schedule View** — the main timetable
2. **Course Manager** — an admin-style editor to add, edit, and delete courses

---

## Initial Course Data

Pre-load this data into `localStorage` **only if no saved data exists yet**. Store it as a JS constant called `DEFAULT_COURSES` that is never mutated.

All times are Europe/Berlin timezone (CEST, UTC+2). Semester: SS 2026 (April–July 2026).

### Data Schema

Each course is a JS object with these fields:

```json
{
  "id": "unique-uuid-string",
  "name": "Course Name",
  "days": ["Monday"],
  "startTime": "08:00",
  "endTime": "10:00",
  "room": "H10 Hörsaal 10",
  "buildingCode": "11901.00.240",
  "type": "Vorlesung mit Übung",
  "isOnline": false,
  "zoomLink": "",
  "zoomMeetingId": "",
  "lat": 49.574364,
  "lng": 11.029381,
  "cancelledDates": ["2026-05-25"],
  "color": "#4f46e5"
}
```

> **Note:** Courses that appear on multiple days (e.g. Neural Network Theory on Wed + Thu + Fri) are stored as **separate objects per day-slot** so they can be edited independently.

### Monday

| Name | Start | End | Room | Building Code | Type | Online | Zoom Link | Zoom ID | Lat | Lng | Cancelled Dates |
|------|-------|-----|------|---------------|------|--------|-----------|---------|-----|-----|-----------------|
| Mathematical Foundations of Control and Machine Learning | 08:00 | 10:00 | H10 Hörsaal 10 | 11901.00.240 | Vorlesung mit Übung | false | | | 49.574364 | 11.029381 | 2026-05-25 |
| 47544 Applied Data Science in Medicine & Psychology | 14:15 | 15:45 | | | Vorlesung mit Übung | false | | | | | 2026-05-25 |
| 47544 Applied Data Science in Medicine & Psychology | 16:15 | 17:45 | | | Vorlesung mit Übung | false | | | | | 2026-05-25 |
| Interfacing the Neuromuscular System | 16:15 | 17:00 | | | Vorlesung | true | https://fau.zoom-x.de/j/65566267991 | 655 6626 7991 | | | 2026-05-25 |

### Tuesday

| Name | Start | End | Room | Building Code | Type | Online | Zoom Link | Zoom ID | Lat | Lng | Cancelled Dates |
|------|-------|-----|------|---------------|------|--------|-----------|---------|-----|-----|-----------------|
| Theory of Neural Dynamics & Reservoir Computing | 12:00 | 14:00 | EL4.14 "Tietze-Schenk-Saal" | 11501.04.222 | Vorlesung mit Übung | false | | | 49.573170 | 11.028511 | 2026-05-26 |
| Human Computer Interaction | 14:15 | 15:45 | H20 | 11906.01.040 | Vorlesung | false | | | 49.573391 | 11.028164 | 2026-05-26 |
| Deutsch A1.2: Allgemeinkurs | 18:15 | 19:45 | KH 1.013 Hörsaal Kollegienhaus | 00501.01.013 | Übung | false | | | 49.597187 | 11.007167 | 2026-05-26 |

### Wednesday

| Name | Start | End | Room | Building Code | Type | Online | Zoom Link | Zoom ID | Lat | Lng | Cancelled Dates |
|------|-------|-----|------|---------------|------|--------|-----------|---------|-----|-----|-----------------|
| Neural Network Theory | 10:00 | 12:00 | H9 Werner-von-Siemens-Hörsaal | 11901.00.227 | Vorlesung | false | | | 49.574364 | 11.029381 | |
| Decision Theory | 10:00 | 12:00 | H12 Emmy-Noether-Hörsaal | 12801.01.220 | Vorlesung | false | | | 49.573711 | 11.030428 | |
| Foundations of Linked Data | 13:15 | 14:45 | LG H6 BISSANTZ-Hörsaal | 21102.01.421 | Vorlesung mit Übung | false | | | 49.458645 | 11.085722 | |

### Thursday

| Name | Start | End | Room | Building Code | Type | Online | Zoom Link | Zoom ID | Lat | Lng | Cancelled Dates |
|------|-------|-----|------|---------------|------|--------|-----------|---------|-----|-----|-----------------|
| Neural Network Theory | 08:30 | 10:00 | Übung 5 / 01.254-128 | 12801.01.254 | Vorlesung | false | | | 49.573711 | 11.030428 | 2026-05-14, 2026-06-04 |
| Interfacing the Neuromuscular System | 10:15 | 11:45 | Seminarraum 1 | 56901.00.014 | Vorlesung | false | | | 49.588531 | 11.007485 | 2026-05-14, 2026-06-04 |
| Nailing your Thesis | 08:15 | 10:45 | K1-119 Brose-Saal | 11901.00.236 | Vorlesung | false | | | 49.574364 | 11.029381 | 2026-05-14, 2026-06-04 |
| Theory of Neural Dynamics & Reservoir Computing | 12:00 | 14:00 | EL4.14 "Tietze-Schenk-Saal" | 11501.04.222 | Vorlesung mit Übung | false | | | 49.573170 | 11.028511 | 2026-05-14, 2026-06-04 |
| Deutsch A1.2: Allgemeinkurs | 18:15 | 19:45 | KH 1.013 Hörsaal Kollegienhaus | 00501.01.013 | Übung | false | | | 49.597187 | 11.007167 | 2026-05-14, 2026-06-04 |

### Friday

| Name | Start | End | Room | Building Code | Type | Online | Zoom Link | Zoom ID | Lat | Lng | Cancelled Dates |
|------|-------|-----|------|---------------|------|--------|-----------|---------|-----|-----|-----------------|
| Neural Network Theory | 10:00 | 12:00 | H12 Emmy-Noether-Hörsaal | 12801.01.220 | Vorlesung | false | | | 49.573711 | 11.030428 | 2026-05-01, 2026-06-05 |
| Theory of Neural Dynamics & Reservoir Computing | 10:00 | 11:00 | 00.151-113 Übungsraum | 11302.00.151 | Vorlesung mit Übung | false | | | 49.573891 | 11.027331 | 2026-05-01, 2026-06-05 |
| Foundations of Linked Data | 13:15 | 14:45 | LG 5.154 Seminarraum | 21101.05.154 | Vorlesung mit Übung | false | | | 49.458256 | 11.085561 | 2026-05-01, 2026-06-05 |

---

## Page 1 — Schedule View

### Day Navigation
- Tabs for Mon–Fri at the top; highlight today's tab
- Default to today's day of week (detect via JS `new Date()`)
- If today is Saturday or Sunday → show "No classes this weekend 🎉" and default the tab selection to Monday

### Course Cards
- Each card shows: course name, time (e.g. `08:00–10:00`), room or 🔗 Zoom badge, type badge (color-coded)
- Cards sorted by start time ascending
- If today's date (`YYYY-MM-DD`) is in a course's `cancelledDates` array → show a red **"❌ Cancelled Today"** banner on that card
- Online courses get a distinct blue/purple **"🔗 Online"** visual style and a clickable Zoom button

### Detail Modal (on card click)
Opens a modal/drawer with:
- Full course name
- Type with English translation:
  - Vorlesung → Lecture
  - Übung → Exercise / Tutorial
  - Vorlesung mit Übung → Lecture + Exercise
- Time slot
- Full room name + building code
- For online courses: Zoom link as a clickable button + Meeting ID displayed
- Google Maps link: `https://www.google.com/maps?q=LAT,LNG` (only if lat/lng exist)
- Full list of all cancelled dates for this course
- Close via ✕ button or clicking the backdrop

### Header
- Show current date (e.g. "Tuesday, 21 April 2026") and a **live updating clock** in the header

---

## Page 2 — Course Manager

Accessible via a ⚙️ **"Manage Courses"** button in the header. Feels like a clean admin panel (think Notion / Linear, not a raw HTML form).

### Course List View
- All courses listed, grouped by day, in a clean table or card list
- Each entry has **Edit ✏️** and **Delete 🗑️** icon buttons
- Prominent **"+ Add New Course"** button at the top
- **"Reset to Default"** button that restores `DEFAULT_COURSES` — must show a confirmation dialog first
- Search/filter bar to find courses by name (live filter as you type)

### Add / Edit Form

Show as a slide-in side panel or inline expanded section. Fields:

| Field | Input Type | Notes |
|-------|-----------|-------|
| Course Name | Text | Required |
| Days | Multi-select checkboxes | Mon Tue Wed Thu Fri — Required (at least one) |
| Start Time | Time picker HH:MM | Required |
| End Time | Time picker HH:MM | Required, must be after start |
| Room / Location | Text | Optional |
| Building Code | Text | Optional |
| Course Type | Dropdown | Vorlesung / Übung / Vorlesung mit Übung / Other |
| Is Online? | Toggle / Checkbox | |
| Zoom Link | Text | Shown only when Is Online = true |
| Zoom Meeting ID | Text | Shown only when Is Online = true |
| Latitude | Number | Optional, for map link |
| Longitude | Number | Optional, for map link |
| Cancelled Dates | Dynamic date-chip list | Add dates via date picker; each date shows as a removable chip/tag |
| Card Accent Color | Color picker | Assigns a custom color to this course's card |

**Validation rules:**
- Name, at least one day, start time, end time are all required
- End time must be after start time
- Show inline error messages beneath the relevant field — do not use `alert()`

**On Save (Add mode):** If multiple days are checked, create one separate course object per day, each with a unique UUID.

**On Save (Edit mode):** Update the existing object in place (single entry only, regardless of days checkboxes — editing one slot does not auto-create new slots).

### Data Persistence
- Storage key: `"fau_schedule_v1"` in `localStorage`
- On app load: use `localStorage` data if present; otherwise write `DEFAULT_COURSES` to `localStorage` and use that
- Every add / edit / delete immediately writes to `localStorage` and re-renders the schedule view

---

## Visual Design

- **Two pages** within one HTML file, toggled by JS with a smooth **fade transition**
- Color palette: deep navy/indigo primary
- Default card colors by type:
  - Vorlesung → indigo `#4f46e5`
  - Übung → emerald `#059669`
  - Vorlesung mit Übung → violet `#7c3aed`
  - Other → slate `#475569`
- Cards: soft drop shadows, lift + shadow deepen on hover
- Modal: backdrop blur (`backdrop-filter: blur(6px)`), slide-up entrance animation
- Course Manager: clean table or card list with hover row highlights
- Form panel: slides in from the right or expands inline smoothly
- Fully **responsive** — stacked single-column on mobile, wider layout on desktop
- Use system fonts only (no CDN)
- Subtle fade-in on initial page load

---

## Technical Requirements

- **Single `.html` file** — all CSS and JS inline, zero external dependencies
- UUID generation: use `crypto.randomUUID()` or a simple fallback generator function
- `DEFAULT_COURSES` is a `const` defined at the top of the script and is never mutated
- Cancellation check logic: `course.cancelledDates.includes(todayString)` where `todayString = new Date().toISOString().slice(0, 10)`
- Google Maps link: `https://www.google.com/maps?q=${lat},${lng}`
- Zoom links open in a new tab (`target="_blank"`)
- Do **not** use HTML `<form>` elements — use `div`-based layouts with `onClick` / `onChange` handlers
- Write the **complete implementation** — no truncation, no `// TODO` placeholders, no `// ... rest of code` comments

---

*End of prompt. Build the full application now.*
