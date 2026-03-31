const { db, getNextId, nowIso } = require('../models/mockDb');

function getAllPlayers() {
  return [...db.players].sort((a, b) => b.elo - a.elo || a.username.localeCompare(b.username));
}

function getPlayerById(playerId) {
  return db.players.find((player) => player.id === playerId) || null;
}

function getPlayerGames(playerId) {
  const finishedGames = db.games
    .filter((game) => game.status === 'finished' && (game.player1Id === playerId || game.player2Id === playerId))
    .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

  return finishedGames.map((game) => {
    const isPlayer1 = game.player1Id === playerId;
    const opponentId = isPlayer1 ? game.player2Id : game.player1Id;
    const opponent = getPlayerById(opponentId);

    return {
      id: game.id,
      opponent: opponent ? { id: opponent.id, username: opponent.username } : null,
      scorePlayer: isPlayer1 ? game.scorePlayer1 : game.scorePlayer2,
      scoreOpponent: isPlayer1 ? game.scorePlayer2 : game.scorePlayer1,
      result: game.winnerId === playerId ? 'win' : 'loss',
      oldElo: isPlayer1 ? game.player1OldElo : game.player2OldElo,
      newElo: isPlayer1 ? game.player1NewElo : game.player2NewElo,
      playedAt: game.playedAt
    };
  });
}

function createPlayer(username) {
  const exists = db.players.some((player) => player.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    const error = new Error('Username already taken');
    error.statusCode = 400;
    throw error;
  }

  const player = {
    id: getNextId('player'),
    username,
    elo: 1000,
    wins: 0,
    losses: 0,
    createdAt: nowIso()
  };

  db.players.push(player);
  return player;
}

module.exports = {
  getAllPlayers,
  getPlayerById,
  getPlayerGames,
  createPlayer
};

