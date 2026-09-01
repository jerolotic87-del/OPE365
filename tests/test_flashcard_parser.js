// Prueba jsdom del parser de dorsos de flashcard (renderCardBack):
// para las 220 tarjetas comprueba que al descomponer el dorso en
// Respuesta / Explicación / Atajo y aplicar el formato de lista NO se
// pierde ni se inventa contenido, y que la estructura es válida.
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function read(name){ return fs.readFileSync(path.join(ROOT, name), "utf-8"); }

async function main(){
  const dom = new JSDOM(read("tests/fixture.html"), { runScripts: "dangerously", url: "http://localhost/" });
  const { window: w } = dom;
  ["questions_data.js","taxonomy_data.js","flashcards_data.js","app.js","views.js"].forEach(f=> w.eval(read(f)));
  const O = w.OPE, D = w.document;
  let failures = 0;
  function assert(cond, msg){ if(!cond){ failures++; console.error("FALLO:", msg); } else console.log("OK:", msg); }

  function norm(s){
    return String(s||"").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"")
      .replace(/[·–—]/g," ").replace(/[^a-z0-9ñ]+/gi," ").trim().split(/\s+/).filter(x=>x.length>=2);
  }
  function blockText(el){
    if(!el) return "";
    let s=""; el.querySelectorAll("li,p").forEach(n=> s+=" "+n.textContent);
    return s || el.textContent;
  }
  function click(v){ const b=D.createElement("button"); b.setAttribute("data-goto",v); D.body.appendChild(b); b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); b.remove(); }

  click("flashcards");
  D.querySelector('.segmented .seg[data-tab="todas"]').click();
  const items = D.querySelectorAll(".qlist-item");
  assert(items.length === O.FLASHCARDS.length, `la pestaña "Todas" lista las ${O.FLASHCARDS.length} tarjetas`);
  items[0].click();

  let contentIssues = 0, structIssues = 0, split = 0, withAtajo = 0;
  for(let i=0;i<O.FLASHCARDS.length;i++){
    const idx = Number(D.querySelector(".pos").textContent.split("/")[0].trim()) - 1;
    const c = O.FLASHCARDS[idx];
    D.querySelector("#fc-card").click(); // revelar
    const fb = D.querySelector(".fb-text");
    const rEl = fb.querySelector(".ans-r"), eEl = fb.querySelector(".ans-e"), aEl = fb.querySelector(".ans-kbd");

    if(!rEl || !rEl.textContent.trim()) structIssues++;
    if(eEl && !eEl.textContent.trim()) structIssues++;
    if(/undefined|null|NaN|\[object|&lt;script/i.test(fb.textContent)) structIssues++;
    if(eEl) split++;
    if(aEl) withAtajo++;

    const wo = norm(c.back);
    const wr = norm(blockText(rEl) + " " + blockText(eEl) + " " + (aEl ? aEl.textContent : ""));
    const sr = new Set(wr), so = new Set(wo);
    const lost = [...new Set(wo.filter(x=>!sr.has(x)))].filter(x=> x!=="atajo" && x!=="atajos");
    const added = [...new Set(wr.filter(x=>!so.has(x)))];
    if(lost.length || added.length){
      contentIssues++;
      console.error(`  [${c.section}:${c.cardId}] perdidas=${lost} añadidas=${added}\n     ${JSON.stringify(c.back.slice(0,150))}`);
    }

    const next = D.querySelector("#fc-next");
    if(next && !/Terminar/.test(next.textContent)) next.click(); else break;
  }

  assert(contentIssues === 0, `ninguna de las ${O.FLASHCARDS.length} flashcards pierde ni inventa contenido al parsear el dorso`);
  assert(structIssues === 0, "ningún dorso queda con R vacía, E vacía o tokens rotos");
  console.log(`(${split} tarjetas con Explicación aparte, ${withAtajo} con Atajo destacado)`);

  if(failures > 0){ console.error(`\n${failures} fallo(s).`); process.exit(1); }
  console.log("\nTodas las pruebas del parser de flashcards pasaron.");
}

main().catch(e=>{ console.error(e); process.exit(1); });
