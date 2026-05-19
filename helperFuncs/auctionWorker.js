self.onmessage = async (event) => {
    const {pages, neededAuctionItems} = event.data;


    const results = await Promise.all(pages.map(async page => {
        const auctionPageUrl = new URL(`https://api.hypixel.net/v2/skyblock/auctions?page=${page}`);
        const auctionResult = await fetch(auctionPageUrl);
        const auctionData = await auctionResult.json();

        // const auctionPrices = new Map(neededAuctionItems.map(key => [key, null]));
        
        const auctions = auctionData.auctions.reduce((acc, auction) => {
            const matchedKey = neededAuctionItems.find(item => auction["item_name"].includes(item));
            if(!matchedKey)return acc;
            if(!auction.bin || auction.claimed)return acc;
            acc[matchedKey].push(auction["starting_bid"]);
            return acc;
        }, Object.fromEntries(neededAuctionItems.map(key => [key, []])));

        return auctions;
    }));

    const joinedResults = results.reduce((acc, result) => {
        for(const [key, value] of Object.entries(result)){
            acc[key] = acc[key] ? acc[key].concat(value) : value;
        }
        return acc;
    }, {});

    self.postMessage(joinedResults);
    postMessage("Hello world");
}