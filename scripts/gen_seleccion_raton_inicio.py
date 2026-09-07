# -*- coding: utf-8 -*-
"""+7 preguntas para inicio.json: TECNICAS DE SELECCION DE TEXTO CON EL RATON.

Hueco real detectado al cruzar el banco con tests de oposicion (AGE 2016
pregunta oficial de "triple clic = parrafo") y con wordexperto / aulaclic:
el banco no tenia NINGUNA pregunta sobre el doble/triple clic, el area de
seleccion del margen izquierdo, Ctrl+clic o Alt+arrastre.

Comportamiento estandar de Word (sin riesgo de esquema de teclado):
 - cuerpo del texto: 1 clic = punto de insercion · doble clic = palabra ·
   triple clic = parrafo entero · Ctrl+clic = la frase/oracion completa ·
   Alt+arrastrar = bloque rectangular (vertical) de texto ·
   Mayus+clic = extiende la seleccion desde el punto de insercion.
 - area de seleccion (margen izquierdo, el puntero es una flecha blanca
   que apunta a la derecha): 1 clic = la linea · doble clic = el parrafo ·
   triple clic (o Ctrl+clic) = todo el documento (equivale a Ctrl+E).
"""
import json

F = "data/questions/inicio.json"
d = json.load(open(F, encoding="utf-8"))

BASE = dict(sourceFile="inicio.json", bloque="Inicio - Edicion", section="inicio",
            topic="edicion", subtopic="Seleccionar texto", tema="Edicion",
            negativa=False, matching=None, generado=True, categoria="concepto")

def q(n, **kw):
    o = dict(BASE); o.update(kw); o["id"] = f"inicio-{n}"
    o.setdefault("sourceQuestionId", f"web-inicio-selraton-{n}")
    return o

new = [
 q(581, tipo="opcion_unica",
   enunciado="En Word, ¿qué se selecciona al hacer triple clic sobre cualquier punto de un párrafo?",
   opciones=[{"letter":"A","text":"El párrafo completo"},
             {"letter":"B","text":"Solo la palabra sobre la que se hace clic"},
             {"letter":"C","text":"La frase (hasta el siguiente punto)"},
             {"letter":"D","text":"Toda la página"}],
   respuesta="A",
   explicacion="Dentro del cuerpo del texto: un clic coloca el punto de inserción, el doble clic selecciona la palabra y el triple clic selecciona todo el párrafo."),
 q(582, tipo="opcion_unica",
   enunciado="El «área de selección» es la franja del margen izquierdo donde el puntero se convierte en una flecha blanca que apunta a la derecha. ¿Qué se selecciona con UN solo clic en ella?",
   opciones=[{"letter":"A","text":"La línea completa situada a su derecha"},
             {"letter":"B","text":"La palabra más cercana"},
             {"letter":"C","text":"El párrafo completo"},
             {"letter":"D","text":"Todo el documento"}],
   respuesta="A",
   explicacion="Desde el área de selección: un clic selecciona la línea, un doble clic el párrafo y un triple clic (o Ctrl+clic) todo el documento."),
 q(583, tipo="opcion_unica",
   enunciado="Desde el área de selección del margen izquierdo, ¿cómo se selecciona TODO el documento con el ratón?",
   opciones=[{"letter":"A","text":"Haciendo triple clic, o Ctrl+clic, en el área de selección"},
             {"letter":"B","text":"Haciendo doble clic en el área de selección"},
             {"letter":"C","text":"Haciendo un solo clic en el área de selección"},
             {"letter":"D","text":"Arrastrando de arriba abajo por el área de selección con Alt pulsado"}],
   respuesta="A",
   explicacion="Triple clic en el área de selección selecciona todo el documento; Ctrl+clic en esa misma franja hace lo mismo y equivale a Ctrl+E."),
 q(584, tipo="opcion_unica",
   enunciado="Manteniendo pulsada la tecla Ctrl y haciendo clic sobre una palabra del texto (no en el margen), ¿qué selecciona Word?",
   opciones=[{"letter":"A","text":"La frase completa (hasta el punto)"},
             {"letter":"B","text":"La palabra sobre la que se hace clic"},
             {"letter":"C","text":"El párrafo completo"},
             {"letter":"D","text":"Todo el documento"}],
   respuesta="A",
   explicacion="Ctrl+clic dentro del cuerpo del texto selecciona la oración completa donde está el cursor. (Ctrl+clic en el área de selección del margen, en cambio, selecciona todo el documento.)"),
 q(585, tipo="opcion_unica",
   enunciado="¿Qué gesto del ratón permite seleccionar un bloque rectangular (vertical) de texto, por ejemplo una columna de cifras?",
   opciones=[{"letter":"A","text":"Arrastrar con la tecla Alt pulsada"},
             {"letter":"B","text":"Arrastrar con la tecla Ctrl pulsada"},
             {"letter":"C","text":"Hacer doble clic y arrastrar"},
             {"letter":"D","text":"Arrastrar desde el área de selección"}],
   respuesta="A",
   explicacion="Alt+arrastrar selecciona un bloque rectangular de texto, independiente de las líneas. Con teclado, el modo equivalente es Ctrl+Mayús+F8. Ctrl+arrastrar mueve o (con el texto ya seleccionado) copia."),
 q(586, tipo="verdadero_falso",
   enunciado="Hacer Ctrl+clic en el área de selección del margen izquierdo equivale a pulsar Ctrl+E: selecciona todo el documento.",
   opciones=[], respuesta=True,
   explicacion="Verdadero. Ctrl+clic en la franja del margen izquierdo es el equivalente con ratón de Ctrl+E (seleccionar todo)."),
 q(587, tipo="emparejamiento", opciones=[],
   enunciado="Relaciona cada gesto del ratón con lo que selecciona en Word:",
   matching={
     "left":[{"id":"1","label":"Doble clic sobre una palabra"},
             {"id":"2","label":"Triple clic dentro de un párrafo"},
             {"id":"3","label":"Un clic en el área de selección (margen izquierdo)"},
             {"id":"4","label":"Triple clic en el área de selección"}],
     "right":[{"id":"A","label":"La palabra"},
              {"id":"B","label":"El párrafo"},
              {"id":"C","label":"La línea"},
              {"id":"D","label":"Todo el documento"},
              {"id":"E","label":"La frase (hasta el punto)"}],
     "correct":{"1":"A","2":"B","3":"C","4":"D"}},
   respuesta={"1":"A","2":"B","3":"C","4":"D"},
   explicacion="En el cuerpo del texto: doble clic = palabra, triple clic = párrafo. En el área de selección del margen izquierdo: 1 clic = línea, 2 clics = párrafo, 3 clics = todo el documento. El distractor «la frase» corresponde a Ctrl+clic en el cuerpo."),
]

d.extend(new)
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas -> inicio-581..587 (topic edicion / Seleccionar texto)")
