# data/rutas/ — volcados de rutas de la cinta

Un archivo `.txt` **por pestaña de la cinta**, con el volcado literal de
rutas de menú/diálogo de esa pestaña, extraído por el usuario de su
instalación real de Word 365 (v2608, compilación 16.0.20326.20072).

## Convención de nombres

| Archivo                     | Contenido                                                        |
|-----------------------------|-----------------------------------------------------------------|
| `<pestaña>.txt`             | Volcado completo de rutas de esa pestaña (`Pestaña > Grupo > …`) |
| `<pestaña>-4opciones.txt`   | Variante del volcado en formato "1 correcta + 3 distractores"    |
| `<pestaña>_integration_report.md` | Informe de qué se integró como preguntas y qué se descartó |
| `_dialogos_compartidos.md`   | Cruce: qué rutas abren el mismo cuadro, en qué ficha, desde qué pestañas |

Pestañas: `interfaz`, `archivo`, `inicio`, `insertar`, `diseno`,
`disposicion`, `referencias`, `revisar`, `vista`, `correspondencia`.

Las capturas de pantalla de origen (una carpeta por pestaña, mismo id)
están en `data/imagenes_rutas/<pestaña>/`.

## Reglas

- **Son fuente, no artefacto.** De aquí salen los bancos
  `data/questions/<pestaña>.json` y `data/flashcards/<pestaña>.json`.
- **No se editan a mano** salvo para añadir un volcado nuevo del usuario.
- **No se integran enteros como preguntas.** Solo se convierten en
  ejercicios las rutas con valor de examen; el resto queda como referencia
  "por si acaso" (ver el `_integration_report.md` de cada pestaña).
- Para **atajos de teclado** la fuente NO es esto, es
  `data/atajos_word365_v2608.md` (volcado de "Personalizar teclado").
- `"..."` en una línea = etiqueta truncada en la captura original del
  usuario.
