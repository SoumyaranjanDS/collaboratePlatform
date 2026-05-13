import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Docs from './pages/Docs';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/chat" element={auth ? <Chat user={auth} setAuth={setAuth} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
