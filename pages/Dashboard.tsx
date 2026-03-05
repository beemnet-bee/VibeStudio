
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, GitBranch, Zap, Server, X, 
  Braces, Cpu, Layers, RefreshCw, Hash, TrendingUp,
  Trash2, AlertTriangle, Globe, Lock, Shield, Info, Code2, Database,
  ChevronDown, Check, Terminal, Activity, HardDrive, Network, 
  Play, Command, Flame, Sparkles, Search, Clock,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '../App';
import { Project, FileNode } from '../types';

interface DashboardProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

const REGIONS = [
  { id: 'us-east', label: 'US-East-1 (North Virginia)', flag: '🇺🇸', latency: '14ms' },
  { id: 'eu-west', label: 'EU-West-2 (London)', flag: '🇬🇧', latency: '28ms' },
  { id: 'asia-south', label: 'Asia-South-1 (Mumbai)', flag: '🇮🇳', latency: '112ms' },
  { id: 'sa-east', label: 'SA-East-1 (São Paulo)', flag: '🇧🇷', latency: '145ms' },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, setUser, deleteProject, setIsSidebarHidden } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ 
    name: '', 
    lang: 'rust', 
    description: '',
    visibility: 'private' as 'public' | 'private',
    region: 'us-east'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [systemLogs, setSystemLogs] = useState<{id: string, msg: string, time: string, type: 'info'|'warn'|'success'}[]>([
    { id: 'init', msg: 'Vibe Kernel initialized...', time: 'Now', type: 'info' }
  ]);
  
  const [realtimePulse, setRealtimePulse] = useState(0);

  const isLight = user?.settings.isLightMode;

  // Sync sidebar visibility with modal state to satisfy user request
  useEffect(() => {
    setIsSidebarHidden(isModalOpen);
    // Cleanup to ensure sidebar is restored when leaving this view or closing modal
    return () => setIsSidebarHidden(false);
  }, [isModalOpen, setIsSidebarHidden]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimePulse(prev => prev + 0.1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const messages = [
      "Node synchronization protocol updated.",
      "Neural indexing complete for project Alpha.",
      "Edge gateway latency optimization engaged.",
      "Mesh propagation heartbeat detected.",
      "Vibe Kernel v2.9 stable patch applied.",
      "Encrypted tunnel established with GitHub.",
      "Cold boot initialized in 0.38s.",
      "Memory leak scan: 0 vulnerabilities found."
    ];
    
    const initialLogs = messages.slice(0, 5).map((msg, i) => ({
      id: `log-${i}`,
      msg,
      time: `${i + 1}m ago`,
      type: i === 0 ? 'success' : 'info' as any
    }));
    setSystemLogs(initialLogs);

    const interval = setInterval(() => {
      const newLog = {
        id: `log-${Date.now()}`,
        msg: messages[Math.floor(Math.random() * messages.length)],
        time: "Just now",
        type: Math.random() > 0.85 ? 'success' : 'info' as any
      };
      setSystemLogs(prev => [newLog, ...prev.slice(0, 6)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const computedMetrics = useMemo(() => {
    if (!user || !user.projects) return { totalLines: 0, totalCommits: 0, totalFiles: 0, languages: [] as {name: string, value: number}[], activityData: [] as any[], resources: {cpu: 0, ram: 0, mesh: 0} };
    
    let totalLines = 0;
    let totalCommits = 0;
    let totalFiles = 0;
    const langMap: Record<string, number> = {};

    const traverseFiles = (nodes: FileNode[]): { lines: number, files: number } => {
      let l = 0;
      let f = 0;
      nodes.forEach(n => {
        if (n.type === 'file') {
          f++;
          if (n.content) l += n.content.split('\n').length;
        } else if (n.children) {
          const res = traverseFiles(n.children);
          l += res.lines;
          f += res.files;
        }
      });
      return { lines: l, files: f };
    };

    user.projects.forEach(p => {
      totalCommits += p.stats.commits;
      const res = p.files ? traverseFiles(p.files) : { lines: 0, files: 0 };
      totalLines += res.lines;
      totalFiles += res.files;
      langMap[p.language] = (langMap[p.language] || 0) + 1;
    });

    const languages = Object.entries(langMap).map(([name, value]) => ({ name, value }));
    
    const activityData = Array.from({ length: 12 }, (_, i) => {
      const seed = (i * 7) + user.projects.length + (totalLines / 100);
      const randomVariance = (Math.sin(seed + realtimePulse) * 40) + 20;
      const baseValue = (user.projects.length * 120) + (totalLines / 10);
      return {
        name: `${i * 2}:00`,
        val: Math.max(0, Math.floor(baseValue + randomVariance))
      };
    });

    const cpuVal = Math.min(99, 12 + (user.projects.length * 7) + (Math.sin(realtimePulse) * 5));
    const ramVal = Math.min(98, 18 + (totalFiles * 3) + (totalLines / 150) + (Math.cos(realtimePulse) * 3));
    const meshVal = Math.min(100, 4 + (user.projects.length * 4) + (Math.random() * 5));

    return { 
      totalLines, 
      totalCommits, 
      totalFiles, 
      languages, 
      activityData,
      resources: { cpu: cpuVal, ram: ramVal, mesh: meshVal }
    };
  }, [user, realtimePulse]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !user) return;
    setIsCreating(true);

    setTimeout(() => {
      const createdProject: Project = {
        id: `node-${Date.now()}`,
        name: newProject.name,
        description: newProject.description || `Logic node for ${newProject.name}`,
        language: newProject.lang.charAt(0).toUpperCase() + newProject.lang.slice(1),
        lastModified: new Date().toISOString(),
        status: newProject.visibility === 'public' ? 'published' : 'active',
        stats: { commits: 1, lines: 1, hours: 0 },
        files: [
          { 
            id: `f1-${Date.now()}`, 
            name: newProject.lang === 'rust' ? 'main.rs' : newProject.lang === 'typescript' ? 'index.ts' : newProject.lang === 'python' ? 'main.py' : 'main.go', 
            type: 'file', 
            language: newProject.lang, 
            content: newProject.lang === 'rust' 
              ? 'fn main() {\n    println!("System online.");\n}' 
              : newProject.lang === 'python'
              ? 'print("Vibe environment active.")'
              : newProject.lang === 'go'
              ? 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Node live.")\n}'
              : 'console.log("Vibe module initialized.");' 
          }
        ]
      };
      
      setUser({ ...user, projects: [createdProject, ...user.projects] });
      setIsCreating(false);
      setIsModalOpen(false);
      setNewProject({ name: '', lang: 'rust', description: '', visibility: 'private', region: 'us-east' });
      onNavigate('editor', createdProject.id);
    }, 1200);
  };

  const getTimeAgo = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'JUST NOW';
    if (diff < 3600) return `${Math.floor(diff/60)}M AGO`;
    if (diff < 86400) return `${Math.floor(diff/3600)}H AGO`;
    return d.toLocaleDateString();
  };

  const stats = [
    { label: 'Total Lines', value: computedMetrics.totalLines.toLocaleString(), icon: Braces, color: 'text-sky-400' },
    { label: 'Commits', value: computedMetrics.totalCommits, icon: GitBranch, color: 'text-amber-400' },
    { label: 'Logic Nodes', value: user?.projects.length || 0, icon: Layers, color: 'text-emerald-400' },
    { label: 'Latency', value: '14ms', icon: Server, color: 'text-cyan-400' },
  ];

  return (
    <div className="p-5 max-w-[1600px] mx-auto space-y-6 pb-12 relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <h1 className="text-xl font-black tracking-tighter text-[var(--text-main)] uppercase">Console_Output</h1>
          <p className="text-[var(--text-muted)] font-bold text-[9px] uppercase tracking-[0.2em] mt-0.5 opacity-50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> Local Grid Synchronized
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all flex items-center gap-2 group">
             <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Sync_Matrix
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-xl text-white flex items-center gap-2.5 active:scale-95"
           >
             <Plus size={16} /> Construct_Node
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--panel-bg)] hover:bg-sky-500/5 transition-all group animate-slide-up hover:border-sky-500/30">
            <div className="flex items-center justify-between mb-2.5">
              <div className={`p-2 rounded-xl bg-[var(--bg-deep)] ${stat.color} shadow-inner`}>
                <stat.icon size={16} />
              </div>
              <span className="text-[8px] font-black text-emerald-400/50 tracking-widest uppercase">Telemetry Active</span>
            </div>
            <h4 className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 opacity-60">{stat.label}</h4>
            <p className="text-2xl font-black tabular-nums text-[var(--text-main)] tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 space-y-5">
           <div className="p-6 rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] relative overflow-hidden animate-slide-up shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col">
                  <h3 className="text-[12px] font-black tracking-tighter text-[var(--text-main)] flex items-center gap-2 uppercase tracking-widest">
                    <TrendingUp size={16} className="text-sky-400" /> Mesh_Propagations
                  </h3>
                  <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">Impact metrics mapped to logical node volume</span>
                </div>
                <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/5">
                   {['L1', 'L2', 'Core'].map((l, i) => (
                     <button key={i} className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest transition-all ${i===2 ? 'bg-sky-500 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}>{l}</button>
                   ))}
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={computedMetrics.activityData}>
                    <defs>
                      <linearGradient id="colorLines" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "#00000005" : "#ffffff02"} vertical={false} />
                    <XAxis dataKey="name" stroke={isLight ? "#94a3b8" : "#475569"} fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#020617', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorLines)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] space-y-5 shadow-lg">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                      <Cpu size={16} className="text-cyan-400" /> Resource_Matrix
                    </h3>
                    <div className="flex gap-1">
                       <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                       <div className="w-1 h-1 rounded-full bg-sky-500 opacity-20"></div>
                       <div className="w-1 h-1 rounded-full bg-sky-500 opacity-20"></div>
                    </div>
                 </div>
                 <div className="space-y-5">
                    {[
                      { label: 'Indexing CPU', val: `${Math.floor(computedMetrics.resources.cpu)}%`, color: 'bg-sky-500', icon: Activity },
                      { label: 'Buffer RAM', val: `${Math.floor(computedMetrics.resources.ram)}%`, color: 'bg-purple-500', icon: HardDrive },
                      { label: 'Mesh Sync', val: `${Math.floor(computedMetrics.resources.mesh)}%`, color: 'bg-emerald-500', icon: Network }
                    ].map((res, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em]">
                           <span className="flex items-center gap-2.5 text-[var(--text-muted)]"><res.icon size={11} /> {res.label}</span>
                           <span className="text-[var(--text-main)] tabular-nums">{res.val}</span>
                        </div>
                        <div className="h-[4px] bg-white/5 rounded-full overflow-hidden shadow-inner">
                           <div className={`h-full ${res.color} transition-all duration-1000 ease-in-out relative`} style={{ width: res.val }}>
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 <div className="pt-2 border-t border-white/5 text-center">
                    <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-30">Auto-allocated based on node density</p>
                 </div>
              </div>

              <div className="p-6 rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] self-start flex items-center gap-2 mb-4">
                    <Hash size={16} className="text-pink-400" /> Stack_Mesh
                 </h3>
                 <div className="flex-1 w-full flex items-center justify-center relative min-h-[140px]">
                    <div className="absolute flex flex-col items-center text-center z-10 animate-fade-in">
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Core Units</span>
                       <span className="text-2xl font-black text-[var(--text-main)] tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{computedMetrics.languages.length}</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={computedMetrics.languages.length > 0 ? computedMetrics.languages : [{name: 'Idle', value: 1}]} 
                          cx="50%" cy="50%" innerRadius={45} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none"
                        >
                          {computedMetrics.languages.map((_, i) => <Cell key={i} fill={['#22d3ee', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'][i % 5]} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                          {computedMetrics.languages.length === 0 && <Cell fill="#1e293b" opacity={0.3} />}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: isLight ? '#fff' : '#0f172a', border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-full flex flex-wrap justify-center gap-3 mt-4">
                    {computedMetrics.languages.map((l, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ['#22d3ee', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'][i % 5] }}></div>
                        <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">{l.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="xl:col-span-4 space-y-5">
           <div className="h-full rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl">
              <div className={`p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 ${isLight ? 'bg-slate-50/50' : 'bg-black/20'}`}>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] flex items-center gap-2">
                    <Terminal size={16} className="text-emerald-400" /> Live_Mesh_Feed
                 </h3>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Encrypted</span>
                 </div>
              </div>
              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto no-scrollbar max-h-[500px]">
                 {systemLogs.map(log => (
                   <div key={log.id} className="group flex gap-4 p-3 rounded-xl bg-white/[0.01] border border-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/5 cursor-default">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${log.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
                         {log.type === 'success' ? <Check size={14} /> : <Info size={14} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-[11px] font-bold text-[var(--text-main)] leading-tight tracking-tight">{log.msg}</p>
                         <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1.5 opacity-30">{log.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <div className={`p-5 border-t border-[var(--border-color)] ${isLight ? 'bg-slate-50/80' : 'bg-black/30'}`}>
                 <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-3 opacity-60">Global Commands</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 p-3 bg-sky-500/10 border border-sky-500/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-sky-400 hover:bg-sky-500 hover:text-white transition-all active:scale-95">
                       <Play size={10} /> Full_Sync
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-white/[0.03] border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-sky-400 hover:bg-white/[0.06] transition-all active:scale-95">
                       <Shield size={10} /> Node_Audit
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <h3 className="text-base font-black tracking-tighter text-[var(--text-main)] uppercase">Grid_Topology</h3>
              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">Active logical compute units in mesh</span>
           </div>
           <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-sky-500/30 transition-all">
              <Search size={14} className="text-[var(--text-muted)]" />
              <input type="text" placeholder="Search Topology..." className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] w-44 placeholder:text-white/10" />
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {user?.projects.map((proj) => (
            <div 
              key={proj.id} 
              className="group p-6 rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] hover:border-cyan-500/50 transition-all cursor-pointer relative animate-scale-in hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              onClick={() => onNavigate('editor', proj.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-10 h-10 ${proj.language === 'Rust' ? 'bg-orange-500/10' : 'bg-cyan-500/10'} rounded-xl flex items-center justify-center border border-white/5 shadow-inner`}>
                  <div className={`w-2 h-2 rounded-full ${proj.language === 'Rust' ? 'bg-orange-500 shadow-[0_0_12px_#f97316]' : 'bg-cyan-500 shadow-[0_0_12px_#06b6d4]'}`}></div>
                </div>
                <div className="flex items-center gap-1.5">
                   <button 
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(proj.id); }}
                    className="p-2 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="text-base font-black tracking-tight mb-1 text-[var(--text-main)] group-hover:text-cyan-400 transition-colors uppercase">{proj.name}</h4>
              <p className="text-[8.5px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-5 flex items-center gap-2.5 opacity-60">
                <Clock size={12} /> {getTimeAgo(proj.lastModified)}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                 <span className="text-[8.5px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-lg border border-cyan-500/10">{proj.language}</span>
                 <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2"><GitBranch size={12} /> {proj.stats.commits}</span>
              </div>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="p-2 bg-sky-500/10 rounded-lg">
                    <Zap size={14} className="text-sky-400" />
                 </div>
              </div>
            </div>
          ))}
          {user?.projects.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] opacity-30 group hover:opacity-100 transition-all hover:border-sky-500/30">
               <Sparkles size={32} className="mx-auto mb-4 text-cyan-400 group-hover:scale-125 transition-transform" />
               <p className="text-[11px] font-black uppercase tracking-widest mb-1">Workspace Initialized</p>
               <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Construct your first logic node to begin Matrix feed.</p>
               <button onClick={() => setIsModalOpen(true)} className="mt-6 px-6 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Initialize Unit</button>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="max-w-xs w-full glass-panel p-10 rounded-[3rem] border-red-500/20 text-center animate-scale-in shadow-[0_64px_128px_rgba(0,0,0,0.8)]">
             <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 border border-red-500/20">
                <AlertTriangle size={36} />
             </div>
             <h2 className="text-lg font-black tracking-tighter text-[var(--text-main)] mb-2 uppercase">Purge_Node?</h2>
             <p className="text-[10px] text-[var(--text-muted)] mb-8 font-bold uppercase tracking-widest opacity-60 leading-relaxed">Permanently deallocate and wipe logical unit from mesh.</p>
             <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3.5 bg-[var(--bg-deep)] rounded-2xl font-black text-[9px] uppercase tracking-widest text-[var(--text-main)] border border-[var(--border-color)] hover:bg-white/5 transition-all">Abort</button>
                <button onClick={() => { deleteProject(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-3.5 bg-red-600 rounded-2xl font-black text-[9px] uppercase tracking-widest text-white shadow-xl shadow-red-600/30 hover:bg-red-500 active:scale-95 transition-all">Purge</button>
             </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="w-full max-w-2xl glass-panel rounded-[2.5rem] border-[var(--border-color)] shadow-[0_64px_128px_rgba(0,0,0,0.8)] animate-scale-in overflow-hidden flex flex-col md:flex-row relative z-[610] max-h-[90vh]">
            <div className="md:w-56 bg-sky-600 p-10 text-white flex flex-col justify-between shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-30"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-10 shadow-inner backdrop-blur-md">
                  <Plus size={28} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter mb-3 uppercase leading-none">Init_Node</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-relaxed">Allocate compute core and neural bridge for new logical unit.</p>
              </div>
              <div className="relative z-10 space-y-4 pt-10 border-t border-white/10">
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={16} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Encrypted Tunnel</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Database size={16} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Mesh Replication</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 p-10 bg-[var(--bg-deep)] overflow-y-auto no-scrollbar">
              <div className="flex justify-end mb-4">
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors hover:bg-white/5 rounded-xl"><X size={24} /></button>
              </div>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] ml-1">Unit Handle</label>
                      <input required type="text" placeholder="api-service-v1" className="w-full bg-white/[0.03] border border-[var(--border-color)] rounded-2xl py-3.5 px-5 focus:border-sky-500/50 outline-none text-[12px] font-black text-[var(--text-main)] uppercase tracking-wider" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] ml-1">Core Architecture</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {['rust', 'typescript', 'go', 'python'].map(tmpl => (
                          <button key={tmpl} type="button" onClick={() => setNewProject({...newProject, lang: tmpl})} className={`p-3.5 rounded-2xl border text-left transition-all ${newProject.lang === tmpl ? 'bg-sky-600/20 border-sky-500/50 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : 'bg-white/[0.03] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'}`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{tmpl}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] ml-1">Visibility Tunnel</label>
                      <div className="flex gap-2.5 p-1.5 bg-white/[0.03] border border-[var(--border-color)] rounded-2xl">
                        <button type="button" onClick={() => setNewProject({...newProject, visibility: 'private'})} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${newProject.visibility === 'private' ? 'bg-sky-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}>Private</button>
                        <button type="button" onClick={() => setNewProject({...newProject, visibility: 'public'})} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${newProject.visibility === 'public' ? 'bg-sky-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-white'}`}>Public</button>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] ml-1">Mesh Region</label>
                      <select className="w-full bg-white/[0.03] border border-[var(--border-color)] rounded-2xl py-3.5 px-5 focus:border-sky-500/50 outline-none text-[10px] font-black text-[var(--text-main)] uppercase tracking-widest appearance-none cursor-pointer" value={newProject.region} onChange={e => setNewProject({...newProject, region: e.target.value})}>
                        {REGIONS.map(r => <option key={r.id} value={r.id} className="bg-[#020617] text-white">{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isCreating} className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all shadow-2xl shadow-sky-600/30 active:scale-95 disabled:opacity-50 mt-4 group">
                  {isCreating ? (
                    <div className="flex items-center justify-center gap-3">
                       <RefreshCw className="animate-spin" size={16} /> Synchronizing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                       Initialize_Unit <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
