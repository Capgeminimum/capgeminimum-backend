const { db, getNextId, nowIso } = require('../models/mockDb');

function isPowerOfTwo(value) {
  return value > 0 && (value & (value - 1)) === 0;
}

function getPlayerById(playerId) {
  return db.players.find((player) => player.id === playerId) || null;
}

function buildGameView(game) {
  const player1 = game.player1Id ? getPlayerById(game.player1Id) : null;
  const player2 = game.player2Id ? getPlayerById(game.player2Id) : null;

  return {
    id: game.id,
    player1: player1 ? { id: player1.id, username: player1.username } : null,
    player2: player2 ? { id: player2.id, username: player2.username } : null,
    winnerId: game.winnerId,
    status: game.status
  };
}

function groupBracketGames(games) {
  const rounds = new Map();

  for (const game of games) {
    if (!rounds.has(game.round)) {
      rounds.set(game.round, []);
    }
    rounds.get(game.round).push(game);
  }

  return [...rounds.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, matches]) => ({
      round,
      matches: matches
        .sort((a, b) => a.matchIndex - b.matchIndex)
        .map((game) => buildGameView(game))
    }));
}

function getAllTournaments() {
  return [...db.tournaments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((tournament) => ({
      id: tournament.id,
      name: tournament.name,
      status: tournament.status,
      playerCount: tournament.playerIds.length,
      createdAt: tournament.createdAt
    }));
}

function getTournamentById(tournamentId) {
  const tournament = db.tournaments.find((item) => item.id === tournamentId);

  if (!tournament) {
    const error = new Error('Tournament not found');
    error.statusCode = 404;
    throw error;
  }

  const players = tournament.playerIds
    .map((playerId) => getPlayerById(playerId))
    .filter(Boolean)
    .map((player) => ({ id: player.id, username: player.username }));

  const bracketGames = db.games
    .filter((game) => game.tournamentId === tournament.id)
    .sort((a, b) => a.round - b.round || a.matchIndex - b.matchIndex);

  return {
    id: tournament.id,
    name: tournament.name,
    status: tournament.status,
    players,
    bracket: groupBracketGames(bracketGames)
  };
}

function createTournament({ name, playerIds }) {
  if (!Array.isArray(playerIds) || !isPowerOfTwo(playerIds.length)) {
    const error = new Error('Player count must be a power of 2 (2, 4, 8, 16...)');
    error.statusCode = 400;
    throw error;
  }

  const uniquePlayerIds = [...new Set(playerIds)];
  if (uniquePlayerIds.length !== playerIds.length) {
    const error = new Error('playerIds must be unique');
    error.statusCode = 400;
    throw error;
  }

  const missingPlayerId = uniquePlayerIds.find((playerId) => !getPlayerById(playerId));
  if (missingPlayerId) {
    const error = new Error(`Player ${missingPlayerId} not found`);
    error.statusCode = 404;
    throw error;
  }

  const tournament = {
    id: getNextId('tournament'),
    name: name && name.trim() ? name.trim() : `Tournoi ${new Date().toISOString().slice(0, 10)}`,
    status: 'pending',
    playerIds: uniquePlayerIds,
    createdAt: nowIso(),
    winnerId: null
  };

  db.tournaments.push(tournament);

  return {
    id: tournament.id,
    name: tournament.name,
    status: tournament.status,
    playerCount: tournament.playerIds.length,
    createdAt: tournament.createdAt
  };
}

function startTournament(tournamentId) {
  const tournament = db.tournaments.find((item) => item.id === tournamentId);

  if (!tournament) {
    const error = new Error('Tournament not found');
    error.statusCode = 404;
    throw error;
  }

  if (tournament.status !== 'pending') {
    const error = new Error('Tournament is already started');
    error.statusCode = 400;
    throw error;
  }

  const players = [...tournament.playerIds];
  const roundsCount = Math.log2(players.length);
  const rounds = [];

  for (let roundNumber = 1; roundNumber <= roundsCount; roundNumber += 1) {
    const matchesCount = players.length / 2 ** roundNumber;
    const roundGames = [];

    for (let matchIndex = 0; matchIndex < matchesCount; matchIndex += 1) {
      const game = {
        id: getNextId('game'),
        tournamentId: tournament.id,
        round: roundNumber,
        matchIndex,
        player1Id: null,
        player2Id: null,
        scorePlayer1: 0,
        scorePlayer2: 0,
        status: 'pending',
        winnerId: null,
        playedAt: nowIso(),
        nextGameId: null,
        nextSlot: null,
        player1OldElo: null,
        player1NewElo: null,
        player2OldElo: null,
        player2NewElo: null
      };

      db.games.push(game);
      roundGames.push(game);
    }

    rounds.push(roundGames);
  }

  const firstRoundGames = rounds[0];
  for (let index = 0; index < firstRoundGames.length; index += 1) {
    const game = firstRoundGames[index];
    game.player1Id = players[index * 2];
    game.player2Id = players[index * 2 + 1];
    game.status = 'ongoing';
  }

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
    const currentRound = rounds[roundIndex];
    const nextRound = rounds[roundIndex + 1];

    for (let matchIndex = 0; matchIndex < currentRound.length; matchIndex += 1) {
      const game = currentRound[matchIndex];
      const nextGame = nextRound[Math.floor(matchIndex / 2)];
      game.nextGameId = nextGame.id;
      game.nextSlot = matchIndex % 2 === 0 ? 1 : 2;
    }
  }

  tournament.status = 'ongoing';

  return {
    id: tournament.id,
    status: tournament.status,
    bracket: groupBracketGames(db.games.filter((game) => game.tournamentId === tournament.id))
  };
}

function advanceTournamentBracketFromGame(game) {
  if (!game.tournamentId || !game.winnerId || !game.nextGameId) {
    if (game.tournamentId && game.winnerId && !game.nextGameId) {
      const tournament = db.tournaments.find((item) => item.id === game.tournamentId);
      if (tournament) {
        tournament.status = 'finished';
        tournament.winnerId = game.winnerId;
      }
    }
    return;
  }

  const nextGame = db.games.find((item) => item.id === game.nextGameId);
  if (!nextGame) {
    return;
  }

  if (game.nextSlot === 1) {
    nextGame.player1Id = game.winnerId;
  } else {
    nextGame.player2Id = game.winnerId;
  }

  if (nextGame.player1Id && nextGame.player2Id) {
    nextGame.status = 'ongoing';
  }
}

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  startTournament,
  advanceTournamentBracketFromGame
};