#!/usr/bin/env python3
"""
One-shot (ago-2026): corrige explicaciones sobre atajos de cierre según la
prueba en vivo del usuario en su Word 365 español de España (nivel 1 de la
regla de oro):

  Ctrl+R          -> sin ninguna acción asignada
  Ctrl+W          -> quita el formato de párrafo (NO cierra el documento)
  Ctrl+F4         -> cierra el documento activo, sin cerrar Word
  Alt+F4          -> cierra los documentos abiertos uno a uno; con uno solo,
                     al volver a pulsarlo cierra Word
  Ctrl+Mayús+S    -> aplica subrayado
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q = os.path.join(HERE, "data", "questions")

FIXES = {
    # sourceQuestionId -> (fichero, nueva explicacion)
    "8-5": ("archivo.json",
            "Ctrl+U crea un nuevo documento en la versión española. Ctrl+N "
            "aplica negrita. Ctrl+O no tiene función asignada para nuevo "
            "documento. Ctrl+W quita el formato de párrafo, no crea ni cierra "
            "documentos."),
    "8-50": ("archivo.json",
             "Ctrl+F4 cierra el documento activo manteniendo Word abierto. "
             "Alt+F4 va cerrando los documentos abiertos uno a uno y, cuando "
             "solo queda uno, al volver a pulsarlo cierra Word. Ctrl+Q no "
             "tiene función de cierre. Ctrl+Mayús+F4 no existe como atajo de "
             "cierre."),
    "8-106": ("archivo.json",
              "Alt+F4 es el único que llega a cerrar Word: primero cierra los "
              "documentos abiertos uno a uno y, cuando solo queda uno, al "
              "pulsarlo de nuevo cierra el programa. Ctrl+F4 cierra solo el "
              "documento activo. Ctrl+W quita el formato de párrafo (no cierra "
              "nada). Ctrl+R no tiene ninguna acción asignada en la versión "
              "española."),
    "8-316": ("inicio.json",
              "Ctrl+Mayús+W abre el panel Aplicar estilos. Ctrl+W quita el "
              "formato de párrafo. Alt+Mayús+W no tiene función asignada para "
              "abrir el panel de estilos. Alt+Ctrl+W divide la ventana."),
    "8-319": ("inicio.json",
              "Mayús+F4 repite la última búsqueda en el documento. F4 repite "
              "la última acción o comando. Ctrl+F4 cierra el documento activo, "
              "sin cerrar Word. Alt+F4 acaba cerrando Word: cierra los "
              "documentos abiertos uno a uno."),
}


def main():
    by_file = {}
    for sqid, (fn, _) in FIXES.items():
        by_file.setdefault(fn, [])
    for fn in by_file:
        path = os.path.join(Q, fn)
        data = json.load(open(path, encoding="utf-8"))
        idx = {q.get("sourceQuestionId"): q for q in data}
        changed = 0
        for sqid, (f2, new_exp) in FIXES.items():
            if f2 != fn:
                continue
            q = idx.get(sqid)
            if q is None:
                raise SystemExit(f"no encontrada {sqid} en {fn}")
            if q["explicacion"] != new_exp:
                q["explicacion"] = new_exp
                changed += 1
                print(f"  {q['id']} ({sqid}) actualizada")
        json.dump(data, open(path, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        open(path, "a", encoding="utf-8").write("\n")
        print(f"{fn}: {changed} cambios")


if __name__ == "__main__":
    main()
