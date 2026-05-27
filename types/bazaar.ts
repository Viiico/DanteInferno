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