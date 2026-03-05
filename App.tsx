
import React, { useState, useEffect, createContext, useContext } from 'react';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Projects3D from './pages/Projects3D';
import GitHubRepos from './pages/GitHubRepos';
import Agent from './pages/Agent';
import Settings from './pages/Settings';
import { AuthStatus, User, EditorSettings, Project } from './types';
import Logo from './components/Logo';

interface AuthContextType {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  updateSettings: (updates: Partial<EditorSettings>) => void;
  logout: () => void;
  isSidebarHidden: boolean;
  setIsSidebarHidden: (hidden: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 13,
  theme: 'slate',
  fontFamily: 'Fira Code',
  autoFormat: true,
  aiAutocompletion: true,
  isLightMode: true
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [status, setStatus] = useState<AuthStatus>(AuthStatus.IDLE);
  const [user, setUserState] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('vibe_studio_user_data', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('vibe_studio_user_data');
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    if (!user) return;
    const updatedProjects = user.projects.map(p => 
      p.id === projectId ? { ...p, ...updates, lastModified: new Date().toISOString() } : p
    );
    setUser({ ...user, projects: updatedProjects });
  };

  const updateSettings = (updates: Partial<EditorSettings>) => {
    if (!user) return;
    setUser({
      ...user,
      settings: { ...user.settings, ...updates }
    });
  };

  const deleteProject = (projectId: string) => {
    if (!user) return;
    const updatedProjects = user.projects.filter(p => p.id !== projectId);
    setUser({ ...user, projects: updatedProjects });
    if (activeProjectId === projectId) {
      setActiveProjectId(updatedProjects[0]?.id || null);
    }
  };

  useEffect(() => {
    const savedData = localStorage.getItem('vibe_studio_user_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserState(parsed);
      setStatus(AuthStatus.LOGGED_IN);
      if (parsed.projects?.length > 0) setActiveProjectId(parsed.projects[0].id);
    } else {
      const defaultUser: User = {
        id: 'vibe-op-01',
        email: 'operator@vibe.studio',
        username: 'operator',
        fullName: 'Operator',
        avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=operator',
        githubConnected: false,
        settings: DEFAULT_SETTINGS,
        projects: []
      };
      setUserState(defaultUser);
    }
    
    const splashTimeout = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(splashTimeout);
  }, []);

  useEffect(() => {
    if (!user) return;
    const { theme, fontSize, isLightMode } = user.settings;
    const root = document.documentElement;
    
    const themes: Record<string, {bg: string, accent: string}> = {
      midnight: { bg: '#020617', accent: '#22d3ee' },
      neon: { bg: '#0f172a', accent: '#f0abfc' },
      obsidian: { bg: '#000000', accent: '#10b981' },
      slate: { bg: '#1e293b', accent: '#38bdf8' },
      crimson: { bg: '#110202', accent: '#f43f5e' },
      emerald: { bg: '#021106', accent: '#10b981' },
      cyberpunk: { bg: '#0f0f00', accent: '#facc15' },
      amethyst: { bg: '#080211', accent: '#a855f7' }
    };
    
    const current = themes[theme] || themes.midnight;
    
    if (isLightMode) {
      root.style.setProperty('--bg-deep', '#f8fafc');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--panel-bg', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.08)');
      document.body.style.backgroundColor = '#f8fafc';
    } else {
      root.style.setProperty('--bg-deep', current.bg);
      root.style.setProperty('--text-main', '#f1f5f9');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--panel-bg', 'rgba(15, 23, 42, 0.75)');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.06)');
      document.body.style.backgroundColor = current.bg;
    }
    
    root.style.setProperty('--accent-primary', current.accent);
    root.style.setProperty('--editor-font-size', `${fontSize}px`);
  }, [user?.settings]);

  const logout = () => {
    setStatus(AuthStatus.IDLE);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (status === AuthStatus.IDLE) {
      return <LandingPage onGetStarted={() => setStatus(AuthStatus.LOGGED_IN)} />;
    }

    return (
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout}>
        <div key={activeTab} className="tab-content-wrapper h-full">
          {activeTab === 'dashboard' && <Dashboard onNavigate={(tab, id) => { 
            if (id) setActiveProjectId(id);
            setActiveTab(tab); 
          }} />}
          {activeTab === 'editor' && <Editor />}
          {activeTab === 'agent' && <Agent />}
          {activeTab === 'projects' && <Projects3D onNavigate={(tab, id) => {
             if (id) setActiveProjectId(id);
             setActiveTab(tab);
          }} />}
          {activeTab === 'github' && <GitHubRepos onNavigate={setActiveTab} />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </DashboardLayout>
    );
  };

  return (
    <AuthContext.Provider value={{ 
      status, setStatus, user, setUser, 
      activeProjectId, setActiveProjectId, 
      updateProject, deleteProject, updateSettings, logout,
      isSidebarHidden, setIsSidebarHidden
    }}>
      <div className="min-h-screen transition-colors duration-500">
        {showSplash && <SplashScreen />}
        {!showSplash && renderContent()}
      </div>
    </AuthContext.Provider>
  );
};

const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = "SYNCHRONIZING_GRID_v2.9";

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + (Math.random() * 5), 100));
    }, 50);

    let charIndex = 0;
    const typeTimer = setInterval(() => {
      if (charIndex <= fullText.length) {
        setTypedText(fullText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeTimer);
      }
    }, 40);

    return () => {
      clearInterval(timer);
      clearInterval(typeTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05)_0%,transparent_60%)] animate-pulse"></div>
      <div className="relative mb-6">
        <div className="absolute -inset-6 bg-sky-500/10 blur-2xl rounded-full"></div>
        <div className="w-16 h-16 bg-sky-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.2)] border border-black/5 relative z-10 animate-scale-in">
          <Logo size={40} className="text-white" />
        </div>
      </div>
      <h1 className="text-xl font-black tracking-tighter text-slate-900 mb-4 relative z-10 animate-fade-in uppercase">VIBE STUDIO</h1>
      <div className="w-56 h-[3px] bg-black/5 rounded-full overflow-hidden relative z-10 shadow-inner">
        <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="mt-4 text-[9px] font-black text-sky-600/40 uppercase tracking-[0.4em] relative z-10 h-4">
        {typedText}<span className="cursor-blink">_</span>
      </p>
    </div>
  );
};

export default App;
