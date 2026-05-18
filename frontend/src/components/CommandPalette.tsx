import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Users, Clock, Settings, LayoutDashboard, Command } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'project' | 'user' | 'page';
  label: string;
  path: string;
  icon: any;
}

import { getProjects } from '../api';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Static pages
  const pages: SearchResult[] = [
    { id: 'p1', type: 'page', label: 'Go to Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'p2', type: 'page', label: 'Log My Time', path: '/logs', icon: Clock },
    { id: 'p3', type: 'page', label: 'View Project Plans', path: '/plans', icon: Briefcase },
    { id: 'p4', type: 'page', label: 'Team Overview', path: '/team', icon: Users },
    { id: 'p5', type: 'page', label: 'User Settings', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults(pages);
      return;
    }

    const filteredPages = pages.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
    
    try {
      // Fuzzy search projects
      const projects = await getProjects();
      const matchedProjects = projects
        .filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map((p: any) => ({ id: p.id, type: 'project' as const, label: `Project: ${p.name}`, path: `/projects`, icon: Briefcase }));

      setResults([...filteredPages, ...matchedProjects]);
    } catch {
      setResults(filteredPages);
    }
  };

  useEffect(() => {
    fetchResults(query);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    setIsOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
      
      {/* Palette Body */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <Search size={20} className="text-[var(--text-faint)]" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type a command or search..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent border-none text-lg text-[var(--text-primary)] focus:ring-0 outline-none placeholder:text-[var(--text-faint)]"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-faint)] uppercase tracking-widest">
            <Command size={10} /> K
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-faint)] text-sm italic">No matching results found...</div>
          ) : (
            results.map((result, idx) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${idx === selectedIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]'}`}
              >
                <div className={`p-2 rounded-lg ${idx === selectedIndex ? 'bg-white/20' : 'bg-[var(--bg-surface-hover)] text-[var(--text-faint)]'}`}>
                  <result.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{result.label}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-black opacity-40`}>{result.type}</p>
                </div>
                {idx === selectedIndex && <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Enter</span>}
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-faint)] font-bold uppercase tracking-widest">
              <span className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">↑↓</span> Navigate
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-faint)] font-bold uppercase tracking-widest">
              <span className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">ESC</span> Close
            </div>
          </div>
          <p className="text-[9px] text-[var(--text-faint)] font-bold uppercase tracking-widest opacity-60">Aion Enterprise Search</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
