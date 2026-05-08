import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Updated API path
      await axios.post('http://localhost:9000/api/auth/signup', formData);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error('Signup failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-transparent rounded-3xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Join the orbit</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-8">
          <div className="shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4">
            <User className="text-slate-600" size={20} />
            <input 
              type="text" 
              placeholder="Username"
              className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4">
            <Mail className="text-slate-600" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="shadow-neo-in rounded-4xl px-6 py-4 flex items-center gap-4">
            <Lock className="text-slate-600" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="bg-transparent border-none outline-none text-white w-full text-sm font-semibold"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-accent-red text-white py-5 rounded-4xl font-black uppercase tracking-widest text-xs shadow-red-glow"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-12 text-slate-500 font-bold text-xs">
          Already have an account? <Link to="/login" className="text-accent-red hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
