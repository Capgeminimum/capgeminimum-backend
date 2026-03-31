const prisma = require('../models/prismaClient');

function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

async function getAllTournaments() {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { players: true },
            },
        },
    });

    return tournaments.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        playerCount: t._count.players,
        createdAt: t.createdAt,
    }));
}

async function createTournament({ name, playerIds }) {
    if (!isPowerOfTwo(playerIds.length)) {
        const error = new Error('Player count must be a power of 2 (4, 8, 16...)');
        error.statusCode = 400;
        throw error;
    }

    const tournament = await prisma.tournament.create({
        data: {
            name,
            players: {
                create: playerIds.map((playerId) => ({
                    player: { connect: { id: playerId } },
                })),
            },
        },
        include: {
            _count: { select: { players: true } },
        },
    });

    return {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        playerCount: tournament._count.players,
        createdAt: tournament.createdAt,
    };
}

module.exports = {
    getAllTournaments,
    createTournament,
};