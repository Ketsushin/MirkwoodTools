import { JourneyApp } from "./ui/JourneyApp.js";
import { l } from "./i18n.js";

export function registerJourneyControls() {
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return;

    const tokenControls = controls.find(c => c.name === "token");
    if (!tokenControls) return;

    tokenControls.tools.push({
      name: "mirkwood-journey",
      title: l("MIRKWOOD.Controls.Journey"),
      icon: "fas fa-route",
      onClick: () => new JourneyApp().render(true),
      button: true
    });
  });
}