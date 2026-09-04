# -*- coding: utf-8 -*-
"""Normaliza el ORDEN de los bancos: agrupa por topic (orden de taxonomia),
dentro de cada topic por tipo de ejercicio (orden canonico de
EXERCISE_TYPES en app.js: opcion_unica, seleccion_multiple,
verdadero_falso, emparejamiento, relleno) y, dentro de eso, por id
numerico. No cambia ids de preguntas (salvo diseno.json, banco nuevo).
Flashcards: formato cardId -> F-NNN, agrupadas por topic y por cardType
(contenido antes que error)."""
import json, os, re

HERE = "."
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TOPIC_ORDER = {}
for s in tax["sections"]:
    for i, t in enumerate(s["topics"]):
        TOPIC_ORDER[(s["id"], t["id"])] = i

TIPO_ORDER = {"opcion_unica": 0, "seleccion_multiple": 1, "verdadero_falso": 2,
              "emparejamiento": 3, "relleno": 4}
CARDTYPE_ORDER = {"contenido": 0, "error": 1}

def num(s):
    m = re.search(r"(\d+)\s*$", s or "")
    return int(m.group(1)) if m else 0

# ---------- PREGUNTAS ----------
QDIR = "data/questions"
report = []
for fn in json.load(open(os.path.join(QDIR, "manifest.json"), encoding="utf-8")):
    path = os.path.join(QDIR, fn)
    d = json.load(open(path, encoding="utf-8"))
    sec = fn[:-5]
    d.sort(key=lambda q: (TOPIC_ORDER.get((sec, q.get("topic")), 999),
                          str(q.get("topic") or ""),
                          TIPO_ORDER.get(q.get("tipo"), 99), num(q["id"])))
    if sec == "diseno":
        # banco nuevo: renumerar 1..N en el nuevo orden
        for i, q in enumerate(d, 1):
            q["id"] = "diseno-%d" % i
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(path, "a", encoding="utf-8").write("\n")
    runs = []
    for q in d:
        if not runs or runs[-1] != q.get("topic"):
            runs.append(q.get("topic"))
    report.append("  %-16s n=%-4d topics=%d %s" % (fn, len(d), len(runs),
                  "OK" if len(runs) == len(set(runs)) else "SOLAPA"))
print("PREGUNTAS (agrupadas por topic, ids estables salvo diseno):")
print("\n".join(report))

# ---------- FLASHCARDS ----------
FDIR = "data/flashcards"
print("\nFLASHCARDS (cardId -> F-NNN, agrupadas por topic):")
for fn in json.load(open(os.path.join(FDIR, "manifest.json"), encoding="utf-8")):
    path = os.path.join(FDIR, fn)
    d = json.load(open(path, encoding="utf-8"))
    sec = fn[:-5]
    changed = 0
    for c in d:
        pre, n = c["cardId"].split("-")
        newid = "%s-%03d" % (pre, int(n))   # conserva el prefijo (F- / E-)
        if c["cardId"] != newid:
            c["cardId"] = newid
            changed += 1
    ids = [c["cardId"] for c in d]
    assert len(ids) == len(set(ids)), (fn, "cardId duplicado tras reformatear")
    d.sort(key=lambda c: (TOPIC_ORDER.get((sec, c.get("topic")), 999),
                          str(c.get("topic") or ""),
                          CARDTYPE_ORDER.get(c.get("cardType"), 9), num(c["cardId"])))
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(path, "a", encoding="utf-8").write("\n")
    runs = []
    for c in d:
        if not runs or runs[-1] != c.get("topic"):
            runs.append(c.get("topic"))
    print("  %-18s n=%-4d cardId_reformat=%-3d topics=%d %s" %
          (fn, len(d), changed, len(runs), "OK" if len(runs) == len(set(runs)) else "SOLAPA"))
