const holdings = [
  { name: 'Arm Holdings', ticker: 'ARM.US', currency: 'USD', shares: 918.8, basePrice: 131.0 },
  { name: 'SoftBank Corp.', ticker: '9434.JP', currency: 'JPY', shares: 19140, basePrice: 219.0 },
  { name: 'T-Mobile US', ticker: 'TMUS.US', currency: 'USD', shares: 28.0, basePrice: 266.0 },
  { name: 'Deutsche Telekom', ticker: 'DTE.DE', currency: 'EUR', shares: 225.0, basePrice: 34.0 },
  { name: 'Alibaba', ticker: 'BABA.US', currency: 'USD', shares: 15.0, basePrice: 132.0 },
];

const els = {
  holdings: document.querySelector('#holdings'), status: document.querySelector('#status'),
  officialDateLabel: document.querySelector('#officialDateLabel'),
  officialNavPerShare: document.querySelector('#officialNavPerShare'),
  officialNavTotal: document.querySelector('#officialNavTotal'),
  officialLtv: document.querySelector('#officialLtv'),
  officialDiscount: document.querySelector('#officialDiscount'),
  liveNavPerShare: document.querySelector('#liveNavPerShare'),
  liveNavTotal: document.querySelector('#liveNavTotal'),
  liveLtv: document.querySelector('#liveLtv'),
  liveDiscount: document.querySelector('#liveDiscount'),
};

const input = id => document.querySelector(`#${id}`);
const yen = value => new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(value);
const pct = value => `${value.toFixed(1)}%`;
const rateFor = currency => currency === 'USD' ? Number(input('usdJpy').value) : currency === 'EUR' ? Number(input('eurJpy').value) : 1;

function renderHoldings() {
  els.holdings.innerHTML = holdings.map((h, i) => `
    <div class="holding">
      <div><h3>${h.name}</h3><div class="meta">${h.ticker} / ${h.currency}</div></div>
      <label>株数（百万）<input data-i="${i}" data-k="shares" type="number" step="0.1" value="${h.shares}"></label>
      <label>基準株価<input data-i="${i}" data-k="basePrice" type="number" step="0.01" value="${h.basePrice}"></label>
      <label>現在株価<input data-i="${i}" data-k="price" type="number" step="0.01" value="${h.price ?? h.basePrice}"></label>
      <label>公式時点価値（十億円）<input data-i="${i}" data-k="baseValue" type="number" readonly value="${holdingValue(h, h.basePrice).toFixed(0)}"></label>
      <label>現状反映価値（十億円）<input data-i="${i}" data-k="value" type="number" readonly value="${holdingValue(h, h.price ?? h.basePrice).toFixed(0)}"></label>
    </div>`).join('');

  els.holdings.querySelectorAll('input:not([readonly])').forEach(el => {
    el.addEventListener('input', event => {
      const { i, k } = event.target.dataset;
      holdings[Number(i)][k] = Number(event.target.value);
      recalculate(false);
    });
  });
}

function holdingValue(h, price) {
  return h.shares * price * rateFor(h.currency) / 1000;
}

function recalculate(rerender = true) {
  const baseNav = Number(input('baseNavPerShare').value) * Number(input('sharesOut').value) / 1000;
  const netDebt = Number(input('netDebt').value);
  const baseListed = holdings.reduce((sum, h) => sum + holdingValue(h, h.basePrice), 0);
  const currentListed = holdings.reduce((sum, h) => sum + holdingValue(h, h.price ?? h.basePrice), 0);
  const otherAssets = baseNav + netDebt - baseListed;
  const officialAssetValue = baseListed + otherAssets;
  const liveAssetValue = currentListed + otherAssets;
  const liveNav = liveAssetValue - netDebt;
  const liveNavPerShare = liveNav * 1000 / Number(input('sharesOut').value);
  const officialLtv = netDebt / officialAssetValue * 100;
  const liveLtv = netDebt / liveAssetValue * 100;
  const officialDiscount = (Number(input('sbgPrice').value) / Number(input('baseNavPerShare').value) - 1) * 100;
  const liveDiscount = (Number(input('sbgPrice').value) / liveNavPerShare - 1) * 100;

  els.officialDateLabel.textContent = input('baseDate').value;
  els.officialNavPerShare.textContent = `${yen(Number(input('baseNavPerShare').value))}円`;
  els.officialNavTotal.textContent = `${(baseNav / 1000).toFixed(1)}兆円`;
  els.officialLtv.textContent = pct(officialLtv);
  els.officialDiscount.textContent = pct(officialDiscount);
  els.liveNavPerShare.textContent = `${yen(liveNavPerShare)}円`;
  els.liveNavTotal.textContent = `${(liveNav / 1000).toFixed(1)}兆円`;
  els.liveLtv.textContent = pct(liveLtv);
  els.liveDiscount.textContent = pct(liveDiscount);
  if (rerender) renderHoldings();
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
  els.status.textContent = '価格を取得中...（取得できない場合は手入力してください）';
  const tasks = holdings.map(async h => {
    try { h.price = await fetchStooq(h.ticker); return `${h.ticker}: OK`; }
    catch { return `${h.ticker}: 手入力`; }
  });
  try {
    const [usd, eur] = await Promise.all([fetchStooq('usdjpy'), fetchStooq('eurjpy')]);
    input('usdJpy').value = usd.toFixed(2);
    input('eurJpy').value = eur.toFixed(2);
  } catch { /* keep manual rates */ }
  const results = await Promise.all(tasks);
  els.status.textContent = `取得完了: ${results.join(' / ')}`;
  recalculate(true);
}

renderHoldings();
recalculate();
document.querySelectorAll('input').forEach(el => el.addEventListener('input', () => recalculate()));
document.querySelector('#fetchPrices').addEventListener('click', fetchPrices);
document.querySelector('#recalculate').addEventListener('click', () => recalculate());
