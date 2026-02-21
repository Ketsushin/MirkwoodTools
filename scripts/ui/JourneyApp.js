import { MODULE_ID } from "../settings.js";

const ROLES = [
  { id: "guide", label: "Guide" },
  { id: "scout", label: "Scout" },
  { id: "hunter", label: "Hunter" },
  { id: "lookout", label: "Look-out" }
];

export class JourneyApp extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "mirkwood-journey",
      title: "Journey Engine",
      template: `modules/${MODULE_ID}/templates/journey.hbs`,
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

    return {
      roles: ROLES,
      actors,
      scenes,
      pace,
      dcInfo
    };
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
      return ui.notifications.warn("Keine Party ausgewählt.");
    }

    // MVP: simple d20 checks, system-agnostic
    // Later: plug in system adapters (dnd5e skill checks, AiME travel skills, etc.)
    const results = [];
    for (const r of ROLES) {
      const actorId = roleAssignments[r.id];
      const actor = actorId ? game.actors.get(actorId) : null;

      // If no role assigned, count as failure
      if (!actor) {
        results.push({ role: r.label, actor: "—", roll: null, success: false, note: "nicht besetzt" });
        continue;
      }

      const roll = await (new Roll("1d20")).evaluate({ async: true });
      const total = roll.total;
      const success = total >= dc;

      results.push({ role: r.label, actor: actor.name, roll: total, success });
    }

    const successes = results.filter(r => r.success).length;
    const failures = results.length - successes;

    // Simple consequences MVP:
    // - If failures >= 2: +1 Darkness in region (pressure increases) OR +Shadow warning
    // - If successes >= 3: reduce pressure (optional)
    const regionId = api.getRegionIdForScene(scene);

    let consequence = "";
    if (regionId && failures >= 2) {
      await api.modifyDarkness(regionId, +1, "Reise misslingt / Unheil verdichtet sich");
      consequence = `Region <code>${regionId}</code> Darkness +1`;
    } else if (regionId && successes >= 3) {
      // gentle reward, not too strong:
      await api.modifyDarkness(regionId, -1, "Reise gelingt / Hoffnung stärkt die Gegend");
      consequence = `Region <code>${regionId}</code> Darkness -1`;
    } else {
      consequence = "Keine Regionsänderung";
    }

    // Chat report
    const lines = results.map(r =>
      `<tr><td>${r.role}</td><td>${r.actor}</td><td>${r.roll ?? "—"}</td><td>${r.success ? "✔" : "✘"}</td><td>${r.note ?? ""}</td></tr>`
    ).join("");

    ChatMessage.create({
      content: `
        <h3>🧭 Journey Leg</h3>
        <p><b>Scene:</b> ${scene.name} | <b>Terrain:</b> ${dcInfo.terrain} | <b>Darkness:</b> ${dcInfo.darkness} | <b>Pace:</b> ${pace}</p>
        <p><b>DC:</b> ${dc} (Base ${dcInfo.base} + Pace ${dcInfo.paceMod} + Darkness ${dcInfo.dMod})</p>
        <table style="width:100%">
          <thead><tr><th>Role</th><th>Actor</th><th>d20</th><th>OK</th><th>Note</th></tr></thead>
          <tbody>${lines}</tbody>
        </table>
        <p><b>Ergebnis:</b> ${successes} Erfolg(e), ${failures} Fehlschlag(e) — ${consequence}</p>
      `
    });
  }

  async _updateObject(_event, _formData) {}
}