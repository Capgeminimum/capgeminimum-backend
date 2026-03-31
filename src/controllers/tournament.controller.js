const tournamentService = require('../services/tournament.service');

async function getAllTournaments(req, res) {
    try {
        const tournaments = await tournamentService.getAllTournaments();
        return res.status(200).json(tournaments);
    } catch (error) {
        console.error('[TournamentController] getAllTournaments:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function createTournament(req, res) {
    try {
        const { name, playerIds } = req.body;

        if (!name || !Array.isArray(playerIds) || playerIds.length === 0) {
            return res.status(400).json({ error: 'name and playerIds are required' });
        }

        const tournament = await tournamentService.createTournament({ name, playerIds });
        return res.status(201).json(tournament);
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ error: error.message });
        }
        console.error('[TournamentController] createTournament:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllTournaments,
    createTournament,
};