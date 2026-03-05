
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Code2, Cpu, Zap, Share2, Sparkles, Terminal, 
  Layers, PlayCircle, Globe, Command, ChevronRight, 
  Activity, Shield, BarChart3, Cloud, MousePointer2,
  Sun, Moon, ShieldCheck, Box, Database, ZapOff, Fingerprint,
  Network, MousePointer, Globe2, Gauge, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../App';
import Logo from '../components/Logo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 20 }) => {
  const [currentText, setCurrentText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= text.length) {
        setCurrentText(text.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{currentText}<span className="cursor-blink">|</span></span>;
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { user, updateSettings } = useAuth();
  const isLight = user?.settings.isLightMode;

  return (
    <div className={`relative min-h-screen bg-[var(--bg-deep)] overflow-x-hidden text-[var(--text-main)] transition-colors duration-500`}>
      {/* Dynamic Glow Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-5%] w-[50%] h-[50%] ${isLight ? 'bg-sky-400/10' : 'bg-cyan-600/10'} blur-[140px] rounded-full animate-pulse`}></div>
        <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] ${isLight ? 'bg-indigo-400/10' : 'bg-indigo-600/10'} blur-[140px] rounded-full animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute inset-0 opacity-[0.02] ${isLight ? 'bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)]'} bg-[size:30px_30px]`}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center shadow-[0_5px_15px_rgba(14,165,233,0.2)] group-hover:rotate-6 transition-transform duration-500">
            <Logo size={22} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-[var(--text-main)]">VIBE STUDIO</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
          {['Engine', 'Mesh', 'Intelligence', 'Security'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[9px] font-black text-[var(--text-muted)] hover:text-sky-600 transition-all uppercase tracking-[0.3em] hover:scale-105">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => updateSettings({ isLightMode: !isLight })}
            className="p-2.5 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl transition-all text-[var(--text-muted)] hover:text-sky-600 hover:shadow-lg active:scale-90"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button 
            onClick={onGetStarted}
            className="group flex items-center gap-3 px-6 py-2.5 bg-sky-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-sky-500 transition-all shadow-[0_10px_20px_rgba(14,165,233,0.2)] active:scale-95"
          >
            INITIALIZE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-6 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 backdrop-blur-3xl mb-8 animate-slide-up">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-sky-600">Stable_Grid_v2.9_Active</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-8 text-[var(--text-main)] uppercase animate-scale-in">
          <TypewriterText text="FORGE_CODE" delay={80} /> <br/>
          <span className="bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">NEURAL_MESH</span>
        </h1>

        <div className="text-[11px] md:text-[12px] text-[var(--text-muted)] max-w-xl font-bold leading-relaxed mb-12 uppercase tracking-[0.2em] opacity-70 h-10">
          <TypewriterText text="A high-velocity IDE built on a decentralized mesh core. Experience sub-millisecond sync and AI-native architecture." />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 animate-fade-in stagger-2">
          <button 
            onClick={onGetStarted}
            className="px-10 py-4 bg-sky-600 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] text-white hover:bg-sky-500 transition-all shadow-[0_15px_30px_rgba(14,165,233,0.2)] flex items-center gap-3 active:scale-95 group"
          >
            Launch_Studio <Terminal size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button 
            className="px-10 py-4 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl font-black text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] hover:text-sky-600 transition-all flex items-center gap-3 active:scale-95 hover:border-sky-500/30"
          >
            Read_Docs <Layers size={16} />
          </button>
        </div>
      </section>

      {/* Feature Grid: Neural Core */}
      <section id="engine" className="relative z-10 max-w-7xl mx-auto px-8 py-16 border-t border-black/5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="p-7 rounded-[2rem] bg-[var(--panel-bg)] border border-[var(--border-color)] group hover:border-sky-500/30 transition-all duration-700 hover:shadow-lg">
              <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-500">
                 <Cpu size={24} />
              </div>
              <h3 className="text-lg font-black tracking-tighter mb-3 uppercase">Neural_Engine</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60">
                 Native AI core integrated into the compiler cycle. Real-time refactoring suggestions before you even save.
              </p>
           </div>

           <div className="p-7 rounded-[2rem] bg-[var(--panel-bg)] border border-[var(--border-color)] group hover:border-indigo-500/30 transition-all duration-700 hover:shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                 <Network size={24} />
              </div>
              <h3 className="text-lg font-black tracking-tighter mb-3 uppercase">Matrix_Sync</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60">
                 Global mesh synchronization ensuring zero indexing lag across distributed teams. Built for high-velocity logic.
              </p>
           </div>

           <div className="p-7 rounded-[2rem] bg-[var(--panel-bg)] border border-[var(--border-color)] group hover:border-emerald-500/30 transition-all duration-700 hover:shadow-lg">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                 <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black tracking-tighter mb-3 uppercase">Vibe_Vault</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-60">
                 Military-grade encryption for source code at rest and in transit. Your intellectual property, secured by mesh protocols.
              </p>
           </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" className="relative z-10 py-20 bg-slate-50/50">
         <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-right">
               <div className="inline-flex items-center gap-3 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600">
                  <Sparkles size={14} />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">AI_Core_Active</span>
               </div>
               <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[0.9]">INTELLIGENT <br/> ARCHITECTURE</h2>
               <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed opacity-70 max-w-md">
                  Vibe Studio isn't just an editor; it's a co-architect. Our Neural Agent understands context across your entire workspace, identifying patterns and vulnerabilities in real-time.
               </p>
               <ul className="space-y-4">
                  {[
                    { label: "Neural Autocomplete", sub: "LMM-powered contextual predictions" },
                    { label: "Auto-Architecting", sub: "Structural recommendations for clean code" },
                    { label: "Security Heuristics", sub: "Automated vulnerability detection" }
                  ].map((f, i) => (
                    <li key={i} className="flex gap-4 group">
                       <div className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all shadow-sm">
                          <Check size={14} className="text-indigo-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">{f.label}</p>
                          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">{f.sub}</p>
                       </div>
                    </li>
                  ))}
               </ul>
            </div>

            <div className="relative">
               <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full"></div>
               <div className="glass-panel p-6 rounded-[2.5rem] shadow-lg border-black/5 relative overflow-hidden group">
                  <div className="h-56 bg-slate-900 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-end border border-white/10">
                     <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                        <div className="h-full w-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.5)_0%,transparent_70%)] animate-pulse"></div>
                     </div>
                     <div className="space-y-3 relative z-10">
                        <div className="flex gap-1.5">
                           <div className="w-1 h-1 rounded-full bg-red-400"></div>
                           <div className="w-1 h-1 rounded-full bg-amber-400"></div>
                           <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                        </div>
                        <div className="font-mono text-[9px] text-indigo-300 opacity-60">
                           <p>Initializing Neural_Kernel...</p>
                           <p>Scoping context: nebula-mesh-api</p>
                           <p>Suggested Refactor: Optimization detected at line 42</p>
                        </div>
                     </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                           <Gauge size={18} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest">Logic Flow</p>
                           <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest">98.4% Accuracy</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[20px] font-black tracking-tighter">0.12s</p>
                        <p className="text-[7px] font-black text-indigo-600 uppercase tracking-widest">Inference Latency</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Performance Footer Section */}
      <section className="relative z-10 py-24 px-8">
         <div className="max-w-4xl mx-auto text-center space-y-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">READY_FOR_LIFTOFF?</h2>
            <div className="p-10 glass-panel rounded-[3.5rem] border-black/5 space-y-8 shadow-xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-indigo-500/5"></div>
               <div className="relative z-10 space-y-6">
                  <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.25em] opacity-60">
                     Join thousands of elite operators architecting the next era of decentralized software.
                  </p>
                  <button 
                    onClick={onGetStarted}
                    className="px-14 py-5 bg-sky-600 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] text-white shadow-[0_15px_40px_rgba(14,165,233,0.2)] hover:bg-sky-500 hover:scale-105 active:scale-95 transition-all duration-500"
                  >
                    SYNC_AND_INITIALIZE
                  </button>
                  <div className="flex justify-center gap-10 opacity-30">
                     <div className="flex items-center gap-2">
                        <Shield size={14} /> <span className="text-[8px] font-black uppercase tracking-widest">Encrypted</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Zap size={14} /> <span className="text-[8px] font-black uppercase tracking-widest">Real-time</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Cloud size={14} /> <span className="text-[8px] font-black uppercase tracking-widest">Mesh-native</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-black/5 opacity-50 hover:opacity-100 transition-opacity">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-sky-600/40 mb-2">VIBE STUDIO // NEURAL MESH PLATFORM</p>
         <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest">© 2025 VIBE CORE INC. ALL NODES OPERATIONAL.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
