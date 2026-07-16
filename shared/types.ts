// Game Types
export type PlayerRole = 'civilian' | 'imposter';
export type GamePhase = 'lobby' | 'setup' | 'clue' | 'discussion' | 'voting' | 'results';
export type GameStatus = 'pending' | 'active' | 'finished';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole | null;
  isAlive: boolean;
  hasGivenClue: boolean;
  clue?: string;
  votes: number;
}

export interface Game {
  id: string;
  code: string;
  host: string;
  players: Player[];
  status: GameStatus;
  phase: GamePhase;
  secretWord: string | null;
  currentClueGiver: string | null;
  clueOrder: string[];
  clueIndex: number;
  votes: Record<string, string>; // voterId -> votedForId
  winner: PlayerRole | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSettings {
  minPlayers: number;
  maxPlayers: number;
  impostorCount: number;
  clueTimeLimit: number;
  discussionTimeLimit: number;
  votingTimeLimit: number;
}

// Socket Events
export interface ServerToClientEvents {
  'game:joined': (game: Game) => void;
  'game:updated': (game: Game) => void;
  'game:started': (game: Game) => void;
  'game:phase-changed': (phase: GamePhase) => void;
  'game:player-joined': (player: Player) => void;
  'game:player-left': (playerId: string) => void;
  'game:clue-given': (clue: string, playerId: string) => void;
  'game:vote-cast': (voterId: string, votedForId: string) => void;
  'game:finished': (winner: PlayerRole, game: Game) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'game:join': (gameCode: string, playerName: string, callback: (error: any, game: Game) => void) => void;
  'game:create': (hostName: string, callback: (error: any, game: Game) => void) => void;
  'game:start': (gameId: string, callback: (error: any) => void) => void;
  'game:give-clue': (gameId: string, clue: string, callback: (error: any) => void) => void;
  'game:vote': (gameId: string, votedForId: string, callback: (error: any) => void) => void;
  'game:guess-word': (gameId: string, guess: string, callback: (error: any) => void) => void;
  'game:leave': (gameId: string, callback: (error: any) => void) => void;
}
