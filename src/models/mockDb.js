const nowIso = () => new Date().toISOString();

const db = {
  players: [
    { id: 1, username: 'shadow99', elo: 1243, wins: 12, losses: 4, createdAt: nowIso() },
    { id: 2, username: 'mario64', elo: 1100, wins: 8, losses: 9, createdAt: nowIso() },
    { id: 3, username: 'zeldaPro', elo: 1180, wins: 10, losses: 6, createdAt: nowIso() },
    { id: 4, username: 'neo', elo: 1032, wins: 4, losses: 12, createdAt: nowIso() },
    { id: 5, username: 'samus', elo: 1210, wins: 11, losses: 7, createdAt: nowIso() },
    { id: 6, username: 'fox', elo: 995, wins: 3, losses: 5, createdAt: nowIso() },
    { id: 7, username: 'kirby', elo: 1088, wins: 7, losses: 8, createdAt: nowIso() },
    { id: 8, username: 'falcon', elo: 1135, wins: 9, losses: 8, createdAt: nowIso() }
  ],
  games: [],
  tournaments: [],
  nextIds: {
    player: 9,
    game: 1,
    tournament: 1
  }
};

function getNextId(entityName) {
  const nextId = db.nextIds[entityName];
  db.nextIds[entityName] += 1;
  return nextId;
}

module.exports = {
  db,
  getNextId,
  nowIso
};

