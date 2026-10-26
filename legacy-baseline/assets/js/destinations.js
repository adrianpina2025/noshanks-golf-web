(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[data-destination-filters]");
    if (!form) return;
    const cards = [...document.querySelectorAll("[data-destination-card]")];
    const result = document.querySelector("[data-destination-result]");
    const fields = [...form.querySelectorAll("select")];
    const apply = () => {
      let visible = 0;
      cards.forEach((card) => {
        const matches = fields.every((field) => {
          if (!field.value || field.value === "all") return true;
          return (card.dataset[field.name] || "").split(",").includes(field.value);
        });
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (result) result.textContent = visible === 1 ? "1 destination to explore" : `${visible} destinations to explore`;
    };
    fields.forEach((field) => field.addEventListener("change", apply));
    form.querySelector("[data-filter-reset]")?.addEventListener("click", () => {
      form.reset();
      apply();
    });
    apply();
  });
})();
