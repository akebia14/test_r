import { PermanentProgress } from '../types';

const KEY = 'rune-ruins-save-v1';

export const defaultProgress: PermanentProgress = {
  runeShards: 0,
  upgrades: {},
  firstLaunchDone: false,
};

export function loadProgress(): PermanentProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as PermanentProgress;
    return {
      runeShards: parsed.runeShards ?? 0,
      upgrades: parsed.upgrades ?? {},
      firstLaunchDone: Boolean(parsed.firstLaunchDone),
    };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: PermanentProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}
