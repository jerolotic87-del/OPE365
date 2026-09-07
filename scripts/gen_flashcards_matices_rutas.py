# -*- coding: utf-8 -*-
"""Flashcards de MATICES preguntables, derivadas de los volcados de rutas
(data/rutas/*.txt) y ya presentes en el banco de preguntas, pero sin
flashcard que las reforzara. priority='alta' porque son datos-trampa de
examen (nombres exactos de listas, cardinalidades, valores por defecto).

Cubre huecos detectados al cruzar flashcards <-> volcados:
 - diseno: 0 de 7 matices clave tenian flashcard
 - inicio: subrayado 17, interlineado Ctrl+1/5/2, alineacion Ctrl+Q/T/D/J,
   efectos del cuadro Fuente (3 parejas), Tipo de estilo = 5, Buscar 7 opc.
 - insertar: convertir texto en tabla, nota al pie es de Referencias,
   fuentes del cuadro Simbolo
 - disposicion: eliminar salto de seccion
 - referencias: indice Con sangria vs Continuo
"""
import json

def add(sec, start, cards):
    F = f"data/flashcards/{sec}.json"
    d = json.load(open(F, encoding="utf-8"))
    n = start
    for topic, front, back in cards:
        n += 1
        d.append({
            "cardId": f"F-{n:03d}", "section": sec, "topic": topic, "subtopic": None,
            "cardType": "contenido", "priority": "alta",
            "front": front, "back": back,
            "sourceRefs": [f"data/rutas/{sec}.txt (volcado del usuario)"],
            "knowledgeRefs": [], "questionRefs": [],
        })
    json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(F, "a", encoding="utf-8").write("\n")
    print(f"{sec}: +{len(cards)} flashcards (F-{start+1:03d}..F-{n:03d})")


add("diseno", 24, [
 ("formato-documento", "¿Cuántas opciones integradas tiene «Espaciado entre párrafos» (Diseño) y cuáles?",
  "Seis: Sin espacio entre párrafos, Compacto, Estrecho, Abierto, Moderado y Doble. Más «Predeterminado» (el del conjunto de estilos) y «Espaciado personalizado…»."),
 ("formato-documento", "¿Cuál es el tema predeterminado de Word 365 y qué fuentes usa?",
  "El tema «Office», con Aptos Display para títulos y Aptos para el cuerpo. (Antes era «Office 2013-2022» con Calibri Light / Calibri.)"),
 ("formato-documento", "En el menú Fuentes de Diseño, ¿qué par usa «Office 2007-2010»? ¿Y «Office 2013-2022»?",
  "Office 2007-2010 = Cambria (títulos) / Calibri (cuerpo). Office 2013-2022 = Calibri Light / Calibri."),
 ("formato-documento", "¿Qué combinaciones especiales tiene el menú Colores además de las de color?",
  "Office, Office 2013-2022, Office 2007-2010 y «Escala de grises», más ~18 paletas con nombre (Azul, Verde amarillo, Papel…) y «Personalizar colores…»."),
 ("fondo-pagina", "Las marcas de agua predefinidas de Word se agrupan en dos categorías. ¿Cuáles y qué contienen?",
  "«Confidencial» (CONFIDENCIAL 1/2, NO COPIAR 1/2) y «Declinaciones de responsabilidades» (BORRADOR 1/2, EJEMPLO 1). Más «Más marcas de agua de Office.com»."),
 ("fondo-pagina", "En «Bordes y sombreado», ¿qué valores ofrece el campo «Valor» del borde de página?",
  "Cinco: Ninguno, Cuadro, Sombra, 3D y Personalizado."),
 ("fondo-pagina", "¿Entre qué grosores va el campo «Ancho» del borde de página?",
  "9 valores: 1/4, 1/2, 3/4, 1, 1 1/2, 2 1/4, 3, 4 1/2 y 6 pto."),
 ("fondo-pagina", "¿Cuántos diseños tiene el desplegable «Arte» del borde de página?",
  "«(ninguno)» + 164 diseños decorativos (manzanas, estrellas, corazones…). Solo existe para el borde de página, no para el de párrafo."),
 ("fondo-pagina", "¿Qué cuatro fichas tiene «Color de página ▸ Efectos de relleno…»?",
  "Degradado, Textura, Trama e Imagen."),
 ("fondo-pagina", "¿En qué parte del documento «vive» una marca de agua?",
  "En el encabezado; por eso se repite en todas las páginas de la sección y se puede editar entrando en el área de encabezado."),
])

add("inicio", 148, [
 ("fuente", "¿Cuántos estilos de subrayado hay en el desplegable del cuadro Fuente? ¿Y en el de la cinta?",
  "En el cuadro Fuente: 17 (18 con «(ninguno)»). En la cinta solo ~9. Solo los 3 primeros tienen atajo: Ctrl+S, Ctrl+Mayús+D (doble), Ctrl+Mayús+P (solo palabras)."),
 ("parrafo-espaciado", "Interlineado con la fila superior de números: ¿qué hacen Ctrl+1, Ctrl+5 y Ctrl+2?",
  "Ctrl+1 = sencillo · Ctrl+5 = 1,5 líneas · Ctrl+2 = doble. (Ctrl+5 en el teclado numérico, en cambio, selecciona todo.)"),
 ("parrafo-alineacion", "Atajos de alineación en Word 365 español (esquema clásico).",
  "Ctrl+Q = izquierda · Ctrl+T = centrar · Ctrl+D = derecha · Ctrl+J = justificar. (Ctrl+R no hace nada en esta instalación.)"),
 ("fuente", "En la sección «Efectos» del cuadro Fuente, ¿qué efectos se excluyen entre sí?",
  "Solo 3 parejas: Tachado / Doble tachado, Superíndice / Subíndice y Versalitas / Mayúsculas. Oculto y el resto se combinan libremente."),
 ("estilos", "¿Cuántos valores tiene el desplegable «Tipo de estilo» del cuadro Crear/Modificar estilo?",
  "Cinco: Párrafo, Carácter, Vinculado (párrafo y carácter), Tabla y Lista. NO existe un tipo «Sección»."),
 ("edicion", "En «Buscar y reemplazar ▸ Más >>», ¿cuántas casillas de «Opciones de búsqueda» hay?",
  "Siete: Coincidir mayúsculas/minúsculas, Solo palabras completas, Usar caracteres comodín, Prefijo, Sufijo, Omitir puntuación, Omitir espacios en blanco. En esta instalación ES-España NO existen «Suena como» ni «Todas las formas de la palabra»."),
])

add("insertar", 147, [
 ("tablas", "En el cuadro «Convertir texto en tabla», ¿qué opciones ofrece «Separar texto en»?",
  "Párrafos, Tabulaciones, Punto y coma y «Otro» (un carácter a elegir, p. ej. la coma)."),
 ("tablas", "¿Puede una tabla de Word hacer cálculos sin usar Excel?",
  "Sí: Herramientas de tabla ▸ Presentación ▸ Fórmula, con funciones como =SUM(ABOVE) o =AVERAGE(LEFT)."),
 ("simbolos", "Las notas al pie y al final, ¿en qué pestaña están?",
  "En Referencias, grupo «Notas al pie» (no en Insertar). Atajos: Alt+Ctrl+O (pie) y Alt+Ctrl+L (final)."),
 ("simbolos", "En el cuadro Símbolo, ¿qué fuentes dan símbolos en vez de letras?",
  "Wingdings, Wingdings 2/3, Webdings y Symbol. Con «(texto normal)» se elige además un «Subconjunto» Unicode (Latín básico, etc.)."),
 ("encabezado-pie", "¿Cuántos formatos de número de página hay y cuáles?",
  "Seis: 1,2,3 · -1,-2,-3 · a,b,c · A,B,C · i,ii,iii · I,II,III."),
])

add("disposicion", 100, [
 ("configurar-pagina", "¿Qué pasa con el formato al eliminar un salto de sección?",
  "La sección anterior (la que iba antes del salto) adopta el formato de la posterior. Conviene borrar los saltos de abajo hacia arriba y revisar."),
 ("configurar-pagina", "Cuadro «Números de línea ▸ Opciones»: ¿qué campos tiene?",
  "«Iniciar en», «Del texto» (distancia al texto), «Intervalo» (cada cuántas líneas se muestra el número) y la Numeración: Continua / Reiniciar cada página / Reiniciar cada sección."),
])

add("referencias", 74, [
 ("indice", "En el cuadro Índice, ¿qué dos «Tipos» de disposición hay?",
  "«Con sangría» (subentradas sangradas bajo la entrada) y «Continuo» (entrada y subentradas en línea, separadas por punto y coma)."),
 ("titulos", "Cuadro Referencia cruzada: ¿qué ofrece «Referencia a» para un elemento numerado?",
  "Número de página, Número de párrafo, Nº de párrafo (sin/en contexto), Texto de párrafo y «Más adelante o más atrás» (inserta esas palabras según la posición)."),
])
