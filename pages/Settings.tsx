
import React, { useState, useEffect } from 'react';
import { 
  Palette, Check, RefreshCw, Zap, Type, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../App';

const Settings: React.FC = () => {
  const { user, setUser } = useAuth();
  
  const [formData, setFormData] = useState({
    theme: user?.settings.theme || 'midnight',
    fontSize: user?.settings.fontSize || 14,
    isLightMode: user?.settings.isLightMode || false
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        theme: user.settings.theme,
        fontSize: user.settings.fontSize,
        isLightMode: user.settings.isLightMode
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    setTimeout(() => {
      const updatedUser = { 
        ...user, 
        settings: {
          ...user.settings,
          theme: formData.theme as any,
          fontSize: formData.fontSize,
          isLightMode: formData.isLightMode
        }
      };
      
      setUser(updatedUser);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const themeOptions = [
    { id: 'midnight', color: 'bg-[#22d3ee]' },
    { id: 'neon', color: 'bg-[#f0abfc]' },
    { id: 'obsidian', color: 'bg-[#10b981]' },
    { id: 'slate', color: 'bg-[#38bdf8]' },
    { id: 'crimson', color: 'bg-[#f43f5e]' },
    { id: 'emerald', color: 'bg-[#10b981]' },
    { id: 'cyberpunk', color: 'bg-[#facc15]' },
    { id: 'amethyst', color: 'bg-[#a855f7]' }
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-right">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-[var(--text-main)]">System Config</h1>
          <p className="text-[var(--text-muted)] font-medium text-[9px] uppercase tracking-widest mt-0.5 opacity-60">Preferences & Mesh Protocol</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-6 p-8 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-3xl animate-slide-up shadow-xl">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-1.5 bg-cyan-600/10 text-cyan-400 rounded-lg"><Palette size={16} /></div>
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-main)]">Interface Matrix</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Theme Protocol</label>
                 <div className="flex gap-2 p-1.5 bg-[var(--bg-deep)] rounded-xl border border-[var(--border-color)]">
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, isLightMode: false})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${!formData.isLightMode ? 'bg-cyan-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      <Moon size={12} /> Dark
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, isLightMode: true})}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all ${formData.isLightMode ? 'bg-cyan-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      <Sun size={12} /> Light
                    </button>
                 </div>
                 
                 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 mt-4 block">Core Accent</label>
                 <div className="grid grid-cols-4 gap-2">
                    {themeOptions.map(t => (
                      <button 
                        key={t.id}
                        type="button"
                        onClick={() => setFormData({...formData, theme: t.id as any})}
                        className={`group relative py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1.5 ${formData.theme === t.id ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg' : 'bg-[var(--bg-deep)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${t.color} border border-white/10`}></div>
                        {t.id.slice(0, 4)}
                      </button>
                    ))}
                 </div>
              </div>
              <div className="space-y-5">
                 <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1 flex items-center justify-between">
                   Font Size <span className="text-cyan-400 font-black">{formData.fontSize}PX</span>
                 </label>
                 <div className="p-8 bg-[var(--bg-deep)] rounded-3xl border border-[var(--border-color)] flex flex-col justify-center min-h-[120px]">
                    <input 
                      type="range" 
                      min="10" 
                      max="24" 
                      step="1"
                      value={formData.fontSize} 
                      onChange={e => setFormData({...formData, fontSize: parseInt(e.target.value)})}
                      className="w-full h-1 cursor-pointer bg-white/5 rounded-full appearance-none accent-cyan-400" 
                    />
                    <div className="flex justify-between mt-4 text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                       <span>Compact</span>
                       <span>Immersive</span>
                    </div>
                 </div>
                 <div className="p-3 bg-cyan-600/5 border border-cyan-600/10 rounded-xl">
                    <p className="text-[9px] font-medium text-[var(--text-muted)] leading-relaxed italic text-center">
                      Global UI scaling is set to 95% by default.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* COMPACT ABSOLUTELY FIXED COMMIT BUTTON */}
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in pointer-events-none">
           <button 
             type="submit"
             disabled={saving}
             className={`px-8 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all shadow-[0_15px_40px_rgba(34,211,238,0.25)] min-w-[240px] pointer-events-auto border border-white/10 ${saved ? 'bg-emerald-600 text-white' : 'bg-cyan-600 text-white hover:bg-cyan-500 active:scale-95'}`}
           >
             {saving ? <RefreshCw size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Zap size={16} />}
             {saving ? 'Syncing...' : saved ? 'Done' : 'Commit Config'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
