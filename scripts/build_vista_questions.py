#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Construye data/questions/vista.json a partir de la clasificación hecha en
data/vista_integration_report.md (Etapa 3). Transcribe el contenido
verbatim de VISTA_PROCESADA_PARA_OPE365.md -- no se inventa ningún dato.

62 preguntas: 54 de los 4 tipos existentes + 8 de tipo "relleno" (nuevo).
Excluidas por solapamiento puro con el banco actual (no se incorporan):
Q-001, Q-002, Q-018, Q-034, Q-035.
No incorporadas porque no existen en el documento fuente: Q-066, Q-067
(el documento declara 69 preguntas pero el Anexo B solo contiene 67).

Uso:
    python3 scripts/build_vista_questions.py
Genera data/questions/vista.json. Ejecutar build_data.py después.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(HERE, "data", "questions", "vista.json")

SOURCE_FILE = "vista.txt"

def opt(letter, text):
    return {"letter": letter, "text": text}

def q_single(id_, srcq, tema, categoria, enun, opciones, respuesta, expl,
             dificultad, negativa=False, section=None, topic=None, subtopic=None,
             sourceIssue=None):
    return {
        "id": id_, "sourceFile": SOURCE_FILE, "sourcePage": None,
        "bloque": f"Vista — {tema}", "blockRange": None, "tema": tema,
        "tipo": "opcion_unica", "enunciado": enun, "opciones": opciones,
        "matching": None, "respuesta": respuesta, "explicacion": expl,
        "negativa": negativa, "sourceIssue": sourceIssue, "qnumInSource": srcq,
        "esCompletarBlank": False, "categoria": categoria, "generado": False,
        "sourceQuestionId": srcq, "difficulty": dificultad,
        "section": section, "topic": topic, "subtopic": subtopic,
    }

def q_multi(id_, srcq, tema, categoria, enun, opciones, respuesta, expl,
            dificultad, negativa=False, section=None, topic=None, subtopic=None):
    return {
        "id": id_, "sourceFile": SOURCE_FILE, "sourcePage": None,
        "bloque": f"Vista — {tema}", "blockRange": None, "tema": tema,
        "tipo": "seleccion_multiple", "enunciado": enun, "opciones": opciones,
        "matching": None, "respuesta": respuesta, "explicacion": expl,
        "negativa": negativa, "sourceIssue": None, "qnumInSource": srcq,
        "esCompletarBlank": False, "categoria": categoria, "generado": False,
        "sourceQuestionId": srcq, "difficulty": dificultad,
        "section": section, "topic": topic, "subtopic": subtopic,
    }

def q_vf(id_, srcq, tema, categoria, enun, respuesta, expl, dificultad,
         negativa=False, section=None, topic=None, subtopic=None):
    return {
        "id": id_, "sourceFile": SOURCE_FILE, "sourcePage": None,
        "bloque": f"Vista — {tema}", "blockRange": None, "tema": tema,
        "tipo": "verdadero_falso", "enunciado": enun, "opciones": [],
        "matching": None, "respuesta": respuesta, "explicacion": expl,
        "negativa": negativa, "sourceIssue": None, "qnumInSource": srcq,
        "esCompletarBlank": False, "categoria": categoria, "generado": False,
        "sourceQuestionId": srcq, "difficulty": dificultad,
        "section": section, "topic": topic, "subtopic": subtopic,
    }

def q_match(id_, srcq, tema, categoria, enun, left, right, correct, expl,
            dificultad, section=None, topic=None, subtopic=None):
    return {
        "id": id_, "sourceFile": SOURCE_FILE, "sourcePage": None,
        "bloque": f"Vista — {tema}", "blockRange": None, "tema": tema,
        "tipo": "emparejamiento", "enunciado": enun, "opciones": [],
        "matching": {"left": left, "right": right, "correct": correct},
        "respuesta": correct, "explicacion": expl,
        "negativa": False, "sourceIssue": None, "qnumInSource": srcq,
        "esCompletarBlank": False, "categoria": categoria, "generado": False,
        "sourceQuestionId": srcq, "difficulty": dificultad,
        "section": section, "topic": topic, "subtopic": subtopic,
    }

def q_fill(id_, srcq, tema, categoria, enun, respuesta, expl, dificultad,
           section=None, topic=None, subtopic=None, sourceIssue=None):
    return {
        "id": id_, "sourceFile": SOURCE_FILE, "sourcePage": None,
        "bloque": f"Vista — {tema}", "blockRange": None, "tema": tema,
        "tipo": "relleno", "enunciado": enun, "opciones": [],
        "matching": None, "respuesta": respuesta, "explicacion": expl,
        "negativa": False, "sourceIssue": sourceIssue, "qnumInSource": srcq,
        "esCompletarBlank": True, "categoria": categoria, "generado": False,
        "sourceQuestionId": srcq, "difficulty": dificultad,
        "section": section, "topic": topic, "subtopic": subtopic,
    }


questions = []
i = 0
def nid():
    global i
    i += 1
    return f"vista-{i}"

VISTAS = "Vistas"
INMERSIVO = "Inmersivo"
MOVPAG = "Movimiento de Página"
MOSTRAR = "Mostrar"
ZOOM = "Zoom"
VENTANA = "Ventana"
MACROS = "Macros"
SHAREPOINT = "SharePoint"
INTEGRACION = "Integración y distinción"

# === BLOQUE 1 — GRUPO VISTAS ===

questions.append(q_vf(nid(), "Q-008", VISTAS, "general",
    "El Modo de lectura visualiza el documento en cuatro páginas por pantalla dispuestas en forma de libro, ocultando las barras de herramientas y las reglas.",
    False,
    "Falso: el Modo de lectura muestra el documento en dos páginas por pantalla, no cuatro.",
    "media", section="vista", topic="vistas", subtopic="Modo de lectura"))

questions.append(q_single(nid(), "Q-069", VISTAS, "general",
    "¿Cuál es la función principal de la Vista Borrador en Word 365?",
    [opt("A","Visualizar el documento tal como aparecerá en un navegador web"),
     opt("B","Mostrar únicamente los títulos del documento para revisar su estructura"),
     opt("C","Mostrar el documento como borrador para editar el texto rápidamente"),
     opt("D","Presentar el documento en dos páginas en forma de libro para facilitar la lectura")],
    "C", "La Vista Borrador está orientada a la edición rápida del texto.",
    "media", section="vista", topic="vistas", subtopic="Vista Borrador"))

questions.append(q_vf(nid(), "Q-003", VISTAS, "concepto",
    "La Vista Esquema se utiliza para crear y editar esquemas, y muestra el contenido completo del documento organizado de forma jerárquica según los niveles de título.",
    False,
    "Falso: la Vista Esquema muestra sólo los títulos del documento, no el contenido completo.",
    "alta", section="vista", topic="vistas", subtopic="Vista Esquema"))

questions.append(q_single(nid(), "Q-005", VISTAS, "general",
    "Un usuario observa que los encabezados y pies de página de su documento han desaparecido de la pantalla, aunque el documento no ha sido modificado. ¿En qué vista está trabajando probablemente?",
    [opt("A","Diseño Web"), opt("B","Modo de lectura"), opt("C","Vista Borrador"), opt("D","Vista Esquema")],
    "C", "En Vista Borrador algunos elementos, como encabezados y pies de página, no son visibles.",
    "alta", section="vista", topic="vistas", subtopic="Vista Borrador"))

questions.append(q_single(nid(), "Q-006", VISTAS, "concepto",
    "Según la fuente de estudio, ¿cuál de las siguientes afirmaciones sobre los elementos no visibles en Vista Borrador es la más precisa?",
    [opt("A","En Vista Borrador únicamente los encabezados no son visibles; los pies de página sí se muestran"),
     opt("B","En Vista Borrador los encabezados y pies de página son los únicos elementos que no se muestran"),
     opt("C","En Vista Borrador algunos elementos como encabezados o pies de página no son visibles, sin que la fuente excluya otros elementos adicionales"),
     opt("D","En Vista Borrador los elementos no visibles son los mismos que en Vista Esquema")],
    "C", "La fuente da encabezados/pies como ejemplo ('como'), no como lista cerrada -- pueden existir otros elementos no visibles.",
    "alta", section="vista", topic="vistas", subtopic="Vista Borrador"))

questions.append(q_single(nid(), "Q-009", VISTAS, "general",
    "Un usuario está preparando un documento para su publicación en una página web y quiere visualizarlo tal como aparecerá en un navegador, con los fondos y el texto ajustado a la ventana. ¿Qué vista debe activar?",
    [opt("A","Diseño de impresión"), opt("B","Vista Preliminar"), opt("C","Modo de lectura"), opt("D","Diseño Web")],
    "D", "Diseño Web muestra el documento como en un explorador: fondos con colores/texturas, texto ajustado a la ventana, gráficos como en web.",
    "alta", section="vista", topic="vistas", subtopic="Diseño Web"))

questions.append(q_single(nid(), "Q-010", VISTAS, "ruta",
    "Un usuario quiere verificar los saltos de página y la distribución general del texto antes de imprimir, pudiendo ver varias páginas al mismo tiempo. ¿Qué vista debe usar?",
    [opt("A","Diseño de impresión"), opt("B","Modo de lectura"), opt("C","Vista Esquema"), opt("D","Vista Preliminar")],
    "D", "Vista Preliminar muestra páginas completas a tamaño reducido para comprobar saltos, distribución y formato antes de imprimir.",
    "alta",
    section="archivo", topic="imprimir", subtopic="Vista Preliminar"))

questions.append(q_vf(nid(), "Q-052", VISTAS, "general",
    "Desde la vista Diseño de impresión únicamente se puede visualizar el documento tal como se imprimirá y observar los extremos de la hoja, sin posibilidad de modificar encabezados, pies de página ni márgenes.",
    False,
    "Falso: Diseño de impresión también permite definir/modificar encabezados y pies de página y ajustar márgenes.",
    "alta", section="vista", topic="vistas", subtopic="Diseño de impresión"))

questions.append(q_multi(nid(), "Q-053", VISTAS, "general",
    "¿Cuáles de las siguientes afirmaciones sobre la vista Diseño de impresión son correctas según la fuente?",
    [opt("A","Permite visualizar la página tal y como se imprimirá"),
     opt("B","Muestra el documento en dos páginas por pantalla en forma de libro"),
     opt("C","Permite modificar encabezados y pies de página"),
     opt("D","Es la vista predefinida en Word"),
     opt("E","Muestra sólo los títulos del documento para facilitar la edición del esquema"),
     opt("F","Permite ajustar márgenes")],
    ["A","C","D","F"],
    "B corresponde al Modo de lectura y E a la Vista Esquema.",
    "alta", section="vista", topic="vistas", subtopic="Diseño de impresión"))

questions.append(q_match(nid(), "Q-051", VISTAS, "concepto",
    "Relaciona cada vista con su característica más diferenciadora:",
    [{"id":"1","label":"Modo de lectura"},{"id":"2","label":"Diseño de impresión"},
     {"id":"3","label":"Diseño Web"},{"id":"4","label":"Vista Esquema"},{"id":"5","label":"Vista Borrador"}],
    [{"id":"A","label":"Muestra sólo los títulos del documento"},
     {"id":"B","label":"El texto se ajusta a la ventana como en un explorador"},
     {"id":"C","label":"Es la vista predefinida de Word"},
     {"id":"D","label":"No muestra encabezados ni pies de página"},
     {"id":"E","label":"Presenta el documento en dos páginas en forma de libro"}],
    {"1":"E","2":"C","3":"B","4":"A","5":"D"},
    "", "alta", section="vista", topic="vistas"))

questions.append(q_match(nid(), "Q-007", VISTAS, "atajo",
    "Relaciona cada atajo con la vista que activa:",
    [{"id":"1","label":"Ctrl + Alt + N"},{"id":"2","label":"Ctrl + Alt + I"},
     {"id":"3","label":"Ctrl + Alt + D"},{"id":"4","label":"Ctrl + Alt + Q"}],
    [{"id":"A","label":"Diseño de impresión"},{"id":"B","label":"Vista Esquema"},
     {"id":"C","label":"Vista Borrador"},{"id":"D","label":"Vista Preliminar"}],
    {"1":"C","2":"D","3":"A","4":"B"},
    "", "alta", section="vista", topic="vistas"))

# === BLOQUE 2 — GRUPO INMERSIVO ===

questions.append(q_single(nid(), "Q-011", INMERSIVO, "concepto",
    "Un usuario se distrae con facilidad mientras redacta y desea que Word elimine todos los elementos visuales innecesarios del entorno para concentrarse exclusivamente en el contenido. ¿Qué herramienta debe activar?",
    [opt("A","Immersive Reader"), opt("B","Vista Borrador"), opt("C","Concentración"), opt("D","Vista Esquema")],
    "C", "Concentración elimina las distracciones del entorno de trabajo.",
    "media", section="vista", topic="inmersivo", subtopic="Concentración"))

questions.append(q_vf(nid(), "Q-012", INMERSIVO, "concepto",
    "Immersive Reader es una herramienta de la pestaña Vista que permite mejorar la comprensión y la fluidez de lectura de los documentos Word.",
    False,
    "Falso: la fuente lo describe en plural -- es un conjunto de herramientas, no una única herramienta.",
    "alta", section="vista", topic="inmersivo", subtopic="Lector inmersivo"))

questions.append(q_single(nid(), "Q-013", INMERSIVO, "concepto",
    "¿Cuál de las siguientes opciones describe correctamente la diferencia entre Concentración e Immersive Reader?",
    [opt("A","Concentración mejora la comprensión y fluidez lectora; Immersive Reader elimina las distracciones del entorno de trabajo"),
     opt("B","Concentración oculta encabezados y pies de página; Immersive Reader ajusta el texto al ancho de la ventana"),
     opt("C","Ambas herramientas eliminan distracciones pero Immersive Reader además ajusta el zoom automáticamente"),
     opt("D","Concentración elimina las distracciones del entorno de trabajo; Immersive Reader proporciona un conjunto de herramientas para mejorar la comprensión y fluidez lectora")],
    "D", "", "alta", section="vista", topic="inmersivo"))

questions.append(q_vf(nid(), "Q-063", INMERSIVO, "ruta",
    "Las herramientas Concentración e Immersive Reader se encuentran en el Grupo Vistas de la pestaña Vista.",
    False,
    "Falso: pertenecen al Grupo Inmersivo, no al Grupo Vistas.",
    "alta", section="vista", topic="inmersivo"))

# === BLOQUE 3 — MOVIMIENTO DE PÁGINA ===

questions.append(q_vf(nid(), "Q-068", MOVPAG, "general",
    "El Grupo Movimiento de Página permite desplazarse verticalmente por las páginas del documento utilizando la rueda del ratón o la barra de desplazamiento.",
    False,
    "Falso: el desplazamiento que ofrece este grupo es horizontal.",
    "media", section="vista", topic="movimiento-pagina"))

questions.append(q_multi(nid(), "Q-014", MOVPAG, "general",
    "¿Mediante qué medios permite desplazarse horizontalmente el Grupo Movimiento de Página?",
    [opt("A","Rueda del ratón"), opt("B","Ctrl + rueda del ratón"),
     opt("C","Barra de desplazamiento horizontal"), opt("D","Barra de desplazamiento vertical")],
    ["A","C"], "", "alta", section="vista", topic="movimiento-pagina"))

# === BLOQUE 4 — GRUPO MOSTRAR ===

questions.append(q_multi(nid(), "Q-015", MOSTRAR, "ruta",
    "¿Cuáles de los siguientes elementos pertenecen al Grupo Mostrar?",
    [opt("A","Regla"), opt("B","Panel de movimiento de página"),
     opt("C","Líneas de la cuadrícula"), opt("D","Panel de navegación"), opt("E","Immersive Reader")],
    ["A","C","D"], "", "media", section="vista", topic="mostrar"))

questions.append(q_single(nid(), "Q-016", MOSTRAR, "ruta",
    "¿Cuál es la función del Grupo Mostrar en la pestaña Vista?",
    [opt("A","Ampliar la vista del documento para mostrar más contenido en pantalla"),
     opt("B","Mostrar las propiedades del documento activo"),
     opt("C","Activar o desactivar la Regla, las Líneas de la cuadrícula y el Panel de navegación"),
     opt("D","Cambiar el modo de visualización del documento")],
    "C", "", "media", section="vista", topic="mostrar"))

questions.append(q_match(nid(), "Q-017", MOSTRAR, "ruta",
    "Relaciona cada elemento con su ruta completa:",
    [{"id":"1","label":"Regla"},{"id":"2","label":"Líneas de la cuadrícula"},{"id":"3","label":"Panel de navegación"}],
    [{"id":"A","label":"Vista → Grupo Mostrar → Panel de navegación"},
     {"id":"B","label":"Vista → Grupo Mostrar → Regla"},
     {"id":"C","label":"Vista → Grupo Mostrar → Líneas de la cuadrícula"}],
    {"1":"B","2":"C","3":"A"},
    "", "media", section="vista", topic="mostrar"))

# === BLOQUE 5 — ZOOM ===

questions.append(q_vf(nid(), "Q-019", ZOOM, "concepto",
    "En el Grupo Zoom, el botón 100% y el botón Zoom (lupa) realizan la misma función, ya que ambos permiten ajustar el nivel de zoom del documento.",
    False,
    "Falso: el botón Zoom abre un cuadro de diálogo para configurar el porcentaje; el botón 100% lo aplica directamente sin diálogo.",
    "media", section="vista", topic="zoom", subtopic="Cuadro de diálogo"))

questions.append(q_multi(nid(), "Q-060", ZOOM, "general",
    "¿Cuáles de las siguientes acciones permiten ajustar el nivel de zoom del documento?",
    [opt("A","Botón Zoom (lupa) → abre el cuadro de diálogo Zoom"),
     opt("B","Botón 100% → aplica zoom al 100% directamente"),
     opt("C","Activar Vista Borrador"),
     opt("D","Ctrl + rueda del ratón → ajusta el zoom de 10 en 10"),
     opt("E","Activar Modo de lectura"),
     opt("F","Seleccionar Una página / Varias páginas / Ancho de página")],
    ["A","B","D","F"], "", "media", section="vista", topic="zoom"))

questions.append(q_single(nid(), "Q-020", ZOOM, "atajo",
    "Al usar Ctrl + rueda del ratón, ¿en qué incremento se modifica el nivel de zoom?",
    [opt("A","De 25 en 25"), opt("B","De 100 en 100"), opt("C","De 10 en 10"), opt("D","De 1 en 1")],
    "C", "", "alta", section="vista", topic="zoom", subtopic="Valores"))

questions.append(q_single(nid(), "Q-021", ZOOM, "general",
    "¿Cuál de las siguientes opciones NO aparece como radio button en el cuadro de diálogo Zoom?",
    [opt("A","Ancho del texto"), opt("B","Toda la página"), opt("C","Varias páginas"), opt("D","Página completa")],
    "D", "Las opciones reales del diálogo son 200%/100%/25%, Ancho de página, Ancho del texto, Toda la página y Varias páginas -- 'Página completa' no existe como tal.",
    "alta", negativa=True, section="vista", topic="zoom", subtopic="Cuadro de diálogo",
    sourceIssue="Conflicto de dato detectado en la Etapa 3 frente a la pregunta existente 1-96: 1-96 afirma que los porcentajes predefinidos del diálogo Zoom son 200/100/75%; este documento y esta misma pregunta asumen 200/100/25%. No resuelto -- pendiente de verificación contra Word 365 real o el PDF de la academia. No se ha modificado 1-96."))

# === BLOQUE 6 — GRUPO VENTANA ===

questions.append(q_vf(nid(), "Q-026", VENTANA, "general",
    "En la fuente de estudio, la función Organizar todo recibe también el nombre de Mosaico.",
    True, "", "media", section="vista", topic="ventana", subtopic="Organizar todo"))

questions.append(q_single(nid(), "Q-030", VENTANA, "ruta",
    "¿Qué función realiza Cambiar ventanas y cómo se presenta en la cinta de opciones?",
    [opt("A","Abre una nueva ventana del mismo documento; aparece como botón simple"),
     opt("B","Divide la ventana activa en dos paneles; aparece con icono de división horizontal"),
     opt("C","Permite cambiar rápidamente a otra ventana de Word abierta; se presenta como menú desplegable"),
     opt("D","Muestra todas las ventanas abiertas en mosaico; aparece con icono de cuadrícula")],
    "C", "", "media", section="vista", topic="ventana", subtopic="Cambiar ventanas"))

questions.append(q_single(nid(), "Q-023", VENTANA, "general",
    "Un usuario tiene abiertos el contrato original y el contrato revisado y desea verlos simultáneamente para identificar diferencias. ¿Qué función debe usar?",
    [opt("A","Nueva ventana"), opt("B","Dividir"), opt("C","Organizar todo"), opt("D","Ver en paralelo")],
    "D", "", "alta", section="vista", topic="ventana", subtopic="Ver en paralelo"))

questions.append(q_single(nid(), "Q-024", VENTANA, "atajo",
    "¿Qué función permite compartir dos vistas del mismo documento en una única ventana y cuál es su atajo?",
    [opt("A","Nueva ventana — Alt + F11"), opt("B","Ver en paralelo — Alt + F8"),
     opt("C","Dividir — Alt + Ctrl + V"), opt("D","Organizar todo — Ctrl + Alt + D")],
    "C", "", "alta", section="vista", topic="ventana", subtopic="Dividir"))

questions.append(q_vf(nid(), "Q-027", VENTANA, "general",
    "El Desplazamiento sincrónico puede activarse en cualquier momento, independientemente del estado de las demás opciones de visualización.",
    False,
    "Falso: solo puede activarse cuando Ver en paralelo está activo previamente.",
    "alta", section="vista", topic="ventana", subtopic="Desplazamiento sincrónico"))

questions.append(q_single(nid(), "Q-028", VENTANA, "general",
    "Un usuario necesita que ambos documentos se desplacen al mismo tiempo al mover la barra de scroll. ¿Cuál es el orden correcto de activación?",
    [opt("A","Activar Desplazamiento sincrónico → después Ver en paralelo"),
     opt("B","Activar Organizar todo → después Desplazamiento sincrónico"),
     opt("C","Activar Ver en paralelo → después Desplazamiento sincrónico"),
     opt("D","Activar Dividir → después Desplazamiento sincrónico")],
    "C", "", "alta", section="vista", topic="ventana", subtopic="Desplazamiento sincrónico"))

questions.append(q_single(nid(), "Q-029", VENTANA, "general",
    "Un usuario tiene dos documentos en Ver en paralelo pero una ventana ocupa el 70% y la otra el 30%. ¿Qué función usa para distribuirlas de forma equitativa?",
    [opt("A","Organizar todo"), opt("B","Dividir"), opt("C","Ver en paralelo"), opt("D","Restablecer posición de la ventana")],
    "D", "", "alta", section="vista", topic="ventana", subtopic="Restablecer posición de la ventana"))

questions.append(q_match(nid(), "Q-025", VENTANA, "general",
    "Relaciona cada función con su descripción:",
    [{"id":"1","label":"Nueva ventana"},{"id":"2","label":"Dividir"},{"id":"3","label":"Ver en paralelo"}],
    [{"id":"A","label":"Divide la pantalla en dos paneles dentro de una misma ventana"},
     {"id":"B","label":"Abre una segunda ventana independiente del mismo documento"},
     {"id":"C","label":"Coloca dos documentos distintos uno al lado del otro"}],
    {"1":"B","2":"A","3":"C"},
    "", "alta", section="vista", topic="ventana"))

questions.append(q_match(nid(), "Q-054", VENTANA, "general",
    "Relaciona cada función con el número de documentos/ventanas que implica:",
    [{"id":"1","label":"Nueva ventana"},{"id":"2","label":"Organizar todo"},{"id":"3","label":"Dividir"},{"id":"4","label":"Ver en paralelo"}],
    [{"id":"A","label":"Todas las ventanas abiertas (sin límite)"},
     {"id":"B","label":"Exactamente dos documentos distintos"},
     {"id":"C","label":"Un único documento en dos paneles en la misma ventana"},
     {"id":"D","label":"El mismo documento en dos ventanas independientes"}],
    {"1":"D","2":"A","3":"C","4":"B"},
    "", "alta", section="vista", topic="ventana"))

questions.append(q_multi(nid(), "Q-056", VENTANA, "general",
    "¿Cuáles de las siguientes funciones requieren que haya más de una ventana o documento abierto para tener sentido funcional?",
    [opt("A","Organizar todo"), opt("B","Dividir"), opt("C","Ver en paralelo"),
     opt("D","Desplazamiento sincrónico"), opt("E","Cambiar ventanas"), opt("F","Restablecer posición de la ventana")],
    ["A","C","D","E","F"],
    "Dividir opera sobre una sola ventana, por eso queda fuera.",
    "alta", section="vista", topic="ventana"))

questions.append(q_vf(nid(), "Q-055", VENTANA, "general",
    "La función Restablecer posición de la ventana puede usarse en cualquier momento para redistribuir de forma equitativa todas las ventanas de Word abiertas.",
    False,
    "Falso: presupone que las ventanas ya están en modo paralelo; no actúa sobre 'todas' las ventanas sin más.",
    "alta", section="vista", topic="ventana", subtopic="Restablecer posición de la ventana"))

# === BLOQUE 7 — GRUPO MACROS ===

questions.append(q_single(nid(), "Q-031", MACROS, "concepto",
    "¿Qué es una macro en Word 365?",
    [opt("A","Un comando que ejecuta automáticamente una tarea predefinida en el documento"),
     opt("B","Una plantilla de documento que automatiza el formato del texto"),
     opt("C","Un atajo de teclado personalizado que ejecuta una secuencia de teclas"),
     opt("D","Una serie de comandos e instrucciones que se agrupan como un mismo comando para completar una tarea automáticamente")],
    "D", "", "media", section="vista", topic="macros"))

questions.append(q_vf(nid(), "Q-036", MACROS, "atajo",
    "En Word 365, el atajo Alt + F8 abre Visual Basic y el atajo Alt + F11 abre el cuadro de diálogo Macros.",
    False, "Falso: están invertidos. Alt+F8 abre el diálogo Macros; Alt+F11 abre Visual Basic.",
    "alta", section="vista", topic="macros"))

questions.append(q_vf(nid(), "Q-058", MACROS, "concepto",
    "Según la definición de la fuente, una macro puede estar formada por un único comando siempre que su ejecución sea automática.",
    False, "Falso: la definición exige una 'serie' de comandos -- pluralidad, no un único comando.",
    "media", section="vista", topic="macros"))

questions.append(q_single(nid(), "Q-033", MACROS, "concepto",
    "Según la fuente, ¿cuál es el propósito principal de crear y ejecutar macros en Word?",
    [opt("A","Automatizar cualquier tarea del documento, independientemente de su frecuencia de uso"),
     opt("B","Automatizar las tareas que requieren acceso a Visual Basic para su ejecución"),
     opt("C","Automatizar las tareas más usadas o frecuentes del documento"),
     opt("D","Automatizar las tareas que no pueden realizarse con los comandos estándar de la cinta")],
    "C", "", "alta", section="vista", topic="macros"))

questions.append(q_single(nid(), "Q-037", MACROS, "ruta",
    "¿Cuáles son exactamente las opciones del submenú desplegable del botón Macros?",
    [opt("A","Ver macros · Grabar macro... · Ejecutar macro"),
     opt("B","Ver macros · Pausar grabación · Detener grabación"),
     opt("C","Grabar macro... · Pausar grabación · Eliminar macro"),
     opt("D","Ver macros · Grabar macro... · Pausar grabación")],
    "D", "", "alta", section="vista", topic="macros"))

questions.append(q_single(nid(), "Q-038", MACROS, "general",
    "En la captura del submenú de Macros, la opción Pausar grabación aparece en color gris. ¿Qué indica esto?",
    [opt("A","La opción ha sido deshabilitada permanentemente en esta versión de Word"),
     opt("B","La opción solo está disponible con una licencia de Word 365 para empresas"),
     opt("C","La opción requiere que haya una grabación de macro activa para poder usarse"),
     opt("D","La opción no está disponible en el estado actual mostrado en la captura")],
    "D", "", "alta", section="vista", topic="macros"))

questions.append(q_multi(nid(), "Q-064", MACROS, "concepto",
    "¿Cuáles de las siguientes características forman parte de la definición estructural de una macro?",
    [opt("A","Es una serie de comandos e instrucciones (pluralidad)"),
     opt("B","Requiere conocimientos de programación en Visual Basic"),
     opt("C","Los comandos se agrupan como un único comando (agrupación)"),
     opt("D","Solo puede ejecutarse mediante el atajo Alt+F8"),
     opt("E","Su objetivo es completar una tarea automáticamente (automatismo)"),
     opt("F","Está limitada a las tareas disponibles en la cinta de opciones")],
    ["A","C","E"], "", "alta", section="vista", topic="macros"))

questions.append(q_match(nid(), "Q-057", MACROS, "atajo",
    "Relaciona cada elemento del Grupo Macros con su función o atajo:",
    [{"id":"1","label":"Alt + F8"},{"id":"2","label":"Alt + F11"},{"id":"3","label":"Grabar macro..."},
     {"id":"4","label":"Pausar grabación"},{"id":"5","label":"Ver macros"}],
    [{"id":"A","label":"Inicia el proceso de grabación de una nueva macro"},
     {"id":"B","label":"Interrumpe temporalmente una grabación en curso"},
     {"id":"C","label":"Abre el cuadro de diálogo para gestionar las macros existentes"},
     {"id":"D","label":"Abre el entorno de programación Visual Basic"},
     {"id":"E","label":"Permite visualizar y ejecutar las macros disponibles"}],
    {"1":"C","2":"D","3":"A","4":"B","5":"E"},
    "", "alta", section="vista", topic="macros"))

# === BLOQUE 8 — SHAREPOINT ===

questions.append(q_fill(nid(), "Q-039", SHAREPOINT, "concepto",
    "SharePoint es una herramienta diseñada por [1] para la [2] y el [3].",
    ["Microsoft", "gestión documental", "trabajo en equipo"],
    "", "media", section="vista", topic="sharepoint"))

questions.append(q_multi(nid(), "Q-040", SHAREPOINT, "general",
    "Según la fuente de estudio, ¿cuáles son las funciones de SharePoint? (Selecciona las dos opciones correctas)",
    [opt("A","Gestión documental"), opt("B","Almacenamiento de archivos en la nube"),
     opt("C","Comunicación interna mediante mensajería"), opt("D","Trabajo en equipo")],
    ["A","D"], "", "alta", section="vista", topic="sharepoint"))

# === BLOQUE 9 — INTEGRACIÓN Y DISTINCIÓN ===

questions.append(q_single(nid(), "Q-042", INTEGRACION, "ruta",
    "¿En qué grupo de la pestaña Vista se encuentra la herramienta Immersive Reader?",
    [opt("A","Grupo Vistas"), opt("B","Grupo Mostrar"), opt("C","Grupo Inmersivo"), opt("D","Grupo Ventana")],
    "C", "", "alta", section="vista", topic="inmersivo"))

questions.append(q_single(nid(), "Q-043", INTEGRACION, "ruta",
    "¿En qué grupo de la pestaña Vista se encuentra la función Nueva ventana?",
    [opt("A","Grupo Vistas"), opt("B","Grupo Zoom"), opt("C","Grupo Inmersivo"), opt("D","Grupo Ventana")],
    "D", "", "alta", section="vista", topic="ventana", subtopic="Nueva ventana"))

questions.append(q_single(nid(), "Q-044", INTEGRACION, "atajo",
    "¿Cuál de las siguientes funciones no tiene atajo de teclado documentado en la fuente?",
    [opt("A","Diseño de impresión"), opt("B","Vista Esquema"), opt("C","Dividir"), opt("D","Organizar todo")],
    "D", "", "alta", negativa=True, section="vista", topic="ventana", subtopic="Organizar todo"))

questions.append(q_single(nid(), "Q-045", INTEGRACION, "atajo",
    "¿Cuál de los siguientes atajos pertenece al Grupo Macros?",
    [opt("A","Ctrl + Alt + D"), opt("B","Alt + Ctrl + V"), opt("C","Ctrl + Alt + N"), opt("D","Alt + F8")],
    "D", "", "alta", section="vista", topic="macros"))

questions.append(q_vf(nid(), "Q-046", INTEGRACION, "ruta",
    "En Word 365, la pestaña Vista se encuentra entre las pestañas Revisar y Ayuda.",
    False, "Falso: está entre Revisar y Programador.",
    "alta", section="vista"))

questions.append(q_single(nid(), "Q-047", INTEGRACION, "concepto",
    "¿Cuál es la diferencia principal entre el Modo de lectura y la Vista Preliminar?",
    [opt("A","El Modo de lectura solo muestra una página; la Vista Preliminar muestra todas a tamaño completo"),
     opt("B","Ambas vistas son idénticas en función pero se acceden desde grupos distintos"),
     opt("C","El Modo de lectura presenta el documento en dos páginas en forma de libro para facilitar la lectura; la Vista Preliminar muestra páginas completas a tamaño reducido para verificar formato y saltos de página"),
     opt("D","El Modo de lectura oculta el texto y muestra solo imágenes; la Vista Preliminar muestra el documento en escala de grises")],
    "C", "", "alta", section="vista", topic="vistas"))

questions.append(q_single(nid(), "Q-050", INTEGRACION, "concepto",
    "¿Cuál es la diferencia de alcance entre Organizar todo y Ver en paralelo?",
    [opt("A","Organizar todo solo funciona con documentos guardados; Ver en paralelo funciona con cualquier documento"),
     opt("B","Organizar todo muestra exactamente dos ventanas; Ver en paralelo muestra todas las abiertas"),
     opt("C","Ambas funciones tienen el mismo alcance pero diferente disposición visual"),
     opt("D","Organizar todo actúa sobre todas las ventanas abiertas; Ver en paralelo opera sobre exactamente dos documentos")],
    "D", "", "alta", section="vista", topic="ventana"))

questions.append(q_single(nid(), "Q-049", INTEGRACION, "general",
    "Un usuario quiere usar una herramienta diseñada específicamente para mejorar la comprensión y la fluidez lectora. ¿Cuál debe activar?",
    [opt("A","Concentración"), opt("B","Vista Borrador"), opt("C","Immersive Reader"), opt("D","Vista Esquema")],
    "C", "", "alta", section="vista", topic="inmersivo", subtopic="Lector inmersivo"))

questions.append(q_match(nid(), "Q-041", INTEGRACION, "atajo",
    "Relaciona cada atajo con su acción:",
    [{"id":"1","label":"Ctrl + Alt + Q"},{"id":"2","label":"Alt + F8"},{"id":"3","label":"Ctrl + Alt + I"},
     {"id":"4","label":"Alt + Ctrl + V"},{"id":"5","label":"Ctrl + Alt + N"},{"id":"6","label":"Alt + F11"},
     {"id":"7","label":"Ctrl + Alt + D"}],
    [{"id":"A","label":"Abre Visual Basic"},{"id":"B","label":"Activa Vista Borrador"},
     {"id":"C","label":"Activa Diseño de impresión"},{"id":"D","label":"Activa Vista Esquema"},
     {"id":"E","label":"Divide la ventana en dos paneles"},{"id":"F","label":"Abre el cuadro de diálogo Macros"},
     {"id":"G","label":"Activa Vista Preliminar"}],
    {"1":"D","2":"F","3":"G","4":"E","5":"B","6":"A","7":"C"},
    "", "alta", section="vista"))

questions.append(q_match(nid(), "Q-061", INTEGRACION, "ruta",
    "Relaciona cada grupo con su función general:",
    [{"id":"1","label":"Grupo Vistas"},{"id":"2","label":"Grupo Inmersivo"},{"id":"3","label":"Grupo Mostrar"},
     {"id":"4","label":"Grupo Zoom"},{"id":"5","label":"Grupo Ventana"},{"id":"6","label":"Grupo Macros"}],
    [{"id":"A","label":"Controla el nivel de ampliación de la vista"},
     {"id":"B","label":"Gestiona apertura, organización y comparación de ventanas"},
     {"id":"C","label":"Permite automatizar tareas mediante secuencias de comandos"},
     {"id":"D","label":"Contiene los modos de visualización del documento"},
     {"id":"E","label":"Activa o desactiva elementos de interfaz como regla y cuadrícula"},
     {"id":"F","label":"Proporciona herramientas para mejorar concentración y lectura"}],
    {"1":"D","2":"F","3":"E","4":"A","5":"B","6":"C"},
    "", "alta", section="vista"))

# === Preguntas de tipo "relleno" restantes (7 de las 8) ===

questions.append(q_fill(nid(), "Q-004", VISTAS, "concepto",
    "La Vista Esquema se utiliza para [1] y [2] esquemas. Esta vista muestra [3] los [4] del documento y resulta de particular utilidad para [5].",
    ["crear", "editar", "sólo", "títulos", "elaborar notas"],
    "", "alta", section="vista", topic="vistas", subtopic="Vista Esquema"))

questions.append(q_fill(nid(), "Q-022", ZOOM, "general",
    "El zoom mínimo es del [1]% y el máximo del [2]%. Con Ctrl + rueda del ratón, el zoom se modifica de [3] en [3] puntos porcentuales.",
    ["10", "500", "10"],
    "", "alta", section="vista", topic="zoom", subtopic="Valores"))

questions.append(q_fill(nid(), "Q-062", ZOOM, "general",
    "El Grupo [1] de la pestaña [2] permite acercar o alejar la vista. El botón [3] abre un cuadro de diálogo. El botón [4] aplica directamente el nivel de zoom. El mínimo es [5]% y el máximo [6]%.",
    ["Zoom", "Vista", "Zoom (lupa)", "100%", "10", "500"],
    "", "alta", section="vista", topic="zoom"))

questions.append(q_fill(nid(), "Q-059", VENTANA, "general",
    "[1]: abre dos ventanas de Word para ver el mismo documento. [2]: en una única ventana comparte dos vistas del mismo documento. [3]: visualiza en paralelo dos documentos para compararlos. [4]: solo puede activarse cuando se hayan puesto dos documentos en paralelo.",
    ["Nueva ventana", "Dividir", "Ver en paralelo", "Desplazamiento sincrónico"],
    "", "alta", section="vista", topic="ventana"))

questions.append(q_fill(nid(), "Q-032", MACROS, "concepto",
    "Una macro es una [1] de comandos e instrucciones que se agrupan de forma conjunta como un mismo [2] para completar una tarea [3].",
    ["serie", "comando", "automáticamente"],
    "", "alta", section="vista", topic="macros"))

questions.append(q_fill(nid(), "Q-065", VISTAS, "atajo",
    "Escribe el atajo de teclado correspondiente a cada función: Diseño de impresión → [1]. Vista Esquema → [2]. Vista Borrador → [3]. Vista Preliminar → [4]. Dividir → [5].",
    ["Ctrl+Alt+D", "Ctrl+Alt+Q", "Ctrl+Alt+N", "Ctrl+Alt+I", "Alt+Ctrl+V"],
    "", "alta", section="vista", topic="vistas"))

questions.append(q_fill(nid(), "Q-048", INTEGRACION, "ruta",
    "Indica el nombre exacto del grupo al que pertenece cada herramienta: Diseño de impresión → Grupo [1]. Immersive Reader → Grupo [2]. Líneas de la cuadrícula → Grupo [3]. Ver en paralelo → Grupo [4]. Macros (botón principal) → Grupo [5]. Propiedades (icono SharePoint) → Grupo [6]. Vertical / En paralelo → Grupo [7].",
    ["Vistas", "Inmersivo", "Mostrar", "Ventana", "Macros", "SharePoint", "Movimiento de Página"],
    "", "alta", section="vista"))

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"vista.json: {len(questions)} preguntas escritas en {OUT_PATH}")
by_type = {}
for q in questions:
    by_type[q["tipo"]] = by_type.get(q["tipo"], 0) + 1
print("Por tipo:", by_type)
