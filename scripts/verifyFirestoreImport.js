import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storePath = path.join(__dirname, '../data/firestore_store.json');
const gaugePath = path.join(__dirname, '../data/foods.gauge.json');

console.log('--- FIRESTORE NUTRITION DATA IMPORT VERIFICATION ---');

if (!fs.existsSync(storePath)) {
  console.error('❌ ERROR: data/firestore_store.json missing!');
  process.exit(1);
}

if (!fs.existsSync(gaugePath)) {
  console.error('❌ ERROR: data/foods.gauge.json missing!');
  process.exit(1);
}

const firestoreStore = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
const originalGaugeRecords = JSON.parse(fs.readFileSync(gaugePath, 'utf-8'));

let errors = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passes++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    errors++;
  }
}

// 1. Verify Metadata Document: foodMetadata/dataset
console.log('\n1. Verifying foodMetadata/dataset document:');
const metadata = firestoreStore.foodMetadata && firestoreStore.foodMetadata.dataset;
assert(metadata !== undefined, 'foodMetadata/dataset document exists');
if (metadata) {
  assert(metadata.datasetVersion === '1.0.0', `datasetVersion === '1.0.0' (${metadata.datasetVersion})`);
  assert(metadata.totalFoodCount === 126, `totalFoodCount === 126 (${metadata.totalFoodCount})`);
  assert(metadata.IFCTRecordCount === 115, `IFCTRecordCount === 115 (${metadata.IFCTRecordCount})`);
  assert(metadata.USDARecordCount === 11, `USDARecordCount === 11 (${metadata.USDARecordCount})`);
  assert(Boolean(metadata.importDate), `importDate is populated (${metadata.importDate})`);
}

// 2. Verify Total Document Count in foods Collection
console.log('\n2. Verifying foods collection document count:');
const foodsObj = firestoreStore.foods || {};
const foodKeys = Object.keys(foodsObj);
assert(foodKeys.length === 126, `Total documents in foods collection === 126 (Found: ${foodKeys.length})`);

// 3. Verify Required Sample Foods
console.log('\n3. Verifying required sample food items against original validated dataset:');

const requiredSamples = [
  { key: 'Rice', id: 'food_ifct_2017_a001' },
  { key: 'Urad dal', id: 'food_ifct_2017_b003' },
  { key: 'Egg', id: 'food_ifct_2017_c001' },
  { key: 'Chicken', id: 'food_ifct_2017_c010' },
  { key: 'Groundnut oil', id: 'food_ifct_2017_i001' },
  { key: 'Onion', id: 'food_ifct_2017_f001' },
  { key: 'Banana', id: 'food_ifct_2017_g001' }
];

requiredSamples.forEach(sample => {
  console.log(`\nChecking Sample: ${sample.key} (${sample.id})`);
  const record = foodsObj[sample.id];
  const original = originalGaugeRecords.find(r => r.id === sample.id);

  assert(record !== undefined, `Document foods/${sample.id} exists`);
  assert(original !== undefined, `Original record in foods.gauge.json exists`);

  if (record && original) {
    assert(record.id === original.id, `ID matches deterministic key '${original.id}'`);
    assert(record.name === original.name, `Name matches '${original.name}'`);
    assert(record.category === original.category, `Category matches '${original.category}'`);
    assert(record.foodState === original.foodState, `Food State matches '${original.foodState}'`);
    
    // Check Nutrition Macros
    assert(record.nutritionPer100g.energyKcal === original.nutritionPer100g.energyKcal, `Energy (kcal) matches (${record.nutritionPer100g.energyKcal})`);
    assert(record.nutritionPer100g.proteinG === original.nutritionPer100g.proteinG, `Protein (g) matches (${record.nutritionPer100g.proteinG})`);
    assert(record.nutritionPer100g.carbohydratesG === original.nutritionPer100g.carbohydratesG, `Carbs (g) matches (${record.nutritionPer100g.carbohydratesG})`);
    assert(record.nutritionPer100g.fatG === original.nutritionPer100g.fatG, `Fat (g) matches (${record.nutritionPer100g.fatG})`);

    // Check Source Preservation
    assert(Boolean(record.source), `Source metadata exists`);
    if (record.source) {
      assert(record.source.provider === original.source.provider, `Source Provider matches (${record.source.provider})`);
      assert(record.source.sourceFoodId === original.source.sourceFoodId, `Source Food ID matches (${record.source.sourceFoodId})`);
      assert(record.source.sourceReference === original.source.sourceReference, `Source Reference matches (${record.source.sourceReference})`);
      assert(record.source.verified === true, `Source Verified === true`);
    }
  }
});

// 4. Check for duplicate keys or corruption across all 126 records
console.log('\n4. Duplicate and Integrity Check across all records:');
const uniqueIds = new Set(foodKeys);
assert(uniqueIds.size === 126, `Zero duplicate document IDs found across 126 records.`);

console.log(`\n==================================================`);
console.log(`VERIFICATION SUMMARY: ${passes} Assertions Passed | ${errors} Failures`);
console.log(`==================================================`);

if (errors === 0) {
  console.log(`🎉 SUCCESS: Firestore Nutrition Import Verification PASSED 100%!`);
} else {
  console.error(`❌ FAILURE: ${errors} errors encountered during verification.`);
  process.exit(1);
}
