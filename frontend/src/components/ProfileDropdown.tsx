import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Building2 } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button id="profile-dropdown-trigger" onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all duration-200 cursor-pointer border border-transparent hover:border-white/10">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center overflow-hidden text-xs font-bold text-white/70">
          {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <span>{user?.name ? getInitials(user.name) : 'U'}</span>}
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-white leading-tight">{user?.name || 'User'}</span>
          <span className="text-[10px] text-white/40 leading-tight">{user?.role || 'Member'}</span>
        </div>
        <ChevronDown size={14} className={`text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 animate-scaleIn origin-top-right" style={{
            background: 'rgba(15,15,25,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
          <div className="px-4 py-4 border-b border-white/5">
            <p className="text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
            {user?.orgName && <div className="flex items-center gap-1.5 mt-2">
              <Building2 size={11} className="text-white/30" />
              <span className="text-[10px] font-medium text-white/30 uppercase tracking-wide">{user.orgName}</span>
            </div>}
          </div>
          <div className="py-1.5">
            <button onClick={() => { setIsOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <User size={15} />Profile</button>
            <button onClick={() => { setIsOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
              <Settings size={15} />Settings</button>
          </div>
          <div className="border-t border-white/5 py-1.5">
            <button id="profile-logout-btn" onClick={() => { logout(); navigate('/login'); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all">
              <LogOut size={15} />Sign out</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfileDropdown;
