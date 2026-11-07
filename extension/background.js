import { loadSettings } from "./settings.js";
import { typeClipboard } from "./typer.js";

const MENU_ID = "paste-as-typing";
const BADGE_COLOR = "#1F2933";

function setBadge(tabId, text) {
  chrome.action.setBadgeText({ tabId, text });
  if (text) chrome.action.setBadgeBackgroundColor({ tabId, color: BADGE_COLOR });
}

async function trigger(tabId, frameId) {
  const target = frameId >= 0 ? { tabId, frameIds: [frameId] } : { tabId };
  try {
    await chrome.scripting.executeScript({
      target,
      args: [await loadSettings()],
      func: typeClipboard
    });
  } catch (error) {
    // Chrome does not inject into this extension's own page, so that page types by itself.
    const handled = await chrome.tabs
      .sendMessage(tabId, { source: "smart-paste-typing", type: "trigger" })
      .catch(() => false);
    if (handled) return;
    console.warn("[Smart Paste Typing] Script injection failed:", error);
    setBadge(tabId, "");
  }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: chrome.i18n.getMessage("menuTitle"),
      contexts: ["editable"]
    });
  });
  if (reason === "install") chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender.tab?.id;
  if (msg?.source !== "smart-paste-typing" || typeof tabId !== "number") return;
  if (msg.type === "progress") setBadge(tabId, String(msg.current));
  else setBadge(tabId, "");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID && tab?.id) trigger(tab.id, info.frameId);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== MENU_ID) return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab?.id) trigger(tab.id);
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) trigger(tab.id);
});
