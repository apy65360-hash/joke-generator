import React from 'react';
import './AchievementBadges.css';

const ALL_ACHIEVEMENTS = [
  { id: 'first_joke',     label: '🎭 First Joke',        description: 'Viewed your first joke' },
  { id: '10_jokes',       label: '🎲 Comedy Fan',         description: 'Viewed 10 jokes' },
  { id: '50_jokes',       label: '😄 Joke Enthusiast',    description: 'Viewed 50 jokes' },
  { id: '100_jokes',      label: '😂 Laugh Master',       description: 'Viewed 100 jokes' },
  { id: 'first_favorite', label: '❤️ First Favorite',     description: 'Saved your first favorite' },
  { id: '10_favorites',   label: '💖 Favorite Collector', description: 'Saved 10 favorites' },
  { id: '50_favorites',   label: '💝 Joke Hoarder',       description: 'Saved 50 favorites' },
  { id: '7_day_streak',   label: '🔥 Week Warrior',       description: '7-day streak' },
  { id: '30_day_streak',  label: '👑 Month Champion',     description: '30-day streak' },
];

function AchievementBadges({ unlockedIds = [] }) {
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = unlockedIds.length;

  return (
    <div className="achievement-badges">
      <div className="badges-header">
        <span className="badges-title">🏆 Achievements</span>
        <span className="badges-count">{unlockedCount}/{ALL_ACHIEVEMENTS.length}</span>
      </div>
      <div className="badges-progress-bar">
        <div
          className="badges-progress-fill"
          style={{ width: `${(unlockedCount / ALL_ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>
      <div className="badges-grid">
        {ALL_ACHIEVEMENTS.map(a => {
          const earned = unlockedSet.has(a.id);
          return (
            <div key={a.id} className={`badge-item ${earned ? 'earned' : 'locked'}`} title={a.description}>
              <span className="badge-label">{a.label}</span>
              <span className="badge-desc">{a.description}</span>
              {!earned && <span className="badge-lock">🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AchievementBadges;
