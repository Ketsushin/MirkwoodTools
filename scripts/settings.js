export const MODULE_ID = "mirkwood-tools-dev";

export function registerSettings() {
  game.settings.register(MODULE_ID, "regions", {
    name: "Regions",
    hint: "Liste der Regionen für Growing Shadow",
    scope: "world",
    config: false,
    type: Array,
    default: [
      { id: "mirkwood-south", name: "Südlicher Düsterwald", darkness: 4, cap: 10 },
      { id: "anduin-vale", name: "Anduintal", darkness: 2, cap: 10 }
    ]
  });

  game.settings.register(MODULE_ID, "defaultPace", {
    name: "Default Pace",
    hint: "Standard-Reisetempo",
    scope: "world",
    config: true,
    type: String,
    choices: { slow: "Langsam", normal: "Normal", fast: "Schnell" },
    default: "normal"
  });

  game.settings.register(MODULE_ID, "terrainDC", {
    name: "Terrain DC Table",
    hint: "Basis-DC nach Terrain",
    scope: "world",
    config: false,
    type: Object,
    default: {
      road: 10,
      plains: 11,
      forest: 13,
      swamp: 14,
      hills: 13,
      mountain: 15
    }
  });
}