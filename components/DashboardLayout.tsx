
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  Layers, 
  Github, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User as UserIcon,
  Bell,
  Search,
  Command,
  Monitor,
  Sparkles,
  X,
  FileCode,
  Sun,
  Moon,
  FolderOpen,
  Zap,
  Cpu,
  ShieldCheck,
  Circle
} from 'lucide-react';
import { useAuth } from '../App';
import Logo from './Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Neural Sync Complete', description: 'Nebula Mesh API updated successfully.', time: '2m ago', icon: Sparkles },
    { id: 2, title: 'GitHub Link Alert', description: 'New repository detected in your ecosystem.', time: '1h ago', icon: Github },
    { id: 3, title: 'System Latency', description: 'US-East-1 node experiencing sub-ms drift.', time: '3h ago', icon: Monitor },
  ]);
  
  const { user, updateSettings, isSidebarHidden } = useAuth();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      title: "Core",
      items: [
        { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
        { id: 'agent', label: 'AI Agent', icon: Bot },
      ]
    },
    {
      title: "Workspace",
      items: [
        { id: 'projects', label: 'Nodes', icon: Layers },
        { id: 'github', label: 'Ecosystem', icon: Github },
      ]
    }
  ];

  const allSearchable = [
    ...sections.flatMap(s => s.items),
    ...(user?.projects || []).map(p => ({ id: 'projects', label: p.name, icon: FileCode, originalId: p.id })),
    { id: 'settings', label: 'Edit Profile', icon: UserIcon }
  ];

  const filteredResults = searchQuery.length > 1 
    ? allSearchable.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setHasNewNotifications(false);
    }
  };

  const clearNotifications = () => {
    setNotifs([]);
    setHasNewNotifications(false);
  };

  const isLight = user?.settings.isLightMode;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-deep)] text-[var(--text-main)]">
      {!isSidebarHidden && (
        <aside 
          className={`relative z-50 transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] bg-[var(--panel-bg)] border-r border-[var(--border-color)] flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}
        >
          <div className="h-16 flex items-center px-5 gap-3 mb-4 shrink-0">
            <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)] border border-white/10 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <Logo size={22} className="text-white relative z-10" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-black text-sm tracking-tighter leading-none bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  VIBE STUDIO
                </span>
                <span className="text-[7px] font-black tracking-[0.4em] text-sky-500/60 uppercase mt-1">Grid Operational</span>
              </div>
            )}
          </div>

          <div className="flex-1 px-3 space-y-6 overflow-y-auto no-scrollbar">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                {!collapsed && (
                  <p className="px-3 text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-40 mb-1">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      activeTab === item.id 
                      ? 'bg-sky-500/10 text-[var(--text-main)] shadow-[inset_0_0_12px_rgba(14,165,233,0.05)]' 
                      : 'text-[var(--text-muted)] hover:bg-sky-500/5 hover:text-[var(--text-main)]'
                    }`}
                  >
                    {activeTab === item.id && (
                      <div className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-sky-500 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.8)]"></div>
                    )}
                    <item.icon 
                      size={18} 
                      className={`flex-shrink-0 transition-all duration-300 ${activeTab === item.id ? 'text-sky-400 scale-110' : 'group-hover:text-sky-300 group-hover:scale-110'}`} 
                    />
                    {!collapsed && (
                      <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {!collapsed && user?.projects && user.projects.length > 0 && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <p className="px-3 text-[8px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] opacity-40 mb-1 flex items-center gap-2">
                   Nodes <div className="h-px flex-1 bg-[var(--border-color)]"></div>
                </p>
                {user.projects.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveTab('editor'); }}
                    className="w-full flex items-center gap-3 px-3.5 py-1.5 text-[var(--text-muted)] hover:text-sky-400 transition-colors group"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${p.language === 'Rust' ? 'bg-orange-500' : 'bg-sky-500'} opacity-40 group-hover:opacity-100`}></div>
                    <span className="text-[10px] font-bold tracking-tight truncate opacity-70 group-hover:opacity-100">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-3 py-4 border-t border-[var(--border-color)] space-y-2 bg-[var(--panel-bg)]/30 shrink-0">
            <div className="flex gap-1">
              <button 
                onClick={() => setActiveTab('settings')}
                title="Settings"
                className={`flex-1 flex items-center justify-center p-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-sky-500/10 text-sky-400' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-sky-400'}`}
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={onLogout}
                title="Sign Out"
                className="flex-1 flex items-center justify-center p-2.5 rounded-xl text-red-500/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={18} />
              </button>
            </div>

            <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-sky-400 transition-all rounded-lg opacity-40 hover:opacity-100">
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-[var(--panel-bg)] border-b border-[var(--border-color)] px-6 flex items-center justify-between backdrop-blur-3xl z-40 shrink-0">
           <div className="flex items-center gap-5">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Active Channel: Mesh-Beta</span>
             </div>
             <div className="hidden lg:flex items-center gap-2 ml-2 px-2.5 py-1 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-lg">
                <Monitor size={12} className="text-sky-400" />
                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Neural Deck Online</span>
             </div>
           </div>

          <div className="flex items-center gap-4 relative">
            <div ref={searchRef} className="relative">
              <div className="hidden md:flex items-center bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-xl px-4 py-1.5 group focus-within:border-sky-500/30 transition-all shadow-inner">
                 <Search size={14} className="text-[var(--text-muted)] group-focus-within:text-sky-400" />
                 <input 
                   type="text" 
                   placeholder="COMMAND SEARCH..." 
                   className="bg-transparent border-none outline-none text-[10px] font-black text-[var(--text-main)] w-48 ml-2 placeholder:text-[var(--text-muted)]/50 tracking-widest" 
                   value={searchQuery}
                   onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setShowSearchDropdown(true);
                   }}
                   onFocus={() => setShowSearchDropdown(true)}
                 />
              </div>
              {showSearchDropdown && filteredResults.length > 0 && (
                <div className="absolute top-full mt-3 left-0 w-72 glass-panel rounded-2xl border-[var(--border-color)] shadow-[0_32px_64px_rgba(0,0,0,0.5)] p-2.5 z-[100] animate-scale-in">
                   {filteredResults.map((res, i) => (
                     <button 
                       key={i} 
                       onClick={() => {
                         setActiveTab(res.id);
                         setSearchQuery('');
                         setShowSearchDropdown(false);
                       }}
                       className="w-full flex items-center gap-3.5 p-3 hover:bg-sky-500/10 rounded-xl text-left transition-colors group"
                     >
                       <div className="p-2 bg-sky-600/10 text-sky-400 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-all">
                         <res.icon size={16} />
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-widest">{res.label}</span>
                         <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">Navigate to {res.id}</span>
                       </div>
                     </button>
                   ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => updateSettings({ isLightMode: !isLight })}
              className="p-2.5 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-xl transition-all text-[var(--text-muted)] hover:text-sky-400 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] active:scale-95"
            >
              {isLight ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div ref={notifRef} className="relative">
              <button 
                onClick={toggleNotifications}
                className={`p-2.5 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-xl transition-all relative group ${showNotifications ? 'text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'text-[var(--text-muted)] hover:text-sky-400'}`}
              >
                <Bell size={18} />
                {hasNewNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-sky-500 rounded-full border-2 border-[var(--bg-deep)] shadow-[0_0_10px_#0ea5e9]"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full mt-3 right-0 w-80 glass-panel rounded-[2rem] border-[var(--border-color)] shadow-[0_40px_80px_rgba(0,0,0,0.6)] p-6 z-[100] animate-scale-in">
                   <div className="flex items-center justify-between mb-5">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--text-main)]">Telemetry Alerts</h4>
                      <button onClick={clearNotifications} className="text-[9px] font-black uppercase tracking-widest text-sky-400 hover:text-sky-300 transition-colors">Clear All</button>
                   </div>
                   <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                      {notifs.length > 0 ? notifs.map(n => (
                        <div key={n.id} className="flex gap-4 p-3 hover:bg-sky-500/5 rounded-2xl transition-all border border-transparent hover:border-white/5">
                           <div className="w-10 h-10 bg-sky-600/10 text-sky-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                              <n.icon size={20} />
                           </div>
                           <div className="flex-1 overflow-hidden">
                              <p className="text-[11px] font-black text-[var(--text-main)] uppercase tracking-tight truncate">{n.title}</p>
                              <p className="text-[10px] font-medium text-[var(--text-muted)] leading-relaxed mt-1">{n.description}</p>
                              <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-30 mt-2">{n.time}</p>
                           </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center opacity-20">
                           <p className="text-[10px] font-black uppercase tracking-widest">Workspace Silence</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[var(--bg-deep)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.04)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="relative z-10 h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
