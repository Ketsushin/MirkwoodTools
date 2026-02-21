import { openTravelTimeDialog } from "./travel-time.js";

export function registerTravelTimeControls() {
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!game.user.isGM) return;

    const tokenControls = controls.find(c => c.name === "token");
    if (!tokenControls) return;

    tokenControls.tools.push({
      name: "mirkwood-travel-time",
      title: "Reisezeit-Rechner",
      icon: "fas fa-hourglass-half",
      onClick: () => openTravelTimeDialog(),
      button: true
    });
  });
}