import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, ChevronRight } from 'lucide-react';

const Home = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Updated API path
    axios.get('http://localhost:9000/api/chat/users').then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl px-6 pt-32 pb-40 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-accent-red rounded-3xl mb-12 flex items-center justify-center shadow-red-glow animate-pulse">
          <MessageSquare size={40} className="text-white" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 italic">
          CHATIFY <br />
          <span className="text-accent-red not-italic">ULTRA.</span>
        </h1>
        
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.5em] mb-12">
          Experience Next-Gen Connectivity
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <button 
            onClick={() => navigate('/chat')}
            className="flex items-center gap-3 bg-accent-red text-white px-10 py-5 rounded-4xl font-black uppercase tracking-widest text-xs shadow-red-glow hover:scale-105 active:scale-95 transition-all"
          >
            Enter Platform
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Online Now Section */}
      <section className="w-full max-w-6xl px-6 pb-20">
        <div className="flex justify-center mb-16">
          <div className="px-8 py-2 rounded-full shadow-neo-in text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Users currently in orbit
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {users.map((user) => (
            <div key={user._id} className="flex flex-col items-center gap-4 group">
              <div className={`p-1 rounded-full shadow-neo-out transition-all group-hover:shadow-red-glow`}>
                <div className="w-16 h-16 rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} />
                </div>
              </div>
              <span className="font-black text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-accent-red transition-colors">
                {user.username}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
