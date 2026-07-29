/* ==========================================================================
   MAIN.JS — Animaciones al hacer scroll: revelado de secciones, timeline,
   contadores numéricos animados y barras de habilidades.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Revelado genérico de bloques (.reveal) ---------- */
  const revealItems = document.querySelectorAll(".reveal, .tl-item");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealItems.forEach((el) => revealObserver.observe(el));

  /* ---------- 2. Contadores animados de estadísticas ---------- */
  const counters = document.querySelectorAll(".stat-num[data-target]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      el.textContent = Math.floor(eased * target).toLocaleString("es-MX");
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("es-MX");
    }
    requestAnimationFrame(step);
  }

  /* ---------- 3. Barras de habilidades animadas al entrar en pantalla ---------- */
  const skillFills = document.querySelectorAll(".skill-fill[data-level]");
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.width = entry.target.dataset.level + "%";
        skillObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  skillFills.forEach((el) => skillObserver.observe(el));

  /* ---------- 4. Reloj de estado en la barra de navegación ---------- */
  const clockEl = document.getElementById("nav-clock");
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    }
    updateClock();
    setInterval(updateClock, 30000);
  }

  /* ---------- 5. Menú móvil simple (mostrar/ocultar enlaces) ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
});
