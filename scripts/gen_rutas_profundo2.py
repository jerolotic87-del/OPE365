# -*- coding: utf-8 -*-
# Segunda pasada sobre data/rutas/referencias.txt: 40 lineas detectadas
# como no reflejadas todavia en el banco (algunas eran falsos positivos
# ya cubiertos con otra redaccion; se filtran a mano las 13 realmente
# nuevas y no redundantes) + 2 mas de correspondencia desde el PDF.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}
LETTERS = ["A", "B", "C", "D"]

def ou(topic, enun, opts, correct_i, expl, categoria="ruta", negativa=False):
    return ("opcion_unica", topic, categoria, enun, opts, LETTERS[correct_i], expl, negativa)

def vf(topic, enun, resp, expl, categoria="concepto"):
    return ("verdadero_falso", topic, categoria, enun, None, resp, expl, False)

def rl(topic, enun, resp, expl, categoria="ruta"):
    return ("relleno", topic, categoria, enun, None, resp, expl, False)

QUESTIONS = {
"referencias": [
 rl("tabla-contenido",
    "El desplegable «Tabla de contenido», además de Tabla automática 1/2 y Tabla manual, ofrece: [1], Tabla de contenido personalizada…, Quitar tabla de contenido y [2].",
    ["Más tablas de contenido de Office.com","Guardar selección en galería de tablas de contenido…"],
    "Las seis entradas completas del desplegable, sin contar las tres tablas integradas."),
 vf("tabla-contenido",
    "El cuadro Tabla de contenido muestra dos vistas previas a la vez: «Vista preliminar» (con números de página) y «Vista previa de Web» (con hipervínculos, sin números de página).",
    True, "Son las dos columnas del cuadro: una simula el documento impreso y la otra cómo se vería publicado como página web."),
 vf("tabla-contenido",
    "El campo «Carácter de relleno», presente en los cuadros Tabla de contenido, Tabla de ilustraciones e Índice, admite (ninguno), puntos suspensivos o guiones entre el texto y el número de página.",
    True, "Es el mismo campo y las mismas tres opciones en los tres cuadros que generan un listado con números de página."),
 ou("tabla-contenido",
    "En Opciones de tabla de contenido / Opciones de tabla de ilustraciones, ¿qué casilla incluye en la tabla los elementos marcados como «campo», además de los estilos elegidos?",
    ["Campos de elementos de tabla","Niveles de esquema","Restablecer","Mostrar niveles"], 0,
    "«Campos de elementos de tabla» sirve para que entre en la tabla el texto marcado a mano como campo (con Ctrl+F9), sin necesidad de estilo ni nivel de esquema."),
 vf("citas-bibliografia",
    "En el Administrador de fuentes, cada fuente aparece marcada como «fuente citada» o como «fuente de marcador de posición», según si ya se ha usado en una cita o solo se ha reservado el hueco con «Agregar nuevo marcador de posición…».",
    True, "Los dos iconos distintos del Administrador de fuentes distinguen fuentes completas de fuentes pendientes de rellenar."),
 ou("citas-bibliografia",
    "En el Administrador de fuentes, ¿qué dos listas se muestran una junto a la otra para poder copiar fuentes de una a otra?",
    ["Lista general y Lista actual","Lista general y Lista de marcadores","Fuentes citadas y Fuentes eliminadas","Estilo y Bibliografía"], 0,
    "«Lista general» son todas las fuentes guardadas alguna vez en el equipo; «Lista actual» son las del documento abierto."),
 rl("titulos",
    "El cuadro Numeración de títulos permite [1] delante del número (por ejemplo «Ilustración II-1») y elegir el [2] que los separa (un guion, por defecto).",
    ["incluir el número de capítulo","carácter separador"],
    "Las dos opciones del cuadro Numeración de títulos, además del formato de número (1,2,3 / a,b,c / A,B,C / i,ii,iii)."),
 vf("titulos",
    "El cuadro Referencia cruzada tiene una casilla «Incluir más adelante o más atrás», que añade automáticamente esa coletilla según si el elemento referenciado está antes o después en el documento.",
    True, "Word calcula solo, al insertar la referencia, si el elemento queda antes o después y añade el texto correspondiente."),
 vf("indice",
    "En el índice generado, una entrada puede remitir a otra en vez de a una página, mostrando «Véase» seguido del texto de la otra entrada (por ejemplo: «Asteroide. Véase Júpiter»).",
    True, "Es el resultado de marcar esa entrada con la opción «Referencia cruzada: Véase» en el cuadro Marcar entrada de índice, en vez de «Página actual»."),
 vf("indice",
    "El cuadro Índice permite elegir el idioma usado para ordenar alfabéticamente las entradas.",
    True, "El campo «Idioma» del cuadro Índice fija el criterio de ordenación alfabética (en esta instalación, Español (España))."),
 ou("titulos",
    "¿Qué botón del cuadro Título permite quitar un rótulo personalizado que ya no se necesita?",
    ["Eliminar rótulo","Excluir el rótulo del título","Autotítulo…","Numeración…"], 0,
    "«Eliminar rótulo» borra un rótulo de la lista (los tres rótulos de fábrica —Ecuación, Ilustración, Tabla— no se pueden eliminar)."),
 vf("titulos",
    "La casilla «Incluir rótulo y número», en el cuadro Tabla de ilustraciones, controla si la tabla muestra el rótulo completo (por ejemplo «Ilustración 1») o solo el texto del título.",
    True, "Si se desmarca, la tabla lista solo el texto que se escribió tras el rótulo, sin «Ilustración N»."),
],
"correspondencia": [
 vf("iniciar-combinacion",
    "El cuadro «Nueva lista de direcciones» trae por defecto columnas como Tratamiento, Nombre, Apellidos, Dirección, Ciudad, Provincia y Código postal, que se pueden cambiar con «Personalizar columnas…».",
    True, "Son las columnas estándar que Word propone al crear una lista de destinatarios desde cero."),
 ou("iniciar-combinacion",
    "¿Qué botón del cuadro Nueva lista de direcciones añade un destinatario más a la lista?",
    ["Nueva entrada","Eliminar entrada","Buscando…","Personalizar columnas…"], 0,
    "«Nueva entrada» añade una fila más a la tabla de destinatarios que se está creando."),
],
}

total = 0
for sec, rows in QUESTIONS.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    k = 0
    for tipo, topic, categoria, enun, extra, correct, expl, negativa in rows:
        k += 1
        tname = NAME[sec][topic]
        base = {
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": tipo, "categoria": categoria, "negativa": negativa,
            "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"rutas2-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [], "matching": None,
            "respuesta": correct, "explicacion": expl,
        }
        if tipo == "opcion_unica":
            base["opciones"] = [{"letter": LETTERS[i], "text": t} for i, t in enumerate(extra)]
        d.append(base)
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  total {len(d)}")
print("TOTAL nuevas:", total)
