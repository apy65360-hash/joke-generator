import React from 'react';
import './StreakCounter.css';

function StreakCounter({ currentStreak, longestStreak }) {
  const flames = Math.min(currentStreak, 7);

  return (
    <div className="streak-counter">
      <div className="streak-header">
        <span className="streak-icon">🔥</span>
        <span className="streak-label">Daily Streak</span>
      </div>
      <div className="streak-value">{currentStreak}</div>
      <div className="streak-days">day{currentStreak !== 1 ? 's' : ''}</div>
      <div className="streak-flames">
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={`flame ${i < flames ? 'active' : 'inactive'}`}>🔥</span>
        ))}
      </div>
      <div className="streak-best">Best: {longestStreak} day{longestStreak !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default StreakCounter;
