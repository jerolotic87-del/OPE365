# -*- coding: utf-8 -*-
import json
TC, NO, CB, TI, IN = "tabla-contenido", "notas", "citas-bibliografia", "titulos", "indice"
NAME = {TC:"Tabla de contenido", NO:"Notas al pie", CB:"Citas y bibliografía", TI:"Títulos", IN:"Índice"}
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TO = {t["id"]: i for s in tax["sections"] if s["id"] == "referencias" for i, t in enumerate(s["topics"])}

# ---------- retopicar las 7 existentes mal clasificadas ----------
QF = "data/questions/referencias.json"
dq = json.load(open(QF, encoding="utf-8"))
RETOPIC = {"referencias-3": IN, "referencias-4": TC, "referencias-7": "tabla-autoridades"}
for q in dq:
    if q["id"] in RETOPIC:
        q["topic"] = RETOPIC[q["id"]]

# ---------- V/F nuevas ----------
QN = [
(TC,"El grupo «Tabla de contenido» de la pestaña Referencias tiene un único comando.",False,
 "Falso: tiene tres — Tabla de contenido, Agregar texto y Actualizar tabla."),
(TC,"«Agregar texto» permite marcar el párrafo actual como Nivel 1, 2, 3 o «No mostrar en la tabla de contenido».",True,
 "Cambia el nivel de esquema del párrafo para que aparezca (o no) en la TdC, sin aplicarle un estilo de título."),
(TC,"La galería «Tabla de contenido» solo ofrece tablas automáticas, no una versión manual.",False,
 "Falso: ofrece Tabla automática 1, Tabla automática 2 y Tabla manual."),
(TC,"La «Tabla manual» se actualiza sola al cambiar los títulos del documento, igual que las automáticas.",False,
 "Falso: la Tabla manual es una plantilla con textos de marcador que hay que rellenar y mantener a mano."),
(TC,"El cuadro «Tabla de contenido» es el mismo diálogo que «Índice» y «Tabla de ilustraciones»: un solo cuadro con tres fichas.",True,
 "Se abre por la ficha correspondiente según el comando que se pulse, pero es el mismo cuadro."),
(TC,"En el cuadro Tabla de contenido, «Mostrar niveles» está fijado en 9 y no se puede cambiar.",False,
 "Falso: por defecto son 3 niveles y el campo es editable."),
(TC,"El cuadro Tabla de contenido ofrece siete formatos: Estilo personal, Clásico, Elegante, Sofisticado, Moderno, Formal y Sencillo.",True,
 "La ficha «Tabla de ilustraciones» del mismo cuadro tiene una lista distinta (Estilo personal, Clásico, Elegante, Centrado, Formal, Sencillo)."),
(TC,"«Usar hipervínculos en lugar de números de página», en el cuadro TdC, elimina los números de página del documento.",False,
 "Falso: solo hace que las entradas de la TdC sean enlaces; no toca la numeración del documento."),
(TC,"El botón «Opciones...» del cuadro TdC permite generar la tabla a partir de estilos concretos o de niveles de esquema.",True,
 "Ahí se elige, por ejemplo, que «Subtítulo» cuente como nivel 2, o generar la TdC desde campos de elemento de tabla."),
(TC,"El botón «Modificar...» del cuadro TdC edita el aspecto de los estilos Título 1 a Título 9.",False,
 "Falso: edita los estilos TDC 1 a TDC 9, que son los de las entradas de la propia tabla, no los Título."),
(TC,"Al pulsar «Actualizar tabla» Word pregunta si actualizar solo los números de página o toda la tabla.",True,
 "«Actualizar toda la tabla» rehace también el texto de las entradas; la otra opción solo repagina."),
(TC,"«Quitar tabla de contenido» está dentro del desplegable «Tabla de contenido».",True,
 "Junto a «Guardar selección en galería de tablas de contenido...»."),
# --- notas ---
(NO,"El atajo para insertar una nota al pie es Alt+Ctrl+O.",True,
 "La nota al final se inserta con Alt+Ctrl+L."),
(NO,"El atajo para insertar una nota al final es Alt+Ctrl+F.",False,
 "Falso: es Alt+Ctrl+L. Alt+Ctrl+O es la nota al pie."),
(NO,"El grupo Notas al pie incluye botones para ir a la nota al pie o al final siguiente y anterior.",True,
 "Nota al pie siguiente/anterior y Nota al final siguiente/anterior, además de «Mostrar notas»."),
(NO,"«Mostrar notas» convierte las notas al pie del documento en notas al final.",False,
 "Falso: solo lleva la vista al área de notas (al pie o al final). La conversión se hace con «Convertir...» en el cuadro de notas."),
(NO,"En el cuadro «Notas al pie y notas al final», la nota al pie puede colocarse en «Final de página» o «Por debajo de la selección».",True,
 "Las notas al final, a su vez, pueden ir al «Final del documento» o al «Final de la sección»."),
(NO,"Las notas al final solo pueden situarse al final del documento.",False,
 "Falso: también pueden ir al final de la sección."),
(NO,"El botón «Convertir...» del cuadro de notas permite pasar todas las notas al pie a notas al final, al revés, o intercambiarlas.",True,
 "Son las tres opciones del cuadro «Convertir notas»."),
(NO,"El formato de número de las notas solo admite 1, 2, 3...",False,
 "Falso: admite también a/b/c, A/B/C, i/ii/iii y símbolos (*, †, ‡, §)."),
(NO,"La numeración de las notas puede ser Continua, Reiniciar cada sección o Reiniciar cada página.",True,
 "Se elige en el desplegable «Numeración» del cuadro de notas."),
(NO,"«Marca personal», con el botón «Símbolo...», permite usar un carácter propio como marca de la nota en lugar de un número.",True,
 "Al usar marca personal, esa nota no entra en la numeración automática."),
# --- citas y bibliografía ---
(CB,"El estilo de cita activo por defecto en este Word es APA.",True,
 "En concreto APA Sexta edición; se cambia en el desplegable «Estilo» del grupo Citas y bibliografía."),
(CB,"El menú Estilo ofrece, entre otros, APA, Chicago, IEEE, MLA, Harvard - Anglia, ISO 690 y Turabian.",True,
 "La lista completa: APA, Chicago, GB7714, GOST (2 variantes), Harvard - Anglia, IEEE, ISO 690 (2 variantes), MLA, SIST02, Turabian."),
(CB,"El menú Estilo de citas incluye los estilos Vancouver y Oxford.",False,
 "Falso: no están. Los disponibles son APA, Chicago, GB7714, GOST, Harvard - Anglia, IEEE, ISO 690, MLA, SIST02 y Turabian."),
(CB,"«Insertar cita» permite «Agregar nueva fuente...» o «Agregar nuevo marcador de posición...».",True,
 "El marcador de posición reserva el hueco de la cita para completar la fuente más tarde."),
(CB,"En el Administrador de fuentes, un marcador de posición se muestra con un signo de interrogación (?) y una fuente citada con una marca de verificación.",True,
 "Es la leyenda que aparece bajo la «Lista actual»."),
(CB,"El Administrador de fuentes tiene una sola lista de fuentes.",False,
 "Falso: tiene «Lista general» (la maestra del equipo) y «Lista actual» (las del documento); se copian entre ambas con «Copiar ->»."),
(CB,"La galería «Bibliografía» ofrece tres bloques integrados: Bibliografía, Referencias y Trabajos citados.",True,
 "Además de «Insertar bibliografía» y «Guardar la selección en la galería de bibliografías...»."),
(CB,"«Insertar bibliografía» y el bloque integrado «Bibliografía» producen exactamente el mismo resultado.",False,
 "Falso: el bloque integrado añade además un título de sección («Bibliografía»); «Insertar bibliografía» solo pone la lista."),
(CB,"«Cambiar SP de proveedor» sirve para cambiar el estilo de cita (APA, MLA...).",False,
 "Falso: cambia el proveedor de servicio de citas (complementos como Mendeley Cite, EndNote, RefWorks...). El estilo se cambia en «Estilo»."),
(CB,"El Administrador de fuentes permite buscar, ordenar (por autor, etc.) y editar o eliminar fuentes.",True,
 "También crear nuevas con «Nuevo...» y traer fuentes de otro archivo con «Examinar...»."),
(CB,"La vista previa del Administrador de fuentes se muestra siempre en formato APA, sea cual sea el estilo elegido.",False,
 "Falso: usa el estilo activo. En la captura aparece «Vista previa (APA)» porque APA es el estilo seleccionado."),
# --- títulos ---
(TI,"«Insertar título» abre el cuadro Título, con los rótulos Ilustración, Ecuación y Tabla disponibles de fábrica.",True,
 "El texto propuesto es del tipo «Ilustración 1», con el número que corresponda."),
(TI,"El cuadro Título no permite crear rótulos nuevos: solo Ilustración, Ecuación y Tabla.",False,
 "Falso: el botón «Nuevo rótulo...» permite crear uno propio (Gráfico, Anexo, Mapa...)."),
(TI,"En el cuadro Título, la posición del rótulo solo puede ser «Debajo de la selección».",False,
 "Falso: también «Encima de la selección»."),
(TI,"La casilla «Excluir el rótulo del título» inserta solo el número, sin la palabra (por ejemplo «1» en vez de «Ilustración 1»).",True,
 "Útil cuando la palabra del rótulo se escribe aparte o va en otro idioma."),
(TI,"«Autotítulo...» hace que Word añada un título automáticamente cada vez que se inserta un objeto de un tipo elegido.",True,
 "Por ejemplo, poner «Tabla N» sola cada vez que se pega una hoja de Excel."),
(TI,"«Insertar tabla de ilustraciones» genera un listado de todos los elementos que tienen un rótulo concreto (Ilustración, Tabla o Ecuación).",True,
 "Se elige el rótulo en el propio cuadro; se pueden tener varias tablas de ilustraciones, una por rótulo."),
(TI,"«Tabla de ilustraciones» y «Tabla de contenido» son comandos que abren cuadros de diálogo distintos.",False,
 "Falso: son dos fichas del mismo cuadro (junto con «Índice»)."),
(TI,"La «Referencia cruzada» de la pestaña Referencias es el mismo cuadro que la de Insertar ▸ Vínculos.",True,
 "Idéntico diálogo: Tipo, Referencia a, Insertar como hipervínculo, etc."),
(TI,"En «Referencia cruzada», el tipo «Título» siempre está disponible, aunque el documento no tenga estilos de título aplicados.",False,
 "Falso: «Título» solo aparece en la lista de tipos si hay párrafos con estilo Título 1–9."),
(TI,"En el cuadro «Referencia cruzada», la casilla «Insertar como hipervínculo» viene marcada por defecto.",True,
 "Así la referencia lleva al elemento con Ctrl+clic."),
# --- índice ---
(IN,"El cuadro «Marcar entrada de índice» permanece abierto para poder marcar varias entradas seguidas.",True,
 "Lo dice el propio cuadro: no hay que reabrirlo por cada palabra."),
(IN,"El cuadro «Marcar entrada de índice» no admite subentradas.",False,
 "Falso: tiene un campo «Entrada» y un campo «Subentrada»."),
(IN,"«Marcar todas», en el cuadro de entrada de índice, marca solo la primera aparición del término en el documento.",False,
 "Falso: marca todas las apariciones que coincidan exactamente con el texto de la entrada."),
(IN,"En «Marcar entrada de índice», la opción «Referencia cruzada» inserta un «Véase ...» en lugar de un número de página.",True,
 "Las otras opciones son «Página actual» (por defecto) e «Intervalo de páginas» (con un marcador)."),
(IN,"El cuadro «Índice» permite elegir el tipo «Con sangría» o «Continuo» y el número de columnas.",True,
 "Por defecto son 2 columnas y tipo «Con sangría», e idioma Español (España)."),
(IN,"El cuadro «Índice» genera el índice siempre a una sola columna.",False,
 "Falso: por defecto usa 2 columnas y el número es configurable."),
(IN,"El índice se genera automáticamente a partir de los estilos de título, igual que la tabla de contenido.",False,
 "Falso: se genera a partir de las entradas marcadas a mano (campos XE) o con «Automarcar...»."),
(IN,"«Automarcar...», en el cuadro Índice, usa un archivo de concordancia para marcar muchas entradas de golpe.",True,
 "El archivo es una tabla de dos columnas: texto a buscar / entrada de índice."),
(IN,"«Actualizar índice» y «Actualizar tabla» (de Tabla de contenido) son el mismo botón.",False,
 "Falso: son botones distintos, en grupos distintos de la pestaña Referencias."),
]
n0 = max(int(q["id"].split("-")[-1]) for q in dq)
for k, (tp, en, r, ex) in enumerate(QN, 1):
    dq.append({"id":"referencias-%d"%(n0+k),"sourceFile":"referencias.json","bloque":"Referencias — "+NAME[tp],
        "tipo":"verdadero_falso","categoria":"concepto","negativa":False,"section":"referencias",
        "topic":tp,"subtopic":None,"tema":NAME[tp],"sourceQuestionId":"vf-referencias-%02d"%k,"generado":True,
        "enunciado":en,"opciones":[],"matching":None,"respuesta":bool(r),"explicacion":ex})
dq.sort(key=lambda q:(TO.get(q["topic"],9), int(q["id"].split("-")[-1])))
json.dump(dq, open(QF,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(QF,"a",encoding="utf-8").write("\n")
vf=[q for q in dq if q["tipo"]=="verdadero_falso"]; tv=sum(1 for q in vf if q["respuesta"])
print("referencias.json: %d preguntas (V/F %d/%d), +%d"%(len(dq),tv,len(vf)-tv,len(QN)))

# ---------- flashcards ----------
FF = "data/flashcards/referencias.json"
dc = json.load(open(FF, encoding="utf-8"))
FN = [
(TC,"¿Qué 3 comandos tiene el grupo Tabla de contenido?","Tabla de contenido · Agregar texto · Actualizar tabla"),
(TC,"¿Qué hace «Agregar texto» en el grupo Tabla de contenido?","Marca el párrafo actual como Nivel 1/2/3 de la TdC, o «No mostrar en la tabla de contenido»"),
(TC,"¿Qué opciones integradas ofrece la galería «Tabla de contenido»?","Tabla automática 1 · Tabla automática 2 · Tabla manual"),
(TC,"¿En qué se diferencia la «Tabla manual» de las automáticas?","La manual es una plantilla con textos de marcador que hay que rellenar y mantener a mano"),
(TC,"¿Qué 3 fichas tiene el cuadro que abre «Tabla de contenido personalizada»?","Índice · Tabla de contenido · Tabla de ilustraciones (es un único cuadro)"),
(TC,"¿Cuántos niveles muestra por defecto la tabla de contenido?","3 (campo «Mostrar niveles», editable)"),
(TC,"¿Qué 7 formatos ofrece el cuadro Tabla de contenido?","Estilo personal · Clásico · Elegante · Sofisticado · Moderno · Formal · Sencillo"),
(TC,"¿Qué estilos edita el botón «Modificar...» del cuadro TdC?","Los estilos TDC 1 a TDC 9 (las entradas de la tabla), no los Título"),
(TC,"¿Qué permite el botón «Opciones...» del cuadro TdC?","Generar la tabla desde estilos concretos (Título, Subtítulo…) o desde niveles de esquema / campos de elemento de tabla"),
(TC,"¿Qué pregunta Word al pulsar «Actualizar tabla»?","Si actualizar solo los números de página o toda la tabla"),
(NO,"¿Atajo para insertar una nota al pie?","Alt+Ctrl+O"),
(NO,"¿Atajo para insertar una nota al final?","Alt+Ctrl+L"),
(NO,"¿Qué hace «Mostrar notas»?","Lleva la vista al área de notas (al pie o al final)"),
(NO,"¿Dónde puede colocarse una nota al pie? ¿Y una nota al final?","Al pie: Final de página / Por debajo de la selección. Al final: Final del documento / Final de la sección"),
(NO,"¿Qué hace el botón «Convertir...» del cuadro de notas?","Pasa todas las notas al pie a notas al final, al revés, o las intercambia"),
(NO,"¿Qué formatos de número admiten las notas?","1,2,3 · a,b,c · A,B,C · i,ii,iii · símbolos (*, †, ‡, §)"),
(NO,"¿Qué opciones de numeración tienen las notas?","Continua · Reiniciar cada sección · Reiniciar cada página"),
(NO,"¿Qué es la «Marca personal» en el cuadro de notas?","Un carácter propio (elegido con «Símbolo...») que sustituye al número; esa nota queda fuera de la numeración automática"),
(CB,"¿Estilo de cita por defecto en este Word?","APA (Sexta edición)"),
(CB,"¿Qué estilos de cita ofrece Word 365?","APA · Chicago · GB7714 · GOST (nombre/título) · Harvard - Anglia · IEEE · ISO 690 (2 variantes) · MLA · SIST02 · Turabian"),
(CB,"¿Qué dos formas de insertar cita ofrece «Insertar cita»?","Agregar nueva fuente… · Agregar nuevo marcador de posición…"),
(CB,"En el Administrador de fuentes, ¿qué distingue una fuente citada de un marcador de posición?","Fuente citada = marca de verificación (✓); marcador de posición = signo de interrogación (?)"),
(CB,"¿Qué dos listas tiene el Administrador de fuentes?","Lista general (maestra del equipo) y Lista actual (las del documento); se copian con «Copiar ->»"),
(CB,"¿Qué 3 bloques integrados ofrece la galería «Bibliografía»?","Bibliografía · Referencias · Trabajos citados"),
(CB,"¿Diferencia entre «Insertar bibliografía» y el bloque «Bibliografía»?","El bloque integrado añade además un título de sección; «Insertar bibliografía» solo pone la lista"),
(CB,"¿Para qué sirve «Cambiar SP de proveedor»?","Para cambiar el proveedor de servicio de citas (Mendeley, EndNote, RefWorks…), no el estilo"),
(TI,"¿Qué rótulos trae de fábrica el cuadro «Título»?","Ilustración · Ecuación · Tabla (se pueden crear más con «Nuevo rótulo...»)"),
(TI,"¿Qué posiciones admite el rótulo en el cuadro Título?","Debajo de la selección · Encima de la selección"),
(TI,"¿Qué hace «Excluir el rótulo del título»?","Inserta solo el número, sin la palabra («1» en vez de «Ilustración 1»)"),
(TI,"¿Qué hace «Autotítulo...»?","Añade un título automáticamente cada vez que se inserta un objeto de un tipo elegido"),
(TI,"¿Qué genera «Insertar tabla de ilustraciones»?","Un listado de todos los elementos con un rótulo dado (Ilustración, Tabla o Ecuación)"),
(TI,"¿Qué 6 formatos ofrece la «Tabla de ilustraciones»?","Estilo personal · Clásico · Elegante · Centrado · Formal · Sencillo"),
(TI,"¿Tipos disponibles en el cuadro «Referencia cruzada»?","Elemento numerado · Título · Marcador · Nota al pie · Nota al final · Ecuación · Ilustración · Tabla (Título solo si hay estilos de título)"),
(TI,"¿Opciones de «Referencia a» para un elemento numerado?","Número de página · Número de párrafo (varias variantes) · Texto de párrafo · Más adelante o más atrás"),
(TI,"¿Está marcado por defecto «Insertar como hipervínculo» en Referencia cruzada?","Sí"),
(IN,"¿Qué particularidad tiene el cuadro «Marcar entrada de índice»?","Permanece abierto para marcar varias entradas seguidas"),
(IN,"¿Diferencia entre «Marcar» y «Marcar todas» en el índice?","«Marcar» solo la selección; «Marcar todas» todas las apariciones exactas del término"),
(IN,"¿Qué opciones de referencia tiene una entrada de índice?","Referencia cruzada («Véase …») · Página actual (por defecto) · Intervalo de páginas"),
(IN,"¿Cómo se genera el índice, a diferencia de la tabla de contenido?","A partir de entradas marcadas a mano (campos XE) o con «Automarcar...», no de los estilos de título"),
(IN,"¿Qué hace «Automarcar...» en el cuadro Índice?","Usa un archivo de concordancia (texto a buscar / entrada) para marcar muchas entradas de golpe"),
(IN,"¿Tipo y columnas por defecto del índice?","Tipo «Con sangría», 2 columnas, idioma Español (España)"),
]
n0c = max(int(c["cardId"].split("-")[-1]) for c in dc)
for k, (tp, fr, bk) in enumerate(FN, 1):
    dc.append({"cardId":"F-%03d"%(n0c+k),"section":"referencias","topic":tp,"subtopic":None,
        "cardType":"contenido","priority":"normal","front":fr,"back":bk,
        "sourceRefs":["data/rutas/referencias.txt / capturas del usuario (sep-2026)"],
        "knowledgeRefs":[],"questionRefs":[]})
dc.sort(key=lambda c:(TO.get(c["topic"],9), int(c["cardId"].split("-")[-1])))
json.dump(dc, open(FF,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(FF,"a",encoding="utf-8").write("\n")
print("referencias flashcards: %d (+%d)"%(len(dc),len(FN)))
