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

app.use('/players', require('./src/routes/players.routes'))
app.use('/games', require('./src/routes/games.routes'))
app.use('/tournaments', require('./src/routes/tournaments.routes'))

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