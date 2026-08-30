#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Construye data/flashcards/vista.json -- las 46 flashcards finales de
VISTA_PROCESADA_PARA_OPE365.md §21 (39 de contenido F-01..F-39 + 7 de
error E-01..E-07), transcritas verbatim. No se convierte ninguna
pregunta en flashcard automáticamente (Etapa 5 del plan de migración).

Uso:
    python3 scripts/build_vista_flashcards.py
Genera data/flashcards/vista.json. Ejecutar build_data.py después
(cuando exista el motor de flashcards que lo cargue, Etapa 6).
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PATH = os.path.join(HERE, "data", "flashcards", "vista.json")

def card(id_, tipo, prioridad, front, back, topic=None, subtopic=None,
         sourceRefs=None, questionRefs=None):
    return {
        "cardId": id_, "section": "vista", "topic": topic, "subtopic": subtopic,
        "cardType": tipo, "priority": prioridad,
        "front": front, "back": back,
        "sourceRefs": sourceRefs or [], "knowledgeRefs": [],
        "questionRefs": questionRefs or [],
    }

cards = []

# === GRUPO VISTAS ===
cards.append(card("F-01","contenido","alta",
    "¿Cuál es la vista predefinida de Word?",
    "Diseño de impresión · Atajo: Ctrl + Alt + D",
    "vistas","Diseño de impresión", ["aulaClic","Sergio Galán"], ["1-87","1-88"]))
cards.append(card("F-02","contenido","alta",
    "¿Cuántas páginas muestra el Modo de lectura y cómo?",
    "Dos páginas por pantalla en forma de libro.",
    "vistas","Modo de lectura", [], ["vista-1"]))
cards.append(card("F-03","contenido","alta",
    "¿Qué elementos oculta el Modo de lectura?",
    "Barras de herramientas · reglas · encabezados · pies de página · y otros elementos (lista abierta con \"…\")",
    "vistas","Modo de lectura", ["aulaClic"], ["vista-1"]))
cards.append(card("F-04","contenido","alta",
    "¿Qué muestra la Vista Esquema y para qué sirve? Atajo.",
    "Muestra sólo los títulos · Crear y editar esquemas · Útil para elaborar notas · Ctrl + Alt + Q",
    "vistas","Vista Esquema", [], ["vista-3","vista-56"]))
cards.append(card("F-05","contenido","normal",
    "¿Qué ocurre en la cinta al activar Vista Esquema?",
    "Aparece una nueva pestaña \"Esquema\" en la cinta. Es la única vista que genera su propia pestaña adicional.",
    "vistas","Vista Esquema", ["Sergio Galán"]))
cards.append(card("F-06","contenido","alta",
    "¿Qué elementos NO son visibles en Vista Borrador? Atajo.",
    "Encabezados y pies de página (ejemplos -- lista abierta con \"como\") · Ctrl + Alt + N",
    "vistas","Vista Borrador", [], ["vista-4","vista-5"]))
cards.append(card("F-07","contenido","normal",
    "¿Cuál es la función principal de Vista Borrador?",
    "Editar el texto rápidamente mostrando el documento como borrador.",
    "vistas","Vista Borrador", ["Sergio Galán"], ["vista-2"]))
cards.append(card("F-08","contenido","normal",
    "¿Qué hace el Diseño Web?",
    "Muestra el documento como en un explorador web: fondos con colores/texturas · texto ajustado a la ventana · gráficos como en web.",
    "vistas","Diseño Web", [], ["vista-6"]))
cards.append(card("F-09","contenido","normal",
    "¿Para qué sirve la Vista Preliminar? Atajo.",
    "Ver páginas completas a tamaño reducido · verificar saltos de página, distribución y formato · Ctrl + Alt + I. ¡OJO!: No es un botón del Grupo Vistas. Se accede desde Archivo → Imprimir.",
    "vistas","Vista Preliminar", [], ["vista-7"]))

# === GRUPO INMERSIVO ===
cards.append(card("F-10","contenido","normal",
    "¿Qué hace la herramienta Concentración?",
    "Elimina las distracciones del entorno para concentrarse en el documento.",
    "inmersivo","Concentración", [], ["vista-12"]))
cards.append(card("F-11","contenido","alta",
    "¿Qué es Immersive Reader?",
    "Un conjunto de herramientas (plural) para mejorar la comprensión y fluidez de lectura. Nombre oficial en español: \"Lector inmersivo\".",
    "inmersivo","Lector inmersivo", [], ["vista-13","vista-14"]))
cards.append(card("F-12","contenido","normal",
    "¿A qué grupo pertenecen Concentración e Immersive Reader?",
    "Al Grupo Inmersivo (también llamado \"Inmersivo\" en la cinta) ¡NO al Grupo Vistas!",
    "inmersivo", None, ["aulaClic"], ["vista-15"]))

# === GRUPO MOVIMIENTO DE PÁGINA ===
cards.append(card("F-13","contenido","normal",
    "¿En qué dirección desplaza el Grupo Movimiento de Página y mediante qué medios?",
    "Dirección: horizontal · Medios: rueda del ratón o barra de desplazamiento horizontal.",
    "movimiento-pagina", None, [], ["vista-16","vista-17"]))

# === GRUPO MOSTRAR ===
cards.append(card("F-14","contenido","alta",
    "¿Qué tres elementos controla el Grupo Mostrar?",
    "Regla · Líneas de la cuadrícula · Panel de navegación · Acción: Mostrar/Ocultar (toggle reversible)",
    "mostrar", None, [], ["vista-18","vista-19","vista-20"]))

# === GRUPO ZOOM ===
cards.append(card("F-15","contenido","alta",
    "¿Cuál es el zoom mínimo y máximo en Word?",
    "Mínimo 10% · Máximo 500%. ¡OJO!: El 25% es solo una opción del cuadro de diálogo, NO el mínimo.",
    "zoom","Valores", [], ["vista-57","vista-58"]))
cards.append(card("F-16","contenido","alta",
    "¿En qué incremento cambia el zoom con Ctrl + rueda del ratón?",
    "De 10 en 10 puntos porcentuales.",
    "zoom","Valores", [], ["vista-23"]))
cards.append(card("F-17","contenido","normal",
    "¿Diferencia entre el botón Zoom (lupa) y el botón 100%?",
    "Zoom (lupa) → abre el cuadro de diálogo para configurar · 100% → aplica directamente zoom al 100% sin abrir ningún cuadro de diálogo.",
    "zoom","Cuadro de diálogo", [], ["vista-21"]))
cards.append(card("F-18","contenido","normal",
    "¿Qué opciones de ajuste ofrece el Grupo Zoom además del botón Zoom y 100%?",
    "Una página · Varias páginas · Ancho de página",
    "zoom","Cuadro de diálogo", [], ["vista-22"]))

# === GRUPO VENTANA ===
cards.append(card("F-19","contenido","alta",
    "¿Qué hace Nueva ventana?",
    "Abre dos ventanas independientes del mismo documento.",
    "ventana","Nueva ventana", [], ["vista-32"]))
cards.append(card("F-20","contenido","alta",
    "¿Qué hace Dividir? Atajo.",
    "Dos paneles del mismo documento en una sola ventana · Alt + Ctrl + V. Atajo complementario para desactivar: Alt + Mayús + C.",
    "ventana","Dividir", [], ["vista-28"]))
cards.append(card("F-21","contenido","alta",
    "¿Qué hace Ver en paralelo?",
    "Muestra dos documentos distintos simultáneamente para compararlos cómodamente.",
    "ventana","Ver en paralelo", [], ["vista-27"]))
cards.append(card("F-22","contenido","alta",
    "¿Cuál es la diferencia entre Nueva ventana, Dividir y Ver en paralelo?",
    "Nueva ventana → mismo doc · 2 ventanas separadas. Dividir → mismo doc · 2 paneles en 1 ventana · Alt+Ctrl+V. Ver en paralelo → 2 documentos distintos para comparar.",
    "ventana", None, [], ["vista-32","vista-33"]))
cards.append(card("F-23","contenido","normal",
    "¿Con qué otro nombre se conoce Organizar todo y qué hace?",
    "Mosaico · Coloca en mosaico todas las ventanas abiertas (sin límite numérico).",
    "ventana","Organizar todo", [], ["vista-25"]))
cards.append(card("F-24","contenido","alta",
    "¿Qué condición requiere el Desplazamiento sincrónico para activarse?",
    "Requiere que Ver en paralelo esté activo previamente. Función: desplaza simultáneamente los dos documentos en paralelo.",
    "ventana","Desplazamiento sincrónico", [], ["vista-29","vista-30"]))
cards.append(card("F-25","contenido","normal",
    "¿Qué hace Restablecer posición de la ventana y qué condición requiere?",
    "Coloca las ventanas en paralelo de manera equitativa · Requiere que el modo paralelo esté activo.",
    "ventana","Restablecer posición de la ventana", [], ["vista-31","vista-35"]))
cards.append(card("F-26","contenido","normal",
    "¿Qué hace Cambiar ventanas y cómo se presenta en la cinta?",
    "Cambia rápidamente a otra ventana abierta · Se presenta como menú desplegable (∨).",
    "ventana","Cambiar ventanas", [], ["vista-26"]))

# === GRUPO MACROS ===
cards.append(card("F-27","contenido","alta",
    "¿Qué es una macro? (3 componentes estructurales)",
    "Una serie de comandos e instrucciones · agrupados como un mismo comando · para completar una tarea automáticamente. aulaClic añade: se ejecutan en un orden que el usuario decide.",
    "macros", None, ["aulaClic"], ["vista-36"]))
cards.append(card("F-28","contenido","normal",
    "¿Cuáles son los tres usos principales de las macros según aulaClic?",
    "1. Automatizar una serie de pasos. 2. Personalizar la barra de acceso rápido. 3. Insertar texto o gráficos de uso frecuente.",
    "macros", None, ["aulaClic"]))
cards.append(card("F-29","contenido","normal",
    "¿Para qué tipo de tareas se usan las macros según Adams?",
    "Para automatizar las tareas más usadas (frecuentes) en Word.",
    "macros", None, [], ["vista-39"]))
cards.append(card("F-30","contenido","alta",
    "¿Qué abre Alt + F8?",
    "El cuadro de diálogo Macros.",
    "macros", None, ["Studocu","aulaClic"]))
cards.append(card("F-31","contenido","alta",
    "¿Qué abre Alt + F11?",
    "El editor de Visual Basic (VBE -- entorno de programación de macros).",
    "macros", None, ["Studocu","IONOS España"]))
cards.append(card("F-32","contenido","normal",
    "¿Qué opciones tiene el submenú del botón Macros?",
    "Ver macros · Grabar macro... · Pausar grabación (Pausar grabación aparece en gris si no hay grabación activa)",
    "macros", None, [], ["vista-40","vista-41"]))
cards.append(card("F-33","contenido","normal",
    "¿Cuál es la ruta para abrir el cuadro de diálogo Macros desde la cinta?",
    "Vista → Macros → Ver macros (También con atajo directo Alt + F8)",
    "macros", None, ["aulaClic"]))

# === GRUPO SHAREPOINT ===
cards.append(card("F-34","contenido","normal",
    "¿Qué es SharePoint y quién lo diseñó?",
    "Herramienta de Microsoft para la gestión documental y el trabajo en equipo.",
    "sharepoint", None, [], ["vista-44","vista-45"]))

# === INTEGRACIÓN Y ESTRUCTURA ===
cards.append(card("F-35","contenido","normal",
    "¿Entre qué pestañas está la pestaña Vista en la cinta?",
    "Entre Revisar (izquierda) y Programador (derecha) · Posición 9.ª de 11.",
    None, None, [], ["vista-50"]))
cards.append(card("F-36","contenido","alta",
    "¿Cuáles son los 8 grupos de la pestaña Vista?",
    "Vistas · Inmersivo · Movimiento de Página · Mostrar · Zoom · Ventana · Macros · SharePoint",
    None))
cards.append(card("F-37","contenido","alta",
    "¿Qué 4 vistas tienen atajo Ctrl + Alt + [letra]?",
    "D = Diseño de impresión · Q = esQuema · N = borrador (borraNdor) · I = vIsta preliminar (previa de impresión)",
    "vistas", None, [], ["vista-61","vista-11"]))
cards.append(card("F-38","contenido","normal",
    "¿Qué función NO tiene atajo documentado entre estas tres: Diseño de impresión, Dividir, Organizar todo?",
    "Organizar todo no tiene atajo documentado. Diseño de impresión → Ctrl+Alt+D. Dividir → Alt+Ctrl+V. Organizar todo → sin atajo.",
    "ventana","Organizar todo", [], ["vista-48"]))
cards.append(card("F-39","contenido","normal",
    "¿Cómo se llama el Grupo Vistas según aulaClic?",
    "aulaClic lo llama \"Vistas de documento\" · Tu temario Adams lo llama \"Grupo Vistas\" · Ambas denominaciones son válidas para el examen.",
    "vistas", None, ["aulaClic"]))

# === FICHAS DE ERROR — "NO CONFUNDIR" ===
cards.append(card("E-01","error","alta",
    "Alt + F8 vs Alt + F11 — ¿cuál es cuál?",
    "Alt + F8 → diálogo MACROS (gestionar). Alt + F11 → VISUAL BASIC (programar). Regla: F8 viene antes que F11, igual que gestionar viene antes que programar.",
    "macros", None, ["Studocu","aulaClic","IONOS España"], ["vista-37"]))
cards.append(card("E-02","error","alta",
    "Zoom mínimo: ¿10% o 25%?",
    "10% es el mínimo absoluto. El 25% es solo una opción predefinida del cuadro de diálogo Zoom, NO el mínimo.",
    "zoom","Valores", [], ["vista-57"]))
cards.append(card("E-03","error","alta",
    "Ver el mismo documento en 2 ventanas vs. 2 paneles — ¿qué función es cada una?",
    "2 ventanas separadas = Nueva ventana. 2 paneles en 1 ventana = Dividir (Alt+Ctrl+V).",
    "ventana", None, [], ["vista-32","vista-28"]))
cards.append(card("E-04","error","normal",
    "¿Se puede activar el Desplazamiento sincrónico en cualquier momento?",
    "No. Solo cuando Ver en paralelo está activo previamente.",
    "ventana","Desplazamiento sincrónico", [], ["vista-29"]))
cards.append(card("E-05","error","normal",
    "¿La Vista Esquema muestra todo el contenido organizado jerárquicamente?",
    "No. Muestra SÓLO los títulos. El contenido completo no es visible.",
    "vistas","Vista Esquema", [], ["vista-3"]))
cards.append(card("E-06","error","alta",
    "¿La Vista Preliminar es un botón del Grupo Vistas en la pestaña Vista?",
    "No. La Vista Preliminar se accede desde Archivo → Imprimir. El atajo Ctrl+Alt+I la activa directamente desde cualquier lugar.",
    "vistas","Vista Preliminar", ["age.josenrique","Opostal","Sergio Galán"], ["vista-7"]))
cards.append(card("E-07","error","alta",
    "¿El Modo de lectura solo oculta barras de herramientas y reglas?",
    "No solo eso. Oculta también encabezados y pies de página, además de barras de herramientas, reglas y otros elementos (lista abierta).",
    "vistas","Modo de lectura", ["aulaClic"], ["vista-1"]))

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"vista.json (flashcards): {len(cards)} tarjetas escritas en {OUT_PATH}")
by_type = {}
for c in cards:
    by_type[c["cardType"]] = by_type.get(c["cardType"], 0) + 1
print("Por tipo:", by_type)
ids = [c["cardId"] for c in cards]
assert len(ids) == len(set(ids)), "IDs de flashcard duplicados"
print("IDs únicos: OK")
