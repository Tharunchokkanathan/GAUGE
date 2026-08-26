import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { MealItem, UserProfileData, DailyNutritionTarget, MealType, DailyHistoryRecord } from '../types';
import { MOCK_MEALS, MOCK_DAILY_NUTRITION } from '../data/mockData';

// Format YYYY-MM-DD for date keys
export const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDateKeyForDaysAgo = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatReadableDate = (dateKey: string): { formattedDate: string; dayName: string } => {
  const parts = dateKey.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  return { formattedDate, dayName };
};

import { OPEN_FOOD_DATABASE } from '../data/foodDatabase';

/**
 * Shared Foods & Nutrition Database Service
 */
export const FirestoreFoodService = {
  // Get all normalized food items
  async getFoods(): Promise<any[]> {
    try {
      const snap = await getDocs(collection(db, 'foods'));
      if (!snap.empty) {
        const foods: any[] = [];
        snap.forEach((docSnap) => {
          foods.push(docSnap.data());
        });
        return foods;
      }
    } catch (err) {
      console.warn('Firestore getFoods fallback:', err);
    }
    return OPEN_FOOD_DATABASE;
  },

  // Get dataset metadata summary
  async getDatasetMetadata(): Promise<any | null> {
    try {
      const docSnap = await getDoc(doc(db, 'foodMetadata', 'dataset'));
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (err) {
      console.warn('Firestore getDatasetMetadata fallback:', err);
    }
    return {
      totalItems: OPEN_FOOD_DATABASE.length,
      sources: ['IFCT_2017 (ICMR-NIN India)', 'USDA FoodData Central'],
      license: 'Public Domain / Free Open Access',
      lastUpdated: new Date().toISOString()
    };
  },

  // Seed raw open-access food items if database is empty
  async seedFoodsIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'foods'));
      if (snap.empty || snap.size < OPEN_FOOD_DATABASE.length) {
        for (const food of OPEN_FOOD_DATABASE) {
          await setDoc(doc(db, 'foods', food.id), food, { merge: true });
        }
        await setDoc(doc(db, 'foodMetadata', 'dataset'), {
          totalItems: OPEN_FOOD_DATABASE.length,
          sources: ['IFCT_2017 (ICMR-NIN India)', 'USDA FoodData Central'],
          license: 'Public Domain / Free Open Access',
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore seedFoods warning:', err);
    }
  }
};

/**
 * Shared Recipes Database Service
 */
export const FirestoreRecipesService = {
  // Get all recipes from Firestore (or fallback to local dataset)
  async getRecipes(): Promise<MealItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      if (!querySnapshot.empty) {
        const recipes: MealItem[] = [];
        querySnapshot.forEach((docSnap) => {
          recipes.push(docSnap.data() as MealItem);
        });
        return recipes;
      }
    } catch (err) {
      console.warn('Firestore getRecipes fallback:', err);
    }
    return MOCK_MEALS;
  },

  // Seed recipes if shared database is unpopulated or missing new recipes
  async seedRecipesIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'recipes'));
      if (snap.empty || snap.size < MOCK_MEALS.length) {
        for (const meal of MOCK_MEALS) {
          await setDoc(doc(db, 'recipes', meal.id), meal, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firestore seedRecipes warning:', err);
    }
  }
};

/**
 * User Isolated Data Service: users/{uid}
 */
export const FirestoreUserService = {
  // Profile: users/{uid}/profile/data
  async getProfile(uid: string): Promise<UserProfileData | null> {
    try {
      const profileRef = doc(db, 'users', uid, 'profile', 'data');
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        return snap.data() as UserProfileData;
      }
    } catch (err) {
      console.warn('Firestore getProfile fallback:', err);
    }
    return null;
  },

  async saveProfile(uid: string, profile: UserProfileData): Promise<void> {
    try {
      const profileRef = doc(db, 'users', uid, 'profile', 'data');
      await setDoc(profileRef, {
        ...profile,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn('Firestore saveProfile:', err);
    }
  },

  // Daily Logs: users/{uid}/dailyLogs/{date}
  async getDailyNutrition(uid: string, date: string = getTodayDateKey()): Promise<DailyNutritionTarget> {
    try {
      const logRef = doc(db, 'users', uid, 'dailyLogs', date);
      const snap = await getDoc(logRef);
      if (snap.exists()) {
        return snap.data() as DailyNutritionTarget;
      }
    } catch (err) {
      console.warn('Firestore getDailyNutrition fallback:', err);
    }
    return MOCK_DAILY_NUTRITION;
  },

  async saveDailyNutrition(uid: string, date: string, nutrition: DailyNutritionTarget): Promise<void> {
    try {
      const logRef = doc(db, 'users', uid, 'dailyLogs', date);
      await setDoc(logRef, nutrition, { merge: true });
    } catch (err) {
      console.warn('Firestore saveDailyNutrition:', err);
    }
  },

  // Logged Meals: users/{uid}/dailyLogs/{date}/meals/{mealId}
  async getLoggedMeals(uid: string, date: string = getTodayDateKey()): Promise<Record<MealType, MealItem[]>> {
    const mealsBySection: Record<MealType, MealItem[]> = {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
      all: []
    };

    try {
      const mealsSnap = await getDocs(collection(db, 'users', uid, 'dailyLogs', date, 'meals'));
      if (!mealsSnap.empty) {
        mealsSnap.forEach((docSnap) => {
          const rawData = docSnap.data();
          const meal: MealItem = {
            id: docSnap.id,
            recipeId: rawData.recipeId || docSnap.id.split('-')[0],
            name: rawData.name || rawData.recipeName || 'Logged Meal',
            type: rawData.mealType || rawData.type || 'breakfast',
            cuisine: rawData.cuisine || 'south-indian',
            dietary: rawData.dietary || 'vegetarian',
            oilLevel: rawData.oilLevel || 'low',
            servings: rawData.servings ?? 1,
            macros: {
              calories: rawData.calories ?? rawData.macros?.calories ?? 0,
              protein: rawData.protein ?? rawData.macros?.protein ?? 0,
              carbs: rawData.carbs ?? rawData.macros?.carbs ?? 0,
              fat: rawData.fat ?? rawData.macros?.fat ?? 0,
              fiber: rawData.fiber ?? rawData.macros?.fiber ?? 0
            },
            nutritionScore: rawData.nutritionScore || 90,
            prepTimeMinutes: rawData.prepTimeMinutes || 15,
            description: rawData.description || '',
            image: rawData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
            recipeSteps: rawData.recipeSteps || [],
            ingredients: rawData.ingredients || [],
            timestamp: rawData.timestamp || new Date().toISOString(),
            nutritionSnapshot: rawData.nutritionSnapshot || {
              calories: rawData.calories ?? rawData.macros?.calories ?? 0,
              protein: rawData.protein ?? rawData.macros?.protein ?? 0,
              carbs: rawData.carbs ?? rawData.macros?.carbs ?? 0,
              fat: rawData.fat ?? rawData.macros?.fat ?? 0,
              fiber: rawData.fiber ?? rawData.macros?.fiber ?? 0
            }
          };

          const section = (meal.type === 'all' ? 'breakfast' : meal.type) as MealType;
          if (mealsBySection[section]) {
            mealsBySection[section].push(meal);
          }
        });
        return mealsBySection;
      }
    } catch (err) {
      console.warn('Firestore getLoggedMeals fallback:', err);
    }

    return {
      breakfast: [MOCK_MEALS[0]],
      lunch: [MOCK_MEALS[4]],
      snack: [MOCK_MEALS[6]],
      dinner: [],
      all: []
    };
  },

  async addMealToLog(uid: string, date: string, meal: MealItem): Promise<void> {
    try {
      const mealRef = doc(db, 'users', uid, 'dailyLogs', date, 'meals', meal.id);
      const snapshot = {
        calories: meal.macros.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fat: meal.macros.fat,
        fiber: meal.macros.fiber || 0
      };

      const mealPayload = {
        id: meal.id,
        recipeId: meal.recipeId || meal.id.split('-')[0],
        recipeName: meal.name,
        name: meal.name,
        mealType: meal.type,
        type: meal.type,
        servings: meal.servings ?? 1,
        calories: meal.macros.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fat: meal.macros.fat,
        fiber: meal.macros.fiber || 0,
        timestamp: meal.timestamp || new Date().toISOString(),
        nutritionSnapshot: snapshot,
        image: meal.image || '',
        cuisine: meal.cuisine || 'south-indian',
        dietary: meal.dietary || 'vegetarian',
        oilLevel: meal.oilLevel || 'low',
        macros: meal.macros,
        prepTimeMinutes: meal.prepTimeMinutes || 15,
        nutritionScore: meal.nutritionScore || 90,
        description: meal.description || '',
        ingredients: meal.ingredients || [],
        recipeSteps: meal.recipeSteps || []
      };

      await setDoc(mealRef, mealPayload);
    } catch (err) {
      console.warn('Firestore addMealToLog:', err);
    }
  },

  async updateLoggedMeal(uid: string, date: string, meal: MealItem): Promise<void> {
    try {
      const mealRef = doc(db, 'users', uid, 'dailyLogs', date, 'meals', meal.id);
      const snapshot = {
        calories: meal.macros.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fat: meal.macros.fat,
        fiber: meal.macros.fiber || 0
      };

      await setDoc(mealRef, {
        servings: meal.servings ?? 1,
        calories: meal.macros.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fat: meal.macros.fat,
        fiber: meal.macros.fiber || 0,
        mealType: meal.type,
        type: meal.type,
        macros: meal.macros,
        oilLevel: meal.oilLevel || 'low',
        nutritionSnapshot: snapshot,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore updateLoggedMeal:', err);
    }
  },

  async removeMealFromLog(uid: string, date: string, mealId: string): Promise<void> {
    try {
      const mealRef = doc(db, 'users', uid, 'dailyLogs', date, 'meals', mealId);
      await deleteDoc(mealRef);
    } catch (err) {
      console.warn('Firestore removeMealFromLog:', err);
    }
  },

  // History Range Query: fetches past N days from users/{uid}/dailyLogs/{date}
  async getDailyHistoryRange(
    uid: string, 
    daysCount: number = 30,
    userTargetCal?: number,
    userTargetPro?: number
  ): Promise<DailyHistoryRecord[]> {
    const records: DailyHistoryRecord[] = [];
    const defaultCal = userTargetCal || 2200;
    const defaultPro = userTargetPro || 140;
    const defaultCarb = 220;
    const defaultFat = 60;
    const defaultFib = 35;

    for (let i = 0; i < daysCount; i++) {
      const dateKey = getDateKeyForDaysAgo(i);
      const { formattedDate, dayName } = formatReadableDate(dateKey);

      try {
        const logRef = doc(db, 'users', uid, 'dailyLogs', dateKey);
        const snap = await getDoc(logRef);
        const mealsSnap = await getDocs(collection(db, 'users', uid, 'dailyLogs', dateKey, 'meals'));

        const dayMeals: MealItem[] = [];
        if (!mealsSnap.empty) {
          mealsSnap.forEach((docSnap) => {
            const rawData = docSnap.data();
            dayMeals.push({
              id: docSnap.id,
              recipeId: rawData.recipeId || docSnap.id.split('-')[0],
              name: rawData.name || rawData.recipeName || 'Logged Meal',
              type: rawData.mealType || rawData.type || 'breakfast',
              cuisine: rawData.cuisine || 'south-indian',
              dietary: rawData.dietary || 'vegetarian',
              oilLevel: rawData.oilLevel || 'low',
              servings: rawData.servings ?? 1,
              macros: {
                calories: rawData.calories ?? rawData.macros?.calories ?? 0,
                protein: rawData.protein ?? rawData.macros?.protein ?? 0,
                carbs: rawData.carbs ?? rawData.macros?.carbs ?? 0,
                fat: rawData.fat ?? rawData.macros?.fat ?? 0,
                fiber: rawData.fiber ?? rawData.macros?.fiber ?? 0
              },
              nutritionScore: rawData.nutritionScore || 90,
              prepTimeMinutes: rawData.prepTimeMinutes || 15,
              description: rawData.description || '',
              image: rawData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
              recipeSteps: rawData.recipeSteps || [],
              ingredients: rawData.ingredients || [],
              timestamp: rawData.timestamp || new Date().toISOString()
            });
          });
        }

        if (snap.exists()) {
          const data = snap.data() as DailyNutritionTarget;
          const consumedCalories = data.consumedCalories ?? dayMeals.reduce((a, b) => a + b.macros.calories, 0);
          const consumedProtein = data.consumedProtein ?? dayMeals.reduce((a, b) => a + b.macros.protein, 0);
          const consumedCarbs = data.consumedCarbs ?? dayMeals.reduce((a, b) => a + b.macros.carbs, 0);
          const consumedFat = data.consumedFat ?? dayMeals.reduce((a, b) => a + b.macros.fat, 0);
          const consumedFiber = data.consumedFiber ?? dayMeals.reduce((a, b) => a + (b.macros.fiber || 0), 0);

          records.push({
            date: dateKey,
            formattedDate: i === 0 ? 'Today' : formattedDate,
            dayName: i === 0 ? 'Today' : dayName,
            consumedCalories,
            targetCalories: data.targetCalories || defaultCal,
            consumedProtein,
            targetProtein: data.targetProtein || defaultPro,
            consumedCarbs,
            targetCarbs: data.targetCarbs || defaultCarb,
            consumedFat,
            targetFat: data.targetFat || defaultFat,
            consumedFiber,
            targetFiber: data.targetFiber || defaultFib,
            meals: dayMeals
          });
        } else {
          // Real unlogged date from Firestore: 0 consumed, user's target
          const consumedCalories = dayMeals.reduce((a, b) => a + b.macros.calories, 0);
          const consumedProtein = dayMeals.reduce((a, b) => a + b.macros.protein, 0);
          const consumedCarbs = dayMeals.reduce((a, b) => a + b.macros.carbs, 0);
          const consumedFat = dayMeals.reduce((a, b) => a + b.macros.fat, 0);
          const consumedFiber = dayMeals.reduce((a, b) => a + (b.macros.fiber || 0), 0);

          records.push({
            date: dateKey,
            formattedDate: i === 0 ? 'Today' : formattedDate,
            dayName: i === 0 ? 'Today' : dayName,
            consumedCalories,
            targetCalories: defaultCal,
            consumedProtein,
            targetProtein: defaultPro,
            consumedCarbs,
            targetCarbs: defaultCarb,
            consumedFat,
            targetFat: defaultFat,
            consumedFiber,
            targetFiber: defaultFib,
            meals: dayMeals
          });
        }
      } catch (err) {
        console.warn(`Firestore getDailyHistoryRange error for ${dateKey}:`, err);
        records.push({
          date: dateKey,
          formattedDate: i === 0 ? 'Today' : formattedDate,
          dayName: i === 0 ? 'Today' : dayName,
          consumedCalories: 0,
          targetCalories: defaultCal,
          consumedProtein: 0,
          targetProtein: defaultPro,
          consumedCarbs: 0,
          targetCarbs: defaultCarb,
          consumedFat: 0,
          targetFat: defaultFat,
          consumedFiber: 0,
          targetFiber: defaultFib,
          meals: []
        });
      }
    }

    return records;
  },

  // User Favorites: users/{uid}/favorites/{recipeId}
  async getFavorites(uid: string): Promise<string[]> {
    try {
      const favSnap = await getDocs(collection(db, 'users', uid, 'favorites'));
      const favIds: string[] = [];
      favSnap.forEach((docSnap) => {
        favIds.push(docSnap.id);
      });
      return favIds;
    } catch (err) {
      console.warn('Firestore getFavorites fallback:', err);
    }
    return ['m1', 'm2', 'm4', 'm5', 'm7', 'm9'];
  },

  async toggleFavorite(uid: string, recipeId: string, isFav: boolean): Promise<void> {
    try {
      const favRef = doc(db, 'users', uid, 'favorites', recipeId);
      if (isFav) {
        await setDoc(favRef, { addedAt: serverTimestamp() });
      } else {
        await deleteDoc(favRef);
      }
    } catch (err) {
      console.warn('Firestore toggleFavorite:', err);
    }
  }
};
