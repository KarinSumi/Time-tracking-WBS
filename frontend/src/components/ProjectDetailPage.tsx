import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BarChart2, Users, Calendar, Target, 
  TrendingUp, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProject, getProjectStats } from '../api';

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectStats {
  totalPlanned: number;
  totalActual: number;
  progress: number;
  phaseStats: {
    id: string;
    name: string;
    planned: number;
    actual: number;
  }[];
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [pData, sData] = await Promise.all([
        getProject(id),
        getProjectStats(id)
      ]);
      setProject(pData);
      setStats(sData);
    } catch {
      addToast({ type: 'error', title: 'Connection error' });
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!project || !stats) return null;

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="px-8 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
            </div>
            <p className="text-[10px] text-white/20 uppercase tracking-widest font-black mt-1">Project Command Center • ID: {project.id.slice(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex flex-col items-end">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Health Status</span>
            <span className={`text-xs font-black uppercase flex items-center gap-1.5 ${stats.progress > 90 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.progress > 90 ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
              {stats.progress > 90 ? 'High Burn' : 'On Track'}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><Target size={20} /></div>
            <TrendingUp size={16} className="text-blue-400/40" />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Planned</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.totalPlanned}h</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><Activity size={20} /></div>
            <CheckCircle2 size={16} className="text-purple-400/40" />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Actual Logged</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.totalActual}h</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><BarChart2 size={20} /></div>
            <CheckCircle2 size={16} className="text-emerald-400/40" />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Burn Efficiency</p>
          <h3 className="text-2xl font-bold text-white mt-1">{Math.round(stats.progress)}%</h3>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Users size={20} /></div>
            <Calendar size={16} className="text-amber-400/40" />
          </div>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Remaining Budget</p>
          <h3 className="text-2xl font-bold text-white mt-1">{Math.max(0, stats.totalPlanned - stats.totalActual)}h</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phase Breakdown */}
        <div className="glass-card p-8">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            Phase Distribution (Actual vs Planned)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.phaseStats} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'white', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Bar dataKey="planned" name="Planned" fill="rgba(255,255,255,0.05)" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hour Allocation Pie */}
        <div className="glass-card p-8">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-8 flex items-center gap-2">
            <Target size={14} className="text-purple-400" />
            Workload Composition
          </h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.phaseStats.filter(p => p.actual > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="actual"
                >
                  {stats.phaseStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
