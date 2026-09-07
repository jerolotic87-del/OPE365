# -*- coding: utf-8 -*-
"""Correspondencia: +15 preguntas + 6 flashcards desde las 59 capturas del
usuario (data/imagenes_rutas/correspondencia/), que revelan mucho detalle
de cuadros de dialogo que el volcado anterior (del PDF) no tenia.
Tambien corrige correspondencia-38 ("Direccion" -> "Campo de direccion 1/2").
"""
import json

QF = "data/questions/correspondencia.json"
FF = "data/flashcards/correspondencia.json"
d = json.load(open(QF, encoding="utf-8"))
qs = {q["id"]: q for q in d}

# --- correccion ---
q = qs["correspondencia-38"]
q["enunciado"] = ("El cuadro «Nueva lista de direcciones» trae 13 columnas por defecto "
                  "(Tratamiento, Nombre, Apellidos, Nombre de la organizacion, Campo de "
                  "direccion 1, Campo de direccion 2, Ciudad, Provincia, Codigo postal, "
                  "Pais o region, Telefono privado, Telefono del trabajo y Direccion de "
                  "correo electronico), y se pueden cambiar con «Personalizar columnas...».")
q["explicacion"] = ("Son los 13 campos estandar. Ojo: no existe una columna llamada solo "
                    "«Direccion»; son «Campo de direccion 1» y «Campo de direccion 2». "
                    "«Personalizar columnas...» abre el cuadro «Personalizar lista de "
                    "direcciones» (Agregar / Eliminar / Cambiar nombre / Subir / Bajar).")

def mk(n, topic, tipo, enun, ops, resp, expl, cat="concepto"):
    o = dict(sourceFile="correspondencia.json",
             bloque="Correspondencia — " + {
               "iniciar-combinacion":"Iniciar combinacion de correspondencia",
               "campos-combinacion":"Escribir e insertar campos",
               "crear-sobres-etiquetas":"Crear",
               "vista-previa-resultados":"Vista previa de resultados",
               "finalizar":"Finalizar"}[topic],
             section="correspondencia", topic=topic, subtopic=None, tema="Correspondencia",
             negativa=False, matching=None, generado=True, categoria=cat,
             id=f"correspondencia-{n}", sourceQuestionId=f"capt-corr-{n}",
             tipo=tipo, enunciado=enun,
             opciones=[{"letter":l,"text":t} for l,t in ops] if ops else [],
             respuesta=resp, explicacion=expl)
    return o

new = [
 mk(48,"campos-combinacion","opcion_unica",
   "En el cuadro «Insertar linea de saludo», ¿que opciones ofrece el primer desplegable del formato del saludo?",
   [("A","Querido, Queridisimo, Estimado y (ninguno)"),
    ("B","Sr., Sra., Srta. y Dr."),
    ("C","Hola, Buenos dias, Atentamente y Un saludo"),
    ("D","Formal, Informal y Neutro")],
   "A",
   "El primer desplegable elige la palabra inicial (Querido / Queridisimo / Estimado / (ninguno)); el segundo el formato del nombre y el tercero la puntuacion (: , o (ninguno))."),
 mk(49,"campos-combinacion","opcion_unica",
   "En «Insertar linea de saludo», la «Linea de saludo para nombres de destinatarios no validos» sirve para los registros sin nombre. ¿Que opciones tiene?",
   [("A","A quien corresponda:, Estimado Sr.:, Estimada Srta.: y (ninguno)"),
    ("B","Solo «A quien corresponda:»"),
    ("C","Cliente, Usuario y Destinatario"),
    ("D","Deja la linea en blanco siempre")],
   "A",
   "Cuando un registro no tiene un nombre valido, Word usa ese saludo generico en su lugar."),
 mk(50,"campos-combinacion","opcion_unica",
   "El boton «Insertar campo de combinacion» abre un cuadro con dos modos. ¿Cuales y en que se diferencian?",
   [("A","«Campos de direccion» (lista normalizada de ~30 campos) y «Campos de base de datos» (los campos reales del origen de datos)"),
    ("B","«Campos de texto» y «Campos numericos»"),
    ("C","«Campos visibles» y «Campos ocultos»"),
    ("D","«Campos de Word» y «Campos de Excel»")],
   "A",
   "«Campos de base de datos» inserta el nombre real de la columna del origen; «Campos de direccion» inserta un campo normalizado que luego se traduce con «Asignar campos»."),
 mk(51,"campos-combinacion","opcion_unica",
   "En «Insertar bloque de direcciones», ¿que se puede decidir sobre el pais o la region?",
   [("A","No incluirlo nunca, incluirlo siempre, o incluirlo solo si es distinto de un pais dado (p. ej. Espana)"),
    ("B","Solo se puede incluir o no incluir"),
    ("C","Word siempre incluye el pais y no se puede quitar"),
    ("D","El pais solo aparece en los sobres, nunca en el bloque de direcciones")],
   "A",
   "Ademas hay una casilla «Dar formato a la direccion en funcion del pais o region de destino»."),
 mk(52,"iniciar-combinacion","opcion_unica",
   "En el cuadro «Buscar entrada» (dentro de «Nueva lista de direcciones»), ¿donde se puede buscar?",
   [("A","En «Todos los campos» o en «Este campo» (uno concreto de los 13)"),
    ("B","Solo en el campo Nombre"),
    ("C","Solo en Nombre y Apellidos"),
    ("D","En cualquier documento abierto")],
   "A",
   "Se abre con el boton «Buscando...» del cuadro «Nueva lista de direcciones»."),
 mk(53,"vista-previa-resultados","opcion_unica",
   "El cuadro «Revisar e informar de errores» (Comprobacion de errores, Alt+Mayus+K) ofrece tres modos. ¿Cuales?",
   [("A","Simular la combinacion e informar en un documento nuevo; completar deteniendose en cada error; completar sin detenerse e informar al final"),
    ("B","Ignorar errores; corregir errores; cancelar"),
    ("C","Errores leves; errores graves; todos los errores"),
    ("D","Revisar antes; revisar durante; revisar despues")],
   "A",
   "El primero es una prueba en seco (no combina de verdad); los otros dos si combinan."),
 mk(54,"crear-sobres-etiquetas","opcion_unica",
   "En «Opciones de sobre», ¿que tamano de sobre viene seleccionado por defecto?",
   [("A","Sobre 10 (4 1/8 x 9 1/2 pda.)"),
    ("B","DL (110 x 220 mm)"),
    ("C","C5 (162 x 229 mm)"),
    ("D","A4")],
   "A",
   "La lista incluye ~25 tamanos: Sobre 6 3/4/9/10/11/12/14, serie B, serie C (C3..C65), DL, serie E, Italiano, M5/M65, Monarch, Oficio USA, Carta USA y «Tamano personal...»."),
 mk(55,"crear-sobres-etiquetas","opcion_unica",
   "En la ficha «Opciones de impresion» de «Opciones de sobre», ¿que se configura?",
   [("A","El metodo de alimentacion (6 posiciones), boca arriba / boca abajo, «Girar en sentido del reloj» y la bandeja de origen"),
    ("B","El color y el tamano de la fuente de la direccion"),
    ("C","El numero de copias y la intercalacion"),
    ("D","El margen respecto al borde del sobre")],
   "A",
   "El boton «Restablecer» vuelve al metodo que Word recomienda para la impresora."),
 mk(56,"crear-sobres-etiquetas","opcion_unica",
   "En la ficha «Etiquetas» del cuadro «Sobres y etiquetas», ¿que dos modos de impresion hay?",
   [("A","«Pagina entera con la misma etiqueta» o «Solo una etiqueta» (indicando Fila y Columna)"),
    ("B","«Todas las etiquetas» o «Etiquetas pares»"),
    ("C","«Etiqueta de direccion» o «Etiqueta de remite»"),
    ("D","«Imprimir ahora» o «Guardar para despues»")],
   "A",
   "«Solo una etiqueta» sirve para imprimir en una hoja ya empezada, indicando la posicion exacta (fila/columna) de la etiqueta libre."),
 mk(57,"crear-sobres-etiquetas","opcion_unica",
   "En «Opciones para etiquetas», el boton «Detalles...» abre un cuadro con la geometria de la etiqueta. ¿Que campos incluye?",
   [("A","Margenes, alto y ancho de etiqueta, y «Numero horizontal» / «Numero vertical» (etiquetas por fila y por columna)"),
    ("B","Solo el nombre de la marca comercial"),
    ("C","El color y el gramaje del papel"),
    ("D","La fuente y el tamano del texto")],
   "A",
   "Tambien «Nueva etiqueta...» crea una definicion propia y «Eliminar» borra una personalizada."),
 mk(58,"iniciar-combinacion","opcion_unica",
   "En el cuadro «Destinatarios de combinar correspondencia», ¿como se excluye a un destinatario concreto de la combinacion?",
   [("A","Desmarcando su casilla de verificacion en la primera columna de la tabla"),
    ("B","Borrando su fila con la tecla Supr"),
    ("C","No se puede: hay que editar el origen de datos"),
    ("D","Cambiando su Tratamiento a «(ninguno)»")],
   "A",
   "Las casillas marcan quien entra en la combinacion sin tocar el origen de datos. «Restringir lista de destinatarios» (Ordenar / Filtrar / Buscar duplicados / Buscar destinatario / Validar direcciones) ayuda a depurar la lista."),
 mk(59,"iniciar-combinacion","opcion_unica",
   "En el menu «Iniciar combinacion de correspondencia», ¿que hace la opcion «Directorio»?",
   [("A","Combina todos los registros en una sola pagina, uno tras otro (catalogo, listado telefonico...), sin salto de pagina entre ellos"),
    ("B","Crea una carpeta en el disco con un archivo por destinatario"),
    ("C","Abre el directorio de contactos de Outlook"),
    ("D","Genera un indice alfabetico de los destinatarios")],
   "A",
   "A diferencia de «Cartas» (una pagina por registro), «Directorio» pone todos los registros seguidos en el mismo documento."),
 mk(60,"campos-combinacion","verdadero_falso",
   "«Actualizar etiquetas» propaga el diseno de la primera celda de etiqueta al resto y solo es necesario al combinar etiquetas, no al combinar cartas o correos.",
   None, True,
   "Word inserta «Proximo registro» automaticamente en todas las celdas de etiqueta salvo la primera; «Actualizar etiquetas» copia a esas celdas los campos y el formato de la primera."),
 mk(61,"campos-combinacion","verdadero_falso",
   "El boton «Resaltar campos de combinacion» rellena los campos con datos reales de la lista.",
   None, False,
   "Falso: solo sombrea los campos «<<Campo>>» para verlos mejor en el documento. Quien muestra los datos reales es «Vista previa de resultados»."),
 mk(62,"crear-sobres-etiquetas","seleccion_multiple",
   "En la ficha «Sobres» del cuadro «Sobres y etiquetas», ¿que elementos aparecen?",
   [("A","Campo «Direccion»"),
    ("B","Campo «Remite» con una casilla «Omitir»"),
    ("C","Casilla «Agregar franqueo electronico»"),
    ("D","Botones «Imprimir» y «Agregar al documento»"),
    ("E","Un desplegable para elegir el estilo de cita")],
   ["A","B","C","D"],
   "«Omitir» quita el remite del sobre. «Agregar al documento» inserta el sobre como primera pagina; «Imprimir» lo manda directo a la impresora. El estilo de cita es de la pestana Referencias."),
]

d.extend(new)
json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(QF, "a", encoding="utf-8").write("\n")
print(f"preguntas: +{len(new)} (correspondencia-48..62) + correspondencia-38 corregida")

# --- flashcards ---
f = json.load(open(FF, encoding="utf-8"))
def fc(n, topic, front, back):
    return {"cardId": f"F-{n:03d}", "section":"correspondencia", "topic":topic,
            "subtopic": None, "cardType":"contenido", "priority":"alta",
            "front":front, "back":back,
            "sourceRefs":["data/rutas/correspondencia.txt (volcado del usuario)"],
            "knowledgeRefs":[], "questionRefs":[]}
fcs = [
 fc(16,"iniciar-combinacion",
    "¿Cuantos campos trae por defecto la lista de destinatarios y cuales son los de direccion?",
    "13 campos. Los de direccion son «Campo de direccion 1» y «Campo de direccion 2» (no hay uno llamado solo «Direccion»). Se editan con «Personalizar columnas...»."),
 fc(17,"iniciar-combinacion",
    "Menu «Iniciar combinacion de correspondencia»: los 7 tipos.",
    "Cartas, Mensajes de correo electronico, Sobres, Etiquetas, Directorio, Documento normal de Word y «Paso a paso por el Asistente...». «Directorio» = todos los registros en una sola pagina."),
 fc(18,"campos-combinacion",
    "«Insertar campo de combinacion»: ¿que diferencia hay entre «Campos de direccion» y «Campos de base de datos»?",
    "«Campos de base de datos» = los nombres reales de las columnas del origen. «Campos de direccion» = campos normalizados de Word, que hay que emparejar con los reales mediante «Asignar campos»."),
 fc(19,"campos-combinacion",
    "Linea de saludo: opciones del primer desplegable y de «nombres no validos».",
    "Primer desplegable: Querido / Queridisimo / Estimado / (ninguno). Para nombres no validos: A quien corresponda: / Estimado Sr.: / Estimada Srta.: / (ninguno)."),
 fc(20,"vista-previa-resultados",
    "«Comprobacion de errores» (Alt+Mayus+K): los 3 modos.",
    "1) Simular la combinacion e informar en un documento nuevo (prueba en seco). 2) Completar deteniendose en cada error. 3) Completar sin detenerse e informar al final."),
 fc(21,"campos-combinacion",
    "Los 4 atajos canonicos de la combinacion de correspondencia.",
    "Alt+Mayus+D = a documento nuevo · Alt+Mayus+M = a la impresora · Alt+Mayus+K = comprobar errores · Alt+Mayus+E = editar el origen de datos. (Alt+Mayus+N NO combina: vincula encabezado/pie.)"),
]
f.extend(fcs)
json.dump(f, open(FF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(FF, "a", encoding="utf-8").write("\n")
print(f"flashcards: +{len(fcs)} (F-016..F-021)")
