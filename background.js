const MENU_ID = "paste-as-typing";
const MENU_TITLE = "Paste as Typing";

const DEFAULT_SETTINGS = {
  minDelay: 20,
  maxDelay: 80,
  badgeEnabled: true,
  stopEnabled: true
};

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_SETTINGS, resolve);
  });
}

function setBadge(tabId, text, color) {
  if (typeof tabId !== "number") {
    return;
  }
  chrome.action.setBadgeText({ tabId, text: text || "" });
  if (text && color) {
    chrome.action.setBadgeBackgroundColor({ tabId, color });
  }
}

// Progress/completion messages from the injected page script, keyed by tab.
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.source !== "smart-paste-typing") {
    return;
  }
  const tabId = sender?.tab?.id;
  if (typeof tabId !== "number") {
    return;
  }

  if (message.type === "progress") {
    setBadge(tabId, String(message.current), "#2563eb");
  } else if (message.type === "done" || message.type === "stopped" || message.type === "error") {
    setBadge(tabId, "");
  }
});

function createContextMenu() {
  chrome.contextMenus.create(
    {
      id: MENU_ID,
      title: MENU_TITLE,
      contexts: ["editable"]
    },
    () => {
      if (!chrome.runtime.lastError) {
        return;
      }

      // Ignore duplicate-id noise across extension reload/service-worker restarts.
      if (!chrome.runtime.lastError.message?.includes("duplicate id")) {
        console.warn(
          "[Smart Paste Typing] Failed to create context menu:",
          chrome.runtime.lastError.message
        );
      }
    }
  );
}

async function triggerPasteAsTyping(tabId, frameId = null, targetElementId = null) {
  let clipboardText = null;
  try {
    if (navigator.clipboard?.readText) {
      clipboardText = await navigator.clipboard.readText();
    }
  } catch (error) {
    console.warn("[Smart Paste Typing] Background clipboard read failed:", error);
  }

  const settings = await getSettings();

  const target = { tabId };
  if (typeof frameId === "number" && frameId >= 0) {
    target.frameIds = [frameId];
  }

  try {
    await chrome.scripting.executeScript({
      target,
      args: [clipboardText, targetElementId, settings],
      func: typeClipboardTextAsHuman
    });
  } catch (error) {
    console.warn("[Smart Paste Typing] Script injection failed:", error);
    setBadge(tabId, "");
  }
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) {
    return;
  }

  await triggerPasteAsTyping(tab.id, info.frameId ?? null, info.targetElementId ?? null);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== MENU_ID) {
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab?.id) {
    return;
  }

  await triggerPasteAsTyping(tab.id);
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) {
    return;
  }

  await triggerPasteAsTyping(tab.id);
});

async function typeClipboardTextAsHuman(clipboardTextFromBackground, targetElementId, settings) {
  const resolvedSettings = settings || {};
  const MIN_DELAY_MS = Number.isFinite(resolvedSettings.minDelay) ? resolvedSettings.minDelay : 20;
  const MAX_DELAY_MS = Number.isFinite(resolvedSettings.maxDelay) ? resolvedSettings.maxDelay : 80;
  const BADGE_ENABLED = resolvedSettings.badgeEnabled !== false;
  const STOP_ENABLED = resolvedSettings.stopEnabled !== false;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomDelay = () =>
    Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;

  const reportToBackground = (message) => {
    try {
      chrome.runtime.sendMessage({ source: "smart-paste-typing", ...message });
    } catch (error) {
      // Extension context may be gone (e.g. reload mid-type); ignore silently.
    }
  };

  // Stop mid-run: every trigger bumps a shared run id on window. The active
  // typing loop checks it before each character and aborts cleanly if a
  // newer run has started (i.e. the user re-triggered to cancel/replace).
  window.__smartPasteRunId = (window.__smartPasteRunId || 0) + 1;
  const runId = window.__smartPasteRunId;
  const isCurrentRun = () => window.__smartPasteRunId === runId;

  if (STOP_ENABLED && runId > 1 && window.__smartPasteRunActive) {
    // A run was already in flight; this trigger's job is only to cancel it.
    window.__smartPasteRunActive = false;
    reportToBackground({ type: "stopped" });
    return;
  }
  window.__smartPasteRunActive = true;

  const isTextControl = (el) =>
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;

  const isEditableElement = (el) => {
    if (!el) {
      return false;
    }

    if (el instanceof HTMLTextAreaElement) {
      return !el.disabled && !el.readOnly;
    }

    if (el instanceof HTMLInputElement) {
      const type = (el.type || "text").toLowerCase();
      const blockedTypes = new Set([
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

      return !blockedTypes.has(type) && !el.disabled && !el.readOnly;
    }

    if (el.isContentEditable) {
      const ceAttr = el.getAttribute("contenteditable");
      return ceAttr !== "false";
    }

    return false;
  };

  const installInteractionTracker = () => {
    if (window.__smartPasteTrackerInstalled) {
      return;
    }
    window.__smartPasteTrackerInstalled = true;
    window.__smartPasteLastEditable = null;

    const remember = (candidate) => {
      if (!(candidate instanceof Element)) {
        return;
      }
      const host = candidate.closest(
        "input, textarea, [contenteditable=''], [contenteditable='true'], [contenteditable]:not([contenteditable='false'])"
      );
      if (isEditableElement(host)) {
        window.__smartPasteLastEditable = host;
      }
    };

    document.addEventListener(
      "focusin",
      (event) => {
        remember(event.target);
      },
      true
    );
    document.addEventListener(
      "pointerdown",
      (event) => {
        remember(event.target);
      },
      true
    );
    document.addEventListener(
      "contextmenu",
      (event) => {
        remember(event.target);
      },
      true
    );
  };

  const findFocusedEditable = () => {
    const active = document.activeElement;
    if (isEditableElement(active)) {
      return active;
    }

    // Fallback for cases where selection is inside contenteditable host.
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const maybeElement =
      node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement ?? null;

    if (!maybeElement) {
      return null;
    }

    const host = maybeElement.closest(
      "[contenteditable=''], [contenteditable='true'], [contenteditable]:not([contenteditable='false'])"
    );

    return isEditableElement(host) ? host : null;
  };

  const findActivePseudoFocusedEditable = () => {
    const activeLike = document.querySelector(
      "textarea:active, input:active, [contenteditable='']:active, [contenteditable='true']:active, [contenteditable]:not([contenteditable='false']):active"
    );
    return isEditableElement(activeLike) ? activeLike : null;
  };

  const findClickedEditable = () => {
    if (
      typeof targetElementId === "number" &&
      typeof chrome !== "undefined" &&
      chrome.contextMenus?.getTargetElement
    ) {
      const clicked = chrome.contextMenus.getTargetElement(targetElementId);
      if (isEditableElement(clicked)) {
        return clicked;
      }

      if (clicked instanceof Element) {
        const host = clicked.closest(
          "input, textarea, [contenteditable=''], [contenteditable='true'], [contenteditable]:not([contenteditable='false'])"
        );
        if (isEditableElement(host)) {
          return host;
        }
      }
    }

    return null;
  };

  const findHoveredEditable = () => {
    const hovered = Array.from(
      document.querySelectorAll(
        "textarea:hover, input:hover, [contenteditable='']:hover, [contenteditable='true']:hover, [contenteditable]:not([contenteditable='false']):hover"
      )
    );

    for (let i = hovered.length - 1; i >= 0; i -= 1) {
      const candidate = hovered[i];
      if (isEditableElement(candidate)) {
        return candidate;
      }
    }

    return null;
  };

  const findTrackedEditable = () => {
    return isEditableElement(window.__smartPasteLastEditable)
      ? window.__smartPasteLastEditable
      : null;
  };

  const dispatchKeyEvent = (target, type, char) => {
    const key = char === "\n" ? "Enter" : char;
    const event = new KeyboardEvent(type, {
      key,
      bubbles: true,
      cancelable: true,
      composed: true
    });
    target.dispatchEvent(event);
  };

  const dispatchInputEvent = (target, char) => {
    let inputEvent;
    try {
      inputEvent = new InputEvent("input", {
        data: char,
        inputType: "insertText",
        bubbles: true,
        cancelable: false,
        composed: true
      });
    } catch {
      inputEvent = new Event("input", { bubbles: true, composed: true });
    }
    target.dispatchEvent(inputEvent);
  };

  const dispatchBeforeInputEvent = (target, char) => {
    let beforeInputEvent;
    try {
      beforeInputEvent = new InputEvent("beforeinput", {
        data: char,
        inputType: "insertText",
        bubbles: true,
        cancelable: true,
        composed: true
      });
    } catch {
      beforeInputEvent = new Event("beforeinput", {
        bubbles: true,
        cancelable: true,
        composed: true
      });
    }
    target.dispatchEvent(beforeInputEvent);
  };

  const dispatchChangeEvent = (target) => {
    target.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  const dispatchClickEvent = (target) => {
    target.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        composed: true
      })
    );
  };

  const tryNativeInsert = (char) => {
    if (typeof document.execCommand !== "function") {
      return false;
    }

    try {
      return document.execCommand("insertText", false, char);
    } catch {
      return false;
    }
  };

  const getNativeValueSetter = (el) => {
    if (el instanceof HTMLTextAreaElement) {
      return Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")
        ?.set;
    }

    if (el instanceof HTMLInputElement) {
      return Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    }

    return null;
  };

  const typeIntoTextControl = async (el, text) => {
    // Use native setter so React/Vue/Angular controlled fields detect updates.
    const nativeSetter = getNativeValueSetter(el);
    const initialValue = el.value;
    let typedCount = 0;
    let stopped = false;

    for (const char of text) {
      if (STOP_ENABLED && !isCurrentRun()) {
        stopped = true;
        break;
      }

      if (el.disabled || el.readOnly) {
        console.warn("[Smart Paste Typing] Target became readonly/disabled. Stopping.");
        break;
      }

      dispatchKeyEvent(el, "keydown", char);
      dispatchBeforeInputEvent(el, char);
      let inserted = false;

      // First try native insertion path (better compatibility with complex pages).
      if (document.activeElement !== el) {
        el.focus();
      }
      const beforeValue = el.value;
      inserted = tryNativeInsert(char);
      const didChangeNatively = el.value !== beforeValue;

      if (!inserted || !didChangeNatively) {
        const start =
          typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
        const end = typeof el.selectionEnd === "number" ? el.selectionEnd : start;
        const nextValue = el.value.slice(0, start) + char + el.value.slice(end);

        if (nativeSetter) {
          nativeSetter.call(el, nextValue);
        } else {
          el.value = nextValue;
        }

        const nextCaret = start + char.length;
        if (typeof el.setSelectionRange === "function") {
          el.setSelectionRange(nextCaret, nextCaret);
        }

        dispatchInputEvent(el, char);
      }

      dispatchKeyEvent(el, "keyup", char);

      typedCount += 1;
      if (BADGE_ENABLED) {
        reportToBackground({ type: "progress", current: typedCount, total: text.length });
      }

      await sleep(randomDelay());
    }

    if (stopped) {
      dispatchChangeEvent(el);
      return;
    }

    // Final fallback for sites that ignore synthetic per-character events.
    if (text && el.value === initialValue) {
      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      dispatchInputEvent(el, text);
    }

    dispatchChangeEvent(el);
    dispatchClickEvent(el);
  };

  const ensureSelectionInside = (root) => {
    const selection = window.getSelection();

    if (!selection) {
      return null;
    }

    if (!selection.rangeCount || !root.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(root);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    return selection;
  };

  const insertCharIntoContentEditable = (root, char) => {
    const selection = ensureSelectionInside(root);
    if (!selection || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    let insertedNode;
    if (char === "\n") {
      insertedNode = document.createElement("br");
      range.insertNode(insertedNode);
    } else {
      insertedNode = document.createTextNode(char);
      range.insertNode(insertedNode);
    }

    range.setStartAfter(insertedNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const typeIntoContentEditable = async (el, text) => {
    let typedCount = 0;
    let stopped = false;

    for (const char of text) {
      if (STOP_ENABLED && !isCurrentRun()) {
        stopped = true;
        break;
      }

      dispatchKeyEvent(el, "keydown", char);
      dispatchBeforeInputEvent(el, char);
      let inserted = false;
      if (document.activeElement !== el) {
        el.focus();
      }
      inserted = tryNativeInsert(char);

      if (!inserted) {
        insertCharIntoContentEditable(el, char);
        dispatchInputEvent(el, char);
      }
      dispatchKeyEvent(el, "keyup", char);

      typedCount += 1;
      if (BADGE_ENABLED) {
        reportToBackground({ type: "progress", current: typedCount, total: text.length });
      }

      await sleep(randomDelay());
    }

    dispatchChangeEvent(el);
    if (!stopped) {
      dispatchClickEvent(el);
    }
  };

  try {
    const clipboardTextRaw =
      typeof clipboardTextFromBackground === "string"
        ? clipboardTextFromBackground
        : await navigator.clipboard.readText().catch(() => "");
    const clipboardText = clipboardTextRaw.replace(/\r\n/g, "\n");

    if (!clipboardText) {
      console.info("[Smart Paste Typing] Clipboard is empty. Nothing to type.");
      return;
    }

    installInteractionTracker();
    const target =
      findClickedEditable() ||
      findFocusedEditable() ||
      findActivePseudoFocusedEditable() ||
      findTrackedEditable() ||
      findHoveredEditable();

    if (!target) {
      console.warn("[Smart Paste Typing] No focused editable element found.");
      return;
    }

    if (!isEditableElement(target)) {
      console.warn("[Smart Paste Typing] Focused element is not editable.");
      return;
    }

    target.focus();

    console.info(
      `[Smart Paste Typing] Typing ${clipboardText.length} characters into`,
      target
    );

    if (isTextControl(target)) {
      await typeIntoTextControl(target, clipboardText);
    } else if (target.isContentEditable) {
      await typeIntoContentEditable(target, clipboardText);
    }

    if (isCurrentRun()) {
      console.info("[Smart Paste Typing] Typing completed.");
      reportToBackground({ type: "done" });
    }
  } catch (error) {
    console.warn("[Smart Paste Typing] Typing failed:", error);
    reportToBackground({ type: "error" });
  } finally {
    if (isCurrentRun()) {
      window.__smartPasteRunActive = false;
    }
  }
}
