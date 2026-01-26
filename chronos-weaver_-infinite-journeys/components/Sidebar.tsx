
import React from 'react';

interface SidebarProps {
  inventory: string[];
  currentQuest: string;
  location: string;
}

const Sidebar: React.FC<SidebarProps> = ({ inventory, currentQuest, location }) => {
  return (
    <aside className="w-80 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center">
          <i className="fas fa-map-marker-alt mr-2"></i> Current Domain
        </h2>
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
          <p className="text-slate-200 font-medium heading-font">{location || 'The Void'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center">
          <i className="fas fa-scroll mr-2"></i> Active Quest
        </h2>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "{currentQuest || 'Find your path through the darkness...'}"
          </p>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center">
          <i className="fas fa-briefcase mr-2"></i> Inventory
        </h2>
        <div className="space-y-2">
          {inventory.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Your pockets are empty.</p>
          ) : (
            inventory.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center p-2 bg-slate-800/30 rounded border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                <i className="fas fa-dot-circle text-[6px] text-amber-500 mr-3"></i>
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">
          Chronos Weaver v1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
