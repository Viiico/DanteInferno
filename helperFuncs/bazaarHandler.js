export async function fetchBazaarPrices(neededItems) {
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


/*
        "itemName": {
            "price" : Amount,
            "craftingPrice": Amount,
            "crafting": [recipe]
        }
*/