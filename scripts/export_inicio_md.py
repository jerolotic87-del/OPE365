# -*- coding: utf-8 -*-
"""Exporta data/questions/inicio.json a Markdown legible: solo enunciado,
opciones, respuesta correcta y explicacion. Sin JSON, sin data URIs de
iconos (solo se anota "[pregunta con imagen]")."""
import json, collections

q = json.load(open("data/questions/inicio.json", encoding="utf-8"))
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TNAME = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == "inicio" for t in s["topics"]}
TORDER = {t["id"]: i for i, s in enumerate(tax["sections"]) if s["id"] == "inicio" for i, t in enumerate(s["topics"])}
TORDER = {t["id"]: i for s in tax["sections"] if s["id"] == "inicio" for i, t in enumerate(s["topics"])}

TIPO = {"opcion_unica": "Opción única", "seleccion_multiple": "Selección múltiple",
        "verdadero_falso": "Verdadero / Falso", "emparejamiento": "Emparejamiento",
        "relleno": "Rellenar huecos"}

by_topic = collections.OrderedDict()
for x in sorted(q, key=lambda r: (TORDER.get(r["topic"], 99), int(r["id"].split("-")[1]))):
    by_topic.setdefault(x["topic"], []).append(x)

out = []
out.append("# Banco de preguntas — Pestaña **Inicio** (Word 365)\n")
out.append(f"{len(q)} preguntas · generado desde `data/questions/inicio.json`\n")
out.append("Solo enunciado, opciones, respuesta y explicación. "
           "Las preguntas con icono se marcan `[pregunta con imagen]` "
           "(el icono no se reproduce aquí).\n")

def fmt_resp(x):
    t = x["tipo"]
    op = {o["letter"]: o["text"] for o in x.get("opciones") or []}
    if t == "opcion_unica":
        r = x["respuesta"]
        return f"**{r})** {op.get(r, '')}"
    if t == "seleccion_multiple":
        rs = x["respuesta"] if isinstance(x["respuesta"], list) else [x["respuesta"]]
        return "; ".join(f"**{r})** {op.get(r, '')}" for r in rs)
    if t == "verdadero_falso":
        return "**Verdadero**" if x["respuesta"] in (True, "true") else "**Falso**"
    if t == "emparejamiento":
        m = x.get("matching") or {}
        left = {l["id"]: l["label"] for l in m.get("left", [])}
        right = {r["id"]: r["label"] for r in m.get("right", [])}
        corr = x["respuesta"] if isinstance(x["respuesta"], dict) else (m.get("correct") or {})
        return "; ".join(f"{left.get(k, k)} → {right.get(v, v)}" for k, v in corr.items())
    if t == "relleno":
        parts = []
        for i, acc in enumerate(x["respuesta"], 1):
            if isinstance(acc, list):
                parts.append(f"[{i}] {acc[0]}" + (f" _(tambien: {', '.join(acc[1:])})_" if len(acc) > 1 else ""))
            else:
                parts.append(f"[{i}] {acc}")
        return " · ".join(parts)
    return str(x["respuesta"])

n = 0
for topic, items in by_topic.items():
    out.append(f"\n---\n\n## {TNAME.get(topic, topic)}  ·  {len(items)} preguntas\n")
    for x in items:
        n += 1
        neg = " · ⚠️ NEGATIVA (pide la opción FALSA / EXCEPTO)" if x.get("negativa") else ""
        img = "  `[pregunta con imagen]`" if x.get("imagen") else ""
        out.append(f"### {n}. {x['id']} · {TIPO.get(x['tipo'], x['tipo'])}{neg}{img}\n")
        out.append(f"**P:** {x['enunciado'].strip()}\n")
        ops = x.get("opciones") or []
        if ops and x["tipo"] in ("opcion_unica", "seleccion_multiple"):
            for o in ops:
                out.append(f"- {o['letter']}) {o['text']}")
            out.append("")
        if x["tipo"] == "emparejamiento":
            m = x.get("matching") or {}
            out.append("Columna A: " + " | ".join(l["label"] for l in m.get("left", [])))
            out.append("")
            out.append("Columna B: " + " | ".join(r["label"] for r in m.get("right", [])))
            out.append("")
        out.append(f"**Respuesta:** {fmt_resp(x)}\n")
        if x.get("explicacion"):
            out.append(f"**Explicación:** {x['explicacion'].strip()}\n")

open("data/questions/inicio_legible.md", "w", encoding="utf-8").write("\n".join(out) + "\n")
print("escrito data/questions/inicio_legible.md ·", n, "preguntas")
