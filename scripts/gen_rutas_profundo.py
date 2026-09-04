# -*- coding: utf-8 -*-
# Lote grande a partir del arbol de rutas real: data/rutas/referencias.txt
# (ya existia, con el detalle completo de cuadros de dialogo, sacado de
# capturas del usuario) + paginas-imagen de los PDF de la academia para
# Correspondencia (extraidas con PyMuPDF: los dropdowns/cuadros de
# dialogo no estaban en el texto plano del PDF). Ningun dato inventado:
# todo enumerado tal cual aparece en la fuente.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}
LETTERS = ["A", "B", "C", "D"]

def ou(topic, enun, opts, correct_i, expl, categoria="ruta", negativa=False):
    return ("opcion_unica", topic, categoria, enun, opts, LETTERS[correct_i], expl, negativa)

def vf(topic, enun, resp, expl, categoria="concepto"):
    return ("verdadero_falso", topic, categoria, enun, None, resp, expl, False)

def rl(topic, enun, resp, expl, categoria="ruta"):
    return ("relleno", topic, categoria, enun, None, resp, expl, False)

def emp(topic, enun, pairs, expl, categoria="concepto"):
    return ("emparejamiento", topic, categoria, enun, pairs, None, expl, False)

QUESTIONS = {
"correspondencia": [
 ou("iniciar-combinacion",
    "¿Cuál de estas opciones NO aparece en el desplegable «Iniciar combinación de correspondencia»?",
    ["Cartas","Mensajes de correo electrónico","Hoja de cálculo","Directorio"], 2,
    "El desplegable ofrece Cartas, Mensajes de correo electrónico, Sobres…, Etiquetas…, Directorio, Documento normal de Word y Paso a paso por el Asistente. «Hoja de cálculo» no es una de las opciones.",
    negativa=True),
 rl("campos-combinacion",
    "El desplegable «Reglas» del grupo Escribir e insertar campos incluye: [1], Rellenar…, Si…Entonces…Sino…, Registro de combinación n.º, Secuencia de combinación n.º, [2], Próximo registro si…, [3], Saltar registro si…",
    ["Preguntar…","Próximo registro","Asignar marcador…"],
    "Las nueve opciones completas de Reglas: Preguntar, Rellenar, Si…Entonces…Sino, Registro de combinación n.º, Secuencia de combinación n.º, Próximo registro, Próximo registro si, Asignar marcador y Saltar registro si."),
 ou("campos-combinacion",
    "¿Qué opción de «Reglas» inserta una condición del tipo Si…Entonces…Si no…?",
    ["Preguntar…","Rellenar…","Si…Entonces…Sino…","Registro de combinación n.º"], 2,
    "«Si…Entonces…Sino…» es la regla condicional clásica del grupo Reglas."),
 ou("iniciar-combinacion",
    "¿Qué comando de «Seleccionar destinatarios» permite escribir una lista de destinatarios completamente nueva dentro de Word?",
    ["Escribir una nueva lista…","Usar una lista existente…","Elegir de los contactos de Outlook…","Editar lista de destinatarios"], 0,
    "«Escribir una nueva lista…» abre el cuadro «Nueva lista de direcciones» para crear los registros desde cero."),
 rl("iniciar-combinacion",
    "Dentro de «Editar lista de destinatarios», el bloque «Restringir lista de destinatarios» ofrece: [1], [2], Buscar duplicados…, Buscar destinatario…, [3].",
    ["Ordenar…","Filtrar…","Validar direcciones…"],
    "Las cinco opciones completas: Ordenar, Filtrar, Buscar duplicados, Buscar destinatario y Validar direcciones."),
 emp("iniciar-combinacion",
    "Relaciona cada comando de «Restringir lista de destinatarios» con lo que hace:",
    [("Ordenar…","reordena los destinatarios por una o varias columnas"),
     ("Filtrar…","muestra solo los registros que cumplen una condición"),
     ("Buscar duplicados…","detecta registros repetidos en la lista"),
     ("Validar direcciones…","comprueba que las direcciones postales sean correctas")],
    "Las cuatro utilidades de «Restringir lista de destinatarios» del cuadro Destinatarios de combinar correspondencia."),
 ou("finalizar",
    "¿Qué opción de «Finalizar y combinar» genera un documento nuevo con una copia por cada registro, para poder editar cartas concretas antes de imprimirlas?",
    ["Editar documentos individuales…","Imprimir documentos…","Enviar mensajes de correo electrónico…","Vista previa de resultados"], 0,
    "«Editar documentos individuales…» es la única de las tres que genera un documento de Word editable con todos los registros combinados."),
 vf("crear-sobres-etiquetas",
    "El cuadro «Opciones de sobre» tiene dos fichas: Opciones de sobre y Opciones de impresión.",
    True, "Confirmado en el cuadro de diálogo: ficha Opciones de sobre (tamaño, dirección, remite) y ficha Opciones de impresión."),
 vf("crear-sobres-etiquetas",
    "En «Opciones de sobre» se puede elegir la fuente del texto tanto de la Dirección como del Remite, de forma independiente.",
    True, "Cada bloque (Dirección y Remite) tiene su propio botón «Fuente…» y sus propios márgenes «Desde la izquierda»/«Desde arriba»."),
 vf("crear-sobres-etiquetas",
    "El cuadro «Opciones para etiquetas» permite elegir entre impresoras de alimentación continua e impresoras de páginas.",
    True, "Es la primera opción del cuadro, dentro de «Información de impresora»."),
 ou("crear-sobres-etiquetas",
    "En el cuadro «Opciones para etiquetas», ¿qué campo permite elegir la marca comercial de las etiquetas (por ejemplo APLI)?",
    ["Marcas de etiquetas","Número de producto","Bandeja","Tipo"], 0,
    "«Marcas de etiquetas» es el desplegable con el fabricante; «Número de producto» ya depende de la marca elegida."),
 vf("crear-sobres-etiquetas",
    "El botón «Actualizar etiquetas» solo hace falta cuando se están creando etiquetas; para combinar una carta impresa o un correo electrónico ese comando no es necesario.",
    True, "Lo dice el propio tooltip del comando en Word: es exclusivo del flujo de etiquetas."),
 vf("crear-sobres-etiquetas",
    "Al combinar etiquetas, Word inserta automáticamente el campo «Próximo registro» en todas las celdas de la hoja salvo en la primera.",
    True, "Así reparte un registro distinto en cada etiqueta al combinar; la primera celda lleva los campos que insertó el usuario y el resto encadena «Próximo registro»."),
 ou("crear-sobres-etiquetas",
    "¿Qué campo especial inserta Word automáticamente en todas las etiquetas salvo la primera, para que cada celda muestre un registro distinto?",
    ["«Próximo registro»","«Combinar campo»","«Salto de sección»","«Secuencia»"], 0,
    "Es el mismo campo que aparece como opción manual en «Reglas», pero aquí lo inserta Word solo al crear la hoja de etiquetas."),
],
"referencias": [
 emp("citas-bibliografia",
    "Relaciona cada estilo de cita con la edición o el año que trae este Word en el menú Estilo:",
    [("APA","Sexta edición"), ("MLA","Séptima edición"), ("Chicago","Decimoquinta edición"),
     ("IEEE","2006"), ("Harvard - Anglia","2008"), ("GB7714","2005")],
    "Los seis estilos con edición/año distinto entre sí; APA es el que trae por defecto este Word."),
 vf("citas-bibliografia",
    "GOST - Orden de nombre, GOST - Orden de título y SIST02 comparten el mismo año en el menú Estilo: 2003.",
    True, "Los tres estilos muestran «2003» junto a su nombre en el desplegable Estilo."),
 vf("citas-bibliografia",
    "Las dos variantes de ISO 690 (Primer elemento y fecha / Referencia numérica) comparten el mismo año: 1987.",
    True, "Ambas variantes de ISO 690 muestran «1987» en el desplegable Estilo."),
 ou("citas-bibliografia",
    "¿Qué edición trae por defecto el estilo Turabian en el menú Estilo de este Word?",
    ["Sexta edición","Séptima edición","2003","1987"], 0,
    "Turabian aparece como «Sexta edición», igual etiqueta que usa APA (aunque son estilos distintos)."),
 rl("tabla-contenido",
    "El desplegable Formatos del cuadro Tabla de contenido ofrece: Estilo personal, [1], Elegante, Sofisticado, Moderno, [2], Sencillo.",
    ["Clásico","Formal"],
    "Los siete formatos completos del cuadro Tabla de contenido."),
 vf("titulos",
    "El cuadro Tabla de ilustraciones ofrece el formato «Centrado», que NO está disponible en el cuadro Tabla de contenido.",
    True, "Tabla de contenido tiene Sofisticado/Moderno (que Tabla de ilustraciones no tiene) y Tabla de ilustraciones tiene Centrado (que Tabla de contenido no tiene): son listas de formato distintas."),
 vf("tabla-contenido",
    "El cuadro Tabla de contenido ofrece los formatos «Sofisticado» y «Moderno», que NO están disponibles en el cuadro Tabla de ilustraciones.",
    True, "Es la misma diferencia vista desde el otro cuadro: cada uno tiene formatos propios que el otro no ofrece."),
 rl("tabla-contenido",
    "El desplegable Agregar texto (grupo Tabla de contenido) ofrece: [1], Nivel 1, [2], Nivel 3.",
    ["No mostrar en la tabla de contenido","Nivel 2"],
    "Las cuatro opciones completas de Agregar texto."),
 ou("tabla-contenido",
    "Además de «No mostrar en la tabla de contenido», ¿cuántos niveles concretos ofrece directamente el desplegable «Agregar texto»?",
    ["3","5","9","1"], 0,
    "Ofrece Nivel 1, Nivel 2 y Nivel 3 directamente; para más niveles hay que usar «Nivel de esquema» en el formato de párrafo."),
 vf("tabla-contenido",
    "Los estilos TDC 1 a TDC 9, que edita «Modificar…» en el cuadro Tabla de contenido, permiten personalizar el aspecto de cada nivel de la tabla por separado.",
    True, "Cada nivel de la tabla de contenido tiene su propio estilo TDC N editable desde ese botón."),
 ou("tabla-contenido",
    "En el cuadro Opciones de tabla de contenido, ¿qué casilla permite generar la tabla a partir de estilos como Cita, Normal, Párrafo de lista o Subtítulo, además de los estilos Título?",
    ["Estilos","Niveles de esquema","Campos de elementos de tabla","Restablecer"], 0,
    "La casilla «Estilos», con su lista de estilos disponibles y el «Nivel de TDC» asignable a cada uno."),
 emp("titulos",
    "Relaciona cada tipo de la Referencia cruzada con el elemento al que apunta:",
    [("Elemento numerado","un párrafo con numeración automática"),
     ("Marcador","un punto con nombre creado en el documento"),
     ("Nota al pie","una nota insertada al pie de la página"),
     ("Ecuación","una fórmula con título insertado")],
    "Cuatro de los ocho tipos que admite el desplegable «Tipo» del cuadro Referencia cruzada."),
 vf("titulos",
    "El campo «Referencia a» del cuadro Referencia cruzada cambia según el Tipo elegido: para «Elemento numerado» ofrece Número de párrafo (con o sin contexto) además de Número de página.",
    True, "Cada Tipo tiene su propia lista de «Referencia a»; «Elemento numerado» es el que más opciones de párrafo ofrece."),
 rl("notas",
    "El cuadro «Convertir notas» (dentro de Notas al pie y notas al final) ofrece tres opciones: [1], [2] y [3].",
    ["Convertir las notas al pie en notas al final","Convertir las notas al final en notas al pie","Intercambiar notas al pie y notas al final"],
    "Las tres conversiones posibles entre notas al pie y notas al final."),
 ou("notas",
    "¿Desde qué cuadro de diálogo se pueden convertir todas las notas al pie del documento en notas al final?",
    ["Notas al pie y notas al final ▸ Convertir…","Marcar entrada de índice","Opciones de tabla de contenido","Administrador de fuentes"], 0,
    "El botón «Convertir…» del cuadro Notas al pie y notas al final abre el cuadro «Convertir notas»."),
 ou("citas-bibliografia",
    "¿Cuál de estos NO es uno de los proveedores que ofrece «Cambiar SP de proveedor» en este Word?",
    ["Mendeley Cite","RefWorks Citation Manager","Zotero Connector","EndNote Cite While You Write for Word"], 2,
    "El desplegable lista Mendeley Cite, PERLLA, RefWorks Citation Manager, SmartCite for Papers, EndNote Cite While You Write for Word, Citavi Assistant, Lean Library Workspace, Ref-n-Write, EasyBib Add-In for Office 365 y Citavi Assistant Beta. «Zotero Connector» no aparece en esa lista.",
    negativa=True),
 vf("citas-bibliografia",
    "Desde «Cambiar SP de proveedor» se puede acceder a «Ver más complementos…» para instalar otros gestores de citas.",
    True, "Es la última entrada del desplegable, con un enlace a la tienda de complementos."),
 ou("indice",
    "En el cuadro Marcar entrada de índice, ¿qué tres opciones hay dentro de «Opciones» para indicar a qué página apunta la entrada?",
    ["Referencia cruzada, Página actual, Intervalo de páginas","Negrita, Cursiva, Subrayado","Con sangría, Continuo, Automático","Entrada, Subentrada, Marcador"], 0,
    "Las tres formas de apuntar una entrada de índice: a otra entrada («Véase»), a la página actual, o a un intervalo de páginas marcado con un marcador."),
 vf("indice",
    "En el cuadro Índice, el Tipo puede ser «Con sangría» o «Contínuo».",
    True, "Son las dos disposiciones posibles del índice, junto al número de Columnas y el Idioma."),
 rl("indice",
    "En el cuadro Índice, el formato de los números de página se puede marcar en [1] o en [2], igual que en Marcar entrada de índice.",
    ["Negrita","Cursiva"],
    "Ambos cuadros (Marcar entrada de índice e Índice) comparten estas dos casillas de formato."),
 vf("titulos",
    "El campo «Identificador de tabla», dentro de Opciones de tabla de ilustraciones, permite elegir entre las letras A a F.",
    True, "Sirve para distinguir varias tablas de ilustraciones del mismo documento (por ejemplo, una para figuras y otra para tablas)."),
 ou("titulos",
    "¿Qué estilos se pueden elegir para generar la Tabla de ilustraciones, además de los rótulos Título/Título 1-9?",
    ["Cita, Cita destacada, Normal, Párrafo de lista, Subtítulo, Texto nota pie","Solo estilos de título","Ninguno, es un valor fijo","Solo el estilo Normal"], 0,
    "El cuadro Opciones de tabla de ilustraciones ofrece esa lista de estilos, más amplia que la de Opciones de tabla de contenido (que no incluye «Texto nota pie»)."),
 rl("citas-bibliografia",
    "La galería del comando Bibliografía ofrece tres diseños integrados: [1], [2] y [3].",
    ["Bibliografía","Referencias","Trabajos citados"],
    "Los tres encabezados integrados de la galería; también se puede «Insertar bibliografía» sin ninguno de los tres."),
 vf("citas-bibliografia",
    "Además de los tres diseños integrados, el comando Bibliografía permite «Insertar bibliografía» sin título ni formato de galería.",
    True, "Es la opción «Insertar bibliografía» del propio desplegable, por debajo de los tres diseños integrados."),
],
}

total = 0
for sec, rows in QUESTIONS.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    k = 0
    for tipo, topic, categoria, enun, extra, correct, expl, negativa in rows:
        k += 1
        tname = NAME[sec][topic]
        base = {
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": tipo, "categoria": categoria, "negativa": negativa,
            "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"rutas-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [], "matching": None,
            "respuesta": correct, "explicacion": expl,
        }
        if tipo == "opcion_unica":
            base["opciones"] = [{"letter": LETTERS[i], "text": t} for i, t in enumerate(extra)]
        elif tipo == "relleno":
            base["respuesta"] = correct  # ya es una lista
        elif tipo == "emparejamiento":
            left = [{"id": str(i+1), "label": p[0]} for i, p in enumerate(extra)]
            right_order = list(range(len(extra)))
            right_order = right_order[1:] + right_order[:1]  # rotacion simple
            right = [{"id": LETTERS[i] if i < 4 else chr(ord('E')+i-4), "label": extra[right_order[i]][1]} for i in range(len(extra))]
            corr = {}
            for li in range(len(extra)):
                ri = right_order.index(li)
                corr[str(li+1)] = right[ri]["id"]
            base["matching"] = {"left": left, "right": right, "correct": corr}
            base["respuesta"] = corr
        d.append(base)
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  total {len(d)}")
print("TOTAL nuevas:", total)
