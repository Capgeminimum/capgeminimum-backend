const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');


router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.post('/', tournamentController.createTournament);
router.patch('/:id/start', tournamentController.startTournament);

module.exports = router;