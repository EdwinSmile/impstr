# Impstr - Social Deduction Word Game

A multiplayer word deduction game where players guess who the imposter is based on one-word clues.

## Game Overview

**Impstr** is a social deduction party game for 3-20 players:
- Most players (civilians) see the secret word
- One or more players (imposters) don't know the word
- Players give one-word clues to identify the imposters
- After discussion, players vote on who they think the imposter is

**Civilians win** if they correctly identify the imposter.
**Imposters win** if they survive the voting or guess the secret word.

## Features

- 🎮 Real-time multiplayer gameplay (3-20 players)
- 📱 Mobile-friendly design (works on phones/tablets)
- 🔄 WebSocket-based real-time updates
- 🎯 Multiple game phases (clues, discussion, voting)
- 📊 Game history and statistics
- 🌍 Shareable game lobbies

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (optional, for persistence)

## Project Structure

```
impstr/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Game pages
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Game state
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── server/                 # Node.js/Express backend
│   ├── src/
│   │   ├── game/           # Game logic
│   │   ├── routes/         # API routes
│   │   ├── sockets/        # WebSocket handlers
│   │   ├── utils/          # Utilities
│   │   └── index.ts
│   └── package.json
├── shared/                 # Shared types
│   ├── types.ts
│   └── constants.ts
└── package.json (root)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/EdwinSmile/impstr.git
cd impstr

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Game Flow

1. **Lobby**: Host creates a game, players join
2. **Setup**: Roles assigned, secret word selected
3. **Clue Phase**: Players take turns giving one-word clues
4. **Discussion**: Players discuss who the imposter is
5. **Voting**: Players vote to eliminate someone
6. **Results**: Game ends with civilian or imposter victory

## License

MIT
