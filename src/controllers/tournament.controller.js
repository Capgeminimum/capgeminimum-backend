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

async function getTournamentById(req, res) {
    try {
        const tournamentId = parseInt(req.params.id);
        const tournament = await tournamentService.getTournamentById(tournamentId);
        return res.status(200).json(tournament);
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ error: error.message });
        }
        console.error('[TournamentController] getTournamentById:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function createTournament(req, res) {
    try {
        const { name, playerIds } = req.body;

        if (!Array.isArray(playerIds) || playerIds.length === 0) {
            return res.status(400).json({ error: 'playerIds is required' });
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

async function startTournament(req, res) {
    try {
        const tournamentId = parseInt(req.params.id);
        const result = await tournamentService.startTournament(tournamentId);
        return res.status(200).json(result);
    } catch (error) {
        if (error.statusCode === 404) {
            return res.status(404).json({ error: error.message });
        }
        if (error.statusCode === 400) {
            return res.status(400).json({ error: error.message });
        }
        console.error('[TournamentController] startTournament:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAllTournaments,
    getTournamentById,
    createTournament,
    startTournament,
};