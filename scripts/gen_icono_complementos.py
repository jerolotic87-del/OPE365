# -*- coding: utf-8 -*-
# Icono "Complementos" de inicio: se habia descartado por error como
# etiqueta de grupo (nombre de archivo distinto al patron "_nombre_grupo"
# que si lo es); revisado con calma tras el aviso del usuario sobre la
# calidad de los recortes, es un comando real ya recortado por el
# usuario, sin usar hasta ahora.
import json, base64

def datauri(path):
    b = open(path, "rb").read()
    return "data:image/png;base64," + base64.b64encode(b).decode("ascii")

f = "data/questions/inicio.json"
d = json.load(open(f, encoding="utf-8"))
n0 = max(int(q["id"].split("-")[-1]) for q in d)
uri = datauri("data/imagenes_iconos/inicio/complementos_complementos.png")
opciones = [
  {"letter": "A", "text": "Complementos"},
  {"letter": "B", "text": "Editor"},
  {"letter": "C", "text": "Dictar"},
  {"letter": "D", "text": "Traductor"},
]
d.append({
  "id": f"inicio-{n0+1}", "sourceFile": "inicio.json", "bloque": "Inicio — Complementos (icono)",
  "tipo": "opcion_unica", "categoria": "concepto", "negativa": False,
  "section": "inicio", "topic": "complementos", "subtopic": None, "tema": "Complementos",
  "sourceQuestionId": "img3-inicio-01", "generado": True,
  "enunciado": "Observa el icono de la imagen. ¿Qué comando de Word representa?",
  "imagen": uri, "opciones": opciones, "matching": None,
  "respuesta": "A",
  "explicacion": "**Complementos.** Pestaña Inicio ▸ grupo Complementos. Abre la galería/tienda de complementos de Office para instalar y gestionar add-ins desde el propio documento. No tiene atajo de teclado directo.",
})
json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
print("ok", len(d))
