import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PortfolioPage from './pages/PortfolioPage';
import GalleryLinks from './pages/GalleryLinks';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/gallery" element={<GalleryLinks />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
