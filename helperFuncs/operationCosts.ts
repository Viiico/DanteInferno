import { resolveItemPrices } from './resolveItemPrices';
import type { InfernoFuelRarity } from '../types/minion';
import type { PricedItem } from '../types/items';

async function calculateFuelCost(pricedItems: Map<string, PricedItem>): Promise<Record<InfernoFuelRarity, number>> {
    const distillatePrice = pricedItems.get("CRUDE_GABAGOOL_DISTILLATE")?.cheapest.cost ?? Infinity;
    const fuelBlockPrice = pricedItems.get("INFERNO_FUEL_BLOCK")?.cheapest.cost ?? Infinity;
    const fuelGabagoolPrice = pricedItems.get("FUEL_GABAGOOL")?.cheapest.cost ?? Infinity;
    const heavyGabagoolPrice = pricedItems.get("HEAVY_GABAGOOL")?.cheapest.cost ?? Infinity;
    const hypergolicGabagoolPrice = pricedItems.get("HYPERGOLIC_GABAGOOL")?.cheapest.cost ?? Infinity;

    const baseFuelPrice = distillatePrice * 6 + fuelBlockPrice * 2;

    return {
        "none": 0,
        "rare": baseFuelPrice + fuelGabagoolPrice,
        "epic": baseFuelPrice + heavyGabagoolPrice,
        "legendary": baseFuelPrice + hypergolicGabagoolPrice,
    }
}

const pricedItems = await resolveItemPrices(true);
console.log(await calculateFuelCost(pricedItems));