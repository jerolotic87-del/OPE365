# -*- coding: utf-8 -*-
"""+14 preguntas + 6 flashcards sobre las cintas contextuales de tabla
(«Diseño de tabla» / «Disposición de tabla»), de las 59 capturas del
usuario. Ver data/rutas/tablas_contextual.txt. El banco casi no cubria el
detalle de «Disposicion de tabla». topic=tablas.
"""
import json

QF = "data/questions/insertar.json"
FF = "data/flashcards/insertar.json"
d = json.load(open(QF, encoding="utf-8"))
mx = max(int(q["id"].split("-")[1]) for q in d)

def mk(n, tipo, enun, ops, resp, expl, cat="concepto", neg=False):
    return dict(sourceFile="insertar.json", bloque="Insertar — Tablas", section="insertar",
        topic="tablas", subtopic=None, tema="Insertar", negativa=neg, matching=None,
        generado=True, categoria=cat, id=f"insertar-{n}", sourceQuestionId=f"capt-tabctx-{n}",
        tipo=tipo, enunciado=enun,
        opciones=[{"letter":l,"text":t} for l,t in ops] if ops else [], respuesta=resp,
        explicacion=expl)

new = [
 mk(mx+1,"opcion_unica",
   "El cuadro «Propiedades de tabla» (Disposicion de tabla ▸ Propiedades), ¿cuantas fichas tiene y cuales?",
   [("A","5: Tabla · Fila · Columna · Celda · Texto alternativo"),
    ("B","3: Tabla · Fila · Columna"),
    ("C","4: Tabla · Fila · Columna · Celda"),
    ("D","2: Diseno · Disposicion")],
   "A",
   "La ficha «Texto alternativo» (Titulo + Descripcion) es para accesibilidad. En la ficha Tabla estan el «Ajuste del texto» (Ninguno/Alrededor) y el boton «Posicionamiento…»."),
 mk(mx+2,"opcion_unica",
   "En la ficha «Fila» del cuadro Propiedades de tabla, el desplegable «Alto de fila» ofrece:",
   [("A","Minimo y Exacto"),("B","Automatico y Fijo"),("C","Sencillo y Doble"),
    ("D","Ajustado y Libre")],
   "A",
   "«Minimo» = la fila crece si el contenido no cabe; «Exacto» = alto fijo aunque el contenido se corte. En la misma ficha: «Permitir dividir las filas entre paginas» y «Repetir como fila de encabezado en cada pagina»."),
 mk(mx+3,"opcion_unica",
   "En la ficha «Celda» del cuadro Propiedades de tabla, ¿que 3 opciones de «Alineacion vertical» hay?",
   [("A","Arriba · Centro · Abajo"),("B","Izquierda · Centro · Derecha"),
    ("C","Superior · Media · Inferior · Justificada"),("D","Solo Centro")],
   "A",
   "Es la alineacion del contenido dentro de la celda en el eje vertical. La horizontal (izq/centro/der) se combina con estas 3 en los 9 botones del grupo Alineacion de la cinta."),
 mk(mx+4,"seleccion_multiple",
   "El grupo «Alineacion» de la pestana «Disposicion de tabla» contiene:",
   [("A","9 botones de alineacion del contenido de la celda"),
    ("B","«Direccion del texto» (gira el texto de la celda; se pulsa varias veces)"),
    ("C","«Margenes de celda»"),
    ("D","«Ordenar»"),("E","«Sangria francesa»")],
   ["A","B","C"],
   "«Ordenar» esta en el grupo Datos. «Direccion del texto» cicla entre horizontal, vertical de abajo arriba y vertical de arriba abajo."),
 mk(mx+5,"opcion_unica",
   "El desplegable «Eliminar» del grupo «Filas y columnas», ¿que 4 opciones tiene?",
   [("A","Eliminar celdas… · Eliminar columnas · Eliminar filas · Eliminar tabla"),
    ("B","Eliminar borde · Eliminar sombreado · Eliminar estilo · Eliminar tabla"),
    ("C","Deshacer · Cortar · Borrar contenido · Eliminar tabla"),
    ("D","Solo «Eliminar filas» y «Eliminar columnas»")],
   "A",
   "«Eliminar celdas…» abre un cuadro para elegir como se recolocan las celdas restantes."),
 mk(mx+6,"opcion_unica",
   "El lanzador (flecha ↘) del grupo «Filas y columnas» abre el cuadro «Insertar celdas». ¿Que 4 opciones ofrece?",
   [("A","Desplazar las celdas hacia la derecha · Desplazar las celdas hacia abajo · Insertar una fila completa · Insertar una columna completa"),
    ("B","Arriba · Abajo · Izquierda · Derecha"),
    ("C","1 fila · 2 filas · 1 columna · 2 columnas"),
    ("D","Combinar · Dividir · Insertar · Eliminar")],
   "A",
   "El mismo cuadro «Insertar celdas» aparece tambien al elegir «Insertar celdas…» del menu Eliminar (mal nombre) o desde el menu contextual ▸ Insertar."),
 mk(mx+7,"opcion_unica",
   "¿Que hace «Dividir tabla» (grupo Combinar de Disposicion de tabla)?",
   [("A","Parte la tabla en dos: la fila donde esta el cursor pasa a ser la primera fila de la nueva tabla"),
    ("B","Divide cada celda de la tabla en dos"),
    ("C","Reparte la tabla entre dos columnas de la pagina"),
    ("D","Separa el texto de la tabla en parrafos")],
   "A",
   "Entre las dos tablas queda un parrafo vacio. «Dividir celdas», en cambio, parte la celda seleccionada en el numero de filas/columnas que se indique."),
 mk(mx+8,"opcion_unica",
   "El desplegable «Autoajustar» del grupo «Tamano de celda» tiene 3 opciones. ¿Cuales?",
   [("A","Autoajustar al contenido · Autoajustar a la ventana · Ancho de columna fijo"),
    ("B","Al texto · A la pagina · Al margen"),
    ("C","Pequeno · Mediano · Grande"),
    ("D","Filas · Columnas · Celdas")],
   "A",
   "«Al contenido» encoge/agranda las columnas segun lo que contienen; «A la ventana» estira la tabla al ancho de la pagina; «Ancho de columna fijo» congela los anchos actuales."),
 mk(mx+9,"verdadero_falso",
   "«Distribuir filas» iguala el alto de las filas seleccionadas y «Distribuir columnas» iguala el ancho de las columnas seleccionadas.",
   None, True,
   "Estan en el grupo «Tamano de celda», junto a los campos Alto y Ancho y al menu Autoajustar."),
 mk(mx+10,"opcion_unica",
   "«Repetir filas de titulo» (grupo Datos de Disposicion de tabla), ¿para que sirve y que requisito tiene?",
   [("A","Repite la fila (o filas) de encabezado al principio de cada pagina cuando la tabla ocupa varias; el cursor debe estar en la primera fila"),
    ("B","Duplica la primera fila justo debajo de si misma"),
    ("C","Bloquea la fila de encabezado para que no se edite"),
    ("D","Aplica el estilo «Fila de encabezado» a todas las filas")],
   "A",
   "Es la misma opcion que la casilla «Repetir como fila de encabezado en cada pagina» de Propiedades de tabla ▸ Fila. Solo tiene efecto si la tabla se parte entre paginas."),
 mk(mx+11,"opcion_unica",
   "«Convertir en texto» (grupo Datos), al deshacer una tabla, ¿que permite elegir?",
   [("A","El caracter que separara las columnas (marca de parrafo, tabulacion, punto y coma u otro)"),
    ("B","El tipo de letra del texto resultante"),
    ("C","Si conservar o no los bordes"),
    ("D","El numero de columnas de destino")],
   "A",
   "Es la operacion inversa de «Insertar ▸ Tabla ▸ Convertir texto en tabla»."),
 mk(mx+12,"opcion_unica",
   "El comando «Formula» (fx, grupo Datos), ¿que calculos permite y con que sintaxis?",
   [("A","Calculos simples (SUMA, PROMEDIO, RECUENTO…) con expresiones como =SUM(ABOVE) o =AVERAGE(LEFT)"),
    ("B","Solo sumar la columna de la izquierda"),
    ("C","Cualquier formula de Excel copiada tal cual"),
    ("D","Solo contar el numero de filas")],
   "A",
   "ABOVE/BELOW/LEFT/RIGHT indican el rango de celdas. Word NO recalcula solo: hay que actualizar el campo (F9)."),
 mk(mx+13,"opcion_unica",
   "«Ver cuadriculas» (grupo Tabla de Disposicion de tabla), ¿que muestra?",
   [("A","Las lineas de division de la tabla que no tienen borde, como guia en pantalla; no se imprimen"),
    ("B","La cuadricula de fondo del documento entero"),
    ("C","Una regla dentro de cada celda"),
    ("D","Los margenes de celda en rojo")],
   "A",
   "Utiles para trabajar con tablas sin bordes. Son las mismas «lineas de cuadricula» de tabla que en versiones antiguas estaban en el menu Tabla."),
 mk(mx+14,"opcion_unica",
   "En «Bordes y sombreado» abierto desde una tabla (ficha «Bordes»), el campo «Valor» ofrece 5 opciones. ¿Cuales, y en que se diferencia de la ficha «Borde de pagina»?",
   [("A","Ninguno · Cuadro · Todos · Cuadricula · Personalizado (la ficha Borde de pagina cambia «Todos»/«Cuadricula» por «Sombra»/«3D»)"),
    ("B","Son exactamente los mismos 5 valores en las dos fichas"),
    ("C","Ninguno · Simple · Doble · Triple · Personalizado"),
    ("D","Solo tiene «Ninguno» y «Cuadro»")],
   "A",
   "«Todos» pone borde a todas las lineas (exteriores e interiores); «Cuadricula» pone borde grueso exterior y fino interior. «Sombra» y «3D» solo tienen sentido para el borde de la pagina."),
]

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas (insertar-{mx+1}..{mx+len(new)})")

f = json.load(open(FF, encoding="utf-8"))
fm = max(int(c["cardId"].split("-")[1]) for c in f if c["cardId"].startswith("F-"))
def fc(n, front, back):
    return {"cardId": f"F-{n:03d}", "section":"insertar", "topic":"tablas", "subtopic":None,
        "cardType":"contenido", "priority":"alta", "front":front, "back":back,
        "sourceRefs":["data/rutas/tablas_contextual.txt (volcado del usuario)"],
        "knowledgeRefs":[], "questionRefs":[]}
fcs = [
 fc(fm+1,"Las 2 pestanas contextuales de tabla y sus grupos.",
    "«Diseno de tabla» (3 grupos: Opciones de estilo de tabla · Estilos de tabla · Bordes). «Disposicion de tabla» (7 grupos: Tabla · Dibujar · Filas y columnas · Combinar · Tamano de celda · Alineacion · Datos)."),
 fc(fm+2,"Cuadro «Propiedades de tabla»: fichas y datos clave.",
    "5 fichas: Tabla (ajuste del texto Ninguno/Alrededor, Posicionamiento) · Fila (Alto de fila Minimo/Exacto, repetir encabezado) · Columna · Celda (alineacion vertical Arriba/Centro/Abajo) · Texto alternativo."),
 fc(fm+3,"Grupo «Combinar» (Disposicion de tabla): 3 comandos.",
    "Combinar celdas (varias en una) · Dividir celdas (una en varias, pide filas y columnas) · Dividir tabla (en dos; la fila del cursor pasa a ser la 1a de la nueva)."),
 fc(fm+4,"Grupo «Tamano de celda»: Autoajustar y Distribuir.",
    "Autoajustar = al contenido / a la ventana / ancho de columna fijo. Distribuir filas = igualar altos. Distribuir columnas = igualar anchos. + campos Alto y Ancho."),
 fc(fm+5,"Grupo «Datos» (Disposicion de tabla): 4 comandos.",
    "Ordenar (hasta 3 criterios, con/sin encabezado) · Repetir filas de titulo (encabezado en cada pagina) · Convertir en texto (elige separador) · Formula (=SUM(ABOVE), =AVERAGE(LEFT)…)."),
 fc(fm+6,"«Bordes y sombreado» desde una tabla vs desde Diseno: el campo «Valor».",
    "Ficha Bordes (tabla/parrafo): Ninguno · Cuadro · Todos · Cuadricula · Personalizado. Ficha Borde de pagina: Ninguno · Cuadro · Sombra · 3D · Personalizado."),
]
f.extend(fcs)
json.dump(f, open(FF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(FF, "a", encoding="utf-8").write("\n")
print(f"+{len(fcs)} flashcards (F-{fm+1:03d}..F-{fm+len(fcs):03d})")
