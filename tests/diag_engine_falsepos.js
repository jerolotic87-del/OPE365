/* Diagnóstico puntual: qué conceptos salen 'asentado + futuro' con fuerza real
   baja en el escenario 6 del motor, y de qué sección son. No es parte de la
   suite; se usa para decidir si una desviación es real o es la deriva
   documentada del banco. */
const { loadEngine, makeUser, simulate } = require("./sim");
(async ()=>{
const env = await loadEngine();
const rw = simulate(env, makeUser({ competence:0.2, forgetRate:0.1, minutesPerDay:20, examInDays:null, seed:303 }), 90);
const fp = rw.concepts.filter(c => c.mastery === "asentado" && c.review === "futuro" && c.trueStrength < 0.35);
console.log("conceptos totales:", rw.concepts.length);
console.log("falsos positivos:", fp.length);
fp.forEach(c => console.log("  -", c.id, "| fuerza real", c.trueStrength.toFixed(3),
  "| reps", c.correctReps, "| framings", c.framings, "| interval", (c.interval||0).toFixed(1)));
const asent = rw.concepts.filter(c => c.mastery === "asentado");
console.log("asentados:", asent.length);
const porSec = {};
asent.forEach(c => { const s = String(c.id).split(":")[0]; porSec[s] = (porSec[s]||0)+1; });
console.log("asentados por sección:", porSec);
})();
