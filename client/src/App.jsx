import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Docs from './pages/Docs';
import Status from './pages/Status';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function AnimatedRoutes({ auth, setAuth }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/status" element={<Status />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/chat" element={auth ? <Chat user={auth} setAuth={setAuth} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [auth, setAuth] = useState(localStorage.getItem('username'));

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            borderRadius: '1.5rem',
            background: '#1e293b',
            color: '#fff',
            fontWeight: '600',
            fontSize: '14px',
            padding: '12px 24px'
          }
        }} 
      />
      <AnimatedRoutes auth={auth} setAuth={setAuth} />
    </Router>
  );
}

export default App;
