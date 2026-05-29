import type { Minion, MinionResponse } from "../types/minion.ts";

export async function fetchMinionPrices(minionName = "INFERNO"): Promise<Map<string, Minion[]>> {
    const BASE_URL = "https://minionah.com/api/internal/search/minions";
    const TAKE = 50;

    const headers = {
        "Referer": "https://minionah.com/",
        "Content-Type": "application/json",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
    };

    const where = JSON.stringify({
        minion: { AND: [{ generator: minionName }, {}] }
    });

    const allMinions: Minion[] = [];
    let skip = 0;

    while (true) {
        const url = new URL(BASE_URL);
        url.searchParams.set("where", where);
        url.searchParams.set("take", `${TAKE}`);
        url.searchParams.set("skip", `${skip}`);

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Request failed at skip=${skip}: ${response.status}`);
        }

        const data = await response.json() as MinionResponse[];

        if (!data.length) break;

        for(const {minion_id, hasInfusion, hasFreeWill, price, amount, user: {username}} of data){
            allMinions.push({minion_id, hasInfusion, hasFreeWill, price, amount, username});
        }

        if (data.length < TAKE) break; // last page, no point fetching again
        skip += TAKE;
    }

    return allMinions.reduce((acc, minion) => {
        const existing = acc.get(minion["minion_id"]);
        existing ? existing.push(minion) : acc.set(minion["minion_id"], [minion]);
        return acc;
    }, new Map<string, Minion[]>());

}