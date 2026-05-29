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

// Purchase Methods
export interface BazaarBuy {type: "buy_bazaar"; cost: number;}
export interface AuctionHouseBuy {type: "buy_auction"; cost: number;}
export interface MinionAuctionBuy {type: "buy_minion_auction"; cost: number;}

export interface CraftMethod {
    type: "craft";
    recipe: SimplifiedRecipe;
    cost: number;
    ingredients: Record<string, PricedItem>;
}

// Result of cheapest price calculation
export interface PricedItem {
    itemId: string;
    cheapest: BazaarBuy | AuctionHouseBuy | MinionAuctionBuy | CraftMethod;
    requiresManualApplication?: true;
}