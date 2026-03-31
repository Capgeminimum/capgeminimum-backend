const playersService = require('../services/players.service');

function getAllPlayers(req, res) {
  const players = playersService.getAllPlayers();
  return res.status(200).json(players);
}

function getPlayerById(req, res) {
  const playerId = Number.parseInt(req.params.id, 10);
  const player = playersService.getPlayerById(playerId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  return res.status(200).json(player);
}

function getPlayerGames(req, res) {
  const playerId = Number.parseInt(req.params.id, 10);
  const player = playersService.getPlayerById(playerId);

  if (!player) {
    return res.status(404).json({ error: 'Player not found' });
  }

  const games = playersService.getPlayerGames(playerId);
  return res.status(200).json(games);
}

function createPlayer(req, res) {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'username is required' });
  }

  try {
    const player = playersService.createPlayer(username.trim());
    return res.status(201).json(player);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllPlayers,
  getPlayerById,
  getPlayerGames,
  createPlayer
};

