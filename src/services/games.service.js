const { db, getNextId, nowIso } = require('../models/mockDb');
const { elo_adder } = require('./elo');
const { advanceTournamentBracketFromGame } = require('./tournament.service');

function getPlayerById(playerId) {
  return db.players.find((player) => player.id === playerId) || null;
}

function toGameResponse(game) {
  const player1 = getPlayerById(game.player1Id);
  const player2 = getPlayerById(game.player2Id);

  return {
    id: game.id,
    player1: player1 ? { id: player1.id, username: player1.username } : null,
    player2: player2 ? { id: player2.id, username: player2.username } : null,
    scorePlayer1: game.scorePlayer1,
    scorePlayer2: game.scorePlayer2,
    status: game.status,
    winnerId: game.winnerId,
    playedAt: game.playedAt
  };
}

function getAllGames() {
  return [...db.games]
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
    .map((game) => toGameResponse(game));
}

function getGameById(gameId) {
  const game = db.games.find((item) => item.id === gameId);
  return game ? toGameResponse(game) : null;
}

function createGame({ player1Id, player2Id, tournamentId = null, round = null, matchIndex = null }) {
  if (player1Id === player2Id) {
    const error = new Error('player1Id and player2Id must be different');
    error.statusCode = 400;
    throw error;
  }

  const player1 = getPlayerById(player1Id);
  const player2 = getPlayerById(player2Id);

  if (!player1 || !player2) {
    const error = new Error('Player not found');
    error.statusCode = 404;
    throw error;
  }

  const game = {
    id: getNextId('game'),
    tournamentId,
    round,
    matchIndex,
    player1Id,
    player2Id,
    scorePlayer1: 0,
    scorePlayer2: 0,
    status: 'ongoing',
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
  return toGameResponse(game);
}

function endGame(gameId, { winnerId, scorePlayer1, scorePlayer2 }) {
  const game = db.games.find((item) => item.id === gameId);
  if (!game) {
    const error = new Error('Game not found');
    error.statusCode = 404;
    throw error;
  }

  if (game.status === 'finished') {
    const error = new Error('Game already finished');
    error.statusCode = 400;
    throw error;
  }

  if (winnerId !== game.player1Id && winnerId !== game.player2Id) {
    const error = new Error('winnerId must be one of the two players');
    error.statusCode = 400;
    throw error;
  }

  const player1 = getPlayerById(game.player1Id);
  const player2 = getPlayerById(game.player2Id);
  const winner = winnerId === player1.id ? player1 : player2;
  const loser = winnerId === player1.id ? player2 : player1;

  const winnerOldElo = winner.elo;
  const loserOldElo = loser.elo;

  const winnerDelta = Math.round(elo_adder(winnerOldElo, loserOldElo, 1));
  const loserDelta = Math.round(elo_adder(loserOldElo, winnerOldElo, -1));

  winner.elo = Math.max(0, winnerOldElo + winnerDelta);
  loser.elo = Math.max(0, loserOldElo + loserDelta);

  winner.wins += 1;
  loser.losses += 1;

  game.status = 'finished';
  game.winnerId = winnerId;
  game.scorePlayer1 = Number.isInteger(scorePlayer1) ? scorePlayer1 : game.player1Id === winnerId ? 10 : 7;
  game.scorePlayer2 = Number.isInteger(scorePlayer2) ? scorePlayer2 : game.player2Id === winnerId ? 10 : 7;

  game.player1OldElo = winnerId === player1.id ? winnerOldElo : loserOldElo;
  game.player1NewElo = winnerId === player1.id ? winner.elo : loser.elo;
  game.player2OldElo = winnerId === player2.id ? winnerOldElo : loserOldElo;
  game.player2NewElo = winnerId === player2.id ? winner.elo : loser.elo;

  advanceTournamentBracketFromGame(game);

  return {
    id: game.id,
    status: game.status,
    winnerId: game.winnerId,
    player1: {
      id: player1.id,
      username: player1.username,
      oldElo: game.player1OldElo,
      newElo: game.player1NewElo
    },
    player2: {
      id: player2.id,
      username: player2.username,
      oldElo: game.player2OldElo,
      newElo: game.player2NewElo
    }
  };
}

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  endGame
};

