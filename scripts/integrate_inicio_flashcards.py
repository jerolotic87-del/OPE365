#!/usr/bin/env python3
"""
One-shot (ago-2026): integra data/flashcards/inicio.json (116 tarjetas nuevas).

  - priority "media" -> "normal" (convención del resto de mazos).
  - questionRefs: remapea los que apuntan al id de origen de una pregunta
    (P-####, gen-atajo-N, 8-N, 1-N, 3-N) al id actual inicio-N vía
    sourceQuestionId. Los que no resuelven (E##, F##, P78/92/94/111 —
    referencias internas del borrador del autor) se descartan: questionRefs
    es un enlace blando, opcional.
  - añade "inicio.json" a data/flashcards/manifest.json en orden de taxonomía.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FC = os.path.join(HERE, "data", "flashcards")
Q = os.path.join(HERE, "data", "questions")


def main():
    inicio_q = json.load(open(os.path.join(Q, "inicio.json"), encoding="utf-8"))
    sq2id = {q["sourceQuestionId"]: q["id"] for q in inicio_q}

    path = os.path.join(FC, "inicio.json")
    cards = json.load(open(path, encoding="utf-8"))

    prio, remapped, dropped = 0, 0, 0
    for c in cards:
        if c.get("priority") == "media":
            c["priority"] = "normal"
            prio += 1
        new_refs = []
        for r in c.get("questionRefs") or []:
            if r in sq2id:
                nid = sq2id[r]
                if nid not in new_refs:
                    new_refs.append(nid)
                remapped += 1
            else:
                dropped += 1
        c["questionRefs"] = new_refs

    json.dump(cards, open(path, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    open(path, "a", encoding="utf-8").write("\n")

    man_path = os.path.join(FC, "manifest.json")
    manifest = json.load(open(man_path, encoding="utf-8"))
    # orden de taxonomía: inicio (3) < revisar (8) < vista (9)
    order = {"inicio.json": 0, "revisar.json": 1, "vista.json": 2}
    if "inicio.json" not in manifest:
        manifest.append("inicio.json")
    manifest = sorted(set(manifest), key=lambda f: order.get(f, 99))
    json.dump(manifest, open(man_path, "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    open(man_path, "a", encoding="utf-8").write("\n")

    print(f"inicio.json: {len(cards)} tarjetas")
    print(f"  priority media->normal: {prio}")
    print(f"  questionRefs remapeados: {remapped}, descartados: {dropped}")
    cards_with_ref = sum(1 for c in cards if c["questionRefs"])
    print(f"  tarjetas con >=1 ref válido: {cards_with_ref}/{len(cards)}")
    print(f"  manifest: {manifest}")


if __name__ == "__main__":
    main()
