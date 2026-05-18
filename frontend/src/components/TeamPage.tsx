import React, { useState, useEffect } from 'react';
import { Users, Mail, Shield, Loader2 } from 'lucide-react';
import { getTeamMembers } from '../api';
import type { User } from '../types';

const roleBadge: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  SUPER_ADMIN: { color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
  MANAGER: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  USER: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' },
};

const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTeamMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Team</h1>
          <p className="text-xs text-white/30 mt-1">{members.length} members</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden min-h-[300px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="w-8 h-8 text-blue-500/20 animate-spin" />
          </div>
        ) : (
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
              {members.map(m => (
                <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {m.avatarUrl ? <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" /> : <Users size={14} className="text-white/20" />}
                      </div>
                      <span className="text-sm font-medium text-white/80">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-white/40">{m.email}</td>
                  <td className="px-5 py-4 text-center">
                    <span className="badge text-[9px]" style={{ background: roleBadge[m.role]?.bg, color: roleBadge[m.role]?.color, border: `1px solid ${roleBadge[m.role]?.color}25` }}>
                      {m.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/60 font-semibold tabular-nums text-right">{m.hoursLogged || 0}h</td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-white/20 text-xs">No team members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
