import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation";
import { calculateSetupDrops, readMinionSetup } from "./helperFuncs/minionSetupHandler";
import { resolveItemPrices } from "./resolveItemPrices";

const pricedItems = await resolveItemPrices();
const minionSetup = await readMinionSetup();
const setupDrops = calculateSetupDrops(minionSetup);
const setupProfit = Object.entries(setupDrops).reduce((acc, [productName, productAmount]) => {
    const itemPrice = pricedItems.get(productName)!?.cheapest.cost;
    return acc + itemPrice * productAmount;
}, 0).toFixed(0);

console.log(setupProfit)