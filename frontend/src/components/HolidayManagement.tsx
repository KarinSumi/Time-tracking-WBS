import React, { useState, useEffect, useCallback } from 'react';
import { Palmtree, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { useToast } from '../context/ToastContext';

import { getHolidays, createHoliday, deleteHoliday } from '../api';
import type { Holiday } from '../types';

const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');


  const { addToast } = useToast();

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getHolidays();
      setHolidays(data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load holidays' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newDesc) return;

    setIsCreating(true);
    try {
      await createHoliday({ date: newDate, description: newDesc });
      addToast({ type: 'success', title: 'Holiday added' });
      setNewDate('');
      setNewDesc('');
      fetchHolidays();
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to add holiday' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this holiday? Capacity reports will be recalculated.')) return;

    try {
      await deleteHoliday(id);
      addToast({ type: 'success', title: 'Holiday deleted' });
      fetchHolidays();
    } catch {
      addToast({ type: 'error', title: 'Connection error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New */}
      <div className="glass-card p-7">
        <h2 className="text-[11px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <Plus size={13} /> Add Organization Holiday
        </h2>
        
        <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 mb-2 block">Holiday Description</label>
            <input 
              type="text" 
              placeholder="e.g. Christmas Day" 
              value={newDesc} 
              onChange={e => setNewDesc(e.target.value)}
              className="glass-input w-full px-5 py-3 rounded-2xl text-sm font-medium"
              required
            />
          </div>
          <div className="w-full md:w-56">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 mb-2 block">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
              <input 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)}
                className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isCreating}
            className="btn-primary px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 flex-shrink-0"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={16} />}
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
        <div className="px-7 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] flex justify-between items-center">
          <h2 className="text-[11px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em] flex items-center gap-2">
            <Palmtree size={13} className="text-blue-500" /> Organization Calendar
          </h2>
          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">
            {holidays.length} Registered
          </span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500/20 animate-spin" /></div>
          ) : holidays.length === 0 ? (
            <div className="p-16 text-center">
              <Palmtree size={32} className="text-[var(--text-faint)] mx-auto mb-4" />
              <p className="text-xs text-[var(--text-faint)] font-bold uppercase tracking-widest">No holidays registered</p>
            </div>
          ) : (
            holidays.map(h => (
              <div key={h.id} className="flex items-center justify-between px-7 py-5 hover:bg-[var(--bg-surface-hover)] transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase leading-none">{format(new Date(h.date), 'MMM')}</span>
                    <span className="text-lg font-black text-[var(--text-primary)] leading-none mt-1">{format(new Date(h.date), 'd')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">{h.description}</p>
                    <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest mt-0.5">{format(new Date(h.date), 'EEEE, MMMM do, yyyy')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(h.id)}
                  className="p-3 rounded-2xl text-[var(--text-faint)] hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayManagement;
