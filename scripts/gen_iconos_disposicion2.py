# -*- coding: utf-8 -*-
# Los 3 iconos de disposicion que quedaban sin usar (ya recortados por el
# usuario, no por Claude): parrafo_aplicar_sangria.png, parrafo_espaciado.png,
# configurar_pagina_tamaño.png. Los otros "sin usar" del directorio eran
# etiquetas de grupo o el iniciador generico (mismo criterio de exclusion
# que en referencias). Script aparte para no reprocesar/duplicar las 16
# preguntas con imagen de disposicion ya generadas.
import json, os, base64, random

ICON_DIR = "data/imagenes_iconos/disposicion"
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TNAMES = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == "disposicion" for t in s["topics"]}

def datauri(path):
    b = open(path, "rb").read()
    return "data:image/png;base64," + base64.b64encode(b).decode("ascii")

ICONS = [
("parrafo_aplicar_sangria.png", "parrafo-disposicion", "Aplicar sangría",
 "Disposición ▸ Párrafo",
 "Fija directamente en la cinta la sangría izquierda y derecha del párrafo, en centímetros, sin abrir el cuadro Párrafo."),
("parrafo_espaciado.png", "parrafo-disposicion", "Espaciado",
 "Disposición ▸ Párrafo",
 "Fija directamente en la cinta el espacio antes y después del párrafo, en puntos, sin abrir el cuadro Párrafo."),
("configurar_pagina_tamaño.png", "configurar-pagina", "Tamaño",
 "Disposición ▸ Configurar página",
 "Elige el tamaño de papel (A4, Carta, Oficio…) de la galería; «Más tamaños de papel…» abre la ficha Papel del cuadro Configurar página."),
]

UBIC_POOL = sorted(set([
 "Disposición ▸ Párrafo", "Disposición ▸ Configurar página", "Disposición ▸ Organizar",
 "Inicio ▸ Párrafo", "Inicio ▸ Fuente", "Insertar ▸ Páginas", "Referencias ▸ Tabla de contenido",
 "Diseño ▸ Formato del documento",
]))

random.seed(20260904)
def pick(pool, correct, n=3):
    opts = [x for x in pool if x != correct]
    random.shuffle(opts)
    return opts[:n]

rows = []
for idx, (fn, topic, name, ubic, func) in enumerate(ICONS):
    path = os.path.join(ICON_DIR, fn)
    if not os.path.isfile(path):
        print("FALTA", path); continue
    uri = datauri(path)
    stem = idx % 2
    if stem == 0:
        enun = "Observa el icono de la imagen. ¿Qué comando de Word representa?"
        correct = name
        others = pick([e[2] for e in ICONS] + ["Espaciado entre párrafos", "Márgenes", "Sangría francesa"], name)
        opciones = others + [correct]
        cat = "concepto"
    else:
        enun = "El comando del icono de la imagen, ¿en qué pestaña y grupo de la cinta se encuentra?"
        correct = ubic
        others = pick(UBIC_POOL, ubic)
        opciones = others + [correct]
        cat = "ruta"
    random.shuffle(opciones)
    letters = ["A", "B", "C", "D"]
    resp = letters[opciones.index(correct)]
    expl = "**%s.** Pestaña %s. No tiene atajo de teclado directo. %s" % (name, ubic, func)
    rows.append({"topic": topic, "tema": TNAMES[topic], "categoria": cat, "enunciado": enun,
                 "imagen": uri, "opciones": [{"letter": letters[i], "text": t} for i, t in enumerate(opciones)],
                 "respuesta": resp, "explicacion": expl})

TO = {t["id"]: i for s in tax["sections"] if s["id"] == "disposicion" for i, t in enumerate(s["topics"])}
f = "data/questions/disposicion.json"
d = json.load(open(f, encoding="utf-8"))
n0 = max(int(q["id"].split("-")[-1]) for q in d)
for k, r in enumerate(rows, 1):
    d.append({
        "id": "disposicion-%d" % (n0 + k), "sourceFile": "disposicion.json",
        "bloque": "Disposición — %s (icono)" % r["tema"],
        "tipo": "opcion_unica", "categoria": r["categoria"], "negativa": False,
        "section": "disposicion", "topic": r["topic"], "subtopic": None, "tema": r["tema"],
        "sourceQuestionId": "img2-disposicion-%02d" % k, "generado": True,
        "enunciado": r["enunciado"], "imagen": r["imagen"],
        "opciones": r["opciones"], "matching": None,
        "respuesta": r["respuesta"], "explicacion": r["explicacion"],
    })
d.sort(key=lambda q: (TO.get(q["topic"], 99), int(q["id"].split("-")[-1])))
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
print("%s: +%d preguntas con imagen (total %d)" % (f, len(rows), len(d)))
