const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

class AuthService {
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

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }


  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }


  generateToken(playerId, username) {
    return jwt.sign(
      { id: playerId, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }


  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }


  async register(username, email, phone, password) {
    try {
      await this.connect();

      const existingUser = await this.client.query(
        'SELECT id FROM player WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Username ou email déjà utilisé');
      }

      const hashedPassword = await this.hashPassword(password);

      const result = await this.client.query(
        `INSERT INTO player (username, email, phone, password, admin, elo, looses, wins, winrate, tournament_wins, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id, username, email`,
        [username, email, phone, hashedPassword, false, 1000, 0, 0, 0.0, 0]
      );

      const user = result.rows[0];
      const token = this.generateToken(user.id, user.username);

      return {
        success: true,
        message: 'Utilisateur créé avec succès',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      await this.disconnect();
    }
  }


  async login(username, password) {
    try {
      await this.connect();

      const result = await this.client.query(
        'SELECT id, username, email, password FROM player WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const user = result.rows[0];

      const isPasswordValid = await this.comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
      }

      const token = this.generateToken(user.id, user.username);

      return {
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      await this.disconnect();
    }
  }


  async getUserById(userId) {
    try {
      await this.connect();

      const result = await this.client.query(
        'SELECT id, username, email, phone, admin, elo, looses, wins, winrate, tournament_wins, "createdAt" FROM player WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      return {
        success: true,
        user: result.rows[0],
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    } finally {
      await this.disconnect();
    }
  }
}

module.exports = new AuthService();
