import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import JobsList from './pages/JobsList';
import Profile from './pages/Profile';
import PublicCV from './pages/PublicCV';

function PrivateRoute({ children, isAuthenticated }) {
  // Synchronous localStorage read means we never need a loading state —
  // auth is known before first paint.
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  // Read synchronously so the first render already knows if user is logged in.
  // This prevents the false-flash that kicks the user to /login on every reload.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('myjobsboard_auth') === 'true'
  );

  const Layout = ({ children }) => (
    <div className="app-container">
      <Sidebar onLogout={() => {
        localStorage.removeItem('myjobsboard_auth');
        setIsAuthenticated(false);
      }} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/cv/:slug" element={<PublicCV />} />
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        
        <Route path="/" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
        <Route path="/kanban" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Layout><Kanban /></Layout>
          </PrivateRoute>
        } />
        <Route path="/explorer" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Layout><JobsList /></Layout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <Layout><Profile /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
