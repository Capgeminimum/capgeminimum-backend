const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');


router.get('/', tournamentController.getAllTournaments);
router.post('/', tournamentController.createTournament);

module.exports = router;