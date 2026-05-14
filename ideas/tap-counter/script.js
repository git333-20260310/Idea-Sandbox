const STORAGE_KEY = "tap-counter-value";

const countEl = document.getElementById("count");
const tapButton = document.getElementById("tapButton");
const resetButton = document.getElementById("resetButton");

let count = Number(localStorage.getItem(STORAGE_KEY)) || 0;

const render = () => {
  countEl.textContent = String(count);
};

const save = () => {
  localStorage.setItem(STORAGE_KEY, String(count));
};

tapButton.addEventListener("click", () => {
  count += 1;
  render();
  save();
});

resetButton.addEventListener("click", () => {
  count = 0;
  render();
  save();
});

render();
