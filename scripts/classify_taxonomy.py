#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Reclasifica el banco heredado (952 preguntas, sourceFiles 1.txt..8.txt y
ATAJOS.docx) en la taxonomía section/topic/subtopic de data/taxonomy.json.
NO toca vista.json (ya clasificado en la migración anterior) ni ningún
otro campo de las preguntas -- solo añade/sustituye section/topic/subtopic.

Basado en un análisis de contenido real hecho a mano (muestreo de cada
sourceFile/bloque/tema) antes de escribir este script -- no es una
heurística a ciegas. Ver commit para el detalle de qué se encontró en
cada fichero.

Uso:
    python3 scripts/classify_taxonomy.py --dry-run   # solo informe
    python3 scripts/classify_taxonomy.py              # aplica y escribe
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(HERE, "data", "questions")

# --- excepciones puntuales detectadas por lectura directa (IDs concretos
#     dentro de sourceFiles que son mayoritariamente de otro tema) ---
ID_OVERRIDES = {
    "3-11": ("archivo", "compartir", "OneDrive"),
    "3-12": ("archivo", "compartir", "OneDrive"),
    "3-32": ("archivo", "compartir", "Coautoría en tiempo real"),
    "3-34": ("inicio", "parrafo", None),
    "1-48": ("inicio", "edicion", "Buscar y reemplazar"),
}

# --- reglas para sourceFiles 1.txt..7.txt (contenido de Interfaz,
#     verificado por muestreo: ningún bloque es puramente de una sola
#     pestaña salvo pocas excepciones ya cubiertas en ID_OVERRIDES) ---
INTERFAZ_RULES = [
    # -- excepciones que en realidad son de otra sección, detectadas por
    #    lectura directa dentro de ficheros mayoritariamente de Interfaz --
    (r"vista predeterminada|combinaci[oó]n de teclas activa la vista|vista .*est[aá] configurada como predeterminada|leer un documento sin distracciones|volver a la vista predeterminada|relacione cada vista con su caracter[ií]stica|atajo de teclado est[aá] asociado a la vista",
     ("vista", "vistas", None)),
    (r"reemplazar una palabra por otra en todo el documento|herramienta permite reemplazar",
     ("inicio", "edicion", "Buscar y reemplazar")),
    (r"registrarse para compartir|nombre del servicio de almacenamiento en la nube|qu[eé] permite hacer onedrive",
     ("archivo", "compartir", "OneDrive")),
    # -- Interfaz propiamente dicho --
    (r"extensi[oó]n|\.docx|\.docm|\.dotx|\.dotm|\bxml\b|nombre.*archivo|archivo.*nombre|car[aá]cter.*(prohibid|permit)|plantilla|\btemplate\b|\.doc\b",
     ("interfaz", "documentos-archivos", None)),
    (r"procesador de texto|funci[oó]n(es)? (b[aá]sicas?|de edici[oó]n|de dise[nñ]o|avanzadas?|gr[aá]ficas?)|grupo de funciones|justificaci[oó]n del texto, el tipo de letra y el color|inclusi[oó]n de gr[aá]ficos, formas geom[eé]tricas y tablas|se clasifican dentro de",
     ("interfaz", "conceptos-generales", None)),
    (r"panel .?mostrar formato.?|\bmay ?\+ ?f1\b|mostrar el formato del texto|qu[eé] fuente e interlineado tiene",
     ("interfaz", "buscador", "Mostrar formato")),
    (r"establecer una sangr[ií]a|colocar los m[aá]rgenes", ("interfaz", "regla", None)),
    (r"desplegable que permite elegir las herramientas.*(usar|utilizar)|elemento.*personalizable\??$",
     ("interfaz", "acceso-rapido", None)),
    (r"debajo de la cinta de opciones|medir y alinear texto", ("interfaz", "regla", None)),
    (r"reglas disponibles.*vista de impresi[oó]n|reglas se citan en el texto", ("interfaz", "regla", None)),
    (r"nombre del documento (actual|y del programa)|elemento.*(indica|muestra).*nombre del documento|parte m[aá]s importante de la ventana|men[uú] de control de la ventana|restaurar o maximizar el tama[nñ]o de la ventana|\balt ?\+ ?f4\b|cerrar la ventana de word|maximiza.*restaura la ventana|reubicar la ventana|componentes b[aá]sicos de la cinta|sin[oó]nimo.*(ficha|grupo)\"?|orden jer[aá]rquico.*(componentes|cinta)|afirmaci[oó]n.*cinta de opciones.*verdadera|agrupa varios comandos relacionados|unidad b[aá]sica de acci[oó]n|se activa al seleccionar (una imagen|un elemento) insertad|pasa el rat[oó]n por encima de un texto seleccionado|qu[eé] es la minibarra|opciones aparecen en la minibarra|agrupa los botones minimizar|parte superior izquierda|contiene las pesta[nñ]as inicio, insertar|no usar el rat[oó]n en esta ocasi[oó]n|parte superior.*just(o|a).*(izquierda|derecha)|situado en la parte superior derecha|relacione cada elemento de la interfaz|relacione cada modo con su caracter[ií]stica|modos de uso de la cinta|diferencias mouse/?t[aá]ctil|agrupa las pesta[nñ]as inicio, insertar|elementos principales|esquema de.*elementos|etiquetado en la imagen|dificultades de visi[oó]n|pantalla t[aá]ctil|autom[aá]ticamente.*ficha( contextual)?",
     ("interfaz", "ventana-cinta", None)),
    (r"barra de t[ií]tulo|bot[oó]n(es)? de control|s[ií]mbolo de word|modo (mouse|t[aá]ctil)|ficha(s)? contextual|tipo de ficha|minibarra",
     ("interfaz", "ventana-cinta", None)),
    (r"buscar informaci[oó]n|\balt ?\+ ?q\b|abre la b[uú]squeda",
     ("interfaz", "buscador", None)),
    (r"modo de acceso (por )?teclado|iniciador de (cuadro de )?di[aá]logo|men[uú] contextual de (la |una )?pesta[nñ]a|opciones de visualizaci[oó]n de la cinta|pantalla completa|ocultar (la )?cinta|mostrar solo pesta[nñ]as|tecla f1|funci[oó]n f1|abre la (funci[oó]n de )?ayuda|tecla que activa la ayuda|comandos de la cinta|opci[oó]n de visualizaci[oó]n|bot[oó]n de visualizaci[oó]n|\bctrl ?\+ ?f1\b|mostrar solo|ocultando la cinta|reducir la visibilidad de la cinta|elementos de la interfaz excepto|distracciones|acceder a las pesta[nñ]as pero no|cuadro de di[aá]logo con m[aá]s opciones|navegar por las pesta[nñ]as y comandos usando el teclado|icono en la esquina del grupo|s[ií]mbolo de flecha en la esquina|tecla o combinaci[oó]n muestra recuadros con teclas|acceder a m[aá]s opciones de un grupo",
     ("interfaz", "acceso-teclado-ayuda", None)),
    (r"acceso r[aá]pido", ("interfaz", "acceso-rapido", None)),
    (r"modo de escritura.*insertar.*sobrescribir|insertar.*sobrescribir.*nombre t[eé]cnico|diferencia entre el modo .insertar. y el modo .sobrescribir|p[aá]ginas, palabras, caracteres.*p[aá]rrafos, l[ií]neas|icono con forma de libro y una x|panel de ______|caracteres tiene su documento incluyendo|escribe en medio de un p[aá]rrafo y observa que el texto existente se va borrando|caracteres con espacios tiene el documento|n[uú]mero de l[ií]nea|muestra el estado|relacione cada elemento del men[uú] con su valor|informaci[oó]n del documento, como el n[uú]mero de p[aá]|se sit[uú]an en la parte inferior de la ventana",
     ("interfaz", "barra-estado", None)),
    (r"barra de estado|contar palabras|modo sobrescribir|modo insertar|personalizar barra de estado|tecla insert",
     ("interfaz", "barra-estado", None)),
    (r"\bzoom\b|control deslizante|parte inferior derecha.*(dos elementos|elementos)|esquina inferior derecha",
     ("interfaz", "zoom", None)),
    (r"[aá]rea de vistas|permite alternar entre las diferentes vistas|permite cambiar la vista del documento|cambiar entre distintas vistas|cambiar entre .modo lectura",
     ("interfaz", "area-vistas", None)),
    (r"\breglas?\b|tabulaci[oó]n", ("interfaz", "regla", None)),
    (r"buscador|acciones sugeridas|acciones usadas recientemente|cuadro de b[uú]squeda",
     ("interfaz", "buscador", None)),
    (r"desplazarse verticalmente|lateral derecho.*desplazar|extremo derecho.*desplazar|[aá]rea de trabajo|zona de edici[oó]n|zona donde escribiremos|saber exactamente d[oó]nde se insertar[aá] el texto|cambia de forma seg[uú]n la zona|indica el movimiento del rat[oó]n|en qu[eé] parte del documento estamos posicionados",
     ("interfaz", "cursor-navegacion", None)),
    (r"puntero|\bcursor\b|barra(s)? de desplazamiento", ("interfaz", "cursor-navegacion", None)),
    (r"deshacer|rehacer|se arrepiente y quiere|lo borra accidentalmente", ("interfaz", "deshacer-rehacer", None)),
]

# Reserva por bloque: cuando ninguna regla anterior coincide (preguntas
# genéricas del tipo "señale la afirmación que NO es correcta", sin
# palabra clave propia), se usa el tema dominante de ese bloque
# concreto, verificado por lectura directa del bloque completo.
BLOQUE_FALLBACK = {
    ("1.json","1"): ("interfaz","conceptos-generales",None), ("1.json","2"): ("interfaz","documentos-archivos",None),
    ("1.json","3"): ("interfaz","conceptos-generales",None), ("1.json","4"): ("interfaz","documentos-archivos",None),
    ("1.json","5"): ("interfaz","conceptos-generales",None), ("1.json","6"): ("interfaz","conceptos-generales",None),
    ("1.json","7"): ("interfaz","documentos-archivos",None), ("1.json","8"): ("interfaz","documentos-archivos",None),
    ("1.json","9"): ("interfaz","barra-estado",None), ("1.json","10"): ("interfaz","zoom",None),
    ("2.json","1"): ("interfaz","ventana-cinta",None), ("2.json","2"): ("interfaz","ventana-cinta",None),
    ("2.json","3"): ("interfaz","ventana-cinta",None), ("2.json","4"): ("interfaz","ventana-cinta",None),
    ("2.json","5"): ("interfaz","ventana-cinta",None), ("2.json","6"): ("interfaz","ventana-cinta",None),
    ("2.json","7"): ("interfaz","ventana-cinta",None),
    ("3.json","1"): ("interfaz","deshacer-rehacer",None), ("3.json","2"): ("interfaz","ventana-cinta",None),
    ("3.json","3"): ("interfaz","ventana-cinta",None), ("3.json","4"): ("interfaz","ventana-cinta",None),
    ("3.json","5"): ("interfaz","acceso-rapido",None), ("3.json","6"): ("interfaz","ventana-cinta",None),
    ("3.json","7"): ("interfaz","ventana-cinta",None), ("3.json","8"): ("interfaz","ventana-cinta",None),
    ("4.json","1"): ("interfaz","acceso-teclado-ayuda",None), ("4.json","2"): ("interfaz","acceso-teclado-ayuda",None),
    ("4.json","3"): ("interfaz","acceso-teclado-ayuda",None), ("4.json","4"): ("interfaz","acceso-teclado-ayuda",None),
    ("4.json","5"): ("interfaz","acceso-teclado-ayuda",None), ("4.json","6"): ("interfaz","acceso-teclado-ayuda",None),
    ("4.json","7"): ("interfaz","acceso-teclado-ayuda",None), ("4.json","8"): ("interfaz","acceso-teclado-ayuda",None),
    ("5.json","1"): ("interfaz","regla",None), ("5.json","2"): ("interfaz","buscador",None),
    ("5.json","3"): ("interfaz","buscador",None), ("5.json","4"): ("interfaz","regla",None),
    ("5.json","5"): ("interfaz","buscador",None), ("5.json","6"): ("interfaz","cursor-navegacion",None),
    ("6.json","1"): ("interfaz","cursor-navegacion",None), ("6.json","2"): ("interfaz","barra-estado",None),
    ("6.json","3"): ("interfaz","barra-estado",None), ("6.json","4"): ("interfaz","barra-estado",None),
    ("6.json","5"): ("interfaz","barra-estado",None),
    ("7.json","1"): ("interfaz","barra-estado",None), ("7.json","2"): ("interfaz","area-vistas",None),
    ("7.json","3"): ("interfaz","area-vistas",None), ("7.json","4"): ("interfaz","barra-estado",None),
    ("7.json","5"): ("interfaz","area-vistas",None),
}

# --- 8.txt: temas nombrados en mayúsculas -> pantallas de Archivo/Backstage ---
TEMA_TO_TOPIC = {
    "VISTA BACKSTAGE Y PANEL IZQUIERDO": ("archivo", "backstage", None),
    "NUEVO DOCUMENTO": ("archivo", "nuevo", None),
    "ABRIR ARCHIVO": ("archivo", "abrir", None),
    "RECIENTES, ANCLAR Y QUITAR": ("archivo", "abrir", "Recientes, anclar y quitar"),
    "OPCIONES DEL BOTÓN ABRIR": ("archivo", "abrir", "Opciones del botón Abrir"),
    "RECUPERACIÓN DE DOCUMENTOS": ("archivo", "abrir", "Recuperación de documentos"),
    "FICHA INFORMACIÓN Y PROPIEDADES": ("archivo", "informacion", "Propiedades"),
    "PROTEGER DOCUMENTO": ("archivo", "informacion", "Proteger documento"),
    "COMPROBAR SI HAY PROBLEMAS": ("archivo", "informacion", "Comprobar si hay problemas"),
    "ADMINISTRAR DOCUMENTO": ("archivo", "informacion", "Administrar documento"),
    "GUARDAR Y GUARDAR COMO": ("archivo", "guardar", None),
    "AUTORRECUPERACIÓN": ("archivo", "guardar", "Autorrecuperación"),
    "IMPRIMIR": ("archivo", "imprimir", None),
    "COMPARTIR": ("archivo", "compartir", None),
    "EXPORTAR": ("archivo", "exportar", None),
    "TRANSFORMAR": ("archivo", "exportar", "Transformar a PDF/XPS"),
    "CERRAR Y MODO COMPATIBILIDAD": ("archivo", "cerrar", None),
    "CUENTA Y COMENTARIOS": ("archivo", "cuenta", None),
    "OPCIONES GENERALES": ("archivo", "opciones", "General"),
    "OPCIONES DE PRESENTACIÓN": ("archivo", "opciones", "Presentación"),
    "OPCIONES DE REVISIÓN": ("archivo", "opciones", "Revisión"),
    "OPCIONES DE GUARDAR": ("archivo", "opciones", "Guardar"),
    "OPCIONES DE IDIOMA": ("archivo", "opciones", "Idioma"),
    "OPCIONES DE ACCESIBILIDAD": ("archivo", "opciones", "Accesibilidad"),
    "OPCIONES AVANZADAS – EDICIÓN": ("archivo", "opciones", "Avanzadas — Edición"),
    "OPCIONES AVANZADAS – MOSTRAR CONTENIDO": ("archivo", "opciones", "Avanzadas — Mostrar contenido"),
    "OPCIONES AVANZADAS – PANTALLA": ("archivo", "opciones", "Avanzadas — Pantalla"),
    "OPCIONES AVANZADAS – IMPRESIÓN": ("archivo", "opciones", "Avanzadas — Impresión"),
    "OPCIONES AVANZADAS – GENERAL": ("archivo", "opciones", "Avanzadas — General"),
    "PERSONALIZAR CINTA Y ACCESO RÁPIDO": ("archivo", "opciones", "Personalizar cinta y acceso rápido"),
    "COMPLEMENTOS Y CENTRO DE CONFIANZA": ("archivo", "opciones", "Complementos y centro de confianza"),
    "VOLVER AL DOCUMENTO": ("archivo", "backstage", None),
}

# --- preguntas de un atajo individual: 8.txt "PREGUNTAS DE SÍNTESIS Y
#     CONFUSIÓN ALTA" + "ATAJOS CRUZADOS" (270) + ATAJOS.docx (38).
#     Verificado por lectura completa: son casi todas "¿qué atajo hace X?"
#     pese al nombre de los temas -- no son preguntas multi-tema de verdad. ---
ATAJO_RULES = [
    # Vista (comprobar antes que Inicio para no confundir "vista normal" con "estilo normal")
    (r"vista esquema|nivel de esquema|sube un elemento en la vista esquema|baja un elemento en la vista esquema|expande un t[ií]tulo|contrae un t[ií]tulo|disminuye el nivel de esquema|promueve un t[ií]tulo|muestra (la primera l[ií]nea|todos los t[ií]tulos|los t[ií]tulos hasta el nivel)|maestro.*subdocumento|activa la vista normal|vista normal del documento",
     ("vista", "vistas", None)),
    (r"divide la ventana|ventana siguiente|ventana anterior|panel siguiente|panel anterior|maximiza la ventana|restaura (el tama[nñ]o|la ventana)|tama[nñ]o de la ventana|explorador de objetos|examina el objeto siguiente|examen anterior|va al nivel de objeto|restaura el documento a su tama[nñ]o",
     ("vista", "ventana", None)),
    (r"muestra u oculta la cinta", ("interfaz", "acceso-teclado-ayuda", None)),
    (r"editor de (c[oó]digo )?visual basic|c[oó]digo vba|di[aá]logo de macros|ejecuta.*macros",
     ("vista", "macros", "Visual Basic (VBE)")),
    (r"aleja el zoom|acerca el zoom", ("vista", "zoom", None)),

    # Archivo
    (r"cierra la aplicaci[oó]n word|guardar como|abre un archivo existente|informaci[oó]n del sistema de microsoft|personalizaci[oó]n de m[eé]todos abreviados|guarda(r)?.*macro|extensi[oó]n.*plantilla|extensi[oó]n.*macro|formato de guardado|marcar como final|inspeccionar documento|comprobar compatibilidad|tipos de archivo del cuadro guardar|imprimir solo las p[aá]ginas",
     ("archivo", "guardar", None)),
    (r"^¿qu[eé] atajo ejecuta.*guardar|guarda el documento activo", ("archivo", "guardar", None)),

    # Correspondencia
    (r"combina(r)? la correspondencia|combinaci[oó]n de correspondencia|edita el origen de datos de combinaci[oó]n|campo de combinaci[oó]n",
     ("correspondencia", "campos-combinacion", None)),

    # Referencias
    (r"nota al pie|nota al final|marca(r)? una entrada de [ií]ndice|marca(r)? un elemento para la tabla de contenido|cita para la tabla de autoridades|b[uú]squeda en referencia|actualiza el origen vinculado",
     ("referencias", "notas", None)),

    # Revisar
    (r"revisi[oó]n ortogr[aá]fica|diccionario de sin[oó]nimos|revisar ortograf[ií]a y gram[aá]tica|error ortogr[aá]fico|seguimiento de cambios|marcas de revisi[oó]n|lectura en voz alta|traduc",
     ("revisar", "revision-ortografica", None)),

    # Insertar
    (r"salto de p[aá]gina|p[aá]gina en blanco", ("insertar", "paginas", None)),
    (r"tabla completa|fila en una tabla|columna en una tabla", ("insertar", "tablas", None)),
    (r"hiperv[ií]nculo|navega (hacia atr[aá]s|hacia adelante|hacia delante) en hiperv[ií]nculos|marcador(?!.*vista)|referencia cruzada",
     ("insertar", "vinculos", None)),
    (r"inserta un comentario", ("insertar", "comentarios", None)),
    (r"alterna.*encabezado|campo de fecha|campo de hora|campo de p[aá]gina|actualiza(n)? (los )?campos|bloquea(n)?.*campos|desbloquea(n)?.*campos|c[oó]digo(s)? de.*campo|siguiente campo|campo anterior|clic en un campo|campo vac[ií]o|listnum|desvincula(n)? (los )?campos",
     ("insertar", "encabezado-pie", None)),
    (r"autotexto|bloque de creaci[oó]n|separador de estilos", ("insertar", "texto", None)),
    (r"c[oó]digo de caracteres unicode|alterna.*ecuaci[oó]n|ecuaciones", ("insertar", "simbolos", None)),

    # Disposición
    (r"formato de p[aá]gina|salto de columna", ("disposicion", "configurar-pagina", None)),

    # Inicio -- fuente
    (r"negrita|cursiva|subrayado|versalitas|may[uú]sculas y min[uú]sculas|tama[nñ]o de (la )?fuente|sub[ií]ndice|super[ií]ndice|restablece.*formato de car[aá]cter|fuente symbol|resalta el texto|formato de fuente|texto oculto|formato de contorno a los caracteres|campo del nombre de fuente|campo del tama[nñ]o de fuente|copia el formato|pega el formato copiado",
     ("inicio", "fuente", None)),
    # Inicio -- párrafo
    (r"justifica el p[aá]rrafo|alinea el p[aá]rrafo|centra el p[aá]rrafo|interlineado|espacio (entre p[aá]rrafos|adicional antes)|sangr[ií]a|p[aá]rrafo distribuido|estilo normal|t[ií]tulo 1 |t[ií]tulo 2 |t[ií]tulo 3 |encabezado t[ií]tulo|marcas de formato|panel aplicar estilos|estilo de [eé]nfasis",
     ("inicio", "parrafo", None)),
    # Inicio -- edición
    (r"buscar y reemplazar|cuadro (de di[aá]logo )?ir a|^¿qu[eé] atajo.*ir a\b|selecciona todo el contenido|selecciona una tabla|selecciona una columna|b[uú]squeda inteligente|extiende la selecci[oó]n|reduce la selecci[oó]n|repite la [uú]ltima b[uú]squeda|modo de selecci[oó]n extendida|vuelve a la ubicaci[oó]n anterior",
     ("inicio", "edicion", None)),
    # Inicio -- voz
    (r"dictado de office|copilot", ("inicio", "voz", None)),

    # Portapapeles (Inicio) -- después de fuente/párrafo para no chocar con "copia/pega el formato"
    (r"portapapeles especial|modo copiar a|copia el (contenido|texto) al portapapeles|pega (el contenido|alternativo) del portapapeles|corta el contenido al portapapeles|mueve el texto seleccionado a otra posici[oó]n",
     ("inicio", "portapapeles", None)),

    # Genérico de interfaz para lo que quede de navegación/ventana no capturado arriba
    (r"cierra el panel activo|cancela una acci[oó]n o cierra un cuadro de di[aá]logo|activa el modo de edici[oó]n",
     ("interfaz", "ventana-cinta", None)),

    # -- segunda pasada: patrones que aparecieron al revisar los últimos
    #    pendientes de 8.txt/ATAJOS.docx --
    (r"deshace la [uú]ltima acci[oó]n|rehace o repite la [uú]ltima acci[oó]n|deshace la desestructuraci[oó]n",
     ("interfaz", "deshacer-rehacer", None)),
    (r"abre el cuadro de di[aá]logo fuente|panel fuente aplicando|aplica may[uú]sculas al texto|abre el panel de formato",
     ("inicio", "fuente", None)),
    (r"recuperar un documento que cerr[oó] por error sin guardar|abre el cuadro de impresi[oó]n",
     ("archivo", "guardar", "Autorrecuperación")),
    (r"editado por personas concretas y solo por ellas|asegurarse de que no pueda modificarlo|bot[oó]n abrir permite abrir un documento sin riesgo",
     ("archivo", "informacion", "Proteger documento")),
    (r"plantilla de word que debe incluir macros", ("interfaz", "documentos-archivos", None)),
    (r"\bctrl ?\+ ?a\b.*versi[oó]n espa[nñ]ola", ("archivo", "abrir", None)),
    (r"\bctrl ?\+ ?s\b.*versi[oó]n espa[nñ]ola", ("inicio", "fuente", None)),
    (r"vista de etiquetas xml", ("interfaz", "documentos-archivos", None)),
    (r"campo de (n[uú]mero de )?p[aá]gina", ("insertar", "encabezado-pie", None)),
    (r"elimina la palabra situada a la (izquierda|derecha) del cursor", ("inicio", "edicion", None)),
    (r"muestra la ayuda de word", ("interfaz", "acceso-teclado-ayuda", None)),
    (r"va al inicio del documento|va al final del documento|va al inicio de la l[ií]nea|va al final de la l[ií]nea|va al inicio de la ventana visible|va al final de la ventana visible|mueve el cursor una palabra completa|mueve el cursor un p[aá]rrafo",
     ("interfaz", "cursor-navegacion", None)),
    (r"abre la tarjeta moderna de revisi[oó]n", ("revisar", "seguimiento", None)),
    (r"selecciona todo el documento", ("inicio", "edicion", None)),
    (r"actualiza el formato autom[aá]tico|aplica el formato autom[aá]tico", ("inicio", "fuente", "Formato automático")),
    (r"muestra el recuento de palabras|cuadro contar palabras para actualizar", ("interfaz", "barra-estado", None)),
    (r"selecciona el objeto anterior|selecciona el objeto siguiente", ("vista", "ventana", None)),
    (r"cuadro de di[aá]logo pegado especial|pega [uú]nicamente el texto, sin formato",
     ("inicio", "portapapeles", None)),
    (r"personaliza(r|ci[oó]n) (de )?m[eé]todos abreviados", ("interfaz", "acceso-teclado-ayuda", None)),
    (r"bloquea(n)? (un |los )?campo", ("insertar", "encabezado-pie", None)),
    (r"copia al portapapeles|corta al portapapeles", ("inicio", "portapapeles", None)),
    (r"guarda el documento", ("archivo", "guardar", None)),
]


def classify_atajo(enun):
    low = enun.lower()
    for pattern, dest in ATAJO_RULES:
        if re.search(pattern, low):
            return dest
    return None


def classify_interfaz(enun):
    low = enun.lower()
    for pattern, dest in INTERFAZ_RULES:
        if re.search(pattern, low):
            return dest
    return None


def process_file(filename, dry_run):
    path = os.path.join(QDIR, filename)
    with open(path, encoding="utf-8") as f:
        qs = json.load(f)

    changed = 0
    unmatched = []
    for q in qs:
        if q["id"] in ID_OVERRIDES:
            section, topic, subtopic = ID_OVERRIDES[q["id"]]
        elif filename == "8.json" and q.get("tema", "").strip() in TEMA_TO_TOPIC:
            section, topic, subtopic = TEMA_TO_TOPIC[q["tema"].strip()]
        elif filename == "8.json" and q.get("tema", "").strip() in (
                "PREGUNTAS DE SÍNTESIS Y CONFUSIÓN ALTA", "ATAJOS CRUZADOS – PREGUNTAS DE TRAMPA"):
            dest = classify_atajo(q["enunciado"])
            if dest is None:
                unmatched.append(q)
                continue
            section, topic, subtopic = dest
        elif filename == "atajos.json":
            dest = classify_atajo(q["enunciado"])
            if dest is None:
                unmatched.append(q)
                continue
            section, topic, subtopic = dest
        elif filename in ("1.json", "2.json", "3.json", "4.json", "5.json", "6.json", "7.json"):
            dest = classify_interfaz(q["enunciado"])
            if dest is None:
                dest = BLOQUE_FALLBACK.get((filename, q.get("bloque")))
            if dest is None:
                unmatched.append(q)
                continue
            section, topic, subtopic = dest
        else:
            continue

        if q.get("section") != section or q.get("topic") != topic or q.get("subtopic") != subtopic:
            changed += 1
        q["section"] = section
        q["topic"] = topic
        q["subtopic"] = subtopic

    print(f"{filename}: {changed} preguntas clasificadas/actualizadas, {len(unmatched)} sin clasificar")
    for q in unmatched:
        print(f"    SIN CLASIFICAR: {q['id']} | tema={q.get('tema','')!r} | {q['enunciado'][:100]}")

    if not dry_run:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(qs, f, ensure_ascii=False, indent=2)
            f.write("\n")

    return len(unmatched)


def main():
    dry_run = "--dry-run" in sys.argv
    total_unmatched = 0
    for filename in ["1.json", "2.json", "3.json", "4.json", "5.json", "6.json", "7.json", "8.json", "atajos.json"]:
        total_unmatched += process_file(filename, dry_run)
    print(f"\nTOTAL sin clasificar: {total_unmatched}" + (" (dry-run, nada escrito)" if dry_run else " -- ESCRITO"))


if __name__ == "__main__":
    main()
