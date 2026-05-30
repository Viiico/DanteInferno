import type { ItemDef } from "../types/items.ts";

interface NeededItems {
    neededBazaarItems: string[];
    neededAuctionItems: string[];
    neededMinions: string[];
}

export async function prepareItemContent(): Promise<Map<string, ItemDef>> {
    const itemNames = await Array.fromAsync(new Bun.Glob("*").scan("./neededItems"));
    const itemContent = (await Promise.all(
        itemNames.map(fileName => Bun.file(`neededItems/${fileName}`).json() as Promise<ItemDef>)
    )).reduce((acc, item) => {
        const { recipes: _, ...rest } = item;
        acc.set(item.recipeId, rest);
        return acc;
    }, new Map<string, ItemDef>());
    
    return itemContent;
}

export function prepareNeededItems(itemContent: Map<string, ItemDef>): NeededItems {
    let neededBazaarItems = [];
    let neededAuctionItems = [];
    let neededMinions = [];

    for (const item of itemContent.values()) {
        switch(item.source) {
            case "bazaar": neededBazaarItems.push(item.recipeId); break;
            case "auction_house": neededAuctionItems.push(snakeToTitle(item.recipeId)); break;
            case "minion_auction": neededMinions.push(item.recipeId); break;
        }
    }

    return { neededBazaarItems, neededAuctionItems, neededMinions };
}

function snakeToTitle(str: string) {
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}