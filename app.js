const WEEKDAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABEL = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

let state = {
  data: {},
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
  listEl.innerHTML = "";

  if (workout.exercises.length === 0) {
    listEl.innerHTML = `<div class="rest-day">Rest day. Nothing to log 🛌</div>`;
    saveBar.style.display = "none";
    return;
  }

  saveBar.style.display = "block";
  const existing = (state.data[state.selectedDateKey] && state.data[state.selectedDateKey].entries) || {};

  workout.exercises.forEach((ex) => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    const savedSets = existing[ex.name] || [];

    let setsHtml = "";
    for (let i = 0; i < ex.sets; i++) {
      const val = savedSets[i] !== undefined && savedSets[i] !== null ? savedSets[i] : "";
      setsHtml += `
        <div class="set-input">
          <label>Set ${i + 1}</label>
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

async function loadData() {
  setStatus("Loading...");
  try {
    const { data } = await fetchDataFile();
    state.data = data;
    setStatus("");
  } catch (e) {
    setStatus("Could not load data: " + e.message, "err");
  }
  renderWorkout();
}

async function saveWorkout() {
  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  setStatus("Saving...");
  try {
    const entries = collectEntries();
    state.data[state.selectedDateKey] = {
      weekday: state.viewDate.getDay(),
      entries,
    };
    await saveDataFile(state.data);
    setStatus("Saved ✓", "ok");
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

loadData();
