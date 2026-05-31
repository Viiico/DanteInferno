import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation.js";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";
import {fetchMinionPrices} from "./helperFuncs/minionAhHandler.js";

import type { AuctionHouseBuy, BazaarBuy, CraftMethod, MinionAuctionBuy, ObtainMethod, PricedItem, SimplifiedRecipe } from "./types/items.js";

const itemContent = await prepareItemContent();
const { neededBazaarItems, neededAuctionItems, neededMinions } = prepareNeededItems(itemContent);

const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);
const minionPrices = await fetchMinionPrices();

const pricedItems = new Map<string, PricedItem>();

resolveItemPrice("INFERNO_GENERATOR_11");

console.log(pricedItems);
Bun.write("./pricedItems.json", JSON.stringify([...pricedItems], null, 2));

function resolveItemPrice(productId: string): PricedItem | undefined{
    const cached = pricedItems.get(productId);
    if(cached) return cached;

    const product = itemContent.get(productId);
    if(!product) throw new Error(`No product found with id ${productId}`);

    const craftingPrice = calculateCraftPrice(productId, product.simplifiedRecipes);
    console.log(craftingPrice + "crafted");

    let result: PricedItem | undefined;

    switch(product.source) {
        case "auction_house": {
            const buyPrice = auctionItemPrice(productId);
            const useCraft = craftingPrice && craftingPrice.cost < buyPrice.cost;
            result = {
                ...(useCraft && { directBuyCost: buyPrice.cost}),
                cheapest: useCraft ? craftingPrice : buyPrice,
            };
            break;
        }
        case "bazaar": {
            const buyPrice = bazaarItemPrice(productId);
            const useCraft = craftingPrice && craftingPrice.cost < buyPrice.cost;
            console.log(`Item ${productId} has bazaar price ${buyPrice.cost} and crafting price ${craftingPrice?.cost}`);
            result = {
                ...(useCraft && { directBuyCost: buyPrice.cost}),
                cheapest: useCraft ? craftingPrice : buyPrice,
            };
            break;
        }
        case "minion_auction": {
            const buyPrice = minionItemPrice(productId);
            const useCraft = craftingPrice && craftingPrice.cost < buyPrice.cost;
            console.log(`Item ${productId} has minion price ${buyPrice.cost} and crafting price ${craftingPrice?.cost}`);
            result = {
                ...(useCraft && { directBuyCost: buyPrice.cost}),
                cheapest: useCraft ? craftingPrice : buyPrice,
            };
            break;
        }
    }

    console.log(productId, result)

    if(result) pricedItems.set(productId, result);
    return result;
}

function calculateCraftPrice(productId: string, simplifiedRecipes: SimplifiedRecipe[] | undefined): CraftMethod | undefined {
    if(!simplifiedRecipes) return undefined;
    let crafts: CraftMethod[] = [];

    for(const simplifiedRecipe of simplifiedRecipes){
        const { ingredients } = simplifiedRecipe;

        const ingredientPrices: Record<string, PricedItem> = {};
        const ingredientNames: string[] = [];

        const craftPrice = ingredients.reduce((acc, { ingredient, count }) => {
            const ingredientPrice = resolveItemPrice(ingredient);
            if (ingredientPrice) ingredientPrices[ingredient] = ingredientPrice;
            if (ingredientPrice) ingredientNames.push(ingredient);
            return acc + (ingredientPrice ? ingredientPrice.cheapest.cost * count : Infinity);
        }, 0) / simplifiedRecipe.count;

        crafts.push({ type: "craft", recipeId: simplifiedRecipe.id, cost: craftPrice, ingredients: ingredientNames });
    }

    if(crafts.length === 0) return undefined;
    return crafts.reduce((cheapest, craft) => craft.cost < cheapest.cost ? craft : cheapest);
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