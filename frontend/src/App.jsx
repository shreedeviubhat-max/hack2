import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// Simple Auth Context mock for now
export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="min-h-screen bg-background text-text-main font-sans">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
