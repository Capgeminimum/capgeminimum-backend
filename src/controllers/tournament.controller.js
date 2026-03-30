export const getAllTournaments = (req, res) => {
    // TODO: remplacer par tournamentService.getAllTournaments()
    return res.status(200).json([
        { id: 1, name: "Tournoi Mars 2026", status: "ongoing", playerCount: 8, createdAt: "2026-03-15T14:30:00Z" }
    ])
}

export const getTournamentById = (req, res) => {
    const { id } = req.params
    // TODO: remplacer par tournamentService.getTournament(id)
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
    // TODO: remplacer par tournamentService.createTournament(name, playerIds)
    return res.status(201).json({
        id: 1,
        name,
        status: "pending",
        playerCount: playerIds?.length ?? 0,
        createdAt: new Date().toISOString()
    })
}

export const startTournament = (req, res) => {
    const { id } = req.params
    // TODO: remplacer par tournamentService.startTournament(id)
    return res.status(200).json({
        id: 1,
        status: "ongoing",
        bracket: []
    })
}