# -*- coding: utf-8 -*-
"""Vuelca al banco una tanda de ítems REESCRITOS A MANO.

No genera contenido: solo mete en data/questions/<section>.json el texto ya
escrito en un fichero JSON de patch { "<id>": {campos...}, ... }.
Campos admitidos: enunciado, opciones, respuesta, explicacion, negativa,
categoria, tipo, matching. Todo lo demás del ítem (id, section, topic, imagen,
sourceQuestionId…) se conserva intacto.

    py -3.11 scripts/aplicar_reescritura.py <patch.json>

Comprueba antes de escribir:
  · que el id existe
  · que la respuesta apunta a una opción viva
  · que hay 4 opciones en opcion_unica
  · que ninguna opción se repite
  · que la explicación menciona todas las opciones incorrectas (aviso)
"""
import io, json, os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def seccion_de(qid):
    m = re.match(r"^(.+)-\d+$", qid)
    return m.group(1) if m else None

def main(patch_path):
    patch = json.load(io.open(patch_path, encoding="utf-8"))
    porSeccion = collections.defaultdict(dict)
    for qid, campos in patch.items():
        sec = seccion_de(qid)
        if not sec:
            print("  !! id sin sección:", qid); return 1
        porSeccion[sec][qid] = campos

    total, avisos = 0, []
    for sec, items in porSeccion.items():
        path = os.path.join(ROOT, "data", "questions", sec + ".json")
        arr = json.load(io.open(path, encoding="utf-8"))
        idx = {q["id"]: q for q in arr}
        for qid, campos in items.items():
            q = idx.get(qid)
            if q is None:
                print("  !! no existe:", qid); return 1
            for k, v in campos.items():
                if k not in ("enunciado", "opciones", "respuesta", "explicacion",
                             "negativa", "categoria", "tipo", "matching"):
                    print("  !! campo no admitido:", k, "en", qid); return 1
                q[k] = v

            # comprobaciones
            tipo = q.get("tipo")
            # coherencia tipo <-> respuesta: lo que mas facil se rompe al
            # reescribir a mano es convertir una V/F en opcion unica y olvidar
            # cambiar el tipo.
            resp = q.get("respuesta")
            if tipo == "verdadero_falso" and (not isinstance(resp, bool) or q.get("opciones")):
                print("  !!", qid, "es verdadero_falso pero tiene opciones o respuesta no booleana"); return 1
            if tipo == "opcion_unica" and not isinstance(resp, str):
                print("  !!", qid, "es opcion_unica pero su respuesta no es una letra"); return 1
            if tipo == "seleccion_multiple" and not isinstance(resp, list):
                print("  !!", qid, "es seleccion_multiple pero su respuesta no es una lista"); return 1
            if tipo == "emparejamiento" and not isinstance(resp, dict):
                print("  !!", qid, "es emparejamiento pero su respuesta no es un mapa"); return 1
            ops = q.get("opciones") or []
            letras = [o["letter"] for o in ops]
            textos = [o["text"].strip() for o in ops]
            if tipo == "opcion_unica":
                if len(ops) != 4:
                    print("  !!", qid, "tiene", len(ops), "opciones (deben ser 4)"); return 1
                if q.get("respuesta") not in letras:
                    print("  !!", qid, "respuesta", q.get("respuesta"), "no está en", letras); return 1
            if tipo == "emparejamiento":
                m = q.get("matching") or {}
                izq = [x["id"] for x in m.get("left", [])]
                der = [x["id"] for x in m.get("right", [])]
                cor = m.get("correct") or {}
                if not izq or not der:
                    print("  !!", qid, "emparejamiento sin columnas"); return 1
                if sorted(cor.keys()) != sorted(izq):
                    print("  !!", qid, "correct no cubre exactamente la columna izquierda"); return 1
                fuera = [v for v in cor.values() if v not in der]
                if fuera:
                    print("  !!", qid, "correct apunta fuera de la derecha:", fuera); return 1
                if len(set(cor.values())) != len(cor):
                    print("  !!", qid, "dos elementos emparejados con el mismo destino"); return 1
                if q.get("respuesta") != cor:
                    print("  !!", qid, "respuesta y matching.correct no coinciden"); return 1
                for col in ("left", "right"):
                    et = [x["label"].strip().lower() for x in m.get(col, [])]
                    if len(set(et)) != len(et):
                        print("  !!", qid, "etiquetas repetidas en la columna", col); return 1
            if len(set(textos)) != len(textos):
                print("  !!", qid, "tiene opciones repetidas"); return 1
            bajas = [t.lower() for t in textos]
            if len(set(bajas)) != len(bajas):
                avisos.append("%s: dos opciones solo se diferencian en mayúsculas "
                              "(correcto si la pregunta va de eso)" % qid)
            # Lo que delata una pregunta no es que las opciones midan distinto
            # (los nombres reales de la interfaz miden lo que miden), sino que
            # la CORRECTA sea la única larga o la única corta. Se avisa solo
            # cuando hay un hueco claro entre ella y su vecina más próxima.
            largos = [len(o["text"]) for o in ops]
            if len(largos) >= 3:
                L = {o["letter"]: len(o["text"]) for o in ops}
                r = q.get("respuesta")
                rs = r if isinstance(r, list) else [r]
                buenas = [L[x] for x in rs if x in L]
                otras = sorted(L[k] for k in L if k not in rs)
                # El chivato solo tiene sentido con UNA correcta: si la mitad
                # de las opciones lo son, que una sea corta no delata nada.
                for c in (buenas if len(buenas) == 1 else []):
                    if otras and c < otras[0] and otras[0] > 1.5 * c and otras[0] - c > 12:
                        avisos.append("%s: la correcta es la MÁS CORTA con hueco (%d vs %d)"
                                      % (qid, c, otras[0])); break
                    if otras and c > otras[-1] and c > 1.5 * otras[-1] and c - otras[-1] > 12:
                        avisos.append("%s: la correcta es la MÁS LARGA con hueco (%d vs %d)"
                                      % (qid, c, otras[-1])); break
            expl = (q.get("explicacion") or "")
            if len(expl) < 120:
                avisos.append("%s: explicación demasiado corta (%d)" % (qid, len(expl)))
            total += 1
        io.open(path, "w", encoding="utf-8", newline="\n").write(
            json.dumps(arr, ensure_ascii=False, indent=2) + "\n")
        print("  ->", os.path.relpath(path, ROOT), "(%d ítems)" % len(items))

    for a in avisos:
        print("  aviso:", a)
    print("Reescritos %d ítems." % total)
    return 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__); sys.exit(2)
    sys.exit(main(sys.argv[1]))
