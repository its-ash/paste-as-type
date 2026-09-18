# Hyperframes Composition Brief: Smart Paste Typing

## Objective
Create a short install-and-use tutorial video for Smart Paste Typing, a Chrome extension.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `/Users/ashvinijangid/Desktop/Project/past-as-type`
- Primary files read: `index.html`, `background.js`, `manifest.json`, `README.md`, `desc.txt`
- Product name: Smart Paste Typing
- Tagline / strongest claim: "Paste like a human. Not like a bot."
- Key UI or visual moment to recreate: the hero demo card from `index.html` — a mock browser window (traffic-light dots) with an "Invite code" field where text types itself in character by character, blinking caret, status pulse, ending on a success state.
- Copy that must appear verbatim:
  - "Some forms don't take paste."
  - "Paste like a human. Not like a bot."
  - "Add to Chrome — it's free"
  - "Typing character by character…" / "Typed successfully"
  - Trigger labels: "Right-click", "Shortcut", "Toolbar"

## Creative Direction
- Tone preset: app-store
- Creative direction: quick, clean product tutorial — install, trigger, watch it type. Corporate-but-not-boring, dev-tool credible.
- Interpretation: confident, uncluttered pacing; clean feature-card reveals; slide/wipe transitions; no jokes for their own sake, clarity and speed carry the energy.
- Angle: the "trick" is the demo itself — showing real character-by-character typing is both the explanation and the hook.
- Hook: a form field rejects a paste attempt (shake + blocked cue), then "Some forms don't take paste."
- Outro / punchline: extension icon + wordmark + tagline "Paste like a human. Not like a bot." + "Add to Chrome — it's free" CTA.
- Avoid:
  - Generic SaaS language ("streamline," "seamless," etc.)
  - Abstract filler visuals unrelated to the actual product
  - Unrelated visual redesign of the product's established look

## Visual Identity
- Background: `#0b0d10` (off-black)
- Surface: `#15181d`, border `rgba(255,255,255,0.08)`
- Text: `#edeef0` primary, `#9aa1ab` dim, `#6b7280` faint
- Accent: gradient `#38bdf8` → `#2563eb` (sky blue to blue)
- Display font: Geist (fallback: Inter, system sans-serif)
- Body/mono font: Geist Mono (fallback: ui-monospace, SF Mono, Menlo)
- Visual references from the project: hero demo card (mock browser chrome, field, caret, status pulse) and the extension icon (rounded-square gradient mark) from `icons/icon-128.png` / `icons/logo.svg`, both in the project root.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The problem — 3s — a paste attempt gets blocked/shakes on a form field; text "Some forms don't take paste." appears.
2. Install — 4s — Chrome Web Store card, cursor clicks "Add to Chrome," button settles to "Added ✓."
3. Trigger it your way — 5s — three feature cards arrive one by one: right-click menu, keyboard shortcut chip, toolbar icon.
4. Watch it type — 6s — centerpiece: the hero demo card typing "WELCOME-2K9F-XQ7Z" character by character with caret and status pulse, ending on "Typed successfully."
5. Outro — 3s — extension icon, wordmark, tagline, CTA.

## Audio
- Audio role: sparse professional accents over a light, low corporate/tech bed.
- Audio arc: bed fades in low under scene 1, holds steady, small lift into the scene 4 centerpiece, fades out gently under the scene 5 outro card.
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (120.19 BPM, bundled cue preset available).
- Music treatment: low volume throughout (never competes with on-screen text), fade in over first ~1s, fade out over the last ~1.5s under the outro.
- Music cue guidance: bundled preset at `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md` (also copy the `.json`). Strong cues at 16.02s/17.02s land near the planned "Typed successfully" success moment (~16.5s) — nudge that reveal within ±0.15s of the nearest strong cue if it doesn't hurt readability. No dense beat-grid sequencing is required; the 3 trigger cards in scene 3 may optionally snap to the beat grid (beats listed at ~3.02s intervals starting 3.02s) if convenient, but natural readable timing takes priority.
- Audio-reactive treatment: none — keep visuals deterministic and readable, not music-driven.
- Audio-coupled moments:
  - Scene 1 hook shake — soft negative/blocked tick (candidate: `assets/sfx/interface/error_006.ogg`, used restrained/low).
  - Scene 2 install click — light UI click (candidate: `assets/sfx/interface/click_002.ogg`), tiny confirm tick on "Added" (candidate: `assets/sfx/interface/select_008.ogg`).
  - Scene 3 card arrivals — three quick soft arrival ticks, one per card (candidates: `assets/sfx/interface/drop_001.ogg`, `drop_002.ogg`, `drop_003.ogg`).
  - Scene 4 typing centerpiece — soft, low, textural key-tick bed under the character reveals (candidates: `assets/sfx/keyboard/keypress-001.wav`, `-004.wav`, `-007.wav`, `-010.wav`, `-013.wav`, randomized across the set at low volume so it reads as texture, not literal per-letter clacks), then a restrained success cue on "Typed successfully" (candidate: `assets/sfx/impact/impactSoft_medium_000.ogg`, or `assets/sfx/impact/impactBell_heavy_003.ogg` if a slightly bigger resolve fits better near the 16-17s strong cues).
  - Scene 5 outro — no new SFX; let music resolve/fade.
- SFX selection guidance: keep everything sparse and motion-matched; the typing texture must stay low and soft, not a loud literal keyboard clack per character. Prefer the lowest high-frequency-risk option in each candidate group for repeated/polished moments (see `sfx-analysis.md`).
- SFX analysis guidance: read `sfx-analysis.md` / `.json` from the Hyperframes/brag skill assets (bundled alongside the sfx library) before finalizing exact files and volumes.
- Exact SFX choice: Hyperframes should pick final filenames, timestamps, density, and volume based on the implemented animation timing — candidates above are guidance, not a fixed cue sheet.
- Audio files: music and all candidate SFX are already copied into `brag-output/composition/assets/` (see `assets/music/`, `assets/sfx/interface/`, `assets/sfx/impact/`, `assets/sfx/keyboard/`). Remove any candidates Hyperframes doesn't end up using.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core` (composition contract + `data-*` timing), `hyperframes-animation` (motion), `hyperframes-creative` (design spec, beats, audio-reactive), `hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli` (lint/check/render). `/brag` is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project (the hero demo card and the extension icon are required; verbatim copy lines above must appear as written).
- Keep all text readable in the final render — respect the reading-time floors from the brag plan (short labels ~0.8s settled, sentences ~0.3s/word).
- Keep the video within 15–25 seconds (target 21s).
- Include the planned music/SFX layer as described above.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet — choose exact SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints; ignore cues that hurt readability, scene pacing, or the product story.
- Use only 1–3 strong cue locks in this 21s video (the scene 4 success moment is the natural candidate).
- Honor the planned fade-in/fade-out and low-volume-under-text posture for the music bed.
- Use local assets already copied into `brag-output/composition/assets/` for all audio.
- Run `hyperframes check` before render — it is brag's single gate.
