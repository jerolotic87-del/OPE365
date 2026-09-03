# Integración — 172 preguntas de RUTA de la pestaña Insertar (sep 2026)

Fuente: `Insertar_Rutas_4opciones.txt` (P-01..P-172), generadas por una sesión
previa a partir de una "extracción" de la cinta Insertar que **no está en este
repo**. Formato: opción única, 4 opciones (1 correcta + 3 distractores del mismo
nivel jerárquico: nombre / grupo / pestaña / subopción inexistente).

## Clasificación (patrón `vista_integration_report.md`)

`insertar.json` tenía **45 preguntas, todas `categoria:"atajo"`**. Estas 172 son
**todas `categoria:"ruta"`**. → **COMPLEMENTARIA** en bloque: cero solapamiento,
cero conflicto. Cubren el hueco de "ruta" que la pestaña Insertar tenía a 0.

- IDs: `insertar-46` … `insertar-217`. `sourceQuestionId` = `P-01`…`P-172`.
- Todas `"generado": true`.
- Taxonomía: 2 topics nuevos en `insertar` —
  - `esignature` (grupo propio de la cinta, confirmado por captura del usuario)
  - `formato-forma` (cinta **contextual** que aparece al insertar una forma;
    mismo criterio que el grupo `estructura` de Vista/Revisar)
- Reparto: paginas 6 · tablas 10 · ilustraciones 37 · formato-forma 19 ·
  vinculos 13 · comentarios 1 · encabezado-pie 20 · texto 31 · simbolos 31 ·
  multimedia 2 · esignature 2.

## Verificación

~150 son coherentes con comportamiento **verificable** de Word 365 ES
(opciones de "Insertar tabla", tipos de gráfico —Proyección solar, Rectángulos,
Cajas y bigotes, Cascada, Embudo, Histograma…—, estructuras del editor de
ecuaciones, grupos de la cinta contextual Formato de forma, campos de los
cuadros de diálogo Letra capital / Línea de firma / Fecha y hora / Objeto,
subrutas de Número de página, etc.).

### PENDIENTE de contraste en Word 365 en vivo

Afirman el contenido de **galerías online** (cambian con el tiempo y no están en
`atajos_oficial.json` ni en ninguna fuente de este repo). Si fallan al probarlas,
borrar desde el Editor del banco:

| id | P- | afirma |
|----|----|--------|
| `insertar-61` | P-16 | categorías del cuadro "Imágenes de archivo" (incluye "Partes del cuerpo") |
| `insertar-66` | P-21 | categoría 3D online "Dibujos animados vintage" |
| `insertar-125`..`insertar-133` | P-80..P-88 | categorías de "Modelos 3D en línea": Steampunk, Polígonos bajos, Adhesivos, Cosmos, Dioramas, Geología, Letras, Juguetes, Esculturas |
| `insertar-73` | P-28 | plataformas de "Vídeo en línea": YouTube, SlideShare, Vimeo, TED (lista sensible a la versión) |

### Confianza media (nombres exactos / dependientes de la instalación)

| id | P- | matiz |
|----|----|-------|
| `insertar-60` | P-15 | los nombres de categoría del enunciado son adorno; la ruta (Imágenes de archivo) sí es verificable |
| `insertar-180`..`insertar-182` | P-135..P-137 | tipos de objeto OLE ("Microsoft Graph Chart", "…Macro-Enabled Worksheet", "PowerPoint 97-2003") — dependen de lo instalado; los nombrados son estándar |

## Notas de parseo

El .txt traía restos de chat ("Claude Sonnet", "sigue", tablas-resumen). P-52 y
P-142 aparecían cortadas y repetidas; se tomó la versión completa. Generador:
`scripts/gen_insertar_rutas.py` (one-shot, commitado por procedencia).
