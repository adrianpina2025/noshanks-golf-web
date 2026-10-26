(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const stage = document.querySelector("[data-platform-stage]");
    if (!stage) return;
    const buttons = [...stage.querySelectorAll("[data-platform-view]")];
    const panels = [...stage.querySelectorAll("[data-platform-panel]")];
    const title = stage.querySelector("[data-platform-title]");
    const subtitle = stage.querySelector("[data-platform-subtitle]");
    const copy = {
      dashboard: ["Portugal Boys Invitational", "September 18–22 · 12 golfers · Shared Trip HQ"],
      itinerary: ["One itinerary. Twelve people.", "Every round, transfer and group detail in the same place."],
      roster: ["The group, accounted for.", "Invitations, confirmations and useful player details without another spreadsheet."],
      proposals: ["Compare the whole trip.", "Review inclusions, payment schedules and operator approaches side by side before the group confirms the trip."],
      leaderboard: ["The match is live.", "Handicaps applied, standings visible and six familiar formats supported."]
    };
    const activate = (name) => {
      buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.platformView === name));
      panels.forEach((panel) => panel.hidden = panel.dataset.platformPanel !== name);
      if (copy[name]) {
        if (title) title.textContent = copy[name][0];
        if (subtitle) subtitle.textContent = copy[name][1];
      }
    };
    buttons.forEach((button) => button.addEventListener("click", () => activate(button.dataset.platformView)));
    activate("dashboard");
  });
})();
