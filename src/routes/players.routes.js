const express = require('express');
const playerController = require('../controllers/players.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * GET /api/players
 * Récupérer tous les joueurs
 */
router.get('/', playerController.getAllPlayers);

/**
 * GET /api/players/leaderboard/top
 * Récupérer le top 10 des joueurs
 */
router.get('/leaderboard/top', playerController.getTopPlayers);

/**
 * GET /api/players/:id
 * Récupérer un joueur par ID
 */
router.get('/:id', playerController.getPlayerById);

/**
 * PUT /api/players/:id
 * Mettre à jour un joueur (protégé)
 */
router.put('/:id', authMiddleware, playerController.updatePlayer);

module.exports = router;

