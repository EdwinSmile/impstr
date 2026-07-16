import { v4 as uuidv4 } from 'uuid';
import { Game, Player, PlayerRole } from '../../shared/types';
import { GAME_SETTINGS, WORD_BANK, GAME_PHASES, PLAYER_ROLES } from '../../shared/constants';

export class GameManager {
  private games: Map<string, Game> = new Map();

  /**
   * Create a new game
   */
  createGame(hostName: string): Game {
    const gameId = uuidv4();
    const gameCode = this.generateGameCode();

    const game: Game = {
      id: gameId,
      code: gameCode,
      host: hostName,
      players: [this.createPlayer(hostName, true)],
      status: 'pending',
      phase: GAME_PHASES.LOBBY,
      secretWord: null,
      currentClueGiver: null,
      clueOrder: [],
      clueIndex: 0,
      votes: {},
      winner: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.games.set(gameId, game);
    return game;
  }

  /**
   * Get a game by ID
   */
  getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  /**
   * Get a game by code
   */
  getGameByCode(code: string): Game | undefined {
    return Array.from(this.games.values()).find((g) => g.code === code);
  }

  /**
   * Join a game
   */
  joinGame(gameCode: string, playerName: string): Game | null {
    const game = this.getGameByCode(gameCode);
    if (!game) return null;

    if (game.players.length >= GAME_SETTINGS.MAX_PLAYERS) return null;
    if (game.status !== 'pending') return null;

    const newPlayer = this.createPlayer(playerName);
    game.players.push(newPlayer);
    game.updatedAt = new Date();

    return game;
  }

  /**
   * Remove a player from the game
   */
  removePlayer(gameId: string, playerId: string): Game | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    game.players = game.players.filter((p) => p.id !== playerId);
    game.updatedAt = new Date();

    // Delete game if empty
    if (game.players.length === 0) {
      this.games.delete(gameId);
      return null;
    }

    return game;
  }

  /**
   * Start a game
   */
  startGame(gameId: string): Game | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    if (game.players.length < GAME_SETTINGS.MIN_PLAYERS) return null;

    // Assign roles
    this.assignRoles(game);

    // Pick secret word
    game.secretWord = this.pickRandomWord();

    // Determine clue order
    game.clueOrder = this.shuffleArray([...game.players.map((p) => p.id)]);
    game.currentClueGiver = game.clueOrder[0];

    game.status = 'active';
    game.phase = GAME_PHASES.CLUE;
    game.updatedAt = new Date();

    return game;
  }

  /**
   * Record a clue from a player
   */
  recordClue(gameId: string, playerId: string, clue: string): Game | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return null;

    player.clue = clue;
    player.hasGivenClue = true;
    game.updatedAt = new Date();

    // Check if all players have given clues
    if (game.players.every((p) => p.hasGivenClue)) {
      game.phase = GAME_PHASES.DISCUSSION;
    } else {
      // Move to next player
      game.clueIndex++;
      if (game.clueIndex < game.clueOrder.length) {
        game.currentClueGiver = game.clueOrder[game.clueIndex];
      }
    }

    return game;
  }

  /**
   * Record a vote
   */
  recordVote(gameId: string, voterId: string, votedForId: string): Game | null {
    const game = this.getGame(gameId);
    if (!game) return null;

    game.votes[voterId] = votedForId;
    game.updatedAt = new Date();

    // Check if all alive players have voted
    const alivePlayerIds = game.players.filter((p) => p.isAlive).map((p) => p.id);
    const hasVoted = Object.keys(game.votes).filter((id) => alivePlayerIds.includes(id)).length;

    if (hasVoted === alivePlayerIds.length) {
      this.endVotingPhase(game);
    }

    return game;
  }

  /**
   * End voting phase and eliminate player
   */
  private endVotingPhase(game: Game): void {
    // Count votes
    const voteCount: Record<string, number> = {};
    Object.values(game.votes).forEach((votedForId) => {
      voteCount[votedForId] = (voteCount[votedForId] || 0) + 1;
    });

    // Find player with most votes
    let eliminatedId = '';
    let maxVotes = 0;
    Object.entries(voteCount).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = playerId;
      }
    });

    if (eliminatedId) {
      const eliminatedPlayer = game.players.find((p) => p.id === eliminatedId);
      if (eliminatedPlayer) {
        eliminatedPlayer.isAlive = false;

        // Check win conditions
        if (this.checkWinCondition(game)) {
          game.phase = GAME_PHASES.RESULTS;
        } else {
          // Reset for next round
          game.votes = {};
          game.players.forEach((p) => {
            p.hasGivenClue = false;
            p.clue = undefined;
          });
          game.clueIndex = 0;
          game.currentClueGiver = game.clueOrder[0];
          game.phase = GAME_PHASES.CLUE;
        }
      }
    }
  }

  /**
   * Check win condition
   */
  private checkWinCondition(game: Game): boolean {
    const aliveImpostors = game.players.filter((p) => p.isAlive && p.role === PLAYER_ROLES.IMPOSTER);
    const aliveCivilians = game.players.filter((p) => p.isAlive && p.role === PLAYER_ROLES.CIVILIAN);

    // Impostor wins if all civilians are eliminated
    if (aliveCivilians.length === 0) {
      game.winner = PLAYER_ROLES.IMPOSTER;
      return true;
    }

    // Civilian wins if all impostors are eliminated
    if (aliveImpostors.length === 0) {
      game.winner = PLAYER_ROLES.CIVILIAN;
      return true;
    }

    return false;
  }

  /**
   * Create a player object
   */
  private createPlayer(name: string, isHost: boolean = false): Player {
    return {
      id: uuidv4(),
      name,
      role: null,
      isAlive: true,
      hasGivenClue: false,
      votes: 0,
    };
  }

  /**
   * Assign roles to players
   */
  private assignRoles(game: Game): void {
    const playerIds = game.players.map((p) => p.id);
    const shuffledIds = this.shuffleArray(playerIds);

    const impostorCount = Math.min(GAME_SETTINGS.DEFAULT_IMPOSTOR_COUNT, game.players.length - 1);

    shuffledIds.forEach((id, index) => {
      const player = game.players.find((p) => p.id === id);
      if (player) {
        player.role = index < impostorCount ? PLAYER_ROLES.IMPOSTER : PLAYER_ROLES.CIVILIAN;
      }
    });
  }

  /**
   * Pick a random word from the word bank
   */
  private pickRandomWord(): string {
    return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  }

  /**
   * Generate a unique game code
   */
  private generateGameCode(): string {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Shuffle an array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
