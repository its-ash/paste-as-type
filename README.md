# Smart Paste Typing

<p align="center">
	<img src="assets/logo.svg" alt="Smart Paste Typing logo" width="96" height="96" />
</p>

<p align="center">
	Paste like a human. Not like a bot.<br/>
	Smart Paste Typing inserts clipboard text one character at a time, so websites receive real typing-style events.
</p>

<p align="center">
	<a href="https://chromewebstore.google.com/detail/smart-paste-typing/ochdhjlkcfnockclnacbokdiepombjle"><img alt="Download from Chrome Web Store" src="https://img.shields.io/badge/Download-Chrome%20Web%20Store-2F6DF6?style=for-the-badge"></a>
</p>

<p align="center">
	<img alt="Version" src="https://img.shields.io/badge/version-3.0.0-2F6DF6?style=flat-square" />
	<img alt="Manifest" src="https://img.shields.io/badge/manifest-v3-12B76A?style=flat-square" />
	<img alt="Browser" src="https://img.shields.io/badge/browser-Chrome%20123%2B-F4483B?style=flat-square" />
</p>

Website: https://paste.itsash.in

## Why Smart Paste Typing?

Some websites ignore normal paste actions or depend on keyboard and input events to validate text. This extension simulates a real typing flow to improve compatibility with modern web apps and controlled inputs.

## Core Features

- Types clipboard text one character at a time with a configurable random delay (`20-80ms` by default)
- Sends a realistic event sequence (`keydown` -> `beforeinput` -> `input` -> `keyup`)
- Works with `input`, `textarea`, and `contenteditable` elements
- Supports React, Vue, and Angular controlled inputs through native value setters
- Sends a final `change` event when typing completes
- Has safe fallbacks for an empty clipboard, non-editable targets, and blocked insert paths
- Live progress badge on the toolbar icon while typing (character count), optional
- Use the shortcut, menu, or icon again while typing to stop, optional

## Extension page

The extension page opens once, after first install. To open it later, right-click the toolbar icon and select **Options**.

- **Get started** - how to use the extension.
- **Shortcut** - your current shortcut and a button that opens `chrome://extensions/shortcuts`.
- **Practice** - a field where you can try the typing.
- **Settings** - typing speed presets, minimum and maximum delay, progress badge, and stop mid-type.

## Trigger Options

- Context menu: **Paste as Typing**
- Keyboard shortcut: **Ctrl+Shift+V** (Windows/Linux), **Command+Shift+V** (macOS)
- Toolbar action: click the extension icon

## Install

### Chrome Web Store (Recommended)

Install directly from:
https://chromewebstore.google.com/detail/smart-paste-typing/ochdhjlkcfnockclnacbokdiepombjle

### Developer Mode (Local)

1. Run `make build`
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the `build/` folder

## How To Use

1. Copy text to your clipboard
2. Focus or right-click the target editable field
3. Start Smart Paste Typing from the shortcut, the context menu, or the toolbar button

## Shortcut Notes

- `Ctrl+P` / `Command+P` is usually reserved by Chrome for Print
- Default shortcut is `Ctrl+Shift+V` / `Command+Shift+V`
- You can customize shortcuts at `chrome://extensions/shortcuts`

## Troubleshooting

- Confirm the clipboard contains text
- Ensure the cursor is in an editable field
- If the shortcut does not fire, set a custom key in `chrome://extensions/shortcuts`
- Run `make build` and reload the extension in `chrome://extensions` after local code changes

## Project Structure

- `extension/` - the extension source. No dependencies and no bundler.
  - `manifest.json` - the only place that holds the version of the extension
  - `background.js` - service worker: triggers, context menu, badge, first-install page
  - `typer.js` - the self-contained typing function that `chrome.scripting` injects
  - `settings.js` - setting defaults, presets, and delay limits
  - `options.html`, `options.css`, `options.js` - the extension page
  - `_locales/en/messages.json` - all visible text
  - `icons/` - generated PNG icons
- `assets/` - logo source, social image, and demo video for the website
- `index.html`, `CNAME` - the GitHub Pages landing page
- `scripts/make-icons.sh` - regenerates all PNGs from `assets/logo.svg`, `assets/og.svg`, and the Chrome Web Store images in `assets/store/`

## Commands

- `make run` - serves the website at http://localhost:8080
- `make build` - writes the unpacked extension to `build/` and the store zip to `dist/smart-paste-typing-<version>.zip`
- `make deploy` - builds, commits, and pushes `main`

## Tech Stack

- Chrome Extension Manifest V3
- Module service worker
- Script injection via `chrome.scripting.executeScript`

## License

MIT

Not affiliated with or endorsed by Google. Chrome is a trademark of Google LLC.
