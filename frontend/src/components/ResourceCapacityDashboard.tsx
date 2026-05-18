import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Calendar, AlertCircle, CheckCircle2, Zap, LayoutList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

import { getCapacity } from '../api';
import type { CapacityData } from '../types';

const ResourceCapacityDashboard: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  
  const [data, setData] = useState<CapacityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Default range: current week
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 7); // Sunday
    return d.toISOString().split('T')[0];
  });

  const fetchCapacity = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCapacity(startDate, endDate);
      setData(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to fetch capacity data', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, startDate, endDate, addToast]);

  useEffect(() => {
    fetchCapacity();
  }, [fetchCapacity]);

  const getBarColor = (percent: number) => {
    if (percent > 100) return '#ef4444'; // Red (Over)
    if (percent >= 80) return '#f59e0b'; // Orange (Optimal/High)
    return '#10b981'; // Green (Safe)
  };

  const selectedUser = data.find(u => u.userId === selectedUserId);

  const handleExportExcel = () => {
    try {
      const exportData = data.map(u => ({
        'Resource Name': u.userName,
        'Max Capacity (h)': u.maxCapacityHours,
        'Planned Load (h)': u.totalPlannedHours,
        'Actual Logged (h)': u.totalActualHours,
        'Planned Utilization (%)': u.plannedUtilization,
        'Actual Utilization (%)': u.actualUtilization,
        'Status': u.plannedUtilization > 100 ? 'Critical' : u.plannedUtilization >= 80 ? 'Optimal' : 'Safe'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Utilization Report');
      
      const fileName = `Utilization_Report_${startDate}_to_${endDate}.xlsx`;
      XLSX.writeFile(wb, fileName);
      addToast({ type: 'success', title: 'Export Complete', message: `Downloaded ${fileName}` });
    } catch (error) {
      addToast({ type: 'error', title: 'Export Failed', message: 'Could not generate Excel file' });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CapacityData;
      return (
        <div className="glass-morphism p-4 border border-white/10 rounded-xl shadow-2xl">
          <p className="text-white font-bold mb-1">{label}</p>
          <div className="space-y-1 text-xs">
            <p className="text-blue-200/60">Max Capacity: <span className="text-white">{item.maxCapacityHours}h</span></p>
            <p className="text-blue-200/60">Planned: <span className="text-white">{item.totalPlannedHours}h ({item.plannedUtilization}%)</span></p>
            <p className="text-blue-200/60">Actual: <span className="text-white">{item.totalActualHours}h ({item.actualUtilization}%)</span></p>
            <p className="font-bold mt-2" style={{ color: getBarColor(item.plannedUtilization) }}>
              Planned Load: {item.plannedUtilization}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="text-yellow-400" size={20} />
            Resource Utilization
          </h2>
          <p className="text-xs text-blue-200/40 mt-1">Precision workday interpolation & drill-down</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none cursor-pointer" 
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none cursor-pointer" 
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
          <button 
            onClick={handleExportExcel}
            className="ml-2 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
            title="Export to Excel"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-morphism rounded-3xl border border-white/10 p-6 shadow-2xl relative overflow-hidden bg-white/5">
        <div className="h-[350px] w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} onClick={(state: any) => {
                if (state && state.activePayload) {
                  setSelectedUserId(state.activePayload[0].payload.userId);
                }
              }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="userName" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Bar 
                  dataKey="maxCapacityHours" 
                  name="Capacity" 
                  fill="rgba(255,255,255,0.05)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
                <Bar 
                  dataKey="totalPlannedHours" 
                  name="Planned Load" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                  className="cursor-pointer"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.plannedUtilization)} 
                      stroke={selectedUserId === entry.userId ? '#fff' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="totalActualHours" 
                  name="Actual Logged" 
                  fill="rgba(255,255,255,0.4)"
                  radius={[4, 4, 0, 0]} 
                  barSize={12}
                  dx={-14}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Safe Load</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Optimal (80%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Overloaded (100%+)</span>
          </div>
        </div>
      </div>

      {/* Drill-Down Section */}
      {selectedUser && (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <LayoutList size={16} className="text-blue-400" />
              Workload Drill-down: {selectedUser.userName}
            </h3>
            <button onClick={() => setSelectedUserId(null)} className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest font-bold">Close Breakdown</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedUser.tasks.map(task => (
              <div key={task.id} className="glass-card p-5 border-l-4 border-blue-500/40 hover:border-blue-500 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[9px] font-bold text-blue-400/60 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded">{task.wbsId || 'T-AD'}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white tabular-nums">{task.apportionedPlanned}h</span>
                    <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Planned for this window</p>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-white/90 line-clamp-2 mb-4 group-hover:text-blue-200 transition-colors">{task.description}</h4>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Full Duration</span>
                    <span className="text-[10px] text-white/50">{new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">Total Task</span>
                    <span className="text-[10px] text-white/50">{task.totalPlanned}h</span>
                  </div>
                </div>
              </div>
            ))}
            {selectedUser.tasks.length === 0 && (
              <div className="col-span-full h-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl text-white/20">
                <AlertCircle size={24} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No planned tasks in this window</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="glass-morphism rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-white/[0.02]">
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutList size={16} className="text-blue-200/50" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Organization Overview</h3>
          </div>
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest tabular-nums">Showing {data.length} Resources</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Planned</th>
                <th className="px-6 py-4">Actual Logged</th>
                <th className="px-6 py-4 text-center">Utilization</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map(row => (
                <tr key={row.userId} className={`hover:bg-white/5 transition-colors group cursor-pointer ${selectedUserId === row.userId ? 'bg-blue-500/5' : ''}`} onClick={() => setSelectedUserId(row.userId)}>
                  <td className="px-6 py-4 text-sm font-medium text-white">{row.userName}</td>
                  <td className="px-6 py-4 text-sm text-blue-200/70">{row.totalPlannedHours}h</td>
                  <td className="px-6 py-4 text-sm text-white/40">{row.totalActualHours}h</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: getBarColor(row.plannedUtilization) }}>
                        {row.plannedUtilization}%
                      </span>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(100, row.plannedUtilization)}%`,
                            backgroundColor: getBarColor(row.plannedUtilization)
                          }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.plannedUtilization > 100 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-tighter bg-red-400/10 px-2 py-0.5 rounded">
                        <AlertCircle size={10} /> Critical
                      </span>
                    ) : row.plannedUtilization >= 80 ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-tighter bg-yellow-500/10 px-2 py-0.5 rounded">
                        <TrendingUp size={10} /> Optimal
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 uppercase tracking-tighter bg-green-400/10 px-2 py-0.5 rounded">
                        <CheckCircle2 size={10} /> Safe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default ResourceCapacityDashboard;
