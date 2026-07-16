import React, { createContext, useState, useCallback } from 'react';
import { Game } from '../../shared/types';
import { useSocket } from '../hooks/useSocket';

export interface GameContextType {
  gameState: {
    game: Game | null;
    playerName: string;
    loading: boolean;
    error: string | null;
  };
  actions: {
    createGame: (hostName: string) => void;
    joinGame: (gameCode: string, playerName: string) => void;
    startGame: () => void;
    giveClue: (clue: string) => void;
    vote: (playerId: string) => void;
    leaveGame: () => void;
  };
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  const createGame = useCallback(
    (hostName: string) => {
      setLoading(true);
      setError(null);
      socket?.emit('game:create', hostName, (err, newGame) => {
        if (err) {
          setError(err.message || 'Failed to create game');
        } else {
          setGame(newGame);
          setPlayerName(hostName);
        }
        setLoading(false);
      });
    },
    [socket]
  );

  const joinGame = useCallback(
    (gameCode: string, name: string) => {
      setLoading(true);
      setError(null);
      socket?.emit('game:join', gameCode, name, (err, newGame) => {
        if (err) {
          setError(err.message || 'Failed to join game');
        } else {
          setGame(newGame);
          setPlayerName(name);
        }
        setLoading(false);
      });
    },
    [socket]
  );

  const startGame = useCallback(() => {
    if (!game) return;
    setLoading(true);
    socket?.emit('game:start', game.id, (err) => {
      if (err) {
        setError(err.message || 'Failed to start game');
      }
      setLoading(false);
    });
  }, [game, socket]);

  const giveClue = useCallback(
    (clue: string) => {
      if (!game) return;
      socket?.emit('game:give-clue', game.id, clue, (err) => {
        if (err) {
          setError(err.message || 'Failed to give clue');
        }
      });
    },
    [game, socket]
  );

  const vote = useCallback(
    (playerId: string) => {
      if (!game) return;
      socket?.emit('game:vote', game.id, playerId, (err) => {
        if (err) {
          setError(err.message || 'Failed to vote');
        }
      });
    },
    [game, socket]
  );

  const leaveGame = useCallback(() => {
    if (!game) return;
    socket?.emit('game:leave', game.id, () => {
      setGame(null);
      setPlayerName('');
    });
  }, [game, socket]);

  // Listen for game updates
  React.useEffect(() => {
    socket?.on('game:updated', (updatedGame) => {
      setGame(updatedGame);
    });

    socket?.on('game:started', (updatedGame) => {
      setGame(updatedGame);
    });

    socket?.on('game:finished', (winner, finalGame) => {
      setGame(finalGame);
    });

    socket?.on('error', (message) => {
      setError(message);
    });

    return () => {
      socket?.off('game:updated');
      socket?.off('game:started');
      socket?.off('game:finished');
      socket?.off('error');
    };
  }, [socket]);

  return (
    <GameContext.Provider
      value={{
        gameState: { game, playerName, loading, error },
        actions: { createGame, joinGame, startGame, giveClue, vote, leaveGame },
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
