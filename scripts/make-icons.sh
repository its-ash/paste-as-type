#!/usr/bin/env bash
# Regenerates every logo PNG from assets/logo.svg. Needs rsvg-convert (brew install librsvg).
set -euo pipefail
cd "$(dirname "$0")/.."

mkdir -p extension/icons
for size in 16 32 48 128; do
  rsvg-convert -w "$size" -h "$size" assets/logo.svg -o "extension/icons/icon-$size.png"
done
# Chrome shows the 16 px manifest icon in the context menu. This blank icon keeps that menu item text only.
printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"/>' | rsvg-convert -w 16 -h 16 -o extension/icons/blank-16.png
rsvg-convert -w 512 -h 512 assets/logo.svg -o assets/logo-512.png
rsvg-convert -w 180 -h 180 -b '#FFFFFF' assets/logo.svg -o assets/apple-touch-icon.png
rsvg-convert -w 1200 -h 630 assets/og.svg -o assets/og.png
for svg in assets/store/*.svg; do
  rsvg-convert "$svg" -o "${svg%.svg}.png"
done
