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
  const { collectionIntervalHours, globalBonuses } = minionSetup;
  const { postcardActive, beaconTier, scorchedPowerCrystalActive } = globalBonuses;
  const { beaconPerTier, postcard, scorchedPowerCrystal, risingCelsius } = SPEED_BONUSES.global;

  const numberOfDays = Math.floor(collectionIntervalHours / 24);
  const minionNumber = minionSetup.minions.length;

  const nonFuelGlobalBonuses = beaconTier * beaconPerTier + (postcardActive ? postcard : 0) + (scorchedPowerCrystalActive ? scorchedPowerCrystal : 0);
  const risingCelsiusBonus = risingCelsius.perMinion * Math.min(minionNumber, risingCelsius.maxStack);
  const fuelCost = prepareFuelCost(pricedItems);

  const setupDrops = {} as Record<InfernoUniqueDropKey, number>;
  let dailyFuelCost = 0;
  for (const minion of minionSetup.minions) {
    const minionDrops = calculateHourlyMinionDrops(minion, nonFuelGlobalBonuses, risingCelsiusBonus);
    for (const [key, amount] of Object.entries(minionDrops) as [InfernoUniqueDropKey, number][]) {
      if (!setupDrops[key]) setupDrops[key] = amount * collectionIntervalHours;
      else setupDrops[key] += amount * collectionIntervalHours;
    }

    dailyFuelCost += fuelCost[minion.fuel];
    if (minion.upgrades.capsaicinEyedrops) dailyFuelCost += pricedItems.get("CAPSAICIN_EYEDROPS_NO_CHARGES")?.cheapest.cost ?? 0;
  }

  let setupProfit = Object.entries(setupDrops).reduce((acc, [productName, productAmount]) => {
    const itemPrice = pricedItems.get(productName)?.cheapest.cost ?? 0;
    return acc + (itemPrice === Infinity ? 0 : itemPrice) * productAmount;
  }, 0);

  setupProfit += numberOfDays * minionNumber * (pricedItems.get("HYPERGOLIC_IONIZED_CERAMICS")?.cheapest.cost ?? 0);

  return Math.ceil(setupProfit - numberOfDays*dailyFuelCost);
}

function calculateHourlyMinionDrops(minion: Minion, nonFuelGlobalBonuses: number, risingCelsiusBonus: number): Partial<Record<InfernoUniqueDropKey, number>> {
  const harvestCount = calculateHarvestCount(minion, nonFuelGlobalBonuses, risingCelsiusBonus) * 3600;
  const veryCrudeGabagoolDrops = harvestCount / 192;

  if (minion.fuel !== "legendary") return { "VERY_CRUDE_GABAGOOL": veryCrudeGabagoolDrops };

  const legendaryDrops = (Object.entries(INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops) as [BaseUniqueDropKey, { chancePerGeneratedItem: number }][])
    .reduce<Partial<Record<InfernoUniqueDropKey, number>>>((acc, [key, drop]) => {
      const baseDropAmount = harvestCount * drop.chancePerGeneratedItem * (minion.upgrades.capsaicinEyedrops ? 1.3 : 1);
      if (INFERNO_FUEL[minion.fuel].enablesUniqueDrops && INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops[key].tierMultiplier) acc[key] = baseDropAmount * 2;
      else acc[key] = baseDropAmount;
      return acc;
    }, {});

  legendaryDrops["VERY_CRUDE_GABAGOOL"] = veryCrudeGabagoolDrops;
  return legendaryDrops;
}


function calculateHarvestCount(minion: Minion, nonFuelGlobalBonuses: number, risingCelsiusBonus: number): number {
  const { flycatchers, mithrilInfusion, freeWill } = minion.upgrades;
  const { perFlycatcherBonus, mithrilInfusionBonus, freeWillBonus } = SPEED_BONUSES.local;

  const nonFuelMinionBonuses = risingCelsiusBonus + flycatchers * perFlycatcherBonus + (mithrilInfusion ? mithrilInfusionBonus : 0) + (freeWill ? freeWillBonus : 0);
  const nonFuelBonuses = nonFuelMinionBonuses + nonFuelGlobalBonuses;

  const baseMinionActionTime = INFERNO_MINION_TIERS[minion.tier].baseActionSeconds;
  const infernoFuelMultiplier = INFERNO_FUEL[minion.fuel].speedMultiplier;

  return infernoFuelMultiplier * (1 + nonFuelBonuses) / (2 * baseMinionActionTime);
}


function mapRawMinion(raw: RawMinionJson): Minion {
  const tierData = INFERNO_MINION_TIERS[raw.tier];

  return {
    tier: raw.tier,
    fuel: raw.fuel,

    upgrades: raw.upgrades,

    outputModifiers: {
      crudeGabagoolPerGeneratedItem: 1,
      apexDropMultiplier: tierData.apexDropMultiplier,
    }
  };
}

async function readMinionSetup(): Promise<MinionSetup> {
  const filePath = resolve(import.meta.dir, '../minionSetup.json');
  const raw: RawMinionSetupJson = JSON.parse(await readFile(filePath, 'utf-8'));

  return {
    unlockedMinionSlots: raw.unlockedMinionSlots,
    collectionIntervalHours: raw.collectionIntervalHours,
    externalIncomeCoinsPerDay: raw.externalIncomeCoinsPerDay,
    globalBonuses: raw.globalBonuses,
    minions: raw.minions.map(mapRawMinion),
  };
}

function prepareFuelCost(pricedItems: Map<string, PricedItem>): Record<InfernoFuelRarity, number> {
  return {
    "none": 0,
    "rare": pricedItems.get("INFERNO_FUEL_CRUDE_GABAGOOL")?.cheapest.cost ?? 0,
    "epic": pricedItems.get("INFERNO_HEAVY_CRUDE_GABAGOOL")?.cheapest.cost ?? 0,
    "legendary": pricedItems.get("INFERNO_HYPERGOLIC_CRUDE_GABAGOOL")?.cheapest.cost ?? 0
  }
}

function predictFillUpTimeHours(minionDrops: Partial<Record<InfernoUniqueDropKey, number>>) {
    // const 
    // console.log(minionDrops)
}