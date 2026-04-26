import { Menu, Moon, Sun } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onThemeToggle: () => void;
  onMenuToggle: () => void;
}

import { cn } from '../lib/utils';

export function Header({ theme, onThemeToggle, onMenuToggle }: HeaderProps) {
  const isDark = theme === 'dark';
  
  return (
    <header className={cn(
      "h-16 flex items-center justify-between px-6 border-b transition-colors duration-300 shrink-0 z-50 backdrop-blur-md",
      isDark ? "border-blue-500/20 bg-slate-900/40" : "border-slate-200 bg-white/70"
    )}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className={cn(
              "p-2 border rounded-lg transition-colors cursor-pointer",
              isDark ? "bg-slate-900/50 border-blue-500/20 hover:bg-blue-500/20" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
            )}
          >
            <Menu size={20} className={isDark ? "text-blue-400" : "text-blue-600"} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-4 h-4 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className={cn(
                "text-lg font-black tracking-tighter uppercase italic",
                isDark ? "text-white" : "text-slate-900"
              )}>
                SAU GEOSPATIAL COMMAND
              </h1>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  Sector Active | Nodes Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className={cn(
          "hidden md:flex items-center gap-8 font-mono text-[11px]",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>
          <div className="flex flex-col items-end">
            <span className="text-blue-600 text-[9px] font-bold tracking-widest">SYSTEM TIME</span>
            <span className={cn(
              "tracking-widest uppercase",
              isDark ? "text-white" : "text-slate-900"
            )}>{new Date().toLocaleTimeString('en-US', { hour12: false })} UTC</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-blue-600 text-[9px] font-bold tracking-widest">OPERATOR</span>
            <span className={cn(
              "uppercase font-black text-[10px]",
              isDark ? "text-white" : "text-slate-900"
            )}>ADMIN-09</span>
          </div>
        </div>
        
        <button 
          onClick={onThemeToggle}
          className={cn(
            "p-2 border rounded-lg transition-all ml-4 cursor-pointer",
            isDark ? "bg-slate-900/50 border-blue-500/20 hover:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
          )}
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
