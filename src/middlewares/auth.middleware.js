const authService = require('../services/auth.service');


function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({error: 'Token manquant ou invalide'});
        }

        const token = authHeader.substring(7);

        const decoded = authService.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({error: 'Token invalide ou expiré'});
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({error: 'Authentification échouée'});
    }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
};

