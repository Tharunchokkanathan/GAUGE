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
import type { MealItem, UserProfileData, DailyNutritionTarget, MealType } from '../types';
import { MOCK_MEALS, MOCK_DAILY_NUTRITION } from '../data/mockData';

// Format YYYY-MM-DD for date keys
export const getTodayDateKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

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
    return [];
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
    return null;
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

  // Seed recipes if shared database is unpopulated
  async seedRecipesIfEmpty(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, 'recipes'));
      if (snap.empty) {
        for (const meal of MOCK_MEALS) {
          await setDoc(doc(db, 'recipes', meal.id), meal);
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
          const meal = docSnap.data() as MealItem;
          const section = meal.type === 'all' ? 'breakfast' : meal.type;
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
      await setDoc(mealRef, meal);
    } catch (err) {
      console.warn('Firestore addMealToLog:', err);
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
