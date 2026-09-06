export interface VisualSettings {
  brightness: number; // 0.6 to 1.4 (default 1.0)
  contrast: number;   // 0.8 to 1.3 (default 1.0)
  sepia: number;      // 0 to 0.5 (default 0)
}

const STORAGE_KEY = 'codice_visual_settings';

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  brightness: 1.0,
  contrast: 1.0,
  sepia: 0,
};

export function loadVisualSettings(): VisualSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        brightness: typeof parsed.brightness === 'number' ? parsed.brightness : 1.0,
        contrast: typeof parsed.contrast === 'number' ? parsed.contrast : 1.0,
        sepia: typeof parsed.sepia === 'number' ? parsed.sepia : 0,
      };
    }
  } catch {
    // Fallback to default
  }
  return { ...DEFAULT_VISUAL_SETTINGS };
}

export function applyVisualSettings(settings: VisualSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors
  }

  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--gothic-brightness', settings.brightness.toString());
    document.documentElement.style.setProperty('--gothic-contrast', settings.contrast.toString());
    document.documentElement.style.setProperty('--gothic-sepia', settings.sepia.toString());
    window.dispatchEvent(new CustomEvent('gothic_visual_changed', { detail: settings }));
  }
}

// Auto-apply on script evaluation
if (typeof window !== 'undefined') {
  const initial = loadVisualSettings();
  applyVisualSettings(initial);
}
