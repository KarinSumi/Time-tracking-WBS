import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login
    localStorage.setItem('auth_token', 'mock-token');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-transparent">
      <div className="glass-card p-8 w-full max-w-md mx-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-white/70 mt-2">Please sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="email"
                required
                className="glass-input w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="password"
                required
                className="glass-input w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-white/70 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-white/20 bg-white/10" />
              Remember me
            </label>
            <a href="#" className="text-white/80 hover:text-white transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-opacity-90 transform transition-all active:scale-[0.98] shadow-lg"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-white/60 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-white font-medium hover:underline">Create account</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
