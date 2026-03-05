
import React, { useState } from 'react';
import { useAuth } from '../App';
import { AuthStatus } from '../types';
import { ArrowRight, Mail, Lock, User as UserIcon, CheckCircle, Github, Chrome, ShieldCheck, Sparkles, ChevronLeft } from 'lucide-react';

const AuthFlow: React.FC = () => {
  const { status, setStatus, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', code: '', username: '', fullName: '' });
  const [loading, setLoading] = useState(false);

  // Key consistent with App.tsx
  const STORAGE_KEY = 'vibe_studio_user_data';

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (status === AuthStatus.SIGN_UP) setStatus(AuthStatus.VERIFY_EMAIL);
      else if (status === AuthStatus.VERIFY_EMAIL) setStatus(AuthStatus.PROFILE_SETUP);
      else if (status === AuthStatus.PROFILE_SETUP) {
        const newUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: formData.email,
          username: formData.username || 'explorer_01',
          fullName: formData.fullName || 'Vibe Developer',
          avatarUrl: `https://picsum.photos/seed/${formData.username}/400/400`,
          githubConnected: false,
          projects: [],
          settings: {
            fontSize: 14,
            theme: 'midnight' as const,
            fontFamily: 'Fira Code',
            autoFormat: true,
            aiAutocompletion: true,
            isLightMode: false
          }
        };
        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        setStatus(AuthStatus.LOGGED_IN);
      }
    }, 1200);
  };

  const socialLogin = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: `${provider}-user-` + Math.random().toString(36).substr(2, 4),
        email: `${provider}.user@vibe.dev`,
        username: `${provider}_vibe`,
        fullName: `${provider.toUpperCase()} Explorer`,
        avatarUrl: `https://picsum.photos/seed/${provider}/400/400`,
        githubConnected: false,
        projects: [],
        settings: {
          fontSize: 14,
          theme: 'midnight' as const,
          fontFamily: 'Fira Code',
          autoFormat: true,
          aiAutocompletion: true,
          isLightMode: false
        }
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setStatus(AuthStatus.LOGGED_IN);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#02040a] relative overflow-hidden text-white">
      {/* Decorative light source */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {status !== AuthStatus.SIGN_UP && (
          <button 
            onClick={() => setStatus(status === AuthStatus.VERIFY_EMAIL ? AuthStatus.SIGN_UP : AuthStatus.VERIFY_EMAIL)}
            className="absolute -top-10 left-0 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
        )}

        <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
          <div className="text-center mb-10">
            <div className="relative inline-block mb-8">
               <div className="absolute -inset-4 bg-indigo-600/20 blur-xl rounded-full"></div>
               <div className="relative w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                 <ShieldCheck size={32} className="text-white" />
               </div>
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-2">
              {status === AuthStatus.SIGN_UP && "Identity Check"}
              {status === AuthStatus.VERIFY_EMAIL && "Secure Access"}
              {status === AuthStatus.PROFILE_SETUP && "Personalize Deck"}
            </h2>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">
              {status === AuthStatus.SIGN_UP && "Initiate your secure development environment."}
              {status === AuthStatus.VERIFY_EMAIL && `Decryption key sent to ${formData.email}`}
              {status === AuthStatus.PROFILE_SETUP && "Complete your operator profile."}
            </p>
          </div>

          <form onSubmit={handleNext} className="space-y-5">
            {status === AuthStatus.SIGN_UP && (
              <>
                <div className="space-y-3.5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      required
                      type="email" 
                      placeholder="Neural-mail address"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:border-indigo-500/40 outline-none transition-all placeholder:text-gray-600 font-bold text-xs"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      required
                      type="password" 
                      placeholder="Security cipher"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-6 focus:border-indigo-500/40 outline-none transition-all placeholder:text-gray-600 font-bold text-xs"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-white/5"></div>
                    <span className="text-[8px] text-gray-700 font-black uppercase tracking-[0.4em]">Protocols</span>
                    <div className="flex-1 h-px bg-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                    <button type="button" onClick={() => socialLogin('google')} className="flex items-center justify-center gap-2.5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all font-black text-[9px] uppercase tracking-widest group">
                        <Chrome size={16} className="group-hover:scale-110 transition-transform" /> Google
                    </button>
                    <button type="button" onClick={() => socialLogin('github')} className="flex items-center justify-center gap-2.5 py-3.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transition-all font-black text-[9px] uppercase tracking-widest group">
                        <Github size={16} className="group-hover:scale-110 transition-transform" /> GitHub
                    </button>
                </div>
              </>
            )}

            {status === AuthStatus.VERIFY_EMAIL && (
              <div className="flex justify-between gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input 
                    key={i}
                    maxLength={1}
                    className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl text-center text-xl font-black focus:border-indigo-500 outline-none transition-all tabular-nums text-white"
                    onChange={e => {
                        if (e.target.value && i < 6) {
                            (e.target.nextElementSibling as HTMLInputElement)?.focus();
                        }
                    }}
                  />
                ))}
              </div>
            )}

            {status === AuthStatus.PROFILE_SETUP && (
              <div className="space-y-3.5">
                <input 
                  required
                  placeholder="Entity Name"
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 px-6 focus:border-indigo-500 outline-none transition-all font-bold text-xs text-white"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">@</span>
                  <input 
                    required
                    placeholder="operator_handle"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-10 pr-6 focus:border-indigo-500 outline-none transition-all font-bold text-xs text-white"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="group relative w-full py-4 bg-indigo-600 rounded-2xl font-black text-base overflow-hidden transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {status === AuthStatus.PROFILE_SETUP ? "Initialize Studio" : "Verify Protocol"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {status === AuthStatus.SIGN_UP && (
            <p className="mt-8 text-center text-[9px] font-black uppercase tracking-widest text-gray-600">
              By continuing, you agree to the <span className="text-gray-400">Vibe Master License</span>
            </p>
          )}
        </div>
        
        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-center gap-1.5 opacity-20 hover:opacity-100 transition-opacity grayscale cursor-default">
           <Sparkles size={14} className="text-indigo-400" />
           <span className="text-[9px] font-black tracking-[0.4em] uppercase">Secure Hash Active</span>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
