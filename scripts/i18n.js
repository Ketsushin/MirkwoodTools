export function t(key, data = {}) {
  return game.i18n.format(key, data);
}

export function l(key) {
  return game.i18n.localize(key);
}