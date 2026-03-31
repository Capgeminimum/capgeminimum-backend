const tournamentService = require('../services/tournament.service');

function getAllTournaments(req, res) {
  const tournaments = tournamentService.getAllTournaments();
  return res.status(200).json(tournaments);
}

function getTournamentById(req, res) {
  const tournamentId = Number.parseInt(req.params.id, 10);

  try {
    const tournament = tournamentService.getTournamentById(tournamentId);
    return res.status(200).json(tournament);
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function createTournament(req, res) {
  const { name, playerIds } = req.body;

  if (!Array.isArray(playerIds) || playerIds.length === 0) {
    return res.status(400).json({ error: 'playerIds is required' });
  }

  try {
    const tournament = tournamentService.createTournament({ name, playerIds });
    return res.status(201).json(tournament);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function startTournament(req, res) {
  const tournamentId = Number.parseInt(req.params.id, 10);

  try {
    const result = tournamentService.startTournament(tournamentId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode === 400 || error.statusCode === 404) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  startTournament
};

