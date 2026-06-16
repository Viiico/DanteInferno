import { prepareItemContent } from "./helperFuncs/itemPreparation";
import { calculateSetupProfit } from "./helperFuncs/minionSetupHandler";
import { resolveItemPrices, expandRecipeTree } from "./helperFuncs/resolveItemPrices";

const pricedItems = await resolveItemPrices(true);
const itemContent = await prepareItemContent();
const setupProfit = await calculateSetupProfit(pricedItems);

console.log(`Setup profit: ${setupProfit}`);

const expandedObtainMethod = await expandRecipeTree(pricedItems, itemContent, "INFERNO_GENERATOR_6")