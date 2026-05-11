import React, { useState } from 'react';
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
  { icon: Briefcase, label: 'Plans', path: '/plans' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
      style={{
        background: 'rgba(8, 8, 15, 0.90)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className={`flex items-center justify-between px-5 pt-7 pb-2 ${collapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--gradient-accent)', boxShadow: '0 0 16px rgba(59,130,246,0.2)' }}
          >
            <Clock className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Aion</h1>
              {user?.orgName && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Building2 size={9} className="text-white/20" />
                  <span className="text-[9px] text-white/20 font-medium uppercase tracking-wider truncate">{user.orgName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#0a0a14] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer z-50 opacity-0 hover:opacity-100 group-hover:opacity-100"
        style={{ opacity: 0.4 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
      >
        <ChevronLeft size={12} className={`text-white/60 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3">
        <ul className="space-y-1">
          {(user?.role === 'SUPER_ADMIN' ? [...menuItems, { icon: Database, label: 'Data Grid', path: '/admin' }] : menuItems).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${
                    collapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                      style={{
                        height: 20,
                        background: 'var(--gradient-accent)',
                        boxShadow: '0 0 8px rgba(59,130,246,0.3)',
                      }}
                    />
                  )}

                  <item.icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${
                      isActive ? 'text-blue-400' : 'text-white/40 group-hover:text-white/60'
                    }`}
                  />
                  {!collapsed && (
                    <span className="text-[13px] font-medium">{item.label}</span>
                  )}

                  {/* Active subtle bg */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl -z-10"
                      style={{ background: 'rgba(59, 130, 246, 0.06)' }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section at bottom */}
      <div className="mt-auto px-3 pb-5 border-t border-white/5 pt-4">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-white/50">
                  {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">{user.name}</p>
              <p className="text-[10px] text-white/30 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl text-white/30 hover:bg-red-500/5 hover:text-red-400 transition-all duration-200 ${
            collapsed ? 'px-0 py-3 justify-center' : 'px-3.5 py-2.5'
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
