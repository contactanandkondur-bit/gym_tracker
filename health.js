let healthData = {};
let chart = null;

const FIELDS = [
  { id: "h-weight", key: "weight" },
  { id: "h-smm", key: "smm" },
  { id: "h-fatmass", key: "fatMass" },
  { id: "h-bodyfat", key: "bodyFatPct" },
  { id: "h-bmi", key: "bmi" },
  { id: "h-whr", key: "whr" },
];

const METRIC_LABEL = {
  weight: "Weight (kg)",
  smm: "Skeletal Muscle Mass (kg)",
  fatMass: "Fat Mass (kg)",
  bodyFatPct: "Body Fat %",
  bmi: "BMI",
  whr: "Waist-to-Hip Ratio",
};

function pad(n) { return String(n).padStart(2, "0"); }

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function setStatus(msg, cls) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.className = "status" + (cls ? " " + cls : "");
}

function loadFormForDate(dateStr) {
  const entry = healthData[dateStr] || {};
  FIELDS.forEach(({ id, key }) => {
    const v = entry[key];
    document.getElementById(id).value = v !== undefined && v !== null ? v : "";
  });
}

function collectForm() {
  const entry = {};
  FIELDS.forEach(({ id, key }) => {
    const v = document.getElementById(id).value.trim();
    entry[key] = v === "" ? null : parseFloat(v);
  });
  return entry;
}

function buildSeries(metricKey) {
  return Object.keys(healthData)
    .sort()
    .filter((d) => healthData[d][metricKey] !== undefined && healthData[d][metricKey] !== null)
    .map((d) => ({ date: d, value: healthData[d][metricKey] }));
}

function renderChart(metricKey) {
  const points = buildSeries(metricKey);
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

  if (chart) chart.destroy();
  chart = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels: points.map((p) => p.date),
      datasets: [
        {
          label: METRIC_LABEL[metricKey],
          data: points.map((p) => p.value),
          borderColor: "#4f8cff",
          backgroundColor: "#4f8cff",
          tension: 0.25,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#e8e9ec" } } },
      scales: {
        x: { ticks: { color: "#9aa0ac" }, grid: { color: "#2a2e38" } },
        y: { ticks: { color: "#9aa0ac" }, grid: { color: "#2a2e38" } },
      },
    },
  });
}

async function loadAll() {
  setStatus("Loading...");
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    healthData = await res.json();
    setStatus("");
  } catch (e) {
    setStatus("Could not load data: " + e.message, "err");
  }
  loadFormForDate(document.getElementById("h-date").value);
  renderChart(document.getElementById("metric-select").value);
}

async function saveEntry() {
  const btn = document.getElementById("save-btn");
  btn.disabled = true;
  setStatus("Saving...");
  try {
    const dateStr = document.getElementById("h-date").value;
    healthData[dateStr] = collectForm();
    const res = await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(healthData),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    setStatus("Saved ✓", "ok");
    renderChart(document.getElementById("metric-select").value);
  } catch (e) {
    setStatus("Save failed: " + e.message, "err");
  } finally {
    btn.disabled = false;
  }
}

const dateInput = document.getElementById("h-date");
dateInput.value = todayStr();
dateInput.max = todayStr();
dateInput.onchange = () => loadFormForDate(dateInput.value);
document.getElementById("save-btn").onclick = saveEntry;
document.getElementById("metric-select").onchange = () => renderChart(document.getElementById("metric-select").value);

loadAll();
