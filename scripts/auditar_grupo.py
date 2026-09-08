# -*- coding: utf-8 -*-
"""Auditoria de un topic (o de una seccion entera) ya reescrito.

Las mismas lentes que se usaron al cerrar `archivo` e `inicio`, en un solo
sitio para no repetirlas a mano en cada tanda:

  - citas de LETRA de opcion en la explicacion  (prohibido: se barajan)
  - explicaciones cortas (<120 car.)
  - citas de fuente externa en el texto del banco
  - balance verdadero/falso
  - reparto de tipo y de categoria
  - FRAMINGS por topic: `deriveMastery` exige >=2 para llegar a 'asentado'
  - opciones repetidas dentro de un item

  py -3.11 scripts/auditar_grupo.py insertar [tablas]
"""
import io, json, os, re, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# mismo criterio que framingOf() en engine.js: solo estructural
def framing(q):
    t = q.get("tipo")
    if t == "verdadero_falso":     return "vf"
    if t == "seleccion_multiple":  return "multi"
    if t == "emparejamiento":      return "match"
    if t == "relleno":             return "relleno"
    if q.get("negativa"):          return "negativa"
    c = q.get("categoria")
    if c == "atajo":               return "atajo"
    if c == "ruta":                return "ruta"
    return "concepto"

LETRA = re.compile(r"(?:opci[oó]n|respuesta|apartado|alternativa)\s+[A-Ha-h]\b|\b[A-H]\)\s|\bla\s+[A-H]\b")
FUENTE = re.compile(r"aulaclic|aulaClic|scribd|slideshare|linkedin|ionos|support\.microsoft|seg[uú]n la fuente|xataka|profesionalreview|daypo", re.I)

def main():
    sec = sys.argv[1]
    topic = sys.argv[2] if len(sys.argv) > 2 else None
    arr = json.load(io.open(os.path.join(ROOT, "data", "questions", sec + ".json"), encoding="utf-8"))
    qs = [q for q in arr if (topic is None or q.get("topic") == topic)]
    print("== %s%s: %d preguntas ==" % (sec, ("/" + topic) if topic else "", len(qs)))

    problemas = 0
    for q in qs:
        ex = q.get("explicacion") or ""
        if LETRA.search(ex):
            print("  LETRA en explicacion:", q["id"], "->", LETRA.search(ex).group(0)); problemas += 1
        if len(ex) < 120:
            print("  explicacion corta (%d):" % len(ex), q["id"]); problemas += 1
        if FUENTE.search(ex) or FUENTE.search(q.get("enunciado") or ""):
            print("  cita de fuente:", q["id"]); problemas += 1
        ops = [o["text"].strip() for o in (q.get("opciones") or [])]
        if len(ops) != len(set(ops)):
            print("  opciones repetidas:", q["id"]); problemas += 1
        # coherencia tipo <-> respuesta
        r, t = q.get("respuesta"), q.get("tipo")
        if t == "verdadero_falso" and not isinstance(r, bool):
            print("  V/F sin respuesta booleana:", q["id"]); problemas += 1
        if t == "opcion_unica" and not isinstance(r, str):
            print("  opcion_unica sin letra:", q["id"]); problemas += 1
        if t == "seleccion_multiple" and not isinstance(r, list):
            print("  seleccion_multiple sin lista:", q["id"]); problemas += 1

    vf = [q for q in qs if q.get("tipo") == "verdadero_falso"]
    v = sum(1 for q in vf if q.get("respuesta") is True)
    print("  V/F: %d verdaderas / %d falsas" % (v, len(vf) - v))
    print("  tipos:     ", dict(Counter(q.get("tipo") for q in qs)))
    print("  categorias:", dict(Counter(q.get("categoria") for q in qs)))
    print("  negativas: ", sum(1 for q in qs if q.get("negativa")))

    porTopic = defaultdict(set)
    for q in qs: porTopic[q.get("topic")].add(framing(q))
    for t, fr in sorted(porTopic.items()):
        marca = "  <-- SOLO 1 FRAMING" if len(fr) < 2 else ""
        print("  framings %-18s %d  %s%s" % (t, len(fr), sorted(fr), marca))

    print("  problemas:", problemas)
    return 0

if __name__ == "__main__":
    sys.exit(main())
