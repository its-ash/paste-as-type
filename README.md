# Smart Paste Typing

<p align="center">
	<img src="icons/icon-128.png" alt="Smart Paste Typing logo" width="96" height="96" />
</p>

<p align="center">
	Paste like a human. Not like a bot.<br/>
	Smart Paste Typing inserts clipboard text character-by-character so websites receive real typing-style events.
</p>

<p align="center">
	<a href="https://chromewebstore.google.com/detail/smart-paste-typing/ochdhjlkcfnockclnacbokdiepombjle"><img alt="Download from Chrome Web Store" src="https://img.shields.io/badge/Download-Chrome%20Web%20Store-1A73E8?style=for-the-badge&logo=googlechrome&logoColor=white"></a>
</p>

<p align="center">
	<img alt="Version" src="https://img.shields.io/badge/version-1.1.0-0EA5E9?style=flat-square" />
	<img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-16A34A?style=flat-square" />
	<img alt="Browser" src="https://img.shields.io/badge/browser-Chrome-FBBC05?style=flat-square" />
</p>

## Why Smart Paste Typing?

Some websites ignore normal paste actions or depend on keyboard/input events to validate text. This extension simulates real typing flow to improve compatibility with modern web apps and controlled inputs.

## Core Features

- Types clipboard text one character at a time with randomized delay (`20-80ms`)
- Emits realistic event sequence (`keydown` -> `beforeinput` -> `input` -> `keyup`)
- Works with `input`, `textarea`, and `contenteditable` elements
- Supports React/Vue/Angular style controlled inputs through native value setters
- Automatically dispatches a final `change` event when typing completes
- Includes safe fallbacks for empty clipboard, non-editable targets, and blocked insert paths

## Trigger Options

- Context menu: **Paste as Typing**
- Keyboard shortcut: **Ctrl+Shift+V** (Windows/Linux), **Command+Shift+V** (macOS)
- Toolbar action: click the extension icon

## Install

### Chrome Web Store (Recommended)

Install directly from:
https://chromewebstore.google.com/detail/smart-paste-typing/ochdhjlkcfnockclnacbokdiepombjle

### Developer Mode (Local)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this project folder

## How To Use

1. Copy text to your clipboard
2. Focus or right-click the target editable field
3. Trigger Smart Paste Typing from shortcut, context menu, or toolbar button

## Shortcut Notes

- `Ctrl+P` / `Command+P` is usually reserved by Chrome for Print
- Default shortcut is `Ctrl+Shift+V` / `Command+Shift+V`
- You can customize shortcuts at `chrome://extensions/shortcuts`

## Troubleshooting

- Confirm clipboard contains text
- Ensure cursor is in an editable field
- If shortcut does not fire, set a custom key in `chrome://extensions/shortcuts`
- Reload the extension after local code changes via `chrome://extensions`

## Project Structure

- `manifest.json`
- `background.js`
- `icons/`

## Tech Stack

- Chrome Extension Manifest V3
- Service Worker background script
- Script injection via `chrome.scripting.executeScript`

## License

MIT
