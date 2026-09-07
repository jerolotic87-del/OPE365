# Tarea: hacer que las preguntas CON IMAGEN funcionen en TODA la app OPE365, incluido multijugador

> Prompt preparado (sep-2026) para una sesión fría de Opus. Autocontenido:
> no asume contexto de la conversación en que se creó.

## Repo
`D:\Descargas\JSON\OPE365` — app de estudio de Word 365 para oposición. HTML único sin
backend: index.html + app.js + engine.js + engine-bridge.js + content-overrides.js +
github-sync.js + multiplayer.js + views.js. Lee `CLAUDE.md` ENTERO antes de tocar nada
(reglas de fuente estrictas, disciplina de pruebas, arquitectura de sesiones y de
multijugador). `python build_data.py` tras tocar `data/`. Tests jsdom en `tests/`
(`node tests/test_<n>.js`). QA navegador real: `tests/manual_*.mjs` con Playwright
(headed Chromium ya instalado en `~/AppData/Local/ms-playwright`).

## Contexto de lo que se acaba de añadir (sesión previa)
- El banco tiene ~190 preguntas CON IMAGEN (campo `imagen` = data URI). Son de tipo
  `opcion_unica`: muestran el icono recortado de un comando de la cinta y preguntan
  qué comando es. `sourceQuestionId` empieza por `img-`. Se filtran con
  `O.filterQuestions({conImagen:true})` (app.js) y se propagan por
  `resolveQuestionIds` / `buildSession` (`config.conImagen`).
- Se creó una NUEVA área raíz **"Iconos"** en views.js: `renderIconos()` (busca esa
  función), añadida a `PRIMARY_TABS`, `ROOT_VIEWS`, `groupForView` y al dispatch de
  `render()`. Arma una sesión de práctica con `conImagen:true` y la lanza por el
  runner normal (`O.buildSession` → `O.setSession` → `go("running")`). QA:
  `tests/manual_iconos_qa.mjs` (pasa).
- El runner de práctica (`renderRunner` en views.js, ~línea 1365) SÍ pinta la imagen:
  `${qImageHtml(q.imagen, "q|"+q.id)}`. El editor ✎ y el lightbox también.

## El problema a resolver
1. **Multijugador NO soporta imágenes, a propósito.** En `multiplayer.js`,
   `buildBoard()` de Duelo/Farol (~línea 420) y de Contra Word (~línea 776) EXCLUYE
   `q.imagen` del pool: `&& !q.imagen`. Motivo documentado: `renderMpGame`
   (Duelo/Farol, views.js ~4542) y `renderMpCoopGame` (Contra Word, ~4972) pintan
   `q.enunciado` + `#mp-q-body` pero NUNCA `q.imagen`, así que una pregunta de icono
   caería "irrespondible" (el enunciado dice "observa el icono" y no hay icono).
   El usuario quiere que **funcione** en multijugador, no que se siga excluyendo.
2. **Contra Word** convierte cada pregunta en una afirmación V/F con `buildWordPlan()`
   (multiplayer.js ~800). Una pregunta `opcion_unica` de icono ("¿qué comando es este
   icono?") como afirmación de Word ("Word dice que este icono es «SmartArt»,
   ¿verdadero o falso?") SÍ tiene sentido SI se pinta el icono. Hay que verificar que
   `buildWordPlan` la maneja bien (rama `opt`) y que `mpCoopCorrectText` muestra lo
   correcto.
3. Comprobar TODOS los sitios donde una pregunta se pinta o se transforma, no solo
   el runner:
   - runner de práctica/examen (`renderRunner`) — ya OK, verificar igualmente
   - multijugador Duelo (`renderMpGame` / `mpDuel*Html`)
   - multijugador Farol (mismo render, mecánica de cartas — ver `multiplayer.js`)
   - multijugador Contra Word (`renderMpCoopGame` / `mpCoopClaimHtml` /
     `mpCoopRenderBody` / `renderMpCoopResults` / `mpCoopCorrectText`)
   - repaso al final de multijugador (`mpDuelReviewHtml` / `mpCoopReviewHtml` /
     `mpPokerReviewHtml`, helpers `mpAnswerToText`/`mpReviewShell`/`mpReviewItemHtml`)
   - "Revisar respuestas" tras una sesión normal (`renderReviewHub` / review-detail)
   - desafíos asíncronos (challenge-*) y códigos de compartir (Q-/S-/T-/R-):
     `shareCodeForSession` propaga `conImagen`; probar que un test compartido con
     preguntas de icono se reconstruye con la imagen intacta
   - "Repasar preguntas" (filtro `#rv-imagen`) y el asistente de Práctica
     (scope "Iconos (con imagen)")
   - editor del banco (`renderBancoAdmin`) y modal ✎ — ya muestran `qImageHtml`
4. **Detalle cosmético conocido:** durante una sesión lanzada desde "Iconos", la nav
   superior marca "Práctica" (porque `groupForView("running")` → "practica"). Decide
   si merece la pena arreglarlo (haría falta un flag de origen de sesión) o se deja.

## Restricciones DURAS (no romper)
- NO tocar `go(view,params)`, `render()` ni la delegación global `[data-goto]` (tests
  y multijugador dependen de ellos). Añadir vistas está bien; cambiar el contrato no.
- Multijugador: el host compone el tablero ENTERO por VALOR en `config.qPayload`
  (preguntas ya con opciones barajadas, `respuesta` remapeada, `explicacion`), el
  invitado lo usa VERBATIM. Si se añade la imagen al pool, la imagen tiene que viajar
  en ese payload (o ser reconstruible por id en ambos lados). Revisa
  `buildSessionFromIds` y cómo se serializa el payload.
- El `<select>` de tipo de ejercicio del asistente de multijugador está limitado a
  propósito a los 4 tipos clásicos (relleno fuera). Si añades una opción "Iconos" o
  "con imagen" al multijugador, hazlo en ESE mismo sitio y de forma coherente.
- `data:` URIs pesan: ~190 imágenes ≈ 230 KB en `questions_all.json`. En multijugador
  el payload va por WebRTC entre móviles — vigila que un tablero de N preguntas de
  icono no infle el mensaje de config a un tamaño problemático. Si hace falta, que en
  multijugador la imagen se resuelva por id en cada lado en vez de viajar en el
  payload (asumiendo que ambos tienen el banco; si a un lado le falta la pregunta,
  ya hay lógica de descarte huérfano-seguro — respétala).
- `Math.random` prohibido en engine.js y en cualquier cosa reproducible; usar el PRNG
  con semilla.

## Qué entregar
1. Implementación: preguntas con imagen jugables en Duelo, Farol y Contra Word
   (pintando el icono en el render de la ronda y en el repaso final), o una decisión
   RAZONADA y documentada de por qué alguno de los 3 modos las mantiene fuera (con el
   `&& !q.imagen` justificado en comentario, no borrado a ciegas).
2. Que "Iconos" pueda lanzar/entrar en una partida multijugador de solo iconos, si
   encaja (opcional pero deseable — al menos que el asistente de multijugador permita
   filtrar "con imagen").
3. Tests nuevos jsdom que cubran: pregunta de icono en el pool de multijugador,
   render de la ronda con la imagen, y repaso final con la imagen. Patrón:
   `MP.createMockPair()` (ver `tests/test_multiplayer*.js` / `tests/test_ui_integration.js`).
4. QA en Chromium real: extiende `tests/manual_iconos_qa.mjs` o crea
   `tests/manual_iconos_mp_qa.mjs` que abra dos "páginas" con el transporte mock y
   verifique que una ronda de icono se ve con imagen en ambos lados.
5. Ejecuta ANTES y DESPUÉS: `node tests/test_engine.js` (20 escenarios),
   `node tests/test_ui_integration.js`, `node tests/test_multiplayer*.js`,
   `node tests/test_content_edit.js`, `node tests/test_banco_admin.js`, y la QA
   manual. Nada se da por bueno sin que pasen.
6. Actualiza `CLAUDE.md` (secciones de multijugador y de "preguntas CON IMAGEN") con
   lo que cambie y por qué.
7. Commits pequeños en `main` (ya estás en main), mensaje en español, terminando con:
   `Co-Authored-By: Claude Opus <noreply@anthropic.com>`

## Arranque sugerido
- `grep -n "!q.imagen\|q.imagen\|qImageHtml\|conImagen\|buildBoard\|buildWordPlan\|qPayload" multiplayer.js views.js app.js`
- Lee `renderMpGame`, `renderMpCoopGame`, `buildWordPlan`, `mpCoopClaimHtml`,
  `mpCoopCorrectText`, `mpDuelReviewHtml`, `mpCoopReviewHtml` enteras.
- Sirve la carpeta: `python -m http.server 8000 --directory .` y prueba en el
  navegador de verdad, no solo jsdom (CLAUDE.md insiste: jsdom no ve bugs de UI).
