import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertCircle, CheckCircle2, Search, Bell, Plus, Check, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User { id: string; name: string; email: string; avatarUrl: string | null; }
interface Project { id: string; name: string; color: string; }
interface Phase { id: string; name: string; }
interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  taskDescription: string;
  status: string;
  user: User;
  project: Project | null;
  phase: Phase | null;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const SuperAdminTable: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ id: string, field: 'hours' | 'taskDescription' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Add new entry state
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newEntryDate, setNewEntryDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [newEntryUserId, setNewEntryUserId] = useState('');
  const [newEntryProjectId, setNewEntryProjectId] = useState('');
  const [newEntryHours, setNewEntryHours] = useState('');
  const [newEntryDesc, setNewEntryDesc] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterUser) params.append('userId', filterUser);
      if (filterProject) params.append('projectId', filterProject);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/admin/entries?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Access denied');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load data or unauthorized' });
    } finally {
      setIsLoading(false);
    }
  }, [token, filterUser, filterProject, startDate, endDate, addToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(setUsers).catch(console.error);
    fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(setProjects).catch(console.error);
  }, [token]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    entries.forEach(e => {
      const key = `${e.user.email}_${e.date.split('T')[0]}`;
      totals[key] = (totals[key] || 0) + Number(e.hours);
    });
    // Add new row temporary hours if same day
    if (isAddingRow && newEntryUserId && newEntryDate) {
      const u = users.find(u => u.id === newEntryUserId);
      if (u) {
        const key = `${u.email}_${newEntryDate}`;
        totals[key] = (totals[key] || 0) + Number(newEntryHours || 0);
      }
    }
    return totals;
  }, [entries, isAddingRow, newEntryUserId, newEntryDate, newEntryHours, users]);

  const handleCellClick = (entry: TimeEntry, field: 'hours' | 'taskDescription') => {
    setEditingCell({ id: entry.id, field });
    setEditValue(field === 'hours' ? entry.hours.toString() : entry.taskDescription);
  };

  const handleSaveEdit = async (entry: TimeEntry, field: 'hours' | 'taskDescription') => {
    if (!editingCell) return;
    let newValue: any = editValue;
    if (field === 'hours') {
      newValue = parseFloat(editValue);
      if (isNaN(newValue) || newValue < 0) {
        addToast({ type: 'error', title: 'Invalid Input', message: 'Hours must be a positive number' });
        setEditingCell(null);
        return;
      }
      if (newValue === entry.hours) { setEditingCell(null); return; }
    } else {
      if (newValue === entry.taskDescription) { setEditingCell(null); return; }
    }

    try {
      const res = await fetch(`/api/admin/entries/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ [field]: newValue })
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedEntry = await res.json();
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, ...updatedEntry } : e));
      addToast({ type: 'success', title: 'Updated', message: 'Entry updated successfully' });
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: 'Could not save the changes.' });
    } finally {
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, entry: TimeEntry, field: 'hours' | 'taskDescription') => {
    if (e.key === 'Enter') handleSaveEdit(entry, field);
    else if (e.key === 'Escape') setEditingCell(null);
  };

  const handleCreateNewEntry = async () => {
    if (!newEntryUserId || !newEntryHours || !newEntryDesc) {
      addToast({ type: 'warning', title: 'Missing fields', message: 'User, hours, and description are required' });
      return;
    }
    const h = parseFloat(newEntryHours);
    if (isNaN(h) || h <= 0) {
      addToast({ type: 'error', title: 'Invalid Hours', message: 'Hours must be positive' });
      return;
    }

    try {
      const res = await fetch('/api/admin/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: newEntryUserId,
          hours: h,
          taskDescription: newEntryDesc,
          projectId: newEntryProjectId || null,
          date: new Date(newEntryDate + 'T12:00:00').toISOString()
        })
      });
      if (!res.ok) throw new Error('Create failed');
      const savedEntry = await res.json();
      setEntries([savedEntry, ...entries]);
      addToast({ type: 'success', title: 'Success', message: 'Entry added successfully' });
      setIsAddingRow(false);
      setNewEntryHours('');
      setNewEntryDesc('');
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create entry' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/entries/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        addToast({ type: 'success', title: `Imported ${data.created} entries` });
        if (data.errors > 0) addToast({ type: 'error', title: `${data.errors} rows failed validation` });
        fetchEntries(); // Refresh table
      } else {
        addToast({ type: 'error', title: data.error || 'Upload failed' });
      }
    } catch {
      addToast({ type: 'error', title: 'Upload connection error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl glass-panel">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60">Only Super Administrators can access the Data Grid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0f17] text-white overflow-hidden rounded-xl border border-white/10 shadow-2xl relative" style={{ margin: '-1rem' }}>
      
      {/* Top Navigation Bar mimicking the Mockup */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#141521]">
        <h1 className="text-xl font-bold tracking-tight text-[#b184f5] mr-8">EMPLOYEE TIME TRACKING</h1>
        
        <nav className="flex items-center gap-6 flex-1 ml-4 text-sm font-medium">
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors">Dashboard</button>
          <button onClick={() => navigate('/projects')} className="text-white/40 hover:text-white transition-colors">Projects</button>
          <button onClick={() => navigate('/team')} className="text-white/40 hover:text-white transition-colors">Team</button>
          <button onClick={() => navigate('/reports')} className="text-white/40 hover:text-white transition-colors">Reports</button>
          <button onClick={() => navigate('/settings')} className="text-white/40 hover:text-white transition-colors">Settings</button>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-white/40 hover:text-white"><Search size={18} /></button>
          <button className="text-white/40 hover:text-white relative">
            <Bell size={18} />
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-pink-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold border border-white/20">
            SA
          </div>
        </div>
      </div>

      {/* Title & Filters Action Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1b2a]">
        <h2 className="text-lg font-semibold tracking-wide">Data Grid</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50 mr-2">Filters</span>
          
          <div className="flex items-center bg-[#25273c] rounded-lg border border-white/10 px-2 py-1 gap-2">
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-sm text-white/80 focus:outline-none w-[110px]"
              style={{ colorScheme: 'dark' }}
            />
            <span className="text-white/30">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-sm text-white/80 focus:outline-none w-[110px]"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <select 
            value={filterUser} 
            onChange={e => setFilterUser(e.target.value)}
            className="bg-[#25273c] text-white/80 text-sm rounded-lg border border-white/10 px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Persons</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <select 
            value={filterProject} 
            onChange={e => setFilterProject(e.target.value)}
            className="bg-[#25273c] text-white/80 text-sm rounded-lg border border-white/10 px-3 py-1.5 focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="ml-2 bg-[#25273c] hover:bg-[#2d2f48] text-white/80 hover:text-white text-sm font-medium py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
          >
            <Upload size={16} /> {isUploading ? 'Uploading...' : 'Import Excel'}
          </button>

          <button 
            onClick={() => setIsAddingRow(true)}
            className="ml-1 bg-[#9c5af2] hover:bg-[#8b4de0] text-white text-sm font-semibold py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(156,90,242,0.4)]"
          >
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto bg-[#141521]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-white/30">Loading entries...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="sticky top-0 bg-[#1a1b2a] z-10 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px]">Date</th>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px]">Employee</th>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px]">Project</th>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px]">Phase</th>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px]">Hours</th>
                <th className="px-6 py-4 font-semibold text-white/40 uppercase tracking-widest text-[11px] w-full">Task Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              {/* Add New Row Mode */}
              {isAddingRow && (
                <tr className="bg-[#1e1f33]">
                  <td className="px-6 py-3">
                    <input type="date" value={newEntryDate} onChange={e => setNewEntryDate(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-[#9c5af2]" style={{ colorScheme: 'dark' }} />
                  </td>
                  <td className="px-6 py-3">
                    <select value={newEntryUserId} onChange={e => setNewEntryUserId(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-[#9c5af2]">
                      <option value="">Select User</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <select value={newEntryProjectId} onChange={e => setNewEntryProjectId(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-[#9c5af2]">
                      <option value="">Select Project (Opt)</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-white/30 text-xs italic">-</td>
                  <td className="px-6 py-3">
                    <input type="number" step="0.25" placeholder="0.0" value={newEntryHours} onChange={e => setNewEntryHours(e.target.value)} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-[#9c5af2] w-16" />
                  </td>
                  <td className="px-6 py-3 flex items-center justify-between gap-4">
                    <input type="text" placeholder="Task description..." value={newEntryDesc} onChange={e => setNewEntryDesc(e.target.value)} 
                      onKeyDown={e => { if (e.key === 'Enter') handleCreateNewEntry(); }}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-[#9c5af2] flex-1" />
                    <div className="flex items-center gap-2 pr-4">
                      <button onClick={handleCreateNewEntry} className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"><Check size={16} /></button>
                      <button onClick={() => setIsAddingRow(false)} className="text-white/30 hover:text-white transition-colors text-xs px-2">Cancel</button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Render Existing Entries */}
              {entries.map(entry => {
                const dateKey = `${entry.user.email}_${entry.date.split('T')[0]}`;
                const totalHours = dailyTotals[dateKey] || 0;
                const isHoursInvalid = totalHours !== 8;
                const isEditingHours = editingCell?.id === entry.id && editingCell.field === 'hours';
                const isEditingDesc = editingCell?.id === entry.id && editingCell.field === 'taskDescription';

                return (
                  <tr key={entry.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isHoursInvalid ? 'text-red-400 font-medium' : 'text-white/80'}`}>
                          {formatDate(entry.date)}
                        </span>
                        {isHoursInvalid && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" title={`Total hours: ${totalHours}`} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {entry.user.avatarUrl ? (
                          <img src={entry.user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white/10" />
                        )}
                        <span className="text-white/80 font-medium">{entry.user.name || entry.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm" style={{ color: entry.project?.color || '#a1a1aa' }}>
                        {entry.project ? entry.project.name : 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[#38bdf8] text-sm">{entry.phase ? entry.phase.name : '-'}</span>
                    </td>
                    <td 
                      className={`px-6 py-3 cursor-text transition-colors relative ${isEditingHours ? 'bg-indigo-500/20' : ''}`}
                      onClick={() => !isEditingHours && handleCellClick(entry, 'hours')}
                    >
                      {/* Cell border effect matching mockup when edited */}
                      {isEditingHours && <div className="absolute inset-0 border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded" />}
                      
                      {isEditingHours ? (
                        <input
                          type="number"
                          step="0.25"
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(entry, 'hours')}
                          onKeyDown={e => handleKeyDown(e, entry, 'hours')}
                          className="w-16 bg-transparent text-white focus:outline-none font-medium tabular-nums relative z-10"
                        />
                      ) : (
                        <span className={`tabular-nums font-medium ${isHoursInvalid ? 'text-red-300' : 'text-white'}`}>
                          {Number(entry.hours).toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td 
                      className={`px-6 py-3 cursor-text transition-colors relative ${isEditingDesc ? 'bg-indigo-500/20' : ''}`}
                      onClick={() => !isEditingDesc && handleCellClick(entry, 'taskDescription')}
                    >
                      {isEditingDesc && <div className="absolute inset-0 border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded" />}
                      {isEditingDesc ? (
                        <input
                          type="text"
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => handleSaveEdit(entry, 'taskDescription')}
                          onKeyDown={e => handleKeyDown(e, entry, 'taskDescription')}
                          className="w-full min-w-[200px] bg-transparent text-white focus:outline-none relative z-10"
                        />
                      ) : (
                        <span className="text-white/70 truncate block max-w-[300px]" title={entry.taskDescription}>
                          {entry.taskDescription}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!isAddingRow && entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">No entries match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminTable;
