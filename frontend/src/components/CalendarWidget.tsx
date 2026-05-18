import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { TimeEntry } from '../types';

interface CalendarWidgetProps {
  entries: TimeEntry[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ entries, selectedDate, onSelectDate }) => {
  const days = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDays = lastDayOfMonth.getDate();
    
    const calendarDays = [];
    
    // Pad previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dateStr = d.toLocaleDateString('en-CA');
      
      const dayHours = entries
        .filter(e => new Date(e.date).toLocaleDateString('en-CA') === dateStr)
        .reduce((sum, e) => sum + Number(e.hours), 0);
        
      calendarDays.push({ dateStr, day: i, hours: dayHours });
    }
    return calendarDays;
  }, [entries]);

  const getColorClass = (hours: number, isSelected: boolean) => {
    if (isSelected) return 'bg-black text-white border-black shadow-lg z-10 scale-105';
    if (hours === 0) return 'text-[var(--text-faint)] hover:bg-[var(--bg-surface-hover)] border-transparent';
    return 'bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--text-faint)]';
  };

  const monthName = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon size={13} className="text-[var(--text-faint)]" />
          Calendar
        </h2>
        <span className="text-[10px] text-[var(--text-muted)] font-medium">{monthName}</span>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[9px] font-semibold text-[var(--text-faint)] text-center uppercase">{d}</div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1 content-start">
          {days.map((dayObj, i) => {
            if (!dayObj) return <div key={`empty-${i}`} className="aspect-square" />;
            
            const isSelected = dayObj.dateStr === selectedDate;
            
            return (
              <button
                key={dayObj.dateStr}
                onClick={() => onSelectDate(dayObj.dateStr)}
                className={`
                  relative aspect-square flex items-center justify-center rounded-xl border text-[11px] font-bold transition-all duration-200
                  ${getColorClass(dayObj.hours, isSelected)}
                `}
                title={`${dayObj.hours} hours logged`}
              >
                {dayObj.day}
                {dayObj.hours > 0 && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-[8px] font-black text-[var(--text-faint)] uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-surface-hover)]" /> No activity</div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Logged</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
