import { MODULE_ID } from "../settings.js";
import { l } from "../i18n.js";

export class ShadowManagerApp extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "mirkwood-shadow-manager",
      title: l("MIRKWOOD.Shadow.Title"),
      template: `${game.modules.get(MODULE_ID).path}/templates/shadow-manager.hbs`,
      width: 520,
      height: "auto",
      closeOnSubmit: false
    });
  }

  getData() {
    const api = game.modules.get(MODULE_ID).api;
    return { regions: api.getRegions() };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='delta']").on("click", async (ev) => {
      const regionId = ev.currentTarget.dataset.regionId;
      const delta = Number(ev.currentTarget.dataset.delta);
      const reason = html.find(`input[name="reason-${regionId}"]`).val()?.trim() ?? "";
      await game.modules.get(MODULE_ID).api.modifyDarkness(regionId, delta, reason);
      this.render();
    });

    html.find("[data-action='save']").on("click", async () => {
      const regions = [];
      html.find(".region-row").each((_, row) => {
        const $row = $(row);
        regions.push({
          id: $row.data("id"),
          name: $row.find("input[name='name']").val(),
          darkness: Number($row.find("input[name='darkness']").val()),
          cap: Number($row.find("input[name='cap']").val())
        });
      });
      await game.modules.get(MODULE_ID).api.setRegions(regions);
      ui.notifications.info(l("MIRKWOOD.Shadow.Saved"));
      this.render();
    });

    html.find("[data-action='add']").on("click", async () => {
      const api = game.modules.get(MODULE_ID).api;
      const regions = api.getRegions();
      regions.push({ id: `region-${foundry.utils.randomID()}`, name: "Neue Region", darkness: 0, cap: 10 });
      await api.setRegions(regions);
      this.render();
    });
  }

  async _updateObject(_event, _formData) {}
}