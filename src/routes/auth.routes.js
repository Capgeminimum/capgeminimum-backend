const express = require('express');
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/profile
 * Récupérer le profil de l'utilisateur connecté
 * Nécessite un token JWT valide
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * GET /api/auth/verify
 * Vérifier si le token est valide
 * Nécessite un token JWT valide
 */
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;

