#!/usr/bin/env python3
"""
Regenera questions_all.json y questions_data.js a partir de las fuentes
partidas en data/questions/ (por sourceFile, ver data/questions/manifest.json).

Uso:
    python3 build_data.py

Ejecuta esto tras editar cualquier fichero de data/questions/ (incluida
la incorporación de un bloque nuevo, p.ej. vista.json) o data/taxonomy.json.
build.py sigue empaquetando el HTML final a partir de questions_all.json
y taxonomy_data.js, así que este script es el paso previo cuando se toca
contenido de preguntas o taxonomía.

Validaciones que aplica antes de escribir nada:
  - ningún id repetido entre ficheros ni dentro de un fichero;
  - cada pregunta trae los campos mínimos (id, sourceFile, tipo, enunciado);
  - el fichero declarado en manifest.json existe.
No valida corrección pedagógica — solo integridad estructural. La
validación de "no se ha perdido/alterado ningún dato" respecto al banco
previo a la migración se hace aparte, comparando snapshots (ver
scripts/verify_split.py).
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_DIR = os.path.join(HERE, "data", "questions")
MANIFEST_PATH = os.path.join(QUESTIONS_DIR, "manifest.json")
TAXONOMY_PATH = os.path.join(HERE, "data", "taxonomy.json")

def main():
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        manifest = json.load(f)

    all_questions = []
    seen_ids = {}
    for filename in manifest:
        path = os.path.join(QUESTIONS_DIR, filename)
        if not os.path.isfile(path):
            raise SystemExit(f"Fichero declarado en manifest.json no existe: {filename}")
        with open(path, encoding="utf-8") as f:
            chunk = json.load(f)
        for q in chunk:
            for field in ("id", "sourceFile", "tipo", "enunciado"):
                if field not in q:
                    raise SystemExit(f"Pregunta sin campo obligatorio '{field}' en {filename}: {q.get('id','<sin id>')}")
            if q["id"] in seen_ids:
                raise SystemExit(f"ID duplicado '{q['id']}' entre {filename} y {seen_ids[q['id']]}")
            seen_ids[q["id"]] = filename
        all_questions.extend(chunk)

    out_json = json.dumps(all_questions, ensure_ascii=False)
    with open(os.path.join(HERE, "questions_all.json"), "w", encoding="utf-8") as f:
        f.write(out_json)

    data_js = "window.__OPE365_DATA__ = " + out_json.replace("</script", "<\\/script") + ";\n"
    with open(os.path.join(HERE, "questions_data.js"), "w", encoding="utf-8") as f:
        f.write(data_js)

    print(f"questions_all.json: {len(all_questions)} preguntas, {len(out_json):,} bytes")
    print(f"questions_data.js: {len(data_js):,} bytes")

    with open(TAXONOMY_PATH, encoding="utf-8") as f:
        taxonomy = json.load(f)
    taxonomy_json = json.dumps(taxonomy, ensure_ascii=False)
    taxonomy_js = "window.__OPE365_TAXONOMY__ = " + taxonomy_json.replace("</script", "<\\/script") + ";\n"
    with open(os.path.join(HERE, "taxonomy_data.js"), "w", encoding="utf-8") as f:
        f.write(taxonomy_js)
    print(f"taxonomy_data.js: {len(taxonomy_js):,} bytes")

if __name__ == "__main__":
    main()
