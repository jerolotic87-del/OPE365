# -*- coding: utf-8 -*-
"""+6 preguntas para disposicion.json. Huecos al cruzar el banco (132 preg,
ya muy completo) con data/rutas/disposicion.txt + aulaclic + customguide:
 - al eliminar un salto de seccion, la seccion anterior toma el formato de
   la posterior (trampa clasica de examen; 0 preguntas)
 - cuadro «Numeros de linea» (Opciones de numeracion): campos Iniciar en /
   Del texto / Intervalo, y la Numeracion (Continua / Reiniciar pagina /
   Reiniciar seccion)
 - casilla «Suprimir notas al final» de la ficha Disposicion del cuadro
   Configurar pagina
 - Guiones > Manuales (Word va preguntando donde partir cada palabra)
Disposicion no tiene atajos.
"""
import json

F = "data/questions/disposicion.json"
d = json.load(open(F, encoding="utf-8"))

def q(n, topic, **kw):
    o = dict(sourceFile="disposicion.json",
             bloque="Disposicion - " + ("Configurar pagina" if topic=="configurar-pagina" else "Organizar" if topic=="organizar" else "Parrafo"),
             section="disposicion", topic=topic, subtopic=None, tema="Disposicion",
             negativa=False, matching=None, generado=True, categoria="concepto")
    o.update(kw); o["id"] = f"disposicion-{n}"
    o.setdefault("sourceQuestionId", f"web-disposicion-{n}")
    return o

new = [
 q(133, "configurar-pagina", tipo="verdadero_falso",
   enunciado="Al eliminar un salto de seccion, el texto que estaba antes del salto pasa a tener el formato de seccion (margenes, orientacion, columnas...) que tenia el texto que iba despues.",
   respuesta=True,
   explicacion="El salto de seccion guarda el formato de la seccion que lo precede. Si se borra, esa seccion anterior se fusiona con la siguiente y adopta el formato de esta ultima; por eso conviene borrar los saltos de abajo hacia arriba y revisar el resultado."),
 q(134, "configurar-pagina", tipo="opcion_unica", categoria="ruta",
   enunciado="Para localizar y borrar un salto de seccion concreto, ¿que conviene hacer primero?",
   opciones=[{"letter":"A","text":"Activar «Mostrar todo» (marcas de formato) para ver la linea doble punteada del salto"},
             {"letter":"B","text":"Cambiar a la vista Esquema"},
             {"letter":"C","text":"Convertir el documento a una sola seccion desde Disposicion"},
             {"letter":"D","text":"Proteger el documento y usar Inspeccionar documento"}],
   respuesta="A",
   explicacion="Con las marcas de formato visibles el salto de seccion aparece como una linea de puntos con la etiqueta «Salto de seccion (tipo)»; se coloca el cursor delante y se pulsa Supr. No hay un comando de la cinta que los quite todos de golpe."),
 q(135, "configurar-pagina", tipo="verdadero_falso",
   enunciado="El cuadro «Numeros de linea» (Disposicion ▸ Numeros de linea ▸ Opciones de numeracion de linea) permite fijar «Iniciar en», «Del texto» (distancia) e «Intervalo».",
   respuesta=True,
   explicacion="«Iniciar en» = primer numero; «Del texto» = separacion entre el numero y el texto; «Intervalo» = cada cuantas lineas se muestra el numero (p. ej. 5 = solo 5, 10, 15...). Ademas se elige la Numeracion: Continua, Reiniciar en cada pagina o Reiniciar en cada seccion."),
 q(136, "configurar-pagina", tipo="opcion_unica",
   enunciado="En el cuadro «Numeros de linea», ¿que hace el campo «Intervalo» si se pone en 5?",
   opciones=[{"letter":"A","text":"Muestra el numero solo cada 5 lineas (5, 10, 15...), aunque todas se cuentan"},
             {"letter":"B","text":"Empieza a numerar a partir de la linea 5"},
             {"letter":"C","text":"Deja 5 mm entre el numero y el texto"},
             {"letter":"D","text":"Numera solo las 5 primeras lineas de cada pagina"}],
   respuesta="A",
   explicacion="«Intervalo» controla cada cuantas lineas aparece el numero impreso; la cuenta interna sigue siendo linea a linea. «Iniciar en» seria la opcion B y «Del texto» la C."),
 q(137, "configurar-pagina", tipo="verdadero_falso",
   enunciado="La ficha «Disposicion» del cuadro Configurar pagina incluye la casilla «Suprimir notas al final».",
   respuesta=True,
   explicacion="En esa ficha estan: «Empezar seccion», «Suprimir notas al final», los encabezados/pies (Pares e impares diferentes, Primera pagina diferente, Desde el borde), la «Alineacion vertical» (Superior/Centrada/Justificada/Inferior) y los botones «Numeros de linea...» y «Bordes...»."),
 q(138, "configurar-pagina", tipo="opcion_unica",
   enunciado="En el menu «Guiones» de la pestana Disposicion, ¿que hace la opcion «Manuales»?",
   opciones=[{"letter":"A","text":"Word recorre el documento y va preguntando, palabra por palabra, donde colocar el guion de division"},
             {"letter":"B","text":"Activa la division de palabras automatica en todo el documento"},
             {"letter":"C","text":"Inserta un guion normal en la posicion del cursor"},
             {"letter":"D","text":"Quita todos los guiones de division del documento"}],
   respuesta="A",
   explicacion="«Automaticos» divide sin intervencion; «Manuales» abre un cuadro que propone un punto de corte para cada palabra susceptible de dividirse y el usuario acepta, cambia o rechaza. «Ninguno» desactiva la division."),
]

d.extend(new)
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas -> disposicion-133..138")
