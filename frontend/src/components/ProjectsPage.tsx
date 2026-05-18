import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Layers, X, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import type { Project as BaseProject, Phase as BasePhase } from '../types';

interface Project extends BaseProject {
  _count?: { timeEntries: number };
}

interface Phase extends BasePhase {
  _count?: { timeEntries: number };
}

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#22c55e','#ef4444','#ec4899','#f97316','#14b8a6','#6366f1'];

type Tab = 'projects' | 'phases';

import { 
  getProjects as apiGetProjects, 
  createProject as apiCreateProject, 
  updateProject as apiUpdateProject, 
  deleteProject as apiDeleteProject,
  getPhases as apiGetPhases,
  createPhase as apiCreatePhase,
  updatePhase as apiUpdatePhase,
  deletePhase as apiDeletePhase
} from '../api';

const ProjectsPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Inline editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showNew, setShowNew] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const data = await apiGetProjects();
      setProjects(data as Project[]);
    } catch {}
  }, []);

  const fetchPhases = useCallback(async () => {
    try {
      const data = await apiGetPhases();
      setPhases(data as Phase[]);
    } catch {}
  }, []);

  useEffect(() => { fetchProjects(); fetchPhases(); }, [fetchProjects, fetchPhases]);

  // --- Project CRUD ---
  const handleCreateProject = async () => {
    if (!newName.trim()) { addToast({ type: 'warning', title: 'Name required' }); return; }
    try {
      await apiCreateProject({ name: newName, color: newColor });
      addToast({ type: 'success', title: 'Project created' });
      setNewName(''); setShowNew(false); fetchProjects();
    } catch {
      addToast({ type: 'error', title: 'Failed to create' });
    }
  };

  const handleUpdateProject = async (id: string) => {
    try {
      await apiUpdateProject(id, { name: editName, color: editColor });
      addToast({ type: 'success', title: 'Project updated' });
      setEditId(null); fetchProjects();
    } catch {
      addToast({ type: 'error', title: 'Failed to update' });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project? Entries will be unlinked.')) return;
    try {
      await apiDeleteProject(id);
      addToast({ type: 'success', title: 'Project deleted' });
      fetchProjects();
    } catch {
      addToast({ type: 'error', title: 'Failed to delete' });
    }
  };

  // --- Phase CRUD ---
  const handleCreatePhase = async () => {
    if (!newName.trim()) { addToast({ type: 'warning', title: 'Name required' }); return; }
    try {
      await apiCreatePhase({ name: newName });
      addToast({ type: 'success', title: 'Phase created' });
      setNewName(''); setShowNew(false); fetchPhases();
    } catch {
      addToast({ type: 'error', title: 'Failed to create' });
    }
  };

  const handleUpdatePhase = async (id: string) => {
    try {
      await apiUpdatePhase(id, { name: editName });
      addToast({ type: 'success', title: 'Phase updated' });
      setEditId(null); fetchPhases();
    } catch {
      addToast({ type: 'error', title: 'Failed to update' });
    }
  };

  const handleDeletePhase = async (id: string) => {
    if (!confirm('Delete this phase? Entries will be unlinked.')) return;
    try {
      await apiDeletePhase(id);
      addToast({ type: 'success', title: 'Phase deleted' });
      fetchPhases();
    } catch {
      addToast({ type: 'error', title: 'Failed to delete' });
    }
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Project Management</h1>
          <p className="text-[10px] text-[var(--text-faint)] mt-1 uppercase tracking-[0.2em] font-black">Manage projects and development phases</p>
        </div>
        <button onClick={() => { setShowNew(true); setNewName(''); setNewColor('#3b82f6'); }}
          className="btn-primary px-8 py-3 text-sm font-bold flex items-center gap-2 rounded-2xl">
          <Plus size={16} /> {tab === 'projects' ? 'New Project' : 'New Phase'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[var(--bg-surface-hover)] p-1.5 rounded-2xl border border-[var(--border-subtle)] mb-8 w-fit">
        <button 
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${tab === 'projects' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`} 
          onClick={() => { setTab('projects'); setShowNew(false); setEditId(null); }}
        >
          Projects ({projects.length})
        </button>
        <button 
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${tab === 'phases' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`} 
          onClick={() => { setTab('phases'); setShowNew(false); setEditId(null); }}
        >
          Phases ({phases.length})
        </button>
      </div>

      {/* New Item Form */}
      {showNew && (
        <div className="glass-card p-6 mb-8 border border-black animate-slideDown opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-6">
            {tab === 'projects' && (
              <div className="flex items-center gap-2.5">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${newColor === c ? 'ring-2 ring-black ring-offset-2 scale-110' : 'opacity-40 hover:opacity-100'}`}
                    style={{ background: c }} />
                ))}
              </div>
            )}
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === 'projects' ? 'Project name...' : 'Phase name...'}
              className="glass-input flex-1 px-5 py-3 rounded-2xl text-sm font-bold" autoFocus
              onKeyDown={e => { if (e.key === 'Enter') tab === 'projects' ? handleCreateProject() : handleCreatePhase(); }} />
            <div className="flex items-center gap-2">
              <button onClick={() => tab === 'projects' ? handleCreateProject() : handleCreatePhase()}
                className="p-3 rounded-2xl bg-black text-white hover:bg-zinc-800 transition-all"><Check size={18} /></button>
              <button onClick={() => setShowNew(false)}
                className="p-3 rounded-2xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)] hover:text-red-500 transition-all"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === 'projects' ? (
        <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]">
                <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Color</th>
                <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Project Name</th>
                <th className="text-center px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Time Entries</th>
                <th className="text-center px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Status</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
               {projects.map(p => (
                <tr key={p.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                  <td className="px-6 py-5">
                    {editId === p.id ? (
                      <div className="flex gap-1.5">{COLORS.map(c => (
                        <button key={c} onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full ${editColor === c ? 'ring-2 ring-black scale-110' : 'opacity-30'}`}
                          style={{ background: c }} />
                      ))}</div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[var(--border-subtle)] shadow-sm" style={{ background: p.color }} />
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="glass-input px-4 py-2 rounded-xl text-sm font-bold w-64" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateProject(p.id); if (e.key === 'Escape') setEditId(null); }} />
                    ) : (
                      <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-[11px] font-bold text-[var(--text-faint)] tabular-nums">{p._count?.timeEntries || 0}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${p.status === 'ACTIVE' ? 'text-green-500' : 'text-zinc-400'}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {editId === p.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleUpdateProject(p.id)} className="p-2 rounded-xl bg-black text-white"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)]"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/projects/${p.id}`)}
                          className="p-2.5 rounded-2xl hover:bg-blue-500/10 text-blue-500" title="Project Intelligence"><ExternalLink size={14} /></button>
                        <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditColor(p.color); }}
                          className="p-2.5 rounded-2xl hover:bg-black/5 text-[var(--text-faint)] hover:text-black"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteProject(p.id)}
                          className="p-2.5 rounded-2xl hover:bg-red-500/5 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="py-12 text-center"><Briefcase size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No projects yet. Create one to get started.</p></div>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em] w-16">#</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Phase Name</th>
                <th className="text-center px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Time Entries</th>
                <th className="text-right px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
               {phases.map((p, i) => (
                <tr key={p.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                  <td className="px-6 py-5 text-[11px] font-black text-[var(--text-faint)] tabular-nums">{i + 1}</td>
                  <td className="px-6 py-5">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="glass-input px-4 py-2 rounded-xl text-sm font-bold w-64" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdatePhase(p.id); if (e.key === 'Escape') setEditId(null); }} />
                    ) : (
                      <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center text-[11px] font-bold text-[var(--text-faint)] tabular-nums">{p._count?.timeEntries || 0}</td>
                  <td className="px-6 py-5 text-right">
                    {editId === p.id ? (
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleUpdatePhase(p.id)} className="p-2 rounded-xl bg-black text-white"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="p-2 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)]"><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(p.id); setEditName(p.name); }}
                          className="p-2.5 rounded-2xl hover:bg-black/5 text-[var(--text-faint)] hover:text-black"><Pencil size={14} /></button>
                        <button onClick={() => handleDeletePhase(p.id)}
                          className="p-2.5 rounded-2xl hover:bg-red-500/5 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {phases.length === 0 && (
            <div className="py-12 text-center"><Layers size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No phases yet. Create one to get started.</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
