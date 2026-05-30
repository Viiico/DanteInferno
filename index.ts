import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation.js";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";
import {fetchMinionPrices} from "./helperFuncs/minionAhHandler.js";

import type { AuctionHouseBuy, CraftMethod, PricedItem } from "./types/items.js";

const itemContent = await prepareItemContent();
const { neededBazaarItems, neededAuctionItems, neededMinions } = prepareNeededItems(itemContent);

const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);
const minionPrices = await fetchMinionPrices();

const pricedItems = new Map<string, PricedItem>();

establishObtaining("WATER_HYDRA_HEAD");

console.log(pricedItems);

function establishObtaining(productId: string): PricedItem | undefined{
    const cached = pricedItems.get(productId);
    if(cached) return cached;

    const product = itemContent.get(productId);
    if(!product) return undefined;

    const craftingPrice = product?.recipes ? calculateCraftPrice(productId) : null;

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
    }

    if(result) pricedItems.set(productId, result);
    return result;
}


function auctionItemPrice(productId: string): AuctionHouseBuy {
    const productPrices = auctionPrices.get(productId);
    let price = 0;
    if(!productPrices || productPrices.length === 0) price = Infinity;
    price = productPrices?.[0] ?? Infinity;
    return { type: "auction_house", cost: price };

}

function calculateCraftPrice(productId: string): CraftMethod{

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