# -*- coding: utf-8 -*-
# Eje "relleno": solo revisar (9) y vista (11) tenian preguntas de tipo
# relleno; las otras 8 pestanas estaban a 0. Se anaden relleno nuevas
# reformateando HECHOS YA VERIFICADOS EN EL PROPIO BANCO (mismos atajos y
# rutas que ya tienen su pregunta opcion_unica en la seccion, solo se
# cambia el formato a huecos) - cero contenido nuevo sin fuente.
# Formato (ver ESQUEMA_EJERCICIOS.md): enunciado con [1][2].., respuesta =
# array paralelo, cada entrada string o array de variantes aceptadas.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}

def V(compact, spaced=None):
    """Variantes aceptadas para un atajo: forma compacta + con espacios."""
    return [compact, spaced or compact.replace("+", " + ")]

# (section, topic, enunciado, [respuestas], explicacion)
Q = [
("archivo","nuevo",
 "Escribe el atajo de cada acción de Archivo: crear un documento nuevo → [1]. abrir el cuadro de diálogo Abrir → [2]. guardar el documento → [3].",
 [V("Ctrl+U"), V("Ctrl+F12"), V("Ctrl+G")],
 "Ctrl+U crea un documento nuevo, Ctrl+F12 abre el cuadro de diálogo Abrir y Ctrl+G guarda (esquema clásico de esta instalación)."),
("archivo","cerrar",
 "Escribe el atajo de cada acción: guardar como (elegir nombre y ubicación) → [1]. cerrar el documento activo sin cerrar Word → [2].",
 [V("F12"), V("Ctrl+F4")],
 "F12 abre Guardar como; Ctrl+F4 cierra el documento activo sin cerrar el programa (prueba en vivo del usuario)."),
("archivo","opciones-avz-edicion",
 "Para que los hipervínculos de un documento requieran Ctrl+clic para poder seguirse, hay que ir a [1] ▸ [2] ▸ [3] y marcar «Utilizar CTRL + clic para seguir hipervínculo».",
 ["Archivo","Opciones","Avanzadas"],
 "La casilla vive en Archivo ▸ Opciones ▸ Avanzadas ▸ Opciones de edición."),
("correspondencia","campos-combinacion",
 "Escribe el atajo de cada paso de Combinar correspondencia: combinar a un nuevo documento → [1]. combinar directamente a la impresora → [2]. comprobar la combinación → [3]. editar el origen de datos → [4].",
 [V("Alt+Mayús+D"), V("Alt+Mayús+M"), V("Alt+Mayús+K"), V("Alt+Mayús+E")],
 "Los cuatro atajos de la combinación de correspondencia: Alt+Mayús+D (a nuevo documento), Alt+Mayús+M (a impresora), Alt+Mayús+K (comprobar) y Alt+Mayús+E (editar origen de datos)."),
("diseno","formato-documento",
 "Dentro de Diseño ▸ Formato del documento: [1] cambia solo la paleta de colores del tema, [2] cambia solo el conjunto de fuentes, y [3] aplica un conjunto predefinido de interlineado y espacio entre párrafos.",
 ["Colores","Fuentes","Espaciado entre párrafos"],
 "Los tres comandos del grupo Formato del documento que afectan a un aspecto concreto sin tocar los demás."),
("diseno","fondo-pagina",
 "Dentro de Diseño ▸ Fondo de página: [1] inserta un texto o imagen fantasma detrás del contenido de cada página, [2] aplica un color de fondo a todas las páginas, y [3] añade un borde decorativo alrededor del margen.",
 ["Marca de agua","Color de página","Bordes de página"],
 "Los tres comandos del grupo Fondo de página."),
("disposicion","configurar-pagina",
 "El comando Configurar página vive en la pestaña [1], grupo [2]. El atajo Alt+Ctrl+D cambia a la vista [3].",
 ["Disposición","Configurar página","Diseño de impresión"],
 "Disposición ▸ Configurar página; el atajo Alt+Ctrl+D cambia a la vista Diseño de impresión."),
("disposicion","organizar",
 "El comando para organizar objetos flotantes (posición, ajuste de texto, alinear…) vive en la pestaña [1], grupo [2].",
 ["Disposición","Organizar"],
 "Disposición ▸ Organizar reúne Posición, Ajustar texto, Traer/Enviar, Alinear, Agrupar y Girar."),
("inicio","fuente",
 "Escribe el atajo de cada acción: resaltar el texto seleccionado (rotulador) → [1]. mostrar u ocultar todas las marcas de formato → [2].",
 [V("Alt+Ctrl+H","Ctrl+Alt+H"), V("Ctrl+Mayús+8")],
 "Alt+Ctrl+H resalta (prueba en vivo); Ctrl+Mayús+8 muestra/oculta las marcas de formato (¶)."),
("inicio","parrafo-alineacion",
 "Escribe el atajo de cada acción sobre párrafo en esta instalación: quitar el formato de párrafo (sangrías, etc.) → [1]. aplicar o quitar la sangría francesa → [2].",
 [V("Ctrl+W"), V("Ctrl+F")],
 "Ctrl+W quita el formato de párrafo (prueba en vivo); Ctrl+F aplica/quita la sangría francesa (esquema clásico español)."),
("inicio","estilos",
 "Escribe el atajo de cada acción: abrir el panel flotante Aplicar estilos → [1]. abrir el panel de Navegación con el cuadro de búsqueda → [2].",
 [V("Ctrl+Mayús+W"), V("Ctrl+B")],
 "Ctrl+Mayús+W abre Aplicar estilos; Ctrl+B abre el panel de Navegación."),
("inicio","voz",
 "El atajo [1] inicia el Dictado de Office en Word 365. F7 (o Windows+F7) abre el panel [2].",
 ["Alt+[","Editor"],
 "Alt+[ inicia el Dictado; F7/Windows+F7 abren el mismo panel Editor (revisión ortográfica y gramatical)."),
("inicio","portapapeles",
 "Escribe el atajo de cada método antiguo del portapapeles: copiar → [1]. pegar → [2]. cortar → [3].",
 [V("Ctrl+Insertar","Ctrl+Ins"), V("Mayús+Insertar","Mayús+Ins"), V("Mayús+Supr")],
 "Ctrl+Ins copia, Mayús+Ins pega, Mayús+Supr corta (método clásico del portapapeles, además de Ctrl+C/V/X)."),
("insertar","paginas",
 "Escribe el atajo de cada acción: insertar un salto de página manual → [1]. actualizar los campos del documento → [2].",
 [V("Ctrl+Entrar"), ["F9"]],
 "Ctrl+Entrar inserta un salto de página; F9 actualiza los campos seleccionados (o todo el documento con Ctrl+E antes)."),
("insertar","tablas",
 "Escribe el atajo de movimiento dentro de una tabla: ir al inicio de la fila → [1]. ir al final de la fila → [2]. ir al inicio de la columna → [3].",
 [V("Alt+Inicio"), V("Alt+Fin"), V("Alt+Re Pág","Alt+RePág")],
 "Alt+Inicio/Alt+Fin van al inicio/final de la fila; Alt+Re Pág va al inicio de la columna."),
("insertar","vinculos",
 "Escribe el atajo de cada acción: insertar un marcador → [1]. insertar un comentario → [2].",
 [V("Ctrl+Mayús+F5"), V("Alt+Ctrl+A","Ctrl+Alt+A")],
 "Ctrl+Mayús+F5 inserta un marcador; Alt+Ctrl+A inserta un comentario."),
("insertar","texto",
 "Escribe el atajo de cada acción: crear un Autotexto a partir de la selección → [1]. alternar entre el código Unicode y el carácter de un símbolo → [2].",
 [V("Alt+F3"), V("Alt+X")],
 "Alt+F3 crea un elemento de Autotexto; Alt+X alterna el carácter bajo el cursor con su código Unicode."),
("interfaz","ventana-cinta",
 "Escribe el atajo de cada acción: restaurar o maximizar el tamaño de la ventana de Word → [1]. activar o desactivar la vista de etiquetas XML → [2].",
 [V("Ctrl+F10"), V("Ctrl+Mayús+X")],
 "Ctrl+F10 restaura/maximiza la ventana; Ctrl+Mayús+X activa/desactiva las etiquetas XML."),
("interfaz","cursor-navegacion",
 "Escribe el atajo de cada acción: ir al inicio del documento → [1]. deshacer la última acción → [2].",
 [V("Ctrl+Inicio"), V("Ctrl+Z")],
 "Ctrl+Inicio va al principio del documento; Ctrl+Z deshace."),
("interfaz","buscador",
 "Escribe el atajo de cada acción: llevar el foco al cuadro de búsqueda de la barra de título → [1]. actualizar las estadísticas de recuento de palabras → [2].",
 [V("Alt+Q"), V("Ctrl+Mayús+O")],
 "Alt+Q lleva el foco al cuadro Buscar (Microsoft Search); Ctrl+Mayús+O actualiza el recuento de palabras."),
("interfaz","acceso-teclado-ayuda",
 "La tecla [1] (o F10) activa el modo de acceso por teclado en la cinta de opciones, mostrando recuadros con letras sobre cada comando.",
 ["Alt"],
 "Alt (o F10) activa el modo de acceso por teclado; se sale con Esc o haciendo clic en el documento."),
("interfaz","area-vistas",
 "De las vistas del grupo Vistas, la única que NO tiene un atajo de teclado dedicado es [1].",
 ["Modo lectura"],
 "Diseño de impresión, Vista Esquema, Vista Borrador y Diseño Web sí tienen atajo (Alt+Ctrl+ letra); Modo de lectura no."),
("referencias","notas",
 "Escribe el atajo de cada tipo de nota: nota al pie → [1]. nota al final → [2].",
 [V("Alt+Ctrl+O","Ctrl+Alt+O"), V("Alt+Ctrl+L","Ctrl+Alt+L")],
 "Alt+Ctrl+O inserta una nota al pie; Alt+Ctrl+L inserta una nota al final."),
("referencias","indice",
 "Escribe el atajo de cada marcado manual: marcar una entrada de índice → [1]. marcar una cita para la tabla de autoridades → [2]. marcar un elemento para la tabla de contenido manualmente → [3].",
 [V("Alt+Mayús+X"), V("Alt+Mayús+I"), V("Alt+Mayús+B")],
 "Alt+Mayús+X marca entrada de índice, Alt+Mayús+I marca cita para tabla de autoridades, Alt+Mayús+B marca elemento de TDC a mano."),
]

by_sec = {}
for row in Q:
    by_sec.setdefault(row[0], []).append(row)

total = 0
for sec, rows in by_sec.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (_, topic, enun, resp, expl) in enumerate(rows, 1):
        tname = NAME[sec][topic]
        d.append({
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": "relleno", "categoria": "atajo" if any(c in enun for c in ["atajo","Ctrl","Alt+"]) else "ruta",
            "negativa": False, "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"rell-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [], "matching": None,
            "respuesta": resp, "explicacion": expl,
        })
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    rell = sum(1 for q in d if q["tipo"] == "relleno")
    total += len(rows)
    print(f"{f}: +{len(rows)}  ->  relleno {rell}/{len(d)}")
print("TOTAL nuevas:", total)
