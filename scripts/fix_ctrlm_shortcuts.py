#!/usr/bin/env python3
"""
One-shot (ago-2026): Ctrl+M y Ctrl+Mayús+M según prueba en vivo del usuario.

  Ctrl+M        -> abre el cuadro de diálogo Fuente, con el foco en el campo
                   Fuente (nombre de la tipografía).
  Ctrl+Mayús+M  -> abre el cuadro de diálogo Fuente, con el foco en el campo
                   Tamaño. (No es la caja de la cinta; abre el diálogo.)

El banco heredado (inicio-354/355) los describía como "activar el campo de la
cinta"; se ajusta a lo observado.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(HERE, "data", "questions", "inicio.json")


def main():
    d = json.load(open(PATH, encoding="utf-8"))
    by = {q.get("sourceQuestionId"): q for q in d}

    # inicio-25: matiz sobre el campo con foco
    q = by["P-0025"]
    q["explicacion"] = (
        "Ctrl+M abre el cuadro de diálogo Fuente completo, con el foco puesto "
        "en el campo Fuente (nombre de la tipografía). Ctrl+Mayús+M abre el "
        "mismo cuadro pero con el foco en el campo Tamaño. Ctrl+Mayús+F actúa "
        "sobre el cuadro de fuente de la cinta, no abre el diálogo. Ctrl+F en "
        "la versión española aplica la sangría francesa."
    )

    # inicio-251: corregir la coletilla sobre Ctrl+Mayús+M
    q = by["P-0505"]
    q["explicacion"] = (
        "Ctrl+Mayús+H reduce la sangría francesa ya aplicada. Ctrl+F la aplica "
        "o la quita del todo. Ni Ctrl+Mayús+F ni Ctrl+Mayús+M tocan la sangría: "
        "Ctrl+Mayús+M abre el cuadro Fuente con el foco en el campo Tamaño. "
        "Confirmado en atajos_oficial.json y por prueba en vivo."
    )

    # inicio-354: era "campo de tamaño en la cinta" -> abre el cuadro Fuente
    q = by["8-286"]
    q["enunciado"] = ("¿Qué atajo abre el cuadro de diálogo Fuente con el foco "
                      "puesto directamente en el campo Tamaño en Word 365?")
    q["explicacion"] = (
        "Ctrl+Mayús+M abre el cuadro de diálogo Fuente con el cursor ya en el "
        "campo Tamaño, listo para teclear el valor. Ctrl+M abre el mismo cuadro "
        "pero con el foco en el campo Fuente (nombre). Ctrl+Mayús+F actúa sobre "
        "el cuadro de fuente de la cinta. Alt+Ctrl+M inserta un comentario."
    )

    # inicio-355: coletilla sobre Ctrl+Mayús+M
    q = by["8-287"]
    q["explicacion"] = (
        "Ctrl+Mayús+F activa el cuadro de nombre de fuente de la cinta. "
        "Ctrl+Mayús+M abre el cuadro de diálogo Fuente con el foco en el campo "
        "Tamaño. Ctrl+F aplica la sangría francesa al párrafo. Alt+Ctrl+F no "
        "aparece en la tabla oficial de atajos."
    )

    json.dump(d, open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(PATH, "a", encoding="utf-8").write("\n")
    print("corregidas: inicio-25, inicio-251, inicio-354, inicio-355")


if __name__ == "__main__":
    main()
