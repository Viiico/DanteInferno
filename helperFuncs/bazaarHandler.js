export async function fetchBazaarPrices(neededItems) {
    const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
    const bazaarProducts = (await bazaarResponse.json()).products;

    const bazaarPrices = new Map();

    for(const product of Object.values(bazaarProducts)) {
        if (!neededItems.includes(product["product_id"])) continue;
        const quickStatus = product["quick_status"];
        const instantBuyPrice = Math.floor(quickStatus["buyPrice"]);  // == sell order price
        const buyOrderPrice = Math.floor(quickStatus["sellPrice"]);   // instant sell price
        bazaarPrices.set(product["product_id"], { instantBuyPrice, buyOrderPrice });
    }

    return bazaarPrices;
}

/*
        "itemName": {
            "price" : Amount,
            "craftingPrice": Amount,
            "crafting": [recipe]
        }
*/