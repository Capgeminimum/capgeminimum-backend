const gamesService = require('../services/games.service');

function getAllGames(req, res) {
  const games = gamesService.getAllGames();
  return res.status(200).json(games);
}

function getGameById(req, res) {
  const gameId = Number.parseInt(req.params.id, 10);
  const game = gamesService.getGameById(gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  return res.status(200).json(game);
}

function createGame(req, res) {
  const { player1Id, player2Id } = req.body;

  if (!Number.isInteger(player1Id) || !Number.isInteger(player2Id)) {
    return res.status(400).json({ error: 'player1Id and player2Id must be integers' });
  }

  try {
    const game = gamesService.createGame({ player1Id, player2Id });
    return res.status(201).json(game);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function endGame(req, res) {
  const gameId = Number.parseInt(req.params.id, 10);
  const { winnerId, scorePlayer1, scorePlayer2 } = req.body;

  if (!Number.isInteger(winnerId)) {
    return res.status(400).json({ error: 'winnerId must be an integer' });
  }

  try {
    const game = gamesService.endGame(gameId, { winnerId, scorePlayer1, scorePlayer2 });
    return res.status(200).json(game);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllGames,
  getGameById,
  createGame,
  endGame
};

