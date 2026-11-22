// Ember Harbor — card catalog: the four guilds, every card, and deck building.
// Suits are told apart by colour AND shape: each guild has its own SVG glyph.

export const GUILDS = {
  ember: { name: 'Ember', color: '#e4572e', glyph: 'flame', blurb: 'Burn it down' },
  tide: { name: 'Tide', color: '#2e86e4', glyph: 'wave', blurb: 'Wear them out' },
  gale: { name: 'Gale', color: '#2fa36b', glyph: 'swirl', blurb: 'Strike fast' },
  ore: { name: 'Ore', color: '#d9a441', glyph: 'gem', blurb: 'Buy the win' },
};

export const GUILD_GLYPHS = {
  flame: '<svg viewBox="0 0 64 64"><path d="M32 6 C40 20 50 26 50 40 a18 18 0 1 1 -36 0 C14 28 24 22 32 6 Z" fill="#e4572e"/><path d="M32 30 C36 36 40 38 40 46 a8 8 0 1 1 -16 0 C24 38 28 36 32 30 Z" fill="#f2c14e"/></svg>',
  wave: '<svg viewBox="0 0 64 64"><path d="M6 26 q7 -12 13 0 t13 0 t13 0 t13 0" fill="none" stroke="#2e86e4" stroke-width="6" stroke-linecap="round"/><path d="M6 42 q7 -12 13 0 t13 0 t13 0 t13 0" fill="none" stroke="#7fb5f0" stroke-width="6" stroke-linecap="round"/></svg>',
  swirl: '<svg viewBox="0 0 64 64"><path d="M32 32 m0 -20 a20 20 0 1 1 -14 6" fill="none" stroke="#2fa36b" stroke-width="6" stroke-linecap="round"/><path d="M32 32 m0 -10 a10 10 0 1 0 10 6" fill="none" stroke="#8fd6a8" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#2fa36b"/></svg>',
  gem: '<svg viewBox="0 0 64 64"><path d="M32 6 L52 24 L32 58 L12 24 Z" fill="#d9a441" stroke="#8a6d3b" stroke-width="2"/><path d="M12 24 L52 24 M32 6 L24 24 L32 58 M32 6 L40 24 L32 58" fill="none" stroke="#fff3cf" stroke-width="2"/></svg>',
};

// kind: strike = damage, bulwark = shield, coin = gain coins, spyglass = draw cards.
export const CARD_CATALOG = [
  { id: 'ember-spark', name: 'Spark Cutlass', guild: 'ember', kind: 'strike', cost: 1, power: 3, flavor: 'First blood.' },
  { id: 'ember-blaze', name: 'Blaze Broadside', guild: 'ember', kind: 'strike', cost: 2, power: 5, flavor: 'All guns, at once.' },
  { id: 'ember-inferno', name: 'Inferno Volley', guild: 'ember', kind: 'strike', cost: 5, power: 9, flavor: 'The sky burns.' },
  { id: 'ember-kindling', name: 'Kindling Raid', guild: 'ember', kind: 'strike', cost: 2, power: 4, flavor: 'Quick and hot.' },
  { id: 'tide-surge', name: 'Surge Ram', guild: 'tide', kind: 'strike', cost: 2, power: 4, flavor: 'The sea pushes.' },
  { id: 'tide-maelstrom', name: 'Maelstrom', guild: 'tide', kind: 'strike', cost: 4, power: 7, flavor: 'No way out.' },
  { id: 'tide-tidewall', name: 'Tidewall', guild: 'tide', kind: 'bulwark', cost: 2, power: 6, flavor: 'Hold the line.' },
  { id: 'tide-anchor', name: 'Anchor Hold', guild: 'tide', kind: 'bulwark', cost: 1, power: 4, flavor: 'Steady as stone.' },
  { id: 'gale-dart', name: 'Gale Dart', guild: 'gale', kind: 'strike', cost: 1, power: 2, flavor: 'Too fast to see.' },
  { id: 'gale-cyclone', name: 'Cyclone Run', guild: 'gale', kind: 'strike', cost: 4, power: 6, flavor: 'Around and in.' },
  { id: 'gale-lookout', name: 'Crow’s Lookout', guild: 'gale', kind: 'spyglass', cost: 1, power: 2, flavor: 'See it coming.' },
  { id: 'gale-tailwind', name: 'Tailwind', guild: 'gale', kind: 'spyglass', cost: 2, power: 2, flavor: 'Wind at your back.' },
  { id: 'ore-ingot', name: 'Gold Ingot', guild: 'ore', kind: 'coin', cost: 1, power: 3, flavor: 'Shiny and spendable.' },
  { id: 'ore-vault', name: 'Vault Break', guild: 'ore', kind: 'coin', cost: 2, power: 5, flavor: 'Open the strongbox.' },
  { id: 'ore-bastion', name: 'Iron Bastion', guild: 'ore', kind: 'bulwark', cost: 4, power: 8, flavor: 'Nothing gets through.' },
  { id: 'ore-contract', name: 'Guild Contract', guild: 'ore', kind: 'coin', cost: 3, power: 6, flavor: 'Signed in gold.' },
];

export const KIND_LABEL = { strike: 'Strike', bulwark: 'Shield', coin: 'Coins', spyglass: 'Draw' };
export const KIND_VERB = { strike: 'deals', bulwark: 'raises', coin: 'mints', spyglass: 'draws' };

// A mulberry32 seeded RNG so screenshot states are reproducible.
export function makeSeededRandom(seed) {
  let a = seed >>> 0;
  return function seededRandom() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleDeck(cards, random) {
  const deck = cards.slice();
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Two copies of each catalog card, shuffled — except the two heaviest
// finishers (Inferno Volley, Maelstrom), which appear only once, so no
// opening hand can end the duel in two rounds. A 30-card harbor deck.
export function buildDeck(random) {
  const singles = new Set(['ember-inferno', 'tide-maelstrom']);
  const doubled = [...CARD_CATALOG, ...CARD_CATALOG.filter((c) => !singles.has(c.id))]
    .map((card, index) => ({ ...card, uid: `${card.id}-${index}` }));
  return shuffleDeck(doubled, random);
}

export function guildGlyphSvg(guild) {
  return GUILD_GLYPHS[GUILDS[guild].glyph];
}
