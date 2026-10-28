# Auronx.777 — Perfil personal 

Sitio 100% HTML5 + CSS3 + JavaScript (ES6+), sin frameworks. Funciona abriendo `index.html` directamente en el navegador.

## Estructura

```
index.html
Style.css        → variables, layout y componentes
animations.css   → todas las @keyframes
responsive.css   → media queries (móvil / tablet / ultrawide)
js/
  theme.js         → cambio de tema + localStorage
  animations.js    → fondo de partículas, cursor personalizado, ripple
  music.js         → reproductor completo, playlist, visualizador
  main.js          → scroll reveal, contadores animados, barras de skills
img/
  galeria/         → coloca aquí tus fotos si quieres reemplazar los placeholders
music/
  song1.mp3 ... song10.mp3
```

## Imágenes

Las fotos de perfil, galería y portadas de álbum usan `picsum.photos`
como placeholder (no requieren conexión especial ni API key). Reemplaza
esas URLs por tus propias imágenes en `img/` cuando quieras.

## Temas

Selector con 4 temas de Minecraft (Overworld, Diamante, Nether, End)
que cambia variables CSS vía `data-theme` en `<html>` y guarda la
preferencia en `localStorage`.
