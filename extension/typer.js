// chrome.scripting serializes this function with toString(), so it must not
// use anything from module scope. The options page also calls it directly.
export async function typeClipboard(settings) {
  const LOG = "[Smart Paste Typing]";
  const minDelay = Number.isFinite(settings?.minDelay) ? settings.minDelay : 20;
  const maxDelay = Number.isFinite(settings?.maxDelay) ? settings.maxDelay : 80;
  const showBadge = settings?.badgeEnabled !== false;
  const canStop = settings?.stopEnabled !== false;
  const CE_SELECTOR =
    "[contenteditable=''], [contenteditable='true'], [contenteditable]:not([contenteditable='false'])";
  const FIELD_SELECTOR = `input, textarea, ${CE_SELECTOR}`;
  const BLOCKED_TYPES = new Set([
    "button",
    "checkbox",
    "color",
    "file",
    "hidden",
    "image",
    "radio",
    "range",
    "reset",
    "submit"
  ]);

  const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
  const nextDelay = () => Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

  const report = (msg) => {
    try {
      chrome.runtime.sendMessage({ source: "smart-paste-typing", ...msg }).catch(() => {});
    } catch {
      // The extension can reload while a run is active.
    }
  };

  // Each trigger bumps a run id. An active loop stops when a newer run exists.
  window.__smartPasteRunId = (window.__smartPasteRunId || 0) + 1;
  const runId = window.__smartPasteRunId;
  const isCurrentRun = () => window.__smartPasteRunId === runId;

  if (canStop && window.__smartPasteRunActive) {
    window.__smartPasteRunActive = false;
    report({ type: "stopped" });
    return "stopped";
  }
  window.__smartPasteRunActive = true;

  const isTextControl = (el) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

  const isEditable = (el) => {
    if (!el) return false;
    if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly;
    if (el instanceof HTMLInputElement) {
      return !BLOCKED_TYPES.has((el.type || "text").toLowerCase()) && !el.disabled && !el.readOnly;
    }
    return Boolean(el.isContentEditable) && el.getAttribute("contenteditable") !== "false";
  };

  const trackInteractions = () => {
    if (window.__smartPasteTrackerInstalled) return;
    window.__smartPasteTrackerInstalled = true;
    window.__smartPasteLastEditable = null;

    const remember = ({ target }) => {
      if (!(target instanceof Element)) return;
      const host = target.closest(FIELD_SELECTOR);
      if (isEditable(host)) window.__smartPasteLastEditable = host;
    };
    for (const type of ["focusin", "pointerdown", "contextmenu"]) {
      document.addEventListener(type, remember, true);
    }
  };

  const findFocused = () => {
    if (isEditable(document.activeElement)) return document.activeElement;
    const node = window.getSelection()?.anchorNode;
    const el = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
    const host = el?.closest(CE_SELECTOR);
    return isEditable(host) ? host : null;
  };

  const fieldsIn = (state) =>
    FIELD_SELECTOR.split(", ")
      .map((part) => `${part}:${state}`)
      .join(", ");

  const findPressed = () => {
    const el = document.querySelector(fieldsIn("active"));
    return isEditable(el) ? el : null;
  };

  const findTracked = () =>
    isEditable(window.__smartPasteLastEditable) ? window.__smartPasteLastEditable : null;

  const findHovered = () =>
    [...document.querySelectorAll(fieldsIn("hover"))].reverse().find(isEditable) ?? null;

  const fireKey = (el, type, char) =>
    el.dispatchEvent(
      new KeyboardEvent(type, {
        key: char === "\n" ? "Enter" : char,
        bubbles: true,
        cancelable: true,
        composed: true
      })
    );

  const fireInput = (el, type, data) =>
    el.dispatchEvent(
      new InputEvent(type, {
        data,
        inputType: "insertText",
        bubbles: true,
        cancelable: type === "beforeinput",
        composed: true
      })
    );

  const fireChange = (el) => el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));

  const fireClick = (el) =>
    el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, composed: true }));

  const nativeInsert = (char) => {
    try {
      return document.execCommand("insertText", false, char);
    } catch {
      return false;
    }
  };

  // The prototype setter makes React, Vue, and Angular fields detect the change.
  const setValue = (el, value) => {
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
    Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, value);
  };

  const insertIntoControl = (el, char) => {
    const before = el.value;
    if (nativeInsert(char) && el.value !== before) return;

    // Email and number inputs have a null selection and reject setSelectionRange.
    const hasCaret = typeof el.selectionStart === "number";
    const start = hasCaret ? el.selectionStart : el.value.length;
    const end = hasCaret ? el.selectionEnd : start;
    setValue(el, el.value.slice(0, start) + char + el.value.slice(end));
    if (hasCaret) el.setSelectionRange(start + char.length, start + char.length);
    fireInput(el, "input", char);
  };

  const insertIntoEditable = (el, char) => {
    if (nativeInsert(char)) return;

    const selection = window.getSelection();
    if (!selection) return;
    if (!selection.rangeCount || !el.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = char === "\n" ? document.createElement("br") : document.createTextNode(char);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    fireInput(el, "input", char);
  };

  const typeChars = async (el, text, insert, isBlocked) => {
    let count = 0;
    for (const char of text) {
      if (canStop && !isCurrentRun()) return "stopped";
      if (isBlocked(el)) {
        console.warn(LOG, "Target became read-only or disabled. Stopping.");
        return "blocked";
      }
      fireKey(el, "keydown", char);
      fireInput(el, "beforeinput", char);
      if (document.activeElement !== el) el.focus();
      insert(el, char);
      fireKey(el, "keyup", char);

      count += 1;
      if (showBadge) report({ type: "progress", current: count, total: text.length });
      await sleep(nextDelay());
    }
    return "done";
  };

  try {
    const raw = await navigator.clipboard.readText().catch(() => "");
    const text = raw.replace(/\r\n/g, "\n");
    if (!text) {
      console.info(LOG, "Clipboard is empty. Nothing to type.");
      return "empty";
    }

    trackInteractions();
    const target = findFocused() || findPressed() || findTracked() || findHovered();
    if (!target) {
      console.warn(LOG, "No focused editable element found.");
      return "no-target";
    }
    target.focus();

    const isControl = isTextControl(target);
    const initial = isControl ? target.value : "";
    const result = isControl
      ? await typeChars(target, text, insertIntoControl, (el) => el.disabled || el.readOnly)
      : await typeChars(target, text, insertIntoEditable, () => false);

    // Last resort for pages that drop per-character updates.
    if (result === "done" && isControl && target.value === initial) {
      setValue(target, text);
      fireInput(target, "input", text);
    }
    fireChange(target);
    if (result === "done") fireClick(target);

    if (isCurrentRun()) report({ type: "done" });
    return result;
  } catch (error) {
    console.warn(LOG, "Typing failed:", error);
    report({ type: "error" });
    return "error";
  } finally {
    if (isCurrentRun()) window.__smartPasteRunActive = false;
  }
}
