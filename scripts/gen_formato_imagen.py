# -*- coding: utf-8 -*-
"""+14 preguntas + 6 flashcards sobre la cinta contextual «Formato de
imagen», de las 52 capturas del usuario. Ver data/rutas/formato_imagen.txt.
El banco no cubria practicamente nada. topic=ilustraciones.
"""
import json

QF = "data/questions/insertar.json"
FF = "data/flashcards/insertar.json"
d = json.load(open(QF, encoding="utf-8"))
mx = max(int(q["id"].split("-")[1]) for q in d)

def mk(n, tipo, enun, ops, resp, expl, cat="concepto", neg=False):
    return dict(sourceFile="insertar.json", bloque="Insertar — Ilustraciones", section="insertar",
        topic="ilustraciones", subtopic=None, tema="Insertar", negativa=neg, matching=None,
        generado=True, categoria=cat, id=f"insertar-{n}", sourceQuestionId=f"capt-fimg-{n}",
        tipo=tipo, enunciado=enun,
        opciones=[{"letter":l,"text":t} for l,t in ops] if ops else [], respuesta=resp,
        explicacion=expl)

new = [
 mk(mx+1,"opcion_unica",
   "Al seleccionar una imagen aparece la pestana contextual «Formato de imagen». ¿En que 5 grupos se organiza?",
   [("A","Ajustar · Estilos de imagen · Accesibilidad · Organizar · Tamano"),
    ("B","Insertar · Dibujar · Color · Efectos · Tamano"),
    ("C","Diseno · Presentacion · Formato · Organizar · Datos"),
    ("D","Correcciones · Estilos · Bordes · Alineacion · Recorte")],
   "A",
   "«Ajustar» reune Quitar fondo, Correcciones, Color, Efectos artisticos, Transparencia, Comprimir/Cambiar/Restablecer imagen."),
 mk(mx+2,"opcion_unica",
   "El comando «Quitar fondo» del grupo Ajustar, ¿que hace y a que lleva?",
   [("A","Elimina automaticamente las zonas de fondo de la imagen; abre una pestana «Eliminacion del fondo» con «Marcar las areas para mantener/quitar» y «Mantener/Descartar cambios»"),
    ("B","Borra el color de pagina detras de la imagen"),
    ("C","Hace la imagen semitransparente"),
    ("D","Convierte la imagen a blanco y negro")],
   "A",
   "Word marca en morado lo que va a quitar; con las dos herramientas de marcar se corrige, y «Mantener cambios» aplica el recorte."),
 mk(mx+3,"opcion_unica",
   "El desplegable «Correcciones» del grupo Ajustar mejora dos aspectos de la imagen. ¿Cuales?",
   [("A","La nitidez (Ajustar nitidez) y el brillo/contraste"),
    ("B","La saturacion y el tono de color"),
    ("C","La transparencia y el reflejo"),
    ("D","El tamano y la rotacion")],
   "A",
   "El color (saturacion, tono, volver a colorear) esta en el boton «Color», que es distinto."),
 mk(mx+4,"seleccion_multiple",
   "El desplegable «Color» del grupo Ajustar ofrece, entre otras cosas:",
   [("A","Saturacion de color"),("B","Tono de color"),("C","Volver a colorear"),
    ("D","«Definir color transparente»"),("E","«Quitar fondo»")],
   ["A","B","C","D"],
   "«Definir color transparente» convierte en transparente el color sobre el que se haga clic (uno solo). «Quitar fondo» es un boton aparte."),
 mk(mx+5,"opcion_unica",
   "El boton «Cambiar imagen» del grupo Ajustar, ¿desde que origenes permite sustituir la imagen manteniendo su formato y posicion?",
   [("A","Este dispositivo · Imagenes de archivo · Origenes en linea · Iconos · Portapapeles"),
    ("B","Solo desde un archivo del equipo"),
    ("C","Solo desde el portapapeles"),
    ("D","Este dispositivo y OneDrive unicamente")],
   "A",
   "La nueva imagen hereda el tamano, los efectos y el ajuste de texto de la anterior."),
 mk(mx+6,"opcion_unica",
   "El desplegable «Restablecer imagen», ¿que dos opciones tiene?",
   [("A","«Restablecer imagen» (quita el formato) y «Restablecer imagen y tamano» (quita el formato y vuelve al tamano original)"),
    ("B","«Deshacer» y «Rehacer»"),
    ("C","«Restablecer color» y «Restablecer efectos»"),
    ("D","Solo «Restablecer imagen»")],
   "A",
   "«Restablecer imagen y tamano» ademas devuelve la imagen a las dimensiones que tenia al insertarla."),
 mk(mx+7,"opcion_unica",
   "El grupo «Estilos de imagen» incluye «Efectos de la imagen», con 7 submenus. ¿Cuales?",
   [("A","Preestablecer · Sombra · Reflexion · Iluminado · Bordes suaves · Bisel · Giro 3D"),
    ("B","Sombra · Contorno · Relleno · Textura · Trama · Degradado · Color"),
    ("C","Recortar · Girar · Escalar · Alinear · Agrupar · Ordenar · Distribuir"),
    ("D","Brillo · Contraste · Nitidez · Saturacion · Tono · Transparencia · Artistico")],
   "A",
   "Son los mismos 7 tipos de efecto que las formas. En el mismo grupo estan la galeria de estilos, «Borde de imagen» y «Diseno de imagen»."),
 mk(mx+8,"opcion_unica",
   "El comando «Diseno de imagen» del grupo «Estilos de imagen», ¿que hace?",
   [("A","Convierte la imagen (junto con su texto) en un grafico SmartArt con leyendas"),
    ("B","Aplica un tema de color a la imagen"),
    ("C","Cambia el ajuste de texto de la imagen"),
    ("D","Guarda la imagen como un estilo reutilizable")],
   "A",
   "Genera un diseno SmartArt tipo «Imagen» con cuadros de texto para pie de foto. Es reversible: «Convertir en formas» o «Convertir en texto» desde la cinta de SmartArt."),
 mk(mx+9,"opcion_unica",
   "El boton «Recortar» (grupo Tamano) tiene un desplegable. ¿Que opciones incluye ademas de «Recortar»?",
   [("A","Recortar a la forma · Relacion de aspecto · Rellenar · Ajustar"),
    ("B","Recortar arriba · Recortar abajo · Recortar izquierda · Recortar derecha"),
    ("C","Recortar al 50% · al 75% · al 100%"),
    ("D","Recortar y guardar · Recortar y copiar")],
   "A",
   "«Recortar a la forma» encaja la imagen dentro de una autoforma; «Rellenar» y «Ajustar» controlan como encaja la imagen dentro de un marco de recorte con relacion de aspecto fija."),
 mk(mx+10,"opcion_unica",
   "El lanzador (↘) del grupo «Tamano» de «Formato de imagen» abre el cuadro «Disposicion». ¿Que 3 fichas tiene?",
   [("A","Posicion · Ajuste del texto · Tamano"),
    ("B","Recorte · Escala · Rotacion"),
    ("C","Imagen · Efectos · Relleno"),
    ("D","General · Avanzado · Accesibilidad")],
   "A",
   "Es el mismo cuadro «Disposicion» que se abre desde Disposicion ▸ Organizar ▸ «Mas opciones de diseno…»."),
 mk(mx+11,"opcion_unica",
   "En la ficha «Ajuste del texto» del cuadro «Disposicion», ¿cuantos estilos de ajuste hay y cuales?",
   [("A","7: En linea con el texto · Cuadrado · Estrecho · Transparente · Arriba y abajo · Detras del texto · Delante del texto"),
    ("B","4: En linea · Cuadrado · Detras · Delante"),
    ("C","5: los 4 anteriores mas «Ajustado»"),
    ("D","3: Ninguno · Alrededor · Absoluto")],
   "A",
   "«Detras del texto» y «Delante del texto» sacan la imagen del flujo del texto (queda flotante). En linea con el texto es el unico que la trata como un caracter mas."),
 mk(mx+12,"verdadero_falso",
   "La ficha «Tamano» del cuadro «Disposicion» permite fijar el alto y el ancho de forma absoluta o relativa, girar la imagen, escalarla en porcentaje y bloquear la relacion de aspecto.",
   None, True,
   "«Proporcional al tamano original de la imagen» hace que el % de escala se calcule respecto al tamano con que se inserto; el bloque «Tamano original» muestra esas dimensiones y el boton «Restablecer» vuelve a ellas."),
 mk(mx+13,"opcion_unica",
   "El grupo «Organizar» de «Formato de imagen» incluye «Ajustar texto», «Traer adelante», «Enviar atras», «Panel de seleccion», «Alinear», «Agrupar» y:",
   [("A","«Girar» (90° a la derecha/izquierda, voltear vertical/horizontal, Mas opciones de giro)"),
    ("B","«Recortar»"),
    ("C","«Comprimir imagenes»"),
    ("D","«Diseno de imagen»")],
   "A",
   "«Posicion» tambien esta en este grupo; «Recortar», «Comprimir» y «Diseno de imagen» estan en los grupos Tamano / Ajustar / Estilos de imagen respectivamente."),
 mk(mx+14,"verdadero_falso",
   "El boton «Texto alternativo» de la pestana «Formato de imagen» abre un panel para escribir un titulo y una descripcion de la imagen destinados a los lectores de pantalla, o marcarla como «decorativa».",
   None, True,
   "Es la misma funcion que ofrece el Comprobador de accesibilidad de la pestana Revisar cuando avisa de imagenes sin texto alternativo."),
]

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas (insertar-{mx+1}..{mx+len(new)})")

f = json.load(open(FF, encoding="utf-8"))
fm = max(int(c["cardId"].split("-")[1]) for c in f if c["cardId"].startswith("F-"))
def fc(n, front, back):
    return {"cardId": f"F-{n:03d}", "section":"insertar", "topic":"ilustraciones", "subtopic":None,
        "cardType":"contenido", "priority":"alta", "front":front, "back":back,
        "sourceRefs":["data/rutas/formato_imagen.txt (volcado del usuario)"],
        "knowledgeRefs":[], "questionRefs":[]}
fcs = [
 fc(fm+1,"Cinta «Formato de imagen»: los 5 grupos.",
    "Ajustar · Estilos de imagen · Accesibilidad · Organizar · Tamano."),
 fc(fm+2,"Grupo «Ajustar» de Formato de imagen: los comandos.",
    "Quitar fondo · Correcciones (nitidez + brillo/contraste) · Color (saturacion/tono/volver a colorear/definir color transparente) · Efectos artisticos · Transparencia · Comprimir imagenes · Cambiar imagen (5 origenes) · Restablecer imagen (imagen / imagen y tamano)."),
 fc(fm+3,"«Correcciones» vs «Color» (grupo Ajustar).",
    "Correcciones = nitidez, brillo y contraste. Color = saturacion, tono, volver a colorear y «Definir color transparente». Son dos botones distintos."),
 fc(fm+4,"«Efectos de la imagen» (grupo Estilos de imagen): los 7 submenus.",
    "Preestablecer · Sombra · Reflexion · Iluminado · Bordes suaves · Bisel · Giro 3D (los mismos que las formas)."),
 fc(fm+5,"Grupo «Tamano»: Recortar y su desplegable.",
    "Recortar · Recortar a la forma · Relacion de aspecto · Rellenar · Ajustar. Ademas los campos Alto y Ancho y el lanzador → cuadro Disposicion (Posicion/Ajuste del texto/Tamano)."),
 fc(fm+6,"Estilos de ajuste de texto de una imagen (cuadro Disposicion): los 7.",
    "En linea con el texto · Cuadrado · Estrecho · Transparente · Arriba y abajo · Detras del texto · Delante del texto. Solo «En linea con el texto» trata la imagen como un caracter mas."),
]
f.extend(fcs)
json.dump(f, open(FF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(FF, "a", encoding="utf-8").write("\n")
print(f"+{len(fcs)} flashcards (F-{fm+1:03d}..F-{fm+len(fcs):03d})")
