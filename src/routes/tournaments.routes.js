const express = require('express');
const tournamentsController = require('../controllers/tournaments.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();


router.get('/', tournamentsController.getAllTournaments);


router.get('/:id', tournamentsController.getTournamentById);


router.post('/', authMiddleware, tournamentsController.createTournament);

router.put('/:id', authMiddleware, tournamentsController.updateTournament);


router.post('/:id/participants', authMiddleware, tournamentsController.addParticipant);


router.delete('/:id', authMiddleware, tournamentsController.deleteTournament);

module.exports = router;

