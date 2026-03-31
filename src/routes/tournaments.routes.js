const express = require('express');
const tournamentsController = require('../controllers/tournaments.controller');

const router = express.Router();

router.get('/', tournamentsController.getAllTournaments);
router.get('/:id', tournamentsController.getTournamentById);
router.post('/', tournamentsController.createTournament);
router.patch('/:id/start', tournamentsController.startTournament);

module.exports = router;

