import { prepareItemContent, prepareNeededItems } from "./helperFuncs/itemPreparation";
import { resolveItemPrices } from "./resolveItemPrices";

const itemPrices = await resolveItemPrices();

console.log(itemPrices)