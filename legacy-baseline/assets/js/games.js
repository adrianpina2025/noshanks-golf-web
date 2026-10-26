(() => {
  "use strict";
  const formats = {
    nassau: {
      name: "Nassau",
      line: "Front nine. Back nine. Overall.",
      description: "Three matches inside one round, with live standings for each side and the overall result.",
      pot: "3 matches",
      rows: [["Team Logan", "-4", "12", "-11", "-17"], ["Fairway Finders", "-2", "12", "-7", "-12"], ["Birdie Boys", "-1", "12", "-5", "-9"], ["Mulligan Mafia", "+1", "12", "E", "-4"], ["Foreplay", "+3", "12", "+2", "-1"]]
    },
    skins: {
      name: "Skins",
      line: "Win the hole outright or carry it forward.",
      description: "The value travels until one player or side wins the hole alone. The app tracks every carry.",
      pot: "2 carrying",
      rows: [["Team Logan", "3", "16", "3", "6"], ["Fairway Finders", "2", "16", "2", "4"], ["Birdie Boys", "1", "16", "1", "2"], ["Mulligan Mafia", "—", "16", "—", "—"], ["Foreplay", "—", "16", "—", "—"]]
    },
    match: {
      name: "Match Play",
      line: "Hole by hole. Win, lose or halve.",
      description: "The leaderboard shows where every match stands without translating strokes into another spreadsheet.",
      pot: "2 & 1",
      rows: [["Logan / Turner", "2 up", "16", "—", "2 & 1"], ["Brooks / Harper", "1 up", "16", "—", "Dormie"], ["Mills / Richardson", "All square", "15", "—", "AS"], ["King / Moore", "1 down", "16", "—", "1 DN"], ["Evans / Hughes", "2 down", "16", "—", "2 DN"]]
    },
    bestball: {
      name: "Best Ball",
      line: "The best score from the side counts.",
      description: "Gross or net, No Shanks identifies the counting score and updates the group result automatically.",
      pot: "Net scoring",
      rows: [["Team Logan", "-5", "14", "66", "61"], ["Fairway Finders", "-4", "14", "67", "62"], ["Birdie Boys", "-2", "14", "69", "64"], ["Mulligan Mafia", "E", "14", "71", "66"], ["Foreplay", "+1", "14", "72", "67"]]
    },
    stableford: {
      name: "Stableford",
      line: "Points instead of total strokes.",
      description: "The leaderboard keeps moving while every player sees the points earned against the selected scoring rules.",
      pot: "41 points",
      rows: [["T. Caldwell", "7", "15", "41", "41"], ["M. Brennan", "6", "15", "39", "39"], ["D. O’Leary", "5", "15", "37", "37"], ["R. Hughes", "4", "15", "35", "35"], ["J. Patel", "3", "15", "33", "33"]]
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const shell = document.querySelector("[data-game-shell]");
    if (!shell) return;
    const buttons = [...shell.querySelectorAll("[data-game-format]")];
    const body = shell.querySelector("[data-game-rows]");
    const title = shell.querySelector("[data-game-title]");
    const line = shell.querySelector("[data-game-line]");
    const description = shell.querySelector("[data-game-description]");
    const pot = shell.querySelector("[data-game-pot]");
    const render = (key) => {
      const format = formats[key];
      if (!format) return;
      buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.gameFormat === key));
      if (title) title.textContent = format.name;
      if (line) line.textContent = format.line;
      if (description) description.textContent = format.description;
      if (pot) pot.textContent = format.pot;
      if (body) body.innerHTML = format.rows.map((row, index) => `
        <tr>
          <td class="pos">${index + 1}</td>
          <td><strong>${row[0]}</strong></td>
          <td class="${String(row[1]).includes('-') ? 'negative' : ''}">${row[1]}</td>
          <td>${row[2]}</td>
          <td class="${String(row[3]).includes('-') ? 'negative' : ''}">${row[3]}</td>
          <td class="${String(row[4]).includes('-') ? 'negative' : ''}">${row[4]}</td>
        </tr>`).join("");
    };
    buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.gameFormat)));
    render("nassau");

    document.querySelectorAll("[data-score-stepper]").forEach((stepper) => {
      const output = stepper.querySelector("output");
      stepper.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        const delta = Number(button.dataset.delta || 0);
        const next = Math.max(1, Math.min(12, Number(output.value || output.textContent || 4) + delta));
        output.value = String(next);
        output.textContent = String(next);
      }));
    });
  });
})();
