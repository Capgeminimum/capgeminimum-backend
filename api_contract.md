# Capgeminimum — API Contract

> Ce document est la référence commune entre le backend et le frontend.  
> Toute modification doit être discutée et validée avant d'être appliquée.  
> Base URL : `http://localhost:3000/api`

---

## Conventions

- Toutes les réponses sont en JSON
- Les dates sont en format ISO 8601 : `"2024-03-15T14:30:00Z"`
- En cas d'erreur, la réponse contient toujours : `{ "error": "message explicite" }`
- Codes HTTP utilisés : `200` OK, `201` Créé, `400` Mauvaise requête, `404` Introuvable, `500` Erreur serveur

---

## Players

### GET `/players`
Retourne la liste de tous les joueurs, triée par ELO décroissant (leaderboard).

**Response 200**
```json
[
  {
    "id": 1,
    "username": "shadow99",
    "elo": 1243,
    "wins": 12,
    "losses": 4,
    "createdAt": "2024-03-01T10:00:00Z"
  }
]
```

---

### GET `/players/:id`
Retourne un joueur par son ID.

**Response 200**
```json
{
  "id": 1,
  "username": "shadow99",
  "elo": 1243,
  "wins": 12,
  "losses": 4,
  "createdAt": "2024-03-01T10:00:00Z"
}
```

**Response 404**
```json
{ "error": "Player not found" }
```

---

### POST `/players`
Crée un nouveau joueur.

**Body**
```json
{
  "username": "shadow99"
}
```

**Response 201**
```json
{
  "id": 1,
  "username": "shadow99",
  "elo": 1000,
  "wins": 0,
  "losses": 0,
  "createdAt": "2024-03-15T14:30:00Z"
}
```

**Response 400**
```json
{ "error": "Username already taken" }
```

---

## Games

### GET `/games`
Retourne la liste de tous les matchs.

**Response 200**
```json
[
  {
    "id": 1,
    "player1": { "id": 1, "username": "shadow99" },
    "player2": { "id": 2, "username": "mario64" },
    "scorePlayer1": 10,
    "scorePlayer2": 7,
    "winnerId": 1,
    "eloChange": 18,
    "playedAt": "2024-03-15T14:30:00Z"
  }
]
```

---

### GET `/games/:id`
Retourne un match par son ID.

**Response 200**
```json
{
  "id": 1,
  "player1": { "id": 1, "username": "shadow99" },
  "player2": { "id": 2, "username": "mario64" },
  "scorePlayer1": 10,
  "scorePlayer2": 7,
  "winnerId": 1,
  "eloChange": 18,
  "playedAt": "2024-03-15T14:30:00Z"
}
```

---

### POST `/games`
Crée et démarre un nouveau match entre deux joueurs.

**Body**
```json
{
  "player1Id": 1,
  "player2Id": 2
}
```

**Response 201**
```json
{
  "id": 1,
  "player1": { "id": 1, "username": "shadow99", "elo": 1243 },
  "player2": { "id": 2, "username": "mario64", "elo": 1100 },
  "scorePlayer1": 0,
  "scorePlayer2": 0,
  "status": "ongoing",
  "playedAt": "2024-03-15T14:30:00Z"
}
```

---

### PATCH `/games/:id/end`
Termine un match et déclenche le recalcul ELO.

**Body**
```json
{
  "winnerId": 1
}
```

**Response 200**
```json
{
  "id": 1,
  "winnerId": 1,
  "eloChange": 18,
  "player1": { "id": 1, "username": "shadow99", "oldElo": 1243, "newElo": 1261 },
  "player2": { "id": 2, "username": "mario64", "oldElo": 1100, "newElo": 1082 }
}
```

---

## Tournaments

### GET `/tournaments`
Retourne la liste de tous les tournois.

**Response 200**
```json
[
  {
    "id": 1,
    "name": "Tournoi Mars 2024",
    "status": "ongoing",
    "playerCount": 8,
    "createdAt": "2024-03-15T14:30:00Z"
  }
]
```

---

### GET `/tournaments/:id`
Retourne un tournoi avec son bracket complet.

**Response 200**
```json
{
  "id": 1,
  "name": "Tournoi Mars 2024",
  "status": "ongoing",
  "players": [
    { "id": 1, "username": "shadow99" }
  ],
  "bracket": [
    {
      "round": 1,
      "matches": [
        {
          "matchId": 1,
          "player1": { "id": 1, "username": "shadow99" },
          "player2": { "id": 2, "username": "mario64" },
          "winnerId": null,
          "status": "ongoing"
        }
      ]
    }
  ]
}
```

---

### POST `/tournaments`
Crée un nouveau tournoi.

**Body**
```json
{
  "name": "Tournoi Mars 2024",
  "playerIds": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

**Response 201**
```json
{
  "id": 1,
  "name": "Tournoi Mars 2024",
  "status": "pending",
  "playerCount": 8,
  "createdAt": "2024-03-15T14:30:00Z"
}
```

**Response 400**
```json
{ "error": "Player count must be a power of 2 (4, 8, 16...)" }
```

---

### PATCH `/tournaments/:id/start`
Lance le tournoi et génère le bracket automatiquement.

**Response 200**
```json
{
  "id": 1,
  "status": "ongoing",
  "bracket": [
    {
      "round": 1,
      "matches": [
        {
          "matchId": 1,
          "player1": { "id": 1, "username": "shadow99" },
          "player2": { "id": 8, "username": "zeus42" },
          "winnerId": null,
          "status": "pending"
        }
      ]
    }
  ]
}
```

---

## IoT — Scores en temps réel

> ⚠️ Ce module est en attente. L'endpoint est défini ici pour référence mais ne sera pas implémenté dans l'immédiat.

### POST `/iot/score`
Reçoit le score en cours depuis l'Arduino.

**Body**
```json
{
  "gameId": 1,
  "scorePlayer1": 3,
  "scorePlayer2": 2
}
```

**Response 200**
```json
{ "status": "ok" }
```

---

## WebSocket

> ⚠️ Également en attente, lié au module IoT.

Endpoint : `ws://localhost:3000`  
Événement émis à chaque mise à jour de score :
```json
{
  "event": "score_update",
  "gameId": 1,
  "scorePlayer1": 3,
  "scorePlayer2": 2
}
```