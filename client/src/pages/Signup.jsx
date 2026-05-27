import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ChevronRight, MessageSquare } from 'lucide-react';
import InteractiveBackground from '../components/InteractiveBackground';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error('Signup failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020108] text-slate-400 font-sans flex items-center justify-center px-4 relative overflow-hidden selection:bg-indigo-500/30">
      <InteractiveBackground />

      {/* Large Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/5 blur-[130px] pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md backdrop-blur-xl border border-white/[0.08] bg-[#0c091f]/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] z-10 relative"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:rotate-12 transition-all duration-300">
              <MessageSquare size={22} className="text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight font-syne uppercase">Create Profile</h2>
          <p className="text-slate-500 mt-2 font-code text-[9px] tracking-widest uppercase">Join the real-time developer hub</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest uppercase text-slate-500 pl-1">Username</label>
            <div className="bg-black/40 border border-white/5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 rounded-2xl px-5 py-3.5 flex items-center gap-4 transition-all">
              <User className="text-slate-600 shrink-0" size={18} />
              <input 
                type="text" 
                placeholder="developer_handle"
                className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold placeholder:text-slate-700"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest uppercase text-slate-500 pl-1">Email Address</label>
            <div className="bg-black/40 border border-white/5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 rounded-2xl px-5 py-3.5 flex items-center gap-4 transition-all">
              <Mail className="text-slate-600 shrink-0" size={18} />
              <input 
                type="email" 
                placeholder="name@company.com"
                className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold placeholder:text-slate-700"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold tracking-widest uppercase text-slate-500 pl-1">Password</label>
            <div className="bg-black/40 border border-white/5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 rounded-2xl px-5 py-3.5 flex items-center gap-4 transition-all">
              <Lock className="text-slate-600 shrink-0" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold placeholder:text-slate-700"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-4 rounded-2xl font-extrabold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(99,102,241,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Initialize Profile'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-8 text-xs font-medium text-slate-500">
          Already registered? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors ml-1 font-bold">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
