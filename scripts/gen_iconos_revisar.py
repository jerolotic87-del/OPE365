# -*- coding: utf-8 -*-
"""Preguntas CON IMAGEN de los iconos de la pestana REVISAR (recortes sin
rotulo del usuario en data/imagenes_rutas/revisar/icono_*.PNG).
Primera tanda de preguntas con imagen fuera de insertar/diseno/disposicion/
referencias. Patron img- identico a scripts/gen_iconos_img.py.
"""
import json, base64, os

QF = "data/questions/revisar.json"
DIR = "data/imagenes_rutas/revisar"
d = json.load(open(QF, encoding="utf-8"))
mx = max(int(q["id"].split("-")[1]) for q in d)

def uri(fn):
    return "data:image/png;base64," + base64.b64encode(open(os.path.join(DIR, fn), "rb").read()).decode("ascii")

# fichero -> (comando, grupo, topic, descripcion, [3 distractores])
ICONS = {
 "icono_editor.PNG": ("Editor", "Revision", "revision-ortografica",
   "Comprueba la ortografia, la gramatica y las sugerencias de escritura (atajo F7).",
   ["Sinonimos", "Ortografia y gramatica", "Leer en voz alta"]),
 "icono_ortografia_y_gramatica.PNG": ("Ortografia y gramatica", "Revision", "revision-ortografica",
   "Revisa el documento; su desplegable permite comprobar «Ortografia» sola u «Ortografia y gramatica».",
   ["Editor", "Sinonimos", "Comprobar accesibilidad"]),
 "icono_sinonimos.PNG": ("Sinonimos", "Revision", "revision-ortografica",
   "Sugiere otras formas de decir lo mismo; abre el panel Sinonimos (atajo Mayus+F7).",
   ["Editor", "Contar palabras", "Traducir"]),
 "icono_contar_palabras.PNG": ("Contar palabras", "Revision", "revision-ortografica",
   "Abre el cuadro con paginas, palabras, caracteres (con/sin espacios), parrafos y lineas.",
   ["Editor", "Ordenar", "Numeros de linea"]),
 "icono_leer_en_voz_alta.PNG": ("Leer en voz alta", "Voz", "voz",
   "Lee el documento en voz alta resaltando cada palabra (atajo Alt+Ctrl+Espacio).",
   ["Traducir", "Editor", "Dictado"]),
 "icono_comprobar_accesibilidad.PNG": ("Comprobar accesibilidad", "Accesibilidad", "accesibilidad",
   "Revisa si el documento es facil de leer para personas con discapacidad; su menu incluye «Texto alternativo».",
   ["Editor", "Restringir edicion", "Comparar"]),
 "icono_traducir.PNG": ("Traducir", "Idioma", "idioma",
   "Traduce la seleccion o el documento entero con el Traductor de Microsoft.",
   ["Idioma", "Leer en voz alta", "Sinonimos"]),
 "icono_idioma.PNG": ("Idioma", "Idioma", "idioma",
   "Establece el idioma de correccion o abre las preferencias de idioma de Office.",
   ["Traducir", "Editor", "Ortografia y gramatica"]),
 "icono_nuevo_comentario.PNG": ("Nuevo comentario", "Comentarios", "comentarios",
   "Agrega una nota sobre esta parte del documento (atajo Alt+Ctrl+A).",
   ["Eliminar (comentario)", "Mostrar comentarios", "Comentario siguiente"]),
 "icono_eliminar_comentario.PNG": ("Eliminar (comentario)", "Comentarios", "comentarios",
   "Borra el comentario actual; su menu ofrece tambien «Eliminar todos los mostrados / del documento / resueltos».",
   ["Nuevo comentario", "Rechazar", "Comentario anterior"]),
 "icono_comentario_anterior.PNG": ("Comentario anterior", "Comentarios", "comentarios",
   "Salta al comentario anterior del documento.",
   ["Comentario siguiente", "Cambio anterior", "Nuevo comentario"]),
 "icono_comentario_siguiente.PNG": ("Comentario siguiente", "Comentarios", "comentarios",
   "Se desplaza al comentario siguiente del documento.",
   ["Comentario anterior", "Cambio siguiente", "Mostrar comentarios"]),
 "icono_mostrar_todos_los_comentarios.PNG": ("Mostrar comentarios", "Comentarios", "comentarios",
   "Muestra los comentarios en modo Contextual (junto al texto) o Lista (panel lateral).",
   ["Nuevo comentario", "Panel de revisiones", "Filtrar todo el marcado"]),
 "icono_contorl_de_cambios.PNG": ("Control de cambios", "Seguimiento", "seguimiento",
   "Activa o desactiva el registro de los cambios del documento (atajo Ctrl+Mayus+E).",
   ["Aceptar", "Rechazar", "Editor"]),
 "icono_aceptar.PNG": ("Aceptar", "Seguimiento", "seguimiento",
   "Acepta el cambio marcado y avanza; su menu incluye «Aceptar todos los cambios (y detener seguimiento)».",
   ["Rechazar", "Control de cambios", "Comprobar accesibilidad"]),
 "icono_rechazar.PNG": ("Rechazar", "Seguimiento", "seguimiento",
   "Rechaza el cambio marcado y avanza; su menu incluye «Rechazar todos los cambios».",
   ["Aceptar", "Eliminar (comentario)", "Control de cambios"]),
 "icono_anterior.PNG": ("Cambio anterior", "Seguimiento", "seguimiento",
   "Salta a la marca de revision anterior.",
   ["Cambio siguiente", "Comentario anterior", "Aceptar"]),
 "icono_siguiente.PNG": ("Cambio siguiente", "Seguimiento", "seguimiento",
   "Salta a la marca de revision siguiente.",
   ["Cambio anterior", "Comentario siguiente", "Rechazar"]),
 "icono_todas_las_revisiones.PNG": ("Visualizacion del marcado (Todas las revisiones)", "Seguimiento", "revision-marcado",
   "Elige como se ve el marcado: Revisiones simples / Todas las revisiones / Sin revision / Original.",
   ["Mostrar revisiones", "Panel de revisiones", "Filtrar todo el marcado"]),
 "icono_mostrar_revisiones.PNG": ("Mostrar revisiones", "Seguimiento", "revision-marcado",
   "Elige que tipos de marca se ven (inserciones y eliminaciones, formato, globos, personas especificas).",
   ["Visualizacion del marcado (Todas las revisiones)", "Panel de revisiones", "Filtrar todo el marcado"]),
 "icono_panel_revisiones.PNG": ("Panel de revisiones", "Seguimiento", "revision-marcado",
   "Abre un panel (vertical u horizontal) con la lista de todos los cambios y comentarios.",
   ["Mostrar revisiones", "Mostrar comentarios", "Filtrar todo el marcado"]),
 "icono_filtrar_todo_el_marcado.PNG": ("Filtrar todo el marcado", "Seguimiento", "revision-marcado",
   "Muestra solo parte del marcado (por persona, por tipo, menciones «@me»…) o restablece los filtros.",
   ["Mostrar revisiones", "Panel de revisiones", "Mostrar comentarios"]),
 "icono_comparar.PNG": ("Comparar", "Comparar", "comparar",
   "Compara dos versiones de un documento (estilo juridico) o combina las revisiones de varios autores.",
   ["Control de cambios", "Bloquear autores", "Aceptar"]),
 "icono_bloquear.PNG": ("Bloquear autores", "Proteger", "proteger",
   "Evita que otros usuarios editen el texto seleccionado (solo si el documento esta en una ubicacion compartida).",
   ["Restringir edicion", "Control de cambios", "Comparar"]),
 "icono_restringir_edicion.PNG": ("Restringir edicion", "Proteger", "proteger",
   "Abre un panel para limitar el formato y el tipo de edicion (Sin cambios / Marcas de revision / Comentarios / Rellenar formularios).",
   ["Bloquear autores", "Control de cambios", "Comprobar accesibilidad"]),
 "icono_entrada_lapiz.PNG": ("Ocultar entrada de lapiz", "Entrada de lapiz", "entrada-lapiz",
   "Muestra u oculta los trazos manuscritos; su menu incluye «Eliminar todos los trazos en el documento».",
   ["Dibujar", "Borrador", "Restringir edicion"]),
}

new = []
for i, (fn, (cmd, grp, topic, desc, distr)) in enumerate(ICONS.items(), 1):
    mx += 1
    new.append(dict(sourceFile="revisar.json", bloque=f"Revisar — {grp} (icono)",
        section="revisar", topic=topic, subtopic=None, tema="Revisar",
        negativa=False, matching=None, generado=True, categoria="concepto",
        id=f"revisar-{mx}", sourceQuestionId=f"img-revisar-{i:02d}",
        tipo="opcion_unica",
        enunciado="Observa el icono de la imagen. ¿Que comando de la pestana Revisar representa?",
        imagen=uri(fn),
        opciones=[{"letter": l, "text": t} for l, t in zip("ABCD", [cmd] + distr)],
        respuesta="A",
        explicacion=f"**{cmd}.** Pestana Revisar ▸ grupo {grp}. {desc}"))

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas con imagen (img-revisar-01..{len(new):02d})")
