# -*- coding: utf-8 -*-
"""Preguntas CON IMAGEN de los iconos de la cinta contextual «Disposicion
de tabla» (recortes sin rotulo del usuario en
data/imagenes_rutas/disposicion_de_tabla/icono_*.PNG + margenes_celda.PNG).
Patron img- identico a scripts/gen_iconos_img.py. topic=tablas.
"""
import json, base64, os

QF = "data/questions/insertar.json"
DIR = "data/imagenes_rutas/disposicion_de_tabla"
d = json.load(open(QF, encoding="utf-8"))
mx = max(int(q["id"].split("-")[1]) for q in d)

def uri(fn):
    return "data:image/png;base64," + base64.b64encode(open(os.path.join(DIR, fn), "rb").read()).decode("ascii")

ICONS = {
 "icono_seleccionar.PNG": ("Seleccionar", "Tabla",
   "Selecciona la celda, la columna, la fila o toda la tabla segun la opcion del desplegable.",
   ["Propiedades", "Ver cuadriculas", "Dibujar tabla"]),
 "icono_ver_cuadriculas.PNG": ("Ver cuadriculas", "Tabla",
   "Muestra u oculta las lineas de division de la tabla que no tienen borde (guia en pantalla; no se imprimen).",
   ["Seleccionar", "Propiedades", "Dibujar tabla"]),
 "icono_propiedades.PNG": ("Propiedades", "Tabla",
   "Abre el cuadro «Propiedades de tabla» (5 fichas: Tabla, Fila, Columna, Celda, Texto alternativo).",
   ["Seleccionar", "Ver cuadriculas", "Formula"]),
 "icono_dibujar_tabla.PNG": ("Dibujar tabla", "Dibujar",
   "Permite trazar a mano los bordes de celda, fila y columna, e incluso lineas diagonales.",
   ["Borrador", "Combinar celdas", "Dividir celdas"]),
 "icono_borrador.PNG": ("Borrador", "Dibujar",
   "Borra bordes concretos de la tabla para crear celdas combinadas.",
   ["Dibujar tabla", "Eliminar", "Dividir celdas"]),
 "icono_eliminar.PNG": ("Eliminar", "Filas y columnas",
   "Elimina celdas, columnas, filas o toda la tabla (segun el desplegable).",
   ["Borrador", "Dividir tabla", "Combinar celdas"]),
 "icono_insertar_fila_Arriba.PNG": ("Insertar fila arriba", "Filas y columnas",
   "Agrega una fila nueva justo por encima de la fila actual.",
   ["Insertar fila inferior", "Insertar columna a la izquierda", "Dividir tabla"]),
 "icono_insertar_fila_inferior.PNG": ("Insertar fila inferior", "Filas y columnas",
   "Agrega una fila nueva justo por debajo de la fila actual.",
   ["Insertar fila arriba", "Insertar columna a la derecha", "Combinar celdas"]),
 "icono_insertar_columna_a_la_izquierda.PNG": ("Insertar columna a la izquierda", "Filas y columnas",
   "Agrega una columna nueva a la izquierda de la columna actual.",
   ["Insertar columna a la derecha", "Insertar fila arriba", "Distribuir columnas"]),
 "icono_insertar_columna_a_la_derecha.PNG": ("Insertar columna a la derecha", "Filas y columnas",
   "Agrega una columna nueva a la derecha de la columna actual.",
   ["Insertar columna a la izquierda", "Insertar fila inferior", "Distribuir columnas"]),
 "icono_combinar_celdas.PNG": ("Combinar celdas", "Combinar",
   "Une las celdas seleccionadas en una sola celda.",
   ["Dividir celdas", "Dividir tabla", "Borrador"]),
 "icono_dividr_celdas.PNG": ("Dividir celdas", "Combinar",
   "Parte la celda seleccionada en el numero de filas y columnas que se indique.",
   ["Combinar celdas", "Dividir tabla", "Distribuir columnas"]),
 "icono_dividr_tabla.PNG": ("Dividir tabla", "Combinar",
   "Parte la tabla en dos: la fila del cursor pasa a ser la primera fila de la nueva tabla.",
   ["Dividir celdas", "Combinar celdas", "Eliminar"]),
 "icono_alto.PNG": ("Alto (de fila)", "Tamano de celda",
   "Fija el alto de las filas seleccionadas en centimetros.",
   ["Ancho (de columna)", "Distribuir filas", "Combinar celdas"]),
 "icono_ancho.PNG": ("Ancho (de columna)", "Tamano de celda",
   "Fija el ancho de las columnas seleccionadas en centimetros.",
   ["Alto (de fila)", "Distribuir columnas", "Autoajustar"]),
 "icono_distribuir_filas.PNG": ("Distribuir filas", "Tamano de celda",
   "Iguala el alto de las filas seleccionadas.",
   ["Distribuir columnas", "Alto (de fila)", "Insertar fila arriba"]),
 "icono_distribuir_columnas.PNG": ("Distribuir columnas", "Tamano de celda",
   "Iguala el ancho de las columnas seleccionadas.",
   ["Distribuir filas", "Ancho (de columna)", "Insertar columna a la derecha"]),
 "icono_direccion_del_texto.PNG": ("Direccion del texto", "Alineacion",
   "Gira el texto de las celdas seleccionadas (horizontal / vertical de abajo arriba / de arriba abajo); se pulsa varias veces.",
   ["Margenes de celda", "Ordenar", "Ajustar texto"]),
 "margenes_celda.PNG": ("Margenes de celda", "Alineacion",
   "Personaliza los margenes internos de las celdas y el espaciado entre ellas.",
   ["Direccion del texto", "Distribuir columnas", "Ver cuadriculas"]),
 "icono_ordenar.PNG": ("Ordenar", "Datos",
   "Organiza la seleccion por orden alfabetico o numerico (hasta 3 criterios, con o sin fila de encabezado).",
   ["Repetir filas de titulo", "Convertir en texto", "Formula"]),
 "icono_repetir_filas_titulo.PNG": ("Repetir filas de titulo", "Datos",
   "Repite la fila de encabezado al principio de cada pagina cuando la tabla ocupa varias.",
   ["Ordenar", "Dividir tabla", "Convertir en texto"]),
 "icono_convertir_texto.PNG": ("Convertir en texto", "Datos",
   "Deshace la tabla y la convierte en texto normal, eligiendo el caracter separador de columnas.",
   ["Ordenar", "Formula", "Dividir tabla"]),
 "icono_formula.PNG": ("Formula", "Datos",
   "Agrega una formula a una celda para calculos simples: =SUM(ABOVE), =AVERAGE(LEFT)...",
   ["Ordenar", "Convertir en texto", "Repetir filas de titulo"]),
}

new = []
for i, (fn, (cmd, grp, desc, distr)) in enumerate(ICONS.items(), 1):
    mx += 1
    new.append(dict(sourceFile="insertar.json", bloque=f"Disposicion de tabla — {grp} (icono)",
        section="insertar", topic="tablas", subtopic="Disposicion de tabla", tema="Tablas",
        negativa=False, matching=None, generado=True, categoria="concepto",
        id=f"insertar-{mx}", sourceQuestionId=f"img-distab-{i:02d}",
        tipo="opcion_unica",
        enunciado="Observa el icono de la imagen. ¿Que comando de la cinta «Disposicion de tabla» representa?",
        imagen=uri(fn),
        opciones=[{"letter": l, "text": t} for l, t in zip("ABCD", [cmd] + distr)],
        respuesta="A",
        explicacion=f"**{cmd}.** Cinta contextual «Disposicion de tabla» (aparece con el cursor dentro de una tabla) ▸ grupo {grp}. {desc}"))

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas con imagen (img-distab-01..{len(new):02d})")
