/* ==========================================================================
   MUSIC.JS — Reproductor de música completo.

   La playlist apunta a tus MP3 reales dentro de /music/ (nombres tal cual los
   subiste). Si algún archivo no cargara, el reproductor detecta el fallo y
   genera automáticamente un tono de sustitución con la Web Audio API, para
   que todos los controles (play, pausa, progreso, siguiente, aleatorio,
   visualizador...) sigan siendo 100% funcionales.
   ========================================================================== */

const Player = (() => {
  /* ---------- Playlist (edítala libremente) ----------
     Sincronizada 1:1 por índice con las tarjetas de "Canciones destacadas"
     en index.html (data-index="0..9"): mismo orden, título, artista, portada
     y duración que ahí. El campo `src` apunta al MP3 real correspondiente
     dentro de /music/ (los nombres de archivo no siempre coinciden con el
     título mostrado, p.ej. "Breakin' Dishes.mp3" para "Breaking Dishes"). */
  const playlist = [
    { title: "Umbrella",                  artist: "Rihanna",             genre: "R&B/Soul, Dance/Electrónica, Rock",              cover: "https://i.scdn.co/image/ab67616d0000b273f9f27162ab1ed45b8d7a7e98", src: "music/Umbrella.mp3", duration: 276, freq: 220 },
    { title: "Dark Paradise",             artist: "Lana Del Rey",        genre: "Alternativa/independiente",                      cover: "https://i.scdn.co/image/ab67616d0000b273ebc8cfac8b586bc475b04918", src: "music/Dark Paradise.mp3", duration: 243, freq: 246 },
    { title: "Soñe",                      artist: "Zóe",                 genre: "Rock alternativo",                               cover: "https://i.scdn.co/image/ab67616d0000b2739abba2e4a7600af6c16988a9", src: "music/Zoé - Soñé (MTV Unplugged).mp3", duration: 226, freq: 262 },
    { title: "Breaking Dishes",           artist: "Rihanna",             genre: "R&B/Soul, Dance/Electrónica, Rock",              cover: "https://i1.sndcdn.com/artworks-1pxKN9EgbIFU-0-t500x500.jpg", src: "music/Breakin' Dishes.mp3", duration: 200, freq: 294 },
    { title: "Born to Die",               artist: "Lana Del Rey",        genre: "Alternativa/independiente, R&B/Soul, Dance/Electrónica", cover: "https://upload.wikimedia.org/wikipedia/en/2/28/Borntodiesingle.png", src: "music/Born To Die.mp3", duration: 285, freq: 330 },
    { title: "En nuit",                   artist: "VideoClub",           genre: "Alternativa/independiente, French Indie",        cover: "https://i.scdn.co/image/ab67616d0000b2731f74480c2297fe08d015a3a6", src: "music/En nuit.mp3", duration: 222, freq: 349 },
    { title: "As It Was",                 artist: "Harry Styles",        genre: "Synth pop, New wave",                            cover: "https://cdn-images.dzcdn.net/images/cover/b0e936124f59e669ddba02ebe5893f95/0x1900-000000-80-0-0.jpg", src: "music/As It Was.mp3", duration: 167, freq: 392 },
    { title: "Without Me",                artist: "Eminem",              genre: "Comedy hip hop, Rock",                           cover: "https://cdn-images.dzcdn.net/images/cover/ec3c8ed67427064c70f67e5815b74cef/1900x1900-000000-80-0-0.jpg", src: "music/Without Me.mp3", duration: 290, freq: 415 },
    { title: "Amor, amor de mis amores",  artist: "Natalia Lafourcade",  genre: "Alternativa/independiente, Rock en español, Pop, Tango", cover: "https://i1.sndcdn.com/artworks-3GGgSeqDxnp5-0-t500x500.jpg", src: "music/Amor de mis amores.mp3", duration: 237, freq: 440 },
    { title: "Quimica Mayor",             artist: "Mon Laferte",         genre: "Pop",                                             cover: "https://i.scdn.co/image/ab67616d0000b2737e709ce66e549bae1f3983ce", src: "music/Química Mayor.mp3", duration: 231, freq: 466 },
  ];

  /* ---------- Estado ---------- */
  const state = {
    index: 0,
    playing: false,
    shuffle: false,
    repeat: "none", // "none" | "one" | "all"
    usingSynth: false,
    synthStart: 0,
    synthElapsed: 0,
  };

  /* ---------- Referencias DOM ---------- */
  const audio = document.getElementById("audio-player");
  const els = {
    cover: document.querySelectorAll(".js-p-cover"),
    title: document.querySelectorAll(".js-p-title"),
    artist: document.querySelectorAll(".js-p-artist"),
    progressBar: document.getElementById("progress-fill"),
    progressWrap: document.getElementById("progress-bar"),
    curTime: document.getElementById("cur-time"),
    durTime: document.getElementById("dur-time"),
    playBtn: document.getElementById("btn-play"),
    stopBtn: document.getElementById("btn-stop"),
    nextBtn: document.getElementById("btn-next"),
    prevBtn: document.getElementById("btn-prev"),
    shuffleBtn: document.getElementById("btn-shuffle"),
    repeatBtn: document.getElementById("btn-repeat"),
    volume: document.getElementById("volume"),
    select: document.getElementById("song-select"),
    visualizer: document.getElementById("visualizer"),
    top3: document.querySelectorAll(".top-card"),
  };

  /* ---------- Web Audio: analizador + sintetizador de respaldo ---------- */
  let audioCtx, analyser, sourceNode, dataArray;
  let synthOsc = null, synthGain = null;

  function ensureAudioGraph() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    try {
      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) {
      // Si el navegador ya conectó este elemento antes, ignoramos el error.
    }
  }

  function startSynthTone(freq) {
    stopSynthTone();
    synthOsc = audioCtx.createOscillator();
    synthGain = audioCtx.createGain();
    synthOsc.type = "sawtooth";
    synthOsc.frequency.value = freq;
    synthGain.gain.value = parseFloat(els.volume.value) * 0.06; // volumen bajo, es un tono de respaldo
    synthOsc.connect(synthGain);
    synthGain.connect(analyser);
    analyser.connect(audioCtx.destination);
    synthOsc.start();
    state.synthStart = audioCtx.currentTime - state.synthElapsed;
  }

  function stopSynthTone() {
    if (synthOsc) {
      try { synthOsc.stop(); } catch (e) {}
      synthOsc.disconnect();
      synthOsc = null;
    }
    if (synthGain) { synthGain.disconnect(); synthGain = null; }
  }

  /* ---------- Helpers de formato ---------- */
  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /* ---------- Cargar pista ---------- */
  function loadTrack(i, autoplay) {
    state.index = (i + playlist.length) % playlist.length;
    state.usingSynth = false;
    state.synthElapsed = 0;
    stopSynthTone();
    const track = playlist[state.index];

    audio.src = track.src;
    audio.currentTime = 0;
    els.progressBar.style.width = "0%";
    els.curTime.textContent = "0:00";
    els.durTime.textContent = fmt(track.duration);
    els.select.value = String(state.index);

    els.cover.forEach((el) => (el.src = track.cover));
    els.title.forEach((el) => (el.textContent = track.title));
    els.artist.forEach((el) => (el.textContent = track.artist));

    updateTop3Highlight();
    if (autoplay) play();
  }

  /* ---------- Play / Pause / Stop ---------- */
  function play() {
    ensureAudioGraph();
    if (audioCtx.state === "suspended") audioCtx.resume();
    state.playing = true;
    updatePlayIcons(true);

    if (state.usingSynth) {
      startSynthTone(playlist[state.index].freq);
    } else {
      const p = audio.play();
      if (p && p.catch) {
        p.catch(() => activateSynthFallback());
      }
    }
    requestAnimationFrame(tick);
    requestAnimationFrame(drawVisualizer);
  }

  function activateSynthFallback() {
    // El archivo mp3 no existe o no pudo cargarse: usamos un tono generado.
    state.usingSynth = true;
    ensureAudioGraph();
    if (state.playing) startSynthTone(playlist[state.index].freq);
  }

  audio.addEventListener("error", activateSynthFallback);

  function pause() {
    state.playing = false;
    updatePlayIcons(false);
    if (state.usingSynth) {
      state.synthElapsed = audioCtx.currentTime - state.synthStart;
      stopSynthTone();
    } else {
      audio.pause();
    }
  }

  function stop() {
    pause();
    state.synthElapsed = 0;
    if (state.usingSynth) {
      els.progressBar.style.width = "0%";
      els.curTime.textContent = "0:00";
    } else {
      audio.currentTime = 0;
    }
  }

  function togglePlay() {
    state.playing ? pause() : play();
  }

  function next() {
    const i = state.shuffle ? randomIndex() : state.index + 1;
    loadTrack(i, state.playing || true);
  }
  function prev() {
    const i = state.shuffle ? randomIndex() : state.index - 1;
    loadTrack(i, state.playing || true);
  }
  function randomIndex() {
    let r;
    do { r = Math.floor(Math.random() * playlist.length); } while (r === state.index && playlist.length > 1);
    return r;
  }

  function toggleShuffle() {
    state.shuffle = !state.shuffle;
    els.shuffleBtn.classList.toggle("active", state.shuffle);
  }

  function cycleRepeat() {
    state.repeat = state.repeat === "none" ? "all" : state.repeat === "all" ? "one" : "none";
    els.repeatBtn.classList.toggle("active", state.repeat !== "none");
    els.repeatBtn.textContent = state.repeat === "one" ? "🔂" : "🔁";
  }

  /* ---------- Progreso / seek ---------- */
  function tick() {
    if (!state.playing) return;
    const track = playlist[state.index];
    let cur, dur;

    if (state.usingSynth) {
      dur = track.duration;
      cur = audioCtx.currentTime - state.synthStart;
      if (cur >= dur) { handleTrackEnd(); return; }
    } else {
      dur = audio.duration && !isNaN(audio.duration) ? audio.duration : track.duration;
      cur = audio.currentTime;
    }

    els.progressBar.style.width = `${(cur / dur) * 100}%`;
    els.curTime.textContent = fmt(cur);
    els.durTime.textContent = fmt(dur);
    updateTop3Progress(cur, dur);

    requestAnimationFrame(tick);
  }

  audio.addEventListener("ended", handleTrackEnd);
  function handleTrackEnd() {
    if (state.repeat === "one") { loadTrack(state.index, true); return; }
    if (state.repeat === "none" && state.index === playlist.length - 1 && !state.shuffle) {
      stop();
      return;
    }
    next();
  }

  function seekTo(clientX) {
    const rect = els.progressWrap.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const track = playlist[state.index];
    if (state.usingSynth) {
      state.synthElapsed = pct * track.duration;
      state.synthStart = audioCtx.currentTime - state.synthElapsed;
    } else {
      const dur = audio.duration && !isNaN(audio.duration) ? audio.duration : track.duration;
      audio.currentTime = pct * dur;
    }
    els.progressBar.style.width = `${pct * 100}%`;
  }

  /* ---------- Visualizador ---------- */
  function buildVisualizerBars() {
    if (!els.visualizer) return;
    els.visualizer.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement("span");
      els.visualizer.appendChild(bar);
    }
  }
  function drawVisualizer() {
    if (!state.playing || !els.visualizer) return;
    const bars = els.visualizer.children;
    if (analyser) {
      analyser.getByteFrequencyData(dataArray);
      for (let i = 0; i < bars.length; i++) {
        const v = dataArray[i % dataArray.length] || 4;
        bars[i].style.height = Math.max(4, (v / 255) * 24) + "px";
      }
    }
    requestAnimationFrame(drawVisualizer);
  }

  /* ---------- UI helpers ---------- */
  function updatePlayIcons(isPlaying) {
    if (els.playBtn) els.playBtn.textContent = isPlaying ? "⏸" : "▶";
    els.top3.forEach((card) => {
      const btn = card.querySelector(".t-play");
      if (!btn) return;
      const idx = Number(card.dataset.index);
      btn.textContent = isPlaying && idx === state.index ? "⏸" : "▶";
    });
  }
  function updateTop3Highlight() {
    els.top3.forEach((card) => {
      card.classList.toggle("is-active", Number(card.dataset.index) === state.index);
    });
    updatePlayIcons(state.playing);
  }
  function updateTop3Progress(cur, dur) {
    const card = document.querySelector(`.top-card[data-index="${state.index}"]`);
    if (!card) return;
    const bar = card.querySelector(".mini-progress > span");
    const t1 = card.querySelector(".t-cur");
    const t2 = card.querySelector(".t-dur");
    if (bar) bar.style.width = `${(cur / dur) * 100}%`;
    if (t1) t1.textContent = fmt(cur);
    if (t2) t2.textContent = fmt(dur);
  }

  /* ---------- Construir el <select> con las 10 canciones ---------- */
  function buildSelect() {
    if (!els.select) return;
    els.select.innerHTML = playlist
      .map((t, i) => `<option value="${i}">${t.title} — ${t.artist}</option>`)
      .join("");
  }

  /* ---------- Eventos de UI ---------- */
  function bindEvents() {
    els.playBtn?.addEventListener("click", togglePlay);
    els.stopBtn?.addEventListener("click", stop);
    els.nextBtn?.addEventListener("click", next);
    els.prevBtn?.addEventListener("click", prev);
    els.shuffleBtn?.addEventListener("click", toggleShuffle);
    els.repeatBtn?.addEventListener("click", cycleRepeat);
    els.volume?.addEventListener("input", (e) => {
      const v = parseFloat(e.target.value);
      audio.volume = v;
      if (synthGain) synthGain.gain.value = v * 0.06;
    });
    els.select?.addEventListener("change", (e) => loadTrack(Number(e.target.value), true));
    els.progressWrap?.addEventListener("click", (e) => seekTo(e.clientX));

    els.top3.forEach((card) => {
      const idx = Number(card.dataset.index);
      card.querySelector(".t-play")?.addEventListener("click", () => {
        if (state.index === idx) { togglePlay(); }
        else { loadTrack(idx, true); }
      });
    });
  }

  /* ---------- Init ---------- */
  function init() {
    if (!audio) return;
    audio.volume = parseFloat(els.volume?.value ?? 0.7);
    buildSelect();
    buildVisualizerBars();
    bindEvents();
    loadTrack(0, false);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Player.init);
