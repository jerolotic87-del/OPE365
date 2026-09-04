# -*- coding: utf-8 -*-
# Eje "emparejamiento": 6 de 10 pestanas estaban a 0%. Se anaden solo
# donde existe una LISTA CERRADA de origen ya verificada en el propio
# banco (tamanos de papel, presets de margenes, extensiones de archivo,
# comandos de un grupo...) - nunca conceptos sueltos sin pareja natural
# corta (por eso no se toca "modelos 3D" ni nada parecido). Reformatea
# hechos que ya tienen su propia pregunta opcion_unica/verdadero_falso
# verificada en la misma seccion.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}

LEFT_IDS = list("123456")
RIGHT_IDS = list("ABCDEF")

def M(section, topic, enunciado, pairs, explicacion, categoria="concepto"):
    """pairs: lista de (left_label, right_label) en el orden correcto.
    El lado derecho se guarda barajado (rotado) para que no coincida 1:1."""
    n = len(pairs)
    left = [{"id": LEFT_IDS[i], "label": pairs[i][0]} for i in range(n)]
    # baraja el lado derecho con una rotacion fija (evita el orden trivial)
    rot = 1 if n > 1 else 0
    right_order = list(range(n))
    right_order = right_order[rot:] + right_order[:rot]
    right = [{"id": RIGHT_IDS[i], "label": pairs[right_order[i]][1]} for i in range(n)]
    correct = {}
    for li in range(n):
        ri = right_order.index(li)
        correct[LEFT_IDS[li]] = RIGHT_IDS[ri]
    return (section, topic, categoria, enunciado, left, right, correct, explicacion)

Q = [
M("disposicion","configurar-pagina",
  "Relaciona cada tamaño de papel con sus medidas exactas en esta instalación:",
  [("A4","21 × 29,7 cm"), ("Carta","21,59 × 27,94 cm"), ("Oficio","21,59 × 35,56 cm"),
   ("A5","14,8 × 21 cm"), ("Tabloide","27,94 × 43,18 cm")],
  "A4 21×29,7 · Carta 21,59×27,94 (8,5×11 pulgadas) · Oficio mismo ancho que Carta pero 35,56 de alto · A5 es la mitad exacta de un A4 · Tabloide es el doble de un Carta."),
M("disposicion","configurar-pagina",
  "Relaciona cada preajuste de márgenes con su valor exacto en esta instalación:",
  [("Normal","2,5 cm arriba/abajo, 3 cm izquierda/derecha"),
   ("Estrecho","1,27 cm en los cuatro lados"),
   ("Moderado","2,54 cm arriba/abajo, 1,91 cm izquierda/derecha"),
   ("Ancho","2,54 cm arriba/abajo, 5,08 cm izquierda/derecha"),
   ("Reflejado","sustituye izquierda/derecha por Interior/Exterior")],
  "Los cinco preajustes del desplegable Márgenes de Configurar página, con sus valores reales (v2608)."),
M("disposicion","configurar-pagina",
  "Relaciona cada tipo de salto de sección con lo que hace:",
  [("Página siguiente","empieza la sección nueva en la página siguiente"),
   ("Continua","empieza la sección nueva en la misma página, sin pasar de página"),
   ("Página par","empieza la sección nueva en la siguiente página par"),
   ("Página impar","empieza la sección nueva en la siguiente página impar")],
  "Los cuatro saltos de sección del menú Saltos, distintos del salto de página simple."),
M("disposicion","organizar",
  "Relaciona cada ficha del cuadro Diseño (objeto flotante) con lo que controla:",
  [("Posición","dónde se sitúa el objeto respecto a la página o los márgenes"),
   ("Ajuste del texto","cómo fluye el texto alrededor del objeto"),
   ("Tamaño","el alto y el ancho del objeto")],
  "El cuadro Diseño («Más opciones de diseño…») tiene exactamente estas tres fichas."),
M("referencias","titulos",
  "Relaciona cada rótulo de fábrica del cuadro Título con lo que numera:",
  [("Ilustración","imágenes y gráficos"), ("Ecuación","fórmulas matemáticas insertadas"),
   ("Tabla","datos organizados en filas y columnas")],
  "Los tres rótulos que trae Word por defecto en el cuadro Título (no «Figura», pese a ser el término más usado coloquialmente)."),
M("referencias","citas-bibliografia",
  "Relaciona cada comando del grupo Citas y bibliografía con lo que hace:",
  [("Estilo","elige el formato de cita: APA, MLA, Chicago…"),
   ("Insertar cita","añade una cita en el punto del cursor a partir de una fuente"),
   ("Administrar fuentes","muestra la lista general y la lista actual de fuentes usadas"),
   ("Bibliografía","genera automáticamente el listado final de referencias")],
  "Los cuatro comandos principales del grupo Citas y bibliografía de la pestaña Referencias."),
M("referencias","tabla-contenido",
  "Relaciona cada botón del cuadro Tabla de contenido con lo que hace:",
  [("Opciones…","genera la tabla a partir de los estilos concretos que elijas"),
   ("Modificar…","edita el aspecto de los estilos TDC 1 a TDC 9 (no los de Título)")],
  "«Opciones» controla de qué estilos se nutre la tabla; «Modificar» retoca el aspecto de los propios estilos TDC, no los estilos Título del documento."),
M("archivo","guardar",
  "Relaciona cada extensión con el tipo de archivo de Word 365:",
  [(".docx","documento normal, sin macros"), (".docm","documento habilitado para macros"),
   (".dotx","plantilla, sin macros"), (".dotm","plantilla habilitada para macros")],
  "El sufijo «m» siempre indica que el archivo admite macros de VBA; «x» indica que no las admite."),
M("archivo","opciones-revision",
  "Relaciona cada opción de Autoformato con lo que hace:",
  [("Estilos de títulos integrados","aplica un estilo de título a una línea corta sin puntuación seguida de Entrar dos veces"),
   ("Definir estilos basándose en el formato personal","crea un estilo nuevo a partir de un formato repetido aplicado a mano"),
   ("Estilos de lista","aplica estilos de lista a párrafos con aspecto de lista"),
   ("Otros estilos de párrafo","aplica otros estilos de párrafo distintos de título y lista")],
  "Cuatro de las opciones que controla Autoformato / Autoformato mientras escribe, en Opciones ▸ Revisión."),
M("diseno","formato-documento",
  "Relaciona cada comando de Diseño ▸ Formato del documento con lo que cambia:",
  [("Colores","solo la paleta de color del tema"), ("Fuentes","solo el conjunto de fuentes de título y cuerpo"),
   ("Espaciado entre párrafos","el interlineado y el espacio entre párrafos de todo el documento"),
   ("Efectos","las sombras y biseles de formas y gráficos SmartArt")],
  "Cada comando del grupo Formato del documento cambia un único aspecto del formato global, sin tocar los demás."),
M("diseno","fondo-pagina",
  "Relaciona cada comando de Diseño ▸ Fondo de página con lo que hace:",
  [("Marca de agua","inserta un texto o imagen fantasma detrás del contenido de cada página"),
   ("Color de página","aplica un color de fondo a todas las páginas"),
   ("Bordes de página","añade un borde decorativo alrededor del margen")],
  "Los tres comandos del grupo Fondo de página."),
M("insertar","vinculos",
  "Relaciona cada atajo con lo que inserta o hace:",
  [("Ctrl+Mayús+F5","inserta un marcador"), ("Alt+Ctrl+A","inserta un comentario"),
   ("Alt+F3","crea un Autotexto a partir de la selección"), ("Alt+X","alterna el carácter bajo el cursor con su código Unicode")],
  "Cuatro atajos ya verificados en el banco, agrupados aquí en un único emparejamiento."),
]

by_sec = {}
for row in Q:
    by_sec.setdefault(row[0], []).append(row)

total = 0
for sec, rows in by_sec.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (_, topic, categoria, enun, left, right, correct, expl) in enumerate(rows, 1):
        tname = NAME[sec][topic]
        d.append({
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": "emparejamiento", "categoria": categoria, "negativa": False,
            "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"emp-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [],
            "matching": {"left": left, "right": right, "correct": correct},
            "respuesta": correct, "explicacion": expl,
        })
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    emp = sum(1 for q in d if q["tipo"] == "emparejamiento")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  emparejamiento {emp}/{len(d)} ({100*emp/len(d):.1f}%)")
print("TOTAL nuevas:", total)
