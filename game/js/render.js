// Ember Harbor — rendering: cards, meters, log, overlays and banners.
// All visuals are DOM + CSS + inline SVG; nothing loads over the network.

import { GUILDS, KIND_LABEL, guildGlyphSvg } from './cards.js';
import { MAX_HULL, computeScore } from './state.js';

const $ = (id) => document.getElementById(id);

export function renderGuildChips() {
  $('titleGuilds').innerHTML = Object.entries(GUILDS).map(([key, guild]) => (
    `<span class="guild-chip ${key}">${guildGlyphSvg(key)} ${guild.name} — ${guild.blurb}</span>`
  )).join('');
}

export function buildCardElement(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card guild-${card.guild}${opts.back ? ' back' : ''}${opts.played ? ' played' : ''}`;
  el.dataset.uid = card.uid;
  if (opts.back) return el;
  el.innerHTML = `
    <span class="guild-band">${GUILDS[card.guild].name}</span>
    <span class="cost">${card.cost}</span>
    <span class="art">${guildGlyphSvg(card.guild)}</span>
    <span class="name">${card.name}</span>
    <span class="kind">${KIND_LABEL[card.kind]}</span>
    <span class="flavor">${card.flavor}</span>
    <span class="power">${card.kind === 'strike' ? '⚔' + card.power : card.kind === 'bulwark' ? '🛡' + card.power : card.kind === 'coin' ? '◉' + card.power : '👁' + card.power}</span>`;
  if (opts.unaffordable) el.classList.add('unaffordable');
  return el;
}

export function renderMeters(state) {
  const set = (prefix, captain) => {
    $(`${prefix}HullBar`).style.width = `${(captain.hull / MAX_HULL) * 100}%`;
    $(`${prefix}HullText`).textContent = captain.hull;
    $(`${prefix}ShieldBar`).style.width = `${Math.min(100, (captain.shield / 12) * 100)}%`;
    $(`${prefix}ShieldText`).textContent = captain.shield;
    $(`${prefix}CoinsText`).textContent = captain.coins;
  };
  set('you', state.you);
  set('foe', state.foe);
  $('roundLabel').textContent = `Round ${state.round}`;
  $('scoreLabel').textContent = `Score ${computeScore(state).total}`;
}

export function renderHands(state, onPlayCard) {
  const youHand = $('youHand');
  youHand.innerHTML = '';
  state.you.hand.forEach((card, i) => {
    const el = buildCardElement(card, { unaffordable: state.you.coins < card.cost });
    el.style.animationDelay = `${i * 60}ms`;
    el.addEventListener('click', () => onPlayCard(card.uid));
    youHand.appendChild(el);
  });
  const foeHand = $('foeHand');
  foeHand.innerHTML = '';
  state.foe.hand.forEach((card, i) => {
    const el = buildCardElement(card, { back: true });
    el.style.animationDelay = `${i * 60}ms`;
    foeHand.appendChild(el);
  });
}

export function renderLog(state) {
  const lines = state.log.slice(-4);
  $('log').innerHTML = lines.map((line) => {
    const cls = /hits|damage/i.test(line) ? 'bad' : /Surge|Chain|mint|draw/i.test(line) ? 'gold' : '';
    return `<div class="${cls}">${line}</div>`;
  }).join('') || '<div>Your move, Captain. The harbor watches.</div>';
}

export function showPlayedCards(cards) {
  const row = $('playedRow');
  row.innerHTML = '';
  cards.slice(-3).forEach((card) => row.appendChild(buildCardElement(card, { played: true })));
}

export function showComboBanner(text) {
  const banner = $('comboBanner');
  banner.textContent = text;
  banner.classList.remove('hidden');
  window.setTimeout(() => banner.classList.add('hidden'), 1400);
}

export function setIntent(text) {
  $('foeIntent').textContent = text;
}

export function showTitle() {
  $('titleScreen').classList.remove('hidden');
  $('endScreen').classList.add('hidden');
}

export function showEndScreen(state) {
  const won = state.winner === 'you';
  $('endKicker').textContent = won ? 'THE HARBOR IS YOURS' : 'THE HARBOR IS LOST';
  const title = $('endTitle');
  title.textContent = won ? 'VICTORY!' : 'DEFEAT';
  title.className = won ? 'won' : 'lost';
  $('endText').textContent = won
    ? 'Captain Vex strikes his colors. Your lanterns burn brightest over Ember Harbor tonight.'
    : 'Captain Vex takes the harbor. Your hull is matchwood — but the tide turns for those who sail again.';
  const score = computeScore(state);
  $('endScore').innerHTML = `
    <div class="stat"><b>${score.total}</b><span>FINAL SCORE</span></div>
    <div class="stat"><b>${score.hullLeft}</b><span>HULL LEFT</span></div>
    <div class="stat"><b>${score.rounds}</b><span>ROUNDS</span></div>
    <div class="stat"><b>${score.surges}</b><span>GUILD SURGES</span></div>
    <div class="stat"><b>${score.chains}</b><span>CHAINS</span></div>`;
  $('titleScreen').classList.add('hidden');
  $('endScreen').classList.remove('hidden');
}

export function hideOverlays() {
  $('titleScreen').classList.add('hidden');
  $('endScreen').classList.add('hidden');
}
