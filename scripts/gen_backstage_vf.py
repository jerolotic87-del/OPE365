# -*- coding: utf-8 -*-
import json
sec = "archivo"
f = "data/questions/%s.json" % sec
d = json.load(open(f, encoding="utf-8"))
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
NAME = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == sec for t in s["topics"]}
TO = {t["id"]: i for s in tax["sections"] if s["id"] == sec for i, t in enumerate(s["topics"])}

BK, NU, AB, IN, GU, IM, CO, EX, CU = ("backstage","nuevo","abrir","informacion","guardar",
                                      "imprimir","compartir","exportar","cuenta")

Q = [
(BK,"La Vista Backstage se abre con la pestaña Archivo y se sale de ella volviendo al documento con la flecha «←» de arriba a la izquierda o con Esc.",True,
 "No es una pestaña de la cinta normal: ocupa toda la ventana."),
(BK,"El panel de navegación de Backstage incluye, de arriba abajo: Inicio, Nuevo, Abrir, Compartir, Información, Guardar, Guardar como, Imprimir, Exportar, Cerrar y, abajo, Cuenta y Opciones.",True,
 "«Cuenta» y «Opciones» quedan separados al final del panel."),
(BK,"Cuando el documento está guardado en OneDrive, Backstage muestra «Guardar como»; cuando está en el equipo local, muestra «Guardar una copia».",False,
 "Falso: es al revés. En OneDrive aparece «Guardar una copia» (para no romper el original en la nube); en local, «Guardar como»."),
(BK,"El panel «Inicio» de Backstage solo muestra la lista de documentos recientes.",False,
 "Falso: arriba tiene la sección «Nueva» (plantillas) y las pestañas Recientes, Favoritos y Compartidos conmigo."),
(BK,"«Cerrar» (Backstage) cierra el documento activo pero no la aplicación Word, y pregunta si guardar cuando hay cambios pendientes.",True,
 "Para cerrar Word entero se usa la X de la ventana o Alt+F4 con un solo documento abierto."),
(NU,"El panel «Nuevo» solo ofrece «Documento en blanco», sin acceso a plantillas en línea.",False,
 "Falso: tiene un buscador de plantillas en línea y búsquedas sugeridas (Empresa, Tarjetas, Cartas, Educación, Currículos y cartas de presentación, Vacaciones)."),
(NU,"Al crear un «Documento en blanco», Word se basa en la plantilla Normal.dotm.",True,
 "Cualquier cambio de fuente, márgenes o estilos que se guarde en Normal.dotm afecta a los documentos en blanco futuros."),
(AB,"El panel «Abrir» tiene, al final, un botón «Recuperar documentos sin guardar».",True,
 "Abre la carpeta de archivos de autoguardado de documentos que se cerraron sin guardar."),
(AB,"En el panel «Abrir», los documentos recientes se agrupan por Hoy, Ayer, Esta semana y Semana pasada, y se pueden marcar como Favoritos con la chincheta.",True,
 "También hay pestañas «Documentos» y «Carpetas» y un buscador de archivos."),
(AB,"El panel «Abrir» solo permite abrir archivos guardados en el equipo local.",False,
 "Falso: ofrece Recientes, Compartidos conmigo, OneDrive: Personal, Este PC, Agregar un sitio y Examinar."),
(IN,"El menú «Proteger documento» tiene seis opciones: Abrir siempre como solo lectura, Cifrar con contraseña, Restringir edición, Restringir el acceso, Agregar una firma digital y Marcar como final.",True,
 "«Cifrar con contraseña» pone contraseña de apertura; «Restringir edición» limita qué cambios pueden hacer los demás."),
(IN,"«Marcar como final» impide de forma permanente que nadie vuelva a editar el documento.",False,
 "Falso: solo lo pone en modo de solo lectura y avisa a los lectores de que es la versión final; cualquiera puede quitar la marca y seguir editando."),
(IN,"«Agregar una firma digital» (menú Proteger documento) añade una firma digital invisible que garantiza la integridad del documento.",True,
 "Si el documento se modifica después, la firma queda invalidada."),
(IN,"«Inspeccionar documento» y «Comprobar accesibilidad» son la misma herramienta.",False,
 "Falso: «Inspeccionar documento» busca datos personales y propiedades ocultas antes de publicar; «Comprobar accesibilidad» busca contenido difícil de leer para personas con discapacidad. Ambas están en «Comprobar si hay problemas»."),
(IN,"«Comprobar compatibilidad» revisa que el documento no tenga faltas de ortografía antes de enviarlo.",False,
 "Falso: comprueba qué características no son compatibles con versiones anteriores de Word (para poder guardarlo en .doc sin sorpresas)."),
(IN,"El «Historial de versiones» de Backstage funciona con cualquier documento, esté guardado donde esté.",False,
 "Falso: requiere que el archivo esté en OneDrive o SharePoint. Con un archivo local, Word ofrece «¿Activar el historial de versiones?» subiéndolo a la nube."),
(IN,"«Administrar documento ▸ Recuperar documentos no guardados» abre la carpeta de archivos autoguardados de documentos que se cerraron sin guardar.",True,
 "Es el mismo destino que el botón «Recuperar documentos sin guardar» del panel Abrir."),
(IN,"El cuadro «Propiedades avanzadas» (Información ▸ Propiedades ▸ Propiedades avanzadas) tiene cinco fichas: General, Resumen, Estadísticas, Contenido y Personalizar.",True,
 "Se llega también a él desde el desplegable «Propiedades» del panel Información."),
(IN,"La ficha «Estadísticas» del cuadro Propiedades permite escribir el título y el autor del documento.",False,
 "Falso: eso se hace en la ficha «Resumen». «Estadísticas» solo muestra recuentos (páginas, párrafos, líneas, palabras, caracteres) y fechas, en solo lectura."),
(IN,"En la ficha «Personalizar» del cuadro Propiedades se pueden crear propiedades propias (nombre, tipo Texto/Fecha/Número/Sí o no, valor) y vincularlas al contenido del documento.",True,
 "Sirve, por ejemplo, para un campo «Cliente» o «Comprobado por» que luego se inserta con un campo DocProperty."),
(IN,"El panel «Información» muestra el número de palabras pero no el tiempo total de edición.",False,
 "Falso: muestra ambos; «Tiempo de edición» es uno de los datos de Propiedades."),
(GU,"En el cuadro «Guardar como», el menú «Herramientas» ofrece Conectar a unidad de red, Opciones para guardar, Opciones generales, Opciones web y Comprimir imágenes.",True,
 "«Opciones para guardar…» lleva a Archivo ▸ Opciones ▸ Guardar."),
(GU,"«Opciones generales» (Herramientas del cuadro Guardar como) es donde se pone una contraseña de apertura o de escritura del documento.",True,
 "También «Recomendado solo lectura» y la opción de crear siempre una copia de seguridad."),
(GU,"El desplegable «Tipo» de Guardar como no incluye el formato OpenDocument (.odt).",False,
 "Falso: sí lo incluye («Texto de OpenDocument (*.odt)»), junto a .docx, .docm, .doc, .dotx, .pdf, .xps, .rtf, .txt, .htm, .mht, .xml…"),
(GU,"El «Documento habilitado con macros de Word» tiene extensión .docm, y la plantilla equivalente con macros es .dotm.",True,
 "Un .docx no puede guardar macros de VBA; hay que usar .docm."),
(GU,"«Guardar» y «Guardar como» hacen exactamente lo mismo en todos los casos.",False,
 "Falso: «Guardar» sobrescribe el archivo actual; «Guardar como» crea una copia con otro nombre, ubicación o formato. Solo la primera vez (documento sin nombre), «Guardar» se comporta como «Guardar como»."),
(IM,"En el panel Imprimir, «Intercaladas» imprime 1-2-3, 1-2-3…; «Sin intercalar» imprime todas las copias de la página 1, luego todas las de la 2…",True,
 "Con una sola copia da igual; la diferencia importa al imprimir varias copias de un documento de varias páginas."),
(IM,"El desplegable «N páginas por hoja» del panel Imprimir llega como máximo a 4 páginas por hoja.",False,
 "Falso: ofrece 1, 2, 4, 6, 8 y 16 páginas por hoja, más «Escalar al tamaño del papel»."),
(IM,"El menú «Márgenes» del panel Imprimir es una galería distinta de la de la pestaña Disposición.",False,
 "Falso: es exactamente la misma galería (Normal 2,5/3, Estrecho 1,27, Moderado, Ancho, Reflejado, Última configuración personalizada, Márgenes personalizados…). Lo mismo ocurre con Tamaño y Orientación."),
(IM,"El desplegable «Imprimir todas las páginas» del panel Imprimir también permite imprimir la lista de estilos, la de entradas de autotexto o la de asignaciones de teclas del documento.",True,
 "En la sección «Información del documento» de ese desplegable: Información del documento, Lista de revisiones, Estilos, Entradas de texto automático, Asignaciones de teclas."),
(IM,"«Impresión personalizada» solo admite páginas sueltas separadas por comas, como 1,3,7.",False,
 "Falso: admite también rangos (1-10), combinaciones (1-10,12,16) y páginas de una sección concreta (p1s2-p7s2)."),
(IM,"El enlace «Configurar página» al pie del panel Imprimir abre el mismo cuadro «Configurar página» (Márgenes / Papel / Disposición) que la pestaña Disposición.",True,
 "Es el mismo diálogo, con las mismas tres fichas."),
(IM,"Si la impresora seleccionada solo imprime a una cara, en el panel Imprimir no hay ninguna forma de hacer doble cara.",False,
 "Falso: existe «Imprimir manualmente a doble cara»: Word imprime las caras impares, avisa para recargar el papel y luego imprime las pares."),
(CO,"El panel «Compartir» permite cargar el documento a OneDrive para coautoría, o «Adjuntar una copia en su lugar» como Documento de Word o como PDF.",True,
 "La coautoría en tiempo real solo funciona con el archivo en la nube."),
(CO,"Para compartir un documento en tiempo real (coautoría), Word no exige guardarlo previamente en la nube.",False,
 "Falso: hay que subirlo a OneDrive o SharePoint; si no, solo se puede adjuntar una copia por correo."),
(EX,"El panel «Exportar» tiene dos opciones: «Crear documento PDF/XPS» y «Cambiar el tipo de archivo».",True,
 "Ambas acaban abriendo un cuadro «Guardar como» con el formato elegido."),
(EX,"«Crear documento PDF/XPS» genera un PDF que después se puede seguir editando en Word como un documento normal.",False,
 "Falso: el propio panel avisa de que «el contenido no se puede cambiar con facilidad». El PDF conserva diseño, formato, fuentes e imágenes, pero no es editable como un .docx."),
(EX,"«Cambiar el tipo de archivo» (Exportar) ofrece, entre otros, .docx, .doc, .odt, .dotx, .txt, .rtf y .mht, más «Guardar como otro tipo de archivo».",True,
 "Es una selección de los formatos más habituales; la lista completa está en el «Tipo» del cuadro Guardar como."),
(CU,"La opción «Cuenta» está en la parte inferior del panel de navegación de Backstage, junto a «Opciones».",True,
 "Desde ahí se ven la cuenta de usuario, los servicios conectados y «Acerca de Word»."),
(CU,"Desde «Cuenta» se cambian los márgenes y el tamaño de papel predeterminados del documento.",False,
 "Falso: «Cuenta» gestiona el usuario, el fondo y tema de Office y los servicios conectados. Los márgenes se cambian en Disposición o en Archivo ▸ Opciones."),
(BK,"El panel «Información» tiene botones para Copiar la ruta de acceso del archivo y para Abrir su ubicación en el explorador.",True,
 "Junto a «Compartir» y «Copiar ruta de acceso local»."),
(BK,"«Guardar una copia» y «Guardar como» pueden guardar en OneDrive, en «Este PC» o en un sitio de SharePoint añadido con «Agregar un sitio».",True,
 "El centro del panel muestra el nombre, el tipo y un botón Guardar, con «Más opciones…» para el cuadro completo."),
]

n0 = max(int(q["id"].split("-")[-1]) for q in d)
for k, (tp, en, r, ex) in enumerate(Q, 1):
    d.append({"id":"archivo-%d"%(n0+k),"sourceFile":"archivo.json","bloque":"Archivo — "+NAME[tp],
        "tipo":"verdadero_falso","categoria":"concepto","negativa":False,"section":"archivo",
        "topic":tp,"subtopic":None,"tema":NAME[tp],"sourceQuestionId":"vf-archivo-bk%02d"%k,"generado":True,
        "enunciado":en,"opciones":[],"matching":None,"respuesta":bool(r),"explicacion":ex})
d.sort(key=lambda q:(TO.get(q["topic"],99), int(q["id"].split("-")[-1])))
json.dump(d, open(f,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(f,"a",encoding="utf-8").write("\n")
vf=[q for q in d if q["tipo"]=="verdadero_falso"]; tv=sum(1 for q in vf if q["respuesta"])
print("archivo.json: %d preg, V/F %d/%d (+%d backstage)"%(len(d),tv,len(vf)-tv,len(Q)))

# flashcards
ff = "data/flashcards/%s.json" % sec
dc = json.load(open(ff, encoding="utf-8"))
FN = [
(BK,"¿Cómo se sale de la Vista Backstage sin cerrar el documento?","Flecha «←» de arriba a la izquierda, o tecla Esc"),
(BK,"¿Qué dos opciones quedan separadas al final del panel de navegación de Backstage?","Cuenta y Opciones"),
(BK,"¿Por qué a veces aparece «Guardar una copia» en vez de «Guardar como»?","Porque el archivo está en OneDrive: se ofrece «Guardar una copia» para no alterar el original de la nube"),
(NU,"¿En qué plantilla se basa un «Documento en blanco»?","Normal.dotm"),
(NU,"¿Qué búsquedas sugeridas ofrece el panel Nuevo?","Empresa · Tarjetas · Prospectos · Cartas · Educación · Currículos y cartas de presentación · Vacaciones"),
(AB,"¿Qué botón hay al final del panel Abrir?","«Recuperar documentos sin guardar»"),
(AB,"¿Cómo se ancla un documento en la lista de recientes?","Con el icono de chincheta que aparece al pasar el ratón (o menú contextual ▸ Anclar)"),
(AB,"¿Desde qué orígenes puede abrir el panel Abrir?","Recientes · Compartidos conmigo · OneDrive: Personal · Este PC · Agregar un sitio · Examinar"),
(IN,"¿Qué 6 opciones tiene el menú «Proteger documento»?","Abrir siempre como solo lectura · Cifrar con contraseña · Restringir edición · Restringir el acceso · Agregar una firma digital · Marcar como final"),
(IN,"¿Qué hace realmente «Marcar como final»?","Pone el documento en solo lectura y avisa de que es la versión final; NO impide editar (cualquiera puede quitar la marca)"),
(IN,"¿Diferencia entre «Inspeccionar documento» y «Comprobar accesibilidad»?","Inspeccionar busca datos personales / propiedades ocultas; Comprobar accesibilidad busca contenido difícil de leer para personas con discapacidad"),
(IN,"¿Qué comprueba «Comprobar compatibilidad»?","Qué características del documento no funcionan en versiones anteriores de Word"),
(IN,"¿Qué necesita el «Historial de versiones» para funcionar?","Que el archivo esté en OneDrive o SharePoint"),
(IN,"¿Dónde se recuperan los documentos que se cerraron sin guardar?","Información ▸ Administrar documento ▸ Recuperar documentos no guardados (o el botón del panel Abrir)"),
(IN,"¿Cuántas fichas tiene el cuadro «Propiedades avanzadas» y cuáles?","5: General · Resumen · Estadísticas · Contenido · Personalizar"),
(IN,"¿En qué ficha del cuadro Propiedades se escribe el título, el asunto y el autor?","Resumen (la de «Estadísticas» es solo de lectura: recuentos y fechas)"),
(IN,"¿Para qué sirve la ficha «Personalizar» del cuadro Propiedades?","Crear propiedades propias (nombre, tipo, valor) y vincularlas al contenido; p. ej. «Cliente», «Comprobado por»"),
(GU,"¿Qué opciones tiene el menú «Herramientas» del cuadro Guardar como?","Conectar a unidad de red · Opciones para guardar · Opciones generales · Opciones web · Comprimir imágenes"),
(GU,"¿Desde dónde se pone una contraseña de apertura al guardar?","Guardar como ▸ Herramientas ▸ Opciones generales"),
(GU,"¿Extensión de un documento con macros? ¿Y de la plantilla con macros?","Documento: .docm · Plantilla: .dotm (el .docx no guarda macros)"),
(GU,"¿Diferencia entre «Guardar» y «Guardar como»?","Guardar sobrescribe el archivo actual; Guardar como crea una copia (otro nombre, ubicación o formato). La 1ª vez son equivalentes."),
(GU,"¿Qué formatos «de texto» ofrece el «Tipo» de Guardar como?","Texto sin formato (*.txt) · Formato RTF (*.rtf) · Texto de OpenDocument (*.odt)"),
(IM,"¿Diferencia entre «Intercaladas» y «Sin intercalar»?","Intercaladas: 1-2-3, 1-2-3… · Sin intercalar: todas las copias de la pág. 1, luego de la 2…"),
(IM,"¿Cuántas páginas por hoja permite el panel Imprimir?","1, 2, 4, 6, 8 y 16, más «Escalar al tamaño del papel»"),
(IM,"¿El menú Márgenes del panel Imprimir es el mismo que el de Disposición?","Sí: misma galería de preajustes (Normal, Estrecho, Moderado, Ancho, Reflejado…). Igual con Tamaño y Orientación."),
(IM,"¿Qué listas del documento se pueden imprimir desde «Imprimir todas las páginas»?","Información del documento · Lista de revisiones · Estilos · Entradas de texto automático · Asignaciones de teclas"),
(IM,"¿Qué sintaxis usa «Impresión personalizada» para páginas y secciones?","Páginas sueltas (1;3;7), rangos (1-10), combinaciones (1-10,12,16) y por sección (p1s2-p7s2)"),
(IM,"¿Qué abre el enlace «Configurar página» del panel Imprimir?","El cuadro «Configurar página» (Márgenes / Papel / Disposición), el mismo que en la pestaña Disposición"),
(IM,"¿Cómo se imprime a doble cara con una impresora de una sola cara?","«Imprimir manualmente a doble cara»: Word imprime una cara y pide recargar el papel para la otra"),
(CO,"¿Qué ofrece el panel «Compartir»?","Subir a OneDrive para coautoría en tiempo real, o «Adjuntar una copia» como Documento de Word o como PDF"),
(EX,"¿Qué dos opciones tiene «Exportar»?","Crear documento PDF/XPS · Cambiar el tipo de archivo"),
(EX,"¿El PDF creado con «Crear documento PDF/XPS» es editable en Word?","No: conserva el diseño pero «el contenido no se puede cambiar con facilidad»"),
(CU,"¿Qué se gestiona en «Cuenta» de Backstage?","La cuenta de usuario, el tema y fondo de Office, los servicios conectados y «Acerca de Word»"),
]
n0c = max(int(c["cardId"].split("-")[-1]) for c in dc)
for k, (tp, fr, bk) in enumerate(FN, 1):
    dc.append({"cardId":"F-%03d"%(n0c+k),"section":"archivo","topic":tp,"subtopic":None,
        "cardType":"contenido","priority":"normal","front":fr,"back":bk,
        "sourceRefs":["data/rutas/archivo.txt / capturas backstage del usuario (sep-2026)"],
        "knowledgeRefs":[],"questionRefs":[]})
dc.sort(key=lambda c:(TO.get(c["topic"],99), int(c["cardId"].split("-")[-1])))
json.dump(dc, open(ff,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(ff,"a",encoding="utf-8").write("\n")
print("archivo flashcards: %d (+%d)"%(len(dc),len(FN)))
