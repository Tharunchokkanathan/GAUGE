import React from 'react';
import { Home, Compass, CalendarDays, History, User } from 'lucide-react';
import type { Route } from '../../types';

interface BottomNavProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentRoute, onNavigate }) => {
  const tabs = [
    { id: 'dashboard' as Route, label: 'Home', icon: Home },
    { id: 'generator' as Route, label: 'Generate', icon: Compass },
    { id: 'plan' as Route, label: 'Plan', icon: CalendarDays },
    { id: 'history' as Route, label: 'History', icon: History },
    { id: 'profile' as Route, label: 'Profile', icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-800/80 px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[11px] font-semibold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
