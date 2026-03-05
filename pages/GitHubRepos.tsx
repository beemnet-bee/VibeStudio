
import React, { useState } from 'react';
import { Github, Search, RefreshCw, ExternalLink, GitFork, Star, Lock, Unlock, Check } from 'lucide-react';
import { useAuth } from '../App';
import { Repo, Project } from '../types';

interface GitHubReposProps {
  onNavigate: (tab: string) => void;
}

const GitHubRepos: React.FC<GitHubReposProps> = ({ onNavigate }) => {
  const { user, setUser, setActiveProjectId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);

  const mockRepos: Repo[] = [
    { id: 1, name: 'vibe-core-rs', description: 'Engine kernel for Vibe Studio.', language: 'Rust', stars: 2400, updatedAt: '1h ago' },
    { id: 2, name: 'nebula-visuals', description: 'WebGL visualization framework.', language: 'TypeScript', stars: 1200, updatedAt: '12m ago' },
    { id: 3, name: 'synapse-api', description: 'Neural bridge API endpoint.', language: 'Go', stars: 840, updatedAt: '2d ago' },
  ];

  const handleConnect = () => {
    setLoading(true);
    setTimeout(() => {
      if (user) {
        setUser({ ...user, githubConnected: true });
      }
      setLoading(false);
    }, 1000);
  };

  const handleImport = (repo: Repo) => {
    if (!user) return;
    setImportingId(repo.id);
    
    setTimeout(() => {
      const newProject: Project = {
        id: `gh-${repo.id}-${Date.now()}`,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        lastModified: new Date().toISOString(),
        status: 'active',
        stats: { commits: 42, lines: 1200, hours: 0 },
        files: [
          { id: 'gh-f1', name: 'README.md', type: 'file', language: 'markdown', content: `# ${repo.name}\nImported into Vibe Studio.\n\n${repo.description}` },
          { id: 'gh-f2', name: 'index.ts', type: 'file', language: 'typescript', content: `// Clone of ${repo.name}\nexport const sync = true;` }
        ]
      };
      
      setUser({ ...user, projects: [newProject, ...user.projects] });
      setActiveProjectId(newProject.id);
      setImportingId(null);
      onNavigate('editor');
    }, 1200);
  };

  if (!user?.githubConnected) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-[#02040a]">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative group">
            <div className="absolute inset-0 bg-indigo-600/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Github size={48} className="text-white relative z-10" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-4 text-white">Ecosystem Sync</h2>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed">Securely connect your GitHub infrastructure to the Vibe Studio global mesh.</p>
          <button 
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 text-white"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Github size={20} /> Authenticate Tunnel</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white">GitHub Repositories</h1>
          <p className="text-gray-500 font-medium text-base mt-1">Ecosystem synced as <span className="text-indigo-400 font-black">@{user.username}</span></p>
        </div>
        <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-gray-400 hover:text-white transition-all"><RefreshCw size={20} /></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockRepos.map((repo) => (
          <div key={repo.id} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-indigo-500/40 transition-all">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400"><Github size={24} /></div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">{repo.name}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Updated {repo.updatedAt}</p>
                </div>
              </div>
              <button className="p-2 text-gray-600 hover:text-white transition-colors"><ExternalLink size={20} /></button>
            </div>
            <p className="text-gray-500 font-medium text-[11px] mb-10 h-10 line-clamp-2 leading-relaxed">{repo.description}</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-500"><Star size={14} className="text-amber-400" /> {repo.stars}</div>
                <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest">{repo.language}</div>
              </div>
              <button 
                onClick={() => handleImport(repo)}
                disabled={importingId !== null}
                className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
                  importingId === repo.id ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10'
                }`}
              >
                {importingId === repo.id ? <Check size={16} /> : 'Sync Node'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubRepos;
