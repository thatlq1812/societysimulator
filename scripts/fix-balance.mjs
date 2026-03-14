import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'data', 'scenarios.json');

const scenarios = JSON.parse(readFileSync(filePath, 'utf-8'));

const DELTA_FIELDS = [
  'wealthDelta', 'controlDelta', 'influenceDelta', 'resilienceDelta',
  'allianceDelta', 'stratificationDelta', 'productionDelta', 'innovationDelta',
  'welfareDelta', 'democracyDelta'
];

const roles = ['cong-nhan', 'nong-dan', 'tri-thuc', 'startup'];
let capCount = 0;
let tradeOffCount = 0;
let allianceReduceCount = 0;

// === TASK 1: Cap all deltas at ±15 ===
for (const scenario of scenarios) {
  for (const role of roles) {
    const choices = scenario.roleSpecificChoices[role];
    for (const choice of choices) {
      for (const field of DELTA_FIELDS) {
        const val = choice.effects[field];
        if (val > 15) {
          console.log(`[CAP] ${scenario.id} / ${role} / ${choice.id}: ${field} ${val} → 15`);
          choice.effects[field] = 15;
          capCount++;
        } else if (val < -15) {
          console.log(`[CAP] ${scenario.id} / ${role} / ${choice.id}: ${field} ${val} → -15`);
          choice.effects[field] = -15;
          capCount++;
        }
      }
    }
  }
}

// === TASK 2: Dialectical trade-offs for Choice B ===
const tradeOffs = {
  'tu-dong-hoa': {
    'cong-nhan': { productionDelta: -9 },
    'nong-dan': { productionDelta: -8 },
  },
  'dinh-cong-gig': {
    'cong-nhan': { productionDelta: -8 },
  },
  'bang-sang-che': {
    'startup': { innovationDelta: -4 },
  },
  'mua-lai-startup': {
    'tri-thuc': { innovationDelta: -6 },
    'startup': { innovationDelta: -7 },
  },
  'blockchain-tu-quan': {
    'cong-nhan': { productionDelta: -5 },
    'nong-dan': { productionDelta: -5 },
    'tri-thuc': { productionDelta: -5 },
    'startup': { productionDelta: -5 },
  },
  'san-xuat-xanh': {
    'startup': { productionDelta: -9 },
  },
  'chia-se-nen-tang': {
    'startup': { innovationDelta: -6 },
  },
  'lien-doan-lao-dong-so': {
    'startup': { productionDelta: -6 },
  },
};

for (const scenario of scenarios) {
  const scenarioTradeOffs = tradeOffs[scenario.id];
  if (!scenarioTradeOffs) continue;

  for (const [role, deltas] of Object.entries(scenarioTradeOffs)) {
    const choiceB = scenario.roleSpecificChoices[role].find(c => c.id === 'B');
    if (!choiceB) {
      console.error(`[ERROR] No choice B found for ${scenario.id} / ${role}`);
      continue;
    }
    for (const [field, newVal] of Object.entries(deltas)) {
      const oldVal = choiceB.effects[field];
      console.log(`[TRADE-OFF] ${scenario.id} / ${role} / B: ${field} ${oldVal} → ${newVal}`);
      choiceB.effects[field] = newVal;
      tradeOffCount++;
    }
  }
}

// === TASK 3: Reduce ~30% of B choices with allianceDelta >= 15 ===
// Collect all B choices with high alliance
const highAllianceBChoices = [];
for (const scenario of scenarios) {
  for (const role of roles) {
    const choiceB = scenario.roleSpecificChoices[role].find(c => c.id === 'B');
    if (choiceB && choiceB.effects.allianceDelta >= 15) {
      highAllianceBChoices.push({ scenario, role, choiceB });
    }
  }
}

console.log(`\n[ALLIANCE] Found ${highAllianceBChoices.length} B choices with allianceDelta >= 15`);
const targetCount = Math.round(highAllianceBChoices.length * 0.3);
console.log(`[ALLIANCE] Will reduce ~${targetCount} of them (~30%)`);

// Deterministic: pick every 3rd one (index 0, 3, 6, 9, ...)
const reducedValues = [10, 11, 12, 13]; // cycle through these
let reducedIdx = 0;
for (let i = 0; i < highAllianceBChoices.length; i++) {
  if (i % 3 === 0 && reducedIdx < targetCount) {
    const { scenario, role, choiceB } = highAllianceBChoices[i];
    const oldVal = choiceB.effects.allianceDelta;
    const newVal = reducedValues[reducedIdx % reducedValues.length];
    console.log(`[ALLIANCE] ${scenario.id} / ${role} / B: allianceDelta ${oldVal} → ${newVal}`);
    choiceB.effects.allianceDelta = newVal;
    allianceReduceCount++;
    reducedIdx++;
  }
}

// === Write output ===
writeFileSync(filePath, JSON.stringify(scenarios, null, 2) + '\n', 'utf-8');

console.log('\n=== SUMMARY ===');
console.log(`Task 1 (Cap ±15): ${capCount} values capped`);
console.log(`Task 2 (Trade-offs): ${tradeOffCount} values modified`);
console.log(`Task 3 (Alliance reduction): ${allianceReduceCount} / ${highAllianceBChoices.length} high-alliance B choices reduced`);
console.log('Output written to', filePath);
