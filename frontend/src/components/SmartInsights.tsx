import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const SmartInsights: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={13} className="text-amber-500" />
          Smart Insights
        </h2>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <Sparkles className="text-amber-500" size={24} />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Automated Planning</h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
          Our AI can suggest your next tasks based on your current focus and team priorities.
        </p>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-[11px] font-bold rounded-xl hover:bg-zinc-800 transition-all">
          Suggest Next Task <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default SmartInsights;
