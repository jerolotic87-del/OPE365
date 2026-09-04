# VISTA · DOCUMENTO DE INTEGRACIÓN PARA OPE365

## Propósito

Este documento es la **versión procesada y consolidada de la Pestaña Vista de Word 365** para su integración en el OPE365 existente.

No debe tratarse como un simple "lote de 69 preguntas". El material de Vista contiene conocimiento, rutas, atajos, relaciones, datos visuales, verificación externa, preguntas, flashcards y correcciones posteriores. El objetivo de este documento es dejar todo lo necesario para que Claude Code pueda integrarlo en el banco y en la experiencia de estudio sin perder información.

---

# 1. ESTADO FINAL DEL BLOQUE VISTA

- Fuente visual: **5 imágenes/páginas** del corpus.
- Conocimiento: **64 hechos** tras la segunda auditoría.
- Hechos visuales: **31** acumulados tras la segunda auditoría.
- Rutas: **34**.
- Atajos: **7** documentados en la extracción base; la documentación posterior de verificación amplía/precisa algunos atajos y denominaciones.
- Relaciones: **52**.
- Problemas/flags de fuente: el informe final declara **0 flags activos** tras la verificación externa.
- Banco final de Vista: **69 preguntas**.
- Tipos: **5** — opción única, verdadero/falso, selección múltiple, emparejamiento y relleno.
- Flashcards finales: **46** — 39 del primer cierre + 7 nuevas derivadas de la verificación final.
- Simulacro: **30 preguntas / 46 puntos**.

**IMPORTANTE:** en documentos intermedios aparecen recuentos de 50 y 67 preguntas antes del cierre definitivo. El estado final documentado es 69 preguntas y 46 flashcards. No usar cifras intermedias para importar datos.

---

# 2. REGLA DE INTEGRACIÓN

Vista debe integrarse en el sistema OPE365 existente como conocimiento y contenido del **banco canónico único**.

No crear un banco independiente de Vista.

No asumir que las 69 preguntas son 69 altas nuevas: primero deben compararse con las preguntas ya existentes en `questions_all.json`.

Para cada pregunta/conocimiento de Vista determinar:

- nuevo;
- equivalente a una existente;
- ampliación de una existente;
- mejora de una existente;
- nueva dimensión cognitiva;
- redundante;
- conflicto;
- necesita revisión.

No eliminar preguntas existentes automáticamente.

---

# 3. CLASIFICACIÓN PEDAGÓGICA OPE365

La ubicación dentro de OPE365 debe depender del **contenido que se evalúa**, no del nombre del PDF fuente.

Para Vista, la clasificación inicial propuesta es:

```text
Vista
├── Vistas
├── Inmersivo
├── Movimiento de página
├── Mostrar
├── Zoom
├── Ventana
├── Macros
└── SharePoint
```

Puede existir un nivel adicional de subtema cuando ayude al estudio.

Ejemplos:

```text
Vista → Vistas → Diseño de impresión
Vista → Vistas → Vista Esquema
Vista → Zoom → Valores
Vista → Ventana → Nueva ventana / Dividir / Ver en paralelo
Vista → Macros → Definición y usos
```

**Excepción importante:** si un dato procedente de las imágenes de Vista evalúa realmente otro bloque pedagógico global (por ejemplo, un concepto general de Interfaz), debe poder clasificarse en ese otro bloque sin perder la procedencia Vista.

---

# 4. MAPA DE CONOCIMIENTO FINAL

## 4.1 Grupo Vistas

### Modo de lectura
- Oculta barras de herramientas, reglas y otros elementos de interfaz.
- Presenta el documento en **dos páginas por pantalla**, en forma de libro.
- La verificación externa amplía este hecho: también se ocultan **encabezados y pies de página**.
- No tiene un atajo documentado en el material consolidado.

### Diseño de impresión
- Es la **vista predefinida** de Word.
- Permite ver la página tal como se imprimirá (WYSIWYG).
- Permite trabajar con encabezados/pies, márgenes y extremos de la hoja.
- Atajo: **Ctrl + Alt + D**.
- Verificado por fuentes académicas españolas.

### Diseño Web
- Muestra el documento como en un explorador web.
- Puede mostrar fondos con colores/texturas.
- El texto se ajusta a la ventana.
- Los gráficos se comportan como en una presentación web.

### Vista Esquema
- Sirve para crear y editar esquemas.
- Muestra **solo los títulos** del documento.
- Es útil para elaborar notas.
- Atajo: **Ctrl + Alt + Q**.
- Al activarla aparece una **pestaña adicional “Esquema”** en la cinta; es una característica diferenciadora documentada posteriormente.

### Vista Borrador
- Está orientada a la edición rápida del texto.
- Algunos elementos, como encabezados y pies de página, no son visibles; la lista es abierta.
- Atajo: **Ctrl + Alt + N**.
- La documentación externa utiliza también la denominación **“Borrador (Normal)”**; conservar “Borrador” como denominación principal y la variante como alias de terminología.

### Vista Preliminar
- Muestra páginas completas a tamaño reducido.
- Sirve para comprobar saltos, distribución y formato antes de imprimir.
- Atajo: **Ctrl + Alt + I**.
- **Corrección importante de arquitectura:** no debe clasificarse como botón del Grupo Vistas. La verificación externa la sitúa en **Archivo → Imprimir**. En OPE365, el dato de atajo debe quedar relacionado con Vista por procedencia, pero su ubicación funcional debe reflejar Archivo → Imprimir.
- La documentación de verificación externa encontró además que el nombre/atajo puede aparecer en diferentes notaciones de orden de teclas; `Ctrl+Alt+I` debe conservarse tal como aparece en el temario y la base de OPE365.

---

## 4.2 Grupo Inmersivo

### Concentración
- Elimina distracciones del entorno para concentrarse en el documento.

### Lector inmersivo / Immersive Reader
- Es un **conjunto de herramientas**, no una única función.
- Su finalidad es mejorar la **comprensión y la fluidez de lectura**.
- Localización: **Vista → Grupo Inmersivo**.
- Nombre oficial de interfaz en español: **Lector inmersivo**; la fuente del temario puede utilizar “Immersive Reader”.

### Distinción clave
- Concentración → eliminar distracciones del entorno.
- Lector inmersivo → comprensión y fluidez de lectura.

---

## 4.3 Grupo Movimiento de Página

### Vertical / En paralelo
- Permite desplazarse **horizontalmente** por las páginas.
- Medios: **rueda del ratón** o **barra de desplazamiento horizontal**.
- La nomenclatura visual del material presenta “Vertical / En paralelo” como una unidad que no debe forzarse a una falsa diferenciación si la fuente no la establece.

---

## 4.4 Grupo Mostrar

Controles de tipo **Mostrar/Ocultar** reversibles:

- Regla.
- Líneas de la cuadrícula.
- Panel de navegación.

Ruta general:

```text
Vista → Mostrar → elemento
```

---

## 4.5 Grupo Zoom

### Controles

- **Zoom (lupa):** abre el cuadro de diálogo Zoom para configurar el porcentaje.
- **100 %:** aplica directamente el 100 % sin abrir el diálogo.
- **Una página:** ajusta la visualización a una página.
- **Varias páginas:** ajusta a varias páginas.
- **Ancho de página:** ajusta al ancho.

### Valores

- Mínimo: **10 %**.
- Máximo: **500 %**.
- **25 % no es el mínimo**; es una opción predefinida del cuadro de diálogo.

### Ctrl + rueda

- Modifica el zoom de **10 en 10 puntos porcentuales**.

### Cuadro de diálogo

La captura/estructura documentada muestra opciones como:

- 200 %
- 100 %
- 25 %
- Ancho de página
- Ancho del texto
- Toda la página
- Varias páginas
- campo Porcentaje con control spinner

No confundir las opciones visibles del diálogo con los límites absolutos del zoom.

---

## 4.6 Grupo Ventana

### Nueva ventana
- Abre **dos ventanas independientes del mismo documento**.

### Dividir
- Divide el mismo documento en **dos paneles dentro de una sola ventana**.
- Atajo: **Alt + Ctrl + V**.
- Se documenta además un atajo complementario para desactivar la división: **Alt + Mayús + C**, según la verificación externa incorporada al cierre.

### Ver en paralelo
- Muestra **dos documentos distintos** simultáneamente para compararlos.

### Organizar todo
- También denominado **Mosaico**.
- Organiza en mosaico **todas** las ventanas abiertas.
- No confundir con Ver en paralelo, que trabaja con dos documentos distintos.

### Desplazamiento sincrónico
- Desplaza simultáneamente los dos documentos en paralelo.
- Requiere que **Ver en paralelo** esté activo previamente.
- Es una dependencia funcional crítica.

### Restablecer posición de la ventana
- Coloca las ventanas en paralelo de manera equitativa.
- Presupone el modo paralelo activo.

### Cambiar ventanas
- Permite cambiar rápidamente a otra ventana abierta.
- Se presenta como **menú desplegable** con chevron `∨`.

### Tríada crítica

```text
Nueva ventana  → mismo documento → 2 ventanas separadas
Dividir        → mismo documento → 2 paneles en 1 ventana
Ver en paralelo → 2 documentos distintos → comparar
```

---

## 4.7 Grupo Macros

### Definición

Una macro es una **serie de comandos e instrucciones** agrupados como un **mismo comando** para completar una tarea **automáticamente**.

Tres componentes que el banco considera importantes:

1. pluralidad: serie de comandos/instrucciones;
2. agrupación: actúan como un mismo comando;
3. automatismo: completan la tarea automáticamente.

La fuente académica añade que los pasos se ejecutan en el orden decidido por el usuario.

### Usos adicionales verificados

1. Automatizar una serie de pasos.
2. Personalizar la barra de acceso rápido añadiendo nuevas funcionalidades.
3. Insertar texto o gráficos utilizados frecuentemente.

### Atajos

- **Alt + F8** → cuadro de diálogo **Macros**.
- **Alt + F11** → **Visual Basic** / VBE.

### Submenú Macros

- Ver macros.
- Grabar macro...
- Pausar grabación.

“Pausar grabación” aparece desactivado/gris cuando no hay una grabación activa.

### Ruta

```text
Vista → Macros → Ver macros
```

La extracción identifica esta ruta como una ruta de examen útil.

---

## 4.8 Grupo SharePoint

- SharePoint se describe como una herramienta de **Microsoft** para:
  1. gestión documental;
  2. trabajo en equipo.
- Elemento mostrado: **Propiedades**, con iconografía asociada a SharePoint.
- Ruta documentada:

```text
Vista → Grupo SharePoint → Propiedades
```

- La fuente inicial no proporciona una descripción funcional específica del botón Propiedades; no inventar una.

---

# 5. ESTRUCTURA GLOBAL DE LA PESTAÑA VISTA

Los **8 grupos** documentados son:

1. Vistas
2. Inmersivo
3. Movimiento de Página
4. Mostrar
5. Zoom
6. Ventana
7. Macros
8. SharePoint

En las capturas, Vista ocupa la **posición 9 de 11** en el orden visible de la cinta, entre Revisar y Programador. Este dato es un hecho de la fuente visual; conservarlo como tal.

---

# 6. ATAJOS CONSOLIDADOS

| Atajo | Acción | Grupo funcional |
|---|---|---|
| Ctrl + Alt + D | Diseño de impresión | Vistas |
| Ctrl + Alt + Q | Vista Esquema | Vistas |
| Ctrl + Alt + N | Vista Borrador | Vistas |
| Ctrl + Alt + I | Vista Preliminar | Archivo → Imprimir / dato relacionado con Vista |
| Alt + Ctrl + V | Dividir | Ventana |
| Alt + Mayús + C | Desactivar Dividir, si está activa | Ventana |
| Alt + F8 | Cuadro de diálogo Macros | Macros |
| Alt + F11 | Visual Basic | Macros |
| Ctrl + rueda del ratón | Zoom ±10 puntos porcentuales | Zoom |

### Patrón mnemotécnico útil del banco

```text
Ctrl + Alt + D → Diseño de impresión
Ctrl + Alt + Q → esQuema
Ctrl + Alt + N → borraNdor
Ctrl + Alt + I → vIsta preliminar
Alt + Ctrl + V → diVidir
Alt + F8 → Macros
Alt + F11 → Visual Basic
```

El patrón es mnemotécnico, no fuente normativa; no sustituye la validación del atajo real.

---

# 7. RELACIONES CRÍTICAS

Estas relaciones deben conservarse porque permiten construir preguntas y flashcards de mayor nivel cognitivo:

1. **Ver en paralelo → Desplazamiento sincrónico**: el segundo depende del primero.
2. **Ver en paralelo → Restablecer posición**: el restablecimiento presupone el modo paralelo.
3. **Nueva ventana ≠ Dividir ≠ Ver en paralelo**.
4. **Organizar todo ≠ Ver en paralelo**.
5. **Zoom ≠ 100 %**: diálogo configurable frente a aplicación directa del 100 %.
6. **10 % ≠ 25 %**: mínimo absoluto frente a opción del cuadro de diálogo.
7. **Concentración ≠ Lector inmersivo**.
8. **Vista Esquema ≠ Vista Borrador**.
9. **Alt + F8 ≠ Alt + F11**.
10. **Vista Preliminar ≠ Grupo Vistas**: el atajo puede aparecer asociado al corpus de Vista, pero la ubicación funcional verificada es Archivo → Imprimir.

---

# 8. DATOS VISUALES QUE NO DEBEN PERDERSE

Conservar también la información que puede no ser necesaria como pregunta independiente, pero que procede de las capturas:

- Vista Esquema genera una pestaña adicional “Esquema”.
- El grupo Inmersivo contiene las herramientas de Concentración y Lector inmersivo.
- El campo Porcentaje del cuadro Zoom tiene control spinner.
- “Una página / Varias páginas / Ancho de página” aparece como conjunto de controles del Zoom.
- “En paralelo” aparece visualmente en dos líneas en el widget documentado.
- En las capturas de Nueva ventana ambas instancias muestran Vista activa.
- Cambiar ventanas se presenta con un chevron desplegable `∨`.
- El submenú Macros muestra iconos individuales.
- Pausar grabación aparece gris/desactivado fuera de una grabación activa.

Estos hechos visuales deben conservarse aunque no todos deban transformarse en preguntas independientes.

---

# 9. VALORES Y DATOS NUMÉRICOS CRÍTICOS

- Modo de lectura: **2 páginas por pantalla**.
- Zoom mínimo: **10 %**.
- Zoom máximo: **500 %**.
- Control Ctrl + rueda: **incrementos de 10 puntos porcentuales**.
- Vista: posición **9 de 11** en la cinta visible de la fuente.
- 8 grupos de Vista.

---

# 10. DISTINCIONES Y ERRORES DE ALTO VALOR

## Distinciones críticas

### 1. Nueva ventana / Dividir / Ver en paralelo
Ya descrita en §7.

### 2. Alt + F8 / Alt + F11
- F8 = gestionar/abrir diálogo Macros.
- F11 = Visual Basic/programación.

### 3. Zoom / 100 %
- Zoom = abre diálogo.
- 100 % = aplica directamente.

### 4. Organizar todo / Ver en paralelo
- Organizar todo = todas las ventanas, mosaico.
- Ver en paralelo = 2 documentos para comparar.

### 5. Vista Esquema / Vista Borrador
- Esquema = solo títulos / estructura.
- Borrador = edición rápida de texto.

### 6. Concentración / Lector inmersivo
- Concentración = eliminar distracciones.
- Lector inmersivo = comprensión y fluidez.

### 7. 10 % / 25 %
- 10 % = mínimo absoluto.
- 25 % = opción del cuadro de diálogo.

### Errores frecuentes documentados

- Invertir Alt+F8 y Alt+F11.
- Confundir Nueva ventana con Dividir.
- Creer que 25 % es el mínimo.
- Activar Desplazamiento sincrónico sin Ver en paralelo.
- Creer que Vista Esquema muestra todo el contenido.

---

# 11. VERIFICACIÓN EXTERNA Y DECISIONES CONSOLIDADAS

La verificación final consultó aulaClic y diversas fuentes académicas españolas. La regla utilizada en este bloque fue que **el temario Adams es la fuente primaria de estudio y las academias españolas se usan para corroborar/añadir matices**. Microsoft Support no debe utilizarse para resolver diferencias de atajos o localización específicas de la instalación/región del usuario; sirve principalmente para terminología y conceptos generales.

## Cambios/confirmaciones relevantes

### Modo de lectura
Se añade que también oculta encabezados y pies de página.

### Vista Esquema
Se añade que aparece la pestaña “Esquema”.

### Vista Preliminar
Se corrige su ubicación funcional: **Archivo → Imprimir**, no como botón del Grupo Vistas.

### Macros
Se añaden tres usos concretos: automatizar pasos, personalizar barra de acceso rápido e insertar texto/gráficos frecuentes.

### Lector inmersivo
La terminología española recomendada es **Lector inmersivo**.

### Vista Borrador
Se conserva “Borrador” y se registra “Borrador (Normal)” como variante de terminología.

### Dividir
Se añade el atajo complementario **Alt + Mayús + C** para desactivar la división, según la verificación incluida en el material.

---

# 12. REGLA ESPECIAL PARA VISTA PRELIMINAR

Este punto debe implementarse con especial cuidado.

El material histórico de Vista la vinculó inicialmente al Grupo Vistas porque aparecía en el corpus de esa pestaña, pero la verificación posterior determinó que **no es un botón del Grupo Vistas** y que su ubicación funcional es **Archivo → Imprimir**.

Por tanto:

- conservar la pregunta/flashcard sobre su atajo y función;
- conservar la procedencia dentro del corpus de Vista;
- clasificar su ubicación funcional en la taxonomía global como **Archivo → Imprimir** cuando la pregunta evalúe localización;
- no dibujar un botón “Vista Preliminar” dentro del Grupo Vistas en la futura representación de la interfaz solo porque aparezca en el banco histórico.

---

# 13. BANCO DE PREGUNTAS DE VISTA

Las 69 preguntas finales del trabajo de Vista se incluyen en el apartado siguiente como **banco candidato consolidado**.

IMPORTANTE: antes de incorporarlas a `questions_all.json`, compararlas con las 952 preguntas actuales.

El objetivo es detectar:

- preguntas nuevas reales;
- equivalentes;
- mejoras;
- duplicados funcionales;
- preguntas afectadas por nueva verificación;
- nuevos ángulos cognitivos.

No hacer una suma ciega `952 + 69`.

La distribución final documentada del banco de Vista es:

| Tipo | Cantidad | % |
|---|---:|---:|
| Opción única | 27 | 39% |
| Verdadero/Falso | 15 | 22% |
| Selección múltiple | 10 | 14% |
| Relleno de huecos | 9 | 13% |
| Emparejamiento | 8 | 12% |
| **TOTAL** | **69** | **100%** |

La cobertura cognitiva incluye reconocimiento, escenario, diagnóstico, localización, distinción, función, atajo→acción, propósito, condiciones, valores, terminología, conjuntos de características y relaciones.

---

# 14. FLASHCARDS — ESTADO FINAL

El sistema de Vista terminó con **46 flashcards** tras la verificación final.

Inicialmente eran 39; después se añadieron 7 por las ampliaciones y verificaciones finales.

## Estructura

- tarjetas de contenido;
- tarjetas de errores “NO CONFUNDIR”;
- prioridad ⭐ para las de máxima importancia.

Las flashcards son un recurso independiente del banco de preguntas.

Una tarjeta puede compartir conocimiento con una pregunta sin ser una copia de ella.

El apartado siguiente contiene el mazo final completo.

---

# 15. IMPLEMENTACIÓN RECOMENDADA EN OPE365

## Banco

Mantener un único `questions_all.json`.

Cada pregunta debe poder incorporar, de forma compatible con el modelo actual:

```text
section
 topic
  subtopic
```

sin eliminar los campos ya utilizados por la aplicación.

## Flashcards

Crear un conjunto de datos independiente para flashcards si Claude Code considera que es la opción más limpia, pero mantenerlo vinculado a la misma taxonomía:

```text
section
 topic
 subtopic
 cardType
 priority
 front
 back
 sourceRefs
 knowledgeRefs / questionRefs cuando proceda
```

## Interfaz

Dentro de un bloque del temario debería existir, como mínimo conceptualmente:

```text
Resumen · Preguntas · Flashcards · Errores
```

Y globalmente debe existir acceso a Flashcards por:

- todo el temario;
- sección;
- tema/subtema;
- prioridad;
- pendientes/dominadas cuando el modelo de progreso lo permita.

## No romper

No alterar sin necesidad:

- progreso;
- historial;
- sesiones;
- tests;
- desafíos;
- duelo;
- farol;
- almacenamiento;
- códigos;
- `atajos_oficial.json`;
- `build.py`.

---

# 16. METADATOS QUE DEBE CONSERVAR CADA PREGUNTA DE VISTA

Como mínimo:

```text
questionId
sourceFile / sourceRefs
sourcePage / imagePage
sourceQuestionId (Q-xxx)
section
 topic
 subtopic
exerciseType
difficulty
cognitiveAngle
trapType
confidence
sourceIssue / versionIssue
```

No perder F-ID, VF-ID, R-ID, S-ID, N-ID, REL-ID o PI-ID cuando aparezcan en la documentación.

---

# 17. METADATOS QUE DEBE CONSERVAR CADA FLASHCARD

Como mínimo:

```text
cardId
section
topic
subtopic
cardType
priority
front
back
sourceRefs
knowledgeRefs
questionRefs (si existen)
```

---

# 18. DOCUMENTO FUENTE Y TRAZABILIDAD

Este documento no sustituye el archivo original de extracción. Sirve como **capa consolidada para integración**.

Cuando exista discrepancia entre este documento y un registro atómico de fuente, revisar el registro original antes de decidir.

No inventar datos no soportados por la extracción.

---

# 19. ANEXO A — FICHA DE ESTUDIO CONSOLIDADA

| Nº | Grupo | Función principal |
|---|---|---|
| 1 | Vistas | Modos de visualización del documento |
| 2 | Inmersivo | Herramientas de concentración y lectura |
| 3 | Movimiento de Página | Desplazamiento horizontal por páginas |
| 4 | Mostrar | Mostrar u ocultar elementos de interfaz |
| 5 | Zoom | Control del nivel de ampliación |
| 6 | Ventana | Gestión de ventanas y documentos múltiples |
| 7 | Macros | Automatización de tareas |
| 8 | SharePoint | Gestión documental y trabajo en equipo |

---

## GRUPO VISTAS

### Modo de lectura
- **Función:** Oculta las barras de herramientas, reglas y otros elementos de la interfaz.
- **Presentación:** El documento se visualiza en **dos páginas por pantalla** en forma de libro.
- **Atajo:** No documentado.

### Diseño de impresión ⭐ VISTA PREDEFINIDA
- **Función:** Permite visualizar la página tal y como se imprimirá, con gráficos, imágenes, encabezados y pies de página.
- **Funciones adicionales:** Definir o modificar encabezados y pies de página; ajustar márgenes; observar los extremos de la hoja.
- **Estado especial:** Es la **vista predefinida** en Word.
- **Atajo:** `Ctrl + Alt + D`

### Diseño Web
- **Función:** Permite ver el documento como se visualizaría en un explorador web.
- **Efectos:** Fondos con colores o texturas; texto ajustado a la ventana; gráficos posicionados como en un explorador web.
- **Atajo:** No documentado.

### Vista Esquema
- **Función:** Crear y editar esquemas.
- **Restricción:** Muestra **sólo** los títulos del documento.
- **Utilidad especial:** Elaborar notas.
- **Atajo:** `Ctrl + Alt + Q`

### Vista Borrador
- **Función:** Muestra el documento como borrador para **editar el texto rápidamente**.
- **Limitación:** Algunos elementos como encabezados o pies de página **no son visibles** (lista abierta — pueden existir otros elementos afectados).
- **Atajo:** `Ctrl + Alt + N`

### Vista Preliminar
- **Función:** Muestra las páginas completas en tamaño reducido.
- **Finalidad:** Ver una o más páginas a la vez y verificar saltos de página, distribución del texto y formato.
- **Atajo:** `Ctrl + Alt + I` ⚠️

> ⚠️ La localización exacta de Vista Preliminar en el widget del Grupo Vistas no está confirmada visualmente en la fuente.

---

## GRUPO INMERSIVO

### Concentración
- **Función:** Elimina las distracciones para que el usuario pueda concentrarse en el documento.

### Immersive Reader
- **Naturaleza:** Es un **conjunto de herramientas** (no una función única).
- **Función:** Mejorar la comprensión y la fluidez de lectura.
- **Nota:** El nombre aparece en inglés en la fuente.

---

## GRUPO MOVIMIENTO DE PÁGINA

### Vertical / En paralelo
- **Función:** Permite desplazarse **horizontalmente** por las páginas del documento.
- **Medios:** Rueda del ratón **o** barra de desplazamiento horizontal.

---

## GRUPO MOSTRAR

Permite **mostrar u ocultar** (toggle reversible) los siguientes elementos:

| Elemento | Función |
|---|---|
| **Regla** | Muestra/oculta la regla |
| **Líneas de la cuadrícula** | Muestra/oculta la cuadrícula |
| **Panel de navegación** | Muestra/oculta el panel lateral de navegación |

**Ruta:** Vista → Grupo Mostrar → [elemento]

---

## GRUPO ZOOM

| Elemento | Función |
|---|---|
| **Zoom** (lupa) | Abre el cuadro de diálogo Zoom |
| **100%** | Aplica zoom al 100% directamente (sin cuadro de diálogo) |
| **Una página** | Ajusta la vista a una página |
| **Varias páginas** | Ajusta la vista a varias páginas |
| **Ancho de página** | Ajusta al ancho de página |

### Valores del Zoom
- **Mínimo:** 10%
- **Máximo:** 500%

### Ctrl + Rueda del ratón
- **Efecto:** Aumenta o disminuye el zoom.
- **Incremento:** De **10 en 10** puntos porcentuales.

### Cuadro de diálogo Zoom
Opciones disponibles como radio button:

```
○ 200 %          ○ Ancho de página
○ 100 %          ○ Ancho del texto
○ 25 %           ○ Toda la página
                 ○ Varias páginas

Porcentaje: [___] % ▲▼

[Aceptar]  [Cancelar]
```

---

## GRUPO VENTANA

### Tabla comparativa — La tríada crítica

| Función | Documentos | Ventanas/Paneles | Propósito |
|---|---|---|---|
| **Nueva ventana** | 1 (el mismo) | 2 ventanas independientes | Ver el mismo doc en dos ventanas |
| **Dividir** | 1 (el mismo) | 2 paneles en 1 ventana | Ver dos partes del mismo doc sin nueva ventana |
| **Ver en paralelo** | 2 (distintos) | 2 ventanas | Comparar dos documentos distintos |

### Organizar todo
- **Sinónimo:** Mosaico
- **Función:** Coloca en mosaico **todas** las ventanas de Word abiertas.
- **Atajo de Dividir:** `Alt + Ctrl + V`

### Desplazamiento sincrónico
- **Función:** Permite desplazarse simultáneamente en los dos documentos en paralelo.
- **Condición:** ⚠️ Solo puede activarse cuando **Ver en paralelo** está activo.
- **Cadena de dependencia:**

```
Ver en paralelo (activar primero)
    └→ Desplazamiento sincrónico (activar después)
    └→ Restablecer posición de la ventana (cuando sea necesario)
```

### Restablecer posición de la ventana
- **Función:** Coloca las ventanas en paralelo de manera **equitativa**.
- **Condición:** Presupone que las ventanas ya están en modo paralelo.

### Cambiar ventanas
- **Función:** Permite cambiar rápidamente a otra ventana abierta.
- **Tipo de control:** Menú desplegable (∨).

---

## GRUPO MACROS

### ¿Qué es una macro?

> Una macro es una **serie** de comandos e instrucciones que se agrupan de forma conjunta como un mismo **comando** para completar una tarea **automáticamente**.

**Tres componentes estructurales:**

```
1. PLURALIDAD   → serie de comandos e instrucciones (no uno solo)
2. AGRUPACIÓN   → actúan como un mismo comando
3. AUTOMATISMO  → completan la tarea automáticamente
```

**Propósito:** Automatizar las tareas **más usadas** en Word.

### Atajos del Grupo Macros

| Atajo | Acción |
|---|---|
| `Alt + F8` | Abre el cuadro de diálogo Macros |
| `Alt + F11` | Abre Visual Basic |

### Submenú del botón Macros

| Opción | Estado | Función |
|---|---|---|
| Ver macros | Activa | Visualizar y ejecutar macros disponibles |
| Grabar macro... | Activa | Iniciar grabación de nueva macro |
| Pausar grabación | **Gris** (desactivada) | Solo disponible durante grabación activa |

---

## GRUPO SHAREPOINT

> **SharePoint** es una herramienta diseñada por **Microsoft** para la **gestión documental** y el **trabajo en equipo**.

- **Elemento del grupo:** Propiedades (icono S teal de SharePoint)

---

## TABLA MAESTRA DE ATAJOS

| Atajo | Acción | Grupo |
|---|---|---|
| `Ctrl + Alt + D` | Diseño de impresión | Vistas |
| `Ctrl + Alt + Q` | Vista Esquema | Vistas |
| `Ctrl + Alt + N` | Vista Borrador | Vistas |
| `Ctrl + Alt + I` | Vista Preliminar ⚠️ | Vistas |
| `Alt + Ctrl + V` | Dividir | Ventana |
| `Alt + F8` | Cuadro de diálogo Macros | Macros |
| `Alt + F11` | Visual Basic | Macros |
| `Ctrl + Rueda ↑↓` | Zoom ±10% | Zoom |

**Patrón mnemotécnico:**
```
Vistas   →  Ctrl + Alt + [inicial]
              D = Diseño de impresión
              Q = esQuema
              N = borraNdor
              I = vIsta preliminar

Ventana  →  Alt + Ctrl + V  (diVidir)

Macros   →  Alt + F[número]
              F8  = diálogo Macros
              F11 = Visual Basic
```

---

## DISTINCIONES CRÍTICAS PARA EL EXAMEN

### 1. Nueva ventana vs. Dividir vs. Ver en paralelo
```
Nueva ventana  →  mismo doc  →  2 VENTANAS separadas
Dividir        →  mismo doc  →  2 PANELES en 1 ventana   [Alt+Ctrl+V]
Ver en paralelo →  2 DOCS distintos  →  comparar
```

### 2. Alt+F8 vs. Alt+F11
```
Alt + F8   →  diálogo MACROS     (gestionar)
Alt + F11  →  VISUAL BASIC       (programar)
```

### 3. Zoom: botón Zoom vs. botón 100%
```
Zoom (lupa)  →  ABRE diálogo  →  personalizar
100%         →  APLICA directo  →  sin diálogo
```

### 4. Organizar todo vs. Ver en paralelo
```
Organizar todo   →  TODAS las ventanas  →  mosaico general
Ver en paralelo  →  exactamente 2 docs  →  comparación
```

### 5. Vista Esquema vs. Vista Borrador
```
Esquema   →  SÓLO títulos  →  estructura del documento
Borrador  →  texto completo  →  edición rápida, sin enc./pies
```

### 6. Concentración vs. Immersive Reader
```
Concentración    →  eliminar DISTRACCIONES del entorno
Immersive Reader →  mejorar COMPRENSIÓN y fluidez (conjunto de herramientas)
```

### 7. Zoom mínimo vs. opción de diálogo
```
Mínimo absoluto    →  10%   (dato de la fuente)
Opción en diálogo  →  25%   (no es el mínimo)
```

---

## LOS 5 ERRORES MÁS FRECUENTES

```
❌ ERROR 1: Invertir Alt+F8 y Alt+F11
✅ F8 = MACROS (diálogo) / F11 = VISUAL BASIC

❌ ERROR 2: Confundir Nueva ventana con Dividir
✅ Nueva ventana = 2 VENTANAS / Dividir = 2 PANELES en 1 ventana

❌ ERROR 3: Creer que el zoom mínimo es 25%
✅ El 25% es una OPCIÓN del diálogo, NO el mínimo (mínimo = 10%)

❌ ERROR 4: Activar Desp. sincrónico sin Ver en paralelo activo
✅ PRIMERO Ver en paralelo → DESPUÉS Desp. sincrónico

❌ ERROR 5: Creer que Vista Esquema muestra todo el contenido organizado
✅ Vista Esquema muestra SÓLO los TÍTULOS
```

---

---

---

# 20. ANEXO B — BANCO COMPLETO DE 69 PREGUNTAS

# DOCUMENTO 2 — BANCO DE PREGUNTAS COMPLETO
## 69 preguntas ordenadas por bloque temático y dificultad

---

## BLOQUE 1 — GRUPO VISTAS
### Ordenadas: Media → Alta

---

**Q-001** · Opción única · Media

> ¿Cuál de las siguientes vistas está configurada como **vista predefinida** en Word 365?

- A) Modo de lectura
- B) Vista Preliminar
- C) **Diseño de impresión** ✓
- D) Vista Borrador

---

**Q-008** · Verdadero/Falso · Media

> **Afirmación:** El Modo de lectura visualiza el documento en **cuatro páginas por pantalla** dispuestas en forma de libro, ocultando las barras de herramientas y las reglas.

- A) Verdadero
- B) **Falso** ✓

---

**Q-069** · Opción única · Media

> ¿Cuál es la **función principal** de la Vista Borrador en Word 365?

- A) Visualizar el documento tal como aparecerá en un navegador web
- B) Mostrar únicamente los títulos del documento para revisar su estructura
- C) **Mostrar el documento como borrador para editar el texto rápidamente** ✓
- D) Presentar el documento en dos páginas en forma de libro para facilitar la lectura

---

**Q-002** · Opción única · Alta

> ¿Qué combinación de teclas activa la vista **Diseño de impresión** en Word 365?

- A) `Ctrl + Alt + I`
- B) `Ctrl + Alt + N`
- C) `Ctrl + Alt + Q`
- D) **`Ctrl + Alt + D`** ✓

---

**Q-003** · Verdadero/Falso · Alta

> **Afirmación:** La Vista Esquema se utiliza para crear y editar esquemas, y muestra el contenido completo del documento organizado de forma jerárquica según los niveles de título.

- A) Verdadero
- B) **Falso** ✓

---

**Q-004** · Relleno · Alta

> "La Vista Esquema se utiliza para **[1]** y **[2]** esquemas. Esta vista muestra **[3]** los **[4]** del documento y resulta de particular utilidad para **[5]**."

**Respuestas:** [1] crear · [2] editar · [3] sólo · [4] títulos · [5] elaborar notas

---

**Q-005** · Opción única · Alta

> Un usuario observa que los **encabezados y pies de página** de su documento han desaparecido de la pantalla, aunque el documento no ha sido modificado. ¿En qué vista está trabajando probablemente?

- A) Diseño Web
- B) Modo de lectura
- C) **Vista Borrador** ✓
- D) Vista Esquema

---

**Q-006** · Opción única · Alta

> Según la fuente de estudio, ¿cuál de las siguientes afirmaciones sobre los elementos no visibles en Vista Borrador es la **más precisa**?

- A) En Vista Borrador únicamente los encabezados no son visibles; los pies de página sí se muestran
- B) En Vista Borrador los encabezados y pies de página son los únicos elementos que no se muestran
- C) **En Vista Borrador algunos elementos como encabezados o pies de página no son visibles, sin que la fuente excluya otros elementos adicionales** ✓
- D

Tú: sigue

Leo AI: **Q-006** *(continuación)*
- D) En Vista Borrador los elementos no visibles son los mismos que en Vista Esquema

**Respuesta:** C

---

**Q-009** · Opción única · Alta

> Un usuario está preparando un documento para su publicación en una página web y quiere visualizarlo **tal como aparecerá en un navegador**, con los fondos y el texto ajustado a la ventana. ¿Qué vista debe activar?

- A) Diseño de impresión
- B) Vista Preliminar
- C) Modo de lectura
- D) **Diseño Web** ✓

---

**Q-010** · Opción única · Alta · ⚠️ PI-001

> Un usuario quiere **verificar los saltos de página y la distribución general del texto** antes de imprimir, pudiendo ver varias páginas al mismo tiempo. ¿Qué vista debe usar?

- A) Diseño de impresión
- B) Modo de lectura
- C) Vista Esquema
- D) **Vista Preliminar** ✓

---

**Q-052** · Verdadero/Falso · Alta

> **Afirmación:** Desde la vista **Diseño de impresión** únicamente se puede visualizar el documento tal como se imprimirá y observar los extremos de la hoja, sin posibilidad de modificar encabezados, pies de página ni márgenes.

- A) Verdadero
- B) **Falso** ✓

---

**Q-053** · Selección múltiple · Alta

> ¿Cuáles de las siguientes afirmaciones sobre la vista **Diseño de impresión** son correctas según la fuente? *(Selecciona todas las que correspondan)*

- A) **Permite visualizar la página tal y como se imprimirá** ✓
- B) Muestra el documento en dos páginas por pantalla en forma de libro
- C) **Permite modificar encabezados y pies de página** ✓
- D) **Es la vista predefinida en Word** ✓
- E) Muestra sólo los títulos del documento para facilitar la edición del esquema
- F) **Permite ajustar márgenes** ✓

**Respuesta:** A, C, D y F

---

**Q-051** · Emparejamiento · Alta

> Relaciona cada vista con su característica más diferenciadora:

| Vista | Característica |
|---|---|
| 1. Modo de lectura | A. Muestra sólo los títulos del documento |
| 2. Diseño de impresión | B. El texto se ajusta a la ventana como en un explorador |
| 3. Diseño Web | C. Es la vista predefinida de Word |
| 4. Vista Esquema | D. No muestra encabezados ni pies de página |
| 5. Vista Borrador | E. Presenta el documento en dos páginas en forma de libro |

**Respuesta:** 1-E · 2-C · 3-B · 4-A · 5-D

---

**Q-007** · Emparejamiento · Alta · ⚠️ PI-001

> Relaciona cada atajo con la vista que activa:

| Atajo | Vista |
|---|---|
| 1. `Ctrl + Alt + N` | A. Diseño de impresión |
| 2. `Ctrl + Alt + I` | B. Vista Esquema |
| 3. `Ctrl + Alt + D` | C. Vista Borrador |
| 4. `Ctrl + Alt + Q` | D. Vista Preliminar |

**Respuesta:** 1-C · 2-D · 3-A · 4-B

---

**Q-065** · Relleno · Alta · ⚠️ PI-001

> Escribe el atajo de teclado correspondiente a cada función:
> 1. Diseño de impresión → **[1]**
> 2. Vista Esquema → **[2]**
> 3. Vista Borrador → **[3]**
> 4. Vista Preliminar → **[4]**
> 5. Dividir → **[5]**

**Respuestas:** [1] `Ctrl+Alt+D` · [2] `Ctrl+Alt+Q` · [3] `Ctrl+Alt+N` · [4] `Ctrl+Alt+I` · [5] `Alt+Ctrl+V`

---

## BLOQUE 2 — GRUPO INMERSIVO

---

**Q-011** · Opción única · Media

> Un usuario se distrae con facilidad mientras redacta y desea que Word **elimine todos los elementos visuales innecesarios** del entorno para concentrarse exclusivamente en el contenido. ¿Qué herramienta debe activar?

- A) Immersive Reader
- B) Vista Borrador
- C) **Concentración** ✓
- D) Vista Esquema

---

**Q-012** · Verdadero/Falso · Alta

> **Afirmación:** Immersive Reader es una herramienta de la pestaña Vista que permite mejorar la comprensión y la fluidez de lectura de los documentos Word.

- A) Verdadero
- B) **Falso** ✓

*(Falso: la fuente lo describe en plural — es un conjunto de herramientas)*

---

**Q-013** · Opción única · Alta

> ¿Cuál de las siguientes opciones describe correctamente la diferencia entre **Concentración** e **Immersive Reader**?

- A) Concentración mejora la comprensión y fluidez lectora; Immersive Reader elimina las distracciones del entorno de trabajo
- B) Concentración oculta encabezados y pies de página; Immersive Reader ajusta el texto al ancho de la ventana
- C) Ambas herramientas eliminan distracciones pero Immersive Reader además ajusta el zoom automáticamente
- D) **Concentración elimina las distracciones del entorno de trabajo; Immersive Reader proporciona un conjunto de herramientas para mejorar la comprensión y fluidez lectora** ✓

---

**Q-063** · Verdadero/Falso · Alta

> **Afirmación:** Las herramientas **Concentración** e **Immersive Reader** se encuentran en el **Grupo Vistas** de la pestaña Vista.

- A) Verdadero
- B) **Falso** ✓

*(Falso: pertenecen al Grupo Inmersivo)*

---

## BLOQUE 3 — GRUPO MOVIMIENTO DE PÁGINA

---

**Q-068** · Verdadero/Falso · Media

> **Afirmación:** El **Grupo Movimiento de Página** permite desplazarse **verticalmente** por las páginas del documento utilizando la rueda del ratón o la barra de desplazamiento.

- A) Verdadero
- B) **Falso** ✓

*(Falso: el desplazamiento es horizontal)*

---

**Q-014** · Selección múltiple · Alta

> ¿Mediante qué medios permite desplazarse horizontalmente el **Grupo Movimiento de Página**? *(Selecciona todas las opciones correctas)*

- A) **Rueda del ratón** ✓
- B) Ctrl + rueda del ratón
- C) **Barra de desplazamiento horizontal** ✓
- D) Barra de desplazamiento vertical

**Respuesta:** A y C

---

## BLOQUE 4 — GRUPO MOSTRAR

---

**Q-015** · Selección múltiple · Media

> ¿Cuáles de los siguientes elementos pertenecen al **Grupo Mostrar**? *(Selecciona todas las opciones correctas)*

- A) **Regla** ✓
- B) Panel de movimiento de página
- C) **Líneas de la cuadrícula** ✓
- D) **Panel de navegación** ✓
- E) Immersive Reader

**Respuesta:** A, C y D

---

**Q-016** · Opción única · Media

> ¿Cuál es la función del **Grupo Mostrar** en la pestaña Vista?

- A) Ampliar la vista del documento para mostrar más contenido en pantalla
- B) Mostrar las propiedades del documento activo
- C) **Activar o desactivar la Regla, las Líneas de la cuadrícula y el Panel de navegación** ✓
- D) Cambiar el modo de visualización del documento

---

**Q-017** · Emparejamiento · Media

> Relaciona cada elemento con su ruta completa:

| Elemento | Ruta |
|---|---|
| 1. Regla | A. Vista → Grupo Mostrar → Panel de navegación |
| 2. Líneas de la cuadrícula | B. Vista → Grupo Mostrar → Regla |
| 3. Panel de navegación | C. Vista → Grupo Mostrar → Líneas de la cuadrícula |

**Respuesta:** 1-B · 2-C · 3-A

---

## BLOQUE 5 — GRUPO ZOOM

---

**Q-018** · Opción única · Media

> ¿Cuáles son los valores **mínimo y máximo** del Zoom en Word 365?

- A) Mínimo 25% — Máximo 500%
- B) Mínimo 10% — Máximo 200%
- C) Mínimo 1% — Máximo 500%
- D) **Mínimo 10% — Máximo 500%** ✓

---

**Q-019** · Verdadero/Falso · Media

> **Afirmación:** En el Grupo Zoom, el botón **100%** y el botón **Zoom** (lupa) realizan la misma función, ya que ambos permiten ajustar el nivel de zoom del documento.

- A) Verdadero
- B) **Falso** ✓

---

**Q-060** · Selección múltiple · Media

> ¿Cuáles de las siguientes acciones permiten **ajustar el nivel de zoom** del documento? *(Selecciona todas las opciones correctas)*

- A) **Botón Zoom (lupa) → abre el cuadro de diálogo Zoom** ✓
- B) **Botón 100% → aplica zoom al 100% directamente** ✓
- C) Activar Vista Borrador
- D) **Ctrl + rueda del ratón → ajusta el zoom de 10 en 10** ✓
- E) Activar Modo de lectura
- F) **Seleccionar Una página / Varias páginas / Ancho de página** ✓

**Respuesta:** A, B, D y F

---

**Q-020** · Opción única · Alta

> Al usar **Ctrl + rueda del ratón**, ¿en qué incremento se modifica el nivel de zoom?

- A) De 25 en 25
- B) De 100 en 100
- C) **De 10 en 10** ✓
- D) De 1 en 1

---

**Q-021** · Opción única · Alta

> ¿Cuál de las siguientes opciones **NO** aparece como radio button en el cuadro de diálogo **Zoom**?

- A) Ancho del texto
- B) Toda la página
- C) Varias páginas
- D) **Página completa** ✓

---

**Q-022** · Relleno · Alta

> "El zoom mínimo es del **[1]**% y el máximo del **[2]**%. Con **Ctrl + rueda del ratón**, el zoom se modifica de **[3]** en **[3]** puntos porcentuales."

**Respuestas:** [1] 10 · [2] 500 · [3] 10

---

**Q-062** · Relleno · Alta

> "El **Grupo [1]** de la pestaña **[2]** permite acercar o alejar la vista. El botón **[3]** abre un cuadro de diálogo. El botón **[4]** aplica directamente el nivel de zoom. El mínimo es **[5]**% y el máximo **[6]**%."

**Respuestas:** [1] Zoom · [2] Vista · [3] Zoom (lupa) · [4] 100% · [5] 10

Tú: sigue

Leo AI: **Q-062** *(continuación)*

**Respuestas:** [1] Zoom · [2] Vista · [3] Zoom (lupa) · [4] 100% · [5] 10 · [6] 500

---

## BLOQUE 6 — GRUPO VENTANA

---

**Q-026** · Verdadero/Falso · Media

> **Afirmación:** En la fuente de estudio, la función **Organizar todo** recibe también el nombre de **Mosaico**.

- A) **Verdadero** ✓
- B) Falso

---

**Q-030** · Opción única · Media

> ¿Qué función realiza **Cambiar ventanas** y cómo se presenta en la cinta de opciones?

- A) Abre una nueva ventana del mismo documento; aparece como botón simple
- B) Divide la ventana activa en dos paneles; aparece con icono de división horizontal
- C) **Permite cambiar rápidamente a otra ventana de Word abierta; se presenta como menú desplegable** ✓
- D) Muestra todas las ventanas abiertas en mosaico; aparece con icono de cuadrícula

---

**Q-023** · Opción única · Alta

> Un usuario tiene abiertos el **contrato original** y el **contrato revisado** y desea verlos **simultáneamente** para identificar diferencias. ¿Qué función debe usar?

- A) Nueva ventana
- B) Dividir
- C) Organizar todo
- D) **Ver en paralelo** ✓

---

**Q-024** · Opción única · Alta

> ¿Qué función permite compartir **dos vistas del mismo documento en una única ventana** y cuál es su atajo?

- A) Nueva ventana — `Alt + F11`
- B) Ver en paralelo — `Alt + F8`
- C) **Dividir — `Alt + Ctrl + V`** ✓
- D) Organizar todo — `Ctrl + Alt + D`

---

**Q-027** · Verdadero/Falso · Alta

> **Afirmación:** El **Desplazamiento sincrónico** puede activarse en cualquier momento, independientemente del estado de las demás opciones de visualización.

- A) Verdadero
- B) **Falso** ✓

---

**Q-028** · Opción única · Alta

> Un usuario necesita que **ambos documentos se desplacen al mismo tiempo** al mover la barra de scroll. ¿Cuál es el orden correcto de activación?

- A) Activar Desplazamiento sincrónico → después Ver en paralelo
- B) Activar Organizar todo → después Desplazamiento sincrónico
- C) **Activar Ver en paralelo → después Desplazamiento sincrónico** ✓
- D) Activar Dividir → después Desplazamiento sincrónico

---

**Q-029** · Opción única · Alta

> Un usuario tiene dos documentos en **Ver en paralelo** pero una ventana ocupa el 70% y la otra el 30%. ¿Qué función usa para distribuirlas de forma **equitativa**?

- A) Organizar todo
- B) Dividir
- C) Ver en paralelo
- D) **Restablecer posición de la ventana** ✓

---

**Q-025** · Emparejamiento · Alta

> Relaciona cada función con su descripción:

| Función | Descripción |
|---|---|
| 1. Nueva ventana | A. Divide la pantalla en dos paneles dentro de una misma ventana |
| 2. Dividir | B. Abre una segunda ventana independiente del mismo documento |
| 3. Ver en paralelo | C. Coloca dos documentos distintos uno al lado del otro |

**Respuesta:** 1-B · 2-A · 3-C

---

**Q-054** · Emparejamiento · Alta

> Relaciona cada función con el número de documentos/ventanas que implica:

| Función | Alcance |
|---|---|
| 1. Nueva ventana | A. Todas las ventanas abiertas (sin límite) |
| 2. Organizar todo | B. Exactamente dos documentos distintos |
| 3. Dividir | C. Un único documento en dos paneles en la misma ventana |
| 4. Ver en paralelo | D. El mismo documento en dos ventanas independientes |

**Respuesta:** 1-D · 2-A · 3-C · 4-B

---

**Q-055** · Verdadero/Falso · Alta

> **Afirmación:** La función **Restablecer posición de la ventana** puede usarse en cualquier momento para redistribuir de forma equitativa todas las ventanas de Word abiertas.

- A) Verdadero
- B) **Falso** ✓

---

**Q-056** · Selección múltiple · Alta

> ¿Cuáles de las siguientes funciones requieren que haya **más de una ventana o documento abierto** para tener sentido funcional? *(Selecciona todas las que correspondan)*

- A) **Organizar todo** ✓
- B) Dividir
- C) **Ver en paralelo** ✓
- D) **Desplazamiento sincrónico** ✓
- E) **Cambiar ventanas** ✓
- F) **Restablecer posición de la ventana** ✓

**Respuesta:** A, C, D, E y F (Dividir opera sobre una sola ventana)

---

**Q-059** · Relleno · Alta

> 1. "**[1]**: abre dos ventanas de Word para ver el mismo documento."
> 2. "**[2]**: en una única ventana comparte dos vistas del mismo documento."
> 3. "**[3]**: visualiza en paralelo dos documentos para compararlos."
> 4. "**[4]**: solo puede activarse cuando se hayan puesto dos documentos en paralelo."

**Respuestas:** [1] Nueva ventana · [2] Dividir · [3] Ver en paralelo · [4] Desplazamiento sincrónico

---

## BLOQUE 7 — GRUPO MACROS

---

**Q-031** · Opción única · Media

> ¿Qué es una **macro** en Word 365?

- A) Un comando que ejecuta automáticamente una tarea predefinida en el documento
- B) Una plantilla de documento que automatiza el formato del texto
- C) Un atajo de teclado personalizado que ejecuta una secuencia de teclas
- D) **Una serie de comandos e instrucciones que se agrupan como un mismo comando para completar una tarea automáticamente** ✓

---

**Q-034** · Opción única · Media

> ¿Qué acción realiza el atajo **`Alt + F8`** en Word 365?

- A) Abre el editor de Visual Basic
- B) Graba una nueva macro
- C) Pausa la grabación de la macro activa
- D) **Abre el cuadro de diálogo Macros** ✓

---

**Q-058** · Verdadero/Falso · Media

> **Afirmación:** Según la definición de la fuente, una macro puede estar formada por un único comando siempre que su ejecución sea automática.

- A) Verdadero
- B) **Falso** ✓

*(Falso: la definición exige una "serie" — pluralidad)*

---

**Q-033** · Opción única · Alta

> Según la fuente, ¿cuál es el propósito principal de crear y ejecutar macros en Word?

- A) Automatizar cualquier tarea del documento, independientemente de su frecuencia de uso
- B) Automatizar las tareas que requieren acceso a Visual Basic para su ejecución
- C) **Automatizar las tareas más usadas o frecuentes del documento** ✓
- D) Automatizar las tareas que no pueden realizarse con los comandos estándar de la cinta

---

**Q-035** · Opción única · Alta

> Un usuario desea acceder al entorno de **Visual Basic** mediante el teclado. ¿Qué atajo debe pulsar?

- A) `Alt + F8`
- B) `Alt + Ctrl + V`
- C) `Ctrl + Alt + Q`
- D) **`Alt + F11`** ✓

---

**Q-036** · Verdadero/Falso · Alta

> **Afirmación:** En Word 365, el atajo `Alt + F8` abre Visual Basic y el atajo `Alt + F11` abre el cuadro de diálogo Macros.

- A) Verdadero
- B) **Falso** ✓

*(Falso: están invertidos)*

---

**Q-037** · Opción única · Alta

> ¿Cuáles son exactamente las opciones del **submenú desplegable del botón Macros**?

- A) Ver macros · Grabar macro... · Ejecutar macro
- B) Ver macros · Pausar grabación · Detener grabación
- C) Grabar macro... · Pausar grabación · Eliminar macro
- D) **Ver macros · Grabar macro... · Pausar grabación** ✓

---

**Q-038** · Opción única · Alta

> En la captura del submenú de Macros, la opción **Pausar grabación** aparece en color gris. ¿Qué indica esto?

- A) La opción ha sido deshabilitada permanentemente en esta versión de Word
- B) La opción solo está disponible con una licencia de Word 365 para empresas
- C) La opción requiere que haya una grabación de macro activa para poder usarse
- D) **La opción no está disponible en el estado actual mostrado en la captura** ✓

---

**Q-032** · Relleno · Alta

> "Una macro es una **[1]** de comandos e instrucciones que se agrupan de forma conjunta como un mismo **[2]** para completar una tarea **[3]**."

**Respuestas:** [1] serie · [2] comando · [3] automáticamente

---

**Q-064** · Selección múltiple · Alta

> ¿Cuáles de las siguientes características forman parte de la **definición estructural** de una macro? *(Selecciona todas las que correspondan)*

- A) **Es una serie de comandos e instrucciones (pluralidad)** ✓
- B) Requiere conocimientos de programación en Visual Basic
- C) **Los comandos se agrupan como un único comando (agrupación)** ✓
- D) Solo puede ejecutarse mediante el atajo Alt+F8
- E) **Su objetivo es completar una tarea automáticamente (automatismo)** ✓
- F) Está limitada a las tareas disponibles en la cinta de opciones

**Respuesta:** A, C y E

---

**Q-057** · Emparejamiento · Alta

> Relaciona cada elemento del Grupo Macros con su función o atajo:

| Elemento | Función / Atajo |
|---|---|
| 1. `Alt + F8` | A. Inicia el proceso de grabación de una nueva macro |
| 2. `Alt + F11` | B. Interrumpe temporalmente una grabación en curso |
| 3. Grabar macro... | C. Abre el cuadro de diálogo para gestionar las macros existentes |
| 4. Pausar grabación | D. Abre el entorno de programación Visual Basic |
| 5. Ver macros | E. Permite visualizar y ejecutar las macros disponibles |

**Respuesta:** 1-C · 2-D · 3-A · 4-B · 5-E

---

## BLOQUE 8 — GRUPO SHAREPOINT

---

**Q-039** · Relleno · Media

> "SharePoint es una herramienta diseñada por **[1]** para la **[2]** y el **[3]**."

**Respuestas:** [1] Microsoft · [2] gestión documental · [3] trabajo en equipo

---

**Q-040** · Selección múltiple · Alta

> Según la **fuente de estudio**, ¿cuáles son las funciones de SharePoint? *(

Tú: sigue

Leo AI: **Q-040** *(continuación)* Selecciona las dos opciones correctas)*

- A) **Gestión documental** ✓
- B) Almacenamiento de archivos en la nube
- C) Comunicación interna mediante mensajería
- D) **Trabajo en equipo** ✓

**Respuesta:** A y D

---

## BLOQUE 9 — INTEGRACIÓN Y DISTINCIÓN

---

**Q-046** · Verdadero/Falso · Alta

> **Afirmación:** En Word 365, la pestaña **Vista** se encuentra entre las pestañas **Revisar** y **Ayuda**.

- A) Verdadero
- B) **Falso** ✓

*(Falso: está entre Revisar y Programador)*

---

**Q-042** · Opción única · Alta

> ¿En qué grupo de la pestaña Vista se encuentra la herramienta **Immersive Reader**?

- A) Grupo Vistas
- B) Grupo Mostrar
- C) **Grupo Inmersivo** ✓
- D) Grupo Ventana

---

**Q-043** · Opción única · Alta

> ¿En qué grupo de la pestaña Vista se encuentra la función **Nueva ventana**?

- A) Grupo Vistas
- B) Grupo Zoom
- C) Grupo Inmersivo
- D) **Grupo Ventana** ✓

---

**Q-044** · Opción única · Alta

> ¿Cuál de las siguientes funciones **no tiene atajo de teclado documentado** en la fuente?

- A) Diseño de impresión
- B) Vista Esquema
- C) Dividir
- D) **Organizar todo** ✓

---

**Q-045** · Opción única · Alta

> ¿Cuál de los siguientes atajos pertenece al **Grupo Macros**?

- A) `Ctrl + Alt + D`
- B) `Alt + Ctrl + V`
- C) `Ctrl + Alt + N`
- D) **`Alt + F8`** ✓

---

**Q-047** · Opción única · Alta

> ¿Cuál es la diferencia principal entre el **Modo de lectura** y la **Vista Preliminar**?

- A) El Modo de lectura solo muestra una página; la Vista Preliminar muestra todas a tamaño completo
- B) Ambas vistas son idénticas en función pero se acceden desde grupos distintos
- C) **El Modo de lectura presenta el documento en dos páginas en forma de libro para facilitar la lectura; la Vista Preliminar muestra páginas completas a tamaño reducido para verificar formato y saltos de página** ✓
- D) El Modo de lectura oculta el texto y muestra solo imágenes; la Vista Preliminar muestra el documento en escala de grises

---

**Q-050** · Opción única · Alta

> ¿Cuál es la diferencia de **alcance** entre **Organizar todo** y **Ver en paralelo**?

- A) Organizar todo solo funciona con documentos guardados; Ver en paralelo funciona con cualquier documento
- B) Organizar todo muestra exactamente dos ventanas; Ver en paralelo muestra todas las abiertas
- C) Ambas funciones tienen el mismo alcance pero diferente disposición visual
- D) **Organizar todo actúa sobre todas las ventanas abiertas; Ver en paralelo opera sobre exactamente dos documentos** ✓

---

**Q-048** · Relleno · Alta

> Indica el nombre exacto del grupo al que pertenece cada herramienta:
> 1. Diseño de impresión → Grupo **[1]**
> 2. Immersive Reader → Grupo **[2]**
> 3. Líneas de la cuadrícula → Grupo **[3]**
> 4. Ver en paralelo → Grupo **[4]**
> 5. Macros (botón principal) → Grupo **[5]**
> 6. Propiedades (icono SharePoint) → Grupo **[6]**
> 7. Vertical / En paralelo → Grupo **[7]**

**Respuestas:** [1] Vistas · [2] Inmersivo · [3] Mostrar · [4] Ventana · [5] Macros · [6] SharePoint · [7] Movimiento de Página

---

**Q-049** · Opción única · Alta

> Un usuario quiere usar una herramienta diseñada específicamente para **mejorar la comprensión y la fluidez lectora**. ¿Cuál debe activar?

- A) Concentración
- B) Vista Borrador
- C) **Immersive Reader** ✓
- D) Vista Esquema

---

**Q-041** · Emparejamiento · Alta · ⚠️ PI-001

> Relaciona cada atajo con su acción:

| Atajo | Acción |
|---|---|
| 1. `Ctrl + Alt + Q` | A. Abre Visual Basic |
| 2. `Alt + F8` | B. Activa Vista Borrador |
| 3. `Ctrl + Alt + I` | C. Activa Diseño de impresión |
| 4. `Alt + Ctrl + V` | D. Activa Vista Esquema |
| 5. `Ctrl + Alt + N` | E. Divide la ventana en dos paneles |
| 6. `Alt + F11` | F. Abre el cuadro de diálogo Macros |
| 7. `Ctrl + Alt + D` | G. Activa Vista Preliminar |

**Respuesta:** 1-D · 2-F · 3-G · 4-E · 5-B · 6-A · 7-C

---

**Q-061** · Emparejamiento · Alta

> Relaciona cada grupo con su función general:

| Grupo | Función general |
|---|---|
| 1. Grupo Vistas | A. Controla el nivel de ampliación de la vista |
| 2. Grupo Inmersivo | B. Gestiona apertura, organización y comparación de ventanas |
| 3. Grupo Mostrar | C. Permite automatizar tareas mediante secuencias de comandos |
| 4. Grupo Zoom | D. Contiene los modos de visualización del documento |
| 5. Grupo Ventana | E. Activa o desactiva elementos de interfaz como regla y cuadrícula |
| 6. Grupo Macros | F. Proporciona herramientas para mejorar concentración y lectura |

**Respuesta:** 1-D · 2-F · 3-E · 4-A · 5-B · 6-C

---

---

---

# 21. ANEXO C — MAZO FINAL DE 46 FLASHCARDS

### Word 365 · Pestaña Vista — Versión final verificada

---

> Incluye las 39 originales + 5 nuevas confirmadas por aulaClic y academias españolas. Las nuevas están marcadas con 🆕.

---

## GRUPO VISTAS

---

**F-01** ⭐
**[FRENTE]** ¿Cuál es la vista predefinida de Word?
**[DORSO]** **Diseño de impresión** · Atajo: `Ctrl + Alt + D`
*Confirmado: aulaClic, Sergio Galán*

---

**F-02** ⭐
**[FRENTE]** ¿Cuántas páginas muestra el Modo de lectura y cómo?
**[DORSO]** **Dos páginas** por pantalla en **forma de libro**.

---

**F-03** 🆕 ⭐
**[FRENTE]** ¿Qué elementos oculta el Modo de lectura?
**[DORSO]** Barras de herramientas · reglas · **encabezados** · **pies de página** · y otros elementos (lista abierta con "…")
*Confirmado: aulaClic*

---

**F-04** ⭐
**[FRENTE]** ¿Qué muestra la Vista Esquema y para qué sirve? Atajo.
**[DORSO]** Muestra **sólo los títulos** · Crear y editar esquemas · Útil para elaborar notas · `Ctrl + Alt + Q`

---

**F-05** 🆕
**[FRENTE]** ¿Qué ocurre en la cinta al activar Vista Esquema?
**[DORSO]** Aparece una **nueva pestaña "Esquema"** en la cinta. Es la única vista que genera su propia pestaña adicional.
*

Tú: sigue

Leo AI: Confirmado: Sergio Galán*

---

**F-06** ⭐
**[FRENTE]** ¿Qué elementos NO son visibles en Vista Borrador? Atajo.
**[DORSO]** Encabezados y pies de página (**ejemplos** — lista abierta con "como") · `Ctrl + Alt + N`

---

**F-07**
**[FRENTE]** ¿Cuál es la función principal de Vista Borrador?
**[DORSO]** Editar el **texto rápidamente** mostrando el documento como borrador.
*Confirmado: Sergio Galán*

---

**F-08**
**[FRENTE]** ¿Qué hace el Diseño Web?
**[DORSO]** Muestra el documento como en un **explorador web**: fondos con colores/texturas · texto ajustado a la ventana · gráficos como en web.

---

**F-09**
**[FRENTE]** ¿Para qué sirve la Vista Preliminar? Atajo.
**[DORSO]** Ver páginas completas **a tamaño reducido** · verificar saltos de página, distribución y formato · `Ctrl + Alt + I`
*¡OJO!: No es un botón del Grupo Vistas. Se accede desde Archivo → Imprimir.*

---

## GRUPO INMERSIVO

---

**F-10**
**[FRENTE]** ¿Qué hace la herramienta Concentración?
**[DORSO]** **Elimina las distracciones** del entorno para concentrarse en el documento.

---

**F-11** ⭐
**[FRENTE]** ¿Qué es Immersive Reader?
**[DORSO]** Un **conjunto de herramientas** (plural) para mejorar la **comprensión y fluidez de lectura**.
*Nombre oficial en español: "Lector inmersivo"*

---

**F

Tú: sigue

Leo AI: -12**
**[FRENTE]** ¿A qué grupo pertenecen Concentración e Immersive Reader?
**[DORSO]** Al **Grupo Inmersivo** (también llamado "Inmersivo" en la cinta) ¡NO al Grupo Vistas!
*Confirmado: aulaClic*

---

## GRUPO MOVIMIENTO DE PÁGINA

---

**F-13**
**[FRENTE]** ¿En qué dirección desplaza el Grupo Movimiento de Página y mediante qué medios?
**[DORSO]** Dirección: **horizontal** · Medios: rueda del ratón **o** barra de desplazamiento horizontal.

---

## GRUPO MOSTRAR

---

**F-14** ⭐
**[FRENTE]** ¿Qué tres elementos controla el Grupo Mostrar?
**[DORSO]** **Regla · Líneas de la cuadrícula · Panel de navegación** · Acción: Mostrar/Ocultar (toggle reversible)

---

## GRUPO ZOOM

---

**F-15** ⭐
**[FRENTE]** ¿Cuál es el zoom mínimo y máximo en Word?
**[DORSO]** Mínimo **10%** · Máximo **500%**
*¡OJO!: El 25% es solo una opción del cuadro de diálogo, NO el mínimo.*

---

**F-16** ⭐
**[FRENTE]** ¿En qué incremento cambia el zoom con Ctrl + rueda del ratón?
**[DORSO]** De **10 en 10** puntos porcentuales.

---

**F-17**
**[FRENTE]** ¿Diferencia entre el botón Zoom (lupa) y el botón 100%?
**[DORSO]** Zoom (lupa) → **abre el cuadro de diálogo** para configurar · 100%

Tú: sigue

Leo AI: → **aplica directamente** zoom al 100% sin abrir ningún cuadro de diálogo.

---

**F-18**
**[FRENTE]** ¿Qué opciones de ajuste ofrece el Grupo Zoom además del botón Zoom y 100%?
**[DORSO]** **Una página · Varias páginas · Ancho de página**

---

## GRUPO VENTANA

---

**F-19** ⭐
**[FRENTE]** ¿Qué hace Nueva ventana?
**[DORSO]** Abre **dos ventanas independientes** del **mismo documento**.

---

**F-20** ⭐
**[FRENTE]** ¿Qué hace Dividir? Atajo.
**[DORSO]** **Dos paneles** del mismo documento en **una sola ventana** · `Alt + Ctrl + V`
*Atajo complementario para desactivar: `Alt + Mayús + C`*

---

**F-21** ⭐
**[FRENTE]** ¿Qué hace Ver en paralelo?
**[DORSO]** Muestra **dos documentos distintos** simultáneamente para **compararlos cómodamente**.

---

**F-22** ⭐
**[FRENTE]** ¿Cuál es la diferencia entre Nueva ventana, Dividir y Ver en paralelo?
**[DORSO]**
- Nueva ventana → mismo doc · **2 ventanas separadas**
- Dividir → mismo doc · **2 paneles en 1 ventana** · `Alt+Ctrl+V`
- Ver en paralelo → **2 documentos distintos** para comparar

---

**F-23**
**[FRENTE]** ¿Con qué otro nombre se conoce Organizar todo y qué hace?
**[DORSO]** **Mosaico** · Coloca en mosaico **todas** las ventanas abiertas (sin límite numérico).

---

**F-24

Tú: sigue

Leo AI: ** ⭐
**[FRENTE]** ¿Qué condición requiere el Desplazamiento sincrónico para activarse?
**[DORSO]** Requiere que **Ver en paralelo** esté activo previamente.
Función: desplaza **simultáneamente** los dos documentos en paralelo.

---

**F-25**
**[FRENTE]** ¿Qué hace Restablecer posición de la ventana y qué condición requiere?
**[DORSO]** Coloca las ventanas en paralelo de manera **equitativa** · Requiere que el **modo paralelo** esté activo.

---

**F-26**
**[FRENTE]** ¿Qué hace Cambiar ventanas y cómo se presenta en la cinta?
**[DORSO]** Cambia rápidamente a **otra ventana abierta** · Se presenta como **menú desplegable** (∨).

---

## GRUPO MACROS

---

**F-27** ⭐
**[FRENTE]** ¿Qué es una macro? (3 componentes estructurales)
**[DORSO]** Una **serie** de comandos e instrucciones · agrupados como **un mismo comando** · para completar una tarea **automáticamente**.
*aulaClic añade: se ejecutan en un orden que el usuario decide.*

---

**F-28** 🆕
**[FRENTE]** ¿Cuáles son los tres usos principales de las macros según aulaClic?
**[DORSO]**
1. **Automatizar** una serie de pasos
2. **Personalizar** la barra de acceso rápido
3. **Insertar** texto o gráficos de uso frecuente
*Confirmado: aulaClic*

---

**F-29**
**[FRENTE]** ¿Para qué tipo de tareas se usan las macros según Adams?
**[DORSO]** Para automatizar las tareas **más

Tú: sigue

Leo AI: usadas** (frecuentes) en Word.

---

**F-30** ⭐
**[FRENTE]** ¿Qué abre `Alt + F8`?
**[DORSO]** El **cuadro de diálogo Macros**.
*Confirmado: Studocu, aulaClic*

---

**F-31** ⭐
**[FRENTE]** ¿Qué abre `Alt + F11`?
**[DORSO]** El editor de **Visual Basic** (VBE — entorno de programación de macros).
*Confirmado: Studocu, IONOS España*

---

**F-32**
**[FRENTE]** ¿Qué opciones tiene el submenú del botón Macros?
**[DORSO]** **Ver macros · Grabar macro... · Pausar grabación**
*(Pausar grabación aparece en gris si no hay grabación activa)*

---

**F-33** 🆕
**[FRENTE]** ¿Cuál es la ruta para abrir el cuadro de diálogo Macros desde la cinta?
**[DORSO]** **Vista → Macros → Ver macros**
*(También con atajo directo `Alt + F8`)*
*Confirmado: aulaClic*

---

## GRUPO SHAREPOINT

---

**F-34**
**[FRENTE]** ¿Qué es SharePoint y quién lo diseñó?
**[DORSO]** Herramienta de **Microsoft** para la **gestión documental** y el **trabajo en equipo**.

---

## INTEGRACIÓN Y ESTRUCTURA

---

**F-35**
**[FRENTE]** ¿Entre qué pestañas está la pestaña Vista en la cinta?
**[DORSO]** Entre **Revisar** (izquierda) y **Programador** (derecha) · Posición **9.ª de 11**.

---

**F-36** 

Tú: sigue

Leo AI: ⭐
**[FRENTE]** ¿Cuáles son los 8 grupos de la pestaña Vista?
**[DORSO]** Vistas · Inmersivo · Movimiento de Página · Mostrar · Zoom · Ventana · Macros · SharePoint

---

**F-37** ⭐
**[FRENTE]** ¿Qué 4 vistas tienen atajo `Ctrl + Alt + [letra]`?
**[DORSO]**
- **D** = Diseño de impresión
- **Q** = esQuema
- **N** = borrador (borraNdor)
- **I** = vIsta preliminar (previa de impresión)

---

**F-38**
**[FRENTE]** ¿Qué función NO tiene atajo documentado entre estas tres: Diseño de impresión, Dividir, Organizar todo?
**[DORSO]** **Organizar todo** no tiene atajo documentado.
- Diseño de impresión → `Ctrl+Alt+D` ✅
- Dividir → `Alt+Ctrl+V` ✅
- Organizar todo → sin atajo ❌

---

**F-39** 🆕
**[FRENTE]** ¿Cómo se llama el Grupo Vistas según aulaClic?
**[DORSO]** aulaClic lo llama **"Vistas de documento"** · Tu temario Adams lo llama **"Grupo Vistas"** · Ambas denominaciones son válidas para el examen.

---

## FICHAS DE ERROR — "NO CONFUNDIR"

---

**E-01** ⭐
**[FRENTE]** `Alt + F8` vs `Alt + F11` — ¿cuál es cuál?
**[DORSO]**
- `Alt + F8` → diálogo **MACROS** (gestionar)
- `Alt + F11` → **VISUAL BASIC** (programar)
*

Tú: sigue

Leo AI: Regla: F8 viene antes que F11, igual que gestionar viene antes que programar.*
*Confirmado: Studocu, aulaClic, IONOS España*

---

**E-02** ⭐
**[FRENTE]** Zoom mínimo: ¿10% o 25%?
**[DORSO]** **10%** es el mínimo absoluto.
El **25%** es solo una **opción predefinida** del cuadro de diálogo Zoom, NO el mínimo.

---

**E-03** ⭐
**[FRENTE]** Ver el mismo documento en 2 ventanas vs. 2 paneles — ¿qué función es cada una?
**[DORSO]** 2 ventanas separadas = **Nueva ventana**
2 paneles en 1 ventana = **Dividir** (`Alt+Ctrl+V`)

---

**E-04**
**[FRENTE]** ¿Se puede activar el Desplazamiento sincrónico en cualquier momento?
**[DORSO]** **No.** Solo cuando **Ver en paralelo** está activo previamente.

---

**E-05**
**[FRENTE]** ¿La Vista Esquema muestra todo el contenido organizado jerárquicamente?
**[DORSO]** **No.** Muestra **SÓLO los títulos**. El contenido completo no es visible.

---

**E-06** 🆕
**[FRENTE]** ¿La Vista Preliminar es un botón del Grupo Vistas en la pestaña Vista?
**[DORSO]** **No.** La Vista Preliminar se accede desde **Archivo → Imprimir**.
El atajo `Ctrl+Alt+I` la activa directamente desde cualquier lugar.
*Confirmado: age.josenrique, Opostal, Sergio Galán*

---

**E-07** 🆕
**[FRENTE]** ¿El Modo de lectura solo o

Tú: sigue

Leo AI: culta barras de herramientas y reglas?
**[DORSO]** **No solo eso.** Oculta también **encabezados y pies de página**, además de barras de herramientas, reglas y otros elementos (lista abierta).
*Confirmado: aulaClic*

---

## RESUMEN FINAL DEL MAZO COMPLETO

| Sección | Fichas | Fichas ⭐ máx. prioridad |
|---|---|---|
| Grupo Vistas | F-01 a F-09 | F-01, F-03, F-04, F-06 |
| Grupo Inmersivo | F-10 a F-12 | F-11 |
| Grupo Movimiento de Página | F-13 | — |
| Grupo Mostrar | F-14 | F-14 |
| Grupo Zoom | F-15 a F-18 | F-15, F-16 |
| Grupo Ventana | F-19 a F-26 | F-19, F-20, F-21, F-22, F-24 |
| Grupo Macros | F-27 a F-33 | F-27, F-30, F-31 |
| Grupo SharePoint | F-34 | — |
| Integración | F-35 a F-39 | F-36, F-37 |
| Fichas de error | E-01 a E-07 | E-01, E-02, E-03, E-06, E-07 |
| **TOTAL** | **46 fichas** | **20 fichas ⭐** |

---

## ESTADO FINAL DEL SISTEMA COMPLETO

| Elemento | Estado |
|---|---|
| Flags PI activos | **0** — todos cerrados ✅ |
| Datos Adams contradichos | **0** ✅ |
| Datos Adams confirmados por academias | **Todos los principales** ✅ |
| Nuevos hechos incorporados

Tú: sigue

Leo AI: | **6** (F-070 a F-075) ✅ |
| Nuevas flashcards añadidas | **7** (F-39, F-40→E-06, E-07 + fichas nuevas) ✅ |
| Total flashcards del mazo | **46** ✅ |
| Fuentes académicas verificadas | aulaClic · Sergio Galán · age.josenrique · Opostal · Studocu ✅ |
| Fuentes descartadas para atajos | Windows Support / Ayuntamiento de Madrid ✅ |

---

---

# 22. RESUMEN PARA CLAUDE CODE

Vista no debe integrarse como “69 preguntas más”. Debe integrarse como:

```text
CONOCIMIENTO VISTA
    ↓
COMPARACIÓN CON BANCO OPE365
    ↓
CONSOLIDACIÓN
    ├── preguntas nuevas
    ├── preguntas mejoradas
    ├── preguntas existentes confirmadas
    ├── preguntas afectadas por nuevas verificaciones
    └── posibles conflictos

FLASHCARDS VISTA
    ↓
MAZO GLOBAL DE FLASHCARDS

TAXONOMÍA GLOBAL
    ↓
Vista → grupos → temas/subtemas
```

El objetivo es **no perder ningún dato**, no duplicar conocimiento sin necesidad y conseguir que Vista quede integrada como una parte normal del temario global.
