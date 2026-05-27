import {readdir} from "node:fs/promises";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";
import {fetchMinionPrices} from "./helperFuncs/minionAhHandler.js";


const recipePath = `${import.meta.dir}\\neededItems`;
const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
const itemContent = (await Promise.all(
    itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json())
)).reduce((acc, item) => {
    acc.set(item.recipeId, {...item, prices: {
        "buying": 0,
        "crafting": 0,
        "recipeId": -1
    }});
    return acc;
}, new Map());

const neededBazaarItems = [];
const neededAuctionItems = [];

for (const item of itemContent.values()) {
    if (item.source === "bazaar") neededBazaarItems.push(item.recipeId);
    else if (item.source === "auctionHouse")neededAuctionItems.push(snakeToTitle(item.recipeId));
}

// const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);
// const minionPrices = await fetchMinionPrices();

console.log(auctionPrices);

// for(const item of itemContent.keys()) {
//     if(!item.endsWith("GENERATOR_2")) continue;
//     // console.log("Calculating prices for: " + item);
//     getBuyPrice(item);
//     calculateCraftPrice(item);
//     // console.log(itemContent.get(item).prices);
// }

// calculateCraftPrice(bazaarPrices.get("AMALGAMATED_CRIMSONITE_NEW"), "AMALGAMATED_CRIMSONITE_NEW");

function calculateCraftPrice(productId, instaBuy = false){
    const recipes = itemContent.get(productId).simplifiedRecipes;
    if(!recipes) return Infinity;
    let recipePrices = [];
    for(const recipeId in recipes){
        const recipe = recipes[recipeId];
        const subIngredientsPrices = Object.entries(recipe).reduce((acc, [subIngredient, amount]) => {
            if(subIngredient === "count") return acc;
            const subIngredientPrice = getBuyPrice(subIngredient, instaBuy)
            return acc + subIngredientPrice * amount;
        }, 0);

        const count = recipe["count"];
        recipePrices.push(subIngredientsPrices / count);
    }

    const cheapestRecipeId = recipePrices.indexOf(Math.min(...recipePrices));
    itemContent.get(productId).prices.recipeId = cheapestRecipeId;
    itemContent.get(productId).prices.crafting = Math.ceil(recipePrices[cheapestRecipeId]);

}

function getBuyPrice(productId, instaBuy = false){
    const product = itemContent.get(productId);
    if(!product){
        throw new Error("No product with id: " + productId);
    }
    let price = product.prices.buying;
    if(price !== 0)return price; // Using 0 as marker for not setting this yet
    if(product.source === "bazaar"){
        const bazaarPrice = bazaarPrices.get(productId);
        price = instaBuy ? bazaarPrice.instantBuyPrice : bazaarPrice.buyOrderPrice;
        itemContent.get(productId).prices.buying = price;
        return price;
    }

    if(product.source === "auctionHouse"){
        const auctionPrice = auctionPrices.get(productId);
        price = auctionPrice[0];
        itemContent.get(productId).prices.buying = price;
        return price;
    }

    return 0; // Minion Auctions for later implementation
}

function snakeToTitle(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}