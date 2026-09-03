# -*- coding: utf-8 -*-
"""One-shot: integra 13 ejercicios de Archivo > Opciones > Barra de
herramientas de acceso rápido (verificados por el usuario con aulaClic,
vence.es y Microsoft Support ES). Se añaden a data/questions/archivo.json
renumerando la cola. Ejecutar una vez y luego `python build_data.py`."""
import json, io, sys

PATH = "data/questions/archivo.json"
d = json.load(io.open(PATH, encoding="utf-8"))
nums = [int(q["id"].split("-")[1]) for q in d if q["id"].startswith("archivo-")]
start = max(nums) + 1

RUTA = "Archivo → Opciones → Barra de herramientas de acceso rápido"

items = [
 # 1 — filtro "Comandos disponibles en"
 dict(
  e="Quieres añadir a la barra de acceso rápido un comando concreto de la pestaña Insertar, pero la lista que ves es muy corta y no aparece. ¿Cómo filtras la lista para ver solo los comandos de esa pestaña?",
  o=["Comandos disponibles en ▸ Pestaña Insertar",
     "Comandos disponibles en ▸ Comandos más utilizados",
     "Comandos disponibles en ▸ Comandos que no están en la cinta de opciones",
     "Comandos disponibles en ▸ Todos los comandos"],
  r="A",
  x=RUTA + " → desplegable «Comandos disponibles en» → Pestaña Insertar. El desplegable también ofrece Todos los comandos, Comandos que no están en la cinta, Macros y cada pestaña de la cinta por separado."),
 # 2 — botón Agregar >>
 dict(
  e="Usas constantemente el comando Impresión rápida y quieres tenerlo siempre visible arriba. Ya lo tienes seleccionado en la lista de la izquierda. ¿Qué botón lo lleva a la barra?",
  o=["Botón Agregar >>",
     "Botón Modificar...",
     "Flecha Subir",
     "Botón << Quitar"],
  r="A",
  x=RUTA + " → seleccionar el comando → Agregar >>. El comando se coloca siempre en última posición (a la derecha) y se reordena con las flechas Subir/Bajar. Alternativa rápida: clic derecho sobre el comando en la cinta → Agregar a la barra de herramientas de acceso rápido."),
 # 3 — botón << Quitar
 dict(
  e="Tienes en la barra de acceso rápido comandos que ya no usas y quieres eliminarlos desde el cuadro de Opciones. ¿Qué botón usas tras seleccionarlos en la lista de la derecha?",
  o=["Botón << Quitar",
     "Botón Modificar...",
     "Restablecer ▸ Restablecer solo la barra de herramientas de acceso rápido",
     "Importar o exportar... ▸ Importar archivo de personalización"],
  r="A",
  x=RUTA + " → seleccionar el comando en la lista derecha → << Quitar. Alternativa rápida: clic derecho sobre el comando en la propia barra → Eliminar de la barra de herramientas de acceso rápido."),
 # 4 — separador
 dict(
  e="Quieres separar visualmente dos grupos de comandos dentro de tu barra de acceso rápido. ¿Cómo lo haces?",
  o=["Seleccionar <Separador> en la lista de comandos disponibles y pulsar Agregar >>",
     "Comandos disponibles en ▸ Comandos que no están en la cinta ▸ Separador",
     "Botón Modificar... ▸ Insertar separador",
     "Clic derecho en la barra ▸ Agregar separador"],
  r="A",
  x=RUTA + " → seleccionar <Separador> (está al principio de la lista de comandos disponibles) → Agregar >>. Se puede añadir varias veces y reordenar con las flechas Subir/Bajar."),
 # 5 — agregar macro
 dict(
  e="Has grabado una macro propia y quieres ejecutarla con un solo clic desde la barra de acceso rápido. ¿Cómo la añades?",
  o=["Comandos disponibles en ▸ Macros ▸ seleccionar la macro ▸ Agregar >>",
     "Comandos disponibles en ▸ Todos los comandos ▸ Macros",
     "Comandos disponibles en ▸ Comandos que no están en la cinta ▸ Macros",
     "Botón Modificar... ▸ Nueva macro"],
  r="A",
  x=RUTA + " → Comandos disponibles en → Macros → seleccionar la macro → Agregar >>. Después puedes usar Modificar... para cambiar su nombre visible y asignarle un icono."),
 # 6 — Modificar...
 dict(
  e="Has añadido una macro a la barra pero aparece con un nombre técnico largo y un icono genérico. ¿Cómo cambias su nombre visible y su icono?",
  o=["Seleccionar el elemento en la lista de la derecha → botón Modificar...",
     "Doble clic sobre el comando en la barra",
     "Restablecer ▸ Restablecer solo la barra de herramientas de acceso rápido",
     "Comandos disponibles en ▸ Macros ▸ Cambiar nombre"],
  r="A",
  x=RUTA + " → seleccionar el elemento en la lista derecha → Modificar... El botón Modificar... solo está disponible para comandos que admiten cambio de icono, principalmente macros y algunos comandos personalizados."),
 # 7 — todos los documentos / documento actual
 dict(
  e="Quieres añadir un comando a la barra de acceso rápido pero que solo aparezca cuando trabajes en el documento actual, no en todos. ¿Dónde lo configuras?",
  o=["Desplegable «Personalizar barra de herramientas de acceso rápido» ▸ Para [nombre del documento]",
     "Desplegable «Personalizar barra de herramientas de acceso rápido» ▸ Para todos los documentos (predeterminado)",
     "Comandos disponibles en ▸ este documento",
     "Importar o exportar... ▸ Guardar en el documento"],
  r="A",
  x=RUTA + " → desplegable «Personalizar barra de herramientas de acceso rápido» → Para [nombre del documento]. Por defecto está «Para todos los documentos (predeterminado)»; si eliges el documento actual, la personalización se guarda dentro de ese archivo."),
 # 8 — mostrar / ocultar la barra
 dict(
  e="No ves la barra de herramientas de acceso rápido en la ventana y quieres recuperarla desde el cuadro de Opciones. ¿Qué casilla activas?",
  o=["Casilla «Mostrar la Barra de herramientas de acceso rápido»",
     "Casilla «Mostrar siempre los comandos y etiquetas»",
     "Posición de la barra de herramientas ▸ Encima de la cinta de opciones",
     "Restablecer ▸ Restablecer solo la barra de herramientas de acceso rápido"],
  r="A",
  x=RUTA + " → casilla «Mostrar la Barra de herramientas de acceso rápido». Alternativa: flecha desplegable «Opciones de presentación de la cinta de opciones» → Mostrar barra de herramientas de acceso rápido."),
 # 9 — posición encima / debajo
 dict(
  e="Quieres colocar la barra de acceso rápido debajo de la cinta de opciones, más cerca del documento. ¿Dónde lo cambias desde Opciones?",
  o=["Posición de la barra de herramientas ▸ Debajo de la cinta de opciones",
     "Casilla «Mostrar la Barra de herramientas de acceso rápido»",
     "Casilla «Mostrar siempre los comandos y etiquetas»",
     "Desplegable «Personalizar barra...» ▸ Para todos los documentos"],
  r="A",
  x=RUTA + " → «Posición de la barra de herramientas» → Debajo de la cinta de opciones. Alternativa: flecha desplegable al final de la barra → Mostrar debajo de la cinta / Mostrar encima de la cinta."),
 # 10 — mostrar comandos y etiquetas
 dict(
  e="Quieres que junto a cada icono de la barra de acceso rápido aparezca también el texto con el nombre del comando, no solo el icono. ¿Dónde lo activas?",
  o=["Casilla «Mostrar siempre los comandos y etiquetas»",
     "Casilla «Mostrar la Barra de herramientas de acceso rápido»",
     "Botón Modificar... ▸ Mostrar etiqueta",
     "Posición de la barra de herramientas ▸ Debajo de la cinta de opciones"],
  r="A",
  x=RUTA + " → casilla «Mostrar siempre los comandos y etiquetas». Sin alternativa por menú contextual: solo desde el cuadro de Opciones."),
 # 11 — restablecer
 dict(
  e="Has llenado la barra de acceso rápido de comandos y quieres dejarla como venía de fábrica, sin tocar la personalización de la cinta. ¿Qué eliges?",
  o=["Restablecer ▸ Restablecer solo la barra de herramientas de acceso rápido",
     "Restablecer ▸ Restablecer todas las personalizaciones",
     "Importar o exportar... ▸ Importar archivo de personalización",
     "<< Quitar cada comando uno por uno"],
  r="A",
  x=RUTA + " → Restablecer → Restablecer solo la barra de herramientas de acceso rápido. Deja los botones predeterminados: Guardar automáticamente, Guardar, Deshacer, Rehacer y Personalizar. «Restablecer todas las personalizaciones» también revierte la cinta de opciones."),
 # 12 — exportar
 dict(
  e="Has configurado la barra de acceso rápido a tu gusto y quieres guardar esa configuración para trasladarla a otro equipo. ¿Cómo la exportas?",
  o=["Importar o exportar... ▸ Exportar todas las personalizaciones",
     "Importar o exportar... ▸ Importar archivo de personalización",
     "Restablecer ▸ Restablecer todas las personalizaciones",
     "Desplegable «Personalizar barra...» ▸ Para todos los documentos"],
  r="A",
  x=RUTA + " → Importar o exportar... → Exportar todas las personalizaciones. El archivo exportado incluye también las personalizaciones de la cinta de opciones, no solo las de la barra de acceso rápido."),
 # 13 — importar
 dict(
  e="Dispones de un archivo de personalización con la configuración estándar de tu organización y quieres aplicarlo. ¿Cómo lo importas?",
  o=["Importar o exportar... ▸ Importar archivo de personalización",
     "Importar o exportar... ▸ Exportar todas las personalizaciones",
     "Restablecer ▸ Restablecer solo la barra de herramientas de acceso rápido",
     "Comandos disponibles en ▸ Todos los comandos"],
  r="A",
  x=RUTA + " → Importar o exportar... → Importar archivo de personalización. Al importar se pierden todas las personalizaciones anteriores, tanto de la barra como de la cinta; conviene exportar la configuración actual antes."),
]

assert len(items) == 13
new = []
for i, it in enumerate(items):
    n = start + i
    new.append({
        "id": f"archivo-{n}",
        "sourceFile": "archivo.json",
        "bloque": "Archivo — Opciones",
        "tipo": "opcion_unica",
        "categoria": "ruta",
        "negativa": False,
        "section": "archivo",
        "topic": "opciones-personalizar",
        "subtopic": "Barra de herramientas de acceso rápido",
        "tema": "Opciones",
        "sourceQuestionId": f"opc-bar-{i+1:02d}",
        "generado": True,
        "enunciado": it["e"],
        "opciones": [{"letter": L, "text": t} for L, t in zip("ABCD", it["o"])],
        "matching": None,
        "respuesta": it["r"],
        "explicacion": it["x"],
    })

d.extend(new)
json.dump(d, io.open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
sys.stdout.buffer.write((f"añadidas {len(new)}: archivo-{start}..archivo-{start+len(new)-1}\n").encode("utf-8"))
