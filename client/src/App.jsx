import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import socket from './socket';
import { playReceiveSound, unlockAudio } from './data/sounds';
import { useEffect } from 'react';

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

  useEffect(() => {
    // Global listener for sounds
    const handleMessage = (msg) => {
      // Only play if message is from someone else
      if (msg.senderName !== localStorage.getItem('username')) {
        playReceiveSound();
      }
    };

    socket.on('message-received', handleMessage);

    // Auto-connect if logged in
    if (auth) {
      socket.connect();
      socket.emit('join-chat', auth);
    }

    return () => {
      socket.off('message-received', handleMessage);
    };
  }, [auth]);

  return (
    <div onClick={unlockAudio}>
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
    </div>
  );
}

export default App;
