#!/usr/bin/env python3
"""
Verifica la integridad estructural de questions_all.json y, opcionalmente,
lo compara contra una instantánea anterior (otro fichero JSON con el mismo
formato, p.ej. una copia de antes de una migración) para listar qué IDs
se han añadido, quitado o modificado.

Uso:
    python3 scripts/verify_bank.py
    python3 scripts/verify_bank.py --baseline ruta/a/questions_all.antes.json
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def report_integrity(questions, label):
    print(f"=== {label}: integridad estructural ===")
    print(f"Total: {len(questions)}")
    ids = [q.get("id") for q in questions]
    dupes = {i for i in ids if ids.count(i) > 1}
    print(f"IDs duplicados: {len(dupes)}" + (f" -> {sorted(dupes)}" if dupes else ""))
    missing_fields = []
    for q in questions:
        for field in ("id", "sourceFile", "tipo", "enunciado", "respuesta"):
            if field not in q:
                missing_fields.append((q.get("id", "<sin id>"), field))
    print(f"Campos obligatorios ausentes: {len(missing_fields)}" + (f" -> {missing_fields[:10]}" if missing_fields else ""))
    by_type = {}
    for q in questions:
        by_type[q.get("tipo")] = by_type.get(q.get("tipo"), 0) + 1
    print(f"Por tipo: {by_type}")
    by_cat = {}
    for q in questions:
        by_cat[q.get("categoria")] = by_cat.get(q.get("categoria"), 0) + 1
    print(f"Por categoria: {by_cat}")
    ok = not dupes and not missing_fields
    print("RESULTADO:", "OK" if ok else "FALLO")
    return ok

def compare(current, baseline):
    print("\n=== Comparación contra baseline ===")
    cur_by_id = {q["id"]: q for q in current}
    base_by_id = {q["id"]: q for q in baseline}
    added = sorted(set(cur_by_id) - set(base_by_id))
    removed = sorted(set(base_by_id) - set(cur_by_id))
    changed = []
    for qid in sorted(set(cur_by_id) & set(base_by_id)):
        if cur_by_id[qid] != base_by_id[qid]:
            changed.append(qid)
    print(f"Añadidos: {len(added)}")
    print(f"Eliminados: {len(removed)}" + (f" -> {removed}" if removed else ""))
    print(f"Modificados (contenido distinto para el mismo id): {len(changed)}" + (f" -> {changed[:20]}" if changed else ""))
    return added, removed, changed

def main():
    args = sys.argv[1:]
    baseline_path = None
    if "--baseline" in args:
        baseline_path = args[args.index("--baseline") + 1]

    current = load(os.path.join(HERE, "questions_all.json"))
    ok = report_integrity(current, "questions_all.json actual")

    if baseline_path:
        baseline = load(baseline_path)
        report_integrity(baseline, "baseline")
        compare(current, baseline)

    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main()
