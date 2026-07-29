/* ==========================================================================
   ANIMATIONS.JS — Fondo de partículas/estrellas (canvas) + cursor
   personalizado con rastro luminoso + efecto ripple en botones.
   ========================================================================== */

/* ---------- 1. Fondo de partículas / estrellas ---------- */
(function initParticles() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(120, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      speedY: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.15,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function getAccentColor() {
    const styles = getComputedStyle(document.documentElement);
    return styles.getPropertyValue("--accent-2").trim() || "#00e5ff";
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const color = getAccentColor();
    particles.forEach((p) => {
      p.twinkle += 0.02;
      const alpha = 0.25 + Math.abs(Math.sin(p.twinkle)) * 0.6;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < -5) p.y = h + 5;
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
})();

/* ---------- 2. Cursor personalizado con rastro ---------- */
(function initCursor() {
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;
  if (window.matchMedia("(hover: none)").matches) return; // no aplica en touch

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  const trailPool = [];
  const TRAIL_LENGTH = 10;

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const t = document.createElement("div");
    t.className = "cursor-trail";
    document.body.appendChild(t);
    trailPool.push({ el: t, x: 0, y: 0 });
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  // El anillo sigue con suavizado (lerp) y la estela va detrás del anillo
  function animate() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";

    let px = ringX, py = ringY;
    trailPool.forEach((t, i) => {
      const lag = 0.35 - i * 0.02;
      t.x += (px - t.x) * Math.max(lag, 0.08);
      t.y += (py - t.y) * Math.max(lag, 0.08);
      t.el.style.left = t.x + "px";
      t.el.style.top = t.y + "px";
      t.el.style.opacity = (1 - i / TRAIL_LENGTH) * 0.5;
      px = t.x; py = t.y;
    });
    requestAnimationFrame(animate);
  }
  animate();

  // Agrandar el anillo sobre elementos interactivos
  document.querySelectorAll("a, button, select, .gusto-card, .gal-item").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width = "54px";
      ring.style.height = "54px";
      ring.style.borderColor = "var(--accent-3)";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width = "32px";
      ring.style.height = "32px";
      ring.style.borderColor = "var(--accent-1)";
    });
  });
})();

/* ---------- 3. Efecto ripple al hacer click en botones ---------- */
(function initRipple() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn, .btn-icon, .player-controls button, .social-btn");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.style.position = btn.style.position || "relative";
    btn.style.overflow = "hidden";
    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
})();
