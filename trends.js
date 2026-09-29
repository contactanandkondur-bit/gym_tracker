let chart = null;
let allData = {};

function allExerciseNames() {
  const names = new Set();
  Object.values(WORKOUTS).forEach((w) => w.exercises.forEach((e) => names.add(e.name)));
  return Array.from(names);
}

function buildSeries(exerciseName) {
  const points = [];
  Object.keys(allData)
    .sort()
    .forEach((date) => {
      const entry = allData[date];
      const sets = entry.entries && entry.entries[exerciseName];
      if (!sets) return;
      const vals = sets.filter((v) => v !== null && v !== undefined && !isNaN(v));
      if (vals.length === 0) return;
      points.push({ date, max: Math.max(...vals), avg: vals.reduce((a, b) => a + b, 0) / vals.length });
    });
  return points;
}

function renderChart(exerciseName) {
  const points = buildSeries(exerciseName);
  const emptyEl = document.getElementById("empty");
  const canvas = document.getElementById("chart");

  if (points.length === 0) {
    emptyEl.style.display = "block";
    canvas.style.display = "none";
    if (chart) chart.destroy();
    return;
  }
  emptyEl.style.display = "none";
  canvas.style.display = "block";

  const labels = points.map((p) => p.date);
  const maxData = points.map((p) => p.max);
  const avgData = points.map((p) => Math.round(p.avg * 100) / 100);

  if (chart) chart.destroy();
  chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Max weight",
          data: maxData,
          borderColor: "#4f8cff",
          backgroundColor: "#4f8cff",
          tension: 0.25,
        },
        {
          label: "Avg weight",
          data: avgData,
          borderColor: "#34d399",
          backgroundColor: "#34d399",
          tension: 0.25,
          borderDash: [5, 4],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#e8e9ec" } },
      },
      scales: {
        x: { ticks: { color: "#9aa0ac" }, grid: { color: "#2a2e38" } },
        y: { ticks: { color: "#9aa0ac" }, grid: { color: "#2a2e38" } },
      },
    },
  });
}

function populateSelect() {
  const sel = document.getElementById("exercise-select");
  sel.innerHTML = "";
  allExerciseNames().forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  });
  sel.onchange = () => renderChart(sel.value);
}

async function loadAndRender() {
  try {
    const { data } = await fetchDataFile();
    allData = data;
  } catch (e) {
    document.getElementById("empty").textContent = "Could not load data from GitHub: " + e.message;
    document.getElementById("empty").style.display = "block";
    document.getElementById("chart").style.display = "none";
    return;
  }
  populateSelect();
  const sel = document.getElementById("exercise-select");
  if (sel.options.length > 0) renderChart(sel.value);
}

document.getElementById("settings-btn").onclick = () => openSettingsModal(loadAndRender);

populateSelect();
if (hasSettings()) {
  loadAndRender();
} else {
  openSettingsModal(loadAndRender);
}
