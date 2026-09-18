const DEFAULTS = {
  minDelay: 20,
  maxDelay: 80,
  badgeEnabled: true,
  stopEnabled: true
};

const PRESETS = {
  slow: { minDelay: 60, maxDelay: 160 },
  normal: { minDelay: 20, maxDelay: 80 },
  fast: { minDelay: 5, maxDelay: 25 }
};

const minDelayInput = document.getElementById("minDelay");
const maxDelayInput = document.getElementById("maxDelay");
const minDelayValue = document.getElementById("minDelayValue");
const maxDelayValue = document.getElementById("maxDelayValue");
const badgeEnabledInput = document.getElementById("badgeEnabled");
const stopEnabledInput = document.getElementById("stopEnabled");
const presetButtons = document.querySelectorAll(".preset-btn");
const status = document.getElementById("status");

let statusTimer = null;

function clampDelays(minDelay, maxDelay) {
  const min = Math.max(5, Math.min(400, Number(minDelay) || DEFAULTS.minDelay));
  const max = Math.max(min + 5, Math.min(400, Number(maxDelay) || DEFAULTS.maxDelay));
  return { minDelay: min, maxDelay: max };
}

function updatePresetHighlight(minDelay, maxDelay) {
  const activePreset = Object.entries(PRESETS).find(
    ([, preset]) => preset.minDelay === minDelay && preset.maxDelay === maxDelay
  );
  presetButtons.forEach((button) => {
    button.classList.toggle("active", activePreset && button.dataset.preset === activePreset[0]);
  });
}

function renderValues(minDelay, maxDelay) {
  minDelayValue.textContent = `${minDelay} ms`;
  maxDelayValue.textContent = `${maxDelay} ms`;
  updatePresetHighlight(minDelay, maxDelay);
}

function showSaved() {
  status.textContent = "Saved";
  status.classList.add("show");
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove("show"), 1200);
}

function save(partial) {
  chrome.storage.local.set(partial, showSaved);
}

function loadSettings() {
  chrome.storage.local.get(DEFAULTS, (stored) => {
    const { minDelay, maxDelay } = clampDelays(stored.minDelay, stored.maxDelay);
    minDelayInput.value = String(minDelay);
    maxDelayInput.value = String(maxDelay);
    renderValues(minDelay, maxDelay);
    badgeEnabledInput.checked = Boolean(stored.badgeEnabled);
    stopEnabledInput.checked = Boolean(stored.stopEnabled);
  });
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const preset = PRESETS[button.dataset.preset];
    if (!preset) return;
    minDelayInput.value = String(preset.minDelay);
    maxDelayInput.value = String(preset.maxDelay);
    renderValues(preset.minDelay, preset.maxDelay);
    save(preset);
  });
});

minDelayInput.addEventListener("input", () => {
  const { minDelay, maxDelay } = clampDelays(minDelayInput.value, maxDelayInput.value);
  renderValues(minDelay, maxDelay);
});
minDelayInput.addEventListener("change", () => {
  const { minDelay, maxDelay } = clampDelays(minDelayInput.value, maxDelayInput.value);
  maxDelayInput.value = String(maxDelay);
  save({ minDelay, maxDelay });
});

maxDelayInput.addEventListener("input", () => {
  const { minDelay, maxDelay } = clampDelays(minDelayInput.value, maxDelayInput.value);
  renderValues(minDelay, maxDelay);
});
maxDelayInput.addEventListener("change", () => {
  const { minDelay, maxDelay } = clampDelays(minDelayInput.value, maxDelayInput.value);
  minDelayInput.value = String(minDelay);
  save({ minDelay, maxDelay });
});

badgeEnabledInput.addEventListener("change", () => {
  save({ badgeEnabled: badgeEnabledInput.checked });
});

stopEnabledInput.addEventListener("change", () => {
  save({ stopEnabled: stopEnabledInput.checked });
});

loadSettings();
