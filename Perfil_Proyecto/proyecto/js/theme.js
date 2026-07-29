/* ==========================================================================
   THEME.JS — Cambio de tema (variables CSS) + persistencia en localStorage.
   ========================================================================== */

(function () {
  const STORAGE_KEY = "perfil-theme";
  const root = document.documentElement;
  const buttons = document.querySelectorAll("[data-theme-btn]");

  /** Aplica un tema al documento y marca el botón activo */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    buttons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeBtn === theme);
    });
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Cargar preferencia guardada (o usar "overworld" por defecto)
  const saved = localStorage.getItem(STORAGE_KEY) || "overworld";
  applyTheme(saved);

  // Listeners de los botones del selector de tema
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.themeBtn));
  });
})();
