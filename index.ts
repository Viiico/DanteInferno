import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation.js";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";
import {fetchMinionPrices} from "./helperFuncs/minionAhHandler.js";

import type { AuctionHouseBuy, BazaarBuy, CraftMethod, MinionAuctionBuy, ObtainMethod, PricedItem, SimplifiedRecipe, Source } from "./types/items.js";

const itemContent = await prepareItemContent();
const { neededBazaarItems, neededAuctionItems, neededMinions } = prepareNeededItems(itemContent);

const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);
const minionPrices = await fetchMinionPrices();

const pricedItems = new Map<string, PricedItem>();

// resolveItemPrice("INFERNO_GENERATOR_11");
for(const itemId of itemContent.keys()){
    console.log(`Resolving ${itemId}`);
    resolveItemPrice(itemId);
}

console.log(itemContent.size)

Bun.write("./pricedItems.json", JSON.stringify([...pricedItems], null, 2));

function resolveItemPrice(productId: string): PricedItem | undefined{
    const cached = pricedItems.get(productId);
    if(cached) return cached;

    const product = itemContent.get(productId);
    if(!product) throw new Error(`No product found with id ${productId}`);

    const craftingPrice = calculateCraftPrice(productId, product.simplifiedRecipes);

    const buyPrice = getBuyPrice(productId, product.source);
    const useCraft = craftingPrice && craftingPrice.cost < (buyPrice ?? Infinity);
    const result = {
        ...(useCraft && { directBuyCost: buyPrice ?? Infinity}),
        cheapest: useCraft ? craftingPrice : { type: product.source, cost: buyPrice ?? Infinity },
    }

    pricedItems.set(productId, result);
    return result;
}

function calculateCraftPrice(productId: string, simplifiedRecipes: SimplifiedRecipe[] | undefined): CraftMethod | undefined {
    if(!simplifiedRecipes) return undefined;
    let crafts: CraftMethod[] = [];

    for(const simplifiedRecipe of simplifiedRecipes){
        const { ingredients } = simplifiedRecipe;
        const mappedIngredients: Record<string, number> = {};

        const craftPrice = ingredients.reduce((acc, { ingredient, count }) => {
            const ingredientPrice = resolveItemPrice(ingredient);
            if(ingredientPrice) mappedIngredients[ingredient] = count;
            return acc + (ingredientPrice ? ingredientPrice.cheapest.cost * count : Infinity);
        }, 0) / simplifiedRecipe.count;

        crafts.push({ type: "craft", recipeId: simplifiedRecipe.id, cost: Math.floor(craftPrice), ingredients: mappedIngredients });
    }

    if(crafts.length === 0) return undefined;
    return crafts.reduce((cheapest, craft) => craft.cost < cheapest.cost ? craft : cheapest);
}

function getBuyPrice(productId: string, source: Source): number | undefined {
    switch(source){
        case "auction_house": return auctionItemPrice(productId).cost;
        case "bazaar": return bazaarItemPrice(productId).cost;
        case "minion_auction": return minionItemPrice(productId).cost;
        default: throw new Error(`Unsupported source ${source}`);
    }
}

function auctionItemPrice(productId: string): AuctionHouseBuy {
    const price = auctionPrices.get(productId)?.[0] ?? Infinity;
    return { type: "auction_house", cost: price };

}

function bazaarItemPrice(productId: string): BazaarBuy {
    const price = bazaarPrices.get(productId);
    return { type: "bazaar", cost: price ? price.instantBuyPrice : Infinity };
}

function minionItemPrice(productId: string): MinionAuctionBuy {
    const minionPrice = minionPrices.get(productId)?.[0]?.price ?? Infinity;
    return { type: "minion_auction", cost: minionPrice };
}