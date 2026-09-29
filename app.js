const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let state = {
  data: {},
  sha: null,
  selectedWeekday: new Date().getDay(),
  selectedDateKey: null,
};

function pad(n) { return String(n).padStart(2, "0"); }

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function renderDayPicker() {
  const el = document.getElementById("day-picker");
  el.innerHTML = "";
  for (let w = 1; w <= 6; w++) {
    const btn = document.createElement("button");
    btn.textContent = DAY_NAMES[w];
    btn.className = w === state.selectedWeekday ? "active" : "";
    btn.onclick = () => {
      state.selectedWeekday = w;
      renderDayPicker();
      renderWorkout();
    };
    el.appendChild(btn);
  }
  const restBtn = document.createElement("button");
  restBtn.textContent = "Sun";
  restBtn.className = state.selectedWeekday === 0 ? "active" : "";
  restBtn.onclick = () => {
    state.selectedWeekday = 0;
    renderDayPicker();
    renderWorkout();
  };
  el.appendChild(restBtn);
}

function renderWorkout() {
  const workout = WORKOUTS[state.selectedWeekday];
  // Always log against today's real date, regardless of which day's template is picked.
  state.selectedDateKey = dateKey(new Date());
  const isDefaultDay = state.selectedWeekday === new Date().getDay();

  document.getElementById("day-title").innerHTML = `
    <h2>${workout.day} – ${workout.title}</h2>
    <p>${isDefaultDay ? "Today" : `Logging as today (${state.selectedDateKey})`}</p>
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
      const val = savedSets[i] !== undefined ? savedSets[i] : "";
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

function collectEntries() {
  const workout = WORKOUTS[state.selectedWeekday];
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
    const { data, sha } = await fetchDataFile();
    state.data = data;
    state.sha = sha;
    setStatus("");
  } catch (e) {
    setStatus("Could not load data from GitHub: " + e.message, "err");
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
      weekday: state.selectedWeekday,
      entries,
    };
    const sha = await saveDataFile(state.data, state.sha, `Log workout ${state.selectedDateKey}`);
    state.sha = sha;
    setStatus("Saved ✓", "ok");
  } catch (e) {
    setStatus("Save failed: " + e.message, "err");
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("settings-btn").onclick = () => openSettingsModal(loadData);
document.getElementById("save-btn").onclick = saveWorkout;

renderDayPicker();
if (hasSettings()) {
  loadData();
} else {
  renderWorkout();
  openSettingsModal(loadData);
}
