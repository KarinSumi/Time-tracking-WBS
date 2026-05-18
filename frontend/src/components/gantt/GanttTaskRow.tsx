import React from 'react';
import { differenceInDays, addDays } from 'date-fns';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Task {
  id: string;
  wbsId?: string | null;
  taskDescription: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  parentId?: string | null;
  hasChildren?: boolean;
}

interface GanttTaskRowProps {
  task: Task;
  timelineStart: Date;
  dayWidth: number;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onUpdateDates?: (id: string, startDate: string, endDate: string) => void;
}

const GanttTaskRow: React.FC<GanttTaskRowProps> = ({ 
  task, timelineStart, dayWidth, isExpanded, onToggleExpand, onUpdateDates 
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [resizeOffset, setResizeOffset] = React.useState(0);

  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  
  const initialLeft = differenceInDays(start, timelineStart) * dayWidth;
  const initialWidth = (differenceInDays(end, start) + 1) * dayWidth;

  const handleMouseDown = (e: React.MouseEvent, type: 'drag' | 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaDays = Math.round(deltaX / dayWidth);
      
      if (type === 'drag') {
        setIsDragging(true);
        setDragOffset(deltaDays * dayWidth);
      } else {
        setIsResizing(type);
        setResizeOffset(deltaDays * dayWidth);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      const deltaX = upEvent.clientX - startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (deltaDays !== 0) {
        let newStart = start;
        let newEnd = end;

        if (type === 'drag') {
          newStart = addDays(start, deltaDays);
          newEnd = addDays(end, deltaDays);
        } else if (type === 'left') {
          newStart = addDays(start, deltaDays);
        } else if (type === 'right') {
          newEnd = addDays(end, deltaDays);
        }

        if (newStart <= newEnd) {
          onUpdateDates?.(task.id, newStart.toISOString(), newEnd.toISOString());
        }
      }

      setIsDragging(false);
      setIsResizing(null);
      setDragOffset(0);
      setResizeOffset(0);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const left = isDragging ? initialLeft + dragOffset : (isResizing === 'left' ? initialLeft + resizeOffset : initialLeft);
  const width = isDragging ? initialWidth : (isResizing === 'left' ? initialWidth - resizeOffset : (isResizing === 'right' ? initialWidth + resizeOffset : initialWidth));
  const depth = (task.wbsId?.split('.').length || 1) - 1;

  return (
    <div className="flex group hover:bg-white/5 transition-all duration-300">
      {/* Task Info Label */}
      <div className="w-[300px] px-6 py-3 border-r border-white/10 flex items-center gap-2 relative z-10 bg-[#0f172a]">
        <div 
          className="flex items-center relative"
          style={{ marginLeft: depth * 16 }}
        >
          {/* Vertical connection line for hierarchy */}
          {depth > 0 && (
            <div className="absolute -left-3 top-[-28px] bottom-1/2 w-px bg-white/10" />
          )}
          {depth > 0 && (
            <div className="absolute -left-3 top-1/2 w-3 h-px bg-white/10" />
          )}

          {task.hasChildren ? (
            <button 
              onClick={() => onToggleExpand?.(task.id)}
              className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-6" /> // spacer
          )}
          
          <div 
            className="flex-shrink-0 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)] mr-2"
            style={{ 
              background: depth === 0 ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.4)'
            }}
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {task.wbsId && <span className="text-[10px] font-bold text-blue-400/70 font-mono tracking-tighter uppercase">{task.wbsId}</span>}
            <p className={`text-sm truncate group-hover:text-blue-200 transition-colors ${depth === 0 ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
              {task.taskDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative h-14 flex items-center">
        <div 
          className={`absolute h-7 rounded-lg overflow-hidden group/bar cursor-move select-none transition-shadow ${isDragging || isResizing ? 'shadow-[0_0_20px_rgba(59,130,246,0.4)] z-20 scale-[1.02]' : 'z-10'}`}
          style={{ 
            left, 
            width: Math.max(width, dayWidth), // Minimum width of 1 day
            background: depth === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.15)',
            border: depth === 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(59, 130, 246, 0.4)',
            transition: isDragging || isResizing ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
        >
          {/* Resize Handles */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-400/30 transition-colors z-30" 
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          />
          <div 
            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-blue-400/30 transition-colors z-30" 
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          />

          {/* Progress bar */}
          <div 
            className={`h-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.4)] ${
              depth === 0 ? 'bg-white/20' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
            }`}
            style={{ width: `${task.progressPercentage}%` }}
          />
          
          {/* Tooltip on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
            <span className="text-[9px] font-bold text-white uppercase tracking-widest drop-shadow-md">
              {task.progressPercentage}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttTaskRow;
