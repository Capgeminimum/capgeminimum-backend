# Capgeminimum Backend

Backend Node.js/Express du projet Capgeminimum (baby-foot connecte).

Ce repository contient l'API REST, la logique metier tournoi, et la base de travail Prisma/PostgreSQL.

## Etat actuel

- API serveur operationnelle via `index.js`
- Healthcheck disponible
- Module tournoi branche sur les routes (`/api/tournaments`)
- Prisma present et configure (schema + client)
- Modules Players/Games prevus dans le contrat API, integration en cours

## Stack technique

- Node.js
- Express
- JavaScript CommonJS (`require` / `module.exports`)
- Prisma ORM
- PostgreSQL
- Dotenv

## Structure du projet

```text
.
|- index.js
|- api_contract.md
|- prisma/
|  |- schema.prisma
|  |- seed-db.js
|- src/
   |- controllers/
   |- routes/
   |- services/
   |- models/
```

## Installation

```bash
npm install
```

## Lancer le serveur

```bash
npm run dev
```

ou

```bash
npm start
```

Serveur par defaut: `http://localhost:3000`

## Endpoints actuellement branches

- `GET /health`
- `GET /api/tournaments`
- `GET /api/tournaments/:id`
- `POST /api/tournaments`
- `PATCH /api/tournaments/:id/start`

Details de contrat: `api_contract.md`

## Scripts npm

- `npm run dev` : demarrage avec nodemon
- `npm start` : demarrage standard
- `npm run prisma:generate` : generation du client Prisma

## Configuration environnement

Creer un fichier `.env` avec au minimum:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

## Prisma

Generer le client:

```bash
npm run prisma:generate
```

Apres finalisation schema/migrations, vous pourrez lancer les commandes Prisma standard (`migrate`, `db push`, `studio`) selon votre workflow d'equipe.

## Fonctionnalites backend (rapport)

- Healthcheck API pour verifier rapidement l'etat du serveur.
- Gestion des tournois (creation, recuperation, demarrage).
- Generation de bracket en elimination directe cote service tournoi.
- Architecture en couches (`routes -> controllers -> services`) pour separer HTTP et logique metier.
- Contrat d'API centralise dans `api_contract.md` pour aligner frontend/backend.
- Base Prisma/PostgreSQL prete pour passer de la logique mock a la persistance reelle.

## Roadmap court terme

- Brancher routes Players et Games dans `index.js`
- Connecter toute la logique metier a Prisma
- Ajouter des tests API (smoke + scenarios metier)
- Finaliser la partie IoT/WebSocket (hors scope prioritaire)

