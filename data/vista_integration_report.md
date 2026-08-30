# Etapa 3 — Comparación de las preguntas de Vista contra el banco actual

Fuente: `VISTA_PROCESADA_PARA_OPE365.md`. Banco de referencia: `questions_all.json` (952 preguntas, previo a esta migración).

## Hallazgo de fuente: solo hay 67 preguntas en el documento, no 69

El documento declara "69 preguntas" en varios sitios (§1, §13, §20), pero el Anexo B
(§20) solo contiene bloques `**Q-XXX**` para los números **001 a 065, 068 y 069**.
Los números **Q-066** y **Q-067** no aparecen en ningún sitio del documento — no hay
enunciado, opciones ni respuesta para ellos. Verificado con grep sobre el fichero
completo (67 coincidencias de `**Q-\d+**`, no 69).

No se han inventado esas dos preguntas para completar la cifra. Se integran las 67
que sí existen. Si el usuario tiene el documento fuente original con Q-066/Q-067,
puede añadirlas después siguiendo el mismo proceso — este es exactamente el tipo de
"problema de fuente" que el propio documento pide declarar en vez de resolver en
silencio (§18).

Igualmente sin verificar en esta pasada: la cifra de 46 flashcards (se revisa en el
mismo formato en la Etapa 5).

## Clusters del banco actual relevantes para la comparación

Además de `bloque 9-10` de `1.txt` (que ya se había detectado en el diagnóstico
previo), esta comparación encontró más solapamiento real:

- `1.txt` bloque 9-10 (`1-87` a `1-96`): vista predeterminada, atajo Diseño de
  impresión, rango de zoom, control deslizante — ángulo "Barra de estado".
- `2.txt` (`2-20`, `2-21`, `2-60`): ubicación física del control de Zoom — ángulo
  "Elementos principales de la ventana".
- `3.txt` (`3-37` a `3-62`, `3-74`): idem, "¿qué elemento de la ventana es...?".
- `7.txt` (`7-10` a `7-50`): "Área de vistas" — el propio banco lo llama
  "BANCO TORTURADO — PÁGINA 7" y varias explicaciones se autocalifican como
  "conocimiento inferido" (`7-43`) o admiten que el atajo real no se menciona en la
  fuente usada (`7-12`).
- `8.txt` (`8-53`, `8-141`, `8-142`, `8-227`): atajos Alt+F8/Alt+F11 (macros/VBA) y
  SharePoint en el contexto de Backstage → Cuenta (concepto distinto del botón
  Propiedades del Grupo SharePoint de Vista, aunque comparta el nombre).

## Conflicto real detectado (no resuelto en silencio)

**`1-96` (banco actual) vs `Q-021`/§4.5/§6/§19 (documento de Vista):**

- `1-96` afirma que los porcentajes predefinidos del cuadro de diálogo Zoom son
  **200%, 100% y 75%** (respuesta C, explícita en la explicación).
- El documento de Vista afirma en tres sitios distintos (§4.5, la transcripción del
  cuadro de diálogo en §6, y la propia `Q-021`) que las opciones son
  **200%, 100% y 25%** — no 75%.

No se ha modificado `1-96`. Se necesita verificación contra Word 365 real (o el PDF
de la academia) antes de decidir cuál de las dos cifras es correcta — por la regla
de fuentes del CLAUDE.md, una prueba en vivo del usuario zanjaría esto al instante.
Mientras tanto, la pregunta nueva basada en `Q-021` se incorpora con una nota de
`sourceIssue` señalando el conflicto, y `1-96` se deja intacta.

## Nota aparte (no es de Vista, pero salió a la luz en esta comparación)

`1-89` (banco actual) dice que el "Área de vistas" de la Barra de estado tiene
**4** iconos (Concentración, Modo lectura, Diseño de impresión, Diseño web).
`7-26`/`7-41` (banco actual, ambas) dicen que tiene **3** (Modo lectura, Diseño de
impresión, Diseño Web — sin Concentración). Es una contradicción preexistente
**entre dos preguntas del banco actual**, anterior a esta migración y no causada por
Vista. Se deja constancia aquí porque apareció durante la comparación, pero no se
toca ninguna de las dos preguntas — no estaba en el alcance de esta etapa.

## Clasificación de las 67 preguntas de Vista

Leyenda: **NUEVA** (se incorpora tal cual) · **SOLAPAMIENTO** (mismo hecho ya
cubierto, no se incorpora o se incorpora solo si aporta ángulo distinto) ·
**MEJORA** (sustituye en calidad a una existente, la existente NO se borra) ·
**COMPLEMENTARIA** (mismo hecho, formato/ángulo distinto, aporta valor real) ·
**CONFLICTO** (dato contradictorio, ver arriba).

### Bloque 1 — Grupo Vistas (15)

| ID Vista | Clasificación | Motivo |
|---|---|---|
| Q-001 | SOLAPAMIENTO | Vista predeterminada = Diseño de impresión, ya cubierto por `1-87` y `7-10` (dos ángulos distintos ya existen) |
| Q-008 | NUEVA | Trampa "4 páginas" del Modo de lectura — no existe |
| Q-069 | NUEVA | Función de Vista Borrador — no existe |
| Q-002 | SOLAPAMIENTO | Atajo Ctrl+Alt+D, duplica `1-88` casi exactamente |
| Q-003 | NUEVA | Trampa V/F sobre Vista Esquema — no existe |
| Q-004 | NUEVA | Relleno Vista Esquema — no existe |
| Q-005 | NUEVA | Escenario encabezados/pies → Vista Borrador — no existe |
| Q-006 | NUEVA | Matiz "lista abierta" de Vista Borrador — no existe |
| Q-009 | MEJORA de `7-43` | Misma función (Diseño Web), la de Vista está verificada; `7-43` se autocalifica "inferido" |
| Q-010 | NUEVA | Función de Vista Preliminar — no existe |
| Q-052 | NUEVA | Trampa V/F Diseño de impresión — no existe |
| Q-053 | NUEVA | Selección múltiple Diseño de impresión — no existe |
| Q-051 | NUEVA | Emparejamiento 5 vistas↔característica — no existe en este formato |
| Q-007 | COMPLEMENTARIA | Emparejamiento atajo↔vista; solapa en Ctrl+Alt+D con `1-88` pero formato/alcance distinto |
| Q-065 | COMPLEMENTARIA | Relleno 5 atajos; refuerza en otro formato |

### Bloque 2 — Inmersivo (4)

| Q-011 | NUEVA | Nada existente sobre Concentración/Immersive Reader |
| Q-012 | NUEVA | ídem |
| Q-013 | NUEVA | ídem |
| Q-063 | NUEVA | ídem |

Nota de vigilancia (no conflicto): `7-21` ("leer sin distracciones" → Modo lectura)
y `Q-011` ("concentrarse... eliminar elementos visuales" → Concentración) son
escenarios distintos (leer vs. redactar) pero fraseo cercano — vigilar que no se
mezclen en el mismo test sin contexto suficiente.

### Bloque 3 — Movimiento de Página (2)

| Q-068 | NUEVA | Nada existente |
| Q-014 | NUEVA | Nada existente |

### Bloque 4 — Mostrar (3)

| Q-015 | NUEVA | Nada existente sobre el Grupo Mostrar como tal (el banco tiene ~20 preguntas sobre "la Regla" en `5.txt`, pero como elemento general de interfaz, no como toggle Mostrar/Ocultar de Vista — ángulo distinto, se mantienen separadas) |
| Q-016 | NUEVA | ídem |
| Q-017 | NUEVA | ídem |

### Bloque 5 — Zoom (7)

| Q-018 | SOLAPAMIENTO | Rango 10%-500%, duplica `1-90` |
| Q-019 | NUEVA | Trampa Zoom vs 100% — no existe |
| Q-060 | NUEVA | Selección múltiple acciones de zoom — no existe |
| Q-020 | COMPLEMENTARIA | Incrementos de 10 con Ctrl+rueda; `1-91` da el mismo valor pero para el control deslizante +/-, mecanismo distinto |
| Q-021 | NUEVA (con CONFLICTO anotado) | Ver conflicto con `1-96` arriba |
| Q-022 | COMPLEMENTARIA | Relleno del mismo dato que `1-90`, formato distinto |
| Q-062 | COMPLEMENTARIA | ídem, relleno extenso |

### Bloque 6 — Ventana (12)

Ninguna pregunta existente cubre Nueva ventana / Dividir / Ver en paralelo /
Organizar todo / Desplazamiento sincrónico / Restablecer posición / Cambiar
ventanas. **Las 12 son NUEVA**: Q-026, Q-030, Q-023, Q-024, Q-027, Q-028, Q-029,
Q-025, Q-054, Q-055, Q-056, Q-059.

### Bloque 7 — Macros (11)

| Q-034 | SOLAPAMIENTO | Alt+F8 → diálogo Macros, duplica `8-142` |
| Q-035 | SOLAPAMIENTO | Alt+F11 → Visual Basic, duplica `8-141` y `8-227` (¡ya está por duplicado en el banco actual!) |
| Q-036 | COMPLEMENTARIA | V/F sobre la inversión F8/F11, formato distinto, refuerza la distinción |
| Q-031 | NUEVA | Definición de macro — no existe |
| Q-058 | NUEVA | Trampa "macro = un único comando" — no existe |
| Q-033 | NUEVA | Propósito (tareas frecuentes) — no existe |
| Q-037 | NUEVA | Submenú del botón Macros — no existe |
| Q-038 | NUEVA | "Pausar grabación" en gris — no existe |
| Q-032 | NUEVA | Relleno definición — no existe |
| Q-064 | NUEVA | Selección múltiple estructura — no existe |
| Q-057 | COMPLEMENTARIA | Emparejamiento; solapa parcialmente en F8/F11 pero añade Ver/Grabar/Pausar |

### Bloque 8 — SharePoint (2)

| Q-039 | NUEVA | `8-53` habla de SharePoint en Backstage→Cuenta, concepto distinto del botón Propiedades del Grupo SharePoint de Vista |
| Q-040 | NUEVA | ídem |

### Bloque 9 — Integración (11)

| Q-042 | NUEVA | Nada existente |
| Q-043 | NUEVA | Nada existente |
| Q-044 | NUEVA | Nada existente |
| Q-045 | COMPLEMENTARIA | Atajo Alt+F8 ya visto en `8-142`, pero aquí en el contexto "pertenece a qué grupo" |
| Q-046 | NUEVA | Trampa posición de la pestaña Vista — no existe |
| Q-047 | NUEVA | Diferencia Modo lectura vs Vista Preliminar — no existe |
| Q-050 | NUEVA | Diferencia Organizar todo vs Ver en paralelo — no existe |
| Q-048 | NUEVA | Relleno 7 grupos — no existe |
| Q-049 | NUEVA | Función Immersive Reader (variante) — no existe fuera del propio bloque Vista |
| Q-041 | COMPLEMENTARIA | Emparejamiento amplio de atajos, solapa parcialmente pero formato/alcance distinto |
| Q-061 | NUEVA | Emparejamiento grupo↔función — no existe |

## Resumen numérico

- Documento de Vista: 67 preguntas reales (no 69 — ver hallazgo arriba).
- SOLAPAMIENTO (no se incorporan como preguntas nuevas, el hecho ya está cubierto): 5 — Q-001, Q-002, Q-018, Q-034, Q-035.
- MEJORA (se incorpora, la existente `7-43` se deja intacta): 1 — Q-009.
- CONFLICTO detectado (se incorpora con nota, no se resuelve en silencio): 1 — Q-021 (vs `1-96`).
- COMPLEMENTARIA (se incorporan, aportan formato/ángulo real): 9 — Q-007, Q-020, Q-022, Q-036, Q-057, Q-041, Q-045, Q-062, Q-065.
- NUEVA (se incorporan sin más): 51.
- **Total a incorporar en `data/questions/vista.json`: 62** (67 − 5 solapamiento puro).

Ninguna pregunta existente del banco de 952 se ha modificado ni eliminado en esta
etapa.
