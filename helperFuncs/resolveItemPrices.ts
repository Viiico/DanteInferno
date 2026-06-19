import { prepareItemContent, prepareNeededItems } from "./itemPreparation.ts";
import { fetchBazaarPrices } from "./bazaarHandler.ts";
import { fetchAuctionPrices } from "./auctionHandler.ts";
import { fetchMinionPrices } from "./minionAhHandler.ts";

import type { AuctionHouseBuy, BazaarBuy, CraftMethod, ExpandedObtainMethod, ItemDef, MinionAuctionBuy, PricedItem, PriceContext, SimplifiedRecipe, Source } from "../types/items.ts";

export async function resolveItemPrices(saveResults: boolean = false): Promise<Map<string, PricedItem>> {
    const itemContent = await prepareItemContent();
    const { neededBazaarItems, neededAuctionItems } = prepareNeededItems(itemContent);

    const [bazaarPrices, auctionPrices, minionPrices] = await Promise.all([
        fetchBazaarPrices(neededBazaarItems),
        fetchAuctionPrices(neededAuctionItems),
        fetchMinionPrices(),
    ]);

    const ctx: PriceContext = {
        itemContent,
        bazaarPrices,
        auctionPrices,
        minionPrices,
        pricedItems: new Map(),
    };

    for (const productId of itemContent.keys()) resolveItemPrice(ctx, productId);

    if (saveResults) await Bun.write("./pricedItems.json", JSON.stringify([...ctx.pricedItems], null, 2));
    return ctx.pricedItems;
}

function resolveItemPrice(ctx: PriceContext, productId: string, visiting: Set<string> = new Set()): PricedItem | undefined {
    const cached = ctx.pricedItems.get(productId);
    if (cached) return cached;

    if(visiting.has(productId)) return undefined; // prevent circular dependency

    const product = ctx.itemContent.get(productId);
    if (!product) throw new Error(`No product found with id ${productId}`);

    visiting.add(productId);
    const craftingPrice = calculateCraftPrice(ctx, product.simplifiedRecipes, visiting);
    visiting.delete(productId);

    const buyPrice = getBuyPrice(ctx, productId, product.source);
    const useCraft = craftingPrice && craftingPrice.cost < (buyPrice ?? Infinity);

    const result: PricedItem = {
        ...(useCraft && { directBuyCost: buyPrice ?? Infinity }),
        cheapest: useCraft ? craftingPrice : { type: product.source, cost: buyPrice ?? Infinity },
    };

    ctx.pricedItems.set(productId, result);
    return result;
}

function calculateCraftPrice(ctx: PriceContext, simplifiedRecipes: SimplifiedRecipe[] | undefined, visiting: Set<string>): CraftMethod | undefined {
    if (!simplifiedRecipes) return undefined;

    const crafts: CraftMethod[] = simplifiedRecipes.map((simplifiedRecipe) => {
        const craftPrice = Object.entries(simplifiedRecipe.ingredients).reduce((acc, [ingredient, count]) => {
            const ingredientPrice = resolveItemPrice(ctx, ingredient, visiting);
            if(count <= 0)throw new Error(`Invalid count ${count} for ingredient ${ingredient}`);
            return acc + (ingredientPrice ? ingredientPrice.cheapest.cost * count : Infinity);
        }, 0) / simplifiedRecipe.count;

        return { type: "craft", recipeId: simplifiedRecipe.id, cost: Math.floor(craftPrice) };
    });

    if (crafts.length === 0) return undefined;
    return crafts.reduce((cheapest, craft) => craft.cost < cheapest.cost ? craft : cheapest);
}

function getBuyPrice(ctx: PriceContext, productId: string, source: Source): number | undefined {
    switch (source) {
        case "auction_house": return auctionItemPrice(ctx, productId).cost;
        case "bazaar": return bazaarItemPrice(ctx, productId).cost;
        case "minion_auction": return minionItemPrice(ctx, productId).cost;
        default: throw new Error(`Unsupported source: ${source}`);
    }
}

function auctionItemPrice(ctx: PriceContext, productId: string): AuctionHouseBuy {
    const price = ctx.auctionPrices.get(productId)?.[0] ?? Infinity;
    return { type: "auction_house", cost: price };
}

function bazaarItemPrice(ctx: PriceContext, productId: string): BazaarBuy {
    const price = ctx.bazaarPrices.get(productId);
    return { type: "bazaar", cost: price ? price.instantBuyPrice : Infinity };
}

function minionItemPrice(ctx: PriceContext, productId: string): MinionAuctionBuy {
    const minionPrice = ctx.minionPrices.get(productId)?.[0]?.price ?? Infinity;
    return { type: "minion_auction", cost: minionPrice };
}

export function expandRecipeTree(pricedItems: Map<string, PricedItem>, itemContent: Map<string, ItemDef>, recipeId: string): ExpandedObtainMethod {
    const itemObtainMethod = pricedItems.get(recipeId)?.cheapest;
    if (!itemObtainMethod) throw new Error("Could not find item obtain method for recipeId: " + recipeId);

    if (itemObtainMethod.type !== "craft") return itemObtainMethod;
    const item = itemContent.get(recipeId);
    if (!item || !item.simplifiedRecipes) throw new Error("Could not find recipes for recipeId: " + recipeId);
    const simplifiedRecipeIndex = itemObtainMethod.recipeId.split("#")[1];
    if (!simplifiedRecipeIndex) throw new Error("Could not find simplified recipe index for recipeId: " + recipeId);
    const recipe = item.simplifiedRecipes[parseInt(simplifiedRecipeIndex)];
    if (!recipe) throw new Error("Could not find recipe for recipeId: " + recipeId);

    const expandedIngredients = Object.fromEntries(
        Object.entries(recipe.ingredients).map(([ingredient, count]) => [
            ingredient,
            { count, obtainMethod: expandRecipeTree(pricedItems, itemContent, ingredient) },
        ])
    );

    return { ...itemObtainMethod, ingredients: expandedIngredients };
}