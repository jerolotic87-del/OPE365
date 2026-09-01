#!/usr/bin/env python3
"""
One-shot (ago-2026): corrige el bloque de atajos de sangría del banco curado
`inicio.json`, que venía de aulaclic con Ctrl+F = "sangría de primera línea".

Prueba en vivo del usuario (nivel 1): Ctrl+F deja la primera línea donde está
y mete sangría en las siguientes -> es SANGRÍA FRANCESA. Coincide con
`atajos_oficial.json` y con CLAUDE.md ("Ctrl+F = Sangría francesa"), y con el
banco heredado (inicio-350). Correcciones asociadas, todas contra
`atajos_oficial.json`:

  Ctrl+F        = Sangría francesa
  Ctrl+H        = Sangría (izquierda)
  Ctrl+Mayús+H  = Reducir sangría francesa
  Ctrl+Mayús+R  = Quitar sangría
  Ctrl+M        = Formato de fuente (abre el cuadro Fuente) -- NO sangría
  Ctrl+Mayús+M  = activa el campo Tamaño de fuente de la cinta -- NO sangría
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(HERE, "data", "questions", "inicio.json")


def main():
    d = json.load(open(PATH, encoding="utf-8"))
    by = {q.get("sourceQuestionId"): q for q in d}

    # inicio-250: "aplica o quita la sangría francesa" -> Ctrl+F
    q = by["P-0504"]
    q["enunciado"] = "¿Qué atajo aplica o quita la sangría francesa en Word 365 (versión española)?"
    q["respuesta"] = "A"  # Ctrl + F
    q["explicacion"] = (
        "En la versión española de Word 365, Ctrl+F aplica o quita la sangría "
        "francesa: la primera línea del párrafo se queda donde está y el resto "
        "de líneas se separan del margen izquierdo. Ctrl+M abre el cuadro de "
        "diálogo Fuente. Ctrl+T centra el párrafo. Ctrl+Mayús+F activa el campo "
        "de fuente en la cinta. (En la versión inglesa Ctrl+F abre el buscador.)"
    )

    # inicio-251: repurpose -> "¿qué atajo REDUCE la sangría francesa?" -> Ctrl+Mayús+H
    q = by["P-0505"]
    q["enunciado"] = "¿Qué atajo reduce la sangría francesa de un párrafo en Word 365 (versión española)?"
    q["opciones"] = [
        {"letter": "A", "text": "Ctrl + Mayús + H"},
        {"letter": "B", "text": "Ctrl + F"},
        {"letter": "C", "text": "Ctrl + Mayús + F"},
        {"letter": "D", "text": "Ctrl + Mayús + M"},
    ]
    q["respuesta"] = "A"
    q["explicacion"] = (
        "Ctrl+Mayús+H reduce la sangría francesa ya aplicada. Ctrl+F la aplica "
        "o la quita del todo. Ctrl+Mayús+F activa el campo de nombre de fuente "
        "en la cinta y Ctrl+Mayús+M el de tamaño de fuente: ninguno de los dos "
        "toca la sangría. Confirmado en atajos_oficial.json."
    )

    # inicio-252: emparejamiento -> solo atajos confirmados en atajos_oficial.json
    q = by["P-0506"]
    q["matching"] = {
        "left": [
            {"id": "1", "label": "Ctrl + H"},
            {"id": "2", "label": "Ctrl + F"},
            {"id": "3", "label": "Ctrl + Mayús + H"},
            {"id": "4", "label": "Ctrl + Mayús + R"},
        ],
        "right": [
            {"id": "A", "label": "Aplica sangría (izquierda) al párrafo"},
            {"id": "B", "label": "Aplica o quita la sangría francesa"},
            {"id": "C", "label": "Reduce la sangría francesa"},
            {"id": "D", "label": "Quita toda la sangría del párrafo"},
            {"id": "E", "label": "Abre el cuadro de diálogo Fuente"},
        ],
        "correct": {"1": "A", "2": "B", "3": "C", "4": "D"},
    }
    q["respuesta"] = {"1": "A", "2": "B", "3": "C", "4": "D"}
    q["explicacion"] = (
        "Ctrl+H aplica sangría izquierda. Ctrl+F aplica o quita la sangría "
        "francesa (primera línea fija, resto sangrado). Ctrl+Mayús+H reduce la "
        "sangría francesa. Ctrl+Mayús+R quita toda la sangría. El distractor E "
        "(abrir el cuadro Fuente) es Ctrl+M, que no es un atajo de sangría."
    )

    # inicio-264: opción D correcta como estaba (excluida); corregir explicación
    q = by["P-0518"]
    q["explicacion"] = (
        "En la versión española de Word 365: Ctrl+N es negrita, Ctrl+K es "
        "cursiva, Ctrl+S es subrayado sencillo y Ctrl+B abre el panel de "
        "navegación. La opción D es incorrecta porque Ctrl+F en español aplica "
        "la sangría francesa, no abre el buscador (eso es Ctrl+F en la versión "
        "inglesa)."
    )

    # inicio-275: texto de la opción C + explicación
    q = by["P-0529"]
    for o in q["opciones"]:
        if o["letter"] == "C":
            o["text"] = "Ctrl+F (español: sangría francesa / inglés: buscar)"
    q["explicacion"] = (
        "Los atajos A, B, C y D tienen comportamiento diferente entre "
        "versiones. Ctrl+E: español selecciona todo, inglés centra. Ctrl+B: "
        "español abre el panel de navegación, inglés aplica negrita. Ctrl+F: "
        "español aplica la sangría francesa, inglés abre el buscador. Ctrl+L: "
        "español abre Reemplazar, inglés alinea a la izquierda. Ctrl+Z es "
        "universal: deshace en ambas versiones."
    )

    # inicio-276: etiqueta right C + explicación
    q = by["P-0530"]
    for r in q["matching"]["right"]:
        if r["id"] == "C":
            r["label"] = "Aplicar o quitar la sangría francesa"
    q["explicacion"] = (
        "Versión española de Word 365: Ctrl+E selecciona todo (inglés: centra). "
        "Ctrl+B abre navegación (inglés: negrita). Ctrl+F aplica la sangría "
        "francesa (inglés: buscar). Ctrl+L abre Reemplazar (inglés: alinear a "
        "la izquierda). Ctrl+T centra (inglés: tabulación). El distractor F "
        "(negrita) corresponde a Ctrl+N en español."
    )

    json.dump(d, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(PATH, "a", encoding="utf-8").write("\n")
    print("corregidas: inicio-250, inicio-251, inicio-252, inicio-264, "
          "inicio-275, inicio-276  (Ctrl+F = sangría francesa)")


if __name__ == "__main__":
    main()
