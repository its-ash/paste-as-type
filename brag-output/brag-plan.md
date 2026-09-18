# Brag Plan: Smart Paste Typing

## What is this app?
A Chrome extension that turns clipboard text into real, character-by-character keystrokes, so forms and fields that block plain paste still accept the text.

## The angle
This is an install-and-use tutorial, not a joke reel — the "trick" IS the demo: watch text type itself into a field, letter by letter, exactly like the extension does in production. The video's job is to make someone install it in the next 10 seconds by showing, plainly, how easy setup and triggering are.

## Hook (first 2-3 seconds)
A field that visibly rejects a paste attempt — cursor drags in, a paste icon/keystroke flashes "blocked" with a small shake — immediately followed by the app icon and the line "Some forms don't take paste." This establishes the problem before the product appears.

## Key moments (the middle)
- **Install**: Chrome Web Store card → "Add to Chrome" click → button becomes "Added" with a check, one clean beat.
- **Trigger it 3 ways**: right-click context menu showing "Paste as Typing," the keyboard shortcut chip (⌘⇧V / Ctrl⇧V), and the toolbar icon — presented as three quick feature-card beats, not a list.
- **Watch it type**: the centerpiece — a mock signup field where "WELCOME-2K9F-XQ7Z" types itself in character-by-character with a live caret and a "Typing character by character…" status pulse, ending on a green "Typed successfully" state.

## Outro / punchline
Field fills, checkmark settles, cut to the extension icon + wordmark with the line "Paste like a human. Not like a bot." then the Chrome Web Store CTA.

## User flow worth showing
Entry → key action → result:
1. **Entry**: Open Chrome Web Store, click "Add to Chrome."
2. **Key action**: Focus a form field, trigger via shortcut/right-click/toolbar.
3. **Result**: Text appears via simulated typing, field fills, change event fires, success state shown.

## Tone
- Preset: app-store
- Creative direction: quick, clean product tutorial — install, trigger, watch it type. Corporate-but-not-boring, dev-tool credible.
- Interpretation: Confident, uncluttered pacing with clean feature-card reveals and slide/wipe transitions. No jokes for their own sake — clarity and speed carry the energy. Matches the existing dark, sky-blue product page identity from `index.html`.

## Format: landscape — 1920x1080
## Duration: 21s

## Visual identity (from the project)
- Background: `#0b0d10` (near-black, off-black per design system in index.html)
- Surface: `#15181d`, border `rgba(255,255,255,0.08)`
- Accent: `#38bdf8` → `#2563eb` gradient (sky blue to blue, matches extension icon)
- Text: `#edeef0` primary, `#9aa1ab` dim, `#6b7280` faint
- Display font: Geist (fallback Inter / system sans)
- Body/mono font: Geist Mono (fallback ui-monospace)
- Strongest visual element: the hero demo card from `index.html` — mock browser chrome (red/yellow/green dots), a field, and text typing itself in with a blinking caret and status pulse.

## Share copy (draft)
Some forms don't let you paste. Smart Paste Typing doesn't ask — it types. Install in 10 seconds, trigger with ⌘⇧V anywhere.

## Audio direction
- Role: sparse professional accents over a light, low corporate/tech bed — instructional clarity stays primary, music never competes with on-screen text.
- Music: warm, minimal tech-corporate bed, moderate-low tempo, no aggressive drops.
- Music treatment: starts at scene 1 under the hook at low volume, holds steady through the middle, small lift into the typing centerpiece, gentle fade-out under the outro logo card.
- Music cue guidance: to be detected at composition time (no bundled preset assumed). Target one soft accent at the "Add to Chrome" click (~3.5s in) and one at the moment typing completes/success state (~16.5s in). No dense beat-grid sequencing needed — this video has few simultaneous reveals.
- Audio-reactive treatment: none — keep visuals deterministic and readable, not music-driven.
- SFX posture: sparse, motion-matched. A soft "blocked" tick on the hook shake, a light click on "Add to Chrome," a soft key-tick texture (very low, textural, not literal per-letter clicks) under the typing centerpiece, a subtle success chime on "Typed successfully."
- Audio-coupled moments: the hook's paste-blocked shake, the install button click, the character-by-character typing centerpiece, the success-state settle.
- Restraint rule: audio must never mask or race ahead of on-screen text; no music swells that fight the typing sound texture; typing SFX stays textural/soft, not a literal loud keyboard clack per character.

## Storyboard

### Scene 1 — The problem — 3s
A form field ("Invite code") in a mock browser window. A paste gesture is attempted (small icon flash), the field shakes briefly and shows a muted "paste blocked" cue, then text: "Some forms don't take paste." fades in below.
Sequential/interaction: yes — paste attempt → shake → blocked state → text reveal, in that order.
Audio intent: a small, dry negative tick on the blocked shake; sets the problem without being harsh.
Audio-coupled idea: soft "blocked" tick synced to the shake.
Music: bed fades in low under this scene.
Transition mood: clean → Scene 2

### Scene 2 — Install — 4s
Chrome Web Store card for "Smart Paste Typing" (icon, name, star rating optional if realistic) with an "Add to Chrome" button. Cursor moves to the button, clicks; button morphs to "Added ✓" with a brief settle. Headline overlay: "Add it once."
Sequential/interaction: yes — cursor arrives → click → button state change.
Audio intent: a light, satisfying UI click on install; confirms progress.
Audio-coupled idea: click SFX synced to the button press; tiny confirm tick on "Added."
Transition mood: slide → Scene 3

### Scene 3 — Trigger it your way — 5s
Three compact feature cards reveal one by one, left to right: (1) right-click context menu showing "Paste as Typing," (2) keyboard shortcut chip "⌘⇧V", (3) toolbar icon with a click ring. Small label under each: "Right-click", "Shortcut", "Toolbar."
Sequential/interaction: yes — 3 cards arrive one by one, ~0.4-0.5s apart, each settling before the next enters.
Audio intent: three quick, light arrival ticks, slightly different pitch per card, reinforcing "pick any of these."
Audio-coupled idea: card-by-card arrival sound.
Transition mood: clean wipe → Scene 4

### Scene 4 — Watch it type — 6s
Centerpiece. The hero demo card from index.html: mock browser chrome (red/yellow/green traffic-light dots), field labeled "Invite code," and "WELCOME-2K9F-XQ7Z" typing itself in character by character with a blinking caret, status line "Typing character by character…" with a pulsing dot. On completion, status flips to "Typed successfully" in accent green/blue with a settle.
Sequential/interaction: yes — this IS the sequential centerpiece: each character appears in order with the caret, ending on the success state.
Audio intent: soft, low, textural key-tick bed under the typing (not per-character loud clacks) building a light sense of motion; a clear but restrained success chime when it completes.
Audio-coupled idea: textural typing bed + success chime on state flip.
Music: small lift here, still under the SFX.
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro — 3s
Cut to the extension icon (gradient sky-blue mark) centered, wordmark "Smart Paste Typing" below it, tagline "Paste like a human. Not like a bot." beneath that. "Add to Chrome — it's free" CTA settles last.
Sequential/interaction: none — single clean composed hold.
Audio intent: music fades out gently under this final card; no new SFX, just a soft resolve.
Audio-coupled idea: none.
Transition mood: soft crossfade → end

**Music mood for this video:** upbeat but restrained — warm corporate/tech, moderate-low tempo, never aggressive.
**Audio summary:** A quiet corporate bed runs throughout at low volume, punctuated by four sparse, motion-matched SFX moments (blocked-tick, install-click, card arrivals, typing texture + success chime), fading out cleanly under the outro card so the CTA lands in near-silence.
