import os from "os";

function chunkInto(array, numChunks = 1) {
    const chunkSize = Math.ceil(array.length / numChunks);
    const pageChunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        pageChunks.push(array.slice(i, i + chunkSize));
    }
    return pageChunks;
}

export async function fetchAuctionPrices(neededItems) {
    const auctionUrl = new URL("https://api.hypixel.net/v2/skyblock/auctions");
    const auctionResponse = await fetch(auctionUrl);
    const auctionPageContent = await auctionResponse.json();
    const pageAmount = auctionPageContent["totalPages"];

    const pageChunks = chunkInto(Array.from(Array(pageAmount), (_, i) => i), os.cpus().length);
    const scatteredPrices = await Promise.all(pageChunks.map(pages => {
        const worker = new Worker(new URL("./auctionWorker.js", import.meta.url));

        return new Promise((resolve, reject) => {
            worker.postMessage({pages, neededItems});
            worker.onmessage = e => { resolve(e.data); worker.terminate(); };
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
    }, new Map());

    for (const [key, value] of auctionItemsPrices) {
        auctionItemsPrices.set(key, value.sort((a, b) => a - b));
    }

    return auctionItemsPrices;
}