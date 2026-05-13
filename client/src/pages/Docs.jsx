import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DarkVeil from '../components/DarkVeil';
import { ArrowLeft, Book, Code, Shield, Terminal, Zap } from 'lucide-react';

const Docs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#a1a1aa] font-sans selection:bg-blue-500/30 relative overflow-x-hidden">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-20 brightness-50">
          <DarkVeil hueShift={0} speed={0.2} />
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/5 bg-[#050505]/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain rounded-full" />
            <span className="text-white text-[11px] font-bold tracking-[0.3em] uppercase">Chatify Docs</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8 text-blue-500">
            <Book size={32} />
            <h1 className="text-4xl md:text-6xl text-white tracking-tighter">Documentation</h1>
          </div>

          <p className="text-lg opacity-50 mb-16 leading-relaxed">
            Welcome to the Chatify protocol documentation. Learn how to synchronize your logic, 
            manage secure shards, and collaborate in real-time.
          </p>

          <div className="space-y-20">
            {/* GETTING STARTED */}
            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-8 pb-4 border-b border-white/5">01. Getting Started</h2>
              <div className="grid gap-8">
                <div className="p-8 border border-white/5 bg-white/[0.02]">
                  <h3 className="text-white text-xl mb-4 flex items-center gap-3">
                    <Zap size={20} className="text-blue-500" /> Quick Start
                  </h3>
                  <p className="opacity-40 leading-relaxed text-sm mb-6">
                    To begin a new session, click the "Start" button on the home page. You'll be prompted to sign in 
                    or create an identity. Once authenticated, you'll enter the Global Mesh.
                  </p>
                  <code className="block bg-black p-4 rounded text-blue-400 text-xs font-mono">
                    $ chatify-cli initiate --shard-id default
                  </code>
                </div>
              </div>
            </section>

            {/* CORE FEATURES */}
            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-8 pb-4 border-b border-white/5">02. Core Features</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { icon: <Terminal size={18} />, title: "Live Compiler", desc: "Execute code instantly in a shared environment. Supports JS, Python, and C++." },
                  { icon: <Code size={18} />, title: "Visualizer", desc: "Step through algorithms with interactive data structure animations." },
                  { icon: <Shield size={18} />, title: "Secure Shards", desc: "Encrypted personal rooms for private logic development." },
                  { icon: <Zap size={18} />, title: "Sync Engine", desc: "Sub-50ms latency for global state synchronization." }
                ].map((item, i) => (
                  <div key={i} className="p-6 border border-white/5">
                    <div className="text-blue-500 mb-4">{item.icon}</div>
                    <h4 className="text-white font-medium mb-2">{item.title}</h4>
                    <p className="text-xs opacity-40 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECURITY */}
            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-8 pb-4 border-b border-white/5">03. Security & Privacy</h2>
              <p className="opacity-40 leading-relaxed text-sm">
                All logic streams and shards are protected by identity-based access control. 
                Data is encrypted in transit and at rest using modern cryptographic standards.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase opacity-20">
          &copy; {new Date().getFullYear()} Chatify Laboratory. Protocol Documentation V1.0
        </p>
      </footer>
    </div>
  );
};

export default Docs;
