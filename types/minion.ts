export interface MinionResponse {
    minion_id: string;
    hasInfusion: boolean;
    hasFreeWill: boolean;
    price: number;
    amount: number;
    minion: {
        generator_tier: number,
    }
    user: { username: string };
}

export interface Minion {
    minion_id: string;
    hasInfusion: boolean;
    hasFreeWill: boolean;
    price: number;
    amount: number;
    username: string;
}