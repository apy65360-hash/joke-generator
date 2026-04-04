const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Joke API endpoint
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/';

// Health check - Root route
app.get('/', (req, res) => {
  res.json({ message: '🎭 Joke Generator API is running!' });
});

// Get random joke
app.get('/api/jokes/random', async (req, res) => {
  try {
    const category = req.query.category || 'Any';
    const response = await axios.get(`${JOKE_API_URL}${category}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    res.status(500).json({ message: 'Error fetching joke', error: error.message });
  }
});

// Get random joke with specific category
app.get('/api/jokes/random/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`Fetching joke from category: ${category}`);
    const response = await axios.get(`${JOKE_API_URL}${category}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching joke:', error.message);
    res.status(500).json({ message: 'Error fetching joke', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎭 Joke Generator server running on http://localhost:${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api/jokes/random/Any`);
  console.log(`✅ CORS enabled for http://localhost:3000`);
});
