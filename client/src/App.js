import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import JokeGenerator from './components/JokeGenerator';
import UserStats from './components/UserStats';
import DailyChallenge from './components/DailyChallenge';

// Generate or retrieve a persistent userId
function getOrCreateUserId() {
  let userId = localStorage.getItem('jokeUserId');
  if (!userId) {
    // Use crypto.randomUUID() if available, otherwise fall back to crypto.getRandomValues
    if (typeof crypto !== 'undefined' && crypto?.randomUUID) {
      userId = 'user_' + crypto.randomUUID().replace(/-/g, '');
    } else {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      userId = 'user_' + Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    }
    localStorage.setItem('jokeUserId', userId);
  }
  return userId;
}

const DEFAULT_STATS = {
  totalJokesViewed: 0,
  totalFavorites: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastVisitDate: null,
  jokesViewedToday: 0,
  achievements: [],
  categoryPreferences: {},
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const userId = getOrCreateUserId();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Load stats from localStorage and sync with backend on mount
  useEffect(() => {
    const loadStats = async () => {
      // Load from localStorage first for instant display
      const saved = localStorage.getItem('jokeUserStats');
      if (saved) setStats(JSON.parse(saved));

      try {
        const response = await fetch('/api/users/stats/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
          localStorage.setItem('jokeUserStats', JSON.stringify(data));
        }
      } catch (err) {
        // Backend unavailable — use localStorage stats with streak logic
        const local = saved ? JSON.parse(saved) : { ...DEFAULT_STATS };
        const today = new Date().toISOString().slice(0, 10);
        if (local.lastVisitDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yStr = yesterday.toISOString().slice(0, 10);
          local.currentStreak = local.lastVisitDate === yStr ? (local.currentStreak || 0) + 1 : 1;
          local.longestStreak = Math.max(local.longestStreak || 0, local.currentStreak);
          local.lastVisitDate = today;
          local.jokesViewedToday = 0;
        }
        setStats(local);
        localStorage.setItem('jokeUserStats', JSON.stringify(local));
      }
    };
    loadStats();
  }, [userId]);

  const incrementStat = useCallback(async (field, category) => {
    try {
      const response = await fetch('/api/users/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, field, category }),
      });
      if (response.ok) {
        const { stats: updated, newlyUnlocked } = await response.json();
        setStats(updated);
        localStorage.setItem('jokeUserStats', JSON.stringify(updated));
        if (newlyUnlocked && newlyUnlocked.length > 0) {
          setNewAchievements(prev => [...prev, ...newlyUnlocked]);
          setTimeout(() => setNewAchievements([]), 4000);
        }
        return;      }
    } catch (_) {}

    // Fallback: update localStorage stats locally
    setStats(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: (prev[field] || 0) + 1 };
      if (field === 'totalJokesViewed' && category) {
        updated.categoryPreferences = {
          ...prev.categoryPreferences,
          [category]: (prev.categoryPreferences?.[category] || 0) + 1,
        };
      }
      localStorage.setItem('jokeUserStats', JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎭 Joke Generator</h1>
        <div className="header-actions">
          {stats && (
            <button className="stats-btn" onClick={() => setShowStats(true)}>
              🔥 {stats.currentStreak} &nbsp;|&nbsp; 📊 Stats
            </button>
          )}
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {newAchievements.length > 0 && newAchievements[newAchievements.length - 1] && (
        <div className="achievement-toast">
          🏆 Achievement unlocked: <strong>{String(newAchievements[newAchievements.length - 1]).replace(/_/g, ' ')}</strong>!
        </div>
      )}

      <main className="app-main">
        <DailyChallenge />
        <JokeGenerator onJokeViewed={incrementStat} stats={stats} />
      </main>

      {showStats && <UserStats stats={stats} onClose={() => setShowStats(false)} />}
    </div>
  );
}

export default App;
