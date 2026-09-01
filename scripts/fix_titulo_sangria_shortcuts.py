#!/usr/bin/env python3
"""
One-shot (ago-2026). Prueba en vivo del usuario (nivel 1):

  Ctrl+Mayús+1  -> aplica Título 1
  Ctrl+Mayús+2  -> NO aplica Título 2  (Título 2 es Alt+Ctrl+2)
  Ctrl+Mayús+3  -> aplica Título 3
  Ctrl+Mayús+R  -> NO quita la sangría (aunque atajos_oficial.json le asigne
                   "Quitar sangría"); para quitar sangrías se usa Ctrl+W,
                   que quita todo el formato de párrafo.

Corrige inicio-93 (emparejamiento de títulos), inicio-341 (explicación),
inicio-252 (emparejamiento de sangría) e inicio-352 (quitar sangría).
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(HERE, "data", "questions", "inicio.json")


def main():
    d = json.load(open(PATH, encoding="utf-8"))
    by = {q.get("sourceQuestionId"): q for q in d}

    # inicio-93: emparejamiento de títulos con atajos reales
    q = by["P-0344"]
    q["matching"] = {
        "left": [
            {"id": "1", "label": "Ctrl + Mayús + 1"},
            {"id": "2", "label": "Alt + Ctrl + 2"},
            {"id": "3", "label": "Ctrl + Mayús + 3"},
            {"id": "4", "label": "Ctrl + Mayús + A"},
        ],
        "right": [
            {"id": "A", "label": "Título 1"},
            {"id": "B", "label": "Título 2"},
            {"id": "C", "label": "Título 3"},
            {"id": "D", "label": "Estilo Normal"},
            {"id": "E", "label": "Título 4"},
        ],
        "correct": {"1": "A", "2": "B", "3": "C", "4": "D"},
    }
    q["respuesta"] = {"1": "A", "2": "B", "3": "C", "4": "D"}
    q["explicacion"] = (
        "En esta instalación: Ctrl+Mayús+1 aplica Título 1 y Ctrl+Mayús+3 "
        "aplica Título 3, pero Título 2 es Alt+Ctrl+2 (Ctrl+Mayús+2 NO hace "
        "nada). Ctrl+Mayús+A aplica el estilo Normal. Distractor E: Título 4 "
        "no tiene atajo directo fiable."
    )

    # inicio-341: quitar la afirmación no verificada sobre Alt+Ctrl+1
    q = by["8-272"]
    q["explicacion"] = (
        "Ctrl+Mayús+1 aplica el estilo Título 1 al párrafo (prueba en vivo). "
        "Ctrl+1 aplica interlineado sencillo. Alt+Mayús+1 muestra solo los "
        "títulos de nivel 1 en la vista Esquema. Alt+Ctrl+1 no aparece en la "
        "tabla oficial de atajos."
    )

    # inicio-252: emparejamiento de sangría sin Ctrl+Mayús+R
    q = by["P-0506"]
    q["matching"] = {
        "left": [
            {"id": "1", "label": "Ctrl + H"},
            {"id": "2", "label": "Ctrl + F"},
            {"id": "3", "label": "Ctrl + Mayús + H"},
            {"id": "4", "label": "Ctrl + W"},
        ],
        "right": [
            {"id": "A", "label": "Aplica sangría (izquierda) al párrafo"},
            {"id": "B", "label": "Aplica o quita la sangría francesa"},
            {"id": "C", "label": "Reduce la sangría francesa"},
            {"id": "D", "label": "Quita el formato de párrafo, sangrías incluidas"},
            {"id": "E", "label": "Abre el cuadro de diálogo Fuente"},
        ],
        "correct": {"1": "A", "2": "B", "3": "C", "4": "D"},
    }
    q["respuesta"] = {"1": "A", "2": "B", "3": "C", "4": "D"}
    q["explicacion"] = (
        "Ctrl+H aplica sangría izquierda. Ctrl+F aplica o quita la sangría "
        "francesa (primera línea fija, resto sangrado). Ctrl+Mayús+H reduce la "
        "sangría francesa. Ctrl+W quita todo el formato de párrafo, sangrías "
        "incluidas. Ojo: Ctrl+Mayús+R, al que la tabla oficial asigna 'quitar "
        "sangría', NO funciona en esta instalación. El distractor E (cuadro "
        "Fuente) es Ctrl+M."
    )

    # inicio-352: reformular "quitar sangría"
    q = by["8-283"]
    q["enunciado"] = ("En esta instalación de Word 365, ¿qué atajo elimina las "
                      "sangrías de un párrafo (junto con el resto de su formato "
                      "de párrafo)?")
    q["opciones"] = [
        {"letter": "A", "text": "Ctrl+W"},
        {"letter": "B", "text": "Ctrl+Mayús+R"},
        {"letter": "C", "text": "Ctrl+R"},
        {"letter": "D", "text": "Ctrl+H"},
    ]
    q["respuesta"] = "A"
    q["explicacion"] = (
        "Ctrl+W quita todo el formato de párrafo, sangrías incluidas (prueba "
        "en vivo). Ctrl+Mayús+R y Ctrl+R no hacen nada en esta versión, aunque "
        "la tabla oficial asigne a Ctrl+Mayús+R 'quitar sangría'. Ctrl+H "
        "aplica sangría, no la quita."
    )

    json.dump(d, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(PATH, "a", encoding="utf-8").write("\n")
    print("corregidas: inicio-93, inicio-341, inicio-252, inicio-352")


if __name__ == "__main__":
    main()
