// Ember Harbor — Captain Vex, the opponent AI.
// Vex's plan is readable on purpose: the intent banner always says what he will
// try to do, so the player can counter it (shield up when he winds up a big hit).

import { canAfford } from './state.js';

export function describeIntent(plan) {
  if (plan === 'attack') return 'Vex winds up a heavy strike — shield up or sink him first!';
  if (plan === 'defend') return 'Vex is patching his hull — now is the time to hit hard.';
  if (plan === 'hoard') return 'Vex is hoarding coins for a big play next round.';
  return 'Vex is sizing you up…';
}

export function choosePlan(state) {
  const foe = state.foe;
  const you = state.you;
  if (foe.hull <= 10) return 'defend';
  if (you.hull <= 12) return 'attack';
  if (foe.coins >= 7) return 'attack';
  if (foe.hand.some((c) => c.kind === 'coin') && foe.coins <= 2) return 'hoard';
  return 'attack';
}

// Pick the best card for the plan: highest value first, cheapest tie-break.
export function pickCardForPlan(state, plan) {
  const affordable = state.foe.hand.filter((c) => canAfford(state.foe, c));
  if (affordable.length === 0) return null;
  const wanted = plan === 'defend' ? ['bulwark', 'strike'] : plan === 'hoard' ? ['coin', 'spyglass'] : ['strike', 'coin', 'spyglass', 'bulwark'];
  for (const kind of wanted) {
    const ofKind = affordable.filter((c) => c.kind === kind);
    if (ofKind.length > 0) {
      return ofKind.sort((a, b) => b.power - a.power || a.cost - b.cost)[0];
    }
  }
  return affordable[0];
}

// Vex plays while he has coins and useful cards, then stops. Returns the cards played.
export function takeFoeTurn(state, playOne) {
  const plan = choosePlan(state);
  const played = [];
  let guard = 0;
  while (guard < 6) {
    guard += 1;
    const card = pickCardForPlan(state, plan);
    if (!card) break;
    // Vex stops early when the plan is done: defending stops at 8+ shield, hoarding at 8+ coins.
    if (plan === 'defend' && state.foe.shield >= 8 && card.kind === 'bulwark') break;
    if (plan === 'hoard' && state.foe.coins >= 8 && card.kind === 'coin') break;
    const outcome = playOne(card.uid);
    if (!outcome) break;
    played.push(outcome.card);
    if (state.phase === 'over') break;
  }
  return { plan, played };
}
