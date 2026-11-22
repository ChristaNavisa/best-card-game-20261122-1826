// Ember Harbor — input: mouse clicks and keyboard shortcuts.
// Click a card to play it; Enter/Space ends the turn; R restarts the duel.

export function bindGameInput(handlers) {
  const endBtn = document.getElementById('endTurnBtn');
  endBtn.addEventListener('click', () => handlers.onEndTurn());
  document.getElementById('restartBtn').addEventListener('click', () => handlers.onRestart());
  document.getElementById('playBtn').addEventListener('click', () => handlers.onStart());
  document.getElementById('againBtn').addEventListener('click', () => handlers.onRestart());
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const titleVisible = !document.getElementById('titleScreen').classList.contains('hidden');
      const endVisible = !document.getElementById('endScreen').classList.contains('hidden');
      if (titleVisible) { handlers.onStart(); return; }
      if (endVisible) { handlers.onRestart(); return; }
      handlers.onEndTurn();
    }
    if (event.key === 'r' || event.key === 'R') handlers.onRestart();
    if (event.key >= '1' && event.key <= '5') handlers.onPlayByIndex(Number(event.key) - 1);
  });
}
