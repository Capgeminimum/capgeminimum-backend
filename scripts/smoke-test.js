const assert = require('assert');
const playersService = require('../src/services/players.service');
const gamesService = require('../src/services/games.service');
const tournamentService = require('../src/services/tournament.service');

function run() {
  const initialPlayers = playersService.getAllPlayers();
  assert.ok(initialPlayers.length >= 4, 'Il faut au moins 4 joueurs mockes');

  const game = gamesService.createGame({ player1Id: initialPlayers[0].id, player2Id: initialPlayers[1].id });
  assert.strictEqual(game.status, 'ongoing');

  const endedGame = gamesService.endGame(game.id, { winnerId: game.player1.id });
  assert.strictEqual(endedGame.status, 'finished');
  assert.ok(endedGame.player1.newElo !== endedGame.player1.oldElo, 'ELO joueur 1 non mis a jour');

  const createdTournament = tournamentService.createTournament({
    name: 'Smoke Tournament',
    playerIds: initialPlayers.slice(0, 4).map((player) => player.id)
  });
  assert.strictEqual(createdTournament.status, 'pending');

  const startedTournament = tournamentService.startTournament(createdTournament.id);
  assert.strictEqual(startedTournament.status, 'ongoing');
  assert.strictEqual(startedTournament.bracket.length, 2);

  console.log('Smoke test OK');
}

run();

