import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Building2, Save, Moon, Bell as BellIcon, Globe, Camera, Loader2, Clock } from 'lucide-react';
import HolidayManagement from './HolidayManagement';
import TeamManagement from './TeamManagement';
import AuditLogViewer from './AuditLogViewer';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

import { updateSettings, uploadLogo, uploadAvatar } from '../api';

const SettingsPage: React.FC = () => {
  const { user, updateUser, theme, toggleTheme } = useAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orgName, setOrgName] = useState(user?.orgName || '');
  const [dailyTarget, setDailyTarget] = useState('8');
  const [notifications, setNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'team' | 'holidays' | 'compliance'>('profile');
  const [brandColor, setBrandColor] = useState(user?.brandColor || '#3b82f6');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if ((orgName !== user?.orgName || brandColor !== user?.brandColor) && isAdmin) {
        await updateSettings({ name: orgName, brandColor });
      }
      // Mock profile update logic for now (could add updateProfile API later)
      await new Promise(r => setTimeout(r, 500));
      updateUser({ ...user!, name, email, orgName, brandColor, logoUrl });
      addToast({ type: 'success', title: 'Settings saved', message: 'Your profile and organization have been updated' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to save settings', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { avatarUrl } = await uploadAvatar(formData);
      updateUser({ ...user!, avatarUrl });
      addToast({ type: 'success', title: 'Avatar updated' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const { logoUrl: newLogoUrl } = await uploadLogo(formData);
      setLogoUrl(newLogoUrl);
      updateUser({ ...user!, logoUrl: newLogoUrl });
      addToast({ type: 'success', title: 'Organization logo updated' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload failed', message: err.message });
    } finally {
      setIsLogoUploading(false);
    }
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{t('set.title')}</h1>
          <p className="text-[10px] text-[var(--text-faint)] mt-1 uppercase tracking-[0.2em] font-black">{t('set.subtitle')}</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 bg-[var(--bg-surface-hover)] p-1.5 rounded-2xl border border-[var(--border-subtle)]">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${activeTab === 'profile' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
            >
              {t('set.tab.profile')}
            </button>
            <button 
              onClick={() => setActiveTab('organization')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${activeTab === 'organization' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
            >
              {t('set.tab.org')}
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${activeTab === 'team' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
            >
              {t('set.tab.team')}
            </button>
            <button 
              onClick={() => setActiveTab('holidays')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${activeTab === 'holidays' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
            >
              {t('set.tab.holidays')}
            </button>
            <button 
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${activeTab === 'compliance' ? 'bg-black text-white shadow-xl' : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'}`}
            >
              {t('set.tab.audit')}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl space-y-6">
        {activeTab === 'profile' ? (
          <>
            {/* Profile */}
            <div className="glass-card p-7">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-[var(--text-faint)]" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                    title={t('set.profile.avatar')}
                  >
                    <Camera size={14} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{user?.name}</h2>
                  <p className="text-[10px] text-[var(--text-faint)] font-black uppercase tracking-widest">{user?.role} • {user?.orgName}</p>
                </div>
              </div>

              <h2 className="text-[11px] font-black text-[var(--text-faint)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <User size={13} /> {t('set.tab.profile')}
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 mb-2 block">{t('set.profile.fullname')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 mb-2 block">{t('set.profile.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 mb-2 block">{t('set.profile.org')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                      className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-card p-7">
              <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Globe size={13} className="text-white/25" />{t('set.pref.title')}</h2>
              <div className="space-y-5">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {theme === 'dark' ? <Moon size={18} /> : <Globe size={18} />}
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] font-bold">{t('set.pref.dark')}</p>
                      <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest">{t('set.pref.dark_desc')}</p>
                    </div>
                  </div>
                  <button onClick={toggleTheme}
                    className={`w-10 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-blue-600' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${theme === 'dark' ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                
                {/* Interface Language Preference Switcher */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)]">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] font-bold">{t('set.pref.lang')}</p>
                      <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest">{t('set.pref.lang_desc')}</p>
                    </div>
                  </div>
                  <div className="w-44">
                    <LanguageSelector />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)]">
                      <BellIcon size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] font-bold">{t('set.pref.notif')}</p>
                      <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest">{t('set.pref.notif_desc')}</p>
                    </div>
                  </div>
                  <button onClick={() => setNotifications(!notifications)}
                    className={`w-10 h-6 rounded-full transition-all relative ${notifications ? 'bg-green-500' : 'bg-[var(--bg-surface-hover)]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] text-[var(--text-faint)]">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-primary)] font-bold">{t('set.pref.target')}</p>
                      <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-widest">{t('set.pref.target_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" min="1" max="24" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)}
                      className="glass-input w-16 px-4 py-2 rounded-xl text-sm text-center font-bold" />
                    <span className="text-[10px] text-[var(--text-faint)] font-bold uppercase">Hrs</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving}
              className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2">
              <Save size={16} />{isSaving ? t('set.saving') : t('set.save')}
            </button>
          </>
        ) : activeTab === 'organization' ? (
          <div className="space-y-6">
            <div className="glass-card p-7">
              <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Building2 size={13} className="text-white/25" />{t('set.org.branding')}</h2>
              
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="space-y-4">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block">{t('set.org.color')}</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={brandColor} 
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={brandColor} 
                        onChange={e => setBrandColor(e.target.value)}
                        className="glass-input w-32 px-3 py-2 rounded-xl text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/20 leading-relaxed max-w-[200px]">
                    {t('set.org.color_desc')}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block">{t('set.org.logo')}</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      {isLogoUploading ? (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                      ) : logoUrl ? (
                        <img src={logoUrl} alt="Org Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Building2 size={32} className="text-white/10" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:bg-white/10 transition-all flex items-center gap-2"
                      >
                        <Camera size={14} /> {t('set.org.logo_upload')}
                      </button>
                      <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold">{t('set.org.logo_desc')}</p>
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-7">
               <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Globe size={13} className="text-white/25" />{t('set.pref.title')}</h2>
              <div className="space-y-4">
                 <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">{t('set.org.name')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                      className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving}
              className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2">
              <Save size={16} />{isSaving ? t('set.saving') : t('set.save')}
            </button>
          </div>
        ) : activeTab === 'team' ? (
          <TeamManagement />
        ) : activeTab === 'holidays' ? (
          <HolidayManagement />
        ) : (
          <AuditLogViewer />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
