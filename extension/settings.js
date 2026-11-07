export const DEFAULTS = {
  minDelay: 20,
  maxDelay: 80,
  badgeEnabled: true,
  stopEnabled: true
};

export const PRESETS = {
  slow: { minDelay: 60, maxDelay: 160 },
  normal: { minDelay: 20, maxDelay: 80 },
  fast: { minDelay: 5, maxDelay: 25 }
};

const FLOOR = 5;
const CEILING = 400;

export function clampDelays(minDelay, maxDelay) {
  const min = Math.max(FLOOR, Math.min(CEILING - FLOOR, Number(minDelay) || DEFAULTS.minDelay));
  const max = Math.max(min + FLOOR, Math.min(CEILING, Number(maxDelay) || DEFAULTS.maxDelay));
  return { minDelay: min, maxDelay: max };
}

export async function loadSettings() {
  const stored = await chrome.storage.local.get(DEFAULTS);
  return { ...stored, ...clampDelays(stored.minDelay, stored.maxDelay) };
}
