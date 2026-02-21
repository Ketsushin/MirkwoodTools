import { MODULE_ID } from "./settings.js";
import { l } from "./i18n.js";

export function registerSceneConfigInjection() {
  Hooks.on("renderSceneConfig", async (app, html) => {
    const scene = app.document;
    const api = game.modules.get(MODULE_ID)?.api;

    const regionsList = (api?.getRegions?.() ?? []);
    const regionOptions = regionsList
      .map(r => `<option value="${r.id}">${r.name} (${r.darkness ?? 0})</option>`)
      .join("");

    const currentRegion = scene.getFlag(MODULE_ID, "regionId") ?? "";
    const currentTerrain = scene.getFlag(MODULE_ID, "terrain") ?? "forest";

    const terrains = ["road", "plains", "forest", "swamp", "hills", "mountain"];
    const terrainOptions = terrains
      .map(v => `<option value="${v}">${l(`MIRKWOOD.SceneConfig.Terrain.${v}`)}</option>`)
      .join("");

    const block = $(`
      <fieldset>
        <legend>${l("MIRKWOOD.SceneConfig.Legend")}</legend>

        <div class="form-group">
          <label>${l("MIRKWOOD.SceneConfig.RegionLabel")}</label>
          <select name="flags.${MODULE_ID}.regionId">
            <option value="">${l("MIRKWOOD.SceneConfig.None")}</option>
            ${regionOptions}
          </select>
          <p class="hint">${l("MIRKWOOD.SceneConfig.RegionHint")}</p>
        </div>

        <div class="form-group">
          <label>${l("MIRKWOOD.SceneConfig.TerrainLabel")}</label>
          <select name="flags.${MODULE_ID}.terrain">
            ${terrainOptions}
          </select>
          <p class="hint">${l("MIRKWOOD.SceneConfig.TerrainHint")}</p>
        </div>
      </fieldset>
    `);

    const basicTab = html.find('.tab[data-tab="basic"]');
    if (basicTab.length) basicTab.append(block);
    else html.find("form").append(block);

    block.find(`select[name="flags.${MODULE_ID}.regionId"]`).val(currentRegion);
    block.find(`select[name="flags.${MODULE_ID}.terrain"]`).val(currentTerrain);
  });
}