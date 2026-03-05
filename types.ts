
export enum AuthStatus {
  IDLE = 'IDLE',
  SIGN_UP = 'SIGN_UP',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  PROFILE_SETUP = 'PROFILE_SETUP',
  LOGGED_IN = 'LOGGED_IN'
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  lastModified: string;
  status: 'active' | 'archived' | 'published';
  stats: {
    commits: number;
    lines: number;
    hours: number;
  };
  files?: FileNode[]; // Added for persistence
}

export interface EditorSettings {
  fontSize: number;
  theme: 'midnight' | 'neon' | 'obsidian' | 'slate' | 'crimson' | 'emerald' | 'cyberpunk' | 'amethyst';
  fontFamily: string;
  autoFormat: boolean;
  aiAutocompletion: boolean;
  isLightMode: boolean; // Added for light/dark toggle
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  githubConnected: boolean;
  projects: Project[];
  settings: EditorSettings; // Added for persistence
}

export interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  stars: number;
  updatedAt: string;
}
