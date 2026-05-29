import type {AuctionResponse} from "../types/auction.ts";
import type {AuctionWorkerInput, AuctionWorkerOutput} from "../types/workers.ts";

function chunkInto(array: number[], numChunks: number = 1): number[][] {
    const chunkSize = Math.ceil(array.length / numChunks);
    const pageChunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        pageChunks.push(array.slice(i, i + chunkSize));
    }
    return pageChunks;
}

export async function fetchAuctionPrices(neededItems: string[]) {
    const auctionUrl = new URL("https://api.hypixel.net/v2/skyblock/auctions");
    const auctionResponse = await fetch(auctionUrl);
    const auctionPageContent = await auctionResponse.json() as AuctionResponse;
    if(!auctionPageContent.success) return new Map<string, number[]>();
    const pageAmount = auctionPageContent["totalPages"];
    const pageChunks = chunkInto(Array.from(Array(pageAmount), (_, i) => i), navigator.hardwareConcurrency ?? 8);
    const scatteredPrices = await Promise.all(pageChunks.map(pages => {
        const worker = new Worker(new URL("./auctionWorker.js", import.meta.url));

        return new Promise<AuctionWorkerOutput>((resolve, reject) => {
            worker.postMessage({pages, neededItems} satisfies AuctionWorkerInput);
            worker.onmessage = (event: MessageEvent<AuctionWorkerOutput>) => { resolve(event.data); worker.terminate(); };
            worker.onerror = e => { reject(e); worker.terminate(); };
        });
    }));

    const auctionItemsPrices = scatteredPrices.reduce((acc, result) => {
        for (const [key, value] of Object.entries(result)) {
            const modifiedKey = key.replaceAll(" ", "_").toUpperCase();
            const existingValue = acc.get(modifiedKey);
            existingValue ? existingValue.push(...value) : acc.set(modifiedKey, value);
        }
        return acc;
    }, new Map<string, number[]>());

    for (const [key, value] of auctionItemsPrices) {
        auctionItemsPrices.set(key, value.sort((a, b) => a - b));
    }

    return auctionItemsPrices;
}