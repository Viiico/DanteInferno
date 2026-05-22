import {readdir} from "node:fs/promises";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";


const recipePath = `${import.meta.dir}\\neededItems`;
const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
const itemContent = (await Promise.all(
    itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json())
)).reduce((acc, item) => {
    acc.set(item.recipeId, item);
    return acc;
}, new Map());

const neededBazaarItems = [];
const neededAuctionItems = [];

for (const item of itemContent.values()) {
    if (item.source === "bazaar") neededBazaarItems.push(item.recipeId);
    else if (item.source === "auctionHouse") neededAuctionItems.push(item.recipeId);
}

const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
const auctionPrices = await fetchAuctionPrices(neededAuctionItems);

calculateCraftPrice(bazaarPrices.get("REHEATED_GUMMY_POLAR_BEAR"), "REHEATED_GUMMY_POLAR_BEAR");

function calculateCraftPrice(product, productId, instaBuy = false){
    const recipes = itemContent.get(productId).simplifiedRecipes;
    if(!recipes) return Infinity;
    const itemPrice = instaBuy ? product.instantBuyPrice : product.buyOrderPrice;
    for(const recipe of recipes){
        const subIngredients = [...Object.keys(recipe).filter(key => key !== "count")];
        let subIngredientsPrices = 0;
        for(const subIngredient in recipe){
            if(subIngredient === "count") continue;
            if(bazaarPrices.has(subIngredient)){
                const bazaarPrice = bazaarPrices.get(subIngredient);
                subIngredientsPrices += (instaBuy ? bazaarPrice.instantBuyPrice : bazaarPrice.buyOrderPrice) * recipe[subIngredient];
                continue;
            }
            const prices = auctionPrices.get(subIngredient);
            subIngredientsPrices += prices[0] * recipe[subIngredient];
        }

    const count = recipe["count"];
    const craftPrice = Math.ceil(subIngredientsPrices / count);
    console.log(`${productId}, itemPrice: ${itemPrice}, craftPrice: ${craftPrice}`);
    }
}