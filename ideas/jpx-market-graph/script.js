const JPX_PAGES = {
  marketCap: "https://www.jpx.co.jp/english/markets/statistics-equities/misc/02.html",
  trading: "https://www.jpx.co.jp/english/markets/statistics-equities/misc/",
};

const markets = [
  { key: "prime", label: "プライム", patterns: [/プライム/, /prime/i] },
  { key: "standard", label: "スタンダード", patterns: [/スタンダード/, /standard/i] },
  { key: "growth", label: "グロース", patterns: [/グロース/, /growth/i, /mothers/i] },
  { key: "other", label: "その他", patterns: [/その他/, /other/i, /tokyo pro/i, /pro market/i] },
];

const sampleRows = [
  { market: "プライム", marketCap: 930, tradingValue: 105, tradingVolume: 420 },
  { market: "スタンダード", marketCap: 29, tradingValue: 2.6, tradingVolume: 18 },
  { market: "グロース", marketCap: 7.5, tradingValue: 1.8, tradingVolume: 11 },
  { market: "その他", marketCap: 1.1, tradingValue: 0.2, tradingVolume: 1.3 },
];

const rowsEl = document.querySelector("#data-rows");
const chartEl = document.querySelector("#chart");
const summaryGridEl = document.querySelector("#summary-grid");
const periodInput = document.querySelector("#period-input");
const sampleButton = document.querySelector("#sample-button");
const clearButton = document.querySelector("#clear-button");
const autoLoadButton = document.querySelector("#auto-load-button");
const chartSubtitle = document.querySelector("#chart-subtitle");
const statusText = document.querySelector("#status-text");
const sourceGrid = document.querySelector("#source-grid");
const marketCapFile = document.querySelector("#market-cap-file");
const tradingFile = document.querySelector("#trading-file");

let currentRows = sampleRows.map((row) => ({ ...row }));
let loadedSources = [];

function setStatus(message, type = "info") {
  statusText.textContent = message;
  statusText.dataset.type = type;
}

function formatNumber(value, digits = 1) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: value < 10 && value !== 0 ? 1 : 0,
  }).format(value);
}

function toNumber(value) {
  const normalized = String(value).replace(/[,+\s]/g, "").replace(/[△▲]/g, "-").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildRows(data) {
  rowsEl.innerHTML = "";

  data.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="market-name">${row.market}</td>
      <td><input type="number" inputmode="decimal" step="0.1" min="0" data-index="${index}" data-key="marketCap" value="${row.marketCap || ""}" aria-label="${row.market}の時価総額（兆円）" /></td>
      <td><input type="number" inputmode="decimal" step="0.1" min="0" data-index="${index}" data-key="tradingValue" value="${row.tradingValue || ""}" aria-label="${row.market}の売買代金（兆円）" /></td>
      <td><input type="number" inputmode="decimal" step="0.1" min="0" data-index="${index}" data-key="tradingVolume" value="${row.tradingVolume || ""}" aria-label="${row.market}の売買高（億株）" /></td>
    `;
    rowsEl.appendChild(tr);
  });
}

function readRows() {
  return currentRows.map((row, index) => {
    const getValue = (key) => {
      const input = rowsEl.querySelector(`input[data-index="${index}"][data-key="${key}"]`);
      return toNumber(input?.value ?? 0);
    };

    return {
      market: row.market,
      marketCap: getValue("marketCap"),
      tradingValue: getValue("tradingValue"),
      tradingVolume: getValue("tradingVolume"),
    };
  });
}

function scale(value, max, size) {
  if (max <= 0) return 0;
  return (value / max) * size;
}

function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function makeSvg(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function drawChart(data) {
  chartEl.innerHTML = "";

  const width = 920;
  const height = 520;
  const margin = { top: 36, right: 88, bottom: 82, left: 76 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const baseY = margin.top + plotHeight;
  const maxYen = niceMax(Math.max(...data.flatMap((row) => [row.marketCap, row.tradingValue])));
  const maxVolume = niceMax(Math.max(...data.map((row) => row.tradingVolume)));
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(52, groupWidth * 0.22);

  chartEl.appendChild(makeSvg("rect", { x: 0, y: 0, width, height, rx: 22, fill: "#ffffff" }));

  if (data.every((row) => row.marketCap + row.tradingValue + row.tradingVolume === 0)) {
    chartEl.appendChild(makeSvg("text", {
      x: width / 2,
      y: height / 2,
      "text-anchor": "middle",
      class: "empty-label",
    })).textContent = "数値を入力、またはJPXから自動取得するとグラフが表示されます";
    return;
  }

  for (let i = 0; i <= 4; i += 1) {
    const y = baseY - (plotHeight / 4) * i;
    const yenTick = (maxYen / 4) * i;
    const volumeTick = (maxVolume / 4) * i;

    chartEl.appendChild(makeSvg("line", {
      x1: margin.left,
      y1: y,
      x2: width - margin.right,
      y2: y,
      stroke: "#d9e2ef",
      "stroke-dasharray": i === 0 ? "0" : "5 7",
    }));

    const leftLabel = makeSvg("text", { x: margin.left - 12, y: y + 4, "text-anchor": "end", class: "tick-label" });
    leftLabel.textContent = formatNumber(yenTick, 1);
    chartEl.appendChild(leftLabel);

    const rightLabel = makeSvg("text", { x: width - margin.right + 12, y: y + 4, class: "tick-label" });
    rightLabel.textContent = formatNumber(volumeTick, 1);
    chartEl.appendChild(rightLabel);
  }

  const leftAxis = makeSvg("text", { x: margin.left, y: 20, class: "axis-label" });
  leftAxis.textContent = "兆円（時価総額・売買代金）";
  chartEl.appendChild(leftAxis);

  const rightAxis = makeSvg("text", { x: width - margin.right, y: 20, "text-anchor": "end", class: "axis-label" });
  rightAxis.textContent = "億株（売買高）";
  chartEl.appendChild(rightAxis);

  const points = [];

  data.forEach((row, index) => {
    const centerX = margin.left + groupWidth * index + groupWidth / 2;
    const capHeight = scale(row.marketCap, maxYen, plotHeight);
    const valueHeight = scale(row.tradingValue, maxYen, plotHeight);
    const volumeY = baseY - scale(row.tradingVolume, maxVolume, plotHeight);

    chartEl.appendChild(makeSvg("rect", {
      x: centerX - barWidth - 3,
      y: baseY - capHeight,
      width: barWidth,
      height: capHeight,
      rx: 8,
      fill: "#2f80ed",
    }));

    chartEl.appendChild(makeSvg("rect", {
      x: centerX + 3,
      y: baseY - valueHeight,
      width: barWidth,
      height: valueHeight,
      rx: 8,
      fill: "#f2994a",
    }));

    const capText = makeSvg("text", {
      x: centerX - barWidth / 2 - 3,
      y: Math.max(margin.top + 14, baseY - capHeight - 8),
      "text-anchor": "middle",
      class: "bar-label",
    });
    capText.textContent = formatNumber(row.marketCap, 1);
    chartEl.appendChild(capText);

    const valueText = makeSvg("text", {
      x: centerX + barWidth / 2 + 3,
      y: Math.max(margin.top + 30, baseY - valueHeight - 8),
      "text-anchor": "middle",
      class: "bar-label",
    });
    valueText.textContent = formatNumber(row.tradingValue, 1);
    chartEl.appendChild(valueText);

    const label = makeSvg("text", {
      x: centerX,
      y: baseY + 34,
      "text-anchor": "middle",
      class: "market-label",
    });
    label.textContent = row.market;
    chartEl.appendChild(label);

    points.push({ x: centerX, y: volumeY, value: row.tradingVolume });
  });

  chartEl.appendChild(makeSvg("polyline", {
    points: points.map((point) => `${point.x},${point.y}`).join(" "),
    fill: "none",
    stroke: "#27ae60",
    "stroke-width": 4,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  }));

  points.forEach((point) => {
    chartEl.appendChild(makeSvg("circle", { cx: point.x, cy: point.y, r: 7, fill: "#27ae60", stroke: "#ffffff", "stroke-width": 3 }));
    const volumeText = makeSvg("text", {
      x: point.x,
      y: Math.max(margin.top + 12, point.y - 14),
      "text-anchor": "middle",
      class: "bar-label",
    });
    volumeText.textContent = formatNumber(point.value, 1);
    chartEl.appendChild(volumeText);
  });
}

function updateSummary(data) {
  const totalCap = data.reduce((sum, row) => sum + row.marketCap, 0);
  const totalValue = data.reduce((sum, row) => sum + row.tradingValue, 0);
  const totalVolume = data.reduce((sum, row) => sum + row.tradingVolume, 0);
  const turnover = totalCap > 0 ? (totalValue / totalCap) * 100 : 0;

  const cards = [
    { label: "合計時価総額", value: `${formatNumber(totalCap, 1)} 兆円`, note: "入力・取得した市場の合算" },
    { label: "合計売買代金", value: `${formatNumber(totalValue, 1)} 兆円`, note: `時価総額比 ${formatNumber(turnover, 2)}%` },
    { label: "合計売買高", value: `${formatNumber(totalVolume, 1)} 億株`, note: "市場ごとの流動性比較に利用" },
  ];

  summaryGridEl.innerHTML = cards
    .map((card) => `
      <article class="summary-card">
        <p>${card.label}</p>
        <strong>${card.value}</strong>
        <small>${card.note}</small>
      </article>
    `)
    .join("");
}

function renderSourceCards() {
  if (loadedSources.length === 0) {
    sourceGrid.innerHTML = `<div class="source-pill muted">まだJPXファイルを取得していません</div>`;
    return;
  }

  sourceGrid.innerHTML = loadedSources
    .map((source) => `
      <a class="source-pill" href="${source.url}" target="_blank" rel="noreferrer">
        <span>${source.label}</span>
        <strong>${source.title || "取得ファイル"}</strong>
      </a>
    `)
    .join("");
}

function render() {
  const data = readRows();
  chartSubtitle.textContent = `${periodInput.value || "対象年月未入力"} / 棒：時価総額・売買代金、線：売買高`;
  drawChart(data);
  updateSummary(data);
  renderSourceCards();
}

function setRows(data) {
  currentRows = data.map((row) => ({ ...row }));
  buildRows(currentRows);
  render();
}

function mergeRows(baseRows, partialRows) {
  return baseRows.map((row) => {
    const found = partialRows.find((partial) => partial.market === row.market);
    return found ? { ...row, ...found } : row;
  });
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

function makeProxyUrls(url) {
  return [
    url,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];
}

async function fetchTextWithFallback(url) {
  const errors = [];
  for (const candidate of makeProxyUrls(url)) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(errors.join(" / "));
}

async function fetchArrayBufferWithFallback(url) {
  const errors = [];
  for (const candidate of makeProxyUrls(url)) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.arrayBuffer();
    } catch (error) {
      errors.push(`${candidate}: ${error.message}`);
    }
  }
  throw new Error(errors.join(" / "));
}

function extractExcelLinks(html, baseUrl) {
  const links = [];
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    if (!/\.xls[xm]?($|[?#])/i.test(href)) return;
    links.push({
      url: absoluteUrl(href, baseUrl),
      title: anchor.textContent.replace(/\s+/g, " ").trim(),
    });
  });

  const regex = /href=["']([^"']+\.xls[xm]?[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match = regex.exec(html);
  while (match) {
    const url = absoluteUrl(match[1], baseUrl);
    if (url && !links.some((link) => link.url === url)) {
      links.push({ url, title: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
    }
    match = regex.exec(html);
  }

  return links.filter((link) => link.url);
}

function pickLatestLink(links, type) {
  const priorities = type === "marketCap"
    ? [/market capitalization/i, /時価総額/]
    : [/stocks and bonds/i, /株式.*債券/, /売買高.*売買代金/];

  return links.find((link) => priorities.some((pattern) => pattern.test(`${link.title} ${link.url}`))) || links[0];
}

function extractPeriod(...texts) {
  const joined = texts.filter(Boolean).join(" ");
  const english = joined.match(/([A-Z][a-z]{2,8}\.?\s+20\d{2})/);
  if (english) return english[1].replace(".", "");
  const japanese = joined.match(/(20\d{2}年\s*\d{1,2}月)/);
  if (japanese) return japanese[1].replace(/\s+/g, "");
  return "JPX最新取得データ";
}

function cellText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function workbookRows(workbook) {
  const rows = [];
  workbook.SheetNames.forEach((sheetName) => {
    const sheetRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, raw: false, defval: "" });
    sheetRows.forEach((row, rowIndex) => {
      rows.push({ sheetName, rowIndex, cells: row.map(cellText) });
    });
  });
  return rows;
}

function findMarket(rowText) {
  return markets.find((market) => market.patterns.some((pattern) => pattern.test(rowText)));
}

function rowNumbers(cells) {
  return cells
    .map((cell) => toNumber(cell))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 1_000_000_000_000);
}

function normalizeYenToTrillion(value) {
  if (value > 100_000_000_000) return value / 1_000_000_000_000;
  if (value > 1_000_000) return value / 1_000_000;
  if (value > 10_000) return value / 1_000;
  return value;
}

function normalizeVolumeToHundredMillionShares(value) {
  if (value > 1_000_000_000) return value / 100_000_000;
  if (value > 100_000) return value / 100_000;
  if (value > 10_000) return value / 100;
  return value;
}

function parseMarketCapWorkbook(workbook) {
  const found = new Map();

  workbookRows(workbook).forEach(({ cells }) => {
    const rowText = cells.join(" ");
    const market = findMarket(rowText);
    if (!market || found.has(market.label)) return;

    const nums = rowNumbers(cells);
    if (nums.length === 0) return;

    const marketCapRaw = Math.max(...nums);
    found.set(market.label, {
      market: market.label,
      marketCap: Number(normalizeYenToTrillion(marketCapRaw).toFixed(1)),
    });
  });

  return Array.from(found.values());
}

function parseTradingWorkbook(workbook) {
  const found = new Map();

  workbookRows(workbook).forEach(({ cells }) => {
    const rowText = cells.join(" ");
    const market = findMarket(rowText);
    if (!market || found.has(market.label)) return;

    const nums = rowNumbers(cells).filter((value) => value < 900_000_000_000);
    if (nums.length < 2) return;

    const [volumeRaw, valueRaw] = nums;
    found.set(market.label, {
      market: market.label,
      tradingVolume: Number(normalizeVolumeToHundredMillionShares(volumeRaw).toFixed(1)),
      tradingValue: Number(normalizeYenToTrillion(valueRaw).toFixed(1)),
    });
  });

  return Array.from(found.values());
}

async function workbookFromUrl(url) {
  const buffer = await fetchArrayBufferWithFallback(url);
  return XLSX.read(buffer, { type: "array" });
}

async function workbookFromFile(file) {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: "array" });
}

async function loadJpxData() {
  if (!window.XLSX) {
    setStatus("Excel解析ライブラリを読み込めませんでした。ネットワークを確認して再読み込みしてください。", "error");
    return;
  }

  autoLoadButton.disabled = true;
  setStatus("JPXページから最新Excelリンクを探しています...", "loading");

  try {
    const [capHtml, tradingHtml] = await Promise.all([
      fetchTextWithFallback(JPX_PAGES.marketCap),
      fetchTextWithFallback(JPX_PAGES.trading),
    ]);
    const capLink = pickLatestLink(extractExcelLinks(capHtml, JPX_PAGES.marketCap), "marketCap");
    const tradingLink = pickLatestLink(extractExcelLinks(tradingHtml, JPX_PAGES.trading), "trading");

    if (!capLink || !tradingLink) {
      throw new Error("JPXページ内でExcelリンクを見つけられませんでした。");
    }

    setStatus("JPXのExcelを取得して解析しています...", "loading");
    const [capWorkbook, tradingWorkbook] = await Promise.all([
      workbookFromUrl(capLink.url),
      workbookFromUrl(tradingLink.url),
    ]);

    const capRows = parseMarketCapWorkbook(capWorkbook);
    const tradingRows = parseTradingWorkbook(tradingWorkbook);
    let merged = mergeRows(markets.map((market) => ({ market: market.label, marketCap: 0, tradingValue: 0, tradingVolume: 0 })), capRows);
    merged = mergeRows(merged, tradingRows);

    const parsedCount = merged.filter((row) => row.marketCap || row.tradingValue || row.tradingVolume).length;
    if (parsedCount === 0) throw new Error("Excelは取得できましたが、市場別データを抽出できませんでした。");

    loadedSources = [
      { label: "市場別時価総額", title: capLink.title, url: capLink.url },
      { label: "売買高・売買代金", title: tradingLink.title, url: tradingLink.url },
    ];
    periodInput.value = extractPeriod(capLink.title, tradingLink.title, capLink.url, tradingLink.url);
    setRows(merged);
    setStatus(`JPXから自動取得しました（${parsedCount}市場を描画）。`, "success");
  } catch (error) {
    setStatus(`自動取得に失敗しました: ${error.message} 手動Excel読込を試してください。`, "error");
    if (readRows().every((row) => row.marketCap + row.tradingValue + row.tradingVolume === 0)) {
      setRows(sampleRows);
      periodInput.value = "自動取得失敗時のサンプル";
    }
  } finally {
    autoLoadButton.disabled = false;
  }
}

async function handleFileLoad(file, type) {
  if (!file || !window.XLSX) return;
  try {
    setStatus(`${file.name} を解析しています...`, "loading");
    const workbook = await workbookFromFile(file);
    const partialRows = type === "marketCap" ? parseMarketCapWorkbook(workbook) : parseTradingWorkbook(workbook);
    const merged = mergeRows(readRows(), partialRows);
    setRows(merged);
    loadedSources = [
      ...loadedSources.filter((source) => source.label !== (type === "marketCap" ? "市場別時価総額" : "売買高・売買代金")),
      { label: type === "marketCap" ? "市場別時価総額" : "売買高・売買代金", title: file.name, url: "#" },
    ];
    periodInput.value = periodInput.value || "手動Excel読込データ";
    setStatus(`${file.name} から ${partialRows.length} 市場を読み込みました。`, "success");
    renderSourceCards();
  } catch (error) {
    setStatus(`${file.name} の解析に失敗しました: ${error.message}`, "error");
  }
}

rowsEl.addEventListener("input", render);
periodInput.addEventListener("input", render);
autoLoadButton.addEventListener("click", loadJpxData);
marketCapFile.addEventListener("change", (event) => handleFileLoad(event.target.files[0], "marketCap"));
tradingFile.addEventListener("change", (event) => handleFileLoad(event.target.files[0], "trading"));

sampleButton.addEventListener("click", () => {
  loadedSources = [];
  periodInput.value = "サンプル（公式値ではありません）";
  setRows(sampleRows);
  setStatus("サンプルを表示しています。JPXから再取得できます。", "info");
});

clearButton.addEventListener("click", () => {
  loadedSources = [];
  periodInput.value = "";
  setRows(markets.map((market) => ({ market: market.label, marketCap: 0, tradingValue: 0, tradingVolume: 0 })));
  setStatus("数値を空にしました。", "info");
});

setRows(sampleRows);
setStatus("ページ表示後にJPXから自動取得します。", "info");
window.addEventListener("load", loadJpxData);
