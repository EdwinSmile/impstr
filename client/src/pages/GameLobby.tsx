import { useGameContext } from '../hooks/useGameContext';
import { GAME_SETTINGS } from '../../shared/constants';

export function GameLobby() {
  const { gameState, actions } = useGameContext();
  const game = gameState.game;

  if (!game) return null;

  const isHost = game.host === gameState.playerName;
  const canStart = game.players.length >= GAME_SETTINGS.MIN_PLAYERS;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-impster-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2">Game Lobby</h2>
        <p className="text-impster-300 mb-6">Game Code: <span className="text-white text-2xl font-mono font-bold">{game.code}</span></p>

        <div className="mb-8">
          <h3 className="text-white font-bold mb-4">Players ({game.players.length}/{GAME_SETTINGS.MAX_PLAYERS})</h3>
          <div className="space-y-2">
            {game.players.map((player) => (
              <div key={player.id} className="bg-impster-700 rounded-lg p-3 flex items-center justify-between">
                <span className="text-white">{player.name}</span>
                {game.host === player.name && (
                  <span className="bg-impster-600 text-white text-xs px-2 py-1 rounded">Host</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <button
            onClick={() => actions.startGame()}
            disabled={!canStart}
            className={`w-full font-bold py-3 px-6 rounded-lg transition mb-3 ${
              canStart
                ? 'bg-impster-600 hover:bg-impster-700 text-white cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Game ({game.players.length}/{GAME_SETTINGS.MIN_PLAYERS})
          </button>
        )}

        <button
          onClick={() => actions.leaveGame()}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Leave Game
        </button>

        <p className="text-impster-300 text-sm mt-6 text-center">
          Waiting for host to start the game...
        </p>
      </div>
    </div>
  );
}
