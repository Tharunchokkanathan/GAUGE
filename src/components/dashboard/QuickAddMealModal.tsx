import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Heart, Flame, Dumbbell, Compass, Check } from 'lucide-react';
import type { MealItem, MealType } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FirestoreRecipesService } from '../../services/firestore';

interface QuickAddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMealType: MealType;
  onSelectRecipeToLog: (recipe: MealItem) => void;
  onNavigateToGenerator: () => void;
}

export const QuickAddMealModal: React.FC<QuickAddMealModalProps> = ({
  isOpen,
  onClose,
  targetMealType,
  onSelectRecipeToLog,
  onNavigateToGenerator
}) => {
  const [recipes, setRecipes] = useState<MealItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'suggested' | 'favorites'>('suggested');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSearchQuery('');
      setLoggingId(null);
      FirestoreRecipesService.getRecipes().then((res) => {
        setRecipes(res);
        setIsLoading(false);
      }).catch((err) => {
        console.warn('Error fetching recipes in QuickAddMealModal:', err);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sectionLabel = targetMealType.charAt(0).toUpperCase() + targetMealType.slice(1);

  // Filter recipes based on course, search query, and category
  const filteredRecipes = recipes.filter((meal) => {
    const matchesSearch = searchQuery === '' || 
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'suggested') {
      return meal.type === targetMealType || meal.type === 'all';
    }

    if (filterCategory === 'favorites') {
      return !!meal.isFavorite;
    }

    return true;
  });

  const handleQuickLog = (recipe: MealItem) => {
    if (loggingId) return; // Prevent duplicate submission
    setLoggingId(recipe.id);
    onSelectRecipeToLog(recipe);
    setTimeout(() => {
      setLoggingId(null);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Meal to ${sectionLabel}`}
      maxWidth="lg"
    >
      <div className="space-y-5 pb-2">
        {/* Header Prompt */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Select a recipe to log directly to <strong>{sectionLabel}</strong> or customize portion.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              onNavigateToGenerator();
            }}
            icon={<Compass className="w-3.5 h-3.5 text-emerald-400" />}
            className="text-xs text-emerald-300 hover:text-emerald-200 shrink-0"
          >
            Open Meal Generator
          </Button>
        </div>

        {/* Search & Filter Tabs */}
        <div className="space-y-3">
          <Input
            placeholder={`Search ${sectionLabel} dishes by name or ingredient...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'suggested', label: `Suggested for ${sectionLabel}` },
              { id: 'all', label: 'All Recipes' },
              { id: 'favorites', label: 'Saved Favorites' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterCategory === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
            Loading available recipes from Firestore...
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <p className="text-sm font-semibold text-slate-300">No dishes match your filter.</p>
            <p className="text-xs text-slate-400">Try searching for another dish or use the generator.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onNavigateToGenerator();
              }}
            >
              Browse Meal Generator
            </Button>
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
            {filteredRecipes.map((meal) => {
              const isLoggingThis = loggingId === meal.id;
              return (
                <div
                  key={meal.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/40 transition-all gap-3 group"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                          {meal.name}
                        </h4>
                        {meal.isFavorite && (
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Flame className="w-3 h-3" /> {meal.macros.calories} kcal
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Dumbbell className="w-3 h-3" /> {meal.macros.protein}g protein
                        </span>
                        <span>C: {meal.macros.carbs}g • F: {meal.macros.fat}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isLoggingThis || !!loggingId}
                      icon={isLoggingThis ? <Check className="w-4 h-4 text-slate-950" /> : <Plus className="w-4 h-4" />}
                      onClick={() => handleQuickLog(meal)}
                    >
                      {isLoggingThis ? 'Logged!' : `Log to ${sectionLabel}`}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
