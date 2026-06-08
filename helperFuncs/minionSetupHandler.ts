import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  Minion,
  MinionSetup,
  InfernoMinionTier,       
  InfernoFuelRarity,
  RawMinionSetupJson,
  RawMinionJson,
} from '../types/minion';
import { INFERNO_MINION_TIERS } from '../types/minion'; 


export function calculateSetupProfit() {

}


function mapRawMinion(raw: RawMinionJson): Minion {
  const tierData = INFERNO_MINION_TIERS[raw.tier];
 
  return {
    tier: raw.tier,
    active: raw.active,
 
    fuel: raw.fuel.rarity,
 
    upgrades: raw.upgrades,
 
    outputModifiers: {
      crudeGabagoolPerGeneratedItem: raw.fuel.usesGabagoolDistillate ? 1 : 0,
      apexDropMultiplier: tierData.apexDropMultiplier,
    },
 
    recurringCosts: {
      capsaicinEyedropsCoinsPerDay: raw.recurringCosts.capsaicinEyedropsCoinsPerDay,
      otherLocalCostsCoinsPerDay:
        raw.recurringCosts.otherLocalCostsCoinsPerDay + raw.fuel.costCoinsPerDay,
    },
  };
}

async function readMinionSetup(): Promise<MinionSetup> {
  const filePath = resolve(__dirname, '../minionSetup.json');
  const raw: RawMinionSetupJson = JSON.parse(await readFile(filePath, 'utf-8'));
 
  return {
    unlockedMinionSlots: raw.unlockedMinionSlots,
    collectionIntervalHours: raw.collectionIntervalHours,
    externalIncomeCoinsPerDay: raw.externalIncomeCoinsPerDay,
    globalBonuses: raw.globalBonuses,
    recurringCosts: raw.recurringCosts,
    minions: raw.minions.map(mapRawMinion),
  };
}

console.log(await readMinionSetup());