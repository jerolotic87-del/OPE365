# -*- coding: utf-8 -*-
"""One-shot: 13 ejercicios de Archivo > Opciones > Centro de confianza >
Configuración del Centro de confianza... (secciones del diálogo).
Verificados por el usuario con aulaClic + educa.jcyl.es (conceptos) y
Microsoft Support ES (definiciones). Sin atajos.

Se OMITE el nº 1 del usuario ("acceder al Centro de confianza") por ser
duplicado de archivo-112 (ya pregunta por el botón "Configuración del
Centro de confianza..."). Se conserva su numeración: #2 -> opc-tc-02.

Ejecutar una vez + `python build_data.py`."""
import json, io, sys

PATH = "data/questions/archivo.json"
d = json.load(io.open(PATH, encoding="utf-8"))
start = max(int(q["id"].split("-")[1]) for q in d if q["id"].startswith("archivo-")) + 1

TC = "Configuración del Centro de confianza... ▸ "
RUTA = "Archivo → Opciones → Centro de confianza → Configuración del Centro de confianza… → "

items = [
 (2, "Has instalado complementos y macros firmados digitalmente por un proveedor concreto y quieres que Word confíe siempre en ese editor sin volver a preguntarte. ¿Dónde gestionas la lista?",
  "Editores de confianza", ["Ubicaciones de confianza", "Documentos confiables", "Catálogos de complementos de confianza"],
  RUTA + "Editores de confianza. Guarda los certificados de los editores en los que has decidido confiar; su contenido firmado se habilita sin avisos."),
 (3, "Guardas tus documentos con macros en una carpeta concreta y quieres que Word los abra sin advertencias de seguridad por confiar en esa ubicación. ¿Dónde añades esa carpeta?",
  "Ubicaciones de confianza", ["Editores de confianza", "Documentos confiables", "Configuración de bloqueo de archivos"],
  RUTA + "Ubicaciones de confianza. Los archivos abiertos desde una ubicación de confianza se abren sin pasar por la Vista protegida ni pedir habilitar macros."),
 (4, "Habilitaste el contenido de varios documentos concretos y ahora quieres borrar esa confianza para que Word vuelva a preguntar. ¿Dónde lo restableces?",
  "Documentos confiables", ["Ubicaciones de confianza", "Editores de confianza", "Vista protegida"],
  RUTA + "Documentos confiables. Incluye el botón Borrar para restablecer todos los documentos confiables y una casilla para deshabilitar la confianza en documentos de la red."),
 (5, "Tu organización usa un catálogo interno de complementos web y quieres registrarlo como fuente de confianza. ¿Dónde lo añades?",
  "Catálogos de complementos de confianza", ["Complementos", "Editores de confianza", "Ubicaciones de confianza"],
  RUTA + "Catálogos de complementos de confianza. Registra las URL de catálogos de complementos web (add-ins de Office) que tu organización considera seguros."),
 (6, "Por política de seguridad quieres exigir que todos los complementos de aplicación estén firmados por un editor de confianza, o deshabilitarlos todos. ¿Dónde lo configuras?",
  "Complementos", ["Configuración de ActiveX", "Catálogos de complementos de confianza", "Archivo → Opciones → Complementos"],
  RUTA + "Complementos. Es la sección de SEGURIDAD de complementos (exigir firma, deshabilitar todos, modo de aplicación); no se confunde con la categoría «Complementos» del cuadro Opciones, que solo lista los instalados."),
 (7, "Abres documentos con controles ActiveX y quieres controlar si se habilitan, se piden o se bloquean por seguridad. ¿Dónde lo configuras?",
  "Configuración de ActiveX", ["Configuración de macros", "Complementos", "Barra de mensajes"],
  RUTA + "Configuración de ActiveX. Define cómo se cargan los controles ActiveX de los documentos (deshabilitar, preguntar, habilitar con restricciones)."),
 (8, "Al abrir un documento con macros Word las bloquea automáticamente y quieres que en su lugar te avise antes de habilitarlas. ¿Dónde cambias el nivel de seguridad de las macros?",
  "Configuración de macros", ["Configuración de ActiveX", "Editores de confianza", "Vista protegida"],
  RUTA + "Configuración de macros. La opción recomendada y predeterminada es «Deshabilitar las macros VBA con notificación»: bloquea las macros pero avisa para poder habilitarlas manualmente."),
 (9, "Descargas documentos de internet o los recibes por correo y quieres controlar si Word los abre en modo de solo lectura protegido antes de permitir editarlos. ¿Dónde configuras la Vista protegida?",
  "Vista protegida", ["Configuración de bloqueo de archivos", "Barra de mensajes", "Ubicaciones de confianza"],
  RUTA + "Vista protegida. Abre en modo aislado los archivos procedentes de internet, de ubicaciones potencialmente peligrosas o adjuntos de Outlook."),
 (10, "Quieres impedir que Word abra o guarde ciertos formatos antiguos o potencialmente peligrosos, como versiones muy antiguas de .doc. ¿Dónde lo configuras?",
  "Configuración de bloqueo de archivos", ["Vista protegida", "Configuración de macros", "Contenido externo"],
  RUTA + "Configuración de bloqueo de archivos. Permite marcar por tipo de formato si se bloquea al abrir, al guardar o ambos (y si el bloqueado se abre en Vista protegida)."),
 (11, "Quieres controlar si Word muestra la barra de advertencia amarilla en la parte superior cuando bloquea contenido activo como macros o controles. ¿Dónde lo configuras?",
  "Barra de mensajes", ["Vista protegida", "Configuración de macros", "Configuración de ActiveX"],
  RUTA + "Barra de mensajes. Elige entre mostrar la barra de mensajes cuando se bloquea contenido activo o no mostrarla nunca."),
 (12, "Quieres controlar cuándo Word avisa si otro programa intenta acceder a él mediante programación para enviar documentos, por seguridad frente a virus de macros. ¿Dónde lo configuras?",
  "Acceso mediante programación", ["Configuración de macros", "Configuración de formularios", "Barra de mensajes"],
  RUTA + "Acceso mediante programación. Controla el aviso cuando otra aplicación accede al modelo de objetos de Word (avisar según la configuración de macros, avisar siempre o no avisar nunca)."),
 (13, "Quieres revisar y ajustar qué datos comparte Word con Microsoft y gestionar las experiencias conectadas desde el Centro de confianza. ¿Dónde accedes?",
  "Opciones de privacidad", ["Archivo → Opciones → General → Configuración de privacidad", "Barra de mensajes", "Editores de confianza"],
  RUTA + "Opciones de privacidad. Está relacionada con Archivo → Opciones → General → Configuración de privacidad: ambas gestionan las experiencias conectadas y el envío de datos de diagnóstico."),
 (14, "Quieres controlar cómo se comporta Word ante solicitudes de inicio de sesión basadas en formularios de servidores externos. ¿Dónde lo configuras?",
  "Configuración de formularios", ["Acceso mediante programación", "Configuración de ActiveX", "Barra de mensajes"],
  RUTA + "Configuración de formularios (Form-based Sign-in). Define si Word permite, pregunta o bloquea las solicitudes de inicio de sesión mediante formularios web de sitios externos."),
]
assert len(items) == 13

def opt_text(s):
    return s if s.startswith("Archivo →") else TC + s

new = []
for i, (n, e, correct, distractors, x) in enumerate(items):
    opts = [correct] + distractors
    # correcta siempre A (consistente con el bloque opc-*)
    new.append({
        "id": f"archivo-{start+i}",
        "sourceFile": "archivo.json",
        "bloque": "Archivo — Opciones",
        "tipo": "opcion_unica",
        "categoria": "ruta",
        "negativa": False,
        "section": "archivo",
        "topic": "opciones-complementos",
        "subtopic": "Centro de confianza",
        "tema": "Opciones",
        "sourceQuestionId": f"opc-tc-{n:02d}",
        "generado": True,
        "enunciado": e,
        "opciones": [{"letter": L, "text": opt_text(t)} for L, t in zip("ABCD", opts)],
        "matching": None,
        "respuesta": "A",
        "explicacion": x,
    })

d.extend(new)
json.dump(d, io.open(PATH, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
sys.stdout.buffer.write(f"añadidas {len(new)}: archivo-{start}..archivo-{start+len(new)-1}\n".encode("utf-8"))
