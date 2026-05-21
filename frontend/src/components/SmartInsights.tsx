import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Zap, Layers, Clock } from 'lucide-react';
import { suggestNextTask } from '../api';
import type { NextTaskSuggestion } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { TimeEntry } from '../types';

interface SmartInsightsProps {
  onSelectTask?: (task: Partial<TimeEntry>) => void;
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ onSelectTask }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [suggestion, setSuggestion] = useState<NextTaskSuggestion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetchSuggestion = async () => {
    setLoading(true);
    try {
      const data = await suggestNextTask();
      setSuggestion(data);
      addToast({
        type: 'success',
        title: 'Insights Updated',
        message: 'Calculated next optimal task for your schedule.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to fetch suggestions',
        message: err.message || 'Could not connect to suggestion server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion || !onSelectTask) return;
    
    const partialEntry: Partial<TimeEntry> = {
      taskDescription: suggestion.taskDescription,
      hours: suggestion.hoursLeft || 8,
      plannedTaskId: suggestion.plannedTaskId,
      project: suggestion.projectId ? { id: suggestion.projectId, name: suggestion.projectName, color: '' } : null,
      phase: suggestion.phaseId ? { id: suggestion.phaseId, name: suggestion.phaseName } : null,
      date: new Date().toLocaleDateString('en-CA'),
      userId: user?.id || ''
    };
    
    onSelectTask(partialEntry);
    addToast({
      type: 'info',
      title: 'Form Pre-filled',
      message: `Loaded "${suggestion.title}" into log form.`
    });
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={13} className="text-amber-500 animate-pulse" />
          Smart Insights
        </h2>
        {suggestion && !loading && (
          <button 
            onClick={handleFetchSuggestion}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-all"
            title="Recalculate Suggestion"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center py-6">
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <Sparkles className="text-amber-500 animate-pulse" size={20} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Analyzing Focus...</p>
        </div>
      ) : suggestion ? (
        <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-500">
          <div className="space-y-3.5">
            {/* Tag Badge */}
            <div className="flex">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 ${
                suggestion.type === 'PLAN' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : suggestion.type.includes('FALLBACK')
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
              }`}>
                <Zap size={8} />
                {suggestion.type === 'PLAN' ? 'AI Planned Task' : 'Schedule Nudge'}
              </span>
            </div>

            {/* Task Title & Details */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2">
                {suggestion.title}
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed font-medium">
                {suggestion.description}
              </p>
            </div>

            {/* Project / Phase Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestion.projectName !== 'N/A' && (
                <span className="text-[9px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] px-2 py-1 rounded-lg flex items-center gap-1.5">
                  <Layers size={10} className="text-blue-500" />
                  {suggestion.projectName}
                </span>
              )}
              {suggestion.phaseName !== 'N/A' && (
                <span className="text-[9px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] px-2 py-1 rounded-lg flex items-center gap-1.5">
                  <Clock size={10} className="text-purple-500" />
                  {suggestion.phaseName}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 flex gap-2">
            <button 
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-black text-white text-[11px] font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md"
            >
              Fill Log Form <ArrowRight size={11} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-center px-2 py-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
            <Sparkles className="text-amber-500" size={20} />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">Automated Planning</h3>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mb-4 max-w-[200px]">
            Get immediate time-tracking suggestions based on your scheduled focus areas.
          </p>
          <button 
            onClick={handleFetchSuggestion}
            className="flex items-center gap-2 px-5 py-2 bg-black text-white text-[10px] font-bold rounded-xl hover:bg-zinc-800 transition-all uppercase tracking-wider"
          >
            Suggest Next Task <ArrowRight size={11} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
