// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Questionnaire } from './pages/Questionnaire';
import { Results } from './pages/Results';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questionnaire/:problemId" element={<Questionnaire />} />
          <Route path="/results/:problemId" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;