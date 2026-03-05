
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  X, 
  Copy, 
  Check, 
  ChevronRight, 
  Terminal, 
  Cpu, 
  Braces, 
  Zap,
  MessageSquare,
  History,
  Lightbulb,
  Layers,
  FilePlus,
  Plus
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Prism from 'prismjs';
import { useAuth } from '../App';
import { FileNode } from '../types';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface TypingContentProps {
  content: string;
  onComplete: () => void;
  onInsertCode?: (code: string) => void;
  onNewFile?: (code: string, lang: string) => void;
}

const TypingContent: React.FC<TypingContentProps> = ({ content, onComplete, onInsertCode, onNewFile }) => {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= content.length) {
        setDisplayed(content.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 10);
    return () => clearInterval(interval);
  }, [content, onComplete]);

  return (
    <div className="space-y-5">
      {displayed.split('```').map((part, i) => {
        if (i % 2 === 1) {
          const lines = part.trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 15;
          const lang = hasLang ? firstLine : 'typescript';
          const code = hasLang ? lines.slice(1).join('\n') : part.trim();

          return (
            <div key={i} className="relative group my-4">
              <div className="flex items-center justify-between mb-1">
                <div className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                  {lang}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onInsertCode?.(code)}
                    title="Add to Cursor"
                    className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white rounded-md transition-all border border-sky-500/20"
                  >
                    <Plus size={10} />
                  </button>
                  <button 
                    onClick={() => onNewFile?.(code, lang)}
                    title="Enter in New File"
                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-md transition-all border border-emerald-500/20"
                  >
                    <FilePlus size={10} />
                  </button>
                </div>
              </div>
              <pre className="language-typescript !bg-black/10 !p-5 !rounded-xl !border !border-black/5 text-[11px] leading-relaxed overflow-x-auto relative">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return <p key={i} className="text-[12.5px] font-medium leading-relaxed whitespace-pre-wrap">{part}</p>;
      })}
      {displayed.length < content.length && <span className="cursor-blink">|</span>}
    </div>
  );
};

const Agent: React.FC = () => {
  const { user, activeProjectId, updateProject } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: "Neural core online. v3.1 ready. How can I architect your next sprint?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    Prism.highlightAll();
  }, [messages]);

  const handleAiNewFile = (generatedCode: string, lang: string) => {
    if (!user || !activeProjectId) {
      alert("Please initialize a project from the Console before creating files via Agent.");
      return;
    }
    const extMap: Record<string, string> = {
      typescript: 'ts', javascript: 'js', rust: 'rs', python: 'py',
      go: 'go', html: 'html', css: 'css', json: 'json', markdown: 'md'
    };
    const ext = extMap[lang] || 'txt';
    const name = prompt("Enter filename for generated node:", `agent_snippet.${ext}`);
    if (!name) return;

    const newFile: FileNode = {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      type: 'file',
      content: generatedCode,
      language: lang
    };
    
    const activeProject = user.projects.find(p => p.id === activeProjectId);
    if (!activeProject) return;

    const newFiles = [...(activeProject.files || []), newFile];
    updateProject(activeProjectId, { files: newFiles });
    alert(`Node '${name}' synchronized to the current workspace.`);
  };

  const handleAiInsertCode = (generatedCode: string) => {
    // For Agent page, we just copy to clipboard as it's not a direct editor view
    navigator.clipboard.writeText(generatedCode);
    alert("Snippet copied to matrix buffer. Switch to Editor to inject.");
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: 'Vibe Agent. Engineering assistant. Concise markdown snippets.'
        }
      });

      const agentMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'agent',
        content: response.text || "Neural connection interrupted.",
        timestamp: new Date(),
        isTyping: true
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'agent',
        content: "Error: Sync failure.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const markTypingComplete = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isTyping: false } : m));
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-deep)] text-[var(--text-main)] relative overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 shrink-0 bg-[var(--panel-bg)] backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center shadow-lg shadow-sky-600/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight text-[var(--text-main)] uppercase tracking-widest">Neural Agent</h2>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[8.5px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMessages([messages[0]])} className="p-2.5 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-lg text-[var(--text-muted)] hover:text-sky-600 transition-all">
            <RotateCcw size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-xl text-[9.5px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-sky-600">
            <History size={14} /> Log
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`max-w-3xl flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border-color)] ${msg.role === 'agent' ? 'bg-sky-600/10 text-sky-600 shadow-sm' : 'bg-white shadow-sm text-[var(--text-muted)]'}`}>
                {msg.role === 'agent' ? <Bot size={20} /> : <Terminal size={18} />}
              </div>
              <div className={`space-y-2 pt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`p-5 rounded-2xl border ${msg.role === 'agent' ? 'bg-[var(--panel-bg)] border-[var(--border-color)] text-[var(--text-main)] shadow-sm' : 'bg-sky-600 text-white border-sky-500 shadow-xl shadow-sky-600/10'}`}>
                  {msg.role === 'agent' && msg.isTyping ? (
                    <TypingContent 
                      content={msg.content} 
                      onComplete={() => markTypingComplete(msg.id)} 
                      onInsertCode={handleAiInsertCode}
                      onNewFile={handleAiNewFile}
                    />
                  ) : msg.role === 'agent' ? (
                    <div className="space-y-5">
                      {msg.content.split('```').map((part, i) => {
                        if (i % 2 === 1) {
                          const lines = part.trim().split('\n');
                          const firstLine = lines[0].trim();
                          const hasLang = firstLine && !firstLine.includes(' ') && firstLine.length < 15;
                          const lang = hasLang ? firstLine : 'typescript';
                          const code = hasLang ? lines.slice(1).join('\n') : part.trim();

                          return (
                            <div key={i} className="relative group my-4">
                              <div className="flex items-center justify-between mb-1">
                                <div className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                                  {lang}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleAiInsertCode(code)}
                                    title="Add to Cursor"
                                    className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white rounded-md transition-all border border-sky-500/20"
                                  >
                                    <Plus size={10} />
                                  </button>
                                  <button 
                                    onClick={() => handleAiNewFile(code, lang)}
                                    title="Enter in New File"
                                    className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-md transition-all border border-emerald-500/20"
                                  >
                                    <FilePlus size={10} />
                                  </button>
                                </div>
                              </div>
                              <pre className="language-typescript !bg-black/5 !p-5 !rounded-xl !border !border-black/5 text-[11px] leading-relaxed overflow-x-auto relative">
                                <code>{code}</code>
                              </pre>
                            </div>
                          );
                        }
                        return <p key={i} className="text-[12.5px] font-medium leading-relaxed whitespace-pre-wrap">{part}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-[12.5px] font-bold tracking-tight leading-relaxed">{msg.content}</p>
                  )}
                </div>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
             <div className="p-4 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-xl">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-8 shrink-0 relative z-30">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative group">
          <div className="relative bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-3xl p-2 flex items-center shadow-xl">
             <input 
               type="text" 
               placeholder="Instruct Vibe_Agent..." 
               className="flex-1 bg-transparent border-none outline-none py-4 px-6 text-sm font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] tracking-tight"
               value={input}
               onChange={(e) => setInput(e.target.value)}
             />
             <button 
               type="submit"
               disabled={loading || !input.trim()}
               className="w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-50 shadow-lg"
             >
               <Send size={20} />
             </button>
          </div>
        </form>
        <div className="mt-5 flex items-center justify-center gap-8">
           {[
             { label: 'Optimize', icon: Cpu },
             { label: 'Architect', icon: Layers },
             { label: 'Debug', icon: Braces }
           ].map((action, i) => (
             <button 
               key={i} 
               onClick={() => setInput(action.label)}
               className="flex items-center gap-2 text-[9.5px] font-black uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-sky-600 transition-colors"
             >
               <action.icon size={12} /> {action.label}
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Agent;
