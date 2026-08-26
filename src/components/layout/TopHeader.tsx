import React from 'react';
import { UtensilsCrossed, Sparkles, Heart, SlidersHorizontal } from 'lucide-react';
import type { Route } from '../../types';
import { IconButton } from '../ui/IconButton';

interface TopHeaderProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentRoute, onNavigate }) => {
  const getRouteTitle = (route: Route) => {
    switch (route) {
      case 'dashboard':
        return 'Daily Nutrition Dashboard';
      case 'generator':
        return 'Macro Meal Generator';
      case 'plan':
        return "Today's Meal Schedule";
      case 'history':
        return 'Nutrition History & Trends';
      case 'favorites':
        return 'Saved Favorites';
      case 'profile':
        return 'Personal Profile';
      case 'onboarding':
        return 'Macro Target Configurator';
      case 'login':
        return 'Account Sign In';
      case 'register':
        return 'Create Account';
      case 'landing':
        return 'Welcome to GAUGE';
      default:
        return 'GAUGE';
    }
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-6 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Brand & Mobile Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                GAUGE <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium mt-0.5">
                {getRouteTitle(currentRoute)}
              </p>
            </div>
          </button>
        </div>

        {/* Center Current Page Badge for Mobile */}
        <div className="sm:hidden font-semibold text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 truncate max-w-[140px]">
          {getRouteTitle(currentRoute)}
        </div>

        {/* Right Quick Nav Controls */}
        <div className="flex items-center gap-2">
          <IconButton
            icon={<Heart className="w-4 h-4" />}
            onClick={() => onNavigate('favorites')}
            variant={currentRoute === 'favorites' ? 'primary' : 'outline'}
            size="sm"
            label="Favorites"
          />
          <IconButton
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={() => onNavigate('onboarding')}
            variant={currentRoute === 'onboarding' ? 'primary' : 'outline'}
            size="sm"
            label="Setup Targets"
          />
          <button
            onClick={() => onNavigate('generator')}
            className="hidden sm:inline-flex glass-button text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate Meal
          </button>
        </div>
      </div>
    </header>
  );
};
