import React, { useState, useEffect } from 'react';
import './App.css';
import JokeGenerator from './components/JokeGenerator';

function App() {
  const [darkMode, setDarkMode] = useState(false);

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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎭 Joke Generator</h1>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>
      <main className="app-main">
        <JokeGenerator />
      </main>
    </div>
  );
}

export default App;
