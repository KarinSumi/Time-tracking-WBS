import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertCircle, Search, Bell, Plus, Check, Upload, Download, Activity, ShieldAlert, Unlock, Cpu, Database, Clock, HardDrive, Terminal } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

import type { User, Project, TimeEntry } from '../types';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatUptime = (seconds?: number) => {
  if (!seconds) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
};

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

import { 
  getAdminEntries, 
  getAdminUsers, 
  updateAdminEntry, 
  createAdminEntry, 
  uploadAdminEntries,
  getProjects,
  getAdminStatus,
  unlockAdminAccount
} from '../api';

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

  // Tab and system metrics state
  const [activeTab, setActiveTab] = useState<'grid' | 'monitor'>('grid');
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

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
      const data = await getAdminEntries({
        userId: filterUser || undefined,
        projectId: filterProject || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
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

  const fetchSystemMetrics = useCallback(async () => {
    setIsMetricsLoading(true);
    try {
      const data = await getAdminStatus();
      setSystemMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchSystemMetrics();
      const interval = setInterval(fetchSystemMetrics, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchSystemMetrics]);

  const handleManualUnlock = async (email: string) => {
    try {
      const res = await unlockAdminAccount(email);
      if (res.success) {
        addToast({ type: 'success', title: 'Unlocked', message: res.message || 'Account unlocked successfully' });
        fetchSystemMetrics();
      }
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to unlock account' });
    }
  };

  useEffect(() => {
    if (!token) return;
    getAdminUsers().then(setUsers).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
  }, [token]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    entries.forEach(e => {
      const key = `${e.user?.email}_${e.date.split('T')[0]}`;
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
    setEditingCell({ id: entry.id!, field });
    setEditValue(field === 'hours' ? entry.hours.toString() : entry.taskDescription);
  };

  const handleSaveEdit = async (entry: TimeEntry, field: 'hours' | 'taskDescription') => {
    if (!editingCell || !entry.id) return;
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
      const updatedEntry = await updateAdminEntry(entry.id, { [field]: newValue });
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
      const savedEntry = await createAdminEntry({
        userId: newEntryUserId,
        hours: h,
        taskDescription: newEntryDesc,
        projectId: newEntryProjectId || undefined,
        date: new Date(newEntryDate + 'T12:00:00').toISOString()
      });
      setEntries([savedEntry, ...entries]);
      addToast({ type: 'success', title: 'Success', message: 'Entry added successfully' });
      setIsAddingRow(false);
      setNewEntryHours('');
      setNewEntryDesc('');
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create entry' });
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = entries.map(e => ({
        'Date': e.date.split('T')[0],
        'Employee': e.user?.name || e.user?.email,
        'Project': e.project?.name || 'None',
        'Phase': e.phase?.name || '-',
        'Hours': e.hours,
        'Task Description': e.taskDescription,
        'Status': e.status
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Time Entries');
      
      const fileName = `Time_Entries_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      addToast({ type: 'success', title: 'Export Complete', message: `Downloaded ${fileName}` });
    } catch (error) {
      addToast({ type: 'error', title: 'Export Failed', message: 'Could not generate Excel file' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadAdminEntries(formData);
      addToast({ type: 'success', title: `Imported ${data.created} entries` });
      if (data.errors > 0) addToast({ type: 'error', title: `${data.errors} rows failed validation` });
      fetchEntries(); // Refresh table
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
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

      {/* Title & Filters Action Bar with Tab Toggles */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#1a1b2a] border-b border-white/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('grid')}
            className={`text-lg font-semibold tracking-wide pb-1 transition-all relative ${activeTab === 'grid' ? 'text-[#b184f5]' : 'text-white/40 hover:text-white/70'}`}
          >
            Data Grid
            {activeTab === 'grid' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b184f5] rounded" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('monitor')}
            className={`text-lg font-semibold tracking-wide pb-1 transition-all relative flex items-center gap-2 ${activeTab === 'monitor' ? 'text-[#b184f5]' : 'text-white/40 hover:text-white/70'}`}
          >
            <Activity size={16} />
            System Monitor
            {activeTab === 'monitor' && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#b184f5] rounded" />
            )}
          </button>
        </div>

        {activeTab === 'grid' && (
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
              onClick={handleExportExcel}
              className="ml-1 bg-[#25273c] hover:bg-[#2d2f48] text-white/80 hover:text-white text-sm font-medium py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors border border-white/10"
            >
              <Download size={16} /> Export
            </button>

            <button 
              onClick={() => setIsAddingRow(true)}
              className="ml-1 bg-[#9c5af2] hover:bg-[#8b4de0] text-white text-sm font-semibold py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(156,90,242,0.4)]"
            >
              <Plus size={16} /> Add Entry
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'monitor' ? (
        <div className="flex-1 overflow-auto p-6 space-y-6 bg-[#141521]">
          {isMetricsLoading && !systemMetrics ? (
            <div className="flex h-full items-center justify-center text-white/30">Loading metrics...</div>
          ) : (
            <>
              {/* Top Row Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Health Status Card */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-sm font-medium">System Health</span>
                    <Activity className={`w-5 h-5 ${systemMetrics?.status === 'healthy' ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold tracking-tight uppercase ${systemMetrics?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {systemMetrics?.status || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">Continuous health checking active</p>
                  <div className={`absolute bottom-0 left-0 w-full h-[3px] ${systemMetrics?.status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </div>

                {/* Database Card */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-sm font-medium">Database (SQLite)</span>
                    <Database className={`w-5 h-5 ${systemMetrics?.database?.status === 'UP' ? 'text-blue-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold tracking-tight uppercase ${systemMetrics?.database?.status === 'UP' ? 'text-blue-400' : 'text-red-400'}`}>
                      {systemMetrics?.database?.status === 'UP' ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">Active connection pool</p>
                  <div className={`absolute bottom-0 left-0 w-full h-[3px] ${systemMetrics?.database?.status === 'UP' ? 'bg-blue-400' : 'bg-red-400'}`} />
                </div>

                {/* Uptime Card */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-sm font-medium">System Uptime</span>
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-white">
                      {formatUptime(systemMetrics?.system?.uptime)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">Node.js server uptime status</p>
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-400" />
                </div>

                {/* Lockout status card */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-sm font-medium">Active Lockouts</span>
                    <ShieldAlert className={`w-5 h-5 ${systemMetrics?.lockouts?.length > 0 ? 'text-amber-400 animate-bounce' : 'text-white/40'}`} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold tracking-tight ${systemMetrics?.lockouts?.length > 0 ? 'text-amber-400' : 'text-white'}`}>
                      {systemMetrics?.lockouts?.length || 0}
                    </span>
                    <span className="text-xs text-white/40">accounts</span>
                  </div>
                  <p className="text-xs text-white/40 mt-2">Temporary security locks</p>
                  <div className={`absolute bottom-0 left-0 w-full h-[3px] ${systemMetrics?.lockouts?.length > 0 ? 'bg-amber-400' : 'bg-white/10'}`} />
                </div>

              </div>

              {/* Resource Metrics & Lockouts Detail Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Resource Stats */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg lg:col-span-1 space-y-6">
                  <h3 className="text-sm font-semibold tracking-wider text-white/60 uppercase flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-400" /> Server Resources
                  </h3>
                  
                  {/* Memory Used Progress Bar */}
                  {systemMetrics?.system?.memory && (() => {
                    const mem = systemMetrics.system.memory;
                    const usedMB = Math.round(mem.heapUsed / (1024 * 1024));
                    const totalMB = Math.round(mem.heapTotal / (1024 * 1024));
                    const percent = Math.min(100, Math.round((mem.heapUsed / mem.heapTotal) * 100)) || 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-white/60">Memory (Heap Used / Total)</span>
                          <span className="text-white">{usedMB}MB / {totalMB}MB ({percent}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${percent > 80 ? 'bg-red-400' : percent > 50 ? 'bg-amber-400' : 'bg-[#9c5af2]'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-white/40">RSS: {formatBytes(mem.rss)} | External: {formatBytes(mem.external)}</p>
                      </div>
                    );
                  })()}

                  {/* CPU usage section */}
                  {systemMetrics?.system?.cpu && (() => {
                    const cpu = systemMetrics.system.cpu;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">CPU Process Time</span>
                          <Cpu className="w-4 h-4 text-[#9c5af2]" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#141521] p-3 rounded-lg border border-white/5">
                            <span className="text-[11px] text-white/40 block mb-1">User Space</span>
                            <span className="text-sm font-semibold tabular-nums">{(cpu.user / 1000000).toFixed(2)}s</span>
                          </div>
                          <div className="bg-[#141521] p-3 rounded-lg border border-white/5">
                            <span className="text-[11px] text-white/40 block mb-1">System Space</span>
                            <span className="text-sm font-semibold tabular-nums">{(cpu.system / 1000000).toFixed(2)}s</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Locked Out Accounts Detail */}
                <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg lg:col-span-2 flex flex-col min-h-[300px]">
                  <h3 className="text-sm font-semibold tracking-wider text-white/60 uppercase flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Active Account Lockouts
                  </h3>
                  
                  <div className="flex-1 overflow-auto">
                    {systemMetrics?.lockouts && systemMetrics.lockouts.length > 0 ? (
                      <div className="divide-y divide-white/5">
                        {systemMetrics.lockouts.map((lock: any) => (
                          <div key={lock.email} className="py-3 flex items-center justify-between group">
                            <div>
                              <p className="text-sm font-medium text-white">{lock.email}</p>
                              <p className="text-xs text-white/40 mt-1">
                                Attempts: <span className="text-red-400 font-semibold">{lock.attempts}</span> | Locked Until: {new Date(lock.lockedUntil).toLocaleTimeString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleManualUnlock(lock.email)}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all border border-amber-500/20 group-hover:border-amber-500/40"
                            >
                              <Unlock size={14} /> Unlock
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Check className="w-8 h-8 text-emerald-400 mb-2" />
                        <p className="text-white/60 text-sm font-medium">No Locked Out Accounts</p>
                        <p className="text-white/30 text-xs mt-1">Brute-force protection is monitoring log-in attempts</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Security Events Audit Log Console */}
              <div className="bg-[#1a1b2a] rounded-xl p-5 border border-white/5 shadow-lg flex flex-col h-[400px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold tracking-wider text-white/60 uppercase flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-400" /> IDS & Security Incident Console
                  </h3>
                  <span className="text-[11px] text-white/40">Showing last 20 events</span>
                </div>
                
                <div className="flex-1 overflow-auto bg-[#0d0f17] rounded-lg border border-white/5 p-4 font-mono text-xs space-y-3 scrollbar-thin">
                  {systemMetrics?.securityEvents && systemMetrics.securityEvents.length > 0 ? (
                    systemMetrics.securityEvents.map((evt: any) => {
                      const isThreat = evt.action === 'INTRUSION_ALERT' || evt.action === 'BRUTE_FORCE_LOCKOUT';
                      return (
                        <div key={evt.id} className={`p-2 rounded border transition-colors ${isThreat ? 'bg-red-950/20 border-red-500/20 text-red-300' : 'bg-white/[0.02] border-white/5 text-white/70'}`}>
                          <div className="flex justify-between font-semibold mb-1">
                            <span className={isThreat ? 'text-red-400' : 'text-[#b184f5]'}>
                              [{evt.action}]
                            </span>
                            <span className="text-white/30">
                              {new Date(evt.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px]">
                            <span className="text-white/40">Target:</span> {evt.entityId} | 
                            <span className="text-white/40"> UserID:</span> {evt.performedBy || 'Anonymous'}
                          </p>
                          {evt.newValues && (
                            <pre className="mt-1 text-[10px] text-white/50 overflow-x-auto bg-[#0d0f17]/55 p-1 rounded max-w-full whitespace-pre-wrap break-all">
                              {JSON.stringify(evt.newValues)}
                            </pre>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 italic">
                      No security incidents logged. System is secure.
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      ) : (
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
                  const dateKey = `${entry.user?.email}_${entry.date.split('T')[0]}`;
                  const totalHours = dailyTotals[dateKey] || 0;
                  const isHoursInvalid = totalHours !== 8;
                  const isEditingHours = editingCell?.id === entry.id && editingCell?.field === 'hours';
                  const isEditingDesc = editingCell?.id === entry.id && editingCell?.field === 'taskDescription';

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
                          {entry.user?.avatarUrl ? (
                            <img src={entry.user?.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/10" />
                          )}
                          <span className="text-white/80 font-medium">{entry.user?.name || entry.user?.email}</span>
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
      )}
    </div>
  );
};

export default SuperAdminTable;
