#!/usr/bin/env python3
"""
Empaqueta los archivos sueltos de esta carpeta en un único HTML autónomo
(sin dependencias externas salvo la señalización de PeerJS en tiempo de
ejecución, que necesita internet solo para el multijugador en vivo).

Uso:
    python3 build.py
Genera: OPE365_Word365_Estudio.html en esta misma carpeta.

Ejecuta esto después de editar app.js, views.js, multiplayer.js o
styles.css, si quieres un único archivo para compartir (por ejemplo,
mandárselo a alguien que no vaya a clonar la carpeta).

Si lo que has editado es contenido de preguntas o taxonomía (cualquier
cosa bajo data/), ejecuta antes `python3 build_data.py` para regenerar
questions_all.json, questions_data.js y taxonomy_data.js — build.py lee
esos artefactos generados, no data/ directamente.
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return f.read()

ICONS_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
ICONS_SETTINGS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.2.4.6.7 1 .7H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'

def main():
    data_raw = read("questions_all.json").replace("</script", "<\\/script")
    taxonomy_raw = read("taxonomy_data.js")
    css = read("styles.css")
    app_js = read("app.js")
    mp_js = read("multiplayer.js")
    views_js = read("views.js")
    peerjs_js = read("peerjs.min.js")

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="color-scheme" content="dark">
<title>OPE365 · Estudio Word 365 para oposiciones</title>
<meta name="description" content="Plataforma de estudio, tests, desafios, duelo en vivo y farol para el temario de Word 365 de la oposicion.">
<style>
{css}
</style>
</head>
<body>
<div id="app">
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand"><span class="dot"></span>OPE365</div>
      <nav class="primary-nav" id="primary-nav" role="tablist" aria-label="Navegacion principal"></nav>
      <div class="topbar-actions">
        <button class="icon-btn" id="search-btn" aria-label="Buscar" title="Buscar">{ICONS_SEARCH}</button>
        <button class="icon-btn" id="settings-btn" aria-label="Ajustes y diagnostico" title="Ajustes">{ICONS_SETTINGS}</button>
      </div>
    </div>
  </header>
  <main id="main-view"></main>
  <nav class="bottom-nav" id="bottom-nav" aria-label="Navegacion principal"></nav>
</div>
<div class="toast" id="toast"></div>

<script>
window.__OPE365_DATA__ = {data_raw};
</script>
<script>
{taxonomy_raw}
</script>
<script>
{app_js}
</script>
<script>
{peerjs_js}
</script>
<script>
{mp_js}
</script>
<script>
{views_js}
</script>
</body>
</html>
"""
    out_path = os.path.join(HERE, "OPE365_Word365_Estudio.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Escrito: {out_path} ({os.path.getsize(out_path):,} bytes)")

if __name__ == "__main__":
    main()
