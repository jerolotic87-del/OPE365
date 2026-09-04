# -*- coding: utf-8 -*-
# Tercera pasada: disposicion.txt tenia 26 lineas no reflejadas en el
# banco con contenido genuinamente util (no decorativo, a diferencia de
# los nombres de tema/color de diseno.txt o los nombres de portada de
# insertar.txt, que se revisaron y se descartaron por bajo valor de
# examen). 8 preguntas nuevas sobre el cuadro Configurar pagina (ficha
# Disposicion/Papel), el cuadro Columnas y el cuadro Diseno de objetos
# flotantes.
import json

f = "data/questions/disposicion.json"
d = json.load(open(f, encoding="utf-8"))
n0 = max(int(q["id"].split("-")[-1]) for q in d)
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == "disposicion" for t in s["topics"]}
LETTERS = ["A", "B", "C", "D"]

rows = [
 ("opcion_unica", "configurar-pagina", "ruta",
  "En el cuadro Configurar página, ficha Disposición, ¿qué opción de «Sección» hace que la nueva sección empiece siempre en una página en blanco?",
  ["Empezar sección: Página nueva", "Continua", "Página par", "Alineación vertical"], "A",
  "Es la opción por defecto del campo «Empezar sección» en la ficha Disposición del cuadro Configurar página."),
 ("verdadero_falso", "configurar-pagina", "concepto",
  "En la ficha Disposición del cuadro Configurar página se puede fijar la Alineación vertical del texto en la página (por ejemplo, Superior).",
  None, True, "Es el campo «Alineación vertical» de esa ficha, con valores como Superior, Centrada, Justificada o Inferior."),
 ("verdadero_falso", "configurar-pagina", "concepto",
  "El cuadro Configurar página, ficha Papel, permite fijar un origen de papel distinto para la primera página que para el resto (por ejemplo, si la primera hoja es membretada).",
  None, True, "El campo «Origen del papel» distingue entre «Primera página» y «Otras páginas», cada una con su propia bandeja."),
 ("relleno", "configurar-pagina", "ruta",
  "En el cuadro Columnas (Disposición ▸ Configurar página ▸ Columnas ▸ Más columnas…), el bloque «Preestablecidas» ofrece: Una, [1], Tres, Izquierda y [2].",
  None, ["Dos", "Derecha"], "Las cinco distribuciones preestablecidas del cuadro Columnas."),
 ("opcion_unica", "configurar-pagina", "ruta",
  "¿Qué campo del cuadro Columnas fija el ancho exacto en centímetros de cada columna?",
  ["Ancho y espacio", "Preestablecidas", "Número de columnas", "Línea entre columnas"], "A",
  "«Ancho y espacio» permite fijar el ancho y el espaciado de cada columna por separado, en vez de repartirlas a partes iguales."),
 ("verdadero_falso", "configurar-pagina", "concepto",
  "El cuadro Guiones (Disposición ▸ Configurar página ▸ Guiones ▸ Opciones de guiones…) permite limitar cuántos guiones consecutivos seguidos se permiten al final de línea.",
  None, True, "El campo «Limitar guiones consecutivos a» evita que varias líneas seguidas terminen partidas por un guion."),
 ("opcion_unica", "organizar", "ruta",
  "En el cuadro Diseño (objeto flotante) ▸ ficha Ajuste del texto, ¿qué campo fija cuánto espacio deja el texto alrededor del objeto?",
  ["Distancia desde el texto", "Posición", "Tamaño", "Rotación"], "A",
  "«Distancia desde el texto» fija por separado el margen superior, inferior, izquierdo y derecho entre el objeto y el texto que lo rodea."),
 ("verdadero_falso", "organizar", "concepto",
  "«Mover con el texto», dentro de Organizar ▸ Ajustar texto, hace que el objeto flotante se desplace junto con el párrafo al que está anclado si ese párrafo cambia de página.",
  None, True, "Es la opción contraria a «Posición fija en la página»: ancla el objeto al párrafo en vez de a un punto fijo de la hoja."),
]
for k, (tipo, topic, cat, enun, opts, resp, expl) in enumerate(rows, 1):
    q = {"id": f"disposicion-{n0+k}", "sourceFile": "disposicion.json", "bloque": f"Disposición — {NAME[topic]}",
         "tipo": tipo, "categoria": cat, "negativa": False, "section": "disposicion", "topic": topic, "subtopic": None,
         "tema": NAME[topic], "sourceQuestionId": f"rutas3-disposicion-{k:02d}", "generado": True,
         "enunciado": enun, "opciones": [], "matching": None, "respuesta": resp, "explicacion": expl}
    if tipo == "opcion_unica":
        q["opciones"] = [{"letter": LETTERS[i], "text": t} for i, t in enumerate(opts)]
    d.append(q)
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
print("ok", len(d))
