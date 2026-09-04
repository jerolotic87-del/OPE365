# docs/ — documentos de diseño y planificación

No los carga la app (`build.py` no toca esta carpeta) ni el tests. Son
registro histórico de decisiones, útiles para no repetir análisis ya
hechos.

- `UI_REDISENO.md` — análisis y plan del rediseño de la interfaz (ago-2026).
  **Ya implementado** en `main` (nav Inicio·Temario·Práctica·Flashcards·
  Progreso, Temario como área propia, wizard con `.config-panel`,
  flashcards con flip 3D, Inicio adelgazado). Verificado de nuevo en
  sep-2026 con el walkthrough de Chromium (`tests/manual_walkthrough_fase2.mjs`,
  42/42). Queda pendiente, aparte y sin empezar, el renombrado de pestañas
  a nomenclatura por verbos — ver memoria `ia-navegacion-plan` (bloqueado
  a propósito hasta correr una prueba de usuarios).
- `memory-engine.html` — artefacto publicado con el análisis del motor de
  aprendizaje (`engine.js`/`engine-bridge.js`): el modelo de dos ejes
  (masteryStatus/reviewState), la tabla de honestidad `P`, etc.
- `plan-inteligente.html` — artefacto publicado con el diseño de la
  planificación de examen (fecha, minutos/día, capa de examen de
  `recalc()`/`examReadiness()`).

Ambos `.html` son copias locales de Artifacts ya publicados — documentación
de referencia, no parte del build.
