import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Clock, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { addToast({ type: 'warning', title: 'Missing fields', message: 'Please fill in all fields' }); return; }
    if (!email.includes('@')) { addToast({ type: 'warning', title: 'Invalid email', message: 'Please enter a valid email address' }); return; }

    setIsLoading(true);
    try {
      await login(email, password);
      addToast({ type: 'success', title: 'Welcome back!', message: 'You have signed in successfully' });
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      addToast({ type: 'error', title: 'Sign in failed', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-login-bg)' }}>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-[100px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md mx-4 animate-slideUp" style={{ opacity: 0, animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, boxShadow: '0 16px 64px rgba(0,0,0,0.4)', padding: '48px 40px' }}>
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'var(--gradient-accent)', boxShadow: '0 0 30px rgba(59,130,246,0.25)' }}>
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-white/40 mt-2 text-sm font-medium">Sign in to continue tracking your time</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="login-email" type="email" disabled={isLoading} className="glass-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                  placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="login-password" type={showPassword ? 'text' : 'password'} disabled={isLoading}
                  className="glass-input w-full pl-11 pr-11 py-3.5 rounded-xl text-sm" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs text-white/40 cursor-pointer hover:text-white/60 transition-colors gap-2">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-blue-500" />
                <span className="font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-white/40 hover:text-blue-400 transition-colors font-medium">Forgot password?</Link>
            </div>

            <button id="login-submit-btn" type="submit" disabled={isLoading}
              className="btn-primary w-full py-4 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-2" style={{ borderRadius: 14 }}>
              {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>) : 'Sign In'}
            </button>
            <p className="text-[10px] text-center text-white/20 font-medium pt-1">Demo: admin@example.com / password123</p>
          </form>

          <div className="mt-8 text-center">
            <span className="text-xs text-white/30">Don't have an account? </span>
            <Link to="/signup" className="text-xs text-blue-400/80 hover:text-blue-400 transition-colors font-medium">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
