# -*- coding: utf-8 -*-
# Rebalance de V/F heredados: en vez de tocar preguntas existentes ya
# correctas (arriesgado sin fuente fresca), se AÑADEN V/F nuevas sobre los
# mismos topics, con hechos ya establecidos/verificados, para llevar cada
# seccion a 50/50 sin arriesgar contenido correcto.
import json

tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {s["id"]: {t["id"]: t["name"] for t in s["topics"]} for s in tax["sections"]}
TO = {s["id"]: {t["id"]: i for i, t in enumerate(s["topics"])} for s in tax["sections"]}

# (section, topic, categoria, enunciado, respuesta(bool), explicacion)
Q = [
# ---------- INICIO: +7 F ----------
("inicio","portapapeles","concepto","El botón Rehacer de la barra de acceso rápido, cuando no hay ninguna acción que rehacer, se queda simplemente desactivado y no ofrece ninguna otra función.",False,
 "Falso: en ese estado el botón pasa a funcionar como Repetir la última acción, la misma función que la tecla F4."),
("inicio","fuente","concepto","En el cuadro de diálogo Fuente, el color de subrayado siempre coincide con el color de fuente y no se puede cambiar por separado.",False,
 "Falso: Color de fuente y Color de subrayado son campos independientes; el subrayado puede tener un color distinto al del texto."),
("inicio","parrafo-espaciado","concepto","El interlineado «Múltiple» del cuadro Párrafo solo admite el valor 1,5 y no otros números.",False,
 "Falso: «Múltiple» acepta cualquier valor que se escriba en el campo «En» (1,08, 1,16, 2,5…), no solo 1,5."),
("inicio","parrafo-bordes","concepto","El botón Bordes del grupo Párrafo solo puede aplicar un borde a los cuatro lados del párrafo a la vez, nunca a un lado suelto.",False,
 "Falso: el desplegable de Bordes permite elegir borde superior, inferior, izquierdo o derecho por separado, además de «Bordes y sombreado…» para más opciones."),
("inicio","parrafo-tabulaciones","concepto","Al pulsar Tab dentro de una celda de tabla, Word siempre inserta un carácter de tabulación, igual que en texto normal.",False,
 "Falso: dentro de una tabla, Tab avanza a la celda siguiente. Para insertar una tabulación real dentro de la celda hay que usar Ctrl+Tab."),
("inicio","estilos","concepto","Una vez aplicado un estilo de carácter a un texto, ya no se puede quitar sin borrar el texto.",False,
 "Falso: el estilo de carácter se puede quitar aplicando «Predeterminado» o «Borrar formato» sin tocar el texto."),
("inicio","edicion","concepto","El comando Reemplazar solo puede buscar y sustituir texto, nunca formato.",False,
 "Falso: el cuadro Buscar y reemplazar permite buscar y reemplazar también por formato (negrita, color, estilo…) con el botón «Más» ▸ «Formato»."),
# ---------- INTERFAZ: +7 F ----------
("interfaz","documentos-archivos","concepto","El formato .docm no permite guardar macros de VBA junto con el documento.",False,
 "Falso: .docm es justo el formato «Documento habilitado para macros»; el que NO admite macros es .docx."),
("interfaz","ventana-cinta","ruta","El modo táctil, una vez activado, no se puede desactivar sin reiniciar Word.",False,
 "Falso: se desactiva de la misma forma que se activa, desde el desplegable de la barra de herramientas de acceso rápido."),
("interfaz","acceso-rapido","ruta","La barra de herramientas de acceso rápido solo se puede colocar encima de la cinta, nunca debajo.",False,
 "Falso: su menú de personalización tiene la opción «Mostrar debajo de la cinta de opciones»."),
("interfaz","barra-estado","ruta","El contador de palabras de la Barra de estado no se actualiza mientras seleccionas texto, solo al soltar el ratón.",False,
 "Falso: se actualiza en tiempo real y muestra «X de Y palabras» mientras la selección va cambiando."),
("interfaz","regla","ruta","La Regla de Word solo puede medir en centímetros; no se puede cambiar de unidad.",False,
 "Falso: la unidad de medida (centímetros, pulgadas, puntos, picas) se cambia en Archivo ▸ Opciones ▸ Avanzadas ▸ Mostrar."),
("interfaz","cursor-navegacion","ruta","La barra de desplazamiento horizontal está siempre visible, incluso si el documento cabe entero en el ancho de la ventana.",False,
 "Falso: si el contenido cabe en el ancho visible, la barra de desplazamiento horizontal no hace falta y Word la puede ocultar, igual que ocurre con la vertical."),
("interfaz","acceso-teclado-ayuda","atajo","El modo de acceso por teclado (activado con Alt) permanece activo aunque se haga clic con el ratón en el documento.",False,
 "Falso: hacer clic con el ratón en el documento, o pulsar Esc, desactiva el modo de acceso por teclado y quita los recuadros de letras."),
# ---------- VISTA: +7 V ----------
("vista","vistas","ruta","El grupo Vistas de la pestaña Vista incluye Modo de lectura, Diseño de impresión, Diseño Web, Vista Esquema y Vista Borrador.",True,
 "Son las cinco vistas del grupo, con Modo de lectura como la primera de la galería."),
("vista","inmersivo","ruta","El grupo Inmersivo de la pestaña Vista contiene Concentración y Lector inmersivo.",True,
 "Son los dos comandos de ese grupo, enfocados en reducir distracciones y facilitar la lectura."),
("vista","zoom","concepto","El rango de zoom en Word 365 va del 10 % al 500 %.",True,
 "Es el rango mínimo y máximo tanto en el control deslizante como en el cuadro de diálogo Zoom."),
("vista","ventana","concepto","El comando Ver en paralelo permite comparar dos documentos distintos mostrados uno junto al otro.",True,
 "A diferencia de Dividir (que reparte la ventana de UN documento), Ver en paralelo compara DOS documentos distintos."),
("vista","ventana","concepto","Dividir reparte la ventana del documento activo en dos paneles que se pueden desplazar de forma independiente.",True,
 "Cada panel muestra una parte del mismo documento y se desplaza por separado, útil para ver dos zonas a la vez."),
("vista","macros","ruta","El grupo Macros de la pestaña Vista permite grabar una macro, detener la grabación y ver la lista de macros.",True,
 "Es el único grupo de macros disponible cuando la pestaña Programador no está activada."),
("vista","movimiento-pagina","ruta","El grupo Movimiento de página de Vista permite alternar entre desplazamiento Vertical y Horizontal por las páginas del documento.",True,
 "Ese grupo cambia el sentido en el que se pasa de una página a otra al hacer scroll."),
]

by_sec = {}
for row in Q:
    by_sec.setdefault(row[0], []).append(row)

total = 0
for sec, rows in by_sec.items():
    f = f"data/questions/{sec}.json"
    d = json.load(open(f, encoding="utf-8"))
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (_, topic, categoria, enun, resp, expl) in enumerate(rows, 1):
        tname = NAME[sec][topic]
        d.append({
            "id": f"{sec}-{n0+k}", "sourceFile": f"{sec}.json", "bloque": f"{sec.capitalize()} — {tname}",
            "tipo": "verdadero_falso", "categoria": categoria, "negativa": False,
            "section": sec, "topic": topic, "subtopic": None, "tema": tname,
            "sourceQuestionId": f"bal-{sec}-{k:02d}", "generado": True,
            "enunciado": enun, "opciones": [], "matching": None,
            "respuesta": resp, "explicacion": expl,
        })
    d.sort(key=lambda q: (TO[sec].get(q["topic"], 99), str(q.get("topic") or ""), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(f, "a", encoding="utf-8").write("\n")
    vf = [q for q in d if q["tipo"] == "verdadero_falso"]
    tv = sum(1 for q in vf if q["respuesta"])
    total += len(rows)
    print(f"{f}: +{len(rows)} V/F  ->  V/F total {tv}/{len(vf)-tv}")
print("TOTAL nuevas:", total)
