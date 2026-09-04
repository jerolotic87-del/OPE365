# -*- coding: utf-8 -*-
import json
CP, PA, OR = "configurar-pagina", "parrafo-disposicion", "organizar"
TCP, TPA, TOR = "Configurar página", "Párrafo", "Organizar"
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TO = {t["id"]: i for s in tax["sections"] if s["id"] == "disposicion" for i, t in enumerate(s["topics"])}

# ---------------- V/F nuevas (rellenan huecos del bloque VF-L del usuario) ----------------
QF = "data/questions/disposicion.json"
dq = json.load(open(QF, encoding="utf-8"))
NEWQ = [
(CP,TCP,"En el cuadro Configurar página, el campo «Posición del margen interno» permite elegir entre «Izquierda» y «Derecha».",True,
 "Junto con la Encuadernación, decide en qué lado se reserva el espacio extra para el cosido en documentos de una cara."),
(CP,TCP,"La entrada «Última configuración personalizada» del menú Márgenes muestra siempre los valores de la plantilla Normal.",False,
 "Falso: muestra el último juego de márgenes que el usuario definió a mano; cambia con el uso."),
(CP,TCP,"El tamaño de papel «Tabloide» es más pequeño que el «Carta».",False,
 "Falso: Tabloide mide 27,94 × 43,18 cm (el doble de un Carta, que es 21,59 × 27,94 cm)."),
(CP,TCP,"El tamaño de papel «B5 (JIS)» mide 21 × 29,7 cm, igual que el A4.",False,
 "Falso: B5 (JIS) mide 18,2 × 25,7 cm. El que mide 21 × 29,7 cm es el A4."),
(CP,TCP,"El tamaño de papel «A5» mide 14,8 × 21 cm, exactamente la mitad de una hoja A4.",True,
 "Cada tamaño de la serie A es la mitad del anterior: A4 21×29,7 → A5 14,8×21."),
(CP,TCP,"En el cuadro Columnas, la casilla «Iniciar columna nueva» inserta un salto de columna en la posición del cursor.",True,
 "Equivale al salto de columna del menú Saltos, pero desde el propio cuadro Columnas."),
(CP,TCP,"El botón «Establecer como predeterminado» del cuadro Configurar página solo cambia el documento actual, nunca los documentos nuevos.",False,
 "Falso: fija los valores actuales (márgenes, orientación, tamaño…) como predeterminados de la plantilla, y afecta a los documentos nuevos basados en ella."),
(CP,TCP,"En «Opciones de guiones», la «Zona de división» es la distancia máxima entre el final de una palabra y el margen dentro de la cual Word puede dividir; cuanto menor es, más guiones aparecen.",True,
 "Una zona de división estrecha fuerza más cortes de palabra pero deja el margen derecho más regular."),
(PA,TPA,"La casilla «Sangrías simétricas» del cuadro Párrafo mantiene iguales la sangría izquierda y la derecha.",True,
 "Al marcarla, un cambio en una de las dos sangrías se copia automáticamente en la otra."),
(PA,TPA,"El campo «Especial» del cuadro Párrafo solo ofrece «Primera línea» y «Francesa».",False,
 "Falso: también ofrece «(ninguna)», que es el valor por defecto."),
(PA,TPA,"El botón «Tabulaciones…» del cuadro Párrafo abre el cuadro donde se fijan las posiciones y el tipo de tabulación.",True,
 "Está abajo a la izquierda del cuadro Párrafo, junto a «Establecer como predeterminado»."),
(OR,TOR,"La ficha «Tamaño» del cuadro Diseño permite fijar el alto y el ancho del objeto (absolutos o relativos), la escala en % y el giro.",True,
 "También muestra el tamaño original de la imagen y un botón para restablecerlo."),
(OR,TOR,"El menú Alinear no dispone de ninguna opción para mostrar guías visuales al mover objetos.",False,
 "Falso: «Usar guías de alineación» activa las líneas verdes que aparecen al arrastrar un objeto cerca de un margen u otro objeto."),
(OR,TOR,"En «Configuración de cuadrícula», «Mostrar guías de alineación» distingue guías de página, de márgenes y de párrafo.",True,
 "Son tres casillas independientes dentro del cuadro «Cuadrícula y guías»."),
(OR,TOR,"«Ver líneas de división» del menú Alinear imprime una cuadrícula de fondo en el documento.",False,
 "Falso: la cuadrícula solo se ve en pantalla como ayuda de diseño; nunca se imprime."),
(OR,TOR,"El «Panel de selección» solo permite mostrar u ocultar objetos, no cambiar su orden de superposición.",False,
 "Falso: además de mostrar/ocultar y renombrar, se puede reordenar la pila de objetos arrastrándolos en la lista."),
]
n0 = max(int(q["id"].split("-")[-1]) for q in dq)
for k, (tp, tema, en, r, ex) in enumerate(NEWQ, 1):
    grp = {CP:"Configurar página", PA:"Párrafo", OR:"Organizar"}[tp]
    dq.append({"id":"disposicion-%d"%(n0+k),"sourceFile":"disposicion.json","bloque":"Disposición — "+grp,
        "tipo":"verdadero_falso","categoria":"concepto","negativa":False,"section":"disposicion",
        "topic":tp,"subtopic":None,"tema":tema,"sourceQuestionId":"vf-disposicion-L%02d"%k,"generado":True,
        "enunciado":en,"opciones":[],"matching":None,"respuesta":bool(r),"explicacion":ex})
dq.sort(key=lambda q:(TO.get(q["topic"],9), int(q["id"].split("-")[-1])))
json.dump(dq, open(QF,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(QF,"a",encoding="utf-8").write("\n")
vf=[q for q in dq if q["tipo"]=="verdadero_falso"]; tv=sum(1 for q in vf if q["respuesta"])
print("disposicion.json: %d preguntas (V/F %d/%d), +%d"%(len(dq),tv,len(vf)-tv,len(NEWQ)))

# ---------------- Flashcards ----------------
FF = "data/flashcards/disposicion.json"
dc = json.load(open(FF, encoding="utf-8"))
# (topic, front, back)
NEWC = [
(CP,"¿Qué ruta abre la galería de márgenes predefinidos?","Disposición ▸ Configurar página ▸ Márgenes"),
(CP,"¿Valores del margen «Normal» en esta instalación?","Superior 2,5 cm · Izquierdo 3 cm · Inferior 2,5 cm · Derecho 3 cm"),
(CP,"¿Valores del margen «Estrecho»?","1,27 cm en los cuatro lados"),
(CP,"¿Valores del margen «Moderado»?","Superior/Inferior 2,54 cm · Izquierdo/Derecho 1,91 cm"),
(CP,"¿Valores del margen «Ancho»?","Superior/Inferior 2,54 cm · Izquierdo/Derecho 5,08 cm"),
(CP,"¿Para qué sirve el margen «Reflejado» y qué campos usa?","Para documentos a doble cara; sustituye Izquierdo/Derecho por Interior/Exterior (Interior 3,18 cm, Exterior 2,54 cm)"),
(CP,"¿Qué opción del menú Márgenes abre el cuadro Configurar página en la ficha Márgenes?","Márgenes personalizados…"),
(CP,"¿Valor predeterminado del campo «Encuadernación»?","0 cm"),
(CP,"¿Qué opciones ofrece «Varias páginas» en el cuadro Configurar página?","Normal · Márgenes simétricos · Dos páginas por hoja · Formato libro"),
(CP,"¿Opciones de «Aplicar a» para los márgenes?","Todo el documento · De aquí en adelante"),
(CP,"¿Qué hace «Establecer como predeterminado» en el cuadro Configurar página?","Fija los valores actuales como predeterminados de la plantilla, para los documentos nuevos"),
(CP,"¿Qué muestra «Última configuración personalizada» en el menú Márgenes?","El último juego de márgenes que el usuario definió a mano (cambia con el uso)"),
(CP,"¿Orientación predeterminada en Word 365?","Vertical"),
(CP,"¿Dimensiones del tamaño «Carta»?","21,59 × 27,94 cm"),
(CP,"¿Dimensiones del tamaño «Oficio»?","21,59 × 35,56 cm"),
(CP,"¿Dimensiones del A4?","21 × 29,7 cm"),
(CP,"¿Dimensiones del A5?","14,8 × 21 cm (la mitad de un A4)"),
(CP,"¿Dimensiones del «Tabloide»?","27,94 × 43,18 cm"),
(CP,"¿Dimensiones del «B5 (JIS)»?","18,2 × 25,7 cm"),
(CP,"¿Qué ruta abre el cuadro Configurar página en la ficha Papel?","Disposición ▸ Configurar página ▸ Tamaño ▸ Más tamaños de papel…"),
(CP,"¿En qué ficha del cuadro Configurar página se elige la bandeja (origen del papel)?","Papel (se puede una bandeja para la primera página y otra para el resto)"),
(CP,"¿Valor predeterminado de «Desde el borde» para encabezado y pie?","1,25 cm para ambos"),
(CP,"¿Qué casillas de encabezado/pie hay en la ficha Disposición del cuadro Configurar página?","Pares e impares diferentes · Primera página diferente"),
(CP,"¿Qué ruta divide el texto en columnas?","Disposición ▸ Configurar página ▸ Columnas"),
(CP,"¿Preajustes del menú Columnas?","Una · Dos · Tres · Izquierda · Derecha"),
(CP,"¿Qué hacen los preajustes «Izquierda» y «Derecha» de Columnas?","Dos columnas de ancho desigual, con la estrecha a ese lado"),
(CP,"¿Qué casilla del cuadro Columnas dibuja una raya vertical entre columnas?","Línea entre columnas"),
(CP,"¿Qué hay que desmarcar en el cuadro Columnas para dar ancho distinto a cada columna?","Columnas de igual ancho"),
(CP,"¿Qué hace «Iniciar columna nueva» en el cuadro Columnas?","Inserta un salto de columna en la posición del cursor"),
(CP,"¿Qué ruta inserta saltos de página y de sección?","Disposición ▸ Configurar página ▸ Saltos"),
(CP,"¿Tipos de salto de página?","Página · Columna · Ajuste del texto"),
(CP,"¿Tipos de salto de sección?","Página siguiente · Continua · Página par · Página impar"),
(CP,"¿Qué salto de sección empieza la nueva sección en la misma página?","Continua"),
(CP,"¿En qué se diferencia un salto de sección «Página siguiente» de un salto de página normal?","El de sección crea una sección nueva, que puede tener otros márgenes, encabezados, columnas y numeración"),
(CP,"¿Qué hace el salto «Ajuste del texto»?","Separa el texto que rodea a un objeto en páginas web (no fuerza página nueva)"),
(CP,"¿Qué ruta activa los números de línea?","Disposición ▸ Configurar página ▸ Números de línea"),
(CP,"¿Opciones del menú Números de línea?","Ninguno · Continua · Reiniciar en cada página · Reiniciar en cada sección · Suprimir del párrafo actual · Opciones…"),
(CP,"¿Qué hace «Suprimir del párrafo actual» en Números de línea?","Quita la numeración solo del párrafo donde está el cursor"),
(CP,"¿Opciones del menú Guiones?","Ninguno · Automáticos · Manuales · Opciones de guiones…"),
(CP,"¿Diferencia entre Guiones «Automáticos» y «Manuales»?","Automáticos divide sin preguntar según el idioma; Manuales va palabra por palabra pidiendo confirmación"),
(CP,"¿Qué es la «Zona de división» del cuadro Guiones?","La distancia máxima entre el final de la palabra y el margen dentro de la cual Word divide; menor zona = más guiones"),
(CP,"¿Está activada por defecto «Dividir palabras en mayúsculas» en el cuadro Guiones?","No, está desactivada por defecto"),
(PA,"¿Qué ajusta el grupo Párrafo de la pestaña Disposición?","Sangría izquierda/derecha y espaciado anterior/posterior del párrafo (no la alineación: esa está en Inicio)"),
(PA,"¿Valor por defecto de la sangría izquierda y derecha en el grupo Párrafo?","0 cm"),
(PA,"¿Valores por defecto del espaciado de párrafo (Antes / Después)?","Antes 0 pto · Después 8 pto"),
(PA,"¿Interlineado predeterminado del estilo Normal?","Múltiple, 1,16"),
(PA,"¿Qué hace «No agregar espacio entre párrafos del mismo estilo»?","Elimina el espaciado solo entre párrafos consecutivos que comparten estilo"),
(PA,"¿Valor por defecto del «Nivel de esquema» de un párrafo normal?","Texto independiente"),
(PA,"¿Qué hace la casilla «Sangrías simétricas» del cuadro Párrafo?","Mantiene iguales la sangría izquierda y la derecha"),
(PA,"¿Tipos de sangría «Especial» en el cuadro Párrafo?","(ninguna) · Primera línea · Francesa"),
(PA,"¿Qué abre el botón «Tabulaciones…» del cuadro Párrafo?","El cuadro para fijar posiciones y tipo de tabulación"),
(OR,"¿Qué hace el comando Posición del grupo Organizar?","Coloca el objeto flotante en una de nueve posiciones fijas de la página, con ajuste de texto cuadrado"),
(OR,"¿Qué ruta abre el cuadro «Diseño» (posición/ajuste/tamaño de un objeto)?","Disposición ▸ Organizar ▸ Posición (o Ajustar texto) ▸ Más opciones de diseño…"),
(OR,"¿Fichas del cuadro «Diseño» de objeto?","Posición · Ajuste del texto · Tamaño"),
(OR,"¿Qué hace el estilo de ajuste «En línea con el texto»?","Trata el objeto como un carácter más del párrafo (no se mueve libremente)"),
(OR,"¿Estilos de ajuste de texto disponibles?","En línea con el texto · Cuadrado · Estrecho · Transparente · Arriba y abajo · Detrás del texto · Delante del texto"),
(OR,"¿Diferencia entre «Detrás del texto» y «Delante del texto»?","Detrás: el objeto queda bajo el texto (se lee encima); Delante: el objeto tapa el texto"),
(OR,"¿Opciones de «Ajustar texto» en el cuadro Diseño?","Ambos lados · Solo izquierdo · Solo derecho · Solo el mayor"),
(OR,"¿Qué hace «Modificar puntos de ajuste»?","Deja editar a mano el contorno por el que el texto rodea al objeto"),
(OR,"¿Qué hace «Traer adelante» y qué opción extra tiene su desplegable?","Sube el objeto un nivel; el desplegable añade «Traer al frente»"),
(OR,"¿Qué permite hacer el Panel de selección?","Mostrar/ocultar objetos, renombrarlos y reordenar su superposición arrastrando en la lista"),
(OR,"¿Qué hace «Alinear verticalmente» en el menú Alinear?","Centra los objetos respecto a un eje vertical (centrado horizontal)"),
(OR,"¿Cuántos objetos necesita «Distribuir horizontalmente/verticalmente»?","Al menos tres"),
(OR,"¿Respecto a qué se puede alinear en el menú Alinear?","A la página · al margen · a los objetos seleccionados"),
(OR,"¿Qué hace «Usar guías de alineación»?","Muestra líneas verdes al arrastrar un objeto para alinearlo con márgenes u otros objetos"),
(OR,"¿Qué tres tipos de guías distingue «Mostrar guías de alineación»?","Guías de página · de márgenes · de párrafo"),
(OR,"¿Espaciado por defecto de la cuadrícula de dibujo?","0,32 cm horizontal y vertical"),
(OR,"¿Con qué coincide por defecto el origen de la cuadrícula?","Con los márgenes de la página"),
(OR,"¿Qué hace «Ver líneas de división»?","Muestra la cuadrícula en pantalla como ayuda de diseño (no se imprime)"),
(OR,"¿Qué hace «Agrupar»?","Combina varios objetos en uno solo que se mueve y redimensiona a la vez (reversible con Desagrupar)"),
(OR,"¿Opciones del menú Girar?","Girar 90° derecha · Girar 90° izquierda · Voltear verticalmente · Voltear horizontalmente · Más opciones de giro…"),
(OR,"¿Cómo se fija un ángulo de giro exacto para un objeto?","Girar ▸ Más opciones de giro… (abre el cuadro Diseño en la ficha Tamaño, campo «Girar»)"),
]
n0c = max(int(c["cardId"].split("-")[-1]) for c in dc)
for k, (tp, fr, bk) in enumerate(NEWC, 1):
    dc.append({"cardId":"F-%03d"%(n0c+k),"section":"disposicion","topic":tp,"subtopic":None,
        "cardType":"contenido","priority":"normal","front":fr,"back":bk,
        "sourceRefs":["data/rutas/disposicion.txt / capturas del usuario (sep-2026)"],
        "knowledgeRefs":[],"questionRefs":[]})
dc.sort(key=lambda c:(TO.get(c["topic"],9), int(c["cardId"].split("-")[-1])))
json.dump(dc, open(FF,"w",encoding="utf-8"), ensure_ascii=False, indent=2); open(FF,"a",encoding="utf-8").write("\n")
print("disposicion flashcards: %d (+%d)"%(len(dc),len(NEWC)))
