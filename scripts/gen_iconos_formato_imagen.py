# -*- coding: utf-8 -*-
"""Preguntas CON IMAGEN de los iconos de la cinta contextual «Formato de
imagen» (recortes sin rotulo del usuario en
data/imagenes_rutas/formato_imagen/icono_*.PNG).

Patron identico a scripts/gen_iconos_img.py: campo `imagen` = data URI,
sourceQuestionId `img-fimg-NN`, generado:true, categoria concepto.
Se descarta `icono_estilos_imagen.PNG` (es la galeria entera, no un icono).
"""
import json, base64, os

QF = "data/questions/insertar.json"
DIR = "data/imagenes_rutas/formato_imagen"
d = json.load(open(QF, encoding="utf-8"))
mx = max(int(q["id"].split("-")[1]) for q in d)

def uri(fn):
    return "data:image/png;base64," + base64.b64encode(open(os.path.join(DIR, fn), "rb").read()).decode("ascii")

# fichero -> (comando, grupo, descripcion, [distractores del mismo grupo/cinta])
ICONS = {
 "icono_quitar_fondo.PNG": ("Quitar fondo", "Ajustar",
   "Elimina automaticamente las zonas de fondo de la imagen; abre la pestana «Eliminacion del fondo».",
   ["Transparencia", "Correcciones", "Recortar"]),
 "icono_correcciones.PNG": ("Correcciones", "Ajustar",
   "Mejora el brillo, el contraste o la nitidez de la imagen.",
   ["Color", "Efectos artisticos", "Restablecer imagen"]),
 "icono_color.PNG": ("Color", "Ajustar",
   "Cambia el color de la imagen: saturacion, tono de color, «volver a colorear» y «definir color transparente».",
   ["Correcciones", "Efectos artisticos", "Transparencia"]),
 "icono_efectos_artisticos.PNG": ("Efectos artisticos", "Ajustar",
   "Aplica efectos para que la imagen parezca un boceto o una pintura.",
   ["Correcciones", "Color", "Efectos de la imagen"]),
 "icono_transparencia.PNG": ("Transparencia", "Ajustar",
   "Ajusta la transparencia de la imagen para que se vea lo que hay detras.",
   ["Quitar fondo", "Color", "Efectos artisticos"]),
 "icono_comprimir_imagenes.PNG": ("Comprimir imagenes", "Ajustar",
   "Reduce el tamano en disco de las imagenes del documento.",
   ["Restablecer imagen", "Recortar", "Cambiar imagen"]),
 "icono_cambiar_imagen.PNG": ("Cambiar imagen", "Ajustar",
   "Sustituye la imagen por otra (Este dispositivo, Imagenes de archivo, origenes en linea, Iconos, Portapapeles) conservando el formato y la posicion.",
   ["Restablecer imagen", "Comprimir imagenes", "Diseno de imagen"]),
 "icono_restablecer_imagen.PNG": ("Restablecer imagen", "Ajustar",
   "Quita todo el formato aplicado a la imagen (y, con «Restablecer imagen y tamano», tambien vuelve al tamano original).",
   ["Cambiar imagen", "Comprimir imagenes", "Correcciones"]),
 "icono_borde_de_imagen.PNG": ("Borde de imagen", "Estilos de imagen",
   "Elige el color, el ancho y el estilo de linea del contorno de la imagen.",
   ["Efectos de la imagen", "Diseno de imagen", "Estilos de imagen"]),
 "icono_efectos_de_imagen.PNG": ("Efectos de la imagen", "Estilos de imagen",
   "Aplica sombra, reflexion, iluminado, bordes suaves, bisel o giro 3D a la imagen.",
   ["Efectos artisticos", "Borde de imagen", "Correcciones"]),
 "icono_diseño_de_imagen.PNG": ("Diseno de imagen", "Estilos de imagen",
   "Convierte la imagen y su texto en un grafico SmartArt con pie de foto.",
   ["Efectos de la imagen", "Cambiar imagen", "Ajustar texto"]),
 "icono_texto_alternativo.PNG": ("Texto alternativo", "Accesibilidad",
   "Abre el panel para escribir un titulo y una descripcion de la imagen para los lectores de pantalla.",
   ["Diseno de imagen", "Comprimir imagenes", "Panel de seleccion"]),
 "icono_posicion.PNG": ("Posicion", "Organizar",
   "Coloca la imagen en una de las 9 posiciones fijas de la pagina con ajuste de texto, o «en linea con el texto».",
   ["Ajustar texto", "Alinear", "Recortar"]),
 "icono_ajustar_texto.PNG": ("Ajustar texto", "Organizar",
   "Define como fluye el texto alrededor de la imagen (En linea, Cuadrado, Estrecho, Detras del texto...).",
   ["Posicion", "Alinear", "Agrupar"]),
 "icono_panel_de_seleccion.PNG": ("Panel de seleccion", "Organizar",
   "Abre un panel lateral con la lista de todos los objetos de la pagina para seleccionarlos, mostrarlos u ocultarlos.",
   ["Alinear", "Agrupar", "Traer adelante"]),
 "icono_alinear.PNG": ("Alinear", "Organizar",
   "Alinea o distribuye los objetos seleccionados (izquierda, centro, derecha, distribuir...).",
   ["Agrupar", "Girar", "Posicion"]),
 "icono_agrupar.PNG": ("Agrupar", "Organizar",
   "Une varios objetos seleccionados en un solo grupo para moverlos y darles formato a la vez.",
   ["Alinear", "Panel de seleccion", "Girar"]),
 "icono_girar.PNG": ("Girar", "Organizar",
   "Gira la imagen 90 grados o la voltea en horizontal o en vertical.",
   ["Alinear", "Agrupar", "Recortar"]),
 "icono_recortar.PNG": ("Recortar", "Tamano",
   "Recorta los bordes de la imagen; su desplegable incluye «Recortar a la forma», «Relacion de aspecto», «Rellenar» y «Ajustar».",
   ["Quitar fondo", "Comprimir imagenes", "Ajustar texto"]),
 "icono_alto.PNG": ("Alto (de la imagen)", "Tamano",
   "Fija el alto de la imagen en centimetros; si esta bloqueada la relacion de aspecto, el ancho se ajusta solo.",
   ["Ancho (de la imagen)", "Recortar", "Posicion"]),
 "icono_ancho.PNG": ("Ancho (de la imagen)", "Tamano",
   "Fija el ancho de la imagen en centimetros; si esta bloqueada la relacion de aspecto, el alto se ajusta solo.",
   ["Alto (de la imagen)", "Recortar", "Ajustar texto"]),
}

new = []
for i, (fn, (cmd, grp, desc, distr)) in enumerate(ICONS.items(), 1):
    mx += 1
    opts = [cmd] + distr
    # orden fijo: correcta = A (el runner baraja opciones al estudiar)
    new.append(dict(sourceFile="insertar.json", bloque=f"Formato de imagen — {grp} (icono)",
        section="insertar", topic="ilustraciones", subtopic="Formato de imagen", tema="Ilustraciones",
        negativa=False, matching=None, generado=True, categoria="concepto",
        id=f"insertar-{mx}", sourceQuestionId=f"img-fimg-{i:02d}",
        tipo="opcion_unica",
        enunciado="Observa el icono de la imagen. ¿Que comando de la cinta «Formato de imagen» representa?",
        imagen=uri(fn),
        opciones=[{"letter": l, "text": t} for l, t in zip("ABCD", opts)],
        respuesta="A",
        explicacion=f"**{cmd}.** Cinta contextual «Formato de imagen» (aparece al seleccionar una imagen) ▸ grupo {grp}. {desc}"))

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas con imagen (img-fimg-01..{len(new):02d})")
