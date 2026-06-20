import type {BazaarPrice, BazaarResponse} from "../types/bazaar.ts";

export async function fetchBazaarPrices(neededItems: string[]) {
    const bazaarResponse = await fetch("https://api.hypixel.net/v2/skyblock/bazaar");
    const {products} = await bazaarResponse.json() as BazaarResponse;

    const bazaarPrices = new Map<string, BazaarPrice>();

    for(const product of Object.values(products)) {
        if (!neededItems.includes(product["product_id"])) continue;
        const quickStatus = product["quick_status"];
        const instantBuyPrice = Math.floor(quickStatus.buyPrice);  // == sell order price
        const buyOrderPrice = Math.floor(quickStatus.sellPrice);   // instant sell price
        bazaarPrices.set(product["product_id"], { instantBuyPrice, buyOrderPrice });
    }
    return bazaarPrices;
}