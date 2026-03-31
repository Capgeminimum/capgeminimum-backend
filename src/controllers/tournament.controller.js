export const getAllTournaments = (req, res) => {
    return res.status(200).json([
        { id: 1, name: "Tournoi Mars 2026", status: "ongoing", playerCount: 8, createdAt: "2026-03-15T14:30:00Z" }
    ])
}

export const getTournamentById = (req, res) => {
    const { id } = req.params

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tournament id" })
    }

    // TODO: remplacer par tournamentService.getTournament(id)
    // TODO: si not found → res.status(404).json({ error: "Tournament not found" })
    return res.status(200).json({
        id: 1,
        name: "Tournoi Mars 2026",
        status: "ongoing",
        players: [{ id: 1, username: "enoxboo" }],
        bracket: []
    })
}

export const createTournament = (req, res) => {
    const { name, playerIds } = req.body

    if (!name || !playerIds) {
        return res.status(400).json({ error: "name and playerIds are required" })
    }

    if (!Array.isArray(playerIds)) {
        return res.status(400).json({ error: "playerIds must be an array" })
    }

    // TODO: remplacer par tournamentService.createTournament(name, playerIds)
    // TODO: le service renverra une erreur si playerCount n'est pas une puissance de 2
    return res.status(201).json({
        id: 1,
        name,
        status: "pending",
        playerCount: playerIds.length,
        createdAt: new Date().toISOString()
    })
}

export const startTournament = (req, res) => {
    const { id } = req.params

    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid tournament id" })
    }

    // TODO: remplacer par tournamentService.startTournament(id)
    // TODO: si not found → res.status(404).json({ error: "Tournament not found" })
    // TODO: si déjà started → res.status(400).json({ error: "Tournament already started" })
    return res.status(200).json({
        id: 1,
        status: "ongoing",
        bracket: []
    })
}