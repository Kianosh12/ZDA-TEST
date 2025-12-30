import React from 'react';
import { Activity, BookOpen, FileText, Layers, Radio } from './Icons';
import { AgentState } from '../types';

interface SidebarProps {
  currentView: AgentState['activeView'];
  setView: (view: AgentState['activeView']) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'داشبورد', icon: <Activity className="w-5 h-5" /> },
    { id: 'monitor', label: 'پایش خودکار (Live)', icon: <Radio className="w-5 h-5 text-red-400" /> },
    { id: 'knowledge', label: 'پایگاه دانش', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'analysis', label: 'طراحی سناریو', icon: <Layers className="w-5 h-5" /> },
    { id: 'report', label: 'گزارش‌دهی', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-zld-card border-l border-slate-700 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0 md:static
      `}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-zld-primary flex items-center gap-2">
            <span className="bg-zld-primary/20 p-2 rounded-lg">ZLD</span>
            Agent
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as AgentState['activeView']);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${currentView === item.id 
                  ? 'bg-zld-primary text-white shadow-lg shadow-zld-primary/25' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-slate-400">سیستم آنلاین است</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;