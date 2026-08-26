# GAUGE — Macro-Targeted South Indian Nutrition & Diet Planner

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-emerald.svg)](https://gauge-nutrition.web.app)
[![Firebase Hosted](https://img.shields.io/badge/Firebase-Hosting-amber.svg)](https://gauge-nutrition.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**GAUGE** is a personalized South Indian nutrition application and meal generator designed to deliver exact macronutrient targets (Calories, Protein, Carbs, Fat, Fiber) based on verified raw food datasets (ICMR-NIN IFCT 2017 & USDA FoodData Central).

---

## 🌟 Key Features

- **Personalized Onboarding & Target Calculation**: Calculates BMR and TDEE using Mifflin-St Jeor equations tailored to South Indian dietary goals (Weight Loss, Maintenance, Muscle Gain).
- **Deterministic Recommendation Engine**: Filters dishes by meal course, calorie limits, minimum protein targets, cooking oil preferences, and dietary choices.
- **Dynamic Recipe & Oil Adjuster**: Real-time non-linear macro math for portion multipliers (0.5x – 2.0x) and oil levels (0g, 5g, 10g, 15g).
- **Daily Schedule & Logging**: Visual timeline slots for Breakfast, Lunch, Evening Snack, and Dinner with real-time consumed target progress bars.
- **Favorites & Custom Recipe Builder**: Users can save favorite dishes or create custom recipes with automatic macro calculation and per-user Firestore isolation.
- **Nutrition History & Trends**: Comprehensive Daily, Weekly, and Monthly history analytics with lightweight animated SVG charts and target consistency metrics.
- **Full Progressive Web App (PWA)**: Offline static asset precaching, mobile standalone display mode, custom PWA install prompt, and native touch UX.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling & Aesthetics**: Tailwind CSS v4, Vanilla CSS (Obsidian Glass Theme), Lucide Icons
- **Animations**: Framer Motion
- **Backend & Database**: Firebase Auth, Cloud Firestore
- **PWA Integration**: `vite-plugin-pwa`, Workbox
- **Datasets**: ICMR-NIN Indian Food Composition Tables (IFCT 2017), USDA FoodData Central

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tharunchokkanathan/GAUGE.git
   cd GAUGE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and populate your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## 🗄️ Firestore Database Structure

GAUGE isolates user data under user-scoped Firestore paths to enforce security and multi-tenant privacy:

```
cloud_firestore/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   └── data                # User body metrics, targets & preferences
│       ├── dailyLogs/
│       │   └── {YYYY-MM-DD}        # Daily logged meals & nutrition targets
│       │       └── meals/          # Individual logged meal documents
│       ├── favorites/
│       │   └── {recipeId}          # User's saved favorite dish IDs
│       └── customRecipes/
│           └── {recipeId}          # User's created custom recipes
├── recipes/
│   └── {recipeId}                  # Shared verified South Indian recipe catalog
└── foods/
    └── {foodId}                    # Raw open-access food ingredient database
```

---

## 🔒 Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /recipes/{recipeId} {
      allow read: if true;
    }
    match /foods/{foodId} {
      allow read: if true;
    }
  }
}
```

---

## 📱 PWA & Offline Support

- **Standalone Mode**: Runs as a full-screen application on mobile devices.
- **Static Caching**: Pre-caches static assets while bypassing private user Firestore queries to ensure maximum privacy and security.

---

## 🌐 Production Build & Deployment

To build and deploy GAUGE to Firebase Hosting:

```bash
# 1. Generate production bundle
npm run build

# 2. Deploy static site and rules to Firebase Hosting
npx firebase-tools deploy --only hosting,firestore
```

---

## 📄 License
This project is licensed under the MIT License.
