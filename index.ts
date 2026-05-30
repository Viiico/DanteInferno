import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation.js";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";
import {fetchMinionPrices} from "./helperFuncs/minionAhHandler.js";

import type { AuctionHouseBuy, BazaarBuy, CraftMethod, ObtainMethod, PricedItem, SimplifiedRecipe } from "./types/items.js";

const itemContent = await prepareItemContent();
const { neededBazaarItems, neededAuctionItems, neededMinions } = prepareNeededItems(itemContent);

const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);
const minionPrices = await fetchMinionPrices();

const pricedItems = new Map<string, PricedItem>();

establishObtaining("MAGMA_BUCKET");

console.log(pricedItems);
Bun.write("./pricedItems.json", JSON.stringify([...pricedItems], null, 2));

function establishObtaining(productId: string): PricedItem | undefined{
    const cached = pricedItems.get(productId);
    if(cached) return cached;

    const product = itemContent.get(productId);
    if(!product) throw new Error(`No product found with id ${productId}`);

    const craftingPrice = calculateCraftPrice(productId, product?.simplifiedRecipes);

    let result: PricedItem | undefined;

    switch(product.source) {
        case "auction_house": {
            const buyPrice = auctionItemPrice(productId);
            result = {
                itemId: productId,
                cheapest: (!craftingPrice || craftingPrice.cost > buyPrice.cost) ? buyPrice : craftingPrice
            };
            break;
        }
        case "bazaar": {
            const buyPrice = bazaarItemPrice(productId);
            console.log(`Item ${productId} has bazaar price ${buyPrice.cost} and crafting price ${craftingPrice?.cost}`);
            result = {
                itemId: productId,
                cheapest: (!craftingPrice || craftingPrice.cost > buyPrice.cost) ? buyPrice : craftingPrice
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
        const { id, ingredients } = simplifiedRecipe;
        const ingredientPrices: Record<string, ObtainMethod> = {};

        const craftPrice = ingredients.reduce((acc, { ingredient, count }) => {
            const ingredientPrice = establishObtaining(ingredient);
            if (ingredientPrice) ingredientPrices[ingredient] = ingredientPrice.cheapest; // ← .cheapest zamiast całego PricedItem
            return acc + (ingredientPrice ? ingredientPrice.cheapest.cost * count : Infinity);
        }, 0);

        crafts.push({ type: "craft", recipeId: simplifiedRecipe.id, cost: craftPrice, ingredients: ingredientPrices });
    }

    if(crafts.length === 0) return undefined;
    return crafts.reduce((cheapest, craft) => craft.cost < cheapest.cost ? craft : cheapest);
}

function auctionItemPrice(productId: string): AuctionHouseBuy {
    const productPrices = auctionPrices.get(productId);
    let price = 0;
    if(!productPrices || productPrices.length === 0) price = Infinity;
    price = productPrices?.[0] ?? Infinity;
    return { type: "auction_house", cost: price };

}

function bazaarItemPrice(productId: string): BazaarBuy {
    const productPrice = bazaarPrices.get(productId);
    return { type: "bazaar", cost: productPrice ? productPrice.instantBuyPrice : Infinity };
}

// function calculateCraftPrice(productId, instaBuy = false){
//     const recipes = itemContent.get(productId).simplifiedRecipes;
//     if(!recipes) return Infinity;
//     let recipePrices = [];
//     for(const recipeId in recipes){
//         const recipe = recipes[recipeId];
//         const subIngredientsPrices = Object.entries(recipe).reduce((acc, [subIngredient, amount]) => {
//             if(subIngredient === "count") return acc;
//             const subIngredientPrice = getBuyPrice(subIngredient, instaBuy)
//             return acc + subIngredientPrice * amount;
//         }, 0);

//         const count = recipe["count"];
//         recipePrices.push(subIngredientsPrices / count);
//     }

//     const cheapestRecipeId = recipePrices.indexOf(Math.min(...recipePrices));
//     itemContent.get(productId).prices.recipeId = cheapestRecipeId;
//     itemContent.get(productId).prices.crafting = Math.ceil(recipePrices[cheapestRecipeId]);

// }

// function getBuyPrice(productId, instaBuy = false){
//     const product = itemContent.get(productId);
//     if(!product){
//         throw new Error("No product with id: " + productId);
//     }
//     let price = product.prices.buying;
//     if(price !== 0)return price; // Using 0 as marker for not setting this yet
//     if(product.source === "bazaar"){
//         const bazaarPrice = bazaarPrices.get(productId);
//         price = instaBuy ? bazaarPrice.instantBuyPrice : bazaarPrice.buyOrderPrice;
//         itemContent.get(productId).prices.buying = price;
//         return price;
//     }

//     if(product.source === "auction_house"){
//         const auctionPrice = auctionPrices.get(productId);
//         price = auctionPrice[0];
//         itemContent.get(productId).prices.buying = price;
//         return price;
//     }

//     return 0; // Minion Auctions for later implementation
// }