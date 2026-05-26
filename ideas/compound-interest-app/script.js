const STORAGE_KEY = 'compound-interest-settings-v1';

const form = document.getElementById('calculator-form');
const principalInput = document.getElementById('principal');
const monthlyContributionInput = document.getElementById('monthlyContribution');
const annualRateInput = document.getElementById('annualRate');
const yearsInput = document.getElementById('years');
const compoundFrequencyInput = document.getElementById('compoundFrequency');
const contributionTimingInput = document.getElementById('contributionTiming');
const resetButton = document.getElementById('reset-button');

const futureValueEl = document.getElementById('futureValue');
const totalContributionsEl = document.getElementById('totalContributions');
const totalInterestEl = document.getElementById('totalInterest');
const yearlyRows = document.getElementById('yearlyRows');

const defaultState = {
  principal: 100000,
  monthlyContribution: 30000,
  annualRate: 5,
  years: 20,
  compoundFrequency: 12,
  contributionTiming: 'end'
};

function formatYen(value) {
  return `${Math.round(value).toLocaleString('ja-JP')} 円`;
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState;

  try {
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

function setFormValues(state) {
  principalInput.value = state.principal;
  monthlyContributionInput.value = state.monthlyContribution;
  annualRateInput.value = state.annualRate;
  yearsInput.value = state.years;
  compoundFrequencyInput.value = state.compoundFrequency;
  contributionTimingInput.value = state.contributionTiming;
}

function getFormValues() {
  return {
    principal: Number(principalInput.value),
    monthlyContribution: Number(monthlyContributionInput.value),
    annualRate: Number(annualRateInput.value),
    years: Number(yearsInput.value),
    compoundFrequency: Number(compoundFrequencyInput.value),
    contributionTiming: contributionTimingInput.value
  };
}

function calculateYearlyBalances(settings) {
  const monthlyRate = settings.annualRate / 100 / 12;
  const months = settings.years * 12;

  let balance = settings.principal;
  const rows = [];

  for (let month = 1; month <= months; month += 1) {
    if (settings.contributionTiming === 'beginning') {
      balance += settings.monthlyContribution;
    }

    balance *= (1 + monthlyRate);

    if (settings.contributionTiming === 'end') {
      balance += settings.monthlyContribution;
    }

    if (month % 12 === 0) {
      rows.push({
        year: month / 12,
        balance
      });
    }
  }

  return rows;
}

function render(settings) {
  const yearly = calculateYearlyBalances(settings);
  const futureValue = yearly[yearly.length - 1].balance;
  const totalContributions = settings.principal + settings.monthlyContribution * settings.years * 12;
  const totalInterest = futureValue - totalContributions;

  futureValueEl.textContent = formatYen(futureValue);
  totalContributionsEl.textContent = formatYen(totalContributions);
  totalInterestEl.textContent = formatYen(totalInterest);

  yearlyRows.innerHTML = '';
  yearly.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.year}年目</td><td>${formatYen(row.balance)}</td>`;
    yearlyRows.appendChild(tr);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = getFormValues();
  saveState(values);
  render(values);
});

resetButton.addEventListener('click', () => {
  saveState(defaultState);
  setFormValues(defaultState);
  render(defaultState);
});

const initialState = loadState();
setFormValues(initialState);
render(initialState);
