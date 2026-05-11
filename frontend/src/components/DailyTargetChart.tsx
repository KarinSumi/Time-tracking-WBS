import React, { useEffect, useState } from 'react';
import { Target } from 'lucide-react';

interface DailyTargetChartProps {
  hoursLogged: number;
  targetHours: number;
  selectedDate?: string;
}

const DailyTargetChart: React.FC<DailyTargetChartProps> = ({ hoursLogged, targetHours, selectedDate }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = Math.min(Math.round((hoursLogged / targetHours) * 100), 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 62;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Color logic based on percentage
  const getGradientColors = () => {
    if (percentage >= 75) return { start: '#06b6d4', end: '#22c55e' }; // cyan → green
    if (percentage >= 50) return { start: '#f59e0b', end: '#f97316' }; // amber → orange
    return { start: '#ef4444', end: '#f97316' }; // red → orange
  };

  const colors = getGradientColors();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 self-start">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2">
          <Target size={13} className="text-white/25" />
          Daily Target {selectedDate && selectedDate !== new Date().toLocaleDateString('en-CA') ? `- ${new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
        </h2>
      </div>

      {/* Ring */}
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <defs>
            <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            stroke="rgba(255, 255, 255, 0.04)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress ring */}
          <circle
            stroke="url(#ring-gradient)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter="url(#glow)"
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-white tracking-tight tabular-nums">
            {animatedPercentage}%
          </span>
        </div>
      </div>

      {/* Hours Label */}
      <div className="text-center">
        <span className="text-sm font-semibold text-white/60 tabular-nums">
          {hoursLogged.toFixed(1)}h
        </span>
        <span className="text-sm text-white/20 mx-1">/</span>
        <span className="text-sm text-white/30 tabular-nums">
          {targetHours}h
        </span>
      </div>
    </div>
  );
};

export default DailyTargetChart;
