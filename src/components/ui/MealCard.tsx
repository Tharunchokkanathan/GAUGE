import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, Dumbbell, Heart, Plus, Clock, Sparkles, Droplets, Info } from 'lucide-react';
import type { MealItem } from '../../types';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface MealCardProps {
  meal: MealItem;
  onAdd?: (meal: MealItem) => void;
  onViewDetails?: (meal: MealItem) => void;
  onToggleFavorite?: (meal: MealItem) => void;
  onEditCustom?: (meal: MealItem) => void;
  onDeleteCustom?: (meal: MealItem) => void;
  compact?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onAdd,
  onViewDetails,
  onToggleFavorite,
  onEditCustom,
  onDeleteCustom,
  compact = false
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getOilBadge = (oil: MealItem['oilLevel']) => {
    switch (oil) {
      case 'low':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><Droplets className="w-3 h-3" /> Low Oil</span>;
      case 'medium':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Droplets className="w-3 h-3" /> Med Oil</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"><Droplets className="w-3 h-3" /> Standard</span>;
    }
  };

  return (
    <GlassCard variant="interactive" className="group flex flex-col h-full justify-between p-5 space-y-4">
      {/* Sleek Text Header & Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {meal.isCustom ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 border border-purple-500/40 uppercase tracking-wide">
                My Recipe
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                GAUGE Recipe
              </span>
            )}
            {getOilBadge(meal.oilLevel)}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 capitalize">
              {meal.type}
            </span>
          </div>

          {onToggleFavorite && (
            <motion.div
              whileTap={shouldReduceMotion ? undefined : { scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <IconButton
                icon={<Heart className={`w-4 h-4 transition-colors ${meal.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(meal);
                }}
                variant="secondary"
                size="sm"
                className="bg-slate-900/80 border-slate-800 hover:border-slate-700"
                label={meal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              />
            </motion.div>
          )}
        </div>

        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {meal.name}
          </h3>
          {!compact && meal.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {meal.description}
            </p>
          )}
        </div>

        {/* Prep time & score info strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {meal.prepTimeMinutes} mins prep
          </span>

          <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Score: {meal.nutritionScore}/100
          </span>
        </div>
      </div>

      {/* Card Body & Macros */}
      <div className="space-y-3 pt-1">
        {/* Macros Grid */}
        <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 block font-sans">Kcal</span>
            <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-0.5">
              <Flame className="w-3 h-3 shrink-0" />
              {meal.macros.calories}
            </span>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Protein</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-0.5">
              <Dumbbell className="w-3 h-3 shrink-0" />
              {meal.macros.protein}g
            </span>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Carbs</span>
            <span className="text-xs font-bold text-cyan-300">{meal.macros.carbs}g</span>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Fat</span>
            <span className="text-xs font-bold text-slate-300">{meal.macros.fat}g</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onViewDetails(meal)}
              icon={<Info className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}

          {meal.isCustom && onEditCustom && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
              onClick={() => onEditCustom(meal)}
            >
              Edit
            </Button>
          )}

          {meal.isCustom && onDeleteCustom && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
              onClick={() => onDeleteCustom(meal)}
            >
              Delete
            </Button>
          )}

          {onAdd && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onAdd(meal)}
            >
              Add Meal
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
