import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Clock, Mail, Lock, User, Loader2, Eye, EyeOff, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast({ type: 'warning', title: 'Name required', message: 'Please enter your full name' });
      return;
    }
    if (!email || !email.includes('@')) {
      addToast({ type: 'warning', title: 'Invalid email', message: 'Please enter a valid email address' });
      return;
    }
    if (password.length < 8) {
      addToast({ type: 'warning', title: 'Weak password', message: 'Password must be at least 8 characters' });
      return;
    }
    if (!/[A-Z]/.test(password)) {
      addToast({ type: 'warning', title: 'Weak password', message: 'Password must contain at least one uppercase letter' });
      return;
    }
    if (!/[a-z]/.test(password)) {
      addToast({ type: 'warning', title: 'Weak password', message: 'Password must contain at least one lowercase letter' });
      return;
    }
    if (!/[0-9]/.test(password)) {
      addToast({ type: 'warning', title: 'Weak password', message: 'Password must contain at least one number' });
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) {
      addToast({ type: 'warning', title: 'Weak password', message: 'Password must contain at least one special character' });
      return;
    }
    if (password !== confirmPassword) {
      addToast({ type: 'error', title: 'Passwords don\'t match', message: 'Please make sure both passwords are the same' });
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password, orgName || undefined);
      addToast({ type: 'success', title: 'Account created!', message: `Welcome to Aion, ${name.split(' ')[0]}!` });
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create your account';
      addToast({ type: 'error', title: 'Registration failed', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 8) return { label: 'Too short', color: '#ef4444', width: '20%' };
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(password);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, password.length >= 12].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: '#ef4444', width: '40%' };
    if (score <= 3) return { label: 'Fair', color: '#f59e0b', width: '60%' };
    if (score <= 4) return { label: 'Strong', color: '#22c55e', width: '80%' };
    return { label: 'Very strong', color: '#22c55e', width: '100%' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden py-12"
      style={{ background: 'var(--gradient-login-bg)' }}>
      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full opacity-15 blur-[100px] pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md mx-4 animate-slideUp" style={{ opacity: 0, animationDelay: '100ms', animationFillMode: 'forwards' }}>
        <div style={{
            background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 28, boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4)', padding: '44px 40px',
          }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: 'var(--gradient-accent)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.25)' }}>
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight text-center">{t('auth.register.title')}</h1>
            <p className="text-white/40 mt-1.5 text-sm font-medium text-center leading-relaxed">{t('auth.register.subtitle')}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="register-name" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">{t('auth.register.fullname')}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="register-name" type="text" disabled={isLoading} className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  placeholder={t('auth.register.fullname_placeholder')} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-email" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">{t('auth.login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="register-email" type="email" disabled={isLoading} className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  placeholder={t('auth.register.email_placeholder')} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-org" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">
                {t('auth.register.orgname')}
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="register-org" type="text" disabled={isLoading} className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                  placeholder={t('auth.register.orgname_placeholder')} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-password" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">{t('auth.login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="register-password" type={showPassword ? 'text' : 'password'} disabled={isLoading}
                  className="glass-input w-full pl-11 pr-11 py-3 rounded-xl text-sm" placeholder={t('auth.register.password_placeholder')}
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-1.5 ml-1">
                  <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-confirm" className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1">{t('auth.register.confirm_password')}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-white/30" />
                <input id="register-confirm" type={showPassword ? 'text' : 'password'} disabled={isLoading}
                  className="glass-input w-full pl-11 pr-4 py-3 rounded-xl text-sm" placeholder={t('auth.register.confirm_password_placeholder')}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {confirmPassword && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${password === confirmPassword ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <div className={`w-2 h-2 rounded-full ${password === confirmPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-white/35 cursor-pointer hover:text-white/50 transition-colors">
                <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-blue-500 flex-shrink-0" />
                <span className="leading-relaxed">
                  {t('auth.register.terms')}
                </span>
              </label>
            </div>

            <button id="register-submit-btn" type="submit" disabled={isLoading}
              className="btn-primary w-full py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-1" style={{ borderRadius: 14 }}>
              {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />{t('set.saving')}</>) : t('auth.register.submit')}
            </button>
          </form>

          <div className="mt-7 text-center">
            <span className="text-xs text-white/30">{t('auth.register.login_prompt')} </span>
            <Link to="/login" className="text-xs text-blue-400/80 hover:text-blue-400 transition-colors font-medium">{t('auth.register.login_link')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

