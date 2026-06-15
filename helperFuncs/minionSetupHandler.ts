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


export function calculateSetupDrops(minionSetup: MinionSetup): Record<InfernoUniqueDropKey, number> {
  const { collectionIntervalHours, globalBonuses } = minionSetup;
  const { postcardActive, beaconTier, scorchedPowerCrystalActive, otherGlobalSpeedBonus } = globalBonuses;

  const nonFuelGlobalBonuses = beaconTier * 0.02 + (postcardActive ? 0.05 : 0) + (scorchedPowerCrystalActive ? 0.01 : 0) + otherGlobalSpeedBonus;
  const risingCelsiusBonus = 0.18 * Math.min(minionSetup.minions.length, 10);

  const setupDrops = {} as Record<InfernoUniqueDropKey, number>;

  for (const minion of minionSetup.minions) {
    const minionDrops = calculateMinionDrops(minion, collectionIntervalHours, nonFuelGlobalBonuses, risingCelsiusBonus);
    for (const [key, value] of Object.entries(minionDrops) as [InfernoUniqueDropKey, number][]) {
      if (!setupDrops[key]) setupDrops[key] = value;
      else setupDrops[key] += value;
    }
  }

  return setupDrops;
}

function calculateMinionDrops(minion: Minion, collectionIntervalHours: number, nonFuelGlobalBonuses: number, risingCelsiusBonus: number): Partial<Record<InfernoUniqueDropKey, number>> {
  const harvestCount = calculateHarvestCount(minion, collectionIntervalHours, nonFuelGlobalBonuses, risingCelsiusBonus);
  const veryCrudeGabagoolDrops = harvestCount / 192;

  if (minion.fuel !== "legendary") return { "VERY_CRUDE_GABAGOOL": veryCrudeGabagoolDrops };

  const legendaryDrops = (Object.entries(INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops) as [InfernoUniqueDropKey, { chancePerGeneratedItem: number }][])
    .reduce<Partial<Record<InfernoUniqueDropKey, number>>>((acc, [key, drop]) => {
      if (key === "INFERNO_APEX" && INFERNO_FUEL[minion.fuel].enablesUniqueDrops) acc[key] = harvestCount * drop.chancePerGeneratedItem * 2;
      else acc[key] = harvestCount * drop.chancePerGeneratedItem;
      return acc;
    }, {});

  legendaryDrops["VERY_CRUDE_GABAGOOL"] = veryCrudeGabagoolDrops;
  return legendaryDrops;
}

function calculateHarvestCount(minion: Minion, collectionIntervalHours: number, nonFuelGlobalBonuses: number, risingCelsiusBonus: number): number {
  const { flycatchers, mithrilInfusion, freeWill } = minion.upgrades;

  const nonFuelMinionBonuses = risingCelsiusBonus + flycatchers * 0.2 + (mithrilInfusion ? 0.1 : 0) + (freeWill ? 0.1 : 0);
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

export async function readMinionSetup(): Promise<MinionSetup> {
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