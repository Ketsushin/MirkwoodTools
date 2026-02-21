import { MODULE_ID } from "../settings.js";
import { t, l } from "../i18n.js";

const ROLES = [
  { id: "guide", key: "MIRKWOOD.Journey.RolesList.guide" },
  { id: "scout", key: "MIRKWOOD.Journey.RolesList.scout" },
  { id: "hunter", key: "MIRKWOOD.Journey.RolesList.hunter" },
  { id: "lookout", key: "MIRKWOOD.Journey.RolesList.lookout" }
];

export class JourneyApp extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "mirkwood-journey",
      title: l("MIRKWOOD.Journey.Title"),
      template: `${game.modules.get(MODULE_ID).path}/templates/journey.hbs`,
      width: 560,
      height: "auto",
      closeOnSubmit: false
    });
  }

  getData() {
    const api = game.modules.get(MODULE_ID).api;
    const pace = game.settings.get(MODULE_ID, "defaultPace");
    const dcInfo = api.computeJourneyDC({ pace });

    const actors = game.actors.contents
      .filter(a => a.type === "character")
      .map(a => ({ id: a.id, name: a.name }));

    const scenes = game.scenes.contents.map(s => ({ id: s.id, name: s.name }));
    const roles = ROLES.map(r => ({ id: r.id, label: l(r.key) }));

    return { roles, actors, scenes, pace, dcInfo };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find("[data-action='run-leg']").on("click", async () => {
      const pace = html.find("select[name='pace']").val();

      const partyIds = html.find("input[name='party']:checked")
        .toArray()
        .map(el => el.value);

      const roleAssignments = {};
      for (const r of ROLES) {
        roleAssignments[r.id] = html.find(`select[name='role-${r.id}']`).val() || null;
      }

      const sceneId = html.find("select[name='scene']").val();
      const scene = game.scenes.get(sceneId) ?? canvas.scene;

      await this.runLeg({ partyIds, roleAssignments, pace, scene });
      this.render();
    });
  }

  async runLeg({ partyIds, roleAssignments, pace, scene }) {
    const api = game.modules.get(MODULE_ID).api;
    const dcInfo = api.computeJourneyDC({ scene, pace });
    const dc = dcInfo.total;

    const party = partyIds.map(id => game.actors.get(id)).filter(Boolean);
    if (!party.length) {
      ui.notifications.warn(l("MIRKWOOD.Notifications.NoPartySelected"));
      return;
    }

    const results = [];
    for (const r of ROLES) {
      const actorId = roleAssignments[r.id];
      const actor = actorId ? game.actors.get(actorId) : null;
      const roleLabel = l(`MIRKWOOD.Journey.RolesList.${r.id}`);

      if (!actor) {
        results.push({ role: roleLabel, actor: "—", roll: null, success: false, note: "nicht besetzt" });
        continue;
      }

      const roll = await (new Roll("1d20")).evaluate({ async: true });
      const total = roll.total;
      const success = total >= dc;
      results.push({ role: roleLabel, actor: actor.name, roll: total, success });
    }

    const successes = results.filter(r => r.success).length;
    const failures = results.length - successes;

    const regionId = api.getRegionIdForScene(scene);
    let consequenceText = l("MIRKWOOD.Journey.Chat.ConsequenceNone");

    if (regionId && failures >= 2) {
      await api.modifyDarkness(regionId, +1, "Reise misslingt / Unheil verdichtet sich");
      consequenceText = t("MIRKWOOD.Journey.Chat.ConsequenceUp", { region: regionId });
    } else if (regionId && successes >= 3) {
      await api.modifyDarkness(regionId, -1, "Reise gelingt / Hoffnung stärkt die Gegend");
      consequenceText = t("MIRKWOOD.Journey.Chat.ConsequenceDown", { region: regionId });
    }

    const lines = results.map(r =>
      `<tr><td>${r.role}</td><td>${r.actor}</td><td>${r.roll ?? "—"}</td><td>${r.success ? "✔" : "✘"}</td><td>${r.note ?? ""}</td></tr>`
    ).join("");

    ChatMessage.create({
      content: `
        <h3>🧭 ${l("MIRKWOOD.Journey.Chat.Header")}</h3>
        <p><b>${t("MIRKWOOD.Journey.Chat.SceneLine", {
          scene: scene.name,
          terrain: dcInfo.terrain,
          darkness: dcInfo.darkness,
          pace
        })}</b></p>
        <p>${t("MIRKWOOD.Journey.Chat.DcLine", {
          dc,
          base: dcInfo.base,
          paceMod: dcInfo.paceMod,
          dMod: dcInfo.dMod
        })}</p>
        <table style="width:100%">
          <thead><tr><th>Role</th><th>Actor</th><th>d20</th><th>OK</th><th>Note</th></tr></thead>
          <tbody>${lines}</tbody>
        </table>
        <p><b>${t("MIRKWOOD.Journey.Chat.Outcome", {
          success: successes,
          failure: failures,
          consequence: consequenceText
        })}</b></p>
      `
    });
  }

  async _updateObject(_event, _formData) {}
}