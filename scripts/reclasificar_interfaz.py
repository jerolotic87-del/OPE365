# -*- coding: utf-8 -*-
import json, re, collections

f = "data/questions/interfaz.json"
d = json.load(open(f, encoding="utf-8"))

TOPIC_DEFAULT = {
    "conceptos-generales": "concepto",
    "documentos-archivos": "concepto",
    "ventana-cinta": "ruta",
    "barra-estado": "ruta",
    "cursor-navegacion": "ruta",
    "regla": "ruta",
    "acceso-rapido": "ruta",
    "zoom": "ruta",
    "area-vistas": "ruta",
    "acceso-teclado-ayuda": "ruta",
    "buscador": "ruta",
    "deshacer-rehacer": "atajo",
}

ATAJO_RE = re.compile(
    r"(?i)combinaci[oó]n de teclas|atajo de teclado|qu[eé] tecla\b|alternativa a Ctrl|"
    r"tecla debe pulsar|c[oó]mo se activa.*(?:con el teclado|sin el rat[oó]n)|"
    r"exclusivamente el teclado|(?<![\w.])Alt\s*\+\s*Q(?![\w])"
)

def classify(q):
    if ATAJO_RE.search(q["enunciado"]):
        return "atajo"
    return TOPIC_DEFAULT.get(q["topic"], "concepto")

gen = [q for q in d if q["categoria"] == "general"]
counts = collections.Counter()
by = collections.defaultdict(list)
for q in gen:
    c = classify(q)
    counts[(q["topic"], c)] += 1
    by[c].append(q)

print("total:", len(gen))
print({k: sum(v for kk, v in counts.items() if kk[1] == k) for k in ("atajo", "ruta", "concepto")})
print()
for topic in TOPIC_DEFAULT:
    row = {c: counts.get((topic, c), 0) for c in ("atajo", "ruta", "concepto")}
    print(f"{topic:24s} {row}")

# aplica de verdad
for q in gen:
    q["categoria"] = classify(q)
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
print("\nAPLICADO.")
