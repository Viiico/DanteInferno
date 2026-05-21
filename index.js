import {fetchBazaarPrices} from "./helperFuncs/bazaarHandler.js";
import {fetchAuctionPrices} from "./helperFuncs/auctionHandler.js";

const bazaarPrices = await fetchBazaarPrices();
const auctionPrices = await fetchAuctionPrices();

console.log(bazaarPrices, auctionPrices);