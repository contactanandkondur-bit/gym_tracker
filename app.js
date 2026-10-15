const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABEL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TAG_LABEL = {
  heavy: "Heavy weight, low reps",
  moderate: "Moderate weight, moderate reps",
  light: "Light weight, more reps",
  core: "Control focus, not weight",
};

let state = {
  data: {},
  wholeData: {},
  healthData: {},
  wholeHealth: {},
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
    listEl.innerHTML = weekday === 0 ? renderWeeklyRecapHtml() : `<div class="rest-day">Rest day. Nothing to log 🛌</div>`;
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
      ${ex.tag ? `<div class="tag tag-${ex.tag}">${TAG_LABEL[ex.tag]}</div>` : ""}
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
    const profileKey = window.currentProfile.emailKey;
    const [{ data: wholeData }, healthRes] = await Promise.all([fetchDataFile(), fetch("/api/health")]);
    let wData = wholeData;
    if (isLegacyFlatObject(wData)) {
      wData = { [profileKey]: wData };
      await saveDataFile(wData);
    }
    state.wholeData = wData;
    state.data = getProfileSlice(wData, profileKey);

    let wHealth = healthRes.ok ? await healthRes.json() : {};
    if (isLegacyFlatObject(wHealth)) {
      wHealth = { [profileKey]: wHealth };
      await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wHealth),
      });
    }
    state.wholeHealth = wHealth;
    state.healthData = getProfileSlice(wHealth, profileKey);
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Approximate reps from a workout's target range (we only track weight per
// set, not actual reps performed). Returns null for non-numeric/time-based
// reps (e.g. "Failure", "30-40m") which can't be used for a volume estimate.
function repsMidpoint(repsStr) {
  if (!repsStr) return null;
  if (/failure/i.test(repsStr)) return null;
  if (/m$/i.test(repsStr.trim())) return null;
  const match = repsStr.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
  if (!match) return null;
  const a = parseFloat(match[1]);
  const b = match[2] !== undefined ? parseFloat(match[2]) : a;
  return (a + b) / 2;
}

// Stats for the Mon-Sat week ending the day before `sundayDate`.
function computeWeekRecap(sundayDate) {
  const dates = [];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(sundayDate);
    d.setDate(d.getDate() - i);
    dates.push(dateKey(d));
  }

  let workoutsLogged = 0;
  const prs = [];
  let totalVolume = 0;
  const notes = [];

  dates.forEach((dk) => {
    const rec = state.data[dk];
    if (!rec) return;
    const entries = rec.entries || {};
    const hasAny = Object.values(entries).some((vals) => vals.some((v) => v !== null && v !== undefined));
    if (hasAny) workoutsLogged++;

    const workout = WORKOUTS[rec.weekday];
    Object.entries(entries).forEach(([name, vals]) => {
      const nums = vals.filter((v) => v !== null && v !== undefined);
      if (nums.length === 0) return;

      const newMax = Math.max(...nums);
      const prevMax = allTimeMax(name, dk);
      if (prevMax === null || newMax > prevMax) {
        prs.push({ date: dk, name, weight: newMax });
      }

      const exDef = workout && workout.exercises.find((e) => e.name === name);
      const mid = exDef ? repsMidpoint(exDef.reps) : null;
      if (mid !== null) {
        nums.forEach((w) => { totalVolume += w * mid; });
      }
    });

    if (rec.note) {
      notes.push({ day: WEEKDAY_LABEL[rec.weekday], date: dk, note: rec.note });
    }
  });

  return { workoutsLogged, prs, totalVolume, notes };
}

function renderWeeklyRecapHtml() {
  const recap = computeWeekRecap(state.viewDate);
  const volumeStr = Math.round(recap.totalVolume).toLocaleString();

  const prHtml = recap.prs.length
    ? recap.prs.map((p) => `<li>🏆 ${escapeHtml(p.name)} — ${p.weight} (${p.date})</li>`).join("")
    : `<li class="muted-li">No new PRs this week</li>`;

  const notesHtml = recap.notes.length
    ? recap.notes.map((n) => `<div class="recap-note"><strong>${n.day}:</strong> ${escapeHtml(n.note)}</div>`).join("")
    : `<div class="muted-li">No notes written this week</div>`;

  return `
    <div class="recap">
      <h2>Week Recap 🎉</h2>
      <div class="recap-stats">
        <div class="recap-stat">
          <div class="recap-stat-value">${recap.workoutsLogged}/6</div>
          <div class="recap-stat-label">Workouts logged</div>
        </div>
        <div class="recap-stat">
          <div class="recap-stat-value">${recap.prs.length}</div>
          <div class="recap-stat-label">New PRs</div>
        </div>
        <div class="recap-stat">
          <div class="recap-stat-value">${volumeStr}</div>
          <div class="recap-stat-label">Est. volume (kg)</div>
        </div>
      </div>
      <h3>PRs this week</h3>
      <ul class="recap-list">${prHtml}</ul>
      <h3>Your notes this week</h3>
      <div class="recap-notes">${notesHtml}</div>
      <p class="recap-footer">Rest day — read this, then get after it Monday 💪</p>
    </div>
  `;
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
    state.wholeData = setProfileSlice(state.wholeData, window.currentProfile.emailKey, state.data);
    await saveDataFile(state.wholeData);
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
