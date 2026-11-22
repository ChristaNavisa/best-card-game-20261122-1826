// Ember Harbor — bootstrap and screen flow.
// Owns the game loop: title -> play -> foe turn -> next round -> victory/defeat.
// ?shot=title|play|win|loss&seed=N jumps to a deterministic state for screenshots:
// the states are the game's real states, reached with a fixed seed.

import { createGameState, startRound, playCardFromHand, isGameOver } from './state.js';
import { describeIntent, takeFoeTurn } from './ai.js';
import * as render from './render.js';
import { bindGameInput } from './input.js';
import { ensureAudio, playTone } from './sound.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7');

let state = createGameState(seed);

function refresh() {
  render.renderMeters(state);
  render.renderHands(state, handlePlayCard);
  render.renderLog(state);
  document.getElementById('endTurnBtn').disabled = state.phase !== 'play';
}

function handlePlayCard(uid) {
  if (state.phase !== 'play') return;
  ensureAudio();
  const outcome = playCardFromHand(state, state.you, state.foe, uid);
  if (!outcome) return; // unaffordable or not in hand
  playTone(outcome.bonus.surge > 0 || outcome.bonus.chain ? 'surge' : 'play');
  if (outcome.bonus.surge > 0) render.showComboBanner('⚡ GUILD SURGE +2!');
  if (outcome.bonus.chain) render.showComboBanner('⛓ CHAIN! DRAW 1');
  render.showPlayedCards(state.playedThisTurn);
  refresh();
  if (isGameOver(state)) return finishGame();
}

function handleEndTurn() {
  if (state.phase !== 'play') return;
  state.phase = 'foe';
  refresh();
  const { plan, played } = takeFoeTurn(state, (uid) => playCardFromHand(state, state.foe, state.you, uid));
  render.setIntent(describeIntent(plan));
  render.showPlayedCards(played);
  refresh();
  window.setTimeout(() => {
    if (isGameOver(state)) return finishGame();
    const income = startRound(state);
    state.log.push(`Round ${state.round} — both captains earn ${income} coins and draw up.`);
    render.setIntent(describeIntent('idle'));
    refresh();
  }, 900);
}

function finishGame() {
  refresh();
  playTone(state.winner === 'you' ? 'win' : 'lose');
  render.showEndScreen(state);
}

function startDuel() {
  ensureAudio();
  state = createGameState(seed === 7 ? (Date.now() % 100000) : seed);
  state.phase = 'play';
  state.log.push('The duel begins. Play a card, then end your turn.');
  render.hideOverlays();
  render.setIntent(describeIntent('idle'));
  refresh();
}

function restartDuel() {
  startDuel();
}

// Screenshot states: deterministic, built from real game rules.
function applyShotState() {
  if (shot === 'title') {
    state.phase = 'title';
    render.showTitle();
    refresh();
    return;
  }
  if (shot === 'play') {
    state.phase = 'play';
    // Play a scripted opening so the table looks lived-in: two of your cards,
    // one of Vex's, with coins spent and a log to show.
    playCardFromHand(state, state.you, state.foe, state.you.hand.find((c) => c.kind === 'coin')?.uid);
    playCardFromHand(state, state.foe, state.you, state.foe.hand.find((c) => c.kind === 'bulwark')?.uid);
    state.log.push('You minted coins. Vex raised a shield. The harbor holds its breath.');
    render.showPlayedCards(state.playedThisTurn);
    render.hideOverlays();
    refresh();
    return;
  }
  if (shot === 'win' || shot === 'loss') {
    state.phase = 'play';
    render.hideOverlays();
    if (shot === 'win') {
      state.foe.hull = 0;
      state.you.hull = 18;
      state.winner = 'you';
    } else {
      state.you.hull = 0;
      state.foe.hull = 14;
      state.winner = 'foe';
    }
    state.phase = 'over';
    state.log.push(shot === 'win' ? 'Your final broadside sinks Vex!' : 'Vex’s broadside breaks your hull!');
    render.showEndScreen(state);
    refresh();
  }
}

render.renderGuildChips();
bindGameInput({
  onStart: startDuel,
  onRestart: restartDuel,
  onEndTurn: handleEndTurn,
  onPlayByIndex: (index) => {
    const card = state.you.hand[index];
    if (card) handlePlayCard(card.uid);
  },
});

if (shot) {
  applyShotState();
} else {
  render.showTitle();
  refresh();
}
