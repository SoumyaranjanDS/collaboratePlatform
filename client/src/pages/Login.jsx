import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Lock, Loader2, ChevronRight } from 'lucide-react';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Updated API path
      const res = await axios.post('http://localhost:9000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setAuth(res.data.username);
      toast.success(`Welcome back!`);
      navigate('/chat');
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md p-10">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-accent-red rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-red-glow">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">Welcome</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4">
            <Mail className="text-slate-600" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4">
            <Lock className="text-slate-600" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent-red text-white py-5 rounded-4xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-red-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <p className="text-center mt-12 text-slate-500 font-bold text-xs">
          Don't have an account? <Link to="/signup" className="text-accent-red hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
