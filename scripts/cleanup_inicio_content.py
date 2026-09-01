#!/usr/bin/env python3
"""
Script de un solo uso (ago-2026): limpieza de contenido de data/questions/inicio.json
tras la reagrupación por pestaña.

Hace 4 cosas:
  1. BORRA 18 preguntas verdadero/falso auto-generadas ("Afirmación para valorar:
     «¿...?» — Respuesta propuesta: X"), procedentes de 8vf-*. Cada una era una
     reescritura mecánica de una opcion_unica hermana que sigue en el banco.
  2. BORRA 6 duplicados exactos ya cubiertos por el banco curado nuevo.
  3. CORRIGE explicaciones/respuestas contra `atajos_oficial.json` (nivel 2 de la
     regla de oro):
       - Ctrl+Mayús+S = Subrayado  (NO "abre Aplicar estilo")
       - Ctrl+Mayús+W = Panel Aplicar estilos
       - Ctrl+R      = sin acción asignada  (NO "cierra el documento")
  4. REMAPEA categoria "procedimiento" (~80 preguntas del banco nuevo, 5º valor
     fuera del registro de app.js) -> "ruta".

Luego renumera inicio-1..N contiguo y reescribe el fichero.
Ejecutar después: python build_data.py  +  tests.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(HERE, "data", "questions", "inicio.json")

# --- 1. 18 V/F auto-generadas (por sourceQuestionId) ---
DELETE_8VF = {f"8vf-{n}" for n in
              (3, 4, 7, 9, 10, 11, 15, 17, 20, 21, 23, 24, 26, 27, 34, 35, 36, 73)}

# --- 2. duplicados exactos (por sourceQuestionId) ---
DELETE_DUPS = {
    "8-110",  # Ctrl+E selecciona todo  -> dup de P-0388 (inicio-140)
    "8-119",  # Ctrl+M abre Fuente      -> dup de P-0025 (inicio-25)
    "8-139",  # qué hace Ctrl+S         -> dup de 8-107 (inicio-290) + P-0537
    "8-164",  # Ctrl+B búsq. inteligente-> verbatim de 8-112 (inicio-295)
    "8-334",  # F5 abre Ir a            -> verbatim de 8-113 (inicio-296)
    "8-335",  # Ctrl+I alt Ir a         -> cubierto por inicio-296 + P-0377
}
DELETE = DELETE_8VF | DELETE_DUPS


def fix_explanations(by_sqid):
    # inicio-13 (P-0013): distractor F del emparejamiento
    q = by_sqid["P-0013"]
    for r in q["matching"]["right"]:
        if r["id"] == "F":
            r["label"] = "Ctrl + Mayus + W"
    q["explicacion"] = (
        "Negrita: Ctrl+N. Cursiva: Ctrl+K. Subrayado sencillo: Ctrl+S. "
        "Subrayado doble: Ctrl+Mayus+D. Subrayado solo palabras: Ctrl+Mayus+P. "
        "El distractor F (Ctrl+Mayus+W) abre el panel Aplicar estilos, no es un "
        "formato de fuente."
    )

    # inicio-90 (P-0337): panel lateral de Estilos (resp. B, no cambia)
    q = by_sqid["P-0337"]
    q["explicacion"] = (
        "El panel lateral de Estilos se abre usando el lanzador de cuadro de "
        "diálogo del grupo Estilos, situado en la esquina inferior derecha del "
        "grupo en la cinta. Ctrl+Mayús+S aplica subrayado; el cuadro flotante "
        "Aplicar estilo se abre con Ctrl+Mayús+W, y ambos son distintos del "
        "panel lateral completo."
    )

    # inicio-91 (P-0342): CAMBIA respuesta C -> B
    q = by_sqid["P-0342"]
    assert q["respuesta"] == "C"
    q["respuesta"] = "B"
    q["explicacion"] = (
        "Ctrl+Mayús+W abre el cuadro Aplicar estilo, que permite escribir o "
        "seleccionar el nombre de un estilo para aplicarlo rápidamente "
        "(confirmado en atajos_oficial.json / cuadro Personalizar teclado). "
        "Ctrl+Mayús+S aplica subrayado. Ctrl+Mayús+A aplica el estilo Normal. "
        "Ctrl+M abre el cuadro de diálogo Fuente."
    )

    # inicio-92 (P-0343): resp. C no cambia, corregir última frase
    q = by_sqid["P-0343"]
    q["explicacion"] = (
        "Ctrl+Mayús+A aplica el estilo Normal al párrafo o texto seleccionado. "
        "Ctrl+Mayús+N aplica el formato negrita. Ctrl+Q elimina el formato de "
        "párrafo. Ctrl+Mayús+S aplica subrayado."
    )

    # inicio-298 (8-115): Ctrl+R no cierra el documento
    q = by_sqid["8-115"]
    q["explicacion"] = (
        "Ctrl+D alinea a la derecha en español. Ctrl+R no tiene ninguna acción "
        "asignada en esta instalación (no aparece en atajos_oficial.json). "
        "Ctrl+J justifica. Ctrl+T centra."
    )

    # inicio-356 (8-283): Ctrl+R no figura en la tabla oficial
    q = by_sqid["8-283"]
    q["explicacion"] = (
        "Ctrl+Mayús+R quita la sangría del párrafo. Ctrl+R no aparece en la "
        "tabla oficial (atajos_oficial.json): no tiene acción asignada. "
        "Ctrl+H aplica sangría. Ctrl+Mayús+H reduce la sangría francesa."
    )


def main():
    d = json.load(open(PATH, encoding="utf-8"))
    before = len(d)

    kept = [q for q in d if q.get("sourceQuestionId") not in DELETE]
    removed = before - len(kept)
    if removed != len(DELETE):
        found = {q.get("sourceQuestionId") for q in d}
        raise SystemExit(f"borradas {removed} != {len(DELETE)}; "
                         f"no encontradas: {sorted(DELETE - found)}")

    by_sqid = {q["sourceQuestionId"]: q for q in kept}
    fix_explanations(by_sqid)

    procedimiento = 0
    for q in kept:
        if q.get("categoria") == "procedimiento":
            q["categoria"] = "ruta"
            procedimiento += 1

    # renumera contiguo
    for i, q in enumerate(kept, start=1):
        q["id"] = f"inicio-{i}"
        q["sourceFile"] = "inicio.json"

    json.dump(kept, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(PATH, "a", encoding="utf-8").write("\n")

    print(f"inicio.json: {before} -> {len(kept)} preguntas")
    print(f"  borradas 8vf-* auto V/F: {len(DELETE_8VF)}")
    print(f"  borrados duplicados: {len(DELETE_DUPS)}  ({sorted(DELETE_DUPS)})")
    print(f"  categoria procedimiento -> ruta: {procedimiento}")
    print("  explicaciones corregidas: P-0013, P-0337, P-0342(resp C->B), "
          "P-0343, 8-115, 8-283")


if __name__ == "__main__":
    main()
