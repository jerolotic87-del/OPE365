# Esquema de ejercicios OPE365 — para generar `data/questions/*.json`

> **Nota (ago-2026):** el banco ya está normalizado. Formato canónico por
> pregunta: `id` = `"<section>-<n>"`, `sourceFile` = `"<section>.json"`,
> `bloque` = `"<Sección> — <Grupo>"`, `tema` = `"<Grupo>"` (todo derivado de
> `data/taxonomy.json`). **No** uses `sourcePage`, `blockRange`,
> `sourceIssue`, `qnumInSource`, `esCompletarBlank`, `versionIssue`,
> `topicId` (se eliminaron). `generado` solo si es `true`. Para reclasificar
> o reagrupar, mira `scripts/normalize_bank.py` como patrón.

La app solo entiende **5 tipos** de ejercicio. Cualquier otro (`distincion`,
`ordenacion`, `clasificacion`, etc.) hay que remapearlo a uno de estos o se
descarta.

Cada pregunta es un objeto JSON. El fichero es un array de esos objetos.

---

## Campos comunes a TODAS las preguntas

| Campo | Tipo | Obligatorio | Valor |
|---|---|---|---|
| `id` | string | ✅ | `"<sourceFile>-<n>"`, p.ej. `"revision-1"`. Correlativo, sin huecos. |
| `sourceFile` | string | ✅ | nombre del fichero, p.ej. `"revision.json"` (procedencia, no temario) |
| `bloque` | string | ✅ | agrupador de procedencia legible, p.ej. `"Revisar — Ortografía"` |
| `tipo` | string | ✅ | uno de: `opcion_unica` · `seleccion_multiple` · `verdadero_falso` · `emparejamiento` · `relleno` |
| `enunciado` | string | ✅ | texto de la pregunta. **Sin markdown** (`**negrita**`, backticks, etc.): texto plano |
| `opciones` | array | según tipo | `[{ "letter": "A", "text": "..." }, ...]` — ver cada tipo |
| `matching` | objeto\|null | según tipo | ver `emparejamiento` |
| `respuesta` | varía | ✅ | ver cada tipo |
| `explicacion` | string | ✅ (puede ser `""`) | se muestra tras responder |
| `categoria` | string | ✅ | `atajo` · `ruta` · `concepto` · `general` |
| `negativa` | bool | ✅ | `true` si el enunciado pide "señale la que NO / la incorrecta" |
| `section` | string\|null | recomendado | id de sección de la taxonomía, p.ej. `"revisar"` |
| `topic` | string\|null | recomendado | id de topic dentro de la sección (lista abajo) |
| `subtopic` | string\|null | opcional | texto libre corto o `null` |
| `tema` | string | opcional | etiqueta legible heredada (aún alimenta estadísticas). Usa el mismo texto que `bloque` sin el prefijo, p.ej. `"Ortografía"` |
| `difficulty` | string\|null | opcional | `"media"` o `"alta"` |
| `sourceQuestionId` | string\|null | opcional | id original del documento de origen, p.ej. `"Q-001"` |
| `generado` | bool | opcional | `true` solo si es una pregunta sintética de relleno de cobertura |

Campos que la app tolera pero que puedes omitir o poner a `null`:
`sourcePage`, `blockRange`, `sourceIssue`, `qnumInSource`, `esCompletarBlank`,
`versionIssue`. **No** metas `dificultad` (numérica), `angulo`, `cluster`,
`FIDs`, `imagen`, `imagenes`, `trampa`, `confianza` — no existen en el modelo.

**No incluir imágenes**: la app no renderiza imágenes en preguntas. Si un
ejercicio depende de "mira la captura X", hay que reescribirlo para que se
sostenga solo con texto o se descarta.

---

## 1. `opcion_unica` — una sola respuesta correcta

```json
{
  "id": "revision-1",
  "sourceFile": "revision.json",
  "bloque": "Revisar — Ortografía",
  "tipo": "opcion_unica",
  "enunciado": "¿Qué combinación de teclas abre el panel Editor en Word 365?",
  "opciones": [
    { "letter": "A", "text": "Alt + F7" },
    { "letter": "B", "text": "Mayús + F7" },
    { "letter": "C", "text": "Windows + F7" },
    { "letter": "D", "text": "Ctrl + Mayús + E" }
  ],
  "matching": null,
  "respuesta": "C",
  "explicacion": "La fuente declara F7 y Windows+F7 como equivalentes...",
  "categoria": "atajo",
  "negativa": false,
  "section": "revisar",
  "topic": "revision-ortografica",
  "subtopic": "Editor",
  "tema": "Ortografía",
  "difficulty": "media",
  "sourceQuestionId": "Q-001"
}
```

Reglas:
- `opciones`: mínimo 2. `letter` correlativo `A`, `B`, `C`, ...
- `respuesta`: **una sola letra** en string, tiene que existir en `opciones`.
- El texto de la opción no lleva el prefijo `"a) "` — solo el contenido.

---

## 2. `seleccion_multiple` — varias correctas

```json
{
  "tipo": "seleccion_multiple",
  "enunciado": "¿Cuáles de estas afirmaciones sobre el Control de cambios son correctas?",
  "opciones": [
    { "letter": "A", "text": "..." },
    { "letter": "B", "text": "..." },
    { "letter": "C", "text": "..." },
    { "letter": "D", "text": "..." }
  ],
  "matching": null,
  "respuesta": ["A", "C"],
  "explicacion": "...",
  "categoria": "concepto",
  "negativa": false
}
```

Reglas:
- `respuesta`: **array de letras**. El orden da igual (se compara ordenado).
- Mínimo 2 opciones; el array de respuesta no puede estar vacío.

---

## 3. `verdadero_falso`

```json
{
  "tipo": "verdadero_falso",
  "enunciado": "En Word 365, Alt + F7 abre el panel Editor completo.",
  "opciones": [],
  "matching": null,
  "respuesta": false,
  "explicacion": "Falso: Alt+F7 salta al siguiente error ortográfico...",
  "categoria": "atajo",
  "negativa": false
}
```

Reglas:
- `opciones`: array vacío `[]`.
- `respuesta`: **booleano** `true` / `false` (no `"Verdadero"`, no `"V"`).
- El enunciado es la afirmación a juzgar. Sin comillas angulares `« »` de adorno.

---

## 4. `emparejamiento` — relacionar columna izquierda con derecha

```json
{
  "tipo": "emparejamiento",
  "enunciado": "Relaciona cada atajo con su función:",
  "opciones": [],
  "matching": {
    "left": [
      { "id": "1", "label": "F7" },
      { "id": "2", "label": "Alt + F7" },
      { "id": "3", "label": "Mayús + F7" }
    ],
    "right": [
      { "id": "A", "label": "Editor" },
      { "id": "B", "label": "Error ortográfico siguiente" },
      { "id": "C", "label": "Sinónimos" }
    ],
    "correct": { "1": "A", "2": "B", "3": "C" }
  },
  "respuesta": { "1": "A", "2": "B", "3": "C" },
  "explicacion": "...",
  "categoria": "atajo",
  "negativa": false
}
```

Reglas:
- `matching.left` y `matching.right`: arrays de `{ id, label }`.
  - `id` de `left`: `"1"`, `"2"`, ... `id` de `right`: `"A"`, `"B"`, ...
- `matching.correct`: mapa `{ idLeft: idRight }` para **todos** los de `left`.
- `respuesta`: **igual que `matching.correct`** (duplicado literal).
- `right` puede tener alguna entrada de más (distractor) que no aparezca en `correct`.
- Se recomienda 3–7 filas.
- La forma `{"1. \`F7\`": "D. Editor"}` **no vale** — hay que expandirla a esta estructura.

---

## 5. `relleno` — completar huecos en el enunciado

```json
{
  "tipo": "relleno",
  "enunciado": "El atajo para insertar un nuevo comentario es [1]. El de Control de cambios es [2].",
  "opciones": [],
  "matching": null,
  "respuesta": [
    "Ctrl + Alt + A",
    ["Ctrl + Mayús + E", "Ctrl+Mayus+E"]
  ],
  "explicacion": "...",
  "categoria": "atajo",
  "negativa": false
}
```

Reglas:
- Los huecos en `enunciado` se marcan `[1]`, `[2]`, `[3]`... (con corchetes).
  Puedes repetir el mismo número si el mismo valor va en dos sitios.
- `respuesta`: **array, una entrada por número de hueco distinto, en orden**.
  - Cada entrada es un string, **o** un array de strings si aceptas variantes.
  - La comparación **ignora mayúsculas, tildes y espacios múltiples**, así que
    `"Ctrl + Alt + A"` ya acepta `"ctrl alt a"`. Solo necesitas variantes para
    diferencias reales de contenido (sinónimos, con/sin palabra).
- El número de huecos `[N]` distintos **debe** coincidir con `respuesta.length`
  o la app marca la pregunta como inválida.

---

## Tipos que NO existen — cómo remapear

| Tipo original | Remapeo |
|---|---|
| `distincion` ("¿en qué se diferencia X de Y?" con 4 opciones) | → `opcion_unica` tal cual |
| `ordenacion` (ordenar pasos) | no hay equivalente → **descartar** o convertir a `opcion_unica` ("¿cuál es el orden correcto?" con 4 secuencias como opciones) |
| `clasificacion` (meter items en grupos) | no hay equivalente → **descartar** o convertir a `emparejamiento` (item → grupo) si cada item va a un solo grupo |

---

## Taxonomía: `section` = `"revisar"`, `topic` ∈

```
revision-ortografica   (Editor, ortografía, gramática, sinónimos, corrección)
accesibilidad          (Comprobar accesibilidad, Leer en voz alta)
idioma                 (Idioma de edición, Traducir, Traductor)
seguimiento            (Control de cambios, comentarios, revisiones, panel)
comparar               (Comparar, Combinar documentos)
proteger               (Restringir edición, Bloquear autores, marcar como final)
```

`subtopic` es texto libre corto (`"Editor"`, `"Contar palabras"`, `null`).

---

# Flashcards — `data/flashcards/revision.json`

Array de objetos:

```json
{
  "cardId": "F-01",
  "section": "revisar",
  "topic": "revision-ortografica",
  "subtopic": "Editor",
  "cardType": "contenido",
  "priority": "alta",
  "front": "¿Qué atajo abre el panel Editor?",
  "back": "F7  ·  también Windows + F7",
  "sourceRefs": ["IONOS España"],
  "knowledgeRefs": [],
  "questionRefs": ["revision-1", "revision-3"]
}
```

| Campo | Obligatorio | Valor |
|---|---|---|
| `cardId` | ✅ | `"F-01"`, `"F-02"`... para tarjetas de contenido; `"E-01"`, `"E-02"`... para las de tipo error. Correlativo dentro de cada serie. |
| `section` | ✅ | `"revisar"` |
| `topic` | recomendado | mismos ids que arriba |
| `subtopic` | opcional | texto libre o `null` |
| `cardType` | ✅ en la práctica | `"contenido"` (normal) o `"error"` (ficha "NO CONFUNDIR" — pares que se confunden) |
| `priority` | ✅ en la práctica | `"alta"` o `"normal"` |
| `front` | ✅ | anverso, texto plano |
| `back` | ✅ | reverso, texto plano. Usa `·` para separar ítems |
| `sourceRefs` | opcional | array de strings (nombres de fuente) |
| `knowledgeRefs` | opcional | array (normalmente `[]`) |
| `questionRefs` | opcional | array de `id` de preguntas relacionadas (enlace blando, no fuente de verdad) |

No metas: `id`, `tipo: "flashcard"`, `bloque`, `frente`, `reverso`, `nota`,
`FIDs`. (`nota` → fúndela dentro de `back`.)

`canonicalId` **no** se pone en el fichero: lo calcula la app como
`"<section>:<cardId>"`.

---

## Regla de oro sobre el contenido (no negociable)

Jerarquía de fuentes para atajos/datos de examen:
1. Prueba en vivo del usuario en su Word 365.
2. `atajos_oficial.json` (volcado real de "Personalizar teclado").
3. PDFs de la academia.
4. Microsoft online en español (poco fiable).

Nunca inventes un atajo, una ruta o un distractor que no salga de una fuente
real. Si dos fuentes se contradicen, **decláralo** en el campo `sourceIssue`
o en un informe aparte — no lo resuelvas en silencio.

Atajos de "Revisar" ya confirmados en `atajos_oficial.json`:
`F7` = Revisión · `Alt+F7` = Error ortográfico siguiente ·
`Mayús+F7` = Sinónimos · `Ctrl+Mayús+G` = Contar palabras ·
`Alt+Ctrl+A` = Insertar comentario · `Alt+Ctrl+Espacio` = Leer en voz alta ·
`Ctrl+Mayús+F7` = Actualizar origen · `Alt+Ctrl+F7` = Conversión hangul hanja.

**Sin confirmar todavía** (no están en `atajos_oficial.json`): `Ctrl+Mayús+E`
para Control de cambios, `Alt+Mayús+F7` para Traducir. Márcalas con
`sourceIssue` hasta verificarlas.
