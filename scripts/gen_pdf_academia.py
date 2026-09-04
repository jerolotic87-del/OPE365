# -*- coding: utf-8 -*-
# Contenido tomado de los PDF de la academia (Beatriz R.T.) que el usuario
# aporto como fuente de confianza: "14. Combinacion de correspondencia" y
# "16. Pestana Referencias". Rellena huecos reales: correspondencia solo
# tenia preguntas en 1 de sus 5 topics (los otros 4 a 0), y
# referencias:investigacion no tenia NINGUNA (0 preguntas, 0 flashcards).
# Contrastado tambien con tests genericos (daypo) sin atajos especificos,
# sin riesgo de esquema de teclado distinto.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}

def q_ou(topic, enun, opts, correct, expl, categoria="concepto"):
    return ("opcion_unica", topic, categoria, enun, opts, correct, expl)

def q_vf(topic, enun, resp, expl, categoria="concepto"):
    return ("verdadero_falso", topic, categoria, enun, None, resp, expl)

QUESTIONS = {
"correspondencia": [
 q_ou("crear-sobres-etiquetas",
  "¿Qué comando del grupo Crear de Correspondencia inserta la dirección y el remite en un sobre?",
  ["Sobres","Etiquetas","Iniciar combinación de correspondencia","Bloque de direcciones"], "A",
  "«Sobres» abre el cuadro de diálogo que permite elegir el tipo de sobre e insertar dirección y remite."),
 q_ou("crear-sobres-etiquetas",
  "¿Qué comando del grupo Crear permite generar una hoja de etiquetas repetidas a partir de una medida y un contenido?",
  ["Sobres","Etiquetas","Seleccionar destinatarios","Finalizar y combinar"], "B",
  "«Etiquetas» abre el cuadro de diálogo para elegir el tipo/medida de etiqueta antes de rellenarla."),
 q_vf("crear-sobres-etiquetas",
  "Al combinar etiquetas, Word muestra primero una tabla que simula las etiquetas que se imprimirán; tras rellenar la primera hay que pulsar «Actualizar etiquetas» para replicar el contenido en el resto.",
  True, "Es el flujo real: se rellenan los campos en la primera etiqueta y «Actualizar etiquetas» copia ese contenido al resto de la hoja."),
 q_vf("crear-sobres-etiquetas",
  "El cuadro de diálogo de Sobres permite elegir el tipo de sobre antes de generarlo.",
  True, "El cuadro de Sobres deja elegir el tamaño/tipo de sobre, además de las opciones de impresión."),
 q_ou("iniciar-combinacion",
  "¿Qué comando del grupo Iniciar combinación de correspondencia permite indicar qué tipo de documento se va a usar (carta, sobre, etiquetas, mensaje de correo…)?",
  ["Seleccionar destinatarios","Iniciar combinación de correspondencia","Editar lista de destinatarios","Insertar campo combinado"], "B",
  "«Iniciar combinación de correspondencia» es el primer paso: elige el tipo de documento final."),
 q_ou("iniciar-combinacion",
  "¿Qué comando permite indicar dónde está la lista de destinatarios, crear una nueva o usar los contactos de Outlook?",
  ["Seleccionar destinatarios","Iniciar combinación de correspondencia","Resaltar campos de combinación","Reglas"], "A",
  "«Seleccionar destinatarios» conecta el documento a una lista existente (Word/Excel/Access), crea una nueva o usa los contactos de Outlook."),
 q_vf("iniciar-combinacion",
  "La lista de destinatarios existente puede ser una tabla de Word, un libro de Excel o una base de datos de Access, siempre que esté organizada con los campos en columnas y cada registro en una fila.",
  True, "Es el requisito estructural de cualquier origen de datos para la combinación."),
 q_vf("iniciar-combinacion",
  "Al crear una lista nueva de destinatarios, no se pueden personalizar las columnas: hay que usar siempre las que trae Word por defecto.",
  False, "Falso: «Personalizar columnas» permite cambiar las columnas por defecto por las propias."),
 q_ou("finalizar",
  "¿Qué comando del grupo Finalizar genera el resultado final de la combinación (a un documento nuevo, a la impresora o al correo electrónico)?",
  ["Vista previa de resultados","Finalizar y combinar","Comprobación de errores","Editar lista de destinatarios"], "B",
  "«Finalizar y combinar» es el último paso: vuelca la combinación en un documento nuevo, la manda a imprimir o al correo."),
 q_vf("finalizar",
  "«Finalizar y combinar» es el último paso del proceso de combinación de correspondencia.",
  True, "Tras revisar la vista previa, «Finalizar y combinar» cierra el proceso generando el resultado."),
 q_ou("vista-previa-resultados",
  "¿Qué permite hacer «Vista previa de resultados» en Correspondencia?",
  ["Ver los campos combinados sustituidos por los datos reales, pudiendo pasar de un registro a otro o buscar un destinatario",
   "Cambiar el estilo del documento antes de combinar", "Elegir el tipo de sobre", "Conectar con una nueva lista de destinatarios"], "A",
  "Muestra los datos reales en lugar de los nombres de campo, con navegación entre registros y búsqueda de un destinatario concreto."),
 q_vf("vista-previa-resultados",
  "Desde Vista previa de resultados se puede buscar un destinatario concreto dentro de la lista.",
  True, "El grupo incluye un comando de búsqueda de destinatario, además de la navegación registro a registro."),
 q_ou("campos-combinacion",
  "¿Qué atajo inserta un campo de combinación de correspondencia en el punto del cursor?",
  ["Alt+Mayús+J","Alt+Mayús+D","Alt+Mayús+M","Alt+Mayús+K"], "A",
  "Alt+Mayús+J inserta un campo de combinación de correspondencia (los otros tres son Combinar en documento, Combinar al imprimir y Revisar combinación)."),
 q_vf("campos-combinacion",
  "«Reglas», dentro de Escribir e insertar campos, permite insertar condiciones (Si…Entonces…Si no) que cambian el contenido del documento según el destinatario.",
  True, "«Reglas» añade lógica condicional y otros campos especiales a la combinación."),
 q_ou("campos-combinacion",
  "¿Qué comando de Escribir e insertar campos añade automáticamente el nombre, la calle, la ciudad y el código postal en un único bloque, con el formato que se indique?",
  ["Bloque de direcciones","Línea de saludo","Insertar campo combinado","Resaltar campos de combinación"], "A",
  "«Bloque de direcciones» inserta de una vez el conjunto completo de datos de dirección con el formato elegido."),
],
"referencias": [
 q_ou("investigacion",
  "¿Qué comando del grupo Investigación de Referencias abre un panel de búsqueda para ayudarte a encontrar información sobre lo que estás escribiendo?",
  ["Buscar","Investigador","Administrar fuentes","Insertar cita"], "A",
  "«Buscar» abre un panel de búsqueda de información relacionada con el texto del documento."),
 q_ou("investigacion",
  "¿Qué comando del grupo Investigación ayuda a buscar citas, fuentes e imágenes sobre personas, hechos históricos, etc.?",
  ["Buscar","Investigador","Estilo","Bibliografía"], "B",
  "«Investigador» está orientado a la investigación de fuentes citables: personas, hechos históricos, datos verificables…"),
 q_vf("investigacion",
  "El grupo Investigación de la pestaña Referencias incluye los comandos Buscar e Investigador.",
  True, "Son los dos únicos comandos de ese grupo."),
 q_vf("investigacion",
  "El comando Investigador solo permite buscar imágenes, no citas ni fuentes.",
  False, "Falso: Investigador busca citas, fuentes e imágenes, no solo imágenes."),
 q_ou("notas",
  "¿Qué secuencia de teclas abre el cuadro «Notas al pie y notas al final» (el mismo que abre el iniciador de cuadro de diálogo del grupo)?",
  ["Alt, K, C","Alt, R, N","Alt, S, N","Alt, K, N"], "A",
  "Alt, K, C abre el cuadro Notas al pie y notas al final, igual que el icono iniciador del grupo."),
 q_vf("tabla-contenido",
  "Se puede hacer que un texto aparezca en la tabla de contenido aunque no tenga estilo de título, aplicándole el formato de párrafo «Nivel de esquema».",
  True, "Es una de las tres formas de que un texto entre en la TDC: estilo Título, «Nivel de esquema» en formato de párrafo, o marcarlo como campo."),
 q_vf("titulos",
  "Si la tabla de ilustraciones solo debe mostrar los títulos con un rótulo concreto (p. ej. solo «Tabla»), hay que elegir ese rótulo en «Opciones»; el estilo «Descripción» incluye en cambio TODOS los rótulos de título del documento.",
  True, "«Opciones» ▸ «Estilo: Descripción» es el que Word aplica a los títulos al insertarlos e incluye todos los rótulos; elegir un rótulo concreto filtra la tabla a solo ese tipo."),
 q_vf("tabla-autoridades",
  "La Tabla de autoridades agrupa las citas legales del documento (casos, estatutos, normas…) por categoría, de forma parecida a como la Tabla de contenido agrupa los títulos.",
  True, "Es el propósito de la Tabla de autoridades: un índice de referencias legales agrupadas por tipo, con las páginas donde aparecen."),
 q_vf("tabla-autoridades",
  "Para que una cita entre en la Tabla de autoridades hace falta marcarla antes, igual que ocurre con las entradas del Índice.",
  True, "Igual que el índice necesita «Marcar entrada», la tabla de autoridades necesita «Marcar cita» antes de generarse."),
],
}

def build_question(section, n, kind, topic, categoria, enun, opts, correct, expl):
    tname = NAME[section][topic]
    base = {
        "id": None, "sourceFile": f"{section}.json", "bloque": f"{section.capitalize()} — {tname}",
        "tipo": kind, "categoria": categoria, "negativa": False,
        "section": section, "topic": topic, "subtopic": None, "tema": tname,
        "sourceQuestionId": f"pdf-{section}-{n:02d}", "generado": True,
        "enunciado": enun, "opciones": [], "matching": None,
        "respuesta": correct, "explicacion": expl,
    }
    if kind == "opcion_unica":
        letters = ["A","B","C","D"]
        base["opciones"] = [{"letter": letters[i], "text": t} for i, t in enumerate(opts)]
    return base

total = 0
for sec, rows in QUESTIONS.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (kind, topic, categoria, enun, opts, correct, expl) in enumerate(rows, 1):
        q = build_question(sec, k, kind, topic, categoria, enun, opts, correct, expl)
        q["id"] = f"{sec}-{n0+k}"
        d.append(q)
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  total {len(d)}")
print("TOTAL nuevas preguntas:", total)

# ---------- flashcards: referencias:investigacion (0 -> 3) ----------
FC = [
 ("investigacion", "Abre un panel de búsqueda para ayudarte a encontrar información sobre lo que estás escribiendo.", "Buscar (grupo Investigación de Referencias)"),
 ("investigacion", "Ayuda a buscar citas, fuentes e imágenes sobre personas, hechos históricos y otros temas verificables.", "Investigador (grupo Investigación de Referencias)"),
 ("investigacion", "¿Cuántos comandos tiene el grupo Investigación de la pestaña Referencias?", "Dos: Buscar e Investigador."),
]
fpath = "data/flashcards/referencias.json"
fd = json.load(open(fpath, encoding="utf-8"))
n0 = max(int(c["cardId"].split("-")[1]) for c in fd)
for i, (topic, front, back) in enumerate(FC, 1):
    fd.append({
        "cardId": "F-%03d" % (n0 + i), "section": "referencias", "topic": topic,
        "subtopic": None, "cardType": "contenido", "priority": "normal",
        "front": front, "back": back, "sourceRefs": ["PDF academia — Pestaña Referencias (Beatriz R.T.)"],
        "knowledgeRefs": [], "questionRefs": [],
    })
json.dump(fd, open(fpath, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(fpath, "a", encoding="utf-8").write("\n")
print(f"{fpath}: +{len(FC)} flashcards -> total {len(fd)}")
