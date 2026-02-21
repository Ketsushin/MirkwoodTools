import { MODULE_ID } from "./settings.js";
import { t, l } from "./i18n.js";

export function setupApi() {
  const api = {
    getRegions: () => foundry.utils.deepClone(game.settings.get(MODULE_ID, "regions")),
    setRegions: (regions) => game.settings.set(MODULE_ID, "regions", regions),

    getRegion(regionId) {
      return this.getRegions().find(r => r.id === regionId) ?? null;
    },

    getDarkness(regionId) {
      return this.getRegion(regionId)?.darkness ?? 0;
    },

    async modifyDarkness(regionId, delta, reason = "") {
      const regions = this.getRegions().map(r => {
        if (r.id !== regionId) return r;
        const cap = r.cap ?? 10;
        const next = Math.max(0, Math.min(cap, (r.darkness ?? 0) + delta));
        return { ...r, darkness: next };
      });

      await this.setRegions(regions);

      const deltaText = delta >= 0 ? `+${delta}` : `${delta}`;
      const reasonText = reason?.trim() ? reason.trim() : l("MIRKWOOD.Shadow.NoReason");

      ChatMessage.create({
        content: `🌑 <b>${l("MIRKWOOD.Shadow.Title")}</b>: ` +
          t("MIRKWOOD.Shadow.Chat.Changed", {
            region: regionId,
            delta: deltaText,
            reason: reasonText
          })
      });
    },

    getRegionIdForScene(scene = canvas.scene) {
      return scene?.getFlag(MODULE_ID, "regionId") ?? null;
    },

    getDarknessForScene(scene = canvas.scene) {
      const regionId = this.getRegionIdForScene(scene);
      return regionId ? this.getDarkness(regionId) : 0;
    },

    getTerrainForScene(scene = canvas.scene) {
      return scene?.getFlag(MODULE_ID, "terrain") ?? "forest";
    },

    computeJourneyDC({ scene = canvas.scene, pace = game.settings.get(MODULE_ID, "defaultPace") } = {}) {
      const terrain = this.getTerrainForScene(scene);
      const terrainTable = game.settings.get(MODULE_ID, "terrainDC") ?? {};
      const base = terrainTable[terrain] ?? 13;

      const darkness = this.getDarknessForScene(scene);
      const paceMod = pace === "fast" ? 2 : pace === "slow" ? -1 : 0;
      const dMod = darkness <= 2 ? 0 : darkness <= 5 ? 1 : darkness <= 8 ? 2 : 3;

      return { base, paceMod, dMod, total: base + paceMod + dMod, terrain, darkness, pace };
    }
  };

  game.modules.get(MODULE_ID).api = api;
}