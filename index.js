const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok', project: 'Capgeminimum' })
})

try {
    app.use('/api/auth', require('./src/routes/auth.routes.js'))
} catch (error) {
    console.error('Erreur lors du chargement des routes auth:', error)
}

try {
    app.use('/api/players', require('./src/routes/players.routes'))
} catch (error) {
    console.error('Erreur lors du chargement des routes players:', error)
}

try {
    app.use('/api/games', require('./src/routes/games.routes'))
} catch (error) {
    console.error('Erreur lors du chargement des routes games:', error)
}

try {
    app.use('/api/tournaments', require('./src/routes/tournaments.routes'))
} catch (error) {
    console.error('Erreur lors du chargement des routes tournaments:', error)
}


app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`Capgeminimum running on http://localhost:${PORT}`)
})