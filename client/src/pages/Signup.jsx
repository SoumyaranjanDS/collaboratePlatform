import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [step, setStep] = useState('credentials');
  const [otp, setOtp] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (step === 'credentials') {
        const res = await api.post('/auth/signup', formData);
        if (res.data.status === 'OTP_REQUIRED') {
          setSavedEmail(res.data.email);
          setStep('otp');
          toast.success(res.data.message || 'OTP sent to your email');
        } else {
          toast.success('Account created! Please log in.');
          navigate('/login');
        }
      } else if (step === 'otp') {
        const res = await api.post('/auth/verify-otp', { email: savedEmail, otp });
        // After verifying OTP, they get a token and are logged in directly!
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role || 'user');
        toast.success('Account verified and logged in!');
        window.location.href = '/'; // hard redirect to set auth state up in App.jsx
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] p-8 md:p-10 shadow-[var(--shadow-lg)] relative"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] mb-6 hover:shadow-[var(--shadow-sm)] transition-shadow text-[var(--color-accent-primary)]">
            <MessageSquare size={22} />
          </Link>
          <h2 className="text-[var(--text-xl)] font-display font-bold tracking-tight text-[var(--color-text-primary)]">Create Profile</h2>
          <p className="text-[var(--color-text-secondary)] mt-2 text-[var(--text-sm)]">Join the team workspace</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {step === 'credentials' ? (
            <>
              <div className="space-y-2">
                <label className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Username</label>
                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 transition-colors">
                  <User className="text-[var(--color-text-muted)] shrink-0" size={18} />
                  <input 
                    type="text" 
                    placeholder="developer_handle"
                    className="bg-transparent border-none outline-none text-[var(--color-text-primary)] w-full text-[var(--text-base)] placeholder:text-[var(--color-text-muted)]"
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Email Address</label>
                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 transition-colors">
                  <Mail className="text-[var(--color-text-muted)] shrink-0" size={18} />
                  <input 
                    type="email" 
                    placeholder="name@company.com"
                    className="bg-transparent border-none outline-none text-[var(--color-text-primary)] w-full text-[var(--text-base)] placeholder:text-[var(--color-text-muted)]"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Password</label>
                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 transition-colors">
                  <Lock className="text-[var(--color-text-muted)] shrink-0" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none text-[var(--color-text-primary)] w-full text-[var(--text-base)] placeholder:text-[var(--color-text-muted)]"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)]">Verification Code</label>
              <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] focus-within:border-[var(--color-accent-primary)] focus-within:ring-1 focus-within:ring-[var(--color-accent-primary)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 transition-colors">
                <Lock className="text-[var(--color-text-muted)] shrink-0" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP"
                  className="bg-transparent border-none outline-none text-[var(--color-text-primary)] w-full text-[var(--text-base)] placeholder:text-[var(--color-text-muted)] tracking-widest font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">Code sent to {savedEmail}</p>
              
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2 text-amber-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Please check your <strong>Spam</strong> folder if you don't see the email. It is completely safe.
                </p>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[var(--color-accent-primary)] text-[var(--color-text-on-accent)] py-3.5 rounded-[var(--radius-md)] font-semibold text-[var(--text-base)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 shadow-[var(--shadow-sm)]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
            {!loading && <ChevronRight size={16} />}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[var(--color-text-secondary)]">
          Already registered? <Link to="/login" className="text-[var(--color-text-primary)] font-semibold hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
