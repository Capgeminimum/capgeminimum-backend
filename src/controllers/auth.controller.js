const authService = require('../services/auth.service');

class AuthController {

  async register(req, res) {
    try {
      const { username, email, phone, password, confirmPassword } = req.body;

      if (!username || !email || !phone || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }

      const result = await authService.register(username, email, phone, password);

      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }


  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' });
      }

      const result = await authService.login(username, password);

      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await authService.getUserById(userId);

      if (!result.success) {
        return res.status(404).json({ error: result.message });
      }

      res.status(200).json({
        success: true,
        user: result.user,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  /**
   * Vérifier si le token est valide
   */
  verifyToken(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Token valide',
        user: req.user,
      });
    } catch (error) {
      res.status(401).json({ error: 'Token invalide' });
    }
  }
}

module.exports = new AuthController();

