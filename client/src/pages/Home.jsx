import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import ShinyText from '../components/ShinyText';
import DarkVeil from '../components/DarkVeil';

import {
  ArrowRight,
  Terminal,
  Layers3,
  MessageSquare,
  Code2,
  Users,
  Shield,
  Zap,
  Globe,
  Menu,
  X,
} from 'lucide-react';

// Custom Social Icons since brand icons were removed from Lucide
const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const GitHubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const Home = () => {
  const [users, setUsers] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const username = localStorage.getItem('username');
  const isLoggedIn = !!username;
  const navigate = useNavigate();

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'guest'}`;

  useEffect(() => {
    api.get('/chat/users').then((res) => setUsers(res.data));
  }, []);

  const handleNavigation = (mode, panel = null) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/chat', { state: { initialMode: mode, initialPanel: panel } });
    setIsMobileMenuOpen(false);
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#a1a1aa] font-sans selection:bg-blue-500/30 flex flex-col relative overflow-x-hidden">
      
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-100">
          <DarkVeil 
            hueShift={0}
            noiseIntensity={0}
            scanlineIntensity={0}
            speed={0.5}
            scanlineFrequency={0}
            warpAmount={0}
          />
        </div>
      </div>

      {/* IMPROVED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#050505]/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-full" />
            <span className="text-white text-[11px] font-bold tracking-[0.3em] uppercase">Chatify</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <button onClick={scrollToFeatures} className="text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors">Features</button>
            <button onClick={() => navigate('/docs')} className="text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors">Docs</button>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-6">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => navigate('/chat')}
                  >
                    <img src={avatarUrl} alt="profile" className="w-5 h-5 rounded-full border border-white/10" />
                    <span className="text-white text-[10px] font-medium tracking-widest uppercase">{username}</span>
                  </div>
                  <button 
                    onClick={() => { localStorage.clear(); window.location.reload(); }} 
                    className="text-[10px] font-bold tracking-widest uppercase border border-white/10 px-4 py-2 rounded-sm hover:border-white/40 transition-all"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-white text-[10px] font-bold tracking-widest uppercase bg-blue-600 px-6 py-2 rounded-sm hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Launch App
                </button>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-blue-500 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-white/5 bg-[#050505]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex flex-col p-8 gap-8">
                <button onClick={scrollToFeatures} className="text-[11px] font-bold tracking-[0.3em] uppercase text-left">Features</button>
                <button onClick={() => navigate('/docs')} className="text-[11px] font-bold tracking-[0.3em] uppercase text-left">Docs</button>
                
                <div className="pt-8 border-t border-white/5">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <img src={avatarUrl} alt="profile" className="w-6 h-6 rounded-full border border-white/10" />
                        <span className="text-white text-[11px] font-bold tracking-widest uppercase">{username}</span>
                      </div>
                      <button 
                        onClick={() => navigate('/chat')}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white text-[11px] font-bold tracking-[0.3em] uppercase rounded-sm"
                      >
                        Go to Dashboard
                      </button>
                      <button 
                        onClick={() => { localStorage.clear(); window.location.reload(); }} 
                        className="text-[11px] font-bold tracking-[0.3em] uppercase text-red-500 text-left"
                      >
                        Exit Session
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-4 bg-blue-600 text-white text-[11px] font-bold tracking-[0.3em] uppercase rounded-sm"
                    >
                      Launch App
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-6 pt-48 pb-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-5xl w-full text-center"
        >
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-normal text-white tracking-tighter leading-[1.05] mb-10">
            <ShinyText text="Code Sync." speed={3} color="#ffffff" shineColor="#3b82f6" />
            <br />
            <span className="italic">
              <ShinyText text="Redefined." speed={3} color="#ffffff" shineColor="#3b82f6" />
            </span>
          </h1>
          
          <p className="text-xs sm:text-sm md:text-lg max-w-2xl mx-auto leading-relaxed mb-16 opacity-50 px-4">
            The next-generation collaborative workspace for technical teams. 
            Real-time compilers, algorithm visualizers, and secure logic shards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4">
            <button 
              onClick={() => handleNavigation('global')}
              className="group flex items-center gap-3 px-16 py-5 bg-white text-black rounded-sm font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Start
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-20 flex items-center justify-center gap-6 text-[10px] font-bold tracking-[0.4em] uppercase opacity-30">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-blue-900 flex items-center justify-center text-[8px]">
                  {i}
                </div>
              ))}
            </div>
            <span>{users.length || 24}+ Nodes Active</span>
          </div>
        </motion.div>
      </main>

      {/* FEATURE SECTION */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-12 border-t border-white/5 bg-[#050505]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <h2 className="text-white text-[11px] font-bold tracking-[0.5em] uppercase mb-4 text-blue-500">Capabilities</h2>
            <h3 className="text-4xl md:text-6xl text-white tracking-tighter max-w-2xl">
              Engineered for the modern developer.
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: <Terminal size={24} />, 
                title: "Live Compilation", 
                desc: "Execute JavaScript, Python, and C++ in a shared environment with instant feedback."
              },
              { 
                icon: <Layers3 size={24} />, 
                title: "DSA Visualizer", 
                desc: "Watch your data structures come to life with real-time animations and step-through debugging."
              },
              { 
                icon: <MessageSquare size={24} />, 
                title: "Logic Streams", 
                desc: "Context-aware chat built into your files. Discuss logic exactly where it's written."
              },
              { 
                icon: <Shield size={24} />, 
                title: "Secure Shards", 
                desc: "End-to-end encrypted personal rooms for sensitive code snippets and documentation."
              },
              { 
                icon: <Zap size={24} />, 
                title: "Low Latency", 
                desc: "Built on high-performance logic gates for sub-50ms synchronization across the globe."
              },
              { 
                icon: <Globe size={24} />, 
                title: "Global Mesh", 
                desc: "Sync your workspace across devices instantly. Identity-based access control."
              }
            ].map((f, i) => (
              <div 
                key={i} 
                className="p-8 border border-white/5 hover:border-white/10 transition-colors group"
              >
                <div className="text-white/40 group-hover:text-blue-500 transition-colors mb-6">{f.icon}</div>
                <h4 className="text-white text-lg font-medium mb-3">{f.title}</h4>
                <p className="text-sm leading-relaxed opacity-40 group-hover:opacity-50 transition-opacity">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full bg-[#050505] border-t border-white/5 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-full" />
                <span className="text-white text-[11px] font-bold tracking-[0.3em] uppercase">Chatify</span>
              </div>
              <p className="text-[10px] leading-loose opacity-30 max-w-[200px]">
                Collaborative technical workspaces for high-performance teams. 
                Sync your logic, speed up your flow.
              </p>
            </div>
            
            <div>
              <h5 className="text-white text-[10px] font-bold tracking-widest uppercase mb-8">System</h5>
              <div className="flex flex-col gap-4 text-[10px] font-medium uppercase tracking-widest opacity-30">
                <a href="#" className="hover:text-white transition-colors">Protocol</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
                <a href="#" className="hover:text-white transition-colors">Uptime</a>
              </div>
            </div>

            <div>
              <h5 className="text-white text-[10px] font-bold tracking-widest uppercase mb-8">Connect</h5>
              <div className="flex flex-col gap-4 text-[10px] font-medium uppercase tracking-widest opacity-30">
                <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><LinkedInIcon size={12} /> LinkedIn</a>
                <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><GitHubIcon size={12} /> GitHub</a>
                <a href="#" className="flex items-center gap-2 hover:text-white transition-colors"><InstagramIcon size={12} /> Instagram</a>
              </div>
            </div>

            <div>
              <h5 className="text-white text-[10px] font-bold tracking-widest uppercase mb-8">Legal</h5>
              <div className="flex flex-col gap-4 text-[10px] font-medium uppercase tracking-widest opacity-30">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
            <p className="opacity-20">&copy; {new Date().getFullYear()} Chatify Laboratory.</p>
            <p>
              <span className="opacity-20">Developed by </span>
              <a 
                href="https://soumya.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:underline underline-offset-4 transition-all"
              >
                soumys
              </a>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;