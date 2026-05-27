export interface ItemDef {
    recipeId: string,
    source: "bazaar" | "auction_house" | "minion_auction",
    recipes?: Recipe[];
}

export interface Recipe {
    id: string,
    ingredients: {ingredient: string, count: number}[],
    count: number;
}