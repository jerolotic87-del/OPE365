# OPE365 — Word 365 para oposición ayuntamiento

Contexto para Claude Code. Léelo entero antes de tocar nada — este proyecto
tiene reglas de fuente estrictas que no son negociables.

## Qué es esto

App de estudio offline (un solo HTML, sin backend) para preparar el temario
de Word 365 de una oposición de ayuntamiento. 952 preguntas del banco
original + un primer bloque de Vista integrado (61 preguntas, 46
flashcards), práctica/examen con corrección inmediata, compartir por
código, desafíos asíncronos con resultado sellado, un mazo de flashcards
(frente/dorso, sin repetición espaciada todavía), y dos modos multijugador
en tiempo real (Duelo y Farol) sobre WebRTC vía PeerJS.

## Estructura de archivos (desarrollo local)

```
index.html          shell HTML — usa <script src> a los ficheros de abajo
styles.css           todo el sistema de diseño (oscuro, tokens en :root)
app.js                motor: modelo canónico, sesiones, PRNG con semilla,
                       códigos de compartir, desafíos, estadísticas,
                       flashcards (§10)
multiplayer.js        Duelo y Farol: transporte PeerJS + máquina de estados
views.js               toda la interfaz (router simple basado en funciones)
peerjs.min.js          librería de terceros, no tocar
atajos_oficial.json    tabla extraída de ATAJOS.docx (ver más abajo)

--- artefactos generados (NO editar a mano, ver "Regenerar datos") ---
questions_all.json     banco de preguntas concatenado — fuente de verdad
                       en tiempo de ejecución, pero se genera desde
                       data/questions/*.json
questions_data.js      questions_all.json envuelto en window.__OPE365_DATA__
taxonomy_data.js       data/taxonomy.json envuelto en window.__OPE365_TAXONOMY__
flashcards_data.js     data/flashcards/*.json envuelto en
                       window.__OPE365_FLASHCARDS__

--- fuente editable de datos ---
data/questions/*.json  el banco partido por sourceFile (1.json..8.json,
                       atajos.json, vista.json, ...), con manifest.json
                       fijando el orden de carga
data/flashcards/*.json  flashcards por sección (vista.json, ...), con su
                        propio manifest.json
data/taxonomy.json     taxonomía pedagógica (section > topic > subtopic),
                       configurable, independiente de sourceFile/bloque
data/vista_integration_report.md  comparación pregunta-por-pregunta del
                       banco de Vista contra el banco existente (Etapa 3
                       de la migración de arquitectura, ago 2026)

--- herramientas ---
build_data.py          regenera questions_all.json/questions_data.js/
                       taxonomy_data.js/flashcards_data.js desde data/ —
                       ejecutar SIEMPRE tras tocar algo bajo data/
build.py               empaqueta todo (incluidos los artefactos de
                       arriba) en OPE365_Word365_Estudio.html
tests/                 pruebas jsdom (node tests/test_*.js) — requieren
                       `npm install` una vez (ver package.json)
```

**Para desarrollar:** sirve la carpeta con un servidor local, no abras
`index.html` con doble clic (fetch/scripts locales fallan por CORS en
`file://`). Por ejemplo: `python3 -m http.server 8000` y abre
`localhost:8000`.

**Para producir el HTML único de siempre** (todo inlineado en un archivo,
para compartir sin depender de una carpeta): ver `build.py` en esta misma
carpeta — genera `OPE365_Word365_Estudio.html`.

## Regla de oro: jerarquía de fuentes

Cuando una pregunta o un atajo esté en duda, este es el orden de autoridad,
de mayor a menor:

1. **Prueba en vivo del usuario en su propio Word 365** — si dice "lo he
   probado y hace X", eso manda por encima de cualquier documento.
2. **`atajos_oficial.json`** (extraído de `ATAJOS.docx`, volcado real del
   cuadro "Personalizar teclado" de la instalación del usuario).
3. **PDFs de la academia** (Beatriz R.) — están en el Project Knowledge de
   claude.ai, no en esta carpeta local. Si necesitas su contenido, pide al
   usuario que los suba o pégalos.
4. **Documentación de Microsoft en español online** — la menos fiable
   (traducción automática confirmada). Último recurso.

**Nunca inventes un atajo o distractor que no exista en una fuente real.**
Si dos fuentes se contradicen, dilo en el chat — no lo resuelvas en
silencio ni elijas arbitrariamente.

### Contexto importante ya resuelto (no lo reabras sin motivo)

- Esta instalación de Word 365 español usa el **esquema clásico de
  localización**: Ctrl+Q/T/D/J para alineación izq/centro/der/justificar,
  Ctrl+N/S/K para negrita/subrayado/cursiva, Ctrl+L=Reemplazar,
  Ctrl+H=Sangría, Ctrl+F=Sangría francesa, Ctrl+I=Ir a — **distinto del
  esquema internacional en inglés**. Confirmado por `ATAJOS.docx` +
  PDF de la academia + prueba en vivo del usuario.
- **Ctrl+R no tiene ninguna acción asignada** en esta instalación (no
  aparece en `ATAJOS.docx`). No es Ctrl+R quien alinea a la derecha — es
  Ctrl+D.
- **Ctrl+W quita el formato de párrafo** (sangrías, etc.), NO cierra el
  documento — confirmado por prueba en vivo del usuario, aunque
  `ATAJOS.docx` lo lista de forma contradictoria bajo ambas cosas.
- 38 preguntas nuevas (`gen-atajo-1` a `gen-atajo-38`, campo
  `"generado": true`) cubren atajos de `ATAJOS.docx` que no tenían ninguna
  pregunta, incluyendo variantes alternativas de un mismo comando
  (ej. Guardar tiene 3 atajos válidos, ahora las 3 tienen pregunta propia).

## Modelo de datos (questions_all.json)

Cada pregunta tiene: `id`, `sourceFile`, `bloque`, `tipo`
(`opcion_unica`/`seleccion_multiple`/`verdadero_falso`/`emparejamiento`),
`categoria` (`atajo`/`ruta`/`concepto`/`general`), `negativa` (bool),
`enunciado`, `opciones` (`[{letter,text}]`), `respuesta` (letra o array de
letras, o bool para V/F, o mapa para emparejamiento), `explicacion`,
`contentHash`, `questionVersion`. Las de farol/atajo generadas llevan
`"generado": true`.

**`app.js` calcula content hash y registro de migración en cada carga** —
si añades preguntas a mano, no hace falta tocar nada más, los contadores
son dinámicos.

## Arquitectura del motor (app.js)

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

**Bugs reales ya encontrados y corregidos en este historial** (por si
reaparecen en un refactor): reenvío de `round_start` tras reconexión
borraba la respuesta ya dada del host; avance de turno en Farol no
avisaba al invitado; `myReal`/`rivalReal` como `null` en vez de `false`
rompía el desempate de carrera. Los tres tenían pruebas automatizadas que
los detectaron — si tocas esta zona, reutiliza ese patrón de test antes
de dar nada por bueno.

## Disciplina de pruebas

Antes de este proyecto no había tests automatizados — se han ido
construyendo con jsdom sobre la marcha. Patrón: crear un HTML mínimo con
los scripts necesarios, cargarlo con `JSDOM`, simular clics/eventos, leer
`OPE.getState()` / `OPE_MP...`. Para multijugador, usar
`MP.createMockPair()` en vez de PeerJS real (jsdom no implementa WebRTC).
No se puede verificar conectividad WebRTC real desde este tipo de sandbox
— eso solo se prueba con dos navegadores reales.

## Cómo pedir cosas en este proyecto (estilo del usuario)

Directo, mensajes cortos, espera que se ejecute sin pedir permiso de más.
Prefiere que se corrija con pruebas reales antes que se declare "hecho".
Si algo es dudoso en cuanto a datos del examen, decirlo claramente en vez
de inventar — el usuario ha rechazado activamente contenido no verificado
más de una vez en esta conversación, así que la barra de exigencia en
precisión de datos es alta.
