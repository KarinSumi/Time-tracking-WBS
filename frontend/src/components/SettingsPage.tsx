import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Building2, Save, Moon, Bell as BellIcon, Globe } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [orgName, setOrgName] = useState(user?.orgName || '');
  const [dailyTarget, setDailyTarget] = useState('8');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    updateUser({ name, email, orgName });
    addToast({ type: 'success', title: 'Settings saved', message: 'Your profile has been updated' });
    setIsSaving(false);
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <h1 className="text-xl font-semibold text-white mb-1">Settings</h1>
      <p className="text-xs text-white/30 mb-8">Manage your profile and preferences</p>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="glass-card p-7">
          <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-5 flex items-center gap-2">
            <User size={13} className="text-white/25" />Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider ml-1 mb-1.5 block">Organization</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card p-7">
          <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Globe size={13} className="text-white/25" />Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Moon size={16} className="text-white/30" />
                <div><p className="text-sm text-white/70 font-medium">Dark Mode</p>
                  <p className="text-[10px] text-white/30">Use dark theme across the app</p></div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)}
                className={`w-10 h-6 rounded-full transition-all relative ${darkMode ? 'bg-blue-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${darkMode ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <BellIcon size={16} className="text-white/30" />
                <div><p className="text-sm text-white/70 font-medium">Notifications</p>
                  <p className="text-[10px] text-white/30">Receive reminders and updates</p></div>
              </div>
              <button onClick={() => setNotifications(!notifications)}
                className={`w-10 h-6 rounded-full transition-all relative ${notifications ? 'bg-blue-500' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="text-sm text-white/70 font-medium">Daily Target</p>
                <p className="text-[10px] text-white/30">Hours you aim to work per day</p></div>
              <div className="flex items-center gap-2">
                <input type="number" min="1" max="24" value={dailyTarget} onChange={e => setDailyTarget(e.target.value)}
                  className="glass-input w-16 px-3 py-1.5 rounded-lg text-sm text-center" />
                <span className="text-xs text-white/30">hours</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={isSaving}
          className="btn-primary px-6 py-3 text-sm font-semibold flex items-center gap-2">
          <Save size={16} />{isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
export default SettingsPage;
