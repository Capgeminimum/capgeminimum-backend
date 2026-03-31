const express = require('express');
const playersController = require('../controllers/players.controller');

const router = express.Router();

router.get('/', playersController.getAllPlayers);
router.get('/:id', playersController.getPlayerById);
router.get('/:id/games', playersController.getPlayerGames);
router.post('/', playersController.createPlayer);

module.exports = router;

