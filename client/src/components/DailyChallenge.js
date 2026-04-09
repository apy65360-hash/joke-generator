import React, { useState, useEffect } from 'react';
import './DailyChallenge.css';

function DailyChallenge() {
  const [dailyJoke, setDailyJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchDailyJoke = async () => {
      try {
        const response = await fetch('/api/jokes/daily');
        const data = await response.json();
        setDailyJoke(data.joke);
      } catch (error) {
        console.error('Error fetching daily joke:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyJoke();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="daily-challenge">
      <div className="daily-header">
        <span className="daily-badge">⭐ Joke of the Day</span>
        <span className="daily-date">{today}</span>
      </div>

      {loading && <div className="daily-loading">Loading today's joke...</div>}

      {!loading && dailyJoke && (
        <div className="daily-joke-content">
          {dailyJoke.setup ? (
            <>
              <p className="daily-setup">{dailyJoke.setup}</p>
              <div className={`daily-delivery-wrapper ${revealed ? 'revealed' : ''}`}>
                {revealed ? (
                  <p className="daily-delivery">{dailyJoke.delivery}</p>
                ) : (
                  <button className="reveal-btn" onClick={() => setRevealed(true)}>
                    🎯 Reveal Punchline
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="daily-single">{dailyJoke.joke}</p>
          )}
        </div>
      )}

      {!loading && !dailyJoke && (
        <p className="daily-error">Could not load today's joke. Check back later!</p>
      )}
    </div>
  );
}

export default DailyChallenge;
