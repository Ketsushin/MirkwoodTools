import { registerSettings } from "./settings.js";
import { setupApi } from "./api.js";
import { registerSceneConfigInjection } from "./scene-config.js";
import { registerShadowControls } from "./shadow.js";
import { registerJourneyControls } from "./journey.js";
import { registerTravelTimeControls } from "./travel-time-controls.js";

Hooks.once("init", () => {
  registerSettings();
  registerSceneConfigInjection();

  const helpers = Handlebars.helpers ?? {};
  if (!helpers.eq) Handlebars.registerHelper("eq", (a, b) => a === b);
});

Hooks.once("ready", () => {
  setupApi();
  registerShadowControls();
  registerJourneyControls();
  registerTravelTimeControls();
});