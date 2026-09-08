# -*- coding: utf-8 -*-
"""Sustituye en las explicaciones las referencias por LETRA a una opción por el
texto de esa opción.

Motivo: las opciones se barajan al construir la sesión (`shuffleOptions:true`
es el valor por defecto en todas: smart, repaso, concepto, práctica, sección,
errores, duelo y coop), así que una explicación que diga «la opción B» apunta a
una opción distinta cada vez que se sirve la pregunta, y casi nunca a la que
se quería señalar.

No genera contenido: solo copia el texto de la propia opción, entre comillas
angulares, en el sitio donde había una letra.

    py -3.11 scripts/quitar_letras_explicacion.py [--dry]
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECCIONES = ["interfaz", "archivo", "inicio", "insertar", "diseno", "disposicion",
             "referencias", "revisar", "vista", "correspondencia"]

def texto_de(q, letra):
    for o in q.get("opciones") or []:
        if o.get("letter") == letra:
            t = (o.get("text") or "").strip()
            return t.rstrip(".")
    return None

def arregla(q):
    expl = q.get("explicacion") or ""
    if not expl or not q.get("opciones"):
        return expl, 0
    n = 0

    # «las opciones B y C» -> «X» y «Y»
    def dos(m):
        nonlocal n
        a, b = texto_de(q, m.group(2)), texto_de(q, m.group(3))
        if not a or not b:
            return m.group(0)
        n += 1
        art = "Las" if m.group(1)[0].isupper() else "las"
        return "%s opciones «%s» y «%s»" % (art, a, b)
    expl = re.sub(r"\b([Ll])as opciones ([A-E]) y ([A-E])\b", dos, expl)

    # «la opción B» -> «X»
    def una(m):
        nonlocal n
        t = texto_de(q, m.group(2))
        if not t:
            return m.group(0)
        n += 1
        art = "La" if m.group(1)[0].isupper() else "la"
        return "%s opción «%s»" % (art, t)
    expl = re.sub(r"\b([Ll])a opci[óo]n ([A-E])\b", una, expl)

    # «la D es», «la B hace» -> por si quedara alguna suelta
    def suelta(m):
        nonlocal n
        t = texto_de(q, m.group(2))
        if not t:
            return m.group(0)
        n += 1
        art = "La" if m.group(1)[0].isupper() else "la"
        return "%s opción «%s»" % (art, t)
    expl = re.sub(r"\b([Ll])a ([A-E]) (?=es|son|hace|describe|invierte|pone|tambi[ée]n)",
                  lambda m: suelta(m) + " ", expl)

    return expl, n

def main(dry):
    total, tocadas = 0, 0
    for sec in SECCIONES:
        path = os.path.join(ROOT, "data", "questions", sec + ".json")
        if not os.path.exists(path):
            continue
        arr = json.load(io.open(path, encoding="utf-8"))
        cambios = 0
        for q in arr:
            nueva, n = arregla(q)
            if n:
                q["explicacion"] = nueva
                cambios += 1
                total += n
        if cambios:
            tocadas += cambios
            print("  %-16s %d preguntas, %d referencias" % (sec + ".json", cambios, total))
            if not dry:
                io.open(path, "w", encoding="utf-8", newline="\n").write(
                    json.dumps(arr, ensure_ascii=False, indent=2) + "\n")
    print("%s%d preguntas arregladas." % ("(simulacion) " if dry else "", tocadas))
    return 0

if __name__ == "__main__":
    sys.exit(main("--dry" in sys.argv))
