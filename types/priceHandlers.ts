export interface BazaarPrice {
    instantBuyPrice: number;
    buyOrderPrice: number;
}

export interface BazaarProduct {
    product_id: string;
    quick_status: {
        buyPrice: number;
        sellPrice: number;
    };
}

export interface BazaarResponse {
    products: Record<string, BazaarProduct>;
}


export interface Auctionprice {
    
}

export interface AuctionResponse {
    success: boolean;
    totalPages: number;
    auctions: AuctionProduct[];
}

export interface AuctionProduct {
    item_name: string;
    bin: boolean;
    claimed: boolean;
    starting_bid: number;
}