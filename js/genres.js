/* ==========================================================================
   GENRES.JS — Explorador de canciones por género (Pop, Bachata, Reggaetón)
   y por artista, debajo de "Canciones Destacadas".

   Lee la playlist de music.js (campo `cats` para géneros, `artist` para
   artistas) y reproduce con el mismo reproductor. Para que una canción salga
   en un botón, basta con añadirla a la playlist con su `cats`.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("genre-explorer");
  const panel = document.getElementById("genre-panel");
  if (!root || !panel || typeof Player === "undefined") return;

  const buttons = root.querySelectorAll(".genre-btn");
  const playlist = Player.playlist;
  let current = null; // género abierto, o null si el panel está cerrado

  const LABELS = { pop: "Pop", bachata: "Bachata", reggaeton: "Reggaetón" };

  /* ---------- Fila de canción ---------- */
  function songRow(i) {
    const t = playlist[i];
    return `
      <li class="g-song" data-index="${i}">
        <img src="${t.cover || Player.PLACEHOLDER_COVER}" alt="" />
        <div class="g-info">
          <span class="g-title">${t.title}</span>
          <span class="g-artist">${t.artist}</span>
        </div>
        <button class="g-play" aria-label="Reproducir ${t.title}">▶</button>
      </li>`;
  }

  function songList(indices) {
    return `<ul class="g-list">${indices.map(songRow).join("")}</ul>`;
  }

  /* ---------- Vistas ---------- */
  function renderGenre(genre) {
    const indices = playlist
      .map((t, i) => (t.cats && t.cats.includes(genre) ? i : -1))
      .filter((i) => i >= 0);

    panel.innerHTML = `<h4 class="g-heading">${LABELS[genre]} · ${indices.length} canciones</h4>` +
      (indices.length
        ? songList(indices)
        : `<p class="g-empty">Todavía no hay canciones de ${LABELS[genre]}. ¡Próximamente!</p>`);
  }

  function renderArtists(selected) {
    // Agrupa por artista conservando el orden de la playlist.
    const byArtist = new Map();
    playlist.forEach((t, i) => {
      const name = t.artist.trim();
      if (!byArtist.has(name)) byArtist.set(name, []);
      byArtist.get(name).push(i);
    });

    const chips = [...byArtist.keys()]
      .map((name) => {
        const n = byArtist.get(name).length;
        const active = name === selected ? " active" : "";
        return `<button class="g-chip${active}" data-artist="${name}">${name} <small>(${n})</small></button>`;
      })
      .join("");

    panel.innerHTML =
      `<h4 class="g-heading">Artistas · ${byArtist.size}</h4>` +
      `<div class="g-chips">${chips}</div>` +
      (selected ? songList(byArtist.get(selected)) : `<p class="g-empty">Elige un artista para ver sus canciones.</p>`);
  }

  function open(genre) {
    current = genre;
    buttons.forEach((b) => {
      const on = b.dataset.genre === genre;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    panel.hidden = !genre;
    if (!genre) return;
    genre === "artistas" ? renderArtists(null) : renderGenre(genre);
    syncIcons();
  }

  /* ---------- Sincronizar ▶/⏸ con el reproductor ---------- */
  let playingIndex = -1;
  function syncIcons() {
    panel.querySelectorAll(".g-song").forEach((row) => {
      const on = Number(row.dataset.index) === playingIndex;
      row.classList.toggle("is-active", on);
      row.querySelector(".g-play").textContent = on ? "⏸" : "▶";
    });
  }
  Player.onChange((index, isPlaying) => {
    playingIndex = isPlaying ? index : -1;
    syncIcons();
  });

  /* ---------- Eventos ---------- */
  buttons.forEach((b) =>
    b.addEventListener("click", () => open(current === b.dataset.genre ? null : b.dataset.genre))
  );

  panel.addEventListener("click", (e) => {
    const chip = e.target.closest(".g-chip");
    if (chip) {
      renderArtists(chip.dataset.artist);
      syncIcons();
      return;
    }
    const row = e.target.closest(".g-song");
    if (row) Player.playIndex(Number(row.dataset.index));
  });
});
