
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, Send, Terminal as TerminalIcon, ChevronDown, 
  X, Layout, FileCode, Plus, RefreshCw, Terminal, 
  ChevronRight, Folder, Play, Eye,
  Box, FilePlus, FolderPlus, Bot, Monitor,
  LayoutGrid, Trash2, Save, FileText, Settings as SettingsIcon,
  Search, BookOpen
} from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";
import Prism from 'prismjs';

// Language support
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; 
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';

import { useAuth } from '../App';
import { FileNode, Project } from '../types';

interface Tab {
  fileId: string;
  projectId: string;
  name: string;
  language: string;
}

const Editor: React.FC = () => {
  const { user, activeProjectId, updateProject, setIsSidebarHidden } = useAuth();
  const isLight = user?.settings.isLightMode;
  const settings = user?.settings || { fontSize: 13, theme: 'slate', fontFamily: 'Fira Code', autoFormat: true, aiAutocompletion: true, isLightMode: true };
  
  // Workspace State
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null); // fileId
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [activeLine, setActiveLine] = useState(0);
  
  // UI State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSidePreviewOpen, setIsSidePreviewOpen] = useState(false);
  const [liveCode, setLiveCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<{role: 'user'|'agent', content: string, id: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Terminal State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<{msg: string, type: 'info'|'error'|'success'|'output'}[]>([
    { msg: 'VibeOS Kernel initialized...', type: 'info' }
  ]);
  const [activeChatSession, setActiveChatSession] = useState<Chat | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const aiScrollRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const LINE_HEIGHT_EM = 1.65;
  const PADDING_PX = 32;

  // Auto-collapse sidebar on mount
  useEffect(() => {
    setIsSidebarHidden(true);
    return () => setIsSidebarHidden(false);
  }, [setIsSidebarHidden]);

  // Sync editor content with active tab
  useEffect(() => {
    if (!activeTabId) {
      setCode('');
      return;
    }
    const currentTab = openTabs.find(t => t.fileId === activeTabId);
    if (!currentTab) return;

    const proj = user?.projects.find(p => p.id === currentTab.projectId);
    if (!proj) return;

    const findFile = (nodes: FileNode[], id: string): FileNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findFile(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(proj.files || [], activeTabId);
    if (file) {
      setCode(file.content || '');
      setLanguage(file.language || 'typescript');
    }
  }, [activeTabId, openTabs, user?.projects]);

  // Debounced Live Preview
  useEffect(() => {
    if (!isSidePreviewOpen) return;
    const timeout = setTimeout(() => setLiveCode(code), 400);
    return () => clearTimeout(timeout);
  }, [code, isSidePreviewOpen]);

  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
  }, [terminalLogs]);

  // File System Helpers
  const findProjectOfFile = (fileId: string): Project | undefined => {
    return user?.projects.find(p => {
      const search = (nodes: FileNode[]): boolean => {
        for (const n of nodes) {
          if (n.id === fileId) return true;
          if (n.children && search(n.children)) return true;
        }
        return false;
      };
      return search(p.files || []);
    });
  };

  const handleOpenFile = (file: FileNode, projectId: string) => {
    if (file.type === 'folder') {
      toggleFolder(file.id);
      return;
    }
    if (!openTabs.find(t => t.fileId === file.id)) {
      setOpenTabs(prev => [...prev, {
        fileId: file.id,
        projectId,
        name: file.name,
        language: file.language || 'typescript'
      }]);
    }
    setActiveTabId(file.id);
  };

  const closeTab = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t.fileId !== fileId);
    setOpenTabs(newTabs);
    if (activeTabId === fileId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].fileId : null);
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    const currentTab = openTabs.find(t => t.fileId === activeTabId);
    if (currentTab) {
      const proj = user?.projects.find(p => p.id === currentTab.projectId);
      if (proj) {
        const recursiveUpdate = (nodes: FileNode[]): FileNode[] => nodes.map(n => 
          n.id === activeTabId ? { ...n, content: val } : (n.children ? { ...n, children: recursiveUpdate(n.children) } : n)
        );
        const newFiles = recursiveUpdate(proj.files || []);
        updateProject(proj.id, { files: newFiles });
      }
    }
    updateActiveLine(e.target);
  };

  const updateActiveLine = (textarea: HTMLTextAreaElement) => {
    const textBefore = textarea.value.substring(0, textarea.selectionStart);
    const lineIndex = textBefore.split('\n').length - 1;
    setActiveLine(lineIndex);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
  };

  const handleRun = async () => {
    if (!activeTabId) return;
    setIsRunning(true);
    setIsConsoleOpen(true);
    setTerminalLogs(prev => [...prev, { msg: `Vibe-Runner: Executing active unit...`, type: 'info' }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are a stateful code execution kernel. Act as an interpreter for ${language}. Output only STDOUT. If input is needed, print the prompt and stop. No explanations.`
        }
      });
      setActiveChatSession(chat);
      const response = await chat.sendMessage({ message: `SOURCE:\n${code}` });
      setTerminalLogs(prev => [...prev, { msg: response.text || "", type: 'output' }]);
    } catch (err) {
      setTerminalLogs(prev => [...prev, { msg: "Runtime Error: Execution failed.", type: 'error' }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTerminalCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const input = terminalInput.trim();
      setTerminalLogs(prev => [...prev, { msg: `${activeChatSession ? '> ' : '$ '}${input}`, type: 'info' }]);
      setTerminalInput('');

      if (activeChatSession) {
        try {
          const response = await activeChatSession.sendMessage({ message: input });
          setTerminalLogs(prev => [...prev, { msg: response.text || "", type: 'output' }]);
        } catch {
          setTerminalLogs(prev => [...prev, { msg: "Process Error.", type: 'error' }]);
          setActiveChatSession(null);
        }
        return;
      }
      
      if (input === 'clear') setTerminalLogs([]);
      else setTerminalLogs(prev => [...prev, { msg: `sh: command not found: ${input}`, type: 'error' }]);
    }
  };

  const renderFileNode = (node: FileNode, projectId: string, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isActive = activeTabId === node.id;

    if (node.type === 'folder') {
      return (
        <div key={node.id}>
          <div 
            className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer hover:bg-sky-500/5 transition-colors group`}
            style={{ paddingLeft: `${depth * 12 + 16}px` }}
            onClick={() => toggleFolder(node.id)}
          >
            <ChevronRight size={12} className={`transition-transform opacity-30 ${isExpanded ? 'rotate-90' : ''}`} />
            <Folder size={14} className="text-sky-500/60" />
            <span className="text-[11px] font-bold truncate tracking-tight text-[var(--text-muted)] group-hover:text-[var(--text-main)]">{node.name}</span>
          </div>
          {isExpanded && node.children?.map(child => renderFileNode(child, projectId, depth + 1))}
        </div>
      );
    }

    return (
      <div 
        key={node.id}
        className={`flex items-center gap-2 px-4 py-1.5 cursor-pointer transition-all relative group ${isActive ? 'bg-sky-500/10 text-sky-600' : 'text-[var(--text-muted)] hover:bg-sky-500/5 hover:text-[var(--text-main)]'}`}
        style={{ paddingLeft: `${depth * 12 + 28}px` }}
        onClick={() => handleOpenFile(node, projectId)}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500"></div>}
        <FileCode size={14} className={isActive ? 'text-sky-500' : 'opacity-30'} />
        <span className="text-[11px] font-bold truncate tracking-tight">{node.name}</span>
      </div>
    );
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  const highlightedCode = useMemo(() => {
    const lang = Prism.languages[language] || Prism.languages.javascript;
    return Prism.highlight(code + (code.endsWith('\n') ? ' ' : ''), lang, language);
  }, [code, language]);

  const editorStyles: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: settings.fontFamily,
    lineHeight: LINE_HEIGHT_EM,
    padding: `${PADDING_PX}px`,
    tabSize: 2,
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-deep)] overflow-hidden font-sans">
      {/* Header */}
      <div className="h-12 bg-[var(--panel-bg)] border-b border-[var(--border-color)] flex items-center px-4 justify-between shrink-0 z-30 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowFileTree(!showFileTree)} className={`p-2 rounded-lg ${showFileTree ? 'text-sky-500 bg-sky-500/5' : 'text-[var(--text-muted)]'}`}>
            <Layout size={16} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-lg">
             <span className="text-[9px] font-black uppercase tracking-widest text-sky-500">Workspace</span>
             <ChevronRight size={10} className="opacity-20" />
             <span className="text-[9px] font-bold text-[var(--text-main)] uppercase tracking-wider">Multiproject_Feed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleRun} disabled={isRunning || !activeTabId} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
             {isRunning ? <RefreshCw className="animate-spin" size={12} /> : <Play size={12} />} Run
           </button>
           <button onClick={() => setIsAiOpen(!isAiOpen)} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isAiOpen ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-sky-600 border-sky-100'}`}>
             <Sparkles size={12} /> Assist
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Multi-Project Explorer */}
        {showFileTree && (
          <div className="w-64 bg-[var(--panel-bg)] border-r border-[var(--border-color)] flex flex-col shrink-0 animate-slide-right overflow-hidden shadow-xl z-20">
            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-black/5">
               <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">Projects</span>
               <button onClick={() => setIsSidebarHidden(false)} className="p-1 hover:text-sky-500 transition-colors"><LayoutGrid size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
              {user?.projects.map(project => (
                <div key={project.id} className="mb-2">
                  <div 
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-sky-500/5 border-l-2 border-transparent"
                    onClick={() => toggleFolder(project.id)}
                  >
                    <ChevronRight size={12} className={`transition-transform opacity-30 ${expandedFolders.has(project.id) ? 'rotate-90' : ''}`} />
                    <Box size={14} className="text-indigo-500" />
                    <span className="text-[11px] font-black uppercase tracking-tight text-[var(--text-main)]">{project.name}</span>
                  </div>
                  {expandedFolders.has(project.id) && (
                    <div className="mt-1">
                      {project.files?.map(f => renderFileNode(f, project.id, 1))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-deep)]">
          {/* Tabs Bar */}
          <div className="h-10 border-b border-[var(--border-color)] flex bg-black/5 overflow-x-auto no-scrollbar shrink-0">
            {openTabs.map(tab => (
              <button 
                key={tab.fileId} 
                onClick={() => setActiveTabId(tab.fileId)}
                className={`px-4 h-full flex items-center gap-3 border-r border-[var(--border-color)] transition-all relative ${activeTabId === tab.fileId ? 'bg-[var(--bg-deep)] text-sky-600' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
              >
                <FileCode size={12} />
                <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">{tab.name}</span>
                <X size={12} className="opacity-40 hover:opacity-100 p-0.5" onClick={(e) => closeTab(e, tab.fileId)} />
                {activeTabId === tab.fileId && <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500"></div>}
              </button>
            ))}
            {openTabs.length === 0 && (
              <div className="flex-1 flex items-center px-6 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-20">
                No active units
              </div>
            )}
          </div>

          <div className={`flex-1 relative flex overflow-hidden ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
            {!activeTabId ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-4">
                 <FileText size={64} />
                 <span className="text-xs font-black uppercase tracking-widest">Select logic node to architect</span>
              </div>
            ) : (
              <div className="flex-1 flex">
                <div 
                  ref={gutterRef}
                  className={`w-12 flex flex-col items-end pt-[${PADDING_PX}px] pb-40 px-3 select-none overflow-hidden shrink-0 border-r ${isLight ? 'bg-slate-50 text-slate-300' : 'bg-black/20 text-slate-600'}`}
                  style={{ ...editorStyles, padding: `${PADDING_PX}px 0` }}
                >
                  {lineNumbers.map((n, idx) => (
                    <div key={n} className={`h-[${LINE_HEIGHT_EM}em] flex items-center justify-end ${activeLine === idx ? 'font-black text-sky-500' : ''}`}>{n}</div>
                  ))}
                </div>

                <div className="flex-1 relative overflow-hidden">
                   <pre ref={highlightRef} className="absolute inset-0 bg-transparent overflow-auto pointer-events-none no-scrollbar m-0 z-[1] whitespace-pre" style={editorStyles}>
                     <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                   </pre>
                   <textarea 
                     ref={textareaRef} 
                     className="absolute inset-0 w-full h-full bg-transparent outline-none resize-none z-10 text-transparent caret-sky-500 selection:bg-sky-500/20 m-0 whitespace-pre overflow-auto scrollbar-thin" 
                     style={editorStyles}
                     value={code}
                     onChange={handleTextChange}
                     onScroll={handleScroll}
                     onKeyUp={(e) => updateActiveLine(e.currentTarget)}
                     onClick={(e) => updateActiveLine(e.currentTarget)}
                     spellCheck={false}
                   />
                </div>
              </div>
            )}

            {isSidePreviewOpen && (
              <div className="w-1/2 border-l border-[var(--border-color)] flex flex-col bg-white z-40 animate-slide-left">
                <div className="h-10 bg-slate-900 flex items-center justify-between px-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Monitor size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Live Output</span>
                  </div>
                  <button onClick={() => setIsSidePreviewOpen(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
                </div>
                <iframe className="flex-1 w-full border-none" srcDoc={liveCode} title="Preview" />
              </div>
            )}
          </div>

          {/* Bottom Terminal */}
          <div className={`transition-all duration-300 flex flex-col border-t ${isLight ? 'bg-white border-slate-200' : 'bg-[#0f172a] border-white/5'} ${isConsoleOpen ? 'h-64' : 'h-10'}`}>
            <div className={`h-10 px-5 border-b flex items-center justify-between shrink-0 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`} onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
              <div className="flex items-center gap-3">
                <TerminalIcon size={14} className="text-sky-400" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Vibe_Terminal</span>
              </div>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isConsoleOpen ? 'rotate-180' : ''}`} />
            </div>
            {isConsoleOpen && (
              <div className={`flex-1 flex flex-col overflow-hidden ${isLight ? 'bg-white' : 'bg-[#020617]'}`}>
                <div ref={terminalRef} className="flex-1 p-5 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`flex gap-3 animate-fade-in ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-500' : (isLight ? 'text-slate-900' : 'text-slate-100')}`}>
                      <span className="opacity-20 shrink-0">[{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}]</span>
                      <span className="whitespace-pre-wrap">{log.msg}</span>
                    </div>
                  ))}
                </div>
                <div className={`h-10 border-t flex items-center px-4 gap-3 bg-black/5`}>
                   <span className="text-sky-400 font-black text-[10px] uppercase">{user?.username || 'op'}@vibe {activeChatSession ? '>' : '$'}</span>
                   <input className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] placeholder:opacity-30" placeholder="Type command..." value={terminalInput} onChange={e => setTerminalInput(e.target.value)} onKeyDown={handleTerminalCommand} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        {isAiOpen && (
          <div className="w-80 md:w-96 bg-[var(--panel-bg)] border-l border-[var(--border-color)] flex flex-col shrink-0 animate-slide-left z-20 shadow-2xl">
            <div className="h-12 px-6 border-b border-[var(--border-color)] flex items-center justify-between shrink-0 bg-black/5">
               <div className="flex items-center gap-2">
                 <Sparkles size={14} className="text-sky-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Neural Assist</span>
               </div>
               <button onClick={() => setIsAiOpen(false)} className="p-1.5 hover:bg-black/5 rounded-lg transition-all"><X size={16} /></button>
            </div>
            <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
               {aiChat.map((msg, i) => (
                 <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
                    <div className={`p-4 rounded-2xl border text-[11px] ${msg.role === 'user' ? 'bg-sky-600 text-white border-sky-500' : 'bg-white border-black/5'}`}>
                       {msg.content}
                    </div>
                 </div>
               ))}
               {isAiLoading && <div className="animate-pulse flex space-x-2"><div className="w-2 h-2 bg-sky-500 rounded-full"></div><div className="w-2 h-2 bg-sky-500 rounded-full delay-75"></div></div>}
            </div>
            <div className="p-4 border-t border-[var(--border-color)] bg-black/5">
               <form onSubmit={(e) => { e.preventDefault(); /* Ask AI logic */ }} className="relative">
                  <input type="text" placeholder="Instruct..." className="w-full bg-[var(--bg-deep)] border border-[var(--border-color)] rounded-2xl py-3 px-4 text-[11px] font-bold outline-none shadow-inner" value={aiInput} onChange={e => setAiInput(e.target.value)} />
                  <button type="submit" className="absolute right-2 top-1.5 w-8 h-8 bg-sky-600 text-white rounded-xl flex items-center justify-center transition-all active:scale-90"><Send size={16} /></button>
               </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
