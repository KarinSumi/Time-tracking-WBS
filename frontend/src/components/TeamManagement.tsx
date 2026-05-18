import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { getTeam, updateMemberRole } from '../api';
import type { User as TeamMember } from '../types';

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTeam();
      setMembers(data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load team' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingId(memberId);
    try {
      await updateMemberRole(memberId, newRole);
      addToast({ type: 'success', title: 'Role updated' });
      fetchMembers();
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to update role' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
      <div className="px-7 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] flex justify-between items-center">
        <h2 className="text-[11px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em] flex items-center gap-2">
          <Users size={13} className="text-blue-500" /> Team Roster & Permissions
        </h2>
        <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">
          {members.length} Members
        </span>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-blue-500/20 animate-spin" /></div>
        ) : (
          members.map(member => (
            <div key={member.id} className="flex items-center justify-between px-7 py-5 hover:bg-[var(--bg-surface-hover)] transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-11 h-11 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-[var(--text-faint)]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{member.name}</p>
                    {member.id === currentUser?.id && (
                      <span className="text-[8px] bg-black text-white px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Self</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest mt-0.5">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select 
                    value={member.role}
                    disabled={updatingId === member.id || member.id === currentUser?.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="appearance-none glass-input pl-9 pr-10 py-2 rounded-xl text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest focus:ring-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <Shield size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  {updatingId === member.id && (
                    <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
