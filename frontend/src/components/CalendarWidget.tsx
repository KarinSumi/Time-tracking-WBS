import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { TimeEntry } from './Dashboard';

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

  const getColorClass = (hours: number) => {
    if (hours === 0) return 'bg-white/[0.03] text-white/30 border-white/[0.05] hover:bg-white/[0.08]'; // Grey
    if (hours < 6) return 'bg-blue-500/20 text-blue-200 border-blue-500/30 hover:bg-blue-500/30'; // Blue
    if (hours <= 9) return 'bg-green-500/20 text-green-200 border-green-500/30 hover:bg-green-500/30'; // Green
    return 'bg-red-500/20 text-red-200 border-red-500/30 hover:bg-red-500/30'; // Red
  };

  const monthName = new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2">
          <CalendarIcon size={13} className="text-white/25" />
          Calendar
        </h2>
        <span className="text-[10px] text-white/30 font-medium">{monthName}</span>
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-[9px] font-semibold text-white/20 text-center uppercase">{d}</div>
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
                  relative aspect-square flex items-center justify-center rounded-lg border text-sm font-medium transition-all
                  ${getColorClass(dayObj.hours)}
                  ${isSelected ? 'ring-2 ring-white shadow-[0_0_12px_rgba(255,255,255,0.2)] z-10' : ''}
                `}
                title={`${dayObj.hours} hours logged`}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between gap-2 text-[9px] text-white/30 uppercase tracking-widest">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-white/10" /> 0h</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" /> &lt;6h</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500/40" /> 6-9h</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500/40" /> &gt;9h</div>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;
