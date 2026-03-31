const express = require('express');
const gamesController = require('../controllers/games.controller');

const router = express.Router();

router.get('/', gamesController.getAllGames);
router.get('/:id', gamesController.getGameById);
router.post('/', gamesController.createGame);
router.patch('/:id/end', gamesController.endGame);

module.exports = router;

