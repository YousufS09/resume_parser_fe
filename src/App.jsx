import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/templates/DashboardLayout';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ParsedResults from './pages/ParsedResults';
import ViewProfile from './pages/ViewProfile';
import './App.css';
import './pages/Dashboard/Dashboard.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<UploadResume />} />
          <Route path="results" element={<ParsedResults />} />
          <Route path="results/:id" element={<ViewProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
