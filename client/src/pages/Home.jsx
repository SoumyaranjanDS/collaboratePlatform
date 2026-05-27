import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import ShinyText from '../components/ShinyText';
import {
  ArrowRight,
  Terminal,
  Layers3,
  MessageSquare,
  Video,
  PenTool,
  Zap,
  Menu,
  X,
  Play,
  Monitor,
  Laptop,
  Code2,
  Sparkles
} from 'lucide-react';

const InteractiveWorkspaceBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 180 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const codeTokens = ['{ }', '&&', '=>', '[]', '< />', '()', 'socket.io', 'webRTC', 'v8', 'const', 'import'];
    const particles = [];
    const particleCount = 75;

    class Particle {
      constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        
        this.isToken = Math.random() < 0.25;
        this.token = codeTokens[Math.floor(Math.random() * codeTokens.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.colorIndex = Math.floor(Math.random() * 4);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -50 || this.x > width + 50 || this.y < -50 || this.y > height + 50) {
          this.reset();
          if (Math.random() < 0.5) {
            this.x = Math.random() < 0.5 ? -10 : width + 10;
          } else {
            this.y = Math.random() < 0.5 ? -10 : height + 10;
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x += (dx / distance) * force * 0.65;
            this.y += (dy / distance) * force * 0.65;
          }
        }
      }

      draw() {
        const themeColors = [
          `rgba(99, 102, 241, ${this.alpha})`,
          `rgba(139, 92, 246, ${this.alpha})`,
          `rgba(236, 72, 153, ${this.alpha})`,
          `rgba(45, 212, 191, ${this.alpha})`
        ];
        const color = themeColors[this.colorIndex];

        if (this.isToken) {
          ctx.font = '500 10px "Fira Code", monospace';
          ctx.fillStyle = color;
          ctx.fillText(this.token, this.x, this.y);
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const gridSpacing = 80;
    const drawInteractiveGrid = () => {
      ctx.strokeStyle = 'rgba(31, 26, 58, 0.2)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (mouse.x !== null && mouse.y !== null) {
        const startX = Math.floor((mouse.x - mouse.radius) / gridSpacing) * gridSpacing;
        const endX = Math.ceil((mouse.x + mouse.radius) / gridSpacing) * gridSpacing;
        const startY = Math.floor((mouse.y - mouse.radius) / gridSpacing) * gridSpacing;
        const endY = Math.ceil((mouse.y + mouse.radius) / gridSpacing) * gridSpacing;

        for (let x = startX; x <= endX; x += gridSpacing) {
          for (let y = startY; y <= endY; y += gridSpacing) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
              const alpha = (1 - distance / mouse.radius) * 0.35;
              ctx.beginPath();
              ctx.arc(x, y, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
              ctx.shadowBlur = 4;
              ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    };

    const drawConnections = () => {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawInteractiveGrid();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-60" />;
};

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

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Home = () => {
  const [users, setUsers] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const username = localStorage.getItem('username');
  const isLoggedIn = !!username;
  const navigate = useNavigate();

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'guest'}`;

  useEffect(() => {
    api.get('/chat/users').then((res) => setUsers(res.data)).catch(() => {});
  }, []);

  const handleLaunch = () => {
    if (isLoggedIn) {
      navigate('/chat');
    } else {
      navigate('/login');
    }
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#020108] text-slate-400 font-sans selection:bg-indigo-500/30 flex flex-col relative overflow-x-hidden">
      
      {/* Large Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none z-0" />
      
      <InteractiveWorkspaceBackground />

      {/* HEADER / NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="backdrop-blur-xl border border-white/[0.08] bg-[#0c091f]/40 rounded-2xl px-6 py-4 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
        >
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:rotate-12 transition-all duration-300">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="text-white text-xs font-black tracking-[0.3em] uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Chatify</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={scrollToFeatures} className="text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
            </button>
            <button onClick={() => navigate('/docs')} className="text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors relative group">
              Docs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
            </button>
            <button onClick={() => navigate('/status')} className="text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-white transition-colors relative group">
              Status
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/[0.08] rounded-full px-3.5 py-1.5 hover:bg-white/10 transition-all" onClick={() => navigate('/chat')}>
                    <img src={avatarUrl} alt="profile" className="w-5 h-5 rounded-full border border-white/10" />
                    <span className="text-white text-[9px] font-bold tracking-wider uppercase">@{username}</span>
                  </div>
                  <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-red-400 transition-colors">Logout</button>
                </div>
              ) : (
                <button onClick={() => navigate('/login')} className="text-white text-[10px] font-bold tracking-widest uppercase bg-indigo-600 px-6 py-2.5 rounded-full hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">Launch App</button>
              )}
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden text-slate-400 hover:text-white transition-colors p-2"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>
      </nav>

      {/* MOBILE NAV PANEL */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-[5%] right-[5%] z-45 md:hidden bg-[#0a0717]/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-4"
          >
            <button onClick={scrollToFeatures} className="py-3 text-left text-sm font-bold tracking-wider text-slate-300 border-b border-white/5 hover:text-white transition-colors">Features</button>
            <button onClick={() => navigate('/docs')} className="py-3 text-left text-sm font-bold tracking-wider text-slate-300 border-b border-white/5 hover:text-white transition-colors">Docs</button>
            <button onClick={() => navigate('/status')} className="py-3 text-left text-sm font-bold tracking-wider text-slate-300 border-b border-white/5 hover:text-white transition-colors">Status</button>
            <button onClick={handleLaunch} className="w-full mt-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold tracking-wider hover:bg-indigo-500 transition-colors shadow-lg">
              {isLoggedIn ? 'Go to Dashboard' : 'Launch App'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-36 md:pt-48 pb-20 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full flex flex-col items-center"
        >

          {/* <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-code tracking-[0.2em] uppercase mb-8 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Universal Collaboration Protocol
          </motion.div> */}

          <motion.h1 
            variants={fadeUp}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[0.95] mb-8 font-syne uppercase"
          >
            Where Technical <br className="hidden sm:inline" /> Teams <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(99,102,241,0.4)]">
              Connect & Create.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-12 text-slate-400 font-sans"
          >
            Chatify integrates real-time communications, shared code runtimes, synced vector whiteboards, and visual data structure models. Everything synchronized instantly over WebSocket gates.
          </motion.p>

          <motion.div 
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={handleLaunch} 
              className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white font-extrabold text-xs uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={14} />
            </button>
            <button 
              onClick={scrollToFeatures} 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/[0.08] text-white font-extrabold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            >
              See Capabilities
            </button>
          </motion.div>

          {/* SaaS Workspace Product Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full mt-24 max-w-5xl rounded-2xl border border-white/10 bg-[#0e0a24]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden relative group backdrop-blur-sm select-none"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700" />
            
            {/* Mockup Title bar */}
            <div className="h-12 border-b border-white/[0.08] bg-[#070514]/80 px-6 flex items-center justify-between">
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">chatify_workspace_sandbox</span>
              <div className="w-16" />
            </div>

            {/* Mockup Workspace Shell Layout */}
            <div className="grid grid-cols-12 h-[340px] md:h-[480px]">
              {/* Sidebar Mock */}
              <div className="col-span-3 border-r border-white/[0.08] bg-[#070514]/40 p-4 flex flex-col gap-4 text-left">
                <div className="w-full h-8 rounded-lg bg-white/5 border border-white/5 flex items-center px-3 gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Active Channels</span>
                </div>
                <div className="space-y-2">
                  {['Global Lobby', 'Frontend team', 'DSA prep room'].map((room, i) => (
                    <div key={room} className={`h-10 rounded-xl flex items-center px-3 justify-between ${i === 0 ? 'bg-indigo-600/10 border border-indigo-500/20 text-white' : 'text-slate-500 hover:text-slate-400'}`}>
                      <span className="text-[9px] font-bold">#{room}</span>
                      {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat & Active panels Mock */}
              <div className="col-span-9 bg-[#0b081e]/20 p-6 flex flex-col justify-between relative">
                {/* Visual Panel Mock */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Left: Synchronized Whiteboard Mock */}
                  <div className="border border-dashed border-white/10 rounded-2xl bg-black/30 p-4 flex flex-col justify-between relative overflow-hidden group/board">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1.5px)] bg-[size:16px_16px]" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <PenTool size={10} className="text-violet-400" /> Real-time Canvas
                      </span>
                      <span className="w-3 h-3 rounded-full bg-indigo-500/20 flex items-center justify-center text-[6px] text-indigo-400 font-bold border border-indigo-500/30">Active</span>
                    </div>
                    {/* Stylized vector drawing shape mock */}
                    <div className="flex-1 flex items-center justify-center relative">
                      <svg className="w-24 h-24 text-indigo-500/20" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                        <rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      {/* Synced cursors mock */}
                      <div className="absolute top-[40%] left-[60%] flex items-center gap-1">
                        <svg className="w-3 h-3 text-indigo-400 rotate-45" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span className="text-[6px] font-mono bg-indigo-500 text-white px-1 py-0.5 rounded-sm">@alex</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Compiling Sandbox Mock */}
                  <div className="border border-white/5 rounded-2xl bg-black/40 p-4 flex flex-col justify-between text-left relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                        <Terminal size={10} className="text-fuchsia-400" /> live_sandbox.js
                      </span>
                      <Play size={10} className="text-emerald-400 cursor-pointer" />
                    </div>
                    {/* Simulated Code Lines */}
                    <div className="font-mono text-[7px] space-y-1.5 text-slate-400 mt-3 flex-1">
                      <p><span className="text-indigo-400">const</span> compiler = () =&gt; &#123;</p>
                      <p className="pl-3 text-slate-500">// Auto-compiles live inside the room</p>
                      <p className="pl-3"><span className="text-fuchsia-400">console</span>.log(<span className="text-emerald-400">"Output Synced!"</span>);</p>
                      <p>&#125;;</p>
                    </div>
                    {/* Simulated output console */}
                    <div className="h-8 rounded-lg bg-black border border-white/5 px-2 flex items-center text-[6px] font-mono text-emerald-400">
                      &gt; Output Synced!
                    </div>
                  </div>
                </div>

                {/* Call Overlay PIP Mock */}
                <div className="absolute bottom-4 right-4 w-28 h-36 border border-white/10 rounded-xl overflow-hidden bg-[#0d071d]/90 shadow-2xl flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[6px] font-mono bg-black/60 px-1 py-0.5 rounded-md text-slate-300">You</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>
                  {/* Avatar graphic representation */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 mx-auto flex items-center justify-center text-[10px] text-white font-black shadow-lg">
                    U
                  </div>
                  <div className="flex justify-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[6px]">🎤</span>
                    <span className="w-4 h-4 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center text-[6px]">📞</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* BENTO GRID CAPABILITIES */}
      <section id="features" className="relative z-10 py-32 px-6 md:px-12 border-t border-white/5 bg-[#03000b]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <div className="mb-24 text-center md:text-left">
            <h2 className="text-indigo-400 text-xs font-bold tracking-[0.4em] uppercase mb-4">Capabilities</h2>
            <h3 className="text-4xl md:text-6xl text-white font-extrabold tracking-tight font-futuristic">Built for modern tech workflows.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Bento Card 1: Calls & Screen Share */}
            <div className="md:col-span-2 p-8 border border-white/[0.04] bg-[#0c0920]/20 hover:bg-[#0c0920]/40 transition-all rounded-3xl group flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <Video className="text-indigo-400 mb-6" size={28} />
                <h4 className="text-white text-xl font-bold mb-3 font-futuristic">Instant Video & Screen Sharing</h4>
                <p className="text-sm leading-relaxed text-slate-400 max-w-md">Launch 1-on-1 video calls directly from direct messages. Toggle video devices, mute mic, or share your screen seamlessly during call streams.</p>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest text-slate-500">
                <span>WebRTC Native</span>
                <span>Screen Capture</span>
                <span>Track Substitution</span>
              </div>
            </div>

            {/* Bento Card 2: Synced Whiteboard */}
            <div className="p-8 border border-white/[0.04] bg-[#0c0920]/20 hover:bg-[#0c0920]/40 transition-all rounded-3xl group flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div>
                <PenTool className="text-purple-400 mb-6" size={28} />
                <h4 className="text-white text-xl font-bold mb-3 font-futuristic">Shared Canvas</h4>
                <p className="text-sm leading-relaxed text-slate-400">Sketch designs, document logic, and sync drawings in real-time with cursor tracking.</p>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">Sync Vector Board</span>
            </div>

            {/* Bento Card 3: JS Code Sandbox */}
            <div className="p-8 border border-white/[0.04] bg-[#0c0920]/20 hover:bg-[#0c0920]/40 transition-all rounded-3xl group flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div>
                <Terminal className="text-fuchsia-400 mb-6" size={28} />
                <h4 className="text-white text-xl font-bold mb-3 font-futuristic">Live Code Compiler</h4>
                <p className="text-sm leading-relaxed text-slate-400">Write JavaScript code with integrated pre-built templates and execute synchronously with real-time logger outputs.</p>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500">V8 sandbox runtime</span>
            </div>

            {/* Bento Card 4: DSA Visualizer */}
            <div className="md:col-span-2 p-8 border border-white/[0.04] bg-[#0c0920]/20 hover:bg-[#0c0920]/40 transition-all rounded-3xl group flex flex-col justify-between relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <Layers3 className="text-violet-400 mb-6" size={28} />
                <h4 className="text-white text-xl font-bold mb-3 font-futuristic">DSA Algorithm Visualizer</h4>
                <p className="text-sm leading-relaxed text-slate-400 max-w-md">Step through core algorithms (Sorting, Searching, Linked Lists, Trees, and Graph node networks) dynamically with visual state animation nodes.</p>
              </div>
              <div className="flex gap-2">
                {['Linked Lists', 'BST Trees', 'Graph Paths'].map(concept => (
                  <span key={concept} className="text-[8px] font-bold tracking-widest uppercase border border-white/5 bg-white/5 px-2.5 py-1 rounded-md text-slate-400">{concept}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 w-full bg-[#020108] border-t border-white/5 pt-24 pb-16 px-6 md:px-12 text-slate-500">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24 mb-20">
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <span className="text-white text-xs font-black tracking-[0.3em] uppercase">Chatify</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-60 max-w-[280px]">
                Architecting the future of real-time developer workspace collaboration. Fully synchronized environment.
              </p>
            </div>
            
            <div>
              <h5 className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6">Connect</h5>
              <div className="flex flex-col gap-3 text-[10px] font-medium uppercase tracking-widest opacity-60">
                <a href="https://www.linkedin.com/in/soumyaranjanlink/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><LinkedInIcon size={12} /> LinkedIn</a>
                <a href="https://github.com/SoumyaranjanDS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><GitHubIcon size={12} /> GitHub</a>
                <a href="https://www.instagram.com/_.soumya_28?igsh=MW51OTV2bnc3aHdxaQ==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><InstagramIcon size={12} /> Instagram</a>
              </div>
            </div>

            <div>
              <h5 className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6">Legal</h5>
              <div className="flex flex-col gap-3 text-[10px] font-medium uppercase tracking-widest opacity-60">
                <button onClick={() => navigate('/privacy')} className="text-left hover:text-white transition-colors">Privacy Policy</button>
                <button onClick={() => navigate('/terms')} className="text-left hover:text-white transition-colors">Terms of Use</button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.25em] uppercase">
            <div className="flex items-center gap-4 opacity-50">
              <p>&copy; {new Date().getFullYear()} Chatify Lab</p>
              <div className="w-[1px] h-3 bg-white/10 hidden md:block" />
              <p className="hidden md:block">Universal Protocol v2.6.0</p>
            </div>
            <p>
              <span className="opacity-45 lowercase italic font-normal tracking-normal mr-1.5">developed by</span>
              <a 
                href="https://soumya.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-indigo-400 transition-colors"
              >
                soumya
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;