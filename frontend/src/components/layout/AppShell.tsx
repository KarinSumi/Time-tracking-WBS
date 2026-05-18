import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import ProfileDropdown from '../ProfileDropdown';
import { Bell } from 'lucide-react';

const AppShell: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[var(--bg-root)] overflow-hidden font-sans text-[var(--text-primary)] selection:bg-blue-500/20">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <header className="flex justify-between items-center px-8 py-6 sticky top-0 z-10"
          style={{ background: 'var(--bg-root)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-[var(--bg-surface-hover)] transition-all text-[var(--text-secondary)]" title="Notifications">
              <Bell size={20} />
            </button>
            <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />
            <ProfileDropdown />
          </div>
        </header>
        
        <Outlet />

        <footer className="px-8 py-6 text-center mt-8 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] font-medium text-[var(--text-faint)] uppercase tracking-widest">
            Aion · Enterprise Time Tracking · {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AppShell;
