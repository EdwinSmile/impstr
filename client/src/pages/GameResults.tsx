import { useGameContext } from '../hooks/useGameContext';
import { PLAYER_ROLES } from '../../shared/constants';

export function GameResults() {
  const { gameState, actions } = useGameContext();
  const game = gameState.game;

  if (!game) return null;

  const currentPlayer = game.players.find((p) => p.name === gameState.playerName);
  const isWinner = currentPlayer?.role === game.winner;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className={`mb-8 text-5xl font-bold ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
          {isWinner ? '🎉 YOU WIN!' : '💀 YOU LOSE!'}
        </div>

        <div className="bg-impster-800 rounded-xl p-8 mb-8 shadow-2xl">
          <p className="text-impster-300 mb-4">Secret Word Was:</p>
          <p className="text-white text-4xl font-bold mb-8">{game.secretWord}</p>

          <p className="text-impster-300 mb-4">
            {game.winner === PLAYER_ROLES.CIVILIAN ? 'Civilians' : 'Imposters'} won!
          </p>

          <div className="bg-impster-700 rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold mb-4">
              {game.winner === PLAYER_ROLES.CIVILIAN ? '🌟 Winning Civilians' : '🗡️ Winning Imposters'}
            </h3>
            <div className="space-y-2">
              {game.players
                .filter((p) => p.role === game.winner)
                .map((player) => (
                  <p key={player.id} className="text-green-300">
                    ✓ {player.name}
                  </p>
                ))}
            </div>
          </div>

          {game.winner === PLAYER_ROLES.IMPOSTER && (
            <div className="bg-red-900 rounded-lg p-6">
              <h3 className="text-white font-bold mb-4">💀 The Imposters</h3>
              <div className="space-y-2">
                {game.players
                  .filter((p) => p.role === PLAYER_ROLES.IMPOSTER)
                  .map((player) => (
                    <p key={player.id} className="text-red-300">
                      {player.name}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => actions.leaveGame()}
          className="w-full bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
