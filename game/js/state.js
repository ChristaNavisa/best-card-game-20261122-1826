// Ember Harbor — game state: captains, rounds, turns, combos and scoring.
// Pure rules, no DOM: render.js draws whatever this module returns.

import { buildDeck } from './cards.js';

export const MAX_HULL = 30;
export const HAND_SIZE = 5;
export const START_COINS = 3;

export function newCaptain(name, startCoins = START_COINS) {
  return { name, hull: MAX_HULL, shield: 0, coins: startCoins, deck: [], hand: [], discard: [] };
}

export function createGameState(seed) {
  const random = (() => {
    let a = (seed >>> 0) || 1;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();
  const state = {
    seed,
    round: 1,
    phase: 'title', // title | play | foe | over
    you: newCaptain('You'),
    foe: newCaptain('Captain Vex', START_COINS + 1), // Vex is a veteran: one coin richer
    playedThisTurn: [], // cards you played this turn, in order
    foePlayedThisTurn: [],
    log: [],
    winner: null,
    surgeCount: 0,
    chainCount: 0,
    random,
  };
  state.you.deck = buildDeck(random);
  state.foe.deck = buildDeck(random);
  drawUpTo(state.you);
  drawUpTo(state.foe);
  return state;
}

export function drawUpTo(captain) {
  while (captain.hand.length < HAND_SIZE && captain.deck.length > 0) {
    captain.hand.push(captain.deck.pop());
  }
  if (captain.deck.length === 0 && captain.discard.length > 0) {
    captain.deck = captain.discard;
    captain.discard = [];
  }
}

export function roundIncome(round) {
  return 2 + Math.min(round - 1, 3); // 2,3,4,5,5… — coins stay scarce, every play is a choice
}

export function startRound(state) {
  state.round += 1;
  const income = roundIncome(state.round);
  state.you.coins += income;
  state.foe.coins += income + 1; // veteran's edge: Vex always earns one more coin
  drawUpTo(state.you);
  drawUpTo(state.foe);
  state.playedThisTurn = [];
  state.foePlayedThisTurn = [];
  state.phase = 'play';
  return income;
}

export function canAfford(captain, card) {
  return captain.coins >= card.cost;
}

// Guild Surge: the 2nd card of a guild played in one turn gets +2 to its power.
// Chain: costs 1, then 2, then 3 played in ascending order in one turn draws 1 card.
export function comboBonusFor(state, card) {
  const sameGuild = state.playedThisTurn.filter((c) => c.guild === card.guild).length;
  const surge = sameGuild >= 1 ? 2 : 0;
  const costs = [...state.playedThisTurn.map((c) => c.cost), card.cost];
  const chain = costs.length >= 3 && costs[costs.length - 3] === 1 && costs[costs.length - 2] === 2 && costs[costs.length - 1] === 3;
  return { surge, chain };
}

// "You" takes the base verb form; "Captain Vex" takes the third-person form.
function verbFor(actor, singular, plural) {
  return actor.name === 'You' ? plural : singular;
}

export function applyCardEffect(state, actor, target, card, bonus) {
  const power = card.power + bonus.surge;
  if (card.kind === 'strike') {
    const blocked = Math.min(target.shield, power);
    target.shield -= blocked;
    target.hull = Math.max(0, target.hull - (power - blocked));
    return { text: `${actor.name} play${actor.name === 'You' ? '' : 's'} ${card.name} and hit${actor.name === 'You' ? '' : 's'} ${target.name} for ${power}${blocked ? ` (${blocked} blocked)` : ''}.`, damage: power - blocked };
  }
  if (card.kind === 'bulwark') {
    actor.shield += power;
    return { text: `${actor.name} ${verbFor(actor, 'raises', 'raise')} ${power} shield with ${card.name}.`, damage: 0 };
  }
  if (card.kind === 'coin') {
    actor.coins += power;
    return { text: `${actor.name} ${verbFor(actor, 'mints', 'mint')} ${power} coins with ${card.name}.`, damage: 0 };
  }
  // spyglass: draw `power` cards (capped by deck size).
  let drawn = 0;
  for (let i = 0; i < power && actor.deck.length > 0; i += 1) {
    actor.hand.push(actor.deck.pop());
    drawn += 1;
  }
  return { text: `${actor.name} ${verbFor(actor, 'draws', 'draw')} ${drawn} with ${card.name}.`, damage: 0 };
}

export function playCardFromHand(state, actor, target, cardUid) {
  const index = actor.hand.findIndex((c) => c.uid === cardUid);
  if (index === -1) return null;
  const card = actor.hand[index];
  if (!canAfford(actor, card)) return null;
  actor.coins -= card.cost;
  actor.hand.splice(index, 1);
  actor.discard.push(card);
  const bonus = actor === state.you
    ? comboBonusFor(state, card)
    : { surge: 0, chain: false };
  const result = applyCardEffect(state, actor, target, card, bonus);
  if (actor === state.you) {
    state.playedThisTurn.push(card);
    if (bonus.surge > 0) { state.surgeCount += 1; result.text += ' Guild Surge +2!'; }
    if (bonus.chain) {
      state.chainCount += 1;
      drawUpTo(state.you);
      result.text += ' Chain! Drew a card.';
    }
  } else {
    state.foePlayedThisTurn.push(card);
  }
  state.log.push(result.text);
  if (target.hull <= 0) {
    state.phase = 'over';
    state.winner = actor === state.you ? 'you' : 'foe';
  }
  return { card, result, bonus };
}

export function isGameOver(state) {
  return state.phase === 'over';
}

export function computeScore(state) {
  const hullLeft = state.you.hull;
  const rounds = state.round;
  const surges = state.surgeCount;
  const chains = state.chainCount;
  const total = hullLeft * 10 + state.you.coins * 2 + surges * 15 + chains * 20 + (state.winner === 'you' ? 100 : 0);
  return { hullLeft, rounds, surges, chains, coins: state.you.coins, total };
}
