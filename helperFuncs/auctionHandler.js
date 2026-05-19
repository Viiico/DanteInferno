import {readdir} from "node:fs/promises";
import os from "os";

const recipePath = import.meta.dir + "\\..\\neededItems";
const itemNames = (await readdir(recipePath)).map(fileName => fileName.replace(".json", ""));
const itemContent = await Promise.all(itemNames.map(fileName => Bun.file(recipePath + "\\" + `${fileName}.json`).json()));


const neededAuctionItems = itemContent.filter(recipeContent => recipeContent.source === "auctionHouse").map(recipeContent => recipeContent.recipeId);
const auctionUrl = new URL("https://api.hypixel.net/v2/skyblock/auctions");
const auctionResponse = await fetch(auctionUrl);
const auctionPageContent = await auctionResponse.json();

const pageAmount = auctionPageContent["totalPages"];

const pageChunks = chunkInto(Array.from(Array(pageAmount), (_,i)=>i), os.cpus().length);
const scatteredPrices = await Promise.all(pageChunks.map(pages => {
  const worker = new Worker(new URL("./auctionWorker.js", import.meta.url));
  
  return new Promise((resolve, reject) => {
    worker.postMessage({pages, neededAuctionItems});
    worker.onmessage = e => { resolve(e.data); worker.terminate(); };
    worker.onerror = e => { reject(e); worker.terminate(); };
  });
}));

const auctionItemsPrices = scatteredPrices.reduce((acc, result) => {
for(const [key, value] of Object.entries(result)){
    acc[key] = acc[key] ? acc[key].concat(value) : value;
}
return acc;
}, {});

for(const [key, value] of Object.entries(auctionItemsPrices)){
    auctionItemsPrices[key] = value.sort((a, b) => a - b);
}
console.log(auctionItemsPrices);

function chunkInto(array, numChunks = 1){
    const chunkSize = Math.ceil(array.length / numChunks);
    const pageChunks = [];
    for(let i=0; i<array.length; i+=chunkSize){
        pageChunks.push(array.slice(i, i+chunkSize));
    }
    return pageChunks;
}