# Rediseño de la interfaz — ago-2026

## 1. Análisis de la interfaz anterior

La app **ya tenía** un sistema de diseño "v2" decente (`styles.css`: tokens en
`:root`, paleta oscura #0A1120/#5B9BFF, `prefers-reduced-motion`,
`:focus-visible`, bottom-nav móvil) y pantallas bien resueltas (runner "la
pregunta domina", asistente con divulgación progresiva, examen con cronómetro +
navgrid). Lo que fallaba era **arquitectura de información**:

- Nav: Inicio / **Estudiar** / **Tests** / Flashcards / Progreso.
- "Estudiar" (`renderStudyHub`) era un cajón de sastre: accesos de práctica +
  rejilla de 10 tarjetas de Temario + accesos de Tests, todo al mismo nivel.
- "Temario" no era un área; vivía como rejilla de tarjetas diminutas.
- Historial y desafíos colgaban de "Tests", no de Progreso.
- Flashcards: 6 `<select>` en una `filter-bar` + tabla como experiencia
  principal; el estudio usaba "Marcar dominada / Repasar de nuevo".
- `.action-grid` de tarjetas usado en todas partes como si fuera una lista
  ("card hell").

## 2. Nueva arquitectura de información

**5 áreas**, cada una con una responsabilidad:

| Área | Para qué | Antes |
|---|---|---|
| **Inicio** | Dashboard: continuar · estado · empezar | mezclado con "reciente" y empty-panels |
| **Temario** | Explorar Word 365 por pestaña → grupo → contenido | rejilla dentro de "Estudiar" |
| **Práctica** | Configurar una sesión (práctica o examen) | asistente escondido bajo Estudiar/Tests |
| **Flashcards** | Repasar (una tarjeta a la vez) | tabla filtrable |
| **Progreso** | Rendimiento · repasar fallos · retos e historial | repartido entre Tests y Progreso |

"Tests" desaparece como pestaña: crear examen = el asistente con toggle
Práctica/Examen; desafíos, historial, comparativas e "introducir código" →
Progreso › "Retos y actividad"; Duelo en vivo → acceso desde Inicio y Práctica.

## 3. Decisiones UX principales

- **Listas, no tarjetas**, cuando el contenido es una lista: Temario
  (`.progress-list`), grupos de una pestaña, Repaso de Progreso, Retos
  (`.nav-list`). Las tarjetas (`.choice-card`, `.action-card`) se reservan para
  "elige una de estas opciones".
- **Divulgación progresiva** en Práctica: los `<select>` de pestaña/grupo/tipo
  ya no "flotan" sobre el fondo; aparecen dentro de un `.config-panel`
  contextual solo cuando el ámbito elegido lo pide.
- **Flashcards como repaso**: pantalla centrada en una tarjeta con flip 3D
  (`transform: rotateY`, con fallback para `reduced-motion`), y el binario de
  repetición espaciada "No la recordaba / La recordaba" que marca estado y
  avanza. La tabla completa pasa a una pestaña secundaria "Todas".
- **Inicio prioriza**: 1) continuar, 2) estado (una fila `.stat-strip`:
  racha, precisión, falladas, flashcards), 3) acciones. Sin dashboards de 20
  widgets.
- **Estado seleccionado inequívoco**: `.choice-card.selected` = borde + fondo
  + check ✓; `.segmented .seg.on` con relleno sólido.
- Micro-interacciones cortas (selección, aparición de panel, flip, barras),
  todas tras `@media (prefers-reduced-motion)`.

## 4. Qué se conservó intacto

Motor (`app.js`, `window.OPE`), estado y `localStorage`, el router
`go()`/`render()` + delegación `[data-goto]`, el runner de examen (cronómetro,
navgrid, pausa), los 5 tipos de ejercicio, `buildSession`/`resolveQuestionIds`,
los códigos de compartir/reto `Q-`/`S-`/`T-`/`R-`, y todo el multijugador
(`multiplayer.js`, `renderMpSetup/Lobby/Game`). Solo cambió la capa de
presentación (`views.js` pantallas hub + `styles.css`).

## 5. Comprobaciones ejecutadas

- `node tests/test_*.js` — los 6 en verde (varios reescritos para la IA nueva).
- `node tests/manual_walkthrough_redesign.mjs` — 22 pasos en Chromium real:
  navegación de las 5 áreas, Temario → detalle → practicar, asistente completo
  (toggle, panel contextual, segmented, preview, empezar), responder + feedback,
  Flashcards (flip + binario), Progreso (secciones, historial, código), Duelo
  accesible, búsqueda, ajustes, y **responsive 375 px** (bottom-nav, sin scroll
  horizontal en Inicio / Temario detalle / asistente). **0 errores de consola.**
- `python build.py` → `OPE365_Word365_Estudio.html` regenerado.

## 6. Ficheros tocados

`views.js` (pantallas hub reescritas, router y contratos intactos),
`styles.css` (componentes nuevos: `.progress-list`/`.progress-row`,
`.nav-list`/`.nav-row`, `.segmented`/`.seg`, `.config-panel`, `.wz-stepper`,
`.stat-strip`, `.chip-row`, `.fc-cta`, `.flip-card`, `.fc-verdict`,
`.breadcrumb`), `index.html` sin cambios, `tests/test_temario.js` +
`test_wizard_por_pestana.js` + `test_flashcards.js` (adaptados),
`tests/manual_walkthrough*.mjs` (selectores actualizados).
