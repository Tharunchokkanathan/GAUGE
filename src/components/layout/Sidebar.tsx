import React from 'react';
import { 
  UtensilsCrossed, 
  Compass, 
  CalendarDays, 
  History, 
  Heart, 
  User, 
  LogIn, 
  Sparkles, 
  SlidersHorizontal,
  Home
} from 'lucide-react';
import type { Route } from '../../types';

interface SidebarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  userEmail = 'tharun@example.com'
}) => {
  const mainNavItems = [
    { id: 'dashboard' as Route, label: 'Dashboard', icon: Home },
    { id: 'generator' as Route, label: 'Meal Generator', icon: Compass, badge: 'Targeted' },
    { id: 'plan' as Route, label: 'Daily Plan', icon: CalendarDays },
    { id: 'history' as Route, label: 'History & Trends', icon: History },
    { id: 'favorites' as Route, label: 'Favorites', icon: Heart },
    { id: 'onboarding' as Route, label: 'Macro Setup', icon: SlidersHorizontal }
  ];

  const authNavItems = [
    { id: 'landing' as Route, label: 'Landing Page', icon: Sparkles },
    { id: 'login' as Route, label: 'Sign In / Account', icon: LogIn },
    { id: 'profile' as Route, label: 'My Profile', icon: User }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-800/80 sticky top-0 h-screen p-5 shrink-0 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20 shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            GAUGE <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRO</span>
          </h2>
          <p className="text-[11px] text-slate-400">South Indian Nutrition</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
            Navigation
          </span>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 block mb-2">
            Account & Pages
          </span>
          {authNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer User Box */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => onNavigate('profile')}
          className="w-full glass-card p-3 rounded-xl flex items-center gap-3 hover:border-emerald-500/30 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center text-xs">
            TK
          </div>
          <div className="text-left overflow-hidden">
            <span className="text-xs font-bold text-white block truncate">Tharun Kumar</span>
            <span className="text-[10px] text-slate-400 block truncate">{userEmail}</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
