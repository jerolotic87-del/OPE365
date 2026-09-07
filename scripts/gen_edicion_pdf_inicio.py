# -*- coding: utf-8 -*-
"""+5 preguntas para inicio.json desde el PDF de la academia (Beatriz R.T,
"Pestaña Edicion" = grupos Portapapeles/Edicion de la ficha Inicio).

Solo se extrae lo que (a) NO estaba cubierto en el banco y (b) no
contradice ninguna prueba en vivo ni el volcado v2608. Hueco real: el
ESPACIO / GUION DE NO SEPARACION no tenia ninguna pregunta.

Conflictos del PDF que NO se convierten en pregunta (van a CLAUDE.md):
 - "Copiar formato = Ctrl+Mayus+C / Ctrl+Mayus+V": esquema internacional;
   en esta instalacion es Alt+Ctrl+C / Alt+Ctrl+V (prueba en vivo).
 - "panel de Navegacion nos busca hasta 100 resultados": en vivo NO hay
   tope (CLAUDE.md).
 - "guion de no separacion = Ctrl+Mayus+_": el volcado v2608 lo asigna a
   Alt+Mayus+- ; no se afirma el atajo, solo el concepto.
"""
import json

F = "data/questions/inicio.json"
d = json.load(open(F, encoding="utf-8"))

BASE = dict(sourceFile="inicio.json", bloque="Inicio - Edicion", section="inicio",
            topic="parrafo-marcas", subtopic="Caracteres de no separacion",
            tema="Parrafo", negativa=False, matching=None, generado=True)

def q(n, **kw):
    o = dict(BASE); o.update(kw); o["id"] = f"inicio-{n}"
    o.setdefault("sourceQuestionId", f"pdf-inicio-edic-{n}")
    return o

new = [
 q(575, tipo="opcion_unica", categoria="atajo",
   enunciado="Quieres que «Real Decreto» y su número no se separen nunca en dos líneas distintas. ¿Qué escribes entre las dos palabras?",
   opciones=[{"letter":"A","text":"Un espacio de no separación con Ctrl+Mayús+Espacio"},
             {"letter":"B","text":"Un espacio normal pulsando Ctrl+Espacio"},
             {"letter":"C","text":"Un tabulador con la tecla Tab"},
             {"letter":"D","text":"Un salto de línea manual con Mayús+Intro"}],
   respuesta="A",
   explicacion="El espacio de no separación (Ctrl+Mayús+Espacio, comando «Espacio de no separación» del cuadro Personalizar teclado) une las dos palabras: Word nunca romperá la línea entre ellas. Ctrl+Espacio no inserta un espacio: quita el formato de carácter manual de la selección."),
 q(576, tipo="opcion_unica", categoria="concepto",
   enunciado="¿Qué efecto tiene insertar un espacio de no separación entre dos palabras?",
   opciones=[{"letter":"A","text":"Impide que Word divida esas dos palabras en líneas distintas; siempre quedan juntas"},
             {"letter":"B","text":"Duplica el ancho del espacio entre ambas palabras"},
             {"letter":"C","text":"Convierte las dos palabras en una sola a efectos del corrector ortográfico"},
             {"letter":"D","text":"Impide que el espacio pueda borrarse con Retroceso o Suprimir"}],
   respuesta="A",
   explicacion="El espacio (y el guión) de no separación bloquean la ruptura de línea en ese punto: las palabras a ambos lados se mantienen siempre en la misma línea. No cambia el ancho del espacio, ni la ortografía, ni impide borrarlo."),
 q(577, tipo="opcion_unica", categoria="ruta",
   enunciado="Además del atajo de teclado, ¿desde dónde se inserta con el ratón un espacio o un guión de no separación?",
   opciones=[{"letter":"A","text":"Insertar ▸ Símbolos ▸ Más símbolos… ▸ pestaña «Caracteres especiales»"},
             {"letter":"B","text":"Inicio ▸ Párrafo ▸ Mostrar todo"},
             {"letter":"C","text":"Disposición ▸ Configurar página ▸ Guiones"},
             {"letter":"D","text":"Insertar ▸ Texto ▸ Elementos rápidos"}],
   respuesta="A",
   explicacion="La pestaña «Caracteres especiales» del cuadro Símbolo (Insertar ▸ Símbolos ▸ Más símbolos) lista el espacio de no separación, el guión de no separación y el guión opcional, con su método abreviado al lado. «Guiones» de Disposición controla la partición automática de palabras, no inserta caracteres."),
 q(578, tipo="verdadero_falso", categoria="concepto",
   enunciado="Con Mostrar todo (¶) activado, el espacio de no separación se ve con un símbolo distinto al del espacio normal (que es un punto centrado).",
   opciones=[], respuesta=True,
   explicacion="Verdadero. Word marca el espacio normal con un punto centrado a media altura y el espacio de no separación con un pequeño círculo elevado (°), de modo que se distinguen de un vistazo cuando se muestran las marcas de formato."),
 q(579, tipo="verdadero_falso", categoria="concepto",
   enunciado="El guión de no separación evita que una palabra escrita con guión (por ejemplo «artículo-1») se parta al final de la línea justo por ese guión.",
   opciones=[], respuesta=True,
   explicacion="Verdadero. El guión de no separación se escribe y se ve como un guión normal, pero Word no lo usa como punto de corte de línea: la palabra compuesta queda entera. (En este Word el comando figura en el cuadro Personalizar teclado como «Guión de no separación».)"),
]

d.extend(new)
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas -> inicio-575..579  (topic parrafo-marcas)")
