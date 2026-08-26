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
import { FirestoreUserService, FirestoreRecipesService, getTodayDateKey } from './services/firestore';

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

export function App() {
  const { user, userProfile, setUserProfile } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutritionTarget>(MOCK_DAILY_NUTRITION);
  const [loggedMeals, setLoggedMeals] = useState<Record<MealType, MealItem[]>>(MOCK_LOGGED_MEALS as any);

  // Modal State
  const [selectedMeal, setSelectedMeal] = useState<MealItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastSubmessage, setToastSubmessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);

  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Seed shared Firestore recipes on boot
  useEffect(() => {
    FirestoreRecipesService.seedRecipesIfEmpty();
  }, []);

  // Fetch isolated user profile and daily logs when authenticated user UID changes
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

      FirestoreUserService.getDailyNutrition(user.uid, today).then((nut) => {
        if (nut) setDailyNutrition(nut);
      });
      FirestoreUserService.getLoggedMeals(user.uid, today).then((meals) => {
        if (meals) setLoggedMeals(meals);
      });
    }
  }, [user?.uid, setUserProfile]);

  // Navigation Handler
  const handleNavigate = (route: Route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Meal Detail Modal
  const handleViewMealDetails = (meal: MealItem) => {
    setSelectedMeal(meal);
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

  // Add Meal to Today's Plan
  const handleAddMealToPlan = async (meal: MealItem, portionMultiplier: number = 1, oil: OilLevel = 'low') => {
    const mealCategory: MealType = meal.type === 'all' ? 'breakfast' : meal.type;

    const oilGrams = oil === 'none' ? 0 : oil === 'low' ? 5 : oil === 'medium' ? 10 : 15;
    const baseOilGrams = meal.oilLevel === 'none' ? 0 : meal.oilLevel === 'low' ? 5 : meal.oilLevel === 'medium' ? 10 : 15;
    const oilDiffGrams = oilGrams - baseOilGrams;

    const scaledCalories = Math.round(meal.macros.calories * portionMultiplier + oilDiffGrams * 9);
    const scaledProtein = Math.round(meal.macros.protein * portionMultiplier);
    const scaledCarbs = Math.round(meal.macros.carbs * portionMultiplier);
    const scaledFat = Math.max(0, Math.round(meal.macros.fat * portionMultiplier + oilDiffGrams));

    const newMeal: MealItem = {
      ...meal,
      id: `${meal.id}-${Date.now()}`,
      macros: {
        calories: scaledCalories,
        protein: scaledProtein,
        carbs: scaledCarbs,
        fat: Math.max(0, scaledFat)
      }
    };

    setLoggedMeals((prev) => ({
      ...prev,
      [mealCategory]: [...(prev[mealCategory] || []), newMeal]
    }));

    const updatedNutrition: DailyNutritionTarget = {
      ...dailyNutrition,
      consumedCalories: dailyNutrition.consumedCalories + scaledCalories,
      consumedProtein: dailyNutrition.consumedProtein + scaledProtein,
      consumedCarbs: dailyNutrition.consumedCarbs + scaledCarbs,
      consumedFat: dailyNutrition.consumedFat + scaledFat
    };

    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.addMealToLog(user.uid, today, newMeal);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast(`Added ${meal.name}`, `+${scaledCalories} kcal • +${scaledProtein}g protein logged to Firestore`);
  };

  // Remove Meal from Plan
  const handleRemoveMeal = async (mealType: MealType, mealId: string) => {
    const targetMeal = loggedMeals[mealType]?.find((m) => m.id === mealId);
    if (!targetMeal) return;

    setLoggedMeals((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((m) => m.id !== mealId)
    }));

    const updatedNutrition: DailyNutritionTarget = {
      ...dailyNutrition,
      consumedCalories: Math.max(0, dailyNutrition.consumedCalories - targetMeal.macros.calories),
      consumedProtein: Math.max(0, dailyNutrition.consumedProtein - targetMeal.macros.protein),
      consumedCarbs: Math.max(0, dailyNutrition.consumedCarbs - targetMeal.macros.carbs),
      consumedFat: Math.max(0, dailyNutrition.consumedFat - targetMeal.macros.fat)
    };

    setDailyNutrition(updatedNutrition);

    if (user?.uid) {
      const today = getTodayDateKey();
      await FirestoreUserService.removeMealFromLog(user.uid, today, mealId);
      await FirestoreUserService.saveDailyNutrition(user.uid, today, updatedNutrition);
    }

    triggerToast(`Removed ${targetMeal.name}`, `-${targetMeal.macros.calories} kcal removed from Firestore`);
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
              <p className="text-sm text-slate-400">Loading your personalized nutrition profile from Firestore...</p>
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
                    dailyNutrition={dailyNutrition}
                    loggedMeals={loggedMeals}
                    onAddMealClick={() => handleNavigate('generator')}
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
                  <HistoryView />
                )}

                {currentRoute === 'favorites' && (
                  <FavoritesView
                    onNavigate={handleNavigate}
                    onViewMealDetails={handleViewMealDetails}
                    onAddMealToPlan={handleAddMealToPlan}
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

      {/* Recipe Details & Portion Adjuster Modal */}
      <MealDetailModal
        meal={selectedMeal}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddMeal={handleAddMealToPlan}
      />

      {/* Floating Confirmation Toast */}
      <Toast
        message={toastMessage}
        submessage={toastSubmessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  );
}

export default App;
