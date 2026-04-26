/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapCanvas } from './components/MapCanvas';
import { GeoNode, Theme } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GeoNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ node: GeoNode; x: number; y: number } | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('light');
  };

  const handleHover = useCallback((node: GeoNode | null, x: number, y: number) => {
    if (node) {
      setHoveredNode({ node, x, y });
    } else {
      setHoveredNode(null);
    }
  }, []);

  return (
    <div className={cn(
      "flex flex-col h-screen w-full font-sans overflow-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      <Header 
        theme={theme} 
        onThemeToggle={toggleTheme} 
        onMenuToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      <div className="flex flex-1 overflow-hidden relative w-full h-full">
        <Sidebar 
          theme={theme}
          collapsed={isSidebarCollapsed} 
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />

        <main className="flex-1 relative overflow-hidden h-full flex flex-col">
          <MapCanvas 
            theme={theme}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onHoverNode={handleHover}
          />

          {/* Anomaly Overlay (Theme extra) */}
          <div className="absolute top-8 right-8 w-64 pointer-events-none z-10">
            <div className={cn(
              "p-4 backdrop-blur border rounded-lg shadow-2xl animate-in fade-in duration-1000",
              theme === 'dark' 
                ? "bg-slate-950/80 border-red-500/20" 
                : "bg-white/80 border-red-500/30 shadow-red-500/5"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Monitoring</span>
              </div>
              <p className={cn(
                "text-[11px] leading-relaxed mb-3",
                theme === 'dark' ? "text-slate-300" : "text-slate-600"
              )}>
                Geospatial parity maintained. Analyzing sector stability.
              </p>
              <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[85%]"></div>
              </div>
            </div>
          </div>
        </main>

        {/* Global Tooltip */}
        {hoveredNode && (
          <div 
            className={cn(
              "fixed pointer-events-none px-3 py-1.5 rounded border text-[10px] font-mono z-[100] shadow-2xl backdrop-blur-md transition-opacity duration-200",
              theme === 'dark' 
                ? "bg-black/90 text-white border-blue-500/30" 
                : "bg-white/95 text-slate-900 border-blue-500/20"
            )}
            style={{ 
              left: hoveredNode.x + 15, 
              top: hoveredNode.y + 15,
            }}
          >
            <span className="text-blue-500 mr-2">NODE_ID:</span>
            {hoveredNode.node.name} 
          </div>
        )}
      </div>

      {/* Bottom Metadata Strip */}
      <footer className={cn(
        "h-10 border-t flex items-center justify-between px-6 shrink-0 z-50 transition-colors duration-300",
        theme === 'dark' ? "border-blue-500/10 bg-black text-slate-600" : "border-slate-200 bg-slate-100 text-slate-500"
      )}>
        <div className="flex gap-6 text-[9px] font-mono tracking-widest text-slate-600">
          <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500"></span> LINK_STABLE</span>
          <span>ENCRYPTION: AES_256_ACTIVE</span>
          <span>MAPPING_REFINED: TRUE</span>
        </div>
        <div className="text-[9px] font-mono text-slate-600 uppercase">
          &copy; SAU DEFENSE COMMAND - GEOSPATIAL DIVISION V4.2
        </div>
      </footer>
    </div>
  );
}

