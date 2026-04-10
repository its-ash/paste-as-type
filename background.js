const MENU_ID = "paste-as-typing";
const MENU_TITLE = "Paste as Typing";

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
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

  const target = { tabId };
  if (typeof frameId === "number" && frameId >= 0) {
    target.frameIds = [frameId];
  }

  try {
    await chrome.scripting.executeScript({
      target,
      args: [clipboardText, targetElementId],
      func: typeClipboardTextAsHuman
    });
  } catch (error) {
    console.warn("[Smart Paste Typing] Script injection failed:", error);
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

async function typeClipboardTextAsHuman(clipboardTextFromBackground, targetElementId) {
  const MIN_DELAY_MS = 20;
  const MAX_DELAY_MS = 80;

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const randomDelay = () =>
    Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;

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

    for (const char of text) {
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

      await sleep(randomDelay());
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
    for (const char of text) {
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

      await sleep(randomDelay());
    }

    dispatchChangeEvent(el);
    dispatchClickEvent(el);
  };

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

  console.info("[Smart Paste Typing] Typing completed.");
}
