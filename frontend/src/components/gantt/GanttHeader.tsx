import React from 'react';
import { format, addDays } from 'date-fns';

interface GanttHeaderProps {
  timelineStart: Date;
  totalDays: number;
  dayWidth: number;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({ timelineStart, totalDays, dayWidth }) => {
  return (
    <div className="flex border-b border-white/10 bg-white/5 sticky top-0 z-10">
      <div className="w-[300px] px-6 py-4 border-r border-white/10 text-xs font-bold text-blue-200 uppercase tracking-widest bg-white/5">
        Task Hierarchy
      </div>
      <div className="flex-1 relative h-14">
        {Array.from({ length: totalDays }).map((_, i) => {
          const date = addDays(timelineStart, i);
          const isFirstOfMonth = date.getDate() === 1;
          const isMonday = date.getDay() === 1;
          
          return (
            <div 
              key={i} 
              className="absolute border-l border-white/5 h-full flex flex-col justify-end pb-1 text-[10px] text-white/30"
              style={{ left: i * dayWidth, width: dayWidth }}
            >
              {(isFirstOfMonth || isMonday) && (
                <span className="absolute top-2 left-1 text-blue-300/60 font-medium whitespace-nowrap">
                  {isFirstOfMonth ? format(date, 'MMM d') : format(date, 'd')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttHeader;
