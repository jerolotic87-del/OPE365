# -*- coding: utf-8 -*-
"""Endurecimiento de distractores del topic 'portapapeles' de inicio.json.
Reglas (fijadas sep-2026): distractores reales o mecanismos falsos plausibles;
nunca un hecho/número/entidad inventado; la respuesta correcta y todo lo que
la pregunta afirme como hecho debe ser verdad; 4 opciones en opcion_unica.
Cada cambio va justificado con fuente en el comentario.
Ejecutar: python scripts/harden_portapapeles.py  (luego normalize_order + build_data)
"""
import json

F = "data/questions/inicio.json"
d = json.load(open(F, encoding="utf-8"))
Q = {x["id"]: x for x in d}
LET = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]

def set_opts(qid, texts, correct_letters=None):
    q = Q[qid]
    q["opciones"] = [{"letter": LET[i], "text": t} for i, t in enumerate(texts)]
    if correct_letters is not None:
        q["respuesta"] = correct_letters if len(correct_letters) > 1 else correct_letters[0]

def set_field(qid, **kw):
    Q[qid].update(kw)

# ------------------------------------------------------------------
# inicio-1  numeros arbitrarios (12/32/48) -> limites REALES de Word verificados
# Fuente: 9 y 17 confirmados prueba en vivo del usuario (video + capturas sep-2026);
# 24 = Microsoft + banco. Se baja a 3 opciones (permitido en oposicion).
set_opts("inicio-1",
    ["9 (el maximo de niveles de una lista multinivel)",
     "17 (los estilos de subrayado del cuadro Fuente)",
     "24 (el limite del Portapapeles de Office)"], ["C"])
set_field("inicio-1",
    enunciado="Los tres numeros son limites reales de Word 365. ¿Cual es la capacidad maxima del Portapapeles de Office (numero de acciones de copiar y cortar que almacena a la vez)?",
    explicacion="El Portapapeles de Office almacena hasta 24 elementos; al copiar el 25 se descarta el primero almacenado. Los otros dos son limites reales de Word pero de otros elementos: 9 niveles en una lista multinivel y 17 estilos en el desplegable «Estilo de subrayado» del cuadro Fuente.")

# ------------------------------------------------------------------
# inicio-7  distractor debil "abre Buscar y reemplazar" -> funcion real de Mayus+F2
# (real, tecla equivocada). Fuente: CLAUDE.md prueba en vivo (F2 mover / Mayus+F2 copiar a).
set_opts("inicio-7",
    ["Copia el texto seleccionado al portapapeles de Office",
     "Prepara el texto seleccionado para moverlo: al colocarse en el destino y pulsar Intro, el texto se desplaza alli",
     "Copia el texto a otro lugar sin quitarlo del origen ni tocar el portapapeles",
     "Activa el modo de edicion de la celda actual (como en Excel)"], ["B"])
set_field("inicio-7",
    explicacion="F2 prepara el texto para moverlo sin usar el portapapeles: la barra de estado muestra «¿Donde quieres moverlo?»; se lleva el cursor al destino y se pulsa Intro. La opcion C describe Mayus+F2 («Copiar a»): copia a otro punto sin borrar el original. La D es el comportamiento de F2 en Excel. Prueba en vivo del usuario (sep 2026).")

# ------------------------------------------------------------------
# inicio-8  distractor debil "mueve solo la ultima" -> confusion Spike/Portapapeles de Office
set_opts("inicio-8",
    ["Acumula todas las selecciones una a una para pegarlas juntas despues con Ctrl+Mayus+F3",
     "Corta la seleccion actual y descarta lo acumulado antes",
     "Funciona igual que Ctrl+X pero sin tocar el portapapeles de Windows",
     "Añade la seleccion al Portapapeles de Office (hasta 24 elementos) sin quitarla del documento"], ["A"])
set_field("inicio-8",
    explicacion="Ctrl+F3 es el Spike (portapapeles especial): cada uso CORTA la seleccion y la ACUMULA con las anteriores; Ctrl+Mayus+F3 suelta todo lo acumulado de golpe. El distractor D confunde el Spike con el Portapapeles de Office: aquel corta del documento y no tiene limite de 24. Prueba en vivo del usuario (sep 2026).")

# ------------------------------------------------------------------
# inicio-142 Pegar: quitar Cortar/Copiar (se eliminan por tema) -> variantes de pegado reales
set_opts("inicio-142",
    ["Pegar", "Pegado especial", "Pegar solo el texto, sin formato", "Copiar formato"], ["A"])
set_field("inicio-142",
    explicacion="El boton Pegar (Ctrl+V) inserta el contenido del portapapeles en la posicion del cursor con su formato. «Pegado especial» abre un cuadro para elegir el formato de insercion; «Pegar solo el texto» descarta el formato; «Copiar formato» (pincel) no pega contenido, solo atributos.")

# ------------------------------------------------------------------
# inicio-143 Cortar: "Pegar" no tiene sentido -> F2 (metodo real de mover, no es boton)
set_opts("inicio-143",
    ["Cortar", "Mover el texto con la tecla F2", "Copiar", "Copiar formato"], ["A"])
set_field("inicio-143",
    explicacion="Cortar (Ctrl+X) quita el texto de su sitio y lo guarda en el portapapeles para pegarlo en otro lugar. F2 tambien mueve texto, pero es una tecla, no un boton del grupo Portapapeles, y no pasa por el portapapeles. Copiar deja el original; Copiar formato solo maneja atributos.")

# ------------------------------------------------------------------
# inicio-144 Copiar: "Pegar" sin sentido -> Ctrl+F3 (copia real pero al Spike, quitando del doc)
set_opts("inicio-144",
    ["Copiar", "Cortar", "Mover al portapapeles especial con Ctrl+F3", "Copiar formato"], ["A"])
set_field("inicio-144",
    explicacion="Copiar (Ctrl+C) duplica el texto en el portapapeles dejando el original intacto. Cortar lo quitaria de su sitio; Ctrl+F3 (Spike) tambien, ademas de acumularlo; Copiar formato solo copia atributos, no el contenido.")

# ------------------------------------------------------------------
# inicio-145 Copiar formato: Pegar/Cortar/Copiar -> comandos reales relacionados con formato
set_opts("inicio-145",
    ["Copiar formato", "Aplicar estilos", "Borrar todo el formato", "Copiar"], ["A"])
set_field("inicio-145",
    explicacion="Copiar formato (el pincel, Alt+Ctrl+C) copia los atributos visuales del texto seleccionado para aplicarlos en otro sitio (Alt+Ctrl+V los pega). «Aplicar estilos» asigna un estilo con nombre, no copia atributos sueltos; «Borrar todo el formato» hace lo contrario; «Copiar» duplica el contenido, no el formato. Prueba en vivo del usuario.")

# ------------------------------------------------------------------
# inicio-150 Pegado especial: Conservar solo texto -> Insertar objeto (real, otra ubicacion)
set_opts("inicio-150",
    ["Pegado especial", "Establecer Pegar predeterminado", "Mantener formato de origen",
     "Insertar objeto (pestaña Insertar ▸ Texto)"], ["A"])
set_field("inicio-150",
    explicacion="«Pegado especial» abre un cuadro que permite elegir el formato exacto: tabla de Word, imagen, objeto vinculado al Excel de origen, texto sin formato, etc. «Insertar objeto» tambien incrusta contenido de Excel, pero esta en la pestaña Insertar, no dentro del menu Pegar, y no ofrece las opciones de pegado del portapapeles.")

# ------------------------------------------------------------------
# inicio-247 respuesta dudosa (MS: el Portapapeles de Office se borra al cerrar TODAS
# las apps de Office). Reformular para que la correcta sea inequivoca.
set_opts("inicio-247",
    ["Mientras siga abierta al menos una aplicacion de Office",
     "Mientras el documento donde se copio siga abierto",
     "Mientras no se haya guardado el documento",
     "Mientras no se cierre el panel del Portapapeles"], ["A"])
set_field("inicio-247",
    enunciado="¿Hasta cuando conserva su contenido el Portapapeles de Office en Word 365?",
    explicacion="El Portapapeles de Office mantiene sus elementos mientras haya al menos una aplicacion de Office abierta; se vacia al cerrarlas todas o al pulsar «Borrar todo» en su panel. Cerrar un documento concreto, no guardarlo o cerrar el panel no afecta a su contenido.")

# ------------------------------------------------------------------
# inicio-248 "Windows almacena solo 1 elemento" desactualizado (Win+V ~25). Matizar B y expl.
set_opts("inicio-248",
    ["No hay diferencia; son el mismo portapapeles con dos nombres",
     "El Portapapeles de Office guarda hasta 24 elementos y solo funciona en aplicaciones de Office; el Portapapeles de Windows guarda solo el ultimo elemento copiado (salvo que se active el Historial del Portapapeles con Windows+V) y sirve para cualquier aplicacion",
     "El Portapapeles de Windows guarda hasta 24 elementos y el de Office solo 1",
     "El Portapapeles de Office solo guarda texto; el de Windows guarda texto e imagenes"], ["B"])
set_field("inicio-248",
    explicacion="El Portapapeles de Office es propio de las aplicaciones Office y almacena hasta 24 elementos, visibles en su panel. El Portapapeles del sistema (Windows) guarda por defecto solo el ultimo elemento copiado; desde Windows 10/11 se puede activar el Historial del Portapapeles (Windows+V) para guardar varios, pero sigue siendo del sistema, no de Office.")

# ------------------------------------------------------------------
# inicio-249 "Ctrl+C dos veces" depende de una opcion desactivada por defecto -> la correcta
# pasa a ser el iniciador (siempre funciona); Ctrl+C x2 baja a distractor con matiz.
set_opts("inicio-249",
    ["Con el iniciador de cuadro de dialogo del grupo Portapapeles (la flecha de la esquina)",
     "Pulsando Ctrl+C dos veces seguidas",
     "Desde Vista ▸ Mostrar ▸ Panel del Portapapeles",
     "Con Ctrl+Mayus+V"], ["A"])
set_field("inicio-249",
    enunciado="¿Que forma abre SIEMPRE el panel del Portapapeles de Office en Word 365?",
    explicacion="El iniciador de cuadro de dialogo del grupo Portapapeles (flecha inferior derecha del grupo) abre el panel siempre. «Ctrl+C dos veces» solo lo abre si esta activada la opcion correspondiente del panel (desactivada por defecto). En Vista no hay ninguna entrada «Panel del Portapapeles»; Ctrl+Mayus+V pega sin formato.")

# ------------------------------------------------------------------
# inicio-270 notacion Mayus+Ctrl+F3 -> Ctrl+Mayus+F3
set_opts("inicio-270",
    ["Ctrl+C repetido varias veces sobre distintas selecciones",
     "Ctrl+F3 sobre cada seleccion y Ctrl+Mayus+F3 para pegar todo lo acumulado",
     "Ctrl+X repetido y luego Ctrl+V una sola vez",
     "F2 sobre cada seleccion y luego Intro"], ["B"])

# ------------------------------------------------------------------
# ATAJOS: sustituir combinaciones no verificadas / inexistentes por reales
# Ctrl+Mayus+C, Alt+Insertar, Mayus+X, Alt+F2, Ctrl+Mayus+F2 no estan en el volcado v2608.

# inicio-308 copiar alternativo: D Ctrl+Mayus+C -> Alt+Ctrl+C (real, copia FORMATO)
set_opts("inicio-308", ["Ctrl+Insertar", "Ctrl+C", "Mayus+Insertar", "Alt+Ctrl+C"], ["A"])
set_field("inicio-308",
    explicacion="Ctrl+Insertar es el metodo antiguo para copiar contenido. Ctrl+C es el atajo principal de copiar; Mayus+Insertar pega; Alt+Ctrl+C copia el FORMATO (pincel), no el contenido.")

# inicio-309 pegar alternativo: C Alt+Insertar -> Mayus+Supr (real, corta)
set_opts("inicio-309", ["Mayus+Insertar", "Ctrl+Insertar", "Mayus+Supr", "Ctrl+Mayus+V"], ["A"])
set_field("inicio-309",
    explicacion="Mayus+Insertar es el metodo antiguo para pegar. Ctrl+Insertar copia; Mayus+Supr corta; Ctrl+Mayus+V pega pero solo el texto sin formato.")

# inicio-310 cortar alternativo: D Mayus+X -> Ctrl+Insertar (real, copia)
set_opts("inicio-310", ["Mayus+Supr", "Ctrl+X", "Ctrl+Supr", "Ctrl+Insertar"], ["A"])
set_field("inicio-310",
    explicacion="Mayus+Supr es el metodo antiguo para cortar. Ctrl+X es el atajo principal de cortar; Ctrl+Supr borra la palabra a la derecha del cursor sin llevarla al portapapeles; Ctrl+Insertar copia.")

# inicio-311 Mayus+F2 (Copiar a): D Alt+F2 -> Ctrl+F3 (real, mueve al Spike)
set_opts("inicio-311", ["Mayus+F2", "Ctrl+F2", "F2", "Ctrl+F3"], ["A"])
set_field("inicio-311",
    explicacion="Mayus+F2 copia el texto a otro punto sin cortarlo («Copiar a»). F2 lo mueve; Ctrl+F2 abre la vista previa de impresion; Ctrl+F3 mueve la seleccion al Spike (portapapeles especial).")

# inicio-312 F2 (mover): D Alt+F2 -> Ctrl+F3
set_opts("inicio-312", ["F2", "Mayus+F2", "Ctrl+F2", "Ctrl+F3"], ["A"])
set_field("inicio-312",
    explicacion="F2 activa el modo mover: la barra de estado muestra «¿Donde quieres moverlo?», se lleva el cursor al destino y se pulsa Intro. Mayus+F2 copia («Copiar a»); Ctrl+F2 abre la vista previa de impresion; Ctrl+F3 mueve al Spike. Prueba en vivo del usuario (sep 2026).")

# inicio-318 pegar Spike: D Ctrl+Mayus+F2 -> Ctrl+V (real, pega el portapapeles normal, no el Spike)
set_opts("inicio-318", ["Ctrl+Mayus+F3", "Ctrl+F3", "Alt+F3", "Ctrl+V"], ["A"])
set_field("inicio-318",
    explicacion="Ctrl+Mayus+F3 inserta de golpe todo el contenido acumulado en el Spike y lo vacia. Ctrl+F3 mueve texto AL Spike; Alt+F3 crea un elemento de Autotexto; Ctrl+V pega el portapapeles normal, no el Spike.")

# inicio-383 Pegado especial (Alt+Ctrl+G): distractores -> atajos de pegado reales
set_opts("inicio-383", ["Ctrl+Mayus+V", "Alt+Ctrl+G", "Alt+Ctrl+V", "Ctrl+Mayus+F3"], ["B"])
set_field("inicio-383",
    explicacion="Alt+Ctrl+G abre el cuadro Pegado especial (elegir formato de insercion). Ctrl+Mayus+V pega solo texto; Alt+Ctrl+V pega el FORMATO copiado con el pincel; Ctrl+Mayus+F3 pega el contenido del Spike.")

# inicio-384 pegar sin formato (Ctrl+Mayus+V): distractores -> atajos de pegado reales
set_opts("inicio-384", ["Alt+Ctrl+G", "Alt+Ctrl+V", "Ctrl+Mayus+V", "Mayus+Insertar"], ["C"])
set_field("inicio-384",
    explicacion="Ctrl+Mayus+V pega el contenido del portapapeles como texto sin formato, adoptando el del destino. Alt+Ctrl+G abre Pegado especial; Alt+Ctrl+V pega el formato del pincel; Mayus+Insertar es el pegado antiguo, que si conserva el formato.")

# inicio-385 "que mas copia ademas de Ctrl+Insertar" -> Ctrl+C : distractores del portapapeles
set_opts("inicio-385", ["Ctrl+X", "Ctrl+C", "Mayus+Insertar", "Ctrl+Retroceso"], ["B"])
set_field("inicio-385",
    explicacion="Ctrl+C es el atajo principal para copiar, junto a la variante antigua Ctrl+Insertar. Ctrl+X corta; Mayus+Insertar pega; Ctrl+Retroceso borra la palabra a la izquierda del cursor.")

# inicio-386 "que mas corta ademas de Mayus+Supr" -> Ctrl+X : distractores del portapapeles
set_opts("inicio-386", ["Ctrl+Insertar", "Ctrl+Supr", "Ctrl+C", "Ctrl+X"], ["D"])
set_field("inicio-386",
    explicacion="Ctrl+X es el atajo principal para cortar, junto a la variante antigua Mayus+Supr. Ctrl+Insertar y Ctrl+C copian; Ctrl+Supr borra la palabra a la derecha del cursor sin llevarla al portapapeles.")

# inicio-390 "que mas pega ademas de Mayus+Insertar" -> Ctrl+V : distractores del portapapeles
set_opts("inicio-390", ["Ctrl+Insertar", "Ctrl+V", "Ctrl+X", "Ctrl+C"], ["B"])
set_field("inicio-390",
    explicacion="Ctrl+V es el atajo principal para pegar, junto a la variante antigua Mayus+Insertar. Ctrl+Insertar y Ctrl+C copian; Ctrl+X corta.")

# ------------------------------------------------------------------
# ICONOS: distractores lejanos (Fuente, Editor...) -> iconos del propio grupo Portapapeles
set_opts("inicio-394", ["Copiar formato", "Copiar", "Cortar", "Pegar"], ["D"])
set_field("inicio-394",
    explicacion="**Pegar.** Pestaña Inicio ▸ Portapapeles. Atajo: Ctrl+V. Los cuatro iconos del grupo Portapapeles se parecen: Pegar (portapapeles con hoja), Copiar (dos hojas), Cortar (tijeras), Copiar formato (pincel).")

set_opts("inicio-395", ["Inicio ▸ Parrafo", "Inicio ▸ Portapapeles", "Inicio ▸ Fuente", "Inicio ▸ Edicion"], ["B"])
set_field("inicio-395",
    explicacion="**Copiar.** Pestaña Inicio ▸ **Portapapeles** (primer grupo de la pestaña Inicio, a la izquierda). Atajo: Ctrl+C. Los grupos vecinos de esa misma pestaña son Fuente, Parrafo, Estilos y Edicion.")

set_opts("inicio-396", ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+Z"], ["C"])
set_field("inicio-396",
    explicacion="**Cortar.** Pestaña Inicio ▸ Portapapeles. Atajo: **Ctrl+X**. Ctrl+C copia, Ctrl+V pega, Ctrl+Z deshace: los tres son operaciones proximas pero distintas.")

set_opts("inicio-397", ["Pegar", "Copiar formato", "Copiar", "Borrar todo el formato"], ["B"])
set_field("inicio-397",
    explicacion="**Copiar formato.** Pestaña Inicio ▸ Portapapeles. Atajo: Alt+Ctrl+C. El pincel copia el formato del texto seleccionado para aplicarlo en otro sitio (Alt+Ctrl+V lo pega); doble clic = varios usos. «Borrar todo el formato» (grupo Fuente) hace lo contrario.")

# ------------------------------------------------------------------
# inicio-281 (SM limites): quitar el par inexistente de "navegacion"; solo numeros
# VERIFICADOS en la instalacion del usuario (capturas/video sep-2026). Distractor
# falso (E): la CINTA no tiene 17 subrayados, eso es el cuadro Fuente.
set_opts("inicio-281",
    ["El Portapapeles de Office almacena hasta 24 elementos",
     "El campo Tamaño de fuente admite valores de 1 a 1.638 puntos",
     "El desplegable «Estilo de subrayado» del cuadro Fuente ofrece 17 estilos (mas «(ninguno)»)",
     "Una lista multinivel admite hasta 9 niveles",
     "El desplegable Subrayado de la cinta ofrece 17 estilos de linea",
     "El cuadro Bordes y sombreado ofrece 24 estilos de linea de borde",
     "El cuadro Tabulaciones admite 5 tipos de alineacion (izquierda, centro, derecha, decimal y barra)",
     "El desplegable Interlineado del cuadro Parrafo ofrece 6 tipos (sencillo, 1,5 lineas, doble, minimo, exacto y multiple)"],
    ["A", "B", "C", "D", "F", "G", "H"])
set_field("inicio-281",
    explicacion="Correctas: A, B, C, D, F, G y H. E es falsa: el desplegable Subrayado de la CINTA ofrece unos 9 estilos rapidos mas «Ninguna» y «Mas subrayados…»; los 17 estilos estan en el desplegable «Estilo de subrayado» del cuadro Fuente (18 entradas contando «(ninguno)»). Numeros verificados en la instalacion del usuario (sep 2026): Portapapeles 24 · tamaño de fuente 1-1638 pto · subrayado 17 (cuadro Fuente) · lista multinivel 9 · estilos de linea de borde 24 · alineaciones de tabulacion 5 · tipos de interlineado 6 · diseños de Arte 164.")

# ------------------------------------------------------------------
# inicio-282 (emparejamiento numeros): quitar navegacion (no es un limite); 160->164;
# decoy = "estilos de linea de borde" (tambien 24, choca con Portapapeles = ambiguedad buena).
Q["inicio-282"]["matching"] = {
    "left": [
        {"id": "1", "label": "24"},
        {"id": "2", "label": "1.638"},
        {"id": "3", "label": "17"},
        {"id": "4", "label": "9"},
        {"id": "5", "label": "5"},
        {"id": "6", "label": "6"},
        {"id": "7", "label": "164"},
    ],
    "right": [
        {"id": "A", "label": "Capacidad maxima del Portapapeles de Office"},
        {"id": "B", "label": "Tamaño maximo de fuente en puntos"},
        {"id": "C", "label": "Estilos del desplegable «Estilo de subrayado» del cuadro Fuente"},
        {"id": "D", "label": "Niveles maximos de una lista multinivel"},
        {"id": "E", "label": "Tipos de alineacion de tabulacion (cuadro Tabulaciones)"},
        {"id": "F", "label": "Tipos de interlineado (desplegable del cuadro Parrafo)"},
        {"id": "G", "label": "Diseños de Arte en la ficha Borde de pagina"},
        {"id": "H", "label": "Estilos de linea de borde en Bordes y sombreado"},
    ],
    "correct": {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F", "7": "G"},
}
Q["inicio-282"]["respuesta"] = {"1": "A", "2": "B", "3": "C", "4": "D", "5": "E", "6": "F", "7": "G"}
set_field("inicio-282",
    explicacion="24 → Portapapeles de Office. 1.638 → tamaño maximo de fuente (pt). 17 → estilos del desplegable «Estilo de subrayado» del cuadro Fuente. 9 → niveles de una lista multinivel. 5 → tipos de alineacion de tabulacion (izquierda, centro, derecha, decimal, barra). 6 → tipos de interlineado (sencillo, 1,5 lineas, doble, minimo, exacto, multiple). 164 → diseños de Arte (ficha Borde de pagina). El destino H, «estilos de linea de borde», tambien vale 24 (choca con el Portapapeles), pero ningun numero de la izquierda le corresponde: es el señuelo. Numeros verificados en la instalacion del usuario (sep 2026).")

# ------------------------------------------------------------------
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")

changed = ["inicio-1","inicio-7","inicio-8","inicio-142","inicio-143","inicio-144","inicio-145",
 "inicio-150","inicio-247","inicio-248","inicio-249","inicio-270","inicio-308","inicio-309",
 "inicio-310","inicio-311","inicio-312","inicio-318","inicio-383","inicio-384","inicio-385",
 "inicio-386","inicio-390","inicio-394","inicio-395","inicio-396","inicio-397","inicio-281","inicio-282"]
print(f"endurecidas {len(changed)} preguntas de portapapeles")
# sanity: la respuesta sigue apuntando a una opcion existente
for qid in changed:
    q = Q[qid]
    if q["tipo"] in ("opcion_unica",):
        letters = {o["letter"] for o in q["opciones"]}
        assert q["respuesta"] in letters, (qid, q["respuesta"], letters)
    if q["tipo"] == "seleccion_multiple":
        letters = {o["letter"] for o in q["opciones"]}
        assert set(q["respuesta"]) <= letters, (qid, q["respuesta"], letters)
print("ok: todas las respuestas correctas siguen siendo validas")
