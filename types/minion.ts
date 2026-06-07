export interface MinionResponse {
    minion_id: string;
    hasInfusion: boolean;
    hasFreeWill: boolean;
    price: number;
    amount: number;
    minion: {
        generator_tier: number,
    }
    user: { username: string };
}

export interface MinionProduct {
    minion_id: string;
    hasInfusion: boolean;
    hasFreeWill: boolean;
    price: number;
    amount: number;
    username: string;
}

export interface MinionSetup {
  minions: Minion[];

  unlockedMinionSlots: number;
  collectionIntervalHours: number;
  externalIncomeCoinsPerDay: number;

  globalBonuses: {
    postcardActive: boolean; // +5% global speed
    beaconTier: 0 | 1 | 2 | 3 | 4 | 5;
    beaconSpeedBonus: number; // e.g. 0.10 for Beacon V
    scorchedPowerCrystalActive: boolean; // extra +1% beacon speed
    otherGlobalSpeedBonus: number; // mayor/events/etc, additive
  };

  prices: {
    crudeGabagool: number;
    hypergolicIonizedCeramic: number;

    uniqueDrops: {
      chiliPepper: number;
      infernoVertex: number;
      infernoApex: number;
      reaperPepper: number;
      gabagoolTheFish: number;
    };
  };

  dropRates: {
    uniqueDrops: {
      chiliPepper: number;
      infernoVertex: number;
      infernoApex: number;
      reaperPepper: number;
      gabagoolTheFish: number;
    };
  };

  recurringCosts: {
    beaconFuelCoinsPerDay: number;
    otherGlobalCostsCoinsPerDay: number;
  };
}

export interface Minion {
  id: string;
  active: boolean;

  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  baseActionSeconds: number;
  storageCapacityItems: number;

  fuel: {
    rarity: "none" | "rare" | "epic" | "legendary";
    speedMultiplier: number; // rare=10, epic=15, legendary=20
    usesGabagoolDistillate: boolean;
    costCoinsPerDay: number;
  };

  upgrades: {
    flycatchers: 0 | 1 | 2; // +20% speed each
    mithrilInfusion: boolean; // +10% speed
    freeWill: boolean; // +10% speed if successful
    capsaicinEyedrops: boolean; // +30% unique-drop rates, no speed
    otherLocalSpeedBonus: number;
  };

  outputModifiers: {
    crudeGabagoolPerGeneratedItem: number; // 1 with Gabagool Distillate
    apexDropMultiplier: number; // 2 for Tier X/XI, else 1
  };

  recurringCosts: {
    capsaicinEyedropsCoinsPerDay: number;
    otherLocalCostsCoinsPerDay: number;
  };
}