import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { MainMenu } from './pages/MainMenu';
import { GameLobby } from './pages/GameLobby';
import { GameRoom } from './pages/GameRoom';
import { GameResults } from './pages/GameResults';
import { useGameContext } from './hooks/useGameContext';

function AppContent() {
  const { gameState } = useGameContext();

  return (
    <div className="w-full h-screen bg-gradient-to-br from-impster-900 via-impster-800 to-impster-700">
      {!gameState.game && <MainMenu />}
      {gameState.game && gameState.game.phase === 'lobby' && <GameLobby />}
      {gameState.game &&
        (gameState.game.phase === 'clue' ||
          gameState.game.phase === 'discussion' ||
          gameState.game.phase === 'voting') && <GameRoom />}
      {gameState.game && gameState.game.phase === 'results' && <GameResults />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
