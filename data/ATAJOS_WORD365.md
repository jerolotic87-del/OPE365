# Atajos de teclado — Word 365 (v2608)

**Word para Microsoft 365 MSO · versión 2608 · compilación 16.0.20326.20072 · 64 bits**

Documento único y definitivo. Reúne:

1. **Volcado** — todo lo que sale en el cuadro *Archivo ▸ Opciones ▸ Personalizar
   la cinta ▸ Personalizar (métodos abreviados)* de esta instalación, sacado
   pantalla a pantalla.
2. **Verificado en vivo** (✅) — atajos que el usuario ha pulsado uno a uno y ha
   comprobado qué hacen.
3. **Advertencias** (⚠️) — casos en que el volcado y la pulsación real no
   coinciden, o subtilezas del teclado español. **En esos casos manda lo que
   pasa al pulsar, no lo que dice el cuadro.**

> Notación: en el teclado español la tecla a la izquierda de la Z da `<` sin
> Mayús y `>` con Mayús; la del guión da `-` sin Mayús y `_` con Mayús; `(` es
> `Mayús+8`. Por eso `Ctrl+(` = `Ctrl+Mayús+8`, y `Ctrl+Mayús+-` = `Ctrl+_`.

---

## 1. Portapapeles y edición básica

| Atajo | Acción | |
|---|---|---|
| `Ctrl+C` · `Ctrl+Insert` | Copiar | ✅ |
| `Ctrl+X` · `Mayús+Supr` | Cortar | ✅ |
| `Ctrl+V` · `Mayús+Insert` | Pegar | ✅ |
| `Ctrl+Mayús+V` | Pegar solo texto (sin formato) | ✅ |
| `Alt+Ctrl+G` | **Pegado especial** (vinculado / otro formato) | ✅ · el estándar sería `Alt+Ctrl+V`, aquí reasignado |
| `Alt+Ctrl+C` | **Copiar formato** (pincel) | ✅ |
| `Alt+Ctrl+V` | **Pegar formato** (pincel) | ⚠️ el volcado lo lista además como «Dividir ventana»; al pulsar, pega formato. Si el origen mezcla formato de carácter y de párrafo, al pegar sobre otro párrafo solo entra el de párrafo |
| `Ctrl+Z` · `Alt+Retroceso` | Deshacer | ✅ |
| `Ctrl+Y` · `F4` · `Alt+Entrar` | Rehacer / repetir la última acción | ✅ |
| `Alt+Mayús+Retroceso` | Rehacer | 📋 |
| `Supr` | Borrar hacia delante / borrar selección | ✅ |
| `Ctrl+Supr` | Borrar la palabra **siguiente** | ✅ |
| `Ctrl+Retroceso` | Borrar la palabra **anterior** | ✅ |
| `F2` | **Mover** texto seleccionado — la barra de estado pide «¿Dónde quieres moverlo?», se lleva el cursor y se pulsa Intro | ✅ |
| `Mayús+F2` | **Copiar a** — copia la selección al destino sin usar el portapapeles | ✅ |
| `Ctrl+F3` | **Spike** — corta la selección y la acumula en el Autotexto especial | ✅ |
| `Ctrl+Mayús+F3` | Suelta de golpe todo lo acumulado en el Spike | ✅ |
| `Esc` | Cancelar / interrumpir la acción en curso | ✅ |

---

## 2. Buscar, reemplazar, ir a, navegar

| Atajo | Acción | |
|---|---|---|
| `Ctrl+B` | Abre el **panel de Navegación** con el cuadro de búsqueda dentro del documento | ✅ · ⚠️ no figura en el volcado; confirmado en vivo |
| `Ctrl+L` | Buscar y reemplazar (pestaña **Reemplazar**) | ✅ |
| `Ctrl+I` · `F5` | Buscar y reemplazar (pestaña **Ir a**) | ✅ |
| `Mayús+F4` · `Alt+Ctrl+Y` | Repetir la última búsqueda | 📋 |
| `Mayús+F5` · `Alt+Ctrl+Z` | Volver al punto de inserción anterior | 📋 |
| `Alt+Q` | Lleva el foco al **Buscar de la barra de título** (Microsoft Search) | ✅ · ⚠️ no figura en el volcado; confirmado en vivo |
| `Ctrl+Re Pág` / `Ctrl+Av Pág` | Objeto de búsqueda anterior / siguiente (explorador de objetos) | 📋 |

---

## 3. Mover el cursor

| Atajo | Acción | |
|---|---|---|
| `Inicio` / `Fin` | Inicio / final de la **línea** | ✅ |
| `Ctrl+Inicio` / `Ctrl+Fin` | Inicio / final del **documento** | ✅ |
| `Ctrl+←` / `Ctrl+→` | Una **palabra** a la izquierda / derecha | ✅ |
| `Ctrl+↑` / `Ctrl+↓` | Un **párrafo** arriba / abajo | 📋 |
| `Re Pág` / `Av Pág` | Una pantalla arriba / abajo | ✅ |
| `Alt+Ctrl+Re Pág` / `Alt+Ctrl+Av Pág` | Principio / final de la ventana visible | 📋 |
| `Alt+↑` / `Alt+↓` | Objeto anterior / siguiente de la página | 📋 |
| `Alt+←` / `Alt+→` | Hipervínculo hacia atrás / hacia delante | 📋 |

---

## 4. Seleccionar

| Atajo | Acción | |
|---|---|---|
| `Ctrl+E` | **Seleccionar todo** el documento | ✅ |
| `Ctrl+5` (teclado **numérico**) | Seleccionar todo (con NumLock on u off) | ✅ · ⚠️ no figura en el volcado; confirmado en vivo |
| `F8` | Activa el **modo Extender selección** | ✅ |
| `Mayús+F8` | Reduce la selección en modo Extender | ✅ |
| `Ctrl+Mayús+F8` | **Modo Seleccionar columna** — bloque vertical de texto; se sale con `Esc` | ✅ |
| `Mayús+←` / `Mayús+→` | Extender un **carácter** | 📋 |
| `Mayús+↑` / `Mayús+↓` | Extender una **línea** | 📋 |
| `Ctrl+Mayús+←` / `Ctrl+Mayús+→` | Extender una **palabra** | 📋 |
| `Ctrl+Mayús+↑` / `Ctrl+Mayús+↓` | Extender un **párrafo** | 📋 |
| `Mayús+Inicio` / `Mayús+Fin` | Extender hasta inicio / fin de **línea** | ✅ |
| `Ctrl+Mayús+Inicio` / `Ctrl+Mayús+Fin` | Extender hasta inicio / fin del **documento** | ✅ |
| `Mayús+Re Pág` / `Mayús+Av Pág` | Extender una **página** | 📋 |
| `Alt+Ctrl+Mayús+Re Pág` / `Alt+Ctrl+Mayús+Av Pág` | Extender hasta inicio / fin de la ventana visible | 📋 |

---

## 5. Formato de carácter

| Atajo | Acción | |
|---|---|---|
| `Ctrl+N` · `Ctrl+Mayús+N` | Negrita | ✅ |
| `Ctrl+K` · `Ctrl+Mayús+K` | Cursiva | ✅ |
| `Ctrl+S` · `Ctrl+Mayús+S` | Subrayado | ✅ |
| `Ctrl+Mayús+D` | Subrayado doble | ✅ |
| `Ctrl+Mayús+P` | Subrayado de solo palabras | 📋 |
| `Ctrl+Mayús+L` | Versalitas | ⚠️ el volcado lo lista también como «Lista con viñetas» |
| `Ctrl+Mayús+U` | MAYÚSCULAS (activar/desactivar) | 📋 |
| `Mayús+F3` | Rota MAYÚSCULAS → minúsculas → Tipo Oración | ✅ |
| `Ctrl+Mayús+-` (= `Ctrl+_`) | **Subíndice** | ✅ · ⚠️ el volcado lista también `Ctrl+=`, que **no funciona** |
| *(sin atajo)* | **Superíndice** — no tiene atajo en este Word; solo botón o cuadro Fuente | ✅ |
| `Ctrl+Mayús+>` | Agrandar la fuente al siguiente valor de la lista | ✅ |
| `Ctrl+<` (sin Mayús) | Reducir la fuente al valor anterior de la lista | ✅ |
| `Ctrl+Alt+Mayús+>` | Agrandar la fuente de punto en punto | ✅ |
| `Ctrl+Alt+<` | Reducir la fuente de punto en punto | ✅ |
| `Ctrl+Mayús+Q` | Aplicar la fuente **Symbol** | 📋 |
| `Ctrl+Barra espaciadora` (= `Ctrl+Espacio`) | Quitar el **formato de carácter** manual | ✅ |
| `Ctrl+Mayús+Z` | Quitar el formato de carácter (igual que `Ctrl+Espacio`) | ✅ |
| `Alt+Ctrl+H` | **Resaltar** el texto seleccionado (rotulador) | ✅ · ⚠️ no figura en el volcado; confirmado en vivo |
| `Alt+Mayús+Q` | Texto oculto (activar/desactivar) | 📋 |
| `Alt+X` | Alterna código de carácter ↔ carácter (Unicode) | 📋 |

### Cuadro de diálogo Fuente

| Atajo | Acción | |
|---|---|---|
| `Ctrl+M` | Abre el cuadro **Fuente** con el foco en el **nombre** | ✅ |
| `Ctrl+Mayús+F` | Abre el cuadro **Fuente** con el foco en el **nombre** (igual que `Ctrl+M`) | ✅ |
| `Ctrl+Mayús+M` | Abre el cuadro **Fuente** con el foco en el **Tamaño** | ✅ |

---

## 6. Formato de párrafo

| Atajo | Acción | |
|---|---|---|
| `Ctrl+Q` | Alinear a la **izquierda** — si ya está a la izquierda, 2ª pulsación = **justificar** | ✅ |
| `Ctrl+T` | **Centrar** | ✅ |
| `Ctrl+D` | Alinear a la **derecha** | ✅ |
| `Ctrl+J` | **Justificar** | ✅ |
| `Ctrl+Mayús+J` | Párrafo **distribuido** | 📋 |
| `Ctrl+1` | Interlineado **sencillo** | ✅ · ⚠️ el volcado lo lista como «Aplicar Título 1»; al pulsar, aplica interlineado |
| `Ctrl+5` (fila superior) | Interlineado **1,5 líneas** | ✅ |
| `Ctrl+2` | Interlineado **doble** | ✅ |
| `Ctrl+H` | Aumentar la **sangría** izquierda | ✅ |
| `Ctrl+F` | Aplicar / quitar la **sangría francesa** | ✅ |
| `Ctrl+Mayús+H` | Reducir la sangría francesa | ✅ |
| `Ctrl+Mayús+R` | Quitar la sangría francesa (a la tabulación anterior) | ⚠️ el volcado lo asigna, pero en vivo `Ctrl+Mayús+R` no hace nada; para quitar sangrías se usa `Ctrl+W` |
| `Ctrl+W` | Quitar todo el **formato de párrafo** (sangrías incluidas) | ✅ · ⚠️ el volcado lo lista también como «cerrar documento»; al pulsar, quita formato — **no cierra nada** |
| `Ctrl+Mayús+8` (= `Ctrl+(`) | Mostrar / ocultar **marcas de formato** (¶ · → ) | ✅ |
| `Ctrl+0` | **Restaurar el zoom al 100 %** | ✅ · ⚠️ el volcado lo lista también como «espacio antes del párrafo»; al pulsar, hace zoom. El espaciado entre párrafos **no tiene atajo** |
| `Alt+Ctrl+Entrar` | Insertar un **separador de estilos** | 📋 |
| `Alt`, `F`, `T` | Secuencia de teclas: abre el cuadro **Tabulaciones** | ✅ |
| `Ctrl+Tab` | Insertar una **tabulación real** dentro de una celda de tabla | ✅ |

---

## 7. Estilos

| Atajo | Acción | |
|---|---|---|
| `Ctrl+Mayús+A` | Aplicar el estilo **Normal** | 📋 |
| `Ctrl+Mayús+1` | Aplicar **Título 1** | ✅ · ⚠️ el volcado asigna Título 1 a `Ctrl+1`, pero esa combinación hace interlineado sencillo |
| `Alt+Ctrl+2` | Aplicar **Título 2** | ✅ |
| `Ctrl+Mayús+3` | Aplicar **Título 3** | ✅ |
| `Ctrl+Mayús+L` | Aplicar **Lista con viñetas** | ⚠️ el volcado lo lista también como «Versalitas» |
| `Ctrl+Mayús+W` | Abrir el panel **Aplicar estilos** | ✅ |
| `Alt+Ctrl+Mayús+S` | Abrir el panel **Formato / Estilos** | 📋 |
| `Mayús+F1` | Panel **Propiedades de formato** («Revelar formato») | 📋 |

---

## 8. Vistas y ventana

| Atajo | Acción | |
|---|---|---|
| `Alt+Ctrl+D` | Vista **Diseño de impresión** | ✅ |
| `Alt+Ctrl+N` | Vista **Normal / Borrador** | 📋 |
| `Alt+Ctrl+Q` | Vista **Esquema** | 📋 |
| `Alt+Ctrl+I` · `Ctrl+P` · `Ctrl+Mayús+F12` | Vista previa de **impresión** (pestaña Imprimir de Backstage) | ✅ (`Ctrl+P`) |
| `Alt+Ctrl+V` | Dividir la ventana | ⚠️ el volcado lo asigna, pero al pulsar **pega formato**. Dividir se hace por *Vista ▸ Ventana ▸ Dividir* (sin atajo) |
| `Alt+Mayús+C` | Cerrar el panel activo (quita la división de la ventana) | 📋 |
| `Alt+Ctrl+\` | Alternar vista maestro / subdocumentos | 📋 |
| `Ctrl+F6` · `Alt+F6` | Ventana de documento **siguiente** | 📋 |
| `Ctrl+Mayús+F6` · `Alt+Mayús+F6` | Ventana de documento **anterior** | 📋 |
| `Ctrl+F8` | Cambiar el **tamaño** de la ventana del documento | 📋 |
| `Ctrl+F5` | Restaurar el tamaño de la ventana del documento | 📋 |
| `Alt+F5` | Restaurar la ventana de la **aplicación** | 📋 |
| `Ctrl+-` (numérico) | Alejar el zoom (de 10 en 10) | ✅ |
| `Ctrl++` (numérico) | Acercar el zoom (de 10 en 10) | ✅ |
| `Ctrl+0` | Zoom al 100 % | ✅ |
| `Ctrl+rueda del ratón` | Zoom, de 10 en 10 | ✅ |

### Vista Esquema

| Atajo | Acción | |
|---|---|---|
| `Alt+Mayús+↑` / `Alt+Mayús+↓` | Mover el elemento arriba / abajo | 📋 |
| `Alt+Mayús+→` | Disminuir el nivel del título (degradar) | 📋 |
| `Alt+Mayús+←` | Aumentar el nivel del título (promover) | 📋 |
| `Alt+Mayús++` (numérico) | Expandir un título contraído | 📋 |
| `Alt+Mayús+-` (numérico) | Contraer un título | 📋 |
| `Alt+Mayús+L` | Alternar: solo primera línea de cada párrafo / todo el texto | 📋 |
| `Alt+Mayús+T` | Mostrar todos los niveles de título | 📋 |

---

## 9. Tablas

| Atajo | Acción | |
|---|---|---|
| `Alt+Inicio` | Ir a la **primera celda de la fila** | ✅ |
| `Alt+Fin` | Ir a la **última celda de la fila** | ✅ |
| `Alt+Re Pág` | Ir a la **primera celda de la columna** | ✅ |
| `Alt+Av Pág` | Ir a la **última celda de la columna** | ✅ |
| `Alt+Mayús+Inicio` / `Alt+Mayús+Fin` | **Extienden la selección** hasta la primera / última celda de la fila (si ya estás en ella, seleccionan solo esa) | ✅ · ⚠️ el volcado los lista como «ir a la celda» (igual que `Alt+Inicio/Fin`), pero con Mayús la selección se extiende |
| `Alt+Mayús+Re Pág` / `Alt+Mayús+Av Pág` | Ir a la primera / última celda de la columna (alternativa a `Alt+Re Pág`/`Alt+Av Pág`) | 📋 |
| `Ctrl+Tab` | Insertar una tabulación real dentro de la celda | ✅ |
| `Alt+5` (numérico, **NumLock OFF**) | Seleccionar toda la tabla | ✅ |
| `Alt+5` (numérico, **NumLock ON**) | Inserta `♣` (código Alt de Windows, no es de Word) | ✅ |

---

## 10. Campos

| Atajo | Acción | |
|---|---|---|
| `F9` · `Alt+Mayús+U` | Actualizar los campos seleccionados | 📋 |
| `Ctrl+F9` | Insertar un campo vacío `{ }` | 📋 |
| `Alt+F9` | Mostrar / ocultar **todos** los códigos de campo | 📋 |
| `Mayús+F9` | Mostrar / ocultar el código del campo seleccionado | 📋 |
| `Alt+Mayús+F9` | Ejecutar la acción del campo (como hacer clic) | 📋 |
| `F11` · `Alt+F1` | Ir al **campo siguiente** | 📋 |
| `Mayús+F11` · `Alt+Mayús+F1` | Ir al **campo anterior** | 📋 |
| `Ctrl+3` · `Ctrl+F11` | **Bloquear** los campos seleccionados | 📋 |
| `Ctrl+4` · `Ctrl+Mayús+F11` | **Desbloquear** los campos | 📋 |
| `Ctrl+6` · `Ctrl+Mayús+F9` | **Desvincular** campos (sustituir por su resultado) | 📋 |
| `Ctrl+Mayús+Y` | Insertar un campo **ListNum** | 📋 |

---

## 11. Revisión

| Atajo | Acción | |
|---|---|---|
| `F7` · `Windows+F7` | Abrir el panel **Editor** (ortografía y gramática) | ✅ |
| `Alt+F7` | Ir al **siguiente error** ortográfico | 📋 |
| `Mayús+F7` | **Sinónimos** (panel Referencia) | 📋 |
| `Alt+Mayús+F7` | Abrir el **Traductor** | ✅ · ⚠️ no figura en el volcado; confirmado en vivo |
| `Alt+Ctrl+F7` | Conversión hangul / hanja | 📋 |
| `Ctrl+Mayús+E` | Activar / desactivar el **Control de cambios** | ✅ |
| `Alt+Mayús+Retroceso` | *(ver Deshacer/Rehacer)* | |
| `Alt+Ctrl+A` | Insertar un **comentario** | 📋 |
| `Alt+Ctrl+Espacio` | **Leer en voz alta** (resalta cada palabra) | ✅ |
| `Ctrl+Mayús+O` | Recalcular / actualizar el **recuento de palabras** | 📋 |
| `Ctrl+Mayús+T` | Búsqueda en la herramienta de referencia | 📋 |
| `Ctrl+Mayús+F7` | Copiar al archivo de origen el texto modificado de un archivo vinculado | 📋 |

---

## 12. Referencias y correspondencia

| Atajo | Acción | |
|---|---|---|
| `Alt+Ctrl+O` | Insertar **nota al pie** | 📋 |
| `Alt+Ctrl+L` | Insertar **nota al final** | 📋 |
| `Alt+Mayús+X` | Marcar entrada de **índice** | 📋 |
| `Alt+Mayús+I` | Marcar cita para la **tabla de autoridades** | 📋 |
| `Alt+Mayús+B` | Marcar elemento para la **tabla de contenido** | 📋 |
| `Alt+Mayús+D` | Combinar correspondencia → **documento nuevo** | 📋 |
| `Alt+Mayús+M` | Combinar correspondencia → **impresora** | 📋 |
| `Alt+Mayús+K` | **Comprobar** la combinación de correspondencia | 📋 |
| `Alt+Mayús+E` | Abrir / **editar el origen de datos** de combinación | 📋 |
| `Alt+Ctrl+K` | Insertar **hipervínculo** | 📋 |
| `Ctrl+Mayús+F5` | Insertar **marcador** | 📋 |

---

## 13. Archivo y aplicación

| Atajo | Acción | |
|---|---|---|
| `Ctrl+U` | **Nuevo** documento (plantilla Normal) | 📋 |
| `Ctrl+A` | **Abrir** desde Backstage | ✅ |
| `Ctrl+F12` · `Alt+Ctrl+F2` | **Abrir** (cuadro de diálogo) | ✅ |
| `Ctrl+G` · `Mayús+F12` · `Alt+Mayús+F2` | **Guardar** | ✅ · ⚠️ en Word estándar `Ctrl+G` es «Ir a»; aquí está reasignado a Guardar |
| `F12` | **Guardar como** | ✅ |
| `Ctrl+P` · `Ctrl+Mayús+F12` · `Alt+Ctrl+I` | **Imprimir** (pestaña Imprimir de Backstage) | ✅ |
| `Ctrl+F4` | **Cerrar** el documento activo (no cierra Word) | ✅ |
| `Alt+F4` | Cierra los documentos uno a uno; con el último abierto, cierra Word | ✅ |
| `F1` | **Ayuda** | ✅ |
| `Alt+Ctrl++` (numérico) | Abrir el cuadro **Personalizar teclado** | ✅ |
| `Alt+Ctrl+F1` | Información del sistema de Microsoft | 📋 |
| `Alt+[` | Iniciar / detener el **Dictado** | ✅ |
| `Alt+F11` | Editor de **Visual Basic** | 📋 |
| `Alt+F8` | Cuadro de diálogo **Macros** | 📋 |
| `Ctrl+Mayús+X` | Alternar la vista de **etiquetas XML** | 📋 |
| `Ctrl+O` | **Autoformato** del documento | 📋 |
| `Alt+Ctrl+U` | Actualizar el formato automático / de tabla | 📋 |

---

## 14. Insertar carácter

| Atajo | Carácter |
|---|---|
| `Alt+Ctrl+.` | Puntos suspensivos `…` |
| `Alt+Ctrl+T` | Marca comercial `™` |
| `Alt+Ctrl+R` | Registrado `®` |
| `Ctrl+Alt+Mayús+-`* | Guion opcional |
| `Alt+Ctrl+-` (numérico) | Raya `—` |
| `Alt+Mayús+-` | Guion de no separación |
| `Ctrl+-` (numérico) | Guion corto |
| `Ctrl+Mayús+Espacio` | Espacio de no separación |
| `Ctrl+Entrar` | Salto de página |

\* El volcado escribe `Alt+Ctrl+-` para «guion opcional»; con el `-` de la fila
superior (no numérico).

---

## Leyenda

| | |
|---|---|
| ✅ | Verificado en vivo por el usuario (pulsado y comprobado) |
| 📋 | Del volcado del cuadro *Personalizar teclado*, sin probar en vivo todavía |
| ⚠️ | El volcado y la pulsación real no coinciden, o subtileza del teclado ES. **Manda lo que pasa al pulsar.** |

## Conflictos internos del volcado (una tecla, dos comandos)

| Tecla | Volcado dice | Al pulsar |
|---|---|---|
| `Alt+Ctrl+V` | Dividir ventana · Pegar formato | **Pega formato** |
| `Ctrl+0` | Zoom 100 % · Espacio antes del párrafo | **Zoom 100 %** |
| `Ctrl+W` | Cerrar documento · Quitar formato de párrafo | **Quita formato de párrafo** |
| `Ctrl+1` | Aplicar Título 1 | **Interlineado sencillo** |
| `Ctrl+Mayús+L` | Versalitas · Lista con viñetas | *(sin dirimir)* |

## Fósiles del volcado (aparecen, pero no funcionan aquí)

- `Ctrl+=` para subíndice — usa `Ctrl+Mayús+-`.
- `Ctrl+Mayús+R` para quitar sangría — usa `Ctrl+W`.
- `Ctrl+Mayús+0` para subíndice — no hace nada.
