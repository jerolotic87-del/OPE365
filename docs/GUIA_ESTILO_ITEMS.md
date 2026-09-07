# Guía de estilo de ítems — OPE365

Norma del proyecto para redactar y reformular preguntas. **Se aplica a
todas**, no a una muestra. Fijada por el usuario (sep-2026).

Objetivo: ítems contextualizados que evalúen conocimiento real y **no se
resuelvan por descarte lingüístico**.

---

## 1. El enunciado sitúa en una situación concreta

Nunca «¿Qué es…?» o «¿Qué hace…?» en abstracto. Siempre una situación de
partida: *«tienes un documento abierto»*, *«estás en la Vista Backstage»*,
*«has abierto el cuadro Guardar como»*.

## 2. Los distractores — LA REGLA QUE MÁS SE INCUMPLE

Un distractor es **una opción que responde creíblemente a ESA pregunta
concreta**. No basta con que pertenezca a la misma pestaña o al mismo grupo
de la cinta: eso es lo que produce ítems de risa.

> ❌ «¿Qué comando pega el contenido del portapapeles?» → Pegar · Copiar ·
> Cortar · Copiar formato.
> Cualquiera que sepa leer marca «Pegar»: el enunciado ya dice *pegar*.

> ✅ «Has copiado texto con formato y quieres pegarlo sin arrastrar el
> formato de origen.» → Mantener solo texto · Combinar formato ·
> Mantener formato de origen · Pegar como texto sin formato.
> Las cuatro pegan. Hay que saber cuál hace exactamente eso.

**Se pueden inventar distractores.** Un nombre de comando, de opción o de
cuadro que no existe pero que suena tan real como el verdadero es un
distractor excelente, y es preferible a una opción real pero descartable de
un vistazo. La explicación deja claro que no existe.

**Lo que NUNCA se inventa es un hecho afirmado como cierto**: la respuesta
correcta, un atajo, una cifra, una ruta, y todo lo que diga la explicación.
Ahí está la línea. Un distractor falso es un buen ejercicio; un hecho falso
hace la pregunta impugnable.

El listón: *distractores tan parecidos a la correcta que el propio creador
de Word dudaría*.

## 3. La palabra clave del enunciado va en TODAS las opciones

Si se pregunta por una ruta, las cuatro son rutas. Si se pregunta por un
cuadro de diálogo, las cuatro parten del mismo menú. Nada de resolver por
descarte visual.

## 4. Longitud similar

Ninguna opción destaca por ser más larga o más elaborada. La correcta no
puede ser «la que más explica».

## 5. Ni una sola opción absurda

Verosímil siempre. Una opción que nadie marcaría no es un distractor: es
relleno que convierte una pregunta de 4 en una de 3.

## 6. La explicación

Siempre: (a) justifica la correcta, (b) **desmonta cada distractor uno por
uno**, (c) señala el par más confuso. Si un distractor es inventado, se dice
(«no existe tal opción»).

---

## Fuentes (jerarquía, sep-2026)

- **Atajos de teclado**: `data/atajos_word365_v2608.md` (volcado de la
  instalación real del usuario) + sus pruebas en vivo. **Nada más.** Donde
  discrepen, gana la prueba en vivo y la explicación lleva `⚠️ Ojo: …`.
- **Rutas y cuadros de diálogo**: `data/rutas/*.txt` y
  `data/imagenes_rutas/` (volcados y capturas del usuario).
- **Funciones, definiciones y comportamiento oficial**:
  `support.microsoft.com` **sí** vale — es la fuente oficial de lo que hace
  cada función. **Nunca para atajos** (mezcla esquemas de teclado y da
  combinaciones que en esta instalación no funcionan).
- **Academias y tests** (aulaclic, josenrique.es, daypo…): para redactar
  enunciados claros y no ambiguos, y para detectar qué se pregunta de
  verdad en oposición. Nunca como autoridad de atajos.
- **El banco NO cita fuentes.** Ni en enunciados ni en explicaciones. Un
  dato verificado en vivo se marca «Prueba en vivo del usuario»; el resto
  se enuncia sin coletillas.

## Ambigüedad

Una pregunta con dos respuestas defendibles está mal aunque los
distractores sean buenos. Antes de dar un ítem por terminado: ¿puede
alguien argumentar otra opción? Casos ya corregidos por esto:
`insertar-170`, `inicio-25`, `archivo-4`.

## Cómo se aplica

A mano, ítem por ítem. **Ningún script genera contenido**: se escribe cada
enunciado, cada opción y cada explicación, y solo se usa una herramienta
para volcar al JSON lo ya escrito.
