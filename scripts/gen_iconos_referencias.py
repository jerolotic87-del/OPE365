# -*- coding: utf-8 -*-
# Preguntas con imagen para la pestana Referencias, a partir de los 26
# recortes de icono del usuario en data/imagenes_iconos/referencias/
# (mismo patron que scripts/gen_iconos_img.py, pero en script aparte para
# no re-procesar ni duplicar las 93 preguntas con imagen ya generadas).
# Se excluyen 5 "_rotulo.png" (son la etiqueta del GRUPO, no un comando),
# "ocultar_mostrar_cinta_referencias.png" (una flecha generica, sin
# comando propio) y "titulos_actualizar_tabla.png" (icono identico al de
# tabla_de_contenido_actualizar_tabla.png -- misma imagen para dos
# comandos distintos: se deja solo uno para no crear ambiguedad).
import json, os, base64, random

ICON_DIR = "data/imagenes_iconos/referencias"
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TNAMES = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == "referencias" for t in s["topics"]}

def datauri(path):
    b = open(path, "rb").read()
    return "data:image/png;base64," + base64.b64encode(b).decode("ascii")

# (archivo, topic, nombre, atajo|None, funcion)
ICONS = [
("citas_y_bibliografia_administrar_fuentes.png","citas-bibliografia","Administrar fuentes",None,
 "Organiza las fuentes guardadas (lista general y lista actual del documento); permite reorganizar y eliminar."),
("citas_y_bibliografia_bibliografia.png","citas-bibliografia","Bibliografía",None,
 "Inserta la lista final de las citas creadas y guardadas, con el formato del estilo elegido."),
("citas_y_bibliografia_cambiar_sp_de_proveedor.png","citas-bibliografia","Cambiar SP de proveedor",None,
 "Cambia el complemento (Source Provider) que gestiona las citas; NO cambia el estilo de cita (eso lo hace «Estilo»)."),
("citas_y_bibliografia_estilo.png","citas-bibliografia","Estilo",None,
 "Elige el formato de las citas y la bibliografía: APA (el que trae por defecto este Word), MLA, Chicago, IEEE…"),
("citas_y_bibliografia_insertar_cita.png","citas-bibliografia","Insertar cita",None,
 "Agrega una fuente nueva a la base de datos del documento e inserta la cita en el punto del cursor."),
("indice_actualizar_indice.png","indice","Actualizar índice",None,
 "Actualiza el índice tras añadir o modificar entradas marcadas con «Marcar entrada»."),
("indice_insertar_indice.png","indice","Insertar índice",None,
 "Genera el índice alfabético a partir de las entradas marcadas, con el formato y el número de columnas elegidos."),
("indice_marcar_entrada.png","indice","Marcar entrada","Alt+Mayús+X",
 "Abre el cuadro para marcar el texto seleccionado como entrada de índice (inserta un campo XE)."),
("notas_al_pie_iniciador.png","notas","Iniciador de cuadro de diálogo (Notas al pie)",None,
 "Abre el cuadro «Notas al pie y notas al final» con todas las opciones de posición, formato y numeración (también con la secuencia Alt, K, C)."),
("notas_al_pie_insertar_nota_al_final.png","notas","Insertar nota al final","Alt+Ctrl+L",
 "Inserta una nota al final del documento, con numeración i, ii, iii…"),
("notas_al_pie_insertar_nota_al_pie.png","notas","Insertar nota al pie","Alt+Ctrl+O",
 "Inserta una nota al pie de la página, con numeración 1, 2, 3…"),
("notas_al_pie_mostrar_notas.png","notas","Mostrar notas",None,
 "Lleva a la zona donde están las notas; en Vista Esquema/Borrador permite personalizar el separador de notas."),
("notas_al_pie_notas_al_pie_siguiente.png","notas","Nota al pie siguiente",None,
 "Salta a la siguiente nota al pie del documento; la flecha del comando permite elegir entre notas al pie y notas al final."),
("tabla_de_contenido_actualizar_tabla.png","tabla-contenido","Actualizar tabla",None,
 "Actualiza la tabla de contenido tras cambiar títulos o números de página."),
("tabla_de_contenido_agregar_texto.png","tabla-contenido","Agregar texto",None,
 "Marca el párrafo actual con un nivel de TDC concreto, sin necesidad de aplicarle un estilo de título."),
("tabla_de_contenido_tabla_de_contenido.png","tabla-contenido","Tabla de contenido",None,
 "Abre la galería/cuadro para elegir el tipo de tabla de contenido y generarla."),
("titulos_insertar_tabla_de_ilustraciones.png","titulos","Insertar Tabla de ilustraciones",None,
 "Inserta una tabla con los rótulos de título y su página; por defecto solo muestra un rótulo (elegir «Descripción» en Opciones para incluirlos todos)."),
("titulos_insertar_titulo.png","titulos","Insertar título",None,
 "Añade un título (rótulo + numeración) al objeto seleccionado: tabla, imagen, ecuación…"),
("titulos_referencia_cruzada.png","titulos","Referencia cruzada",None,
 "Inserta un hipervínculo a otro elemento del documento (título, nota, marcador…) que se actualiza solo."),
]

UBIC = {
 "citas-bibliografia": "Referencias ▸ Citas y bibliografía", "indice": "Referencias ▸ Índice",
 "notas": "Referencias ▸ Notas al pie", "tabla-contenido": "Referencias ▸ Tabla de contenido",
 "titulos": "Referencias ▸ Títulos",
}
# pool de ubicaciones de otras pestañas ya usado por gen_iconos_img.py, para distractores variados
UBIC_POOL = sorted(set(list(UBIC.values()) + [
 "Inicio ▸ Portapapeles","Inicio ▸ Fuente","Inicio ▸ Párrafo","Inicio ▸ Edición","Inicio ▸ Voz","Inicio ▸ Editor",
 "Diseño ▸ Formato del documento","Diseño ▸ Fondo de página",
 "Disposición ▸ Configurar página","Disposición ▸ Organizar",
 "Insertar ▸ Páginas","Insertar ▸ Tablas","Insertar ▸ Ilustraciones","Insertar ▸ Multimedia",
 "Insertar ▸ Vínculos","Insertar ▸ Comentarios","Insertar ▸ Encabezado y pie de página",
]))
ATAJO_POOL = ["Ctrl+N","Ctrl+K","Ctrl+S","Ctrl+Q","Ctrl+T","Ctrl+D","Ctrl+J","Ctrl+C","Ctrl+X","Ctrl+V",
              "Ctrl+E","Ctrl+B","Ctrl+L","Ctrl+H","Ctrl+G","Alt+Ctrl+C","Alt+Ctrl+V","Alt+Ctrl+K","Alt+Ctrl+A",
              "Alt+Ctrl+H","Ctrl+Mayús+>","Ctrl+<","Ctrl+Mayús+-","Ctrl+Mayús+8","Mayús+F3","Alt+[","F7",
              "Ctrl+Entrar","Alt+Mayús+I","Alt+Mayús+B"]

random.seed(20260904)

def pick(pool, correct, n=3):
    opts = [x for x in pool if x != correct]
    random.shuffle(opts)
    return opts[:n]

rows = []
for idx, (fn, topic, name, atajo, func) in enumerate(ICONS):
    path = os.path.join(ICON_DIR, fn)
    if not os.path.isfile(path):
        print("FALTA", path); continue
    uri = datauri(path)
    ubic = UBIC[topic]
    stems = [0, 1]
    if atajo: stems.append(2)
    stem = stems[idx % len(stems)]
    if stem == 0:
        enun = "Observa el icono de la imagen. ¿Qué comando de Word representa?"
        correct = name
        others = pick([e[2] for e in ICONS], name)
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
        name, ubic, (atajo if atajo else "no tiene atajo de teclado directo"), func)
    rows.append({
        "topic": topic, "tema": TNAMES[topic], "categoria": cat,
        "enunciado": enun, "imagen": uri,
        "opciones": [{"letter": letters[i], "text": t} for i, t in enumerate(opciones)],
        "respuesta": resp, "explicacion": expl,
    })

TO = {t["id"]: i for s in tax["sections"] if s["id"] == "referencias" for i, t in enumerate(s["topics"])}
f = "data/questions/referencias.json"
d = json.load(open(f, encoding="utf-8"))
n0 = max(int(q["id"].split("-")[-1]) for q in d)
for k, r in enumerate(rows, 1):
    d.append({
        "id": "referencias-%d" % (n0 + k), "sourceFile": "referencias.json",
        "bloque": "Referencias — %s (icono)" % r["tema"],
        "tipo": "opcion_unica", "categoria": r["categoria"], "negativa": False,
        "section": "referencias", "topic": r["topic"], "subtopic": None, "tema": r["tema"],
        "sourceQuestionId": "img-referencias-%02d" % k, "generado": True,
        "enunciado": r["enunciado"], "imagen": r["imagen"],
        "opciones": r["opciones"], "matching": None,
        "respuesta": r["respuesta"], "explicacion": r["explicacion"],
    })
d.sort(key=lambda q: (TO.get(q["topic"], 99), int(q["id"].split("-")[-1])))
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
print("%s: +%d preguntas con imagen (total %d)" % (f, len(rows), len(d)))
