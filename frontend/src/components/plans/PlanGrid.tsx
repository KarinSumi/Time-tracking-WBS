import React from 'react';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

import type { PlannedTask as Plan } from '../../types';

interface PlanGridProps {
  plans: Plan[];
  canManage: boolean;
  onDelete: (id: string) => void;
}

const PlanGrid: React.FC<PlanGridProps> = ({ plans, canManage, onDelete }) => {
  return (
    <div className="glass-card overflow-hidden animate-in fade-in duration-700">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Assignee</th>
            <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Task</th>
            <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Project</th>
            <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Plan vs Actual</th>
            <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
            {canManage && <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => {
            const actualHours = plan.actualHours || 0;
            const plannedHours = plan.plannedHours || 1; // Avoid division by zero
            const variance = actualHours - plannedHours;
            const percent = Math.min(100, Math.round((actualHours / plannedHours) * 100));
            const isOver = variance > 0;
            
            return (
              <tr key={plan.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3.5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {plan.assignee?.avatarUrl ? <img src={plan.assignee.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-white/50">{plan.assignee?.name?.[0] || '?'}</span>}
                  </div>
                  <span className="text-xs text-white/70">{plan.assignee?.name || 'Unassigned'}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-white/90">{plan.taskDescription}</td>
                <td className="px-5 py-3.5">
                  {plan.project ? <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${plan.project.color}15`, color: plan.project.color }}>{plan.project.name}</span> : <span className="text-white/20">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-col items-center gap-1.5 w-48 mx-auto">
                    <div className="flex justify-between w-full text-[10px] tabular-nums font-medium">
                      <span className="text-white/40">{plan.plannedHours}h plan</span>
                      <span className={isOver ? 'text-red-400' : 'text-green-400'}>{actualHours}h act {variance !== 0 && `(${variance > 0 ? '+' : ''}${variance}h)`}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center">
                  {plan.status === 'COMPLETED' ? <span className="badge badge-success"><CheckCircle2 size={10} className="mr-1"/> Completed</span> :
                   plan.status === 'IN_PROGRESS' ? <span className="badge badge-info"><Clock size={10} className="mr-1"/> In Progress</span> :
                   <span className="badge badge-draft"><Circle size={10} className="mr-1"/> Pending</span>}
                </td>
                {canManage && (
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => onDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlanGrid;
