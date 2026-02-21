export function openTravelTimeDialog() {
  const travelModes = {
    "Zu Fuß": 20,
    "Zu Pferd": 40,
    "Zu Boot Flussaufwärts": 5,
    "Zu Boot Flussabwärts": 20
  };

  const difficultyMultipliers = {
    "Einfach": 1,
    "Mittelschwer": 1.5,
    "Schwer": 2,
    "Sehr Schwer": 3,
    "Extrem Schwer": 5
  };

  const slug = (s) =>
    s.toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  const content = `<form class="mirkwood-tools">
    <div class="form-group">
      <label>Reiseart:</label>
      <select id="travel-mode">
        ${Object.entries(travelModes)
          .map(([mode, speed]) => `<option value="${speed}">${mode}</option>`)
          .join("")}
      </select>
      <p class="hint">Tagesleistung in Meilen.</p>
    </div>

    <hr/>

    ${Object.entries(difficultyMultipliers).map(([diff, mult]) => `
      <div class="form-group">
        <label>${diff} (Meilen):</label>
        <input type="number" id="${slug(diff)}" value="0" min="0" step="1">
        <p class="hint">Multiplikator: ${mult}</p>
      </div>
    `).join("")}
  </form>`;

  new Dialog({
    title: "Reisezeit-Berechnung",
    content,
    buttons: {
      calculate: {
        label: "Berechnen",
        callback: (html) => {
          const modeSpeed = Number(html.find("#travel-mode").val() ?? 0);
          if (!modeSpeed || modeSpeed <= 0) return;

          let totalTime = 0;
          for (const [diff, mult] of Object.entries(difficultyMultipliers)) {
            const miles = Number(html.find(`#${slug(diff)}`).val() ?? 0) || 0;
            if (miles <= 0) continue;
            totalTime += (miles / modeSpeed) * mult;
          }

          ChatMessage.create({
            content: `<b>Gesamtreisezeit:</b> ${totalTime.toFixed(2)} Tage`
          });
        }
      }
    },
    default: "calculate"
  }).render(true);
}