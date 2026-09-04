# -*- coding: utf-8 -*-
import json, os, base64, random

ICON_DIR = "data/imagenes_iconos"
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))

def topics_of(sec):
    return {t["id"]: t["name"] for s in tax["sections"] if s["id"] == sec for t in s["topics"]}

def datauri(path):
    b = open(path, "rb").read()
    return "data:image/png;base64," + base64.b64encode(b).decode("ascii")

# (archivo, seccion, topic, nombre, ubicacion, atajo|None, funcion)
ICONS = [
# ---------- INICIO ----------
("portapapeles_pegar.png","inicio","portapapeles","Pegar","Inicio ▸ Portapapeles","Ctrl+V","Pega el contenido del Portapapeles en la posición del cursor."),
("portapapeles_copiar.png","inicio","portapapeles","Copiar","Inicio ▸ Portapapeles","Ctrl+C","Copia la selección al Portapapeles sin quitarla del documento."),
("portapapeles_cortar.png","inicio","portapapeles","Cortar","Inicio ▸ Portapapeles","Ctrl+X","Quita la selección del documento y la lleva al Portapapeles."),
("portapapeles_copiar_formato.png","inicio","portapapeles","Copiar formato","Inicio ▸ Portapapeles","Alt+Ctrl+C","El pincel: copia el formato del texto seleccionado para aplicarlo en otro sitio (Alt+Ctrl+V lo pega). Doble clic = varios usos."),
("portapapeles_borrar_todo_formato.png","inicio","fuente","Borrar todo el formato","Inicio ▸ Fuente",None,"Quita todo el formato de la selección y la deja con el del estilo base. (Ctrl+Barra espaciadora quita solo el formato de carácter.)"),
("fuente_negrita.png","inicio","fuente","Negrita","Inicio ▸ Fuente","Ctrl+N","Pone en negrita la selección. En el Word en español es «N», no «B»."),
("fuente_cursiva.png","inicio","fuente","Cursiva","Inicio ▸ Fuente","Ctrl+K","Pone en cursiva la selección. En esta instalación Ctrl+K es Cursiva, no «insertar hipervínculo»."),
("fuente_subrayado.png","inicio","fuente","Subrayado","Inicio ▸ Fuente","Ctrl+S","Subraya la selección. La flecha permite elegir el tipo y el color de subrayado."),
("fuente_tachado.png","inicio","fuente","Tachado","Inicio ▸ Fuente",None,"Traza una línea sobre el texto seleccionado. No tiene atajo directo (se puede activar desde el cuadro Fuente)."),
("fuente_subindice.png","inicio","fuente","Subíndice","Inicio ▸ Fuente","Ctrl+Mayús+-","Baja el texto y lo hace más pequeño (H₂O). El atajo es Ctrl + Mayús + la tecla del guión (= Ctrl+_)."),
("fuente_superindice.png","inicio","fuente","Superíndice","Inicio ▸ Fuente",None,"Sube el texto y lo hace más pequeño (x²). En esta instalación NO tiene atajo de teclado: solo el botón o la casilla del cuadro Fuente."),
("fuente_resaltar.png","inicio","fuente","Color de resaltado del texto","Inicio ▸ Fuente","Alt+Ctrl+H","Marca el texto como con un rotulador fluorescente. Atajo confirmado en vivo (no figura en el volcado)."),
("fuente_color_de_fuente.png","inicio","fuente","Color de fuente","Inicio ▸ Fuente",None,"Cambia el color del texto. La flecha abre la paleta; no tiene atajo directo."),
("fuente_aumentar_tamano_fuente.png","inicio","fuente","Agrandar fuente","Inicio ▸ Fuente","Ctrl+Mayús+>","Sube el tamaño de letra al siguiente valor de la lista. Ctrl+Alt+Mayús+> lo sube de punto en punto."),
("portapapeles_disminuir_tamano_fuente.png","inicio","fuente","Reducir el tamaño de la fuente","Inicio ▸ Fuente","Ctrl+<","Baja el tamaño de letra al valor anterior de la lista. Ctrl+Alt+< lo baja de punto en punto."),
("fuente_cambiar_mayusculas_minusculas.png","inicio","fuente","Cambiar mayúsculas y minúsculas","Inicio ▸ Fuente","Mayús+F3","Rota la selección entre MAYÚSCULAS, minúsculas y Tipo Oración. También ofrece «Poner en mayúsculas cada palabra»."),
("fuente_edicion_texto_y_tipografia.png","inicio","fuente","Efectos de texto y tipografía","Inicio ▸ Fuente",None,"La «A» azul con flecha: aplica sombra, reflejo, iluminado y contorno al texto, además de ligaduras y estilos tipográficos."),
("fuente_fuente.png","inicio","fuente","Fuente (nombre)","Inicio ▸ Fuente",None,"La caja del nombre de fuente. No tiene atajo que la active; Ctrl+M y Ctrl+Mayús+F abren el cuadro de diálogo Fuente con el foco en el nombre, y Ctrl+Mayús+M con el foco en el tamaño."),
("parrafo_alinear_izquierda.png","inicio","parrafo-alineacion","Alinear a la izquierda","Inicio ▸ Párrafo","Ctrl+Q","Alinea el párrafo con el margen izquierdo. En el esquema clásico español es Ctrl+Q (no Ctrl+L)."),
("parrafo_centrar.png","inicio","parrafo-alineacion","Centrar","Inicio ▸ Párrafo","Ctrl+T","Centra el párrafo entre los márgenes. En esta instalación Ctrl+T es Centrar (no «sangría francesa»)."),
("parrafo_alinear_derecha.png","inicio","parrafo-alineacion","Alinear a la derecha","Inicio ▸ Párrafo","Ctrl+D","Alinea el párrafo con el margen derecho. Es Ctrl+D; Ctrl+R no hace nada en esta instalación."),
("parrafo_justificar.png","inicio","parrafo-alineacion","Justificar","Inicio ▸ Párrafo","Ctrl+J","Alinea el texto con los dos márgenes repartiendo el espacio entre palabras."),
("parrafo_vinetas.png","inicio","parrafo-listas","Viñetas","Inicio ▸ Párrafo",None,"Crea una lista con viñetas. La flecha abre la biblioteca de viñetas. (El volcado asigna Ctrl+Mayús+L a esta acción, pero también a «Versalitas»: conflicto sin dirimir.)"),
("parrafo_numeracion.png","inicio","parrafo-listas","Numeración","Inicio ▸ Párrafo",None,"Crea una lista numerada. La flecha permite elegir el formato de número y «Establecer valor de numeración»."),
("parrafo_lista_multinivel.png","inicio","parrafo-listas","Lista multinivel","Inicio ▸ Párrafo",None,"Crea listas con varios niveles de sangría y numeración jerárquica (1, 1.1, 1.1.1…)."),
("parrafo_aumentar_sangria.png","inicio","parrafo-sangria","Aumentar sangría","Inicio ▸ Párrafo","Ctrl+H","Desplaza el párrafo a la siguiente tabulación hacia la derecha. En el esquema clásico español el atajo es Ctrl+H (no «reemplazar»)."),
("parrafo_disminuir_sangria.png","inicio","parrafo-sangria","Disminuir sangría","Inicio ▸ Párrafo",None,"Desplaza el párrafo a la tabulación anterior hacia la izquierda."),
("parrafo_espaciado_entre_lineas_y_parrafos.png","inicio","parrafo-espaciado","Espaciado entre líneas y párrafos","Inicio ▸ Párrafo",None,"El interlineado (1,0 / 1,15 / 1,5 / 2,0…) y «Agregar/Quitar espacio antes o después del párrafo»."),
("parrafo_bordes.png","inicio","parrafo-bordes","Bordes","Inicio ▸ Párrafo",None,"Añade bordes al párrafo o a la celda. La flecha lleva a «Bordes y sombreado…», el mismo cuadro que Diseño ▸ Bordes de página."),
("parrafo_sombreado.png","inicio","parrafo-bordes","Sombreado","Inicio ▸ Párrafo",None,"Aplica un color de fondo al párrafo o a la selección (no a toda la página)."),
("parrafo_ordenar.png","inicio","parrafo-listas","Ordenar","Inicio ▸ Párrafo",None,"Ordena alfabética o numéricamente las líneas, los párrafos o las filas de una tabla seleccionados."),
("parrafo_mostrar_todo.png","inicio","parrafo-marcas","Mostrar todo","Inicio ▸ Párrafo","Ctrl+Mayús+8","Muestra u oculta las marcas de párrafo (¶), tabulaciones y espacios. En el teclado español la combinación es también Ctrl+( (Mayús+8 = «(»)."),
("edicion_buscar.png","inicio","edicion","Buscar","Inicio ▸ Edición","Ctrl+B","Abre el panel de Navegación con el cuadro de búsqueda dentro del documento (pestañas Títulos / Páginas / Resultados)."),
("edicion_reemplazar.png","inicio","edicion","Reemplazar","Inicio ▸ Edición","Ctrl+L","Abre el cuadro «Buscar y reemplazar» en la ficha Reemplazar. En esta instalación el atajo es Ctrl+L."),
("edicion_seleccionar.png","inicio","edicion","Seleccionar","Inicio ▸ Edición",None,"Menú: Seleccionar todo (Ctrl+E), Seleccionar objetos, Seleccionar texto con formato similar y Panel de selección."),
("voz_dictar.png","inicio","voz","Dictar","Inicio ▸ Voz","Alt+[","Convierte tu voz en texto. Abre una barra flotante con el micrófono."),
("editor_editor.png","inicio","complementos","Editor","Inicio ▸ Editor","F7","Abre el panel Editor con la revisión de ortografía, gramática y estilo. También Windows+F7."),
("iniciador_cuadro_dialogo.png","inicio","fuente","Iniciador de cuadro de diálogo","esquina inferior derecha de un grupo de la cinta",None,"La flechita ↘ que abre el cuadro de diálogo completo de ese grupo (Fuente, Párrafo, Portapapeles…) con todas las opciones que no caben en la cinta."),
# ---------- DISEÑO ----------
("formato_del_documento_temas.png","diseno","formato-documento","Temas","Diseño ▸ Formato del documento",None,"Aplica de golpe un conjunto de colores + fuentes + efectos. Es el primer comando de la pestaña."),
("formato_del_documento_colores.png","diseno","formato-documento","Colores","Diseño ▸ Formato del documento",None,"Cambia solo la combinación de colores del tema (texto/fondo, énfasis, hipervínculos), sin tocar las fuentes."),
("formato_del_documento_fuentes.png","diseno","formato-documento","Fuentes","Diseño ▸ Formato del documento",None,"Cambia solo el par de fuentes del tema (una para títulos, otra para el cuerpo)."),
("formato_del_documento_efectos.png","diseno","formato-documento","Efectos","Diseño ▸ Formato del documento",None,"Cambia el acabado de rellenos, líneas y sombras de las formas y los SmartArt (no del texto)."),
("formato_del_documento_espacio_entre_parrafos.png","diseno","formato-documento","Espaciado entre párrafos","Diseño ▸ Formato del documento",None,"Aplica a todo el documento un conjunto de espaciado (Sin espacio, Compacto, Estrecho, Abierto, Moderado, Doble)."),
("formato_del_documento_establecer_como_predeterminada.png","diseno","formato-documento","Establecer como predeterminada","Diseño ▸ Formato del documento",None,"Guarda el tema, los colores, las fuentes y el espaciado actuales como predeterminados de la plantilla."),
("formato_del_documento_titulos.png","diseno","formato-documento","Conjunto de estilos","Diseño ▸ Formato del documento",None,"La galería grande del centro: redefine el aspecto de todos los estilos (Título 1-9, Normal…) con vista previa en vivo."),
("fondo_de_pagina_marca_de_agua.png","diseno","fondo-pagina","Marca de agua","Diseño ▸ Fondo de página",None,"Pone un texto o una imagen semitransparente detrás del contenido (CONFIDENCIAL, BORRADOR…). Se repite en todas las páginas."),
("fondo_de_pagina_color_de_pagina.png","diseno","fondo-pagina","Color de página","Diseño ▸ Fondo de página",None,"Pone un color o efecto de relleno de fondo a la página. Por defecto NO se imprime."),
("formato_del_documento_bordes_de_pagina.png","diseno","fondo-pagina","Bordes de página","Diseño ▸ Fondo de página",None,"Abre «Bordes y sombreado» en la ficha «Borde de página» (Valor: Ninguno/Cuadro/Sombra/3D/Personalizado; desplegable Arte)."),
# ---------- DISPOSICIÓN ----------
("configurar_pagina_margenes.png","disposicion","configurar-pagina","Márgenes","Disposición ▸ Configurar página",None,"Galería de preajustes: Normal (2,5/3), Estrecho (1,27), Moderado, Ancho, Reflejado y «Márgenes personalizados…»."),
("configurar_pagina_orientacion.png","disposicion","configurar-pagina","Orientación","Disposición ▸ Configurar página",None,"Cambia la página entre Vertical y Horizontal."),
("configurar_pagina_tamaño.png","disposicion","configurar-pagina","Tamaño","Disposición ▸ Configurar página",None,"Elige el tamaño de papel (A4 21×29,7, Carta 21,59×27,94, Oficio…). «Más tamaños de papel…» abre la ficha Papel de Configurar página."),
("configurar_pagina_columnas.png","disposicion","configurar-pagina","Columnas","Disposición ▸ Configurar página",None,"Divide el texto en columnas: Una, Dos, Tres, Izquierda, Derecha o «Más columnas…»."),
("configurar_pagina_saltos.png","disposicion","configurar-pagina","Saltos","Disposición ▸ Configurar página",None,"Inserta saltos de página (Página, Columna, Ajuste del texto) y de sección (Página siguiente, Continua, Página par, Página impar)."),
("configurar_pagina_numeros_de_linea.png","disposicion","configurar-pagina","Números de línea","Disposición ▸ Configurar página",None,"Numera las líneas del documento: Continua, Reiniciar en cada página, Reiniciar en cada sección, Suprimir del párrafo actual."),
("configurar_pagina_guiones.png","disposicion","configurar-pagina","Guiones","Disposición ▸ Configurar página",None,"Activa la división de palabras al final de línea: Ninguno, Automáticos o Manuales."),
("configurar_pagina_iniciador_cuadro_dialogo.png","disposicion","configurar-pagina","Iniciador del grupo Configurar página","Disposición ▸ Configurar página (esquina)",None,"Abre el cuadro «Configurar página» en la ficha Disposición (el mismo que el enlace «Configurar página» del panel Imprimir)."),
("organizar_posicion.png","disposicion","organizar","Posición","Disposición ▸ Organizar",None,"Coloca el objeto flotante en una de nueve posiciones fijas de la página con ajuste de texto cuadrado."),
("organizar_ajustar_texto.png","disposicion","organizar","Ajustar texto","Disposición ▸ Organizar",None,"Define cómo fluye el texto alrededor del objeto: En línea, Cuadrado, Estrecho, Transparente, Arriba y abajo, Detrás/Delante del texto."),
("organizar_traer_adelante.png","disposicion","organizar","Traer adelante","Disposición ▸ Organizar",None,"Sube el objeto un nivel en la pila de objetos superpuestos. La flecha añade «Traer al frente»."),
("organizar_enviar_atras.png","disposicion","organizar","Enviar atrás","Disposición ▸ Organizar",None,"Baja el objeto un nivel en la pila. La flecha añade «Enviar al fondo» y «Enviar detrás del texto»."),
("organizar_panel_de_seleccion.png","disposicion","organizar","Panel de selección","Disposición ▸ Organizar",None,"Abre un panel con la lista de todos los objetos de la página para mostrarlos, ocultarlos, renombrarlos y reordenarlos."),
("organizar_alinear.png","disposicion","organizar","Alinear","Disposición ▸ Organizar",None,"Alinea y distribuye varios objetos. «Alinear verticalmente» = centrar en horizontal; «Alinear al medio» = centrar en vertical."),
("organizar_agrupar.png","disposicion","organizar","Agrupar","Disposición ▸ Organizar",None,"Combina varios objetos seleccionados en uno solo que se mueve y redimensiona a la vez."),
("organizar_girar.png","disposicion","organizar","Girar","Disposición ▸ Organizar",None,"Gira 90° a cada lado, voltea en horizontal o vertical, o abre «Más opciones de giro…» para un ángulo exacto."),
# ---------- INSERTAR ----------
("paginas_portada.png","insertar","paginas","Portada","Insertar ▸ Páginas",None,"Inserta una portada con diseño. Siempre va a la página 1, esté donde esté el cursor, y reemplaza la anterior si ya había una."),
("paginas_pagina_en_blanco.png","insertar","paginas","Página en blanco","Insertar ▸ Páginas",None,"Inserta una página vacía en la posición del cursor (dos saltos de página)."),
("paginas_salto_de_pagina.png","insertar","paginas","Salto de página","Insertar ▸ Páginas","Ctrl+Entrar","Fuerza que el texto siguiente empiece en la página siguiente, sin crear una sección nueva."),
("tablas_tabla.png","insertar","tablas","Tabla","Insertar ▸ Tablas",None,"Inserta una tabla (cuadrícula, «Insertar tabla…» con 5 columnas / 2 filas por defecto, Dibujar tabla, Hoja de cálculo de Excel, Tablas rápidas)."),
("ilustraciones_imagenes.png","insertar","ilustraciones","Imágenes","Insertar ▸ Ilustraciones",None,"Inserta una imagen desde «Este dispositivo», «Imágenes de archivo» (stock) o «Imágenes en línea» (Bing)."),
("ilustraciones_formas.png","insertar","ilustraciones","Formas","Insertar ▸ Ilustraciones",None,"Galería de formas: Líneas, Rectángulos, Formas básicas, Flechas de bloque, Diagrama de flujo, Llamadas, Cintas y estrellas, + «Nuevo lienzo de dibujo»."),
("ilustraciones_iconos.png","insertar","ilustraciones","Iconos","Insertar ▸ Ilustraciones",None,"Inserta iconos vectoriales (SVG) de una biblioteca clasificada por temas; se pueden recolorear y convertir en formas."),
("ilustraciones_modelos_3d.png","insertar","ilustraciones","Modelos 3D","Insertar ▸ Ilustraciones",None,"Inserta un modelo tridimensional (de archivo o de la galería en línea) que se puede rotar en cualquier eje."),
("ilustraciones_smartart.png","insertar","ilustraciones","SmartArt","Insertar ▸ Ilustraciones",None,"Inserta un diagrama (Lista, Proceso, Ciclo, Jerarquía, Relación, Matriz, Pirámide…) que convierte texto en un gráfico."),
("ilustraciones_grafico.png","insertar","ilustraciones","Gráfico","Insertar ▸ Ilustraciones",None,"Inserta un gráfico (Columnas, Líneas, Circular, Barras, Áreas, Cascada, Embudo, Cotizaciones…) con una mini hoja de datos de Excel."),
("ilustraciones_captura.png","insertar","ilustraciones","Captura","Insertar ▸ Ilustraciones",None,"Inserta una imagen de otra ventana abierta, o «Recorte de pantalla» para capturar una zona."),
("multimedia_videos_en_linea.png","insertar","multimedia","Vídeos en línea","Insertar ▸ Multimedia",None,"Inserta un vídeo desde una URL (YouTube, SlideShare, Vimeo, TED) que se reproduce dentro del documento."),
("vinculos_vinculo.png","insertar","vinculos","Vínculo","Insertar ▸ Vínculos","Alt+Ctrl+K","Inserta un hipervínculo a una página web, a un archivo, a un lugar del documento o a una dirección de correo. Aquí el atajo es Alt+Ctrl+K (Ctrl+K es Cursiva)."),
("vinculos_marcador.png","insertar","vinculos","Marcador","Insertar ▸ Vínculos",None,"Crea un punto con nombre en el documento al que se puede saltar o hacer referencia. Se ordena por Nombre o por Posición."),
("vinculos_referencia_cruzada.png","insertar","vinculos","Referencia cruzada","Insertar ▸ Vínculos",None,"Inserta una referencia a otro elemento (título, marcador, nota, ilustración, tabla, ecuación) que se actualiza sola. Mismo cuadro que Referencias ▸ Títulos ▸ Referencia cruzada."),
("comentarios_comentario.png","insertar","comentarios","Comentario nuevo","Insertar ▸ Comentarios","Alt+Ctrl+A","Añade un comentario anclado a la selección, en el margen o en el panel de comentarios."),
("encabezado_y_pie_de_pagina_encabezado.png","insertar","encabezado-pie","Encabezado","Insertar ▸ Encabezado y pie de página",None,"Inserta o edita el área superior que se repite en todas las páginas. Abre la cinta contextual «Encabezado y pie de página»."),
("encabezado_y_pie_de_pagina_pie_de_pagina.png","insertar","encabezado-pie","Pie de página","Insertar ▸ Encabezado y pie de página",None,"Inserta o edita el área inferior que se repite en todas las páginas."),
("encabezado_y_pie_de_pagina_numero_de_pagina.png","insertar","encabezado-pie","Número de página","Insertar ▸ Encabezado y pie de página",None,"Inserta la numeración automática (Principio de página, Final de página, Márgenes, Posición actual) y «Formato del número de página…»."),
("texto_cuadro_de_texto.png","insertar","texto","Cuadro de texto","Insertar ▸ Texto",None,"Inserta un cuadro con texto que se puede colocar libremente. Ofrece cuadros integrados y «Dibujar un cuadro de texto»."),
("texto_wordart.png","insertar","texto","WordArt","Insertar ▸ Texto",None,"Inserta texto decorativo con estilos de relleno, contorno y efectos."),
("texto_letra_capital.png","insertar","texto","Letra capital","Insertar ▸ Texto",None,"Agranda la primera letra del párrafo ocupando varias líneas (por defecto 3): «En texto» o «En margen»."),
("texto_elementos_rapidos.png","insertar","texto","Elementos rápidos","Insertar ▸ Texto",None,"Inserta bloques de creación reutilizables: Autotexto, Propiedad del documento, Campo… y el «Organizador de bloques de creación»."),
("texto_fecha_y_hora.png","insertar","texto","Fecha y hora","Insertar ▸ Texto",None,"Inserta la fecha o la hora en varios formatos, con opción de «Actualizar automáticamente» (como campo)."),
("texto_objeto.png","insertar","texto","Objeto","Insertar ▸ Texto",None,"Inserta un objeto incrustado o vinculado (Crear nuevo / Crear desde un archivo). La flecha añade «Insertar texto de archivo…», que incorpora el contenido como texto."),
("texto_linea_de_firma.png","insertar","texto","Línea de firma","Insertar ▸ Texto",None,"Inserta una línea de firma de Microsoft Office con el nombre y el puesto del firmante. Distinta de eSignature."),
("simbolos_ecuacion.png","insertar","simbolos","Ecuación","Insertar ▸ Símbolos",None,"Inserta una ecuación (integradas: Área del círculo, Fórmula cuadrática, Expansión Taylor…) y abre la cinta contextual Ecuación."),
("simbolos_simbolos.png","insertar","simbolos","Símbolo","Insertar ▸ Símbolos",None,"Inserta caracteres que no están en el teclado (€, ©, ½, letras griegas…). «Más símbolos…» abre el cuadro con las fichas Símbolos y Caracteres especiales."),
("esignatura_campos_de_esignatura.png","insertar","esignature","Campos de eSignature","Insertar ▸ eSignature",None,"Crea una solicitud de firma electrónica. Exige que el documento esté guardado en .docx."),
]

# --- pools de distractores ---
random.seed(20260904)
by_sec = {}
for e in ICONS:
    by_sec.setdefault(e[1], []).append(e)
UBIC_POOL = sorted(set(e[4] for e in ICONS if "▸" in e[4]))
ATAJO_POOL = ["Ctrl+N","Ctrl+K","Ctrl+S","Ctrl+Q","Ctrl+T","Ctrl+D","Ctrl+J","Ctrl+C","Ctrl+X","Ctrl+V",
              "Ctrl+E","Ctrl+B","Ctrl+L","Ctrl+H","Ctrl+G","Alt+Ctrl+C","Alt+Ctrl+V","Alt+Ctrl+K","Alt+Ctrl+A",
              "Alt+Ctrl+H","Ctrl+Mayús+>","Ctrl+<","Ctrl+Mayús+-","Ctrl+Mayús+8","Mayús+F3","Alt+[","F7","Ctrl+Entrar","Alt+="]

def pick(pool, correct, n=3):
    opts = [x for x in pool if x != correct]
    random.shuffle(opts)
    return opts[:n]

rows_by_sec = {}
for idx, (fn, sec, topic, name, ubic, atajo, func) in enumerate(ICONS):
    path = os.path.join(ICON_DIR, sec, fn)
    if not os.path.isfile(path):
        print("FALTA", path); continue
    uri = datauri(path)
    tnames = topics_of(sec)
    # elegir stem
    stems = [0, 1]
    if atajo: stems.append(2)
    stem = stems[idx % len(stems)]
    if stem == 0:
        enun = "Observa el icono de la imagen. ¿Qué comando de Word representa?"
        correct = name
        others = pick([e[3] for e in ICONS if e[1] == sec], name)
        opciones = others + [correct]
        cat = "concepto"
    elif stem == 1:
        enun = "El comando del icono de la imagen, ¿en qué pestaña y grupo de la cinta se encuentra?"
        correct = ubic
        others = pick(UBIC_POOL, ubic)
        opciones = others + [correct]
        cat = "ruta"
    else:
        enun = "¿Cuál es el atajo de teclado del comando que muestra el icono de la imagen?"
        correct = atajo
        others = pick(ATAJO_POOL, atajo)
        opciones = others + [correct]
        cat = "atajo"
    random.shuffle(opciones)
    letters = ["A","B","C","D"]
    resp = letters[opciones.index(correct)]
    expl = "**%s.** Pestaña %s. Atajo: %s. %s" % (
        name, ubic, (atajo if atajo else "no tiene atajo de teclado en esta instalación"), func)
    rows_by_sec.setdefault(sec, []).append({
        "topic": topic, "tema": tnames[topic], "categoria": cat,
        "enunciado": enun, "imagen": uri,
        "opciones": [{"letter": letters[i], "text": t} for i, t in enumerate(opciones)],
        "respuesta": resp, "explicacion": expl, "src": fn,
    })

TO = {}
for sec in rows_by_sec:
    TO[sec] = {t["id"]: i for s in tax["sections"] if s["id"] == sec for i, t in enumerate(s["topics"])}

total = 0
for sec, rows in rows_by_sec.items():
    f = "data/questions/%s.json" % sec
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, r in enumerate(rows, 1):
        d.append({
            "id": "%s-%d" % (sec, n0 + k), "sourceFile": "%s.json" % sec,
            "bloque": "%s — %s (icono)" % (sec.capitalize(), r["tema"]),
            "tipo": "opcion_unica", "categoria": r["categoria"], "negativa": False,
            "section": sec, "topic": r["topic"], "subtopic": None, "tema": r["tema"],
            "sourceQuestionId": "img-%s-%02d" % (sec, k), "generado": True,
            "enunciado": r["enunciado"], "imagen": r["imagen"],
            "opciones": r["opciones"], "matching": None,
            "respuesta": r["respuesta"], "explicacion": r["explicacion"],
        })
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print("%s: +%d preguntas con imagen" % (f, len(rows)))
print("TOTAL", total)
