[![make.fun](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/c/news-image-20261117)
[![rank](https://make.fun/badge/news-image-20261117/Tenguu0/tuesday-world-page/rank.svg)](https://make.fun/c/news-image-20261117)
[![reward](https://make.fun/badge/news-image-20261117/Tenguu0/tuesday-world-page/reward.svg)](https://make.fun/c/news-image-20261117)

# The Tuesday World — Tuesday 17 November 2026

A one-page newspaper front page summing up the world's news of
Tuesday 17 November 2026, drawn entirely in code.

`main.ts` (Node 22, standard library only) draws the page with a
hand-built 5×7 pixel font and writes it to `/output/entry.png`
(1024×1024 PNG, deterministic — every run writes identical bytes).

## The day's news

- **Lead — War in Ukraine:** Ukraine hits the Kerch Bridge; the road
  span to Crimea collapses in an "unprecedented operation",
  Zelenskyy says. Russia confirms the damage and vows to rebuild.
- **Asia:** Trump lands in Manila for the ASEAN summit; a trade pact
  with Thailand is signed.
- **Middle East:** Two tankers are hit by mines in the Strait of
  Hormuz; a third US carrier arrives in the region.
- **Business:** A software bug — not a hack — slows JPMorgan banking
  and Zelle payments for thousands.
- **Technology:** Nvidia reports its first earnings since Jensen
  Huang's exit; the chipmaker adds a security panel.
- **Europe:** Five European states plan a joint return hub in Rwanda
  for rejected asylum seekers.
- **In brief:** Buffett gives $5.47bn in Berkshire shares to family
  foundations; the Pentagon fails its audit for a ninth year; the
  GTA VI hacker pleads guilty; Pattinson is named the next James Bond.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
