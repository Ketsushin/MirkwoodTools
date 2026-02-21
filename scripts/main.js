import { registerSettings } from "./settings.js";
import { setupApi } from "./api.js";
import { registerSceneConfigInjection } from "./scene-config.js";
import { registerShadowControls } from "./shadow.js";
import { registerJourneyControls } from "./journey.js";

// Optional: simple Handlebars helper for templates
Hooks.once("init", () => {
  registerSettings();
  registerSceneConfigInjection();

  if (!Handlebars.helpers.eq) {
    Handlebars.registerHelper("eq", (a, b) => a === b);
  }
});

Hooks.once("ready", () => {
  setupApi();
  registerShadowControls();
  registerJourneyControls();
});