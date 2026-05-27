export interface AuctionWorkerInput {
    pages: number[];
    neededItems: string[];
}

export interface AuctionWorkerOutput {
    [itemName: string]: number[];
}