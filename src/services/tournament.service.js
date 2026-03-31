const prisma = require('../models/prismaClient');

function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function groupByRound(games) {
    const rounds = {};
    for (const g of games) {
        if (!rounds[g.round]) rounds[g.round] = [];
        rounds[g.round].push(g);
    }
    return Object.entries(rounds).map(([round, matches]) => ({
        round: parseInt(round),
        matches: matches.map((g) => ({
            matchId: g.id,
            player1: g.player1 ? { id: g.player1.id, username: g.player1.username } : null,
            player2: g.player2 ? { id: g.player2.id, username: g.player2.username } : null,
            winnerId: g.winner ?? null,
            status: g.status ?? 'pending',
        })),
    }));
}



async function getAllTournaments() {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { date: 'desc' },
        include: {
            _count: { select: { participant: true } },
        },
    });

    return tournaments.map((t) => ({
        id: t.id,
        name: `Tournoi #${t.id}`,
        status: t.winner ? 'finished' : 'ongoing',
        playerCount: t.nb_participants,
        createdAt: t.date,
    }));
}

async function getTournamentById(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            participant: true,
        },
    });

    if (!tournament) {
        const error = new Error('Tournament not found');
        error.statusCode = 404;
        throw error;
    }

    const players = await prisma.player.findMany({
        where: { id: { in: tournament.participant.map((p) => p.user_id) } },
        select: { id: true, username: true },
    });

    const games = await prisma.games.findMany({
        where: { id_tournament: tournamentId },
        orderBy: { played_at: 'asc' },
    });

    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

    const enrichedGames = games.map((g) => ({
        ...g,
        round: g.round ?? 1,
        player1: playerMap[g.id_player1] ?? null,
        player2: playerMap[g.id_player2] ?? null,
        status: g.winner ? 'finished' : 'ongoing',
    }));

    return {
        id: tournament.id,
        name: `Tournoi #${tournament.id}`,
        status: tournament.winner ? 'finished' : 'ongoing',
        players,
        bracket: groupByRound(enrichedGames),
    };
}

async function createTournament({ name, playerIds }) {
    if (!isPowerOfTwo(playerIds.length)) {
        const error = new Error('Player count must be a power of 2 (4, 8, 16...)');
        error.statusCode = 400;
        throw error;
    }

    const tournament = await prisma.tournament.create({
        data: {
            nb_participants: playerIds.length,
            user_id: 0,
            winner: '',
            id_winner: 0,
            elo_winner: 0,
            participant: {
                create: playerIds.map((id) => ({ user_id: id })),
            },
        },
        include: {
            _count: { select: { participant: true } },
        },
    });

    return {
        id: tournament.id,
        name: name ?? `Tournoi #${tournament.id}`,
        status: 'pending',
        playerCount: tournament._count.participant,
        createdAt: tournament.date,
    };
}

async function startTournament(tournamentId) {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: { participant: true },
    });

    if (!tournament) {
        const error = new Error('Tournament not found');
        error.statusCode = 404;
        throw error;
    }

    const existingGames = await prisma.games.findFirst({
        where: { id_tournament: tournamentId },
    });

    if (existingGames) {
        const error = new Error('Tournament is already started');
        error.statusCode = 400;
        throw error;
    }

    const players = await prisma.player.findMany({
        where: { id: { in: tournament.participant.map((p) => p.user_id) } },
        select: { id: true, username: true },
    });

    //TODO: Rajouter la logique de Matteo pour mettre les bons joueurs
    const shuffled = shuffleArray(players);

    const matchesData = [];
    for (let i = 0; i < shuffled.length; i += 2) {
        matchesData.push({
            id_tournament: tournamentId,
            id_player1: shuffled[i].id,
            id_player2: shuffled[i + 1].id,
            score_player1: 0,
            score_player2: 0,
            winner: 0,
            round: 1,
        });
    }

    await prisma.games.createMany({ data: matchesData });

    const createdGames = await prisma.games.findMany({
        where: { id_tournament: tournamentId, round: 1 },
        orderBy: { played_at: 'asc' },
    });

    const playerMap = Object.fromEntries(players.map((p) => [p.id, p]));

    const bracket = [
        {
            round: 1,
            matches: createdGames.map((g) => ({
                matchId: g.id,
                player1: playerMap[g.id_player1] ?? null,
                player2: playerMap[g.id_player2] ?? null,
                winnerId: null,
                status: 'pending',
            })),
        },
    ];

    return {
        id: tournamentId,
        status: 'ongoing',
        bracket,
    };
}

module.exports = {
    getAllTournaments,
    getTournamentById,
    createTournament,
    startTournament,
};