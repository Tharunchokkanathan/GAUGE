import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, ChefHat, BookOpen } from 'lucide-react';
import type { Route, MealItem } from '../types';
import { MOCK_MEALS } from '../data/mockData';
import { GlassCard } from '../components/ui/GlassCard';
import { MealCard } from '../components/ui/MealCard';
import { Button } from '../components/ui/Button';
import { CustomRecipeModal } from '../components/recipes/CustomRecipeModal';
import { useAuth } from '../context/AuthContext';
import { FirestoreUserService } from '../services/firestore';

import { ConfirmationModal } from '../components/ui/ConfirmationModal';

interface FavoritesViewProps {
  onNavigate: (route: Route) => void;
  onViewMealDetails: (meal: MealItem) => void;
  onAddMealToPlan: (meal: MealItem) => void;
  userFavorites?: string[];
  onToggleFavoriteGlobal?: (recipeId: string) => void;
  customRecipesList?: MealItem[];
  onSaveCustomRecipeGlobal?: (recipe: MealItem) => void;
  onDeleteCustomRecipeGlobal?: (recipeId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  onNavigate,
  onViewMealDetails,
  onAddMealToPlan,
  userFavorites = [],
  onToggleFavoriteGlobal,
  customRecipesList = [],
  onSaveCustomRecipeGlobal,
  onDeleteCustomRecipeGlobal
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'custom'>('all');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [editingCustomMeal, setEditingCustomMeal] = useState<MealItem | null>(null);

  // Delete Confirmation State
  const [recipeToDelete, setRecipeToDelete] = useState<MealItem | null>(null);

  const [localFavorites, setLocalFavorites] = useState<string[]>(userFavorites);
  const [localCustomRecipes, setLocalCustomRecipes] = useState<MealItem[]>(customRecipesList);

  useEffect(() => {
    setLocalFavorites(userFavorites);
  }, [userFavorites]);

  useEffect(() => {
    setLocalCustomRecipes(customRecipesList);
  }, [customRecipesList]);

  // Load custom recipes & favorites directly if available
  useEffect(() => {
    if (user?.uid) {
      FirestoreUserService.getCustomRecipes(user.uid).then((res) => {
        if (res && res.length > 0) {
          setLocalCustomRecipes(res);
        }
      });
      FirestoreUserService.getFavorites(user.uid).then((favs) => {
        if (favs && favs.length > 0) {
          setLocalFavorites(favs);
        }
      });
    }
  }, [user?.uid]);

  const handleToggleFav = async (meal: MealItem) => {
    const isCurrentlyFav = localFavorites.includes(meal.id);
    const updated = isCurrentlyFav
      ? localFavorites.filter((id) => id !== meal.id)
      : [...localFavorites, meal.id];
    setLocalFavorites(updated);

    if (onToggleFavoriteGlobal) {
      onToggleFavoriteGlobal(meal.id);
    }

    if (user?.uid) {
      await FirestoreUserService.toggleFavorite(user.uid, meal.id, !isCurrentlyFav);
    }
  };

  const handleSaveCustomRecipe = async (recipe: MealItem) => {
    const existingIdx = localCustomRecipes.findIndex((r) => r.id === recipe.id);
    let updated: MealItem[];
    if (existingIdx >= 0) {
      updated = localCustomRecipes.map((r) => (r.id === recipe.id ? recipe : r));
    } else {
      updated = [recipe, ...localCustomRecipes];
    }
    setLocalCustomRecipes(updated);

    if (onSaveCustomRecipeGlobal) {
      onSaveCustomRecipeGlobal(recipe);
    }

    if (user?.uid) {
      await FirestoreUserService.saveCustomRecipe(user.uid, recipe);
    }
    setEditingCustomMeal(null);
  };

  const confirmDeleteCustomRecipe = async () => {
    if (!recipeToDelete) return;
    const meal = recipeToDelete;
    const updated = localCustomRecipes.filter((r) => r.id !== meal.id);
    setLocalCustomRecipes(updated);

    if (onDeleteCustomRecipeGlobal) {
      onDeleteCustomRecipeGlobal(meal.id);
    }

    if (user?.uid) {
      await FirestoreUserService.deleteCustomRecipe(user.uid, meal.id);
    }
    setRecipeToDelete(null);
  };

  // Combine GAUGE catalog with user custom recipes
  const allCatalogMeals: MealItem[] = [
    ...localCustomRecipes.map((r) => ({ ...r, isCustom: true })),
    ...MOCK_MEALS
  ];

  // Filtered by tab
  const favoriteMeals = allCatalogMeals.filter((m) => localFavorites.includes(m.id));
  const customMeals = allCatalogMeals.filter((m) => m.isCustom);

  let displayedMeals: MealItem[] = [];
  if (activeTab === 'favorites') {
    displayedMeals = favoriteMeals;
  } else if (activeTab === 'custom') {
    displayedMeals = customMeals;
  } else {
    // 'all' shows both favorites & custom recipes
    const combinedMap = new Map<string, MealItem>();
    favoriteMeals.forEach((m) => combinedMap.set(m.id, m));
    customMeals.forEach((m) => combinedMap.set(m.id, m));
    displayedMeals = Array.from(combinedMap.values());
  }

  return (
    <div className="space-y-6 pb-6 max-w-6xl mx-auto">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Favorites & Custom Recipes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access saved favorite GAUGE dishes & build your own custom macro recipes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={<ChefHat className="w-4 h-4" />}
            onClick={() => {
              setEditingCustomMeal(null);
              setIsCustomModalOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20"
          >
            Create Custom Recipe
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => onNavigate('generator')}
          >
            Generator
          </Button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: `All Saved (${favoriteMeals.length + customMeals.length})`, icon: <BookOpen className="w-4 h-4" /> },
            { id: 'favorites', label: `Favorites (${favoriteMeals.length})`, icon: <Heart className="w-4 h-4 text-rose-400" /> },
            { id: 'custom', label: `My Recipes (${customMeals.length})`, icon: <ChefHat className="w-4 h-4 text-purple-400" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {displayedMeals.length === 0 ? (
        <GlassCard variant="subtle" className="text-center py-16 px-6 space-y-4 border-dashed border-slate-800">
          <div className="w-14 h-14 rounded-3xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
            {activeTab === 'custom' ? <ChefHat className="w-7 h-7" /> : <Heart className="w-7 h-7 text-rose-400" />}
          </div>
          <h3 className="text-lg font-bold text-white">
            {activeTab === 'custom' ? 'No Custom Recipes Created Yet' : 'No Favorite Recipes Saved'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {activeTab === 'custom'
              ? 'Build your personalized recipes with custom ingredient quantities, cooking oil options, and automatic macro calculations.'
              : 'Tap the heart icon on any recipe in the generator or custom list to save it to your favorites.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={<ChefHat className="w-4 h-4" />}
              onClick={() => {
                setEditingCustomMeal(null);
                setIsCustomModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-500"
            >
              Create First Custom Recipe
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('generator')}>
              Browse GAUGE Recipes
            </Button>
          </div>
        </GlassCard>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMeals.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <MealCard
                  meal={{
                    ...meal,
                    isFavorite: localFavorites.includes(meal.id)
                  }}
                  onAdd={onAddMealToPlan}
                  onViewDetails={onViewMealDetails}
                  onToggleFavorite={handleToggleFav}
                  onEditCustom={(m) => {
                    setEditingCustomMeal(m);
                    setIsCustomModalOpen(true);
                  }}
                  onDeleteCustom={(m) => setRecipeToDelete(m)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Custom Recipe Creation / Editing Modal */}
      <CustomRecipeModal
        isOpen={isCustomModalOpen}
        onClose={() => {
          setIsCustomModalOpen(false);
          setEditingCustomMeal(null);
        }}
        onSaveRecipe={handleSaveCustomRecipe}
        editingRecipe={editingCustomMeal}
      />

      {/* Delete Recipe Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!recipeToDelete}
        title="Delete Custom Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Recipe"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDeleteCustomRecipe}
        onCancel={() => setRecipeToDelete(null)}
      />
    </div>
  );
};

export default FavoritesView;
