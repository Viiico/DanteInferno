import {readdir} from "node:fs/promises";
import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";


const recipePath = `${import.meta.dir}\\neededItems`;
const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
const itemContent = await Promise.all(
    itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json())
);

const neededBazaarItems = itemContent.filter(recipeContent => recipeContent.source === "bazaar").map(recipeContent => recipeContent.recipeId);
const neededAuctionItems = itemContent.filter(recipeContent => recipeContent.source === "auctionHouse").map(recipeContent => recipeContent.recipeId);
const bazaarPrices = await fetchBazaarPrices(neededBazaarItems);
// const auctionPrices = await fetchAuctionPrices(neededAuctionItems);

calculateCraftPrice(bazaarPrices[2]);

function calculateCraftPrice(product, instaBuy = false){
    console.log(product, bazaarPrices);
    const recipes = itemContent.find(recipeContent => recipeContent.recipeId === product["product_id"])?.simplifiedRecipes;
    if(!recipes){
        // Can't be crafted, must be bought
    }
    for(const recipe of recipes){
        const subIngredients = [...Object.keys(recipe).filter(key => key !== "count")];
        const subIngredientsPrices = subIngredients.map(subIngredient => {
            // console.log(bazaarPrices[subIngredient])
    });
        const count = recipe["count"];
        console.log(product["product_id"], subIngredients, subIngredientsPrices);
    }
}