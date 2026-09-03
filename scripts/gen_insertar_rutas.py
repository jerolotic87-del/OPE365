# -*- coding: utf-8 -*-
"""One-shot: 172 preguntas de RUTA de la pestaña Insertar (P-01..P-172)
desde D:/Descargas/JSON/Insertar_Rutas_4opciones.txt -> data/questions/insertar.json.
Todas categoria=ruta, generado=true. IDs insertar-46.. (cola tras las 45 de atajo).
"""
import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

SRC = r"D:/Descargas/JSON/Insertar_Rutas_4opciones.txt"
OUT = "data/questions/insertar.json"

# P-number -> (topic, tema, bloque suffix) via la tabla-resumen del propio archivo
def topic_for(n):
    if 1 <= n <= 6:   return ("paginas", "Páginas")
    if n in range(7,14) or n in range(73,76): return ("tablas", "Tablas")
    if 14 <= n <= 27 or 76 <= n <= 98: return ("ilustraciones", "Ilustraciones")
    if n in (28,29):  return ("multimedia", "Multimedia")
    if n in range(30,38) or n in range(99,104): return ("vinculos", "Vínculos")
    if n == 38:       return ("comentarios", "Comentarios")
    if n in range(39,45) or n in range(104,118): return ("encabezado-pie", "Encabezado y pie de página")
    if n in range(45,56) or n in range(118,138): return ("texto", "Texto")
    if n in range(56,65) or n in range(138,160): return ("simbolos", "Símbolos")
    if n in (65,66):  return ("esignature", "eSignature")
    if n in range(67,73) or n in range(160,173): return ("formato-forma", "Formato de forma")
    raise ValueError(f"P-{n} sin topic")

raw = open(SRC, encoding="utf-8").read()
# corta la cruft de chat / resúmenes: nos quedamos con bloques "P-NN ... Respuesta correcta: X Trampa: ..."
# normaliza saltos
lines = [l.rstrip() for l in raw.split("\n")]

# localizar cada pregunta: línea que empieza por "P-<n> " (y no "P-<n> (retomo"/"(completada" salvo que traiga todo)
Q = {}
i = 0
pat_p = re.compile(r"^P-(\d+)\b(.*)$")
pat_opt = re.compile(r"^A\.\s+(.*?)\s+B\.\s+(.*?)\s+C\.\s+(.*?)\s+D\.\s+(.*)$")
pat_ans = re.compile(r"Respuesta correcta:\s*([A-D])\b\s*(?:Trampa:\s*(.*))?$", re.S)

while i < len(lines):
    m = pat_p.match(lines[i])
    if not m:
        i += 1; continue
    n = int(m.group(1))
    # enunciado: resto de la línea + líneas siguientes hasta encontrar la línea de opciones
    head = m.group(2).strip()
    # quitar marcadores "(completada)" "(retomo exactamente donde quedé)" etc.
    head = re.sub(r"^\((?:completada|retomo[^)]*)\)\s*", "", head, flags=re.I)
    j = i + 1
    enun_parts = [head] if head else []
    opts = None
    while j < len(lines):
        ln = lines[j].strip()
        if not ln:
            j += 1; continue
        mo = pat_opt.match(ln)
        if mo:
            opts = [mo.group(k).strip() for k in range(1,5)]
            j += 1
            break
        if pat_p.match(lines[j]):   # otra P sin opciones -> era un corte, descartar
            break
        enun_parts.append(ln)
        j += 1
    if opts is None:
        i += 1; continue   # pregunta cortada; la versión completa vendrá luego
    # respuesta + trampa: siguientes líneas no vacías hasta otra P- / cabecera de grupo
    ans = None; trampa_parts = []
    while j < len(lines):
        ln = lines[j].strip()
        if not ln:
            j += 1
            if ans is not None:   # doble salto tras la explicación -> fin
                # pero puede continuar; seguimos hasta P- o header
                pass
            continue
        if pat_p.match(lines[j]):
            break
        if re.match(r"^(GRUPO:|[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ \u2014\-]{4,}$)", ln) and ans is not None:
            break
        if ln.startswith("Claude Sonnet") or ln in ("sigue",) or ln.startswith("Retomo") \
           or ln.startswith("Resumen") or ln.startswith("¿Cont") or ln.startswith("Eso cubre") \
           or ln.startswith("Aquí el resumen") or ln.startswith("pero hay muchas") \
           or ln.startswith("Tienes razón") or ln.startswith("Perfecto") or ln.startswith("Opción ") \
           or ln.startswith("Cada pregunta tiene") or ln.startswith("Son aproximadamente") \
           or ln.startswith("Lo que ") or ln.startswith("✅") or ln.startswith("Grupo\t") \
           or "\t" in ln:
            break
        ma = pat_ans.search(ln)
        if ma and ans is None:
            ans = ma.group(1)
            if ma.group(2): trampa_parts.append(ma.group(2).strip())
        elif ans is not None:
            trampa_parts.append(ln)
        j += 1
    if ans is None:
        i += 1; continue
    enun = " ".join(enun_parts).strip()
    trampa = " ".join(trampa_parts).strip()
    # la versión completa (más larga / con trampa no vacía) gana
    prev = Q.get(n)
    cand = (enun, opts, ans, trampa)
    if not prev or (len(trampa) > len(prev[3])):
        Q[n] = cand
    i = j

print(f"parseadas {len(Q)} preguntas (esperadas 172)")
missing = [n for n in range(1,173) if n not in Q]
if missing:
    print("FALTAN:", missing)

# --- construir entradas ---
bank = json.load(open(OUT, encoding="utf-8"))
start_id = max(int(q["id"].split("-")[1]) for q in bank) + 1   # 46
letters = ["A","B","C","D"]
new = []
for k, n in enumerate(sorted(Q)):
    enun, opts, ans, trampa = Q[n]
    topic, tema = topic_for(n)
    new.append({
        "id": f"insertar-{start_id + k}",
        "sourceFile": "insertar.json",
        "bloque": f"Insertar — {tema}",
        "tipo": "opcion_unica",
        "categoria": "ruta",
        "negativa": False,
        "section": "insertar",
        "topic": topic,
        "subtopic": None,
        "tema": tema,
        "sourceQuestionId": f"P-{n:02d}",
        "generado": True,
        "enunciado": enun,
        "opciones": [{"letter": letters[x], "text": opts[x]} for x in range(4)],
        "matching": None,
        "respuesta": ans,
        "explicacion": trampa,
    })

# sanity
bad = [q["id"] for q in new if not q["enunciado"] or not q["explicacion"] or len(q["opciones"])!=4 or q["respuesta"] not in letters]
if bad:
    print("ENTRADAS DEFECTUOSAS:", bad); sys.exit(1)

bank.extend(new)
json.dump(bank, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"escrito {OUT}: {len(bank)} preguntas ({len(new)} nuevas, insertar-{start_id}..insertar-{start_id+len(new)-1})")

from collections import Counter
print("por topic:", dict(Counter(q["topic"] for q in new)))
