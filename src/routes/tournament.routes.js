import express from 'express'
import {
    getAllTournaments,
    getTournamentById,
    createTournament,
    startTournament
} from '../controllers/tournament.controller.js'

const router = express.Router()

router.get('/', getAllTournaments)
router.get('/:id', getTournamentById)
router.post('/', createTournament)
router.patch('/:id/start', startTournament)

export default router