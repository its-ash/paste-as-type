# Brag Plan: Smart Paste Typing

## What is this app?
A Chrome extension that turns clipboard text into real, character-by-character keystrokes, so forms and fields that block plain paste still accept the text. Manifest V3, local-only processing, triggered explicitly by the user (toolbar icon, right-click menu, or `Ctrl/Cmd+Shift+V`).

## Source brief
This run is built from a user-supplied 5-scene AI-video-generator prompt (problem → solution → magic typing → speed/privacy montage → final product shot). That structure is preserved as the storyboard backbone below; wording is tightened and claims are checked against `manifest.json`, `desc.txt`, and `README.md` so nothing overstates what the extension does (no server calls, no data claims beyond "processed locally").

## The angle
Problem-solution product demo, not a joke reel. Show a paste getting blocked, show the fix triggered on purpose, then watch the text type itself in — the "trick" is the demo. Close on speed + privacy claims that are directly supported by the extension's real behavior (local processing, on-demand trigger, no data upload).

## Hook (first 2-3 seconds)
A clean form field, a copy action, then Ctrl/Cmd+V — and nothing happens. A small "Paste blocked" tag appears near the field. Professional, dry frustration, not slapstick.

## Key moments (the middle)
- **Activate deliberately**: camera moves to the Chrome toolbar, lands on the Smart Paste Typing icon, user fires `Ctrl+Shift+V` / `Cmd+Shift+V` — a small overlay confirms "Smart Paste Typing" fired.
- **Watch it type**: the previously-copied text fills the field character-by-character with a live blinking caret, natural uneven pacing (20-80ms/char per the real implementation) — label: "Types like a human."
- **Works everywhere, stays local**: quick montage across login form / web form / textarea / search box, with feature tags: "Works with editable fields," "Character-by-character typing," "Processed locally," "No data uploaded."

## Outro / punchline
Chrome browser + extension icon centered on a clean background. Headline: "Paste anything. Type it naturally." Subtitle: "Smart Paste Typing — Chrome extension." CTA: "Try Smart Paste Typing."

## User flow worth showing
1. **Entry**: normal paste attempt fails silently on a field.
2. **Key action**: user explicitly triggers the extension (shortcut or icon) — no auto-activation, matching real behavior.
3. **Result**: clipboard text lands via simulated keystrokes, field fills, success is visually clear.

## Tone
- Preset: cinematic (per user's prompt: "premium modern SaaS," "minimal Apple-like," "high-end startup product video")
- Creative direction: smooth camera moves, subtle depth of field, crisp typography, realistic Chrome UI, no visible people, no decorative clutter — matches the source prompt's visual-style section almost verbatim.
- Interpretation: slower, more deliberate pacing than the app-store preset; each scene is a single confident camera move rather than fast cuts, consistent with "smooth 24fps motion" direction.

## Format: landscape — 1920x1080 (source prompt requests 16:9 4K; HyperFrames renders at 1080p by default — noted as a constraint, not a claim)
## Duration: 24s

## Visual identity (from the project)
- Background: `#0b0d10` (near-black, matches index.html design system)
- Surface: `#15181d`, border `rgba(255,255,255,0.08)`
- Accent: `#38bdf8` → `#2563eb` gradient (sky blue to blue, matches extension icon)
- Text: `#edeef0` primary, `#9aa1ab` dim, `#6b7280` faint
- Display font: Geist (fallback Inter / system sans)
- Mono font: Geist Mono (fallback ui-monospace) — used for the typing centerpiece
- Strongest visual element: realistic mock Chrome chrome (traffic-light dots, address bar) framing the demo field, reused from the prior brag composition's hero card.

## Fact-check against source prompt
- ✅ Keeps: simulated keystrokes, keyboard shortcuts (both platforms), active-field detection, local-only processing, no data upload, no people visible, realistic Chrome UI.
- ✅ Confirmed against `desc.txt`/README: "bypasses no-paste restrictions," "processed locally," "on-demand execution only."
- ⚠️ Adjusted: source prompt asks for literal 4K — HyperFrames composition targets 1920x1080 landscape; framed as the render target, not advertised as "4K" on-screen.
- ⚠️ Adjusted: no explicit claim of "blocks" — the demo shows a generic paste failing, not a specific bypass mechanism, to avoid implying a false technical claim about which sites are affected.

## Share copy (draft)
Paste anything. Type it naturally. Smart Paste Typing turns blocked pastes into real keystrokes — triggered on demand, processed locally, no data uploaded.

## Audio direction
- Role: sparse, premium motion-graphics accents over a minimal, low-tempo ambient/corporate bed — nothing competes with on-screen typography.
- Music: minimal, elegant, Apple-keynote-adjacent bed, low-mid tempo, no drops, gentle build toward scene 3, soft fade under the outro.
- Music cue guidance: to be detected at composition time. Target one soft accent at the shortcut trigger (~7s in) and one at the completion of the typing centerpiece (~16s in).
- Audio-reactive treatment: none — deterministic, readable visuals only.
- SFX posture: sparse, motion-matched. A dry negative tick on "Paste blocked," a light confirm chime on the shortcut trigger/overlay, a soft textural key-tick bed under the typing centerpiece (not literal per-character clacks), a clean settle tone on the final headline.
- Audio-coupled moments: paste-blocked tag appearing, shortcut-trigger overlay, character-by-character typing, final headline settle.
- Restraint rule: audio never masks or races ahead of on-screen text; typing SFX stays textural, not a loud per-letter clack; no music swell under dense text moments (Scene 4 montage).

## Storyboard

### Scene 1 — The problem — 5s
Clean Chrome browser window, realistic login/form page. A cursor copies text, then presses Ctrl+V / Cmd+V on a field. Nothing lands — the field gives a brief negative shake and a small "Paste blocked." tag fades in beside it. Frustrated but professional, no exaggeration.
Sequential: copy gesture → paste keypress → block state → tag reveal.
Audio: dry negative tick synced to the shake; music bed fades in low underneath.
Transition: clean push → Scene 2

### Scene 2 — The solution — 5s
Camera moves toward the Chrome toolbar. The Smart Paste Typing icon is highlighted. Keyboard combo appears as a clean chip: "Ctrl+Shift+V" (Windows) / "Cmd+Shift+V" (Mac), shown as a quick platform-swap beat. A small elegant overlay confirms: "Smart Paste Typing."
Sequential: camera arrives at toolbar → icon highlight → shortcut chip → confirm overlay.
Audio: light confirm chime on the overlay's arrival.
Transition: smooth zoom → Scene 3

### Scene 3 — Magic typing — 7s
Centerpiece. The same field from Scene 1 now fills with the previously-copied text, one character at a time, with a realistic blinking caret and natural uneven pacing. Small label settles beneath: "Types like a human."
Sequential: this IS the sequential centerpiece — each character appears in order, caret blinks, ending on a settled, complete field.
Audio: soft textural key-tick bed under the typing; music holds a small lift here.
Transition: soft crossfade → Scene 4

### Scene 4 — Speed + privacy — 5s
Quick, smooth montage across four editable surfaces: login form, web form, textarea, search box — each getting a brief typing flourish. Four concise tags settle in sequence, one per beat: "Works with editable fields" / "Character-by-character typing" / "Processed locally" / "No data uploaded."
Sequential: four fields cycle left-to-right or via smooth pans, ~1.2s each, tag settles with each.
Audio: four light, evenly-spaced arrival ticks, no music swell (text-dense scene).
Transition: clean fade → Scene 5

### Scene 5 — Final product shot — 3s
Clean premium background (dark, matching product identity). Chrome browser + Smart Paste Typing icon centered. Headline: "Paste anything. Type it naturally." Subtitle: "Smart Paste Typing — Chrome extension." CTA settles last: "Try Smart Paste Typing."
Sequential: icon settle → headline → subtitle → CTA, single composed hold.
Audio: music fades out gently; one clean settle tone under the CTA, no new SFX after.
Transition: soft resolve → end

**Music mood for this video:** minimal, premium, Apple-keynote-adjacent — low-mid tempo, restrained, never aggressive.
**Audio summary:** A quiet ambient/corporate bed runs throughout at low volume, punctuated by five sparse, motion-matched SFX moments (blocked-tick, trigger-chime, typing texture, four montage ticks, final settle), fading out cleanly under the closing CTA.
