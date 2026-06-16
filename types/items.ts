import type { BazaarPrice } from "./bazaar";
import type { MinionProduct } from "./minion";

export type Source = "bazaar" | "auction_house" | "minion_auction";

// Recipe Definitions (loaded from JSON files)
export interface RawRecipeGrid {
    A1: string; A2: string; A3: string;
    B1: string; B2: string; B3: string;
    C1: string; C2: string; C3: string;
    count: number;
}

export interface SimplifiedRecipe {
    id: string,
    ingredients: Record<string, number>;
    count: number;
}

export interface ItemDef {
    recipeId: string,
    source: Source,
    recipes?: RawRecipeGrid[],
    simplifiedRecipes?: SimplifiedRecipe[],
}

export interface BazaarBuy { type: Extract<Source, "bazaar">; cost: number; }
export interface AuctionHouseBuy { type: Extract<Source, "auction_house">; cost: number; }
export interface MinionAuctionBuy { type: Extract<Source, "minion_auction">; cost: number; }

export type ObtainMethod = BazaarBuy | AuctionHouseBuy | MinionAuctionBuy | CraftMethod;

export interface ExpandedCraftMethod extends Omit<CraftMethod, "ingredients"> {
    ingredients: Record<string, { count: number; obtainMethod: ExpandedObtainMethod }>;
}

export type ExpandedObtainMethod = BazaarBuy | AuctionHouseBuy | MinionAuctionBuy | ExpandedCraftMethod;

// Result of cheapest price calculation
export interface PricedItem {
    directBuyCost?: number,
    cheapest: ObtainMethod;
    requiresManualApplication?: true;
}

export interface CraftMethod {
    type: "craft";
    recipeId: string;
    cost: number;
}

export interface PriceContext {
    itemContent: Map<string, ItemDef>;
    bazaarPrices: Map<string, BazaarPrice>;
    auctionPrices: Map<string, number[]>;
    minionPrices: Map<string, MinionProduct[]>;
    pricedItems: Map<string, PricedItem>;
}
