
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Globe, Shield, Zap, Search, SlidersHorizontal, Box, HardDrive, Cpu, ExternalLink, Activity, Users, Clock, Database, X, Code, Bot, Layers, FileArchive, RefreshCw } from 'lucide-react';
import { useAuth } from '../App';
import { FileNode } from '../types';

interface Projects3DProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

const Projects3D: React.FC<Projects3DProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRequestRef = useRef<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth();

  const getLinesInFiles = (files: FileNode[]): number => {
    let count = 0;
    files.forEach(f => {
      if (f.type === 'file' && f.content) {
        count += f.content.split('\n').length;
      } else if (f.children) {
        count += getLinesInFiles(f.children);
      }
    });
    return count;
  };

  const displayProjects = useMemo(() => {
    if (!user || !user.projects) return [];
    
    return user.projects.map(p => {
      const loc = p.files ? getLinesInFiles(p.files) : 1;
      const height = `${Math.min(400, 100 + (loc * 2))}px`;
      
      return {
        ...p,
        color: p.language === 'Rust' ? '#f59e0b' : p.language === 'TypeScript' ? '#6366f1' : '#10b981',
        icon: p.language === 'Rust' ? Cpu : p.language === 'TypeScript' ? Code : Globe,
        height,
        loc,
        perf: '98%',
        uptime: '99.9%',
        latency: '24ms',
        region: 'Local-Mesh'
      };
    });
  }, [user]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleDownloadZip = (projectName: string) => {
    setIsDownloading(true);
    setTimeout(() => {
      const blob = new Blob(['Mock ZIP content for ' + projectName], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
      setSelectedProject(null);
    }, 1200);
  };

  useEffect(() => {
    const scrollContainer = () => {
      if (!containerRef.current || !isInside) return;
      const container = containerRef.current;
      const { width, height } = container.getBoundingClientRect();
      const threshold = 100;
      const maxSpeed = 12;
      let dx = 0; let dy = 0;
      if (mousePos.x < threshold) dx = -maxSpeed * (1 - mousePos.x / threshold);
      else if (mousePos.x > width - threshold) dx = maxSpeed * (1 - (width - mousePos.x) / threshold);
      if (mousePos.y < threshold) dy = -maxSpeed * (1 - mousePos.y / threshold);
      else if (mousePos.y > height - threshold) dy = maxSpeed * (1 - (height - mousePos.y) / threshold);
      if (dx !== 0 || dy !== 0) { container.scrollLeft += dx; container.scrollTop += dy; }
      scrollRequestRef.current = requestAnimationFrame(scrollContainer);
    };
    if (isInside) scrollRequestRef.current = requestAnimationFrame(scrollContainer);
    else if (scrollRequestRef.current) cancelAnimationFrame(scrollRequestRef.current);
    return () => { if (scrollRequestRef.current) cancelAnimationFrame(scrollRequestRef.current); };
  }, [mousePos, isInside]);

  return (
    <div className="h-full flex flex-col bg-[var(--bg-deep)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03)_0%,transparent_50%)] pointer-events-none"></div>
      
      <div className="relative z-10 px-10 pt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[var(--text-main)]">Architecture Matrix</h1>
          <p className="text-[var(--text-muted)] font-medium text-[11px] uppercase tracking-widest mt-1 opacity-60">
            Node visualizer based on real physical LOC distribution.
          </p>
        </div>
      </div>

      <div ref={containerRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsInside(true)} onMouseLeave={() => setIsInside(false)} className="flex-1 overflow-auto no-scrollbar relative cursor-default px-20 pb-40">
        {displayProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
             <Box size={48} className="text-[var(--text-muted)] opacity-20" />
             <p className="text-[var(--text-muted)] font-black uppercase tracking-widest">Workspace Void. Construct a project node.</p>
          </div>
        ) : (
          <div className="min-w-[150vw] min-h-[150vh] flex items-center justify-center py-40">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-32 gap-y-48 isometric-card-container">
              {displayProjects.map((proj) => (
                <div key={proj.id} className="relative group cursor-pointer" style={{ transformStyle: 'preserve-3d' }} onClick={() => setSelectedProject(proj)}>
                  <div className="relative shadow-[40px_40px_100px_rgba(0,0,0,0.5)] transition-all duration-1000 group-hover:scale-[1.12]" style={{ height: proj.height, width: '160px', backgroundColor: `${proj.color}12`, border: `1px solid ${proj.color}30`, borderRadius: '1.5rem', transformStyle: 'preserve-3d' }}>
                    <div className="absolute left-full top-0 h-full w-[20px] origin-left rotate-y-90 opacity-20" style={{ backgroundColor: proj.color, transform: 'rotateY(90deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-60 transition-all duration-500">
                      <proj.icon size={64} style={{ color: proj.color }} className="group-hover:scale-125 transition-transform duration-700" />
                    </div>
                  </div>
                  <div className="absolute -top-20 left-0 w-full translate-z-[140px] pointer-events-none group-hover:-translate-y-6 transition-transform duration-700 text-[var(--text-main)] font-black">
                      <h3 className="text-2xl tracking-tighter drop-shadow-2xl">{proj.name}</h3>
                      <div className="flex flex-col gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">{proj.language} Node</span>
                         <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">{proj.loc} Calculated Lines</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-panel p-10 rounded-[3rem] border-[var(--border-color)] shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                     <selectedProject.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-[var(--text-main)]">{selectedProject.name}</h2>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{selectedProject.language} Physical Node</p>
                  </div>
               </div>
               <button onClick={() => setSelectedProject(null)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all">
                 <X size={20} />
               </button>
            </div>
            <div className="space-y-4">
               <button onClick={() => onNavigate('editor', selectedProject.id)} className="w-full group flex items-center gap-4 p-5 bg-indigo-600 text-white rounded-2xl transition-all hover:bg-indigo-500 shadow-xl">
                 <Zap size={20} />
                 <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest">Connect to Node</p></div>
               </button>
               <button 
                 onClick={() => handleDownloadZip(selectedProject.name)} 
                 disabled={isDownloading}
                 className="w-full group flex items-center gap-4 p-5 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-2xl transition-all hover:bg-emerald-600/10 hover:border-emerald-500/40"
               >
                 {isDownloading ? <RefreshCw size={20} className="animate-spin" /> : <FileArchive size={20} className="text-emerald-400" />}
                 <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-main)]">Package Source</p></div>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects3D;
