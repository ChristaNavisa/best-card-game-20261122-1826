# Ember Harbor — Duel of the Four Guilds

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Rank](https://make.fun/badge/best-card-game-20261122-1826/ChristaNavisa/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![Reward](https://make.fun/badge/best-card-game-20261122-1826/ChristaNavisa/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

An original card duel for the [Make the best card game](https://make.fun/bounty/best-card-game-20261122-1826) bounty on make.fun.

## The game

You are the Captain of Ember Harbor. Across the lantern-lit docks sits your
rival, **Captain Vex**. Both captains have 30 Hull and start with 3 Coins.
Each round you earn coins, draw up to 5 cards, and play guild cards from your
hand — then Vex plays his.

- **Four guilds** — Ember (red flame), Tide (blue wave), Gale (green swirl),
  Ore (gold gem). Every suit is told apart by colour *and* shape.
- **Four card kinds** — Strike (damage), Shield (block), Coins (income),
  Spyglass (draw). Every card has a cost and a power, both readable at a glance.
- **Guild Surge** — play two cards of the same guild in one turn and the
  second gets +2 power.
- **Chain** — play costs 1 → 2 → 3 in one turn and you draw a card.
- **A readable rival** — Vex announces his intent each turn ("winds up a
  heavy strike", "patching his hull", "hoarding coins"), so you can counter
  him: shield when he attacks, strike when he defends.
- **Win or lose** — first hull to 0 loses. Your final score counts hull left,
  coins, surges and chains.

## Play it

Serve `game/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts   # http://localhost:8080
```

Click a card to play it (keyboard 1–5 works too), **End Turn** to let Vex
play, **R** to restart. No network requests, no build step.

## Layout

- `game/index.html` — the table, title and end screens
- `game/styles.css` — table, cards, overlays (all art is CSS/SVG)
- `game/js/cards.js` — the four guilds, the card catalog, deck building
- `game/js/state.js` — captains, rounds, combos, scoring (pure rules)
- `game/js/ai.js` — Captain Vex: intent and card choices
- `game/js/render.js` — DOM rendering: cards, meters, log, overlays
- `game/js/input.js` — mouse + keyboard input
- `game/js/sound.js` — tiny synthesized WebAudio bleeps
- `game/js/main.js` — bootstrap and screen flow (`?shot=title|play|win|loss`)
- `main.ts` — the make.fun entrypoint: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
