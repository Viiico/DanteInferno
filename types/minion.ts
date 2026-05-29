export interface Minion {
    minion_id: string,
    hasInfusion: boolean,
    hasFreeWill: boolean,
    price: number,
    amount: number,
    user: {
        username: string
    }
}