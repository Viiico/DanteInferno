import { prepareItemContent, prepareNeededItems } from "./itemPreparation.ts";
import { fetchBazaarPrices } from "./bazaarHandler.ts";
import { fetchAuctionPrices } from "./auctionHandler.ts";
import { fetchMinionPrices } from "./minionAhHandler.ts";

import type { AuctionHouseBuy, BazaarBuy, CraftMethod, ExpandedObtainMethod, ItemDef, MinionAuctionBuy, ObtainMethod, PricedItem, SimplifiedRecipe, Source } from "../types/items.ts";

export async function resolveItemPrices(saveResults: boolean = false): Promise<Map<string, PricedItem>> {
    const itemContent = await prepareItemContent();
    const { neededBazaarItems, neededAuctionItems } = prepareNeededItems(itemContent);

    const [bazaarPrices, auctionPrices, minionPrices] = await Promise.all([
        fetchBazaarPrices(neededBazaarItems),
        fetchAuctionPrices(neededAuctionItems),
        fetchMinionPrices(),
    ]);

    const pricedItems = new Map<string, PricedItem>();
    for (const productId of itemContent.keys()) resolveItemPrice(productId);

    if (saveResults) await Bun.write("./pricedItems.json", JSON.stringify([...pricedItems], null, 2));
    return pricedItems;

    function resolveItemPrice(productId: string): PricedItem | undefined {
        const cached = pricedItems.get(productId);
        if (cached) return cached;

        const product = itemContent.get(productId);
        if (!product) throw new Error(`No product found with id ${productId}`);

        const craftingPrice = calculateCraftPrice(product.simplifiedRecipes);
        const buyPrice = getBuyPrice(productId, product.source);
        const useCraft = craftingPrice && craftingPrice.cost < (buyPrice ?? Infinity);

        const result: PricedItem = {
            ...(useCraft && { directBuyCost: buyPrice ?? Infinity }),
            cheapest: useCraft ? craftingPrice : { type: product.source, cost: buyPrice ?? Infinity },
        };

        pricedItems.set(productId, result);
        return result;
    }

    function calculateCraftPrice(simplifiedRecipes: SimplifiedRecipe[] | undefined): CraftMethod | undefined {
        if (!simplifiedRecipes) return undefined;

        const crafts: CraftMethod[] = simplifiedRecipes.map((simplifiedRecipe) => {
            const mappedIngredients: Record<string, number> = {};

            const craftPrice = Object.entries(simplifiedRecipe.ingredients).reduce((acc, [ingredient, count]) => {
                const ingredientPrice = resolveItemPrice(ingredient);
                if (ingredientPrice) mappedIngredients[ingredient] = count;
                return acc + (ingredientPrice ? ingredientPrice.cheapest.cost * count : Infinity);
            }, 0) / simplifiedRecipe.count;

            return { type: "craft", recipeId: simplifiedRecipe.id, cost: Math.floor(craftPrice), ingredients: mappedIngredients };
        });

        if (crafts.length === 0) return undefined;
        return crafts.reduce((cheapest, craft) => craft.cost < cheapest.cost ? craft : cheapest);
    }

    function getBuyPrice(productId: string, source: Source): number | undefined {
        switch (source) {
            case "auction_house": return auctionItemPrice(productId).cost;
            case "bazaar": return bazaarItemPrice(productId).cost;
            case "minion_auction": return minionItemPrice(productId).cost;
            default: throw new Error(`Unsupported source: ${source}`);
        }
    }

    function auctionItemPrice(productId: string): AuctionHouseBuy {
        const price = auctionPrices.get(productId)?.[0] ?? 0; // Missing AH items are nearly worthless
        return { type: "auction_house", cost: price };
    }

    function bazaarItemPrice(productId: string): BazaarBuy {
        const price = bazaarPrices.get(productId);
        return { type: "bazaar", cost: price ? price.instantBuyPrice : Infinity };
    }

    function minionItemPrice(productId: string): MinionAuctionBuy {
        const minionPrice = minionPrices.get(productId)?.[0]?.price ?? Infinity;
        return { type: "minion_auction", cost: minionPrice };
    }
}

export function expandRecipeTree(pricedItems: Map<string, PricedItem>, itemContent: Map<string, ItemDef>, recipeId: string): ExpandedObtainMethod {
    const itemObtainMethod = pricedItems.get(recipeId)?.cheapest;
    if (!itemObtainMethod) throw new Error("Could not find item obtain method for recipeId: " + recipeId);

    if (itemObtainMethod.type !== "craft") return itemObtainMethod;

    const expandedIngredients = Object.fromEntries(
        Object.entries(itemObtainMethod.ingredients).map(([ingredient, count]) => [
            ingredient,
            { count, obtainMethod: expandRecipeTree(pricedItems, itemContent, ingredient) },
        ])
    );

    return { ...itemObtainMethod, ingredients: expandedIngredients };
}