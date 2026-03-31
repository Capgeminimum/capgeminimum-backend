const express = require('express');
const gamesController = require('../controllers/games.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * GET /api/games
 * Récupérer tous les matchs
 */
router.get('/', gamesController.getAllGames);

/**
 * GET /api/games/:id
 * Récupérer un match par ID
 */
router.get('/:id', gamesController.getGameById);

/**
 * GET /api/games/tournament/:tournamentId
 * Récupérer les matchs d'un tournoi
 */
router.get('/tournament/:tournamentId', gamesController.getGamesByTournament);

/**
 * POST /api/games
 * Créer un match (protégé)
 */
router.post('/', authMiddleware, gamesController.createGame);

/**
 * PUT /api/games/:id
 * Mettre à jour un match (protégé)
 */
router.put('/:id', authMiddleware, gamesController.updateGame);

module.exports = router;

