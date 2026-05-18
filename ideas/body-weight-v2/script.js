const STORAGE_KEY = "body-weight-v2-entries";

const form = document.getElementById("entry-form");
const dateInput = document.getElementById("date");
const weightInput = document.getElementById("weight");
const intakeInput = document.getElementById("intake");
const burnInput = document.getElementById("burn");
const historyBody = document.getElementById("history-body");
const clearAllBtn = document.getElementById("clear-all");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function sortByDate(entries) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

function upsertEntry(newEntry) {
  const entries = loadEntries();
  const index = entries.findIndex((e) => e.date === newEntry.date);
  if (index >= 0) {
    entries[index] = newEntry;
  } else {
    entries.push(newEntry);
  }
  saveEntries(entries);
}

function deleteEntry(date) {
  const entries = loadEntries().filter((e) => e.date !== date);
  saveEntries(entries);
}

function renderHistory() {
  const entries = sortByDate(loadEntries());
  historyBody.innerHTML = "";

  entries.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.weight.toFixed(1)} kg</td>
      <td>${entry.intake} kcal</td>
      <td>${entry.burn} kcal</td>
      <td><button class="small danger" data-delete="${entry.date}">削除</button></td>
    `;
    historyBody.appendChild(tr);
  });

  historyBody.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteEntry(button.dataset.delete);
      renderAll();
    });
  });
}

function drawSeries(entries, key, color, min, max, chart) {
  if (entries.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  entries.forEach((entry, i) => {
    const x = chart.left + (chart.width * i) / Math.max(1, entries.length - 1);
    const ratio = (entry[key] - min) / Math.max(1e-9, max - min);
    const y = chart.top + chart.height * (1 - ratio);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  ctx.stroke();
}

function drawChart() {
  const entries = sortByDate(loadEntries());
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const chart = { left: 55, top: 20, width: canvas.width - 75, height: canvas.height - 70 };

  ctx.strokeStyle = "#d8deea";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = chart.top + (chart.height * i) / 4;
    ctx.beginPath();
    ctx.moveTo(chart.left, y);
    ctx.lineTo(chart.left + chart.width, y);
    ctx.stroke();
  }

  if (entries.length === 0) {
    ctx.fillStyle = "#61697a";
    ctx.font = "16px sans-serif";
    ctx.fillText("データを追加するとグラフが表示されます", chart.left, chart.top + chart.height / 2);
    return;
  }

  const values = entries.flatMap((e) => [e.weight, e.intake, e.burn]);
  const min = Math.min(...values);
  const max = Math.max(...values);

  drawSeries(entries, "weight", "#2563eb", min, max, chart);
  drawSeries(entries, "intake", "#16a34a", min, max, chart);
  drawSeries(entries, "burn", "#f97316", min, max, chart);

  ctx.fillStyle = "#61697a";
  ctx.font = "12px sans-serif";
  const step = Math.max(1, Math.floor(entries.length / 6));
  entries.forEach((entry, i) => {
    if (i % step === 0 || i === entries.length - 1) {
      const x = chart.left + (chart.width * i) / Math.max(1, entries.length - 1);
      ctx.fillText(entry.date.slice(5), x - 14, chart.top + chart.height + 18);
    }
  });
}

function renderAll() {
  renderHistory();
  drawChart();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = {
    date: dateInput.value,
    weight: Number(weightInput.value),
    intake: Number(intakeInput.value),
    burn: Number(burnInput.value),
  };

  if (!entry.date || !Number.isFinite(entry.weight) || !Number.isFinite(entry.intake) || !Number.isFinite(entry.burn)) {
    return;
  }

  upsertEntry(entry);
  renderAll();
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("すべての履歴を削除しますか？")) return;
  saveEntries([]);
  renderAll();
});

dateInput.value = todayISO();
renderAll();
