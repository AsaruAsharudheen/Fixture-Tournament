// src/App.jsx
import React, { useState } from 'react';
import Fixture from './views/fixture';
import Admin from './views/admin';
import './App.css';

const App = () => {
  const [view, setView] = useState('fixture'); // 'fixture' or 'admin'

  return (
    <div className="app-container">
      <nav className="top-nav">
        <button
          onClick={() => setView('fixture')}
          style={{
            backgroundColor: view === 'fixture' ? '#ffffff' : '#222222',
            color: view === 'fixture' ? '#000000' : '#ffffff',
            border: '1px solid #222',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '8px 0 0 8px',
          }}
        >
          View Bracket
        </button>
        <button
          onClick={() => setView('admin')}
          style={{
            backgroundColor: view === 'admin' ? '#ffffff' : '#222222',
            color: view === 'admin' ? '#000000' : '#ffffff',
            border: '1px solid #222',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            borderRadius: '0 8px 8px 0',
          }}
        >
          Admin Panel
        </button>
      </nav>

      <main className="content-view">
        {view === 'fixture' ? <Fixture /> : <Admin />}
      </main>
    </div>
  );
};

export default App;
