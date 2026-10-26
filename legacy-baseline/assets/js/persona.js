(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const setupRotatingWords = () => {
    qsa("[data-rotating-word]").forEach((element) => {
      const words = (element.dataset.words || "").split("|").map((word) => word.trim()).filter(Boolean);
      if (words.length < 2 || reducedMotion) return;
      let index = Math.max(0, words.indexOf(element.textContent.trim()));
      window.setInterval(() => {
        element.classList.add("is-changing");
        window.setTimeout(() => {
          index = (index + 1) % words.length;
          element.textContent = words[index];
          element.classList.remove("is-changing");
        }, 180);
      }, 2600);
    });
  };

  const setupAutoTabs = () => {
    qsa("[data-tabs][data-autotabs]").forEach((group) => {
      if (reducedMotion) return;
      const buttons = qsa("[data-tab-target]", group);
      if (buttons.length < 2) return;
      const delay = Math.max(3500, Number(group.dataset.autotabs) || 7000);
      let timer = null;
      let paused = false;

      const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => {
          if (paused || document.hidden) return;
          const current = Math.max(0, buttons.findIndex((button) => button.classList.contains("is-active")));
          buttons[(current + 1) % buttons.length].click();
        }, delay);
      };

      group.addEventListener("mouseenter", () => { paused = true; });
      group.addEventListener("mouseleave", () => { paused = false; });
      group.addEventListener("focusin", () => { paused = true; });
      group.addEventListener("focusout", (event) => {
        if (!group.contains(event.relatedTarget)) paused = false;
      });
      group.addEventListener("pointerdown", () => { paused = true; }, { passive: true });
      document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
      start();
    });
  };

  const cycleHeroPersonas = () => {
    const items = qsa(".hero-persona-rail span");
    if (!items.length) return;
    let index = 0;
    items[0].classList.add("is-active");
    if (reducedMotion) return;
    window.setInterval(() => {
      items[index].classList.remove("is-active");
      index = (index + 1) % items.length;
      items[index].classList.add("is-active");
    }, 2200);
  };

  const animateProgress = () => {
    const bars = qsa(".progress-line i, .commitment-bar i, .event-progress i");
    if (!bars.length || reducedMotion || !("IntersectionObserver" in window)) return;
    bars.forEach((bar) => {
      const target = bar.style.width || bar.dataset.width || "100%";
      bar.style.width = "0";
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        requestAnimationFrame(() => { bar.style.width = target; });
        observer.disconnect();
      }, { threshold: 0.35 });
      observer.observe(bar);
    });
  };

  const setupLiveCards = () => {
    const cards = qsa(".player-stats-grid article");
    if (!cards.length || reducedMotion) return;
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => card.classList.add("is-live"));
      card.addEventListener("mouseleave", () => card.classList.remove("is-live"));
      card.addEventListener("focusin", () => card.classList.add("is-live"));
      card.addEventListener("focusout", () => card.classList.remove("is-live"));
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupRotatingWords();
    setupAutoTabs();
    cycleHeroPersonas();
    animateProgress();
    setupLiveCards();
  });
})();
