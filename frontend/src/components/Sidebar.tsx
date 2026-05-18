import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Building2,
  Database,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';



const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Clock, label: 'Time Logs', path: '/logs' },
  { icon: Clock, label: 'Bulk Entry', path: '/bulk-entry' },
  { icon: Briefcase, label: 'Plans', path: '/plans' },
  { icon: Briefcase, label: 'Projects', path: '/projects', minRole: 'ADMIN' },
  { icon: Users, label: 'Team', path: '/team', minRole: 'ADMIN' },
  { icon: BarChart3, label: 'Reports', path: '/reports', minRole: 'ADMIN' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

import { getDraftsSummary } from '../api';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    getDraftsSummary()
      .then(data => setDraftCount(data.count))
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] glass-sidebar ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center justify-between px-5 pt-7 pb-2 ${collapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-black shadow-lg"
          >
            {user?.logoUrl ? (
              <img src={user.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Clock className="w-5 h-5 text-white" />
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-tight">Aion</h1>
              {user?.orgName && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 size={9} className="text-[var(--text-muted)]" />
                  <span className="text-[9px] text-[var(--text-muted)] font-medium uppercase tracking-wider truncate">{user.orgName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer z-50"
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <ChevronLeft size={12} className={`text-[var(--text-secondary)] transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3">
        <ul className="space-y-1">
          {(() => {
            const rolePrecedence = { 'USER': 0, 'ADMIN': 1, 'SUPER_ADMIN': 2 };
            const userRoleWeight = rolePrecedence[user?.role as keyof typeof rolePrecedence] || 0;
            
            const baseItems = menuItems.filter(item => {
              if (!item.minRole) return true;
              const minRoleWeight = rolePrecedence[item.minRole as keyof typeof rolePrecedence] || 0;
              return userRoleWeight >= minRoleWeight;
            });

            const finalItems = user?.role === 'SUPER_ADMIN' 
              ? [...baseItems, { icon: Database, label: 'Data Grid', path: '/admin' }] 
              : baseItems;

            return finalItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.label}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${
                      collapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'
                    }`}
                    data-tooltip={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--text-primary)] rounded-r-full"
                      />
                    )}

                    <item.icon
                      className={`w-[18px] h-[18px] flex-shrink-0 ${
                        isActive ? 'text-black' : 'text-[var(--text-muted)] group-hover:text-black'
                      }`}
                    />
                    {!collapsed && (
                      <span className={`text-[13px] font-medium flex-1 ${isActive ? 'text-black' : ''}`}>{item.label}</span>
                    )}

                    {item.label === 'Time Logs' && draftCount > 0 && (
                      <div className={`flex items-center justify-center rounded-full bg-blue-500 text-[9px] font-black text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] ${collapsed ? 'absolute top-2 right-2 w-4 h-4' : 'w-5 h-5'}`}>
                        {draftCount}
                      </div>
                    )}

                    {/* Active subtle bg */}
                    {isActive && (
                      <div
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{ background: 'var(--bg-surface-hover)' }}
                      />
                    )}
                  </button>
                </li>
              );
            });
          })()}
        </ul>
      </nav>
      {/* Upgrade Box */}
      {!collapsed && (
        <div className="mx-3 mt-auto p-4 rounded-2xl bg-black text-white mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1">Upgrade Plan</p>
          <p className="text-[9px] text-white/50 mb-3 leading-relaxed">Access advanced predictive analytics and priority support.</p>
          <button className="w-full py-2 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-white/90 transition-colors">
            Go Pro
          </button>
        </div>
      )}

      {/* User section at bottom */}
      <div className="px-3 pb-5 border-t border-[var(--border-subtle)] pt-4">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl text-[var(--text-muted)] hover:bg-red-500/5 hover:text-red-500 transition-all duration-200 ${
            collapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5'
          }`}
          data-tooltip={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
