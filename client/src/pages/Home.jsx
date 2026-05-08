import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Globe, MessageSquare, LogIn, LogOut } from 'lucide-react';

const Home = () => {
  const [users, setUsers] = useState([]);
  const username = localStorage.getItem('username');
  const isLoggedIn = !!username;
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:9000/api/chat/users').then((res) => setUsers(res.data));
  }, []);

  const handleNavigation = (mode) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/chat', { state: { initialMode: mode } });
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      localStorage.clear();
      window.location.reload(); // Simple reload to update state to Guest
    } else {
      navigate('/login');
    }
  };

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-red/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-indigo/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Central Greeting */}
      <div className="z-10 text-center px-4 animate-slide-up flex flex-col items-center mb-20">
        <div className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-8 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          {users.length} Users Orbiting
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          {greeting}, <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">
            {isLoggedIn ? username : 'Guest'}
          </span>.
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto mt-6">
          Your secure, real-time communication platform is ready.
        </p>
      </div>

      {/* The Mac OS Style Dock */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
        <div className="glass px-6 py-4 rounded-3xl flex items-center gap-4 md:gap-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {/* Dock Item: Global */}
          <div className="relative group cursor-pointer" onClick={() => handleNavigation('global')}>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-4 group-hover:bg-accent-red group-hover:shadow-red-glow">
              <Globe size={28} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 bg-black/80 rounded-lg text-xs font-bold text-white whitespace-nowrap pointer-events-none">
              Global Chat
            </div>
          </div>

          {/* Dock Item: Private */}
          <div className="relative group cursor-pointer" onClick={() => handleNavigation('personal')}>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-4 group-hover:bg-accent-indigo group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <MessageSquare size={28} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 bg-black/80 rounded-lg text-xs font-bold text-white whitespace-nowrap pointer-events-none">
              Direct Messages
            </div>
          </div>


          {/* Dock Item: Auth */}
          <div className="relative group cursor-pointer" onClick={handleAuthAction}>
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:scale-125 group-hover:-translate-y-4 ${isLoggedIn ? 'group-hover:bg-red-500/20' : 'group-hover:bg-green-500/20'}`}>
              {isLoggedIn ? (
                <LogOut size={28} className="text-slate-400 group-hover:text-red-400 transition-colors duration-300" />
              ) : (
                <LogIn size={28} className="text-slate-400 group-hover:text-green-400 transition-colors duration-300" />
              )}
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1.5 bg-black/80 rounded-lg text-xs font-bold text-white whitespace-nowrap pointer-events-none">
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
