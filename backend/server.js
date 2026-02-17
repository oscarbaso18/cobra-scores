const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Key (se guardará en .env)
const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// Función helper para hacer peticiones a la API
async function fetchFromFootballAPI(endpoint) {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'X-Auth-Token': API_KEY
            }
        });

        return response.data; //axios ya parsea JSON automaticamente
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Demasiadas peticiones. Intenta ,mas tarde.');
        }
        console.error('Error al obtener datos:', error);
        throw error;
    }
}

// RUTAS

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: '🐍 Cobra Scores API está funcionando!',
        endpoints: [
            'GET /api/matches/:competitionId?status=FINISHED',
            'GET /api/standings/:competitionId'
        ]
    });
});

// Obtener partidos por liga y estado
app.get('/api/matches/:competitionId', async (req, res) => {
    try {
        const { competitionId } = req.params;
        const status = req.query.status || 'FINISHED'; // FINISHED, SCHEDULED, LIVE

        const data = await fetchFromFootballAPI(`/competitions/${competitionId}/matches?status=${status}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener partidos',
            message: error.message 
        });
    }
});

// Obtener clasificaciones por liga
app.get('/api/standings/:competitionId', async (req, res) => {
    try {
        const { competitionId } = req.params;
        const data = await fetchFromFootballAPI(`/competitions/${competitionId}/standings`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener clasificaciones',
            message: error.message 
        });
    }
});

// Obtener información de una competición específica
app.get('/api/competition/:competitionId', async (req, res) => {
    try {
        const { competitionId } = req.params;
        const data = await fetchFromFootballAPI(`/competitions/${competitionId}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error al obtener información de la competición',
            message: error.message 
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🐍 Cobra Scores Backend corriendo en http://localhost:${PORT}`);
    console.log(`📊 API Key configurada: ${API_KEY ? '✅ Sí' : '❌ No'}`);
}); 
