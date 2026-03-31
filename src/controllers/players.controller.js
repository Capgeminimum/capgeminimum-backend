const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

class PlayerController {
  constructor() {
    this.client = new Client({
      connectionString: DATABASE_URL,
    });
  }

  async connect() {
    await this.client.connect();
  }

  async disconnect() {
    await this.client.end();
  }

  /**
   * GET /api/players - Récupérer tous les joueurs
   */
  async getAllPlayers(req, res) {
    try {
      await this.connect();

      const result = await this.client.query(
        'SELECT id, username, email, phone, admin, elo, wins, looses, winrate, tournament_wins, "createdAt" FROM player ORDER BY elo DESC'
      );

      res.status(200).json({
        success: true,
        players: result.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * GET /api/players/:id - Récupérer un joueur par ID
   */
  async getPlayerById(req, res) {
    try {
      const { id } = req.params;

      await this.connect();

      const result = await this.client.query(
        'SELECT id, username, email, phone, admin, elo, wins, looses, winrate, tournament_wins, "createdAt" FROM player WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Joueur non trouvé' });
      }

      res.status(200).json({
        success: true,
        player: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du joueur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * PUT /api/players/:id - Mettre à jour un joueur
   */
  async updatePlayer(req, res) {
    try {
      const { id } = req.params;
      const { email, phone, elo } = req.body;

      await this.connect();

      const result = await this.client.query(
        `UPDATE player SET email = COALESCE($1, email), phone = COALESCE($2, phone), elo = COALESCE($3, elo), "updatedAt" = NOW()
         WHERE id = $4
         RETURNING id, username, email, phone, elo`,
        [email, phone, elo, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Joueur non trouvé' });
      }

      res.status(200).json({
        success: true,
        message: 'Joueur mis à jour',
        player: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * GET /api/players/leaderboard/top - Top 10 des joueurs
   */
  async getTopPlayers(req, res) {
    try {
      await this.connect();

      const result = await this.client.query(
        'SELECT id, username, elo, wins, looses, winrate, tournament_wins FROM player ORDER BY elo DESC LIMIT 10'
      );

      res.status(200).json({
        success: true,
        topPlayers: result.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du top:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = new PlayerController();

