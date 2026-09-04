# data/ — fuentes de contenido

Todo lo editable a mano vive aquí. Los artefactos que sirve la web
(`questions_all.json`, `questions_data.js`, `taxonomy_data.js`,
`flashcards_data.js`) se **generan** con `python build_data.py` desde estos
ficheros y NO se editan a mano.

## Estructura

```
data/
  questions/<pestaña>.json      banco de preguntas, 1 archivo por pestaña
  questions/manifest.json       orden de carga (= orden de taxonomía)
  flashcards/<pestaña>.json     flashcards, 1 archivo por pestaña
  flashcards/manifest.json      orden de carga
  taxonomy.json                 section > topic > subtopic
  rutas/<pestaña>.txt           volcado de rutas de cinta del usuario (ver rutas/README.md)
  atajos_word365_v2608.md       volcado de "Personalizar teclado" — ÚNICA fuente de atajos
  ATAJOS_WORD365.md             referencia legible de atajos, agrupada por función
  *_integration_report.md       informes de integración de cada bloque grande
```

Las 10 pestañas: `interfaz`, `archivo`, `inicio`, `insertar`, `diseno`,
`disposicion`, `referencias`, `revisar`, `vista`, `correspondencia`.

## Reglas de orden (sep-2026 — "quiero orden")

1. **Una pestaña = un archivo.** Toda pregunta o flashcard nueva de una
   pestaña va a `questions/<pestaña>.json` / `flashcards/<pestaña>.json`.
   Nunca un archivo suelto por bloque.
2. **Agrupado por `topic`** dentro de cada archivo, en el orden en que los
   topics aparecen en `taxonomy.json`. Dentro de un topic, por id numérico.
3. **Ids de pregunta estables.** `<pestaña>-<n>`. Hay huecos por borrados
   (documentados en CLAUDE.md) — NO se renumera: CLAUDE.md y el motor
   referencian ids concretos. Provenance en `sourceQuestionId` / `bloque`.
   (Excepción histórica: `diseno.json` se renumeró 1..70 al ser nuevo.)
4. **cardId de flashcard** = `F-NNN` (contenido) o `E-NNN` (error), 3
   dígitos. `canonicalId` runtime = `<section>:<cardId>`.
5. Tras tocar cualquier cosa aquí: `python build_data.py` y luego los
   tests (`node tests/test_*.js`).

## Scripts de mantenimiento

`scripts/` guarda los generadores/normalizadores one-shot (con su mapa de
ids cuando renumeran). El orden por topic lo aplica
`scripts/normalize_order.py`.
