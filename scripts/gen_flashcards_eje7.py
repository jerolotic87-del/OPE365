# -*- coding: utf-8 -*-
# Eje 7: interfaz no tenia NINGUNA flashcard (0/520) y diseno estaba muy
# flaco (9/86, ratio 0.10). Se crea data/flashcards/interfaz.json (nuevo,
# se añade al manifest) y se amplia diseno.json. Contenido = hechos ya
# establecidos en CLAUDE.md (atajos/comportamiento verificado en vivo) o
# comportamiento estandar y seguro de la interfaz de Word.
import json

# ---------- INTERFAZ (nuevo archivo, 48 tarjetas) ----------
INTERFAZ = [
("conceptos-generales", [
 ("¿Qué es la cinta de opciones (Ribbon) en Word 365?",
  "La barra superior organizada en pestañas y grupos que reúne todos los comandos de Word, sustituyendo a los menús clásicos."),
 ("¿Qué es la vista Backstage en Word?",
  "La pantalla que se abre al pulsar Archivo; agrupa Guardar, Abrir, Imprimir, Opciones, Información del documento, etc., fuera del área de edición."),
 ("¿Qué diferencia hay entre una pestaña contextual y una pestaña normal de la cinta?",
  "La contextual solo aparece cuando hay un objeto concreto seleccionado (una tabla, una imagen, una forma) y desaparece al deseleccionarlo."),
 ("¿Qué es una galería en la cinta de opciones?",
  "Un conjunto visual de opciones predefinidas (estilos, temas, formatos) que se puede previsualizar pasando el ratón antes de aplicar."),
]),
("documentos-archivos", [
 ("¿Qué diferencia hay entre los formatos .docx y .docm?",
  ".docm es el formato «Documento habilitado para macros»; .docx no admite macros de VBA."),
 ("¿Qué extensión usa una plantilla de Word con macros habilitadas?",
  ".dotm (frente a .dotx, sin macros)."),
 ("¿Qué formato conserva el diseño exacto de un documento para que se vea igual en cualquier dispositivo, pero deja de ser editable como texto de Word?",
  "PDF."),
 ("¿Qué extensión usa el formato de Word previo a 2007, compatible con versiones antiguas?",
  ".doc."),
]),
("ventana-cinta", [
 ("¿Cómo se activa o desactiva el modo táctil en Word 365?",
  "Desde el desplegable de personalización de la barra de acceso rápido, con la opción «Modo mouse/toque»."),
 ("¿Qué hace doble clic en una pestaña de la cinta de opciones?",
  "Contrae (minimiza) la cinta para dejar más espacio al documento; otro doble clic la vuelve a expandir."),
 ("¿Qué son los «grupos» dentro de una pestaña de la cinta?",
  "Bloques de comandos relacionados (p. ej. Fuente, Párrafo, Estilos dentro de Inicio), cada uno con su nombre debajo."),
 ("¿Qué hace el pequeño icono de flecha diagonal en la esquina de algunos grupos de la cinta?",
  "Abre el cuadro de diálogo clásico con todas las opciones de ese grupo (p. ej. el cuadro Fuente o Párrafo)."),
]),
("acceso-teclado-ayuda", [
 ("¿Qué tecla activa el modo de acceso por teclado en la cinta?",
  "Alt (muestra recuadros con letras/números sobre cada comando)."),
 ("¿Cómo se sale del modo de acceso por teclado sin ejecutar ningún comando?",
  "Pulsando Esc, o haciendo clic con el ratón en el documento."),
 ("¿Qué tecla abre la Ayuda de Word?",
  "F1."),
 ("¿Qué panel se abre con F7 o con Windows+F7?",
  "El panel Editor (revisión ortográfica y gramatical) — en Word 365 «Editor» y «Ortografía y gramática» son el mismo panel."),
]),
("acceso-rapido", [
 ("¿Dónde se puede colocar la barra de herramientas de acceso rápido?",
  "Encima o debajo de la cinta de opciones, a elección del usuario."),
 ("¿Cómo se añade un comando cualquiera de la cinta a la barra de acceso rápido?",
  "Clic derecho sobre el comando ▸ «Agregar a la barra de herramientas de acceso rápido»."),
 ("¿Qué comandos trae la barra de acceso rápido por defecto?",
  "Guardar, Deshacer y Rehacer/Repetir."),
 ("¿Desde dónde se personaliza a fondo la barra de acceso rápido, añadiendo cualquier comando y no solo los de la cinta?",
  "Archivo ▸ Opciones ▸ Barra de herramientas de acceso rápido."),
]),
("barra-estado", [
 ("¿Qué información muestra por defecto la Barra de estado sobre el documento?",
  "Número de página actual, número de palabras e idioma de corrección, entre otros indicadores configurables."),
 ("¿Cómo se personaliza qué elementos aparecen en la Barra de estado?",
  "Clic derecho sobre la propia barra de estado y marcando/desmarcando elementos en el menú contextual."),
 ("¿Qué ocurre con el contador de palabras de la Barra de estado al seleccionar texto?",
  "Cambia a mostrar «X de Y palabras» y se actualiza en tiempo real mientras la selección va cambiando."),
 ("¿Qué controles aparecen en el extremo derecho de la Barra de estado?",
  "Los botones de vista rápida (Modo de lectura, Diseño de impresión, Diseño Web) y el control deslizante de zoom."),
]),
("zoom", [
 ("¿Cuál es el rango de zoom disponible en Word 365?",
  "Del 10 % al 500 %."),
 ("¿Qué opción de zoom ajusta la página para que se vea entera en la ventana?",
  "«Una página», en el grupo Zoom de la pestaña Vista."),
 ("¿Qué combinación permite hacer zoom con la rueda del ratón, y de cuánto en cuánto avanza?",
  "Ctrl + rueda del ratón; avanza de 10 en 10."),
 ("¿Qué opción de zoom ajusta el ancho de la página exactamente al ancho de la ventana?",
  "«Ancho de página»."),
]),
("area-vistas", [
 ("¿Cuáles son las cinco vistas del grupo Vistas de la pestaña Vista?",
  "Modo de lectura, Diseño de impresión, Diseño Web, Vista Esquema y Vista Borrador."),
 ("¿Qué vista quita las barras de herramientas y adapta el texto para leer cómodamente en pantalla, sin editar?",
  "Modo de lectura."),
 ("¿Qué vista muestra el documento tal como se vería impreso en papel, con márgenes y saltos de página reales?",
  "Diseño de impresión — es la vista por defecto al abrir Word."),
 ("¿Qué vista organiza el documento por niveles de títulos y permite contraer/expandir secciones?",
  "Vista Esquema."),
]),
("regla", [
 ("¿Dónde se activa o desactiva la Regla si no está visible?",
  "Pestaña Vista ▸ grupo Mostrar ▸ casilla Regla."),
 ("¿Qué se puede ajustar directamente arrastrando en la Regla horizontal?",
  "Los márgenes, las sangrías de párrafo y las tabulaciones."),
 ("¿Dónde se cambia la unidad de medida que usa la Regla (centímetros, pulgadas, puntos…)?",
  "Archivo ▸ Opciones ▸ Avanzadas ▸ Mostrar ▸ Unidades de medida."),
 ("¿Qué marcador triangular de la Regla controla la sangría de primera línea?",
  "El triángulo superior (el inferior controla la sangría izquierda/francesa)."),
]),
("buscador", [
 ("¿Qué atajo lleva el foco al cuadro de búsqueda de la barra de título (Microsoft Search)?",
  "Alt+Q."),
 ("¿Qué atajo abre el panel de Navegación, con su propio cuadro de búsqueda dentro del documento?",
  "Ctrl+B."),
 ("¿Qué pestañas tiene el panel de Navegación?",
  "Títulos, Páginas y Resultados."),
 ("¿Qué hace el cuadro de búsqueda de la barra de título (Microsoft Search) además de buscar texto del documento?",
  "Busca también comandos, ayuda y sugerencias de Word, no solo contenido del documento."),
]),
("cursor-navegacion", [
 ("¿Qué combinación lleva el cursor al final del documento?",
  "Ctrl+Fin."),
 ("¿Qué combinación extiende la selección desde el cursor hasta el final del documento?",
  "Ctrl+Mayús+Fin."),
 ("¿Qué tecla activa el «modo extender selección», que va ampliando la selección con las flechas sin mantener pulsado Mayús?",
  "F8."),
 ("¿Cuándo aparecen las barras de desplazamiento de la ventana de documento?",
  "Solo cuando el contenido no cabe entero en el alto o el ancho visible; si cabe, Word puede ocultarlas."),
]),
("deshacer-rehacer", [
 ("¿Qué atajo deshace la última acción en Word?",
  "Ctrl+Z."),
 ("¿Qué le ocurre al botón Rehacer cuando no queda ninguna acción que rehacer?",
  "Pasa a funcionar como «Repetir la última acción», la misma función que la tecla F4."),
 ("¿Qué tecla de función repite la última acción realizada?",
  "F4 (misma función que el botón Repetir)."),
 ("¿Se puede deshacer una acción de guardar el documento (Ctrl+G)?",
  "No; guardar no forma parte de la pila de deshacer/rehacer."),
]),
]

# ---------- DISENO (top-up, +15) ----------
DISENO = [
("formato-documento", [
 ("¿Qué son los «Estilos rápidos» o «Estilo de conjunto» dentro de Formato del documento?",
  "Combinaciones predefinidas y con nombre de fuentes, colores y espaciado que se aplican con un clic a todo el documento."),
 ("¿Qué cambia a la vez al aplicar un tema distinto al documento?",
  "Fuentes, colores y efectos que usan por defecto los estilos del documento, de una sola vez."),
 ("¿Los cambios de Formato del documento (colores, fuentes, espaciado) afectan al texto con formato manual directo?",
  "No: solo afectan a los estilos con nombre del documento; el texto formateado a mano al margen de los estilos no cambia."),
 ("¿Qué hace «Establecer como predeterminada» en el grupo Formato del documento?",
  "Guarda la combinación de formato actual como base para los nuevos documentos creados a partir de la plantilla activa."),
 ("¿Qué controla la opción Espaciado entre párrafos de Formato del documento?",
  "Un conjunto predefinido de espacio antes/después de párrafo e interlineado, aplicado a todo el documento de una vez."),
]),
("fondo-pagina", [
 ("¿Cómo se quita una marca de agua ya aplicada?",
  "Diseño ▸ Fondo de página ▸ Marca de agua ▸ Quitar marca de agua."),
 ("¿Se puede crear una marca de agua personalizada con texto propio o una imagen?",
  "Sí, con Marca de agua ▸ Marcas de agua personalizadas."),
 ("¿El color de página aplicado se imprime siempre en papel?",
  "No necesariamente: depende de la opción «Imprimir colores e imágenes de fondo»; por defecto muchos fondos se ven en pantalla y en PDF pero no se imprimen en papel."),
 ("¿Qué opciones de relleno admite Color de página, además de un color plano?",
  "Efectos de relleno: degradado, textura, trama e imagen."),
 ("¿Qué se puede elegir en Bordes de página además del estilo de línea?",
  "Un borde de «Arte» con motivos decorativos prediseñados, además de color, ancho y a qué páginas se aplica."),
]),
("estructura", [
 ("¿Entre qué dos pestañas de la cinta se sitúa Diseño en Word 365?",
  "Entre Insertar y Disposición."),
 ("¿Cuántos grupos tiene la pestaña Diseño?",
  "Dos: Formato del documento y Fondo de página."),
 ("¿Qué pestaña de la cinta controla los márgenes, la orientación y el tamaño de página, a diferencia de Diseño?",
  "Disposición."),
 ("¿La pestaña Diseño incluye herramientas de edición de texto como fuente o párrafo?",
  "No; esas viven en Inicio. Diseño solo controla el aspecto global del documento (temas, colores, fondo)."),
 ("¿Cómo se puede ver el efecto de una opción de Formato del documento antes de aplicarla?",
  "Pasando el ratón por cada opción de la galería: el documento cambia de aspecto en tiempo real (vista previa en vivo) antes de confirmar el clic."),
]),
]

def build(section, groups, start=1):
    out, n = [], start
    for topic, cards in groups:
        for front, back in cards:
            out.append({
                "cardId": "F-%03d" % n, "section": section, "topic": topic,
                "subtopic": None, "cardType": "contenido", "priority": "normal",
                "front": front, "back": back,
                "sourceRefs": [], "knowledgeRefs": [], "questionRefs": [],
            })
            n += 1
    return out

new_interfaz = build("interfaz", INTERFAZ)
path = "data/flashcards/interfaz.json"
json.dump(new_interfaz, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(path, "a", encoding="utf-8").write("\n")
print(f"{path}: {len(new_interfaz)} tarjetas (nuevo)")

manifest_path = "data/flashcards/manifest.json"
manifest = json.load(open(manifest_path, encoding="utf-8"))
if "interfaz.json" not in manifest:
    manifest.insert(0, "interfaz.json")  # interfaz es la 1a seccion en taxonomy.order
    json.dump(manifest, open(manifest_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(manifest_path, "a", encoding="utf-8").write("\n")
    print(f"{manifest_path}: añadido interfaz.json")

diseno_path = "data/flashcards/diseno.json"
d = json.load(open(diseno_path, encoding="utf-8"))
n0 = max(int(c["cardId"].split("-")[1]) for c in d)
d.extend(build("diseno", DISENO, start=n0 + 1))
json.dump(d, open(diseno_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(diseno_path, "a", encoding="utf-8").write("\n")
print(f"{diseno_path}: {len(d)} tarjetas totales (+15)")
