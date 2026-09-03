# Integración — 172 preguntas de RUTA de la pestaña Insertar (sep 2026)

Fuente: `Insertar_Rutas_4opciones.txt` (P-01..P-172), generadas por una sesión
previa a partir de una "extracción" de la cinta Insertar que **no está en este
repo**. Formato: opción única, 4 opciones (1 correcta + 3 distractores del mismo
nivel jerárquico: nombre / grupo / pestaña / subopción inexistente).

## Clasificación (patrón `vista_integration_report.md`)

`insertar.json` tenía **45 preguntas, todas `categoria:"atajo"`**. De las 172 del
archivo se importaron **160** (`categoria:"ruta"`) → **COMPLEMENTARIA** en bloque:
cero solapamiento, cero conflicto. Cubren el hueco de "ruta" que la pestaña
Insertar tenía a 0.

- IDs: `insertar-46` … `insertar-205`. `sourceQuestionId` = `P-01`…`P-172`
  (con huecos: ver "descartadas").
- Todas `"generado": true`.
- Taxonomía: 2 topics nuevos en `insertar` —
  - `esignature` (grupo propio de la cinta, confirmado por captura del usuario)
  - `formato-forma` (cinta **contextual** que aparece al insertar una forma;
    mismo criterio que el grupo `estructura` de Vista/Revisar)
- Reparto (tras descartar 12): paginas 6 · tablas 10 · ilustraciones 26 ·
  formato-forma 19 · vinculos 13 · comentarios 1 · encabezado-pie 20 ·
  texto 31 · simbolos 31 · multimedia 1 · esignature 2.

## Verificación

~150 son coherentes con comportamiento **verificable** de Word 365 ES
(opciones de "Insertar tabla", tipos de gráfico —Proyección solar, Rectángulos,
Cajas y bigotes, Cascada, Embudo, Histograma…—, estructuras del editor de
ecuaciones, grupos de la cinta contextual Formato de forma, campos de los
cuadros de diálogo Letra capital / Línea de firma / Fecha y hora / Objeto,
subrutas de Número de página, etc.).

### DESCARTADAS (12) — no importadas

Afirmaban el contenido de **galerías online** (cambian con el tiempo, no están en
`atajos_oficial.json` ni en ninguna fuente de este repo). El usuario pidió
dejarlas fuera tras la revisión:

- **P-16** — categorías del cuadro "Imágenes de archivo"
- **P-21, P-80..P-88** — categorías de "Modelos 3D en línea" (Dibujos animados
  vintage, Steampunk, Polígonos bajos, Adhesivos, Cosmos, Dioramas, Geología,
  Letras, Juguetes, Esculturas)
- **P-28** — plataformas de "Vídeo en línea" (YouTube/SlideShare/Vimeo/TED,
  lista sensible a la versión)

El generador (`scripts/gen_insertar_rutas.py`) las excluye vía `DROP`.

### Confianza media (nombres exactos / dependientes de la instalación)

| id | P- | matiz |
|----|----|-------|
| `insertar-60` | P-15 | los nombres de categoría del enunciado son adorno; la ruta (Imágenes de archivo) sí es verificable |
| `insertar-168`..`insertar-170` | P-135..P-137 | tipos de objeto OLE ("Microsoft Graph Chart", "…Macro-Enabled Worksheet", "PowerPoint 97-2003") — dependen de lo instalado; los nombrados son estándar |

## Notas de parseo

El .txt traía restos de chat ("Claude Sonnet", "sigue", tablas-resumen). P-52 y
P-142 aparecían cortadas y repetidas; se tomó la versión completa. Generador:
`scripts/gen_insertar_rutas.py` (one-shot, commitado por procedencia).
