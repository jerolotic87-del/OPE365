# -*- coding: utf-8 -*-
import json
f = "data/questions/disposicion.json"
d = json.load(open(f, encoding="utf-8"))
CP, PA, OR = "configurar-pagina", "parrafo-disposicion", "organizar"
TCP, TPA, TOR = "Configurar página", "Párrafo", "Organizar"

Q = [
# --- Configurar página: Márgenes ---
(CP,TCP,"El grupo Configurar página es el primero de la pestaña Disposición e incluye Márgenes, Orientación, Tamaño, Columnas, Saltos, Números de línea y Guiones.",True,
 "Son los siete comandos del grupo Configurar página, seguido de los grupos Párrafo y Organizar."),
(CP,TCP,"En esta instalación, el preajuste de márgenes «Normal» aplica 2,5 cm arriba y abajo y 3 cm a izquierda y derecha.",True,
 "Es el valor que muestra el desplegable Márgenes para «Normal» en este Word (v2608)."),
(CP,TCP,"El preajuste de márgenes «Estrecho» aplica 1,27 cm arriba y abajo pero mantiene 2,5 cm a izquierda y derecha.",False,
 "Falso: «Estrecho» aplica 1,27 cm en los cuatro márgenes."),
(CP,TCP,"El preajuste de márgenes «Moderado» aplica 2,54 cm en los cuatro lados.",False,
 "Falso: «Moderado» deja 2,54 cm arriba y abajo pero reduce los laterales a 1,91 cm."),
(CP,TCP,"El preajuste de márgenes «Ancho» aplica 5,08 cm en los cuatro márgenes.",False,
 "Falso: «Ancho» aplica 5,08 cm solo a izquierda y derecha; arriba y abajo mantiene 2,54 cm."),
(CP,TCP,"El preajuste de márgenes «Reflejado» sustituye los márgenes Izquierdo y Derecho por Interior y Exterior, para impresión a doble cara.",True,
 "Con «Reflejado» los márgenes de las páginas pares e impares se reflejan: el margen interior (el del lomo) es igual en ambas."),
(CP,TCP,"Cuando se han definido márgenes a medida, aparece una entrada «Última configuración personalizada» al principio del desplegable Márgenes.",True,
 "Word recuerda el último juego de márgenes personalizados y lo ofrece como primera opción del desplegable."),
(CP,TCP,"En el cuadro Configurar página, el campo «Encuadernación» tiene un valor predeterminado de 2 cm.",False,
 "Falso: el valor predeterminado de Encuadernación es 0 cm. Es el margen extra que se reserva para el cosido o grapado."),
(CP,TCP,"En el cuadro Configurar página, el desplegable «Varias páginas» ofrece Normal, Márgenes simétricos, Dos páginas por hoja y Formato libro.",True,
 "Esas son las cuatro opciones de disposición de varias páginas."),
(CP,TCP,"El desplegable «Aplicar a» del cuadro Configurar página ofrece «Todo el documento» y «Solo esta página».",False,
 "Falso: las opciones son «Todo el documento» y «De aquí en adelante» (esta última crea un salto de sección)."),
# --- Orientación y tamaño ---
(CP,TCP,"El comando Orientación de la pestaña Disposición solo ofrece dos opciones: Vertical y Horizontal.",True,
 "Vertical y Horizontal son las únicas orientaciones."),
(CP,TCP,"El tamaño de papel A4 mide 21 cm de ancho por 29,7 cm de alto.",True,
 "21 x 29,7 cm es la medida del A4, el tamaño por defecto en este Word."),
(CP,TCP,"El tamaño de papel «Carta» mide 21 cm x 29,7 cm, igual que el A4.",False,
 "Falso: «Carta» mide 21,59 x 27,94 cm (8,5 x 11 pulgadas): un poco más ancho y más bajo que el A4."),
(CP,TCP,"El tamaño de papel «Oficio» tiene el mismo alto que el A4.",False,
 "Falso: «Oficio» mide 21,59 x 35,56 cm, claramente más alto que el A4 (29,7 cm)."),
(CP,TCP,"El desplegable Tamaño solo incluye tamaños de la serie A (A3, A4, A5) y de la serie B (B4, B5), sin tamaños en pulgadas.",False,
 "Falso: también incluye Carta, Tabloide, Oficio, Estamento y Ejecutivo, que son tamaños en pulgadas."),
(CP,TCP,"El cuadro Configurar página tiene tres fichas: Márgenes, Papel y Disposición.",True,
 "Se llega al mismo cuadro desde «Márgenes personalizados...» o desde «Más tamaños de papel...», y siempre tiene esas tres fichas."),
(CP,TCP,"En el cuadro Configurar página, la casilla «Primera página diferente» para el encabezado está en la ficha «Papel».",False,
 "Falso: «Primera página diferente» y «Pares e impares diferentes» están en la ficha «Disposición»."),
(CP,TCP,"En la ficha Disposición del cuadro Configurar página, la distancia del encabezado y del pie «Desde el borde» es de 1,25 cm por defecto.",True,
 "1,25 cm para el encabezado y 1,25 cm para el pie es el valor predeterminado."),
# --- Columnas ---
(CP,TCP,"El desplegable Columnas ofrece cinco preajustes: Una, Dos, Tres, Izquierda y Derecha.",True,
 "Además de esos cinco preajustes está «Más columnas...» para configurarlas a medida."),
(CP,TCP,"Los preajustes «Izquierda» y «Derecha» del desplegable Columnas crean dos columnas del mismo ancho.",False,
 "Falso: crean dos columnas de ancho desigual, con la columna estrecha a la izquierda o a la derecha respectivamente."),
(CP,TCP,"En el cuadro Columnas, la casilla «Línea entre columnas» dibuja una línea vertical de separación entre ellas.",True,
 "Es una raya vertical decorativa entre columnas; no afecta al texto."),
(CP,TCP,"En el cuadro Columnas, si se desmarca «Columnas de igual ancho» no se puede fijar un ancho distinto para cada columna.",False,
 "Falso: al desmarcarla se habilitan los campos de ancho y espaciado de cada columna por separado."),
# --- Saltos ---
(CP,TCP,"El menú Saltos separa las opciones en dos grupos: «Saltos de página» (Página, Columna, Ajuste del texto) y «Saltos de sección».",True,
 "Los saltos de sección son Página siguiente, Continua, Página par y Página impar."),
(CP,TCP,"El salto de sección «Continua» empieza la nueva sección en la misma página, sin pasar a la siguiente.",True,
 "Sirve, por ejemplo, para cambiar el número de columnas a mitad de página."),
(CP,TCP,"El salto de sección «Página siguiente» y un salto de página normal producen exactamente el mismo resultado.",False,
 "Falso: el salto de página solo pasa a la página siguiente; el salto de sección además crea una sección nueva, que puede tener sus propios márgenes, encabezados, columnas y numeración."),
(CP,TCP,"Los saltos de sección «Página par» y «Página impar» empiezan siempre en la página inmediatamente siguiente.",False,
 "Falso: saltan a la siguiente página par (o impar), dejando en blanco la página intermedia si es necesario."),
(CP,TCP,"El «Salto de ajuste del texto» del menú Saltos sirve para forzar el comienzo de una página nueva.",False,
 "Falso: separa el texto que rodea a un objeto en las páginas web (por ejemplo el texto de leyenda del de cuerpo). No fuerza página nueva; eso es el «Salto de página»."),
# --- Números de línea ---
(CP,TCP,"El menú Números de línea ofrece Continua, Reiniciar en cada página y Reiniciar en cada sección.",True,
 "También «Ninguno», «Suprimir del párrafo actual» y «Opciones de numeración de línea...»."),
(CP,TCP,"«Suprimir del párrafo actual», en el menú Números de línea, quita la numeración solo del párrafo donde está el cursor.",True,
 "El resto del documento conserva sus números de línea."),
(CP,TCP,"El comando Números de línea está en la pestaña Revisar.",False,
 "Falso: está en Disposición ▸ Configurar página."),
# --- Guiones ---
(CP,TCP,"El menú Guiones ofrece Ninguno, Automáticos y Manuales.",True,
 "Además de «Opciones de guiones...» para ajustar la zona de división y los límites."),
(CP,TCP,"La opción «Automáticos» del menú Guiones inserta los guiones de división uno a uno, pidiendo confirmación en cada palabra.",False,
 "Falso: «Automáticos» divide las palabras sin preguntar, según las reglas del idioma. La que va palabra por palabra es «Manuales»."),
(CP,TCP,"En «Opciones de guiones» se puede activar o desactivar «Dividir palabras en mayúsculas» y fijar la «Zona de división».",True,
 "También se puede limitar el número de guiones consecutivos."),
# --- Párrafo ---
(PA,TPA,"El grupo Párrafo de la pestaña Disposición permite ajustar la sangría izquierda y derecha y el espaciado anterior y posterior del párrafo.",True,
 "Son cuatro campos numéricos (Sangría izquierda/derecha, Espaciado antes/después) más el lanzador del cuadro Párrafo."),
(PA,TPA,"El grupo Párrafo de la pestaña Disposición incluye los botones de alineación (izquierda, centrada, derecha y justificada).",False,
 "Falso: la alineación está en el grupo Párrafo de la pestaña Inicio. En Disposición solo hay sangría y espaciado."),
(PA,TPA,"El espaciado posterior de párrafo que muestra por defecto el grupo Párrafo de Disposición es de 8 pto.",True,
 "8 pto después y 0 pto antes es el espaciado del estilo Normal en este Word."),
(PA,TPA,"El lanzador del grupo Párrafo abre el mismo cuadro «Párrafo» que en la pestaña Inicio, con las fichas «Sangría y espacio» y «Líneas y saltos de página».",True,
 "Es el mismo diálogo; se llega a él desde cualquiera de las dos pestañas."),
(PA,TPA,"En el cuadro Párrafo, el interlineado predeterminado del estilo base es «Sencillo».",False,
 "Falso: es «Múltiple» con un valor de 1,16."),
(PA,TPA,"La casilla «No agregar espacio entre párrafos del mismo estilo» del cuadro Párrafo elimina el espaciado solo entre párrafos consecutivos que comparten estilo.",True,
 "Si el párrafo siguiente tiene otro estilo, el espaciado sí se aplica."),
(PA,TPA,"El campo «Nivel de esquema» del cuadro Párrafo solo admite valores de «Nivel 1» a «Nivel 9».",False,
 "Falso: también admite «Texto independiente», que es el valor por defecto de los párrafos normales."),
# --- Organizar ---
(OR,TOR,"El comando Posición del grupo Organizar coloca el objeto en una de nueve posiciones fijas de la página, con ajuste de texto cuadrado.",True,
 "La cuadrícula de 9 opciones combina arriba/centro/abajo con izquierda/centro/derecha; el texto se ajusta alrededor."),
(OR,TOR,"El estilo de ajuste «En línea con el texto» permite mover el objeto libremente por cualquier punto de la página.",False,
 "Falso: «En línea con el texto» trata el objeto como un carácter más del párrafo. Para moverlo libremente hay que elegir Cuadrado, Estrecho, Detrás del texto, etc."),
(OR,TOR,"El menú Ajustar texto ofrece, entre otros, Cuadrado, Estrecho, Transparente, Arriba y abajo, Detrás del texto y Delante del texto.",True,
 "Son los siete estilos de ajuste, más «En línea con el texto»."),
(OR,TOR,"«Detrás del texto» y «Delante del texto» son el mismo ajuste con distinto nombre.",False,
 "Falso: «Detrás del texto» pone el objeto bajo el texto (el texto se lee por encima); «Delante del texto» lo pone sobre el texto, tapándolo."),
(OR,TOR,"El cuadro «Diseño» (Más opciones de diseño...) tiene tres fichas: Posición, Ajuste del texto y Tamaño.",True,
 "Reúne en un solo diálogo la posición exacta, el estilo de ajuste y el tamaño/escala del objeto."),
(OR,TOR,"En el cuadro Diseño, la opción «Ajustar texto» ofrece «Ambos lados» y «Solo el centro».",False,
 "Falso: las opciones son «Ambos lados», «Solo izquierdo», «Solo derecho» y «Solo el mayor»."),
(OR,TOR,"En el grupo Organizar, el botón «Traer adelante» lleva el objeto directamente al primer plano de todos.",False,
 "Falso: lo sube un solo nivel. Para llevarlo al frente del todo se usa la opción «Traer al frente» de su desplegable."),
(OR,TOR,"El «Panel de selección» del grupo Organizar lista todos los objetos de la página y permite mostrarlos u ocultarlos individualmente.",True,
 "Tiene además «Mostrar todo» y «Ocultar todo», y permite renombrar y reordenar los objetos."),
(OR,TOR,"En el menú Alinear, «Alinear verticalmente» alinea los objetos por su borde superior.",False,
 "Falso: «Alinear verticalmente» los centra respecto a un eje vertical (centrado horizontal). El borde superior es «Alinear en la parte superior»."),
(OR,TOR,"«Distribuir horizontalmente» del menú Alinear reparte el espacio de forma uniforme entre dos objetos seleccionados.",False,
 "Falso: distribuir necesita al menos tres objetos; con dos no hay espacio intermedio que repartir."),
(OR,TOR,"El menú Alinear permite elegir si la alineación se calcula respecto a la página, al margen o a los objetos seleccionados.",True,
 "Según la opción marcada («Alinear a la página», «Alinear al margen» o «Alinear objetos seleccionados») cambia la referencia."),
(OR,TOR,"El menú Girar solo permite girar el objeto en incrementos de 45°.",False,
 "Falso: ofrece Girar 90° a la derecha, 90° a la izquierda, Voltear verticalmente, Voltear horizontalmente y «Más opciones de giro...» para un ángulo exacto."),
(OR,TOR,"«Agrupar» combina varios objetos seleccionados en uno solo, de modo que se mueven y se les da formato a la vez.",True,
 "El grupo se puede desagrupar después; cada objeto conserva sus propiedades."),
(OR,TOR,"En «Configuración de cuadrícula», el espaciado horizontal y vertical de la cuadrícula de dibujo es de 1 cm por defecto.",False,
 "Falso: el espaciado predeterminado es de 0,32 cm en horizontal y en vertical."),
]

n0 = max(int(q["id"].split("-")[-1]) for q in d)  # = 1
rows = []
for k, (topic, tema, en, resp, exp) in enumerate(Q, 1):
    n = n0 + k
    grp = {CP: "Configurar página", PA: "Párrafo", OR: "Organizar"}[topic]
    rows.append({
        "id": "disposicion-%d" % n, "sourceFile": "disposicion.json",
        "bloque": "Disposición — " + grp, "tipo": "verdadero_falso",
        "categoria": "concepto", "negativa": False, "section": "disposicion",
        "topic": topic, "subtopic": None, "tema": tema,
        "sourceQuestionId": "vf-disposicion-%02d" % k, "generado": True,
        "enunciado": en, "opciones": [], "matching": None,
        "respuesta": bool(resp), "explicacion": exp,
    })
d.extend(rows)

# reordenar por topic (orden de taxonomia) + id
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))
TO = {t["id"]: i for s in tax["sections"] if s["id"] == "disposicion" for i, t in enumerate(s["topics"])}
d.sort(key=lambda q: (TO.get(q["topic"], 99), int(q["id"].split("-")[-1])))

json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(f, "a", encoding="utf-8").write("\n")
vf = [q for q in d if q["tipo"] == "verdadero_falso"]
tv = sum(1 for q in vf if q["respuesta"] is True)
print("disposicion.json: %d preguntas (V/F: %d V / %d F). +%d nuevas." % (len(d), tv, len(vf) - tv, len(rows)))
