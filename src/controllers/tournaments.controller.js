const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

class TournamentsController {
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
   * GET /api/tournaments - Récupérer tous les tournois
   */
  async getAllTournaments(req, res) {
    try {
      await this.connect();

      const result = await this.client.query(
        `SELECT t.id, t.nb_participants, t.user_id, t.winner, t.id_winner, t.elo_winner, t.duo, t.date,
                p.username as creator_name
         FROM tournament t
         LEFT JOIN player p ON t.user_id = p.id
         ORDER BY t.date DESC`
      );

      res.status(200).json({
        success: true,
        tournaments: result.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tournois:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * GET /api/tournaments/:id - Récupérer un tournoi par ID
   */

  async getTournamentById(req, res) {
    try {
      const { id } = req.params;

      await this.connect();

      const result = await this.client.query(
        `SELECT t.id, t.nb_participants, t.user_id, t.winner, t.id_winner, t.elo_winner, t.duo, t.date,
                p.username as creator_name
         FROM tournament t
         LEFT JOIN player p ON t.user_id = p.id
         WHERE t.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tournoi non trouvé' });
      }

      // Récupérer aussi les participants et les matchs du tournoi
      const participantsResult = await this.client.query(
        `SELECT pa.id, pa.tournament_id, pa.user_id, p.username
         FROM participant pa
         LEFT JOIN player p ON pa.user_id = p.id
         WHERE pa.tournament_id = $1`,
        [id]
      );

      const gamesResult = await this.client.query(
        `SELECT g.id, g.id_player1, g.id_player2, g.score_player1, g.score_player2, g.winner,
                p1.username as player1_name, p2.username as player2_name
         FROM games g
         LEFT JOIN player p1 ON g.id_player1 = p1.id
         LEFT JOIN player p2 ON g.id_player2 = p2.id
         WHERE g.id_tournament = $1`,
        [id]
      );

      res.status(200).json({
        success: true,
        tournament: result.rows[0],
        participants: participantsResult.rows,
        games: gamesResult.rows,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du tournoi:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * POST /api/tournaments - Créer un tournoi
   */
  async createTournament(req, res) {
    try {
      const { nb_participants, duo } = req.body;
      const user_id = req.user.id;

      if (!nb_participants) {
        return res.status(400).json({ error: 'nb_participants requis' });
      }

      await this.connect();

      const result = await this.client.query(
        `INSERT INTO tournament (nb_participants, user_id, winner, id_winner, elo_winner, duo, date)
         VALUES ($1, $2, NULL, NULL, NULL, $3, NOW())
         RETURNING id, nb_participants, user_id, duo, date`,
        [nb_participants, user_id, duo || false]
      );

      res.status(201).json({
        success: true,
        message: 'Tournoi créé',
        tournament: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la création du tournoi:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * PUT /api/tournaments/:id - Mettre à jour un tournoi
   */
  async updateTournament(req, res) {
    try {
      const { id } = req.params;
      const { winner, id_winner, elo_winner } = req.body;

      await this.connect();

      const result = await this.client.query(
        `UPDATE tournament SET winner = COALESCE($1, winner), id_winner = COALESCE($2, id_winner), elo_winner = COALESCE($3, elo_winner)
         WHERE id = $4
         RETURNING id, nb_participants, user_id, winner, id_winner, elo_winner, duo, date`,
        [winner, id_winner, elo_winner, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tournoi non trouvé' });
      }

      res.status(200).json({
        success: true,
        message: 'Tournoi mis à jour',
        tournament: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * POST /api/tournaments/:id/participants - Ajouter un participant
   */
  async addParticipant(req, res) {
    try {
      const { id } = req.params;
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id requis' });
      }

      await this.connect();

      const result = await this.client.query(
        `INSERT INTO participant (tournament_id, user_id)
         VALUES ($1, $2)
         RETURNING id, tournament_id, user_id`,
        [id, user_id]
      );

      res.status(201).json({
        success: true,
        message: 'Participant ajouté',
        participant: result.rows[0],
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du participant:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }

  /**
   * DELETE /api/tournaments/:id - Supprimer un tournoi
   */

  async deleteTournament(req, res) {
    try {
      const { id } = req.params;

      await this.connect();

      // Supprimer les participants et matchs associés

      await this.client.query('DELETE FROM games WHERE id_tournament = $1', [id]);
      await this.client.query('DELETE FROM participant WHERE tournament_id = $1', [id]);
      const result = await this.client.query('DELETE FROM tournament WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tournoi non trouvé' });
      }

      res.status(200).json({
        success: true,
        message: 'Tournoi supprimé',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = new TournamentsController();

