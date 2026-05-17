import {readdir} from "node:fs/promises";

const recipePath = import.meta.dir + "\\..\\neededItems";
const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
const itemContent = await Promise.all(itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json()));
const desiredRecipes = itemContent.filter(recipeContent => recipeContent.source === "bazaar").map(recipeContent => recipeContent.recipeId);

// const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
// const bazaarProducts = (await bazaarResponse.json()).products;
// const clearedBazaarProducts = Object.values(bazaarProducts).reduce((acc, product) => {
//     if(!desiredRecipes.includes(product["product_id"])) return acc;
//     const quickStatus = product["quick_status"];
//     const instantBuyPrice = Math.floor(quickStatus["buyPrice"]); // == sell order price
//     const buyOrderPrice = Math.floor(quickStatus["sellPrice"]); // instant sell price
//     acc.push({product_id: product["product_id"], instantBuyPrice, buyOrderPrice});
//     return acc;
// }, []);

// const neededAuctionItems = recipeContents.filter(recipeContent => recipeContent.source === "auctionHouse").map(recipeContent => recipeContent.recipeId);
// const auctionResponse = await fetch("https://api.hypixel.net/v2/skyblock/auctions");
// const auctions = (await auctionResponse.json()).auctions.filter(auction => neededAuctionItems.includes(auction["item_name"]));

// const auctionItems = new Map();
// for(const neededAuctionItem of neededAuctionItems){
//     const filteredAuctions = auctions.filter(auction => !auction.claimed && auction.bin && auction["item_name"] === neededAuctionItem);
//     const prices = filteredAuctions.map(auction => auction.starting_bid).sort((a, b) => a - b);
//     const changedName = neededAuctionItem.replaceAll(" ", "_").toUpperCase();
//     auctionItems.set(changedName, prices);
// }


function calculateCraftPrice(product, instaBuy = false){
    const recipes = recipeContents.find(recipeContent => recipeContent.recipeId === product["product_id"])?.simplifiedRecipes;
    if(!recipes){
        // Can't be crafted, must be bought
    }
    for(const recipe of recipes){
        const subIngredients = [...Object.keys(recipe).filter(key => key !== "count")];
        const count = recipe["count"];
        console.log(product["product_id"], subIngredients, bazaarPrice);
    }
}



/*
        "itemName": {
            "price" : Amount,
            "craftingPrice": Amount,
            "crafting": [recipe]
        }
*/