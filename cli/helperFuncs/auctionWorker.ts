import type {AuctionWorkerInput, AuctionWorkerOutput} from "../types/workers.ts";
import type {AuctionResponse} from "../types/auction.ts";

self.onmessage = async (event: MessageEvent<AuctionWorkerInput>) => {
    const {pages, neededItems} = event.data;

    const results = await Promise.all(pages.map(async page => {
        const auctionPageUrl = new URL(`https://api.hypixel.net/v2/skyblock/auctions?page=${page}`);
        const auctionResult = await fetch(auctionPageUrl);
        const auctionData = await auctionResult.json() as AuctionResponse;

        const auctions = auctionData.auctions.reduce((acc, auction) => {
            const matchedKey = neededItems.find(item => auction["item_name"].includes(item));
            if(!matchedKey)return acc;
            if(!auction.bin || auction.claimed)return acc;
            (acc[matchedKey] ??= []).push(auction["starting_bid"]);
            return acc;
        }, Object.fromEntries(neededItems.map(key => [key, []])) as AuctionWorkerOutput);

        return auctions;
    }));

    const joinedResults = results.reduce((acc, result) => {
        for(const [key, value] of Object.entries(result)){
            acc[key] ? acc[key] = acc[key].concat(value) : (acc[key] = value);
        }
        return acc;
    }, {});

    self.postMessage(joinedResults as AuctionWorkerOutput);
}