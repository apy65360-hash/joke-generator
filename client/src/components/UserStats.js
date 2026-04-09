import React from 'react';
import StreakCounter from './StreakCounter';
import AchievementBadges from './AchievementBadges';
import './UserStats.css';

function UserStats({ stats, onClose }) {
  if (!stats) return null;

  const topCategory = Object.entries(stats.categoryPreferences || {}).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="user-stats-overlay" onClick={onClose}>
      <div className="user-stats-panel" onClick={e => e.stopPropagation()}>
        <div className="stats-panel-header">
          <h2>📊 My Statistics</h2>
          <button className="stats-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🎭</span>
            <span className="stat-value">{stats.totalJokesViewed}</span>
            <span className="stat-label">Jokes Viewed</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">{stats.totalFavorites}</span>
            <span className="stat-label">Favorites</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">{stats.achievements ? stats.achievements.length : 0}</span>
            <span className="stat-label">Achievements</span>
          </div>
          {topCategory && (
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <span className="stat-value stat-value-sm">{topCategory[0]}</span>
              <span className="stat-label">Fav Category</span>
            </div>
          )}
        </div>

        <div className="stats-streak-row">
          <StreakCounter
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        </div>

        <AchievementBadges unlockedIds={stats.achievements || []} />
      </div>
    </div>
  );
}

export default UserStats;
