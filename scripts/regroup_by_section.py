#!/usr/bin/env python3
"""
Script de un solo uso (ago-2026): reagrupa TODO el banco de preguntas por
pestaña (campo `section` de la taxonomía) en vez de por documento de origen.

Antes:  data/questions/{1..8}.json + atajos.json + vista.json + revision.json
        + inicio.json  (troceo por sourceFile: "1.txt", "8.txt", "ATAJOS.docx"...)
Después: data/questions/<section>.json  (interfaz, archivo, inicio, insertar,
        disposicion, referencias, revisar, vista, correspondencia)

Qué hace con cada pregunta:
  - id        -> "<section>-<n>"   (n correlativo dentro de la sección)
  - sourceFile-> "<section>.json"
  - sourceQuestionId -> el id viejo, SOLO si la pregunta no lo tenía ya
  - resto de campos: intactos (bloque, contentHash, questionVersion, enunciado,
    opciones, respuesta, explicacion, section/topic/subtopic, difficulty...)

`contentHash` no depende de id ni de sourceFile (ver contentHash() en app.js),
así que no se recalcula nada.

Orden de renumeración: se recorren los ficheros en PROCESS_ORDER y, dentro de
cada sección, se conserva el orden de aparición. inicio.json (banco nuevo
curado) se procesa primero para que sus 286 preguntas queden inicio-1..286.

Salidas auxiliares en el directorio indicado por --map-dir (por defecto cwd):
  id_map.json  -> { id_viejo: id_nuevo }

Tras ejecutarlo:
  1. remapear questionRefs de data/flashcards/*.json con id_map.json
  2. python build_data.py
  3. tests
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(HERE, "data", "questions")
TAXONOMY_PATH = os.path.join(HERE, "data", "taxonomy.json")

# Orden en que se leen los ficheros de origen. inicio.json primero para que el
# banco nuevo de Inicio conserve la numeración 1..286.
PROCESS_ORDER = [
    "inicio.json", "vista.json", "revision.json",
    "1.json", "2.json", "3.json", "4.json", "5.json", "6.json", "7.json",
    "8.json", "atajos.json",
]

OLD_FILES_TO_DELETE = [
    "1.json", "2.json", "3.json", "4.json", "5.json", "6.json", "7.json",
    "8.json", "atajos.json", "revision.json",
]

# Campos que este script SÍ puede cambiar. Cualquier otra diferencia contra el
# original para la misma pregunta es un bug -> la verificación aborta.
MUTABLE_FIELDS = {"id", "sourceFile", "sourceQuestionId"}


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--map-dir", default=os.getcwd())
    ap.add_argument("--apply", action="store_true",
                    help="sin esto solo hace un dry-run y verifica")
    args = ap.parse_args()

    taxonomy = load(TAXONOMY_PATH)
    section_order = [s["id"] for s in sorted(taxonomy["sections"],
                                            key=lambda s: s.get("order", 0))]
    valid_sections = set(section_order)

    # Lee todos los ficheros de origen.
    present = [f for f in PROCESS_ORDER if os.path.isfile(os.path.join(QDIR, f))]
    missing = [f for f in PROCESS_ORDER if not os.path.isfile(os.path.join(QDIR, f))]
    if missing:
        print(f"AVISO: no encontrados (se ignoran): {missing}")

    originals = []  # lista de (pregunta_original_dict) en orden de proceso
    for fn in present:
        for q in load(os.path.join(QDIR, fn)):
            originals.append(q)

    # Validación previa.
    for q in originals:
        sec = q.get("section")
        if sec not in valid_sections:
            raise SystemExit(f"section inválida {sec!r} en pregunta {q.get('id')}")
    old_ids = [q["id"] for q in originals]
    if len(old_ids) != len(set(old_ids)):
        dup = sorted({i for i in old_ids if old_ids.count(i) > 1})
        raise SystemExit(f"ids viejos duplicados: {dup}")

    # Agrupa por sección conservando orden de aparición.
    by_section = {sid: [] for sid in section_order}
    for q in originals:
        by_section[q["section"]].append(q)

    # Renumera.
    id_map = {}
    new_files = []  # [(filename, [preguntas_nuevas])]
    for sid in section_order:
        group = by_section[sid]
        if not group:
            continue
        out = []
        for i, q in enumerate(group, start=1):
            new = dict(q)  # copia superficial; no mutamos el original
            new_id = f"{sid}-{i}"
            id_map[q["id"]] = new_id
            new["id"] = new_id
            new["sourceFile"] = f"{sid}.json"
            if not new.get("sourceQuestionId"):
                new["sourceQuestionId"] = q["id"]
            out.append(new)
        new_files.append((f"{sid}.json", out))

    # --- Verificación: cada pregunta nueva == vieja salvo MUTABLE_FIELDS ---
    orig_by_id = {q["id"]: q for q in originals}
    inv = {v: k for k, v in id_map.items()}
    problems = []
    total_new = 0
    for _, out in new_files:
        for new in out:
            total_new += 1
            old = orig_by_id[inv[new["id"]]]
            keys = set(new) | set(old)
            for k in keys:
                if k in MUTABLE_FIELDS:
                    continue
                if new.get(k) != old.get(k):
                    problems.append((new["id"], inv[new["id"]], k))
    if problems:
        for p in problems[:30]:
            print("DIFF INESPERADA:", p)
        raise SystemExit(f"{len(problems)} diferencias fuera de {MUTABLE_FIELDS}")

    if total_new != len(originals):
        raise SystemExit(f"recuento: {total_new} nuevas vs {len(originals)} viejas")

    # Informe.
    print(f"Total: {len(originals)} preguntas -> {len(new_files)} ficheros de sección")
    for fn, out in new_files:
        print(f"  {fn}: {len(out)}")
    manifest = [fn for fn, _ in new_files]
    print(f"manifest: {manifest}")

    map_path = os.path.join(args.map_dir, "id_map.json")
    with open(map_path, "w", encoding="utf-8") as f:
        json.dump(id_map, f, ensure_ascii=False, indent=1)
    print(f"id_map.json -> {map_path}")

    if not args.apply:
        print("\nDRY-RUN. Repite con --apply para escribir.")
        return

    for fn, out in new_files:
        with open(os.path.join(QDIR, fn), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
            f.write("\n")
    with open(os.path.join(QDIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    for fn in OLD_FILES_TO_DELETE:
        p = os.path.join(QDIR, fn)
        if os.path.isfile(p):
            os.remove(p)
            print(f"borrado {fn}")
    print("HECHO.")


if __name__ == "__main__":
    main()
