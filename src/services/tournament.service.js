const prisma = require('../models/prismaClient');

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

module.exports = {
    getAllTournaments,
};