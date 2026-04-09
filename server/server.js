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

// In-memory user stats store (Map to prevent prototype pollution)
const userStatsStore = new Map();

// In-memory daily joke cache { date: 'YYYY-MM-DD', joke: {...} }
let dailyJokeCache = null;

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_joke',      label: '🎭 First Joke',         description: 'Viewed your first joke',             threshold: { field: 'totalJokesViewed', value: 1 } },
  { id: '10_jokes',        label: '🎲 Comedy Fan',          description: 'Viewed 10 jokes',                    threshold: { field: 'totalJokesViewed', value: 10 } },
  { id: '50_jokes',        label: '😄 Joke Enthusiast',     description: 'Viewed 50 jokes',                    threshold: { field: 'totalJokesViewed', value: 50 } },
  { id: '100_jokes',       label: '😂 Laugh Master',        description: 'Viewed 100 jokes',                   threshold: { field: 'totalJokesViewed', value: 100 } },
  { id: 'first_favorite',  label: '❤️ First Favorite',      description: 'Saved your first favorite joke',     threshold: { field: 'totalFavorites', value: 1 } },
  { id: '10_favorites',    label: '💖 Favorite Collector',  description: 'Saved 10 favorite jokes',            threshold: { field: 'totalFavorites', value: 10 } },
  { id: '50_favorites',    label: '💝 Joke Hoarder',        description: 'Saved 50 favorite jokes',            threshold: { field: 'totalFavorites', value: 50 } },
  { id: '7_day_streak',    label: '🔥 Week Warrior',        description: 'Maintained a 7-day streak',          threshold: { field: 'currentStreak', value: 7 } },
  { id: '30_day_streak',   label: '👑 Month Champion',      description: 'Maintained a 30-day streak',         threshold: { field: 'currentStreak', value: 30 } },
];

// Validate userId format to prevent injection attacks
function isValidUserId(userId) {
  return typeof userId === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(userId);
}

function computeUnlockedAchievements(stats) {
  return ACHIEVEMENTS.filter(a => stats[a.threshold.field] >= a.threshold.value).map(a => a.id);
}

function getDefaultStats(userId) {
  return {
    userId,
    totalJokesViewed: 0,
    totalFavorites: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: null,
    jokesViewedToday: 0,
    achievements: [],
    categoryPreferences: {},
    createdAt: Date.now(),
  };
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(stats) {
  const today = todayString();
  if (stats.lastVisitDate === today) return stats; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (stats.lastVisitDate === yesterdayStr) {
    stats.currentStreak += 1;
  } else {
    stats.currentStreak = 1;
  }
  if (stats.currentStreak > stats.longestStreak) {
    stats.longestStreak = stats.currentStreak;
  }
  stats.lastVisitDate = today;
  stats.jokesViewedToday = 0;
  return stats;
}

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

// GET /api/jokes/daily - same joke for all users on the same calendar date
app.get('/api/jokes/daily', async (req, res) => {
  try {
    const today = todayString();
    if (dailyJokeCache && dailyJokeCache.date === today) {
      return res.json({ date: today, joke: dailyJokeCache.joke });
    }
    const response = await axios.get(`${JOKE_API_URL}Any?safe-mode`);
    dailyJokeCache = { date: today, joke: response.data };
    res.json({ date: today, joke: response.data });
  } catch (error) {
    console.error('Error fetching daily joke:', error.message);
    res.status(500).json({ message: 'Error fetching daily joke', error: error.message });
  }
});

// POST /api/users/stats/init - Initialize user stats
app.post('/api/users/stats/init', (req, res) => {
  const { userId } = req.body;
  if (!userId || !isValidUserId(userId)) return res.status(400).json({ message: 'Invalid userId' });
  if (!userStatsStore.has(userId)) {
    userStatsStore.set(userId, getDefaultStats(userId));
  }
  const stats = updateStreak(userStatsStore.get(userId));
  stats.achievements = computeUnlockedAchievements(stats);
  res.json(stats);
});

// GET /api/users/stats - Retrieve user statistics
app.get('/api/users/stats', (req, res) => {
  const { userId } = req.query;
  if (!userId || !isValidUserId(userId)) return res.status(400).json({ message: 'Invalid userId' });
  if (!userStatsStore.has(userId)) {
    userStatsStore.set(userId, getDefaultStats(userId));
  }
  const stats = userStatsStore.get(userId);
  stats.achievements = computeUnlockedAchievements(stats);
  res.json(stats);
});

// POST /api/users/stats/increment - Increment views/interactions
app.post('/api/users/stats/increment', (req, res) => {
  const { userId, field, category } = req.body;
  if (!userId || !isValidUserId(userId) || !field) return res.status(400).json({ message: 'Invalid userId or field' });
  if (!userStatsStore.has(userId)) {
    userStatsStore.set(userId, getDefaultStats(userId));
  }
  const stats = userStatsStore.get(userId);
  const allowed = ['totalJokesViewed', 'totalFavorites', 'jokesViewedToday'];
  if (!allowed.includes(field)) return res.status(400).json({ message: 'Invalid field' });

  stats[field] = (stats[field] || 0) + 1;

  if (field === 'totalJokesViewed' && category && typeof category === 'string') {
    const safeCategory = category.slice(0, 64);
    stats.categoryPreferences[safeCategory] = (stats.categoryPreferences[safeCategory] || 0) + 1;
  }

  const previousAchievements = new Set(stats.achievements);
  stats.achievements = computeUnlockedAchievements(stats);
  const newlyUnlocked = stats.achievements.filter(a => !previousAchievements.has(a));

  res.json({ stats, newlyUnlocked });
});

// POST /api/users/stats/achievements - Get unlocked achievements with metadata
app.post('/api/users/stats/achievements', (req, res) => {
  const { userId } = req.body;
  if (!userId || !isValidUserId(userId)) return res.status(400).json({ message: 'Invalid userId' });
  const stats = userStatsStore.get(userId) || getDefaultStats(userId);
  const unlocked = computeUnlockedAchievements(stats);
  const result = ACHIEVEMENTS.map(a => ({ ...a, unlocked: unlocked.includes(a.id) }));
  res.json(result);
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
