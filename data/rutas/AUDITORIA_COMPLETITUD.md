# Auditoría de completitud de los volcados de rutas (`data/rutas/*.txt`)

sep-2026 · cruce de cada volcado contra temarios de Word 365 en internet
(aulaClic, CustomGuide, ediciones ENI, vence.es, y —con reservas— la ayuda
de Microsoft), teniendo en cuenta que **muchas fuentes describen la versión
internacional** y no la instalación real del usuario (Word para Microsoft
365, español de España, v2608).

---

## 0. Método y límite de fiabilidad

- **Fuente primaria = las capturas del usuario** en `data/imagenes_rutas/`.
  Los volcados se hicieron rama a rama de esas capturas, así que reflejan la
  instalación real.
- **Internet solo sirve para detectar HUECOS** (algo que existe y no se
  capturó) y para **avisar de nombres internacionales** que no coinciden.
  No sirve para "corregir" un nombre del volcado: si el volcado dice una
  cosa y una web dice otra, **manda el volcado** (ver regla de oro de
  CLAUDE.md; `support.microsoft.com` está descartado como fuente).
- Las **galerías que cambian con el tiempo** (plantillas de portada, temas,
  marcas de agua de Office.com, complementos de proveedor SP, categorías de
  iconos / modelos 3D en línea) **no se auditan como listas cerradas** —
  Microsoft las actualiza sin avisar. El banco ya lo trata así.

**Veredicto general:** los siete volcados están **muy completos** en lo que
tiene valor de examen (estructura de cuadros de diálogo, desplegables de
comandos, listas cerradas). Los huecos que siguen son menores y están
listados abajo, cuadro por cuadro.

---

## 1. `inicio.txt`  ·  ✅ completo (auditado a fondo esta sesión)

Cubre Portapapeles, Fuente, Párrafo, Estilos, Edición, Voz, Editor,
Complementos y **todos** sus cuadros de diálogo y desplegables. Verificado
contra las 156 capturas + cruce web:

- **Cuadro Párrafo** — Interlineado `Sencillo / 1,5 líneas / Doble / Mínimo /
  Exacto / Múltiple` y Especial `(ninguna) / Primera línea / Sangría
  francesa`: **coincide con la fuente** (ediciones ENI, aulaClic).
- **Cuadro Fuente** — 7 casillas de Efectos (Tachado, Doble tachado,
  Superíndice, Subíndice, Versalitas, Mayúsculas, Oculto): correcto para
  365 (Contorno/Relieve/Sombra ya NO están aquí, se movieron al panel
  «Efectos de texto»).
- **Bordes y sombreado**, **Definir nuevo formato de número / viñeta / lista
  multinivel**, **Buscar y reemplazar** (3 fichas), **Opciones del panel
  Estilos**: completos.
- Único punto de fricción (ya registrado): el *tooltip* de Subíndice
  muestra `Ctrl+=` (esquema internacional); en esta instalación **no
  funciona**, el real es `Ctrl+Mayús+-`.

**Hueco menor:** el submenú **Efectos de texto y tipografía ▸ Ligaduras**
no tiene sus valores desglosados en el volcado (Ninguno / Estándar solo /
Estándar y contextual / Históricas y discrecionales / Todas). Bajo valor de
examen.

---

## 2. `disposicion.txt`  ·  ✅ completo

- **Configurar página** — las 3 fichas (Márgenes, Papel, Disposición) con
  todos sus campos. ✅
- **Saltos** — página `Página / Columna / Ajuste del texto` + sección
  `Página siguiente / Continua / Página par / Página impar`: **es el juego
  completo** (7 tipos). ✅
- **Números de línea**, **Guiones**, **Columnas** (cuadro completo),
  **cuadro Párrafo**, **cuadro Disposición** (objeto: Posición / Ajuste del
  texto / Tamaño), **Alinear**, **Configuración de cuadrícula**: completos.

**Huecos menores:**
- **Tamaño de papel** — el volcado lista 10 tamaños (Carta…B5 JIS). La
  galería real suele incluir además **A6, Sobre (varios), Postal, Tarjeta
  índice**… pero eso depende de la impresora predeterminada, así que la
  lista "correcta" varía de una máquina a otra. No es un hueco real.
- **Organizar ▸ Ajustar texto** — falta la opción **«Modificar puntos de
  ajuste»** en algún estado (aparece atenuada si el objeto no admite
  ajuste); el volcado sí la tiene en la línea 124. OK.
- **Márgenes** — el volcado no incluye la **7.ª entrada del desplegable**
  cuando hay una config. personalizada guardada distinta de «Normal»
  («Última configuración personalizada» aparece dos veces si el usuario
  cambió los valores). Cosmético.

---

## 3. `diseno.txt`  ·  ⚠️ completo con 1 hueco confirmado

- **Formato del documento** (Temas, Colores, Fuentes, Espaciado entre
  párrafos, Efectos, Conjunto de estilos, Administrar estilos): completo.
  Los nombres de tema/color son galería móvil, no se auditan uno a uno.
- **Fondo de página** (Marca de agua, Color de página, Bordes de página):
  el cuadro **Bordes y sombreado** desde aquí abre en la ficha **Borde de
  página** (con el campo **Arte**). ✅

**Hueco confirmado:**
- **Marca de agua ▸ galería integrada** — el volcado tiene el grupo
  «Confidencial» (CONFIDENCIAL 1/2, NO COPIAR 1/2) y «Declinaciones de
  responsabilidades» (BORRADOR 1, BORRADOR 2, EJEMPLO 1). La galería
  estándar de 365-ES trae **también `EJEMPLO 2`** en ese segundo grupo →
  **falta 1 entrada** (probable recorte de la captura). Merece una captura
  nueva para confirmar.
- El grupo «Confidencial» en la versión internacional trae además `ASAP 1`,
  `DO NOT COPY 1`, `URGENT 1`… — en ES esos textos **no existen** (solo
  CONFIDENCIAL y NO COPIAR). Aquí el volcado ES es el correcto; se anota
  solo para no "completarlo" con entradas inglesas.

---

## 4. `referencias.txt`  ·  ✅ completo

- **Tabla de contenido** — cuadro con las 3 fichas compartidas (TdC / Índice
  / Tabla de ilustraciones); formatos `Estilo personal, Clásico, Elegante,
  Sofisticado, Moderno, Formal, Sencillo` (7) y estilos `TDC 1-9`. ✅
- **Estilo de cita** — `APA, Chicago, GB7714, GOST-Orden de nombre,
  GOST-Orden de título, Harvard-Anglia, IEEE, ISO 690-Primer elemento y
  fecha, ISO 690-Referencia numérica, MLA, SIST02, Turabian` = **12, la
  lista completa de 365**. ✅
- **Notas al pie y notas al final**, **Referencia cruzada** (8 tipos),
  **Marcar entrada de índice**, **Administrador de fuentes**: completos.

**Aviso de terminología (importante):**
- **`Referencias ▸ Insertar título`** en inglés es **«Insert Caption»**
  (rótulo de una ilustración/tabla), **NO «Title»**. Y el estilo de
  documento «Título» (grande) sí es «Title», mientras que «Título 1/2/3»
  son «Heading 1/2/3». Tres cosas distintas con la palabra "Título" —
  el volcado las distingue bien, pero cualquier temario en inglés las
  mezcla.
- Estilos de la TdC: **`TDC 1-9`** en ES = **`TOC 1-9`** en inglés.

---

## 5. `correspondencia.txt`  ·  ⚠️ base PDF, no capturas — revisar 2 puntos

Este volcado **no** viene de capturas de la instalación, sino de renderizar
el PDF de la academia (Beatriz R.T.). Es fiable para la estructura, pero:

- **`Iniciar combinación de correspondencia`** — el desplegable lista
  `Cartas / Mensajes de correo electrónico / Sobres… / Etiquetas… /
  Directorio / Documento normal de Word / Asistente paso a paso` = **los 7,
  completo**. ✅
- **`Reglas`** — `Preguntar / Rellenar / Si…Entonces…Sino / Registro de
  combinación nº / Secuencia de combinación nº / Próximo registro / Próximo
  registro si… / Asignar marcador / Saltar registro si…` = **9, la lista
  completa**. ✅
- **`Bloque de direcciones`** y **`Línea de saludo`** abren cada uno su
  cuadro de diálogo (formato del nombre, país/región, corrección de
  campos…) — **el volcado no los desarrolla**. Hueco real de valor medio.
- **`Finalizar y combinar`** — `Editar documentos individuales / Imprimir
  documentos / Enviar mensajes de correo electrónico` = 3, completo. ✅
- **Atajos** — el bloque final da `Alt+Mayús+M/D/K/E/J`. Están en el
  esquema clásico ES y coinciden con el PDF, pero **no** figuran en el
  volcado v2608 de Personalizar teclado → si se preguntan, la explicación
  debe decir "según el PDF de la academia; no verificado en Personalizar
  teclado".

**Pendiente:** una tanda de capturas reales de la pestaña Correspondencia
del usuario cerraría los cuadros «Bloque de direcciones», «Línea de
saludo», «Insertar campo de combinación» y «Buscar entrada».

---

## 6. `archivo.txt` (Vista Backstage)  ·  ✅ muy completo

- Panel de navegación, Información (Proteger documento ×6, Comprobar
  problemas ×3, Propiedades avanzadas con sus 5 fichas), Guardar como
  (Herramientas ×5, ~18 tipos de archivo), Imprimir (todos los
  desplegables), Exportar, Compartir, Cuenta: completos y verificados
  contra `data/imagenes_rutas/backstage/`.
- **`Archivo ▸ Opciones`** está desarrollado aparte, dentro de
  `archivo.json` (bloques `opciones-*`), no en este .txt — correcto.

**Hueco menor:** `Guardar como ▸ Tipo` — la lista puede traer también
**`Plantilla de Word 97-2003 (*.dot)`** y **`Página web filtrada`**; el
volcado tiene "Página web, filtrada" pero conviene revisar el `.dot`.

---

## 7. `insertar.txt`  ·  ⚠️ completo en estructura, con problemas de forma

**Grupos de la pestaña** — `Páginas · Tablas · Ilustraciones · Multimedia ·
Vínculos · Comentarios · Encabezado y pie de página · Texto · Símbolos ·
eSignature` = **los 10 de 365-ES**. ✅ (En versiones sin suscripción no
está «eSignature» ni «Iconos»; aquí sí.)

**Problemas de forma detectados y corregidos (sep-2026):**
1. **Cola de texto de conversación de un asistente** ("Has subido la pestaña
   Insertar completa…", "Si quieres, te resumo…"). No era volcado.
   ✅ **Borrado.** También se añadió cabecera al fichero (no la tenía).
2. **Cuadro «Insertar hipervínculo»** — listaba **nombres de archivos y
   carpetas personales del usuario** (el contenido de su carpeta Documentos
   en el momento de la captura), no estructura de Word. Reducir a:
   `Vincular a: Archivo o página web existente / Lugar de este documento /
   Crear nuevo documento / Dirección de correo electrónico` + botones
   `Marcador… / Información en pantalla…`.  ✅ **Corregido (sep-2026).**
3. **Listas truncadas a propósito** (aceptable como referencia, pero que se
   sepa):
   - `Tablas rápidas` → solo "Calendario 1-4" (hay más: Lista tabular, Matriz,
     Subtítulos tabla 1/2, Con viñetas…).
   - `SmartArt` → lista las **8 categorías** (Lista, Proceso, Ciclo,
     Jerarquía, Relación, Matriz, Pirámide, Imagen) + las de Office.com, pero
     no los ~45 diseños concretos. Correcto no listarlos.
   - `Ecuación ▸ Integrado` → 5 de ~11 fórmulas de ejemplo.
   - `Símbolo ▸ Caracteres especiales` → el volcado tiene ~18; la lista real
     de 365 son **20**: faltan **`Espacio de 1/4 de em`** ya está, revisar
     **`Guion de no separación`** vs **`Espacio de no separación`** y añadir
     **`No-Width Optional Break` / `No-Width Non Break`** solo si aparecen
     (dependen del idioma de edición). De valor de examen: los importantes
     (guion largo/corto/opcional/no separación, espacio de no separación,
     copyright, registrado, marca reg., sección, párrafo, puntos
     suspensivos, comillas) **están todos**.

**Terminología:**
- `Letra capital` = **Drop Cap**. `Elementos rápidos` = **Quick Parts**.
  `Autotexto` = **AutoText**. `Cuadro de texto` = **Text Box**.
- `Salto de página` (grupo Páginas) es el mismo comando que
  `Disposición ▸ Saltos ▸ Página` (`Ctrl+Entrar`).

---

## 8. Pestañas SIN volcado de rutas  ·  ❌ pendientes

No existe `data/rutas/` para **`interfaz`**, **`revisar`** ni **`vista`**,
ni carpeta `data/imagenes_rutas/` de esas tres. El banco de esas secciones
se construyó de otras fuentes (el de `vista` con un informe de integración;
`revisar` tiene 3 topics casi vacíos —comentarios, revision-marcado,
entrada-lapiz—). **Para cerrarlas hace falta que el usuario aporte capturas
rama a rama**, igual que hizo con Inicio/Disposición/etc.

Cuadros de diálogo importantes que hoy no están volcados de ninguna pestaña:
- **Revisar:** «Control de cambios ▸ Opciones», «Comparar documentos»,
  «Combinar documentos», «Restringir edición» (panel), «Ortografía y
  gramática» (panel Editor), «Idioma ▸ Preferencias de idioma».
- **Vista:** «Macros» (cuadro), «Zoom» (cuadro con % y "Varias páginas"),
  «Nueva ventana / Organizar todo / Dividir».
- **Interfaz:** no es una pestaña de la cinta (es taxonomía propia); no
  necesita volcado de rutas.

---

## 9. Mapa de terminología  ES-España  ↔  internacional (inglés)

Para que ninguna verificación futura "corrija" el volcado con un nombre que
no es el de esta instalación:

### Pestañas de la cinta
| ES (España) | Internacional |
|---|---|
| Inicio | Home |
| Insertar | Insert |
| **Disposición** | **Layout** (en versiones viejas: "Diseño de página" / Page Layout) |
| **Diseño** | **Design** |
| Referencias | References |
| Correspondencia | Mailings |
| Revisar | Review |
| Vista | View |

### Atajos — esta instalación usa el **esquema clásico español**, NO el internacional
| Acción | ES (España) | Internacional (NO vale aquí) |
|---|---|---|
| Negrita | **Ctrl+N** | Ctrl+B |
| Cursiva | **Ctrl+K** | Ctrl+I |
| Subrayado | **Ctrl+S** | Ctrl+U |
| Alinear izq / centro / der / justif. | **Ctrl+Q / Ctrl+T / Ctrl+D / Ctrl+J** | Ctrl+L / E / R / J |
| Reemplazar | **Ctrl+L** | Ctrl+H |
| Ir a | **Ctrl+I** | Ctrl+G |
| Sangría / Sangría francesa | **Ctrl+H / Ctrl+F** | (no aplican) |
| Subíndice | **Ctrl+Mayús+-** | Ctrl+= |
| Superíndice | **(sin atajo)** | Ctrl+Mayús++ |
| Agrandar/reducir fuente | **Ctrl+Mayús+> / Ctrl+<** | Ctrl+Shift+> / Ctrl+Shift+< |

- La tecla **`<>`** (izquierda de la Z, teclado ES): da `<` sin Mayús y `>`
  con Mayús. Por eso "Ctrl+Mayús+<" y "Ctrl+>" **no existen** como
  notaciones válidas aquí.
- `Ctrl+R`, `Ctrl+B` (Bold internacional), `Ctrl+U` **no hacen lo que dice
  cualquier web** en esta instalación.

### Nombres de comando / cuadro que se confunden
| ES (España) | Internacional | Nota |
|---|---|---|
| Bordes y sombreado | Borders and Shading | |
| Configurar página | Page Setup | |
| Saltos | Breaks | |
| Sangría francesa | Hanging indent | |
| Interlineado: Mínimo / Exacto / Múltiple | At least / Exactly / Multiple | |
| Marca de agua | Watermark | |
| Letra capital | Drop Cap | |
| Elementos rápidos / Autotexto | Quick Parts / AutoText | |
| Combinación de correspondencia | Mail Merge | |
| Tabla de contenido; estilos TDC 1-9 | Table of Contents; TOC 1-9 | |
| Referencia cruzada | Cross-reference | |
| **Insertar título** (rótulo de figura) | **Insert Caption** | ¡no "Title"! |
| Estilo **Título** (grande) | **Title** | |
| Estilos **Título 1 / 2 / 3** | **Heading 1 / 2 / 3** | |
| Nota al pie / Nota al final | Footnote / Endnote | |
| Panel de navegación | Navigation pane | |
| Control de cambios | Track Changes | |
| Marca de revisión | Revision mark | |

### Tamaños de papel
| ES | Internacional |
|---|---|
| Carta | Letter |
| Oficio | Legal |
| Estamento | Statement |
| Tabloide | Tabloid / Ledger |
| Ejecutivo | Executive |
(A3/A4/A5/B4/B5 igual en ambos.)

### Estilos de cita — **iguales** en ambos idiomas (APA, MLA, Chicago,
IEEE, ISO 690, GOST, Harvard - Anglia, Turabian, SIST02, GB7714).

---

## 10. Acciones recomendadas

| Prioridad | Acción |
|---|---|
| Alta | Limpiar `insertar.txt`: borrar líneas 383-407 (chatter) y reducir el cuadro «Insertar hipervínculo» (líneas 133-142) a su estructura, sin los archivos personales. |
| Media | Captura nueva de **Diseño ▸ Marca de agua** para confirmar si falta `EJEMPLO 2`. |
| Media | Pedir al usuario capturas rama a rama de **Revisar** y **Vista** (no hay volcado). |
| Media | Capturas de los cuadros **Bloque de direcciones** y **Línea de saludo** de Correspondencia. |
| Baja | Desglosar `Ligaduras` (Inicio) y `Tablas rápidas` (Insertar) si algún día se quiere granularidad total. |
| — | **No** "completar" ningún volcado con nombres o entradas sacados de webs en inglés. Donde el volcado ES y una web discrepen, gana el volcado. |

## Fuentes consultadas

- [aulaClic — Curso Word 365](https://www.aulaclic.es/word-365/index.htm) (formato de párrafo, cinta de opciones)
- [Ediciones ENI — Word 2019 y Office 365, extracto](https://www.ediciones-eni.com/libro/word-versiones-2019-y-office-365-funciones-basicas-9782409020346/extracto-del-libro.pdf) (sangría/interlineado)
- [CustomGuide — Insertar símbolos (ES)](https://www.customguide.com/es/word/insertar-simbolos)
- [vence.es — Auxiliar Administrativo, Word y Excel M365](https://www.vence.es/auxiliar-administrativo-cyl/temario/tema-26)
- Microsoft Support ES — consultado solo para estructura de cuadros, **descartado** para nombres de comando y atajos (traducción automática, esquema internacional).
