import React from 'react';
import { Download, Upload, Plus, LayoutGrid, BarChart2 } from 'lucide-react';

interface PlanHeaderProps {
  canManage: boolean;
  view: 'grid' | 'gantt';
  setView: (view: 'grid' | 'gantt') => void;
  onDownloadTemplate: () => void;
  onImportClick: () => void;
  onNewPlanClick: () => void;
  isUploading: boolean;
}

const PlanHeader: React.FC<PlanHeaderProps> = ({ 
  canManage, view, setView, onDownloadTemplate, onImportClick, onNewPlanClick, isUploading 
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Plan vs Actual</h1>
        <p className="text-xs text-blue-200/40 mt-1 uppercase tracking-widest font-semibold">Project Management & Resource Allocation</p>
      </div>
      
      <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
        <button 
          onClick={() => setView('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/70'}`}
        >
          <LayoutGrid size={14} /> Grid
        </button>
        <button 
          onClick={() => setView('gantt')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'gantt' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/70'}`}
        >
          <BarChart2 size={14} /> Gantt
        </button>
      </div>

      {canManage && view === 'grid' && (
        <div className="flex gap-3">
          <button onClick={onDownloadTemplate} className="btn-secondary flex items-center gap-2">
            <Download size={14} /> <span className="hidden sm:inline">Template</span>
          </button>
          <button onClick={onImportClick} disabled={isUploading} className="btn-secondary flex items-center gap-2">
            <Upload size={14} /> <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Import Excel'}</span>
          </button>
          <button onClick={onNewPlanClick} className="btn-primary flex items-center gap-2">
            <Plus size={14} /> New Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanHeader;
