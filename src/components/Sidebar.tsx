import { motion, AnimatePresence } from 'motion/react';
import { GeoNode, CoreHub, Theme } from '../types';
import { ALL_NODES, CORES } from '../constants';
import { cn } from '../lib/utils';

interface SidebarProps {
  theme: Theme;
  collapsed: boolean;
  selectedNode: GeoNode | null;
  onSelectNode: (node: GeoNode) => void;
}

export function Sidebar({ theme, collapsed, selectedNode, onSelectNode }: SidebarProps) {
  const core = selectedNode ? CORES[selectedNode.core] : null;

  const states = ALL_NODES.filter(n => n.type === 'state');
  const uts = ALL_NODES.filter(n => n.type === 'ut');

  const renderList = (nodes: GeoNode[], title: string) => (
    <div className="mb-6">
      <h3 className={cn(
        "text-[9px] font-bold uppercase tracking-[0.2em] mb-2 px-3",
        theme === 'dark' ? "text-slate-600" : "text-slate-400"
      )}>
        {title}
      </h3>
      <div className="space-y-0.5">
        {nodes.map((node) => {
          const isSelected = selectedNode?.name === node.name;
          return (
            <button
              key={node.name}
              onClick={() => onSelectNode(node)}
              className={cn(
                "w-full p-1.5 px-3 rounded flex justify-between items-center group cursor-pointer transition-all border text-left",
                isSelected 
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                  : cn(
                      "bg-transparent border-transparent hover:bg-white/5",
                      theme === 'dark' ? "text-slate-400" : "text-slate-600 hover:bg-slate-200/50"
                    )
              )}
            >
              <span className="text-[11px] font-medium truncate mr-2">{node.name}</span>
              {isSelected ? (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
              ) : (
                <span className="text-[8px] opacity-0 group-hover:opacity-40 font-mono uppercase shrink-0">
                  {node.core.slice(0, 2)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className={cn(
            "h-full border-r overflow-hidden flex flex-col backdrop-blur-md z-40 shrink-0 transition-colors duration-300",
            theme === 'dark' ? "border-blue-500/10 bg-slate-950/80" : "border-slate-200 bg-slate-50/90"
          )}
        >
          <div className="p-4 overflow-hidden flex flex-col h-full">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  theme === 'dark' ? "text-slate-500" : "text-slate-400"
                )}>
                  Theater Registry
                </h2>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500/50"></div>
                  <div className="w-1 h-1 rounded-full bg-blue-500/30"></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {renderList(states, "Administrative States")}
                {renderList(uts, "Federal Territories")}
              </div>
            </div>

            <div className={cn(
              "mt-auto pt-4 border-t",
              theme === 'dark' ? "border-blue-500/10" : "border-slate-200"
            )}>
              <div className={cn(
                "p-4 rounded-xl border min-h-[180px] transition-all",
                theme === 'dark' ? "bg-blue-500/5 border-blue-500/20" : "bg-white border-slate-200 shadow-sm"
              )}>
                {selectedNode ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={selectedNode.name}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={cn(
                          "text-base font-black leading-tight tracking-tight uppercase italic",
                          theme === 'dark' ? "text-white" : "text-slate-900"
                        )}>
                          {selectedNode.name}
                        </h3>
                        <span className="text-[9px] text-blue-500 uppercase tracking-widest font-mono font-bold">
                          {selectedNode.type === 'ut' ? 'FEDERAL_DIRECT' : 'REGIONAL_UNIT'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={cn(
                          "w-7 h-7 rounded-lg border flex items-center justify-center font-mono text-[10px] font-bold",
                          theme === 'dark' ? "border-blue-400/30 text-blue-400" : "border-blue-500/20 text-blue-600"
                        )}>
                          {selectedNode.core.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 font-mono text-[9px] mb-4">
                      <div className={cn(
                        "p-2 rounded border",
                        theme === 'dark' ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-100"
                      )}>
                        <span className="block opacity-40 mb-1">LATITUDE</span>
                        <span className={theme === 'dark' ? "text-white" : "text-slate-900"}>{selectedNode.coords[1].toFixed(4)} N</span>
                      </div>
                      <div className={cn(
                        "p-2 rounded border",
                        theme === 'dark' ? "bg-black/30 border-white/5" : "bg-slate-50 border-slate-100"
                      )}>
                        <span className="block opacity-40 mb-1">LONGITUDE</span>
                        <span className={theme === 'dark' ? "text-white" : "text-slate-900"}>{selectedNode.coords[0].toFixed(4)} E</span>
                      </div>
                    </div>
                    
                    <button className="w-full py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer">
                      Node Uplink
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-6 opacity-40">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest block">Signal Lost</span>
                      <p className="text-[8px] uppercase">Select Sector for Scan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
