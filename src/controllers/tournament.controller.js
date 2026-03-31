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

module.exports = {
    getAllTournaments,
};