# -*- coding: utf-8 -*-
# Cierra el hueco de tipo seleccion_multiple en las 4 secciones que
# seguian a 0: archivo, diseno, disposicion, insertar. Reformatea hechos
# ya verificados en el banco (atajos confirmados / rutas de grupo) a
# "cuales SI son reales" -- cero contenido nuevo sin fuente.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}
LETTERS = ["A", "B", "C", "D", "E"]

QUESTIONS = {
"archivo": [
 ("backstage", "atajo",
  "¿Cuáles de estos atajos SÍ funcionan en esta instalación de Word 365?",
  ["Ctrl+G (Guardar)", "Ctrl+U (Nuevo documento)", "Ctrl+F4 (cerrar documento sin cerrar Word)", "Ctrl+R (no hace nada)", "Ctrl+Alt+F2 (no abre el panel de impresión)"],
  [0, 1, 2],
  "Ctrl+G, Ctrl+U y Ctrl+F4 son atajos reales confirmados. Ctrl+R no hace nada en esta instalación (prueba en vivo) y Ctrl+Alt+F2 NO abre el panel de impresión, pese a aparecer en alguna fuente."),
],
"diseno": [
 ("formato-documento", "ruta",
  "¿Cuáles de estos SÍ son comandos del grupo Formato del documento, en la pestaña Diseño?",
  ["Colores", "Fuentes", "Espaciado entre párrafos", "Márgenes", "Establecer como predeterminada"],
  [0, 1, 2, 4],
  "Colores, Fuentes, Espaciado entre párrafos y Establecer como predeterminada son del grupo Formato del documento. «Márgenes» vive en la pestaña Disposición, no en Diseño."),
],
"disposicion": [
 ("configurar-pagina", "concepto",
  "¿Cuáles de estos SÍ son preajustes del desplegable Márgenes, en Configurar página?",
  ["Normal", "Estrecho", "Moderado", "Justificado", "Ancho"],
  [0, 1, 2, 4],
  "Los cinco preajustes reales son Normal, Estrecho, Moderado, Ancho y Reflejado. «Justificado» no es un preajuste de márgenes: es un tipo de alineación de párrafo."),
],
"insertar": [
 ("comentarios", "atajo",
  "¿Cuáles de estos atajos SÍ existen en la pestaña Insertar de esta instalación?",
  ["Ctrl+Entrar (salto de página)", "Alt+Ctrl+A (comentario nuevo)", "Alt+F3 (crear Autotexto)", "Ctrl+Mayús+P (no existe)", "Alt+X (código Unicode del carácter)"],
  [0, 1, 2, 4],
  "Ctrl+Entrar, Alt+Ctrl+A, Alt+F3 y Alt+X son atajos confirmados de esta pestaña. Ctrl+Mayús+P no es un atajo real de Insertar."),
],
}

total = 0
for sec, rows in QUESTIONS.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (topic, categoria, enun, opts, correct_idx, expl) in enumerate(rows, 1):
        tname = NAME[sec][topic]
        d.append({
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": "seleccion_multiple", "categoria": categoria, "negativa": False,
            "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"sm2-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [{"letter": LETTERS[i], "text": t} for i, t in enumerate(opts)],
            "matching": None, "respuesta": [LETTERS[i] for i in correct_idx], "explicacion": expl,
        })
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  total {len(d)}")
print("TOTAL nuevas:", total)
