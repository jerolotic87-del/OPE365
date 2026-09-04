# OPE365 — Word 365 para oposición ayuntamiento

Contexto para Claude Code. Léelo entero antes de tocar nada — este proyecto
tiene reglas de fuente estrictas que no son negociables.

## Qué es esto

App de estudio offline (un solo HTML, sin backend) para preparar el temario
de Word 365 de una oposición de ayuntamiento. **1702 preguntas** y **615
flashcards** (inicio 148, archivo 230, vista 79, revisar 73, insertar 28,
referencias 17, disposicion 16, correspondencia 15, diseno 9 — las ~375
de sep-2026 son tarjetas de RUTA: frente = la acción, dorso =
"Pestaña ▸ Grupo ▸ Comando", de `rutasyatajos.txt`), todo el banco
normalizado y agrupado por pestaña de la cinta
(`data/questions/<section>.json`). Práctica/examen con corrección
inmediata, compartir por código, desafíos asíncronos con resultado
sellado, un mazo de flashcards (frente/dorso, sin repetición espaciada
todavía), y tres modos multijugador en tiempo real (Duelo 1v1, Farol 1v1,
y Contra Word — cooperativo: los dos contra la app) sobre WebRTC vía PeerJS.

## Estructura de archivos (desarrollo local)

```
index.html          shell HTML — usa <script src> a los ficheros de abajo
styles.css           todo el sistema de diseño (oscuro, tokens en :root)
app.js                base: modelo canónico, sesiones, PRNG con semilla,
                       códigos de compartir, desafíos, estadísticas crudas
                       (computeStats), flashcards legado (§10). NO cambiar
                       contratos.
engine.js             MOTOR DE APRENDIZAJE (window.OPE.LE). Repetición
                       espaciada propia (no FSRS), priorizador, generador de
                       sesión, capa de examen. Dos ejes de estado INDEPENDIENTES:
                       masteryStatus (nuevo·aprendiendo·consolidando·asentado)
                       y reviewState (futuro·debido·atrasado). 'asentado' NO se
                       pierde por vencer el intervalo. Todo el tiempo entra por
                       un `now` param. Parámetros en el objeto `P` (tabla de
                       honestidad: PRINCIPIO/PRODUCTO/HEURÍSTICA/CALIBRABLE),
                       nunca en la UI. Validado con tests/sim.js + 20 escenarios.
engine-bridge.js      PUENTE motor↔UI (window.OPE.LEB). ÚNICO punto por el que
                       views.js habla con el motor. La UI no calcula
                       prioridades/intervalos/estados: todo sale de LEB, y LEB
                       de LE. boot()=siembra+recalc; recordQuestion/
                       recordFlashcard/recordExamSession alimentan el motor;
                       startSmartSession/startReviewSession/startConceptSession;
                       homeModel/progressModel/sectionConceptsModel = view-models.
github-sync.js        window.OPE.GHS. Publica tu contenido propio a
                       data/ del repo vía la API de GitHub (commit atómico).
                       Token en localStorage 'ope365_gh', fuera de PROGRESS.
multiplayer.js        Duelo · Farol · Contra Word: transporte PeerJS + máquinas de estado
views.js               toda la interfaz (router simple basado en funciones).
                       5 áreas (Inicio · Temario · Práctica · Flashcards ·
                       Progreso). El router `go(view,params)` + la delegación
                       global `[data-goto]` NO se tocan (tests y multiplayer
                       dependen de ellos). Inicio = "¿qué estudio ahora?" con
                       LEB.homeModel; Práctica = elección de intención antes
                       del asistente; el feedback de pregunta muestra una línea
                       + explicación plegada (categoría real, no campos
                       inventados); flashcards = 3 grados → LEB.recordFlashcard.
                       Toda llamada a LEB va guardada con `if(O.LEB)`.
peerjs.min.js          librería de terceros, no tocar
data/atajos_word365_v2608.md  VOLCADO COMPLETO de "Personalizar teclado" de la
                       instalación real del usuario (Word 365 v2608). ÚNICA
                       fuente de atajos — ver "jerarquía de fuentes". Nada en el
                       banco puede contradecirlo.
data/rutas/            UN .txt POR PESTAÑA con el volcado de rutas de cinta
                       del usuario (`<pestaña>.txt`, `<pestaña>-4opciones.txt`,
                       `<pestaña>_integration_report.md`). Fuente de los bancos
                       de RUTA/concepto. NO se editan a mano. Ver
                       `data/rutas/README.md`. `_dialogos_compartidos.md` =
                       cruce verificado (qué rutas abren el mismo cuadro y en
                       qué ficha) hecho contra las capturas.
data/imagenes_rutas/<pestaña>/  capturas de pantalla del usuario (cada menú,
                       desplegable y cuadro que abrió para transcribir las
                       rutas). FUENTE DE VERIFICACIÓN — cruzar cualquier duda
                       de una ruta/cuadro de Disposición, Diseño o Insertar
                       contra estas imágenes antes que contra nada externo.
data/imagenes_iconos/<pestaña>/  recortes de iconos de comandos de la cinta
                       (`<grupo>_<comando>.png`), del usuario. Fuente de las
                       93 preguntas con imagen (campo `imagen` = data URI).

--- artefactos generados (NO editar a mano, ver "Regenerar datos") ---
questions_all.json     banco de preguntas concatenado — fuente de verdad
                       en tiempo de ejecución, pero se genera desde
                       data/questions/*.json
questions_data.js      questions_all.json envuelto en window.__OPE365_DATA__
taxonomy_data.js       data/taxonomy.json envuelto en window.__OPE365_TAXONOMY__
flashcards_data.js     data/flashcards/*.json envuelto en
                       window.__OPE365_FLASHCARDS__

--- fuente editable de datos ---
data/questions/*.json  el banco partido en UN ARCHIVO POR PESTAÑA/section
                       (las 10: interfaz, archivo, inicio, insertar, diseno,
                       disposicion, referencias, revisar, vista,
                       correspondencia), con manifest.json fijando el orden
                       de carga. Cada pregunta lleva id="<section>-<n>" y
                       sourceFile="<section>.json"; la procedencia fina está
                       en `bloque` y `sourceQuestionId`. ORDEN DENTRO DEL
                       ARCHIVO: agrupadas por `topic` (orden de taxonomía),
                       y dentro de cada grupo por id numérico. Los ids son
                       ESTABLES (hay huecos por borrados; no se renumera —
                       CLAUDE.md y el motor referencian ids concretos).
data/flashcards/*.json  flashcards por sección (las 10), con su propio
                        manifest.json. `cardId` = `F-NNN` (contenido) o
                        `E-NNN` (tarjeta de error), 3 dígitos, relativo a su
                        fichero; `canonicalId` runtime = `<section>:<cardId>`.
                        `priority` ∈ alta|normal; `questionRefs` = ids
                        `<section>-N` (enlace blando, opcional). Mismo orden
                        que las preguntas: agrupadas por `topic`. Las tarjetas
                        de ruta llevan `sourceRefs` = ["rutasyatajos.txt §6 …"]
data/questions_regroup_report.md  reagrupación ago-2026: qué se movió de
                       1.json..8.json/atajos.json al esquema por pestaña
                       (mapa id viejo→nuevo en scripts/regroup_id_map.json)
data/taxonomy.json     taxonomía pedagógica (section > topic > subtopic),
                       configurable, independiente de sourceFile/bloque
data/vista_integration_report.md  comparación pregunta-por-pregunta del
                       banco de Vista contra el banco existente (Etapa 3
                       de la migración de arquitectura, ago 2026)

--- herramientas ---
build_data.py          regenera questions_all.json/questions_data.js/
                       taxonomy_data.js/flashcards_data.js desde data/ —
                       ejecutar SIEMPRE tras tocar algo bajo data/
build.py               empaqueta todo (incl. engine.js + engine-bridge.js, en
                       ese orden tras app.js) en OPE365_Word365_Estudio.html
tests/                 jsdom (node tests/test_*.js) + tests/test_engine.js
                       (20 escenarios del motor) + tests/test_ui_integration.js
                       (flujos motor↔UI). `npm install` una vez.
                       tests/manual_walkthrough_fase2.mjs = QA en Chromium real.
```

**Para desarrollar:** sirve la carpeta con un servidor local, no abras
`index.html` con doble clic (fetch/scripts locales fallan por CORS en
`file://`). Por ejemplo: `python3 -m http.server 8000` y abre
`localhost:8000`.

**Para producir el HTML único de siempre** (todo inlineado en un archivo,
para compartir sin depender de una carpeta): ver `build.py` en esta misma
carpeta — genera `OPE365_Word365_Estudio.html`.

**Limpieza y organización (sep-2026):** auditoría completa de archivos y
código muertos, con cuidado de no tocar nada con función real (verificado
con `grep`/análisis estático + suite completa + Chromium real antes y
después de cada borrado):
- Borrado `ATAJOS_CONSOLIDADO.md` (raíz): predecesor de
  `data/ATAJOS_WORD365.md`, citaba el ya eliminado `atajos_oficial.json`.
- Movidos a `data/` por consistencia: `VISTA_PROCESADA_PARA_OPE365.md` →
  `data/vista_procesada_fuente.md` (era el briefing de origen de Vista,
  vivía suelto en la raíz); `data/referencias/*.png` (26 iconos sin
  procesar) → `data/imagenes_iconos/referencias/` (mismo patrón que
  diseno/disposicion/inicio/insertar).
- `docs/` documentado con `docs/README.md` (no se tocó nada: los 3
  ficheros — `UI_REDISENO.md`, `memory-engine.html`, `plan-inteligente.html`
  — son registro de decisiones ya tomadas, no basura).
- `views.js`: eliminada `wizardTotalSteps()` + sus dos constantes — única
  función top-level de toda la app (7 ficheros JS) con 0 llamadas en
  ningún sitio; el wizard cuenta pasos con `wizardState.step` a pelo desde
  hace tiempo.
- `styles.css`: 12 reglas sin ningún uso en JS/HTML confirmadas por
  búsqueda literal (`.hero-continue`/`.hc-go` = versión anterior del CTA
  de Inicio, hoy `.cta-hero`; `.lp-axis`/`.lp-head`/`.lp-sub` = versión
  anterior del panel de progreso, hoy `.lp-row`/`.lp-legend`;
  `.duel-round-label`, `.conn-dot`, `.fb-label`, `.stat-row`,
  `.issue-warn`, `.mini-state`, `.view-wide`). Dejadas a propósito
  `.sr-only`, `.pad-4`/`.pad-6` (utilidades del sistema de diseño, sin uso
  actual pero no son "basura heredada") y `.soon`/`.soon-badge` (estado
  "próximamente" ya con CSS listo para el día que se use).
- `data/questions/*.json` y `data/flashcards/*.json`: además de por
  `topic`, ahora se agrupan por **tipo de ejercicio** dentro de cada topic
  (ver `data/README.md` regla 2) — `scripts/normalize_order.py` ampliado.

## Regla de oro: jerarquía de fuentes

Para **atajos de teclado** hay una única fuente y NADA puede contradecirla:

**`data/atajos_word365_v2608.md`** — volcado COMPLETO del cuadro
"Personalizar teclado" de la instalación real del usuario (Word para
Microsoft 365 MSO v2608, compilación 16.0.20326.20072, 64 bits), sacado
pantalla a pantalla por el usuario, tecla a tecla (sep-2026). **Es LA
verdad.** Si el banco dice algo que ese archivo no dice, el banco está
mal: se corrige o se borra la pregunta. Un atajo que no aparezca en ese
archivo NO existe en este Word — no se pregunta por él.

**Regla del usuario (sep-2026):** el banco = lo que dice el volcado + lo
que él verificó en vivo, MEZCLADO. Donde discrepen, **gana la prueba en
vivo** y la explicación **lleva SIEMPRE una advertencia** `⚠️ Ojo: …`
explicando qué dice el cuadro Personalizar teclado y qué pasa de verdad.

- **Conflictos internos del propio volcado** (misma combinación bajo dos
  comandos): `Alt+Ctrl+V` = DocDividir *y* PegarFormato → en vivo **pega
  formato**; `Ctrl+0` = Zoom100 *y* AbrirCerrarPárrafo → **zoom 100 %**;
  `Ctrl+W` = DocCerrar *y* DefinirPárrafo → **quita formato de párrafo**;
  `Ctrl+1` = AplicarTitulo1 en el volcado pero **en vivo aplica
  interlineado sencillo** (y Título 1 es `Ctrl+Mayús+1`); `Ctrl+Mayús+L` =
  Versalitas *y* ListaConViñetas (sin dirimir). Todos con advertencia en
  las preguntas.
- **Extras confirmados EN VIVO por el usuario que no salen en el volcado**
  (lista cerrada, no ampliar sin prueba): `Alt+Ctrl+H` = resaltar ·
  `Alt+Mayús+F7` = Traductor · `Ctrl+B` = panel Navegación · `Alt+Q` =
  Buscar de la barra de título · `Ctrl+Tab` = tabulación en celda ·
  `Windows+F7` = panel Editor · `Ctrl+5` numérico = seleccionar todo.
  Cada uno con advertencia "no figura en el volcado; confirmado en vivo".

Para lo que NO es un atajo (rutas de menú, conceptos): PDFs de la academia
(Beatriz R., Adams, MAD…) en el Project Knowledge de claude.ai — pídeselos
al usuario si los necesitas.

**`support.microsoft.com` (y su versión ES): 0% fiable — NO usar.** El
usuario lo ha descartado explícitamente: traducción automática, mezcla
esquemas de teclado y da atajos que en su instalación no funcionan (p. ej.
documenta subíndice `Ctrl+=` y superíndice `Ctrl+Mayús++`, ambos falsos
aquí). No citarlo ni como "último recurso". Las webs generalistas de atajos
(xataka, profesionalreview…) copian ese mismo esquema internacional y
valen igual de poco para esta instalación.

**Nunca inventes un atajo o distractor que no exista en una fuente real.**
Si dos fuentes fiables se contradicen, dilo en el chat — no lo resuelvas en
silencio ni elijas arbitrariamente.

### Contexto importante ya resuelto (no lo reabras sin motivo)

- Esta instalación de Word 365 español usa el **esquema clásico de
  localización**: Ctrl+Q/T/D/J para alineación izq/centro/der/justificar,
  Ctrl+N/S/K para negrita/subrayado/cursiva, Ctrl+L=Reemplazar,
  Ctrl+H=Sangría, Ctrl+F=Sangría francesa, Ctrl+I=Ir a — **distinto del
  esquema internacional en inglés**. Confirmado por `ATAJOS.docx` +
  PDF de la academia + prueba en vivo del usuario. **Ctrl+F NO es
  "sangría de primera línea"** (el banco `inicio.json` venía de aulaclic
  con ese error; corregido en `inicio-250/251/252/264/275/276`). Otros de
  sangría: `Ctrl+Mayús+H` = reducir sangría francesa, `Ctrl+Mayús+R` =
  quitar toda la sangría (`atajos_oficial.json`).
- **`Ctrl+M`** y **`Ctrl+Mayús+F`** abren el cuadro de diálogo Fuente con
  el foco en el campo **Fuente (nombre)**; **`Ctrl+Mayús+M`** abre el mismo
  cuadro con el foco en **Tamaño**. Los tres abren el DIÁLOGO — NO existe
  atajo que active la caja de fuente de la cinta, y ninguno es atajo de
  sangría. Prueba en vivo del usuario (sep-2026, confirmado contra el
  volcado v2608). Afectó a `inicio-25` (tenía doble respuesta: B era
  `Ctrl+Mayús+F` → cambiado a `Ctrl+Mayús+P`), `inicio-283`, `inicio-354`,
  `inicio-355` (reformulada: la premisa "caja de la cinta" era falsa).
- **`Ctrl+Mayús+R` NO quita la sangría** en esta instalación, aunque
  `atajos_oficial.json` le asigne "Quitar sangría". Para quitar sangrías
  se usa `Ctrl+W` (quita todo el formato de párrafo). Prueba en vivo.
  Afectó a `inicio-252/352`.
- **Estilos de título** (prueba en vivo): `Ctrl+Mayús+1` → Título 1,
  **`Alt+Ctrl+2` → Título 2** (`Ctrl+Mayús+2` NO hace nada),
  `Ctrl+Mayús+3` → Título 3. El banco `inicio.json` nuevo tenía
  `Ctrl+Mayús+2` → Título 2 (mal); corregido en `inicio-93/341`. El banco
  heredado (`inicio-342/343`) ya lo tenía bien.
- **Ctrl+R no hace absolutamente nada** en esta instalación (Word 365
  español de España). No aparece en `ATAJOS.docx`. No es Ctrl+R quien
  alinea a la derecha — es Ctrl+D. Prueba en vivo del usuario.
- **Ctrl+W quita el formato de párrafo** (sangrías, etc.), NO cierra el
  documento — prueba en vivo del usuario, aunque `ATAJOS.docx` lo lista de
  forma contradictoria bajo ambas cosas.
- **Cerrar documentos y Word** (prueba en vivo del usuario):
  - **Ctrl+F4** cierra el documento activo y NO cierra Word.
  - **Alt+F4** va cerrando los documentos abiertos uno a uno; cuando solo
    queda uno, al volver a pulsarlo cierra el programa.
  - Ctrl+W NO cierra nada (ver arriba).
- 38 preguntas nuevas (`gen-atajo-1` a `gen-atajo-38`, campo
  `"generado": true`) cubren atajos de `ATAJOS.docx` que no tenían ninguna
  pregunta, incluyendo variantes alternativas de un mismo comando
  (ej. Guardar tiene 3 atajos válidos, ahora las 3 tienen pregunta propia).
- **`Alt+Mayús+F7` abre el Traductor** en un panel a la derecha —
  confirmado por prueba en vivo del usuario (no aparece en `ATAJOS.docx`).
  Lo usan `revision-2` y `revision-51`.
- **`Ctrl+Mayús+E` activa/desactiva el control de cambios** ("Activar o
  desactivar marcas de revisión" en `ATAJOS.docx`) — ya lo usaban
  el banco heredado (hoy `revisar-*`) y el bloque Revisar.
- **`Ctrl+Mayús+S` = Subrayado** (prueba en vivo del usuario + coincide
  con `atajos_oficial.json`) y **`Ctrl+Mayús+W` = Panel Aplicar estilos**.
  El banco `inicio.json` nuevo venía de aulaclic diciendo que Ctrl+Mayús+S
  "abre Aplicar estilo" — corregido. Afectó a `inicio-13`, `inicio-90`,
  `inicio-91` (respuesta C→B) y `inicio-92`.
- **Subíndice = `Ctrl+Mayús+-`** (Ctrl + Mayús + la tecla del guión).
  **`Ctrl+=` NO funciona** (era el esquema internacional que traía el banco
  de aulaclic). **Superíndice NO tiene atajo** en esta instalación (probado:
  ni `Ctrl+Mayús+=`, ni `Ctrl+Mayús++`, ni `Ctrl+Alt++`) — solo desde la
  casilla Superíndice del cuadro Fuente (`Ctrl+M`) o el botón de la cinta.
  Prueba en vivo del usuario. Borradas `inicio-258/360`; corrigió
  `inicio-257/361/362` (subíndice), `inicio-157/158` y `inicio-259`
  (emparejamiento reconstruido solo con atajos confirmados) y el distractor
  fósil de `vista-124`. Notación: `atajos_oficial.json` escribe el subíndice
  como `Ctrl+Mayús+` + `-` — se nombra la **tecla** (signo menos), no el
  carácter que saldría con Mayús (`_`); es correcta tal cual. La mayoría de
  webs (y Microsoft Support ES, poco fiable) repiten el esquema
  internacional `Ctrl+=` para subíndice y `Ctrl+Mayús++` para superíndice —
  ninguno funciona aquí. `atajos_oficial.json` también lista `Ctrl+Mayús+0`
  para subíndice: en vivo no hace nada (entrada fósil de ATAJOS.docx).
- **Tamaño de fuente — la tecla `<>`** (izquierda de la Z). En el teclado
  ES esa tecla da `<` sin Mayús y `>` con Mayús, así que **`Ctrl+Mayús+<` y
  `Ctrl+>` NO existen** — son notaciones contradictorias y no deben
  aparecer como opción. Las 4 combinaciones reales: `Ctrl+Mayús+>` agranda
  al siguiente valor de la lista · `Ctrl+Alt+Mayús+>` agranda de punto en
  punto · `Ctrl+<` (sin Mayús) reduce al valor anterior de la lista ·
  `Ctrl+Alt+<` reduce de punto en punto. Prueba en vivo. Quedan 4 preguntas
  limpias: `inicio-255` (agrandar lista) · `inicio-256` (reducir lista) ·
  `inicio-356` (agrandar 1pt) · `inicio-357` (reducir 1pt); `inicio-358/359`
  eran duplicados y se borraron; distractor arreglado en `inicio-384`.
- **`Ctrl+Barra espaciadora` = quitar el formato de carácter manual** —
  funciona (prueba en vivo, confirma `inicio-262`). El de PÁRRAFO es
  `Ctrl+W` (ya resuelto arriba). `Ctrl+Q` = alinear a la izquierda —
  `inicio-263` decía mal que quitaba el formato de párrafo, corregido a
  `Ctrl+W`.
- **`Ctrl+B` = abre el panel de Navegación** con el cuadro de búsqueda
  dentro del documento (pestañas Títulos/Páginas/Resultados) — prueba en
  vivo con captura. NO es "Búsqueda inteligente": `inicio-294` decía eso y
  se reformuló para preguntar por **`Alt+Q`** = lleva el foco al cuadro
  Buscar de la barra de título (Microsoft Search). `inicio-117` (Ctrl+B =
  panel de Navegación) ya estaba bien.
- **`Ctrl+Mayús+8` = mostrar/ocultar marcas de formato** (¶). En el
  teclado ES `(` es Mayús+8, así que "Ctrl+(" y "Ctrl+Mayús+8" son la
  misma pulsación — no dos atajos. `inicio-138` tenía las dos como
  opciones distintas (bug tipo `<>`); corregido a `Ctrl+Mayús+8`.
- **Atajos verificados en vivo uno a uno (sep-2026), llevan "Prueba en
  vivo del usuario" en la explicación — no reabrir:** `Ctrl+F12` Abrir ·
  `Ctrl+A` Abrir (Backstage) · `Ctrl+G` Guardar · `F12` Guardar como ·
  `Ctrl+F4` cerrar documento (no Word) · `F1` Ayuda · `Ctrl+Fin` final del
  documento · `Fin` final de línea · `Mayús+Fin` / `Ctrl+Mayús+Fin`
  extender selección a fin de línea / de documento · `Ctrl+E` seleccionar
  todo · `F8` modo extender selección · `Ctrl+Retroceso` borrar palabra a
  la izquierda · `Ctrl+Barra espaciadora` quitar formato de carácter ·
  `Ctrl+Mayús+8` mostrar/ocultar marcas de formato (= `Ctrl+(` en teclado
  ES) · `Ctrl+M` diálogo Fuente · `Mayús+F3` rotar mayús/minús/tipo
  oración · `Ctrl+Mayús+-` subíndice. Borrada `inicio-392` (`Ctrl+Mayús+0`
  subíndice: la tabla lo lista pero en vivo no hace nada). **Pendiente**:
  `Ctrl+Mayús+Z` = "Restablecer carácter" (en ATAJOS.docx, sin probar —
  `inicio-363/364`).
- **Tanda 3 (sep-2026):** `Ctrl+Tab` = tabulación real dentro de una celda
  de tabla (`inicio-82`) · `Alt,F,T` = abre el diálogo Tabulaciones
  (`inicio-77`) · `Alt+Fin` = va al final de la fila de la tabla
  (`insertar-32`) · `Ctrl+-` = alejar zoom de 10 en 10 (`vista-123`) ·
  `Ctrl+0` = **restaura el zoom al 100 %** (`inicio-253` reformulada — NO
  toca el espaciado del párrafo, que no tiene atajo). Correcciones:
  `Alt+Mayús+Fin` en tabla **extiende la selección** hasta el final de la
  fila, no "va al final" (`insertar-43`) · `Alt+5` (numérico) inserta el
  símbolo del código Alt (♣), **no** selecciona la tabla (`insertar-38`).
  Borrada `inicio-376` (`Alt+Mayús+5` numérico = no hace nada). `Ctrl+5`
  (numérico) = **seleccionar todo** — funciona con NumLock on u off
  (`inicio-371` corregida y verificada).
- **Tanda 4 (sep-2026):** `Ctrl+1` / `Ctrl+5` / `Ctrl+2` (fila superior) =
  interlineado sencillo / 1,5 / doble (`inicio-314/315/316/254`) — `Ctrl+5`
  en el numérico en cambio selecciona todo, ese es el doble sentido de
  `inicio-67` · `Ctrl+Q` = alinear a la izquierda **y, si el párrafo YA
  está a la izquierda, una segunda pulsación lo justifica** (`inicio-378`).
  Verificadas `inicio-296` (Ctrl+J justifica), `inicio-297` (Ctrl+D
  derecha; Ctrl+R nada), `inicio-42` (emparejamiento Q/T/D/J) y
  `inicio-275` (Ctrl+E/B/F/L cambian entre ES e inglés).
- **Tanda 5 (sep-2026):** `Ctrl+Mayús+F8` = **modo "Seleccionar columna"**
  (ATAJOS.docx) — deja la selección enganchada y, al mover el cursor o
  hacer clic, se extiende un bloque vertical de texto; se sale con `Esc`
  (`inicio-321` reformulada) · `Alt+Inicio` = va a la primera celda de la
  fila de la tabla (`insertar-31`). Corrección: `Alt+Mayús+Inicio` en tabla
  **extiende la selección** hasta el inicio de la fila, no "va al inicio"
  (`insertar-45`, mismo patrón que `Alt+Mayús+Fin`). **Pendiente**: la
  navegación por columna de tabla `Alt+Re Pág` / `Alt+Av Pág` y sus
  variantes con Mayús (`insertar-33/34/44`).
- **Tanda 6 (sep-2026) — escenarios D y E cerrados enteros, prueba en vivo:**
  `Ctrl+Mayús+H` = reducir sangría francesa (`inicio-251`) · `Ctrl+Ins` =
  copiar, `Mayús+Ins` = pegar, `Mayús+Supr` = cortar (método antiguo del
  portapapeles, `inicio-308/309/310`) · `F2` = mover texto (marca "¿A
  dónde?" en la barra de estado; `Enter` en el destino) (`inicio-7·312`) ·
  `Ctrl+F3` = Spike (acumula recortes), `Ctrl+Mayús+F3` = pega todo el
  Spike (`inicio-8`) · `Mayús+F2` = "Copiar a" (copia sin tocar el
  portapapeles) (`inicio-311`). Todos hacen lo que dice el banco, sin
  cambios.
- **Tanda 7 (sep-2026):** `Alt+[` = iniciar el Dictado (`inicio-373`) ·
  `Alt+Ctrl++` (num.) = abrir *Personalizar teclado* (`archivo-129`) ·
  **`F7` y `Windows+F7`** abren los dos el panel **Editor** (`revisar-1`
  ya lo decía; `revisar-74` también vale — en 365 "Editor" y "Ortografía y
  gramática" son el mismo panel). **`Alt+Ctrl+V` NO hace nada** en esta
  instalación — ni divide la ventana ni pegado especial. **Dividir no
  tiene atajo**: se hace por Vista ▸ Ventana ▸ Dividir. `ATAJOS.docx`
  asigna `Alt+Ctrl+V` a "Dividir ventana" *y* a "Pegar formato" (conflicto
  → no funciona ninguno). Corregidas `vista-27/87/109/88` (quitado el
  atajo inventado; `vista-109` pasa a `categoria:"ruta"`). **Pegado
  especial** según `atajos_oficial.json` = **`Alt+Ctrl+G`** (`inicio-383`
  ya lo dice) — pendiente de prueba en vivo.
- **Tanda 7·bis (sep-2026, prueba en vivo):** `Alt+Ctrl+V` **sí hace algo**
  — es el **pincel Copiar/Pegar formato**: `Alt+Ctrl+C` copia el formato
  del texto seleccionado, `Alt+Ctrl+V` lo pega (coincide con
  `atajos_oficial.json`: "Copiar formato" Alt+Ctrl+C, "Pegar formato"
  Alt+Ctrl+V). El banco traía el esquema internacional `Ctrl+Mayús+C/V`
  (que aquí NO va). Corregidas `inicio-3` (dorso del emparejamiento),
  `inicio-145`, `inicio-301`, `inicio-302`. **Matiz confirmado**: si el
  origen mezcla formato de carácter (negrita/cursiva) y de párrafo
  (sangría, interlineado), al pegar sobre otro párrafo **solo se aplica el
  formato de párrafo**. Las notas de `vista-27/87/109/88` ya no dicen que
  `Alt+Ctrl+V` "no hace nada" (dicen que hace pegar formato).
- **Tanda 8 (sep-2026) — escenario E cerrado + limpieza del banco.** Prueba
  en vivo: `Alt+Ctrl+H` resalta la selección (`inicio-21/303/159`) ·
  `Ctrl+rueda` zoom de 10 en 10 (`vista-22`) · `Alt+Ctrl+Espacio` Leer en
  voz alta (`revisar-6`) · `Inicio`/`Fin` inicio/fin de línea
  (`interfaz-503/504`) · hipervínculos con un clic = desactivar "Utilizar
  CTRL+clic…" en Opciones ▸ Avanzadas (`archivo-86`) · `Ctrl+M` Fuente (NO
  sangría; esa es `Ctrl+H`) (`inicio-283`) · `Ctrl+E` seleccionar todo
  (`inicio-274`) · `Ctrl+Z` deshacer (`inicio-139`) · `F2` mover texto, la
  barra de estado muestra «¿Dónde quieres moverlo?» (`inicio-7/312`) ·
  `Ctrl+F3` Spike, `Ctrl+Mayús+F3` lo suelta (`inicio-8`, notación
  normalizada). **Limpieza global del banco**: eliminados los banners de
  basura (`====… FIN DEL BANCO / TABLA OFICIAL / BLOQUE N …`) y TODAS las
  citas de fuente en enunciados/explicaciones (aulaClic, Scribd, SlideShare,
  LinkedIn Learning, IONOS, "según la fuente", "documentado en el corpus").
  Las ~40 preguntas de Vista afectadas se reescribieron a mano conservando
  el hecho; `vista-38` y `vista-44` estaban vacías y se rellenaron. **Regla
  nueva**: el banco NO cita fuentes externas — dato verificado en vivo →
  "Prueba en vivo del usuario"; si no, se enuncia sin coletillas.
- **Tanda 9 (sep-2026) — cruce contra el volcado v2608, prueba en vivo.**
  Los 3 conflictos internos del volcado se resuelven así en vivo:
  `Alt+Ctrl+V` = **pegar formato**, `Ctrl+0` = **zoom 100 %**, `Ctrl+W` =
  **quitar formato de párrafo** (no cierra la ventana). `Ctrl+Mayús+M` =
  diálogo Fuente con foco en Tamaño; `Ctrl+Mayús+F` = diálogo Fuente con
  foco en el nombre (igual que `Ctrl+M`) — ver punto de `Ctrl+M` arriba.
  `Alt+5` numérico: **NumLock ON = ♣; NumLock OFF = selecciona toda la
  tabla** (`insertar-38` reformulada). `Alt+Mayús+Inicio`/`Fin` en tabla =
  extienden la selección hasta la celda extrema de la fila; si ya estás en
  ella, seleccionan solo esa (`insertar-43/45`). Subíndice = `Ctrl+Mayús+-`
  (= `Ctrl+_`); `Ctrl+=` no va (`inicio-257/361`).
- **Sobre borrar preguntas "duplicadas":** el usuario NO quiere que se
  poden preguntas correctas solo por parecerse a otra — se conservan
  aunque otra pregunte por el mismo atajo (están en topics/framings que
  pueden ser útiles). Solo se borra lo que está MAL o testea un atajo
  inexistente (así se fue `insertar-39`: "página en blanco" no tiene
  atajo). La poda de 16 de `dc50ece` se revirtió en la siguiente sesión.
  **Pendiente de que el usuario verifique**: `Alt+Ctrl+D` = ¿qué hace?
  ATAJOS.docx pone "Página" (ambiguo); `disposicion-1` dice "formato de
  página" y en Word suele ser "nota al final" · `Alt+Ctrl+H` = resaltado:
  no está en ATAJOS.docx (`inicio-21/303`) · `Alt+Ctrl+V` = "Dividir
  ventana" (`vista-27/87/109`) sin confirmar (suele ser Pegado especial).

## Modelo de datos (questions_all.json)

Cada pregunta tiene: `id`, `sourceFile`, `bloque`, `tipo`
(`opcion_unica`/`seleccion_multiple`/`verdadero_falso`/`emparejamiento`/
`relleno`), `categoria` (`atajo`/`ruta`/`concepto`/`general`), `negativa`
(bool), `enunciado`, `opciones` (`[{letter,text}]`), `respuesta` (letra o
array de letras, bool para V/F, mapa para emparejamiento, o array de
strings para relleno — uno por hueco `[1]`,`[2]`... en el enunciado, cada
entrada puede ser un string o un array de variantes aceptadas),
`explicacion`, `contentHash`, `questionVersion`. Las de farol/atajo
generadas llevan `"generado": true`. `contentHash` se calcula en runtime
(`app.js`) y **no** depende de `id` ni de `sourceFile` — renumerar no lo
altera.

`section`/`topic`/`subtopic`: taxonomía pedagógica; **ya no hay nulos**,
todo el banco está clasificado y físicamente agrupado por `section`
(ago-2026). `sourceFile` = `"<section>.json"` e `id` = `"<section>-<n>"`.
`sourceQuestionId` guarda el id original del documento de procedencia
(`"Q-021"`, `"P-0001"`, o el id heredado `"8-121"` para las reagrupadas);
`bloque` conserva el agrupador de procedencia legible. `difficulty`
(`"media"`/`"alta"`) es opcional. `categoria` sigue siendo exactamente
`atajo`/`ruta`/`concepto`/`general` (las ~80 de "¿qué botón/opción usar?"
del banco nuevo de Inicio se mapearon a `ruta`).

**Añadir un tipo de ejercicio nuevo:** si alguna vez se añade un sexto
tipo, buscar TODOS los sitios que enumeran los tipos existentes — no
solo `EXERCISE_TYPES`/`TYPE_LABELS`/`evaluateAnswer`/`validateDataset`
en `app.js`, sino también cualquier `<select>` o fila de pills en
`views.js` que liste los tipos para filtrar (el asistente de práctica y
"Repasar preguntas" ya derivan la lista de `O.TYPE_LABELS`
dinámicamente por esto mismo — un array hardcodeado ahí se detectó como
bug real la primera vez, probando la app en el navegador, no en jsdom).
El `<select>` de tipo del asistente de multijugador es la única
excepción deliberada: sigue limitado a los 4 tipos originales porque
`relleno` no encaja en Duelo/Farol sin rediseñar esa mecánica.

**`app.js` calcula content hash y registro de migración en cada carga** —
si añades preguntas a mano, no hace falta tocar nada más, los contadores
son dinámicos.

## Taxonomía y flashcards

El banco de preguntas está partido físicamente en `data/questions/*.json`
con **un archivo por pestaña** (= `section`; ver tabla de arriba), pero la
app siempre ve un único banco lógico (`QUESTIONS`) — `build_data.py` los
concatena según `data/questions/manifest.json` (ordenado por
`taxonomy.order`) antes de generar `questions_all.json`.

`data/taxonomy.json` define la jerarquía `section` → `topic` → `subtopic`.
**El banco está totalmente normalizado** (`scripts/normalize_bank.py`,
one-shot, ago-2026): todas las preguntas tienen exactamente el mismo
juego de campos y `sourceFile` = `<section>.json`, `id` = `<section>-<n>`,
`bloque` = `"<Sección> — <Grupo>"` (derivado de la taxonomía),
`tema` = `"<Grupo>"`. Campos muertos eliminados (`qnumInSource`,
`sourcePage`, `blockRange`, `sourceIssue`, `esCompletarBlank`,
`versionIssue`, `topicId`). `generado` solo aparece cuando es `true`.
`difficulty` es opcional (solo en los bloques que lo traían). Excepción:
una pregunta vive en el archivo de su `section` aunque su procedencia
fuese otra pestaña (Vista Preliminar → `archivo.json`, `bloque`
"Archivo — Imprimir", `sourceQuestionId` conserva el origen).

**Recuento actual** (`data/questions/<section>.json`, sep-2026):
interfaz 520, insertar 452, inicio 451, archivo 402, vista 144, disposicion 114,
diseno 86, referencias 84, revisar 82, correspondencia 5.
Total 2340. 331 preguntas `categoria:"atajo"`, 1035 `"ruta"`, 912
`"concepto"`, 41 `"general"` (sep-2026: `interfaz` reclasificada por
completo — ver más abajo — quedan sin reclasificar 31 en `vista`, 7 en
`archivo`, 3 en `inicio`).
**Densidad de `negativa` nivelada (sep-2026)**: `inicio` e `insertar`
estaban al 2.7 % (12/437 y 12/438) frente al 6-11 % del resto del banco.
Se añadieron 14 `opcion_unica` "señale la INCORRECTA" por sección (28
total, `sourceQuestionId` `neg2-<sec>-NN`, `generado:true`, `categoria:
"concepto"`), repartidas por topic, cada una con 3 opciones verdaderas +
1 falsa (hechos ya establecidos en este documento o conocimiento estándar
seguro de Word — nunca inventado). Ambas quedan al 5.8 %.
Generador: `scripts/gen_negativas_2.py` (no confundir con
`scripts/gen_negativas.py`, la tanda anterior de las otras 9 pestañas).
**Flashcards de `interfaz` y `diseno` (sep-2026)**: `interfaz` no tenía
NINGUNA flashcard (0/520) pese a ser la pestaña con más preguntas del
banco, y `diseno` estaba muy flaca (9/86, ratio 0.10). Se creó
`data/flashcards/interfaz.json` (nuevo, 48 tarjetas `contenido`, 4 por
cada uno de sus 12 topics, añadido a `data/flashcards/manifest.json` en
primera posición por ser la sección primera en `taxonomy.order`) y se
amplió `diseno.json` con 15 más (5 por topic, incl. el topic `estructura`
que no tenía ninguna). Total flashcards: 905→968. Contenido basado en
hechos ya establecidos en este documento (atajos/comportamiento
verificado en vivo) o comportamiento estándar y seguro de la interfaz de
Word — sin inventar nada. Generador: `scripts/gen_flashcards_eje7.py`.
**Bug de test expuesto por este cambio** (no del motor): `tests/
test_ui_integration.js` paso T elegía "el primer concepto con ≥2
framings" (`O.LE.CONCEPTS.find(...)`) para forzarlo a asentado+atrasado,
pero un paso anterior (P, flashcard "Con dificultad") ahora cae en ese
mismo concepto porque `interfaz:conceptos-generales` pasó a tener
flashcards y es taxonómicamente el primero — contaminando su estado antes
de que T lo fuerce. Corregido excluyendo conceptos ya tocados:
`c.framings.length>=2 && !O.PROGRESS.concepts[c.id]`. Mismo patrón de
fragilidad que la tolerancia de `test_engine.js` escenario 6 (elegir "el
primero que cumple X" es frágil a reordenaciones del banco) — si vuelve a
pasar, aplicar el mismo principio: robustecer la selección, no perseguir
ids concretos.
**Balance V/F en bancos heredados (sep-2026)**: `inicio`, `interfaz` y
`vista` traían V/F desequilibrados de origen (15V/8F, 15V/8F, 8V/15F) sin
capturas de pantalla frescas que respaldaran tocar el contenido ya
correcto. En vez de invertir preguntas existentes (arriesgado sin fuente),
se AÑADIERON 21 V/F nuevas (7 por sección, `sourceQuestionId` `bal-<sec>-NN`,
`generado:true`) sobre hechos ya establecidos/verificados en esta misma
sesión o de conocimiento estándar de Word, sin tocar ni una sola pregunta
previa. Las tres secciones quedan en 15V/15F exactas.
Generador: `scripts/gen_balance_legacy.py`.
**Reclasificación de `interfaz` (sep-2026)**: tenía 490 de sus 513
preguntas en `categoria:"general"` (95 %) — el cajón de sastre que ni es
atajo, ni ruta, ni concepto. Reclasificadas por topic con solape de
patrón (una pregunta de atajo dentro de un topic no-atajo sigue siendo
atajo si pregunta por una combinación de teclas): `conceptos-generales` y
`documentos-archivos` → `concepto` (definiciones, extensiones, XML);
`ventana-cinta`/`barra-estado`/`cursor-navegacion`/`regla`/
`acceso-rapido`/`zoom`/`area-vistas`/`acceso-teclado-ayuda`/`buscador` →
`ruta` por defecto (identifican dónde está o qué hace un elemento de la
ventana); `deshacer-rehacer` → `atajo`; y dentro de cualquier topic, toda
pregunta que pida explícitamente una combinación de teclas → `atajo`
(activa incluso en `ventana-cinta`, p. ej. Alt+F4). Resultado: 46 atajo /
374 ruta / 93 concepto / 0 general. Generador: `scripts/reclasificar_interfaz.py`.
**141 preguntas `negativa:true`** (11 % interfaz, 6-7 % en la mayoría de
pestañas, 2,7-2,8 % en insertar/inicio por ser los bancos más grandes —
todas sus pestañas y grupos tienen al menos una). Antes de sep-2026, 7 de
las 10 pestañas tenían 0. `sourceQuestionId` `neg-<sec>-NN`,
`generado:true`, `tipo:"opcion_unica"`. Generador: `scripts/gen_negativas.py`.
**93 preguntas CON IMAGEN** (`sourceQuestionId` `img-<sec>-NN`, `generado:true`,
campo `imagen` = data URI base64 del PNG): muestran el icono recortado de un
comando de la cinta y preguntan qué representa / en qué pestaña y grupo está /
cuál es su atajo; la explicación cubre las tres cosas. Iconos de Inicio (38),
Insertar (29), Disposición (16) y Diseño (10). Fuente:
`data/imagenes_iconos/<pestaña>/<grupo>_<comando>.png` (recortes del usuario).
Generador: `scripts/gen_iconos_img.py`. El runner las pinta con
`qImageHtml(q.imagen)`; `composeSessionQuestion` conserva el campo. Añaden
~230 KB a questions_all.json. **Filtro `conImagen`** (sep-2026):
`filterQuestions`/`resolveQuestionIds` (app.js) aceptan `conImagen:true` →
solo preguntas con imagen; se propaga a `shareCodeForSession`. En la UI:
asistente de práctica → scope **"Iconos (con imagen)"** (con selector de
pestaña opcional) y "Repasar preguntas" → desplegable "Con y sin imagen /
Solo con imagen"; Editor del banco → estado "Con imagen (iconos)". Fuera de
esos filtros explícitos, las preguntas con imagen siguen mezcladas con las
demás de su `topic` (deseable: el motor las trata como cualquier framing
del concepto). **Bug real encontrado y corregido en la auditoría de
sep-2026**: `multiplayer.js` (Duelo/Farol/Contra Word) nunca pintaba
`q.imagen` en la ronda en vivo — una pregunta de icono que caía en una
partida quedaba con el enunciado ("Observa el icono...") sin la imagen,
irrespondible. `buildBoard()` (las dos, Duelo y Coop) ahora excluye
`q.imagen` del pool de selección aleatoria, igual que ya excluía `relleno`.
Confirmado con `filterQuestions` + el mismo predicado: 0 preguntas con
imagen cuelan en el pool. Además, `qEditFormHtml`/`fcEditFormHtml` (editor
✎ y Editor del banco) no mostraban la imagen al corregir texto — se añadió
una vista previa de solo lectura (`qImageHtml`) al principio del
formulario; `readQPatch` nunca tocaba el campo `imagen`, así que no había
pérdida de datos, solo falta de contexto visual al editar.
`archivo-*` (`sourceQuestionId` `vf-archivo-bkNN`, `generado:true`, 42 V/F
21/21) = **Vista Backstage** (pestaña Archivo): panel de navegación, Inicio/
Nuevo/Abrir, Información (Proteger documento 6 opciones, Comprobar problemas 3,
Historial de versiones = requiere nube, cuadro Propiedades 5 fichas), Guardar
como (Herramientas, tipos de archivo), Imprimir (Intercaladas/Sin intercalar,
N por hoja, Impresión personalizada, Márgenes = misma galería que Disposición,
enlace Configurar página), Exportar, Compartir, Cuenta. Fuente:
`data/rutas/archivo.txt` (reconstruido de `data/imagenes_rutas/backstage/`).
Generador: `scripts/gen_backstage_vf.py`. +33 flashcards
(`data/flashcards/archivo.json`, primeras que no son de Opciones).
`disposicion-2..90` (`sourceQuestionId` `vf-disposicion-*`, `generado:true`,
`tipo:"verdadero_falso"`, 45/44 V/F, incl. 19 con `difficulty:"alta"` = trampa) = banco de la pestaña **Disposición**
(antes solo tenía `disposicion-1`, el atajo `Alt+Ctrl+D`). Cubre Configurar
página (márgenes con sus valores reales de esta instalación, tamaños de
papel, columnas, saltos de sección vs página, números de línea, guiones),
Párrafo (sangría/espaciado, cuadro Párrafo) y Organizar (posición, ajuste
de texto, alinear/distribuir/girar, cuadro Diseño). 100 flashcards
(12 trampa, `priority:"alta"`). Fuente: `data/rutas/disposicion.txt` +
capturas. Generadores: `scripts/gen_disposicion_vf.py`,
`gen_disposicion_extra.py`, `gen_trampas_disp_ref.py`.
`referencias-8..78` (`vf-referencias-*`, `generado:true`,
`tipo:"verdadero_falso"`, 35/36 V/F, incl. 19 con `difficulty:"alta"` = trampa) = banco de la pestaña **Referencias**
(antes solo 7 opcion_unica de atajos). Tabla de contenido (cuadro de 3
fichas TdC/Índice/Tabla de ilustraciones), Notas al pie (`Alt+Ctrl+O` pie /
`Alt+Ctrl+L` final), Citas y bibliografía (12 estilos, APA por defecto,
Administrador de fuentes con Lista general/actual, «Cambiar SP de proveedor»
= complementos no estilo), Títulos (Referencia cruzada = mismo cuadro que
Insertar; tipo «Título» solo si hay estilos de título) e Índice (entradas
XE marcadas a mano, Automarcar). 71 flashcards (13 trampa). Fuente:
`data/rutas/referencias.txt` + capturas. Generadores:
`scripts/gen_referencias_vf.py`, `gen_trampas_disp_ref.py`. Las de trampa
llevan `sourceQuestionId` `vf-<sec>-TNN` y explotan confusiones reales
(nombres parecidos, valores que parecen los ingleses, «Alinear
verticalmente» = centrar en horizontal, TDC 1-9 vs Título 1-9, etc.).
Historial: `data/questions_regroup_report.md`.
`diseno-1..70` (`sourceQuestionId` `vf-diseno-NN`, `generado:true`,
`categoria:"concepto"`, `tipo:"verdadero_falso"`, 35 V / 35 F) = banco
propio de la pestaña **Diseño**, que hasta sep-2026 no tenía archivo.
Cubre Temas/Colores/Fuentes/Espaciado/Efectos/Conjunto de estilos/
Administrar estilos + Marca de agua/Color de página/Bordes de página, y
un bloque de reconocimiento (nombres reales vs inventados: Vintage,
Sector industrial, Galería de Office, efecto «3D»; pares de fuentes
Franklin Gothic Med/Book; Color de página vive en Diseño, no en Insertar).
Fuente: `data/rutas/diseno.txt`. **Es el único banco cuyos ids sí se
renumeraron** (1..70 en orden de taxonomía, sep-2026) — era nuevo y nada
externo los referenciaba.
Cubren Temas/Colores/Fuentes/Espaciado entre párrafos/Efectos/Conjunto de
estilos/Administrar estilos (grupo Formato del documento) y Marca de
agua/Color de página/Bordes de página (grupo Fondo de página), a partir
del volcado de la cinta de Diseño del usuario (rutas completas). No hay
atajos en esta pestaña. Taxonomía: subtopics de `formato-documento`
ampliados + topic nuevo `diseno:estructura`.
`insertar-206..393` (`sourceQuestionId` `vf-insertar-NN`, `generado:true`,
`categoria:"concepto"`, `tipo:"verdadero_falso"`) = **188 V/F de toda la
pestaña Insertar** (páginas, tablas, ilustraciones/SmartArt/formas/gráficos,
multimedia, vínculos, comentarios, encabezado-pie, texto, símbolos/ecuación,
eSignature, formato-forma) sobre comportamiento y opciones de los cuadros de
diálogo. Del bloque original de ~215 se descartaron ~27 que preguntaban por
atajos ausentes del volcado v2608 (`Alt+Mayús+P/F/H`, `Alt+C`, `Alt+I`,
`Alt+Ctrl+D`=PAGE, `Ctrl+Mayús+Entrar`…) o eran de la pestaña Revisar. Sesgo
conocido: ~74% de las 188 son VERDADERO (así venían del origen).
`insertar-46..205` (`sourceQuestionId` `P-01..P-172` con huecos, `generado:true`)
son **preguntas de RUTA** (4 opciones, 1 correcta + 3 distractores del mismo
nivel) de toda la pestaña Insertar — la pestaña solo tenía atajos hasta ahora.
Añaden 2 topics: `insertar:esignature` (grupo propio, confirmado por captura del
usuario) y `insertar:formato-forma` (cinta contextual de Formas, con
`ribbonGroup`). Detalle: `data/rutas/insertar_integration_report.md`.
Generador: `scripts/gen_insertar_rutas.py`. `insertar-394..405` (`P-16/21/28/
80..88`) = las 12 de galerías online (Imágenes de archivo / Modelos 3D /
plataformas de vídeo) que se descartaron en la 1ª pasada y el usuario pidió
integrar después; llevan advertencia ⚠️ "las galerías en línea de Microsoft
cambian con el tiempo".
`data/rutas/insertar.txt` y `data/rutas/insertar-4opciones.txt`
= volcados de rutas de Insertar del usuario (ver `data/rutas/README.md`;
NO se integran enteros, solo "por si acaso").
Las de `archivo`
`archivo-134..` (`sourceQuestionId` `opc-<panel>-NN`) cubren toggles de
`Archivo > Opciones` — opción = "sub-panel del diálogo ▸ ajuste",
distractores = ajustes-hermanos reales, nada inventado; las que ya tenían
pregunta previa (`archivo-64..79`) no se duplicaron. `archivo-324..336`
(`opc-bar-01..13`, `subtopic` "Barra de herramientas de acceso rápido",
topic `opciones-personalizar`) cubren el panel Barra de acceso rápido de
Opciones (filtro "Comandos disponibles en", Agregar/Quitar/Modificar,
separador, macros, para todos/este documento, mostrar/posición/etiquetas,
Restablecer, Importar-exportar) — verificadas con aulaClic + vence.es +
Microsoft Support ES; complementan `archivo-105..107` sin duplicarlas.
`archivo-337` (`opc-bar-14`) = concepto (personalización total pero solo
comandos). `archivo-338..350` (`opc-tc-02..14`, `subtopic` "Centro de
confianza", topic `opciones-complementos`) cubren las secciones del diálogo
Configuración del Centro de confianza (Editores/Ubicaciones/Documentos
confiables, Catálogos, Complementos-seguridad, ActiveX, Macros, Vista
protegida, Bloqueo de archivos, Barra de mensajes, Acceso mediante
programación, Opciones de privacidad, Configuración de formularios) —
verificadas con aulaClic + educa.jcyl.es + Microsoft Support ES; se omitió
el "acceder al Centro de confianza" del usuario por duplicar `archivo-112`.
Sin atajos en el bloque. **Taxonomía v6→v7**: el
topic único `archivo:opciones` (concepto gigante que degradaba el motor) se
partió por panel — `opciones-general/-presentacion/-revision/-guardar/
-idioma/-accesibilidad/-personalizar/-complementos` y, para el panel
Avanzadas (94 opciones en 14 sub-paneles), `opciones-avz-edicion/-pegar/
-mostrar/-presentacion/-imprimir/-guardar/-otras`. Migración por `subtopic`;
`id` intacto → `PROGRESS.answers`/`contentHash` no se tocan.
**Limitación conocida**: los conceptos de "ruta de menú" pura (¿dónde está
X?) sólo tienen un framing ("ruta") y por diseño de `deriveMastery` (exige
≥2) se quedan en `consolidando` para siempre — y el priorizador los sigue
sirviendo mucho. El escenario 5 de `tests/test_engine.js` bajó su umbral de
'asentado' de 0.40 a 0.35 por esto. Mejora pendiente posible: que
`bestItem` sirva una flashcard (framing "conceptual") cuando un concepto
tiene reps altas pero <2 framings.

Taxonomía: `inicio > parrafo` se abrió en 7 grupos
(`parrafo-marcas`/`-alineacion`/`-sangria`/`-espaciado`/`-bordes`/
`-listas`/`-tabulaciones`), que llevan `ribbonGroup:"Párrafo"` para que la
UI de creación los agrupe bajo el grupo real de la cinta; `vista` y
`revisar` tienen un grupo `estructura` (preguntas sobre grupos/ubicación de
la pestaña). Taxonomía v4 (sep-2026): completados los grupos de cinta que
faltaban (Inicio→Complementos, Insertar→Multimedia, Revisar→Voz/
Comentarios/Entrada de lápiz, Correspondencia→Crear/Vista previa de
resultados, Referencias→Tabla de autoridades) y `referencias > titulos-indice`
partido en `titulos` + `indice` — todo aditivo, ninguna pregunta cambió de
`topic` (esos grupos estaban a 0 preguntas). El campo `ribbonGroup` en un
topic es opcional; `populateTopicSelect`/`topicName` en views.js lo usan.
Taxonomía v5: la pestaña Revisar tiene **dos** grupos de cinta llamados
literalmente "Revisión" — el de corrección (`revision-ortografica`) y el de
visualización del marcado (`revision-marcado`: Filtrar todo el marcado /
Todas las revisiones / Mostrar revisiones / Panel de revisiones); ambos
llevan `ribbonGroup:"Revisión"`. Las 4 flashcards de ese grupo se movieron
de `seguimiento` a `revision-marcado`.

El campo `tema` ya no se usa para navegar (el asistente "Por pestaña y
grupo" y "Repasar preguntas" usan `section`/`topic` vía
`O.TAXONOMY_SECTIONS`); se conserva porque `computeStats().byTema`
todavía desglosa el rendimiento por grupo en `renderProgress`. El
selector del asistente de **multijugador** sigue igual (fuera de alcance).

Las flashcards son un recurso independiente de las preguntas, en
`data/flashcards/*.json` → `flashcards_data.js` →
`window.__OPE365_FLASHCARDS__` → `OPE.FLASHCARDS`. Cada una tiene
`cardId` (`"F-NNN"` contenido / `"E-NNN"` error, 3 dígitos, relativo a su
fuente) y `canonicalId` calculado en runtime como `"<section>:<cardId>"` —
usar siempre `canonicalId` para identificarlas (progreso, DOM, etc.),
nunca `cardId` a secas, porque `cardId` se repite entre secciones.
(sep-2026: `vista`/`revisar` pasaron de `F-01` a `F-001`; el resto ya
estaba a 3 dígitos.) `questionRefs` es un
enlace blando opcional hacia preguntas relacionadas — nunca uses
flashcards como fuente de verdad de una pregunta ni al revés.

Cuando se integre un documento de una pestaña nueva (Correspondencia,
etc.), seguir el mismo patrón que Vista: comparar contra el banco
existente antes de dar nada por "pregunta nueva" (ver
`data/vista_integration_report.md` como plantilla de ese proceso —
clasificación NUEVA/SOLAPAMIENTO/MEJORA/COMPLEMENTARIA/CONFLICTO),
declarar cualquier hueco o contradicción de la fuente en vez de
resolverla en silencio. El ID es `<section>-<índice>` y `sourceFile` =
`<section>.json`, así que una pestaña nueva no colisiona por
construcción; si integras un documento de una pestaña que ya tiene
archivo, añádele preguntas a ese archivo renumerando la cola.

## Motor de aprendizaje (engine.js + engine-bridge.js)

- **`engine.js` (`OPE.LE`)** es un motor de repetición espaciada + priorización
  propio (inspirado en FSRS, NO una copia). Un **concepto** = `section:topic`
  con contenido (~61). Modelo escalar: `R(t)=2^(-kR·t/interval)`, `kR` fija
  `R=targetRetention` (0.90, PRODUCTO, solo en `P`) en `t=interval`.
- **Dos ejes de estado INDEPENDIENTES** (no los mezcles nunca en la UI):
  `masteryStatus` (nuevo/aprendiendo/consolidando/asentado) y `reviewState`
  (futuro/debido/atrasado). Un concepto puede ser `asentado + atrasado`:
  que toque repasarlo NO significa que se haya olvidado. `asentado` solo se
  abandona con evidencia ACTUAL de pérdida (fallo reciente o acierto < 0.6).
  `status` = valor compuesto legado, solo para compat de lectura.
- `P` es la tabla de honestidad en código. Cada parámetro etiquetado
  PRINCIPIO / PRODUCTO / HEURÍSTICA / CALIBRABLE. **Nada de esto se expone ni
  se configura desde la interfaz** salvo lo que pasa por `setPlan` (fecha de
  examen, minutos/día, días de la semana).
- Sin `Math.random` en el motor. Todo el tiempo entra por un `now` param.
- **Capa de examen**: `recalc()` garantiza que ninguna recuperación NECESARIA
  quede programada tras `fechaExamen − 2 días`; si no cabe, marca `examDeficit`
  y `examReadiness().deficits` lo expone. `coverageProjection` es todavía poco
  discriminante → la UI NO lo presenta como % de probabilidad (dice "sin
  déficit detectado" / lista los bloques en déficit).
- Se valida con `tests/sim.js` (usuario sintético + verdad de terreno) y
  `tests/test_engine.js` (20 escenarios). **Cualquier cambio en el motor:
  reejecuta esos 20 antes de dar nada por bueno.**

- **`engine-bridge.js` (`OPE.LEB`)** es el ÚNICO sitio donde `views.js` toca el
  motor. La interfaz jamás inventa prioridades/intervalos/estados/déficits:
  todo sale de `LEB` (y `LEB` de `LE`). `LEB.boot()` siembra desde el progreso
  previo (`seedFromLegacy`, idempotente) + recalc, en `init()`. Cada respuesta
  de práctica/examen/flashcard llama a `LEB.recordQuestion/recordExamSession/
  recordFlashcard`. `tests/test_ui_integration.js` cubre los flujos A–X;
  `tests/manual_walkthrough_fase2.mjs` es la QA en navegador real.
- El sistema legado de `computeStats` / `getFlashcardState` ("dominada"
  booleana) **coexiste** con el motor: se usa para "precisión al responder"
  (una lente distinta) y para el badge/filtro de flashcards. No lo confundas
  con el dominio real, que sale del motor.

- **`content-overrides.js` (`OPE.ContentEdit`)** — permite corregir una
  pregunta/flashcard desde la app (botón ✎ en el runner, en el repaso y en
  el estudio de flashcards). Guarda un patch por id en
  `PROGRESS.contentOverrides` (solo campos cambiados: enunciado, opciones,
  respuesta, explicación, negativa / front, back, priority — nada
  estructural) y lo aplica EN SITIO a `Q_BY_ID`/`F_BY_ID` **antes de
  engine.js**, en cada carga. Reversible (`revert` restaura el original
  snapshotado en memoria). Exportable a JSON desde Ajustes → "Correcciones de
  contenido" para volcarlo a `data/`. `id`/`section`/`topic` no se editan, así
  que `PROGRESS.answers`, los conceptos del motor y `contentHash` (runtime)
  no se ven afectados. Se carga entre app.js y engine.js. Test:
  `tests/test_content_edit.js`.

- **`github-sync.js` (`OPE.GHS`)** — publica tu contenido propio (el de
  "Mi contenido") directamente al repo vía la API de GitHub, en UN commit
  atómico (Git Data API: blob→tree→commit→update-ref). Escribe la fuente
  con sangría (`data/questions|flashcards/<section>.json`, renumerando el id
  a `<section>-N` / `F-0NN`), el artefacto que sirve la web
  (`questions_data.js`/`flashcards_data.js`/`questions_all.json`, regenerado
  desde el banco pristino en memoria — `window.__OPE365_*` — + lo nuevo;
  un `python build_data.py` local lo normaliza igual) y el manifest si
  aparece una pestaña sin fichero. GitHub Pages redespliega solo (~1-2 min).
  El token (PAT fine-grained, *Contents: Read and write* sobre el repo) vive
  SOLO en `localStorage` bajo la clave `ope365_gh` — **fuera de PROGRESS**,
  así que no viaja en códigos de compartir, export ni HTML empaquetado. Se
  carga entre content-overrides.js y engine.js. UI: Ajustes → "Publicar en
  GitHub" (config/test) y "Mi contenido" → "Publicar al banco (N)"; los
  elementos publicados quedan marcados (`item.published = {sha,at,newId}`)
  y se pueden quitar como copia local. NO borra la copia local
  automáticamente (evita el hueco hasta que Pages redespliega). El HTML
  empaquetado (`OPE365_Word365_Estudio.html`) NO se actualiza por esta vía;
  se regenera con `build.py` en el siguiente build real. Test:
  `tests/test_github_sync.js` (fetch mockeado, sin red).
  - **`GHS.deleteFromBank(kind, id)`** — borrado REAL de una pregunta/flashcard
    del banco: la quita de `data/<tipo>/<section>.json` (sin renumerar el resto
    — deja el hueco, igual que `publish` nunca renumera al añadir) y regenera
    el artefacto. Un commit. La sección se deduce del `id` (`<section>-N` /
    `<section>:F-0NN`), así que funciona aunque el item no esté aún en el
    runtime (recién publicado, sin redesplegar). Rechaza contenido propio sin
    publicar (→ "Mi contenido"). Tras el commit la UI llama a
    `ContentEdit.purgeFromRuntime(kind, id)` (quita el item del banco vivo, los
    índices, el grafo de conceptos y el progreso asociado, sin recargar) +
    `revert` de cualquier corrección + `LEB.recalcNow()`. UI: botón rojo
    "Borrar del banco" en los modales de edición de pregunta/flashcard (`✎`) y
    en "Mi contenido" para elementos ya publicados. Irreversible desde la app.
  - **`GHS.applyEditToBank(kind, id)`** — escribe los campos ya corregidos
    (en memoria vía `ContentEdit`) del item en `data/<tipo>/<section>.json` +
    regenera el artefacto, un commit. La UI llama después a
    `ContentEdit.bake(kind, id)` (borra el registro de override SIN restaurar:
    los valores corregidos se quedan, desaparece el badge "corregida").
  - **Vista `banco` ("Editor del banco", `renderBancoAdmin` en views.js)** —
    consola tipo Anki-Browse SOLO visible con token de GitHub (`bancoIsAdmin()`
    = `GHS.hasToken()`; de facto solo el dueño). Toggle Preguntas/Flashcards,
    búsqueda de texto (id + enunciado + opciones + explicación / front+back),
    filtros pestaña/grupo/tipo/estado (corregida·creada·sin explicación·
    fallada·marcada), contador "N / total". **Layout partido tipo Anki-Browse**
    (`.bk-split`): lista a la izquierda (máx 400 filas), **panel de edición
    inline** a la derecha con `qEditFormHtml`/`fcEditFormHtml` (los mismos
    formularios que el modal ✎; ids con prefijo `bk-ed`). **Autoguardado**:
    cada `change` de campo → `bancoSaveEditor` calcula el patch por diff vs
    `ContentEdit.original`, hace `revert` + `apply` (para poder quitar campos),
    `recalcSoon`; si el campo vuelve al original, la corrección se retira sola.
    Navegación ‹ › entre resultados (salva lo escrito antes de moverse). El
    contenido propio abre su formulario completo (`openUserQuestionModal`).
    Botones del panel: **Guardar** (explícito), **Publicar al banco (GitHub)**
    (`bancoPublishEdit` → `GHS.applyEditToBank` + `ContentEdit.bake`), Descartar,
    Ver en repaso, Borrar del banco (`deleteFromBankFlow`). "Publicar"/"Descartar"
    se habilitan solo con corrección pendiente. Acceso visible: **Progreso →
    "Administración"** (solo con token) además de Ajustes y "Mi contenido". Helpers compartidos
    con el modal: `qEditFormHtml`/`readQPatch`/`wireTfSegments`,
    `fcEditFormHtml`/`readFcPatch`. Filtrado en views.js
    (`bancoFilterQuestions`/`bancoFilterFlashcards`, no toca `filterQuestions`).
    Entradas: Ajustes y "Mi contenido" (solo con token). `groupForView` →
    `progress`. Test: `tests/test_banco_admin.js`.

## Arquitectura de sesiones y compartir (app.js)

- Semillas deterministas (`mulberry32`, versionado como
  `randomizationAlgorithmVersion`) para que dos dispositivos reconstruyan
  exactamente el mismo test a partir de config+semilla — nunca
  `Math.random()` para nada que deba reproducirse.
- Sesión de estudio separada del contenido canónico: solo se persiste
  `questionIds[]` + `presentation{}` (permutación), nunca el texto
  duplicado — verificado que una sesión de 10 preguntas con 1 respuesta
  pesa ~1KB en localStorage.
- Códigos de compartir `Q-`/`S-`/`T-`/`R-` (pregunta/selección/test/reto).
  Sin backend: los códigos largos son el precio de no tener servidor —
  no se puede acortar sin uno.
- Desafíos con resultado sellado: ofuscación reversible ligera, **no es
  cifrado de verdad** — se dice así en la propia interfaz, no se debe
  presentar como anti-trampa real.

## Multijugador (multiplayer.js)

Transporte real: PeerJS (necesita internet en ambos dispositivos — único
punto de la app que no funciona offline). Existe también un transporte
simulado (`createMockPair`) para probar la lógica sin red real — úsalo
para cualquier cambio en la máquina de estados antes de asumir que
funciona.

- **Duelo**: respuesta simultánea con reloj compartido (deadline decidido
  por el host). Dos formatos: "cada uno responde" (espera a ambos o al
  tiempo) y "el primero que pulse" (resuelve al instante con quien
  responda antes — el host desempata por marca de tiempo).
- **Farol**: por turnos, atacante elige carta+respuesta (puede mentir),
  defensor decide CONFÍO/DUDO. Fichas de farol limitadas (3 por jugador),
  asaltos de mayor valor a mitad de partida, remontada automática si vas
  8+ puntos por detrás, comodín 50/50 (1 uso, solo para el defensor,
  reduce puntos a la mitad si acierta).
- **Contra Word** (`createCoopGame`, `mpGameMode:"coop"`): cooperativo, los
  dos humanos son EQUIPO y el rival es "Word". Cada ronda Word presenta
  una **afirmación** y los dos votan **Verdadero** (celda verde) /
  **Falso** (celda roja) desde su móvil. `buildWordPlan` convierte
  CUALQUIER tipo menos `relleno` (no tiene distractores) en esa afirmación:
  `vf` = la frase tal cual · `opt` = Word enuncia una opción · `multi` =
  Word da un conjunto (a veces con una cambiada/omitida) · `match` = Word
  da un emparejamiento completo (a veces con dos cruzados). `plan.truth`
  dice si lo mostrado es correcto; la casilla correcta es `"V"`/`"F"`.
  Cuando Word se equivoca, el panel de fin de ronda enseña "Lo correcto"
  (`mpCoopCorrectText`). Puntúa el equipo (los dos aciertan = +200·racha;
  uno = +90; ninguno = Word +140). Sin `raceMode`. El plan lo fija el host
  y viaja en `config.wordPlan` — igual que `questionIds` — para que ambos
  lados vean lo mismo sin servidor. **Cuánto miente Word NO se configura**
  (sep-2026): cada partida sortea su tasa (`0.25 + rng()*0.50`, semilla
  compartida) y la reparte como presupuesto FIJO barajado — la cantidad es
  sorpresa pero sin rachas ni dado por ronda. El asistente sí deja elegir
  ritmo (preset o "a tu medida": rondas 3-40, seg 5-90) y tipo de ejercicio.
  Reusa el tablero determinista, el
  reloj y la máquina de ronda del Duelo (la vista guarda el engine en
  `mpDuel` y `mpGameMode` desambigua el render: `renderMpCoopGame`/
  `mpCoopClaimHtml`/`mpCoopRenderBody`/`renderMpCoopResults`). Resultado
  final: marcador equipo–Word + "Word os pilló en" con enlace a repasar
  esos `section:topic`.

**Bugs reales ya encontrados y corregidos en este historial** (por si
reaparecen en un refactor): reenvío de `round_start` tras reconexión
borraba la respuesta ya dada del host; avance de turno en Farol no
avisaba al invitado; `myReal`/`rivalReal` como `null` en vez de `false`
rompía el desempate de carrera. Los tres tenían pruebas automatizadas que
los detectaron — si tocas esta zona, reutiliza ese patrón de test antes
de dar nada por bueno.

**Tablero por valor, no por referencia (sep-2026):** el host compone el
tablero ENTERO (`buildSessionFromIds` → preguntas ya con opciones
barajadas, `respuesta` remapeada, `matching`, `explicacion`) y lo mete en
`config.qPayload`; el invitado lo usa VERBATIM. Antes solo viajaban los
`questionIds` y el invitado recomponía desde su banco — si le faltaba
alguna (Pages sin redesplegar entre los dos móviles, contenido propio,
una borrada) el tablero divergía: la partida no arrancaba, o salían
rondas con la pregunta de un lado y el `wordPlan`/opciones del otro
("no se podían marcar las opciones"). Vale para Duelo y Contra Word.
`requestRematch` borra `qPayload` (+ `wordPlan` en coop) para re-resolver.
Conexión: **un solo broker PeerJS** para ambos (probar varios sin canal
previo los separa) + ICE con TURN (OpenRelay); con datos móviles/CGNAT
sin TURN propio la conexión directa falla y hay que jugar en Wi-Fi
(la pantalla de error lo dice + despliega `OPE_MP.getNetLog()`).

**Repaso al final (sep-2026):** los tres modos emiten `review` en el
evento `finished` (pregunta + respuesta de cada uno + correcta +
`explicacion`). Lo pintan `mpDuelReviewHtml`/`mpCoopReviewHtml`/
`mpPokerReviewHtml` (helpers compartidos `mpAnswerToText`/`mpReviewShell`/
`mpReviewItemHtml`, CSS `.mp-review`/`.mp-rev-item`).

## Disciplina de pruebas

`tests/test_*.js` son pruebas jsdom que sí persisten en el repo (antes de
la migración de arquitectura de ago-2026 se construían con este mismo
patrón pero de forma ad hoc, sin guardarlas). Requieren
`npm install` una vez (`package.json` solo trae `jsdom` como
devDependency — nada de esto es una dependencia en runtime de la app).
Patrón: `tests/fixture.html` como HTML mínimo, cargarlo con `JSDOM`,
`window.eval()` de cada script en el orden real (`questions_data.js` →
`taxonomy_data.js` → `flashcards_data.js` → `app.js` → `content-overrides.js`
→ `github-sync.js` → `engine.js` → `engine-bridge.js` → `multiplayer.js` →
`views.js`), simular
clics/eventos reales (incluida la navegación vía
`[data-goto]`, que es el único enganche público de `views.js` — `go()`/
`render()` están cerradas dentro de su IIFE), leer `OPE.getState()`/
`OPE_MP...`. Para multijugador, usar `MP.createMockPair()` en vez de
PeerJS real (jsdom no implementa WebRTC). Ejecutar todos con
`node tests/test_<nombre>.js` (sin runner, cada uno es un script
autocontenido que sale con código 0/1).

**No se puede verificar conectividad WebRTC real desde jsdom** — eso solo
se prueba con dos navegadores reales.

**Probar la app en un navegador real (no solo jsdom):** servir la carpeta
(`python -m http.server <puerto> --directory <ruta>` — usar `--directory`
explícito y un puerto propio para evitar arrancar sobre el directorio o
puerto equivocado si hay otro servidor suelto por ahí) y dirigirla con
Playwright headed (`npm install playwright` + `npx playwright install
chromium`, no está en `package.json` a propósito por ser pesado — instalar
aparte cuando haga falta). Ver `tests/manual_walkthrough*.mjs` y
`tests/manual_driver.mjs` como referencia de ese patrón — no son parte
del proyecto ni se ejecutan en CI, son herramientas puntuales de QA
manual. **Esto encontró un bug real que jsdom no detectó**: dos
selectores de tipo de ejercicio en `views.js` tenían la lista de tipos
escrita a mano y no incluían "relleno" cuando se añadió — un test jsdom
centrado en el tipo nuevo no lo habría visto porque nunca pasaba por esa
UI de filtrado. Antes de dar una función de UI por probada, recorrerla de
verdad en el navegador al menos una vez.

## Cómo pedir cosas en este proyecto (estilo del usuario)

Directo, mensajes cortos, espera que se ejecute sin pedir permiso de más.
Prefiere que se corrija con pruebas reales antes que se declare "hecho".
Si algo es dudoso en cuanto a datos del examen, decirlo claramente en vez
de inventar — el usuario ha rechazado activamente contenido no verificado
más de una vez en esta conversación, así que la barra de exigencia en
precisión de datos es alta.
