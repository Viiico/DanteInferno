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

export interface RawMinionSetupJson {
  unlockedMinionSlots: number;
  collectionIntervalHours: number;
  externalIncomeCoinsPerDay: number;
  globalBonuses: MinionSetup['globalBonuses'];
  recurringCosts: MinionSetup['recurringCosts'];
  minions: RawMinionJson[];
}


export interface RawMinionJson {
  tier: InfernoMinionTier;
  active: boolean;
  fuel: {
    rarity: InfernoFuelRarity;
    usesGabagoolDistillate: boolean;
    costCoinsPerDay: number;
  };
  upgrades: Minion['upgrades'];
  recurringCosts: {
    capsaicinEyedropsCoinsPerDay: number;
    otherLocalCostsCoinsPerDay: number;
  };
}


export interface MinionSetup {
  minions: Minion[];

  unlockedMinionSlots: number;
  collectionIntervalHours: number;
  externalIncomeCoinsPerDay: number;

  globalBonuses: {
    postcardActive: boolean;
    beaconTier: 0 | 1 | 2 | 3 | 4 | 5;
    scorchedPowerCrystalActive: boolean;
    otherGlobalSpeedBonus: number;
  };

  recurringCosts: {
    beaconFuelCoinsPerDay: number;
    otherGlobalCostsCoinsPerDay: number;
  };
}

export interface MarketPrices {
  crudeGabagool: number;
  hypergolicIonizedCeramic: number;

  uniqueDrops: Record<InfernoUniqueDropKey, number>;

  fuels: Record<InfernoFuelRarity, number>;
  capsaicinEyedrops: number;
}

export interface Minion {
    tier: InfernoMinionTier;
    active: boolean;

    fuel: InfernoFuelRarity;

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

export const INFERNO_MINION_TIERS = {
  1: { baseActionSeconds: 1013, storageCapacityItems: 64, apexDropMultiplier: 1 },
  2: { baseActionSeconds: 982, storageCapacityItems: 192, apexDropMultiplier: 1 },
  3: { baseActionSeconds: 950, storageCapacityItems: 192, apexDropMultiplier: 1 },
  4: { baseActionSeconds: 919, storageCapacityItems: 384, apexDropMultiplier: 1 },
  5: { baseActionSeconds: 886, storageCapacityItems: 384, apexDropMultiplier: 1 },
  6: { baseActionSeconds: 855, storageCapacityItems: 576, apexDropMultiplier: 1 },
  7: { baseActionSeconds: 823, storageCapacityItems: 576, apexDropMultiplier: 1 },
  8: { baseActionSeconds: 792, storageCapacityItems: 768, apexDropMultiplier: 1 },
  9: { baseActionSeconds: 760, storageCapacityItems: 768, apexDropMultiplier: 1 },
  10: { baseActionSeconds: 728, storageCapacityItems: 960, apexDropMultiplier: 2 },
  11: { baseActionSeconds: 697, storageCapacityItems: 960, apexDropMultiplier: 2 },
} as const;

export type InfernoMinionTier = keyof typeof INFERNO_MINION_TIERS;

export const INFERNO_FUEL = {
  none: { speedMultiplier: 1, enablesUniqueDrops: false, givesCeramic: false },
  rare: { speedMultiplier: 10, enablesUniqueDrops: false, givesCeramic: false },
  epic: { speedMultiplier: 15, enablesUniqueDrops: false, givesCeramic: false },
  legendary: { speedMultiplier: 20, enablesUniqueDrops: true, givesCeramic: true },
} as const;

export type InfernoFuelRarity = keyof typeof INFERNO_FUEL;

export const INFERNO_DROP_TABLE = {
  normalDrops: {
    crudeGabagoolPerGeneratedItem: 1,
  },

  infernoFuelReplacement: {
    replacedProductionShare: 4 / 5,
    gabagoolDistillate: {
      item: "crudeGabagool",
      amountPerReplacedItem: 1,
    },
  },

  legendaryDrops: {
    uniqueRollsPerGeneratedItem: 1,
    hypergolicIonizedCeramicPerExpiredFuel: 1,
    capsaicinEyedropsMultiplier: 1.3,

    uniqueDrops: {
      CHILI_PEPPER: {
        chancePerGeneratedItem: 1 / 136,
        tierMultiplier: {
          default: 1,
        },
      },

      INFERNO_VERTEX: {
        chancePerGeneratedItem: 1 / 5_950,
        tierMultiplier: {
          default: 1,
        },
      },

      INFERNO_APEX: {
        chancePerGeneratedItem: 1 / 1_309_091,
        tierMultiplier: {
          default: 1,
          tier10: 2,
          tier11: 2,
        },
      },

      REAPER_PEPPER: {
        chancePerGeneratedItem: 1 / 458_182,
        tierMultiplier: {
          default: 1,
        },
      },

      GABAGOOL_THE_FISH: {
        chancePerGeneratedItem: 1 / 3_927_273,
        tierMultiplier: {
          default: 1,
        },
      },
    },
  },
} as const;

export type InfernoUniqueDropKey = keyof typeof INFERNO_DROP_TABLE.legendaryDrops.uniqueDrops | "VERY_CRUDE_GABAGOOL";