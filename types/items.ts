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
    ingredients: {ingredient: string, count: number}[],
    count: number;
}

export interface ItemDef {
    recipeId: string,
    source: Source,
    recipes?: RawRecipeGrid[],
    simplifiedRecipes?: SimplifiedRecipe[],
}

export interface BazaarBuy {type: Extract<Source, "bazaar">; cost: number;}
export interface AuctionHouseBuy {type: Extract<Source, "auction_house">; cost: number;}
export interface MinionAuctionBuy {type: Extract<Source, "minion_auction">; cost: number;}

export type ObtainMethod = BazaarBuy | AuctionHouseBuy | MinionAuctionBuy | CraftMethod;

// Result of cheapest price calculation
export interface PricedItem {
    itemId: string;
    cheapest: ObtainMethod;
    requiresManualApplication?: true;
}

export interface CraftMethod {
    type: "craft";
    recipeId: string;
    cost: number;
    ingredients: Record<string, ObtainMethod>;
}