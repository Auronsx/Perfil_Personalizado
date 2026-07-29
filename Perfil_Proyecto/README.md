# Auronx.777 — Perfil personal (temática Minecraft)

Sitio 100% HTML5 + CSS3 + JavaScript (ES6+), sin frameworks. Funciona abriendo `index.html` directamente en el navegador.

## Estructura

```
index.html
css/
  style.css        → variables, layout y componentes
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

## Sobre el audio (importante)

El reproductor está listo para tus archivos reales: coloca 10 MP3 en `/music/`
con los nombres `song1.mp3` a `song10.mp3` (o edita las rutas en
`js/music.js`, array `playlist`) y sonarán de inmediato con todos los
controles: play, pausa, stop, siguiente, anterior, aleatorio, repetir,
volumen, barra de progreso arrastrable y visualizador de frecuencias en
tiempo real (Web Audio API `AnalyserNode`).

Como esta entrega no puede incluir archivos de audio con derechos (ni
descargarlos desde este entorno), **si un MP3 no existe todavía**, el
reproductor lo detecta automáticamente y genera un tono de sustitución
con un oscilador de la Web Audio API, para que puedas probar toda la
interfaz (progreso, siguiente/anterior, visualizador, etc.) sin que nada
se rompa. En cuanto agregues tus archivos reales, se reproducirán ellos
en vez del tono.

## Imágenes

Las fotos de perfil, galería y portadas de álbum usan `picsum.photos`
como placeholder (no requieren conexión especial ni API key). Reemplaza
esas URLs por tus propias imágenes en `img/` cuando quieras.

## Temas

Selector con 4 temas de Minecraft (Overworld, Diamante, Nether, End)
que cambia variables CSS vía `data-theme` en `<html>` y guarda la
preferencia en `localStorage`.
