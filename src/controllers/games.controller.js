const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

class GamesController {
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
   * GET /api/games - Récupérer tous les matchs
   */
  async getAllGames(req, res) {
    try {
      await this.connect();

      const result = await this.client.query(
        `SELECT g.id, g.id_tournament, g.id_player1, g.id_player2, 
                g.score_player1, g.score_player2, g.played_at, g.winner,
                p1.username as player1_name, p2.username as player2_name
         FROM games g
         LEFT JOIN player p1 ON g.id_player1 = p1.id
         LEFT JOIN player p2 ON g.id_player2 = p2.id
         ORDER BY g.played_at DESC`
      );

      res.status(200).json({
        success: true,
        games: result.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * GET /api/games/:id - Récupérer un match par ID
   */
  async getGameById(req, res) {
    try {
      const { id } = req.params;

      await this.connect();

      const result = await this.client.query(
        `SELECT g.id, g.id_tournament, g.id_player1, g.id_player2, 
                g.score_player1, g.score_player2, g.played_at, g.winner,
                p1.username as player1_name, p2.username as player2_name
         FROM games g
         LEFT JOIN player p1 ON g.id_player1 = p1.id
         LEFT JOIN player p2 ON g.id_player2 = p2.id
         WHERE g.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Match non trouvé' });
      }

      res.status(200).json({
        success: true,
        game: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du match:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * GET /api/games/tournament/:tournamentId - Matchs d'un tournoi
   */
  async getGamesByTournament(req, res) {
    try {
      const { tournamentId } = req.params;

      await this.connect();

      const result = await this.client.query(
        `SELECT g.id, g.id_tournament, g.id_player1, g.id_player2, 
                g.score_player1, g.score_player2, g.played_at, g.winner,
                p1.username as player1_name, p2.username as player2_name
         FROM games g
         LEFT JOIN player p1 ON g.id_player1 = p1.id
         LEFT JOIN player p2 ON g.id_player2 = p2.id
         WHERE g.id_tournament = $1
         ORDER BY g.played_at DESC`,
        [tournamentId]
      );

      res.status(200).json({
        success: true,
        games: result.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des matchs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * POST /api/games - Créer un match
   */
  async createGame(req, res) {
    try {
      const { id_tournament, id_player1, id_player2, score_player1, score_player2, winner } = req.body;

      if (!id_tournament || !id_player1 || !id_player2 || score_player1 === undefined || score_player2 === undefined) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      await this.connect();

      const result = await this.client.query(
        `INSERT INTO games (id_tournament, id_player1, id_player2, score_player1, score_player2, played_at, winner)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         RETURNING id, id_tournament, id_player1, id_player2, score_player1, score_player2, played_at, winner`,
        [id_tournament, id_player1, id_player2, score_player1, score_player2, winner]
      );

      res.status(201).json({
        success: true,
        message: 'Match créé',
        game: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la création du match:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * PUT /api/games/:id - Mettre à jour un match
   */
  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { score_player1, score_player2, winner } = req.body;

      await this.connect();

      const result = await this.client.query(
        `UPDATE games SET score_player1 = COALESCE($1, score_player1), score_player2 = COALESCE($2, score_player2), winner = COALESCE($3, winner)
         WHERE id = $4
         RETURNING id, id_tournament, id_player1, id_player2, score_player1, score_player2, winner`,
        [score_player1, score_player2, winner, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Match non trouvé' });
      }

      res.status(200).json({
        success: true,
        message: 'Match mis à jour',
        game: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = new GamesController();

