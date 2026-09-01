# Reagrupación del banco por pestaña — ago-2026

## Qué cambió

Antes: `data/questions/{1..8}.json` + `atajos.json` + `vista.json` +
`revision.json` + `inicio.json` — troceo por documento de origen
(`sourceFile` = `"1.txt"`, `"8.txt"`, `"ATAJOS.docx"`, …).

Después: **un archivo por pestaña** (`section` de la taxonomía).

| archivo | preguntas |
|---|---|
| `interfaz.json` | 519 |
| `archivo.json` | 170 |
| `inicio.json` | 393 |
| `insertar.json` | 47 |
| `disposicion.json` | 3 |
| `referencias.json` | 8 |
| `revisar.json` | 79 |
| `vista.json` | 155 |
| `correspondencia.json` | 7 |
| **total** | **1381** |

(`inicio.json` bajó de 417 a 393 en la limpieza de contenido posterior —
ver abajo.)

`diseno`: 0 preguntas → sin archivo (la sección sigue en la taxonomía).

## Transformación aplicada a cada pregunta

- `id` → `"<section>-<n>"` (n correlativo por sección).
- `sourceFile` → `"<section>.json"`.
- `sourceQuestionId` → el `id` viejo, **solo si no lo tenía ya** (las de
  Vista/Revisar/Inicio conservan su `Q-###` / `P-####`).
- Todo lo demás intacto: `bloque` (procedencia legible), `enunciado`,
  `opciones`, `respuesta`, `explicacion`, `tipo`, `categoria`, `negativa`,
  `section`/`topic`/`subtopic`, `difficulty`, `generado`.

`contentHash` no se toca: no depende de `id` ni `sourceFile`
(`contentHash()` en `app.js`). Verificado: los 1119 hashes de contenido
del banco pre-inicio siguen presentes 1:1 tras la reagrupación.

Orden de renumeración: `inicio.json` (banco curado) → `vista.json` →
`revision.json` → `1..8.json` → `atajos.json`, y dentro de cada sección se
conserva el orden de aparición. Por eso las 286 de Inicio curadas son
`inicio-1..286` y las 131 heredadas `inicio-287..417`; las 70 de Revisar
curadas `revisar-1..70` y las 9 heredadas `revisar-71..79`.

## Ficheros de apoyo

- `scripts/regroup_by_section.py` — script one-shot (con verificación
  interna: aborta si alguna pregunta difiere del original en algo que no
  sea `id`/`sourceFile`/`sourceQuestionId`).
- `scripts/regroup_id_map.json` — `{ id_viejo: id_nuevo }` para las 1405.

## Efectos colaterales

- `data/flashcards/revision.json` → `revisar.json`; sus `questionRefs`
  (y las de `vista.json`) remapeadas con `regroup_id_map.json`. 166 refs,
  0 sin match.
- Códigos de compartir/reto (`Q-`/`S-`/`T-`/`R-`) ya generados que
  embeban ids viejos dejan de resolver. Asumido.

## Limpieza de contenido de Inicio (`scripts/cleanup_inicio_content.py`)

Paso posterior a la reagrupación. `inicio.json`: 417 → 393.

- **Borradas 18** V/F auto-generadas (`8vf-*`): "Afirmación para valorar:
  «¿...?» — Respuesta propuesta: X", cada una reescritura mecánica de una
  `opcion_unica` hermana que sigue en el banco.
- **Borrados 6 duplicados exactos** ya cubiertos por el banco curado:
  `8-110` (Ctrl+E), `8-119` (Ctrl+M Fuente), `8-139` (Ctrl+S),
  `8-164` (Ctrl+B), `8-334` (F5 Ir a), `8-335` (Ctrl+I Ir a).
- **Conflicto Ctrl+Mayús+S resuelto** a favor de `atajos_oficial.json`
  (nivel 2): Ctrl+Mayús+S = Subrayado; Ctrl+Mayús+W = Aplicar estilos.
  `inicio-91` cambió respuesta C→B; `inicio-13/90/92` corrigieron la
  explicación. Ver CLAUDE.md → "Contexto importante ya resuelto".
- **Ctrl+R**: corregidas las explicaciones de `inicio-298` (era `8-115`)
  e `inicio-356` (era `8-283`) — Ctrl+R no tiene acción asignada. (La 3ª,
  `8vf-11`, se fue en la poda.)
- **`categoria: "procedimiento"`** (80 preguntas, "¿qué botón/opción
  usar?") remapeada a **`ruta`** — el registro de `app.js` vuelve a ser
  exactamente `atajo/ruta/concepto/general`.
