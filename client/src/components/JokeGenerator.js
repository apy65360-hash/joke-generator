import React, { useState, useEffect } from 'react';
import './JokeGenerator.css';

function JokeGenerator() {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Any');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);

  const categories = ['Any', 'Programming', 'Knock-Knock', 'General', 'Dark', 'Pun', 'Spooky'];

  useEffect(() => {
    const saved = localStorage.getItem('favoriteJokes');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const fetchJoke = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const response = await fetch(`/api/jokes/random/${category}`);
      const data = await response.json();
      setJoke(data);
    } catch (error) {
      console.error('Error fetching joke:', error);
      setJoke({ error: 'Failed to fetch joke. Please try again.' });
    }
    setLoading(false);
  };

  const toggleFavorite = () => {
    if (!joke) return;
    const jokeText = joke.setup ? `${joke.setup} ${joke.delivery}` : joke.joke;
    let newFavorites = [...favorites];
    if (newFavorites.includes(jokeText)) {
      newFavorites = newFavorites.filter(j => j !== jokeText);
    } else {
      newFavorites.push(jokeText);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteJokes', JSON.stringify(newFavorites));
  };

  const copyToClipboard = () => {
    if (!joke) return;
    const jokeText = joke.setup ? `${joke.setup} ${joke.delivery}` : joke.joke;
    navigator.clipboard.writeText(jokeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFavorite = () => {
    if (!joke) return false;
    const jokeText = joke.setup ? `${joke.setup} ${joke.delivery}` : joke.joke;
    return favorites.includes(jokeText);
  };

  const removeFavorite = (jokeText) => {
    const newFavorites = favorites.filter(j => j !== jokeText);
    setFavorites(newFavorites);
    localStorage.setItem('favoriteJokes', JSON.stringify(newFavorites));
  };

  return (
    <div className="joke-generator">
      <div className="controls">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={fetchJoke} disabled={loading}>
          {loading ? 'Loading...' : '🎲 Get Joke'}
        </button>
        <button 
          className="favorites-btn"
          onClick={() => setShowFavorites(!showFavorites)}
        >
          ⭐ Favorites ({favorites.length})
        </button>
      </div>

      {!showFavorites && (
        <div className="joke-display">
          {joke && !joke.error && (
            <div className="joke-card">
              <div className="joke-content">
                {joke.setup && (
                  <>
                    <p className="setup">{joke.setup}</p>
                    <p className="delivery">{joke.delivery}</p>
                  </>
                )}
                {joke.joke && <p className="single-joke">{joke.joke}</p>}
              </div>
              <div className="joke-actions">
                <button onClick={copyToClipboard} className="action-btn">
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button 
                  onClick={toggleFavorite}
                  className={`action-btn ${isFavorite() ? 'favorited' : ''}`}
                >
                  {isFavorite() ? '❤️ Unfavorite' : '🤍 Favorite'}
                </button>
              </div>
            </div>
          )}
          {joke && joke.error && (
            <div className="error">{joke.error}</div>
          )}
          {!joke && !loading && (
            <div className="welcome">
              <p>👋 Click "Get Joke" to generate a random joke!</p>
            </div>
          )}
        </div>
      )}

      {showFavorites && (
        <div className="favorites-list">
          <h2>⭐ My Favorite Jokes ({favorites.length})</h2>
          {favorites.length === 0 ? (
            <p>No favorites yet! Add some jokes to your favorites.</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((fav, index) => (
                <div key={index} className="favorite-card">
                  <p>{fav}</p>
                  <button 
                    onClick={() => removeFavorite(fav)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JokeGenerator;
