import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Templates } from './pages/Templates/Templates';
import { Wizard } from './pages/Wizard/Wizard';
import { Trial } from './pages/Trial/Trial';
import { Apply } from './pages/Apply/Apply';
import { Analytics } from './pages/Analytics/Analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/wizard/:templateId" element={<Wizard />} />
          <Route path="/trial" element={<Trial />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/:strategyId" element={<Apply />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
