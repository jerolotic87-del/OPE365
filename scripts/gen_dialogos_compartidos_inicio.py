# -*- coding: utf-8 -*-
"""Preguntas de INTERCONEXION: desde que opciones/rutas se abre el mismo
cuadro de dialogo (tipo de pregunta muy habitual en el examen: "¿desde
donde se llega a...?"). Cruce hecho en data/rutas/_dialogos_compartidos.md
a partir de las 156 capturas de data/imagenes_rutas/inicio/ + capturas de
las demas pestañas ya verificadas.
Sin atajos nuevos.
"""
import json

F = "data/questions/inicio.json"
d = json.load(open(F, encoding="utf-8"))
n0 = max(int(q["id"].split("-")[-1]) for q in d)
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == "inicio" for t in s["topics"]}
L = ["A", "B", "C", "D", "E", "F", "G", "H"]

rows = [
 # ---- CUADRO FUENTE: entradas ----
 ("opcion_unica", "fuente", "ruta", False,
  "Al pulsar «Más subrayados…» al final del desplegable del botón Subrayado, ¿qué se abre?",
  ["El cuadro de diálogo Fuente, con el foco en «Estilo de subrayado»", "El panel «Formato de efectos de texto»", "El cuadro Párrafo", "El panel Estilos"], "A",
  "«Más subrayados…» no es un cuadro propio: lleva al cuadro Fuente (el mismo que abre el lanzador del grupo o Ctrl+M) situando el foco en el desplegable «Estilo de subrayado».", "Formato de carácter"),
 ("seleccion_multiple", "fuente", "ruta", False,
  "¿Desde cuáles de estas rutas se abre el cuadro de diálogo Fuente?",
  ["Inicio ▸ Fuente ▸ lanzador (flecha del grupo)", "Ctrl+M", "Inicio ▸ Fuente ▸ Subrayado ▸ Más subrayados…", "Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▸ Fuente…", "Inicio ▸ Estilos ▸ flecha «Más» ▸ Aplicar estilos…", "Ctrl+Mayús+L"], ["A", "B", "C", "D"],
  "Las cuatro primeras abren el cuadro Fuente. «Aplicar estilos…» abre un cuadro flotante para escribir el nombre de un estilo; Ctrl+Mayús+L aplica lista con viñetas.", "Formato de carácter"),
 ("verdadero_falso", "parrafo-listas", "ruta", False,
  "El botón «Fuente…» de los cuadros «Definir nuevo formato de número», «Definir nueva viñeta» y «Definir nueva lista con varios niveles» abre el cuadro Fuente, pero el formato se aplica solo al carácter del número o de la viñeta, no al texto del elemento de lista.",
  None, True,
  "Es el mismo cuadro Fuente, con un ámbito de aplicación distinto.", None),

 # ---- CUADRO PARRAFO / interlineado ----
 ("opcion_unica", "parrafo-espaciado", "ruta", False,
  "La opción «Opciones de interlineado…», al final del menú del botón «Espaciado entre líneas y párrafos» de la cinta, ¿qué abre?",
  ["El cuadro Párrafo, ficha «Sangría y espacio»", "El cuadro Párrafo, ficha «Líneas y saltos de página»", "El cuadro Tabulaciones", "El cuadro «Bordes y sombreado»"], "A",
  "Es exactamente el mismo cuadro (y la misma ficha) que abre el lanzador del grupo Párrafo.", None),
 ("verdadero_falso", "parrafo-espaciado", "concepto", False,
  "Los interlineados «Mínimo», «Exacto» y «Múltiple» no aparecen en el botón «Espaciado entre líneas y párrafos» de la cinta; solo se pueden fijar desde el desplegable «Interlineado» del cuadro Párrafo.",
  None, True,
  "El botón de la cinta solo ofrece valores fijos (1,0 · 1,15 · 1,5 · 2,0 · 2,5 · 3,0) y el enlace «Opciones de interlineado…», que abre el cuadro Párrafo.", None),
 ("verdadero_falso", "parrafo-alineacion", "ruta", False,
  "El grupo «Párrafo» tiene lanzador de cuadro de diálogo en dos pestañas de la cinta —Inicio y Disposición—, y ambas abren el mismo cuadro Párrafo.",
  None, True,
  "También se llega con clic derecho en un párrafo ▸ «Párrafo…».", None),
 ("verdadero_falso", "parrafo-espaciado", "concepto", False,
  "El cuadro Párrafo que se abre con «Opciones de interlineado…» es idéntico al que abre el lanzador del grupo Párrafo.",
  None, True,
  "Es literalmente el mismo cuadro; la ruta de entrada no cambia su contenido.", None),

 # ---- CUADRO TABULACIONES ----
 ("seleccion_multiple", "parrafo-tabulaciones", "ruta", False,
  "¿Desde cuáles de estas rutas se abre el cuadro «Tabulaciones»?",
  ["Inicio/Disposición ▸ Párrafo ▸ lanzador ▸ botón «Tabulaciones…»", "Inicio ▸ Párrafo ▸ Espaciado (flecha) ▸ Opciones de interlineado… ▸ botón «Tabulaciones…»", "Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▸ Tabulaciones…", "Doble clic en un marcador de tabulación de la regla", "Vista ▸ Mostrar ▸ Regla", "Botón «Tabulaciones» del grupo Párrafo de la cinta"], ["A", "B", "C", "D"],
  "«Vista ▸ Regla» solo muestra la regla; no existe un botón «Tabulaciones» suelto en la cinta (siempre se pasa por el cuadro Párrafo o la regla).", None),
 ("opcion_unica", "parrafo-tabulaciones", "ruta", True,
  "El cuadro «Tabulaciones» se puede abrir de varias formas. Señale la que NO es correcta:",
  ["Con un botón «Tabulaciones» del grupo Párrafo de la cinta", "Desde el cuadro Párrafo (botón «Tabulaciones…»)", "Desde «Opciones de interlineado…» del menú de interlineado (botón «Tabulaciones…»)", "Con doble clic en un marcador de tabulación de la regla"], "A",
  "No hay ningún botón «Tabulaciones» directo en la cinta: siempre se llega a través del cuadro Párrafo o de la regla.", None),

 # ---- CUADRO BORDES Y SOMBREADO ----
 ("opcion_unica", "parrafo-bordes", "ruta", False,
  "Al abrir «Bordes y sombreado» desde «Inicio ▸ Párrafo ▸ Bordes (flecha) ▸ Bordes y sombreado…», el cuadro aparece en la ficha:",
  ["Bordes", "Borde de página", "Sombreado", "Opciones"], "A",
  "Desde Inicio abre en «Bordes» (borde de párrafo/texto). Si se abre desde «Diseño ▸ Fondo de página ▸ Bordes de página» aparece en la ficha «Borde de página».", None),
 ("verdadero_falso", "parrafo-bordes", "ruta", False,
  "El cuadro «Bordes y sombreado» es el mismo tanto si se abre desde Inicio (grupo Párrafo) como desde Diseño (Bordes de página): lo único que cambia es la ficha que aparece activa.",
  None, True,
  "También se llega desde «Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▸ Borde…» y desde las cintas contextuales de Tabla.", None),
 ("seleccion_multiple", "parrafo-bordes", "ruta", False,
  "¿Desde cuáles de estas rutas se abre el cuadro «Bordes y sombreado»?",
  ["Inicio ▸ Párrafo ▸ Bordes (flecha) ▸ Bordes y sombreado…", "Diseño ▸ Fondo de página ▸ Bordes de página", "Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▸ Borde…", "Disposición ▸ Configurar página ▸ lanzador ▸ ficha Disposición ▸ Bordes…", "Inicio ▸ Párrafo ▸ Sombreado (flecha)", "Diseño ▸ Fondo de página ▸ Color de página"], ["A", "B", "C", "D"],
  "El botón «Sombreado» del grupo Párrafo aplica un color directamente (no abre cuadro); «Color de página» es otra cosa (afecta a toda la hoja).", None),

 # ---- MENU FORMATO DEL CUADRO MODIFICAR ESTILO = concentrador ----
 ("seleccion_multiple", "estilos", "ruta", False,
  "El botón «Formato ▾» del cuadro Modificar/Crear estilo abre, cada una, un cuadro o panel que también existe por su cuenta. ¿Cuáles de estos ofrece?",
  ["Fuente", "Párrafo", "Tabulaciones", "Borde (Bordes y sombreado)", "Numeración", "Método abreviado (Personalizar teclado)", "Efectos de texto", "Columnas"], ["A", "B", "C", "D", "E", "F", "G"],
  "El menú «Formato ▾» tiene Fuente, Párrafo, Tabulaciones, Borde, Idioma, Marco, Numeración, Método abreviado y Efectos de texto. «Columnas» pertenece a la pestaña Disposición y no es formato de estilo de párrafo.", None),
 ("opcion_unica", "estilos", "ruta", False,
  "Dentro del cuadro Modificar estilo, ¿qué opción del menú «Formato ▾» abre el cuadro «Personalizar teclado»?",
  ["Método abreviado…", "Marco…", "Efectos de texto…", "Idioma…"], "A",
  "«Método abreviado…» abre «Personalizar teclado» con el comando del estilo ya seleccionado, para asignarle una combinación de teclas.", None),
 ("verdadero_falso", "estilos", "ruta", False,
  "El cuadro Fuente que se abre desde «Formato ▸ Fuente…» del cuadro Modificar estilo es el mismo que abre el lanzador del grupo Fuente, pero el formato queda ligado al estilo, no al párrafo suelto.",
  None, True,
  "Toda la potencia del cuadro Modificar estilo es esa: reunir Fuente, Párrafo, Bordes, Tabulaciones, Numeración… y aplicarlo al estilo.", None),

 # ---- PERSONALIZAR TECLADO: entradas ----
 ("opcion_unica", "fuente", "ruta", False,
  "¿Desde qué botón del cuadro «Símbolo» (Insertar ▸ Símbolos ▸ Símbolo ▸ Más símbolos…) se llega a «Personalizar teclado»?",
  ["El botón «Teclas…»", "El botón «Autocorrección…»", "El botón «Insertar»", "El desplegable «de:»"], "A",
  "«Teclas…» abre «Personalizar teclado» para asignar un atajo al símbolo seleccionado; «Autocorrección…» crea una entrada de autocorrección para ese símbolo.", "Formato de carácter"),
 ("seleccion_multiple", "estilos", "ruta", False,
  "¿Desde cuáles de estas rutas se llega al cuadro «Personalizar teclado»?",
  ["Archivo ▸ Opciones ▸ Personalizar cinta de opciones ▸ botón «Personalizar…»", "Insertar ▸ Símbolo ▸ Más símbolos… ▸ botón «Teclas…»", "Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▸ Método abreviado…", "Alt+Ctrl++ del teclado numérico", "Archivo ▸ Opciones ▸ Avanzadas"], ["A", "B", "C", "D"],
  "«Personalizar teclado» está en «Personalizar cinta de opciones» (botón junto a «Métodos abreviados de teclado»), no en «Avanzadas».", None),

 # ---- PANEL FORMATO DE EFECTOS DE TEXTO ----
 ("opcion_unica", "fuente", "ruta", False,
  "El botón «Efectos de texto:» que aparece en la parte inferior del cuadro de diálogo Fuente, ¿qué abre?",
  ["El panel lateral «Formato de efectos de texto» (relleno, contorno, sombra, reflejo, iluminado…)", "La galería de estilos rápidos WordArt", "El cuadro «Bordes y sombreado»", "La ficha «Avanzado» del propio cuadro Fuente"], "A",
  "Es el mismo panel al que se llega desde «Color de fuente ▸ Degradado ▸ Más degradados…» o desde «Efectos de texto y tipografía ▸ Sombra/Reflejo/Iluminado ▸ Opciones de…».", "Formato de carácter"),
 ("verdadero_falso", "fuente", "ruta", False,
  "«Más degradados…» (Color de fuente ▸ Degradado), el botón «Efectos de texto:» del cuadro Fuente y «Opciones de sombra…» del submenú de Efectos de texto abren todos el mismo panel lateral de formato de efectos de texto.",
  None, True,
  "Cada ruta abre el panel en la sección que corresponde (relleno, sombra…), pero es el mismo panel.", "Formato de carácter"),

 # ---- BUSCAR Y REEMPLAZAR ----
 ("opcion_unica", "edicion", "ruta", False,
  "Las opciones «Búsqueda avanzada…» e «Ir a…» de la flecha del botón Buscar (grupo Edición) abren:",
  ["El mismo cuadro «Buscar y reemplazar», cada una en su ficha", "Dos cuadros de diálogo distintos", "El panel Navegación en dos pestañas distintas", "El mismo cuadro, siempre en la ficha Buscar"], "A",
  "«Buscar y reemplazar» es un único cuadro con tres fichas (Buscar, Reemplazar, Ir a); cada ruta lo abre por la suya y dentro se cambia de ficha con un clic.", "Buscar y reemplazar"),
 ("verdadero_falso", "edicion", "ruta", False,
  "El botón «Reemplazar» del grupo Edición y la opción «Ir a…» del menú del botón Buscar abren el mismo cuadro de diálogo (en fichas distintas).",
  None, True,
  "En esta instalación «Reemplazar» equivale a Ctrl+L e «Ir a» a Ctrl+I.", "Buscar y reemplazar"),
 ("opcion_unica", "edicion", "concepto", True,
  "Sobre el botón «Buscar» del grupo Edición (pulsándolo directamente, sin la flecha). Señale la afirmación FALSA:",
  ["Abre el cuadro de diálogo «Buscar y reemplazar» en la ficha Buscar", "Abre el panel Navegación con el cuadro de búsqueda", "El panel Navegación tiene las pestañas Títulos, Páginas y Resultados", "Equivale al atajo Ctrl+B en esta instalación"], "A",
  "El botón «Buscar» a secas abre el PANEL Navegación, no el cuadro clásico. Para el cuadro hay que usar la flecha ▸ «Búsqueda avanzada…».", "Buscar y reemplazar"),

 # ---- EMPAREJAMIENTO: ruta -> ficha ----
 ("emparejamiento", "edicion", "ruta", False,
  "Relaciona cada ruta con la ficha por la que abre su cuadro de diálogo compartido:",
  None, None,
  "Bordes y sombreado y Buscar y reemplazar son cada uno un solo cuadro con varias fichas; la ruta de entrada solo decide cuál aparece activa.", None),

 # ---- ESTILOS: panel / cuadros ----
 ("verdadero_falso", "estilos", "ruta", False,
  "El cuadro «Administrar estilos» también se abre desde «Diseño ▸ Espaciado entre párrafos ▸ Espaciado personalizado entre párrafos…» (aparece en su ficha «Establecer valores predeterminados»).",
  None, True,
  "Desde Inicio se llega con el 3.er botón del panel Estilos («Administrar estilos»).", None),
 ("opcion_unica", "estilos", "ruta", False,
  "«Crear un estilo» (flecha «Más» de la galería de Estilos) abre una versión reducida del cuadro. ¿Qué hay que pulsar para ver todas las propiedades del estilo?",
  ["El botón «Modificar…»", "El botón «Aceptar»", "El botón «Formato»", "La flecha «Más»"], "A",
  "El botón «Nuevo estilo» del panel Estilos, en cambio, abre directamente la versión ampliada.", None),
 ("verdadero_falso", "estilos", "ruta", False,
  "Los tres botones de la parte inferior del panel Estilos son «Nuevo estilo», «Inspector de estilo» y «Administrar estilos».",
  None, True,
  "El «Nuevo estilo» abre la versión completa del cuadro de creación de estilo; «Administrar estilos» abre el cuadro de 4 fichas.", None),

 # ---- ESTABLECER COMO PREDETERMINADO / interconexiones varias ----
 ("opcion_unica", "fuente", "concepto", False,
  "El botón «Establecer como predeterminado» del cuadro Fuente también aparece en otros cuadros de Word. ¿En cuáles?",
  ["Configurar página, Párrafo y Bordes y sombreado", "Solo en el cuadro Fuente", "Opciones de Word y Centro de confianza", "Tabulaciones y Símbolo"], "A",
  "«Establecer como predeterminado» está en Configurar página, Columnas, Párrafo, Bordes y sombreado, Fecha y hora, Letra capital y Administrar estilos, además del cuadro Fuente. En todos fija los valores actuales para el documento o para la plantilla.", "Formato de carácter"),
 ("verdadero_falso", "portapapeles", "ruta", False,
  "«Establecer Pegar predeterminado…» (menú del botón Pegar) lleva a la misma pantalla que «Archivo ▸ Opciones ▸ Avanzadas»: la sección «Cortar, copiar y pegar».",
  None, True,
  "Ahí se configuran «Pegar dentro del mismo documento», «Pegar entre documentos», «Pegar desde otras aplicaciones», «Mostrar el botón Opciones de pegado», etc.", "Opciones de pegado"),
 ("opcion_unica", "estilos", "ruta", False,
  "«Aplicar estilos…», al final del menú de la flecha «Más» de la galería de Estilos, abre:",
  ["Un cuadro flotante pequeño para escribir el nombre del estilo y aplicarlo (equivale a Ctrl+Mayús+W)", "El panel Estilos completo", "El cuadro «Administrar estilos»", "El Inspector de estilo"], "A",
  "Es el cuadrito «Aplicar estilos» con una caja de texto autocompletable y los botones «Volver a aplicar» y «Modificar».", None),
]

emp_data = {
 "Relaciona cada ruta con la ficha por la que abre su cuadro de diálogo compartido:": {
   "left": [
     {"id": "1", "label": "Diseño ▸ Fondo de página ▸ Bordes de página"},
     {"id": "2", "label": "Inicio ▸ Párrafo ▸ Bordes ▸ Bordes y sombreado…"},
     {"id": "3", "label": "Buscar (flecha) ▸ Ir a…"},
     {"id": "4", "label": "Buscar (flecha) ▸ Búsqueda avanzada…"},
   ],
   "right": [
     {"id": "A", "label": "«Bordes y sombreado»: ficha Borde de página"},
     {"id": "B", "label": "«Bordes y sombreado»: ficha Bordes"},
     {"id": "C", "label": "«Buscar y reemplazar»: ficha Ir a"},
     {"id": "D", "label": "«Buscar y reemplazar»: ficha Buscar"},
     {"id": "E", "label": "«Configurar página»: ficha Papel"},
   ],
   "correct": {"1": "A", "2": "B", "3": "C", "4": "D"},
 },
}

out = []
for k, r in enumerate(rows, 1):
    tipo, topic, cat, neg, enun, opts, resp, expl, sub = r
    q = {
        "id": f"inicio-{n0+k}", "sourceFile": "inicio.json",
        "bloque": f"Inicio — {NAME[topic]}", "tipo": tipo, "categoria": cat,
        "negativa": neg, "section": "inicio", "topic": topic, "subtopic": sub,
        "tema": NAME[topic], "sourceQuestionId": f"dlgcompart-inicio-{k:02d}", "generado": True,
        "enunciado": enun, "opciones": [], "matching": None, "respuesta": resp,
        "explicacion": expl,
    }
    if tipo in ("opcion_unica", "seleccion_multiple"):
        q["opciones"] = [{"letter": L[i], "text": t} for i, t in enumerate(opts)]
    if tipo == "emparejamiento":
        m = emp_data[enun]
        q["matching"] = m
        q["respuesta"] = dict(m["correct"])
    out.append(q)

d.extend(out)
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")
print("añadidas", len(out), "-> total", len(d))
