# -*- coding: utf-8 -*-
import json
tax = json.load(open("data/taxonomy.json", encoding="utf-8"))

def topic_order(sec):
    return {t["id"]: i for s in tax["sections"] if s["id"] == sec for i, t in enumerate(s["topics"])}

def add_vf(secfile, sec, rows, tag):
    f = "data/questions/%s.json" % secfile
    d = json.load(open(f, encoding="utf-8"))
    TO = topic_order(sec)
    names = {t["id"]: t["name"] for s in tax["sections"] if s["id"] == sec for t in s["topics"]}
    n0 = max(int(q["id"].split("-")[-1]) for q in d)
    for k, (tp, en, r, ex) in enumerate(rows, 1):
        d.append({"id": "%s-%d" % (sec, n0 + k), "sourceFile": secfile+".json", "bloque": "%s — %s" % (sec.capitalize(), names[tp]),
                  "tipo": "verdadero_falso", "categoria": "concepto", "negativa": False, "section": sec,
                  "topic": tp, "subtopic": None, "tema": names[tp], "sourceQuestionId": "vf-%s-%s%02d" % (sec, tag, k),
                  "generado": True, "difficulty": "alta", "enunciado": en, "opciones": [], "matching": None,
                  "respuesta": bool(r), "explicacion": ex})
    d.sort(key=lambda q: (TO.get(q["topic"], 9), int(q["id"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(f, "a", encoding="utf-8").write("\n")
    vf = [q for q in d if q["tipo"] == "verdadero_falso"]; tv = sum(1 for q in vf if q["respuesta"])
    print("%s: %d preg (V/F %d/%d) +%d trampa" % (f, len(d), tv, len(vf) - tv, len(rows)))

def add_fc(secfile, sec, rows, tag):
    f = "data/flashcards/%s.json" % secfile
    d = json.load(open(f, encoding="utf-8"))
    TO = topic_order(sec)
    n0 = max(int(c["cardId"].split("-")[-1]) for c in d)
    for k, (tp, fr, bk) in enumerate(rows, 1):
        d.append({"cardId": "F-%03d" % (n0 + k), "section": sec, "topic": tp, "subtopic": None,
                  "cardType": "contenido", "priority": "alta", "front": fr, "back": bk,
                  "sourceRefs": ["trampa · data/rutas/%s.txt + capturas (sep-2026)" % sec],
                  "knowledgeRefs": [], "questionRefs": []})
    d.sort(key=lambda c: (TO.get(c["topic"], 9), int(c["cardId"].split("-")[-1])))
    json.dump(d, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2); open(f, "a", encoding="utf-8").write("\n")
    print("%s: %d flashcards +%d trampa" % (f, len(d), len(rows)))

CP, PA, OR = "configurar-pagina", "parrafo-disposicion", "organizar"
TC, NO, CB, TI, IN = "tabla-contenido", "notas", "citas-bibliografia", "titulos", "indice"

# ================= DISPOSICIÓN — V/F trampa =================
DISP_VF = [
(CP,"El margen «Normal» de esta instalación usa 2,54 cm arriba y abajo, como en la versión inglesa de Word.",False,
 "Falso: en este Word, «Normal» es 2,5 cm arriba/abajo y 3 cm a los lados. El 2,54/3,17 cm es el esquema en pulgadas de la versión inglesa."),
(CP,"El preajuste «Estrecho» aplica 1,27 cm en los cuatro lados, mientras que «Moderado» solo reduce los laterales.",True,
 "Estrecho = 1,27 cm en los 4 márgenes; Moderado = 2,54 arriba/abajo y 1,91 a los lados."),
(CP,"En el margen «Reflejado», el margen que vale igual en las páginas pares y en las impares es el Interior.",True,
 "Reflejado sustituye Izquierdo/Derecho por Interior/Exterior; el Interior (el del lomo, 3,18 cm) se refleja igual a ambos lados."),
(CP,"«Encuadernación» y «Posición del margen interno» son dos nombres del mismo ajuste.",False,
 "Falso: «Encuadernación» fija cuántos cm extra se reservan para el cosido; «Posición del margen interno» decide en qué lado (Izquierda o Arriba) se añaden."),
(CP,"El tamaño «Oficio» es más alto que el «Carta»: 35,56 cm frente a 27,94 cm.",True,
 "Carta 21,59 × 27,94 · Oficio 21,59 × 35,56. Mismo ancho, Oficio más largo."),
(CP,"El tamaño «Estamento» (13,97 × 21,59 cm) figura entre los tamaños de papel del desplegable Tamaño.",True,
 "Es el «Statement» de la lista, junto a Carta, Tabloide, Oficio, Ejecutivo, A3-A5 y B4-B5 (JIS)."),
(CP,"En el menú Columnas, el preajuste «Izquierda» alinea a la izquierda el texto de todas las columnas.",False,
 "Falso: crea dos columnas de ancho desigual (la estrecha a la izquierda). No toca la alineación del texto, que sigue en el grupo Párrafo de Inicio."),
(CP,"Insertar un «Salto de página» (Saltos ▸ Saltos de página ▸ Página) crea una sección nueva en el documento.",False,
 "Falso: solo pasa a la página siguiente. Para crear una sección hay que usar «Página siguiente» (Saltos de sección), aunque las dos empiecen en la página de al lado."),
(CP,"El «Salto de ajuste del texto» del menú Saltos no crea sección ni fuerza página nueva.",True,
 "Reorganiza el texto que rodea a objetos en diseño Web (por ejemplo, separa el texto de leyenda del de cuerpo)."),
(CP,"El menú Girar del grupo Organizar incluye la opción «Girar 45° a la derecha».",False,
 "Falso: solo Girar 90° a la derecha, 90° a la izquierda, Voltear vertical y horizontal, y «Más opciones de giro…» para un ángulo exacto."),
(PA,"El interlineado por defecto del estilo Normal en este Word es 1,15.",False,
 "Falso: es «Múltiple» a 1,16 (se ve en el cuadro Párrafo y en Administrar estilos)."),
(PA,"En el grupo Párrafo de la pestaña Disposición, el espaciado por defecto es «Antes 0 pto, Después 8 pto».",True,
 "Antes 0, Después 8. Invertir los valores es un error típico."),
(PA,"El «Nivel de esquema» que trae por defecto un párrafo de texto normal es «Nivel 1».",False,
 "Falso: es «Texto independiente». Los niveles 1-9 se usan para que el párrafo cuente en la tabla de contenido sin llevar estilo de título."),
(OR,"El cuadro que abre «Más opciones de diseño…» (posición y ajuste de un objeto) se titula literalmente «Disposición», igual que la pestaña.",True,
 "Tiene las fichas Posición, Ajuste del texto y Tamaño; el nombre coincide con el de la pestaña pero no es lo mismo."),
(OR,"En el menú Alinear, «Alinear verticalmente» coloca los objetos pegados al borde superior.",False,
 "Falso: los centra respecto a un eje vertical, es decir, los centra en horizontal. El borde superior es «Alinear en la parte superior»."),
(OR,"«Alinear al medio» del menú Alinear centra los objetos horizontalmente.",False,
 "Falso: los centra verticalmente (a media altura entre arriba y abajo). El centrado horizontal es «Alinear verticalmente»."),
(OR,"Por defecto, el menú Alinear tiene marcada «Alinear al margen», no «Alinear a la página».",True,
 "La marca de verificación está en «Alinear al margen» salvo que se cambie."),
(OR,"«Ver líneas de división» del menú Alinear solo muestra u oculta la cuadrícula en pantalla; para cambiar su espaciado hay que ir a «Configuración de cuadrícula…».",True,
 "La cuadrícula nunca se imprime; el espaciado por defecto es 0,32 cm."),
(CP,"Los preajustes de márgenes «Ancho» y «Moderado» comparten el margen superior e inferior (2,54 cm) y solo se diferencian en los laterales.",True,
 "Ancho: laterales 5,08 · Moderado: laterales 1,91 · ambos 2,54 arriba y abajo."),
]

# ================= REFERENCIAS — V/F trampa =================
REF_VF = [
(TC,"«Insertar tabla de contenido» e «Insertar tabla de ilustraciones» abren cuadros de diálogo distintos.",False,
 "Falso: son dos fichas del mismo cuadro (junto con «Índice»)."),
(TC,"En el cuadro Tabla de contenido, el botón «Modificar…» permite retocar el aspecto de los estilos Título 1 a Título 9.",False,
 "Falso: retoca los estilos TDC 1 a TDC 9, que dan formato a las líneas de la propia tabla."),
(TC,"El formato «Sofisticado» existe para la Tabla de contenido pero no para la Tabla de ilustraciones.",True,
 "TdC: Estilo personal, Clásico, Elegante, Sofisticado, Moderno, Formal, Sencillo. Tabla de ilustraciones: … Centrado … (sin Sofisticado ni Moderno)."),
(TC,"El menú «Agregar texto» del grupo Tabla de contenido permite marcar un párrafo hasta como Nivel 9.",False,
 "Falso: ese menú rápido solo ofrece Nivel 1, Nivel 2, Nivel 3 y «No mostrar en la tabla de contenido»."),
(NO,"El atajo Alt+Ctrl+L inserta una nota al pie.",False,
 "Falso: Alt+Ctrl+L inserta una nota al final. La nota al pie es Alt+Ctrl+O."),
(NO,"Las notas al final se colocan al «Final del documento» o al «Final de la sección», nunca al pie de página.",True,
 "El «Final de página» es la posición de las notas al pie; las notas al final tienen sus dos posiciones propias."),
(NO,"El botón «Convertir…» del cuadro de notas puede intercambiar de golpe todas las notas al pie por las notas al final y viceversa.",True,
 "Sus tres opciones: al pie→al final, al final→al pie, e intercambiar ambas."),
(CB,"El menú «Estilo» de Citas y bibliografía incluye el estilo «Vancouver».",False,
 "Falso: no está. Los estilos son APA, Chicago, GB7714, GOST (2), Harvard - Anglia, IEEE, ISO 690 (2), MLA, SIST02 y Turabian."),
(CB,"«Cambiar SP de proveedor» permite pasar el documento del estilo APA al estilo MLA.",False,
 "Falso: «SP» = proveedor de servicio de citas (complementos como Mendeley, EndNote, RefWorks). El estilo se cambia en el desplegable «Estilo»."),
(CB,"La galería «Bibliografía» incluye un bloque integrado llamado «Trabajos citados».",True,
 "Los tres bloques integrados son Bibliografía, Referencias y Trabajos citados (este último es la terminología de MLA)."),
(CB,"En el Administrador de fuentes, la «Lista general» es la biblioteca maestra del equipo y la «Lista actual» son las fuentes de este documento.",True,
 "Las fuentes se copian de una a otra con «Copiar ->»."),
(TI,"En el cuadro Título, el rótulo por defecto para una imagen en el Word en español es «Figura».",False,
 "Falso: es «Ilustración». Los rótulos de fábrica son Ilustración, Ecuación y Tabla; se pueden crear más con «Nuevo rótulo…»."),
(TI,"En «Referencia cruzada», el tipo «Título» aparece siempre en la lista de tipos.",False,
 "Falso: solo aparece si el documento tiene párrafos con estilo Título 1-9."),
(TI,"El cuadro «Referencia cruzada» al que se llega desde Referencias ▸ Títulos es exactamente el mismo que el de Insertar ▸ Vínculos.",True,
 "Idéntico diálogo (Tipo, Referencia a, Insertar como hipervínculo…); solo cambia la ruta."),
(TI,"«Autotítulo…» y «Autotexto» son el mismo comando con distinto nombre.",False,
 "Falso: Autotítulo (Referencias) pone títulos automáticos a los objetos que insertas; Autotexto (Insertar ▸ Elementos rápidos) guarda fragmentos de texto reutilizables."),
(IN,"El índice alfabético se genera automáticamente a partir de los estilos de título, igual que la tabla de contenido.",False,
 "Falso: se genera de las entradas marcadas a mano (campos XE) o con «Automarcar…»."),
(IN,"«Marcar todas», en el cuadro de entrada de índice, marca todas las apariciones del documento que coinciden exactamente con el texto de la entrada.",True,
 "«Marcar» a secas solo marca la selección actual."),
(IN,"En «Marcar entrada de índice», elegir «Referencia cruzada» sustituye el número de página por un «Véase …».",True,
 "Las otras opciones son «Página actual» (por defecto) e «Intervalo de páginas» (con un marcador)."),
(CB,"El estilo de cita «APA» que trae este Word es la Sexta edición; el «MLA», la Séptima.",True,
 "En el menú Estilo se ve bajo cada nombre: APA «Sexta edición», MLA «Séptima edición», Chicago «Decimoquinta edición»."),
]

# ================= FLASHCARDS trampa =================
DISP_FC = [
(CP,"¿El margen «Normal» de este Word usa 2,54 cm (como en inglés) o 2,5 cm?","2,5 cm arriba/abajo y 3 cm a los lados. El 2,54/3,17 cm es el esquema en pulgadas de la versión inglesa."),
(OR,"¿Qué hace exactamente «Alinear verticalmente» en el menú Alinear?","Centra los objetos en horizontal (respecto a un eje vertical). El centrado vertical es «Alinear al medio»."),
(PA,"¿Interlineado por defecto del estilo Normal en este Word?","Múltiple 1,16 (no 1,15, no Sencillo)."),
(PA,"¿El espaciado de párrafo por defecto es «Antes 8 / Después 0»?","Al revés: Antes 0 pto, Después 8 pto."),
(CP,"¿Un «Salto de página» del menú Saltos crea una sección nueva?","No. Eso lo hace «Página siguiente» (Saltos de sección). El salto de página solo pasa de página."),
(CP,"¿Qué hace el preajuste «Izquierda» del menú Columnas?","Dos columnas de ancho desigual, con la estrecha a la izquierda. No cambia la alineación del texto."),
(CP,"¿El «Salto de ajuste del texto» fuerza una página nueva?","No. Reorganiza el texto alrededor de objetos en diseño Web."),
(OR,"¿Cómo se llama el cuadro que abre «Más opciones de diseño…»?","«Disposición» (igual que la pestaña). Fichas: Posición, Ajuste del texto, Tamaño."),
(OR,"¿El menú Alinear viene con «Alinear a la página» marcado?","No: viene marcado «Alinear al margen»."),
(CP,"¿«Encuadernación» es lo mismo que «Posición del margen interno»?","No. Encuadernación = cuántos cm extra se reservan; Posición del margen interno = en qué lado (Izquierda/Arriba)."),
(OR,"¿El menú Girar permite girar 45°?","No directamente: solo 90° a cada lado y voltear. Para 45° u otro ángulo, «Más opciones de giro…»."),
(PA,"¿Nivel de esquema por defecto de un párrafo normal?","«Texto independiente» (no «Nivel 1»)."),
]

REF_FC = [
(TC,"¿«Insertar índice» y «Tabla de contenido personalizada» abren el mismo cuadro?","Sí: un único cuadro con 3 fichas (Índice · Tabla de contenido · Tabla de ilustraciones)."),
(TC,"En el cuadro TdC, ¿«Modificar…» edita los estilos Título 1-9?","No: edita los estilos TDC 1-9 (las líneas de la tabla)."),
(IN,"¿Cómo se genera el índice alfabético, a diferencia de la tabla de contenido?","De entradas marcadas a mano (campos XE) o con «Automarcar…». NO de los estilos de título."),
(NO,"¿`Alt+Ctrl+L` inserta nota al pie o al final?","Al final. La nota al pie es `Alt+Ctrl+O`."),
(NO,"¿Dónde se colocan las notas al final?","Final del documento o final de la sección. Nunca al pie de página."),
(CB,"¿El estilo «Vancouver» está en el menú Estilo de citas de Word?","No. Sí están: APA, Chicago, GB7714, GOST, Harvard - Anglia, IEEE, ISO 690, MLA, SIST02, Turabian."),
(CB,"¿Para qué sirve «Cambiar SP de proveedor»?","Para elegir el complemento gestor de citas (Mendeley, EndNote…). NO cambia el estilo APA/MLA; eso es «Estilo»."),
(TI,"¿Rótulo por defecto para una imagen en el cuadro Título?","«Ilustración» (Word en español). Los de fábrica: Ilustración, Ecuación, Tabla. No «Figura»."),
(TI,"¿El tipo «Título» aparece siempre en «Referencia cruzada»?","No: solo si el documento tiene párrafos con estilo Título 1-9."),
(TC,"¿Hasta qué nivel deja marcar el menú «Agregar texto» del grupo Tabla de contenido?","Nivel 1, 2 o 3 (o «No mostrar»). La TdC puede mostrar más niveles, pero este menú rápido llega a 3."),
(IN,"¿«Marcar todas» marca todas las palabras del documento?","No: todas las apariciones que coinciden exactamente con el texto de la entrada de índice."),
(TI,"¿«Autotítulo» y «Autotexto» son lo mismo?","No. Autotítulo (Referencias) = títulos automáticos a objetos; Autotexto (Insertar) = fragmentos de texto reutilizables."),
(CB,"¿Bloques integrados de la galería «Bibliografía»?","Bibliografía · Referencias · Trabajos citados (término de MLA, no «Obras citadas»)."),
]

add_vf("disposicion", "disposicion", DISP_VF, "T")
add_vf("referencias", "referencias", REF_VF, "T")
add_fc("disposicion", "disposicion", DISP_FC, "T")
add_fc("referencias", "referencias", REF_FC, "T")
