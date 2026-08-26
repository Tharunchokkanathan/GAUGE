import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Route, MealItem, MealType, DailyNutritionTarget, UserProfileData, OilLevel } from './types';
import { MOCK_DAILY_NUTRITION, MOCK_LOGGED_MEALS } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { TopHeader } from './components/layout/TopHeader';
import { PageTransition } from './components/layout/PageTransition';
import { LiquidBackground } from './components/ui/LiquidBackground';
import { Toast } from './components/ui/Toast';
import { useAuth } from './context/AuthContext';
import { FirestoreUserService, FirestoreRecipesService, FirestoreFoodService, getTodayDateKey } from './services/firestore';

import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { GeneratorView } from './views/GeneratorView';
import { PlanView } from './views/PlanView';
import { HistoryView } from './views/HistoryView';
import { FavoritesView } from './views/FavoritesView';
import { ProfileView } from './views/ProfileView';
import { MealDetailModal } from './views/MealDetailModal';
import { PwaInstallPrompt } from './components/pwa/PwaInstallPrompt';

export function App() {
  const { user, userProfile, setUserProfile } = useAuth();

  useEffect(() => {
    FirestoreRecipesService.seedRecipesIfEmpty();
    FirestoreFoodService.seedFoodsIfEmpty();
  }, []);
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionTarget>(MOCK_DAILY_NUTRITION);
  const [loggedMeals, setLoggedMeals] = useState<Record<MealType, MealItem[]>>(MOCK_LOGGED_MEALS as any);

  // Modal State
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isEditingMeal, setIsEditingMeal] = useState<boolean>(false);
  const [modalTargetMealType, setModalTargetMealType] = useState<MealType | undefined>(undefined);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSubmessage, setToastSubmessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Favorites & Custom Recipes Global State
  const [userFavorites, setUserFavorites] = useState<string[]>(['m1', 'm2', 'm4', 'm5']);
  const [customRecipesList, setCustomRecipesList] = useState<MealItem[]>([]);

  // Seed shared Firestore recipes on boot
  useEffect(() => {
    FirestoreRecipesService.seedRecipesIfEmpty();
    FirestoreFoodService.seedFoodsIfEmpty();
  }, []);

  // Recalculate consumed macro totals from logged meals
  const recalculateTotalsFromMeals = (
    mealsRecord: Record<MealType, MealItem[]>,
    baseNutrition: DailyNutritionTarget
  ): DailyNutritionTarget => {
    const all = Object.values(mealsRecord).flat();
    const consumedCalories = all.reduce((sum, m) => sum + (m.macros?.calories || 0), 0);
    const consumedProtein = all.reduce((sum, m) => sum + (m.macros?.protein || 0), 0);
    const consumedCarbs = all.reduce((sum, m) => sum + (m.macros?.carbs || 0), 0);
    const consumedFat = all.reduce((sum, m) => sum + (m.macros?.fat || 0), 0);
    const consumedFiber = all.reduce((sum, m) => sum + (m.macros?.fiber || 0), 0);

    return {
      ...baseNutrition,
      consumedCalories,
      consumedProtein,
      consumedCarbs,
      consumedFat,
      consumedFiber
    };
  };

  // Fetch isolated user profile, daily logs, favorites, and custom recipes when authenticated user UID changes
  useEffect(() => {
    if (user?.uid) {
      setIsProfileLoading(true);
      const today = getTodayDateKey();
      
      FirestoreUserService.getProfile(user.uid).then((prof) => {
        if (prof) {
          setUserProfile(prof);
          setDailyNutrition((prev) => ({
            ...prev,
            targetCalories: prof.targetCalories,
            targetProtein: prof.targetProtein
          }));
        } else {
          // New user / missing profile -> Redirect to Onboarding!
          setCurrentRoute('onboarding');
        }
      }).catch((err) => {
        console.warn('Error loading user profile:', err);
      }).finally(() => {
        setIsProfileLoading(false);
      });

      Promise.all([
        FirestoreUserService.getDailyNutrition(user.uid, today),
        FirestoreUserService.getLoggedMeals(user.uid, today),
        FirestoreUserService.getFavorites(user.uid),
        FirestoreUserService.getCustomRecipes(user.uid)
      ]).then(([nut, meals, favs, customReps]) => {
        if (meals) {
          setLoggedMeals(meals);
          if (nut) {
            setDailyNutrition(recalculateTotalsFromMeals(meals, nut));
          }
        } else if (nut) {
          setDailyNutrition(nut);
        }
        if (favs) setUserFavorites(favs);
        if (customReps) setCustomRecipesList(customReps);
      });
    }
  }, [user?.uid, setUserProfile]);

  // Navigation Handler
  const handleNavigate = (route: Route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Meal Detail Modal for Viewing / Logging
  const handleViewMealDetails = (meal: MealItem, targetCourse?: MealType) => {
    setSelectedMeal(meal);
    setIsEditingMeal(false);
    setModalTargetMealType(targetCourse);
    setIsDetailOpen(true);
  };

  // Open Meal Detail Modal for Editing Logged Meal Portion
  const handleEditMealPortion = (meal: MealItem) => {
    setSelectedMeal(meal);
    setIsEditingMeal(true);
    setModalTargetMealType(meal.type);
    setIsDetailOpen(true);
  };

  // Show Toast
  const triggerToast = (msg: string, submsg?: string) => {
    setToastMessage(msg);
    setToastSubmessage(submsg || '');
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3500);
  };

  // Add Meal to Today's Plan & Save Nutrition Snapshot to Firestore
  const handleAddMealToPlan = async (
    meal: MealItem, 
    portionMultiplier: number = 1, 
    oil: OilLevel = 'low',
    targetMealType?: MealType
  ) => {
    const mealCategory: MealType = targetMealType || (meal.type === 'all' ? 'breakfast' : meal.type);

    const oilGrams = oil === 'none' ? 0 : oil === 'low' ? 5 : oil === 'medium' ? 10 : 15;
    const baseOilGrams = meal.oilLevel === 'none' ? 0 : meal.oilLevel === 'low' ? 5 : meal.oilLevel === 'medium' ? 10 : 15;
    const oilDiffGrams = oilGrams - baseOilGrams;

    const scaledCalories = Math.round(meal.macros.calories * portionMultiplier + oilDiffGrams * 9);
    const scaledProtein = Math.round(meal.macros.protein * portionMultiplier);
    const scaledCarbs = Math.round(meal.macros.carbs * portionMultiplier);
    const scaledFat = Math.max(0, Math.round(meal.macros.fat * portionMultiplier + oilDiffGrams));
    const scaledFiber = Math.round((meal.macros.fiber || 5) * portionMultiplier);

    const newLoggedMeal: MealItem = {
      ...meal,
      id: `log-${meal.id}-${Date.now()}`,
      recipeId: meal.recipeId || meal.id,
      type: mealCategory,
      servings: portionMultiplier,
      oilLevel: oil,
      timestamp: new Date().toISOString(),
      macros: {
        calories: scaledCalories,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: scaledFat,
        fiber: scaledFiber
      },
      nutritionSnapshot: {
        energyKcal: scaledCalories,
        proteinG: scaledProtein,
        carbohydratesG: scaledCarbs,
        fatG: scaledFat,
        fiberG: scaledFiber
      }
    };

    const updatedRecord = {
      ...loggedMeals,
      [mealCategory]: [...(loggedMeals[mealCategory] || []), newLoggedMeal]
    };

    setLoggedMeals(updatedRecord);

    const updatedNutrition = recalculateTotalsFromMeals(updatedRecord, dailyNutrition);
    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.addMealToLog(user.uid, today, newLoggedMeal);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast(
      `Logged to ${mealCategory.toUpperCase()}`, 
      `${meal.name} • +${scaledCalories} kcal, +${scaledProtein}g protein saved to Firestore snapshot`
    );
  };

  // Update Logged Meal Portion or Oil Level
  const handleUpdateLoggedMeal = async (mealId: string, updatedMeal: MealItem) => {
    // Rebuild logged meals record replacing target meal ID
    const updatedRecord: Record<MealType, MealItem[]> = {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
      all: []
    };

    // Remove from existing course & insert updated meal into its new target course
    Object.keys(loggedMeals).forEach((courseKey) => {
      const c = courseKey as MealType;
      loggedMeals[c].forEach((m) => {
        if (m.id !== mealId) {
          updatedRecord[c].push(m);
        }
      });
    });

    const targetCourse = (updatedMeal.type === 'all' ? 'breakfast' : updatedMeal.type) as MealType;
    updatedRecord[targetCourse].push(updatedMeal);

    setLoggedMeals(updatedRecord);

    const updatedNutrition = recalculateTotalsFromMeals(updatedRecord, dailyNutrition);
    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.updateLoggedMeal(user.uid, today, updatedMeal);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast(
      `Updated Portion for ${updatedMeal.name}`, 
      `Recalculated: ${updatedMeal.macros.calories} kcal, ${updatedMeal.macros.protein}g protein`
    );
  };

  // Remove Meal from Plan
  const handleRemoveMeal = async (mealType: MealType, mealId: string) => {
    const targetMeal = loggedMeals[mealType]?.find((m) => m.id === mealId);
    if (!targetMeal) return;

    const updatedRecord = {
      ...loggedMeals,
      [mealType]: loggedMeals[mealType].filter((m) => m.id !== mealId)
    };

    setLoggedMeals(updatedRecord);

    const updatedNutrition = recalculateTotalsFromMeals(updatedRecord, dailyNutrition);
    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.removeMealFromLog(user.uid, today, mealId);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast(`Removed ${targetMeal.name}`, `-${targetMeal.macros.calories} kcal removed from Firestore daily log`);
  };

  const handleSaveProfile = async (profile: UserProfileData) => {
    setUserProfile(profile);
    const updatedNutrition: DailyNutritionTarget = {
      ...dailyNutrition,
      targetCalories: profile.targetCalories,
      targetProtein: profile.targetProtein
    };
    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.saveProfile(user.uid, profile);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast('Profile Targets Saved', `${profile.targetCalories} kcal / ${profile.targetProtein}g protein saved to Firestore`);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Liquid Ambient Organic Background */}
      <LiquidBackground />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        userEmail={userProfile.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader currentRoute={currentRoute} onNavigate={handleNavigate} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 lg:pb-8 relative z-10">
          {isProfileLoading ? (
            <div className="max-w-4xl mx-auto space-y-6 pt-12 text-center">
              <div className="inline-block animate-spin text-emerald-400 font-extrabold text-2xl">⏳</div>
              <p className="text-sm text-slate-400">Loading your daily meal logs & nutrition snapshot from Firestore...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <PageTransition routeKey={currentRoute}>
                {currentRoute === 'landing' && (
                  <LandingView onNavigate={handleNavigate} />
                )}

                {currentRoute === 'login' && (
                  <LoginView onNavigate={handleNavigate} />
                )}

                {currentRoute === 'register' && (
                  <RegisterView onNavigate={handleNavigate} />
                )}

                {currentRoute === 'onboarding' && (
                  <OnboardingView
                    onNavigate={handleNavigate}
                    onSaveProfile={handleSaveProfile}
                    initialProfile={userProfile}
                  />
                )}

                {currentRoute === 'dashboard' && (
                  <DashboardView
                    onNavigate={handleNavigate}
                    onViewMealDetails={handleViewMealDetails}
                    onEditMealPortion={handleEditMealPortion}
                    dailyNutrition={dailyNutrition}
                    loggedMeals={loggedMeals}
                    onAddMealClick={(mealType) => setModalTargetMealType(mealType)}
                    onQuickAddMeal={(recipe, targetType) => handleAddMealToPlan(recipe, 1, 'low', targetType)}
                    onRemoveMeal={handleRemoveMeal}
                    userProfile={userProfile}
                  />
                )}

                {currentRoute === 'generator' && (
                  <GeneratorView
                    onViewMealDetails={handleViewMealDetails}
                    onAddMealToPlan={handleAddMealToPlan}
                    userProfile={userProfile}
                  />
                )}

                {currentRoute === 'plan' && (
                  <PlanView
                    onNavigate={handleNavigate}
                    loggedMeals={loggedMeals}
                    onRemoveMeal={handleRemoveMeal}
                  />
                )}

                {currentRoute === 'history' && (
                  <HistoryView onViewMealDetails={handleViewMealDetails} />
                )}

                {currentRoute === 'favorites' && (
                  <FavoritesView
                    onNavigate={handleNavigate}
                    onViewMealDetails={handleViewMealDetails}
                    onAddMealToPlan={handleAddMealToPlan}
                    userFavorites={userFavorites}
                    onToggleFavoriteGlobal={(recipeId) => {
                      setUserFavorites((prev) =>
                        prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
                      );
                    }}
                    customRecipesList={customRecipesList}
                    onSaveCustomRecipeGlobal={(recipe) => {
                      setCustomRecipesList((prev) => {
                        const idx = prev.findIndex((r) => r.id === recipe.id);
                        if (idx >= 0) return prev.map((r) => (r.id === recipe.id ? recipe : r));
                        return [recipe, ...prev];
                      });
                      triggerToast('Custom Recipe Saved', `${recipe.name} has been saved to your custom recipes collection.`);
                    }}
                    onDeleteCustomRecipeGlobal={(recipeId) => {
                      setCustomRecipesList((prev) => prev.filter((r) => r.id !== recipeId));
                      triggerToast('Custom Recipe Deleted', 'The custom recipe was removed.');
                    }}
                  />
                )}

                {currentRoute === 'profile' && (
                  <ProfileView
                    onNavigate={handleNavigate}
                    profile={userProfile}
                    onSaveProfile={handleSaveProfile}
                  />
                )}
              </PageTransition>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />

      {/* Recipe Details, Portion Adjuster & Edit Meal Modal */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setIsEditingMeal(false);
        }}
        onAddMeal={handleAddMealToPlan}
        onUpdateMeal={handleUpdateLoggedMeal}
        targetMealType={modalTargetMealType}
        isEditing={isEditingMeal}
      />

      {/* Floating Confirmation Toast */}
      <Toast
        message={toastMessage}
        submessage={toastSubmessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      {/* PWA Install Banner for Android & Desktop */}
      <PwaInstallPrompt />
    </div>
  );
}

export default App;
