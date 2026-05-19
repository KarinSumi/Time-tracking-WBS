import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Shield, User as UserIcon, Loader2, Upload, Download, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { getTeam, updateMemberRole, updateMemberManager } from '../api/team';
import { bulkRegisterUsers } from '../api/auth';
import type { User as TeamMember } from '../types';

const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setUpdatingId(memberId + '-role');
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

  const handleManagerChange = async (memberId: string, managerId: string) => {
    setUpdatingId(memberId + '-manager');
    try {
      await updateMemberManager(memberId, managerId || null);
      addToast({ type: 'success', title: 'Manager updated' });
      fetchMembers();
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to update manager' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await bulkRegisterUsers(formData);
      addToast({ type: 'success', title: `Imported ${data.created} users`, message: data.skipped > 0 ? `${data.skipped} skipped.` : '' });
      if (data.errors?.length > 0) addToast({ type: 'error', title: `${data.errors.length} rows failed` });
      fetchMembers();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const potentialManagers = members.filter(m => m.role === 'ADMIN' || m.role === 'SUPER_ADMIN' || m.role === 'MANAGER');

  return (
    <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
      <div className="px-7 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[11px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em] flex items-center gap-2">
            <Users size={13} className="text-blue-500" /> Team Roster & Permissions
          </h2>
          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black uppercase tracking-wider">
            {members.length} Members
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/templates/bulk_users_template.xlsx" download className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all uppercase tracking-wider">
            <Download size={12} /> Template
          </a>
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all uppercase tracking-wider disabled:opacity-50">
            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Import Users
          </button>
          <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
        </div>
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
                <div className="relative" title="Manager">
                  <select 
                    value={member.managerId || ''}
                    disabled={updatingId === member.id + '-manager' || member.id === currentUser?.id}
                    onChange={(e) => handleManagerChange(member.id, e.target.value)}
                    className="appearance-none glass-input pl-9 pr-10 py-2 rounded-xl text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest focus:ring-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-40 truncate"
                  >
                    <option value="">NO MANAGER</option>
                    {potentialManagers.filter(m => m.id !== member.id).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <Briefcase size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                  {updatingId === member.id + '-manager' && (
                    <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-purple-500" />
                  )}
                </div>

                <div className="relative" title="Role">
                  <select 
                    value={member.role}
                    disabled={updatingId === member.id + '-role' || member.id === currentUser?.id}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    className="appearance-none glass-input pl-9 pr-10 py-2 rounded-xl text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest focus:ring-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-32"
                  >
                    <option value="USER">USER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                  <Shield size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  {updatingId === member.id + '-role' && (
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
