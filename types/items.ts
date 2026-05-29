export interface ItemDef {
    recipeId: string,
    source: "bazaar" | "auction_house" | "minion_auction",
    recipes?: RawRecipeGrid[],
    simplifiedRecipes?: SimplifiedRecipe[],
}

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