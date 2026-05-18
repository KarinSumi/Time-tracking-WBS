import React, { useMemo, useState } from 'react';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import GanttHeader from './gantt/GanttHeader';
import GanttTaskRow from './gantt/GanttTaskRow';

interface Task {
  id: string;
  wbsId?: string | null;
  taskDescription: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  parentId?: string | null;
}

interface GanttChartProps {
  tasks: Task[];
  onUpdateDates?: (id: string, startDate: string, endDate: string) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, onUpdateDates }) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const tasksWithChildren = useMemo(() => {
    const parentIds = new Set(tasks.map(t => t.parentId).filter(Boolean));
    return tasks.map(t => ({
      ...t,
      hasChildren: parentIds.has(t.id)
    }));
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    return [...tasksWithChildren].sort((a, b) => {
      if (a.wbsId && b.wbsId) return a.wbsId.localeCompare(b.wbsId, undefined, { numeric: true });
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }, [tasksWithChildren]);

  // Determine which tasks are visible based on collapse state
  const visibleTasks = useMemo(() => {
    return sortedTasks.filter(task => {
      // Check if any ancestor is collapsed
      let currentParentId = task.parentId;
      while (currentParentId) {
        if (collapsedIds.has(currentParentId)) return false;
        const parent = sortedTasks.find(t => t.id === currentParentId);
        currentParentId = parent?.parentId || null;
      }
      return true;
    });
  }, [sortedTasks, collapsedIds]);

  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (tasks.length === 0) {
      const today = startOfDay(new Date());
      return { timelineStart: today, timelineEnd: addDays(today, 30), totalDays: 30 };
    }

    const starts = tasks.map(t => new Date(t.startDate).getTime());
    const ends = tasks.map(t => new Date(t.endDate).getTime());
    
    const minStart = startOfDay(new Date(Math.min(...starts)));
    const maxEnd = startOfDay(new Date(Math.max(...ends)));
    
    // Add some padding
    const start = addDays(minStart, -2);
    const end = addDays(maxEnd, 5);
    const days = Math.max(differenceInDays(end, start) + 1, 30); // At least 30 days
    
    return { timelineStart: start, timelineEnd: end, totalDays: days };
  }, [tasks]);

  const dayWidth = 40;

  const toggleExpand = (taskId: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  return (
    <div className="glass-morphism rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
      <div className="overflow-x-auto">
        <div style={{ width: `calc(300px + ${totalDays * dayWidth}px)` }} className="flex flex-col">
          <GanttHeader timelineStart={timelineStart} totalDays={totalDays} dayWidth={dayWidth} />

          {/* Body */}
          <div className="relative bg-white/[0.01]">
            {/* Vertical Grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="w-[300px] border-r border-white/10 bg-black/20" />
              {Array.from({ length: totalDays }).map((_, i) => (
                <div key={i} className="border-l border-white/[0.03] h-full" style={{ width: dayWidth }} />
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {visibleTasks.map((task) => (
                <GanttTaskRow 
                  key={task.id} 
                  task={task} 
                  timelineStart={timelineStart} 
                  dayWidth={dayWidth} 
                  isExpanded={!collapsedIds.has(task.id)}
                  onToggleExpand={toggleExpand}
                  onUpdateDates={onUpdateDates}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white/5 border-t border-white/10 px-8 py-4 flex justify-between items-center">
        <div className="flex gap-8 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Active Deliverables
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            Support Tasks
          </div>
        </div>
        <div className="text-[10px] text-blue-200/40 font-bold uppercase tracking-widest">
          Project Window: {format(timelineStart, 'MMM d, yyyy')} — {format(timelineEnd, 'MMM d, yyyy')}
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
