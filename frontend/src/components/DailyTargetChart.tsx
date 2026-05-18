import React, { useEffect, useState } from 'react';

interface DailyTargetChartProps {
  hoursLogged: number;
  targetHours: number;
  selectedDate?: string;
}

const DailyTargetChart: React.FC<DailyTargetChartProps> = ({ hoursLogged, targetHours }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = Math.min(Math.round((hoursLogged / targetHours) * 100), 100);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  const colors = { start: 'var(--accent-primary)', end: 'var(--accent-primary)' };

  return (
    <div className="flex flex-col items-center justify-between h-full py-4">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Ring */}
        <div className="relative flex items-center justify-center w-40 h-40">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <defs>
              <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>

            {/* Background ring */}
            <circle
              stroke="var(--border-subtle)"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />

            {/* Progress ring */}
            <circle
              stroke="var(--text-primary)"
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
            />
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center justify-center text-center pt-2">
            <span className="text-4xl font-black text-[var(--text-primary)] tracking-tight tabular-nums">
              {animatedPercentage}%
            </span>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest -mt-1">Complete</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">Daily Target</h3>
          <p className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
            <span className="text-[var(--text-secondary)] font-bold">{hoursLogged.toFixed(1)}</span> of {targetHours} hours logged
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyTargetChart;
