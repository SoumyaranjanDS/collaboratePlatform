import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DarkVeil from '../components/DarkVeil';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-[#050505] text-[#a1a1aa] font-sans selection:bg-blue-500/30 relative overflow-x-hidden"
    >
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-20 brightness-50">
          <DarkVeil hueShift={0} speed={0.1} />
        </div>
      </div>

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="backdrop-blur-xl border border-white/10 bg-[#050505]/60 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain rounded-full border border-white/10 group-hover:scale-110 transition-transform" />
            <span className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">Chatify</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase text-white/40 hover:text-white transition-all">
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-12 text-blue-500">
            <ShieldCheck size={32} />
            <h1 className="text-4xl md:text-6xl text-white tracking-tighter">Privacy Policy</h1>
          </div>

          <div className="space-y-12 text-sm leading-relaxed opacity-60">
            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-6 pb-2 border-b border-white/5">01. Data Protocol</h2>
              <p>Chatify operates on a zero-knowledge architecture. All logic shards and communication streams are encrypted end-to-end. We do not store your private code blocks on our primary mesh nodes; they exist only within your ephemeral session shards.</p>
            </section>

            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-6 pb-2 border-b border-white/5">02. Identity Mesh</h2>
              <p>Your identity is verified via secure authentication gates. We only collect the minimal metadata required to synchronize your workspace across the Global Mesh. We never sell or distribute your identity packets to third-party entities.</p>
            </section>

            <section>
              <h2 className="text-white text-[11px] font-bold tracking-[0.4em] uppercase mb-6 pb-2 border-b border-white/5">03. Security Shards</h2>
              <p>Users are responsible for the security of their own access tokens. While we provide the encryption framework, the integrity of your personal shards depends on your authentication hygiene.</p>
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase opacity-20">
          &copy; {new Date().getFullYear()} Chatify Laboratory. Privacy v1.0
        </p>
      </footer>
    </motion.div>
  );
};

export default Privacy;
