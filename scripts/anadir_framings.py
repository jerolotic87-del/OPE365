# -*- coding: utf-8 -*-
"""Añade al banco preguntas ESCRITAS A MANO que aportan un framing nuevo a
conceptos que solo tenían uno.

Motivo: `deriveMastery` (engine.js) exige >=2 framings distintos acertados para
que un concepto llegue a 'asentado'. Un topic cuyas preguntas son todas de
`categoria:"ruta"` produce un único framing, así que solo se asienta si el
usuario además estudia sus flashcards. Quien practique solo con test no lo
consigue nunca, y el priorizador se lo sirve indefinidamente.

No genera contenido: recibe un JSON con los ítems ya redactados y los inserta
con los campos de esquema que les faltan, numerando el id a continuación del
último de la sección.

    py -3.11 scripts/anadir_framings.py <items.json> <seccion>
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main(items_path, seccion):
    nuevos = json.load(io.open(items_path, encoding="utf-8"))
    path = os.path.join(ROOT, "data", "questions", seccion + ".json")
    arr = json.load(io.open(path, encoding="utf-8"))
    usados = set()
    for q in arr:
        m = re.match(r"^%s-(\d+)$" % re.escape(seccion), q["id"])
        if m:
            usados.add(int(m.group(1)))
    siguiente = max(usados) + 1

    creados = []
    for it in nuevos:
        qid = "%s-%d" % (seccion, siguiente)
        siguiente += 1
        q = {
            "id": qid,
            "sourceFile": seccion + ".json",
            "bloque": it["bloque"],
            "tipo": it["tipo"],
            "categoria": it["categoria"],
            "negativa": bool(it.get("negativa")),
            "section": seccion,
            "topic": it["topic"],
            "subtopic": None,
            "tema": it["tema"],
            "sourceQuestionId": "framing-%s-%02d" % (seccion, len(creados) + 1),
            "generado": True,
            "enunciado": it["enunciado"],
            "opciones": it.get("opciones", []),
            "matching": None,
            "respuesta": it["respuesta"],
            "explicacion": it["explicacion"],
        }
        # comprobaciones minimas
        if q["tipo"] == "opcion_unica":
            letras = [o["letter"] for o in q["opciones"]]
            assert len(q["opciones"]) == 4, qid + ": deben ser 4 opciones"
            assert q["respuesta"] in letras, qid + ": respuesta fuera de las opciones"
        if q["tipo"] == "verdadero_falso":
            assert q["respuesta"] in (True, False), qid + ": V/F necesita true/false"
            assert not q["opciones"], qid + ": V/F no lleva opciones"
        assert len(q["explicacion"]) >= 120, qid + ": explicacion demasiado corta"
        arr.append(q)
        creados.append((qid, it["topic"], it["tipo"]))

    io.open(path, "w", encoding="utf-8", newline="\n").write(
        json.dumps(arr, ensure_ascii=False, indent=2) + "\n")
    for qid, topic, tipo in creados:
        print("  + %-14s %-28s %s" % (qid, topic, tipo))
    print("Anadidas %d preguntas a %s.json (total %d)." % (len(creados), seccion, len(arr)))
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1], sys.argv[2]))
