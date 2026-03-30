const express = require('express')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(express.json())

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', project: 'Capgeminimum' })
})

// TODO: importer les routes ici au fur et à mesure
// app.use('/api/players', require('./routes/players.routes'))
// app.use('/api/games', require('./routes/games.routes'))
// app.use('/api/tournaments', require('./routes/tournaments.routes'))

// Handler 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

// Handler erreurs globales
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`Capgeminimum running on http://localhost:${PORT}`)
})