import { ShadowManagerApp } from "./ui/ShadowManagerApp.js";
import { l } from "./i18n.js";

export function registerShadowControls() {
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return;

    const tokenControls = controls.find(c => c.name === "token");
    if (!tokenControls) return;

    tokenControls.tools.push({
      name: "mirkwood-shadow-manager",
      title: l("MIRKWOOD.Controls.ShadowManager"),
      icon: "fas fa-moon",
      onClick: () => new ShadowManagerApp().render(true),
      button: true
    });
  });
}