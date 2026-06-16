import { readFile } from 'fs/promises';
import { resolve } from 'path';
import {
  type Minion,
  type MinionSetup,
  type InfernoMinionTier,
  type InfernoFuelRarity,
  type RawMinionSetupJson,
  type RawMinionJson,
  type InfernoUniqueDropKey,
  type BaseUniqueDropKey,
  SPEED_BONUSES,
} from '../types/minion';
import { INFERNO_DROP_TABLE, INFERNO_FUEL, INFERNO_MINION_TIERS } from '../types/minion';
import type { PricedItem } from '../types/items';

export async function calculateSetupProfit(pricedItems: Map<string, PricedItem>): Promise<number> {
  const minionSetup = await readMinionSetup();
  const setupDrops = calculateSetupDrops(minionSetup);
  const setupProfit = Object.entries(setupDrops).reduce((acc, [productName, productAmount]) => {
    const itemPrice = pricedItems.get(productName)?.cheapest.cost ?? 0;
    return acc + itemPrice * productAmount;
  }, 0);
  return Math.ceil(setupProfit);
}

function calculateSetupDrops(minionSetup: MinionSetup): Record<InfernoUniqueDropKey, number> {
  const { collectionIntervalHours, globalBonuses } = minionSetup;
  const { postcardActive, beaconTier, scorchedPowerCrystalActive, otherGlobalSpeedBonus } = globalBonuses;
  const { beaconPerTier, postcard, scorchedPowerCrystal, risingCelsius } = SPEED_BONUSES.global;

  const nonFuelGlobalBonuses = beaconTier * beaconPerTier + (postcardActive ? postcard : 0) + (scorchedPowerCrystalActive ? scorchedPowerCrystal : 0) + otherGlobalSpeedBonus;
  const risingCelsiusBonus = risingCelsius.perMinion * Math.min(minionSetup.minions.length, risingCelsius.maxStack);

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

  const legendaryDrops = (Object.entries(INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops) as [BaseUniqueDropKey, { chancePerGeneratedItem: number }][])
    .reduce<Partial<Record<InfernoUniqueDropKey, number>>>((acc, [key, drop]) => {
      const baseDropAmount = harvestCount * drop.chancePerGeneratedItem * (minion.upgrades.capsaicinEyedrops ? 1.3 : 0);
      if (INFERNO_FUEL[minion.fuel].enablesUniqueDrops && INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops[key].tierMultiplier) acc[key] = baseDropAmount * 2;
      else acc[key] = baseDropAmount;
      return acc;
    }, {});

  legendaryDrops["VERY_CRUDE_GABAGOOL"] = veryCrudeGabagoolDrops;
  return legendaryDrops;
}

function calculateHarvestCount(minion: Minion, collectionIntervalHours: number, nonFuelGlobalBonuses: number, risingCelsiusBonus: number): number {
  const { flycatchers, mithrilInfusion, freeWill } = minion.upgrades;
  const { perFlycatcherBonus, mithrilInfusionBonus, freeWillBonus } = SPEED_BONUSES.local;

  const nonFuelMinionBonuses = risingCelsiusBonus + flycatchers * perFlycatcherBonus + (mithrilInfusion ? mithrilInfusionBonus : 0) + (freeWill ? freeWillBonus : 0);
  const nonFuelBonuses = nonFuelMinionBonuses + nonFuelGlobalBonuses;

  const baseMinionActionTime = INFERNO_MINION_TIERS[minion.tier].baseActionSeconds;
  const infernoFuelMultiplier = INFERNO_FUEL[minion.fuel].speedMultiplier;

  return (3600 * collectionIntervalHours) / (2 * baseMinionActionTime) * infernoFuelMultiplier * (1 + nonFuelBonuses);
}


function mapRawMinion(raw: RawMinionJson): Minion {
  const tierData = INFERNO_MINION_TIERS[raw.tier];

  return {
    tier: raw.tier,
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