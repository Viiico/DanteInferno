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