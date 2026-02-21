// Simple i18n helper: format with data
export function t(key, data = {}) {
  return game.i18n.format(key, data);
}

// localize without data
export function l(key) {
  return game.i18n.localize(key);
}