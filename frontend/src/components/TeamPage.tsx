import React from 'react';
import { Users, Mail, Shield } from 'lucide-react';

const TEAM = [
  { id: '1', name: 'John Doe', email: 'admin@example.com', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=john', hours: 142 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'USER', avatar: 'https://i.pravatar.cc/150?u=jane', hours: 98 },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'USER', avatar: 'https://i.pravatar.cc/150?u=bob', hours: 76 },
  { id: '4', name: 'Alice Chen', email: 'alice@example.com', role: 'MANAGER', avatar: 'https://i.pravatar.cc/150?u=alice', hours: 115 },
];

const roleBadge: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  MANAGER: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  USER: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
};

const TeamPage: React.FC = () => (
  <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Team</h1>
        <p className="text-xs text-white/30 mt-1">{TEAM.length} members · Stitch & Co</p>
      </div>
    </div>

    <div className="glass-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Member</th>
            <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider"><Mail size={11} className="inline mr-1" />Email</th>
            <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider"><Shield size={11} className="inline mr-1" />Role</th>
            <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Hours</th>
          </tr>
        </thead>
        <tbody>
          {TEAM.map(m => (
            <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  <span className="text-sm font-medium text-white/80">{m.name}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-xs text-white/40">{m.email}</td>
              <td className="px-5 py-4 text-center">
                <span className="badge text-[9px]" style={{ background: roleBadge[m.role]?.bg, color: roleBadge[m.role]?.color, border: `1px solid ${roleBadge[m.role]?.color}25` }}>
                  {m.role}</span>
              </td>
              <td className="px-5 py-4 text-sm text-white/60 font-semibold tabular-nums text-right">{m.hours}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TeamPage;
