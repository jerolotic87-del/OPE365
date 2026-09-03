# -*- coding: utf-8 -*-
"""One-shot: añade archivo-337, pregunta de concepto sobre la barra de
acceso rápido (distinción clave del examen, verificada por el usuario con
aulaClic). Ejecutar una vez + `python build_data.py`."""
import json, io, sys

PATH = "data/questions/archivo.json"
d = json.load(io.open(PATH, encoding="utf-8"))
nums = [int(q["id"].split("-")[1]) for q in d if q["id"].startswith("archivo-")]
n = max(nums) + 1

q = {
    "id": f"archivo-{n}",
    "sourceFile": "archivo.json",
    "bloque": "Archivo — Opciones",
    "tipo": "opcion_unica",
    "categoria": "general",
    "negativa": False,
    "section": "archivo",
    "topic": "opciones-personalizar",
    "subtopic": "Barra de herramientas de acceso rápido",
    "tema": "Opciones",
    "sourceQuestionId": "opc-bar-14",
    "generado": True,
    "enunciado": "Sobre la barra de herramientas de acceso rápido de Word 365, ¿cuál de estas afirmaciones es correcta?",
    "opciones": [
        {"letter": "A", "text": "Su personalización es total, pero solo se pueden agregar comandos, no listas ni estilos individuales"},
        {"letter": "B", "text": "Solo admite los comandos que Microsoft define por defecto; no se puede añadir ninguno más"},
        {"letter": "C", "text": "Su personalización tiene las mismas limitaciones que la cinta de opciones"},
        {"letter": "D", "text": "Puede contener comandos, listas desplegables y estilos, igual que un grupo de la cinta"},
    ],
    "matching": None,
    "respuesta": "A",
    "explicacion": "A diferencia de la cinta de opciones, la personalización de la barra de acceso rápido es total: puedes quitar y reordenar todo. Pero solo admite comandos sueltos: no galerías, listas desplegables ni estilos individuales. Sus botones predeterminados son Guardar automáticamente, Guardar, Deshacer, Rehacer y Personalizar.",
}

d.append(q)
json.dump(d, io.open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
sys.stdout.buffer.write(f"añadida {q['id']}\n".encode("utf-8"))
