# -*- coding: utf-8 -*-
# Repaso adicional de las paginas-imagen de los 2 PDF de la academia:
# ni correspondencia.json ni referencias.json tenian NINGUNA pregunta de
# tipo seleccion_multiple (enfoque distinto: varias respuestas correctas
# a la vez). Se anaden usando: (a) listas cerradas ya verificadas
# reformateadas a "cuales SI son reales" con distractores inventados
# pero claramente marcados como tal en la explicacion, y (b) datos de los
# EJEMPLOS concretos de las capturas (la lista de destinatarios de
# muestra, el remite del sobre, la fuente bibliografica de ejemplo) -
# lectura del propio documento, no invencion.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}
LETTERS = ["A", "B", "C", "D", "E"]

def sm(topic, enun, opts, correct_idx, expl, categoria="ruta"):
    return ("seleccion_multiple", topic, categoria, enun, opts, [LETTERS[i] for i in correct_idx], expl, False)

def ou(topic, enun, opts, correct_i, expl, categoria="concepto"):
    return ("opcion_unica", topic, categoria, enun, opts, LETTERS[correct_i], expl, False)

def vf(topic, enun, resp, expl, categoria="concepto"):
    return ("verdadero_falso", topic, categoria, enun, None, resp, expl, False)

QUESTIONS = {
"correspondencia": [
 sm("iniciar-combinacion",
    "En la lista de destinatarios de ejemplo del PDF de la academia (Rosa Lara Mena, Andrés Roca Sanz y Carlota Téllez Prisa), ¿qué destinatarios tienen su dirección en Madrid?",
    ["Rosa Lara Mena","Andrés Roca Sanz","Carlota Téllez Prisa","Ninguno vive en Madrid"], [0,2],
    "Rosa (C/ La Paz 43) y Carlota (C/ Lastre 99) están en Madrid; Andrés (Plaza del Sol) está en Toledo.",
    categoria="concepto"),
 sm("campos-combinacion",
    "En el ejemplo de carta combinada del PDF, bajo «Les rogamos que nos confirme la información», ¿qué campos aparecen realmente insertados?",
    ["Apellidos","Dirección","Teléfono","Ciudad","Correo electrónico"], [0,1,2],
    "La carta de ejemplo muestra tres líneas combinadas: Apellidos, Dirección y Teléfono. Ciudad y correo electrónico no aparecen en ese cuerpo de carta."),
 sm("campos-combinacion",
    "¿Cuáles de estas opciones SÍ aparecen en el desplegable «Reglas» de Correspondencia?",
    ["Preguntar…","Rellenar…","Combinar todo…","Próximo registro","Duplicar registro"], [0,1,3],
    "Reglas real: Preguntar, Rellenar, Si…Entonces…Sino, Registro de combinación n.º, Secuencia de combinación n.º, Próximo registro, Próximo registro si, Asignar marcador, Saltar registro si. «Combinar todo» y «Duplicar registro» no existen."),
 ou("crear-sobres-etiquetas",
    "En el ejemplo de sobre combinado del PDF, ¿qué texto aparece como remite?",
    ["Comida Natural, C/ Naturaleza nº 3, Madrid","Rosa Lara Mena, C/ La Paz 43","Word 365, Ayuntamiento","Ninguno, el remite se deja en blanco"], 0,
    "El remite del ejemplo es «Comida Natural / C/ Naturaleza nº 3 / Madrid», fijo para todos los sobres; el destinatario sí cambia con cada registro."),
 vf("crear-sobres-etiquetas",
    "En el ejemplo de etiqueta ya combinada del PDF, el nombre completo, la dirección, el código postal y la ciudad aparecen cada uno en su propia línea.",
    True, "La etiqueta de ejemplo muestra «Rosa Lara Mena» / «C/ La Paz 43» / «23939» / «Madrid», una línea por dato."),
 sm("crear-sobres-etiquetas",
    "¿Cuáles de estas SÍ son fichas del cuadro «Opciones de sobre»?",
    ["Opciones de sobre","Opciones de impresión","Opciones de fuente","Vista previa (como ficha propia)"], [0,1],
    "El cuadro Opciones de sobre solo tiene dos fichas: Opciones de sobre y Opciones de impresión. La Vista previa es un panel dentro de la primera ficha, no una ficha aparte."),
 sm("iniciar-combinacion",
    "Dentro de «Restringir lista de destinatarios», ¿cuáles de estos comandos SÍ existen?",
    ["Ordenar…","Filtrar…","Agrupar…","Buscar duplicados…","Combinar duplicados…"], [0,1,3],
    "Los cinco comandos reales son Ordenar, Filtrar, Buscar duplicados, Buscar destinatario y Validar direcciones. «Agrupar…» y «Combinar duplicados…» no existen."),
 vf("iniciar-combinacion",
    "El origen de datos del ejemplo usado en el PDF de la academia tiene 3 registros: Rosa, Andrés y Carlota.",
    True, "La tabla de ejemplo (Nombre, Apellidos, Dirección, CP, Ciudad, Teléfono) tiene exactamente esas tres filas."),
],
"referencias": [
 sm("citas-bibliografia",
    "¿Cuáles de estos SÍ son estilos de cita disponibles en el menú Estilo de este Word?",
    ["APA","MLA","Vancouver","Chicago","Oxford"], [0,1,3],
    "El menú Estilo tiene 12 estilos (APA, Chicago, GB7714, GOST ×2, Harvard-Anglia, IEEE, ISO 690 ×2, MLA, SIST02, Turabian). «Vancouver» y «Oxford» no aparecen en la lista, aunque son nombres reales de estilos de cita en general."),
 sm("citas-bibliografia",
    "¿Cuáles de estos SÍ son los tres diseños integrados de la galería Bibliografía?",
    ["Bibliografía","Referencias","Fuentes citadas","Trabajos citados","Notas finales"], [0,1,3],
    "La galería Bibliografía ofrece Bibliografía, Referencias y Trabajos citados como diseños integrados, más «Insertar bibliografía» sin ninguno de los tres."),
 sm("titulos",
    "¿Cuáles de estos SÍ son tipos válidos en el desplegable «Tipo» del cuadro Referencia cruzada?",
    ["Elemento numerado","Marcador","Comentario","Nota al pie","Sección"], [0,1,3],
    "Los ocho tipos reales son: Elemento numerado, Título, Marcador, Nota al pie, Nota al final, Ecuación, Ilustración y Tabla. «Comentario» y «Sección» no son tipos de Referencia cruzada."),
 ou("citas-bibliografia",
    "En el ejemplo del cuadro Crear fuente (tipo Libro) del PDF, ¿qué año se indicó?",
    ["2023","2022","2021","No se indica"], 0,
    "Los campos del ejemplo son Autor: Beatriz, Título: Buenas noches en tu puerta, Año: 2023, Ciudad: Madrid, Editorial: Sin tiempo."),
 ou("citas-bibliografia",
    "Según la vista previa (APA) del Administrador de fuentes en el ejemplo del PDF, ¿cómo se muestra la cita dentro del texto?",
    ["(Beatriz, 2023)","Beatriz (2023)","[Beatriz 2023]","Beatriz, B. (2023)"], 0,
    "La vista previa del ejemplo muestra «Cita: (Beatriz, 2023)» y la entrada bibliográfica «Beatriz. (2023). Buenas noches en tu puerta. Madrid: Sin tiempo.»."),
 vf("indice",
    "En el ejemplo del cuadro Índice del PDF, la entrada «Asteroide» no muestra un número de página, sino el texto «Véase Júpiter».",
    True, "Es el ejemplo de vista preliminar del cuadro Índice: «Asteroide. Véase Júpiter» en vez de un número de página."),
 sm("tabla-contenido",
    "¿Cuáles de estas SÍ son fichas del mismo cuadro de diálogo que se abre desde «Tabla de contenido», «Insertar Tabla de ilustraciones» e «Insertar índice»?",
    ["Índice","Tabla de contenido","Tabla de ilustraciones","Tabla de autoridades"], [0,1,2],
    "Las tres primeras son fichas de UN MISMO cuadro de diálogo compartido. «Tabla de autoridades» es un comando y un cuadro aparte, de la pestaña Referencias pero fuera de ese cuadro."),
 sm("citas-bibliografia",
    "¿Cuáles de estos SÍ son campos del cuadro «Crear fuente» para una fuente de tipo Libro?",
    ["Autor","Título","Año","Ciudad","Número de página"], [0,1,2,3],
    "Los campos bibliográficos de APA para un Libro son Autor, Título, Año, Ciudad y Editorial (más «Autor corporativo» y «Mostrar todos los campos bibliográficos»). «Número de página» no es uno de ellos."),
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
            "sourceQuestionId": f"pdfimg2-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [], "matching": None,
            "respuesta": correct, "explicacion": expl,
        }
        if tipo in ("opcion_unica", "seleccion_multiple"):
            base["opciones"] = [{"letter": LETTERS[i], "text": t} for i, t in enumerate(extra)]
        d.append(base)
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  total {len(d)}")
print("TOTAL nuevas:", total)
