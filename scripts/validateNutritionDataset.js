import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawPath = path.join(__dirname, '../data/foods.raw.json');
const gaugePath = path.join(__dirname, '../data/foods.gauge.json');

console.log('--- STARTING NUTRITION DATASET INTEGRITY VALIDATION ---');

if (!fs.existsSync(rawPath)) {
  console.error('ERROR: foods.raw.json does not exist!');
  process.exit(1);
}

if (!fs.existsSync(gaugePath)) {
  console.error('ERROR: foods.gauge.json does not exist!');
  process.exit(1);
}

const rawList = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
const gaugeList = JSON.parse(fs.readFileSync(gaugePath, 'utf-8'));

let errors = 0;
let warnings = 0;

// Rule 1: Item counts match
console.log(`\n1. Checking record counts: Raw (${rawList.length}), Gauge (${gaugeList.length})`);
if (rawList.length !== gaugeList.length) {
  console.error(`❌ ERROR: Raw count (${rawList.length}) does not match Gauge count (${gaugeList.length})`);
  errors++;
} else {
  console.log(`✅ Record count check passed: ${gaugeList.length} items`);
}

// Rule 2: Duplicate IDs check
const rawIds = new Set();
const gaugeIds = new Set();

rawList.forEach((item, index) => {
  if (!item.rawId) {
    console.error(`❌ ERROR: Missing rawId at index ${index}`);
    errors++;
  } else if (rawIds.has(item.rawId)) {
    console.error(`❌ ERROR: Duplicate rawId '${item.rawId}' found at index ${index}`);
    errors++;
  } else {
    rawIds.add(item.rawId);
  }
});

gaugeList.forEach((item, index) => {
  if (!item.id) {
    console.error(`❌ ERROR: Missing id at index ${index}`);
    errors++;
  } else if (gaugeIds.has(item.id)) {
    console.error(`❌ ERROR: Duplicate id '${item.id}' found at index ${index}`);
    errors++;
  } else {
    gaugeIds.add(item.id);
  }
});

if (rawIds.size === rawList.length && gaugeIds.size === gaugeList.length) {
  console.log(`✅ ID uniqueness check passed.`);
}

// Rule 3: Schema and Value Integrity Verification
const requiredFields = ['id', 'name', 'category', 'subCategory', 'foodState', 'servingUnit', 'defaultServingGrams', 'nutritionPer100g', 'source'];
const macroKeys = ['energyKcal', 'proteinG', 'carbohydratesG', 'fatG'];
const microKeys = ['fiberG', 'sugarG', 'sodiumMg', 'calciumMg', 'ironMg', 'potassiumMg', 'vitaminAMcg', 'vitaminCMg', 'vitaminDMcg', 'vitaminB12Mcg', 'folateMcg'];

const validCategories = [
  'rice_grains', 'pulses_legumes', 'eggs', 'chicken', 'fish_seafood',
  'dairy', 'vegetables', 'fruits', 'nuts_seeds', 'oils_fats',
  'spices_condiments', 'basic_ingredients'
];

gaugeList.forEach((item) => {
  // Check required fields
  requiredFields.forEach(field => {
    if (item[field] === undefined || item[field] === null) {
      console.error(`❌ ERROR [${item.id}]: Missing required field '${field}'`);
      errors++;
    }
  });

  // Check Category
  if (!validCategories.includes(item.category)) {
    console.error(`❌ ERROR [${item.id}]: Invalid category '${item.category}'`);
    errors++;
  }

  // Check Serving Grams
  if (typeof item.defaultServingGrams !== 'number' || item.defaultServingGrams <= 0) {
    console.error(`❌ ERROR [${item.id}]: Invalid defaultServingGrams ${item.defaultServingGrams}`);
    errors++;
  }

  // Check Macros (Must be non-negative numbers)
  const n = item.nutritionPer100g || {};
  macroKeys.forEach(m => {
    if (typeof n[m] !== 'number' || n[m] < 0) {
      console.error(`❌ ERROR [${item.id}]: Invalid macronutrient '${m}' value (${n[m]})`);
      errors++;
    }
  });

  // Check Micros (Must be non-negative number OR explicit null)
  microKeys.forEach(m => {
    if (n[m] !== null && (typeof n[m] !== 'number' || n[m] < 0)) {
      console.error(`❌ ERROR [${item.id}]: Invalid micronutrient '${m}' value (${n[m]})`);
      errors++;
    }
  });

  // Check Source metadata
  if (!item.source || !item.source.provider || !item.source.sourceFoodId || item.source.verified !== true) {
    console.error(`❌ ERROR [${item.id}]: Unverified or missing source metadata`);
    errors++;
  }
});

console.log(`\n--- VALIDATION SUMMARY ---`);
console.log(`Total Records Validated: ${gaugeList.length}`);
console.log(`Errors Found: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0) {
  console.log(`🎉 SUCCESS: Nutrition dataset is 100% compliant with GAUGE schema specification!`);
} else {
  console.error(`❌ FAILED: Found ${errors} dataset validation issues.`);
  process.exit(1);
}
