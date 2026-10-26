(() => {
  "use strict";

  const config = window.NO_SHANKS_CONFIG || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const announce = (status, message, type) => {
    if (!status) return;
    status.className = `form-status is-${type}`;
    status.textContent = message;
    status.hidden = false;
    status.setAttribute("role", type === "error" ? "alert" : "status");
    status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  };

  const clearFieldError = (field) => {
    const container = field.closest(".field, .checkbox");
    container?.querySelector(".field-error")?.remove();
    field.removeAttribute("aria-invalid");
  };

  const validateScope = (scope) => {
    let valid = true;
    const fields = qsa("input, select, textarea", scope).filter((field) => {
      return !field.disabled && field.type !== "hidden" && field.name !== "website";
    });

    fields.forEach((field) => {
      clearFieldError(field);
      if (field.checkValidity()) return;
      valid = false;
      field.setAttribute("aria-invalid", "true");
      const container = field.closest(".field, .checkbox");
      const error = document.createElement("span");
      error.className = "field-error";
      error.textContent = field.validationMessage || "Please complete this field.";
      container?.append(error);
    });

    if (!valid) qs("[aria-invalid='true']", scope)?.focus();
    return valid;
  };

  const createPayload = (form) => {
    const payload = {};
    const data = new FormData(form);
    for (const [key, value] of data.entries()) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        payload[key] = `${payload[key]}, ${String(value)}`;
      } else {
        payload[key] = String(value);
      }
    }
    payload.form_type = form.dataset.formType || payload.form_type || "general";
    payload.page_url = window.location.href;
    payload.referrer = document.referrer;
    const search = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      payload[key] = search.get(key) || "";
    });
    return payload;
  };

  const submitForm = async (form, status) => {
    const endpoint = config.formEndpoint || "/api/submit.php";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(createPayload(form))
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "The message could not be sent.");
    announce(status, result.message || "Thank you. Your information has been received.", "success");
    document.dispatchEvent(new CustomEvent("ns:form-success", {
      detail: { formType: form.dataset.formType || "general" }
    }));
    form.reset();
  };

  const bindSubmit = (form, status, afterSuccess = () => {}) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateScope(form)) return;
      const submit = qs("button[type='submit']", form);
      if (!submit) return;
      const original = submit.innerHTML;
      submit.disabled = true;
      submit.textContent = "Sending…";
      if (status) status.hidden = true;
      try {
        await submitForm(form, status);
        afterSuccess();
      } catch (error) {
        announce(status, error?.message || "We could not send this right now. Please try again in a moment.", "error");
      } finally {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    });
  };

  const setupMultistepForms = () => {
    qsa("[data-multistep-form]").forEach((form) => {
      const steps = qsa("[data-form-step]", form);
      const progress = qsa("[data-form-progress]", form);
      const status = qs("[data-form-status]", form);
      if (!steps.length) return;
      let current = 0;

      const show = (index, shouldScroll = true) => {
        current = Math.max(0, Math.min(steps.length - 1, index));
        steps.forEach((step, position) => { step.hidden = position !== current; });
        progress.forEach((item, position) => item.classList.toggle("is-active", position <= current));
        if (shouldScroll) {
          form.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          window.setTimeout(() => qs("input, select, textarea", steps[current])?.focus({ preventScroll: true }), reducedMotion ? 0 : 250);
        }
      };

      qsa("[data-form-next]", form).forEach((button) => {
        button.addEventListener("click", () => {
          if (validateScope(steps[current])) show(current + 1);
        });
      });
      qsa("[data-form-back]", form).forEach((button) => button.addEventListener("click", () => show(current - 1)));
      bindSubmit(form, status, () => show(0, false));
      show(0, false);
    });
  };

  const setupSimpleForms = () => {
    qsa("form[data-simple-form]").forEach((form) => bindSubmit(form, qs("[data-form-status]", form)));
  };

  const setupSharePreview = () => {
    const field = qs("input[name='sender_name']");
    const preview = qs("[data-share-sender-preview]");
    if (!field || !preview) return;
    const sync = () => {
      preview.textContent = field.value.trim() || "A player in your group";
    };
    field.addEventListener("input", sync);
    sync();
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupMultistepForms();
    setupSimpleForms();
    setupSharePreview();
  });
})();
