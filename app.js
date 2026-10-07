const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABEL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let state = {
  data: {},
  healthData: {},
  viewDate: startOfToday(),
  selectedDateKey: null,
};

function pad(n) { return String(n).padStart(2, "0"); }

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function formatDateLabel(d) {
  return `${WEEKDAY_LABEL[d.getDay()]}, ${MONTH_LABEL[d.getMonth()]} ${d.getDate()}`;
}

function renderDateNav() {
  const today = startOfToday();
  const isToday = isSameDay(state.viewDate, today);

  document.getElementById("date-label").textContent =
    (isToday ? "Today · " : "") + formatDateLabel(state.viewDate);
  document.getElementById("today-btn").style.display = isToday ? "none" : "inline";
  document.getElementById("next-day").disabled = state.viewDate >= today;
}

// Most recent entry for this exercise strictly before the given date, or null.
function findLastEntry(exerciseName, beforeDateKey) {
  const dates = Object.keys(state.data).filter((d) => d < beforeDateKey).sort().reverse();
  for (const d of dates) {
    const entries = state.data[d] && state.data[d].entries;
    const vals = entries && entries[exerciseName];
    if (vals && vals.some((v) => v !== null && v !== undefined)) return vals;
  }
  return null;
}

function renderWorkout() {
  const weekday = state.viewDate.getDay();
  const workout = WORKOUTS[weekday];
  state.selectedDateKey = dateKey(state.viewDate);

  renderDateNav();

  document.getElementById("day-title").innerHTML = `
    <h2>${workout.day} – ${workout.title}</h2>
  `;

  const listEl = document.getElementById("exercise-list");
  const saveBar = document.getElementById("save-bar");
  const noteEl = document.getElementById("day-note");
  const noteLabel = document.getElementById("note-label");
  listEl.innerHTML = "";

  const existingRecord = state.data[state.selectedDateKey];

  if (workout.exercises.length === 0) {
    listEl.innerHTML = `<div class="rest-day">Rest day. Nothing to log 🛌</div>`;
    saveBar.style.display = "none";
    noteEl.style.display = "none";
    noteLabel.style.display = "none";
    return;
  }

  saveBar.style.display = "block";
  noteEl.style.display = "block";
  noteLabel.style.display = "block";
  noteEl.value = (existingRecord && existingRecord.note) || "";

  const existing = (existingRecord && existingRecord.entries) || {};

  workout.exercises.forEach((ex) => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    const savedSets = existing[ex.name] || [];
    const lastSets = findLastEntry(ex.name, state.selectedDateKey);

    let setsHtml = "";
    for (let i = 0; i < ex.sets; i++) {
      const val = savedSets[i] !== undefined && savedSets[i] !== null ? savedSets[i] : "";
      const lastVal = lastSets && lastSets[i] !== undefined && lastSets[i] !== null ? lastSets[i] : null;
      setsHtml += `
        <div class="set-input">
          <label>Set ${i + 1}</label>
          ${lastVal !== null ? `<div class="last-hint">Last ${lastVal}</div>` : ""}
          <input type="number" inputmode="decimal" step="0.5" min="0"
            data-exercise="${ex.name}" data-set="${i}" value="${val}" placeholder="lb/kg" />
        </div>
      `;
    }

    card.innerHTML = `
      <h3>${ex.name}</h3>
      <div class="reps">${ex.sets} sets × ${ex.reps}</div>
      <div class="sets-row">${setsHtml}</div>
    `;
    listEl.appendChild(card);
  });
}

function changeDay(delta) {
  const d = new Date(state.viewDate);
  d.setDate(d.getDate() + delta);
  if (d > startOfToday()) return; // can't log future days
  state.viewDate = d;
  renderWorkout();
}

function jumpToToday() {
  state.viewDate = startOfToday();
  renderWorkout();
}

function collectEntries() {
  const weekday = state.viewDate.getDay();
  const workout = WORKOUTS[weekday];
  const entries = {};
  workout.exercises.forEach((ex) => {
    const values = [];
    for (let i = 0; i < ex.sets; i++) {
      const input = document.querySelector(`input[data-exercise="${CSS.escape(ex.name)}"][data-set="${i}"]`);
      const v = input.value.trim();
      values.push(v === "" ? null : parseFloat(v));
    }
    entries[ex.name] = values;
  });
  return entries;
}

function setStatus(msg, cls) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (cls ? " " + cls : "");
}

// Week containing `d`, Monday through Sunday, as [mondayDate, sundayDate].
function weekRange(d) {
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday, sunday];
}

function renderStreak() {
  const [monday, sunday] = weekRange(startOfToday());
  const mondayKey = dateKey(monday);
  const sundayKey = dateKey(sunday);
  let count = 0;
  for (const [d, rec] of Object.entries(state.data)) {
    if (d < mondayKey || d > sundayKey) continue;
    const entries = rec.entries || {};
    const hasAny = Object.values(entries).some((vals) => vals.some((v) => v !== null && v !== undefined));
    if (hasAny) count++;
  }
  document.getElementById("streak-badge").textContent = `This week: ${count}/6 logged`;
}

function renderWeightBadge() {
  const dates = Object.keys(state.healthData).sort();
  const badge = document.getElementById("weight-badge");
  if (dates.length === 0) {
    badge.textContent = "";
    return;
  }
  const latestDate = dates[dates.length - 1];
  const entry = state.healthData[latestDate];
  if (entry && entry.weight != null) {
    badge.textContent = `Weight: ${entry.weight} kg (${latestDate})`;
  } else {
    badge.textContent = "";
  }
}

async function loadData() {
  setStatus("Loading...");
  try {
    const [{ data }, healthRes] = await Promise.all([fetchDataFile(), fetch("/api/health")]);
    state.data = data;
    state.healthData = healthRes.ok ? await healthRes.json() : {};
    setStatus("");
  } catch (e) {
    setStatus("Could not load data: " + e.message, "err");
  }
  renderWorkout();
  renderStreak();
  renderWeightBadge();
}

// All-time max weight logged for an exercise, excluding the given date.
function allTimeMax(exerciseName, excludeDateKey) {
  let max = null;
  for (const [d, rec] of Object.entries(state.data)) {
    if (d === excludeDateKey) continue;
    const vals = rec.entries && rec.entries[exerciseName];
    if (!vals) continue;
    vals.forEach((v) => {
      if (v !== null && v !== undefined && (max === null || v > max)) max = v;
    });
  }
  return max;
}

function detectPRs(entries, dateKeyForSave) {
  const prs = [];
  Object.entries(entries).forEach(([name, vals]) => {
    const nums = vals.filter((v) => v !== null && v !== undefined);
    if (nums.length === 0) return;
    const newMax = Math.max(...nums);
    const prevMax = allTimeMax(name, dateKeyForSave);
    if (prevMax === null || newMax > prevMax) {
      prs.push(`${name} (${newMax})`);
    }
  });
  return prs;
}

async function saveWorkout() {
  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  setStatus("Saving...");
  try {
    const entries = collectEntries();
    const prs = detectPRs(entries, state.selectedDateKey);
    state.data[state.selectedDateKey] = {
      weekday: state.viewDate.getDay(),
      entries,
      note: document.getElementById("day-note").value.trim(),
    };
    await saveDataFile(state.data);
    setStatus("Saved ✓" + (prs.length ? " 🏆 PR: " + prs.join(", ") : ""), "ok");
    renderStreak();
  } catch (e) {
    setStatus("Save failed: " + e.message, "err");
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("save-btn").onclick = saveWorkout;
document.getElementById("prev-day").onclick = () => changeDay(-1);
document.getElementById("next-day").onclick = () => changeDay(1);
document.getElementById("today-btn").onclick = jumpToToday;

window.onUnlock = loadData;
