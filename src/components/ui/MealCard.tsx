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
    <GlassCard variant="interactive" className="group flex flex-col h-full justify-between">
      {/* Top Banner Image with Badges */}
      <div className="relative h-44 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 mb-3 overflow-hidden rounded-t-2xl">
        <img
          src={meal.image}
          alt={meal.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 backdrop-blur-md bg-slate-950/70 p-1 rounded-xl border border-white/10">
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
          </div>

          {onToggleFavorite && (
            <motion.div
              whileTap={shouldReduceMotion ? undefined : { scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <IconButton
                icon={<Heart className={`w-4 h-4 transition-colors ${meal.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(meal);
                }}
                variant="secondary"
                size="sm"
                className="bg-slate-950/70 backdrop-blur-md border-white/10"
                label={meal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              />
            </motion.div>
          )}
        </div>

        {/* Bottom Floating Score & Prep Time */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-200 font-semibold">
          <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {meal.prepTimeMinutes} mins
          </span>

          <span className="flex items-center gap-1 bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 text-emerald-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Score: {meal.nutritionScore}/100
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors leading-snug">
              {meal.name}
            </h3>
          </div>
          {!compact && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {meal.description}
            </p>
          )}
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center font-mono">
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
            <span className="text-xs font-semibold text-cyan-300">
              {meal.macros.carbs}g
            </span>
          </div>

          <div className="space-y-0.5 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Fat</span>
            <span className="text-xs font-semibold text-slate-300">
              {meal.macros.fat}g
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {onViewDetails && (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 min-w-[75px]"
              icon={<Info className="w-3.5 h-3.5" />}
              onClick={() => onViewDetails(meal)}
            >
              Details
            </Button>
          )}

          {meal.isCustom && onEditCustom && (
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
              onClick={() => onEditCustom(meal)}
            >
              Edit
            </Button>
          )}

          {meal.isCustom && onDeleteCustom && (
            <Button
              variant="danger"
              size="sm"
              className="px-2"
              onClick={() => onDeleteCustom(meal)}
            >
              Delete
            </Button>
          )}

          {onAdd && (
            <Button
              variant="primary"
              size="sm"
              className="flex-1 min-w-[85px]"
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
