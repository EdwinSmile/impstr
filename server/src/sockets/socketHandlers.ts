import { Server as SocketIOServer, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/types';
import { GameManager } from '../game/GameManager';

export function setupSocketHandlers(
  io: SocketIOServer,
  gameManager: GameManager
): void {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Create game
    socket.on('game:create', (hostName: string, callback) => {
      try {
        const game = gameManager.createGame(hostName);
        socket.join(game.id);
        callback(null, game);
        io.to(game.id).emit('game:started', game);
      } catch (error) {
        callback(error);
      }
    });

    // Join game
    socket.on('game:join', (gameCode: string, playerName: string, callback) => {
      try {
        const game = gameManager.joinGame(gameCode, playerName);
        if (!game) {
          callback(new Error('Game not found or is full'));
          return;
        }

        socket.join(game.id);
        callback(null, game);
        io.to(game.id).emit('game:updated', game);
      } catch (error) {
        callback(error);
      }
    });

    // Start game
    socket.on('game:start', (gameId: string, callback) => {
      try {
        const game = gameManager.startGame(gameId);
        if (!game) {
          callback(new Error('Failed to start game'));
          return;
        }

        callback(null);
        io.to(gameId).emit('game:started', game);
      } catch (error) {
        callback(error);
      }
    });

    // Give clue
    socket.on('game:give-clue', (gameId: string, clue: string, callback) => {
      try {
        // Find socket user's player ID
        const game = gameManager.getGame(gameId);
        if (!game) {
          callback(new Error('Game not found'));
          return;
        }

        // In a real implementation, we'd track which socket belongs to which player
        // For now, we'll update the last player who gave a clue
        const game_updated = gameManager.recordClue(gameId, game.currentClueGiver || '', clue);
        if (!game_updated) {
          callback(new Error('Failed to record clue'));
          return;
        }

        callback(null);
        io.to(gameId).emit('game:clue-given', clue, game.currentClueGiver || '');
        io.to(gameId).emit('game:updated', game_updated);
      } catch (error) {
        callback(error);
      }
    });

    // Vote
    socket.on('game:vote', (gameId: string, votedForId: string, callback) => {
      try {
        // In a real implementation, we'd get the voter ID from socket tracking
        const game = gameManager.getGame(gameId);
        if (!game) {
          callback(new Error('Game not found'));
          return;
        }

        const updatedGame = gameManager.recordVote(gameId, socket.id, votedForId);
        if (!updatedGame) {
          callback(new Error('Failed to record vote'));
          return;
        }

        callback(null);
        io.to(gameId).emit('game:vote-cast', socket.id, votedForId);
        io.to(gameId).emit('game:updated', updatedGame);

        // Check if game finished
        if (updatedGame.winner) {
          io.to(gameId).emit('game:finished', updatedGame.winner, updatedGame);
        }
      } catch (error) {
        callback(error);
      }
    });

    // Leave game
    socket.on('game:leave', (gameId: string, callback) => {
      try {
        socket.leave(gameId);
        callback(null);
      } catch (error) {
        callback(error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}
