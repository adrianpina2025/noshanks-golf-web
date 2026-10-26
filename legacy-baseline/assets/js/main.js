(() => {
  "use strict";

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const config = window.NO_SHANKS_CONFIG || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function applyConfiguredLinks() {
    const map = {
      app: config.appUrl,
      login: config.loginUrl,
      instagram: config.instagramUrl,
      linkedin: config.linkedinUrl
    };
    qsa("[data-config-link]").forEach((link) => {
      const target = map[link.dataset.configLink];
      if (target && target !== "#") {
        // Preserve a route-specific query/hash already authored in the template,
        // such as ?mode=event, while replacing only the configurable base URL.
        const authored = link.getAttribute("href") || "";
        const suffixMatch = authored.match(/([?#].*)$/);
        const suffix = suffixMatch ? suffixMatch[1] : "";
        const targetHasSuffix = /[?#]/.test(target);
        link.href = `${target}${targetHasSuffix ? "" : suffix}`;
      }
      if (!target || target === "#") {
        link.hidden = true;
        link.setAttribute("aria-hidden", "true");
        link.removeAttribute("href");
      }
    });
  }

  function setupHeader() {
    const header = qs("[data-site-header]");
    if (!header) return;
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function setupTheme() {
    const button = qs("[data-theme-toggle]");
    if (!button) return;
    const setLabel = () => {
      const dark = document.documentElement.dataset.theme === "dark";
      button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    };
    setLabel();
    button.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("ns-theme", next); } catch (_) {}
      setLabel();
      document.dispatchEvent(new CustomEvent("ns:theme", { detail: { theme: next } }));
    });
  }

  function setupMobileMenu() {
    const button = qs("[data-menu-toggle]");
    const menu = qs("[data-mobile-menu]");
    if (!button || !menu) return;
    const close = () => {
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      document.body.classList.remove("menu-open");
    };
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      menu.hidden = isOpen;
      document.body.classList.toggle("menu-open", !isOpen);
    });
    qsa("a", menu).forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  function setupDropdowns() {
    qsa("[data-nav-dropdown]").forEach((dropdown) => {
      const button = qs("button", dropdown);
      if (!button) return;
      const close = () => {
        dropdown.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      };
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const open = !dropdown.classList.contains("is-open");
        qsa("[data-nav-dropdown].is-open").forEach((other) => other.classList.remove("is-open"));
        dropdown.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", String(open));
      });
      dropdown.addEventListener("focusout", (event) => {
        if (!dropdown.contains(event.relatedTarget)) close();
      });
      document.addEventListener("click", close);
    });
  }

  function setupReveal() {
    const items = qsa(".reveal, .reveal-stagger");
    if (!items.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    items.forEach((item) => observer.observe(item));
  }

  function setupTabs() {
    qsa("[data-tabs]").forEach((group) => {
      const buttons = qsa("[data-tab-target]", group);
      const panels = qsa("[data-tab-panel]", group);
      const activate = (name, focus = false) => {
        buttons.forEach((button) => {
          const active = button.dataset.tabTarget === name;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
          if (active && focus) button.focus();
        });
        panels.forEach((panel) => {
          panel.hidden = panel.dataset.tabPanel !== name;
        });
        group.dispatchEvent(new CustomEvent("ns:tab", { detail: { name } }));
      };
      buttons.forEach((button, index) => {
        button.addEventListener("click", () => activate(button.dataset.tabTarget));
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let nextIndex = index;
          if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
          if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = buttons.length - 1;
          activate(buttons[nextIndex].dataset.tabTarget, true);
        });
      });
      const initial = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
      if (initial) activate(initial.dataset.tabTarget);
    });
  }

  function setupAccordions() {
    qsa("[data-accordion-button]").forEach((button) => {
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
        const icon = qs("[data-accordion-icon]", button);
        if (icon) icon.textContent = open ? "+" : "−";
      });
    });
  }

  function setupCarousels() {
    qsa("[data-carousel]").forEach((carousel) => {
      const viewport = qs("[data-carousel-viewport]", carousel);
      const prev = qs("[data-carousel-prev]", carousel);
      const next = qs("[data-carousel-next]", carousel);
      if (!viewport) return;
      const move = (direction) => {
        const amount = Math.max(280, viewport.clientWidth * 0.78);
        viewport.scrollBy({ left: direction * amount, behavior: reducedMotion ? "auto" : "smooth" });
      };
      prev?.addEventListener("click", () => move(-1));
      next?.addEventListener("click", () => move(1));
    });
  }

  function setupJournalFilters() {
    const toolbar = qs("[data-journal-toolbar]");
    if (!toolbar) return;
    const cards = qsa("[data-article-card]");
    const buttons = qsa("[data-journal-category]", toolbar);
    const search = qs("[data-journal-search]", toolbar);
    let activeCategory = "All";
    const apply = () => {
      const query = (search?.value || "").trim().toLowerCase();
      cards.forEach((card) => {
        const categoryMatch = activeCategory === "All" || card.dataset.category === activeCategory;
        const searchMatch = !query || card.textContent.toLowerCase().includes(query);
        card.hidden = !(categoryMatch && searchMatch);
      });
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      activeCategory = button.dataset.journalCategory;
      buttons.forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
      apply();
    }));
    search?.addEventListener("input", apply);
  }

  function setupWhiteLabel() {
    const demo = qs("[data-white-label-demo]");
    if (!demo) return;
    const preview = qs("[data-brand-preview]", demo);
    const brandName = qs("[data-brand-name]", demo);
    const tripName = qs("[data-trip-name]", demo);
    const options = qsa("[data-brand-option]", demo);
    options.forEach((button) => button.addEventListener("click", () => {
      options.forEach((option) => option.classList.toggle("is-active", option === button));
      if (brandName) brandName.textContent = button.dataset.brand;
      if (tripName) tripName.textContent = button.dataset.trip;
      if (preview) preview.style.setProperty("--brand-color", button.dataset.accent || button.dataset.color || "#073b2d");
    }));
  }

  function setupCounters() {
    qsa("[data-counter]").forEach((element) => {
      const target = Number(element.dataset.counter);
      if (!Number.isFinite(target) || reducedMotion) return;
      let started = false;
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const duration = 1100;
        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = Math.round(target * eased).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }, { threshold: .5 });
      observer.observe(element);
    });
  }

  function setupRequestModal() {
    const modal = qs("[data-request-modal]");
    if (!modal) return;
    const dialog = qs("[data-request-dialog]", modal);
    const closeButtons = qsa("[data-request-close]", modal);
    const openButtons = qsa("[data-open-request]");
    const form = qs("form", modal);
    const open = () => {
      modal.hidden = false;
      document.body.classList.add("menu-open");
      requestAnimationFrame(() => modal.classList.add("is-open"));
      setTimeout(() => qs("input, select", modal)?.focus(), 80);
    };
    const close = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      setTimeout(() => { modal.hidden = true; }, reducedMotion ? 0 : 220);
    };
    openButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        open();
      });
    });
    closeButtons.forEach((button) => button.addEventListener("click", close));
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    dialog?.addEventListener("click", (event) => event.stopPropagation());
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) close(); });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of data.entries()) if (String(value).trim()) params.set(key, String(value));
      const base = config.appUrl || "https://app.noshanks.golf";
      window.location.href = `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
    });
  }


  function setupHelpSearch() {
    const input = qs("[data-help-search]");
    if (!input) return;
    const categories = qsa("[data-help-category]");
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      categories.forEach((category) => {
        const items = qsa("[data-help-item]", category);
        let visible = 0;
        items.forEach((item) => {
          const match = !query || item.textContent.toLowerCase().includes(query);
          item.hidden = !match;
          if (match) visible += 1;
        });
        category.hidden = query !== "" && visible === 0;
      });
    });
  }

  function setupCopyButtons() {
    qsa("[data-copy-text]").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.copyText || "");
          showToast("Copied to the clipboard.");
        } catch (_) {
          showToast("Copy was blocked by the browser. Select the text manually.");
        }
      });
    });
  }


  function setupTopicPrefill() {
    const select = qs("select[name='topic']");
    if (!select) return;
    const topic = new URLSearchParams(window.location.search).get("topic");
    if (!topic) return;
    const option = qsa("option", select).find((candidate) => candidate.value.toLowerCase() === topic.toLowerCase());
    if (option) select.value = option.value;
  }

  function showToast(message) {
    const toast = qs(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, 4200);
  }
  window.NoShanks = Object.freeze({ showToast });

  document.addEventListener("DOMContentLoaded", () => {
    applyConfiguredLinks();
    setupHeader();
    setupTheme();
    setupMobileMenu();
    setupDropdowns();
    setupReveal();
    setupTabs();
    setupAccordions();
    setupCarousels();
    setupJournalFilters();
    setupWhiteLabel();
    setupCounters();
    setupRequestModal();
    setupTopicPrefill();
    setupHelpSearch();
    setupCopyButtons();
  });
})();
