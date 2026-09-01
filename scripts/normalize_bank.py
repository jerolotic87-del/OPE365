#!/usr/bin/env python3
"""
One-shot (ago-2026): normaliza TODO el banco para que no queden restos de los
formatos heredados. Tras la reagrupación por pestaña, esto homogeneiza el
contenido de los 9 ficheros.

  1. Borra las 56 preguntas verdadero/falso auto-generadas (`8vf-*`,
     "Afirmación para valorar: «¿...?» — Respuesta propuesta: X").
  2. Reclasifica los `topic` heredados que no encajaban:
       - inicio `parrafo` -> parrafo-alineacion / -espaciado / -sangria /
         -marcas  o bien  estilos  (según el contenido).
       - vista/revisar `topic: null` -> `estructura` (preguntas sobre la
         estructura de la pestaña: grupos, ubicación, recuentos).
  3. Ajusta `data/taxonomy.json`: el `inicio > parrafo` se sustituye por sus
     7 subgrupos; `vista` y `revisar` reciben el grupo `estructura`.
  4. Regenera `bloque` = "<Sección> — <Grupo>" y `tema` = "<Grupo>" para
     TODAS las preguntas (a partir de section+topic de la taxonomía).
  5. Elimina campos muertos y dispersos: qnumInSource, sourcePage,
     blockRange, sourceIssue, esCompletarBlank, versionIssue.
  6. `generado`: se conserva solo cuando es True.
  7. Orden de claves canónico + `matching: null` explícito.
  8. Renumera <section>-1..N (las bajas de 8vf desplazan ids) y emite
     scripts/normalize_id_map.json.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(HERE, "data", "questions")
TAX = os.path.join(HERE, "data", "taxonomy.json")

DEAD_FIELDS = ("qnumInSource", "sourcePage", "blockRange", "sourceIssue",
               "esCompletarBlank", "versionIssue", "topicId")

KEY_ORDER = ["id", "sourceFile", "bloque", "tipo", "categoria", "negativa",
             "section", "topic", "subtopic", "tema", "difficulty",
             "sourceQuestionId", "generado",
             "enunciado", "opciones", "matching", "respuesta", "explicacion"]

# --- reclasificación de inicio topic=parrafo, por sourceQuestionId ---
INICIO_PARRAFO_REMAP = {
    "parrafo-alineacion": {"8-114", "8-115", "8-116", "8-279", "gen-atajo-2"},
    "parrafo-espaciado":  {"3-34", "8-153", "8-199", "8-200", "8-201"},
    "parrafo-sangria":    {"8-280", "8-281", "8-282", "8-283", "gen-atajo-7"},
    "parrafo-marcas":     {"8-124"},
    "estilos":            {"8-270", "8-272", "8-273", "8-274", "8-316",
                           "8-331", "8-332", "8-333", "gen-atajo-23"},
}

NEW_PARRAFO_TOPICS = [
    ("parrafo-marcas",        "Marcas de formato"),
    ("parrafo-alineacion",    "Alineación"),
    ("parrafo-sangria",       "Sangría"),
    ("parrafo-espaciado",     "Espaciado e interlineado"),
    ("parrafo-bordes",        "Bordes y sombreado"),
    ("parrafo-listas",        "Listas, viñetas y numeración"),
    ("parrafo-tabulaciones",  "Tabulaciones"),
]

PROCESS_ORDER = ["interfaz.json", "archivo.json", "inicio.json", "insertar.json",
                 "disposicion.json", "referencias.json", "revisar.json",
                 "vista.json", "correspondencia.json"]


def main():
    tax = json.load(open(TAX, encoding="utf-8"))

    # --- 3. editar taxonomía ---
    for s in tax["sections"]:
        if s["id"] == "inicio":
            s["topics"] = [t for t in s["topics"] if t["id"] != "parrafo"]
            for tid, tname in NEW_PARRAFO_TOPICS:
                s["topics"].append({"id": tid, "name": tname, "subtopics": []})
        if s["id"] in ("vista", "revisar"):
            if not any(t["id"] == "estructura" for t in s["topics"]):
                s["topics"].append({"id": "estructura",
                                    "name": "Estructura de la pestaña",
                                    "subtopics": []})

    sec_name = {s["id"]: s["name"] for s in tax["sections"]}
    topic_name = {(s["id"], t["id"]): t["name"]
                  for s in tax["sections"] for t in s["topics"]}

    # --- cargar preguntas ---
    files = [f for f in PROCESS_ORDER if os.path.isfile(os.path.join(QDIR, f))]
    originals = []
    for f in files:
        for q in json.load(open(os.path.join(QDIR, f), encoding="utf-8")):
            originals.append(q)

    # --- 1. borrar 8vf-* ---
    kept = [q for q in originals
            if not (q["tipo"] == "verdadero_falso"
                    and str(q.get("sourceQuestionId", "")).startswith("8vf-"))]
    print(f"borradas 8vf-*: {len(originals) - len(kept)}")

    # --- 2. reclasificar topics ---
    reclass = 0
    for q in kept:
        sq = q.get("sourceQuestionId")
        if q["section"] == "inicio" and q.get("topic") == "parrafo":
            for newt, ids in INICIO_PARRAFO_REMAP.items():
                if sq in ids:
                    q["topic"] = newt
                    reclass += 1
                    break
        if q["section"] in ("vista", "revisar") and q.get("topic") is None:
            q["topic"] = "estructura"
            reclass += 1
    print(f"topics reclasificados: {reclass}")

    # sanity: todo topic válido ahora
    bad = sorted({(q["section"], q.get("topic")) for q in kept
                  if (q["section"], q.get("topic")) not in topic_name})
    if bad:
        raise SystemExit(f"(section,topic) sin nombre en taxonomía: {bad}")

    # --- 4-7. normalizar campos + agrupar por sección ---
    by_section = {s["id"]: [] for s in tax["sections"]}
    for q in kept:
        by_section[q["section"]].append(q)

    id_map = {}
    manifest = []
    for s in tax["sections"]:
        sid = s["id"]
        group = by_section[sid]
        if not group:
            continue
        out = []
        for i, q in enumerate(group, start=1):
            tn = topic_name[(sid, q["topic"])]
            new = {}
            new["id"] = f"{sid}-{i}"
            id_map[q["id"]] = new["id"]
            new["sourceFile"] = f"{sid}.json"
            new["bloque"] = f"{sec_name[sid]} — {tn}"
            new["tipo"] = q["tipo"]
            new["categoria"] = q["categoria"]
            new["negativa"] = bool(q.get("negativa", False))
            new["section"] = sid
            new["topic"] = q["topic"]
            new["subtopic"] = q.get("subtopic")
            new["tema"] = tn
            if q.get("difficulty"):
                new["difficulty"] = q["difficulty"]
            new["sourceQuestionId"] = q.get("sourceQuestionId") or q["id"]
            if q.get("generado") is True:
                new["generado"] = True
            new["enunciado"] = q["enunciado"]
            new["opciones"] = q.get("opciones", [])
            new["matching"] = q.get("matching")
            new["respuesta"] = q["respuesta"]
            new["explicacion"] = q.get("explicacion", "")
            # (los DEAD_FIELDS simplemente no se copian)
            out.append(new)
        path = os.path.join(QDIR, f"{sid}.json")
        json.dump(out, open(path, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        open(path, "a", encoding="utf-8").write("\n")
        manifest.append(f"{sid}.json")
        print(f"  {sid}.json: {len(out)}")

    json.dump(manifest, open(os.path.join(QDIR, "manifest.json"), "w",
                             encoding="utf-8"), ensure_ascii=False, indent=2)
    open(os.path.join(QDIR, "manifest.json"), "a", encoding="utf-8").write("\n")

    json.dump(tax, open(TAX, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(TAX, "a", encoding="utf-8").write("\n")

    json.dump(id_map, open(os.path.join(HERE, "scripts", "normalize_id_map.json"),
                           "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    # --- flashcards questionRefs ---
    fcd = os.path.join(HERE, "data", "flashcards")
    for f in os.listdir(fcd):
        if f == "manifest.json" or not f.endswith(".json"):
            continue
        p = os.path.join(fcd, f)
        cards = json.load(open(p, encoding="utf-8"))
        n = 0
        for c in cards:
            qr = c.get("questionRefs")
            if qr:
                nn = [id_map.get(r, r) for r in qr]
                if nn != qr:
                    n += 1
                c["questionRefs"] = nn
        json.dump(cards, open(p, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        open(p, "a", encoding="utf-8").write("\n")
        print(f"  flashcards {f}: {n} tarjetas remapeadas")

    dangling = sorted({r for f in os.listdir(fcd) if f.endswith(".json") and f != "manifest.json"
                       for c in json.load(open(os.path.join(fcd, f), encoding="utf-8"))
                       for r in (c.get("questionRefs") or [])
                       if not r.startswith(tuple(sec_name))})
    print(f"total {len(kept)} preguntas. refs de flashcard raras: {dangling}")


if __name__ == "__main__":
    main()
