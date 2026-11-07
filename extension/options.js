import { PRESETS, clampDelays, loadSettings } from "./settings.js";
import { typeClipboard } from "./typer.js";

const SAVED_MS = 1200;
const $ = (id) => document.getElementById(id);
const t = (key, ...subs) => chrome.i18n.getMessage(key, subs.map(String));

const minInput = $("minDelay");
const maxInput = $("maxDelay");
const badgeInput = $("badgeEnabled");
const stopInput = $("stopEnabled");
const presets = document.querySelectorAll("[data-preset]");
const field = $("field");
const runBtn = $("typeRun");
const statusEl = $("practiceStatus");
const toast = $("toast");

let running = false;
let toastTimer;

function localize() {
  document.title = t("name");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nLabel));
  });
  $("version").textContent = t("footerVersion", chrome.runtime.getManifest().version);
}

function showDelays(delays) {
  minInput.value = delays.minDelay;
  maxInput.value = delays.maxDelay;
  $("minDelayValue").textContent = t("delayValue", delays.minDelay);
  $("maxDelayValue").textContent = t("delayValue", delays.maxDelay);
  presets.forEach((btn) => {
    const preset = PRESETS[btn.dataset.preset];
    const active = preset.minDelay === delays.minDelay && preset.maxDelay === delays.maxDelay;
    btn.setAttribute("aria-pressed", String(active));
  });
}

function showSettings(settings) {
  showDelays(settings);
  badgeInput.checked = Boolean(settings.badgeEnabled);
  stopInput.checked = Boolean(settings.stopEnabled);
  syncRunButton();
}

async function save(partial) {
  await chrome.storage.local.set(partial);
  toast.textContent = t("saved");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), SAVED_MS);
}

function bindSettings() {
  presets.forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = PRESETS[btn.dataset.preset];
      showDelays(preset);
      save(preset);
    });
  });

  for (const input of [minInput, maxInput]) {
    input.addEventListener("input", () => showDelays(clampDelays(minInput.value, maxInput.value)));
    input.addEventListener("change", () => save(clampDelays(minInput.value, maxInput.value)));
  }

  badgeInput.addEventListener("change", () => save({ badgeEnabled: badgeInput.checked }));
  stopInput.addEventListener("change", () => {
    syncRunButton();
    save({ stopEnabled: stopInput.checked });
  });

  chrome.storage.onChanged.addListener(async (_, area) => {
    if (area === "local") showSettings(await loadSettings());
  });
}

async function showShortcut() {
  const commands = await chrome.commands.getAll();
  const keys = commands.find((cmd) => cmd.name === "paste-as-typing")?.shortcut;
  $("shortcutKeys").textContent = keys || t("shortcutNone");
}

function showCount() {
  $("charCount").textContent = t("charCount", [...field.value].length);
}

function syncRunButton() {
  runBtn.textContent = t(running && stopInput.checked ? "typeStop" : "typeStart");
  runBtn.disabled = running && !stopInput.checked;
}

const RESULT_STATUS = {
  done: "statusDone",
  blocked: "statusStopped",
  stopped: "statusStopped",
  empty: "statusEmpty",
  error: "statusFailed"
};

async function runPractice() {
  field.focus();
  const settings = await loadSettings();

  if (running) {
    typeClipboard(settings);
    return;
  }

  running = true;
  syncRunButton();
  statusEl.textContent = t("statusTyping");
  const result = await typeClipboard(settings);
  running = false;
  syncRunButton();
  statusEl.textContent = t(RESULT_STATUS[result] ?? "statusStopped");
}

function bindPractice() {
  runBtn.addEventListener("click", runPractice);
  chrome.runtime.onMessage.addListener((msg, _, reply) => {
    if (msg?.source !== "smart-paste-typing" || msg.type !== "trigger") return;
    runPractice();
    reply(true);
  });
  field.addEventListener("input", showCount);

  $("clear").addEventListener("click", () => {
    field.value = "";
    showCount();
    statusEl.textContent = "";
    field.focus();
  });

  $("copySample").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(t("sampleText"));
      statusEl.textContent = t("statusCopied");
    } catch {
      statusEl.textContent = t("statusCopyFailed");
    }
  });

  // A normal link to chrome:// pages is blocked. chrome.tabs.create is allowed.
  $("shortcutChange").addEventListener("click", () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
  });
}

function bindNav() {
  const links = [...document.querySelectorAll(".sidebar a")];
  const mark = (id) => {
    links.forEach((link) => {
      link.setAttribute("aria-current", String(link.hash === `#${id}`));
    });
  };
  mark(location.hash.slice(1) || "start");

  const observer = new IntersectionObserver(
    (entries) => entries.filter((e) => e.isIntersecting).forEach((e) => mark(e.target.id)),
    { rootMargin: "-20% 0px -70% 0px" }
  );
  document.querySelectorAll("main section").forEach((section) => observer.observe(section));
  links.forEach((link) => link.addEventListener("click", () => mark(link.hash.slice(1))));
}

localize();
bindSettings();
bindPractice();
bindNav();
showCount();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) showShortcut();
});
await Promise.all([loadSettings().then(showSettings), showShortcut()]);
document.documentElement.classList.add("ready");
