# -*- coding: utf-8 -*-
"""Marca con `revisada: true` las preguntas ya reescritas a mano bajo la guia
de estilo (docs/GUIA_ESTILO_ITEMS.md).

Motivo: el banco tiene 2.843 preguntas y solo una parte ha pasado por la
reescritura. Al estudiar hace falta saber de un vistazo si el item que sale en
pantalla esta ya revisado o si es de los antiguos, que pueden tener
distractores flojos o datos sin contrastar.

Convencion, la misma que `generado`: el campo SOLO aparece cuando es true, para
no ensuciar las 1.834 que faltan. Se coloca junto a los campos de procedencia,
antes del enunciado.

    py -3.11 scripts/marcar_revisadas.py <seccion> [<seccion> ...]
    py -3.11 scripts/marcar_revisadas.py --estado
"""
import io, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, "data", "questions")

# Orden de campos deseado: `revisada` va con la procedencia, justo antes del
# contenido, para que se lea al abrir el fichero sin buscarla.
ANTES_DE = "enunciado"


def secciones():
    return [f[:-5] for f in sorted(os.listdir(QDIR))
            if f.endswith(".json") and f != "manifest.json"]


def estado():
    print("%-16s %6s %9s %9s" % ("seccion", "total", "revisadas", "pendientes"))
    tot = rev = 0
    for sec in secciones():
        arr = json.load(io.open(os.path.join(QDIR, sec + ".json"), encoding="utf-8"))
        n = len(arr)
        r = sum(1 for q in arr if q.get("revisada"))
        tot += n
        rev += r
        marca = "  TERMINADA" if r == n else ("" if r == 0 else "  a medias")
        print("%-16s %6d %9d %9d%s" % (sec, n, r, n - r, marca))
    print("%-16s %6d %9d %9d" % ("TOTAL", tot, rev, tot - rev))
    return 0


def marcar(sec):
    path = os.path.join(QDIR, sec + ".json")
    if not os.path.isfile(path):
        print("  !! no existe:", sec); return None
    arr = json.load(io.open(path, encoding="utf-8"))
    nuevos = []
    tocadas = 0
    for q in arr:
        if q.get("revisada"):
            nuevos.append(q); continue
        out = {}
        for k, v in q.items():
            if k == ANTES_DE:
                out["revisada"] = True
            out[k] = v
        if "revisada" not in out:      # por si faltara el campo ancla
            out["revisada"] = True
        nuevos.append(out)
        tocadas += 1
    io.open(path, "w", encoding="utf-8", newline="\n").write(
        json.dumps(nuevos, ensure_ascii=False, indent=2) + "\n")
    print("  %-16s %d marcadas (de %d)" % (sec + ".json", tocadas, len(arr)))
    return tocadas


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__); sys.exit(2)
    if args[0] == "--estado":
        sys.exit(estado())
    for sec in args:
        marcar(sec)
    print()
    estado()
