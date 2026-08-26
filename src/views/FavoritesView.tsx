import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import type { Route, MealItem } from '../types';
import { MOCK_MEALS } from '../data/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { MealCard } from '../components/ui/MealCard';
import { Button } from '../components/ui/Button';

interface FavoritesViewProps {
  onNavigate: (route: Route) => void;
  onViewMealDetails: (meal: MealItem) => void;
  onAddMealToPlan: (meal: MealItem) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onNavigate,
  onViewMealDetails,
  onAddMealToPlan
}) => {
  const [favoriteMeals, setFavoriteMeals] = useState<MealItem[]>(
    MOCK_MEALS.filter((m) => m.isFavorite)
  );

  const handleToggleFavorite = (meal: MealItem) => {
    setFavoriteMeals((prev) => prev.filter((m) => m.id !== meal.id));
  };

  return (
    <div className="space-y-6 pb-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Saved Favorite Dishes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Quick access to your preferred high-protein South Indian meals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => onNavigate('generator')}
        >
          Explore Generator
        </Button>
      </div>

      {favoriteMeals.length === 0 ? (
        <GlassCard variant="subtle" className="text-center py-12 px-6 space-y-4 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Favorite Dishes Saved Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tap the heart icon on any recommended dish in the generator to save it here for instant logging.
          </p>
          <Button variant="outline" size="sm" onClick={() => onNavigate('generator')}>
            Browse Generator
          </Button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={{ ...meal, isFavorite: true }}
              onAdd={onAddMealToPlan}
              onViewDetails={onViewMealDetails}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
