const storageKey = 'speaksaathi-state-v2';

export const defaultProfile = {
  name: 'Ravi Kumar',
  supportLanguage: 'Hindi',
  goal: 'Interview English',
  level: 'Beginner',
  streak: 0,
  plan: 'Free',
  consentToSaveAudio: false,
};

export const loadAppState = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveAppState = (state) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Static prototype: ignore unavailable storage in restricted browsers.
  }
};

export const clearAppState = () => {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Static prototype: ignore unavailable storage in restricted browsers.
  }
};
