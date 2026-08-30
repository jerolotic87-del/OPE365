#!/usr/bin/env python3
"""
Script de un solo uso: divide questions_all.json en data/questions/*.json
por sourceFile, exactamente en el orden en que ya aparecen en el archivo
original (que ya está agrupado de forma contigua por sourceFile).

No modifica ningún contenido de las preguntas. Genera además
data/questions/manifest.json con el orden de carga.

Tras ejecutarlo, build_data.py reconstruye questions_all.json a partir de
estos ficheros y se compara byte a byte contra el original como
validación.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "questions_all.json")
OUT_DIR = os.path.join(HERE, "data", "questions")

# Nombre de fichero legible por cada sourceFile del banco actual.
FILENAME_BY_SOURCE = {
    "1.txt": "1.json",
    "2.txt": "2.json",
    "3.txt": "3.json",
    "4.txt": "4.json",
    "5.txt": "5.json",
    "6.txt": "6.json",
    "7.txt": "7.json",
    "8.txt": "8.json",
    "ATAJOS.docx": "atajos.json",
}

def main():
    with open(SRC, encoding="utf-8") as f:
        questions = json.load(f)

    groups = []  # [(filename, [questions...]), ...] en orden de aparición
    current_source = None
    current_group = None
    for q in questions:
        src = q.get("sourceFile")
        if src != current_source:
            if src not in FILENAME_BY_SOURCE:
                raise SystemExit(f"sourceFile desconocido, no mapeado: {src!r} (pregunta {q.get('id')})")
            filename = FILENAME_BY_SOURCE[src]
            # Si un sourceFile reapareciera más adelante (no contiguo),
            # es una señal de que el banco no está agrupado como se
            # asumía: abortar en vez de partir mal los datos.
            if any(g[0] == filename for g in groups):
                raise SystemExit(f"sourceFile no contiguo, abortando split mecánico: {src!r}")
            current_group = [filename, []]
            groups.append(current_group)
            current_source = src
        current_group[1].append(q)

    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = []
    for filename, qs in groups:
        path = os.path.join(OUT_DIR, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(qs, f, ensure_ascii=False, indent=2)
            f.write("\n")
        manifest.append(filename)
        print(f"{filename}: {len(qs)} preguntas")

    with open(os.path.join(OUT_DIR, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nTotal: {len(questions)} preguntas en {len(groups)} ficheros.")
    print(f"manifest.json escrito con el orden: {manifest}")

if __name__ == "__main__":
    main()
