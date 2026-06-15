import { calculateSetupProfit } from "./helperFuncs/minionSetupHandler";

const setupProfit = await calculateSetupProfit();
console.log(`Setup profit: ${setupProfit}`);