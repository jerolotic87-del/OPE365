# -*- coding: utf-8 -*-
"""Preguntas de CUADROS DE DIALOGO COMPARTIDOS entre pestanas (mapa
cross-pestana de data/rutas/_dialogos_compartidos.md seccion 14).

El usuario dijo: «en los examenes preguntan desde que lugares se llega a un
cuadro». El banco tenia 81 preguntas asi, pero 45 en archivo + 30 en inicio;
disposicion 1, insertar 3, referencias 1, diseno/vista/revisar/correspondencia 0.
Este generador reparte ~24 preguntas por la seccion que "posee" cada cuadro.
`sourceQuestionId` = `dlgcross-NN`, `generado:true`, `categoria:"ruta"`.
Todo verificado contra los volcados de rutas del usuario.
"""
import json

def add(sec, start_q, start_fc, questions, flashcards):
    QF, FF = f"data/questions/{sec}.json", f"data/flashcards/{sec}.json"
    d = json.load(open(QF, encoding="utf-8"))
    n = start_q
    tema = {"disposicion":"Disposicion","diseno":"Diseno","insertar":"Insertar",
            "referencias":"Referencias","vista":"Vista","revisar":"Revisar",
            "inicio":"Inicio","interfaz":"Interfaz","archivo":"Archivo"}[sec]
    for topic, tipo, enun, ops, resp, expl in questions:
        n += 1
        d.append(dict(sourceFile=f"{sec}.json", bloque=tema, section=sec, topic=topic,
            subtopic=None, tema=tema, negativa=False, matching=None, generado=True,
            categoria="ruta", id=f"{sec}-{n}", sourceQuestionId=f"dlgcross-{sec}-{n}",
            tipo=tipo, enunciado=enun,
            opciones=[{"letter":l,"text":t} for l,t in ops] if ops else [],
            respuesta=resp, explicacion=expl))
    json.dump(d, open(QF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(QF, "a", encoding="utf-8").write("\n")
    print(f"{sec}: +{len(questions)} preguntas ({sec}-{start_q+1}..{sec}-{n})")
    if flashcards:
        f = json.load(open(FF, encoding="utf-8"))
        m = start_fc
        for topic, front, back in flashcards:
            m += 1
            f.append({"cardId": f"F-{m:03d}", "section": sec, "topic": topic,
                "subtopic": None, "cardType": "contenido", "priority": "alta",
                "front": front, "back": back,
                "sourceRefs": ["data/rutas/_dialogos_compartidos.md §14"],
                "knowledgeRefs": [], "questionRefs": []})
        json.dump(f, open(FF, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        open(FF, "a", encoding="utf-8").write("\n")
        print(f"{sec}: +{len(flashcards)} flashcards (F-{start_fc+1:03d}..F-{m:03d})")


# ---------- DISPOSICION: Configurar pagina, Parrafo, Tabulaciones ----------
add("disposicion", 138, 102, [
 ("configurar-pagina","seleccion_multiple",
  "¿Desde cuales de estas rutas se abre el cuadro «Configurar pagina»?",
  [("A","Disposicion ▸ Configurar pagina ▸ lanzador (flecha del grupo)"),
   ("B","Disposicion ▸ Configurar pagina ▸ Margenes ▸ Margenes personalizados…"),
   ("C","Disposicion ▸ Configurar pagina ▸ Tamano ▸ Mas tamanos de papel…"),
   ("D","Archivo ▸ Imprimir ▸ enlace «Configurar pagina»"),
   ("E","Inicio ▸ Parrafo ▸ lanzador")],
  ["A","B","C","D"],
  "El cuadro «Configurar pagina» (3 fichas: Margenes / Papel / Disposicion) se abre desde la pestana Disposicion por 3 vias y desde Archivo ▸ Imprimir. El lanzador de Inicio ▸ Parrafo abre el cuadro Parrafo, no este."),
 ("configurar-pagina","opcion_unica",
  "Segun por donde entres al cuadro «Configurar pagina», abre en una ficha u otra. ¿En cual abre si entras por «Mas tamanos de papel…»?",
  [("A","Papel"),("B","Margenes"),("C","Disposicion"),("D","Siempre en Margenes")],
  "A",
  "«Margenes personalizados…» abre en la ficha Margenes; «Mas tamanos de papel…» en Papel; el lanzador del grupo, en la ultima ficha usada (normalmente Margenes)."),
 ("configurar-pagina","verdadero_falso",
  "Las galerias Margenes, Orientacion y Tamano del panel Archivo ▸ Imprimir son las mismas que las de la pestana Disposicion, y el enlace «Configurar pagina» abre el mismo cuadro.",
  None, True,
  "El panel Imprimir de Backstage es un espejo de Disposicion ▸ Configurar pagina; ademas anade Copias, Intercaladas, paginas por hoja, etc., que no estan en la cinta Disposicion."),
 ("parrafo-disposicion","seleccion_multiple",
  "¿Desde cuales de estas rutas se abre el CUADRO «Parrafo» (fichas Sangria y espacio / Lineas y saltos)?",
  [("A","Inicio ▸ Parrafo ▸ lanzador"),
   ("B","Disposicion ▸ Parrafo ▸ lanzador"),
   ("C","Inicio ▸ Espaciado entre lineas y parrafos ▸ Opciones de interlineado…"),
   ("D","Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▾ ▸ Parrafo…"),
   ("E","Vista ▸ Mostrar ▸ Regla")],
  ["A","B","C","D"],
  "El cuadro Parrafo es identico se abra desde Inicio o desde Disposicion. Mínimo/Exacto/Múltiple del interlineado solo se fijan desde este cuadro, no desde el boton de la cinta."),
 ("parrafo-disposicion","opcion_unica",
  "El cuadro «Tabulaciones», ¿desde donde NO se puede abrir?",
  [("A","Desde un boton propio en el grupo Parrafo de la cinta"),
   ("B","Desde el cuadro Parrafo (boton «Tabulaciones…» abajo a la izquierda)"),
   ("C","Haciendo doble clic en la regla"),
   ("D","Desde Inicio ▸ Estilos ▸ Modificar estilo ▸ Formato ▾ ▸ Tabulaciones…")],
  "A",
  "No hay un boton «Tabulaciones» suelto en la cinta: siempre se llega a traves del cuadro Parrafo, de la regla o del menu Formato ▾ de un estilo."),
], [
 ("configurar-pagina","«Configurar pagina»: ¿desde que pestanas se abre?",
  "Disposicion (lanzador · Margenes personalizados · Mas tamanos de papel) y Archivo ▸ Imprimir ▸ «Configurar pagina». Abre en Margenes / Papel / Disposicion segun la ruta."),
 ("parrafo-disposicion","El cuadro «Parrafo»: ¿una pestana o varias?",
  "Se abre igual desde Inicio ▸ Parrafo (lanzador) y desde Disposicion ▸ Parrafo (lanzador), y tambien desde «Opciones de interlineado…» y desde Formato ▾ de un estilo. Es el mismo cuadro."),
])

# ---------- DISENO: Bordes y sombreado ----------
add("diseno", 98, 34, [
 ("fondo-pagina","seleccion_multiple",
  "El cuadro «Bordes y sombreado» se abre desde varias pestanas. ¿Desde cuales de estas SI?",
  [("A","Diseno ▸ Fondo de pagina ▸ Bordes de pagina"),
   ("B","Inicio ▸ Parrafo ▸ Bordes (flecha) ▸ Bordes y sombreado…"),
   ("C","Disposicion ▸ Configurar pagina ▸ ficha Disposicion ▸ boton «Bordes…»"),
   ("D","Cinta contextual de Tabla ▸ Bordes ▸ Bordes y sombreado…"),
   ("E","Insertar ▸ Ilustraciones ▸ Formas")],
  ["A","B","C","D"],
  "Es un unico cuadro (3 fichas: Bordes / Borde de pagina / Sombreado) al que se llega desde Diseno, Inicio, Disposicion y las cintas de Tabla."),
 ("fondo-pagina","opcion_unica",
  "El cuadro «Bordes y sombreado» abre en una ficha distinta segun la ruta. Si entras por «Inicio ▸ Parrafo ▸ Bordes y sombreado», ¿en que ficha abre?",
  [("A","Bordes (borde de parrafo/texto)"),("B","Borde de pagina"),
   ("C","Sombreado"),("D","Siempre en Borde de pagina")],
  "A",
  "Desde Inicio abre en «Bordes»; desde «Diseno ▸ Bordes de pagina» abre en «Borde de pagina». La ficha «Arte» (motivos decorativos) solo existe en «Borde de pagina»."),
], [
 ("fondo-pagina","«Bordes y sombreado»: ¿desde que pestanas y en que ficha abre?",
  "Inicio ▸ Parrafo ▸ Bordes → ficha «Bordes». Diseno ▸ Bordes de pagina → ficha «Borde de pagina». Tambien desde Configurar pagina ▸ Disposicion ▸ Bordes y desde las cintas de Tabla. «Arte» solo en Borde de pagina."),
])

# ---------- INSERTAR: Referencia cruzada, Simbolo ----------
add("insertar", 470, 152, [
 ("vinculos","opcion_unica",
  "El cuadro «Referencia cruzada» se abre desde DOS pestanas distintas. ¿Cuales?",
  [("A","Insertar (grupo Vinculos) y Referencias (grupo Titulos)"),
   ("B","Insertar y Revisar"),
   ("C","Referencias y Disposicion"),
   ("D","Solo desde Insertar")],
  "A",
  "Es exactamente el mismo cuadro: «Insertar ▸ Vinculos ▸ Referencia cruzada» y «Referencias ▸ Titulos ▸ Referencia cruzada»."),
 ("simbolos","opcion_unica",
  "Desde el cuadro «Simbolo» (Insertar ▸ Simbolos ▸ Mas simbolos), ¿a que otros cuadros se puede saltar con sus botones?",
  [("A","«Teclas…» → Personalizar teclado; «Autocorreccion…» → Autocorreccion"),
   ("B","«Teclas…» → Opciones de Word; «Autocorreccion…» → Buscar y reemplazar"),
   ("C","Solo se puede insertar el simbolo, no hay botones a otros cuadros"),
   ("D","«Fuente…» → cuadro Fuente y nada mas")],
  "A",
  "«Teclas…» abre «Personalizar teclado» para asignar un atajo al simbolo seleccionado; «Autocorreccion…» crea una entrada de autocorreccion para el."),
], [
 ("vinculos","«Referencia cruzada»: ¿desde donde se abre?",
  "Desde DOS pestanas, mismo cuadro: Insertar ▸ Vinculos ▸ Referencia cruzada Y Referencias ▸ Titulos ▸ Referencia cruzada."),
])

# ---------- REFERENCIAS: cuadro Estilo (Modificar) ----------
add("referencias", 165, 76, [
 ("tabla-contenido","seleccion_multiple",
  "El cuadro «Modificar estilo» (para retocar el aspecto de un estilo con nombre), ¿desde cuales de estas rutas se abre?",
  [("A","Inicio ▸ Estilos ▸ clic derecho en un estilo ▸ Modificar…"),
   ("B","Diseno ▸ Formato del documento ▸ Administrar estilos ▸ Modificar…"),
   ("C","Referencias ▸ Tabla de contenido ▸ Tabla de contenido personalizada… ▸ Modificar… (estilos TDC 1..9)"),
   ("D","Referencias ▸ Indice ▸ Insertar indice ▸ Modificar… (estilos Indice 1..9)"),
   ("E","Vista ▸ Vistas ▸ Esquema")],
  ["A","B","C","D"],
  "El mismo cuadro de edicion de estilos se alcanza desde Inicio, Diseno y desde los cuadros de TDC / Indice / Tabla de ilustraciones de Referencias (ahi para los estilos TDC/Indice/Tabla de ilustraciones)."),
], [])

# ---------- VISTA: Zoom, Panel de navegacion ----------
add("vista", 165, 76, [
 ("zoom","opcion_unica",
  "El cuadro de dialogo «Zoom», ¿desde donde se abre ademas de «Vista ▸ Zoom ▸ Zoom»?",
  [("A","Doble clic en el indicador de porcentaje de la barra de estado"),
   ("B","Doble clic en la regla"),
   ("C","Archivo ▸ Opciones ▸ Presentacion"),
   ("D","Clic derecho en la cinta")],
  "A",
  "El % de la barra de estado (abajo a la derecha, junto al deslizador) abre el cuadro Zoom al hacer clic."),
 ("mostrar","seleccion_multiple",
  "¿Desde cuales de estas rutas se abre / activa el «Panel de navegacion»?",
  [("A","Vista ▸ Mostrar ▸ casilla «Panel de navegacion»"),
   ("B","Inicio ▸ Edicion ▸ Buscar"),
   ("C","Ctrl+B (en esta instalacion)"),
   ("D","Insertar ▸ Vinculos ▸ Marcador"),
   ("E","Referencias ▸ Tabla de contenido")],
  ["A","B","C"],
  "El panel de navegacion (fichas Titulos / Paginas / Resultados) se abre desde la casilla de Vista, desde «Buscar» de Inicio y con Ctrl+B. Desde su lupa se llega a «Busqueda avanzada» = cuadro Buscar y reemplazar."),
 ("vistas","opcion_unica",
  "El cuadro «Contar palabras», ¿desde donde se abre ademas de «Revisar ▸ Contar palabras»?",
  [("A","Haciendo clic en «Palabras: N» de la barra de estado"),
   ("B","Vista ▸ Mostrar ▸ Contar"),
   ("C","Archivo ▸ Informacion ▸ Propiedades"),
   ("D","No se puede abrir desde otro sitio")],
  "A",
  "El recuento «Palabras: N» de la barra de estado abre el cuadro «Contar palabras» (Paginas, Palabras, Caracteres con/sin espacios, Parrafos, Lineas)."),
], [
 ("zoom","«Zoom» y «Contar palabras»: la barra de estado es un atajo a los dos.",
  "Clic en el % (abajo dcha) → cuadro Zoom. Clic en «Palabras: N» → cuadro Contar palabras. Tambien Vista ▸ Zoom y Revisar ▸ Contar palabras."),
 ("mostrar","«Panel de navegacion»: 3 vias.",
  "Vista ▸ Mostrar (casilla) · Inicio ▸ Edicion ▸ Buscar · Ctrl+B. Fichas: Titulos / Paginas / Resultados."),
])

# ---------- REVISAR: Comprobar accesibilidad, Traductor ----------
add("revisar", 100, 76, [
 ("accesibilidad","seleccion_multiple",
  "El «Comprobador de accesibilidad», ¿desde cuales de estas rutas se abre?",
  [("A","Revisar ▸ Accesibilidad ▸ Comprobar accesibilidad"),
   ("B","Archivo ▸ Informacion ▸ Comprobar si hay problemas ▸ Comprobar accesibilidad"),
   ("C","El aviso «Accesibilidad» de la barra de estado"),
   ("D","Inicio ▸ Estilos ▸ Inspector de estilo"),
   ("E","Insertar ▸ Texto ▸ Objeto")],
  ["A","B","C"],
  "«Comprobar si hay problemas» de Backstage ofrece Inspeccionar documento / Comprobar accesibilidad / Comprobar compatibilidad; la de accesibilidad abre el mismo panel que el boton de Revisar."),
 ("idioma","opcion_unica",
  "El panel «Traductor», ¿desde donde se abre?",
  [("A","Revisar ▸ Idioma ▸ Traducir ▸ Traducir seleccion / Traducir documento (o Alt+Mayus+F7)"),
   ("B","Archivo ▸ Opciones ▸ Idioma"),
   ("C","Inicio ▸ Edicion ▸ Buscar"),
   ("D","Vista ▸ Inmersivo ▸ Immersive Reader")],
  "A",
  "El menu «Traducir» tiene Traducir seleccion (ficha Seleccion), Traducir documento (ficha Documento) y Preferencias de Traductor. Alt+Mayus+F7 abre el panel directamente."),
], [
 ("accesibilidad","El comprobador de accesibilidad: 3 puertas de entrada.",
  "Revisar ▸ Accesibilidad · Archivo ▸ Informacion ▸ «Comprobar si hay problemas» · el aviso de la barra de estado."),
])

# ---------- ARCHIVO: Opciones de Word (cuadro con muchas puertas) ----------
add("archivo", 408, 263, [
 ("opciones-general","seleccion_multiple",
  "El cuadro «Opciones de Word» se abre desde Archivo ▸ Opciones, pero tambien desde atajos dentro de otros cuadros. ¿Cuales de estos llevan a un panel concreto de «Opciones de Word»?",
  [("A","Revisar ▸ Idioma ▸ Preferencias de idioma… → panel «Idioma»"),
   ("B","Inicio ▸ Pegar ▸ Establecer Pegar predeterminado… → panel «Avanzadas»"),
   ("C","Configurar pagina ▸ Papel ▸ Opciones de impresion… → panel «Mostrar»"),
   ("D","Barra de acceso rapido ▸ Mas comandos… → panel «Barra de herramientas de acceso rapido»"),
   ("E","Archivo ▸ Imprimir ▸ Imprimir")],
  ["A","B","C","D"],
  "Muchos «Opciones…» / «Preferencias…» / «Establecer … predeterminado» repartidos por la interfaz abren el cuadro «Opciones de Word» ya posicionado en el panel adecuado."),
 ("opciones-personalizar","opcion_unica",
  "Para anadir la ficha «Programador» a la cinta, la ruta es:",
  [("A","Archivo ▸ Opciones ▸ Personalizar cinta de opciones ▸ marcar «Programador»"),
   ("B","Vista ▸ Mostrar ▸ Programador"),
   ("C","Archivo ▸ Opciones ▸ Complementos"),
   ("D","Clic derecho en la cinta ▸ Programador")],
  "A",
  "En «Personalizar cinta de opciones», la lista de la derecha son las Fichas principales; se marca la casilla de «Programador». Ahi tambien se crean fichas y grupos propios."),
], [
 ("opciones-general","«Opciones de Word»: no solo desde Archivo ▸ Opciones.",
  "Tambien desde: Revisar ▸ Idioma ▸ Preferencias (panel Idioma), Inicio ▸ Pegar ▸ Establecer Pegar predeterminado (panel Avanzadas), Configurar pagina ▸ Papel ▸ Opciones de impresion (panel Mostrar), Barra de acceso rapido ▸ Mas comandos."),
])

print("\nOK")
