import type {AuctionPriceCache, AuctionResponse} from "../types/auction.ts";
import type {AuctionWorkerInput, AuctionWorkerOutput} from "../types/workers.ts";

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_PATH = "./auctionPricesCache.json";

export async function fetchAuctionPrices(neededItems: string[]) {
    const cached = await loadCache();
    if(cached) return cached;

    const auctionUrl = new URL("https://api.hypixel.net/v2/skyblock/auctions");
    const auctionResponse = await fetch(auctionUrl);
    const auctionPageContent = await auctionResponse.json() as AuctionResponse;
    if(!auctionPageContent.success) return new Map<string, number[]>();
    const pageAmount = auctionPageContent["totalPages"];
    const pageChunks = chunkInto(Array.from(Array(pageAmount), (_, i) => i), navigator.hardwareConcurrency ?? 8);
    const scatteredPrices = await Promise.all(pageChunks.map(pages => {
        const worker = new Worker(new URL("./auctionWorker.ts", import.meta.url));

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

    await saveCache(auctionItemsPrices);
    return auctionItemsPrices;
}

async function loadCache(): Promise<Map<string, number[]> | null> {
    try {
        const cacheFile = Bun.file(CACHE_PATH);
        if(!await cacheFile.exists()) return null;

        const cache: AuctionPriceCache = await cacheFile.json();
        if(Date.now() - cache.fetchedAt > CACHE_TTL_MS){
            console.log("Cache is outdated, downloading fresh data");
            return null;
        }

        return new Map(cache.prices);
    } catch (err) {
        console.error("Failed to load auction cache:", err);
        return null;
    }
}

async function saveCache(prices: Map<string, number[]>): Promise<void> {
    const cache: AuctionPriceCache = {
        fetchedAt: Date.now(),
        prices: [...prices],
    };
    await Bun.write(CACHE_PATH, JSON.stringify(cache));
}

function chunkInto(array: number[], numChunks: number = 1): number[][] {
    const chunkSize = Math.ceil(array.length / numChunks);
    const pageChunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        pageChunks.push(array.slice(i, i + chunkSize));
    }
    return pageChunks;
}