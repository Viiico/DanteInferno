import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  Minion,
  MinionSetup,
  InfernoMinionTier,       
  InfernoFuelRarity,
  RawMinionSetupJson,
  RawMinionJson,
  InfernoUniqueDropKey,
} from '../types/minion';
import { INFERNO_DROP_TABLE, INFERNO_FUEL, INFERNO_MINION_TIERS } from '../types/minion'; 


export function calculateSetupProfit(minionSetup: MinionSetup): number {
  const {collectionIntervalHours, globalBonuses} = minionSetup;
  const {postcardActive, beaconTier, scorchedPowerCrystalActive, otherGlobalSpeedBonus} = globalBonuses;

  const nonFuelGlobalBonuses = beaconTier * 0.02 + (postcardActive ? 0.05 : 0) + (scorchedPowerCrystalActive ? 0.01 : 0) + otherGlobalSpeedBonus;
  const havestCount = calculateHarvestCount(minionSetup.minions[0]!, collectionIntervalHours, nonFuelGlobalBonuses);

  const drops = calculateMinionDrops(minionSetup.minions[0]!, havestCount);
  console.log(drops)
}

function calculateMinionDrops(minion: Minion, harvestCount: number): Partial<Record<InfernoUniqueDropKey, number>>  {
  const veryCrudeGabagoolDrops = harvestCount / 192;

  if(minion.fuel !== "legendary") return {"VERY_CRUDE_GABAGOOL": veryCrudeGabagoolDrops};

  const legendaryDrops = Object.entries(INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops).reduce((acc, [key, drop]) => {
    acc[key as InfernoUniqueDropKey] = harvestCount * drop.chancePerGeneratedItem;
    return acc;
  }, {} as Partial<Record<InfernoUniqueDropKey, number>>);

  legendaryDrops["VERY_CRUDE_GABAGOOL"] = veryCrudeGabagoolDrops;
  return legendaryDrops;
}

function calculateHarvestCount(minion: Minion, collectionIntervalHours: number, nonFuelGlobalBonuses: number): number{
  const {flycatchers, mithrilInfusion, freeWill} = minion.upgrades;

  const risingCelsiusBonus = 0.18 * Math.min(minionSetup.minions.length, 10);
  const nonFuelMinionBonuses = risingCelsiusBonus + 0.2 * flycatchers + (mithrilInfusion ? 0.1 : 0) + (freeWill ? 0.1 : 0);
  const nonFuelBonuses = nonFuelMinionBonuses + nonFuelGlobalBonuses;

  const baseMinionActionTime = INFERNO_MINION_TIERS[minion.tier].baseActionSeconds;
  const infernoFuelMultiplier = INFERNO_FUEL[minion.fuel].speedMultiplier;

  return (3600 * collectionIntervalHours) / (2 * baseMinionActionTime) * infernoFuelMultiplier * (1 + nonFuelBonuses);
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
  const filePath = resolve(__dirname, '../minionSetup2.json');
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

const minionSetup = await readMinionSetup();
console.log(calculateSetupProfit(minionSetup));