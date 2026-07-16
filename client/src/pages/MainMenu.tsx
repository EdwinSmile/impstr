import { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';

export function MainMenu() {
  const [hostName, setHostName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const { actions, gameState } = useGameContext();

  const handleCreate = () => {
    if (hostName.trim()) {
      actions.createGame(hostName);
    }
  };

  const handleJoin = () => {
    if (gameCode.trim() && playerName.trim()) {
      actions.joinGame(gameCode.toUpperCase(), playerName);
    }
  };

  if (gameState.loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-5xl font-bold text-white mb-2">IMPSTR</h1>
          <p className="text-impster-200 mb-12 text-lg">Social Deduction Word Game</p>

          {gameState.error && <div className="bg-red-500 text-white p-3 rounded mb-6">{gameState.error}</div>}

          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Create Game
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-impster-500 hover:bg-impster-600 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Join Game
            </button>
          </div>

          <p className="text-impster-300 text-sm mt-8">
            A word deduction game for 3-20 players. Find the imposter!
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6">Create Game</h2>

          <input
            type="text"
            placeholder="Your name"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg mb-4 text-black placeholder-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />

          <button
            onClick={handleCreate}
            className="w-full bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition mb-4"
          >
            Create
          </button>

          <button
            onClick={() => setMode('menu')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <h2 className="text-3xl font-bold text-white mb-6">Join Game</h2>

        <input
          type="text"
          placeholder="Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="w-full px-4 py-3 rounded-lg mb-4 text-black placeholder-gray-500 text-center text-2xl font-mono"
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />

        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg mb-4 text-black placeholder-gray-500"
          onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
        />

        <button
          onClick={handleJoin}
          className="w-full bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition mb-4"
        >
          Join
        </button>

        <button
          onClick={() => setMode('menu')}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
