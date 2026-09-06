# -*- coding: utf-8 -*-
"""Sustituye la imagen de cada pregunta con icono por su version SIN el
rotulo de texto, de data/imagenes_iconos/iconos_sin_nombre/<sec>/.
Asi la pregunta mide de verdad el reconocimiento del icono y no se lee la
respuesta en las letras que traia el recorte.

Mapa qid -> fichero _n (explicito; construido cotejando el nombre del
comando de cada pregunta con el listado del directorio iconos_sin_nombre).
Un valor con "/" apunta a otra seccion (el iniciador de cuadro de dialogo
es el mismo glifo ↘ en todas las pestañas).
Los 4 iconos sin version _n se dejan como estan y se listan al final.
"""
import json, os, base64, glob

NDIR = "data/imagenes_iconos/iconos_sin_nombre"

MAP = {
 # ---- diseno ----
 "diseno-1":  "formato_del_documento_temas_n.png",
 "diseno-2":  "formato_del_documento_colores_n.png",
 "diseno-3":  "formato_del_documento_fuentes_n.png",
 "diseno-4":  "formato_del_documento_efectos_n.png",
 "diseno-5":  "formato_del_documento_espaciado_entre_parrafos_n.png",
 "diseno-6":  "formato_del_documento_establecer_como_predeterminada_n.png",
 "diseno-64": "fondo_de_pagina_marca_de_agua_n.png",
 "diseno-65": "fondo_de_pagina_color_de_pagina_n.png",
 "diseno-66": "formato_del_documento_bordes_de_pagina_n.png",
 # ---- disposicion ----
 "disposicion-91":  "configurar_pagina_marcenes_n.png",
 "disposicion-92":  "configurar_pagina_orientacion_n.png",
 "disposicion-93":  "configurar_pagina_tamano_n.png",
 "disposicion-94":  "configurar_pagina_columnas_n.png",
 "disposicion-95":  "configurar_pagina_saltos_n.png",
 "disposicion-96":  "configurar_pagina_numeros_de_linea_n.png",
 "disposicion-97":  "configurar_pagina_guiones_n.png",
 "disposicion-98":  "inicio/iniciador_cuadro_dialogo_n.png",
 "disposicion-99":  "organizar_posicion_n.png",
 "disposicion-100": "organizar_ajustar_texto_n.png",
 "disposicion-101": "organizar_traer_adelante_n.png",
 "disposicion-102": "organizar_enviar_atras_n.png",
 "disposicion-103": "organizar_panel_de_seleccion_n.png",
 "disposicion-104": "organizar_alinear_n.png",
 "disposicion-105": "organizar_agrupar_n.png",
 "disposicion-106": "organizar_girar_n.png",
 "disposicion-131": "configurar_pagina_tamano_n.png",
 # ---- inicio ----
 "inicio-394": "portapapeles_pegar_n.png",
 "inicio-395": "portapapeles_pgcopiar_n.png",
 "inicio-396": "portapapeles_cortar_n.png",
 "inicio-397": "portapapeles_copiar_formato_n.png",
 "inicio-398": "portapapeles_borrar_todo_formato_n.png",
 "inicio-399": "fuente_negrita_n.png",
 "inicio-400": "fuente_cursiva_n.png",
 "inicio-401": "fuente_subrayado_n.png",
 "inicio-402": "fuente_tachado_n.png",
 "inicio-403": "fuente_subindice_n.png",
 "inicio-404": "fuente_superindice_n.png",
 "inicio-405": "fuente_resaltar_n.png",
 "inicio-406": "fuente_color_de_fuente_n.png",
 "inicio-407": "fuente_aumentar_tamano_fuente_n.png",
 "inicio-408": "portapapeles_disminuir_tamano_fuente_n.png",
 "inicio-409": "fuente_cambiar_mayusculas_minusculas_n.png",
 "inicio-410": "fuente_edicion_texto_y_tipografia_n.png",
 "inicio-412": "parrafo_alinear_izquierda_n.png",
 "inicio-413": "parrafo_centrar_n.png",
 "inicio-414": "parrafo_alinear_derecha_n.png",
 "inicio-415": "parrafo_justificar_n.png",
 "inicio-416": "parrafo_vinetas_n.png",
 "inicio-417": "parrafo_numeracion_n.png",
 "inicio-418": "parrafo_lista_multinivel_n.png",
 "inicio-419": "parrafo_aumentar_sangria_n.png",
 "inicio-420": "parrafo_disminuir_sangria_n.png",
 "inicio-421": "parrafo_espaciado_entre_lineas_y_parrafos_n.png",
 "inicio-422": "parrafo_bordes_n.png",
 "inicio-423": "parrafo_sombreado_n.png",
 "inicio-424": "parrafo_ordenar_n.png",
 "inicio-425": "parrafo_mostrar_todo_n.png",
 "inicio-426": "edicion_buscar_n.png",
 "inicio-427": "edicion_reemplazar_n.png",
 "inicio-428": "edicion_seleccionar_n.png",
 "inicio-429": "voz_dictar_n.png",
 "inicio-430": "editor_editor_n.png",
 "inicio-431": "iniciador_cuadro_dialogo_n.png",
 "inicio-470": "complementos_complementos_n.png",
 # ---- insertar ----
 "insertar-406": "paginas_portada_n.png",
 "insertar-407": "paginas_pagina_en_blanco_n.png",
 "insertar-408": "paginas_salto_de_pagina_n.png",
 "insertar-409": "tablas_tabla_n.png",
 "insertar-410": "ilustraciones_imagenes_n.png",
 "insertar-411": "ilustraciones_formas_n.png",
 "insertar-412": "ilustraciones_iconos_n.png",
 "insertar-413": "ilustraciones_modelos_3d_n.png",
 "insertar-414": "ilustraciones_smartart_n.png",
 "insertar-415": "ilustraciones_grafico_n.png",
 "insertar-416": "ilustraciones_captura_n.png",
 "insertar-417": "multimedia_videos_en_linea_n.png",
 "insertar-418": "vinculos_vinculo_n.png",
 "insertar-419": "vinculos_marcador_n.png",
 "insertar-420": "vinculos_referencia_cruzada_n.png",
 "insertar-421": "comentarios_comentario_n.png",
 "insertar-422": "encabezado_y_pie_de_pagina_encabezado_n.png",
 "insertar-423": "encabezado_y_pie_de_pagina_pie_de_pagina_n.png",
 "insertar-424": "encabezado_y_pie_de_pagina_numero_de_pagina_n.png",
 "insertar-425": "texto_cuadro_de_texto_n.png",
 "insertar-426": "texto_wordart_n.png",
 "insertar-427": "texto_letra_capital_n.png",
 "insertar-428": "texto_elementos_rapidos_n.png",
 "insertar-429": "texto_fecha_y_hora_n.png",
 "insertar-430": "texto_objeto_n.png",
 "insertar-431": "texto_linea_de_firma_n.png",
 "insertar-432": "simbolos_ecuacion_n.png",
 "insertar-433": "simbolos_simbolos_n.png",
 "insertar-434": "esignatura_campos_de_esignatura_n.png",
 # ---- referencias ----
 "referencias-99":  "citas_y_bibliografia_administrar_fuentes_n.png",
 "referencias-100": "citas_y_bibliografia_bibliografia_n.png",
 "referencias-101": "citas_y_bibliografia_cambiar_sp_de_proveedor_n.png",
 "referencias-102": "citas_y_bibliografia_estilo_n.png",
 "referencias-103": "citas_y_bibliografia_insertar_cita_n.png",
 "referencias-104": "indice_actualizar_indice_n.png",
 "referencias-105": "indice_insertar_indice_n.png",
 "referencias-106": "indice_marcar_entrada_n.png",
 "referencias-107": "inicio/iniciador_cuadro_dialogo_n.png",
 "referencias-108": "notas_al_pie_insertar_nota_al_final_n.png",
 "referencias-109": "notas_al_pie_insertar_nota_al_pie_n.png",
 "referencias-110": "notas_al_pie_mostrar_notas_n.png",
 "referencias-111": "notas_al_pie_notas_al_pie_siguiente_n.png",
 "referencias-112": "tabla_de_contenido_actualizar_tabla_n.png",
 "referencias-113": "tabla_de_contenido_agregar_texto_n.png",
 "referencias-114": "tabla_de_contenido_tabla_de_contenido_n.png",
 "referencias-115": "titulos_insertar_tabla_de_ilustraciones_n.png",
 "referencias-116": "titulos_insertar_titulo_n.png",
 "referencias-117": "titulos_referencia_cruzada_n.png",
}

# sin version _n: se dejan con la imagen que ya tenian
NO_N = {"diseno-7", "disposicion-129", "disposicion-130", "inicio-411"}


def datauri(path):
    return "data:image/png;base64," + base64.b64encode(open(path, "rb").read()).decode("ascii")


def qs(f):
    o = json.load(open(f, encoding="utf-8"))
    return o if isinstance(o, list) else o["questions"]


# --- comprobar que todo fichero del mapa existe y que cubrimos todas las preguntas
img_qids = set()
for f in glob.glob("data/questions/*.json"):
    for q in qs(f):
        if isinstance(q, dict) and q.get("imagen"):
            img_qids.add((f, q["id"]))

covered = set(MAP) | NO_N
missing = sorted(q for _, q in img_qids if q not in covered)
extra = sorted(q for q in MAP if q not in {i for _, i in img_qids})
if missing:
    raise SystemExit("preguntas con imagen NO cubiertas por el mapa: " + ", ".join(missing))
if extra:
    raise SystemExit("ids del mapa que no existen o no tienen imagen: " + ", ".join(extra))

for qid, fn in MAP.items():
    sec = qid.split("-")[0]
    path = os.path.join(NDIR, fn if "/" in fn else f"{sec}/{fn}")
    if not os.path.isfile(path):
        raise SystemExit(f"FALTA {path}  (para {qid})")

# --- aplicar
changed = 0
for f in glob.glob("data/questions/*.json"):
    d = qs(f)
    hit = False
    for q in d:
        if not (isinstance(q, dict) and q.get("imagen") and q["id"] in MAP):
            continue
        sec = q["id"].split("-")[0]
        fn = MAP[q["id"]]
        path = os.path.join(NDIR, fn if "/" in fn else f"{sec}/{fn}")
        q["imagen"] = datauri(path)
        changed += 1
        hit = True
    if hit:
        json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(f, "a", encoding="utf-8").write("\n")

print(f"imagenes sustituidas por la version sin rotulo: {changed}")
print(f"sin version _n (imagen original conservada): {', '.join(sorted(NO_N))}")
