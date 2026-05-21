import { readdir } from "node:fs/promises";
import { readItems } from "./readItems";

export async function fetchBazaarPrices() {
    const {neededItems} = await readItems("bazaar");

    const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
    const bazaarProducts = (await bazaarResponse.json()).products;

    return Object.values(bazaarProducts).reduce((acc, product) => {
        if (!neededItems.includes(product["product_id"])) return acc;
        const quickStatus = product["quick_status"];
        const instantBuyPrice = Math.floor(quickStatus["buyPrice"]);  // == sell order price
        const buyOrderPrice = Math.floor(quickStatus["sellPrice"]);   // instant sell price
        acc.push({ product_id: product["product_id"], instantBuyPrice, buyOrderPrice });
        return acc;
    }, []);
}

// function calculateCraftPrice(product, instaBuy = false){
//     const recipes = recipeContents.find(recipeContent => recipeContent.recipeId === product["product_id"])?.simplifiedRecipes;
//     if(!recipes){
//         // Can't be crafted, must be bought
//     }
//     for(const recipe of recipes){
//         const subIngredients = [...Object.keys(recipe).filter(key => key !== "count")];
//         const count = recipe["count"];
//         console.log(product["product_id"], subIngredients, bazaarPrice);
//     }
// }

/*
        "itemName": {
            "price" : Amount,
            "craftingPrice": Amount,
            "crafting": [recipe]
        }
*/