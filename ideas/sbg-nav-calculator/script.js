const navBuckets = [
  { name: 'Arm', officialValue: 19.15, count: 1, examples: 'Arm Holdings' },
  { name: 'SVF2', officialValue: 17.19, count: 275, examples: 'OpenAI、PayPay、Databricks、Perplexity、Lenskart、Klarna、Revolut、Wayve、Helion、Symbotic、Swiggy、JD Logistics など' },
  { name: 'その他', officialValue: 4.61, count: null, examples: 'Alibaba など。FY2025 Q2以降のAlibaba保有株式価値は「その他」に含む想定' },
  { name: 'SVF1', officialValue: 3.38, count: 52, examples: 'ByteDance、Coupang、DiDi、Grab、OYO、Klook、Delhivery、Auto1、Compass、Aurora、Energy Vault など' },
  { name: 'SoftBank Corp. / SBKK', officialValue: 2.85, count: 1, examples: 'ソフトバンク株式会社' },
  { name: 'LatAm Funds', officialValue: 1.04, count: 84, examples: 'Nu、Inter、VTEX、Kavak、Rappi、QuintoAndar、Loggi、Bitso、Uala など' },
  { name: 'T-Mobile', officialValue: 0.05, count: 1, examples: 'T-Mobile US' },
];

const marketAdjustments = [
  { name: 'Arm Holdings', bucket: 'Arm', ticker: 'ARM.US', officialValue: 19.15, currentValue: 19.15 },
  { name: 'SoftBank Corp. / SBKK', bucket: 'SoftBank Corp. / SBKK', ticker: '9434.JP', officialValue: 2.85, currentValue: 2.85 },
  { name: 'T-Mobile US', bucket: 'T-Mobile', ticker: 'TMUS.US', officialValue: 0.05, currentValue: 0.05 },
  { name: 'Alibaba', bucket: 'その他', ticker: 'BABA.US', officialValue: 0.00, currentValue: 0.00 },
  { name: 'Coupang', bucket: 'SVF1', ticker: 'CPNG.US', officialValue: 0.00, currentValue: 0.00 },
  { name: 'Grab', bucket: 'SVF1', ticker: 'GRAB.US', officialValue: 0.00, currentValue: 0.00 },
  { name: 'Nu Holdings', bucket: 'LatAm Funds', ticker: 'NU.US', officialValue: 0.00, currentValue: 0.00 },
];

const futureInvestments = [
  { name: 'OpenAI', bucket: 'SVF2 / strategic', currency: 'USD', reportedValue: 300, ownership: 0, include: true, note: '報道評価額や出資比率を入力して将来NAV感応度を確認' },
  { name: 'Roze', bucket: 'strategic', currency: 'USD', reportedValue: 0, ownership: 0, include: true, note: '報道・推定値が出たら入力' },
  { name: 'SB Energy', bucket: 'その他 / strategic', currency: 'JPY', reportedValue: 0, ownership: 0, include: true, note: '円建ての評価額を十億円で入力' },
  { name: 'Intel', bucket: 'strategic', currency: 'USD', reportedValue: 0, ownership: 0, include: true, note: '株式・転換証券などの想定エクスポージャーを入力' },
  { name: 'Databricks', bucket: 'SVF2', currency: 'USD', reportedValue: 62, ownership: 0, include: false, note: '任意のSVF2主要未上場枠' },
  { name: 'Perplexity', bucket: 'SVF2', currency: 'USD', reportedValue: 18, ownership: 0, include: false, note: '任意のSVF2主要未上場枠' },
];

const els = {
  status: document.querySelector('#status'),
  navBuckets: document.querySelector('#navBuckets'),
  marketAdjustments: document.querySelector('#marketAdjustments'),
  futureInvestments: document.querySelector('#futureInvestments'),
  officialDateLabel: document.querySelector('#officialDateLabel'),
  officialNavPerShare: document.querySelector('#officialNavPerShare'),
  officialNavTotal: document.querySelector('#officialNavTotal'),
  officialLtv: document.querySelector('#officialLtv'),
  officialDiscount: document.querySelector('#officialDiscount'),
  liveNavPerShare: document.querySelector('#liveNavPerShare'),
  liveNavTotal: document.querySelector('#liveNavTotal'),
  futureNavTotal: document.querySelector('#futureNavTotal'),
  liveDiscount: document.querySelector('#liveDiscount'),
};

const input = id => document.querySelector(`#${id}`);
const yen = value => new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(value);
const pct = value => `${value.toFixed(1)}%`;
const trillion = value => `${value.toFixed(2)}兆円`;
const usdJpy = () => Number(input('usdJpy').value);

function renderNavBuckets() {
  els.navBuckets.innerHTML = navBuckets.map(bucket => `
    <article class="bucket-card">
      <div>
        <h3>${bucket.name}</h3>
        <p>${bucket.examples}</p>
      </div>
      <div class="bucket-meta">
        <span>NAV上の価値</span>
        <strong>${trillion(bucket.officialValue)}</strong>
        <small>${bucket.count ? `${bucket.count}件を集約` : '公式データシート上の集約枠'}</small>
      </div>
    </article>`).join('');
}

function renderMarketAdjustments() {
  els.marketAdjustments.innerHTML = marketAdjustments.map((item, i) => `
    <div class="adjustment-row">
      <div><h3>${item.name}</h3><div class="meta">${item.bucket} / ${item.ticker}</div></div>
      <label>公式枠内価値（兆円）<input data-kind="market" data-i="${i}" data-k="officialValue" type="number" step="0.01" value="${item.officialValue}"></label>
      <label>現在価値（兆円）<input data-kind="market" data-i="${i}" data-k="currentValue" type="number" step="0.01" value="${item.currentValue}"></label>
      <label>差分（兆円）<input readonly value="${(item.currentValue - item.officialValue).toFixed(2)}"></label>
    </div>`).join('');
}

function renderFutureInvestments() {
  els.futureInvestments.innerHTML = futureInvestments.map((item, i) => `
    <div class="future-row">
      <div>
        <h3>${item.name}</h3>
        <div class="meta">${item.bucket} / ${item.currency}</div>
        <p>${item.note}</p>
      </div>
      <label>反映<input data-kind="future" data-i="${i}" data-k="include" type="checkbox" ${item.include ? 'checked' : ''}></label>
      <label>評価額（${item.currency === 'USD' ? '十億USD' : '十億円'}）<input data-kind="future" data-i="${i}" data-k="reportedValue" type="number" step="0.1" value="${item.reportedValue}"></label>
      <label>SBG持分率（%）<input data-kind="future" data-i="${i}" data-k="ownership" type="number" step="0.1" value="${item.ownership}"></label>
      <label>NAV加算（兆円）<input readonly value="${futureValue(item).toFixed(2)}"></label>
    </div>`).join('');
}

function futureValue(item) {
  if (!item.include) return 0;
  const fx = item.currency === 'USD' ? usdJpy() : 1;
  return item.reportedValue * (item.ownership / 100) * fx / 1000;
}

function bindEditableRows() {
  document.querySelectorAll('[data-kind]').forEach(el => {
    el.addEventListener('input', updateFromInput);
    el.addEventListener('change', updateFromInput);
  });
}

function updateFromInput(event) {
  const { kind, i, k } = event.target.dataset;
  const list = kind === 'market' ? marketAdjustments : futureInvestments;
  list[Number(i)][k] = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
  recalculate(false);
}

function recalculate(rerender = true) {
  const officialNav = navBuckets.reduce((sum, bucket) => sum + bucket.officialValue, 0);
  const netDebt = Number(input('netDebt').value) / 1000;
  const sharesOut = Number(input('sharesOut').value);
  const sbgPrice = Number(input('sbgPrice').value);
  const marketDelta = marketAdjustments.reduce((sum, item) => sum + item.currentValue - item.officialValue, 0);
  const futureNav = futureInvestments.reduce((sum, item) => sum + futureValue(item), 0);
  const liveNav = officialNav + marketDelta + futureNav;
  const officialNavPerShare = officialNav * 1000 * 1000 / sharesOut;
  const liveNavPerShare = liveNav * 1000 * 1000 / sharesOut;
  const officialAssetValue = officialNav + netDebt;
  const officialLtv = netDebt / officialAssetValue * 100;
  const officialDiscount = (sbgPrice / officialNavPerShare - 1) * 100;
  const liveDiscount = (sbgPrice / liveNavPerShare - 1) * 100;

  els.officialDateLabel.textContent = input('baseDate').value;
  els.officialNavPerShare.textContent = `${yen(officialNavPerShare)}円`;
  els.officialNavTotal.textContent = trillion(officialNav);
  els.officialLtv.textContent = pct(officialLtv);
  els.officialDiscount.textContent = pct(officialDiscount);
  els.liveNavPerShare.textContent = `${yen(liveNavPerShare)}円`;
  els.liveNavTotal.textContent = trillion(liveNav);
  els.futureNavTotal.textContent = trillion(futureNav);
  els.liveDiscount.textContent = pct(liveDiscount);

  if (rerender) {
    renderMarketAdjustments();
    renderFutureInvestments();
    bindEditableRows();
  }
}

async function fetchStooq(symbol) {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(symbol.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`;
  const response = await fetch(url);
  const text = await response.text();
  const [, row] = text.trim().split('\n');
  const cols = row?.split(',') ?? [];
  const close = Number(cols[6]);
  if (!Number.isFinite(close)) throw new Error(`${symbol} price unavailable`);
  return close;
}

async function fetchPrices() {
  els.status.textContent = '上場株価を取得中...（現在価値は必要に応じて手入力してください）';
  try {
    const usd = await fetchStooq('usdjpy');
    input('usdJpy').value = usd.toFixed(2);
  } catch { /* keep manual rate */ }
  const results = await Promise.all(marketAdjustments.map(async item => {
    try { await fetchStooq(item.ticker); return `${item.ticker}: 価格取得OK`; }
    catch { return `${item.ticker}: 手入力`; }
  }));
  els.status.textContent = `取得完了: ${results.join(' / ')}（兆円ベースの現在価値へ反映する場合は手入力してください）`;
  recalculate(true);
}

renderNavBuckets();
recalculate();
document.querySelectorAll('#baseDate, #sharesOut, #netDebt, #sbgPrice, #usdJpy').forEach(el => el.addEventListener('input', () => recalculate()));
document.querySelector('#fetchPrices').addEventListener('click', fetchPrices);
document.querySelector('#recalculate').addEventListener('click', () => recalculate());
