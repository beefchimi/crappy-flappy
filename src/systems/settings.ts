export type GameDifficulty = 'easy' | 'normal' | 'hard';

export interface GameSettings {
  isMuted: boolean;
  isMusicOn: boolean;
  isSfxOn: boolean;
  difficulty: GameDifficulty;
}

const SETTINGS_KEY = 'flappy-settings';

const defaultSettings: GameSettings = {
  isMuted: false,
  isMusicOn: true,
  isSfxOn: true,
  difficulty: 'normal',
};

let settings: GameSettings = loadSettings();
const listeners: Array<(s: GameSettings) => void> = [];

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getSettings(): GameSettings {
  return { ...settings };
}

export function setSettings(newSettings: Partial<GameSettings>) {
  settings = { ...settings, ...newSettings };
  saveSettings();
  listeners.forEach(fn => fn(getSettings()));
}

export function subscribeSettings(fn: (s: GameSettings) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
} 