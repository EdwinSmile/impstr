import { useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { PLAYER_ROLES } from '../../shared/constants';

export function GameRoom() {
  const { gameState, actions } = useGameContext();
  const [clueInput, setClueInput] = useState('');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const game = gameState.game;

  if (!game) return null;

  const currentPlayer = game.players.find((p) => p.name === gameState.playerName);
  const isCurrentClueGiver = game.currentClueGiver === currentPlayer?.id;
  const hasVoted = !!game.votes[currentPlayer?.id || ''];

  const handleGiveClue = () => {
    if (clueInput.trim()) {
      actions.giveClue(clueInput);
      setClueInput('');
    }
  };

  const handleVote = () => {
    if (selectedVote) {
      actions.vote(selectedVote);
      setSelectedVote(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Game Phase */}
        <div className="text-center mb-8">
          <div className="inline-block bg-impster-600 rounded-full px-4 py-2 mb-4">
            <p className="text-white font-bold uppercase text-sm">Phase: {game.phase}</p>
          </div>

          {currentPlayer?.role === PLAYER_ROLES.CIVILIAN && (
            <div className="text-impster-200 text-lg">Secret Word: <span className="text-white font-bold text-2xl">{game.secretWord}</span></div>
          )}

          {currentPlayer?.role === PLAYER_ROLES.IMPOSTER && (
            <div className="text-red-400 text-lg font-bold">You are the IMPOSTER!</div>
          )}
        </div>

        {/* Clue Phase */}
        {game.phase === 'clue' && (
          <div className="bg-impster-800 rounded-xl p-8 mb-8 shadow-2xl">
            <h3 className="text-white text-2xl font-bold mb-6">Give Your Clue</h3>

            {isCurrentClueGiver ? (
              <>
                <p className="text-impster-300 mb-4">You're up! Give a one-word clue:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter clue..."
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    maxLength={30}
                    className="flex-1 px-4 py-3 rounded-lg text-black"
                    onKeyPress={(e) => e.key === 'Enter' && handleGiveClue()}
                  />
                  <button
                    onClick={handleGiveClue}
                    className="bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <p className="text-impster-300">
                Waiting for <span className="text-white font-bold">
                  {game.players.find((p) => p.id === game.currentClueGiver)?.name}
                </span> to give their clue...
              </p>
            )}
          </div>
        )}

        {/* Discussion Phase */}
        {game.phase === 'discussion' && (
          <div className="bg-impster-800 rounded-xl p-8 mb-8 shadow-2xl">
            <h3 className="text-white text-2xl font-bold mb-6">Discussion</h3>
            <p className="text-impster-300 mb-6">
              Review the clues and discuss who you think the imposter is!
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {game.players
                .filter((p) => p.clue)
                .map((player) => (
                  <div key={player.id} className="bg-impster-700 rounded-lg p-4">
                    <p className="text-impster-200 text-sm">{player.name}</p>
                    <p className="text-white text-lg font-bold">{player.clue}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Voting Phase */}
        {game.phase === 'voting' && (
          <div className="bg-impster-800 rounded-xl p-8 mb-8 shadow-2xl">
            <h3 className="text-white text-2xl font-bold mb-6">Vote</h3>
            <p className="text-impster-300 mb-6">Who do you think is the imposter?</p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {game.players
                .filter((p) => p.isAlive && p.id !== currentPlayer?.id)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedVote(player.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedVote === player.id
                        ? 'bg-impster-600 text-white font-bold'
                        : 'bg-impster-700 text-impster-200 hover:bg-impster-600 hover:text-white'
                    }`}
                  >
                    {player.name}
                  </button>
                ))}
            </div>

            {selectedVote && (
              <button
                onClick={handleVote}
                className="w-full bg-impster-600 hover:bg-impster-700 text-white font-bold py-3 px-6 rounded-lg transition mt-6"
              >
                Confirm Vote
              </button>
            )}

            {hasVoted && (
              <p className="text-impster-300 mt-6 text-center">✓ You have voted</p>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="bg-impster-800 rounded-xl p-8 shadow-2xl">
          <h3 className="text-white font-bold mb-4">Players</h3>
          <div className="space-y-2">
            {game.players.map((player) => (
              <div key={player.id} className="bg-impster-700 rounded-lg p-3 flex items-center justify-between">
                <span className={`font-bold ${!player.isAlive ? 'text-gray-500 line-through' : 'text-white'}`}>
                  {player.name}
                </span>
                <div className="flex gap-2">
                  {player.hasGivenClue && <span className="text-green-400 text-xs">✓ Clue</span>}
                  {game.votes[player.id] && <span className="text-blue-400 text-xs">✓ Voted</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
