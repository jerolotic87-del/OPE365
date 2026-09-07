# -*- coding: utf-8 -*-
"""+7 preguntas para diseno.json. Huecos detectados al cruzar el banco con
data/rutas/diseno.txt (volcado del usuario, autoridad) + aulaclic:
 - submenu «Color de pagina» (Solo contraste alto / Sin color / Efectos de
   relleno / Mas colores)
 - «Bordes de pagina > Opciones...» = 4 casillas
 - «Bordes de pagina > Ancho» = 9 valores (1/4 pto .. 6 pto)
 - menu «Marca de agua»: «Guardar seleccion en galeria...» y «Mas marcas de
   agua de Office.com»
 - «Marca de agua personalizada > de imagen > Decolorar»
Sin atajos (Diseño no tiene). Todo verificado contra el volcado del usuario.
"""
import json

F = "data/questions/diseno.json"
d = json.load(open(F, encoding="utf-8"))

def q(n, topic, **kw):
    o = dict(sourceFile="diseno.json", bloque=f"Diseno - {'Fondo de pagina' if topic=='fondo-pagina' else 'Formato del documento'}",
             section="diseno", topic=topic, subtopic=None, tema="Diseno",
             negativa=False, matching=None, generado=True, categoria="concepto")
    o.update(kw); o["id"] = f"diseno-{n}"
    o.setdefault("sourceQuestionId", f"web-diseno-{n}")
    return o

new = [
 q(92, "fondo-pagina", tipo="verdadero_falso",
   enunciado="En el menu «Color de pagina» de la pestana Diseno, ademas de la paleta de colores estan «Sin color», «Mas colores...» y «Efectos de relleno...».",
   respuesta=True,
   explicacion="El menu «Color de pagina» muestra «Solo contraste alto», los «Colores del tema», los «Colores estandar», «Sin color» (quita el color de fondo), «Mas colores...» (cuadro Colores) y «Efectos de relleno...» (degradado, textura, trama o imagen)."),
 q(93, "fondo-pagina", tipo="opcion_unica", categoria="ruta",
   enunciado="Para quitar el color de fondo de la pagina aplicado desde la pestana Diseno, ¿que opcion se elige?",
   opciones=[{"letter":"A","text":"«Color de pagina ▸ Sin color»"},
             {"letter":"B","text":"«Color de pagina ▸ Automatico»"},
             {"letter":"C","text":"«Color de pagina ▸ Blanco, Fondo 1»"},
             {"letter":"D","text":"Pulsar Ctrl+Z tantas veces como haga falta"}],
   respuesta="A",
   explicacion="«Sin color» en el menu «Color de pagina» quita el fondo. No existe una opcion «Automatico» en ese menu (esa es del color de fuente); elegir blanco dejaria el fondo blanco explicito, no «sin color»."),
 q(94, "fondo-pagina", tipo="verdadero_falso",
   enunciado="El boton «Opciones...» del cuadro «Bordes y sombreado» (borde de pagina) tiene cuatro casillas: «Alinear bordes de parrafo y tabla con borde de pagina», «Mostrar siempre en primer plano», «Rodear encabezado» y «Rodear pie de pagina».",
   respuesta=True,
   explicacion="Son las cuatro opciones del cuadro «Opciones de borde y sombreado», ademas de los cuatro margenes (24 pto por defecto) y el desplegable «Medir desde» (Borde de pagina / Texto)."),
 q(95, "fondo-pagina", tipo="opcion_unica",
   enunciado="En «Bordes y sombreado ▸ Borde de pagina», el campo «Ancho» ofrece una lista de grosores. ¿Cuales son el minimo y el maximo?",
   opciones=[{"letter":"A","text":"De 1/4 pto a 6 pto"},
             {"letter":"B","text":"De 1/2 pto a 4 1/2 pto"},
             {"letter":"C","text":"De 1 pto a 12 pto"},
             {"letter":"D","text":"De 0,25 pto a 3 pto"}],
   respuesta="A",
   explicacion="La lista de «Ancho» del borde de pagina tiene 9 valores: 1/4, 1/2, 3/4, 1, 1 1/2, 2 1/4, 3, 4 1/2 y 6 pto. Con «Arte» activado el ancho se mide en puntos de otra forma."),
 q(96, "fondo-pagina", tipo="opcion_unica", categoria="ruta",
   enunciado="Has colocado una imagen y un cuadro de texto y quieres reutilizarlos como marca de agua en otros documentos. ¿Que opcion del menu «Marca de agua» lo permite?",
   opciones=[{"letter":"A","text":"«Guardar seleccion en galeria de marcas de agua...»"},
             {"letter":"B","text":"«Marcas de agua personalizadas...»"},
             {"letter":"C","text":"«Mas marcas de agua de Office.com»"},
             {"letter":"D","text":"«Guardar tema actual...»"}],
   respuesta="A",
   explicacion="Con el objeto seleccionado, «Guardar seleccion en galeria de marcas de agua...» lo anade a la galeria para reutilizarlo. «Marcas de agua personalizadas...» crea una nueva desde cero; «Mas marcas de agua de Office.com» descarga de la web."),
 q(97, "fondo-pagina", tipo="verdadero_falso",
   enunciado="En «Marcas de agua personalizadas ▸ Marca de agua de imagen», la casilla «Decolorar» aclara los colores de la imagen para que no compita con el texto del documento.",
   respuesta=True,
   explicacion="«Decolorar» (a veces «Atenuar») aplica un lavado claro a la imagen. Para la marca de agua de imagen tambien se elige la «Escala» (Automatico, 50%, 100%, 150%, 200% o 500%)."),
 q(98, "fondo-pagina", tipo="verdadero_falso",
   enunciado="En «Marca de agua de texto», se puede elegir la disposicion «Diagonal» u «Horizontal» y marcar la casilla «Semitransparente».",
   respuesta=True,
   explicacion="La marca de agua de texto permite fijar idioma, texto, fuente, tamano (en puntos), color, la casilla «Semitransparente» y la disposicion «Diagonal» u «Horizontal»."),
]

d.extend(new)
json.dump(d, open(F, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
open(F, "a", encoding="utf-8").write("\n")
print(f"+{len(new)} preguntas -> diseno-92..98")
