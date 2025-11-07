// src/App.jsx
import React, { useState } from 'react';
import Fixture from './views/fixture';
import Admin from './views/admin';
import './App.css'; 

const App = () => {
  const [view, setView] = useState('fixture'); // 'fixture' or 'admin'

  return (
    <div className="app-container">
      <nav>
        <button 
          onClick={() => setView('fixture')} 
          style={{ backgroundColor: view === 'fixture' ? '#ffffff' : '#222222', color: view === 'fixture' ? '#000000' : '#ffffff' }}
        >
          View Bracket
        </button>
        <button 
          onClick={() => setView('admin')} 
          style={{ backgroundColor: view === 'admin' ? '#ffffff' : '#222222', color: view === 'admin' ? '#000000' : '#ffffff' }}
        >
          Admin Panel
        </button>
      </nav>
      
      {view === 'fixture' ? <Fixture /> : <Admin />}
    </div>
  );
};

export default App;